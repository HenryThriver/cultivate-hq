const { chromium } = require('playwright');

async function debugGoalsPage() {
  console.log('🚀 Starting Goals Page Debug Session...\n');
  
  const browser = await chromium.launch({
    headless: false,
    devtools: true,
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.error(`❌ [CONSOLE ERROR] ${text}`);
    } else if (type === 'warning') {
      console.warn(`⚠️  [CONSOLE WARN] ${text}`);
    } else if (type === 'log' && (text.includes('goals') || text.includes('Goals'))) {
      console.log(`📝 [CONSOLE LOG] ${text}`);
    }
  });
  
  // Listen to network failures
  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`🔴 [NETWORK] ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('🔍 Checking current page...');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    // Check if we're on login page
    if (url.includes('/auth/login') || url.includes('/login')) {
      console.log('🔐 On login page, looking for dev login...');
      
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Look for "Show Dev Login" button first
      const showDevButton = page.locator('button:has-text("Show Dev Login")');
      const showDevButtonVisible = await showDevButton.isVisible().catch(() => false);
      
      if (showDevButtonVisible) {
        console.log('📝 Found Show Dev Login button, clicking...');
        await showDevButton.click();
        
        // Wait for form to appear
        await page.waitForTimeout(1000);
        
        // Fill in dev credentials
        console.log('📝 Filling dev credentials...');
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        // Use the database email we found
        await emailInput.fill('henry@cultivatehq.com');
        await passwordInput.fill('password123'); // Common dev password
        
        // Click dev sign in button
        const devSignInButton = page.locator('button:has-text("Dev Sign In")');
        await devSignInButton.click();
        
        // Wait for navigation
        await page.waitForTimeout(3000);
        console.log(`✅ Dev login attempted, now at: ${page.url()}`);
      } else {
        console.log('❌ No Show Dev Login button found');
        
        // Show what buttons are available
        const allButtons = await page.locator('button').allTextContents();
        console.log('Available buttons:', allButtons);
      }
    }
    
    // Navigate to goals page
    console.log('📍 Navigating to goals page...');
    await page.goto('http://localhost:3000/dashboard/goals', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log(`📍 Final URL: ${page.url()}`);
    
    // Check for goals content
    await page.waitForTimeout(3000);
    
    const hasYourGoals = await page.getByText('Your Goals').isVisible().catch(() => false);
    const hasErrorAlert = await page.locator('[role="alert"]').isVisible().catch(() => false);
    const hasGoalTitle = await page.getByText(/series a|funding|career/i).isVisible().catch(() => false);
    
    console.log('\\n📊 Page Analysis:');
    console.log(`   "Your Goals" title: ${hasYourGoals ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Error alert: ${hasErrorAlert ? '❌ Present' : '✅ Not present'}`);
    console.log(`   Goal content: ${hasGoalTitle ? '✅ Found' : '❌ Not found'}`);
    
    if (hasErrorAlert) {
      const errorText = await page.locator('[role="alert"]').textContent();
      console.error(`\\n🚨 ERROR MESSAGE: ${errorText}`);
    }
    
    // Get page content summary
    const h1Text = await page.locator('h1, h2, h3').allTextContents();
    console.log(`\\n📄 Page headings: ${h1Text.join(', ')}`);
    
    // Check for cards
    const cardCount = await page.locator('[class*="MuiCard"], .card, [data-testid*="card"]').count();
    console.log(`📊 Found ${cardCount} card-like elements`);
    
    console.log('\\n👀 Browser will stay open for manual inspection...');
    console.log('Press Ctrl+C when done inspecting');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\\n💥 Error:', error.message);
    
    // Keep browser open even on error for inspection
    console.log('\\n👀 Browser staying open for error inspection...');
    await new Promise(() => {});
  }
}

debugGoalsPage().catch(console.error);