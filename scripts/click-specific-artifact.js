#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');

async function clickSpecificArtifact() {
    const browser = await createTestBrowser(chromium, { headless: false });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Console logging
    page.on('console', msg => {
      if (msg.text().includes('Modal Data Debug')) {
        console.log('🔍', msg.text());
      }
    });
    
    await authenticateTestUser(page);
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`);
    
    // Wait for timeline to load
    await page.waitForTimeout(5000);
    
    console.log('🎯 Looking for timeline artifacts...');
    
    // Look for timeline items more specifically
    const timelineItems = await page.$$('[data-testid="enhanced-timeline-item"]');
    
    if (timelineItems.length > 0) {
      console.log(`Found ${timelineItems.length} timeline items with data-testid`);
      console.log('👆 Clicking first timeline item...');
      await timelineItems[0].click();
    } else {
      // Fallback: look for cards in the timeline area
      console.log('No data-testid items found, looking for cards...');
      const cards = await page.$$('.MuiPaper-root');
      const timelineCards = [];
      
      for (let card of cards) {
        const text = await card.textContent();
        // Look for cards that contain typical artifact content
        if (text && (text.includes('Meeting') || text.includes('POG') || text.includes('Voice') || text.includes('Email') || text.length > 100)) {
          timelineCards.push(card);
        }
      }
      
      if (timelineCards.length > 0) {
        console.log(`Found ${timelineCards.length} potential timeline cards`);
        console.log('👆 Clicking first timeline card...');
        await timelineCards[0].click();
      } else {
        console.log('❌ No timeline artifacts found');
      }
    }
    
    // Wait for modal
    await page.waitForTimeout(3000);
    
    const modal = await page.$('[role="dialog"], .MuiModal-root');
    if (modal) {
      console.log('🎉 Modal appeared!');
      const modalText = await modal.textContent();
      console.log('📝 Modal contains:', modalText.substring(0, 200) + '...');
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

clickSpecificArtifact().catch(error => {
  process.exit(1);
});