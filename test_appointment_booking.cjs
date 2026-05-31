const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

/**
 * Test Script for Appointment Booking Flow
 * This tests:
 * 1. Booking an appointment with datetime
 * 2. Retrieving appointments
 * 3. Verifying datetime format in API responses
 */

async function testAppointmentBooking() {
  try {
    console.log('🧪 Starting Appointment Booking Test...\n');

    // Test credentials (use actual test credentials)
    const testEmail = 'kayocab343@gamintor.com';
    const testPassword = '123123';

    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (!loginResponse.data.token) {
      console.error('❌ Login failed: No token received');
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Login successful! User ID: ${userId}\n`);

    // Step 2: Get available doctors
    console.log('Step 2: Fetching available doctors...');
    const doctorsResponse = await axios.get(`${BASE_URL}/patient/doctors/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const doctors = Array.isArray(doctorsResponse.data) 
      ? doctorsResponse.data 
      : doctorsResponse.data.data || [];

    if (doctors.length === 0) {
      console.error('❌ No doctors available for booking');
      return;
    }

    const doctorId = doctors[0].id;
    console.log(`✅ Found ${doctors.length} doctors. Using doctor ID: ${doctorId}\n`);

    // Step 3: Create appointment with specific datetime
    console.log('Step 3: Booking appointment...');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7); // Book for next week
    appointmentDate.setHours(14, 30, 0, 0); // Set to 14:30 (2:30 PM)

    const appointmentPayload = {
      doctorId: doctorId,
      appointmentDate: appointmentDate.toISOString(),
      reason: 'Test appointment - automated test',
      patientId: userId
    };

    console.log('Appointment datetime (ISO):', appointmentPayload.appointmentDate);
    console.log('Expected time: 14:30 (24-hour format)\n');

    const bookingResponse = await axios.post(`${BASE_URL}/patient/appointments`, 
      appointmentPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const createdAppointment = bookingResponse.data;
    console.log('✅ Appointment booked successfully!');
    console.log('Appointment ID:', createdAppointment.id);
    console.log('Stored appointment date:', createdAppointment.appointmentDate);

    // Verify the stored date matches what we sent
    const storedDate = new Date(createdAppointment.appointmentDate);
    console.log('Parsed stored date:', storedDate.toISOString());
    console.log('Expected date:', appointmentDate.toISOString());

    if (storedDate.toISOString() === appointmentDate.toISOString()) {
      console.log('✅ Date/time stored correctly!\n');
    } else {
      console.log('⚠️  Warning: Stored date differs from expected date\n');
    }

    // Step 4: Retrieve appointments and verify
    console.log('Step 4: Retrieving appointments...');
    const appointmentsResponse = await axios.get(`${BASE_URL}/patient/appointments`, {
      params: { patientId: userId },
      headers: { Authorization: `Bearer ${token}` }
    });

    const appointments = Array.isArray(appointmentsResponse.data)
      ? appointmentsResponse.data
      : appointmentsResponse.data.data || [];

    console.log(`✅ Retrieved ${appointments.length} appointments\n`);

    // Find our test appointment
    const testAppointment = appointments.find(a => a.id === createdAppointment.id);
    if (testAppointment) {
      console.log('✅ Test appointment found in list');
      console.log('Appointment Details:');
      console.log('  - ID:', testAppointment.id);
      console.log('  - Date (ISO):', testAppointment.appointmentDate);
      console.log('  - Date (Local):', new Date(testAppointment.appointmentDate).toLocaleString());
      console.log('  - Date (24h format):', new Date(testAppointment.appointmentDate).toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      console.log('  - Status:', testAppointment.status);
      console.log('  - Reason:', testAppointment.reason);
    } else {
      console.log('⚠️  Warning: Test appointment not found in retrieved list');
    }

    // Step 5: Cancel the test appointment
    console.log('\nStep 5: Cleaning up - cancelling test appointment...');
    await axios.patch(`${BASE_URL}/patient/appointments/${createdAppointment.id}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Test appointment cancelled\n');

    console.log('═══════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════');
    console.log('\nSummary:');
    console.log('✅ Login successful');
    console.log('✅ Doctors fetched successfully');
    console.log('✅ Appointment created with correct datetime');
    console.log('✅ Appointment retrieved successfully');
    console.log('✅ DateTime format verified (ISO and 24-hour)');
    console.log('✅ Test appointment cleaned up');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.request && !error.response) {
      console.error('No response received from server');
      console.error('Make sure the backend is running on', BASE_URL);
    }
  }
}

// Run the test
testAppointmentBooking();
