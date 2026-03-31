/**
 * Comprehensive DOM Testing Script for Pharmacy Module
 * Tests all features and verifies theme colors
 * 
 * Usage: Run this in browser console after logging in as pharmacy user
 * Credentials: pharmacy@curevirtual.com / 123456
 */

class PharmacyModuleTester {
  constructor() {
    this.results = {
      features: [],
      themeColors: [],
      errors: [],
      warnings: []
    };
    this.baseUrl = window.location.origin;
  }

  // Utility: Wait for element
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.sleep(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  // Utility: Sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility: Navigate to page
  async navigateTo(path) {
    console.log(`📍 Navigating to: ${path}`);
    window.location.href = `${this.baseUrl}${path}`;
    await this.sleep(2000); // Wait for page load
  }

  // Utility: Check if element exists
  elementExists(selector) {
    return document.querySelector(selector) !== null;
  }

  // Utility: Get computed style
  getComputedColor(element) {
    return window.getComputedStyle(element).color;
  }

  getComputedBackground(element) {
    return window.getComputedStyle(element).backgroundColor;
  }

  // Test 1: Login Page
  async testLogin() {
    console.log('\n🧪 TEST 1: Login Page');
    try {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const loginButton = document.querySelector('button[type="submit"]');

      const tests = [
        { name: 'Email Input', element: emailInput },
        { name: 'Password Input', element: passwordInput },
        { name: 'Login Button', element: loginButton }
      ];

      tests.forEach(test => {
        if (test.element) {
          this.results.features.push({ feature: `Login - ${test.name}`, status: '✅ Working' });
        } else {
          this.results.features.push({ feature: `Login - ${test.name}`, status: '❌ Not Found' });
          this.results.errors.push(`Login ${test.name} not found`);
        }
      });

      // Test login functionality
      if (emailInput && passwordInput && loginButton) {
        emailInput.value = 'pharmacy@curevirtual.com';
        passwordInput.value = '123456';
        console.log('✅ Login form fields populated');
      }
    } catch (error) {
      this.results.errors.push(`Login Test Error: ${error.message}`);
    }
  }

  // Test 2: Dashboard
  async testDashboard() {
    console.log('\n🧪 TEST 2: Dashboard');
    try {
      // Check for dashboard elements
      const dashboardElements = [
        { selector: '[class*="dashboard"]', name: 'Dashboard Container' },
        { selector: 'h1, h2, [class*="title"]', name: 'Dashboard Title' },
        { selector: '[class*="card"], [class*="stat"]', name: 'Statistics Cards' },
        { selector: 'button, a[href*="prescription"]', name: 'Navigation Elements' }
      ];

      dashboardElements.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          this.results.features.push({ feature: `Dashboard - ${name}`, status: '✅ Found' });
          
          // Check colors
          const color = this.getComputedColor(element);
          const bgColor = this.getComputedBackground(element);
          this.results.themeColors.push({
            element: name,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Dashboard - ${name}`, status: '❌ Not Found' });
          this.results.errors.push(`Dashboard ${name} not found`);
        }
      });

      // Check for specific dashboard stats
      const statCards = document.querySelectorAll('[class*="card"], [class*="stat"]');
      console.log(`📊 Found ${statCards.length} stat cards`);
      
      if (statCards.length === 0) {
        this.results.warnings.push('No statistics cards found on dashboard');
      }

    } catch (error) {
      this.results.errors.push(`Dashboard Test Error: ${error.message}`);
    }
  }

  // Test 3: Prescriptions Page
  async testPrescriptions() {
    console.log('\n🧪 TEST 3: Prescriptions Page');
    try {
      const prescriptionElements = [
        { selector: 'table, [class*="table"]', name: 'Prescriptions Table' },
        { selector: 'thead, [class*="header"]', name: 'Table Header' },
        { selector: 'tbody, [class*="body"]', name: 'Table Body' },
        { selector: 'button[class*="add"], button[class*="create"]', name: 'Add/Create Button' },
        { selector: '[class*="search"], input[type="search"]', name: 'Search Input' },
        { selector: 'select, [class*="filter"]', name: 'Filter/Status Dropdown' }
      ];

      prescriptionElements.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          this.results.features.push({ feature: `Prescriptions - ${name}`, status: '✅ Found' });
          
          // Check colors
          const color = this.getComputedColor(element);
          const bgColor = this.getComputedBackground(element);
          this.results.themeColors.push({
            element: `Prescriptions - ${name}`,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Prescriptions - ${name}`, status: '❌ Not Found' });
          this.results.errors.push(`Prescriptions ${name} not found`);
        }
      });

