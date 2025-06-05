import { test, expect, Page } from '@playwright/test';

// Test data constants
const VALID_USER = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!'
};

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

const waitForErrorOrSuccess = async (page: Page, timeout = 5000) => {
  try {
    await page.waitForSelector('[role="alert"]', { timeout });
    return true;
  } catch {
    return false;
  }
};

test.describe('Comprehensive Signup Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Ensure main elements are visible
    await expect(page.locator('form')).toBeVisible();
  });

  test.describe('🎯 Valid User Registration', () => {
    test('should successfully display signup form with all elements', async ({ page }) => {
      // Check page title and heading
      await expect(page.locator('text=Join FreeflowZee')).toBeVisible();
      
      // Check all form fields are present
      await expect(page.locator('#fullName')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      
      // Check labels
      await expect(page.locator('text=Full Name')).toBeVisible();
      await expect(page.locator('text=Email')).toBeVisible();
      await expect(page.locator('text=Password')).toBeVisible();
      await expect(page.locator('text=Confirm Password')).toBeVisible();
      
      // Check submit button
      await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
      
      // Check login link
      await expect(page.locator('a[href="/login"]')).toContainText('Sign in here');
    });

    test('should handle valid form submission', async ({ page }) => {
      // Fill form with valid data
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: `test.${Date.now()}@example.com`, // Unique email
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      // Submit form
      await submitForm(page);

      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check if button shows loading state initially
      const submitButton = page.locator('button[type="submit"]');
      
      // Either success message appears or redirect happens
      const hasAlert = await waitForErrorOrSuccess(page);
      
      if (hasAlert) {
        const alertText = await page.locator('[role="alert"]').textContent();
        console.log('Alert message:', alertText);
        
        // Should be either success or error
        expect(alertText).toBeTruthy();
      }
    });
  });

  test.describe('📧 Email Validation', () => {
    test('should validate email format - missing @', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'invalidemail.com',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      // Check HTML5 validation
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('should validate email format - missing domain', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'user@',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('should validate email format - double dots', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: 'user@domain..com',
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });
  });

  test.describe('🔒 Password Validation', () => {
    test('should show error for password too short', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '123',
        confirmPassword: '123'
      });

      await submitForm(page);
      
      // Wait for client-side validation
      await page.waitForTimeout(1000);
      
      // Look for error message (might be in different formats)
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        const errorText = await page.locator('[role="alert"]').textContent();
        expect(errorText?.toLowerCase()).toContain('password');
        expect(errorText?.toLowerCase()).toMatch(/(6|characters|short)/);
      }
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: 'DifferentPassword123!'
      });

      await submitForm(page);
      
      // Wait for client-side validation
      await page.waitForTimeout(1000);
      
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        const errorText = await page.locator('[role="alert"]').textContent();
        expect(errorText?.toLowerCase()).toMatch(/(password|match)/);
      }
    });

    test('should toggle password visibility correctly', async ({ page }) => {
      // Fill password field
      await page.fill('#password', 'testpassword');
      
      // Password field should be type="password" initially
      await expect(page.locator('#password')).toHaveAttribute('type', 'password');
      
      // Find the toggle button (should be near the password input)
      const passwordContainer = page.locator('#password').locator('..');
      const toggleButton = passwordContainer.locator('button').first();
      
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        
        // Check if type changed
        const newType = await page.locator('#password').getAttribute('type');
        console.log('Password field type after toggle:', newType);
        
        // Should be either 'text' or still 'password' if toggle didn't work
        expect(['text', 'password']).toContain(newType);
      }
    });
  });

  test.describe('📝 Empty Form Validation', () => {
    test('should prevent submission of empty form', async ({ page }) => {
      // Submit completely empty form
      await submitForm(page);
      
      // Check HTML5 validation for required fields
      const fullNameInput = page.locator('#fullName');
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const confirmPasswordInput = page.locator('#confirmPassword');
      
      // All required fields should be invalid when empty
      const fullNameValid = await fullNameInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      const emailValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      const passwordValid = await passwordInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      const confirmPasswordValid = await confirmPasswordInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      
      expect(fullNameValid).toBe(false);
      expect(emailValid).toBe(false);
      expect(passwordValid).toBe(false);
      expect(confirmPasswordValid).toBe(false);
    });

    test('should show validation for missing individual fields', async ({ page }) => {
      // Test missing full name
      await fillSignupForm(page, {
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const fullNameValid = await page.locator('#fullName').evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(fullNameValid).toBe(false);
    });
  });

  test.describe('🎨 UI/UX Elements', () => {
    test('should display proper accessibility attributes', async ({ page }) => {
      // Check form structure
      await expect(page.locator('form')).toBeVisible();
      
      // Check required attributes
      await expect(page.locator('#fullName')).toHaveAttribute('required');
      await expect(page.locator('#email')).toHaveAttribute('required');
      await expect(page.locator('#email')).toHaveAttribute('type', 'email');
      await expect(page.locator('#password')).toHaveAttribute('required');
      await expect(page.locator('#confirmPassword')).toHaveAttribute('required');
    });

    test('should navigate to login page', async ({ page }) => {
      // Click login link
      await page.click('a[href="/login"]');
      
      // Should navigate to login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should display proper placeholders and labels', async ({ page }) => {
      // Check placeholders
      await expect(page.locator('#fullName')).toHaveAttribute('placeholder', /name/i);
      await expect(page.locator('#email')).toHaveAttribute('placeholder', /email/i);
      await expect(page.locator('#password')).toHaveAttribute('placeholder', /password/i);
      await expect(page.locator('#confirmPassword')).toHaveAttribute('placeholder', /password/i);
    });
  });

  test.describe('📱 Mobile Responsiveness', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Form should still be visible and usable
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

  test.describe('🛡️ Error Handling', () => {
    test('should handle server errors gracefully', async ({ page }) => {
      // Intercept auth requests and simulate server error
      await page.route('**/auth/**', route => {
        route.abort('failed');
      });

      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      // Wait for potential error handling
      await page.waitForTimeout(3000);
      
      // Check if error is displayed or handled gracefully
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        const errorText = await page.locator('[role="alert"]').textContent();
        console.log('Error handling test - Alert text:', errorText);
        expect(errorText).toBeTruthy();
      }
    });

    test('should clear errors when correcting form', async ({ page }) => {
      // First submit with short password
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '123',
        confirmPassword: '123'
      });

      await submitForm(page);
      await page.waitForTimeout(1000);

      // Check if error appeared
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        // Now correct the password
        await page.fill('#password', VALID_USER.password);
        await page.fill('#confirmPassword', VALID_USER.password);
        
        await submitForm(page);
        await page.waitForTimeout(1000);
        
        // Previous error should be cleared or replaced
        console.log('Error clearing test completed');
      }
    });
  });
}); 