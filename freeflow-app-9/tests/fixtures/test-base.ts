import { test as base } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard-page';
import { AuthPage } from '../page-objects/auth-page';
import { ProjectPage } from '../page-objects/project-page';
import { PaymentPage } from '../page-objects/payment-page';

// Declare the types of your fixtures
type Fixtures = {
  dashboardPage: DashboardPage;
  authPage: AuthPage;
  projectPage: ProjectPage;
  paymentPage: PaymentPage;
  authenticatedPage: any;
};

// Extend the base test with your fixtures
export const test = base.extend<Fixtures>({
  // Define a fixture for authenticated page
  authenticatedPage: async ({ page }, use) => {
    // Set test mode headers
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'user-agent': 'Playwright/Test Runner'
    });

    await use(page);
  },

  // Define page object fixtures
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  projectPage: async ({ page }, use) => {
    await use(new ProjectPage(page));
  },

  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
});

export { expect } from '@playwright/test';