      // Check for action buttons (View, Edit, Delete)
      const actionButtons = document.querySelectorAll('button[class*="view"], button[class*="edit"], button[class*="delete"], svg');
      console.log(`🔘 Found ${actionButtons.length} action buttons/icons`);

      if (actionButtons.length === 0) {
        this.results.warnings.push('No action buttons found in prescriptions table');
      }

      // Check for prescription rows
      const rows = document.querySelectorAll('tbody tr, [class*="row"]');
      console.log(`📋 Found ${rows.length} prescription rows`);

      if (rows.length === 0) {
        this.results.warnings.push('No prescription data found');
      }

    } catch (error) {
      this.results.errors.push(`Prescriptions Test Error: ${error.message}`);
    }
  }

  // Test 4: Profile Page
  async testProfile() {
    console.log('\n🧪 TEST 4: Profile Page');
    try {
      const profileElements = [
        { selector: 'form', name: 'Profile Form' },
        { selector: 'input[name*="name"], input[placeholder*="name"]', name: 'Name Input' },
        { selector: 'input[type="email"]', name: 'Email Input' },
        { selector: 'input[type="tel"], input[name*="phone"]', name: 'Phone Input' },
        { selector: 'textarea, input[name*="address"]', name: 'Address Field' },
        { selector: 'button[type="submit"], button[class*="save"]', name: 'Save Button' }
      ];

      profileElements.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          this.results.features.push({ feature: `Profile - ${name}`, status: '✅ Found' });
          
          // Check colors
          const color = this.getComputedColor(element);
          const bgColor = this.getComputedBackground(element);
          this.results.themeColors.push({
            element: `Profile - ${name}`,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Profile - ${name}`, status: '❌ Not Found' });
          this.results.errors.push(`Profile ${name} not found`);
        }
      });

      // Check if form fields are editable
      const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
      let editableCount = 0;
      inputs.forEach(input => {
        if (!input.disabled && !input.readOnly) {
          editableCount++;
        }
      });

      console.log(`✏️ Found ${editableCount} editable fields`);
      
      if (editableCount === 0) {
        this.results.warnings.push('No editable fields found in profile');
      }

    } catch (error) {
      this.results.errors.push(`Profile Test Error: ${error.message}`);
    }
  }

  // Test 5: Subscription Page
  async testSubscription() {
    console.log('\n🧪 TEST 5: Subscription Page');
    try {
      const subscriptionElements = [
        { selector: '[class*="subscription"], [class*="plan"]', name: 'Subscription Container' },
        { selector: '[class*="card"]', name: 'Plan Cards' },
        { selector: 'button[class*="subscribe"], button[class*="upgrade"]', name: 'Subscribe Buttons' },
        { selector: '[class*="price"], [class*="cost"]', name: 'Pricing Information' },
        { selector: '[class*="feature"], ul, ol', name: 'Feature Lists' }
      ];

      subscriptionElements.forEach(({ selector, name }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          this.results.features.push({ 
            feature: `Subscription - ${name}`, 
            status: `✅ Found (${elements.length})` 
          });
          
          // Check colors of first element
          const color = this.getComputedColor(elements[0]);
          const bgColor = this.getComputedBackground(elements[0]);
          this.results.themeColors.push({
            element: `Subscription - ${name}`,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Subscription - ${name}`, status: '❌ Not Found' });
          this.results.errors.push(`Subscription ${name} not found`);
        }
      });

      // Check for active subscription indicator
      const activeIndicator = document.querySelector('[class*="active"], [class*="current"]');
      if (activeIndicator) {
        console.log('✅ Active subscription indicator found');
      } else {
        this.results.warnings.push('No active subscription indicator found');
      }

    } catch (error) {
      this.results.errors.push(`Subscription Test Error: ${error.message}`);
    }
  }

  // Test 6: Messages/Inbox
  async testMessages() {
    console.log('\n🧪 TEST 6: Messages/Inbox');
    try {
      const messageElements = [
        { selector: '[class*="message"], [class*="inbox"]', name: 'Messages Container' },
        { selector: '[class*="conversation"], [class*="thread"]', name: 'Conversation List' },
        { selector: 'button[class*="compose"], button[class*="new"]', name: 'Compose Button' },
        { selector: 'input[type="search"], [class*="search"]', name: 'Search Messages' },
        { selector: '[class*="message-item"], [class*="thread-item"]', name: 'Message Items' }
      ];

      messageElements.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          this.results.features.push({ feature: `Messages - ${name}`, status: '✅ Found' });
          
          // Check colors
          const color = this.getComputedColor(element);
          const bgColor = this.getComputedBackground(element);
          this.results.themeColors.push({
            element: `Messages - ${name}`,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Messages - ${name}`, status: '❌ Not Found' });
          this.results.errors.push(`Messages ${name} not found`);
        }
      });

      // Check for message count
      const messages = document.querySelectorAll('[class*="message-item"], [class*="thread"]');
      console.log(`💬 Found ${messages.length} messages`);

      if (messages.length === 0) {
        this.results.warnings.push('No messages found in inbox');
      }

    } catch (error) {
      this.results.errors.push(`Messages Test Error: ${error.message}`);
    }
  }

  // Test 7: Navigation/Sidebar
  async testNavigation() {
    console.log('\n🧪 TEST 7: Navigation/Sidebar');
    try {
      const navElements = [
        { selector: 'nav, [class*="sidebar"], [class*="navigation"]', name: 'Navigation Container' },
        { selector: 'a[href*="dashboard"], button[class*="dashboard"]', name: 'Dashboard Link' },
        { selector: 'a[href*="prescription"], button[class*="prescription"]', name: 'Prescriptions Link' },
        { selector: 'a[href*="profile"], button[class*="profile"]', name: 'Profile Link' },
        { selector: 'a[href*="subscription"], button[class*="subscription"]', name: 'Subscription Link' },
        { selector: 'a[href*="message"], button[class*="message"]', name: 'Messages Link' },
        { selector: 'button[class*="logout"], a[href*="logout"]', name: 'Logout Button' }
      ];

      navElements.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          this.results.features.push({ feature: `Navigation - ${name}`, status: '✅ Found' });
          
          // Check colors
          const color = this.getComputedColor(element);
          const bgColor = this.getComputedBackground(element);
          this.results.themeColors.push({
            element: `Navigation - ${name}`,
            textColor: color,
            backgroundColor: bgColor
          });
        } else {
          this.results.features.push({ feature: `Navigation - ${name}`, status: '❌ Not Found' });
          this.results.warnings.push(`Navigation ${name} not found`);
        }
      });

    } catch (error) {
      this.results.errors.push(`Navigation Test Error: ${error.message}`);
    }
  }

  // Test 8: Theme Colors Analysis
  async testThemeColors() {
    console.log('\n🧪 TEST 8: Theme Colors Analysis');
    try {
      // Get all text elements
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, td, th');
      
      const colorMap = new Map();
      const bgColorMap = new Map();

      textElements.forEach(element => {
        const color = this.getComputedColor(element);
        const bgColor = this.getComputedBackground(element);
        
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
        bgColorMap.set(bgColor, (bgColorMap.get(bgColor) || 0) + 1);
      });

      console.log('\n📊 Text Color Distribution:');
      const sortedColors = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
      sortedColors.slice(0, 10).forEach(([color, count]) => {
        console.log(`  ${color}: ${count} elements`);
        this.results.themeColors.push({
          type: 'Text Color',
          color: color,
          count: count
        });
      });

      console.log('\n📊 Background Color Distribution:');
      const sortedBgColors = Array.from(bgColorMap.entries()).sort((a, b) => b[1] - a[1]);
      sortedBgColors.slice(0, 10).forEach(([color, count]) => {
        console.log(`  ${color}: ${count} elements`);
        this.results.themeColors.push({
          type: 'Background Color',
          color: color,
          count: count
        });
      });

      // Check for light mode issues
      const bodyBg = this.getComputedBackground(document.body);
      const isDarkMode = this.isColorDark(bodyBg);
      
      console.log(`\n🎨 Current Theme: ${isDarkMode ? 'Dark Mode' : 'Light Mode'}`);
      console.log(`   Body Background: ${bodyBg}`);

      // Check for contrast issues
      textElements.forEach(element => {
        const textColor = this.getComputedColor(element);
        const bgColor = this.getComputedBackground(element);
        
        if (!this.hasGoodContrast(textColor, bgColor)) {
          this.results.warnings.push(
            `Low contrast: ${element.tagName} with text ${textColor} on background ${bgColor}`
          );
        }
      });

    } catch (error) {
      this.results.errors.push(`Theme Colors Test Error: ${error.message}`);
    }
  }

  // Utility: Check if color is dark
  isColorDark(color) {
    // Parse RGB color
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return brightness < 128;
  }

  // Utility: Check contrast
  hasGoodContrast(textColor, bgColor) {
    // Simple contrast check - can be improved
    const textRgb = textColor.match(/\d+/g);
    const bgRgb = bgColor.match(/\d+/g);
    
    if (!textRgb || !bgRgb || textRgb.length < 3 || bgRgb.length < 3) return true;
    
    const textBrightness = (parseInt(textRgb[0]) * 299 + parseInt(textRgb[1]) * 587 + parseInt(textRgb[2]) * 114) / 1000;
    const bgBrightness = (parseInt(bgRgb[0]) * 299 + parseInt(bgRgb[1]) * 587 + parseInt(bgRgb[2]) * 114) / 1000;
    
    return Math.abs(textBrightness - bgBrightness) > 125;
  }

  // Test 9: Interactive Elements
  async testInteractiveElements() {
    console.log('\n🧪 TEST 9: Interactive Elements');
    try {
      const buttons = document.querySelectorAll('button:not([disabled])');
      const links = document.querySelectorAll('a[href]');
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([disabled])');
      const selects = document.querySelectorAll('select:not([disabled])');

      console.log(`🔘 Interactive Elements Found:`);
      console.log(`   Buttons: ${buttons.length}`);
      console.log(`   Links: ${links.length}`);
      console.log(`   Inputs: ${inputs.length}`);
      console.log(`   Selects: ${selects.length}`);

      this.results.features.push({ 
        feature: 'Interactive Elements', 
        status: `✅ Found (${buttons.length + links.length + inputs.length + selects.length} total)` 
      });

      // Test if buttons have click handlers
      let buttonsWithHandlers = 0;
      buttons.forEach(button => {
        const hasOnClick = button.onclick !== null;
        const hasEventListener = button.getAttribute('onclick') !== null;
        if (hasOnClick || hasEventListener) {
          buttonsWithHandlers++;
        }
      });

      console.log(`   Buttons with handlers: ${buttonsWithHandlers}/${buttons.length}`);

      if (buttonsWithHandlers === 0 && buttons.length > 0) {
        this.results.warnings.push('Buttons found but no click handlers detected');
      }

    } catch (error) {
      this.results.errors.push(`Interactive Elements Test Error: ${error.message}`);
    }
  }

  // Test 10: API Calls Check
  async testAPIConnections() {
    console.log('\n🧪 TEST 10: API Connections');
    try {
      // Monitor network requests
      const originalFetch = window.fetch;
      const apiCalls = [];

      window.fetch = function(...args) {
        apiCalls.push({
          url: args[0],
          method: args[1]?.method || 'GET',
          timestamp: new Date().toISOString()
        });
        return originalFetch.apply(this, args);
      };

      console.log('📡 Monitoring API calls for 5 seconds...');
      await this.sleep(5000);

      window.fetch = originalFetch;

      console.log(`\n📊 API Calls Made: ${apiCalls.length}`);
      apiCalls.forEach(call => {
        console.log(`   ${call.method} ${call.url}`);
      });

      this.results.features.push({ 
        feature: 'API Connections', 
        status: `✅ ${apiCalls.length} calls detected` 
      });

      if (apiCalls.length === 0) {
        this.results.warnings.push('No API calls detected - data may not be loading');
      }

    } catch (error) {
      this.results.errors.push(`API Connections Test Error: ${error.message}`);
    }
  }

  // Generate Report
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 PHARMACY MODULE TEST REPORT');
    console.log('='.repeat(80));

    console.log('\n✅ FEATURES TEST RESULTS:');
    console.log('-'.repeat(80));
    this.results.features.forEach(({ feature, status }) => {
      console.log(`${status.padEnd(15)} ${feature}`);
    });

    console.log('\n🎨 THEME COLORS:');
    console.log('-'.repeat(80));
    const uniqueColors = new Map();
    this.results.themeColors.forEach(item => {
      if (item.type) {
        const key = `${item.type}: ${item.color}`;
        uniqueColors.set(key, item.count);
      }
    });
    uniqueColors.forEach((count, colorInfo) => {
      console.log(`${colorInfo} (${count} elements)`);
    });

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      console.log('-'.repeat(80));
      this.results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      console.log('-'.repeat(80));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Tests Passed: ${this.results.features.filter(f => f.status.includes('✅')).length}`);
    console.log(`❌ Tests Failed: ${this.results.features.filter(f => f.status.includes('❌')).length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    console.log('='.repeat(80));

    return this.results;
  }

  // Run all tests on current page
  async runCurrentPageTests() {
    console.log('🚀 Starting Pharmacy Module Tests on Current Page...\n');
    
    const currentPath = window.location.pathname;
    console.log(`📍 Current Page: ${currentPath}`);

    // Run tests based on current page
    if (currentPath.includes('login')) {
      await this.testLogin();
    } else if (currentPath.includes('dashboard')) {
      await this.testDashboard();
    } else if (currentPath.includes('prescription')) {
      await this.testPrescriptions();
    } else if (currentPath.includes('profile')) {
      await this.testProfile();
    } else if (currentPath.includes('subscription')) {
      await this.testSubscription();
    } else if (currentPath.includes('message') || currentPath.includes('inbox')) {
      await this.testMessages();
    }

    // Always run these tests
    await this.testNavigation();
    await this.testThemeColors();
    await this.testInteractiveElements();
    await this.testAPIConnections();

    return this.generateReport();
  }
}

// Auto-run when script is loaded
console.log('🔧 Pharmacy Module Tester Loaded!');
console.log('📝 Usage:');
console.log('   const tester = new PharmacyModuleTester();');
console.log('   await tester.runCurrentPageTests();');
console.log('\n🚀 Auto-running tests in 2 seconds...\n');

setTimeout(async () => {
  const tester = new PharmacyModuleTester();
  const results = await tester.runCurrentPageTests();
  
  // Make results available globally
  window.pharmacyTestResults = results;
  console.log('\n💾 Results saved to: window.pharmacyTestResults');
}, 2000);
