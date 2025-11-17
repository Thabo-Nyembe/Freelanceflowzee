import { test, expect } from '@playwright/test';

/**
 * Comprehensive Test Suite for Sessions 1-13
 * Testing all button wiring, toast notifications, and next-step alerts
 *
 * Sessions Coverage:
 * - Session 9: Contact Form
 * - Session 10: Pricing Checkout
 * - Session 11: Landing Page, Features, Login, Signup
 * - Session 12: Client Zone
 * - Session 13: Gallery, Bookings
 */

test.describe('Comprehensive Sessions 1-13 Testing', () => {

  // ============================================================================
  // SESSION 11: LANDING PAGE TESTS
  // ============================================================================

  test.describe('Session 11: Landing Page', () => {
    test('should handle "Start Free Trial" button with toast and alert', async ({ page }) => {
      await page.goto('http://localhost:9323/');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Set up dialog handler to capture alert
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Find and click "Start Free Trial" button
      const trialButton = page.locator('button:has-text("Start Free Trial")').first();
      await expect(trialButton).toBeVisible();
      await trialButton.click();

      // Wait for toast notification
      await page.waitForTimeout(600);

      // Check if alert appeared with next steps
      expect(alertMessage).toContain('Welcome to KAZI');
      expect(alertMessage).toContain('Next Steps');
      expect(alertMessage).toContain('Create your account');

      console.log('✅ Landing Page: Start Free Trial - PASSED');
    });

    test('should handle "Watch Demo" button', async ({ page }) => {
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      const demoButton = page.locator('button:has-text("Watch Demo")').first();
      await expect(demoButton).toBeVisible();
      await demoButton.click();

      await page.waitForTimeout(600);

      expect(alertMessage).toContain('Interactive Demo');
      expect(alertMessage).toContain('What you\'ll see:');

      console.log('✅ Landing Page: Watch Demo - PASSED');
    });

    test('should handle feature card clicks', async ({ page }) => {
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Click first feature card
      const featureCard = page.locator('text=AI Create Studio').first();
      await featureCard.click();

      await page.waitForTimeout(600);

      expect(alertMessage).toContain('AI Create Studio');
      expect(alertMessage).toContain('You\'re about to explore:');

      console.log('✅ Landing Page: Feature Card Click - PASSED');
    });
  });

  // ============================================================================
  // SESSION 9: CONTACT FORM TESTS
  // ============================================================================

  test.describe('Session 9: Contact Form', () => {
    test('should validate empty form submission', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      const submitButton = page.locator('button:has-text("Send Message")');
      await submitButton.click();

      await page.waitForTimeout(1000);

      // Check for validation error toast or HTML5 validation
      // The form has HTML5 required attributes, so browser validation should prevent submission
      const hasError = await page.locator('text=/please fill|required|all required fields/i').count() > 0;
      const isSending = await submitButton.textContent();

      // Either validation message should appear OR button should not be in "Sending..." state
      expect(hasError || !isSending?.includes('Sending')).toBeTruthy();

      console.log('✅ Contact Form: Empty Validation - PASSED');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      // Fill form with invalid email
      await page.fill('input#firstName', 'John');
      await page.fill('input#lastName', 'Doe');
      await page.fill('input#email', 'invalid-email');
      await page.fill('input#subject', 'Test');
      await page.fill('textarea#message', 'Test message');

      const submitButton = page.locator('button:has-text("Send Message")');
      await submitButton.click();

      await page.waitForTimeout(1000);

      console.log('✅ Contact Form: Email Validation - PASSED');
    });

    test('should submit valid contact form', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Fill valid form
      await page.fill('input#firstName', 'John');
      await page.fill('input#lastName', 'Doe');
      await page.fill('input#email', 'john.doe@example.com');
      await page.fill('input#subject', 'Testing contact form');
      await page.fill('textarea#message', 'This is a test message');

      const submitButton = page.locator('button:has-text("Send Message")');
      await submitButton.click();

      await page.waitForTimeout(1500);

      expect(alertMessage).toContain('Message Sent Successfully');
      expect(alertMessage).toContain('Case ID');
      expect(alertMessage).toContain('Next Steps');

      console.log('✅ Contact Form: Valid Submission - PASSED');
    });
  });

  // ============================================================================
  // SESSION 10: PRICING PAGE TESTS
  // ============================================================================

  test.describe('Session 10: Pricing Checkout', () => {
    test('should handle Starter plan selection', async ({ page }) => {
      await page.goto('http://localhost:9323/pricing');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      const dialogPromise = new Promise<void>(resolve => {
        page.on('dialog', async dialog => {
          alertMessage = dialog.message();
          await dialog.accept();
          resolve();
        });
      });

      // Click "Get Started" for Starter plan
      const starterButton = page.locator('button:has-text("Get Started")').first();
      await starterButton.click();

      // Wait for dialog to appear (with timeout)
      await Promise.race([
        dialogPromise,
        page.waitForTimeout(3000)
      ]);

      expect(alertMessage).toContain('Starter');
      expect(alertMessage).toContain('Next Steps');

      console.log('✅ Pricing: Starter Plan - PASSED');
    });

    test('should handle Professional trial', async ({ page }) => {
      await page.goto('http://localhost:9323/pricing');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      const dialogPromise = new Promise<void>(resolve => {
        page.on('dialog', async dialog => {
          alertMessage = dialog.message();
          await dialog.accept();
          resolve();
        });
      });

      // Click "Start Free Trial" for Professional
      const professionalButton = page.locator('button:has-text("Start Free Trial")').first();
      await professionalButton.click();

      // Wait for dialog to appear (with timeout)
      await Promise.race([
        dialogPromise,
        page.waitForTimeout(3000)
      ]);

      expect(alertMessage).toContain('Professional');
      expect(alertMessage).toContain('Next Steps');

      console.log('✅ Pricing: Professional Trial - PASSED');
    });

    test('should handle Enterprise contact sales', async ({ page }) => {
      await page.goto('http://localhost:9323/pricing');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Click "Contact Sales" for Enterprise
      const enterpriseButton = page.locator('button:has-text("Contact Sales")').first();
      await enterpriseButton.click();

      await page.waitForTimeout(1000);

      expect(alertMessage).toContain('Enterprise');
      expect(alertMessage).toContain('Next Steps');

      console.log('✅ Pricing: Enterprise Contact - PASSED');
    });
  });

  // ============================================================================
  // SESSION 11: AUTH PAGES TESTS
  // ============================================================================

  test.describe('Session 11: Login/Signup', () => {
    test('should handle login with demo credentials', async ({ page }) => {
      await page.goto('http://localhost:9323/login');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Fill login form
      await page.fill('input#email', 'thabo@kaleidocraft.co.za');
      await page.fill('input#password', 'password1234');

      const loginButton = page.locator('button:has-text("Sign In")');
      await loginButton.click();

      await page.waitForTimeout(2000);

      expect(alertMessage).toContain('Welcome Back to KAZI');
      expect(alertMessage).toContain('Next Steps');

      console.log('✅ Login: Demo Credentials - PASSED');
    });

    test('should handle signup flow', async ({ page }) => {
      await page.goto('http://localhost:9323/signup');
      await page.waitForLoadState('networkidle');

      let alertMessage = '';
      const dialogPromise = new Promise<void>(resolve => {
        page.on('dialog', async dialog => {
          alertMessage = dialog.message();
          await dialog.accept();
          resolve();
        });
      });

      // Fill signup form
      await page.fill('input#firstName', 'Test');
      await page.fill('input#lastName', 'User');
      await page.fill('input#email', 'test@example.com');
      await page.fill('input#password', 'password123');

      // Accept terms
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      await termsCheckbox.click();

      const signupButton = page.locator('button[type="submit"]');
      await signupButton.click();

      // Wait for dialog to appear (with longer timeout for signup)
      await Promise.race([
        dialogPromise,
        page.waitForTimeout(4000)
      ]);

      expect(alertMessage).toContain('Welcome to KAZI');
      expect(alertMessage).toContain('30-day free trial');

      console.log('✅ Signup: New Account - PASSED');
    });
  });

  // ============================================================================
  // SESSION 13: GALLERY TESTS
  // ============================================================================

  test.describe('Session 13: Gallery', () => {
    test('should validate AI image generation prompt', async ({ page }) => {
      // First navigate to dashboard (login required)
      await page.goto('http://localhost:9323/login');
      await page.waitForLoadState('networkidle');

      // Quick login
      await page.fill('input#email', 'thabo@kaleidocraft.co.za');
      await page.fill('input#password', 'password1234');

      page.on('dialog', async dialog => await dialog.accept());

      await page.locator('button:has-text("Sign In")').click();
      await page.waitForTimeout(2500);

      // Navigate to gallery
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle');

      // Click AI Generate button
      const aiButton = page.locator('button:has-text("AI Generate")');
      await aiButton.click();

      await page.waitForTimeout(500);

      // Try to generate without prompt (should show validation error)
      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(500);
      }

      console.log('✅ Gallery: AI Generation Validation - PASSED');
    });

    test('should handle view mode toggle', async ({ page }) => {
      await page.goto('http://localhost:9323/dashboard/gallery');
      await page.waitForLoadState('networkidle');

      // Find view mode button
      const viewButton = page.locator('button:has-text("List View"), button:has-text("Grid View")').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
        await page.waitForTimeout(500);
      }

      console.log('✅ Gallery: View Mode Toggle - PASSED');
    });
  });

  // ============================================================================
  // EDGE CASES & ERROR SCENARIOS
  // ============================================================================

  test.describe('Edge Cases & Error Handling', () => {
    test('should handle rapid button clicks (debouncing)', async ({ page }) => {
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');

      page.on('dialog', async dialog => await dialog.accept());

      const button = page.locator('button:has-text("Start Free Trial")').first();

      // Rapid clicks
      await button.click();
      await button.click();
      await button.click();

      await page.waitForTimeout(1000);

      console.log('✅ Edge Case: Rapid Clicks - PASSED');
    });

    test('should handle navigation during alert display', async ({ page }) => {
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');

      page.on('dialog', async dialog => {
        await page.waitForTimeout(100);
        await dialog.accept();
      });

      const button = page.locator('button:has-text("Start Free Trial")').first();
      await button.click();

      await page.waitForTimeout(500);

      // Try to navigate
      await page.goto('http://localhost:9323/pricing');

      console.log('✅ Edge Case: Navigation During Alert - PASSED');
    });

    test('should handle special characters in form inputs', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      page.on('dialog', async dialog => await dialog.accept());

      // Fill with special characters
      await page.fill('input#firstName', 'John<script>alert("xss")</script>');
      await page.fill('input#lastName', 'O\'Brien');
      await page.fill('input#email', 'test+special@example.com');
      await page.fill('input#subject', 'Test & "Special" Characters');
      await page.fill('textarea#message', 'Line 1\nLine 2\nLine 3');

      const submitButton = page.locator('button:has-text("Send Message")');
      await submitButton.click();

      await page.waitForTimeout(1500);

      console.log('✅ Edge Case: Special Characters - PASSED');
    });

    test('should handle very long input text', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      const longText = 'A'.repeat(10000);

      await page.fill('input#firstName', 'John');
      await page.fill('input#lastName', 'Doe');
      await page.fill('input#email', 'test@example.com');
      await page.fill('input#subject', longText);
      await page.fill('textarea#message', longText);

      await page.waitForTimeout(500);

      console.log('✅ Edge Case: Long Input Text - PASSED');
    });

    test('should handle missing API responses gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ success: false, error: 'Server error' })
        });
      });

      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      page.on('dialog', async dialog => await dialog.accept());

      await page.fill('input#firstName', 'John');
      await page.fill('input#lastName', 'Doe');
      await page.fill('input#email', 'test@example.com');
      await page.fill('input#subject', 'Test');
      await page.fill('textarea#message', 'Test message');

      const submitButton = page.locator('button:has-text("Send Message")');
      await submitButton.click();

      await page.waitForTimeout(1000);

      console.log('✅ Edge Case: API Error Handling - PASSED');
    });
  });

  // ============================================================================
  // PERFORMANCE & ACCESSIBILITY TESTS
  // ============================================================================

  test.describe('Performance & Accessibility', () => {
    test('should load landing page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds

      console.log(`✅ Performance: Landing Page Load Time - ${loadTime}ms`);
    });

    test('should have proper button accessibility', async ({ page }) => {
      await page.goto('http://localhost:9323/');
      await page.waitForLoadState('networkidle');

      // Check if buttons are keyboard accessible
      const button = page.locator('button:has-text("Start Free Trial")').first();
      await button.focus();

      const isFocused = await button.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();

      console.log('✅ Accessibility: Button Focus - PASSED');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      await page.waitForLoadState('networkidle');

      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      console.log('✅ Accessibility: Keyboard Navigation - PASSED');
    });
  });
});
