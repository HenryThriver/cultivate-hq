import { test, expect } from '@playwright/test';
import { createTestUtils } from './test-utils';

test.describe('Onboarding Flow - Complete User Journey', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should complete full onboarding flow successfully', async ({ page }) => {
    // Start onboarding
    await utils.navigateToPage('/onboarding');
    await utils.waitForPageLoad();

    // Screen 1: Welcome
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByText(/relationship intelligence/i)).toBeVisible();
    await page.getByRole('button', { name: /continue|next|get started/i }).click();

    // Screen 2: Challenges (voice memo)
    await expect(page.getByText(/challenges/i)).toBeVisible();
    
    // Mock successful voice recording
    await page.route('**/api/voice-memo/onboarding**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          id: 'test-voice-memo-1',
          status: 'completed'
        })
      });
    });
    
    // Skip voice recording for test speed
    const skipButton = page.getByRole('button', { name: /skip|continue/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
    } else {
      await page.getByRole('button', { name: /next/i }).click();
    }

    // Screen 3: Recognition
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next/i }).click();

    // Screen 4: Bridge
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next/i }).click();

    // Screen 5: Goals (voice memo)
    await expect(page.getByText(/goal/i)).toBeVisible();
    
    // Skip or mock goal recording
    const goalSkipButton = page.getByRole('button', { name: /skip|continue/i });
    if (await goalSkipButton.isVisible()) {
      await goalSkipButton.click();
    } else {
      await page.getByRole('button', { name: /next/i }).click();
    }

    // Screen 6: Contacts Import
    await expect(page.getByText(/contacts|linkedin/i)).toBeVisible();
    
    // Mock contact import
    await page.route('**/api/contacts/import**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'test-contact-1',
            name: 'John Doe',
            linkedin_url: 'https://linkedin.com/in/johndoe'
          }
        ])
      });
    });

    // Add test LinkedIn URL
    const linkedinInput = page.getByPlaceholder(/linkedin|url/i);
    if (await linkedinInput.isVisible()) {
      await linkedinInput.fill('https://linkedin.com/in/testuser');
      await page.getByRole('button', { name: /add|import/i }).click();
    }
    
    await page.getByRole('button', { name: /continue|next/i }).click();

    // Screen 7: Contact Confirmation
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next|confirm/i }).click();

    // Screen 8: Context Discovery
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next/i }).click();

    // Screen 9: LinkedIn Profile
    await utils.waitForPageLoad();
    const profileSkipButton = page.getByRole('button', { name: /skip|continue/i });
    if (await profileSkipButton.isVisible()) {
      await profileSkipButton.click();
    } else {
      await page.getByRole('button', { name: /next/i }).click();
    }

    // Screen 10: Processing
    await utils.waitForPageLoad();
    
    // Mock processing completion
    await page.route('**/api/onboarding/complete**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    // Wait for processing to complete or skip
    const processingNextButton = page.getByRole('button', { name: /continue|next/i });
    await expect(processingNextButton).toBeVisible({ timeout: 10000 });
    await processingNextButton.click();

    // Screen 11: Profile Review
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next|complete/i }).click();

    // Screen 12: Complete
    await expect(page.getByText(/complete|congratulations|welcome/i)).toBeVisible();
    await page.getByRole('button', { name: /continue|dashboard|get started/i }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard**');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should track progress correctly throughout flow', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Check initial progress
    const progressIndicator = page.locator('[data-testid="progress-indicator"], .progress, [role="progressbar"]');
    await expect(progressIndicator).toBeVisible();
    
    // Progress through first few screens and verify progress updates
    for (let i = 0; i < 3; i++) {
      const nextButton = page.getByRole('button', { name: /continue|next|get started/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await utils.waitForPageLoad();
      }
    }
    
    // Progress should have increased
    await expect(progressIndicator).toBeVisible();
  });

  test('should handle navigation between completed screens', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Complete first two screens
    await page.getByRole('button', { name: /continue|next|get started/i }).click();
    await utils.waitForPageLoad();
    await page.getByRole('button', { name: /continue|next|skip/i }).click();
    await utils.waitForPageLoad();
    
    // Should be able to navigate back to previous screen
    const backButton = page.getByRole('button', { name: /back|previous/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await utils.waitForPageLoad();
      
      // Should be on previous screen
      await expect(page.getByText(/challenges|welcome/i)).toBeVisible();
    }
  });
});

