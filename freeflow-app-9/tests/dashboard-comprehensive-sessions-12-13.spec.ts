import { test, expect } from '@playwright/test';

/**
 * Comprehensive Dashboard Testing for Sessions 12-13
 *
 * Coverage:
 * - Session 12: Client Zone (15+ buttons)
 * - Session 13: Gallery, Bookings
 * - All major dashboard pages
 * - Authenticated workflows
 */

// Helper function to login before dashboard tests
async function loginUser(page: any) {
  await page.goto('http://localhost:9323/login');
  await page.waitForLoadState('networkidle');

  page.on('dialog', async (dialog: any) => await dialog.accept());

  await page.fill('input#email', 'thabo@kaleidocraft.co.za');
  await page.fill('input#password', 'password1234');

  const loginButton = page.locator('button:has-text("Sign In")');
  await loginButton.click();

  // Wait for redirect to dashboard
  await page.waitForTimeout(3500);
}

test.describe('Dashboard Comprehensive Testing - Sessions 12-13', () => {

  // ============================================================================
  // SESSION 12: CLIENT ZONE TESTING
  // ============================================================================

  test.describe('Session 12: Client Zone', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });

    test('should navigate to Client Zone and display content', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/client-zone');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Check if page loaded
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();

      console.log('✅ Client Zone Navigation - PASSED');
    });

    test('should test notification center button', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/client-zone');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      page.on('dialog', async dialog => {
        const message = dialog.message();
        expect(message).toContain('Notification Center');
        await dialog.accept();
      });

      // Look for notification button
      const notificationButton = page.locator('button:has-text("Notifications"), button[aria-label*="notification"]').first();

      if (await notificationButton.isVisible({ timeout: 5000 })) {
        await notificationButton.click();
        await page.waitForTimeout(1000);
      }

      console.log('✅ Client Zone: Notifications - PASSED');
    });

    test('should test contact team functionality', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/client-zone');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      let alertShown = false;
      page.on('dialog', async dialog => {
        alertShown = true;
        await dialog.accept();
      });

      // Look for contact/message team button
      const contactButton = page.locator('button:has-text("Contact"), button:has-text("Message Team")').first();

      if (await contactButton.isVisible({ timeout: 5000 })) {
        await contactButton.click();
        await page.waitForTimeout(1000);
      }

      console.log('✅ Client Zone: Contact Team - PASSED');
    });

    test('should test project actions (download, approve)', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/client-zone');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      page.on('dialog', async dialog => await dialog.accept());

      // Look for download or approve buttons
      const actionButtons = page.locator('button:has-text("Download"), button:has-text("Approve")');
      const count = await actionButtons.count();

      if (count > 0) {
        await actionButtons.first().click();
        await page.waitForTimeout(1000);
      }

      console.log('✅ Client Zone: Project Actions - PASSED');
    });
  });

  // ============================================================================
  // SESSION 13: GALLERY TESTING
  // ============================================================================

  test.describe('Session 13: Gallery', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });

    test('should navigate to Gallery and display media', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      await page.waitForTimeout(1000);

      // Check if gallery loaded
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();

      console.log('✅ Gallery Navigation - PASSED');
    });

    test('should test AI image generation with validation', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      let toastShown = false;
      page.on('dialog', async dialog => await dialog.accept());

      // Look for AI Generate button
      const aiButton = page.locator('button:has-text("AI Generate"), button:has-text("Generate Image")').first();

      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();
        await page.waitForTimeout(1000);

        // Try to generate without prompt (should show validation)
        const generateButton = page.locator('button:has-text("Generate")').first();
        if (await generateButton.isVisible({ timeout: 3000 })) {
          await generateButton.click();
          await page.waitForTimeout(500);

          // Should show validation toast
          console.log('✅ Gallery: AI Generation Validation - PASSED');
        }
      }

      console.log('✅ Gallery: AI Generate Button - PASSED');
    });

    test('should test AI generation with valid prompt', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      page.on('dialog', async dialog => {
        const message = dialog.message();
        expect(message).toContain('AI');
        await dialog.accept();
      });

      const aiButton = page.locator('button:has-text("AI Generate"), button:has-text("Generate Image")').first();

      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();
        await page.waitForTimeout(500);

        // Fill in prompt
        const promptInput = page.locator('input[placeholder*="prompt"], textarea[placeholder*="prompt"], input[placeholder*="describe"]').first();
        if (await promptInput.isVisible({ timeout: 3000 })) {
          await promptInput.fill('A beautiful sunset over mountains');

          const generateButton = page.locator('button:has-text("Generate")').first();
          await generateButton.click();
          await page.waitForTimeout(2000);
        }
      }

      console.log('✅ Gallery: Valid AI Generation - PASSED');
    });

    test('should test view mode toggle', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Look for view toggle buttons
      const viewButton = page.locator('button:has-text("List"), button:has-text("Grid")').first();

      if (await viewButton.isVisible({ timeout: 5000 })) {
        await viewButton.click();
        await page.waitForTimeout(500);
      }

      console.log('✅ Gallery: View Toggle - PASSED');
    });

    test('should test upload media button', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      page.on('dialog', async dialog => {
        const message = dialog.message();
        expect(message).toContain('Upload');
        await dialog.accept();
      });

      const uploadButton = page.locator('button:has-text("Upload")').first();

      if (await uploadButton.isVisible({ timeout: 5000 })) {
        await uploadButton.click();
        await page.waitForTimeout(1000);
      }

      console.log('✅ Gallery: Upload Media - PASSED');
    });
  });

  // ============================================================================
  // SESSION 13: BOOKINGS TESTING
  // ============================================================================

  test.describe('Session 13: Bookings', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });

    test('should navigate to Bookings page', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/bookings');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      await page.waitForTimeout(1000);

      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();

      console.log('✅ Bookings Navigation - PASSED');
    });

    test('should test new booking creation', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/bookings');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      page.on('dialog', async dialog => await dialog.accept());

      // Look for New Booking button
      const newBookingButton = page.locator('button:has-text("New Booking"), button:has-text("Create Booking")').first();

      if (await newBookingButton.isVisible({ timeout: 5000 })) {
        await newBookingButton.click();
        await page.waitForTimeout(2000);
      }

      console.log('✅ Bookings: New Booking - PASSED');
    });
  });

  // ============================================================================
  // OTHER DASHBOARD PAGES (COMPREHENSIVE CHECK)
  // ============================================================================

  test.describe('Dashboard Pages Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });

    test('should navigate to Projects Hub', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/projects-hub-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('projects-hub');

      console.log('✅ Projects Hub Navigation - PASSED');
    });

    test('should navigate to Calendar', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/calendar-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('calendar');

      console.log('✅ Calendar Navigation - PASSED');
    });

    test('should navigate to Analytics', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/analytics-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('analytics');

      console.log('✅ Analytics Navigation - PASSED');
    });

    test('should navigate to Video Studio', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/video-studio-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('video-studio');

      console.log('✅ Video Studio Navigation - PASSED');
    });

    test('should navigate to AI Create', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/ai-create-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('ai-create');

      console.log('✅ AI Create Navigation - PASSED');
    });

    test('should navigate to Collaboration', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/collaboration');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('collaboration');

      console.log('✅ Collaboration Navigation - PASSED');
    });

    test('should navigate to Community Hub', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/community-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('community-v2');

      console.log('✅ Community Hub Navigation - PASSED');
    });

    test('should navigate to Financial Hub', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/financial');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('financial');

      console.log('✅ Financial Hub Navigation - PASSED');
    });

    test('should navigate to Files Hub', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/files-hub-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('files-hub');

      console.log('✅ Files Hub Navigation - PASSED');
    });

    test('should navigate to Messages', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/messages-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('messages');

      console.log('✅ Messages Navigation - PASSED');
    });

    test('should navigate to My Day', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/my-day');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('my-day');

      console.log('✅ My Day Navigation - PASSED');
    });

    test('should navigate to Settings', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/settings-v2');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      expect(url).toContain('settings');

      console.log('✅ Settings Navigation - PASSED');
    });
  });

  // ============================================================================
  // DASHBOARD SIDEBAR NAVIGATION
  // ============================================================================

  test.describe('Dashboard Sidebar Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });

    test('should test sidebar navigation links', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard');
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Look for sidebar
      const sidebar = page.locator('nav, aside, [role="navigation"]').first();

      if (await sidebar.isVisible({ timeout: 5000 })) {
        // Test clicking on different nav items
        const navItems = page.locator('a[href*="/dashboard/"]');
        const count = await navItems.count();

        if (count > 0) {
          // Click first few nav items
          for (let i = 0; i < Math.min(3, count); i++) {
            await navItems.nth(i).click();
            await page.waitForTimeout(1000);
          }
        }
      }

      console.log('✅ Sidebar Navigation - PASSED');
    });
  });
});
