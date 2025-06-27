import { test as base } from &apos;@playwright/test&apos;;
import { DashboardPage } from &apos;../page-objects/dashboard-page&apos;;
import { LandingPage } from &apos;../page-objects/landing-page&apos;;
import { PaymentPage } from &apos;../page-objects/payment-page&apos;;
import { AuthPage } from &apos;../page-objects/auth-page&apos;;

// Extend basic test fixture
type TestFixtures = {
  dashboardPage: DashboardPage;
  landingPage: LandingPage;
  paymentPage: PaymentPage;
  authPage: AuthPage;
  mobileViewport: { width: number; height: number };
  testUser: { email: string; password: string };
};

export const test = base.extend<TestFixtures>({
  // Define mobile viewport
  mobileViewport: async ({}, use) => {
    await use({ width: 375, height: 812 }); // iPhone X dimensions
  },

  // Setup test user
  testUser: async ({}, use) => {
    await use({
      email: &apos;test@example.com&apos;,
      password: &apos;testpass123&apos;
    });
  },

  // Setup auth page
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  // Setup dashboard page
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // Setup landing page
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  // Setup payment page
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
}); 