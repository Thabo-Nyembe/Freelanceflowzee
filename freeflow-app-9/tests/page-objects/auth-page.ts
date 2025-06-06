import type { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  
  // Common elements
  readonly logo: Locator;
  readonly backToHomeLink: Locator;
  readonly alternativeActionLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  // Login page elements
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly showPasswordToggle: Locator;

  // Signup page elements
  readonly signupForm: Locator;
  readonly nameInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signupButton: Locator;
  readonly loginLinkFromSignup: Locator;
  readonly termsCheckbox: Locator;
  readonly newsletterCheckbox: Locator;

  // Social auth elements
  readonly googleAuthButton: Locator;
  readonly githubAuthButton: Locator;
  readonly linkedinAuthButton: Locator;
  readonly socialAuthSection: Locator;

  // Password reset elements
  readonly resetPasswordForm: Locator;
  readonly resetEmailInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly backToLoginLink: Locator;

  // Two-factor authentication
  readonly twoFactorForm: Locator;
  readonly verificationCodeInput: Locator;
  readonly verifyCodeButton: Locator;
  readonly resendCodeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Common elements
    this.logo = page.locator('[data-testid="logo"]');
    this.backToHomeLink = page.getByRole('link', { name: 'Back to Home' });
    this.alternativeActionLink = page.locator('[data-testid="alternative-action"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');

    // Login page elements
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
    this.signupLink = page.getByRole('link', { name: 'Sign Up' });
    this.rememberMeCheckbox = page.getByLabel('Remember me');
    this.showPasswordToggle = page.locator('[data-testid="show-password-toggle"]');

    // Signup page elements
    this.signupForm = page.locator('[data-testid="signup-form"]');
    this.nameInput = page.getByLabel('Full Name');
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.signupButton = page.getByRole('button', { name: 'Create Account' });
    this.loginLinkFromSignup = page.getByRole('link', { name: 'Login' });
    this.termsCheckbox = page.getByLabel('I agree to the Terms of Service');
    this.newsletterCheckbox = page.getByLabel('Subscribe to newsletter');

    // Social auth elements
    this.googleAuthButton = page.getByRole('button', { name: 'Continue with Google' });
    this.githubAuthButton = page.getByRole('button', { name: 'Continue with GitHub' });
    this.linkedinAuthButton = page.getByRole('button', { name: 'Continue with LinkedIn' });
    this.socialAuthSection = page.locator('[data-testid="social-auth"]');

    // Password reset elements
    this.resetPasswordForm = page.locator('[data-testid="reset-password-form"]');
    this.resetEmailInput = page.getByLabel('Email Address');
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });
    this.backToLoginLink = page.getByRole('link', { name: 'Back to Login' });

    // Two-factor authentication
    this.twoFactorForm = page.locator('[data-testid="two-factor-form"]');
    this.verificationCodeInput = page.getByLabel('Verification Code');
    this.verifyCodeButton = page.getByRole('button', { name: 'Verify Code' });
    this.resendCodeButton = page.getByRole('button', { name: 'Resend Code' });
  }

  // Navigation methods
  async gotoLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await this.loginForm.waitFor({ state: 'visible' });
  }

  async gotoSignup() {
    await this.page.goto('/signup');
    await this.page.waitForLoadState('networkidle');
    await this.signupForm.waitFor({ state: 'visible' });
  }

  async gotoPasswordReset() {
    await this.page.goto('/reset-password');
    await this.page.waitForLoadState('networkidle');
    await this.resetPasswordForm.waitFor({ state: 'visible' });
  }

  async navigateToSignupFromLogin() {
    await this.signupLink.click();
    await this.page.waitForURL('**/signup');
    await this.signupForm.waitFor({ state: 'visible' });
  }

  async navigateToLoginFromSignup() {
    await this.loginLinkFromSignup.click();
    await this.page.waitForURL('**/login');
    await this.loginForm.waitFor({ state: 'visible' });
  }

  async navigateToPasswordResetFromLogin() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/reset-password');
    await this.resetPasswordForm.waitFor({ state: 'visible' });
  }

  async backToHome() {
    await this.backToHomeLink.click();
    await this.page.waitForURL('/');
  }

  // Login methods
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithRememberMe(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
  }

  async attemptLogin(email: string, password: string, expectSuccess: boolean = true) {
    await this.login(email, password);
    
    if (expectSuccess) {
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    } else {
      await this.errorMessage.waitFor({ state: 'visible' });
    }
  }

  // Signup methods
  async signup(name: string, email: string, password: string, confirmPassword: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.termsCheckbox.check();
    await this.signupButton.click();
  }

  async signupWithNewsletter(name: string, email: string, password: string, confirmPassword: string) {
    await this.signup(name, email, password, confirmPassword);
    await this.newsletterCheckbox.check();
    await this.signupButton.click();
  }

  async attemptSignup(name: string, email: string, password: string, confirmPassword: string, expectSuccess: boolean = true) {
    await this.signup(name, email, password, confirmPassword);
    
    if (expectSuccess) {
      // May redirect to email verification or dashboard
      await this.page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 10000 });
    } else {
      await this.errorMessage.waitFor({ state: 'visible' });
    }
  }

  // Social authentication methods
  async loginWithGoogle() {
    await this.googleAuthButton.click();
    // Handle OAuth popup/redirect flow
    await this.page.waitForTimeout(2000);
  }

  async loginWithGitHub() {
    await this.githubAuthButton.click();
    await this.page.waitForTimeout(2000);
  }

  async loginWithLinkedIn() {
    await this.linkedinAuthButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Password reset methods
  async resetPassword(email: string) {
    await this.resetEmailInput.fill(email);
    await this.resetPasswordButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async backToLoginFromReset() {
    await this.backToLoginLink.click();
    await this.page.waitForURL('**/login');
  }

  // Two-factor authentication methods
  async enterVerificationCode(code: string) {
    await this.verificationCodeInput.fill(code);
    await this.verifyCodeButton.click();
  }

  async resendVerificationCode() {
    await this.resendCodeButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  // Form validation and interaction
  async togglePasswordVisibility() {
    await this.showPasswordToggle.click();
  }

  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    if (await this.nameInput.isVisible()) {
      await this.nameInput.clear();
    }
    if (await this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.clear();
    }
  }

  // Validation methods
  async verifyLoginFormElements() {
    return {
      form: await this.loginForm.isVisible(),
      email: await this.emailInput.isVisible(),
      password: await this.passwordInput.isVisible(),
      button: await this.loginButton.isVisible(),
      forgotPassword: await this.forgotPasswordLink.isVisible(),
      signupLink: await this.signupLink.isVisible()
    };
  }

  async verifySignupFormElements() {
    return {
      form: await this.signupForm.isVisible(),
      name: await this.nameInput.isVisible(),
      email: await this.emailInput.isVisible(),
      password: await this.passwordInput.isVisible(),
      confirmPassword: await this.confirmPasswordInput.isVisible(),
      button: await this.signupButton.isVisible(),
      terms: await this.termsCheckbox.isVisible(),
      loginLink: await this.loginLinkFromSignup.isVisible()
    };
  }

  async verifySocialAuthOptions() {
    return {
      section: await this.socialAuthSection.isVisible(),
      google: await this.googleAuthButton.isVisible(),
      github: await this.githubAuthButton.isVisible(),
      linkedin: await this.linkedinAuthButton.isVisible()
    };
  }

  // Error handling
  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async getSuccessMessage() {
    if (await this.successMessage.isVisible()) {
      return await this.successMessage.textContent();
    }
    return null;
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.getErrorMessage();
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible' });
    return await this.getSuccessMessage();
  }

  // Form state validation
  async isLoginButtonEnabled() {
    return await this.loginButton.isEnabled();
  }

  async isSignupButtonEnabled() {
    return await this.signupButton.isEnabled();
  }

  async areRequiredFieldsFilled() {
    const emailFilled = await this.emailInput.inputValue() !== '';
    const passwordFilled = await this.passwordInput.inputValue() !== '';
    
    if (await this.nameInput.isVisible()) {
      const nameFilled = await this.nameInput.inputValue() !== '';
      const confirmPasswordFilled = await this.confirmPasswordInput.inputValue() !== '';
      const termsAccepted = await this.termsCheckbox.isChecked();
      
      return {
        name: nameFilled,
        email: emailFilled,
        password: passwordFilled,
        confirmPassword: confirmPasswordFilled,
        terms: termsAccepted,
        allFilled: nameFilled && emailFilled && passwordFilled && confirmPasswordFilled && termsAccepted
      };
    }
    
    return {
      email: emailFilled,
      password: passwordFilled,
      allFilled: emailFilled && passwordFilled
    };
  }

  // Security testing
  async testPasswordStrength(password: string) {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
    
    // Look for password strength indicator
    const strengthIndicator = this.page.locator('[data-testid="password-strength"]');
    if (await strengthIndicator.isVisible()) {
      return await strengthIndicator.textContent();
    }
    return null;
  }

  async testEmailValidation(email: string) {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
    
    // Look for email validation message
    const validationMessage = this.page.locator('[data-testid="email-validation"]');
    if (await validationMessage.isVisible()) {
      return await validationMessage.textContent();
    }
    return null;
  }

  // Performance and accessibility
  async measureFormLoadTime() {
    const startTime = Date.now();
    await this.gotoLogin();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async checkFormAccessibility() {
    // Check for proper labels
    const inputs = await this.page.locator('input').all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const label = this.page.locator(`label[for="${id}"]`);
      
      if (!ariaLabel && !(await label.isVisible())) {
        inputsWithoutLabels.push(id);
      }
    }
    
    // Check for proper button roles
    const buttons = await this.page.locator('button').all();
    const buttonsWithoutText = [];
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      if (!text?.trim() && !ariaLabel) {
        buttonsWithoutText.push(await button.innerHTML());
      }
    }
    
    return {
      inputsWithoutLabels,
      buttonsWithoutText
    };
  }

  // Mobile responsiveness
  async checkMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 812 });
    await this.page.waitForTimeout(500);
    
    return {
      form: await this.loginForm.isVisible(),
      inputs: await this.emailInput.isVisible() && await this.passwordInput.isVisible(),
      button: await this.loginButton.isVisible(),
      socialAuth: await this.socialAuthSection.isVisible()
    };
  }

  // Edge cases and security
  async testSQLInjection() {
    const maliciousInput = "'; DROP TABLE users; --";
    await this.emailInput.fill(maliciousInput);
    await this.passwordInput.fill('password');
    await this.loginButton.click();
    
    // Should handle gracefully with error message
    return await this.getErrorMessage();
  }

  async testXSSAttempt() {
    const xssInput = '<script>alert("XSS")</script>';
    await this.emailInput.fill(xssInput);
    await this.passwordInput.fill('password');
    await this.loginButton.click();
    
    return await this.getErrorMessage();
  }

  async testRateLimiting() {
    const attempts = [];
    
    // Attempt multiple logins quickly
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await this.attemptLogin('test@example.com', 'wrongpassword', false);
      const endTime = Date.now();
      attempts.push(endTime - startTime);
      
      await this.clearForm();
    }
    
    return attempts;
  }
} 