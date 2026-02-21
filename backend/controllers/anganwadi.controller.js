import AnganwadiCenter from "../models/anganwadi.model.js";
import AnganwadiVisit from "../models/anganwadiVisit.model.js";
import User from "../models/user.model.js";
import Guidance from "../models/guidance.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- Auth ---

export const registerCenter = async (req, res) => {
    try {
        const { centerName, district, state, officialEmail, password } = req.body;

        // Check for duplicate email
        const existingEmail = await AnganwadiCenter.findOne({ officialEmail });
        if (existingEmail) {
            return res.status(400).json({ message: "Center already exists for this email" });
        }

        // Check for duplicate centerName within same district
        const existingNameDistrict = await AnganwadiCenter.findOne({ centerName, district });
        if (existingNameDistrict) {
            return res.status(400).json({ message: "A center with this name already exists in this district" });
        }

        // Password validation: minimum 10 chars with required complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 10 characters and include uppercase, lowercase, number, and special character",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCenter = new AnganwadiCenter({
            centerName,
            district,
            state,
            officialEmail,
            password: hashedPassword
        });

        await newCenter.save();

        res.status(201).json({ message: "Center registered successfully", anganwadiCenterId: newCenter.anganwadiCenterId });
    } catch (error) {
        // Handle MongoDB duplicate key error (E11000) gracefully
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            if (field === 'officialEmail') {
                return res.status(400).json({ message: "Center already exists for this email" });
            }
            if (field === 'anganwadiCenterId') {
                return res.status(400).json({ message: "Center ID conflict. Please try again." });
            }
            // centerName + district compound index
            return res.status(400).json({ message: "A center with this name already exists in this district" });
        }
        res.status(500).json({ message: error.message });
    }
};

