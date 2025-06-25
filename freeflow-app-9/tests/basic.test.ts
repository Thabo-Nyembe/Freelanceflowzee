import { test, expect } from '@playwright/test';
import { PageHelpers } from './utils/page-helpers';

test.describe('Basic Application Tests', () => {
  let helpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page);
  });

  test('homepage loads successfully', async ({ page }) => {
    await helpers.navigateTo('/');
    await expect(page).toHaveTitle(/Freeflow/);
  });

  test('navigation works correctly', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Click on navigation links using more specific selectors
    const projectsLink = page.locator('a', { hasText: 'Projects Hub' });
    await projectsLink.click();
    await helpers.verifyNavigation('projects');
    
    const dashboardLink = page.locator('a', { hasText: 'Dashboard' });
    await dashboardLink.click();
    await helpers.verifyNavigation('dashboard');
  });

  test('theme toggle works', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Test dark theme
    await helpers.toggleTheme('dark');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    
    // Test light theme
    await helpers.toggleTheme('light');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('responsive design', async ({ page }) => {
    await helpers.navigateTo('/');
    
    // Test mobile layout
    await helpers.setViewportSize('mobile');
    await helpers.openMobileMenu();
    
    // Test desktop layout
    await helpers.setViewportSize('desktop');
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();
  });
}); 