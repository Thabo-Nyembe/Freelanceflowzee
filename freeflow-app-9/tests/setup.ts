import { test as base, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Define custom fixtures
type CustomFixtures = {
  auth: Page;
  authenticatedPage: Page;
};

// Extend base test with auth handling
export const test = base.extend<CustomFixtures>({
  // Authenticate before tests
  auth: async ({ page }, use) => {
    // Log in test user via POST request
    await page.goto('http://localhost:3001');
    const response = await page.request.post('http://localhost:3001/api/auth/test-login');
    expect(response.ok()).toBeTruthy();

    // Wait for cookies to be set
    await page.waitForTimeout(1000);

    await use(page);
  },

  // Set up authenticated page
  authenticatedPage: async ({ page }, use) => {
    // Log in test user via POST request
    await page.goto('http://localhost:3001');
    const response = await page.request.post('http://localhost:3001/api/auth/test-login');
    expect(response.ok()).toBeTruthy();

    // Wait for cookies to be set
    await page.waitForTimeout(1000);

    await use(page);
  }
});

export { expect } from '@playwright/test'; 