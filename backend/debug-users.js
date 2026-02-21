import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();

        console.log(`\nTotal Users Found: ${users.length}`);
        console.log("---------------------------------------------------");
        users.forEach(u => {
            console.log(`Email: ${u.email} | Name: ${u.name} | Onboarded: ${u.isOnboarded}`);
        });
        console.log("---------------------------------------------------");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
