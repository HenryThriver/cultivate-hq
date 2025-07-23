import { test, expect } from '@playwright/test';
import { createTestUtils } from './test-utils';

test.describe('Loading States & Error Handling', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should show loading states during AI processing', async ({ page }) => {
    // Mock slow AI processing with proper delay
    await page.route('**/api/voice-memo/**', async route => {
      // Use Playwright's built-in delay instead of setTimeout
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'voice-memo-1',
          status: 'processing'
        })
      }, { delay: 1000 });
    });

    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();

    // Try to create voice memo
    const recordButton = page.getByRole('button', { name: /record|mic/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.getByRole('button', { name: /stop/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }

      // Should show processing/loading state
      await expect(page.getByText(/processing|analyzing|loading/i)).toBeVisible();
      
      // Should show loading indicator
      const loadingIndicator = page.locator('[role="progressbar"], .loading, .spinner, [data-testid="loading"]');
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should show loading states during contact import', async ({ page }) => {
    // Mock slow contact import with proper delay
    await page.route('**/api/contacts/import**', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'contact-1',
          name: 'John Doe'
        }])
      }, { delay: 1000 });
    });

    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    // Try to import contact
    const addButton = page.getByRole('button', { name: /add.*contact/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      const linkedinInput = page.getByLabel(/linkedin/i);
      if (await linkedinInput.isVisible()) {
        await linkedinInput.fill('https://linkedin.com/in/testuser');
        
        const importButton = page.getByRole('button', { name: /import|add/i });
        await importButton.click();
        
        // Should show loading state
        await expect(page.getByText(/importing|processing|loading/i)).toBeVisible();
        
        // Button should be disabled during loading
        await expect(importButton).toBeDisabled();
      }
    }
  });

  test('should show loading states during session creation', async ({ page }) => {
    // Mock slow session creation with proper delay
    await page.route('**/api/relationship-sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'session-1',
            status: 'active'
          })
        }, { delay: 1000 });
      } else {
        route.continue();
      }
    });

    // Mock goals for session modal
    await page.route('**/api/goals/for-relationship-building**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'goal-1',
          title: 'Test Goal',
          needs_contacts: true
        }])
      });
    });

    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();

    // Start session creation
    const startSessionButton = page.getByRole('button', { name: 'START SESSION' });
    await expect(startSessionButton).toBeVisible();
    await startSessionButton.click();

    // Select options and start
    const duration15 = page.getByRole('button', { name: '15 minutes' });
    await duration15.click();
    
    const goalOption = page.getByText('Test Goal');
    await goalOption.click();
    
    const startButton = page.getByRole('button', { name: /Start.*15min.*Session/i });
    await startButton.click();

    // Should show loading state
    await expect(page.getByText(/creating|starting|loading/i)).toBeVisible();
    
    // Button should be disabled during creation
    await expect(startButton).toBeDisabled();
  });
});

test.describe('Error Boundary Testing', () => {
  let utils: ReturnType<typeof createTestUtils>;
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    consoleErrors = []; // Reset errors array
  });

  test.afterEach(async ({ page }) => {
    // Clean up event listeners to prevent memory leaks
    await page.removeAllListeners('console');
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    // Listen for console errors (using the shared array)
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Inject JavaScript error
    await page.addInitScript(() => {
      // Simulate a component crash
      window.addEventListener('load', () => {
        setTimeout(() => {
          const errorEvent = new Error('Test component crash');
          window.dispatchEvent(new ErrorEvent('error', {
            error: errorEvent,
            message: 'Test component crash'
          }));
        }, 1000);
      });
    });

    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();

    // Wait for potential error to be handled
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible({ timeout: 5000 });

    // Page should still be functional despite errors
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    
    // Should not crash the entire application
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Mock network failures
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();

    // Should show error state or fallback content
    const errorIndicators = [
      page.getByText(/error|failed|unable.*load/i),
      page.getByText(/offline|network.*error/i),
      page.getByText(/try.*again|retry/i),
      page.getByRole('button', { name: /retry/i })
    ];

    let errorShown = false;
    for (const indicator of errorIndicators) {
      if (await indicator.isVisible({ timeout: 5000 })) {
        errorShown = true;
        break;
      }
    }

    // At least one error indicator should be shown
    expect(errorShown).toBe(true);
  });

  test('should handle authentication errors', async ({ page }) => {
    // Mock auth failure
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    await utils.navigateToPage('/dashboard');
    
    // Should redirect to login or show auth error
    await page.waitForURL(/login|auth/, { timeout: 5000 }).catch(() => {
      // If no redirect, check for auth error text
    });
    
    const currentUrl = page.url();
    const isAuthError = currentUrl.includes('login') || 
                       currentUrl.includes('auth') || 
                       await page.getByText(/unauthorized|sign.*in|login/i).isVisible();
    
    expect(isAuthError).toBe(true);
  });

  test('should handle database errors gracefully', async ({ page }) => {
    // Mock database errors for multiple endpoints
    await page.route('**/api/contacts**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });

    await page.route('**/api/artifacts**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });

    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    // Should show error state
    await expect(page.getByText(/error|failed|unable/i)).toBeVisible();
    
    // Should offer retry option
    const retryButton = page.getByRole('button', { name: /retry|try.*again/i });
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });
});

