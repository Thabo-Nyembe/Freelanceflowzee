import { test, expect } from '@playwright/test';

test.describe('Login Debug Tests', () => {
  test('Debug login flow', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot before login
    await page.screenshot({ path: 'tests/screenshots/login-before.png', fullPage: true });

    // Find and fill email
    const emailInput = page.locator('input#email').first();
    await emailInput.fill('thabo@kaleidocraft.co.za');

    // Find and fill password
    const passwordInput = page.locator('input#password').first();
    await passwordInput.fill('test12345');

    // Take screenshot after filling
    await page.screenshot({ path: 'tests/screenshots/login-filled.png', fullPage: true });

    // Click login button
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();

    // Wait and see what happens
    await page.waitForTimeout(5000);

    // Take screenshot after clicking login
    await page.screenshot({ path: 'tests/screenshots/login-after.png', fullPage: true });

    // Log current URL
    console.log('Final URL:', page.url());

    // Check for error messages
    const errorMessage = page.locator('[class*="error"], [role="alert"], .text-red, .text-destructive');
    const errorCount = await errorMessage.count();
    console.log('Error elements found:', errorCount);

    if (errorCount > 0) {
      const firstError = await errorMessage.first().textContent();
      console.log('Error message:', firstError);
    }

    // Check if we're on dashboard
    const onDashboard = page.url().includes('dashboard');
    console.log('On dashboard:', onDashboard);
  });
});
