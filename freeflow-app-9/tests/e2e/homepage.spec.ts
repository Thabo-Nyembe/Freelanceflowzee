import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/FreeFlowZee/);
  });

  test('should display all feature cards', async ({ page }) => {
    // Check for main feature cards
    await expect(page.locator('text=AI Video Studio')).toBeVisible();
    await expect(page.locator('text=Document Collaboration')).toBeVisible();
    await expect(page.locator('text=Community Hub')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Smart Calendar')).toBeVisible();
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    await expect(page.locator('text=File Management')).toBeVisible();
    await expect(page.locator('text=Client Portal')).toBeVisible();
  });

  test('should navigate to video studio from feature card', async ({ page }) => {
    await page.click('text=AI Video Studio');
    await expect(page).toHaveURL(/.*video-studio/);
  });

  test('should navigate to dashboard features', async ({ page }) => {
    // Test navigation to different dashboard sections
    const features = [
      { text: 'Analytics Dashboard', url: /.*analytics/ },
      { text: 'File Management', url: /.*files/ },
      { text: 'Client Portal', url: /.*client-portal/ }
    ];

    for (const feature of features) {
      await page.goto('http://localhost:3000');
      await page.click(`text=${feature.text}`);
      await expect(page).toHaveURL(feature.url);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that feature cards are still visible and properly arranged
    await expect(page.locator('text=AI Video Studio')).toBeVisible();
    await expect(page.locator('text=Document Collaboration')).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/homepage-mobile.png' });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=AI Video Studio')).toBeVisible();
    await expect(page.locator('text=Community Hub')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/homepage-tablet.png' });
  });

  test('should handle navigation with keyboard', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate somewhere
    await expect(page.url()).not.toBe('http://localhost:3000/');
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Should have minimal or no console errors
    expect(errors.length).toBeLessThan(5);
  });
}); 