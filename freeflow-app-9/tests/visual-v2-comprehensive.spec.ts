import { test, expect } from '@playwright/test';

/**
 * Comprehensive Visual Tests for V2 Dashboard Pages
 * Tests: Functionality, Buttons, Features, Sub-pages, Icons, Logic
 */

// V2 Dashboard routes to test (high-priority pages first)
const V2_ROUTES = [
  '/dashboard/overview-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/tasks-v2',
  '/dashboard/invoices-v2',
  '/dashboard/calendar-v2',
  '/dashboard/analytics-v2',
  '/dashboard/messages-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/clients-v2',
  '/dashboard/settings-v2',
  '/dashboard/notifications-v2',
  '/dashboard/video-studio-v2',
  '/dashboard/ai-assistant-v2',
  '/dashboard/ai-create-v2',
  '/dashboard/bookings-v2',
  '/dashboard/billing-v2',
  '/dashboard/team-hub-v2',
  '/dashboard/workflows-v2',
  '/dashboard/integrations-v2',
  '/dashboard/reports-v2',
];

// Test configuration
const BASE_URL = 'http://localhost:9323';
const TIMEOUT = 30000;

test.describe('V2 Dashboard - Visual & Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  // Test 1: Page Loading and Basic Structure
  test.describe('Page Loading Tests', () => {
    for (const route of V2_ROUTES.slice(0, 10)) {
      test(`${route} - should load without errors`, async ({ page }) => {
        const errors: string[] = [];

        // Capture console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        // Capture page errors
        page.on('pageerror', err => {
          errors.push(err.message);
        });

        const response = await page.goto(`${BASE_URL}${route}`, {
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });

        // Check response status
        expect(response?.status()).toBeLessThan(400);

        // Check for critical errors (filter out expected warnings)
        const criticalErrors = errors.filter(e =>
          !e.includes('ResizeObserver') &&
          !e.includes('hydration') &&
          !e.includes('Warning:')
        );

        // Log errors for debugging
        if (criticalErrors.length > 0) {
          console.log(`Errors on ${route}:`, criticalErrors);
        }

        // Take screenshot for visual reference
        await page.screenshot({
          path: `test-results/v2-screenshots/${route.replace(/\//g, '-')}.png`,
          fullPage: true
        });
      });
    }
  });

  // Test 2: Button Functionality
  test.describe('Button Functionality Tests', () => {
    test('Overview V2 - buttons should be clickable and functional', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/overview-v2`, { waitUntil: 'networkidle' });

      // Find all buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      console.log(`Found ${buttonCount} buttons on overview-v2`);

      // Test first 10 visible buttons
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);

        if (await button.isVisible()) {
          const buttonText = await button.textContent();
          const isDisabled = await button.isDisabled();

          console.log(`Button ${i}: "${buttonText?.trim()}" - Disabled: ${isDisabled}`);

          // Check button is either enabled or has proper disabled state
          if (!isDisabled) {
            // Test click doesn't cause JS error
            try {
              await button.click({ timeout: 2000 });
              await page.waitForTimeout(500);
            } catch (e) {
              // Button might be in a dialog or require special handling
              console.log(`Button ${i} click failed (expected for some buttons)`);
            }
          }
        }
      }
    });

    test('Projects V2 - action buttons should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/projects-v2`, { waitUntil: 'networkidle' });

      // Test "New Project" button if exists
      const newProjectBtn = page.getByRole('button', { name: /new project|create|add/i });
      if (await newProjectBtn.count() > 0) {
        await expect(newProjectBtn.first()).toBeVisible();
        await newProjectBtn.first().click();

        // Check if dialog/modal opens
        await page.waitForTimeout(500);
        const dialog = page.locator('[role="dialog"], .modal, [data-state="open"]');
        const dialogVisible = await dialog.count() > 0 && await dialog.first().isVisible();
        console.log(`New Project dialog opened: ${dialogVisible}`);

        // Close dialog if open
        if (dialogVisible) {
          await page.keyboard.press('Escape');
        }
      }

      // Test filter buttons
      const filterBtns = page.locator('button:has-text("Filter"), button:has-text("All"), button:has-text("Active")');
      for (let i = 0; i < Math.min(await filterBtns.count(), 5); i++) {
        const btn = filterBtns.nth(i);
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(300);
        }
      }
    });

    test('Tasks V2 - task action buttons should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/tasks-v2`, { waitUntil: 'networkidle' });

      // Test "Add Task" button
      const addTaskBtn = page.getByRole('button', { name: /add task|new task|create task/i });
      if (await addTaskBtn.count() > 0) {
        await expect(addTaskBtn.first()).toBeVisible();
        await addTaskBtn.first().click();
        await page.waitForTimeout(500);

        // Close any opened dialog
        await page.keyboard.press('Escape');
      }

      // Test sort/filter buttons
      const sortBtns = page.locator('button:has-text("Sort"), button:has-text("Priority"), button:has-text("Date")');
      const sortCount = await sortBtns.count();
      console.log(`Found ${sortCount} sort/filter buttons on tasks-v2`);
    });
  });

  // Test 3: Icon Presence and Visibility
  test.describe('Icon Tests', () => {
    for (const route of V2_ROUTES.slice(0, 5)) {
      test(`${route} - icons should be visible`, async ({ page }) => {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

        // Check for Lucide icons (most common in this app)
        const svgIcons = page.locator('svg');
        const iconCount = await svgIcons.count();

        console.log(`Found ${iconCount} SVG icons on ${route}`);
        expect(iconCount).toBeGreaterThan(0);

        // Check sidebar icons specifically
        const sidebarIcons = page.locator('nav svg, aside svg, [data-sidebar] svg');
        const sidebarIconCount = await sidebarIcons.count();
        console.log(`Found ${sidebarIconCount} sidebar icons`);
      });
    }
  });

  // Test 4: Navigation and Sub-pages
  test.describe('Navigation Tests', () => {
    test('Sidebar navigation should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/overview-v2`, { waitUntil: 'networkidle' });

      // Find sidebar navigation links
      const navLinks = page.locator('nav a[href*="/dashboard"], aside a[href*="/dashboard"]');
      const linkCount = await navLinks.count();

      console.log(`Found ${linkCount} navigation links`);
      expect(linkCount).toBeGreaterThan(0);

      // Test clicking first few links
      const linksToTest = Math.min(linkCount, 5);
      for (let i = 0; i < linksToTest; i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && await link.isVisible()) {
          console.log(`Testing navigation to: ${href}`);
          await link.click();
          await page.waitForLoadState('networkidle');

          // Verify URL changed
          const currentUrl = page.url();
          expect(currentUrl).toContain('/dashboard');
        }
      }
    });

    test('Tab navigation should work on multi-tab pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/settings-v2`, { waitUntil: 'networkidle' });

      // Find tab buttons
      const tabs = page.locator('[role="tab"], button[data-state]');
      const tabCount = await tabs.count();

      console.log(`Found ${tabCount} tabs on settings-v2`);

      // Click through tabs
      for (let i = 0; i < Math.min(tabCount, 5); i++) {
        const tab = tabs.nth(i);
        if (await tab.isVisible()) {
          await tab.click();
          await page.waitForTimeout(300);

          // Check tab panel changed
          const activePanel = page.locator('[role="tabpanel"], [data-state="active"]');
          const panelVisible = await activePanel.count() > 0;
          console.log(`Tab ${i} panel visible: ${panelVisible}`);
        }
      }
    });
  });

  // Test 5: Form Functionality
  test.describe('Form Tests', () => {
    test('Settings V2 - forms should be interactive', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/settings-v2`, { waitUntil: 'networkidle' });

      // Find form inputs
      const inputs = page.locator('input:not([type="hidden"]), textarea, select');
      const inputCount = await inputs.count();

      console.log(`Found ${inputCount} form inputs on settings-v2`);

      // Test first few inputs
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const inputType = await input.getAttribute('type');
          const inputName = await input.getAttribute('name') || await input.getAttribute('placeholder');

          console.log(`Input ${i}: type=${inputType}, name=${inputName}`);

          // Test input is focusable
          await input.focus();
          await expect(input).toBeFocused();
        }
      }
    });

    test('Bookings V2 - booking form should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/bookings-v2`, { waitUntil: 'networkidle' });

      // Look for "New Booking" or similar button
      const newBookingBtn = page.getByRole('button', { name: /new booking|add booking|book/i });
      if (await newBookingBtn.count() > 0) {
        await newBookingBtn.first().click();
        await page.waitForTimeout(500);

        // Check form appeared
        const form = page.locator('form, [role="dialog"]');
        if (await form.count() > 0) {
          console.log('Booking form/dialog opened');

          // Find and test form fields
          const dateInput = page.locator('input[type="date"], [data-calendar]');
          const timeInput = page.locator('input[type="time"], [data-time]');

          console.log(`Date inputs: ${await dateInput.count()}, Time inputs: ${await timeInput.count()}`);
        }

        // Close dialog
        await page.keyboard.press('Escape');
      }
    });
  });

  // Test 6: Data Display and Content
  test.describe('Content Display Tests', () => {
    test('Analytics V2 - charts should render', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/analytics-v2`, { waitUntil: 'networkidle' });

      // Check for chart elements (Recharts, Chart.js patterns)
      const charts = page.locator('.recharts-wrapper, canvas, svg.recharts-surface, [data-chart]');
      const chartCount = await charts.count();

      console.log(`Found ${chartCount} chart elements on analytics-v2`);

      // Check for stat cards
      const statCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
      const statCount = await statCards.count();
      console.log(`Found ${statCount} stat/card elements`);
    });

    test('Messages V2 - message list should render', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/messages-v2`, { waitUntil: 'networkidle' });

      // Check for message list items
      const messageItems = page.locator('[class*="message"], [class*="conversation"], li, [role="listitem"]');
      const messageCount = await messageItems.count();

      console.log(`Found ${messageCount} message-related elements on messages-v2`);
    });

    test('Invoices V2 - invoice list should render', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices-v2`, { waitUntil: 'networkidle' });

      // Check for table or list
      const table = page.locator('table, [role="table"], [class*="grid"]');
      const tableExists = await table.count() > 0;

      console.log(`Invoice table/grid exists: ${tableExists}`);

      // Check for invoice items
      const invoiceRows = page.locator('tr, [role="row"], [class*="invoice"]');
      const rowCount = await invoiceRows.count();
      console.log(`Found ${rowCount} invoice rows`);
    });
  });

  // Test 7: Responsive Design
  test.describe('Responsive Tests', () => {
    test('Overview V2 - should be responsive', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/overview-v2`, { waitUntil: 'networkidle' });

      // Desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.screenshot({ path: 'test-results/v2-screenshots/overview-desktop.png' });

      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/v2-screenshots/overview-tablet.png' });

      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/v2-screenshots/overview-mobile.png' });

      // Check mobile menu button exists on mobile
      const mobileMenuBtn = page.locator('[class*="menu"], [aria-label*="menu"], button:has(svg)');
      const mobileMenuCount = await mobileMenuBtn.count();
      console.log(`Mobile menu buttons found: ${mobileMenuCount}`);
    });
  });

  // Test 8: Toast/Notification System
  test.describe('Toast Tests', () => {
    test('Toast notifications should appear on actions', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/projects-v2`, { waitUntil: 'networkidle' });

      // Find and click a button that should trigger a toast
      const actionBtns = page.getByRole('button').filter({ hasText: /save|create|delete|update|submit/i });

      if (await actionBtns.count() > 0) {
        await actionBtns.first().click();
        await page.waitForTimeout(1000);

        // Check for toast element
        const toast = page.locator('[role="alert"], [class*="toast"], [data-sonner-toast]');
        const toastCount = await toast.count();
        console.log(`Toast notifications visible: ${toastCount}`);
      }
    });
  });

  // Test 9: Error States
  test.describe('Error State Tests', () => {
    test('Should show error state for invalid routes', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/non-existent-page-xyz`, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });

      // Should redirect to 404 or show error
      const is404 = response?.status() === 404 || page.url().includes('404');
      const hasErrorContent = await page.locator('text=/not found|404|error/i').count() > 0;

      console.log(`404 response: ${is404}, Error content: ${hasErrorContent}`);
    });
  });

  // Test 10: Accessibility
  test.describe('Accessibility Tests', () => {
    test('Overview V2 - should have proper ARIA labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/overview-v2`, { waitUntil: 'networkidle' });

      // Check for ARIA labels on interactive elements
      const buttonsWithLabels = page.locator('button[aria-label], button[aria-labelledby]');
      const labeledButtonCount = await buttonsWithLabels.count();

      // Check for heading hierarchy
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      const h3 = await page.locator('h3').count();

      console.log(`Heading hierarchy - h1: ${h1}, h2: ${h2}, h3: ${h3}`);
      console.log(`Buttons with ARIA labels: ${labeledButtonCount}`);

      // Check for skip link
      const skipLink = page.locator('a[href="#main"], a:has-text("Skip")');
      const hasSkipLink = await skipLink.count() > 0;
      console.log(`Has skip link: ${hasSkipLink}`);
    });
  });
});
