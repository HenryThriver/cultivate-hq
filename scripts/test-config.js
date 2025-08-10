#!/usr/bin/env node

/**
 * Test Configuration for Development Scripts
 * 
 * This file centralizes test credentials and configuration to avoid hardcoding
 * sensitive information throughout test scripts.
 */

const TEST_CONFIG = {
  // Test user credentials - use environment variables in production
  auth: {
    email: process.env.TEST_USER_EMAIL || 'henry@cultivatehq.com',
    password: process.env.TEST_USER_PASSWORD || 'password123',
  },
  
  // Test URLs and endpoints
  urls: {
    base: process.env.BASE_URL || 'http://localhost:3000',
    loginPath: '/auth/login',
    dashboardPath: '/dashboard',
    timelinePath: '/dashboard/contacts/a1111111-89ab-cdef-0123-456789abcdef/timeline',
  },
  
  // Test data
  testData: {
    contactId: 'a1111111-89ab-cdef-0123-456789abcdef',
  },
  
  // Browser configuration
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 300,
    viewport: {
      width: 1440,
      height: 900,
    },
    timeout: 15000,
  },
};

/**
 * Common authentication helper for test scripts
 */
async function authenticateTestUser(page) {
  console.log('🔐 Authenticating test user...');
  
  await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.loginPath}`);
  await page.waitForTimeout(2000);
  
  try {
    await page.click('button:has-text("Show Dev Login")', { timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Dev login already visible');
  }
  
  await page.fill('input[type="email"]', TEST_CONFIG.auth.email);
  await page.fill('input[type="password"]', TEST_CONFIG.auth.password);
  await page.click('button:has-text("Dev Sign In")');
  await page.waitForURL('**/dashboard**', { timeout: TEST_CONFIG.browser.timeout });
  
  console.log('✅ Authentication successful');
}

/**
 * Common browser setup for test scripts
 */
async function createTestBrowser(chromium, options = {}) {
  return await chromium.launch({ 
    headless: options.headless ?? TEST_CONFIG.browser.headless,
    slowMo: options.slowMo ?? TEST_CONFIG.browser.slowMo,
    ...options
  });
}

/**
 * Common page setup with error handling
 */
async function createTestPage(context) {
  const page = await context.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    console.log(`🎙️  [${msg.type()}] ${msg.text()}`);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 Page error:', error.message);
  });
  
  return page;
}

// Export configuration and helpers
module.exports = {
  TEST_CONFIG,
  authenticateTestUser,
  createTestBrowser,
  createTestPage,
};

// Also provide environment variable documentation
if (require.main === module) {
  console.log('Test Configuration Environment Variables:');
  console.log('======================================');
  console.log('TEST_USER_EMAIL     - Test user email (default: henry@cultivatehq.com)');
  console.log('TEST_USER_PASSWORD  - Test user password (default: password123)');
  console.log('BASE_URL            - Base application URL (default: http://localhost:3000)');
  console.log('HEADLESS            - Run browser in headless mode (default: true)');
  console.log('SLOW_MO             - Browser slow motion delay in ms (default: 300)');
  console.log('');
  console.log('Example usage:');
  console.log('TEST_USER_EMAIL=user@example.com TEST_USER_PASSWORD=secure123 node script.js');
}