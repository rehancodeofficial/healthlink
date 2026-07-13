/**
 * Test individual update operations
 */

const axios = require("axios");

async function testStepByStep() {
  try {
    // Login
    const loginRes = await axios.post("https://curevirtual-2-production-ee33.up.railway.app/api/auth/login", {
      email: "rehan.dev1514@gmail.com",
      password: "123123",
    });

    const token = loginRes.data.token;

    // Get profile
    const profileRes = await axios.get("https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userId = profileRes.data.data.userId;
    console.log("User ID:", userId);
    console.log("Current gender:", profileRes.data.data.user?.gender);
    console.log("Current dateOfBirth:", profileRes.data.data.user?.dateOfBirth);

    // Test 1: Update only address (PatientProfile field)
    console.log("\n📝 Test 1: Updating only address...");
    try {
      const res1 = await axios.put(
        "https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile",
        {
          userId: userId,
          address: "Test Address 123",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Address update successful");
    } catch (e) {
      console.error("❌ Address update failed:", e.response?.data || e.message);
    }

    // Test 2: Update only bloodGroup (PatientProfile enum)
    console.log("\n📝 Test 2: Updating only blood group...");
    try {
      const res2 = await axios.put(
        "https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile",
        {
          userId: userId,
          bloodGroup: "A+",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Blood group update successful");
    } catch (e) {
      console.error("❌ Blood group update failed:", e.response?.data || e.message);
    }

    // Test 3: Update only gender (User enum)
    console.log("\n📝 Test 3: Updating only gender...");
    try {
      const res3 = await axios.put(
        "https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile",
        {
          userId: userId,
          gender: "Male",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Gender update successful");
    } catch (e) {
      console.error("❌ Gender update failed:", e.response?.data || e.message);
    }

    // Test 4: Update only dateOfBirth (User field)
    console.log("\n📝 Test 4: Updating only date of birth...");
    try {
      const res4 = await axios.put(
        "https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile",
        {
          userId: userId,
          dateOfBirth: "1995-05-15",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ DOB update successful");
    } catch (e) {
      console.error("❌ DOB update failed:", e.response?.data || e.message);
    }

    // Test 5: Update all fields
    console.log("\n📝 Test 5: Updating all fields...");
    try {
      const res5 = await axios.put(
        "https://curevirtual-2-production-ee33.up.railway.app/api/patient/profile",
        {
          userId: userId,
          dateOfBirth: "1995-05-15",
          gender: "Male",
          bloodGroup: "A+",
          height: 180,
          weight: 75,
          address: "123 Health Street",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Full update successful!");
      console.log(JSON.stringify(res5.data, null, 2));
    } catch (e) {
      console.error("❌ Full update failed:", e.response?.data || e.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testStepByStep();
