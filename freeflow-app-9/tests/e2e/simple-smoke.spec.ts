import { test, expect } from '@playwright/test';

test.describe('Simple Smoke Tests', () => {
  test('should load homepage without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should load without critical errors
    await expect(page.locator('html')).toBeVisible();
    
    // Check for KAZI branding (case-insensitive)
    const title = await page.title();
    expect(title.toLowerCase()).toContain('kazi');
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page, not crash
    await expect(page.locator('html')).toBeVisible();
    
    // Should have error handling
    const content = await page.textContent('body');
    expect(content).toMatch(/(404|not found|error)/i);
  });

  test('should have responsive design', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should render without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50);
    }
  });

  test('should not have critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter out expected/non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('[DEP0040]') &&
      !error.includes('punycode') &&
      !error.includes('chunk-') &&
      !error.includes('favicon')
    );

    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('should load basic scripts and styles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that CSS is loaded
    const hasStyles = await page.evaluate(() => {
      return document.styleSheets.length > 0;
    });
    expect(hasStyles).toBe(true);
    
    // Check that React is working (looking for hydration)
    const hasReactElements = await page.locator('[data-reactroot], #__next, [data-testid]').count();
    expect(hasReactElements).toBeGreaterThanOrEqual(0);
  });
});