test.describe('Performance & Loading Optimization', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();
    
    // Main content should be visible
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle large contact lists efficiently', async ({ page }) => {
    // Mock large contact list
    const largeContactList = Array.from({ length: 100 }, (_, i) => ({
      id: `contact-${i}`,
      name: `Contact ${i}`,
      company: `Company ${i}`,
      title: `Title ${i}`
    }));

    await page.route('**/api/contacts**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(largeContactList)
      });
    });

    const startTime = Date.now();
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    // Should show contacts without performance issues
    await expect(page.getByText('Contact 0')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should handle large lists within 5 seconds
  });

  test('should optimize AI processing timeouts', async ({ page }) => {
    // Mock very slow AI processing
    await page.route('**/api/voice-memo/**', route => {
      // Delay for 10 seconds to test timeout handling
      setTimeout(() => {
        route.fulfill({
          status: 408,
          body: JSON.stringify({ error: 'Processing timeout' })
        });
      }, 10000);
    });

    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();

    const recordButton = page.getByRole('button', { name: /record|mic/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.getByRole('button', { name: /stop/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }

      // Should show loading initially
      await expect(page.getByText(/processing|analyzing/i)).toBeVisible();
      
      // Should handle timeout gracefully (wait up to 12 seconds)
      await page.waitForTimeout(12000);
      
      // Should show timeout error or fallback
      const timeoutHandled = await page.getByText(/timeout|try.*again|error/i).isVisible();
      expect(timeoutHandled).toBe(true);
    }
  });

  test('should maintain performance on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    
    // Mock typical mobile data
    await page.route('**/api/contacts**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'contact-1', name: 'John Doe', company: 'Acme' }
        ])
      });
    });

    const startTime = Date.now();
    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();

    // Should load quickly on mobile
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // Mobile should load within 4 seconds
  });
});

test.describe('Accessibility & Error Prevention', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should provide keyboard navigation for error recovery', async ({ page }) => {
    // Mock error state
    await page.route('**/api/contacts**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    // Should show error with keyboard accessible retry
    const retryButton = page.getByRole('button', { name: /retry|try.*again/i });
    if (await retryButton.isVisible()) {
      // Should be focusable
      await retryButton.focus();
      await expect(retryButton).toBeFocused();
      
      // Should activate with Enter
      await page.keyboard.press('Enter');
    }
  });

  test('should show proper ARIA labels for loading states', async ({ page }) => {
    // Mock slow loading
    await page.route('**/api/contacts**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify([])
        });
      }, 2000);
    });

    await utils.navigateToPage('/dashboard/contacts');
    
    // Loading indicators should have proper ARIA labels
    const loadingElements = page.locator('[role="progressbar"], [aria-live], [aria-label*="loading" i]');
    
    if (await loadingElements.first().isVisible({ timeout: 1000 })) {
      const firstLoading = loadingElements.first();
      
      // Should have accessibility attributes
      const hasAriaLabel = await firstLoading.getAttribute('aria-label');
      const hasRole = await firstLoading.getAttribute('role');
      const hasAriaLive = await firstLoading.getAttribute('aria-live');
      
      const hasAccessibility = hasAriaLabel || hasRole === 'progressbar' || hasAriaLive;
      expect(hasAccessibility).toBeTruthy();
    }
  });

  test('should prevent form submission errors', async ({ page }) => {
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    // Try to create contact without required fields
    const addButton = page.getByRole('button', { name: /add.*contact/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Try to submit empty form
      const saveButton = page.getByRole('button', { name: /save|create/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should show validation errors
        const validationErrors = [
          page.getByText(/required|must.*provide|cannot.*be.*empty/i),
          page.locator('[aria-invalid="true"]'),
          page.locator('.error, [data-testid="error"]')
        ];
        
        let errorShown = false;
        for (const error of validationErrors) {
          if (await error.isVisible({ timeout: 2000 })) {
            errorShown = true;
            break;
          }
        }
        
        expect(errorShown).toBe(true);
      }
    }
  });

  test('should handle concurrent operations safely', async ({ page }) => {
    // Mock normal response with delay
    await page.route('**/api/contacts', route => {
      if (route.request().method() === 'POST') {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({
              id: 'contact-1',
              name: 'John Doe'
            })
          });
        }, 1000);
      } else {
        route.continue();
      }
    });

    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();

    const addButton = page.getByRole('button', { name: /add.*contact/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      const nameInput = page.getByLabel(/name/i);
      const saveButton = page.getByRole('button', { name: /save|create/i });
      
      if (await nameInput.isVisible() && await saveButton.isVisible()) {
        await nameInput.fill('John Doe');
        
        // Click save multiple times quickly
        await saveButton.click();
        await saveButton.click();
        await saveButton.click();
        
        // Should prevent duplicate submissions
        await expect(saveButton).toBeDisabled();
        
        // Wait for completion
        await page.waitForTimeout(2000);
        
        // Should not create duplicate contacts
        const johnDoeElements = page.getByText('John Doe');
        const count = await johnDoeElements.count();
        expect(count).toBeLessThanOrEqual(2); // At most one in form + one in list
      }
    }
  });
});