/**
 * Utility functions for test authentication
 * Use environment variables for credentials instead of hardcoded values
 */

async function authenticateTestUser(page) {
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_PASSWORD || 'testpassword';
  
  console.log('🔐 Authenticating...');
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(2000);
  
  try {
    await page.click('button:has-text("Show Dev Login")', { timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Dev login already visible');
  }
  
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button:has-text("Dev Sign In")');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  
  console.log('✅ Authenticated successfully');
}

module.exports = { authenticateTestUser };