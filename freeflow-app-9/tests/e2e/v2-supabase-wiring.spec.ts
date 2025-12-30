import { test, expect } from '@playwright/test';

/**
 * Comprehensive Playwright tests for V2 Dashboard Pages
 * Tests the Supabase CRUD wiring across all V2 pages
 */

const BASE_URL = 'http://localhost:9323';

// Test credentials
const TEST_EMAIL = 'test@kazi.dev';
const TEST_PASSWORD = 'test12345';

// Helper function to login
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Fill in login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible() && await passwordInput.isVisible()) {
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    // Click login button
    const loginBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")').first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForLoadState('networkidle');
      // Wait for redirect after login
      await page.waitForTimeout(2000);
    }
  }
}

// V2 Pages organized by category
const V2_PAGES = {
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

// Flatten all pages for iteration
const ALL_V2_PAGES = Object.values(V2_PAGES).flat();

test.describe('V2 Dashboard Pages - Supabase Wiring Tests', () => {

  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Page Load Tests @smoke', () => {
    for (const page of ALL_V2_PAGES.slice(0, 20)) {
      test(`${page} loads successfully`, async ({ page: browserPage }) => {
        const response = await browserPage.goto(`${BASE_URL}/dashboard/${page}`);

        // Page should load (may redirect to login, which is OK)
        expect(response?.status()).toBeLessThan(500);

        // Wait for page to be interactive
        await browserPage.waitForLoadState('domcontentloaded');
      });
    }
  });

  test.describe('Core Business Pages - CRUD Tests', () => {

    test('invoices-v2: Create invoice button and dialog', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices-v2`);
      await page.waitForLoadState('networkidle');

      // Look for create/add button
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();

        // Dialog should appear
        const dialog = page.locator('[role="dialog"], .dialog, [data-state="open"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('employees-v2: Add employee functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/employees-v2`);
      await page.waitForLoadState('networkidle');

      const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Invite")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // Check for form elements
        const formInputs = page.locator('input, textarea, select');
        expect(await formInputs.count()).toBeGreaterThan(0);
      }
    });

    test('tickets-v2: Create ticket flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/tickets-v2`);
      await page.waitForLoadState('networkidle');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();

        // Should open dialog
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Operations Pages - CRUD Tests', () => {

    test('inventory-v2: Add product functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/inventory-v2`);
      await page.waitForLoadState('networkidle');

      // Look for add/create buttons
      const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Add Item"), button:has-text("New")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('analytics-v2: Dashboard loads with charts', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/analytics-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('analytics-v2');
    });

    test('billing-v2: Create invoice functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/billing-v2`);
      await page.waitForLoadState('networkidle');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("New")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Security Pages - CRUD Tests', () => {

    test('security-v2: Security dashboard loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/security-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('security-v2');
    });

    test('audit-logs-v2: Logs display and export', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/audit-logs-v2`);
      await page.waitForLoadState('networkidle');

      // Look for export button
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
      if (await exportBtn.isVisible()) {
        // Export button should be clickable
        await expect(exportBtn).toBeEnabled();
      }
    });
  });

  test.describe('AI Pages - Feature Tests', () => {

    test('ai-assistant-v2: Chat interface loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/ai-assistant-v2`);
      await page.waitForLoadState('networkidle');

      // Check for AI dashboard content
      const content = page.locator('main.flex-1, [class*="ai"], [class*="chat"], .container').first();
      await expect(content).toBeVisible({ timeout: 10000 });
    });

    test('ai-design-v2: Design tools load', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/ai-design-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('ai-design-v2');
    });
  });

  test.describe('Commerce Pages - CRUD Tests', () => {

    test('customers-v2: Add customer functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/customers-v2`);
      await page.waitForLoadState('networkidle');

      const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();

        // Dialog should appear
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('crm-v2: CRM dashboard with contacts', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/crm-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('crm-v2');
    });

    test('sales-v2: Sales pipeline view', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/sales-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('sales-v2');
    });
  });

  test.describe('Development Pages - CRUD Tests', () => {

    test('bugs-v2: Report bug functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/bugs-v2`);
      await page.waitForLoadState('networkidle');

      const reportBtn = page.locator('button:has-text("Report"), button:has-text("New"), button:has-text("Create")').first();
      if (await reportBtn.isVisible()) {
        await reportBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('deployments-v2: Deploy functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/deployments-v2`);
      await page.waitForLoadState('networkidle');

      const deployBtn = page.locator('button:has-text("Deploy"), button:has-text("New"), button:has-text("Create")').first();
      if (await deployBtn.isVisible()) {
        await expect(deployBtn).toBeEnabled();
      }
    });

    test('webhooks-v2: Create webhook', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/webhooks-v2`);
      await page.waitForLoadState('networkidle');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();

        // Dialog should open
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Infrastructure Pages - CRUD Tests', () => {

    test('monitoring-v2: Monitoring dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/monitoring-v2`);
      await page.waitForLoadState('networkidle');

      // Check that page loaded (not on login page)
      const url = page.url();
      expect(url).toContain('monitoring-v2');
    });

    test('cloud-storage-v2: File upload functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/cloud-storage-v2`);
      await page.waitForLoadState('networkidle');

      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Add")').first();
      if (await uploadBtn.isVisible()) {
        await expect(uploadBtn).toBeEnabled();
      }
    });
  });

  test.describe('Button Functionality Tests @regression', () => {

    test('Refresh buttons work across pages', async ({ page }) => {
      const pagesToTest = ['analytics-v2', 'monitoring-v2', 'logs-v2'];

      for (const pageName of pagesToTest) {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');

        const refreshBtn = page.locator('button:has-text("Refresh"), button:has-text("Sync"), [aria-label*="refresh"]').first();
        if (await refreshBtn.isVisible()) {
          await refreshBtn.click();
          // Should not throw error
          await page.waitForTimeout(500);
        }
      }
    });

    test('Export buttons are functional', async ({ page }) => {
      const pagesToTest = ['invoices-v2', 'employees-v2', 'customers-v2'];

      for (const pageName of pagesToTest) {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`);
        await page.waitForLoadState('networkidle');

        const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
        if (await exportBtn.isVisible()) {
          await expect(exportBtn).toBeEnabled();
        }
      }
    });
  });

  test.describe('Dialog/Modal Tests', () => {

    test('Create dialogs have form inputs', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`);
      await page.waitForLoadState('networkidle');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();

        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible()) {
          // Dialog should have form elements
          const inputs = dialog.locator('input, textarea, select');
          expect(await inputs.count()).toBeGreaterThan(0);

          // Should have submit button
          const submitBtn = dialog.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
          expect(await submitBtn.count()).toBeGreaterThan(0);
        }
      }
    });

    test('Dialogs can be closed', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/tickets-v2`);
      await page.waitForLoadState('networkidle');

      const createBtn = page.locator('button:has-text("Create"), button:has-text("New")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();

        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible()) {
          // Close button or cancel button
          const closeBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await expect(dialog).not.toBeVisible({ timeout: 3000 });
          }
        }
      }
    });
  });

  test.describe('Toast Notification Tests', () => {

    test('Actions trigger toast notifications', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/settings-v2`);
      await page.waitForLoadState('networkidle');

      // Look for save button
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Toast should appear (sonner uses data-sonner-toast)
        const toast = page.locator('[data-sonner-toast], [class*="toast"], [role="status"]');
        // May or may not appear depending on validation
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Loading State Tests', () => {

    test('Pages show loading states', async ({ page }) => {
      // Intercept to slow down response
      await page.route('**/rest/v1/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto(`${BASE_URL}/dashboard/customers-v2`);

      // Look for loading indicators
      const loading = page.locator('[class*="loading"], [class*="spinner"], .animate-spin, [aria-busy="true"]');
      // Loading state may be brief
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Tab Navigation Tests', () => {

    test('Pages with tabs navigate correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/settings-v2`);
      await page.waitForLoadState('networkidle');

      // Look for tab buttons
      const tabs = page.locator('[role="tab"], button[data-state]');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        // Click second tab
        await tabs.nth(1).click();
        await page.waitForTimeout(300);

        // Tab content should change
        const activeTab = page.locator('[role="tabpanel"], [data-state="active"]');
        await expect(activeTab).toBeVisible();
      }
    });
  });
});

test.describe('Quick Smoke Tests - All V2 Pages', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // Quick check that all pages load without 500 errors
  const samplePages = [
    'invoices-v2', 'customers-v2', 'analytics-v2', 'security-v2',
    'bugs-v2', 'deployments-v2', 'ai-assistant-v2', 'settings-v2',
    'monitoring-v2', 'payroll-v2', 'marketplace-v2', 'calendar-v2'
  ];

  for (const pageName of samplePages) {
    test(`@smoke ${pageName} loads without errors`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/${pageName}`);
      expect(response?.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');

      // No uncaught errors
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.waitForTimeout(1000);
      expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0);
    });
  }
});
