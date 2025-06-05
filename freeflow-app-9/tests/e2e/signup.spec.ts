import { test, expect, Page } from '@playwright/test';

// Test data constants
const VALID_USER = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!'
};

const DUPLICATE_EMAIL = 'existing.user@example.com';

// Helper functions
const fillSignupForm = async (page: Page, data: { fullName?: string; email?: string; password?: string; confirmPassword?: string }) => {
  if (data.fullName !== undefined) {
    await page.fill('#fullName', data.fullName);
  }
  if (data.email !== undefined) {
    await page.fill('#email', data.email);
  }
  if (data.password !== undefined) {
    await page.fill('#password', data.password);
  }
  if (data.confirmPassword !== undefined) {
    await page.fill('#confirmPassword', data.confirmPassword);
  }
};

const submitForm = async (page: Page) => {
  await page.click('button[type="submit"]');
};

const expectError = async (page: Page, errorMessage: string) => {
  await expect(page.locator('[role="alert"]')).toContainText(errorMessage);
};

const expectSuccess = async (page: Page, successMessage: string) => {
  await expect(page.locator('[role="alert"]')).toContainText(successMessage);
};

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto('/signup');
    
    // Wait for the page to be fully loaded
    await expect(page.locator('h1, .text-2xl')).toContainText('Join FreeflowZee');
    
    // Ensure form is visible
    await expect(page.locator('form')).toBeVisible();
  });

  test.describe('Valid User Registration', () => {
    test('should successfully register a new user with valid data', async ({ page }) => {
      // Fill form with valid data
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      // Submit form
      await submitForm(page);

      // Wait for success message or redirect
      await page.waitForLoadState('networkidle');
      
      // Check for success message or redirect to login
      try {
        await expectSuccess(page, 'Account created successfully');
      } catch {
        // If redirected to login page, check URL
        await expect(page).toHaveURL(/.*login.*/);
        await expect(page.locator('text=Account created successfully')).toBeVisible();
      }
    });

    test('should handle form submission with loading state', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: `test.${Date.now()}@example.com`, // Unique email
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      // Check that submit button shows loading state
      await submitForm(page);
      
      // Button should show loading text
      await expect(page.locator('button[type="submit"]')).toContainText('Creating Account...');
    });
  });

  test.describe('Email Validation', () => {
    test('should show error for invalid email format - missing @', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'invalidemail.com',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      // Check HTML5 validation or custom error
      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveAttribute('type', 'email');
      
      // Browser should prevent submission due to invalid email
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });

    test('should show error for invalid email format - missing domain', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'user@',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator('#email');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });

    test('should show error for invalid email format - special characters', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'user@domain..com',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator('#email');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });

    test('should handle duplicate email registration', async ({ page }) => {
      // First, try to register with an email that might already exist
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: DUPLICATE_EMAIL,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      await page.waitForLoadState('networkidle');

      // Should show error for duplicate email
      // Note: This depends on Supabase returning an appropriate error message
      const errorLocator = page.locator('[role="alert"]');
      if (await errorLocator.isVisible()) {
        const errorText = await errorLocator.textContent();
        expect(errorText).toMatch(/(already|exists|registered|taken)/i);
      }
    });
  });

  test.describe('Password Validation', () => {
    test('should show error for password too short', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '123',
        confirmPassword: '123'
      });

      await submitForm(page);
      
      // Should show client-side validation error
      await expectError(page, 'Password must be at least 6 characters long');
    });

    test('should show error for empty password', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '',
        confirmPassword: ''
      });

      await submitForm(page);
      
      // Check HTML5 required validation
      const passwordInput = page.locator('#password');
      const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: 'DifferentPassword123!'
      });

      await submitForm(page);
      
      // Should show client-side validation error
      await expectError(page, 'Passwords do not match');
    });

    test('should toggle password visibility', async ({ page }) => {
      // Fill password field
      await page.fill('#password', VALID_USER.password);
      
      // Check initial type is password
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
      
      // Click eye icon to show password
      await page.click('#password ~ button');
      
      // Check type changed to text
      await expect(page.locator('#password')).toHaveAttribute('type', 'text');
      
      // Click again to hide password
      await page.click('#password ~ button');
      
      // Check type changed back to password
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    });

    test('should toggle confirm password visibility', async ({ page }) => {
      // Fill confirm password field
      await page.fill('#confirmPassword', VALID_USER.password);
      
      // Check initial type is password
      await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password');
      
      // Click eye icon to show password
      await page.click('#confirmPassword ~ button');
      
      // Check type changed to text
      await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'text');
    });
  });

  test.describe('Empty Form Validation', () => {
    test('should show validation errors for completely empty form', async ({ page }) => {
      // Submit empty form
      await submitForm(page);
      
      // Check HTML5 validation for required fields
      const fullNameInput = page.locator('#fullName');
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const confirmPasswordInput = page.locator('#confirmPassword');
      
      // All fields should have validation messages
      const fullNameValidation = await fullNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const confirmPasswordValidation = await confirmPasswordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      expect(fullNameValidation).not.toBe('');
      expect(emailValidation).not.toBe('');
      expect(passwordValidation).not.toBe('');
      expect(confirmPasswordValidation).not.toBe('');
    });

    test('should show error for missing full name', async ({ page }) => {
      await fillSignupForm(page, {
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const fullNameInput = page.locator('#fullName');
      const validationMessage = await fullNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });

    test('should show error for missing email', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator('#email');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('');
    });
  });

  test.describe('UI/UX Elements', () => {
    test('should display all form elements correctly', async ({ page }) => {
      // Check all form elements are visible
      await expect(page.locator('#fullName')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check labels
      await expect(page.locator('label[for="fullName"]')).toContainText('Full Name');
      await expect(page.locator('label[for="email"]')).toContainText('Email');
      await expect(page.locator('label[for="password"]')).toContainText('Password');
      await expect(page.locator('label[for="confirmPassword"]')).toContainText('Confirm Password');
      
      // Check submit button text
      await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
      
      // Check links
      await expect(page.locator('text=Already have an account?')).toBeVisible();
      await expect(page.locator('a[href="/login"]')).toContainText('Sign in here');
    });

    test('should navigate to login page from signup', async ({ page }) => {
      // Click login link
      await page.click('a[href="/login"]');
      
      // Should navigate to login page
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      // Check form has proper structure
      await expect(page.locator('form')).toBeVisible();
      
      // Check inputs have proper labels
      await expect(page.locator('#fullName')).toHaveAttribute('required');
      await expect(page.locator('#email')).toHaveAttribute('required');
      await expect(page.locator('#email')).toHaveAttribute('type', 'email');
      await expect(page.locator('#password')).toHaveAttribute('required');
      await expect(page.locator('#confirmPassword')).toHaveAttribute('required');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept network requests and simulate error
      await page.route('**/auth/signup', route => {
        route.abort('failed');
      });

      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      await page.waitForTimeout(2000);

      // Should show error message
      await expectError(page, 'An unexpected error occurred');
    });

    test('should clear previous errors when submitting new form', async ({ page }) => {
      // First submission with invalid data
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '123',
        confirmPassword: '123'
      });

      await submitForm(page);
      await expectError(page, 'Password must be at least 6 characters long');

      // Fix the password and submit again
      await fillSignupForm(page, {
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);

      // Error should be cleared
      const errorAlert = page.locator('[role="alert"]').filter({ hasText: 'Password must be at least 6 characters long' });
      await expect(errorAlert).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check form is still usable
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('#fullName')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Test form functionality on mobile
      await fillSignupForm(page, {
        fullName: 'Mobile User',
        email: 'mobile@example.com',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      await page.waitForLoadState('networkidle');
    });
  });
}); 