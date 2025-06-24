import { test, expect } from '@playwright/test';
import { AuthTestHelper, TEST_CREDENTIALS } from '../utils/auth-test-helper';

const INVALID_CREDENTIALS = {
  invalidEmail: 'invalid@example.com',
  invalidPassword: 'wrongpassword',
  malformedEmail: 'not-an-email',
  emptyEmail: '',
  emptyPassword: '',
  sqlInjection: "' OR '1'='1",
  xssAttempt: '<script>alert("xss")</script>@example.com'
};

test.describe('Authentication Flow', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthTestHelper(page);
    await authHelper.setupTestMode();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await authHelper.login();
    expect(await authHelper.isLoggedIn()).toBe(true);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await authHelper.fillLoginForm('invalid@example.com', 'wrongpassword');
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain('Invalid login credentials');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    await authHelper.fillLoginForm('invalid-email', TEST_CREDENTIALS.password);
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain('Please enter a valid email address');
  });

  test('should require password', async ({ page }) => {
    await page.goto('/login');
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, '');
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain('Password is required');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    expect(page.url()).toContain('/signup');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot your password?');
    expect(page.url()).toContain('/forgot-password');
  });

  test('should sanitize input against XSS', async ({ page }) => {
    await page.goto('/login');
    await authHelper.fillLoginForm(INVALID_CREDENTIALS.xssAttempt, TEST_CREDENTIALS.password);
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const value = await emailInput.inputValue();
    expect(value).not.toContain('<script>');
  });

  test('should protect against SQL injection', async ({ page }) => {
    await page.goto('/login');
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, INVALID_CREDENTIALS.sqlInjection);
    await authHelper.submitLoginForm();
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test('should maintain login state after page refresh', async ({ page }) => {
    await authHelper.login();
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should redirect to requested page after login', async ({ page }) => {
    const targetPage = '/dashboard/projects';
    await page.goto(targetPage);
    await expect(page).toHaveURL(/.*login/);
    await authHelper.login();
    await expect(page).toHaveURL(targetPage);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock a network error
    await page.route('**/api/auth/login', route => route.abort('failed'));
    
    await page.goto('/login');
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await authHelper.submitLoginForm();
    
    const errorText = await authHelper.getErrorMessage();
    expect(errorText?.toLowerCase()).toMatch(/network|connection/i);
  });

  test('should handle rate limiting', async ({ page }) => {
    // Attempt multiple rapid logins
    for (let i = 0; i < 5; i++) {
      await page.goto('/login');
      await authHelper.fillLoginForm(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
      await authHelper.submitLoginForm();
      await page.waitForTimeout(100); // Small delay between attempts
    }
    
    const errorText = await authHelper.getErrorMessage();
    expect(errorText?.toLowerCase()).toMatch(/too many|rate limit/i);
  });

  test('should logout successfully', async ({ page }) => {
    await authHelper.login();
    await authHelper.logout();
    await expect(page).toHaveURL(/.*login/);
    
    // Verify we can't access protected routes after logout
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
}); 