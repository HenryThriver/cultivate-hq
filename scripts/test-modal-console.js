#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testModalWithConsole() {
  const outputDir = './screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // Visible browser
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    
    const page = await context.newPage();
    
    // Capture ALL console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const messageText = msg.text();
      const messageType = msg.type();
      consoleMessages.push({ type: messageType, text: messageText, timestamp: new Date().toISOString() });
      
      // Print to our console in real-time
      const emoji = messageType === 'error' ? '❌' : messageType === 'warn' ? '⚠️' : messageType === 'log' ? '📝' : '💬';
      console.log(`${emoji} [${messageType}] ${messageText}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log('💥 Page error:', error.message);
      consoleMessages.push({ type: 'pageerror', text: error.message, timestamp: new Date().toISOString() });
    });
    
    // Capture network requests
    page.on('response', response => {
      if (response.url().includes('artifacts') || response.url().includes('suggestions')) {
        console.log(`🌐 Network: ${response.status()} ${response.url()}`);
      }
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
    console.log('📄 Page loaded, looking for artifacts...');
    
    // Wait for timeline to load
    await page.waitForSelector('[data-testid="enhanced-timeline-item"], .MuiPaper-root', { timeout: 10000 });
    
    // Find artifact cards
    const artifactCards = await page.$$('.MuiPaper-root:has(.MuiTypography-root)');
    
    if (artifactCards.length > 0) {
      console.log(`\n🎯 Found ${artifactCards.length} artifact cards. Testing first few...`);
      
      // Test multiple artifacts to see which ones have enhanced data
      const maxToTest = Math.min(3, artifactCards.length);
      
      for (let i = 0; i < maxToTest; i++) {
        console.log(`\n--- Testing artifact ${i + 1} ---`);
        consoleMessages.length = 0; // Clear previous messages
        
        // Click on artifact
        console.log(`👆 Clicking artifact ${i + 1}...`);
        await artifactCards[i].click();
        
        // Wait for modal and console messages
        await page.waitForTimeout(3000);
        
        // Check if modal appeared
        const modal = await page.$('[role="dialog"], .MuiModal-root, .MuiDialog-root');
        if (modal) {
          console.log('🎉 Modal opened!');
          
          // Look for our debug message specifically
          const debugMessages = consoleMessages.filter(msg => 
            msg.text.includes('Modal Data Debug') || 
            msg.text.includes('hasRelatedSuggestions') ||
            msg.text.includes('hasContactFieldSources')
          );
          
          if (debugMessages.length > 0) {
            console.log('🔍 Debug info found:');
            debugMessages.forEach(msg => {
              console.log(`   ${msg.text}`);
            });
          }
          
          // Check modal content for enhanced features
          const modalText = await modal.textContent();
          const hasAISuggestions = modalText.includes('AI-Generated Suggestions');
          const hasContactUpdates = modalText.includes('Contact Profile Updates');
          const hasArtifactSuggestions = modalText.includes('Artifact Suggestions');
          
          console.log(`📊 Modal content analysis:
   - Has "AI-Generated Suggestions": ${hasAISuggestions}
   - Has "Contact Profile Updates": ${hasContactUpdates} 
   - Has "Artifact Suggestions": ${hasArtifactSuggestions}
   - Modal text length: ${modalText.length} chars`);
          
          // Take screenshot
          await page.screenshot({
            path: path.join(outputDir, `modal-artifact-${i + 1}.png`),
            fullPage: true
          });
          
          // Close modal
          const closeButton = await page.$('[aria-label="close artifact detail"], button:has-text("Close")');
          if (closeButton) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
          
        } else {
          console.log('❌ No modal appeared');
        }
        
        console.log(`--- End artifact ${i + 1} test ---\n`);
      }
      
    } else {
      console.log('❌ No artifact cards found');
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testModalWithConsole().catch(error => {
  process.exit(1);
});