import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected : ${conn.connection.host}`);

    // One-time migration: drop old non-sparse anganwadiCenterId index
    // so Mongoose can recreate it as sparse (prevents E11000 on null values).
    try {
      await conn.connection.db
        .collection("anganwadicenters")
        .dropIndex("anganwadiCenterId_1");
      console.log("✅ Dropped old anganwadiCenterId index — will recreate as sparse.");
    } catch (err) {
      if (err.codeName !== "IndexNotFound") {
        console.warn("⚠️  Could not drop anganwadiCenterId index:", err.message);
      }
      // IndexNotFound is fine — index was already correct or never created
    }

    // Dynamically import the model (avoids circular import issues at module load)
    const { default: AnganwadiCenter } = await import("../models/anganwadi.model.js");
    await AnganwadiCenter.syncIndexes();
    console.log("✅ AnganwadiCenter indexes synced.");

  } catch (error) {
    console.log("Error in connecting to MongoDB", error);
    process.exit(1); // 1 means Failure
  }
};