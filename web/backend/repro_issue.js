const axios = require('axios');
const prisma = require('./prisma/prismaClient');

const BASE_URL = 'https://curevirtual-2-production-ee33.up.railway.app/api';

async function reproduceIssue() {
  try {
    console.log('--- STARTING REPRODUCTION TEST ---');

    // 1. Create a Test User
    const email = `repro_patient_${Date.now()}@example.com`;
    const password = 'password123';
    
    console.log(`1. Registering user: ${email}`);
    await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Repro',
      lastName: 'Patient',
      email,
      password,
      role: 'PATIENT',
      dateOfBirth: '1990-01-01',
      gender: 'MALE'
    });
    
    console.log('2. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login-sync`, {
      email,
      // No supabaseAccessToken needed for mock login if skip verification is possible
      // But wait, the backend might require a real token.
      // Let's check how login-sync works.
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log(`   Logged in as User ID: ${userId}`);

    // 3. Try to book an appointment immediately
    console.log('3. Attempting to book an appointment...');
    try {
      const bookRes = await axios.post(`${BASE_URL}/schedule/book`, {
        doctorId: 'some-doctor-id', // We need a real doctor ID here
        patientId: userId,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Test repro'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   Book Response:', bookRes.data);
    } catch (err) {
      console.error('   ❌ Booking failed as expected:', err.response?.data || err.message);
      if (err.response?.data?.error === 'Patient profile not found') {
        console.log('✅ REPRODUCTION SUCCESSFUL: Found the "Patient profile not found" error.');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

reproduceIssue();