export const loginCenter = async (req, res) => {
    try {
        const { officialEmail, password, anganwadiCenterId } = req.body;

        // Allow login by Email OR Center ID
        const query = officialEmail ? { officialEmail } : { anganwadiCenterId };
        const center = await AnganwadiCenter.findOne(query);

        if (!center) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, center.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ anganwadiId: center._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" });

        res.cookie("anganwadi_jwt", token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });

        res.json({
            _id: center._id,
            centerName: center.centerName,
            anganwadiCenterId: center.anganwadiCenterId,
            district: center.district,
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutCenter = (req, res) => {
    res.cookie("anganwadi_jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
};

export const getCenterProfile = async (req, res) => {
    res.json(req.center);
};

// --- Linking & Migration ---

export const linkMother = async (req, res) => {
    try {
        const { momId } = req.body;

        // Generate MomId logic usually happens here or backend auto-generates on first link?
        // Request says: "When a mother physically opts-in... Anganwadi dashboard generates Mom_ID"
        // But Mom_ID needs to be stored on User. 
        // Let's assume User exists without MomID, and we are assigning one OR linking via existing MomID?
        // Scenario A: Mother is new to Anganwadi system. We find her by Email/Phone?
        // Request says: "Validate Mom_ID exists." -> This implies Mom_ID is already generated? 
        // Wait, "Mom_ID format example... Anganwadi dashboard generates Mom_ID".
        // Let's implement: Associate by Email first to generate/assign MomID? 
        // OR: User provides "Anganwadi_Center_ID" in THEIR profile (Task 2).

        // Let's strictly follow: "Validate Mom_ID exists... Set linkedAnganwadi = center._id"
        // This implies the User already HAS a momId. 
        // Let's add a helper to generating MomID for a User if they don't have one, based on email lookup?

        // RE-READING: "Mother enters Anganwadi_Center_ID in Care4Mom profile" -> This likely creates the link request?
        // BUT API requested is `POST /api/anganwadi/link-mother`. 
        // "Logic: Validate Mom_ID exists. Validate Anganwadi_Center_ID matches logged-in center."

        // Implementation: 
        // 1. Center inputs Mom_ID (provided by mother).
        // 2. We find User with that Mom_ID.
        // 3. Link them to req.center._id.

        const user = await User.findOne({ momId });
        if (!user) {
            return res.status(404).json({ message: "Mother ID not found" });
        }

        if (user.linkedAnganwadi && user.linkedAnganwadi.toString() !== req.center._id.toString()) {
            return res.status(400).json({ message: "Mother is already linked to another center. Request migration." });
        }

        user.linkedAnganwadi = req.center._id;
        user.migrationStatus = "active";
        await user.save();

        res.json({ message: "Mother linked successfully", user: { name: user.name, momId: user.momId } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new beneficiary (or update existing) and generate MCP ID
export const registerBeneficiary = async (req, res) => {
    try {
        const {
            name, husbandName, fatherName,
            address, permanentAddress, jurisdiction,
            state, district,
            motherPhone, husbandPhone,
            pregnancyStartDate, expectedDeliveryDate,
            riskCategory,
            email // Optional, if they have an account
        } = req.body;

        // 1. Validation
        if (!name || !husbandName || !address || !motherPhone) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // 2. Check if user exists (by Phone or Email)
        let user = await User.findOne({
            $or: [
                { motherPhone: motherPhone },
                { email: email || `placeholder_${motherPhone}@anganwadi.local` }
            ]
        });

        // 3. Generate MCP ID: MCP-<CentreID>-<SEQ>
        const center = await AnganwadiCenter.findById(req.center._id);
        const centreCode = center.anganwadiCenterId || "ANG-UNK-000";
        const linkedCount = await User.countDocuments({ linkedAnganwadi: req.center._id });
        const seq = (linkedCount + 1).toString().padStart(4, '0');
        const mcpId = `MCP-${centreCode}-${seq}`;

        if (!user) {
            // Create new User
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("12345678", salt); // Default password

            user = new User({
                name,
                email: email || `${motherPhone}@anganwadi.local`,
                password: hashedPassword,
                motherPhone,
                isOnboarded: true
            });
        }

        // 4. Update Profile
        user.mcpId = mcpId;
        user.husbandName = husbandName;
        user.fatherName = fatherName;
        user.address = address;
        user.permanentAddress = permanentAddress;
        user.jurisdiction = jurisdiction;
        user.husbandPhone = husbandPhone;
        user.pregnancyStartDate = pregnancyStartDate;
        user.dueDate = expectedDeliveryDate;

        // Linkage
        user.linkedAnganwadi = req.center._id;
        user.linkageStatus = "linked";
        user.migrationStatus = "active";

        // Risk Profile
        if (riskCategory === "High") {
            if (!user.profile) user.profile = {};
            if (!user.profile.medicalConditions) user.profile.medicalConditions = [];
            if (!user.profile.medicalConditions.includes("High Risk")) {
                user.profile.medicalConditions.push("High Risk");
            }
        }

        await user.save();

        res.status(201).json({
            message: "Beneficiary Registered & MCP ID Generated",
            mcpId: user.mcpId,
            user: { name: user.name, id: user._id }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Deprecated or Aliased?
export const generateMomId = registerBeneficiary;


export const releaseMother = async (req, res) => {
    try {
        const { momId, userId } = req.body;
        // Lookup by userId if present, otherwise momId (legacy or mcpId)
        const query = userId
            ? { _id: userId, linkedAnganwadi: req.center._id }
            : { momId, linkedAnganwadi: req.center._id };

        const user = await User.findOne(query);

        if (!user) return res.status(404).json({ message: "Mother not found in your center" });

        user.migrationStatus = "released";
        user.linkedAnganwadi = null; // Unlink, but keep ID for history? Or Null as per request "Remove linkedAnganwadi reference"
        // "Remove linkedAnganwadi reference" -> set to null.
        user.linkedAnganwadi = null;

        const MigrationLog = (await import("../models/migrationLog.model.js")).default;
        await MigrationLog.create({
            mom: user._id,
            fromCenter: req.center._id,
            status: "released"
        });

        await user.save();
        res.json({ message: "Mother released for migration" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const claimMother = async (req, res) => {
    try {
        const { momId, userId } = req.body;
        const query = userId ? { _id: userId } : { momId };
        const user = await User.findOne(query);

        if (!user) return res.status(404).json({ message: "Mother ID not found" });

        if (user.migrationStatus !== "released") {
            return res.status(400).json({ message: "Mother is not in 'released' status. Previous center must release first." });
        }

        // Log previous center? We don't track "from" easily here unless we store it on user or query last log.
        // For now, "fromCenter" in log might be null or we query the last release log?
        // Let's just log the claim. 
        // Better: We should probably store `previousAnganwadi` on User if we want accurate logs, 
        // OR query the MigrationLog for the last "released" entry for this mom.

        const MigrationLog = (await import("../models/migrationLog.model.js")).default;
        const lastLog = await MigrationLog.findOne({ mom: user._id, status: "released" }).sort({ createdAt: -1 });

        await MigrationLog.create({
            mom: user._id,
            fromCenter: lastLog ? lastLog.fromCenter : null, // Best effort
            toCenter: req.center._id,
            status: "claimed"
        });

        user.linkedAnganwadi = req.center._id;
        user.migrationStatus = "active";

        // Notify Mother
        const Notification = (await import("../models/notification.model.js")).default;
        await Notification.create({
            recipientUser: user._id,
            type: "migration",
            message: `You have been successfully linked to ${req.center.centerName}`
        });

        await user.save();

        res.json({ message: "Mother claimed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Dashboard & Visits ---

export const getDashboardStats = async (req, res) => {
    try {
        const totalMoms = await User.countDocuments({ linkedAnganwadi: req.center._id, migrationStatus: "active" });

        // High Risk Logic (Mocked slightly as we need to aggregate across collections, or just simple check)
        // Real implementation would join Tracking/Nutrition, but for now let's query Users and maybe a flag or simple profile check
        // Or aggregate from 'profile'
        const users = await User.find({ linkedAnganwadi: req.center._id, migrationStatus: "active" }).select('profile');

        let highRiskCases = 0;
        users.forEach(u => {
            if (u.profile?.medicalConditions?.length > 0) highRiskCases++;
            // Add more logic later
        });

        const startOfMonth = new Date(); startOfMonth.setDate(1);
        const endOfMonth = new Date(); endOfMonth.setMonth(endOfMonth.getMonth() + 1); endOfMonth.setDate(0);

        const dueThisMonth = await User.countDocuments({
            linkedAnganwadi: req.center._id,
            migrationStatus: "active",
            dueDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const recentRegistrations = await User.countDocuments({
            linkedAnganwadi: req.center._id,
            // createdAt for user might be old, but linkedAt isn't stored. Use User createdAt for now/proxy
            updatedAt: { $gte: startOfMonth } // Proxy: recently updated (linked)
        });

        res.json({
            totalMoms,
            highRiskCases,
            dueThisMonth,
            recentRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBeneficiaries = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { linkedAnganwadi: req.center._id, migrationStatus: "active" };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { mcpId: { $regex: search, $options: "i" } } // updated to mcpId
            ];
        }

        // Fetch users
        const users = await User.find(query).select("name mcpId profile dueDate email pregnancyWeek address motherPhone husbandName husbandPhone");

        // Fetch next visits for these users
        // Optimization: In a real app, use aggregation or population if reference existed inversely
        // For now, map over users
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            const nextVisit = await AnganwadiVisit.findOne({ mom: u._id, nextVisitDate: { $gte: new Date() } }).sort({ nextVisitDate: 1 });

            // Determine High Risk mainly from anemia/BP/weight in profile (mock logic based on existing flags)
            const isHighRisk = u.profile?.medicalConditions?.length > 0;

            return {
                _id: u._id,
                name: u.name,
                mcpId: u.mcpId || "N/A",
                trimester: u.profile?.trimester || "N/A",
                highRiskStatus: isHighRisk ? "High Risk" : "Normal",
                address: u.address || "N/A",
                motherPhone: u.motherPhone || "N/A",
                husbandName: u.husbandName || "N/A",
                husbandPhone: u.husbandPhone || "N/A",
                nextVisitDate: nextVisit ? nextVisit.nextVisitDate : null
            };
        }));

        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const scheduleVisit = async (req, res) => {
    try {
        const { momId, userId, date, notes, type } = req.body;

        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (momId) {
            user = await User.findOne({ $or: [{ mcpId: momId }, { momId: momId }] });
        }

        if (!user) return res.status(404).json({ message: "Mother not found" });

        const visit = await AnganwadiVisit.create({
            mom: user._id,
            anganwadi: req.center._id,
            nextVisitDate: date,
            type: type || "general",
            status: "scheduled",
            notes,
            createdBy: req.center._id
        });

        // Trigger Notification 
        const Notification = (await import("../models/notification.model.js")).default;
        await Notification.create({
            recipientUser: user._id,
            type: "visit",
            message: `New Anganwadi Visit Scheduled: ${new Date(date).toLocaleDateString()}`
        });

        // Create Reminder for Care4Mom
        const Reminder = (await import("../models/reminder.model.js")).default;
        await Reminder.create({
            user: user._id,
            title: `Anganwadi ${type || 'Visit'} Appointment`,
            description: notes || `Scheduled ${type || 'visit'} at ${req.center.centerName}`,
            dueAt: date,
            source: "anganwadi",
            refType: "appointment",
            refId: visit._id,
            status: "pending",
            createdBy: req.center._id,
            createdByModel: "AnganwadiCenter"
        });

        // Sync with User's Appointment/Calendar
        const Appointment = (await import("../models/appointment.model.js")).default;
        await Appointment.create({
            user: user._id,
            title: "Anganwadi Visit",
            hospitalName: req.center.centerName,
            date: date,
            time: "10:00 AM", // Default time or add time picker later
            reminderSent: false
        });

        res.json(visit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateVisitStatus = async (req, res) => {
    try {
        const { visitId, status, newDate } = req.body;
        const AnganwadiVisit = (await import("../models/anganwadiVisit.model.js")).default;
        const visit = await AnganwadiVisit.findById(visitId);

        if (!visit) return res.status(404).json({ message: "Visit not found" });
        if (visit.anganwadi.toString() !== req.center._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Update visit
        if (status) {
            visit.status = status;
            visit.completed = (status === "completed");
        }
        if (newDate) {
            visit.nextVisitDate = newDate;
        }
        await visit.save();

        // Update linked reminder
        const Reminder = (await import("../models/reminder.model.js")).default;
        const reminder = await Reminder.findOne({ refId: visit._id, refType: "appointment" });

        if (reminder) {
            if (status === "completed") {
                reminder.status = "completed";
            } else if (status === "cancelled") {
                reminder.status = "cancelled";
            }
            if (newDate) {
                reminder.dueAt = newDate;
            }
            await reminder.save();
        }

        res.json({ message: "Visit status updated", visit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVisits = async (req, res) => {
    try {
        const visits = await AnganwadiVisit.find({ anganwadi: req.center._id })
            .populate("mom", "name momId")
            .sort({ nextVisitDate: 1 });
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMigrationRequests = async (req, res) => {
    try {
        // Show Released mothers (global? or just those who might be relevant? Request says "Released mothers available for claim")
        // Maybe filter by district? For now return all released (global pool)
        const releasedMoms = await User.find({ migrationStatus: "released" }).select("name mcpId district state");

        res.json(releasedMoms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- National Expansion & Reporting ---

export const getMotherDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .populate("linkedAnganwadi", "centerName");

        if (!user) return res.status(404).json({ message: "Mother not found" });
        if (user.linkedAnganwadi && user.linkedAnganwadi._id.toString() !== req.center._id.toString()) {
            // Allow viewing if released? Or strict? 
            // "Anganwadi check: linkedAnganwadi == currentCenterId"
            return res.status(403).json({ message: "Access Denied: Mother not linked to this center" });
        }

        // Fetch related data
        // We need to fetch Tracking, Medication, Appointments etc.
        // Medication is READ ONLY for Anganwadi
        const Medication = (await import("../models/medication.model.js")).default; // Dynamic import to avoid circular dep if any
        const medications = await Medication.find({ user: id });

        // Visits
        const visits = await AnganwadiVisit.find({ mom: id }).sort({ nextVisitDate: -1 });

        res.json({
            profile: user,
            medications, // Read only
            visits
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCenterReports = async (req, res) => {
    try {
        const totalLinkedMoms = await User.countDocuments({ linkedAnganwadi: req.center._id, linkageStatus: "linked" });
        const MigrationLog = (await import("../models/migrationLog.model.js")).default;

        const totalMigratedOut = await MigrationLog.countDocuments({ fromCenter: req.center._id, status: "released" });
        const totalMigratedIn = await MigrationLog.countDocuments({ toCenter: req.center._id, status: "claimed" });

        // High risk (mocked logic or based on profile fields)
        const highRiskCases = await User.countDocuments({
            linkedAnganwadi: req.center._id,
            "profile.medicalConditions": { $exists: true, $not: { $size: 0 } }
        });

        const startOfMonth = new Date(); startOfMonth.setDate(1);
        const endOfMonth = new Date(); endOfMonth.setMonth(endOfMonth.getMonth() + 1); endOfMonth.setDate(0);

        const dueThisMonth = await User.countDocuments({
            linkedAnganwadi: req.center._id,
            dueDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        res.json({
            totalLinkedMoms,
            totalMigratedOut,
            totalMigratedIn,
            highRiskCases,
            dueThisMonth
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCenterNotifications = async (req, res) => {
    try {
        const Notification = (await import("../models/notification.model.js")).default;
        const notifications = await Notification.find({ recipientAnganwadi: req.center._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Government Scheme Requests (Mom → Anganwadi) ---

export const createSchemeSupportRequest = async (req, res) => {
    try {
        const { schemeId, schemeTitle } = req.body;

        if (!schemeId || !schemeTitle) {
            return res.status(400).json({ message: "schemeId and schemeTitle are required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.linkedAnganwadi) {
            return res.status(400).json({ message: "You must be linked to an Anganwadi center to request support" });
        }

        const SchemeRequest = (await import("../models/schemeRequest.model.js")).default;
        const Notification = (await import("../models/notification.model.js")).default;

        const request = await SchemeRequest.create({
            mother: user._id,
            anganwadi: user.linkedAnganwadi,
            schemeId,
            schemeTitle
        });

        await Notification.create({
            recipientAnganwadi: user.linkedAnganwadi,
            type: "scheme-request",
            message: `${user.name || "Beneficiary"} requested help to apply for: ${schemeTitle}`
        });

        res.status(201).json({ message: "Scheme support request created", request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Facilities & Services ---

export const updateFacilities = async (req, res) => {
    try {
        const { facilities, services, contactNumber, address } = req.body;
        const center = await AnganwadiCenter.findById(req.center._id);

        if (facilities) center.facilities = facilities;
        if (services) center.services = services;
        if (contactNumber) center.contactNumber = contactNumber;
        if (address) center.address = address;

        await center.save();
        res.json({ message: "Facilities updated successfully", center });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNearbyCenters = async (req, res) => {
    try {
        const { district, state, search } = req.query;
        let query = {};

        if (district) query.district = { $regex: new RegExp(district, "i") };
        if (state) query.state = { $regex: new RegExp(state, "i") };
        if (search) {
            query.$or = [
                { centerName: { $regex: search, $options: "i" } },
                { district: { $regex: search, $options: "i" } }
            ];
        }

        const centers = await AnganwadiCenter.find(query).select("-password");
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Join Requests ---

export const createJoinRequest = async (req, res) => {
    try {
        const { centerId } = req.body;
        const userId = req.user._id;

        const JoinRequest = (await import("../models/joinRequest.model.js")).default;

        // Check if already requested
        const existingRequest = await JoinRequest.findOne({ mom: userId, anganwadi: centerId, status: "pending" });
        if (existingRequest) {
            return res.status(400).json({ message: "Request already pending for this center" });
        }

        const newRequest = new JoinRequest({
            mom: userId,
            anganwadi: centerId
        });

        await newRequest.save();
        res.status(201).json({ message: "Join request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getJoinRequests = async (req, res) => {
    try {
        const JoinRequest = (await import("../models/joinRequest.model.js")).default;
        const requests = await JoinRequest.find({ anganwadi: req.center._id, status: "pending" })
            .populate("mom", "name email motherPhone address urgencyLevel");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const processJoinRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body; // status: "approved" | "rejected"
        const JoinRequest = (await import("../models/joinRequest.model.js")).default;

        const request = await JoinRequest.findById(requestId).populate("mom");
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === "rejected") {
            request.status = "rejected";
            await request.save();
            return res.json({ message: "Request rejected" });
        }

        if (status === "approved") {
            request.status = "approved";
            await request.save();

            // Link User to Center (Explicit Fetch)
            // Ensure we have the latest user doc and it's a full mongoose instance
            const user = await User.findById(request.mom._id || request.mom);

            if (user) {
                user.linkedAnganwadi = req.center._id;
                user.linkageStatus = "linked";
                user.migrationStatus = "active"; // Reset if was previous

                // Generate MCP ID if missing: MCP-\u003cCentreID\u003e-\u003cSEQ\u003e
                if (!user.mcpId) {
                    const AnganwadiCenter = (await import("../models/anganwadi.model.js")).default;
                    const center = await AnganwadiCenter.findById(req.center._id);
                    const centreCode = center.anganwadiCenterId || "ANG-UNK-000";

                    const linkedCount = await User.countDocuments({ linkedAnganwadi: req.center._id });
                    const seq = (linkedCount + 1).toString().padStart(4, '0');
                    user.mcpId = `MCP-${centreCode}-${seq}`;
                }

                await user.save();
                return res.json({ message: "Request approved and User linked", mcpId: user.mcpId });
            } else {
                return res.status(404).json({ message: "User not found to link" });
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get detailed beneficiary profile
export const getBeneficiaryDetail = async (req, res) => {
    try {
        const { momId } = req.params;
        const User = (await import("../models/user.model.js")).default;
        const AnganwadiVisit = (await import("../models/anganwadiVisit.model.js")).default;

        const mom = await User.findById(momId)
            .populate("linkedAnganwadi", "centerName district state");

        if (!mom) {
            return res.status(404).json({ message: "Mother not found" });
        }

        // Verify access: Only the assigned center can view this mom
        if (!mom.linkedAnganwadi || mom.linkedAnganwadi._id.toString() !== req.center._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: Mother not assigned to your center" });
        }

        // Get visit summary
        const totalVisits = await AnganwadiVisit.countDocuments({ mom: mom._id });
        const completedVisits = await AnganwadiVisit.countDocuments({ mom: mom._id, completed: true });
        const upcomingVisits = await AnganwadiVisit.find({
            mom: mom._id,
            completed: false,
            nextVisitDate: { $gte: new Date() }
        }).sort({ nextVisitDate: 1 }).limit(3);

        const profile = {
            _id: mom._id,
            name: mom.name,
            email: mom.email,
            momId: mom._id,
            mcpId: mom.mcpId || null,
            phone: mom.motherPhone,
            address: mom.address,
            permanentAddress: mom.permanentAddress,
            jurisdiction: mom.jurisdiction,
            husbandName: mom.husbandName,
            fatherName: mom.fatherName,
            currentDistrict: mom.currentDistrict,
            anganwadiCenter: mom.linkedAnganwadi,
            linkageStatus: mom.linkageStatus,
            migrationStatus: mom.migrationStatus,
            pregnancyWeek: mom.pregnancyWeek,
            dueDate: mom.dueDate,
            riskLevel: mom.riskLevel,
            visitStats: {
                total: totalVisits,
                completed: completedVisits,
                upcoming: upcomingVisits
            }
        };

        res.json(profile);
    } catch (error) {
        console.error("Error in getBeneficiaryDetail:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get beneficiary activity data
export const getBeneficiaryActivity = async (req, res) => {
    try {
        const { momId } = req.params;
        const { startDate, endDate, type } = req.query;
        const User = (await import("../models/user.model.js")).default;

        const mom = await User.findById(momId);

        if (!mom) {
            return res.status(404).json({ message: "Mother not found" });
        }

        // Verify access
        if (!mom.linkedAnganwadi || mom.linkedAnganwadi.toString() !== req.center._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const activity = {};
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Nutrition logs (if model exists)
        if (!type || type === "nutrition") {
            try {
                const NutritionLog = (await import("../models/nutrition.model.js")).default;
                const nutritionLogs = await NutritionLog.find({
                    user: momId,
                    ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
                }).sort({ date: -1 }).limit(50);
                activity.nutrition = nutritionLogs;
            } catch (error) {
                console.log("Nutrition model error:", error.message);
                activity.nutrition = [];
            }
        }

        // Tracking metrics (if model exists)
        if (!type || type === "tracking") {
            try {
                const DailyTracking = (await import("../models/tracking.model.js")).default;
                const trackingData = await DailyTracking.find({
                    user: momId,
                    ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
                }).sort({ date: -1 }).limit(50);
                activity.tracking = trackingData;
            } catch (error) {
                console.log("Tracking model error:", error.message);
                activity.tracking = [];
            }
        }

        // Visits
        if (!type || type === "visits") {
            const AnganwadiVisit = (await import("../models/anganwadiVisit.model.js")).default;
            const visits = await AnganwadiVisit.find({
                mom: momId,
                ...(Object.keys(dateFilter).length > 0 && { nextVisitDate: dateFilter })
            }).populate("anganwadi", "centerName").sort({ nextVisitDate: -1 });
            activity.visits = visits;
        }

        res.json(activity);
    } catch (error) {
        console.error("Error in getBeneficiaryActivity:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Guidance & Announcements ---

export const createGuidance = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const guidance = await Guidance.create({
            anganwadi: req.center._id,
            title,
            content,
            type: type || "guidance"
        });

        res.status(201).json({ message: "Guidance published", guidance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGuidance = async (req, res) => {
    try {
        const guidance = await Guidance.find({ anganwadi: req.center._id, isActive: true })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(guidance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGuidance = async (req, res) => {
    try {
        const { id } = req.params;
        const guidance = await Guidance.findOne({ _id: id, anganwadi: req.center._id });
        if (!guidance) return res.status(404).json({ message: "Guidance not found" });

        guidance.isActive = false;
        await guidance.save();
        res.json({ message: "Guidance removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mom-side: Get guidance from linked centre
export const getGuidanceForMom = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.linkedAnganwadi || user.linkageStatus !== "linked") {
            return res.json([]); // Not linked, no guidance
        }

        const guidance = await Guidance.find({ anganwadi: user.linkedAnganwadi, isActive: true })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(guidance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================================================
// PUBLIC POSTS – Visible to ALL mothers
// =========================================================

export const createPublicPost = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const PublicPost = (await import("../models/publicPost.model.js")).default;

        const post = await PublicPost.create({
            title,
            content,
            imageUrl: imageUrl || null,
            createdBy: req.center._id
        });

        res.status(201).json({ message: "Public post created", post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicPosts = async (req, res) => {
    try {
        const PublicPost = (await import("../models/publicPost.model.js")).default;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            PublicPost.find({ isActive: true })
                .populate("createdBy", "centerName district")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PublicPost.countDocuments({ isActive: true })
        ]);

        res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================================================
// PERSONAL SUGGESTIONS – Private per mother
// =========================================================

export const createPersonalSuggestion = async (req, res) => {
    try {
        const { motherId, title, message, category, scheduleDate } = req.body;
        if (!motherId || !title || !message) {
            return res.status(400).json({ message: "motherId, title, and message are required" });
        }

        // Verify the mother is linked to this center
        const mom = await User.findById(motherId);
        if (!mom || !mom.linkedAnganwadi || mom.linkedAnganwadi.toString() !== req.center._id.toString()) {
            return res.status(403).json({ message: "This mother is not linked to your center" });
        }

        const PersonalSuggestion = (await import("../models/personalSuggestion.model.js")).default;

        const suggestion = await PersonalSuggestion.create({
            motherId,
            anganwadiId: req.center._id,
            title,
            message,
            category: category || "general",
            scheduleDate: scheduleDate || null
        });

        res.status(201).json({ message: "Suggestion created", suggestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPersonalSuggestions = async (req, res) => {
    try {
        const PersonalSuggestion = (await import("../models/personalSuggestion.model.js")).default;
        const { motherId } = req.params;

        // If called from Anganwadi side (req.center exists), verify access
        if (req.center) {
            const mom = await User.findById(motherId);
            if (!mom || !mom.linkedAnganwadi || mom.linkedAnganwadi.toString() !== req.center._id.toString()) {
                return res.status(403).json({ message: "Unauthorized" });
            }
        }

        const suggestions = await PersonalSuggestion.find({ motherId, isActive: true })
            .populate("anganwadiId", "centerName")
            .sort({ createdAt: -1 });

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mom-side: Get her own personal suggestions
export const getMyPersonalSuggestions = async (req, res) => {
    try {
        const PersonalSuggestion = (await import("../models/personalSuggestion.model.js")).default;

        const suggestions = await PersonalSuggestion.find({
            motherId: req.user._id,
            isActive: true
        })
            .populate("anganwadiId", "centerName")
            .sort({ createdAt: -1 });

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a suggestion as completed (callable by mother)
export const markSuggestionComplete = async (req, res) => {
    try {
        const PersonalSuggestion = (await import("../models/personalSuggestion.model.js")).default;
        const { id } = req.params;

        const suggestion = await PersonalSuggestion.findOne({
            _id: id,
            motherId: req.user._id
        });

        if (!suggestion) {
            return res.status(404).json({ message: "Suggestion not found" });
        }

        suggestion.status = "completed";
        await suggestion.save();

        res.json({ message: "Suggestion marked as completed", suggestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================================================
// BABY TAB – Anganwadi can view/manage baby records for linked mothers
// =========================================================

/**
 * GET /api/anganwadi/babies
 * Get all baby records for mothers linked to this Anganwadi center.
 */
export const getBabiesForCenter = async (req, res) => {
    try {
        // PERMANENT FIX: Use req.center (set by protectAnganwadiRoute middleware), not req.anganwadi
        const centerId = req.center._id;
        const Baby = (await import("../models/baby.model.js")).default;

        // Find all mothers linked to this center
        const mothers = await User.find({ linkedAnganwadi: centerId }).select("_id name");
        const motherIds = mothers.map(m => m._id);

        const babies = await Baby.find({ mother: { $in: motherIds } })
            .populate("mother", "name email motherPhone address")
            .sort({ createdAt: -1 });

        res.json(babies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/anganwadi/babies/:babyId/remarks
 * Add a health remark to a baby from Anganwadi.
 */
export const addBabyHealthRemarkFromCenter = async (req, res) => {
    try {
        const Baby = (await import("../models/baby.model.js")).default;
        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        baby.healthRemarks.push({
            remark: req.body.remark,
            addedBy: "anganwadi",
            date: new Date(),
        });
        await baby.save();

        res.json({ message: "Remark added", baby });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/anganwadi/babies/:babyId/vaccination-reminder
 * Set a vaccination reminder for a baby.
 */
export const setBabyVaccinationReminder = async (req, res) => {
    try {
        const BabyReminder = (await import("../models/babyReminder.model.js")).default;
        const Baby = (await import("../models/baby.model.js")).default;

        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        // PERMANENT FIX: Use req.center (set by protectAnganwadiRoute middleware)
        const reminder = await BabyReminder.create({
            baby: baby._id,
            createdBy: "anganwadi",
            createdByUser: req.center._id,
            title: req.body.title || "Vaccination Reminder",
            description: req.body.description || "",
            date: new Date(req.body.date),
        });

        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/anganwadi/babies/:babyId/appointments
 * Schedule an appointment for a baby from Anganwadi.
 */
export const createBabyAppointmentFromCenter = async (req, res) => {
    try {
        const BabyReminder = (await import("../models/babyReminder.model.js")).default;
        const Baby = (await import("../models/baby.model.js")).default;

        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        // PERMANENT FIX: Use req.center (set by protectAnganwadiRoute middleware)
        const appointment = await BabyReminder.create({
            baby: baby._id,
            createdBy: "anganwadi",
            createdByUser: req.center._id,
            title: req.body.title || "Baby Checkup Appointment",
            description: req.body.description || "",
            date: new Date(req.body.date),
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/anganwadi/babies/:babyId/growth-notes
 * Get growth notes (health remarks) for a specific baby.
 */
export const getBabyGrowthNotes = async (req, res) => {
    try {
        const Baby = (await import("../models/baby.model.js")).default;
        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });

        res.json(baby.healthRemarks || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
