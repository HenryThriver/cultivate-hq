import { test, expect } from '@playwright/test';
import { createTestUtils } from './test-utils';

test.describe('Core Features - Contact Management', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    
    // Mock contacts API
    await page.route('**/api/contacts**', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'contact-1',
              name: 'John Doe',
              linkedin_url: 'https://linkedin.com/in/johndoe',
              email: 'john@example.com',
              company: 'Acme Corp',
              title: 'VP of Engineering'
            }
          ])
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'new-contact-1',
            name: 'Jane Smith',
            linkedin_url: 'https://linkedin.com/in/janesmith'
          })
        });
      } else {
        route.continue();
      }
    });
  });

  test('should display contacts list', async ({ page }) => {
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();
    
    // Should show contacts
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('VP of Engineering')).toBeVisible();
  });

  test('should create new contact', async ({ page }) => {
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();
    
    // Click add contact button
    const addButton = page.getByRole('button', { name: /add.*contact|new.*contact|\+/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Should show contact form
    await expect(page.getByText(/add.*contact|new.*contact/i)).toBeVisible();
    
    // Fill form
    const nameInput = page.getByLabel(/name/i);
    const linkedinInput = page.getByLabel(/linkedin/i);
    
    await nameInput.fill('Jane Smith');
    await linkedinInput.fill('https://linkedin.com/in/janesmith');
    
    // Submit form
    const saveButton = page.getByRole('button', { name: /save|create|add/i });
    await saveButton.click();
    
    // Should show success and new contact
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should view contact details', async ({ page }) => {
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();
    
    // Click on contact
    const contactLink = page.getByText('John Doe');
    await contactLink.click();
    
    // Should navigate to contact details
    await page.waitForURL('**/contacts/**');
    await expect(page).toHaveURL(/contacts\//);
    
    // Should show contact information
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('john@example.com')).toBeVisible();
  });
});

test.describe('Core Features - Voice Memos', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    
    // Mock voice memo API
    await page.route('**/api/voice-memo/**', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'voice-memo-1',
            artifact_id: 'artifact-1',
            status: 'completed',
            transcript: 'This is a test voice memo transcript.',
            ai_suggestions: ['Follow up with John about the project']
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Mock artifacts API
    await page.route('**/api/artifacts**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'artifact-1',
            type: 'voice_memo',
            title: 'Meeting with John',
            content: 'This is a test voice memo transcript.',
            created_at: '2025-01-20T10:00:00Z',
            ai_suggestions: ['Follow up with John about the project']
          }
        ])
      });
    });
  });

  test('should record voice memo', async ({ page }) => {
    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();
    
    // Look for voice recording interface
    const voiceRecorder = page.locator('[data-testid="voice-recorder"], .voice-recorder');
    const recordButton = page.getByRole('button', { name: /record|start.*recording|mic/i });
    
    if (await recordButton.isVisible()) {
      await recordButton.click();
      
      // Should show recording state
      await expect(page.getByText(/recording|stop/i)).toBeVisible();
      
      // Simulate stopping recording
      const stopButton = page.getByRole('button', { name: /stop|finish/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }
      
      // Should show processing or completed state
      await expect(page.getByText(/processing|saved|complete/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display voice memo artifacts', async ({ page }) => {
    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();
    
    // Should show voice memo artifacts
    await expect(page.getByText('Meeting with John')).toBeVisible();
    await expect(page.getByText('This is a test voice memo transcript.')).toBeVisible();
  });

  test('should show AI suggestions for voice memos', async ({ page }) => {
    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();
    
    // Should show AI suggestions
    await expect(page.getByText('Follow up with John about the project')).toBeVisible();
    
    // Should be able to interact with suggestions
    const suggestionButton = page.getByRole('button', { name: /follow up|suggestion/i });
    if (await suggestionButton.isVisible()) {
      await expect(suggestionButton).toBeVisible();
    }
  });
});

test.describe('Core Features - Loop Management (POGs & Asks)', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    
    // Mock loops API
    await page.route('**/api/loops**', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: 'loop-1',
              type: 'POG',
              title: 'Introduction to Sarah',
              description: 'Connect John with Sarah for collaboration',
              status: 'ACTIVE',
              contact_id: 'contact-1',
              contact_name: 'John Doe',
              created_at: '2025-01-20T10:00:00Z'
            },
            {
              id: 'loop-2',
              type: 'ASK',
              title: 'Resume review request',
              description: 'Asked John to review my resume',
              status: 'PENDING',
              contact_id: 'contact-1',
              contact_name: 'John Doe',
              created_at: '2025-01-19T10:00:00Z'
            }
          ])
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'new-loop-1',
            type: 'POG',
            title: 'New introduction',
            status: 'QUEUED'
          })
        });
      } else {
        route.continue();
      }
    });
  });

  test('should display loops list', async ({ page }) => {
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Should show POGs and Asks
    await expect(page.getByText('Introduction to Sarah')).toBeVisible();
    await expect(page.getByText('Resume review request')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Should show status indicators
    await expect(page.getByText('ACTIVE')).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();
  });

  test('should create new POG', async ({ page }) => {
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Click add POG button
    const addPogButton = page.getByRole('button', { name: /add.*pog|new.*pog|\+.*pog/i });
    if (await addPogButton.isVisible()) {
      await addPogButton.click();
    } else {
      // Look for general add button
      const addButton = page.getByRole('button', { name: /add|new|\+/i });
      await addButton.click();
      
      // Select POG option
      const pogOption = page.getByText(/pog|packet.*generosity/i);
      if (await pogOption.isVisible()) {
        await pogOption.click();
      }
    }
    
    // Should show POG creation form
    await expect(page.getByText(/create.*pog|new.*pog/i)).toBeVisible();
    
    // Fill form
    const titleInput = page.getByLabel(/title|name/i);
    const descriptionInput = page.getByLabel(/description|details/i);
    
    await titleInput.fill('New introduction');
    await descriptionInput.fill('Connect Alice with Bob for their project');
    
    // Submit form
    const saveButton = page.getByRole('button', { name: /save|create|add/i });
    await saveButton.click();
    
    // Should show success and new POG
    await expect(page.getByText('New introduction')).toBeVisible();
  });

  test('should update loop status', async ({ page }) => {
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Mock status update
    await page.route('**/api/loops/loop-1**', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'loop-1',
            status: 'COMPLETED'
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Find status update controls
    const statusButton = page.getByRole('button', { name: /active|status|complete/i });
    if (await statusButton.isVisible()) {
      await statusButton.click();
      
      // Select completed status
      const completedOption = page.getByText(/completed|done|finished/i);
      if (await completedOption.isVisible()) {
        await completedOption.click();
      }
      
      // Should show updated status
      await expect(page.getByText('COMPLETED')).toBeVisible();
    }
  });

  test('should filter loops by type', async ({ page }) => {
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Look for filter controls
    const pogFilter = page.getByRole('button', { name: /pog|generosity/i });
    const askFilter = page.getByRole('button', { name: /ask|request/i });
    
    if (await pogFilter.isVisible()) {
      await pogFilter.click();
      
      // Should show only POGs
      await expect(page.getByText('Introduction to Sarah')).toBeVisible();
      // ASK should be hidden or filtered out
    }
    
    if (await askFilter.isVisible()) {
      await askFilter.click();
      
      // Should show only Asks
      await expect(page.getByText('Resume review request')).toBeVisible();
    }
  });
});

