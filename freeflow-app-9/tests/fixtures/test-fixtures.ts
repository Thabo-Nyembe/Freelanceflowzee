import { test as base } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard-page';
import { LandingPage } from '../page-objects/landing-page';
import { PaymentPage } from '../page-objects/payment-page';
import { AuthPage } from '../page-objects/auth-page';

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
      email: 'test@example.com',
      password: 'testpass123'
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