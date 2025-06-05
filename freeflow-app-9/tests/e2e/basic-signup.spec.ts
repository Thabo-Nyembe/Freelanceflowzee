import { test, expect } from '@playwright/test';

test.describe('Basic Signup Flow Tests', () => {
  test('should load the signup page correctly', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded correctly
    await expect(page).toHaveTitle(/FreeflowZee|Signup|Join/);
    
    // Check if the main form elements are present
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✅ Signup page loaded successfully with all form elements');
  });

  test('should show validation for empty form submission', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check if HTML5 validation prevents submission
    const fullNameInput = page.locator('#fullName');
    const isValid = await fullNameInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    
    expect(isValid).toBe(false);
    console.log('✅ Empty form validation working correctly');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Fill password field
    await page.fill('#password', 'testpassword');
    
    // Check initial type is password
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    
    // Find and click the eye toggle button (next sibling of password input)
    const toggleButton = page.locator('#password').locator('..').locator('button').last();
    await toggleButton.click();
    
    // Check type changed to text
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
    
    console.log('✅ Password visibility toggle working correctly');
  });

  test('should validate short password', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Fill form with short password
    await page.fill('#fullName', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '123');
    await page.fill('#confirmPassword', '123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for any client-side validation
    await page.waitForTimeout(1000);
    
    // Check for error message about password length
    const errorMessage = page.locator('text=Password must be at least 6 characters long');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Short password validation working correctly');
  });
}); 