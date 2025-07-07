import { test, expect } from '@playwright/test';

test.describe('Responsive UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9323');
    // Wait for page to fully load to avoid hydration timing issues
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Layout', () => {
    test('should display mobile menu button on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      // Look for mobile menu button (hamburger menu)
      const mobileMenuButton = page.getByTestId('mobile-menu-toggle').first();
      await expect(mobileMenuButton).toBeVisible();
    });

    test('should hide desktop navigation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      // Desktop nav should be hidden on mobile
      const featuresLink = page.getByTestId('nav-features').first();
      await expect(featuresLink).not.toBeVisible();
    });

    test('should be responsive and not overflow', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // iPhone 5/SE
      
      // Check that content doesn't overflow
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(320);
    });

    test('should open mobile menu when clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      const mobileMenuButton = page.getByTestId('mobile-menu-toggle').first();
      await mobileMenuButton.click();
      
      // Check that mobile menu content is visible
      const mobileMenuContent = page.getByTestId('mobile-menu-content');
      await expect(mobileMenuContent).toBeVisible();
    });
  });

  test.describe('Desktop Layout', () => {
    test('should hide mobile menu button on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
      // Mobile menu should be hidden on desktop
      const mobileMenuButton = page.getByTestId('mobile-menu-toggle').first();
      await expect(mobileMenuButton).not.toBeVisible();
    });

    test('should display desktop navigation on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
      // Desktop nav should be visible
      const featuresLink = page.getByTestId('nav-features').first();
      await expect(featuresLink).toBeVisible();
    });

    test('should have proper layout spacing', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
      
      // Check header spacing
      const header = page.getByTestId('site-header').first();
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBeGreaterThan(50); // Minimum header height
    });

    test('should display login and signup buttons', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
      const loginButton = page.getByTestId('nav-login').first();
      const signupButton = page.getByTestId('nav-signup').first();
      
      await expect(loginButton).toBeVisible();
      await expect(signupButton).toBeVisible();
    });
  });

  test.describe('Navigation Functionality', () => {
    test('should have working logo link', async ({ page }) => {
      const logo = page.getByTestId('nav-logo').first();
      await expect(logo).toBeVisible();
      
      // Logo should be clickable
      await expect(logo).toHaveAttribute('href', '/');
    });

    test('should have site header with proper structure', async ({ page }) => {
      const siteHeader = page.getByTestId('site-header').first();
      const navigation = page.getByTestId('navigation').first();
      
      await expect(siteHeader).toBeVisible();
      await expect(navigation).toBeVisible();
    });
  });
}); 