import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

// Test data constants
const VALID_CREDENTIALS = {
  email: 'thabo@kaleidocraft.co.za',
  password: 'password1234'
};

const INVALID_CREDENTIALS = {
  invalidEmail: 'invalid@example.com',
  nonExistentEmail: 'nonexistent@example.com',
  wrongPassword: 'WrongPassword123!',
  malformedEmail: 'not-an-email',
  emptyEmail: '',
  emptyPassword: '',
  sqlInjection: "' OR '1'='1",
  xssAttempt: '<script>alert("xss")</script>@example.com'
};

// Helper functions
const fillLoginForm = async (page: Page, data: { email?: string; password?: string }) => {
  if (data.email !== undefined) {
    await page.fill('[data-testid="email-input"]', data.email);
  }
  if (data.password !== undefined) {
    await page.fill('[data-testid="password-input"]', data.password);
  }
};

const submitLoginForm = async (page: Page) => {
  await page.click('[data-testid="login-button"]');
};

const waitForLoginResponse = async (page: Page) => {
  await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 10000 }),
    page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 })
  ]);
};

const getErrorMessage = async (page: Page): Promise<string | null> => {
  try {
    const errorElement = page.locator('[data-testid="error-message"]');
    await errorElement.waitFor({ state: 'visible', timeout: 5000 });
    return errorElement.textContent();
  } catch {
    return null;
  }
};

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form with all elements', async ({ page }) => {
    // Check main form elements
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Sign in to your account to continue')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    const errorMessage = await page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Email is required');
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');
    await page.getByRole('textbox', { name: /password/i }).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation error
    const errorMessage = await page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Please enter a valid email address');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('wrong@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    const errorMessage = await page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid email or password');
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Enter valid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('thabo@kaleidocraft.co.za');
    await page.getByRole('textbox', { name: /password/i }).fill('password1234');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show success message when redirected with message', async ({ page }) => {
    // Go to login with success message
    await page.goto('/login?message=Please%20log%20in%20to%20continue');
    
    // Check for success message
    const successMessage = await page.getByTestId('success-message');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Please log in to continue');
  });

  test('should redirect to requested page after login', async ({ page }) => {
    // Go to login with redirect parameter
    await page.goto('/login?redirect=/projects');
    
    // Login with valid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('thabo@kaleidocraft.co.za');
    await page.getByRole('textbox', { name: /password/i }).fill('password1234');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to specified page
    await expect(page).toHaveURL('/projects');
  });
});

test.describe('Login Flow Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/login');
  });

  test.describe('UI Elements', () => {
    test('should display all required login form elements', async ({ page }) => {
      // Check for form elements
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      
      // Check for additional elements
      await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'testpassword');
      
      // Initial state should be password hidden
      expect(await page.locator('[data-testid="password-input"]').getAttribute('type')).toBe('password');
      
      // Click show password button
      await page.click('[data-testid="toggle-password"]');
      expect(await page.locator('[data-testid="password-input"]').getAttribute('type')).toBe('text');
      
      // Click hide password button
      await page.click('[data-testid="toggle-password"]');
      expect(await page.locator('[data-testid="password-input"]').getAttribute('type')).toBe('password');
    });
  });

  test.describe('Successful Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should maintain login state after page refresh', async ({ page }) => {
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      await page.waitForURL(/.*dashboard/);
      
      await page.reload();
      
      // Should still be on dashboard after refresh
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should redirect to requested page after login', async ({ page }) => {
      const targetPage = '/dashboard/projects';
      await page.goto(targetPage);
      await expect(page).toHaveURL(/.*login/);
      
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      // Should redirect to originally requested page
      await expect(page).toHaveURL(targetPage);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate email format', async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.malformedEmail,
        password: VALID_CREDENTIALS.password
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain('valid email');
    });

    test('should require email field', async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.emptyEmail,
        password: VALID_CREDENTIALS.password
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain('required');
    });

    test('should require password field', async ({ page }) => {
      await fillLoginForm(page, {
        email: VALID_CREDENTIALS.email,
        password: INVALID_CREDENTIALS.emptyPassword
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain('required');
    });
  });

  test.describe('Error Handling', () => {
    test('should show error with invalid credentials', async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.nonExistentEmail,
        password: INVALID_CREDENTIALS.wrongPassword
      });
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage).toContain('Invalid login credentials');
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock a network error
      await page.route('**/api/auth/login', route => route.abort('failed'));
      
      await fillLoginForm(page, VALID_CREDENTIALS);
      await submitLoginForm(page);
      
      const errorMessage = await getErrorMessage(page);
      expect(errorMessage?.toLowerCase()).toMatch(/network|connection/i);
    });

    test('should protect against SQL injection', async ({ page }) => {
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

    test('should sanitize input against XSS', async ({ page }) => {
      await fillLoginForm(page, {
        email: INVALID_CREDENTIALS.xssAttempt,
        password: VALID_CREDENTIALS.password
      });
      
      const emailInput = page.locator('[data-testid="email-input"]');
      const value = await emailInput.inputValue();
      expect(value).not.toContain('<script>');
    });
  });

  test.describe('Rate Limiting', () => {
    test('should implement rate limiting after multiple failed attempts', async ({ page }) => {
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

  test.describe('Navigation', () => {
    test('should navigate to signup page', async ({ page }) => {
      await page.click('text=Sign up');
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.click('text=Forgot your password?');
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });
}); 