#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');
const path = require('path');
const fs = require('fs');

async function clickArtifact() {
  const outputDir = './screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

    const browser = await createTestBrowser(chromium, { headless: false }); // Run with browser visible
  
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
    
    await authenticateTestUser(page);
    
    console.log('✅ Authentication successful');
    
    // Navigate to timeline
    console.log('📍 Navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`, {
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