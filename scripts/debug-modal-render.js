#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');

async function debugModalRender() {
  const browser = await createTestBrowser(chromium, { headless: false });
  
  try {
    const context = await browser.newContext({
      viewport: TEST_CONFIG.browser.viewport,
    });
    
    const page = await createTestPage(context);
    
    await authenticateTestUser(page);
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`);
    
    await page.waitForTimeout(5000);
    
    console.log('🎯 Looking for any timeline card...');
    
    // Find any artifact card and click it
    const allCards = await page.$$('.MuiPaper-root');
    let targetCard = null;
    
    for (let i = 0; i < allCards.length; i++) {
      const text = await allCards[i].textContent();
      if (text && text.length > 50 && 
          !text.includes('Search') && 
          !text.includes('Filter') &&
          !text.includes('Dashboard')) {
        targetCard = allCards[i];
        console.log(`📋 Found potential artifact at index ${i}: ${text.substring(0, 100)}`);
        break;
      }
    }
    
    if (targetCard) {
      console.log('\n👆 Clicking artifact card...');
      await targetCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await targetCard.click({ force: true });
      
      console.log('⏳ Waiting for modal...');
      await page.waitForTimeout(3000);
      
      // Check what modals are in the DOM
      const modals = await page.$$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
      console.log(`📊 Found ${modals.length} modal(s) in DOM`);
      
      for (let i = 0; i < modals.length; i++) {
        const modal = modals[i];
        const isVisible = await modal.isVisible();
        const modalText = await modal.textContent();
        
        console.log(`\n🔍 Modal ${i + 1}:`);
        console.log(`  - Visible: ${isVisible}`);
        console.log(`  - Text length: ${modalText.length} chars`);
        console.log(`  - Preview: ${modalText.substring(0, 200)}...`);
        
        if (isVisible) {
          // Look for specific elements in the visible modal
          const hasTitle = await modal.$('h6, .MuiTypography-h6');
          const hasButtons = await modal.$$('button');
          const hasIcons = await modal.$$('svg');
          
          console.log(`  - Has title element: ${!!hasTitle}`);
          console.log(`  - Button count: ${hasButtons.length}`);
          console.log(`  - Icon count: ${hasIcons.length}`);
          
          // Check modal component type
          const modalClasses = await modal.getAttribute('class');
          console.log(`  - CSS classes: ${modalClasses}`);
        }
      }
      
    } else {
      console.log('❌ No suitable artifact card found');
    }
    
    console.log('\n🔍 Keeping browser open for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

debugModalRender().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});