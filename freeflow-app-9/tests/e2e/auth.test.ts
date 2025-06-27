import { test, expect } from &apos;@playwright/test&apos;;
import { AuthTestHelper, TEST_CREDENTIALS } from &apos;../utils/auth-test-helper&apos;;

const INVALID_CREDENTIALS = {
  invalidEmail: &apos;invalid@example.com&apos;,
  invalidPassword: &apos;wrongpassword&apos;,
  malformedEmail: &apos;not-an-email&apos;,
  emptyEmail: '&apos;,'
  emptyPassword: '&apos;,'
  sqlInjection: &quot;&apos; OR &apos;1'=&apos;1&quot;,'
  xssAttempt: &apos;<script>alert(&quot;xss&quot;)</script>@example.com&apos;
};

test.describe(&apos;Authentication Flow&apos;, () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthTestHelper(page);
    await authHelper.setupTestMode();
  });

  test(&apos;should successfully login with valid credentials&apos;, async ({ page }) => {
    await authHelper.login();
    expect(await authHelper.isLoggedIn()).toBe(true);
  });

  test(&apos;should show error with invalid credentials&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(&apos;invalid@example.com&apos;, &apos;wrongpassword&apos;);
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain(&apos;Invalid login credentials&apos;);
  });

  test(&apos;should validate email format&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(&apos;invalid-email&apos;, TEST_CREDENTIALS.password);
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain(&apos;Please enter a valid email address&apos;);
  });

  test(&apos;should require password&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, '&apos;);'
    await authHelper.submitLoginForm();
    const errorMessage = await authHelper.getErrorMessage();
    expect(errorMessage).toContain(&apos;Password is required&apos;);
  });

  test(&apos;should navigate to signup page&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await page.click(&apos;text=Sign up&apos;);
    expect(page.url()).toContain(&apos;/signup&apos;);
  });

  test(&apos;should navigate to forgot password page&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await page.click(&apos;text=Forgot your password?&apos;);
    expect(page.url()).toContain(&apos;/forgot-password&apos;);
  });

  test(&apos;should sanitize input against XSS&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(INVALID_CREDENTIALS.xssAttempt, TEST_CREDENTIALS.password);
    
    const emailInput = page.locator(&apos;[data-testid=&quot;email-input&quot;]&apos;);
    const value = await emailInput.inputValue();
    expect(value).not.toContain(&apos;<script>&apos;);
  });

  test(&apos;should protect against SQL injection&apos;, async ({ page }) => {
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, INVALID_CREDENTIALS.sqlInjection);
    await authHelper.submitLoginForm();
    
    await expect(page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;)).toBeVisible();
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test(&apos;should maintain login state after page refresh&apos;, async ({ page }) => {
    await authHelper.login();
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test(&apos;should redirect to requested page after login&apos;, async ({ page }) => {
    const targetPage = &apos;/dashboard/projects&apos;;
    await page.goto(targetPage);
    await expect(page).toHaveURL(/.*login/);
    await authHelper.login();
    await expect(page).toHaveURL(targetPage);
  });

  test(&apos;should handle network errors gracefully&apos;, async ({ page }) => {
    // Mock a network error
    await page.route(&apos;**/api/auth/login&apos;, route => route.abort(&apos;failed&apos;));
    
    await page.goto(&apos;/login&apos;);
    await authHelper.fillLoginForm(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await authHelper.submitLoginForm();
    
    const errorText = await authHelper.getErrorMessage();
    expect(errorText?.toLowerCase()).toMatch(/network|connection/i);
  });

  test(&apos;should handle rate limiting&apos;, async ({ page }) => {
    // Attempt multiple rapid logins
    for (let i = 0; i < 5; i++) {
      await page.goto(&apos;/login&apos;);
      await authHelper.fillLoginForm(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
      await authHelper.submitLoginForm();
      await page.waitForTimeout(100); // Small delay between attempts
    }
    
    const errorText = await authHelper.getErrorMessage();
    expect(errorText?.toLowerCase()).toMatch(/too many|rate limit/i);
  });

  test(&apos;should logout successfully&apos;, async ({ page }) => {
    await authHelper.login();
    await authHelper.logout();
    await expect(page).toHaveURL(/.*login/);
    
    // Verify we can&apos;t access protected routes after logout
    await page.goto(&apos;/dashboard&apos;);
    await expect(page).toHaveURL(/.*login/);
  });
}); 