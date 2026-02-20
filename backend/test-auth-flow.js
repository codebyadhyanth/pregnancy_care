import axios from "axios";
import "dotenv/config";

const BASE_URL = `http://localhost:${process.env.PORT || 5004}/api/auth`;

async function testAuth() {
    console.log("--- TESTING AUTH FLOW ---");
    console.log(`Target URL: ${BASE_URL}`);

    // 1. Signup (to ensure user exists) or Login directly
    // Use a random email to avoid collision if cleaning isn't done, 
    // BUT we want to test REPEATABLE login. 
    // Let's use the known user 'Doki@gmail.com' if we knew the password.
    // Since we don't, let's create a NEW user for testing.
    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: "password123",
        name: "Test User"
    };

    console.log("\n1. Attemping Signup...");
    try {
        const signupRes = await axios.post(`${BASE_URL}/signup`, testUser);
        console.log("Signup Status:", signupRes.status);
        console.log("Signup Body:", signupRes.data);
        const cookie = signupRes.headers['set-cookie'];
        console.log("Signup Set-Cookie:", cookie);
    } catch (err) {
        console.log("Signup validation/error:", err.response ? err.response.data : err.message);
    }

    console.log("\n2. Attempting Login...");
    try {
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log("Login Status:", loginRes.status);
        console.log("Login Body has token?", !!loginRes.data.token);
        console.log("Login Body Token:", loginRes.data.token ? "Present" : "Missing");

        if (loginRes.data.token) {
            console.log("SUCCESS: Token returned in body as expected by Frontend!");
        } else {
            console.log("FAILURE: Token STILL NOT in body!");
        }

        const cookies = loginRes.headers['set-cookie'];
        console.log("Login Set-Cookie Headers:", cookies);

        if (cookies) {
            const jwtCookie = cookies.find(c => c.startsWith('jwt='));
            if (jwtCookie) {
                console.log("JWT Cookie found:", jwtCookie);
                console.log("Is HttpOnly?", jwtCookie.includes('HttpOnly'));
                console.log("Is Secure?", jwtCookie.includes('Secure'));
                console.log("SameSite?", jwtCookie.includes('SameSite'));
            } else {
                console.log("No jwt cookie found in Set-Cookie headers");
            }
        } else {
            console.log("No Set-Cookie headers received");
        }

    } catch (err) {
        console.log("Login failed:", err.response ? err.response.data : err.message);
    }
}

testAuth();
