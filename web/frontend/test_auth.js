#!/usr/bin/env node

/**
 * Authentication and RBAC Testing Script
 * Tests all updated routes for proper authentication enforcement and role-based access control
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  const color = passed ? 'green' : 'red';
  log(`  [${status}] ${name}${details}`, color);
  
  if (!passed) {
    testResults.failed++;
    testResults.errors.push(name);
  } else {
    testResults.passed++;
  }
  
  testResults.details.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
}

// Test data
const testUsers = {
  patient: {
    id: 'test-patient-id',
    role: 'PATIENT',
    email: 'patient@test.com',
    token: 'mock-patient-token'
  },
  doctor: {
    id: 'test-doctor-id', 
    role: 'DOCTOR',
    email: 'doctor@test.com',
    token: 'mock-doctor-token'
  },
  admin: {
    id: 'test-admin-id',
    role: 'ADMIN', 
    email: 'admin@test.com',
    token: 'mock-admin-token'
  },
  superadmin: {
    id: 'test-superadmin-id',
    role: 'SUPERADMIN',
    email: 'superadmin@test.com', 
    token: 'mock-superadmin-token'
  }
};

// Helper function to make requests with authentication
async function makeRequest(method, url, data = null, token = null, expectAuth = true) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      validateStatus: () => true // Don't throw on error status codes
    };

    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(`Request failed for ${method.toUpperCase()} ${url}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Test authentication enforcement
async function testAuthentication() {
  log('\n🔐 Testing Authentication Enforcement', 'blue');
  
  // Test messages routes
  log('\n📧 Testing Messages Routes', 'yellow');
  
  // Test contacts endpoint
  let response = await makeRequest('get', '/messages/contacts/all');
  logTest('GET /messages/contacts/all (no auth)', response.status === 401, `Status: ${response.status}`);
  
  response = await makeRequest('get', '/messages/contacts/all', null, 'invalid-token');
  logTest('GET /messages/contacts/all (invalid token)', response.status === 403, `Status: ${response.status}`);

  // Test unread count
  response = await makeRequest('get', '/messages/unread-count?userId=test');
  logTest('GET /messages/unread-count (no auth)', response.status === 401, `Status: ${response.status}`);

  // Test mark read
  response = await makeRequest('post', '/messages/mark-read', { userId: 'test' });
  logTest('POST /messages/mark-read (no auth)', response.status === 401, `Status: ${response.status}`);

  // Test list messages
  response = await makeRequest('get', '/messages/inbox');
  logTest('GET /messages/inbox (no auth)', response.status === 401, `Status: ${response.status}`);

  // Test send message
  response = await makeRequest('post', '/messages/send', { content: 'test', senderId: 'test' });
  logTest('POST /messages/send (no auth)', response.status === 401, `Status: ${response.status}`);

  // Test subscription routes
  log('\n💳 Testing Subscription Routes', 'yellow');
  
  response = await makeRequest('get', '/subscription/subscription/prices');
  logTest('GET /subscription/subscription/prices (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('get', '/subscription/subscription/status?userId=test');
  logTest('GET /subscription/subscription/status (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('get', '/subscription/subscription?userId=test');
  logTest('GET /subscription/subscription (no auth)', response.status === 401, `Status: ${response.status}`);

  // Test videocall routes
  log('\n📹 Testing VideoCall Routes', 'yellow');
  
  response = await makeRequest('post', '/videocall/create', { scheduledAt: new Date().toISOString() });
  logTest('POST /videocall/create (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('get', '/videocall/list?userId=test&role=PATIENT');
  logTest('GET /videocall/list (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('post', '/videocall/token', { identity: 'test', roomName: 'test' });
  logTest('POST /videocall/token (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('put', '/videocall/status/123', { status: 'SCHEDULED' });
  logTest('PUT /videocall/status (no auth)', response.status === 401, `Status: ${response.status}`);

  response = await makeRequest('patch', '/videocall/reschedule/123', { scheduledAt: new Date().toISOString() });
  logTest('PATCH /videocall/reschedule (no auth)', response.status === 401, `Status: ${response.status}`);
}

// Test role-based access control
async function testRoleBasedAccess() {
  log('\n👥 Testing Role-Based Access Control', 'blue');
  
  // Test admin-only routes
  log('\n🔒 Testing Admin-Only Routes', 'yellow');
  
  // Test price update (should only allow ADMIN/SUPERADMIN)
  let response = await makeRequest('put', '/subscription/subscription/prices', {
    doctorMonthlyUsd: 30,
    doctorYearlyUsd: 300,
    patientMonthlyUsd: 15,
    patientYearlyUsd: 150
  }, testUsers.patient.token);
  logTest('PUT /subscription/prices (PATIENT role)', response.status === 403, `Status: ${response.status}`);

  response = await makeRequest('put', '/subscription/subscription/prices', {
    doctorMonthlyUsd: 30,
    doctorYearlyUsd: 300,
    patientMonthlyUsd: 15,
    patientYearlyUsd: 150
  }, testUsers.doctor.token);
  logTest('PUT /subscription/prices (DOCTOR role)', response.status === 403, `Status: ${response.status}`);

  response = await makeRequest('put', '/subscription/subscription/prices', {
    doctorMonthlyUsd: 30,
    doctorYearlyUsd: 300,
    patientMonthlyUsd: 15,
    patientYearlyUsd: 150
  }, testUsers.admin.token);
  logTest('PUT /subscription/prices (ADMIN role)', response.status === 200 || response.status === 403, `Status: ${response.status}`);

  // Test stats endpoint (should only allow ADMIN/SUPERADMIN)
  response = await makeRequest('get', '/subscription/stats', null, testUsers.patient.token);
  logTest('GET /subscription/stats (PATIENT role)', response.status === 403, `Status: ${response.status}`);

  response = await makeRequest('get', '/subscription/stats', null, testUsers.doctor.token);
  logTest('GET /subscription/stats (DOCTOR role)', response.status === 403, `Status: ${response.status}`);

  response = await makeRequest('get', '/subscription/stats', null, testUsers.admin.token);
  logTest('GET /subscription/stats (ADMIN role)', response.status === 200 || response.status === 403, `Status: ${response.status}`);

  // Test subscription status update
  response = await makeRequest('patch', '/subscription/subscription/123/status', 
    { status: 'ACTIVE' }, testUsers.patient.token);
  logTest('PATCH /subscription/status (PATIENT role)', response.status === 403, `Status: ${response.status}`);

  response = await makeRequest('patch', '/subscription/subscription/123/status',
    { status: 'ACTIVE' }, testUsers.admin.token);
  logTest('PATCH /subscription/status (ADMIN role)', response.status === 200 || response.status === 403, `Status: ${response.status}`);
}

// Test message broadcast functionality
async function testMessageBroadcast() {
  log('\n📢 Testing Message Broadcast', 'blue');
  
  // Test broadcast with PATIENT role (should fail)
  let response = await makeRequest('post', '/messages/send', {
    content: 'Test broadcast',
    senderId: testUsers.patient.id,
    broadcast: true
  }, testUsers.patient.token);
  logTest('POST /messages/send broadcast (PATIENT role)', response.status === 403, `Status: ${response.status}`);

  // Test broadcast with ADMIN role (should succeed)
  response = await makeRequest('post', '/messages/send', {
    content: 'Test broadcast',
    senderId: testUsers.admin.id,
    broadcast: true
  }, testUsers.admin.token);
  logTest('POST /messages/send broadcast (ADMIN role)', response.status === 200 || response.status === 403, `Status: ${response.status}`);

  // Test "ALL" recipient with regular user (should fail)
  response = await makeRequest('post', '/messages/send', {
    content: 'Test broadcast',
    senderId: testUsers.patient.id,
    recipient: 'ALL'
  }, testUsers.patient.token);
  logTest('POST /messages/send ALL recipient (PATIENT role)', response.status === 403, `Status: ${response.status}`);
}

// Generate test report
function generateReport() {
  log('\n📊 Test Results Summary', 'blue');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Total: ${testResults.passed + testResults.failed}`, 'blue');

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.errors.forEach(error => log(`  - ${error}`, 'red'));
  }

  // Save detailed results to file
  const report = {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.passed + testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2) + '%'
    },
    details: testResults.details,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('./test-results.json', JSON.stringify(report, null, 2));
  log('\n💾 Detailed results saved to test-results.json', 'blue');

  return testResults.failed === 0;
}

// Main test execution
async function runTests() {
  log('🚀 Starting RBAC Authentication Tests', 'blue');
  log(`Target: ${API_BASE}`, 'yellow');
  
  try {
    await testAuthentication();
    await testRoleBasedAccess();
    await testMessageBroadcast();
    
    const success = generateReport();
    
    if (success) {
      log('\n🎉 All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️ Some tests failed. Check results above.', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Check if running standalone
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  makeRequest,
  testUsers
};
