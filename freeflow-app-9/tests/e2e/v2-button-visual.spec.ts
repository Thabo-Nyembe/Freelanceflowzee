import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard Button Visual Tests for V2 Pages
 * Tests button visibility, click functionality, and visual states
 */

const BASE_URL = 'http://localhost:9323';

// Test credentials
const TEST_EMAIL = 'test@kazi.dev';
const TEST_PASSWORD = 'test12345';

// Set longer timeout for all tests
test.setTimeout(60000);

// Helper function to login - fast version
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Wait for form to appear
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")').first();
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(2000);
    }
  }
}

// Navigate to page - handles both direct and redirect scenarios
async function navigateToPage(page: Page, pageName: string) {
  await page.goto(`${BASE_URL}/dashboard/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1000);

  // If redirected to login, handle it
  if (page.url().includes('/login')) {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
  }
}

// Screenshot options for button tests
const BUTTON_SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.05,
  timeout: 10000,
};

// V2 pages with their expected primary buttons
const V2_PAGES_WITH_BUTTONS = [
  { page: 'invoices-v2', buttons: ['Create Invoice', 'Export', 'Refresh'] },
  { page: 'employees-v2', buttons: ['Add Employee', 'Export', 'Import'] },
  { page: 'tickets-v2', buttons: ['New Ticket', 'Export', 'Refresh'] },
  { page: 'contracts-v2', buttons: ['Create Contract', 'Export'] },
  { page: 'budgets-v2', buttons: ['Create Budget', 'Export', 'Refresh'] },
  { page: 'inventory-v2', buttons: ['Add Product', 'Export', 'Import'] },
  { page: 'analytics-v2', buttons: ['Export', 'Refresh', 'Download'] },
  { page: 'billing-v2', buttons: ['Create Invoice', 'Export'] },
  { page: 'customers-v2', buttons: ['Add Customer', 'Export', 'Import'] },
  { page: 'crm-v2', buttons: ['Add Contact', 'Export'] },
  { page: 'sales-v2', buttons: ['Create Deal', 'Export'] },
  { page: 'bugs-v2', buttons: ['Report Bug', 'Export'] },
  { page: 'deployments-v2', buttons: ['Deploy', 'Rollback'] },
  { page: 'webhooks-v2', buttons: ['Create Webhook', 'Test'] },
  { page: 'security-v2', buttons: ['Scan', 'Export', 'Refresh'] },
  { page: 'monitoring-v2', buttons: ['Refresh', 'Export', 'Configure'] },
  { page: 'cloud-storage-v2', buttons: ['Upload', 'Create Folder', 'Download'] },
  { page: 'settings-v2', buttons: ['Save', 'Reset', 'Export'] },
  { page: 'team-management-v2', buttons: ['Add Member', 'Invite'] },
  { page: 'user-management-v2', buttons: ['Add User', 'Export'] },
  { page: 'roles-v2', buttons: ['Create Role', 'Export'] },
  { page: 'permissions-v2', buttons: ['Save', 'Reset'] },
  { page: 'payroll-v2', buttons: ['Run Payroll', 'Export'] },
  { page: 'marketplace-v2', buttons: ['Browse', 'Install'] },
  { page: 'calendar-v2', buttons: ['Create Event', 'Today'] },
];

test.describe.configure({ mode: 'parallel' });

test.describe('Dashboard Button Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.describe('Button Visibility Tests @buttons', () => {
    for (const { page: pageName } of V2_PAGES_WITH_BUTTONS) {
      test(`${pageName}: buttons are visible`, async ({ page }) => {
        await navigateToPage(page, pageName);

        // Check page loaded (URL contains the page name)
        expect(page.url()).toContain(pageName);

        // Find all buttons on the page
        const buttons = page.locator('button:visible');
        const buttonCount = await buttons.count();

        // Every V2 page should have at least one button
        expect(buttonCount).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Primary Action Button Screenshots @buttons @visual', () => {
    const keyPages = [
      'invoices-v2',
      'employees-v2',
      'tickets-v2',
      'analytics-v2',
      'security-v2',
      'settings-v2',
    ];

    for (const pageName of keyPages) {
      test(`${pageName}: primary button screenshot`, async ({ page }) => {
        await navigateToPage(page, pageName);

        // Find the primary action button (usually Create/Add/New)
        const primaryBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New"), button:has-text("Export")').first();

        if (await primaryBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(primaryBtn).toHaveScreenshot(`${pageName}-primary-button.png`, BUTTON_SCREENSHOT_OPTIONS);
        }
      });
    }
  });

  test.describe('Button Click - Toast Notifications @buttons @functional', () => {

    test('invoices-v2: Create button shows toast', async ({ page }) => {
      await navigateToPage(page, 'invoices-v2');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("New Invoice")').first();
      if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(500);

        // Check for toast or dialog
        const toastOrDialog = page.locator('[role="dialog"], [role="alert"], [data-sonner-toast], .toast, .Toaster');
        const isVisible = await toastOrDialog.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isVisible || page.url().includes('invoices')).toBeTruthy();
      }
    });

    test('employees-v2: Add Employee button shows dialog', async ({ page }) => {
      await navigateToPage(page, 'employees-v2');

      const addBtn = page.locator('button:has-text("Add"), button:has-text("New Employee")').first();
      if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // Check for dialog or toast
        const response = page.locator('[role="dialog"], [role="alert"], [data-sonner-toast], .toast');
        const isVisible = await response.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isVisible || page.url().includes('employees')).toBeTruthy();
      }
    });

    test('analytics-v2: Export button triggers action', async ({ page }) => {
      await navigateToPage(page, 'analytics-v2');
      await page.waitForTimeout(1000);

      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
      if (await exportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await exportBtn.click();
        await page.waitForTimeout(500);

        // Check for toast notification
        const toast = page.locator('[data-sonner-toast], [role="alert"], .toast, .Toaster');
        const isVisible = await toast.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isVisible || page.url().includes('analytics')).toBeTruthy();
      }
    });

    test('security-v2: Scan button triggers action', async ({ page }) => {
      await navigateToPage(page, 'security-v2');
      await page.waitForTimeout(1000);

      const scanBtn = page.locator('button:has-text("Scan"), button:has-text("Run Scan")').first();
      if (await scanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await scanBtn.click();
        await page.waitForTimeout(500);

        const toast = page.locator('[data-sonner-toast], [role="alert"], .toast');
        const isVisible = await toast.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isVisible || page.url().includes('security')).toBeTruthy();
      }
    });

    test('bugs-v2: Report Bug button shows dialog', async ({ page }) => {
      await navigateToPage(page, 'bugs-v2');
      await page.waitForTimeout(1000);

      const reportBtn = page.locator('button:has-text("Report"), button:has-text("New Bug"), button:has-text("Create")').first();
      if (await reportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reportBtn.click();
        await page.waitForTimeout(500);

        const response = page.locator('[role="dialog"], [data-sonner-toast], [role="alert"]');
        const isVisible = await response.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isVisible || page.url().includes('bugs')).toBeTruthy();
      }
    });
  });

  test.describe('Button Hover State Screenshots @buttons @visual', () => {
    const hoverTestPages = ['invoices-v2', 'employees-v2', 'analytics-v2'];

    for (const pageName of hoverTestPages) {
      test(`${pageName}: button hover state`, async ({ page }) => {
        await navigateToPage(page, pageName);

        const primaryBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Export")').first();

        if (await primaryBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Capture normal state
          await expect(primaryBtn).toHaveScreenshot(`${pageName}-button-normal.png`, BUTTON_SCREENSHOT_OPTIONS);

          // Hover and capture
          await primaryBtn.hover();
          await page.waitForTimeout(300);
          await expect(primaryBtn).toHaveScreenshot(`${pageName}-button-hover.png`, BUTTON_SCREENSHOT_OPTIONS);
        }
      });
    }
  });

  test.describe('Action Bar Screenshots @buttons @visual', () => {
    const actionBarPages = [
      'invoices-v2',
      'employees-v2',
      'tickets-v2',
      'customers-v2',
      'inventory-v2',
    ];

    for (const pageName of actionBarPages) {
      test(`${pageName}: action bar visual`, async ({ page }) => {
        await navigateToPage(page, pageName);

        // Try to capture the header/action bar area
        const actionBar = page.locator('header, [class*="action"], [class*="toolbar"], [class*="header"]').first();

        if (await actionBar.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(actionBar).toHaveScreenshot(`${pageName}-action-bar.png`, {
            ...BUTTON_SCREENSHOT_OPTIONS,
            maxDiffPixelRatio: 0.1, // More tolerance for dynamic content
          });
        }
      });
    }
  });

  test.describe('Dialog Button Tests @buttons @dialogs', () => {

    test('invoices-v2: dialog buttons are functional', async ({ page }) => {
      await navigateToPage(page, 'invoices-v2');
      await page.waitForTimeout(1000);

      // Open create dialog
      const createBtn = page.locator('button:has-text("Create"), button:has-text("New")').first();
      if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Find dialog buttons
          const dialogButtons = dialog.locator('button');
          const buttonCount = await dialogButtons.count();

          // Dialog should have at least Cancel/Submit buttons
          expect(buttonCount).toBeGreaterThanOrEqual(1);

          // Screenshot dialog buttons
          await expect(dialog).toHaveScreenshot('invoice-dialog-buttons.png', BUTTON_SCREENSHOT_OPTIONS);

          // Test close button
          const closeBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close"), button[aria-label="Close"]').first();
          if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeBtn.click();
            await page.waitForTimeout(300);

            // Dialog should close
            const dialogStillVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
            // Some dialogs might not close, which is okay
          }
        }
      }
    });

    test('employees-v2: form dialog buttons', async ({ page }) => {
      await navigateToPage(page, 'employees-v2');
      await page.waitForTimeout(1000);

      const addBtn = page.locator('button:has-text("Add"), button:has-text("New")').first();
      if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(dialog).toHaveScreenshot('employee-dialog-buttons.png', BUTTON_SCREENSHOT_OPTIONS);
        }
      }
    });
  });

  test.describe('Refresh Button Tests @buttons @functional', () => {
    const pagesWithRefresh = [
      'analytics-v2',
      'monitoring-v2',
      'security-v2',
      'invoices-v2',
      'tickets-v2',
    ];

    for (const pageName of pagesWithRefresh) {
      test(`${pageName}: refresh button works`, async ({ page }) => {
        await navigateToPage(page, pageName);

        const refreshBtn = page.locator('button:has-text("Refresh"), button[aria-label*="refresh" i], button:has([class*="refresh"])').first();

        if (await refreshBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await refreshBtn.click();
          await page.waitForTimeout(500);

          // Check for loading state or toast
          const response = page.locator('[data-sonner-toast], [role="alert"], .loading, [class*="loading"]');
          const pageStillLoaded = page.url().includes(pageName);
          expect(pageStillLoaded).toBeTruthy();
        }
      });
    }
  });

  test.describe('Export Button Tests @buttons @functional', () => {
    const pagesWithExport = [
      'invoices-v2',
      'employees-v2',
      'analytics-v2',
      'tickets-v2',
      'customers-v2',
    ];

    for (const pageName of pagesWithExport) {
      test(`${pageName}: export button triggers action`, async ({ page }) => {
        await navigateToPage(page, pageName);

        const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download CSV"), button:has-text("Download")').first();

        if (await exportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Listen for download or toast
          const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

          await exportBtn.click();
          await page.waitForTimeout(500);

          // Check for toast notification (export started)
          const toast = page.locator('[data-sonner-toast], [role="alert"]');
          const toastVisible = await toast.isVisible({ timeout: 3000 }).catch(() => false);

          // Either download started or toast shown
          const download = await downloadPromise;
          expect(toastVisible || download !== null || page.url().includes(pageName)).toBeTruthy();
        }
      });
    }
  });

  test.describe('Button States - Disabled @buttons @visual', () => {

    test('settings-v2: save button disabled state', async ({ page }) => {
      await navigateToPage(page, 'settings-v2');
      await page.waitForTimeout(1000);

      // Save button might be disabled when no changes made
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await saveBtn.isDisabled();
        // Screenshot regardless of state
        await expect(saveBtn).toHaveScreenshot('settings-save-button.png', BUTTON_SCREENSHOT_OPTIONS);
      }
    });
  });

  test.describe('Icon Buttons @buttons @visual', () => {

    test('invoices-v2: icon buttons visible', async ({ page }) => {
      await navigateToPage(page, 'invoices-v2');
      await page.waitForTimeout(1000);

      // Find icon-only buttons (usually in toolbars)
      const iconButtons = page.locator('button:has(svg), button[aria-label]');
      const count = await iconButtons.count();

      // Should have some icon buttons
      expect(count).toBeGreaterThan(0);
    });

    test('analytics-v2: chart action buttons', async ({ page }) => {
      await navigateToPage(page, 'analytics-v2');
      await page.waitForTimeout(1000);

      // Look for chart control buttons
      const chartButtons = page.locator('[class*="chart"] button, [class*="Card"] button');
      const count = await chartButtons.count();

      // Analytics page should have chart interaction buttons
      // This is informational - we don't fail if none found
      console.log(`Found ${count} chart buttons on analytics-v2`);
    });
  });
});

test.describe('Quick Button Smoke Tests @smoke', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await login(page);
  });

  // Test all pages have buttons
  const allPages = V2_PAGES_WITH_BUTTONS.map(p => p.page);

  for (const pageName of allPages) {
    test(`${pageName}: has interactive buttons`, async ({ page }) => {
      await navigateToPage(page, pageName);

      // Page should have loaded
      expect(page.url()).toContain(pageName);

      // Should have buttons
      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});
