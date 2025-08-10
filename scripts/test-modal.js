#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testModal() {
  const outputDir = './screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    
    const page = await context.newPage();
    
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:3000/auth/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    try {
      await page.click('button:has-text("Show Dev Login")', { timeout: 5000 });
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('Dev login already visible');
    }
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'henry@cultivatehq.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Dev Sign In")', { timeout: 5000 });
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    console.log('✅ Authentication successful');
    
    // Navigate to timeline
    console.log('📍 Navigating to timeline...');
    await page.goto('http://localhost:3000/dashboard/contacts/a1111111-89ab-cdef-0123-456789abcdef/timeline', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot of timeline
    console.log('📸 Taking timeline screenshot...');
    await page.screenshot({
      path: path.join(outputDir, 'timeline-before-modal.png'),
      fullPage: true
    });
    
    console.log('🔍 Looking for artifact to click...');
    // Look for any artifact item to click
    const artifactItems = await page.$$('[data-testid="artifact-item"], .MuiCard-root, [role="button"]');
    
    if (artifactItems.length === 0) {
      console.log('⚠️ No artifact items found, looking for any clickable timeline items...');
      // Try to find timeline items by a more general approach
      await page.waitForSelector('[data-timeline-item], .timeline-item, .artifact', { timeout: 10000 });
      const timelineItems = await page.$$('[data-timeline-item], .timeline-item, .artifact');
      if (timelineItems.length > 0) {
        console.log(`Found ${timelineItems.length} timeline items, clicking first one...`);
        await timelineItems[0].click();
      }
    } else {
      console.log(`Found ${artifactItems.length} artifact items, clicking first one...`);
      await artifactItems[0].click();
    }
    
    // Wait for modal to appear
    console.log('⏳ Waiting for modal to open...');
    try {
      await page.waitForSelector('[role="dialog"], .MuiModal-root, .MuiDialog-root', { timeout: 5000 });
      await page.waitForTimeout(1000); // Let modal fully render
      
      console.log('🎉 Modal opened! Taking screenshot...');
      await page.screenshot({
        path: path.join(outputDir, 'timeline-with-modal.png'),
        fullPage: true
      });
      
      console.log('✅ Modal test completed successfully');
    } catch (e) {
      console.log('⚠️ No modal appeared, taking final screenshot anyway...');
      await page.screenshot({
        path: path.join(outputDir, 'timeline-no-modal.png'),
        fullPage: true
      });
    }
    
  } catch (error) {
    console.error('❌ Error during modal test:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testModal().catch(error => {
  process.exit(1);
});