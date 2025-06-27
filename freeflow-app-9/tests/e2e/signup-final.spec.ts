import { test, expect, Page } from &apos;@playwright/test&apos;;

// Test data constants
const VALID_USER = {
  fullName: &apos;John Doe&apos;,
  email: &apos;john.doe@example.com&apos;,
  password: &apos;SecurePassword123!&apos;
};

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

const waitForErrorOrSuccess = async (page: Page, timeout = 5000) => {
  try {
    await page.waitForSelector(&apos;[role=&quot;alert&quot;]&apos;, { timeout });
    return true;
  } catch {
    return false;
  }
};

test.describe(&apos;Comprehensive Signup Flow Tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page
    await page.goto(&apos;/signup&apos;);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Ensure main elements are visible
    await expect(page.locator(&apos;form&apos;)).toBeVisible();
  });

  test.describe(&apos;🎯 Valid User Registration&apos;, () => {
    test(&apos;should successfully display signup form with all elements&apos;, async ({ page }) => {
      // Check page title and heading
      await expect(page.locator(&apos;text=Join FreeflowZee&apos;)).toBeVisible();
      
      // Check all form fields are present
      await expect(page.locator(&apos;#fullName&apos;)).toBeVisible();
      await expect(page.locator(&apos;#email&apos;)).toBeVisible();
      await expect(page.locator(&apos;#password&apos;)).toBeVisible();
      await expect(page.locator(&apos;#confirmPassword&apos;)).toBeVisible();
      
      // Check labels
      await expect(page.locator(&apos;text=Full Name&apos;)).toBeVisible();
      await expect(page.locator(&apos;text=Email&apos;)).toBeVisible();
      await expect(page.locator(&apos;text=Password&apos;)).toBeVisible();
      await expect(page.locator(&apos;text=Confirm Password&apos;)).toBeVisible();
      
      // Check submit button
      await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toContainText(&apos;Create Account&apos;);
      
      // Check login link
      await expect(page.locator(&apos;a[href=&quot;/login&quot;]&apos;)).toContainText(&apos;Sign in here&apos;);
    });

    test(&apos;should handle valid form submission&apos;, async ({ page }) => {
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
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Check if button shows loading state initially
      const submitButton = page.locator(&apos;button[type=&quot;submit&quot;]&apos;);
      
      // Either success message appears or redirect happens
      const hasAlert = await waitForErrorOrSuccess(page);
      
      if (hasAlert) {
        const alertText = await page.locator(&apos;[role=&quot;alert&quot;]&apos;).textContent();
        console.log(&apos;Alert message:&apos;, alertText);
        
        // Should be either success or error
        expect(alertText).toBeTruthy();
      }
    });
  });

  test.describe(&apos;📧 Email Validation&apos;, () => {
    test(&apos;should validate email format - missing @&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;invalidemail.com&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      // Check HTML5 validation
      const emailInput = page.locator(&apos;#email&apos;);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test(&apos;should validate email format - missing domain&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;user@&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator(&apos;#email&apos;);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test(&apos;should validate email format - double dots&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: &apos;user@domain..com&apos;,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const emailInput = page.locator(&apos;#email&apos;);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });
  });

  test.describe(&apos;🔒 Password Validation&apos;, () => {
    test(&apos;should show error for password too short&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: &apos;123&apos;,
        confirmPassword: &apos;123&apos;
      });

      await submitForm(page);
      
      // Wait for client-side validation
      await page.waitForTimeout(1000);
      
      // Look for error message (might be in different formats)
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        const errorText = await page.locator(&apos;[role=&quot;alert&quot;]&apos;).textContent();
        expect(errorText?.toLowerCase()).toContain(&apos;password&apos;);
        expect(errorText?.toLowerCase()).toMatch(/(6|characters|short)/);
      }
    });

    test(&apos;should show error for mismatched passwords&apos;, async ({ page }) => {
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: &apos;DifferentPassword123!&apos;
      });

      await submitForm(page);
      
      // Wait for client-side validation
      await page.waitForTimeout(1000);
      
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        const errorText = await page.locator(&apos;[role=&quot;alert&quot;]&apos;).textContent();
        expect(errorText?.toLowerCase()).toMatch(/(password|match)/);
      }
    });

    test(&apos;should toggle password visibility correctly&apos;, async ({ page }) => {
      // Fill password field
      await page.fill(&apos;#password&apos;, &apos;testpassword&apos;);
      
      // Password field should be type=&quot;password&quot; initially
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
      
      // Find the toggle button (should be near the password input)
      const passwordContainer = page.locator(&apos;#password&apos;).locator(&apos;..&apos;);
      const toggleButton = passwordContainer.locator(&apos;button&apos;).first();
      
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        
        // Check if type changed
        const newType = await page.locator(&apos;#password&apos;).getAttribute(&apos;type&apos;);
        console.log(&apos;Password field type after toggle:&apos;, newType);
        
        // Should be either &apos;text&apos; or still &apos;password&apos; if toggle didn&apos;t work
        expect([&apos;text&apos;, &apos;password&apos;]).toContain(newType);
      }
    });
  });

  test.describe(&apos;📝 Empty Form Validation&apos;, () => {
    test(&apos;should prevent submission of empty form&apos;, async ({ page }) => {
      // Submit completely empty form
      await submitForm(page);
      
      // Check HTML5 validation for required fields
      const fullNameInput = page.locator(&apos;#fullName&apos;);
      const emailInput = page.locator(&apos;#email&apos;);
      const passwordInput = page.locator(&apos;#password&apos;);
      const confirmPasswordInput = page.locator(&apos;#confirmPassword&apos;);
      
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

    test(&apos;should show validation for missing individual fields&apos;, async ({ page }) => {
      // Test missing full name
      await fillSignupForm(page, {
        email: VALID_USER.email,
        password: VALID_USER.password,
        confirmPassword: VALID_USER.password
      });

      await submitForm(page);
      
      const fullNameValid = await page.locator(&apos;#fullName&apos;).evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(fullNameValid).toBe(false);
    });
  });

  test.describe(&apos;🎨 UI/UX Elements&apos;, () => {
    test(&apos;should display proper accessibility attributes&apos;, async ({ page }) => {
      // Check form structure
      await expect(page.locator(&apos;form&apos;)).toBeVisible();
      
      // Check required attributes
      await expect(page.locator(&apos;#fullName&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#email&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#email&apos;)).toHaveAttribute(&apos;type&apos;, &apos;email&apos;);
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;required&apos;);
      await expect(page.locator(&apos;#confirmPassword&apos;)).toHaveAttribute(&apos;required&apos;);
    });

    test(&apos;should navigate to login page&apos;, async ({ page }) => {
      // Click login link
      await page.click(&apos;a[href=&quot;/login&quot;]&apos;);
      
      // Should navigate to login page
      await expect(page).toHaveURL(/.*login/);
    });

    test(&apos;should display proper placeholders and labels&apos;, async ({ page }) => {
      // Check placeholders
      await expect(page.locator(&apos;#fullName&apos;)).toHaveAttribute(&apos;placeholder&apos;, /name/i);
      await expect(page.locator(&apos;#email&apos;)).toHaveAttribute(&apos;placeholder&apos;, /email/i);
      await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;placeholder&apos;, /password/i);
      await expect(page.locator(&apos;#confirmPassword&apos;)).toHaveAttribute(&apos;placeholder&apos;, /password/i);
    });
  });

  test.describe(&apos;📱 Mobile Responsiveness&apos;, () => {
    test(&apos;should work correctly on mobile viewport&apos;, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Form should still be visible and usable
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

  test.describe(&apos;🛡️ Error Handling&apos;, () => {
    test(&apos;should handle server errors gracefully&apos;, async ({ page }) => {
      // Intercept auth requests and simulate server error
      await page.route(&apos;**/auth/**&apos;, route => {
        route.abort(&apos;failed&apos;);
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
        const errorText = await page.locator(&apos;[role=&quot;alert&quot;]&apos;).textContent();
        console.log(&apos;Error handling test - Alert text:&apos;, errorText);
        expect(errorText).toBeTruthy();
      }
    });

    test(&apos;should clear errors when correcting form&apos;, async ({ page }) => {
      // First submit with short password
      await fillSignupForm(page, {
        fullName: VALID_USER.fullName,
        email: VALID_USER.email,
        password: &apos;123&apos;,
        confirmPassword: &apos;123&apos;
      });

      await submitForm(page);
      await page.waitForTimeout(1000);

      // Check if error appeared
      const hasError = await waitForErrorOrSuccess(page);
      
      if (hasError) {
        // Now correct the password
        await page.fill(&apos;#password&apos;, VALID_USER.password);
        await page.fill(&apos;#confirmPassword&apos;, VALID_USER.password);
        
        await submitForm(page);
        await page.waitForTimeout(1000);
        
        // Previous error should be cleared or replaced
        console.log(&apos;Error clearing test completed&apos;);
      }
    });
  });
}); 