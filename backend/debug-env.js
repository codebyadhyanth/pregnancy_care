import "dotenv/config";
import mongoose from "mongoose";

async function run() {
    console.log("--- PHASE 1: ENVIRONMENT VERIFICATION ---");
    console.log(`NODE_ENV: '${process.env.NODE_ENV}'`);
    console.log(`PORT: '${process.env.PORT}'`);

    const uri = process.env.MONGODB_URI;
    console.log(`MONGODB_URI: '${uri ? uri.replace(/:([^@]+)@/, ":****@") : "undefined"}'`);

    const secret = process.env.JWT_SECRET_KEY;
    if (secret) {
        console.log(`JWT_SECRET_KEY: Exists, Length: ${secret.length}`);
        console.log(`JWT_SECRET_KEY starts with space: '${secret.startsWith(" ")}'`);
        console.log(`JWT_SECRET_KEY ends with space: '${secret.endsWith(" ")}'`);
        console.log(`JWT_SECRET_KEY first 3 chars: '${secret.substring(0, 3)}'`);
    } else {
        console.log("JWT_SECRET_KEY: undefined");
    }

    console.log("Attempting to connect to MongoDB...");

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Connection State: ${mongoose.connection.readyState}`);

        console.log("--- PHASE 2: DATABASE VERIFICATION ---");
        console.log(`Database Name: ${conn.connection.name}`);

        const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();

        if (collections.length > 0) {
            console.log("Collection 'users' exists");
            const user = await mongoose.connection.db.collection('users').findOne({});
            if (user) {
                console.log(`Found a user: ${user.email}`);
                console.log(`Password hash starts with $2b$: ${user.password && user.password.startsWith("$2b$")}`);
            } else {
                console.log("No users found in collection");
            }
        } else {
            console.log("Collection 'users' does NOT exist");
        }

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1);
    }
}

run();
