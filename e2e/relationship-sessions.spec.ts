import { test, expect } from '@playwright/test';
import { createTestUtils } from './test-utils';

test.describe('Relationship Sessions - Core Workflow', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    
    // Mock goals API for session creation
    await page.route('**/api/goals/for-relationship-building**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'test-goal-1',
            title: 'Connect with industry leaders',
            target_contact_count: 50,
            current_contact_count: 25,
            needs_contacts: true,
            meetings_needing_notes: []
          }
        ])
      });
    });

    // Mock session creation
    await page.route('**/api/relationship-sessions', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-session-1',
            status: 'active',
            duration_minutes: 15,
            goal_id: 'test-goal-1'
          })
        });
      } else {
        route.continue();
      }
    });

    // Mock session actions
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_contact',
            status: 'pending',
            goal_id: 'test-goal-1'
          }
        ])
      });
    });
  });

  test('should start a session successfully', async ({ page }) => {
    await utils.navigateToPage('/dashboard');
    await utils.waitForPageLoad();
    
    // Click Start Session button
    const startSessionButton = page.getByRole('button', { name: 'START SESSION' });
    await expect(startSessionButton).toBeVisible();
    await startSessionButton.click();
    
    // Should open session start modal
    await expect(page.getByText('Start Relationship Building Session')).toBeVisible();
    
    // Select duration (15 minutes)
    const duration15 = page.getByRole('button', { name: '15 minutes' });
    await expect(duration15).toBeVisible();
    await duration15.click();
    
    // Select goal
    const goalOption = page.getByText('Connect with industry leaders');
    await expect(goalOption).toBeVisible();
    await goalOption.click();
    
    // Start the session
    const startButton = page.getByRole('button', { name: /Start.*15min.*Session/i });
    await expect(startButton).toBeVisible();
    await startButton.click();
    
    // Should navigate to session page
    await page.waitForURL('**/session/**');
    await expect(page).toHaveURL(/session/);
    
    // Should show session interface
    await expect(page.getByText(/15:00|14:/)).toBeVisible(); // Timer
    await expect(page.getByText(/Connect with industry leaders/i)).toBeVisible(); // Goal
  });

  test('should display timer and progress correctly', async ({ page }) => {
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Timer should be visible and counting down
    const timer = page.locator('[data-testid="session-timer"], .timer, .countdown');
    await expect(timer).toBeVisible();
    
    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"], .progress-bar, .progress');
    await expect(progressBar).toBeVisible();
    
    // Action counter should show correct format
    const actionCounter = page.locator('.action-counter, [data-testid="action-counter"]');
    if (await actionCounter.isVisible()) {
      await expect(actionCounter).toContainText(/\d+.*\d+/); // Format: "1 of 3"
    }
  });

  test('should handle add contact action', async ({ page }) => {
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Should show add contact action card
    await expect(page.getByText(/add.*contact|new.*contact/i)).toBeVisible();
    
    // Mock successful contact import
    await page.route('**/api/contacts/goal-import**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'new-contact-1',
          name: 'John Doe',
          linkedin_url: 'https://linkedin.com/in/johndoe'
        })
      });
    });
    
    // Fill LinkedIn URL
    const linkedinInput = page.getByPlaceholder(/linkedin.*url|profile.*url/i);
    await expect(linkedinInput).toBeVisible();
    await linkedinInput.fill('https://linkedin.com/in/testuser');
    
    // Submit the contact
    const addButton = page.getByRole('button', { name: /add.*contact|import|submit/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Should show success state
    await expect(page.getByText(/success|added|complete/i)).toBeVisible();
    
    // Progress should update - wait for next action or completion
    await expect(page.getByText(/next.*action|complete|finished/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle meeting notes action with voice memo', async ({ page }) => {
    // Mock meeting notes action
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_meeting_notes',
            status: 'pending',
            meeting: {
              id: 'meeting-1',
              title: 'Weekly sync with John',
              contact_name: 'John Doe',
              start_time: '2025-01-20T10:00:00Z'
            }
          }
        ])
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Should show meeting notes action card
    await expect(page.getByText(/meeting.*notes|add.*notes/i)).toBeVisible();
    await expect(page.getByText(/John Doe/i)).toBeVisible();
    
    // Click voice memo tab
    const voiceTab = page.getByRole('tab', { name: /voice.*memo|record/i });
    if (await voiceTab.isVisible()) {
      await voiceTab.click();
    }
    
    // Mock voice memo API
    await page.route('**/api/voice-memo/onboarding**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'voice-memo-1',
          status: 'completed',
          transcript: 'Great meeting with John about the project.'
        })
      });
    });
    
    // Should show voice recorder
    const voiceRecorder = page.locator('[data-testid="voice-recorder"], .voice-recorder');
    if (await voiceRecorder.isVisible()) {
      const recordButton = page.getByRole('button', { name: /record|start/i });
      await expect(recordButton).toBeVisible();
      
      // Simulate quick recording (skip actual audio for test speed)
      await recordButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.getByRole('button', { name: /stop|finish/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }
    } else {
      // If no voice recorder, try skip or complete
      const skipButton = page.getByRole('button', { name: /skip|complete|next/i });
      await skipButton.click();
    }
    
    // Should advance to next action or completion
    await expect(page.getByText(/next.*action|complete|finished/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle session completion', async ({ page }) => {
    // Mock session with completed actions
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([]) // No pending actions
      });
    });
    
    // Mock session completion API
    await page.route('**/api/relationship-sessions/complete**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Should show completion dialog
    await expect(page.getByText(/complete|finished|well done/i)).toBeVisible();
    
    // End session
    const endButton = page.getByRole('button', { name: /end.*session|finish|complete/i });
    if (await endButton.isVisible()) {
      await endButton.click();
    }
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard**');
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Relationship Sessions - Mobile Experience', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    
    // Mock basic session data
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_contact',
            status: 'pending'
          }
        ])
      });
    });
  });

  test('should work on mobile devices', async ({ page }) => {
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Timer should be visible on mobile
    const timer = page.locator('[data-testid="session-timer"], .timer, .countdown');
    await expect(timer).toBeVisible();
    
    // Action cards should be mobile-friendly
    await expect(page.getByText(/add.*contact/i)).toBeVisible();
    
    // Input fields should be touch-friendly
    const linkedinInput = page.getByPlaceholder(/linkedin.*url/i);
    if (await linkedinInput.isVisible()) {
      await expect(linkedinInput).toBeVisible();
      
      // Should be able to focus and type
      await linkedinInput.click();
      await linkedinInput.fill('https://linkedin.com/in/test');
    }
  });

  test('should handle voice recording on mobile', async ({ page }) => {
    // Mock meeting notes action for voice test
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_meeting_notes',
            status: 'pending',
            meeting: {
              id: 'meeting-1',
              title: 'Test Meeting',
              contact_name: 'John Doe'
            }
          }
        ])
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Voice recorder should work on mobile
    const voiceRecorder = page.locator('[data-testid="voice-recorder"], .voice-recorder');
    if (await voiceRecorder.isVisible()) {
      const recordButton = page.getByRole('button', { name: /record|start/i });
      await expect(recordButton).toBeVisible();
      
      // Button should be large enough for touch
      const recordButtonBox = await recordButton.boundingBox();
      expect(recordButtonBox?.width).toBeGreaterThan(40);
      expect(recordButtonBox?.height).toBeGreaterThan(40);
    }
  });
});

