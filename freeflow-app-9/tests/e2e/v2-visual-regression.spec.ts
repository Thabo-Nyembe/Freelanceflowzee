import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for V2 Dashboard Pages
 * Uses Playwright's screenshot comparison to detect visual changes
 */

const BASE_URL = 'http://localhost:9323';

// V2 Pages organized by category for visual testing
const V2_PAGES_FOR_VISUAL = {
  core: [
    'invoices-v2',
    'employees-v2',
    'tickets-v2',
    'contracts-v2',
    'budgets-v2',
    'bookings-v2',
  ],
  operations: [
    'inventory-v2',
    'analytics-v2',
    'billing-v2',
    'financial-v2',
    'time-tracking-v2',
    'expenses-v2',
  ],
  teams: [
    'team-management-v2',
    'user-management-v2',
    'roles-v2',
    'permissions-v2',
    'admin-v2',
  ],
  content: [
    'documentation-v2',
    'changelog-v2',
    'releases-v2',
    'media-library-v2',
    'content-v2',
  ],
  development: [
    'bugs-v2',
    'qa-v2',
    'testing-v2',
    'ci-cd-v2',
    'deployments-v2',
    'webhooks-v2',
    'api-v2',
  ],
  ai: [
    'ai-assistant-v2',
    'ai-design-v2',
    'ai-create-v2',
  ],
  security: [
    'security-v2',
    'access-logs-v2',
    'audit-logs-v2',
    'vulnerability-scan-v2',
    'compliance-v2',
  ],
  commerce: [
    'customers-v2',
    'clients-v2',
    'crm-v2',
    'sales-v2',
    'pricing-v2',
    'marketplace-v2',
    'shipping-v2',
  ],
  finance: [
    'payroll-v2',
    'transactions-v2',
    'escrow-v2',
  ],
  infrastructure: [
    'monitoring-v2',
    'maintenance-v2',
    'cloud-storage-v2',
    'resources-v2',
    'allocation-v2',
  ],
};

// Flatten all pages
const ALL_V2_PAGES = Object.values(V2_PAGES_FOR_VISUAL).flat();

// Test configuration for visual regression
test.describe.configure({ mode: 'parallel' });

test.describe('V2 Dashboard Visual Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.describe('Core Business Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.core) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');

        // Wait for animations to complete
        await page.waitForTimeout(500);

        // Take full page screenshot
        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
          mask: [
            // Mask dynamic content like timestamps, IDs
            page.locator('[data-testid="timestamp"]'),
            page.locator('[data-testid="dynamic-id"]'),
            page.locator('time'),
          ],
        });
      });
    }
  });

  test.describe('Operations Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.operations) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Team Management Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.teams) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Content Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.content) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Development Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.development) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('AI Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.ai) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Security Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.security) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Commerce Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.commerce) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Finance Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.finance) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Infrastructure Pages - Visual Tests @visual', () => {
    for (const pageName of V2_PAGES_FOR_VISUAL.infrastructure) {
      test(`visual: ${pageName} page layout`, async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageName}-full.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });
});

test.describe('Component Visual Tests', () => {

  test('visual: Create dialog component', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
    await page.waitForLoadState('networkidle');

    // Click create button to open dialog
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      // Screenshot the dialog
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await expect(dialog).toHaveScreenshot('create-dialog.png', {
          animations: 'disabled',
        });
      }
    }
  });

  test('visual: Data table component', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/employees-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Screenshot the table area
    const table = page.locator('table, [role="table"], [class*="table"]').first();
    if (await table.isVisible()) {
      await expect(table).toHaveScreenshot('data-table.png', {
        animations: 'disabled',
      });
    }
  });

  test('visual: Stats cards component', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/analytics-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Screenshot stats section
    const statsSection = page.locator('[class*="stat"], [class*="metric"], [class*="card"]').first();
    if (await statsSection.isVisible()) {
      await expect(statsSection).toHaveScreenshot('stats-cards.png', {
        animations: 'disabled',
      });
    }
  });

  test('visual: Navigation sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Screenshot sidebar
    const sidebar = page.locator('nav, [role="navigation"], aside').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('navigation-sidebar.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Responsive Visual Tests', () => {

  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`visual: invoices-v2 at ${viewport.name} size`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`invoices-v2-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`visual: analytics-v2 at ${viewport.name} size`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/dashboard/analytics-v2`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`analytics-v2-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`visual: settings-v2 at ${viewport.name} size`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/dashboard/settings-v2`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`settings-v2-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Dark Mode Visual Tests', () => {

  test('visual: invoices-v2 dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('invoices-v2-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('visual: analytics-v2 dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(`${BASE_URL}/dashboard/analytics-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('analytics-v2-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('visual: settings-v2 dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto(`${BASE_URL}/dashboard/settings-v2`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('settings-v2-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Interaction State Visual Tests', () => {

  test('visual: Button hover states', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    if (await createBtn.isVisible()) {
      // Hover state
      await createBtn.hover();
      await page.waitForTimeout(300);

      await expect(createBtn).toHaveScreenshot('button-hover-state.png', {
        animations: 'disabled',
      });
    }
  });

  test('visual: Input focus states', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
    await page.waitForLoadState('networkidle');

    // Open dialog
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        const input = dialog.locator('input').first();
        if (await input.isVisible()) {
          await input.focus();
          await page.waitForTimeout(200);

          await expect(input).toHaveScreenshot('input-focus-state.png', {
            animations: 'disabled',
          });
        }
      }
    }
  });
});
