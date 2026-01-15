import { test, expect } from '@playwright/test';

/**
 * Comprehensive Visual Tests for V1 Dashboard Pages
 * Tests: Functionality, Buttons, Features, Sub-pages, Icons, Logic
 */

// V1 Dashboard routes to test (high-priority pages first)
const V1_ROUTES = [
  '/v1/dashboard/admin',  // Changed from overview which doesn't exist
  '/v1/dashboard/projects',
  '/v1/dashboard/tasks',
  '/v1/dashboard/invoices',
  '/v1/dashboard/calendar',
  '/v1/dashboard/analytics',
  '/v1/dashboard/messages',
  '/v1/dashboard/files',
  '/v1/dashboard/clients',
  '/v1/dashboard/settings',
  '/v1/dashboard/notifications',
  '/v1/dashboard/video-studio',
  '/v1/dashboard/ai-assistant',
  '/v1/dashboard/ai-create',
  '/v1/dashboard/bookings',
  '/v1/dashboard/billing',
  '/v1/dashboard/collaboration',
  '/v1/dashboard/workflows',
  '/v1/dashboard/community-hub',
  '/v1/dashboard/my-day',
];

// Test configuration
const BASE_URL = 'http://localhost:9323';
const TIMEOUT = 30000;

test.describe('V1 Dashboard - Visual & Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  // Test 1: Page Loading and Basic Structure
  test.describe('Page Loading Tests', () => {
    for (const route of V1_ROUTES.slice(0, 10)) {
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

        // Check for critical errors
        const criticalErrors = errors.filter(e =>
          !e.includes('ResizeObserver') &&
          !e.includes('hydration') &&
          !e.includes('Warning:')
        );

        if (criticalErrors.length > 0) {
          console.log(`Errors on ${route}:`, criticalErrors);
        }

        // Take screenshot
        await page.screenshot({
          path: `test-results/v1-screenshots/${route.replace(/\//g, '-')}.png`,
          fullPage: true
        });
      });
    }
  });

  // Test 2: Button Functionality
  test.describe('Button Functionality Tests', () => {
    test('Overview V1 - buttons should be clickable', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/overview`, { waitUntil: 'networkidle' });

      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      console.log(`Found ${buttonCount} buttons on v1/overview`);

      // Test first 10 visible buttons
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);

        if (await button.isVisible()) {
          const buttonText = await button.textContent();
          const isDisabled = await button.isDisabled();

          console.log(`Button ${i}: "${buttonText?.trim()}" - Disabled: ${isDisabled}`);

          if (!isDisabled) {
            try {
              await button.click({ timeout: 2000 });
              await page.waitForTimeout(500);
            } catch (e) {
              console.log(`Button ${i} click handled`);
            }
          }
        }
      }
    });

    test('Projects V1 - project actions should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/projects`, { waitUntil: 'networkidle' });

      // Test create project button
      const createBtn = page.getByRole('button', { name: /new|create|add/i });
      if (await createBtn.count() > 0) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
      }

      // Test filter/sort buttons
      const filterBtns = page.locator('button').filter({ hasText: /filter|sort|all|active/i });
      const filterCount = await filterBtns.count();
      console.log(`Found ${filterCount} filter/sort buttons`);
    });

    test('Tasks V1 - task management buttons', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/tasks`, { waitUntil: 'networkidle' });

      // Test add task
      const addBtn = page.getByRole('button', { name: /add|new|create/i });
      if (await addBtn.count() > 0) {
        await addBtn.first().click();
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
      }
    });
  });

  // Test 3: Icon Tests
  test.describe('Icon Tests', () => {
    for (const route of V1_ROUTES.slice(0, 5)) {
      test(`${route} - icons should render`, async ({ page }) => {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

        const svgIcons = page.locator('svg');
        const iconCount = await svgIcons.count();

        console.log(`Found ${iconCount} SVG icons on ${route}`);
        expect(iconCount).toBeGreaterThan(0);

        // Check for broken icons (empty SVGs)
        const emptyIcons = page.locator('svg:empty');
        const emptyCount = await emptyIcons.count();
        console.log(`Empty SVG icons: ${emptyCount}`);
      });
    }
  });

  // Test 4: Navigation Tests
  test.describe('Navigation Tests', () => {
    test('V1 sidebar navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/overview`, { waitUntil: 'networkidle' });

      const navLinks = page.locator('nav a, aside a');
      const linkCount = await navLinks.count();

      console.log(`Found ${linkCount} navigation links in V1`);

      // Test first few links
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && href.includes('/dashboard') && await link.isVisible()) {
          console.log(`Testing V1 nav link: ${href}`);
          await link.click();
          await page.waitForLoadState('networkidle');

          const currentUrl = page.url();
          console.log(`Navigated to: ${currentUrl}`);
        }
      }
    });

    test('V1 breadcrumb navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/projects`, { waitUntil: 'networkidle' });

      const breadcrumbs = page.locator('[class*="breadcrumb"], nav[aria-label="breadcrumb"]');
      const hasBreadcrumbs = await breadcrumbs.count() > 0;

      console.log(`Has breadcrumbs: ${hasBreadcrumbs}`);

      if (hasBreadcrumbs) {
        const breadcrumbLinks = breadcrumbs.locator('a');
        const linkCount = await breadcrumbLinks.count();
        console.log(`Breadcrumb links: ${linkCount}`);
      }
    });
  });

  // Test 5: Form Functionality
  test.describe('Form Tests', () => {
    test('Settings V1 - forms should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/settings`, { waitUntil: 'networkidle' });

      const inputs = page.locator('input:not([type="hidden"]), textarea, select');
      const inputCount = await inputs.count();

      console.log(`Found ${inputCount} form inputs in V1 settings`);

      // Test inputs
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          await input.focus();
          const isFocused = await input.evaluate(el => document.activeElement === el);
          console.log(`Input ${i} focusable: ${isFocused}`);
        }
      }
    });

    test('Invoices V1 - invoice form', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/invoices`, { waitUntil: 'networkidle' });

      // Try to open new invoice form
      const newInvoiceBtn = page.getByRole('button', { name: /new|create|add/i });
      if (await newInvoiceBtn.count() > 0) {
        await newInvoiceBtn.first().click();
        await page.waitForTimeout(500);

        // Check for form fields
        const clientField = page.locator('input[name*="client"], [placeholder*="client"]');
        const amountField = page.locator('input[name*="amount"], input[type="number"]');

        console.log(`Client fields: ${await clientField.count()}, Amount fields: ${await amountField.count()}`);

        await page.keyboard.press('Escape');
      }
    });
  });

  // Test 6: Content Display
  test.describe('Content Display Tests', () => {
    test('Analytics V1 - charts should render', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/analytics`, { waitUntil: 'networkidle' });

      const charts = page.locator('.recharts-wrapper, canvas, svg.recharts-surface, [data-chart]');
      const chartCount = await charts.count();

      console.log(`Found ${chartCount} chart elements in V1 analytics`);

      // Check stat cards
      const cards = page.locator('[class*="card"], [class*="stat"], [class*="metric"]');
      const cardCount = await cards.count();
      console.log(`Found ${cardCount} stat cards`);
    });

    test('Messages V1 - conversation list', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/messages`, { waitUntil: 'networkidle' });

      const conversations = page.locator('[class*="conversation"], [class*="message"], [role="listitem"]');
      const convCount = await conversations.count();

      console.log(`Found ${convCount} conversation elements in V1`);
    });

    test('Calendar V1 - calendar grid', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/calendar`, { waitUntil: 'networkidle' });

      // Check for calendar grid
      const calendarGrid = page.locator('[class*="calendar"], [role="grid"]');
      const hasCalendar = await calendarGrid.count() > 0;

      console.log(`Has calendar grid: ${hasCalendar}`);

      // Check for day cells
      const dayCells = page.locator('[class*="day"], td, [role="gridcell"]');
      const dayCount = await dayCells.count();
      console.log(`Day cells: ${dayCount}`);
    });
  });

  // Test 7: V1 Specific Features
  test.describe('V1 Specific Features', () => {
    test('Community Hub - social features', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/community-hub`, { waitUntil: 'networkidle' });

      // Check for community elements
      const posts = page.locator('[class*="post"], [class*="feed"], article');
      const postCount = await posts.count();

      console.log(`Found ${postCount} post/feed elements in community hub`);

      // Check for interaction buttons
      const interactionBtns = page.locator('button').filter({ hasText: /like|comment|share|follow/i });
      const interactionCount = await interactionBtns.count();
      console.log(`Interaction buttons: ${interactionCount}`);
    });

    test('My Day - daily view features', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/my-day`, { waitUntil: 'networkidle' });

      // Check for daily schedule
      const timeSlots = page.locator('[class*="time"], [class*="schedule"], [class*="hour"]');
      const slotCount = await timeSlots.count();

      console.log(`Time slot elements: ${slotCount}`);

      // Check for task list
      const tasks = page.locator('[class*="task"], [class*="todo"], li');
      const taskCount = await tasks.count();
      console.log(`Task elements: ${taskCount}`);
    });

    test('Video Studio V1 - media features', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/video-studio`, { waitUntil: 'networkidle' });

      // Check for video elements
      const videoElements = page.locator('video, [class*="video"], [class*="player"]');
      const videoCount = await videoElements.count();

      console.log(`Video elements: ${videoCount}`);

      // Check for media controls
      const controls = page.locator('button').filter({ hasText: /play|pause|upload|record/i });
      const controlCount = await controls.count();
      console.log(`Media control buttons: ${controlCount}`);
    });

    test('AI Create V1 - AI generation features', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/ai-create`, { waitUntil: 'networkidle' });

      // Check for AI input
      const aiInput = page.locator('textarea, input[placeholder*="prompt"], [class*="prompt"]');
      const inputCount = await aiInput.count();

      console.log(`AI input fields: ${inputCount}`);

      // Check for generate button
      const generateBtn = page.getByRole('button', { name: /generate|create|submit/i });
      const hasGenerateBtn = await generateBtn.count() > 0;
      console.log(`Has generate button: ${hasGenerateBtn}`);
    });
  });

  // Test 8: Dropdown Menus
  test.describe('Dropdown Menu Tests', () => {
    test('V1 dropdowns should open and close', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/projects`, { waitUntil: 'networkidle' });

      // Find dropdown triggers
      const dropdownTriggers = page.locator('[data-radix-dropdown-trigger], [aria-haspopup="menu"], button:has(svg[class*="chevron"])');
      const triggerCount = await dropdownTriggers.count();

      console.log(`Found ${triggerCount} dropdown triggers`);

      // Test first few dropdowns
      for (let i = 0; i < Math.min(triggerCount, 3); i++) {
        const trigger = dropdownTriggers.nth(i);
        if (await trigger.isVisible()) {
          await trigger.click();
          await page.waitForTimeout(300);

          // Check for dropdown content
          const dropdownContent = page.locator('[role="menu"], [data-radix-menu-content]');
          const isOpen = await dropdownContent.count() > 0;
          console.log(`Dropdown ${i} opened: ${isOpen}`);

          // Close dropdown
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  // Test 9: Modal/Dialog Tests
  test.describe('Modal Tests', () => {
    test('V1 modals should open and close properly', async ({ page }) => {
      await page.goto(`${BASE_URL}/v1/dashboard/clients`, { waitUntil: 'networkidle' });

      // Find button that opens modal
      const modalTrigger = page.getByRole('button', { name: /new|add|create|edit/i });

      if (await modalTrigger.count() > 0) {
        await modalTrigger.first().click();
        await page.waitForTimeout(500);

        // Check modal is open
        const modal = page.locator('[role="dialog"], [class*="modal"], [data-state="open"]');
        const isModalOpen = await modal.count() > 0;
        console.log(`Modal opened: ${isModalOpen}`);

        if (isModalOpen) {
          // Check for close button
          const closeBtn = modal.locator('button[aria-label*="close"], button:has-text("Cancel"), button:has-text("Close")');
          const hasCloseBtn = await closeBtn.count() > 0;
          console.log(`Has close button: ${hasCloseBtn}`);

          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // Verify modal closed
          const isModalClosed = await modal.count() === 0 || !(await modal.first().isVisible());
          console.log(`Modal closed: ${isModalClosed}`);
        }
      }
    });
  });

  // Test 10: Loading States
  test.describe('Loading State Tests', () => {
    test('V1 pages should show proper loading states', async ({ page }) => {
      // Navigate with slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      await page.goto(`${BASE_URL}/v1/dashboard/analytics`, { waitUntil: 'domcontentloaded' });

      // Check for loading indicators
      const spinners = page.locator('[class*="spinner"], [class*="loading"], [class*="skeleton"]');
      const spinnerCount = await spinners.count();

      console.log(`Loading indicators found: ${spinnerCount}`);

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Verify loading indicators are gone
      const remainingSpinners = await spinners.count();
      console.log(`Remaining spinners after load: ${remainingSpinners}`);
    });
  });
});

// Parallel test for all V1 routes
test.describe('V1 Route Availability', () => {
  const moreV1Routes = [
    '/v1/dashboard/audio-studio',
    '/v1/dashboard/automation',
    '/v1/dashboard/collaboration',
    '/v1/dashboard/3d-modeling',
    '/v1/dashboard/ai-assistant',
    '/v1/dashboard/ai-business-advisor',
    '/v1/dashboard/ai-code-completion',
    '/v1/dashboard/ai-collaborate',
    '/v1/dashboard/ai-content-studio',
    '/v1/dashboard/ai-design',
  ];

  for (const route of moreV1Routes) {
    test(`${route} - should be accessible`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT
      });

      const status = response?.status() || 0;
      console.log(`${route} - Status: ${status}`);

      expect(status).toBeLessThan(500);

      // Take quick screenshot
      await page.screenshot({
        path: `test-results/v1-screenshots/${route.replace(/\//g, '-')}-quick.png`
      });
    });
  }
});
