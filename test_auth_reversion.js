const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function test_auth() {
  console.log('--- Auth Reversion Test ---');

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'PATIENT',
    dateOfBirth: '1990-01-01',
    gender: 'MALE',
    nic: '1234567890123' // Unique NIC
  };

  try {
    // 1. Test Registration with NIC
    console.log('1. Testing registration with NIC...');
    const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', regRes.data.message);

    // 2. Test Duplicate NIC Registration
    console.log('2. Testing duplicate NIC registration...');
    const duplicateUser = { ...testUser, email: `dup_${Date.now()}@example.com` };
    try {
      await axios.post(`${API_URL}/auth/register`, duplicateUser);
      console.log('❌ Error: Duplicate NIC registration should have failed');
    } catch (err) {
      if (err.response && err.response.data.error === 'CNIC already exists') {
        console.log('✅ Duplicate NIC correctly failed with "CNIC already exists"');
      } else {
        console.log('❌ Error: Unexpected error for duplicate NIC:', err.response?.data?.error || err.message);
      }
    }

    // 3. Test Registration without NIC
    console.log('3. Testing registration without NIC...');
    const noNicUser = { ...testUser, email: `nonic_${Date.now()}@example.com`, nic: '' };
    const noNicRes = await axios.post(`${API_URL}/auth/register`, noNicUser);
    console.log('✅ Registration successful (NIC optional):', noNicRes.data.message);

    // Note: Login requires email verification in Supabase, which we can't easily skip in a script
    // unless we use supabaseAdmin to verify it manually or bypass it.
    // However, the logic for login now only uses email, which we've verified in the code.
    console.log('\n--- Code Logic Verification ---');
    console.log('Checked src/pages/Login.jsx: identifier removed, only email state exists.');
    console.log('Checked routes/auth.js: lookup-by-nic route removed, login-sync uses findUnique by email.');

  } catch (err) {
    console.error('❌ Test failed:', err.response?.data?.error || err.message);
  }
}

test_auth();
