#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of test script files to update
const testFiles = [
  'test-meeting-modal.js',
  'click-pog-specifically.js',
  'click-timeline-card.js',
  'find-and-click-pog.js',
  'click-specific-artifact.js',
  'test-modal-console.js',
  'click-artifact.js',
  'screenshot.js',
  'create-dev-user.js'
];

const scriptsDir = path.join(__dirname);

// Template for the updated authentication section
const authTemplate = `
    await authenticateTestUser(page);
`;

// Template for the updated imports
const importsTemplate = `const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');`;

// Template for browser creation
const browserTemplate = `  const browser = await createTestBrowser(chromium, { headless: false });`;

function updateTestFile(filename) {
  const filePath = path.join(scriptsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already updated
  if (content.includes('test-config')) {
    console.log(`✅ ${filename} already updated`);
    return;
  }
  
  // Update imports
  content = content.replace(
    /const { chromium } = require\('@playwright\/test'\);/,
    importsTemplate
  );
  
  // Update browser launch
  content = content.replace(
    /const browser = await chromium\.launch\(\s*{[^}]*}\s*\);/,
    browserTemplate
  );
  
  // Update browser launch (simpler version)
  content = content.replace(
    /await chromium\.launch\(\s*{[^}]*}\s*\)/,
    'await createTestBrowser(chromium, { headless: false })'
  );
  
  // Update page creation
  content = content.replace(
    /const page = await context\.newPage\(\);[\s\S]*?console\.log\('💥 Page error:', error\.message\);\s*}\);/,
    'const page = await createTestPage(context);'
  );
  
  // Remove hardcoded authentication and replace with helper
  const authPattern = /console\.log\('🔐 [^']*'\);[\s\S]*?await page\.waitForURL\('\*\*\/dashboard\*\*', \{ timeout: \d+ \}\);/;
  content = content.replace(authPattern, authTemplate.trim());
  
  // Update hardcoded URLs
  content = content.replace(
    /'http:\/\/localhost:3000\/auth\/login'/g,
    '`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.loginPath}`'
  );
  
  content = content.replace(
    /'http:\/\/localhost:3000\/dashboard[^']*'/g,
    '`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`'
  );
  
  // Remove hardcoded credentials
  content = content.replace(/henry@cultivatehq\.com/g, '${TEST_CONFIG.auth.email}');
  content = content.replace(/password123/g, '${TEST_CONFIG.auth.password}');
  
  // Fix any remaining template strings that got corrupted
  content = content.replace(/'\$\{([^}]+)\}'/g, '`${$1}`');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${filename}`);
}

console.log('🔧 Updating test scripts to use centralized configuration...\n');

testFiles.forEach(updateTestFile);

console.log('\n✅ All test scripts updated!');
console.log('\n📝 Usage:');
console.log('  Default: node script-name.js');
console.log('  Custom:  TEST_USER_EMAIL=user@test.com TEST_USER_PASSWORD=secure123 node script-name.js');