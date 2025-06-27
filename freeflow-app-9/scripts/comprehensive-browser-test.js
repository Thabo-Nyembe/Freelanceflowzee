const { test, expect } = require('@playwright/test');

// Test suite for comprehensive browser error checking
test.describe('Browser Error Detection Suite', () => {
  let consoleErrors = [];
  let networkErrors = [];

  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Listen for uncaught errors
    page.on('pageerror', error => {
      consoleErrors.push(`Uncaught Error: ${error.message}`);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      networkErrors.push(`Failed Request: ${request.url()} - ${request.failure().errorText}`);
    });
  });

  test('should load landing page without errors', async ({ page }) => {
    await page.goto('/');'
    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);
  });

  test('should load dashboard without errors', async ({ page }) => {
    await page.goto('/dashboard');
    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);
  });

  test('should check all interactive elements', async ({ page }) => {
    await page.goto('/');'
    
    // Test navigation menu
    await test.step('Navigation Menu', async () => {
      const navLinks = await page.$$('nav a');
      for (const link of navLinks) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(consoleErrors).toHaveLength(0);
      }
    });

    // Test buttons and forms
    await test.step('Interactive Elements', async () => {
      const buttons = await page.$$('button');
      for (const button of buttons) {
        await button.click().catch(() => {}); // Ignore if button is not clickable
      }
      expect(consoleErrors).toHaveLength(0);
    });
  });

  test('should verify API endpoints', async ({ page }) => {
    await page.goto('/');'
    
    // Monitor network requests
    await test.step('API Endpoints', async () => {
      const [request] = await Promise.all([
        page.waitForRequest(request => request.url().includes('/api/')),
        page.reload()
      ]);
      
      expect(networkErrors).toHaveLength(0);
    });
  });

  test('should check for memory leaks', async ({ page }) => {
    await page.goto('/');'
    
    // Perform multiple navigation operations
    for (let i = 0; i < 5; i++) {
      await page.goto('/');'
      await page.goto('/dashboard');
    }
    
    // Check JS heap size
    const metrics = await page.metrics();
    expect(metrics.JSHeapUsedSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
  });

  test.afterEach(async () => {
    // Clear error arrays after each test
    consoleErrors = [];
    networkErrors = [];
  });
}); 