/**
 * One-time migration: drop the old unique (non-sparse) index on
 * AnganwadiCenter.anganwadiCenterId so that Mongoose can recreate it
 * as a sparse unique index on next server start.
 *
 * Run once with:  node scripts/fix-anganwadi-index.js
 */
import "dotenv/config";
import mongoose from "mongoose";

async function fixIndex() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("anganwadicenters");

    try {
        await collection.dropIndex("anganwadiCenterId_1");
        console.log("✅ Dropped old index: anganwadiCenterId_1");
    } catch (err) {
        if (err.codeName === "IndexNotFound") {
            console.log("ℹ️  Index anganwadiCenterId_1 not found — nothing to drop.");
        } else {
            console.error("❌ Error dropping index:", err.message);
        }
    }

    await mongoose.disconnect();
    console.log("Done. Restart your backend server to let Mongoose create the new sparse index.");
}

fixIndex();
