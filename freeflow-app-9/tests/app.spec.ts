import { test, expect } from '@playwright/test';

test('basic application test', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3001');
  
  // Check if the page loads successfully
  await expect(page).toHaveTitle(/FreeflowZee/);
  
  // Check if main navigation elements are present
  await expect(page.locator('nav')).toBeVisible();
  
  // Check if the Projects Hub component is present
  await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();
  
  // Check if the glass morphism styles are applied
  const projectsHub = await page.locator('[data-testid="projects-hub"]');
  const styles = await projectsHub.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      backgroundColor: computedStyle.backgroundColor,
      backdropFilter: computedStyle.backdropFilter,
      borderRadius: computedStyle.borderRadius,
    };
  });
  
  // Verify glass morphism styles
  expect(styles.backdropFilter).toContain('blur');
}); 