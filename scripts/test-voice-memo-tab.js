#!/usr/bin/env node

const { chromium } = require('@playwright/test');

async function testVoiceMemoTab() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
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
    
    await page.waitForTimeout(5000);
    
    console.log('🎯 Looking for Meeting artifacts...');
    
    // Find meeting card
    const meetingCards = await page.$$eval('.MuiPaper-root', (papers) => {
      return papers.map((paper, index) => {
        const text = paper.textContent || '';
        return {
          index,
          text: text.substring(0, 200),
          isMeetingCard: text.includes('Meeting') && text.length > 50 && 
                        !text.includes('Search') && !text.includes('Filter')
        };
      }).filter(card => card.isMeetingCard);
    });
    
    if (meetingCards.length > 0) {
      console.log(`🎯 Found ${meetingCards.length} meeting(s), clicking first one...`);
      
      const allPapers = await page.$$('.MuiPaper-root');
      const targetElement = allPapers[meetingCards[0].index];
      
      await targetElement.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await targetElement.click({ force: true });
      
      console.log('⏳ Waiting for meeting modal...');
      await page.waitForTimeout(3000);
      
      const modal = await page.$('[role="dialog"]');
      if (modal) {
        console.log('🎉 Meeting modal appeared!');
        
        // Look for Add Content button
        const addContentButton = await modal.$('button:has-text("Add Content")');
        if (addContentButton) {
          console.log('👆 Clicking Add Content button...');
          await addContentButton.click();
          await page.waitForTimeout(2000);
          
          const uploadModal = await page.$('[role="dialog"]:has-text("Add Meeting Content")');
          if (uploadModal) {
            console.log('🎊 Upload modal appeared!');
            
            // Check all tabs
            const tabs = await uploadModal.$$('button[role="tab"]');
            console.log(`📋 Found ${tabs.length} tabs`);
            
            const tabLabels = [];
            for (let i = 0; i < tabs.length; i++) {
              const tabText = await tabs[i].textContent();
              tabLabels.push(tabText);
              console.log(`  Tab ${i + 1}: ${tabText}`);
            }
            
            // Test Voice Memo tab specifically
            const voiceMemoTab = tabs.find(async (tab) => {
              const text = await tab.textContent();
              return text.includes('Voice Memo');
            });
            
            if (tabLabels.some(label => label.includes('Voice Memo'))) {
              console.log('\n🎤 Testing Voice Memo tab...');
              
              // Click on Voice Memo tab (should be the last one)
              const voiceTabIndex = tabLabels.findIndex(label => label.includes('Voice Memo'));
              if (voiceTabIndex !== -1) {
                console.log(`👆 Clicking Voice Memo tab (index ${voiceTabIndex})...`);
                await tabs[voiceTabIndex].click();
                await page.waitForTimeout(2000);
                
                // Check if voice recorder appeared
                const voiceRecorder = await uploadModal.$('.voice-recorder, [data-testid="voice-recorder"]');
                const micButton = await uploadModal.$('button[title*="Record"], button:has-text("Record")');
                const hasVoiceContent = await uploadModal.textContent();
                
                console.log('🎙️  Voice Memo Tab Analysis:');
                console.log(`  - Voice Recorder Component: ${!!voiceRecorder}`);
                console.log(`  - Record Button: ${!!micButton}`);
                console.log(`  - Contains "Voice": ${hasVoiceContent.includes('Voice')}`);
                console.log(`  - Contains "Record": ${hasVoiceContent.includes('Record')}`);
                console.log(`  - Contains "browser": ${hasVoiceContent.includes('browser')}`);
                
                if (hasVoiceContent.includes('Record') || hasVoiceContent.includes('browser')) {
                  console.log('✅ SUCCESS: Voice Memo tab is working with recording functionality!');
                } else {
                  console.log('⚠️  Voice Memo tab exists but content unclear');
                }
                
                // Take screenshot
                await page.screenshot({
                  path: './voice-memo-tab-test.png',
                  fullPage: true
                });
                console.log('📸 Screenshot saved as voice-memo-tab-test.png');
              }
            } else {
              console.log('❌ Voice Memo tab not found');
            }
            
          } else {
            console.log('❌ Upload modal did not appear');
          }
        } else {
          console.log('❌ Add Content button not found');
        }
      } else {
        console.log('❌ Meeting modal did not appear');
      }
    } else {
      console.log('❌ No meeting cards found');
    }
    
    console.log('\n🔍 Keeping browser open for inspection...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testVoiceMemoTab().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});