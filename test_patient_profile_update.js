/**
 * Test script to verify patient profile update functionality
 * Run with: node test_patient_profile_update.js
 */

const axios = require("axios");

const BASE_URL = "https://curevirtual-2-production-ee33.up.railway.app/api";
const TEST_EMAIL = "rehan.dev1514@gmail.com";
const TEST_PASSWORD = "123123";

async function testProfileUpdate() {
  console.log("🧪 Testing Patient Profile Update...\n");

  try {
    // Step 1: Login
    console.log("1️⃣  Logging in as patient...");
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const token = loginRes.data.token;
    console.log("✅ Login successful\n");

    // Step 2: Get current profile
    console.log("2️⃣  Fetching current profile...");
    const profileRes = await axios.get(`${BASE_URL}/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Current profile fetched");
    console.log("   Current data:", JSON.stringify(profileRes.data.data, null, 2), "\n");

    // Step 3: Update profile
    console.log("3️⃣  Updating profile with new data...");
    const updateData = {
      userId: profileRes.data.data.userId, // Include userId in body as fallback
      dateOfBirth: "1995-05-15",
      gender: "Male",
      bloodGroup: "A+",
      height: 180,
      weight: 75,
      address: "123 Health Street, Wellness City",
      emergencyContact: "John Doe - 555-0199",
      allergies: "Peanuts",
      medications: "Aspirin 100mg daily",
      medicalHistory: "No major illnesses",
      insuranceProvider: "HealthCare Plus",
      medicalRecordNumber: "MRN-12345",
      insuranceMemberId: "INS-98765",
    };

    const updateRes = await axios.put(`${BASE_URL}/patient/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Profile updated successfully");
    console.log("   Updated data:", JSON.stringify(updateRes.data.data, null, 2), "\n");

    // Step 4: Verify the update
    console.log("4️⃣  Verifying the update...");
    const verifyRes = await axios.get(`${BASE_URL}/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedProfile = verifyRes.data.data;
    console.log("✅ Profile re-fetched");

    // Check key fields
    const checks = [
      { field: "dateOfBirth", expected: "1995-05-15", actual: updatedProfile.user?.dateOfBirth?.split("T")[0] },
      { field: "gender", expected: "MALE", actual: updatedProfile.user?.gender },
      { field: "bloodGroup", expected: "A_POSITIVE", actual: updatedProfile.bloodGroup },
      { field: "height", expected: 180, actual: updatedProfile.height },
      { field: "weight", expected: 75, actual: updatedProfile.weight },
      { field: "address", expected: "123 Health Street, Wellness City", actual: updatedProfile.address },
    ];

    console.log("\n📊 Verification Results:");
    let allPassed = true;
    checks.forEach(({ field, expected, actual }) => {
      const passed = String(expected) === String(actual);
      allPassed = allPassed && passed;
      console.log(`   ${passed ? "✅" : "❌"} ${field}: ${actual} ${passed ? "==" : "!="} ${expected}`);
    });

    console.log("\n" + "=".repeat(50));
    if (allPassed) {
      console.log("🎉 ALL TESTS PASSED! Profile update is working correctly.");
    } else {
      console.log("⚠️  SOME TESTS FAILED. Please review the results above.");
    }
    console.log("=".repeat(50));

  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Error:", error.response.data);
    } else {
      console.error("   Error:", error.message);
    }
    process.exit(1);
  }
}

testProfileUpdate();
