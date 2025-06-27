import { test, expect, Page } from &apos;@playwright/test&apos;;
import { TestHelpers } from &apos;../utils/test-helpers&apos;;

// Test data constants
const VALID_CREDENTIALS = {
  email: &apos;thabo@kaleidocraft.co.za&apos;,
  password: &apos;password1234&apos;
};

const INVALID_CREDENTIALS = {
  invalidEmail: &apos;invalid@example.com&apos;,
  nonExistentEmail: &apos;nonexistent@example.com&apos;,
  wrongPassword: &apos;WrongPassword123!&apos;,
  malformedEmail: &apos;not-an-email&apos;,
  emptyEmail: '&apos;,'
  emptyPassword: '&apos;,'
  sqlInjection: &quot;&apos; OR &apos;1'=&apos;1&quot;,'
  xssAttempt: &apos;<script>alert(&quot;xss&quot;)</script>@example.com&apos;
};

// Helper functions
const fillLoginForm = async (page: Page, data: { email?: string; password?: string }) => {
  if (data.email !== undefined) {
    await page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, data.email);
  }
  if (data.password !== undefined) {
    await page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, data.password);
  }
};

const submitLoginForm = async (page: Page) => {
  await page.click(&apos;[data-testid=&quot;login-button&quot;]&apos;);
};

const waitForLoginResponse = async (page: Page) => {
  await Promise.race([
    page.waitForURL(&apos;**/dashboard&apos;, { timeout: 10000 }),
    page.waitForSelector(&apos;[data-testid=&quot;error-message&quot;]&apos;, { timeout: 10000 })
  ]);
};

const getErrorMessage = async (page: Page): Promise<string | null> => {
  try {
    const errorElement = page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    await errorElement.waitFor({ state: &apos;visible&apos;, timeout: 5000 });
    return errorElement.textContent();
  } catch {
    return null;
  }
};

test.describe(&apos;Login Page&apos;, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(&apos;/login&apos;);
  });

  test(&apos;should display login form with all elements&apos;, async ({ page }) => {
    // Check main form elements
    await expect(page.getByRole(&apos;heading&apos;, { name: &apos;Welcome Back&apos; })).toBeVisible();
    await expect(page.getByText(&apos;Sign in to your account to continue&apos;)).toBeVisible();
    await expect(page.getByRole(&apos;textbox&apos;, { name: /email/i })).toBeVisible();
    await expect(page.getByRole(&apos;textbox&apos;, { name: /password/i })).toBeVisible();
    await expect(page.getByRole(&apos;button&apos;, { name: /sign in/i })).toBeVisible();
  });

  test(&apos;should show validation errors for empty fields&apos;, async ({ page }) => {
    // Submit empty form
    await page.getByRole(&apos;button&apos;, { name: /sign in/i }).click();
    
    // Check for error message
    const errorMessage = await page.getByTestId(&apos;error-message&apos;);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(&apos;Email is required&apos;);
  });

  test(&apos;should validate email format&apos;, async ({ page }) => {
    // Enter invalid email
    await page.getByRole(&apos;textbox&apos;, { name: /email/i }).fill(&apos;invalid-email&apos;);
    await page.getByRole(&apos;textbox&apos;, { name: /password/i }).fill(&apos;password123&apos;);
    await page.getByRole(&apos;button&apos;, { name: /sign in/i }).click();
    
    // Check for validation error
    const errorMessage = await page.getByTestId(&apos;error-message&apos;);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(&apos;Please enter a valid email address&apos;);
  });

  test(&apos;should show error for invalid credentials&apos;, async ({ page }) => {
    // Enter invalid credentials
    await page.getByRole(&apos;textbox&apos;, { name: /email/i }).fill(&apos;wrong@example.com&apos;);
    await page.getByRole(&apos;textbox&apos;, { name: /password/i }).fill(&apos;wrongpassword&apos;);
    await page.getByRole(&apos;button&apos;, { name: /sign in/i }).click();
    
    // Check for error message
    const errorMessage = await page.getByTestId(&apos;error-message&apos;);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(&apos;Invalid email or password&apos;);
  });

  test(&apos;should successfully log in with valid credentials&apos;, async ({ page }) => {
    // Enter valid credentials
    await page.getByRole(&apos;textbox&apos;, { name: /email/i }).fill(&apos;thabo@kaleidocraft.co.za&apos;);
    await page.getByRole(&apos;textbox&apos;, { name: /password/i }).fill(&apos;password1234&apos;);
    await page.getByRole(&apos;button&apos;, { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(&apos;/dashboard&apos;);
  });

  test(&apos;should show success message when redirected with message&apos;, async ({ page }) => {
    // Go to login with success message
    await page.goto(&apos;/login?message=Please%20log%20in%20to%20continue&apos;);
    
    // Check for success message
    const successMessage = await page.getByTestId(&apos;success-message&apos;);
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(&apos;Please log in to continue&apos;);
  });

  test(&apos;should redirect to requested page after login&apos;, async ({ page }) => {
    // Go to login with redirect parameter
    await page.goto(&apos;/login?redirect=/projects&apos;);
    
    // Login with valid credentials
    await page.getByRole(&apos;textbox&apos;, { name: /email/i }).fill(&apos;thabo@kaleidocraft.co.za&apos;);
    await page.getByRole(&apos;textbox&apos;, { name: /password/i }).fill(&apos;password1234&apos;);
    await page.getByRole(&apos;button&apos;, { name: /sign in/i }).click();
    
    // Should redirect to specified page
    await expect(page).toHaveURL(&apos;/projects&apos;);
  });
});

