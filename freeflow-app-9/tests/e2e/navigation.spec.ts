import { test, expect } from '@playwright/test';

test.describe('Navigation System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for form elements to be visible
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });
    
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should have no 404 errors on all sidebar routes', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/projects-hub',
      '/dashboard/video-studio',
      '/dashboard/collaboration',
      '/dashboard/community-hub',
      '/dashboard/ai-design',
      '/dashboard/ai-create',
      '/dashboard/my-day',
      '/dashboard/financial',
      '/dashboard/files-hub',
      '/dashboard/messages',
      '/dashboard/analytics',
      '/dashboard/client-zone',
      '/dashboard/calendar',
      '/dashboard/cv-portfolio',
      '/dashboard/settings',
      '/dashboard/notifications'
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      
      // Verify page loads without errors
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Check for React error boundaries
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
      
      console.log(`✅ ${route} - Status: ${response?.status()}`);
    }
  });

  test('should navigate through sidebar links', async ({ page }) => {
    const sidebarLinks = [
      { text: 'Projects Hub', url: '/dashboard/projects-hub' },
      { text: 'AI Create', url: '/dashboard/ai-create' },
      { text: 'Community Hub', url: '/dashboard/community-hub' },
      { text: 'Calendar', url: '/dashboard/calendar' },
      { text: 'Settings', url: '/dashboard/settings' }
    ];

    for (const link of sidebarLinks) {
      await page.click(`text=${link.text}`);
      await page.waitForURL(link.url);
      expect(page.url()).toContain(link.url);
      
      // Verify page content loads
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('should have working UI components on each page', async ({ page }) => {
    const pagesToTest = [
      '/dashboard/ai-design',
      '/dashboard/calendar',
      '/dashboard/cv-portfolio'
    ];

    for (const pageUrl of pagesToTest) {
      await page.goto(pageUrl);
      
      // Check for interactive elements
      const buttonCount = await page.locator('button').count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Check for proper card components
      const cardCount = await page.locator('[class*="card"]').count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check for tabs if present
      const tabsCount = await page.locator('[role="tablist"]').count();
      if (tabsCount > 0) {
        const tabCount = await page.locator('[role="tab"]').count();
        expect(tabCount).toBeGreaterThan(0);
      }
    }
  });

  test('should have accessible images with alt attributes', async ({ page }) => {
    const pagesToCheck = [
      '/dashboard/ai-design',
      '/dashboard/calendar',
      '/dashboard/cv-portfolio'
    ];

    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      
      // Check all images have alt attributes
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
        expect(alt).not.toBe('');
      }
    }
  });

  test('should have working logout functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find and click logout button
    await page.click('[data-testid="logout"]');
    
    // Should redirect to home or login
    await page.waitForURL(/\/($|login)/);
    expect(page.url()).toMatch(/\/($|login)/);
  });
});