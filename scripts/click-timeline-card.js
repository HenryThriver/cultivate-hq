#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');

async function clickTimelineCard() {
    const browser = await createTestBrowser(chromium, { headless: false });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Modal Data Debug') || 
          text.includes('🔍') ||
          text.includes('artifactId') ||
          text.includes('hasRelatedSuggestions') ||
          text.includes('hasContactFieldSources')) {
        console.log('🔍 Console:', text);
      }
    });
    
    await authenticateTestUser(page);
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`);
    
    // Wait for timeline to load
    await page.waitForTimeout(5000);
    
    console.log('🔍 Analyzing timeline structure...');
    
    // Look for timeline cards with specific characteristics
    const timelineCards = await page.$$eval('.MuiPaper-root', (papers) => {
      return papers.map((paper, index) => {
        const text = paper.textContent || '';
        const hasClickHandler = paper.onclick !== null || 
                               paper.getAttribute('role') === 'button' ||
                               paper.style.cursor === 'pointer' ||
                               paper.classList.contains('clickable');
        
        return {
          index,
          text: text.substring(0, 200),
          hasClickHandler,
          containsPOG: text.includes('POG'),
          containsAsk: text.includes('Ask'),
          containsMeeting: text.includes('Meeting'),
          hasTimestamp: /\d{1,2}:\d{2}|AM|PM|ago|today|yesterday|\d{4}-\d{2}-\d{2}/.test(text),
          length: text.length
        };
      });
    });
    
    console.log(`📊 Found ${timelineCards.length} paper elements:`);
    
    // Find the most likely artifact cards
    const artifactCards = timelineCards.filter(card => 
      (card.containsPOG || card.containsAsk || card.containsMeeting || card.hasTimestamp) &&
      card.length > 50 && // Has substantial content
      !card.text.includes('Search') &&
      !card.text.includes('Filter') &&
      !card.text.includes('View Mode')
    );
    
    console.log(`🎯 Found ${artifactCards.length} potential artifact cards:`);
    artifactCards.forEach((card, i) => {
      console.log(`  ${i + 1}. [${card.index}] POG:${card.containsPOG} Ask:${card.containsAsk} Meeting:${card.containsMeeting} | ${card.text.substring(0, 100)}...`);
    });
    
    if (artifactCards.length > 0) {
      const targetCard = artifactCards[0];
      console.log(`\n👆 Clicking card ${targetCard.index} (first artifact-like card)...`);
      
      // Get the actual element and click it
      const allPapers = await page.$$('.MuiPaper-root');
      const targetElement = allPapers[targetCard.index];
      
      if (targetElement) {
        try {
          // Scroll element into view first
          await targetElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // Try clicking the element
          await targetElement.click({ force: true });
          console.log('✅ Successfully clicked the card!');
          
        } catch (clickError) {
          console.log('❌ Direct click failed, trying alternative approach...');
          
          // Alternative: try clicking child elements that might be clickable
          const clickableChildren = await targetElement.$$('*[role="button"], button, .clickable');
          if (clickableChildren.length > 0) {
            console.log(`Found ${clickableChildren.length} clickable children, trying first one...`);
            await clickableChildren[0].click();
          } else {
            console.log('No clickable children found, using JavaScript click...');
            await page.evaluate((element) => {
              element.click();
            }, targetElement);
          }
        }
      } else {
        console.log('❌ Could not get target element');
      }
    } else {
      console.log('❌ No artifact-like cards found');
    }
    
    // Wait for modal
    console.log('⏳ Waiting for modal to appear...');
    await page.waitForTimeout(3000);
    
    const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
    if (modal) {
      console.log('🎉 Modal appeared!');
      
      const modalText = await modal.textContent();
      const isContactProfileModal = modalText.includes('Packet of Generosity') || 
                                   modalText.includes('Related Actions') ||
                                   modalText.includes('Exchange Details');
      
      const isTimelineModal = modalText.includes('AI-Generated Suggestions') ||
                             modalText.includes('Contact Profile Updates') ||
                             modalText.includes('Artifact Suggestions');
      
      console.log(`📊 Modal type analysis:`);
      console.log(`  - Contact Profile Style Modal: ${isContactProfileModal}`);
      console.log(`  - Timeline Style Modal: ${isTimelineModal}`);
      console.log(`  - Modal text length: ${modalText.length} chars`);
      
      if (isContactProfileModal) {
        console.log('✨ SUCCESS: Contact profile style modal is showing!');
      } else if (isTimelineModal) {
        console.log('⚠️  Timeline style modal is showing (simpler design)');
      } else {
        console.log('❓ Unknown modal type');
      }
      
      // Take screenshot
      await page.screenshot({
        path: './modal-result.png',
        fullPage: true
      });
      console.log('📸 Screenshot saved');
      
    } else {
      console.log('❌ No modal appeared');
    }
    
    // Keep browser open
    console.log('🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

clickTimelineCard().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});