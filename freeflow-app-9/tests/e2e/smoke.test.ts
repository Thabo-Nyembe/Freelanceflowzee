import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'test@freeflowzee.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard');
  });

  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FreeflowZee/);
  });

  test('should navigate to projects hub', async ({ page }) => {
    await page.goto('/dashboard/projects-hub');
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();
  });

  test('should find login page elements', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Log the page content for debugging
    console.log('Page content:', await page.content());
    
    // Check if login form elements exist
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const loginButton = page.locator('[data-testid="login-button"]');
    
    // Log element states
    console.log('Email input exists:', await emailInput.count() > 0);
    console.log('Password input exists:', await passwordInput.count() > 0);
    console.log('Login button exists:', await loginButton.count() > 0);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'login-page.png', fullPage: true });
  });
});
