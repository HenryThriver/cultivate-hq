const { chromium } = require('playwright');

async function testGoalsPage() {
  console.log('🚀 Starting Goals Page Test...\n');
  
  // Launch browser with devtools to see console
  const browser = await chromium.launch({
    headless: false,
    devtools: true,
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    consoleMessages.push({ type, text, location });
    
    // Color code by type
    if (type === 'error') {
      console.error(`❌ [ERROR] ${text}`);
      if (location.url) {
        console.error(`   at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
      }
    } else if (type === 'warning') {
      console.warn(`⚠️  [WARN] ${text}`);
    } else if (type === 'log') {
      console.log(`📝 [LOG] ${text}`);
    }
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.error(`\n🔴 PAGE ERROR:`, error.message);
    console.error(error.stack);
  });
  
  // Listen to request failures
  page.on('requestfailed', request => {
    console.error(`\n🔴 REQUEST FAILED: ${request.method()} ${request.url()}`);
    console.error(`   Failure: ${request.failure()?.errorText}`);
  });
  
  // Listen to responses for API errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`\n⚠️  HTTP ${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3001/auth/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('🔐 Logging in with dev credentials...');
    
    // Fill in login form
    await page.fill('input[name="email"]', 'dev@cultivatehq.com');
    await page.fill('input[name="password"]', 'devpassword123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    console.log('⏳ Waiting for dashboard...');
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    
    console.log('✅ Login successful!\n');
    
    // Navigate to goals page
    console.log('📍 Navigating to goals page...');
    await page.goto('http://localhost:3001/dashboard/goals', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for goals content...\n');
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(3000);
    
    // Check if error message is visible
    const errorAlert = await page.locator('[role="alert"]').first();
    const hasError = await errorAlert.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await errorAlert.textContent();
      console.error(`\n🚨 ERROR ALERT VISIBLE ON PAGE: ${errorText}\n`);
    }
    
    // Check for goals content
    const goalsExist = await page.locator('[data-testid="goal-card"], h1:has-text("Goals"), h1:has-text("Your Goals")').first().isVisible().catch(() => false);
    
    if (goalsExist) {
      console.log('✅ Goals page loaded successfully!');
      
      // Count goals
      const goalCards = await page.locator('[class*="MuiCard"]').count();
      console.log(`📊 Found ${goalCards} card elements on page`);
    } else {
      console.error('❌ Goals content not found on page');
    }
    
    // Try to get network logs for failed API calls
    console.log('\n📡 Checking for failed API calls...');
    
    // Execute some diagnostic JavaScript in the browser
    const diagnostics = await page.evaluate(() => {
      const diag = {
        localStorage: {},
        sessionStorage: {},
        cookies: document.cookie,
        apiErrors: []
      };
      
      // Get storage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase')) {
          diag.localStorage[key] = localStorage.getItem(key)?.substring(0, 50) + '...';
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('supabase')) {
          diag.sessionStorage[key] = sessionStorage.getItem(key)?.substring(0, 50) + '...';
        }
      }
      
      return diag;
    });
    
    console.log('\n🔍 Diagnostics:');
    console.log('   LocalStorage keys:', Object.keys(diagnostics.localStorage));
    console.log('   SessionStorage keys:', Object.keys(diagnostics.sessionStorage));
    console.log('   Cookies present:', diagnostics.cookies ? 'Yes' : 'No');
    
    // Summary
    console.log('\n📊 Console Message Summary:');
    const errorCount = consoleMessages.filter(m => m.type === 'error').length;
    const warnCount = consoleMessages.filter(m => m.type === 'warning').length;
    const logCount = consoleMessages.filter(m => m.type === 'log').length;
    
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Warnings: ${warnCount}`);
    console.log(`   Logs: ${logCount}`);
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORS FOUND - Review the console output above for details');
    }
    
    // Keep browser open for inspection
    console.log('\n👀 Browser will stay open for inspection. Press Ctrl+C to exit.');
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    await browser.close();
    process.exit(1);
  }
}

// Run the test
testGoalsPage().catch(console.error);