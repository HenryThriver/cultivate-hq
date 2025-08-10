#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function clickArtifact() {
  const outputDir = './screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // Run with browser visible
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    
    const page = await context.newPage();
    
    // Enable console logging to see any JS errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page error:', error.message);
    });
    
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
    
    console.log('🔍 Looking for artifact cards...');
    
    // Wait for timeline to load and look for artifact cards
    await page.waitForSelector('[data-testid="enhanced-timeline-item"], .MuiPaper-root', { timeout: 10000 });
    
    // Find artifact cards - they should be Paper components with content
    const artifactCards = await page.$$('.MuiPaper-root:has(.MuiTypography-root)');
    
    if (artifactCards.length > 0) {
      console.log(`Found ${artifactCards.length} potential artifact cards`);
      
      // Take screenshot before clicking
      await page.screenshot({
        path: path.join(outputDir, 'before-click.png'),
        fullPage: true
      });
      
      console.log('👆 Clicking on first artifact card...');
      await artifactCards[0].click();
      
      // Wait a bit for modal to appear
      await page.waitForTimeout(2000);
      
      // Check if modal appeared
      const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
      if (modal) {
        console.log('🎉 Modal found! Taking screenshot...');
        await page.screenshot({
          path: path.join(outputDir, 'with-modal.png'),
          fullPage: true
        });
        
        // Check modal content
        const modalContent = await modal.textContent();
        console.log('Modal content preview:', modalContent.substring(0, 200) + '...');
        
      } else {
        console.log('⚠️ No modal appeared after clicking');
        await page.screenshot({
          path: path.join(outputDir, 'after-click-no-modal.png'),
          fullPage: true
        });
      }
      
    } else {
      console.log('❌ No artifact cards found');
      await page.screenshot({
        path: path.join(outputDir, 'no-artifacts.png'),
        fullPage: true
      });
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

clickArtifact().catch(error => {
  process.exit(1);
});