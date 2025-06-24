import { test as base, type Page } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
};

const testUser = {
  email: 'thabo@kaleidocraft.co.za',
  password: 'password1234',
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/login');
    
    // Perform login using data-testid selectors
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test'; 