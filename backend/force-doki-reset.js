import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = "Doki@gmail.com";
        const password = "password123";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: email }, // Exact match
            {
                $set: {
                    password: hashedPassword,
                    isOnboarded: true
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log(`SUCCESS: Password reset for ${email} to '${password}' and set isOnboarded=true`);
        } else {
            console.log(`FAILURE: User ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
