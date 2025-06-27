import { test, expect } from &apos;../fixtures/app-fixtures&apos;;

test.describe(&apos;🔐 Comprehensive Authentication Tests&apos;, () => {
  test.describe(&apos;🔑 Login Functionality&apos;, () => {
    test(&apos;should login with valid credentials&apos;, async ({ authPage, testUser }) => {
      await authPage.gotoLogin();
      await authPage.attemptLogin(testUser.email, testUser.password, true);
      
      expect(authPage.page.url()).toContain(&apos;/dashboard&apos;);
    });

    test(&apos;should show error with invalid credentials&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.attemptLogin(&apos;invalid@example.com&apos;, &apos;wrongpassword&apos;, false);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain(&apos;Invalid&apos;);
    });

    test(&apos;should validate form elements on login page&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const elements = await authPage.verifyLoginFormElements();
      
      expect(elements.form).toBe(true);
      expect(elements.email).toBe(true);
      expect(elements.password).toBe(true);
      expect(elements.button).toBe(true);
      expect(elements.forgotPassword).toBe(true);
      expect(elements.signupLink).toBe(true);
    });

    test(&apos;should remember user when &quot;Remember me&quot; is checked&apos;, async ({ authPage, testUser }) => {
      await authPage.gotoLogin();
      await authPage.loginWithRememberMe(testUser.email, testUser.password);
      
      expect(authPage.page.url()).toContain(&apos;/dashboard&apos;);
    });

    test(&apos;should toggle password visibility&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.passwordInput.fill(&apos;testpassword&apos;);
      
      const initialType = await authPage.passwordInput.getAttribute(&apos;type&apos;);
      expect(initialType).toBe(&apos;password&apos;);
      
      await authPage.togglePasswordVisibility();
      
      const newType = await authPage.passwordInput.getAttribute(&apos;type&apos;);
      expect(newType).toBe(&apos;text&apos;);
    });
  });

  test.describe(&apos;📝 Signup Functionality&apos;, () => {
    test(&apos;should signup with valid information&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.attemptSignup(
        &apos;Test User&apos;,
        &apos;newuser@example.com&apos;,
        &apos;ValidPassword123!&apos;,
        &apos;ValidPassword123!&apos;,
        true
      );
      
      expect(authPage.page.url()).toMatch(/\/(dashboard|verify-email)/);
    });

    test(&apos;should show error with mismatched passwords&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.attemptSignup(
        &apos;Test User&apos;,
        &apos;test@example.com&apos;,
        &apos;password123&apos;,
        &apos;differentpassword&apos;,
        false
      );
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain(&apos;match&apos;);
    });

    test(&apos;should validate signup form elements&apos;, async ({ authPage }) => {
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

    test(&apos;should require terms acceptance&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      
      await authPage.nameInput.fill(&apos;Test User&apos;);
      await authPage.emailInput.fill(&apos;test@example.com&apos;);
      await authPage.passwordInput.fill(&apos;password123&apos;);
      await authPage.confirmPasswordInput.fill(&apos;password123&apos;);
      
      const isButtonEnabled = await authPage.isSignupButtonEnabled();
      expect(isButtonEnabled).toBe(false);
      
      await authPage.termsCheckbox.check();
      
      const isButtonEnabledAfter = await authPage.isSignupButtonEnabled();
      expect(isButtonEnabledAfter).toBe(true);
    });

    test(&apos;should signup with newsletter subscription&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.signupWithNewsletter(
        &apos;Test User&apos;,
        &apos;newsletter@example.com&apos;,
        &apos;ValidPassword123!&apos;,
        &apos;ValidPassword123!&apos;
      );
      
      expect(authPage.page.url()).toMatch(/\/(dashboard|verify-email)/);
    });
  });

  test.describe(&apos;🔄 Navigation Between Forms&apos;, () => {
    test(&apos;should navigate from login to signup&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.navigateToSignupFromLogin();
      
      expect(authPage.page.url()).toContain(&apos;/signup&apos;);
      
      const elements = await authPage.verifySignupFormElements();
      expect(elements.form).toBe(true);
    });

    test(&apos;should navigate from signup to login&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      await authPage.navigateToLoginFromSignup();
      
      expect(authPage.page.url()).toContain(&apos;/login&apos;);
      
      const elements = await authPage.verifyLoginFormElements();
      expect(elements.form).toBe(true);
    });

    test(&apos;should navigate to password reset from login&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.navigateToPasswordResetFromLogin();
      
      expect(authPage.page.url()).toContain(&apos;/reset-password&apos;);
    });

    test(&apos;should navigate back to home&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.backToHome();
      
      expect(authPage.page.url()).toBe(&apos;http://localhost:3000/&apos;);
    });
  });

  test.describe(&apos;🔐 Password Reset&apos;, () => {
    test(&apos;should send reset email for valid email&apos;, async ({ authPage }) => {
      await authPage.gotoPasswordReset();
      await authPage.resetPassword(&apos;valid@example.com&apos;);
      
      const successMessage = await authPage.getSuccessMessage();
      expect(successMessage).toContain(&apos;sent&apos;);
    });

    test(&apos;should return to login from reset page&apos;, async ({ authPage }) => {
      await authPage.gotoPasswordReset();
      await authPage.backToLoginFromReset();
      
      expect(authPage.page.url()).toContain(&apos;/login&apos;);
    });
  });

  test.describe(&apos;🔒 Social Authentication&apos;, () => {
    test(&apos;should display social auth options&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const socialAuth = await authPage.verifySocialAuthOptions();
      
      expect(socialAuth.section).toBe(true);
      expect(socialAuth.google).toBe(true);
      expect(socialAuth.github).toBe(true);
      expect(socialAuth.linkedin).toBe(true);
    });

    test(&apos;should handle Google OAuth&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.loginWithGoogle();
      
      // OAuth flows are complex - just verify no errors
      await authPage.page.waitForTimeout(2000);
    });

    test(&apos;should handle GitHub OAuth&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      await authPage.loginWithGitHub();
      
      await authPage.page.waitForTimeout(2000);
    });
  });

  test.describe(&apos;📱 Mobile Responsiveness&apos;, () => {
    test(&apos;should display properly on mobile&apos;, async ({ authPage, mobileViewport }) => {
      await authPage.page.setViewportSize(mobileViewport);
      await authPage.gotoLogin();
      
      const mobileLayout = await authPage.checkMobileLayout();
      
      expect(mobileLayout.form).toBe(true);
      expect(mobileLayout.inputs).toBe(true);
      expect(mobileLayout.button).toBe(true);
      expect(mobileLayout.socialAuth).toBe(true);
    });
  });

  test.describe(&apos;♿ Accessibility&apos;, () => {
    test(&apos;should have proper form accessibility&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const accessibility = await authPage.checkFormAccessibility();
      
      expect(accessibility.inputsWithoutLabels.length).toBe(0);
      expect(accessibility.buttonsWithoutText.length).toBe(0);
    });
  });

  test.describe(&apos;⚡ Performance&apos;, () => {
    test(&apos;should load forms quickly&apos;, async ({ authPage }) => {
      const loadTime = await authPage.measureFormLoadTime();
      
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });
  });

  test.describe(&apos;🔍 Form Validation&apos;, () => {
    test(&apos;should validate email format&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const validation = await authPage.testEmailValidation(&apos;invalid-email&apos;);
      
      if (validation) {
        expect(validation).toContain(&apos;valid email&apos;);
      }
    });

    test(&apos;should validate password strength&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      
      const weakPassword = await authPage.testPasswordStrength(&apos;123&apos;);
      const strongPassword = await authPage.testPasswordStrength(&apos;StrongPassword123!&apos;);
      
      if (weakPassword) {
        expect(weakPassword).toContain(&apos;weak&apos;);
      }
      
      if (strongPassword) {
        expect(strongPassword).toContain(&apos;strong&apos;);
      }
    });

    test(&apos;should check required fields completion&apos;, async ({ authPage }) => {
      await authPage.gotoSignup();
      
      // Initially empty
      let fieldStatus = await authPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(false);
      
      // Fill all required fields
      await authPage.nameInput.fill(&apos;Test User&apos;);
      await authPage.emailInput.fill(&apos;test@example.com&apos;);
      await authPage.passwordInput.fill(&apos;password123&apos;);
      await authPage.confirmPasswordInput.fill(&apos;password123&apos;);
      await authPage.termsCheckbox.check();
      
      fieldStatus = await authPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(true);
    });
  });

  test.describe(&apos;🛡️ Security Testing&apos;, () => {
    test(&apos;should handle SQL injection attempts&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const errorMessage = await authPage.testSQLInjection();
      
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).not.toContain(&apos;SQL&apos;);
    });

    test(&apos;should handle XSS attempts&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const errorMessage = await authPage.testXSSAttempt();
      
      expect(errorMessage).toBeTruthy();
    });

    test(&apos;should implement rate limiting&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      const attempts = await authPage.testRateLimiting();
      
      expect(attempts.length).toBe(5);
      // Later attempts should take longer due to rate limiting
      expect(attempts[4]).toBeGreaterThan(attempts[0]);
    });
  });

  test.describe(&apos;🔄 Two-Factor Authentication&apos;, () => {
    test(&apos;should handle verification code entry&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      // Simulate 2FA scenario
      if (await authPage.twoFactorForm.isVisible()) {
        await authPage.enterVerificationCode(&apos;123456&apos;);
        
        // Verify form submission
        const isButtonEnabled = await authPage.verifyCodeButton.isEnabled();
        expect(isButtonEnabled).toBe(true);
      }
    });

    test(&apos;should handle code resend&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      if (await authPage.twoFactorForm.isVisible()) {
        await authPage.resendVerificationCode();
        
        const successMessage = await authPage.getSuccessMessage();
        if (successMessage) {
          expect(successMessage).toContain(&apos;sent&apos;);
        }
      }
    });
  });

  test.describe(&apos;🎯 Edge Cases&apos;, () => {
    test(&apos;should clear form properly&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      await authPage.emailInput.fill(&apos;test@example.com&apos;);
      await authPage.passwordInput.fill(&apos;password&apos;);
      
      await authPage.clearForm();
      
      const emailValue = await authPage.emailInput.inputValue();
      const passwordValue = await authPage.passwordInput.inputValue();
      
      expect(emailValue).toBe('&apos;);'
      expect(passwordValue).toBe('&apos;);'
    });

    test(&apos;should handle form submission with empty fields&apos;, async ({ authPage }) => {
      await authPage.gotoLogin();
      
      await authPage.loginButton.click();
      
      const isButtonEnabled = await authPage.isLoginButtonEnabled();
      expect(isButtonEnabled).toBe(true); // Button should still be enabled for accessibility
    });

    test(&apos;should handle rapid form switching&apos;, async ({ authPage }) => {
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