import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await mongoose.connection.db.collection('users').findOne({ email: "kiradoki@gmail.com" });

        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`isOnboarded: ${user.isOnboarded}`);
        } else {
            console.log("User not found.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
