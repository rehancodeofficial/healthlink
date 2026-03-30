/**
 * Direct API test with detailed error logging
 */

const axios = require("axios");

async function testDirectUpdate() {
  try {
    // Login first
    const loginRes = await axios.post("http://localhost:5001/api/auth/login", {
      email: "rehan.dev1514@gmail.com",
      password: "123123",
    });

    const token = loginRes.data.token;
    console.log("✅ Logged in, token:", token.substring(0, 20) + "...");

    // Get profile to get userId
    const profileRes = await axios.get("http://localhost:5001/api/patient/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userId = profileRes.data.data.userId;
    console.log("✅ Got userId:", userId);

    // Try update
    const updateRes = await axios.put(
      "http://localhost:5001/api/patient/profile",
      {
        userId: userId,
        dateOfBirth: "1995-05-15",
        gender: "Male",
        bloodGroup: "A+",
        height: 180,
        weight: 75,
        address: "123 Health Street",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Update successful!");
    console.log(JSON.stringify(updateRes.data, null, 2));
  } catch (error) {
    console.error("❌ Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else {
      console.error(error.message);
      console.error(error.stack);
    }
  }
}

testDirectUpdate();
