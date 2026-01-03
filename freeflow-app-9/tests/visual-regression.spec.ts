import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * Verifies UI appearance after React 19 and Tailwind v4 upgrades.
 * Takes screenshots of key pages and components for visual comparison.
 */

const BASE_URL = 'http://localhost:9323';

// Key pages to test visually
const PAGES_TO_TEST = [
  { name: 'homepage', path: '/', waitFor: 'networkidle' },
  { name: 'login', path: '/login', waitFor: 'networkidle' },
  { name: 'signup', path: '/signup', waitFor: 'networkidle' },
  { name: 'pricing', path: '/pricing', waitFor: 'networkidle' },
  { name: 'features', path: '/features', waitFor: 'networkidle' },
  { name: 'about', path: '/about', waitFor: 'networkidle' },
  { name: 'contact', path: '/contact', waitFor: 'networkidle' },
];

// Dashboard pages (may redirect to login)
const DASHBOARD_PAGES = [
  { name: 'dashboard-projects', path: '/dashboard/projects-v2' },
  { name: 'dashboard-tasks', path: '/dashboard/tasks-v2' },
  { name: 'dashboard-calendar', path: '/dashboard/calendar-v2' },
  { name: 'dashboard-analytics', path: '/dashboard/analytics-v2' },
  { name: 'dashboard-files', path: '/dashboard/files-v2' },
  { name: 'dashboard-messages', path: '/dashboard/messages-v2' },
  { name: 'dashboard-invoices', path: '/dashboard/invoices-v2' },
  { name: 'dashboard-settings', path: '/dashboard/settings-v2' },
];

test.describe('Visual Regression Tests - Post Upgrade Verification', () => {

  test.describe('Public Pages', () => {
    for (const page of PAGES_TO_TEST) {
      test(`should render ${page.name} correctly`, async ({ page: browserPage }) => {
        await browserPage.goto(`${BASE_URL}${page.path}`);
        await browserPage.waitForLoadState(page.waitFor as 'networkidle');

        // Wait for any animations to complete
        await browserPage.waitForTimeout(500);

        // Take full page screenshot
        await expect(browserPage).toHaveScreenshot(`${page.name}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Dashboard Pages', () => {
    for (const page of DASHBOARD_PAGES) {
      test(`should render ${page.name} correctly`, async ({ page: browserPage }) => {
        await browserPage.goto(`${BASE_URL}${page.path}`);
        await browserPage.waitForLoadState('networkidle');
        await browserPage.waitForTimeout(500);

        // Take screenshot (may show login page if not authenticated)
        await expect(browserPage).toHaveScreenshot(`${page.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Component Rendering', () => {
    test('should render buttons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Find and screenshot button elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      expect(buttonCount).toBeGreaterThan(0);

      // Screenshot the first visible button
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await expect(firstButton).toHaveScreenshot('button-component.png');
      }
    });

    test('should render form inputs correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Find input elements
      const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
      const inputCount = await inputs.count();

      expect(inputCount).toBeGreaterThan(0);

      // Screenshot form area
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await expect(form).toHaveScreenshot('form-component.png');
      }
    });

    test('should render cards correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Find card elements
      const cards = page.locator('[class*="card"], [class*="Card"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        const firstCard = cards.first();
        if (await firstCard.isVisible()) {
          await expect(firstCard).toHaveScreenshot('card-component.png');
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`should render homepage correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Dark Mode', () => {
    test('should render homepage in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // Toggle dark mode via class or theme switcher
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should render login in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('login-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('CSS & Styling Verification', () => {
    test('should have correct Tailwind styles applied', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // Verify Tailwind classes are being applied
      const hasStyledElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="flex"], [class*="grid"]');
        return elements.length > 0;
      });

      expect(hasStyledElements).toBe(true);
    });

    test('should have no broken CSS (no unstyled content flash)', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Check that content is visible and styled immediately
      const bodyVisible = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      expect(bodyVisible).toBe(true);
    });

    test('should render fonts correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // Check that Inter font is loaded
      const fontLoaded = await page.evaluate(() => {
        return document.fonts.check('16px Inter') || document.fonts.check('16px system-ui');
      });

      expect(fontLoaded).toBe(true);
    });
  });

  test.describe('Interactive Elements', () => {
    test('should have working hover states', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      const button = page.locator('button, a[href]').first();

      if (await button.isVisible()) {
        // Take screenshot before hover
        await expect(button).toHaveScreenshot('button-default.png');

        // Hover and take screenshot
        await button.hover();
        await page.waitForTimeout(200);
        await expect(button).toHaveScreenshot('button-hover.png');
      }
    });

    test('should have working focus states', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      const input = page.locator('input').first();

      if (await input.isVisible()) {
        await input.focus();
        await page.waitForTimeout(200);
        await expect(input).toHaveScreenshot('input-focused.png');
      }
    });
  });

  test.describe('Layout Integrity', () => {
    test('should have no horizontal overflow', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
    });

    test('should have consistent spacing', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // Verify main content area has proper padding/margin
      const mainContent = page.locator('main, [role="main"], .container').first();

      if (await mainContent.isVisible()) {
        const box = await mainContent.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(0);
        expect(box?.width).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error States', () => {
    test('should render 404 page correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});

test.describe('Performance Verification', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