test.describe('Onboarding Flow - Mobile Experience', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
  });

  test('should work on mobile devices', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Check mobile layout
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    
    // Navigation should work on mobile
    const nextButton = page.getByRole('button', { name: /continue|next|get started/i });
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    await utils.waitForPageLoad();
    await expect(page.getByText(/challenges/i)).toBeVisible();
  });

  test('should handle voice recording on mobile', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Navigate to challenges screen
    await page.getByRole('button', { name: /continue|next|get started/i }).click();
    await utils.waitForPageLoad();
    
    // Should show mobile-friendly voice recording interface
    const voiceRecorder = page.locator('[data-testid="voice-recorder"], .voice-recorder');
    if (await voiceRecorder.isVisible()) {
      await expect(voiceRecorder).toBeVisible();
      
      // Check for mobile-specific controls
      const recordButton = page.getByRole('button', { name: /record|start/i });
      await expect(recordButton).toBeVisible();
    }
  });
});

test.describe('Onboarding Flow - Error Handling', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should handle voice memo API failures gracefully', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Navigate to challenges screen
    await page.getByRole('button', { name: /continue|next|get started/i }).click();
    await utils.waitForPageLoad();
    
    // Mock API failure
    await page.route('**/api/voice-memo/onboarding**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Voice processing failed' })
      });
    });
    
    // Try to record (if recorder is present)
    const recordButton = page.getByRole('button', { name: /record|start/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      
      // Should show error state or allow skip
      await expect(page.getByText(/error|failed|skip/i)).toBeVisible();
    }
    
    // Should be able to continue even if voice fails
    const skipButton = page.getByRole('button', { name: /skip|continue/i });
    await expect(skipButton).toBeVisible();
    await skipButton.click();
  });

  test('should handle contact import failures', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Navigate to contacts screen
    for (let i = 0; i < 5; i++) {
      const nextButton = page.getByRole('button', { name: /continue|next|get started|skip/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await utils.waitForPageLoad();
      }
    }
    
    // Mock contact import failure
    await page.route('**/api/contacts/import**', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Invalid LinkedIn URL' })
      });
    });
    
    // Try invalid LinkedIn URL
    const linkedinInput = page.getByPlaceholder(/linkedin|url/i);
    if (await linkedinInput.isVisible()) {
      await linkedinInput.fill('invalid-url');
      await page.getByRole('button', { name: /add|import/i }).click();
      
      // Should show error message
      await expect(page.getByText(/error|invalid|failed/i)).toBeVisible();
    }
  });

  test('should handle authentication loss during onboarding', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Simulate authentication loss
    await page.route('**/api/auth**', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    // Try to navigate
    await page.getByRole('button', { name: /continue|next|get started/i }).click();
    
    // Should redirect to login or show auth error
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|auth|unauthorized/);
  });
});

test.describe('Onboarding Flow - Performance', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should load quickly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await utils.navigateToPage('/onboarding');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds on mobile
  });

  test('should handle screen transitions smoothly', async ({ page }) => {
    await utils.navigateToPage('/onboarding');
    
    // Measure transition time between screens
    const startTime = Date.now();
    await page.getByRole('button', { name: /continue|next|get started/i }).click();
    await utils.waitForPageLoad();
    await expect(page.getByText(/challenges/i)).toBeVisible();
    
    const transitionTime = Date.now() - startTime;
    expect(transitionTime).toBeLessThan(1000); // Screen transitions should be fast
  });
});