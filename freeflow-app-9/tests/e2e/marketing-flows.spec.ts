import { test, expect } from '@playwright/test';

/*
  Additional public-flow smoke tests.
  Tag: @smoke so they run in the default smoke suite.
*/

test.describe('@smoke Public marketing flows', () => {
  test('navbar links navigate to Features page', async ({ page }) => {
    await page.goto('/');
    // Click the "Features" link in nav bar
    await page.locator('a[href="/features"]').first().click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.locator('main')).toContainText(/Platform Features/i);
  });

  test('theme switcher toggles dark mode', async ({ page }) => {
    await page.goto('/');
    // open theme menu (assumes button with aria-label contains "theme" or switch icon).
    const themeButton = page.getByTestId('theme-toggle');
    await themeButton.click();
    // choose Dark mode option
    await page.getByRole('menuitem', { name: /^dark$/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('video search public page loads', async ({ page }) => {
    await page.goto('/video/search');
    await expect(page.locator('h1')).toContainText(/Search Videos/i);
    await expect(page.getByTestId('video-search-input')).toBeVisible();
  });
}); 