const axios = require('axios');
const prisma = require('./prisma/prismaClient');

const BASE_URL = 'http://localhost:5001/api';

async function testProfileUpdate() {
  try {
    console.log('--- STARTING PROFILE UPDATE TEST ---');

    // 1. Create a Test User
    const email = `test_patient_${Date.now()}@example.com`;
    const password = 'password123';
    
    console.log(`1. Registering user: ${email}`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'OriginalFirst',
      lastName: 'OriginalLast',
      email,
      password,
      role: 'PATIENT',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      phone: '1234567890'
    });
    
    // Auto-login (register usually doesn't return full token in some flows, so explicit login)
    console.log('2. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log(`   Logged in as User ID: ${userId}`);

    // 2. Update Profile with NEW Name and Phone
    console.log('3. Updating Profile (Changing Name & Phone)...');
    const updateData = {
        userId,
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        phone: '9876543210', // Changed
        height: 180,
        weight: 75,
        bloodGroup: 'O+'
    };

    const updateRes = await axios.put(`${BASE_URL}/patient/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
    });

    console.log('   Update Response Data:', updateRes.data.data.user);

    // 3. Verify Persistence in DB
    console.log('4. Verifying DB Persistence...');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const dbProfile = await prisma.patientProfile.findUnique({ where: { userId } });

    console.log('   DB User:', { 
        firstName: dbUser.firstName, 
        lastName: dbUser.lastName, 
        phone: dbUser.phone 
    });
    console.log('   DB Profile:', { 
        height: dbProfile.height, 
        weight: dbProfile.weight 
    });

    if (dbUser.firstName === 'UpdatedFirst' && dbUser.phone === '9876543210' && dbProfile.height === 180) {
        console.log('✅ TEST PASSED: Profile updated successfully across both tables!');
    } else {
        console.error('❌ TEST FAILED: Data mismatch.');
    }

  } catch (error) {
    console.error('❌ TEST FAILED with Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testProfileUpdate();
