import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        // Update Doki@gmail.com OR any user needed.
        // Let's first check if kiradoki exists to avoid duplicates (though we know it doesn't).
        const existing = await mongoose.connection.db.collection('users').findOne({ email: "kiradoki@gmail.com" });
        if (existing) {
            console.log("User 'kiradoki@gmail.com' already exists.");
            await mongoose.connection.db.collection('users').updateOne(
                { email: "kiradoki@gmail.com" },
                { $set: { password: hashedPassword } }
            );
            console.log("Password reset for 'kiradoki@gmail.com'.");
        } else {
            // Rename Doki@gmail.com to kiradoki@gmail.com
            const result = await mongoose.connection.db.collection('users').updateOne(
                { email: { $regex: "^doki@gmail.com$", $options: "i" } },
                { $set: { email: "kiradoki@gmail.com", password: hashedPassword } }
            );

            if (result.matchedCount > 0) {
                console.log("SUCCESS: Updated 'Doki@gmail.com' to 'kiradoki@gmail.com' with password 'password123'.");
            } else {
                console.log("User 'Doki@gmail.com' not found either. Creating new user.");
                await mongoose.connection.db.collection('users').insertOne({
                    name: "Kiradoki",
                    email: "kiradoki@gmail.com",
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log("CREATED: New user 'kiradoki@gmail.com'");
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
