import { test, expect } from '@playwright/test';

test.describe('Video Studio Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/video-studio');
  });

  test('should load video studio page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Video Studio');
  });

  test('should display video studio tabs', async ({ page }) => {
    await expect(page.locator('button[role="tab"]')).toHaveCount(3);
    await expect(page.locator('text=Record')).toBeVisible();
    await expect(page.locator('text=Enhance')).toBeVisible();
    await expect(page.locator('text=Library')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Test Record tab
    await page.click('button[role="tab"]:has-text("Record")');
    await expect(page.locator('text=AI Video Recording')).toBeVisible();
    
    // Test Enhance tab
    await page.click('button[role="tab"]:has-text("Enhance")');
    await expect(page.locator('text=AI Enhancement Studio')).toBeVisible();
    
    // Test Library tab
    await page.click('button[role="tab"]:has-text("Library")');
    await expect(page.locator('text=Video Library')).toBeVisible();
  });

  test('should show recording interface in Record tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Record")');
    
    // Should show AI Video Recording System component
    await expect(page.locator('text=AI Video Recording')).toBeVisible();
  });

  test('should show enhancement interface in Enhance tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Enhance")');
    
    // Should show message when no video is selected
    await expect(page.locator('text=Record or select a video to enhance with AI')).toBeVisible();
  });

  test('should show library interface in Library tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Library")');
    
    // Should show Enterprise Video Studio component
    await expect(page.locator('text=Video Library')).toBeVisible();
  });

  test('should handle permissions for media access', async ({ page, context }) => {
    // Grant camera/microphone permissions
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.click('button[role="tab"]:has-text("Record")');
    
    // Recording interface should be available
    await expect(page.locator('text=AI Video Recording')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Tabs should still be visible and functional
    await expect(page.locator('button[role="tab"]')).toHaveCount(3);
    await page.click('button[role="tab"]:has-text("Record")');
    await expect(page.locator('text=AI Video Recording')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/video-studio-mobile.png' });
  });

  test('should navigate back to homepage', async ({ page }) => {
    // Assuming there's a navigation back to home
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should have minimal console errors
    expect(errors.length).toBeLessThan(3);
  });

  test('should handle tab keyboard navigation', async ({ page }) => {
    // Test keyboard navigation between tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    
    // Should switch to enhance tab
    await expect(page.locator('text=AI Enhancement Studio')).toBeVisible();
  });
}); 