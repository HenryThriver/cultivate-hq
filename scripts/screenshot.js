#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function takeScreenshot(url, options = {}) {
  const {
    fullPage = true,
    width = 1440,
    height = 900,
    waitFor = 'networkidle',
    outputDir = './screenshots',
    filename = null,
    useDevAuth = true // Default to using dev authentication
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const outputFilename = filename || `screenshot_${sanitizedUrl}_${timestamp}.png`;
  const outputPath = path.join(outputDir, outputFilename);

  console.log(`📸 Taking screenshot of: ${url}`);
  console.log(`   Viewport: ${width}x${height}`);
  console.log(`   Full page: ${fullPage}`);
  console.log(`   Output: ${outputPath}`);

  const browser = await chromium.launch();
  
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2, // For retina displays
    });
    
    const page = await context.newPage();
    
    // Handle dev authentication if needed
    if (useDevAuth && url.includes('localhost')) {
      console.log(`   Using dev authentication...`);
      
      // First go to the login page
      await page.goto('http://localhost:3000/auth/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait a bit for page to load
      await page.waitForTimeout(2000);
      
      // Click the "Show Dev Login" button to reveal dev form
      try {
        await page.click('button:has-text("Show Dev Login")', { timeout: 5000 });
        console.log('   Clicked Show Dev Login button');
        await page.waitForTimeout(1500); // Wait for form to expand
      } catch (e) {
        console.log('   Show Dev Login button not found, trying to continue...');
      }
      
      // Wait for email input to be visible and fill it
      try {
        await page.waitForSelector('input[label="Email"], input[type="email"]', { timeout: 10000 });
        
        // Fill in credentials - use the default dev credentials from login page
        await page.fill('input[type="email"]', 'henry@cultivatehq.com');
        await page.fill('input[type="password"]', 'password123');
        
        console.log('   Filled in credentials');
        
        // Click the Dev Sign In button
        await page.click('button:has-text("Dev Sign In")', { timeout: 5000 });
        console.log('   Clicked Dev Sign In button');
        
        // Wait for navigation to complete
        await page.waitForURL('**/dashboard**', { timeout: 15000 });
        console.log(`   Authentication successful, navigating to target URL...`);
        
      } catch (e) {
        console.log('   Authentication failed, but continuing to target URL...');
      }
    }
    
    // Navigate to the actual URL
    console.log(`   Navigating to ${url}...`);
    await page.goto(url, { 
      waitUntil: waitFor,
      timeout: 30000 
    });
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(2000);
    
    // Take the screenshot
    console.log(`   Capturing screenshot...`);
    await page.screenshot({
      path: outputPath,
      fullPage: fullPage
    });
    
    console.log(`✅ Screenshot saved to: ${outputPath}`);
    
    // Return the path for potential further use
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📸 Screenshot Utility

Usage: npm run screenshot <url> [options]
   or: node scripts/screenshot.js <url> [options]

Options:
  --width=<number>     Viewport width (default: 1440)
  --height=<number>    Viewport height (default: 900)
  --no-fullpage        Capture only viewport (default: full page)
  --output=<path>      Output directory (default: ./screenshots)
  --filename=<name>    Custom filename (default: auto-generated)
  --wait=<strategy>    Wait strategy: load|domcontentloaded|networkidle|commit (default: networkidle)
  --no-auth            Skip dev authentication (default: uses dev auth for localhost)

Examples:
  npm run screenshot http://localhost:3000
  npm run screenshot http://localhost:3000/dashboard --width=1920 --height=1080
  npm run screenshot http://localhost:3000/timeline --filename=timeline-before.png
    `);
    process.exit(0);
  }
  
  const url = args[0];
  
  // Parse options
  const options = {};
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key === 'no-fullpage') {
        options.fullPage = false;
      } else if (key === 'no-auth') {
        options.useDevAuth = false;
      } else if (key === 'width' || key === 'height') {
        options[key] = parseInt(value, 10);
      } else if (key === 'output') {
        options.outputDir = value;
      } else if (key === 'filename') {
        options.filename = value;
      } else if (key === 'wait') {
        options.waitFor = value;
      }
    }
  });
  
  // Take the screenshot
  takeScreenshot(url, options).catch(error => {
    process.exit(1);
  });
}

module.exports = { takeScreenshot };