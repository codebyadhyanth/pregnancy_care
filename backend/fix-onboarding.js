import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const result = await mongoose.connection.db.collection('users').updateMany(
            {},
            { $set: { isOnboarded: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to isOnboarded: true`);

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        users.forEach(u => {
            console.log(`Email: ${u.email} | Onboarded: ${u.isOnboarded}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