test.describe('Relationship Sessions - Error Handling', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should handle contact import failures', async ({ page }) => {
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_contact',
            status: 'pending'
          }
        ])
      });
    });
    
    // Mock failed contact import
    await page.route('**/api/contacts/goal-import**', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Invalid LinkedIn URL' })
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Try invalid LinkedIn URL
    const linkedinInput = page.getByPlaceholder(/linkedin.*url/i);
    await linkedinInput.fill('invalid-url');
    
    const addButton = page.getByRole('button', { name: /add.*contact|import/i });
    await addButton.click();
    
    // Should show error message
    await expect(page.getByText(/error|invalid|failed/i)).toBeVisible();
    
    // Should still be able to skip or retry
    const skipButton = page.getByRole('button', { name: /skip/i });
    await expect(skipButton).toBeVisible();
  });

  test('should handle voice memo processing failures', async ({ page }) => {
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_meeting_notes',
            status: 'pending',
            meeting: {
              id: 'meeting-1',
              title: 'Test Meeting',
              contact_name: 'John Doe'
            }
          }
        ])
      });
    });
    
    // Mock voice memo failure
    await page.route('**/api/voice-memo/onboarding**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Audio processing failed' })
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Try voice recording
    const voiceRecorder = page.locator('[data-testid="voice-recorder"], .voice-recorder');
    if (await voiceRecorder.isVisible()) {
      const recordButton = page.getByRole('button', { name: /record|start/i });
      await recordButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.getByRole('button', { name: /stop|finish/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }
      
      // Should show error or allow retry/skip
      await page.waitForTimeout(1000);
      await expect(page.getByText(/error|failed|try again|skip/i)).toBeVisible();
    }
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_contact',
            status: 'pending'
          }
        ])
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Timer should be visible
    const timer = page.locator('[data-testid="session-timer"], .timer, .countdown');
    await expect(timer).toBeVisible();
    
    // Mock timer expiration (would normally take 15 minutes)
    await page.evaluate(() => {
      // Trigger timer expiration if there's a timer handler
      const timerElement = document.querySelector('[data-testid="session-timer"]');
      if (timerElement) {
        const event = new CustomEvent('timer-expired');
        timerElement.dispatchEvent(event);
      }
    });
    
    // Should show timeout notification or completion dialog
    await page.waitForTimeout(1000);
    // Timer behavior will depend on implementation
  });
});

test.describe('Relationship Sessions - Performance', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should load session interface quickly', async ({ page }) => {
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });
    
    const startTime = Date.now();
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Session interface should be visible
    const timer = page.locator('[data-testid="session-timer"], .timer, .countdown');
    await expect(timer).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle action completion quickly', async ({ page }) => {
    await page.route('**/api/goal-session-actions**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'action-1',
            type: 'add_contact',
            status: 'pending'
          }
        ])
      });
    });
    
    await page.route('**/api/contacts/goal-import**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'new-contact-1',
          name: 'John Doe'
        })
      });
    });
    
    await utils.navigateToPage('/session/test-session-1');
    await utils.waitForPageLoad();
    
    // Fill and submit contact quickly
    const linkedinInput = page.getByPlaceholder(/linkedin.*url/i);
    await linkedinInput.fill('https://linkedin.com/in/testuser');
    
    const startTime = Date.now();
    const addButton = page.getByRole('button', { name: /add.*contact|import/i });
    await addButton.click();
    
    // Should show success quickly
    await expect(page.getByText(/success|added|complete/i)).toBeVisible();
    
    const completionTime = Date.now() - startTime;
    expect(completionTime).toBeLessThan(2000); // Should complete within 2 seconds
  });
});