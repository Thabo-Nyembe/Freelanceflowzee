import { test, expect } from '@playwright/test';

const dashboardRoutes = [
  '/dashboard',
  '/dashboard/analytics-v2',
  '/dashboard/video-studio-v2',
  '/dashboard/community-v2',
  '/dashboard/messages-v2',
  '/dashboard/settings-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/my-day',
  '/dashboard/financial'
];

test.describe('Dashboard Routes Status Check', () => {
  dashboardRoutes.forEach((route) => {
    test(`${route} should load successfully`, async ({ page }) => {
      // Capture console errors and network errors
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(`Console Error: ${msg.text()}`);
        }
      });

      page.on('response', (response) => {
        if (response.status() >= 400) {
          networkErrors.push(`Network Error: ${response.url()} - Status: ${response.status()}`);
        }
      });

      // Navigate to the route
      const response = await page.goto(route);

      // Check HTTP status
      console.log(`Route: ${route} - Status: ${response?.status()}`);

      // Wait for page to stabilize
      await page.waitForTimeout(3000);

      // Check if page loaded (not a 500 error page)
      const isErrorPage = await page.locator('text=500').isVisible().catch(() => false);
      const hasContent = await page.locator('body').isVisible();

      // Log errors if any
      if (consoleErrors.length > 0) {
        console.log(`Console errors on ${route}:`, consoleErrors);
      }
      if (networkErrors.length > 0) {
        console.log(`Network errors on ${route}:`, networkErrors);
      }

      // Assert the page loads successfully
      expect(response?.status()).toBe(200);
      expect(isErrorPage).toBe(false);
      expect(hasContent).toBe(true);

      // Take a screenshot for manual review
      await page.screenshot({
        path: `test-results/dashboard-${route.replace(/\//g, '-')}.png`,
        fullPage: false
      });
    });
  });

  // Additional test to check for global navigation elements
  test('Dashboard should have navigation elements', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check for common dashboard elements
    const hasNavigation = await page.locator('[role="navigation"], nav, .navigation, .sidebar').count() > 0;
    console.log(`Navigation elements found: ${hasNavigation}`);

    // Take screenshot of main dashboard
    await page.screenshot({
      path: 'test-results/dashboard-main-navigation.png',
      fullPage: true
    });
  });
});