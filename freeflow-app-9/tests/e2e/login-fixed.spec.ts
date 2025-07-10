import { test, expect } from '@playwright/test';

test.describe('Login Page - Fixed Tests', () => {
  test('should render login form correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    await page.waitForTimeout(5000);
    
    // Check page title
    await expect(page).toHaveTitle(/KAZI/);
    
    // Verify login form elements exist
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verify branding elements
    await expect(page.locator('h1:has-text("KAZI")')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should allow filling form fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Fill form fields
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'testpassword');
    
    // Verify form fields contain values
    await expect(page.locator('#email')).toHaveValue('test@example.com');
    await expect(page.locator('#password')).toHaveValue('testpassword');
  });

  test('should navigate to dashboard on valid login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Fill valid credentials
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
  });
});