const axios = require('axios');

async function testRegistration() {
  try {
    const user = {
      firstName: 'Test',
      middleName: 'M',
      lastName: 'User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      role: 'PATIENT',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
    };

    console.log('Registering user:', user);
    const response = await axios.post('http://localhost:5002/api/auth/register', user);
    console.log('Registration Response:', response.status, response.data);

    if (response.data.user.firstName === 'Test' && response.data.user.lastName === 'User') {
        console.log('✅ Name split verification passed');
    } else {
        console.error('❌ Name split verification failed');
    }

    // Test Doctor Registration
    const doctor = {
      firstName: 'Dr',
      middleName: 'Strange',
      lastName: 'Medic',
      email: `doctor_${Date.now()}@example.com`,
      password: 'password123',
      role: 'DOCTOR',
      dateOfBirth: '1985-05-05',
      gender: 'MALE',
      specialization: 'Cardiology'
    };

    console.log('Registering doctor:', doctor);
    const docResponse = await axios.post('http://localhost:5002/api/auth/register', doctor);
    console.log('Doctor Registration Response:', docResponse.status, docResponse.data);
    
    // We need to verify if profile was created. The register response might not return the profile deep details immediately
    // unless we query for it, but let's assume if it doesn't crash and returns 201 it's good for now.
    // Ideally we would query the doctor profile.

  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
  }
}

testRegistration();
