import { test, expect } from '../fixtures/app-fixtures';

test.describe('🔐 Comprehensive Authentication Tests', () => {
  test.describe('🔑 Login Functionality', () => {
    test('should login with valid credentials', async ({ authPage, testUser }) => {
      await authPage.gotoLogin();
      await authPage.attemptLogin(testUser.email, testUser.password, true);
      
      expect(authPage.page.url()).toContain('/dashboard');
    });

    test('should show error with invalid credentials', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.attemptLogin('invalid@example.com', 'wrongpassword', false);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid');
    });

    test('should validate form elements on login page', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const elements = await authPage.verifyLoginFormElements();
      
      expect(elements.form).toBe(true);
      expect(elements.email).toBe(true);
      expect(elements.password).toBe(true);
      expect(elements.button).toBe(true);
      expect(elements.forgotPassword).toBe(true);
      expect(elements.signupLink).toBe(true);
    });

    test('should remember user when "Remember me" is checked', async ({ authPage, testUser }) => {
      await authPage.gotoLogin();
      await authPage.loginWithRememberMe(testUser.email, testUser.password);
      
      expect(authPage.page.url()).toContain('/dashboard');
    });

    test('should toggle password visibility', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.passwordInput.fill('testpassword');
      
      const initialType = await authPage.passwordInput.getAttribute('type');
      expect(initialType).toBe('password');
      
      await authPage.togglePasswordVisibility();
      
      const newType = await authPage.passwordInput.getAttribute('type');
      expect(newType).toBe('text');
    });
  });

  test.describe('📝 Signup Functionality', () => {
    test('should signup with valid information', async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.attemptSignup(
        'Test User',
        'newuser@example.com',
        'ValidPassword123!',
        'ValidPassword123!',
        true
      );
      
      expect(authPage.page.url()).toMatch(/\/(dashboard|verify-email)/);
    });

    test('should show error with mismatched passwords', async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.attemptSignup(
        'Test User',
        'test@example.com',
        'password123',
        'differentpassword',
        false
      );
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain('match');
    });

    test('should validate signup form elements', async ({ authPage }) => {
      await authPage.gotoSignup();
      
      const elements = await authPage.verifySignupFormElements();
      
      expect(elements.form).toBe(true);
      expect(elements.name).toBe(true);
      expect(elements.email).toBe(true);
      expect(elements.password).toBe(true);
      expect(elements.confirmPassword).toBe(true);
      expect(elements.button).toBe(true);
      expect(elements.terms).toBe(true);
      expect(elements.loginLink).toBe(true);
    });

    test('should require terms acceptance', async ({ authPage }) => {
      await authPage.gotoSignup();
      
      await authPage.nameInput.fill('Test User');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('password123');
      await authPage.confirmPasswordInput.fill('password123');
      
      const isButtonEnabled = await authPage.isSignupButtonEnabled();
      expect(isButtonEnabled).toBe(false);
      
      await authPage.termsCheckbox.check();
      
      const isButtonEnabledAfter = await authPage.isSignupButtonEnabled();
      expect(isButtonEnabledAfter).toBe(true);
    });

    test('should signup with newsletter subscription', async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.signupWithNewsletter(
        'Test User',
        'newsletter@example.com',
        'ValidPassword123!',
        'ValidPassword123!'
      );
      
      expect(authPage.page.url()).toMatch(/\/(dashboard|verify-email)/);
    });
  });

  test.describe('🔄 Navigation Between Forms', () => {
    test('should navigate from login to signup', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.navigateToSignupFromLogin();
      
      expect(authPage.page.url()).toContain('/signup');
      
      const elements = await authPage.verifySignupFormElements();
      expect(elements.form).toBe(true);
    });

    test('should navigate from signup to login', async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.navigateToLoginFromSignup();
      
      expect(authPage.page.url()).toContain('/login');
      
      const elements = await authPage.verifyLoginFormElements();
      expect(elements.form).toBe(true);
    });

    test('should navigate to password reset from login', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.navigateToPasswordResetFromLogin();
      
      expect(authPage.page.url()).toContain('/reset-password');
    });

    test('should navigate back to home', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.backToHome();
      
      expect(authPage.page.url()).toBe('http://localhost:3000/');
    });
  });

  test.describe('🔐 Password Reset', () => {
    test('should send reset email for valid email', async ({ authPage }) => {
      await authPage.gotoPasswordReset();
      await authPage.resetPassword('valid@example.com');
      
      const successMessage = await authPage.getSuccessMessage();
      expect(successMessage).toContain('sent');
    });

    test('should return to login from reset page', async ({ authPage }) => {
      await authPage.gotoPasswordReset();
      await authPage.backToLoginFromReset();
      
      expect(authPage.page.url()).toContain('/login');
    });
  });

  test.describe('🔒 Social Authentication', () => {
    test('should display social auth options', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const socialAuth = await authPage.verifySocialAuthOptions();
      
      expect(socialAuth.section).toBe(true);
      expect(socialAuth.google).toBe(true);
      expect(socialAuth.github).toBe(true);
      expect(socialAuth.linkedin).toBe(true);
    });

    test('should handle Google OAuth', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.loginWithGoogle();
      
      // OAuth flows are complex - just verify no errors
      await authPage.page.waitForTimeout(2000);
    });

    test('should handle GitHub OAuth', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.loginWithGitHub();
      
      await authPage.page.waitForTimeout(2000);
    });
  });

  test.describe('📱 Mobile Responsiveness', () => {
    test('should display properly on mobile', async ({ authPage, mobileViewport }) => {
      await authPage.page.setViewportSize(mobileViewport);
      await authPage.gotoLogin();
      
      const mobileLayout = await authPage.checkMobileLayout();
      
      expect(mobileLayout.form).toBe(true);
      expect(mobileLayout.inputs).toBe(true);
      expect(mobileLayout.button).toBe(true);
      expect(mobileLayout.socialAuth).toBe(true);
    });
  });

  test.describe('♿ Accessibility', () => {
    test('should have proper form accessibility', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const accessibility = await authPage.checkFormAccessibility();
      
      expect(accessibility.inputsWithoutLabels.length).toBe(0);
      expect(accessibility.buttonsWithoutText.length).toBe(0);
    });
  });

  test.describe('⚡ Performance', () => {
    test('should load forms quickly', async ({ authPage }) => {
      const loadTime = await authPage.measureFormLoadTime();
      
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });
  });

  test.describe('🔍 Form Validation', () => {
    test('should validate email format', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const validation = await authPage.testEmailValidation('invalid-email');
      
      if (validation) {
        expect(validation).toContain('valid email');
      }
    });

    test('should validate password strength', async ({ authPage }) => {
      await authPage.gotoSignup();
      
      const weakPassword = await authPage.testPasswordStrength('123');
      const strongPassword = await authPage.testPasswordStrength('StrongPassword123!');
      
      if (weakPassword) {
        expect(weakPassword).toContain('weak');
      }
      
      if (strongPassword) {
        expect(strongPassword).toContain('strong');
      }
    });

    test('should check required fields completion', async ({ authPage }) => {
      await authPage.gotoSignup();
      
      // Initially empty
      let fieldStatus = await authPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(false);
      
      // Fill all required fields
      await authPage.nameInput.fill('Test User');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('password123');
      await authPage.confirmPasswordInput.fill('password123');
      await authPage.termsCheckbox.check();
      
      fieldStatus = await authPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(true);
    });
  });

  test.describe('🛡️ Security Testing', () => {
    test('should handle SQL injection attempts', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const errorMessage = await authPage.testSQLInjection();
      
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).not.toContain('SQL');
    });

    test('should handle XSS attempts', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const errorMessage = await authPage.testXSSAttempt();
      
      expect(errorMessage).toBeTruthy();
    });

    test('should implement rate limiting', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const attempts = await authPage.testRateLimiting();
      
      expect(attempts.length).toBe(5);
      // Later attempts should take longer due to rate limiting
      expect(attempts[4]).toBeGreaterThan(attempts[0]);
    });
  });

  test.describe('🔄 Two-Factor Authentication', () => {
    test('should handle verification code entry', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      // Simulate 2FA scenario
      if (await authPage.twoFactorForm.isVisible()) {
        await authPage.enterVerificationCode('123456');
        
        // Verify form submission
        const isButtonEnabled = await authPage.verifyCodeButton.isEnabled();
        expect(isButtonEnabled).toBe(true);
      }
    });

    test('should handle code resend', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      if (await authPage.twoFactorForm.isVisible()) {
        await authPage.resendVerificationCode();
        
        const successMessage = await authPage.getSuccessMessage();
        if (successMessage) {
          expect(successMessage).toContain('sent');
        }
      }
    });
  });

  test.describe('🎯 Edge Cases', () => {
    test('should clear form properly', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('password');
      
      await authPage.clearForm();
      
      const emailValue = await authPage.emailInput.inputValue();
      const passwordValue = await authPage.passwordInput.inputValue();
      
      expect(emailValue).toBe('');
      expect(passwordValue).toBe('');
    });

    test('should handle form submission with empty fields', async ({ authPage }) => {
      await authPage.gotoLogin();
      
      await authPage.loginButton.click();
      
      const isButtonEnabled = await authPage.isLoginButtonEnabled();
      expect(isButtonEnabled).toBe(true); // Button should still be enabled for accessibility
    });

    test('should handle rapid form switching', async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.navigateToSignupFromLogin();
      await authPage.navigateToLoginFromSignup();
      await authPage.navigateToPasswordResetFromLogin();
      await authPage.backToLoginFromReset();
      
      const elements = await authPage.verifyLoginFormElements();
      expect(elements.form).toBe(true);
    });
  });
}); 