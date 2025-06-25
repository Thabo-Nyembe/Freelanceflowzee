import { test, expect } from '@playwright/test';

test.describe('App Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('should load the app without errors', async ({ page }) => {
    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Check for failed requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      const failure = request.failure();
      failedRequests.push(`Failed Request: ${request.url()} - ${failure?.errorText || 'Unknown error'}`);
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (errors.length > 0) {
      console.log('Console Errors:', errors);
    }
    if (failedRequests.length > 0) {
      console.log('Failed Requests:', failedRequests);
    }

    // Assert no errors were found
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
  });

  test('should load main content', async ({ page }) => {
    // Wait for main content to be visible
    await page.waitForSelector('main', { state: 'visible' });
    
    // Check if main content exists
    const mainContent = await page.$('main');
    expect(mainContent).toBeTruthy();
  });

  test('should handle navigation', async ({ page }) => {
    // Check if navigation exists
    const nav = await page.$('nav');
    expect(nav).toBeTruthy();

    // Ensure navigation links are visible
    const links = await page.$$('nav a');
    expect(links.length).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileMenu = await page.$('[data-testid="mobile-menu"]');
    expect(mobileMenu).toBeTruthy();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = await page.$('[data-testid="theme-toggle"]');
    if (themeToggle) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Check if theme changed
      const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      expect(newTheme).not.toBe(initialTheme);
    }
  });
}); 