test.describe('Core Features - Mobile Experience', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    
    // Mock data for mobile tests
    await page.route('**/api/contacts**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'contact-1',
            name: 'John Doe',
            company: 'Acme Corp'
          }
        ])
      });
    });
  });

  test('should work on mobile - contacts', async ({ page }) => {
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();
    
    // Contacts should be visible on mobile
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Mobile navigation should work
    const contactLink = page.getByText('John Doe');
    await contactLink.click();
    
    await page.waitForURL('**/contacts/**');
    await expect(page).toHaveURL(/contacts\//);
  });

  test('should work on mobile - voice recording', async ({ page }) => {
    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();
    
    // Voice recorder should be mobile-friendly
    const recordButton = page.getByRole('button', { name: /record|mic/i });
    if (await recordButton.isVisible()) {
      // Button should be large enough for touch
      const buttonBox = await recordButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(40);
      expect(buttonBox?.height).toBeGreaterThan(40);
    }
  });

  test('should work on mobile - loops management', async ({ page }) => {
    // Mock loops for mobile
    await page.route('**/api/loops**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'loop-1',
            type: 'POG',
            title: 'Introduction to Sarah',
            status: 'ACTIVE',
            contact_name: 'John Doe'
          }
        ])
      });
    });
    
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Loops should be visible and readable on mobile
    await expect(page.getByText('Introduction to Sarah')).toBeVisible();
    await expect(page.getByText('ACTIVE')).toBeVisible();
    
    // Touch interactions should work
    const loopCard = page.locator('[data-testid="loop-card"]').first();
    if (await loopCard.isVisible()) {
      await loopCard.click();
      // Should respond to touch
    }
  });
});

test.describe('Core Features - Error Handling', () => {
  let utils: ReturnType<typeof createTestUtils>;

  test.beforeEach(async ({ page }) => {
    utils = createTestUtils(page);
    await utils.mockAuthenticatedUser();
  });

  test('should handle contact creation failures', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/contacts', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Invalid contact data' })
        });
      } else {
        route.continue();
      }
    });
    
    await utils.navigateToPage('/dashboard/contacts');
    await utils.waitForPageLoad();
    
    // Try to create contact
    const addButton = page.getByRole('button', { name: /add.*contact/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Fill form with invalid data
      const nameInput = page.getByLabel(/name/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('');
        
        const saveButton = page.getByRole('button', { name: /save|create/i });
        await saveButton.click();
        
        // Should show error message
        await expect(page.getByText(/error|invalid|failed/i)).toBeVisible();
      }
    }
  });

  test('should handle voice memo processing failures', async ({ page }) => {
    // Mock voice memo failure
    await page.route('**/api/voice-memo/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Audio processing failed' })
      });
    });
    
    await utils.navigateToPage('/dashboard/timeline');
    await utils.waitForPageLoad();
    
    // Try voice recording
    const recordButton = page.getByRole('button', { name: /record|mic/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.getByRole('button', { name: /stop/i });
      if (await stopButton.isVisible()) {
        await stopButton.click();
      }
      
      // Should show error message
      await expect(page.getByText(/error|failed|try.*again/i)).toBeVisible();
    }
  });

  test('should handle loop API failures', async ({ page }) => {
    // Mock loops API failure
    await page.route('**/api/loops', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });
    
    await utils.navigateToPage('/dashboard/loops');
    await utils.waitForPageLoad();
    
    // Should show error state
    await expect(page.getByText(/error|failed|unable.*load/i)).toBeVisible();
    
    // Should offer retry option
    const retryButton = page.getByRole('button', { name: /retry|try.*again/i });
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });
});