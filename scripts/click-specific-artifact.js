#!/usr/bin/env node

const { chromium } = require('@playwright/test');

async function clickSpecificArtifact() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for visibility
  });
  
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
    
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:3000/auth/login');
    
    await page.waitForTimeout(2000);
    
    try {
      await page.click('button:has-text("Show Dev Login")', { timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('Dev login already visible');
    }
    
    await page.fill('input[type="email"]', 'henry@cultivatehq.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Dev Sign In")');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto('http://localhost:3000/dashboard/contacts/a1111111-89ab-cdef-0123-456789abcdef/timeline');
    
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