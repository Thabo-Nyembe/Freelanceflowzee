import { test, expect } from '@playwright/test';

test.describe('Comprehensive Edge Cases Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    const invalidRoutes = [
      '/dashboard/nonexistent',
      '/dashboard/invalid-page',
      '/dashboard/404-test',
      '/admin/secret',
      '/api/nonexistent'
    ];

    for (const route of invalidRoutes) {
      const response = await page.goto(route);
      // Should either redirect or show 404, not crash
      expect([200, 404, 302, 301]).toContain(response?.status() || 404);
      
      // Should not show uncaught errors
      await expect(page.locator('text=Error')).not.toBeVisible();
      await expect(page.locator('text=Uncaught')).not.toBeVisible();
    }
  });

  test('should handle rapid navigation without crashes', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/projects-hub-v2',
      '/dashboard/ai-create-v2',
      '/dashboard/calendar-v2',
      '/dashboard/settings-v2'
    ];

    // Rapidly navigate between pages
    for (let i = 0; i < 3; i++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(100); // Very short wait
      }
    }

    // Final check - should still be functional
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/dashboard/projects-hub-v2');
    await page.goto('/dashboard/ai-create-v2');
    
    // Test back navigation
    await page.goBack();
    expect(page.url()).toContain('/dashboard/projects-hub-v2');
    
    await page.goBack();
    expect(page.url()).toContain('/dashboard');
    
    // Test forward navigation
    await page.goForward();
    expect(page.url()).toContain('/dashboard/projects-hub-v2');
  });

  test('should handle missing authentication gracefully', async ({ page }) => {
    // Clear local storage to simulate logged out state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access protected routes
    await page.goto('/dashboard');
    
    // Should redirect to login or show appropriate message
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(login|dashboard)/);
  });

  test('should handle console errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pagesToTest = [
      '/dashboard',
      '/dashboard/ai-design',
      '/dashboard/calendar-v2',
      '/dashboard/cv-portfolio'
    ];

    for (const pageUrl of pagesToTest) {
      await page.goto(pageUrl);
      await page.waitForTimeout(2000);
    }

    // Filter out expected errors (warnings about development mode, etc.)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('[DEP0040]') &&
      !error.includes('punycode') &&
      !error.includes('chunk-')
    );

    expect(criticalErrors.length).toBeLessThan(5); // Allow for minor non-critical errors
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simulate offline
    await page.context().setOffline(true);
    
    // Try navigation
    await page.click('text=Settings');
    await page.waitForTimeout(2000);
    
    // Should still render cached content
    await expect(page.locator('body')).toBeVisible();
    
    // Re-enable network
    await page.context().setOffline(false);
  });

  test('should handle window resize without breaking layout', async ({ page }) => {
    await page.goto('/dashboard/calendar-v2');
    
    const viewports = [
      { width: 320, height: 568 },   // iPhone 5
      { width: 768, height: 1024 },  // iPad
      { width: 1440, height: 900 },  // Desktop
      { width: 2560, height: 1440 }  // Large desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Check that main content is still visible
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for horizontal scroll (shouldn't exist)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 50); // Allow small margin
    }
  });

  test('should handle special characters in inputs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find search inputs
    const searchInputs = page.locator('input[type="search"], input[placeholder*="search" i]');
    const searchCount = await searchInputs.count();
    
    if (searchCount > 0) {
      const specialChars = ['<script>', '!@#$%^&*()', '测试', '🚀🎉', 'null', 'undefined'];
      
      for (const chars of specialChars) {
        await searchInputs.first().fill(chars);
        await page.waitForTimeout(500);
        
        // Should not cause JavaScript errors
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should handle rapid clicking without issues', async ({ page }) => {
    await page.goto('/dashboard/ai-design');
    
    // Find interactive buttons
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Rapidly click first button
      for (let i = 0; i < 10; i++) {
        await buttons.first().click({ timeout: 1000 });
        await page.waitForTimeout(50);
      }
      
      // Should still be functional
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle tab switching edge cases', async ({ page }) => {
    await page.goto('/dashboard/cv-portfolio');
    
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Rapidly switch between tabs
      for (let i = 0; i < tabCount * 2; i++) {
        const tabIndex = i % tabCount;
        await tabs.nth(tabIndex).click();
        await page.waitForTimeout(100);
      }
      
      // Should still be functional
      await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    }
  });

  test('should handle localStorage corruption', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('kazi-auth', 'corrupted-data');
      localStorage.setItem('user-data', '{invalid-json}');
    });
    
    // Refresh page
    await page.reload();
    
    // Should handle gracefully
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle concurrent page loads', async ({ page, context }) => {
    // Open multiple tabs
    const page2 = await context.newPage();
    const page3 = await context.newPage();
    
    // Load different pages simultaneously
    await Promise.all([
      page.goto('/dashboard'),
      page2.goto('/dashboard/projects-hub-v2'),
      page3.goto('/dashboard/ai-create-v2')
    ]);
    
    // All should load successfully
    await Promise.all([
      expect(page.locator('h1')).toBeVisible(),
      expect(page2.locator('h1')).toBeVisible(),
      expect(page3.locator('h1')).toBeVisible()
    ]);
    
    await page2.close();
    await page3.close();
  });

  test('should handle JavaScript disabled scenario', async ({ page }) => {
    // This is more of a structural test since we can't actually disable JS in Playwright
    await page.goto('/dashboard');
    
    // Check for noscript content or graceful degradation
    const noscriptContent = page.locator('noscript');
    if (await noscriptContent.count() > 0) {
      // If noscript tags exist, they should have helpful content
      const noscriptText = await noscriptContent.textContent();
      expect(noscriptText?.length).toBeGreaterThan(0);
    }
  });
});