test.describe(&apos;Login Flow Tests&apos;, () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto(&apos;/login&apos;);
  });

  test.describe(&apos;UI Elements&apos;, () => {
    test(&apos;should display all required login form elements&apos;, async ({ page }) => {
      // Check for form elements
      await expect(page.locator(&apos;[data-testid=&quot;email-input&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;login-button&quot;]&apos;)).toBeVisible();
      
      // Check for additional elements
      await expect(page.getByRole(&apos;link&apos;, { name: /sign up/i })).toBeVisible();
      await expect(page.getByRole(&apos;link&apos;, { name: /forgot.*password/i })).toBeVisible();
    });

    test(&apos;should toggle password visibility&apos;, async ({ page }) => {
      await page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, &apos;testpassword&apos;);
      
      // Initial state should be password hidden
      expect(await page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;).getAttribute(&apos;type&apos;)).toBe(&apos;password&apos;);
      
      // Click show password button
      await page.click(&apos;[data-testid=&quot;toggle-password&quot;]&apos;);
      expect(await page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;).getAttribute(&apos;type&apos;)).toBe(&apos;text&apos;);
      
      // Click hide password button
      await page.click(&apos;[data-testid=&quot;toggle-password&quot;]&apos;);
      expect(await page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;).getAttribute(&apos;type&apos;)).toBe(&apos;password&apos;);
    });
  });

  test.describe(&apos;Successful Login&apos;, () => {
    test(&apos;should login with valid credentials&apos;, async ({ page }) => {
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test(&apos;should maintain login state after page refresh&apos;, async ({ page }) => {
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      await page.waitForURL(/.*dashboard/);
      
      await page.reload();
      
      // Should still be on dashboard after refresh
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test(&apos;should redirect to requested page after login&apos;, async ({ page }) => {
      const targetPage = &apos;/dashboard/projects&apos;;
      await page.goto(targetPage);
      await expect(page).toHaveURL(/.*login/);
      
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      // Should redirect to originally requested page
      await expect(page).toHaveURL(targetPage);
    });
  });

  test.describe(&apos;Form Validation&apos;, () => {
    test(&apos;should validate email format&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.malformedEmail,
        password: VALID_CREDENTIALS.password
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain(&apos;valid email&apos;);
    });

    test(&apos;should require email field&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.emptyEmail,
        password: VALID_CREDENTIALS.password
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain(&apos;required&apos;);
    });

    test(&apos;should require password field&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: VALID_CREDENTIALS.email,
        password: INVALID_CREDENTIALS.emptyPassword
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain(&apos;required&apos;);
    });
  });

  test.describe(&apos;Error Handling&apos;, () => {
    test(&apos;should show error with invalid credentials&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.nonExistentEmail,
        password: INVALID_CREDENTIALS.wrongPassword
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain(&apos;Invalid login credentials&apos;);
    });

    test(&apos;should handle network errors gracefully&apos;, async ({ page }) => {
      // Mock a network error
      await page.route(&apos;**/api/auth/login&apos;, route => route.abort(&apos;failed&apos;));
      
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage?.toLowerCase()).toMatch(/network|connection/i);
    });

    test(&apos;should protect against SQL injection&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: VALID_CREDENTIALS.email,
        password: INVALID_CREDENTIALS.sqlInjection
      });
      await submitLoginForm(page);
      
      // Should not allow login
      await expect(page).toHaveURL(/.*login/);
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toBeTruthy();
    });

    test(&apos;should sanitize input against XSS&apos;, async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.xssAttempt,
        password: VALID_CREDENTIALS.password
      });
      
      const emailInput = page.locator(&apos;[data-testid=&quot;email-input&quot;]&apos;);
      const value = await emailInput.inputValue();
      expect(value).not.toContain(&apos;<script>&apos;);
    });
  });

  test.describe(&apos;Rate Limiting&apos;, () => {
    test(&apos;should implement rate limiting after multiple failed attempts&apos;, async ({ page }) => {
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await fillLoginForm(page, {
          email: INVALID_CREDENTIALS.nonExistentEmail,
          password: INVALID_CREDENTIALS.wrongPassword
        });
        await submitLoginForm(page);
        await page.waitForTimeout(1000); // Wait between attempts
      }
      
      // Check for rate limit message
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage?.toLowerCase()).toMatch(/too many|try again|rate limit/i);
    });
  });

  test.describe(&apos;Navigation&apos;, () => {
    test(&apos;should navigate to signup page&apos;, async ({ page }) => {
      await page.click(&apos;text=Sign up&apos;);
      await expect(page).toHaveURL(/.*signup/);
    });

    test(&apos;should navigate to forgot password page&apos;, async ({ page }) => {
      await page.click(&apos;text=Forgot your password?&apos;);
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });
}); 