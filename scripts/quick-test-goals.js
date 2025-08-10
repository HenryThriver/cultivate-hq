const { chromium } = require('playwright');

async function quickTestGoals() {
  console.log('🧪 Quick Goals Page Test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`❌ [CONSOLE ERROR] ${msg.text()}`);
    } else if (msg.type() === 'log' && msg.text().includes('Fetching contacts')) {
      console.log(`📡 ${msg.text()}`);
    }
  });
  
  try {
    // Go to homepage first
    await page.goto('http://localhost:3000');
    console.log('📍 Homepage loaded');
    
    // Try to navigate to goals (should redirect to login)
    await page.goto('http://localhost:3000/dashboard/goals');
    
    const finalUrl = page.url();
    console.log(`🎯 Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/auth/login')) {
      console.log('✅ Goals page correctly redirects to login (authentication working)');
    } else if (finalUrl.includes('/dashboard/goals')) {
      console.log('✅ Goals page accessible (user authenticated)');
      
      // Check for goals content
      const hasGoalsTitle = await page.getByText('Your Goals').isVisible().catch(() => false);
      const hasError = await page.locator('[role=\"alert\"]').isVisible().catch(() => false);
      
      console.log(`   Goals title present: ${hasGoalsTitle ? '✅' : '❌'}`);
      console.log(`   Error alert present: ${hasError ? '❌' : '✅'}`);
      
      if (hasError) {
        const errorText = await page.locator('[role=\"alert\"]').textContent();
        console.log(`   Error message: ${errorText}`);
      }
    }
    
    // Wait a bit to see console logs
    await page.waitForTimeout(2000);
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
  
  await browser.close();
}

quickTestGoals().catch(console.error);