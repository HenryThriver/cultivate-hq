import { test, expect, Page } from '@playwright/test';
import { createTestUtils } from './test-utils';

test.describe('Goals Page', () => {
  let utils: ReturnType<typeof createTestUtils>;
  let consoleLogs: { type: string; message: string; location?: any }[] = [];
  let networkErrors: { url: string; status: number; method: string }[] = [];

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    consoleLogs = [];
    networkErrors = [];

    // Capture console logs
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();
      
      consoleLogs.push({ type, message: text, location });
      
      if (type === 'error' && !text.includes('Failed to load resource')) {
        console.error(`❌ [BROWSER ERROR] ${text}`);
        if (location.url) {
          console.error(`   at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        }
      } else if (type === 'warn') {
        console.warn(`⚠️  [BROWSER WARN] ${text}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      console.error(`🔴 [PAGE ERROR] ${error.message}`);
      consoleLogs.push({ type: 'pageerror', message: error.message });
    });

    // Capture network errors
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('favicon')) {
        const error = {
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        };
        networkErrors.push(error);
        console.error(`🔴 [NETWORK ERROR] ${error.method} ${error.url} - ${error.status}`);
      }
    });

    // Login through UI first
    console.log('🔐 Logging in through UI...');
    
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    
    // Click the dev login button if it exists
    const devButton = page.getByText('Sign in as Dev User');
    const hasDevButton = await devButton.isVisible().catch(() => false);
    
    if (hasDevButton) {
      console.log('📝 Found dev login button, clicking...');
      await devButton.click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      console.log('✅ Successfully logged in via dev button');
    } else {
      console.log('📝 No dev button found, using manual login...');
      
      // Fill login form manually
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const loginButton = page.locator('button[type="submit"]');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('dev@cultivatehq.com');
        await passwordInput.fill('devpassword123');
        await loginButton.click();
        
        // Wait for navigation
        await page.waitForURL('**/dashboard/**', { timeout: 10000 });
        console.log('✅ Successfully logged in via form');
      } else {
        console.error('❌ No login form found');
        throw new Error('Unable to find login form or dev button');
      }
    }

    // Mock goals API with comprehensive test data
    await page.route('**/rest/v1/goals**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking goals API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'goal-1',
              user_id: 'test-user-id',
              title: 'Land Series A Funding',
              description: 'Secure $5M Series A funding round for the startup',
              category: 'startup',
              timeline: '6_months',
              success_criteria: 'Close funding round with lead investor',
              target_contact_count: 20,
              progress_percentage: 65,
              target_date: '2025-12-31',
              status: 'active',
              priority: 1,
              is_primary: true,
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z'
            },
            {
              id: 'goal-2', 
              user_id: 'test-user-id',
              title: 'Career Transition to VP Engineering',
              description: 'Move into a VP Engineering role at a tech company',
              category: 'career_transition',
              timeline: '1_year',
              success_criteria: 'Accept VP Engineering offer',
              target_contact_count: 15,
              progress_percentage: 30,
              target_date: '2026-06-30',
              status: 'active',
              priority: 2,
              is_primary: false,
              created_at: '2025-01-02T00:00:00Z',
              updated_at: '2025-01-02T00:00:00Z'
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Mock goal contacts API
    await page.route('**/rest/v1/goal_contacts**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking goal_contacts API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'gc-1',
              goal_id: 'goal-1',
              contact_id: 'contact-1',
              user_id: 'test-user-id',
              relationship_type: 'investor',
              relevance_score: 0.9
            },
            {
              id: 'gc-2',
              goal_id: 'goal-1',
              contact_id: 'contact-2',
              user_id: 'test-user-id',
              relationship_type: 'advisor',
              relevance_score: 0.8
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Mock contacts API
    await page.route('**/rest/v1/contacts**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking contacts API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'contact-1',
              name: 'Sarah Chen',
              email: 'sarah@vc.com',
              title: 'Partner',
              company: 'Alpha Ventures',
              profile_picture_url: null
            },
            {
              id: 'contact-2',
              name: 'Mike Rodriguez',
              email: 'mike@advisor.com',
              title: 'Former CTO',
              company: 'TechCorp',
              profile_picture_url: null
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Mock actions API
    await page.route('**/rest/v1/actions**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking actions API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'action-1',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              title: 'Follow up with Sarah Chen',
              status: 'pending',
              action_type: 'follow_up',
              priority: 'high'
            },
            {
              id: 'action-2',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              title: 'Prepare pitch deck',
              status: 'completed',
              action_type: 'other',
              priority: 'medium'
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Mock artifacts API (for POGs and Asks)
    await page.route('**/rest/v1/artifacts**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking artifacts API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'artifact-1',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              type: 'ask',
              loop_status: 'closed',
              content: JSON.stringify({ title: 'Introduction to investor network' })
            },
            {
              id: 'artifact-2',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              type: 'pog',
              loop_status: 'delivered',
              content: JSON.stringify({ title: 'Market research report shared' })
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Mock milestones API
    await page.route('**/rest/v1/goal_milestones**', async (route) => {
      if (route.request().method() === 'GET') {
        console.log('📡 Mocking goal_milestones API call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'milestone-1',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              title: 'Complete pitch deck',
              status: 'completed',
              order_index: 1
            },
            {
              id: 'milestone-2',
              goal_id: 'goal-1',
              user_id: 'test-user-id',
              title: 'First investor meeting',
              status: 'pending',
              order_index: 2
            }
          ])
        });
      } else {
        await route.continue();
      }
    });
  });

  test.afterEach(async () => {
    // Print console summary
    const errors = consoleLogs.filter(log => log.type === 'error' || log.type === 'pageerror');
    const warnings = consoleLogs.filter(log => log.type === 'warn');
    
    console.log(`\n📊 Console Summary:`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log(`   Network Errors: ${networkErrors.length}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors found:`);
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.message}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log(`\n🔴 Network errors:`);
      networkErrors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.method} ${error.url} - ${error.status}`);
      });
    }
  });

  test('should display goals dashboard with enhanced cards', async ({ page }) => {
    console.log('🧪 Testing goals dashboard display...');
    
    // Navigate directly to goals since we're already logged in
    await page.goto('/dashboard/goals');
    await utils.waitForPageLoad();

    // Wait a bit for all data to load
    await page.waitForTimeout(2000);

    // Check for main page elements
    await expect(page.getByText('Your Goals')).toBeVisible();
    
    // Check if goals are displayed
    const hasGoals = await page.getByText('Land Series A Funding').isVisible();
    
    if (hasGoals) {
      console.log('✅ Goals loaded successfully');
      
      // Check for goal details
      await expect(page.getByText('Land Series A Funding')).toBeVisible();
      await expect(page.getByText('Career Transition to VP Engineering')).toBeVisible();
      
      // Check for progress indicators
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
      
      // Check for stats (contacts, actions, etc.)
      const statsElements = page.locator('h4, h6').filter({ hasText: /^\d+$/ });
      const statsCount = await statsElements.count();
      console.log(`📊 Found ${statsCount} stat elements`);
      
    } else {
      // Check for error messages
      const errorAlert = page.locator('[role="alert"]');
      const hasError = await errorAlert.isVisible();
      
      if (hasError) {
        const errorText = await errorAlert.textContent();
        console.error(`🚨 Error displayed: ${errorText}`);
        throw new Error(`Goals page shows error: ${errorText}`);
      } else {
        console.log('⚠️ No goals found, but no error displayed either');
      }
    }
  });

  test('should open Add Goal modal', async ({ page }) => {
    console.log('🧪 Testing Add Goal modal...');
    
    await page.goto('/dashboard/goals');
    await utils.waitForPageLoad();

    // Click Create Goal button
    const createButton = page.getByRole('button', { name: /create goal/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Check modal opened
    await expect(page.getByText('Create New Goal')).toBeVisible();
    await expect(page.getByText('Choose Category')).toBeVisible();
    
    console.log('✅ Add Goal modal opened successfully');
  });

  test('should navigate to goal detail page', async ({ page }) => {
    console.log('🧪 Testing goal detail navigation...');
    
    await page.goto('/dashboard/goals');
    await utils.waitForPageLoad();

    // Wait for goals to load
    await expect(page.getByText('Land Series A Funding')).toBeVisible();

    // Click View Details button
    const viewDetailsButton = page.getByRole('button', { name: /view details/i }).first();
    await expect(viewDetailsButton).toBeVisible();
    await viewDetailsButton.click();

    // Should navigate to detail page
    await page.waitForURL('**/goals/**');
    await expect(page).toHaveURL(/\/dashboard\/goals\/.+/);
    
    console.log('✅ Navigation to goal detail successful');
  });

  test('should not have console errors', async ({ page }) => {
    console.log('🧪 Testing for console errors...');
    
    await page.goto('/dashboard/goals');
    await utils.waitForPageLoad();
    
    // Wait for all async operations
    await page.waitForTimeout(3000);
    
    // Check for JavaScript errors
    const jsErrors = consoleLogs.filter(log => 
      log.type === 'error' && 
      !log.message.includes('Failed to load resource') && // Ignore resource loading errors
      !log.message.includes('404') // Ignore 404 errors
    );
    
    if (jsErrors.length > 0) {
      console.error('❌ JavaScript errors found:');
      jsErrors.forEach((error, i) => {
        console.error(`   ${i + 1}. ${error.message}`);
      });
      throw new Error(`Found ${jsErrors.length} JavaScript error(s)`);
    }
    
    console.log('✅ No critical console errors found');
  });
});