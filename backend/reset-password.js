import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: "Doki@gmail.com" },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount > 0) {
            console.log("SUCCESS: Password for 'Doki@gmail.com' reset to 'password123'.");
        } else {
            console.log("User not found.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
