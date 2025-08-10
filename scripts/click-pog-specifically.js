#!/usr/bin/env node

const { chromium } = require('@playwright/test');

async function clickPOGSpecifically() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    // Console logging
    page.on('console', msg => {
      const text = msg.text();
      console.log(`🎙️  Console: ${text}`);
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
    
    console.log('🎯 Looking specifically for POG artifacts...');
    
    // Look for POG cards
    const pogCards = await page.$$eval('.MuiPaper-root', (papers) => {
      return papers.map((paper, index) => {
        const text = paper.textContent || '';
        return {
          index,
          text: text.substring(0, 200),
          containsPOG: text.includes('POG'),
          isPogCard: text.includes('POG') && text.length > 50 && 
                    !text.includes('Search') && !text.includes('Filter')
        };
      }).filter(card => card.isPogCard);
    });
    
    console.log(`🎯 Found ${pogCards.length} POG cards:`);
    pogCards.forEach((card, i) => {
      console.log(`  ${i + 1}. [${card.index}] ${card.text.substring(0, 100)}...`);
    });
    
    if (pogCards.length > 0) {
      const targetPog = pogCards[0];
      console.log(`\n👆 Clicking POG card ${targetPog.index}...`);
      
      const allPapers = await page.$$('.MuiPaper-root');
      const targetElement = allPapers[targetPog.index];
      
      if (targetElement) {
        await targetElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await targetElement.click({ force: true });
        console.log('✅ Successfully clicked the POG card!');
      }
    } else {
      console.log('❌ No POG cards found, trying Ask cards...');
      
      const askCards = await page.$$eval('.MuiPaper-root', (papers) => {
        return papers.map((paper, index) => {
          const text = paper.textContent || '';
          return {
            index,
            text: text.substring(0, 200),
            containsAsk: text.includes('Ask'),
            isAskCard: text.includes('Ask') && text.length > 50 && 
                      !text.includes('Search') && !text.includes('Filter')
          };
        }).filter(card => card.isAskCard);
      });
      
      if (askCards.length > 0) {
        const targetAsk = askCards[0];
        console.log(`👆 Clicking Ask card ${targetAsk.index}...`);
        
        const allPapers = await page.$$('.MuiPaper-root');
        const targetElement = allPapers[targetAsk.index];
        
        if (targetElement) {
          await targetElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await targetElement.click({ force: true });
          console.log('✅ Successfully clicked the Ask card!');
        }
      } else {
        console.log('❌ No Ask cards found either');
      }
    }
    
    // Wait for modal
    console.log('⏳ Waiting for modal to appear...');
    await page.waitForTimeout(4000);
    
    const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
    if (modal) {
      console.log('🎉 Modal appeared!');
      
      const modalText = await modal.textContent();
      
      // Check for specific rich modal features
      const hasGradientHeader = modalText.includes('Packet of Generosity') || modalText.includes('Ask');
      const hasExchangeDetails = modalText.includes('Exchange Details') || modalText.includes('Exchange with');
      const hasRelatedActions = modalText.includes('Related Actions');
      const hasCreateAction = modalText.includes('Add Action');
      const hasRichStyling = modalText.includes('Created') || modalText.includes('Owner:');
      
      console.log(`📊 Rich Modal Features Analysis:`);
      console.log(`  ✨ Rich Header (POG/Ask title): ${hasGradientHeader}`);
      console.log(`  🔄 Exchange Details section: ${hasExchangeDetails}`);
      console.log(`  🎯 Related Actions section: ${hasRelatedActions}`);
      console.log(`  ➕ Add Action button: ${hasCreateAction}`);
      console.log(`  💎 Rich styling elements: ${hasRichStyling}`);
      console.log(`  📏 Modal text length: ${modalText.length} chars`);
      
      const isRichModal = hasGradientHeader && (hasRelatedActions || hasExchangeDetails || hasRichStyling);
      
      if (isRichModal) {
        console.log('🎊 SUCCESS: Rich Contact Profile Modal is working!');
      } else {
        console.log('⚠️  Still showing basic modal style');
      }
      
      // Take screenshot
      await page.screenshot({
        path: './rich-modal-test.png',
        fullPage: true
      });
      console.log('📸 Screenshot saved as rich-modal-test.png');
      
    } else {
      console.log('❌ No modal appeared');
    }
    
    // Keep browser open for inspection
    console.log('🔍 Keeping browser open for 20 seconds...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

clickPOGSpecifically().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});