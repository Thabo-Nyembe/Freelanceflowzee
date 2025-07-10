import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kazi/i);
  });
});
