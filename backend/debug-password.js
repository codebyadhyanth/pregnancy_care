import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await mongoose.connection.db.collection('users').findOne({ email: "Doki@gmail.com" });

        if (!user) {
            console.log("User 'Doki@gmail.com' NOT FOUND.");
            process.exit(0);
        }

        console.log("User found:", user.email);
        console.log("Password Hash:", user.password);

        const testPasswords = ["password", "123456", "password123", "admin", "12345678", "doki123"];
        let match = false;

        for (const p of testPasswords) {
            const isMatch = await bcrypt.compare(p, user.password);
            console.log(`Checking against '${p}': ${isMatch}`);
            if (isMatch) {
                console.log(`\nSUCCESS! The password is: '${p}'`);
                match = true;
                break;
            }
        }

        if (!match) {
            console.log("\nNo match found among common passwords.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
