#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');

async function findAndClickPOG() {
    const browser = await createTestBrowser(chromium, { headless: false });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Console logging
    page.on('console', msg => {
      if (msg.text().includes('Modal Data Debug') || 
          msg.text().includes('POG') || 
          msg.text().includes('Ask') ||
          msg.text().includes('🔍')) {
        console.log('🔍', msg.text());
      }
    });
    
    await authenticateTestUser(page);
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`);
    
    // Wait for timeline to load
    await page.waitForTimeout(5000);
    
    console.log('🔍 Looking for timeline items...');
    
    // First, let's see what's actually on the page
    const timelineContent = await page.textContent('body');
    console.log('📄 Page contains POG:', timelineContent.includes('POG'));
    console.log('📄 Page contains Ask:', timelineContent.includes('Ask'));
    console.log('📄 Page contains Meeting:', timelineContent.includes('Meeting'));
    
    // Try to find elements that contain "POG" text
    const pogElements = await page.$$('text=POG');
    console.log(`Found ${pogElements.length} elements containing "POG"`);
    
    if (pogElements.length > 0) {
      console.log('🎯 Clicking first POG element...');
      await pogElements[0].click();
    } else {
      // Try to find elements that contain "Ask" text
      const askElements = await page.$$('text=Ask');
      console.log(`Found ${askElements.length} elements containing "Ask"`);
      
      if (askElements.length > 0) {
        console.log('🎯 Clicking first Ask element...');
        await askElements[0].click();
      } else {
        // Try to find elements that contain "Meeting" text
        const meetingElements = await page.$$('text=Meeting');
        console.log(`Found ${meetingElements.length} elements containing "Meeting"`);
        
        if (meetingElements.length > 0) {
          console.log('🎯 Clicking first Meeting element...');
          await meetingElements[0].click();
        } else {
          // Look for any timeline card that's not a filter/control
          console.log('🔍 Looking for generic timeline cards...');
          const allCards = await page.$$('.MuiPaper-root');
          
          for (let i = 0; i < allCards.length; i++) {
            const cardText = await allCards[i].textContent();
            const cardHtml = await allCards[i].innerHTML();
            
            // Skip cards that are clearly controls/filters
            if (cardText && 
                !cardText.includes('Search') && 
                !cardText.includes('Filter') && 
                !cardText.includes('View Mode') &&
                !cardText.includes('Dashboard') &&
                cardText.length > 50) {
              
              console.log(`📋 Card ${i + 1} text preview:`, cardText.substring(0, 100));
              
              // Check if this looks like an artifact card (has timestamp-like text)
              const hasTimestamp = /\d{1,2}:\d{2}|AM|PM|ago|today|yesterday/i.test(cardText);
              
              if (hasTimestamp) {
                console.log('🎯 This looks like an artifact! Clicking...');
                await allCards[i].click();
                break;
              }
            }
          }
        }
      }
    }
    
    // Wait for modal
    await page.waitForTimeout(3000);
    
    const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
    if (modal) {
      console.log('🎉 Modal appeared!');
      const modalText = await modal.textContent();
      
      console.log('📊 Modal analysis:');
      console.log('  - Contains "Packet of Generosity":', modalText.includes('Packet of Generosity'));
      console.log('  - Contains "Ask":', modalText.includes('Ask'));
      console.log('  - Contains "Meeting":', modalText.includes('Meeting'));
      console.log('  - Contains "AI-Generated Suggestions":', modalText.includes('AI-Generated Suggestions'));
      console.log('  - Contains "Contact Profile Updates":', modalText.includes('Contact Profile Updates'));
      console.log('  - Modal text length:', modalText.length, 'chars');
      
      // Take screenshot
      await page.screenshot({
        path: './modal-screenshot.png',
        fullPage: true
      });
      console.log('📸 Screenshot saved as modal-screenshot.png');
      
    } else {
      console.log('❌ No modal appeared');
    }
    
    // Keep browser open
    console.log('🔍 Browser will stay open for inspection...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

findAndClickPOG().catch(error => {
  process.exit(1);
});