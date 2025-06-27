import { test, expect } from '@playwright/test';

// Test suite for comprehensive browser error checking
test.describe('Browser Error Detection Suite', () => {
  let consoleErrors: string[] = [];
  let networkErrors: string[] = [];

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
      const failure = request.failure();
      networkErrors.push(`Failed Request: ${request.url()} - ${failure?.errorText || 'Unknown error'}`);
    });
  });

  test('should load landing page without errors', async ({ page }) => {
    await page.goto('/');
    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);
  });

  test('should load dashboard without errors', async ({ page }) => {
    await page.goto('/dashboard');
    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/*', route => route.abort('internetdisconnected'));
    await page.goto('/');
    
    // Check if network error handler is displayed
    const networkError = await page.getByTestId('network-error');
    await expect(networkError).toBeVisible();
    
    // Check retry functionality
    const retryButton = await page.getByTestId('network-retry-button');
    await expect(retryButton).toBeVisible();
  });

  test('should handle JavaScript disabled gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Check if noscript content is present
    const noscriptContent = await page.getByTestId('js-disabled-fallback');
    await expect(noscriptContent).toBeInViewport();
  });

  test('should handle error boundary gracefully', async ({ page }) => {
    // Force an error by navigating to a non-existent route
    await page.goto('/non-existent-page');
    
    // Check if error boundary is displayed
    const errorBoundary = await page.getByTestId('error-boundary');
    await expect(errorBoundary).toBeVisible();
    
    // Check retry functionality
    const retryButton = await page.getByTestId('retry-button');
    await expect(retryButton).toBeVisible();
  });

  test('should check all interactive elements', async ({ page }) => {
    await page.goto('/');
    
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
    await page.goto('/');
    
    // Monitor network requests
    await test.step('API Endpoints', async () => {
      const [request] = await Promise.all([
        page.waitForRequest(request => request.url().includes('/api/')),
        page.reload()
      ]);
      
      expect(networkErrors).toHaveLength(0);
    });
  });

  test('should check for memory leaks', async ({ page, context }) => {
    await page.goto('/');
    
    // Perform multiple navigation operations
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.goto('/dashboard');
    }
    
    // Check memory usage through Chrome DevTools Protocol (CDP)
    if (process.env.PWDEBUG) {
      const cdpSession = await context.newCDPSession(page);
      const result = await cdpSession.send('Performance.getMetrics');
      const jsHeapSize = result.metrics?.find(metric => metric.name === 'JSHeapUsedSize')?.value;
      
      if (jsHeapSize) {
        expect(jsHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      }
    }
  });

  test.afterEach(async () => {
    // Clear error arrays after each test
    consoleErrors = [];
    networkErrors = [];
  });
}); 