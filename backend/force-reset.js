import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = "kiradoki@gmail.com";
        const password = "password123";

        // 1. Generate new hash manually to be 100% sure
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Update directly
        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: { $regex: `^${email}$`, $options: 'i' } },
            {
                $set: {
                    password: hashedPassword,
                    isOnboarded: true // Ensure this is true too
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log(`SUCCESS: Password reset for ${email} to '${password}'`);
        } else {
            console.log(`FAILURE: User ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
