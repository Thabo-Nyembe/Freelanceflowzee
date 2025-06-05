import { test, expect, Page } from '@playwright/test';

// Simple dashboard test to verify setup
test.describe('Dashboard Simple Test', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Check if login page loads
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
}); 