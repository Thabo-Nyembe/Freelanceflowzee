import { test, expect } from '@playwright/test';

test.describe('Basic functionality tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FreeflowZee/);
  });

  test('should navigate to projects hub', async ({ page }) => {
    await page.goto('/dashboard/projects-hub');
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();
  });
}); 