import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pregnancy_care";
const JWT_SECRET = process.env.JWT_SECRET_KEY || "testsecret";

// Lightweight schemas (strict: false so they work with real collections)
const userSchema = new mongoose.Schema({
    name: String, email: String, linkedAnganwadi: mongoose.Schema.Types.ObjectId, mcpId: String,
    linkageStatus: { type: String, default: "unlinked" }
}, { strict: false });
const User = mongoose.model('User', userSchema);

const centerSchema = new mongoose.Schema({
    centerName: String, district: String, state: String, facilities: [String], officialEmail: String
}, { strict: false });
const AnganwadiCenter = mongoose.model('AnganwadiCenter', centerSchema);

const joinRequestSchema = new mongoose.Schema({
    mom: mongoose.Schema.Types.ObjectId, anganwadi: mongoose.Schema.Types.ObjectId, status: String
}, { strict: false });
const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

const api = axios.create({
    baseURL: 'http://localhost:5004/api',
    validateStatus: () => true
});

// Unique suffix to avoid index conflicts
const UID = Date.now().toString(36);

async function runVerification() {
    console.log("🚀 Starting Verification: Anganwadi Join Flow\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to DB");

    // --- Cleanup any leftover test data from previous runs ---
    await AnganwadiCenter.deleteMany({ centerName: /^Test Center Verifier/ });
    await User.deleteMany({ name: "Test Mom Verify" });
    console.log("✅ Cleaned up stale test data\n");

    // --- 1. Create test center & user directly in DB ---
    const testDistrict = `VerifyDist_${UID}`;
    const center = await AnganwadiCenter.create({
        centerName: `Test Center Verifier ${UID}`,
        district: testDistrict,
        state: "KA",
        officialEmail: `center_${UID}@test.com`,
        password: "hashedpassword",
        anganwadiCenterId: `KA-VRF-${UID}`,
        isActive: true
    });
    console.log(`✅ Created Center: ${center.centerName}`);

    const user = await User.create({
        name: "Test Mom Verify",
        email: `mom_${UID}@test.com`,
        password: "hashedpassword",
        role: "user",
        isOnboarded: true
    });
    console.log(`✅ Created Mom: ${user.name}`);

    // Auth tokens
    const centerToken = jwt.sign({ anganwadiId: center._id }, JWT_SECRET, { expiresIn: '1d' });
    const userToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    const centerHeaders = { Cookie: `anganwadi_jwt=${centerToken};` };
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    let allPassed = true;
    const fail = (step, msg, extra) => { allPassed = false; console.error(`  ❌ ${step}: ${msg}`, extra || ""); };

    // --- 2. Mom searches for nearby centers ---
    console.log("\n--- Step 2: Mom Search Nearby Centers ---");
    const searchRes = await api.get(`/anganwadi/nearby?search=${testDistrict}`, { headers: userHeaders });
    if (searchRes.status === 200 && Array.isArray(searchRes.data) && searchRes.data.some(c => c._id === center.id)) {
        console.log("  ✅ Nearby search returned the test center");
    } else {
        fail("Search", `status=${searchRes.status}, count=${searchRes.data?.length}`);
    }

    // --- 3. Mom sends a join request ---
    console.log("\n--- Step 3: Mom Sends Join Request ---");
    const joinRes = await api.post(`/anganwadi/join-request`, { centerId: center.id }, { headers: userHeaders });
    if (joinRes.status === 201) {
        console.log("  ✅ Join request created");
    } else {
        fail("JoinRequest", `status=${joinRes.status}`, joinRes.data);
    }

    // --- 3b. Duplicate request guard ---
    const dupRes = await api.post(`/anganwadi/join-request`, { centerId: center.id }, { headers: userHeaders });
    if (dupRes.status === 400) {
        console.log("  ✅ Duplicate request correctly rejected");
    } else {
        fail("DuplicateGuard", `expected 400, got ${dupRes.status}`);
    }

    // --- 4. Anganwadi views pending requests ---
    console.log("\n--- Step 4: Anganwadi Views Requests ---");
    const reqListRes = await api.get(`/anganwadi/join-requests`, { headers: centerHeaders });
    const pendingReq = Array.isArray(reqListRes.data) && reqListRes.data.find(r => r.mom?._id === user.id);
    if (reqListRes.status === 200 && pendingReq) {
        console.log(`  ✅ Pending request found (id: ${pendingReq._id})`);
    } else {
        fail("ViewRequests", `status=${reqListRes.status}, found=${!!pendingReq}`);
        // Can't continue without the request ID
        await cleanup(user._id, center._id);
        return;
    }

    // --- 5. Anganwadi approves the request ---
    console.log("\n--- Step 5: Anganwadi Approves Request ---");
    const approveRes = await api.post(`/anganwadi/process-join-request`,
        { requestId: pendingReq._id, status: "approved" },
        { headers: centerHeaders }
    );
    if (approveRes.status === 200 && approveRes.data.mcpId) {
        console.log(`  ✅ Approved! MCP ID = ${approveRes.data.mcpId}`);
    } else {
        fail("Approve", `status=${approveRes.status}`, approveRes.data);
    }

    // --- 6. DB verification: user is linked ---
    console.log("\n--- Step 6: DB Verification (Linkage) ---");
    const linkedUser = await User.findById(user._id);
    if (linkedUser.linkedAnganwadi?.toString() === center.id && linkedUser.mcpId) {
        console.log(`  ✅ User linked to center, mcpId = ${linkedUser.mcpId}`);
    } else {
        fail("DBLinkage", `linkedAnganwadi=${linkedUser.linkedAnganwadi}, mcpId=${linkedUser.mcpId}`);
    }

    // --- 7. Anganwadi updates facilities ---
    console.log("\n--- Step 7: Update Facilities ---");
    const facRes = await api.put(`/anganwadi/facilities`,
        { facilities: ["Drinking Water", "Play Area"], services: ["Vaccination", "Nutrition"] },
        { headers: centerHeaders }
    );
    if (facRes.status === 200) {
        console.log("  ✅ Facilities updated via API");
    } else {
        fail("Facilities", `status=${facRes.status}`, facRes.data);
    }

    // --- 8. DB verification: facilities saved ---
    const updatedCenter = await AnganwadiCenter.findById(center._id);
    if (updatedCenter.facilities?.includes("Drinking Water") && updatedCenter.services?.includes("Vaccination")) {
        console.log("  ✅ Facilities & services persisted in DB");
    } else {
        fail("DBFacilities", `facilities=${updatedCenter.facilities}, services=${updatedCenter.services}`);
    }

    // --- Summary ---
    console.log("\n" + "=".repeat(50));
    if (allPassed) {
        console.log("🎉 ALL CHECKS PASSED — Join Flow & Facilities verified!");
    } else {
        console.log("⚠️  SOME CHECKS FAILED — review output above.");
    }
    console.log("=".repeat(50));

    await cleanup(user._id, center._id);
}

async function cleanup(userId, centerId) {
    await User.findByIdAndDelete(userId);
    await AnganwadiCenter.findByIdAndDelete(centerId);
    await JoinRequest.deleteMany({ $or: [{ mom: userId }, { anganwadi: centerId }] });
    console.log("\n🧹 Test data cleaned up.");
    await mongoose.disconnect();
}

runVerification().catch(async (err) => {
    console.error("💥 Unhandled Error:", err.message || err);
    await mongoose.disconnect();
});
