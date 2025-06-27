import { test as base } from &apos;@playwright/test&apos;;
import { DashboardPage } from &apos;../page-objects/dashboard-page&apos;;
import { AuthPage } from &apos;../page-objects/auth-page&apos;;
import { ProjectPage } from &apos;../page-objects/project-page&apos;;
import { PaymentPage } from &apos;../page-objects/payment-page&apos;;

// Declare the types of your fixtures
type Fixtures = {
  dashboardPage: DashboardPage;
  authPage: AuthPage;
  projectPage: ProjectPage;
  paymentPage: PaymentPage;
  authenticatedPage: unknown;
};

// Extend the base test with your fixtures
export const test = base.extend<Fixtures>({
  // Define a fixture for authenticated page
  authenticatedPage: async ({ page }, use) => {
    // Set test mode headers
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;user-agent&apos;: &apos;Playwright/Test Runner&apos;
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

export { expect } from &apos;@playwright/test&apos;;
