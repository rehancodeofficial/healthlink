// test_registration_new.js
// Tests the /api/auth/register endpoint
// After the fix: expects a 201 with a "check your email" message (NOT auto-confirmed)

const https = require("https");

const BASE_URL = process.env.API_URL || "https://curevirtual-2-production-ee33.up.railway.app";

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(BASE_URL + path);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("🔵 Testing /api/auth/register ...\n");

  // --- Test 1: Missing email/password ---
  const t1 = await post("/api/auth/register", {});
  console.assert(t1.status === 400, `❌ Test 1 failed: expected 400, got ${t1.status}`);
  console.log(`✅ Test 1 (missing fields): ${t1.status} — ${t1.body.error}`);

  // --- Test 2: Valid registration with NIC ---
  const uniqueEmail = `testuser_${Date.now()}@mailtest.dev`;
  const t2 = await post("/api/auth/register", {
    email: uniqueEmail,
    password: "TestPass123!",
    firstName: "Test",
    lastName: "User",
    nic: "1234567890123",         // 13-digit Pakistani NIC
    role: "PATIENT",
    dateOfBirth: "2000-01-01",
    gender: "MALE",
  });

  console.log(`\n✅ Test 2 (valid registration):`);
  console.log(`   Status: ${t2.status}`);
  console.log(`   Message: ${t2.body?.message}`);
  console.log(`   User ID: ${t2.body?.user?.id}`);
  console.log(`   NIC stored: ${t2.body?.user?.nic}`);
  console.log(`   Token present: ${!!t2.body?.token}`);

  if (t2.status === 201) {
    // ✅ Verify the message changed — should mention "check your email"
    const msg = (t2.body?.message || "").toLowerCase();
    if (msg.includes("check your email") || msg.includes("confirm")) {
      console.log("   ✅ Email confirmation message present — fix confirmed!");
    } else {
      console.warn("   ⚠️  Message doesn't mention email confirmation — check the backend.");
    }

    // ✅ Verify NIC was stored
    if (t2.body?.user?.nic === "1234567890123") {
      console.log("   ✅ NIC stored correctly.");
    } else {
      console.warn(`   ⚠️  NIC mismatch: ${t2.body?.user?.nic}`);
    }
  } else {
    console.error(`   ❌ Registration failed: ${JSON.stringify(t2.body)}`);
  }

  // --- Test 3: Duplicate registration ---
  if (t2.status === 201) {
    const t3 = await post("/api/auth/register", {
      email: uniqueEmail,   // same email
      password: "TestPass123!",
      firstName: "Dupe",
      lastName: "User",
      nic: "9876543210987",
    });
    console.log(`\n✅ Test 3 (duplicate email):`);
    console.log(`   Status: ${t3.status}`);
    console.log(`   Error: ${t3.body?.error}`);
    if (t3.status === 400) {
      console.log("   ✅ Duplicate correctly rejected.");
    }
  }

  console.log("\n✅ All tests complete.");
}

run().catch((err) => {
  console.error("❌ Test runner error:", err.message);
  process.exit(1);
});
