const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api`;

// Console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

// Credentials from ACCESS_DETAILS.txt
const CREDENTIALS = [
  { role: 'SUPERADMIN', email: 'superadmin@curevirtual.com', password: 'password123' }, // Try 'password123' or '123456' - file said 123456
  { role: 'ADMIN', email: 'admin@curevirtual.com', password: 'password123' },
  { role: 'SUPPORT', email: 'support@curevirtual.com', password: 'password123' },
  { role: 'PATIENT', email: 'patient1@curevirtual.com', password: 'password123' },
  { role: 'DOCTOR', email: 'doctor1@curevirtual.com', password: 'password123' },
  { role: 'PHARMACY', email: 'pharmacy@curevirtual.com', password: 'password123' }
];

const DEFAULT_PASSWORD = '123456'; 

// Helper to decode JWT without a library (for ID extraction)
const parseJwt = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (e) {
    return null;
  }
};

async function login(email, password) {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    return null;
  }
}

async function runTests() {
  log(`Starting System-Wide Module Tests against ${API_BASE}\n`, 'cyan');

  let results = [];

  for (const user of CREDENTIALS) {
    log(`Testing ${user.role} Module (${user.email})...`, 'blue');
    
    // 1. Authenticate
    let authData = await login(user.email, DEFAULT_PASSWORD);
    if (!authData) {
      log(`  ⚠️ Login failed with default password. Trying fallback...`, 'yellow');
      authData = await login(user.email, 'password123'); // Fallback just in case
    }

    if (!authData || !authData.token) {
        log(`  ❌ Login Failed for ${user.role}`, 'red');
        results.push({ role: user.role, status: 'Obtain Token', success: false });
        continue;
    }

    const token = authData.token;
    const decoded = parseJwt(token);
    const userId = decoded?.id || authData.user?.id;
    
    log(`  ✅ Login Success (ID: ${userId})`, 'green');

    const headers = { Authorization: `Bearer ${token}` };
    const checkEndpoint = async (name, url) => {
      try {
        const res = await axios.get(`${API_BASE}${url}`, { headers, validateStatus: () => true });
        const success = res.status >= 200 && res.status < 300;
        const statusColor = success ? 'green' : 'red';
        log(`    [${res.status}] ${name}: ${url}`, statusColor);
        if (!success) {
            log(`      Error: ${JSON.stringify(res.data)}`, 'red');
        }
        results.push({ role: user.role, endpoint: name, success, status: res.status });
      } catch (err) {
        log(`    [ERR] ${name}: ${url} - ${err.message}`, 'red');
        results.push({ role: user.role, endpoint: name, success: false, error: err.message });
      }
    };

    // 2. Role-Specific Tests
    switch (user.role) {
      case 'SUPERADMIN':
        await checkEndpoint('Stats', '/superadmin/stats');
        await checkEndpoint('Settings', '/superadmin/settings');
        await checkEndpoint('Admins List', '/superadmin/admins');
        break;
      case 'ADMIN':
        await checkEndpoint('Dashboard', '/admin/dashboard');
        await checkEndpoint('Users List', '/admin/users');
        break;
      case 'DOCTOR':
        await checkEndpoint('Stats', '/doctor/stats');
        await checkEndpoint('Profile', '/doctor/profile');
        await checkEndpoint('Appointments', '/doctor/appointments');
        break;
      case 'PATIENT':
        await checkEndpoint('Profile', '/patient/profile');
        await checkEndpoint('Stats', '/patient/stats'); // May not exist, check output
        await checkEndpoint('Appointments', '/patient/appointments');
        break;
      case 'PHARMACY':
        await checkEndpoint('Stats', '/pharmacy/stats');
        await checkEndpoint('Profile', '/pharmacy/profile');
        break;
      case 'SUPPORT':
        await checkEndpoint('My Tickets', `/support/tickets/my?userId=${userId}`);
        await checkEndpoint('All Tickets', '/support/tickets');
        break;
    }
    
    log('');
  }

  // Summary
  log('Test Summary:', 'cyan');
  const failures = results.filter(r => !r.success);
  if (failures.length === 0) {
    log('🎉 All modules passed sanity checks!', 'green');
    process.exit(0);
  } else {
    log(`⚠️ Data: ${failures.length} checks failed.`, 'red');
    failures.forEach(f => log(`  - [${f.role}] ${f.endpoint}: Failed (${f.status || f.error})`, 'red'));
    process.exit(1);
  }
}

runTests();
