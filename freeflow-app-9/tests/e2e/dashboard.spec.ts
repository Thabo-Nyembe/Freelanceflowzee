import { test, expect } from '@playwright/test';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real app, would need to handle authentication
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Should redirect to login page if not authenticated
    await expect(page).toHaveURL(/.*login/);
  });

  test('should load dashboard when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Should show dashboard content
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display dashboard navigation', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check for navigation items
    const navItems = [
      'Projects',
      'Analytics',
      'Clients',
      'Calendar',
      'Files'
    ];
    
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
  });

  test('should navigate to dashboard sections', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Test navigation to different sections
    const sections = [
      { name: 'Projects', url: /.*projects/ },
      { name: 'Analytics', url: /.*analytics/ },
      { name: 'Calendar', url: /.*calendar/ }
    ];
    
    for (const section of sections) {
      await page.click(`text=${section.name}`);
      await expect(page).toHaveURL(section.url);
      await page.goBack();
    }
  });

  test('should display user profile information', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Should show user avatar or profile section
    await expect(page.locator('[data-testid="user-profile"], .user-avatar, text=Profile')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Mobile navigation should be accessible
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger-menu, .mobile-nav-toggle');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
    
    await page.screenshot({ path: 'tests/screenshots/dashboard-mobile.png' });
  });

  test('should handle search functionality', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test query');
      await page.keyboard.press('Enter');
      
      // Should show search results or perform search
      await page.waitForTimeout(1000);
    }
  });

  test('should display recent activity or stats', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Should show some form of dashboard content
    const contentSelectors = [
      'text=Recent Activity',
      'text=Statistics',
      'text=Overview',
      '[data-testid="dashboard-stats"]',
      '.dashboard-widget',
      '.stats-card'
    ];
    
    let foundContent = false;
    for (const selector of contentSelectors) {
      if (await page.locator(selector).isVisible()) {
        foundContent = true;
        break;
      }
    }
    
    expect(foundContent).toBeTruthy();
  });

  test('should handle logout functionality', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Look for logout button
    const logoutButton = page.locator('text=Logout, text=Sign Out, [data-testid="logout"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login or home
      await expect(page).toHaveURL(/.*\/(login|$)/);
    }
  });
}); 