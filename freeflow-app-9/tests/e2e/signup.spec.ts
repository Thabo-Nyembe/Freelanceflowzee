import { test, expect, Page } from &apos;@playwright/test&apos;;

// Test data constants
const VALID_USER = {
  fullName: &apos;John Doe&apos;,
  email: &apos;john.doe@example.com&apos;,
  password: &apos;SecurePassword123!&apos;
};

const DUPLICATE_EMAIL = &apos;existing.user@example.com&apos;;

// Helper functions
const fillSignupForm = async (page: Page, data: { fullName?: string; email?: string; password?: string; confirmPassword?: string }) => {
  if (data.fullName !== undefined) {
    await page.fill(&apos;#fullName&apos;, data.fullName);
  }
  if (data.email !== undefined) {
    await page.fill(&apos;#email&apos;, data.email);
  }
  if (data.password !== undefined) {
    await page.fill(&apos;#password&apos;, data.password);
  }
  if (data.confirmPassword !== undefined) {
    await page.fill(&apos;#confirmPassword&apos;, data.confirmPassword);
  }
};

const submitForm = async (page: Page) => {
  await page.click(&apos;button[type=&quot;submit&quot;]&apos;);
};

const expectError = async (page: Page, errorMessage: string) => {
  await expect(page.locator(&apos;[role=&quot;alert&quot;]&apos;)).toContainText(errorMessage);
};

const expectSuccess = async (page: Page, successMessage: string) => {
  await expect(page.locator(&apos;[role=&quot;alert&quot;]&apos;)).toContainText(successMessage);
};

test.describe(&apos;Signup Flow&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto(&apos;/signup&apos;);
    
    // Wait for the page to be fully loaded
    await expect(page.locator(&apos;h1, .text-2xl&apos;)).toContainText(&apos;Join FreeflowZee&apos;);
    
    // Ensure form is visible
    await expect(page.locator(&apos;form&apos;)).toBeVisible();
  });

  test.describe(&apos;Valid User Registration&apos;, () => {
    test(&apos;should successfully register a new user with valid data&apos;, async ({ page }) => {
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
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Check for success message or redirect to login
      try {
        await expectSuccess(page, &apos;Account created successfully&apos;);
      } catch {
        // If redirected to login page, check URL
        await expect(page).toHaveURL(/.*login.*/);
        await expect(page.locator(&apos;text=Account created successfully&apos;)).toBeVisible();
      }
    });

    test(&apos;should handle form submission with loading state&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: `test.${Date.now()}@example.com`, // Unique email
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      // Check that submit button shows loading state
      await submitForm(page);
      
      // Button should show loading text
      await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toContainText(&apos;Creating Account...&apos;);
    });
  });

  test.describe(&apos;Email Validation&apos;, () => {
    test(&apos;should show error for invalid email format - missing @&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;invalidemail.com&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      // Check HTML5 validation or custom error
      const emailInput = page.locator(&apos;#email&apos;);
      await expect(emailInput).toHaveAttribute(&apos;type&apos;, &apos;email&apos;);
      
      // Browser should prevent submission due to invalid email
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });

    test(&apos;should show error for invalid email format - missing domain&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;user@&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator(&apos;#email&apos;);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });

    test(&apos;should show error for invalid email format - special characters&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;user@domain..com&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator(&apos;#email&apos;);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });

    test(&apos;should handle duplicate email registration&apos;, async ({ page }) => {
      // First, try to register with an email that might already exist
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: DUPLICATE_EMAIL,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      await page.waitForLoadState(&apos;networkidle&apos;);

      // Should show error for duplicate email
      // Note: This depends on Supabase returning an appropriate error message
      const errorLocator = page.locator(&apos;[role=&quot;alert&quot;]&apos;);
      if (await errorLocator.isVisible()) {
        const errorText = await errorLocator.textContent();
        expect(errorText).toMatch(/(already|exists|registered|taken)/i);
      }
    });
  });

  test.describe(&apos;Password Validation&apos;, () => {
    test(&apos;should show error for password too short&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: &apos;123&apos;,
        confirmPassword: &apos;123&apos;
      });

      await submitForm(page);
      
      // Should show client-side validation error
      await expectError(page, &apos;Password must be at least 6 characters long&apos;);
    });

    test(&apos;should show error for empty password&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: '&apos;,'
        confirmPassword: '&apos;'
      });

      await submitForm(page);
      
      // Check HTML5 required validation
      const passwordInput = page.locator(&apos;#password&apos;);
      const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });

    test(&apos;should show error for mismatched passwords&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: &apos;DifferentPassword123!&apos;
      });

      await submitForm(page);
      
      // Should show client-side validation error
      await expectError(page, &apos;Passwords do not match&apos;);
    });

    test(&apos;should toggle password visibility&apos;, async ({ page }) => {
      // Fill password field
      await page.fill(&apos;#password&apos;, VALID_USER.password);
      
      // Check initial type is password
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
      
      // Click eye icon to show password
      await page.click(&apos;#password ~ button&apos;);
      
      // Check type changed to text
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;text&apos;);
      
      // Click again to hide password
      await page.click(&apos;#password ~ button&apos;);
      
      // Check type changed back to password
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
    });

    test(&apos;should toggle confirm password visibility&apos;, async ({ page }) => {
      // Fill confirm password field
      await page.fill(&apos;#confirmPassword&apos;, VALID_USER.password);
      
      // Check initial type is password
      await expect(page.locator(&apos;#confirmPassword&apos;)).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
      
      // Click eye icon to show password
      await page.click(&apos;#confirmPassword ~ button&apos;);
      
      // Check type changed to text
      await expect(page.locator(&apos;#confirmPassword&apos;)).toHaveAttribute(&apos;type&apos;, &apos;text&apos;);
    });
  });

  test.describe(&apos;Empty Form Validation&apos;, () => {
    test(&apos;should show validation errors for completely empty form&apos;, async ({ page }) => {
      // Submit empty form
      await submitForm(page);
      
      // Check HTML5 validation for required fields
      const fullNameInput = page.locator(&apos;#fullName&apos;);
      const emailInput = page.locator(&apos;#email&apos;);
      const passwordInput = page.locator(&apos;#password&apos;);
      const confirmPasswordInput = page.locator(&apos;#confirmPassword&apos;);
      
      // All fields should have validation messages
      const fullNameValidation = await fullNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const confirmPasswordValidation = await confirmPasswordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      expect(fullNameValidation).not.toBe('&apos;);'
      expect(emailValidation).not.toBe('&apos;);'
      expect(passwordValidation).not.toBe('&apos;);'
      expect(confirmPasswordValidation).not.toBe('&apos;);'
    });

    test(&apos;should show error for missing full name&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const fullNameInput = page.locator(&apos;#fullName&apos;);
      const validationMessage = await fullNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });

    test(&apos;should show error for missing email&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator(&apos;#email&apos;);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).not.toBe('&apos;);'
    });
  });

  test.describe(&apos;UI/UX Elements&apos;, () => {
    test(&apos;should display all form elements correctly&apos;, async ({ page }) => {
      // Check all form elements are visible
      await expect(page.locator(&apos;#fullName&apos;)).toBeVisible();
      await expect(page.locator(&apos;#email&apos;)).toBeVisible();
      await expect(page.locator(&apos;#password&apos;)).toBeVisible();
      await expect(page.locator(&apos;#confirmPassword&apos;)).toBeVisible();
      await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toBeVisible();
      
      // Check labels
      await expect(page.locator(&apos;label[for=&quot;fullName&quot;]&apos;)).toContainText(&apos;Full Name&apos;);
      await expect(page.locator(&apos;label[for=&quot;email&quot;]&apos;)).toContainText(&apos;Email&apos;);
      await expect(page.locator(&apos;label[for=&quot;password&quot;]&apos;)).toContainText(&apos;Password&apos;);
      await expect(page.locator(&apos;label[for=&quot;confirmPassword&quot;]&apos;)).toContainText(&apos;Confirm Password&apos;);
      
      // Check submit button text
      await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toContainText(&apos;Create Account&apos;);
      
      // Check links
      await expect(page.locator(&apos;text=Already have an account?&apos;)).toBeVisible();
      await expect(page.locator(&apos;a[href=&quot;/login&quot;]&apos;)).toContainText(&apos;Sign in here&apos;);
    });

    test(&apos;should navigate to login page from signup&apos;, async ({ page }) => {
      // Click login link
      await page.click(&apos;a[href=&quot;/login&quot;]&apos;);
      
      // Should navigate to login page
      await expect(page).toHaveURL(/.*login.*/);
    });

    test(&apos;should have proper accessibility attributes&apos;, async ({ page }) => {
      // Check form has proper structure
      await expect(page.locator(&apos;form&apos;)).toBeVisible();
      
      // Check inputs have proper labels
      await expect(page.locator(&apos;#fullName&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#email&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#email&apos;)).toHaveAttribute(&apos;type&apos;, &apos;email&apos;);
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#confirmPassword&apos;)).toHaveAttribute(&apos;required&apos;);
    });
  });

  test.describe(&apos;Error Handling&apos;, () => {
    test(&apos;should handle network errors gracefully&apos;, async ({ page }) => {
      // Intercept network requests and simulate error
      await page.route(&apos;**/auth/signup&apos;, route => {
        route.abort(&apos;failed&apos;);
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
      await expectError(page, &apos;An unexpected error occurred&apos;);
    });

    test(&apos;should clear previous errors when submitting new form&apos;, async ({ page }) => {
      // First submission with invalid data
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: &apos;123&apos;,
        confirmPassword: &apos;123&apos;
      });

      await submitForm(page);
      await expectError(page, &apos;Password must be at least 6 characters long&apos;);

      // Fix the password and submit again
      await fillSignupForm(page, {
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);

      // Error should be cleared
      const errorAlert = page.locator(&apos;[role=&quot;alert&quot;]&apos;).filter({ hasText: &apos;Password must be at least 6 characters long&apos; });
      await expect(errorAlert).not.toBeVisible();
    });
  });

  test.describe(&apos;Mobile Responsiveness&apos;, () => {
    test(&apos;should display correctly on mobile devices&apos;, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check form is still usable
      await expect(page.locator(&apos;form&apos;)).toBeVisible();
      await expect(page.locator(&apos;#fullName&apos;)).toBeVisible();
      await expect(page.locator(&apos;#email&apos;)).toBeVisible();
      await expect(page.locator(&apos;#password&apos;)).toBeVisible();
      await expect(page.locator(&apos;#confirmPassword&apos;)).toBeVisible();
      await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toBeVisible();
      
      // Test form functionality on mobile
      await fillSignupForm(page, {
        fullName: &apos;Mobile User&apos;,
        email: &apos;mobile@example.com&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      await page.waitForLoadState(&apos;networkidle&apos;);
    });
  });
}); 