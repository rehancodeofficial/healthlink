const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'rehan.dev1514@gmail.com';
const PASSWORD = '123123';

async function testProfileUpdate() {
  try {
    console.log('=== STEP 1: LOGIN ===');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log('✅ Login successful');
    console.log('Token:', token);
    console.log('User ID:', userId);
    console.log('Role:', loginRes.data.user.role);
    console.log('User:', loginRes.data.user);
    
    // Set up axios with token
    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n=== STEP 2: FETCH PROFILE ===');
    const profileRes = await api.get('/patient/profile', {
      params: { userId }
    });
    
    console.log('✅ Profile fetched successfully');
    console.log('Profile structure:', JSON.stringify(profileRes.data, null, 2));
    
    const profile = profileRes.data.data;
    console.log('\n=== PROFILE FIELDS ===');
    console.log('profile.userId:', profile.userId);
    console.log('profile.user?.id:', profile.user?.id);
    console.log('profile.bloodGroup:', profile.bloodGroup);
    console.log('profile.dateOfBirth:', profile.dateOfBirth);
    console.log('profile.user?.dateOfBirth:', profile.user?.dateOfBirth);
    console.log('profile.gender:', profile.gender);
    console.log('profile.user?.gender:', profile.user?.gender);
    
    console.log('\n=== STEP 3: ATTEMPT PROFILE UPDATE ===');
    const updatePayload = {
      userId: profile.userId,  // This is the critical field
      bloodGroup: profile.bloodGroup || 'UNKNOWN',
      height: profile.height || 0,
      weight: profile.weight || 0,
      allergies: profile.allergies || '',
      medications: profile.medications || '',
      medicalHistory: profile.medicalHistory || '',
      address: profile.address || '',
      emergencyContact: profile.emergencyContact || '',
      medicalRecordNumber: profile.medicalRecordNumber || '',
      insuranceProvider: profile.insuranceProvider || '',
      insuranceMemberId: profile.insuranceMemberId || '',
      dateOfBirth: profile.user?.dateOfBirth || profile.dateOfBirth,
      gender: profile.user?.gender || profile.gender
    };
    
    console.log('Update payload:', JSON.stringify(updatePayload, null, 2));
    
    const updateRes = await api.put('/patient/profile', updatePayload);
    
    console.log('✅ Profile updated successfully!');
    console.log('Response:', JSON.stringify(updateRes.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error message:', error.response.data);
      console.error('Full response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testProfileUpdate();
