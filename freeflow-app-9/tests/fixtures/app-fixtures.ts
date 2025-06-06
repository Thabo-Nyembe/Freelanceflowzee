import { test as base, type Page, type Locator, type BrowserContext } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page';
import { DashboardPage } from '../page-objects/dashboard-page';
import { AuthPage } from '../page-objects/auth-page';
import { PaymentPage } from '../page-objects/payment-page';
import { ProjectPage } from '../page-objects/project-page';
import { FeedbackPage } from '../page-objects/feedback-page';
import { ContactPage } from '../page-objects/contact-page';
import { ProfilePage } from '../page-objects/profile-page';

// Define test options for configuration
export type TestOptions = {
  baseURL: string;
  testMode: 'development' | 'staging' | 'production';
  slowMo: number;
  mobileViewport: { width: number; height: number };
  adminStorageState: string;
  userStorageState: string;
};

// Define all page object fixtures
type PageFixtures = {
  landingPage: LandingPage;
  dashboardPage: DashboardPage;
  authPage: AuthPage;
  paymentPage: PaymentPage;
  projectPage: ProjectPage;
  feedbackPage: FeedbackPage;
  contactPage: ContactPage;
  profilePage: ProfilePage;
};

// Define authentication fixtures
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  unauthenticatedPage: Page;
};

// Define test data fixtures
type DataFixtures = {
  testUser: {
    email: string;
    password: string;
    name: string;
  };
  testProject: {
    name: string;
    description: string;
    price: number;
  };
  testPayment: {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    name: string;
  };
};

// Combine all fixtures
type AllFixtures = TestOptions & PageFixtures & AuthFixtures & DataFixtures;

export const test = base.extend<AllFixtures>({
  // Configuration options
  baseURL: ['http://localhost:3000', { option: true }],
  testMode: ['development', { option: true }],
  slowMo: [0, { option: true }],
  mobileViewport: [{ width: 375, height: 812 }, { option: true }],
  adminStorageState: ['tests/.auth/admin.json', { option: true }],
  userStorageState: ['tests/.auth/user.json', { option: true }],

  // Test data fixtures
  testUser: [
    {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User'
    },
    { option: true }
  ],

  testProject: [
    {
      name: 'Test Project',
      description: 'A test project for automated testing',
      price: 99.99
    },
    { option: true }
  ],

  testPayment: [
    {
      cardNumber: '4242424242424242',
      expiryDate: '12/28',
      cvc: '123',
      name: 'Test User'
    },
    { option: true }
  ],

  // Enhanced page fixture with test mode headers
  page: async ({ page, baseURL, testMode }, use) => {
    // Set test mode headers for bypassing authentication
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'x-dev-bypass': testMode === 'development' ? 'true' : 'false'
    });

    // Navigate to base URL
    await page.goto(baseURL);
    
    await use(page);
  },

  // Unauthenticated page fixture
  unauthenticatedPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
    
    await page.goto(baseURL);
    await use(page);
    await context.close();
  },

  // Authenticated page fixture
  authenticatedPage: async ({ browser, baseURL, testUser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'x-dev-bypass': 'true'
    });

    await page.goto(`${baseURL}/login`);
    
    // Perform login
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard**');
    
    await use(page);
    await context.close();
  },

  // Admin page fixture
  adminPage: async ({ browser, adminStorageState, baseURL }, use) => {
    const context = await browser.newContext({ 
      storageState: adminStorageState 
    });
    const page = await context.newPage();
    
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
    
    await page.goto(baseURL);
    await use(page);
    await context.close();
  },

  // Page Object fixtures
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },

  dashboardPage: async ({ authenticatedPage }, use) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.goto();
    await use(dashboardPage);
  },

  authPage: async ({ unauthenticatedPage }, use) => {
    const authPage = new AuthPage(unauthenticatedPage);
    await use(authPage);
  },

  paymentPage: async ({ authenticatedPage }, use) => {
    const paymentPage = new PaymentPage(authenticatedPage);
    await use(paymentPage);
  },

  projectPage: async ({ authenticatedPage }, use) => {
    const projectPage = new ProjectPage(authenticatedPage);
    await use(projectPage);
  },

  feedbackPage: async ({ authenticatedPage }, use) => {
    const feedbackPage = new FeedbackPage(authenticatedPage);
    await use(feedbackPage);
  },

  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await use(contactPage);
  },

  profilePage: async ({ authenticatedPage }, use) => {
    const profilePage = new ProfilePage(authenticatedPage);
    await use(profilePage);
  }
});

export { expect } from '@playwright/test'; 