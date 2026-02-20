import axios from "axios";
import mongoose from "mongoose";
import "dotenv/config";

const BASE_URL = `http://localhost:${process.env.PORT || 5004}/api`;

async function run() {
    console.log("--- FINAL VERIFICATION ---");

    // 1. Login with existing onboarded user (Doki@gmail.com)
    console.log("\n1. Testing Login with ONBOARDED user (Doki@gmail.com)...");
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: "Doki@gmail.com",
            password: "password123"
        });

        if (res.data.token && res.data.user.isOnboarded === true) {
            console.log("SUCCESS: Token received and isOnboarded is TRUE.");
        } else {
            console.log("FAILURE: Unexpected response", res.data);
        }
    } catch (err) {
        console.log("LOGIN FAILED:", err.message);
        if (err.response) {
            console.log("Error Response:", err.response.data);
        }
    }

    // 2. Create a new user for Onboarding Test
    const newEmail = `new_${Date.now()}@test.com`;
    console.log(`\n2. Creating NEW user (${newEmail})...`);
    let newUserToken = "";
    try {
        const res = await axios.post(`${BASE_URL}/auth/signup`, {
            name: "New User",
            email: newEmail,
            password: "password123"
        });
        newUserToken = res.data.token; // Signup auto-logins usually
        console.log("Signup Response code:", res.status);

        // Check isOnboarded status immediately after signup
        if (res.data.user.isOnboarded === false) {
            console.log("SUCCESS: New user isOnboarded is FALSE.");
        } else {
            console.log("FAILURE: New user isOnboarded is", res.data.user.isOnboarded);
        }

    } catch (err) {
        console.log("SIGNUP FAILED:", err.response?.data || err.message);
    }

    // 3. Complete Onboarding for new user
    if (newUserToken) {
        console.log("\n3. Testing Onboarding Completion...");
        try {
            const res = await axios.post(
                `${BASE_URL}/dashboard/onboarding`,
                {
                    pregnancyStartDate: new Date().toISOString(),
                    age: 25,
                    weight: 60
                },
                { headers: { Authorization: `Bearer ${newUserToken}` } }
            );

            if (res.data.isOnboarded === true) {
                console.log("SUCCESS: Onboarding completed, isOnboarded is now TRUE.");
            } else {
                console.log("FAILURE: Onboarding response", res.data);
            }

        } catch (err) {
            console.log("ONBOARDING FAILED:", err.response?.data || err.message);
        }
    }
}

run();
