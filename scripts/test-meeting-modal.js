#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { TEST_CONFIG, authenticateTestUser, createTestBrowser, createTestPage } = require('./test-config');

async function testMeetingModal() {
    const browser = await createTestBrowser(chromium, { headless: false });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    
    const page = await context.newPage();
    
    await authenticateTestUser(page);
    
    console.log('✅ Authenticated, navigating to timeline...');
    await page.goto(`${TEST_CONFIG.urls.base}${TEST_CONFIG.urls.timelinePath}`);
    
    await page.waitForTimeout(5000);
    
    console.log('🎯 Looking specifically for Meeting artifacts...');
    
    // Look for meeting cards
    const meetingCards = await page.$$eval('.MuiPaper-root', (papers) => {
      return papers.map((paper, index) => {
        const text = paper.textContent || '';
        return {
          index,
          text: text.substring(0, 200),
          containsMeeting: text.includes('Meeting'),
          isMeetingCard: text.includes('Meeting') && text.length > 50 && 
                        !text.includes('Search') && !text.includes('Filter')
        };
      }).filter(card => card.isMeetingCard);
    });
    
    console.log(`🎯 Found ${meetingCards.length} Meeting cards:`);
    meetingCards.forEach((card, i) => {
      console.log(`  ${i + 1}. [${card.index}] ${card.text.substring(0, 100)}...`);
    });
    
    if (meetingCards.length > 0) {
      const targetMeeting = meetingCards[0];
      console.log(`\n👆 Clicking Meeting card ${targetMeeting.index}...`);
      
      const allPapers = await page.$$('.MuiPaper-root');
      const targetElement = allPapers[targetMeeting.index];
      
      if (targetElement) {
        await targetElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await targetElement.click({ force: true });
        console.log('✅ Successfully clicked the Meeting card!');
      }
      
      // Wait for modal
      console.log('⏳ Waiting for modal to appear...');
      await page.waitForTimeout(4000);
      
      const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
      if (modal) {
        console.log('🎉 Meeting modal appeared!');
        
        const modalText = await modal.textContent();
        
        // Check for meeting-specific features
        const hasMeetingTitle = modalText.includes('Meeting');
        const hasAddContentButton = modalText.includes('Add Content');
        const hasUploadIcon = await modal.$('svg[data-testid="CloudUploadIcon"]');
        const hasNotes = modalText.includes('notes') || modalText.includes('Notes');
        const hasTranscript = modalText.includes('transcript') || modalText.includes('Transcript');
        const hasRecording = modalText.includes('recording') || modalText.includes('Recording');
        
        console.log(`📊 Meeting Modal Features:`);
        console.log(`  📝 Meeting Title: ${hasMeetingTitle}`);
        console.log(`  ⬆️  Add Content Button: ${hasAddContentButton}`);
        console.log(`  ☁️  Upload Icon Present: ${!!hasUploadIcon}`);
        console.log(`  📄 Contains Notes: ${hasNotes}`);
        console.log(`  📋 Contains Transcript: ${hasTranscript}`);
        console.log(`  🎤 Contains Recording: ${hasRecording}`);
        console.log(`  📏 Modal text length: ${modalText.length} chars`);
        
        // Test clicking Add Content button if it exists
        if (hasAddContentButton) {
          console.log('\n🎯 Testing Add Content button...');
          const addContentButton = await modal.$('button:has-text("Add Content")');
          if (addContentButton) {
            console.log('👆 Clicking Add Content button...');
            await addContentButton.click();
            await page.waitForTimeout(2000);
            
            // Check if upload modal appeared
            const uploadModal = await page.$('[role="dialog"]:has-text("Add Meeting Content")');
            if (uploadModal) {
              console.log('🎊 SUCCESS: Meeting Content Upload modal appeared!');
              
              // Check tabs
              const hasTabs = await uploadModal.$('div[role="tablist"]');
              const hasNotesTab = await uploadModal.$('*:has-text("Notes")');
              const hasTranscriptTab = await uploadModal.$('*:has-text("Transcript")');
              const hasRecordingTab = await uploadModal.$('*:has-text("Recording")');
              
              console.log(`📋 Upload Modal Features:`);
              console.log(`  🏷️  Has Tabs: ${!!hasTabs}`);
              console.log(`  📝 Notes Tab: ${!!hasNotesTab}`);
              console.log(`  📋 Transcript Tab: ${!!hasTranscriptTab}`);
              console.log(`  🎤 Recording Tab: ${!!hasRecordingTab}`);
              
              // Close upload modal
              const closeUploadButton = await uploadModal.$('button:has-text("Cancel")');
              if (closeUploadButton) {
                await closeUploadButton.click();
                await page.waitForTimeout(1000);
              }
            } else {
              console.log('❌ Meeting Content Upload modal did not appear');
            }
          } else {
            console.log('❌ Add Content button not clickable');
          }
        }
        
        // Take screenshot
        await page.screenshot({
          path: './meeting-modal-test.png',
          fullPage: true
        });
        console.log('📸 Screenshot saved as meeting-modal-test.png');
        
      } else {
        console.log('❌ No modal appeared for meeting');
      }
    } else {
      console.log('❌ No Meeting cards found');
    }
    
    // Keep browser open for inspection
    console.log('🔍 Keeping browser open for 15 seconds...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testMeetingModal().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});