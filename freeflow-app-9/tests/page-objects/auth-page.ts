import type { Page, Locator } from &apos;@playwright/test&apos;;

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
    this.logo = page.locator(&apos;[data-testid=&quot;logo&quot;]&apos;);
    this.backToHomeLink = page.getByRole(&apos;link&apos;, { name: &apos;Back to Home&apos; });
    this.alternativeActionLink = page.locator(&apos;[data-testid=&quot;alternative-action&quot;]&apos;);
    this.errorMessage = page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    this.successMessage = page.locator(&apos;[data-testid=&quot;success-message&quot;]&apos;);
    this.loadingSpinner = page.locator(&apos;[data-testid=&quot;loading-spinner&quot;]&apos;);

    // Login page elements
    this.loginForm = page.locator(&apos;[data-testid=&quot;login-form&quot;]&apos;);
    this.emailInput = page.getByLabel(&apos;Email&apos;);
    this.passwordInput = page.getByLabel(&apos;Password&apos;);
    this.loginButton = page.getByRole(&apos;button&apos;, { name: &apos;Sign In&apos; });
    this.forgotPasswordLink = page.getByRole(&apos;link&apos;, { name: &apos;Forgot Password&apos; });
    this.signupLink = page.getByRole(&apos;link&apos;, { name: &apos;Sign Up&apos; });
    this.rememberMeCheckbox = page.getByLabel(&apos;Remember me&apos;);
    this.showPasswordToggle = page.locator(&apos;[data-testid=&quot;show-password-toggle&quot;]&apos;);

    // Signup page elements
    this.signupForm = page.locator(&apos;[data-testid=&quot;signup-form&quot;]&apos;);
    this.nameInput = page.getByLabel(&apos;Full Name&apos;);
    this.confirmPasswordInput = page.getByLabel(&apos;Confirm Password&apos;);
    this.signupButton = page.getByRole(&apos;button&apos;, { name: &apos;Create Account&apos; });
    this.loginLinkFromSignup = page.getByRole(&apos;link&apos;, { name: &apos;Login&apos; });
    this.termsCheckbox = page.getByLabel(&apos;I agree to the Terms of Service&apos;);
    this.newsletterCheckbox = page.getByLabel(&apos;Subscribe to newsletter&apos;);

    // Social auth elements
    this.googleAuthButton = page.getByRole(&apos;button&apos;, { name: &apos;Continue with Google&apos; });
    this.githubAuthButton = page.getByRole(&apos;button&apos;, { name: &apos;Continue with GitHub&apos; });
    this.linkedinAuthButton = page.getByRole(&apos;button&apos;, { name: &apos;Continue with LinkedIn&apos; });
    this.socialAuthSection = page.locator(&apos;[data-testid=&quot;social-auth&quot;]&apos;);

    // Password reset elements
    this.resetPasswordForm = page.locator(&apos;[data-testid=&quot;reset-password-form&quot;]&apos;);
    this.resetEmailInput = page.getByLabel(&apos;Email Address&apos;);
    this.resetPasswordButton = page.getByRole(&apos;button&apos;, { name: &apos;Reset Password&apos; });
    this.backToLoginLink = page.getByRole(&apos;link&apos;, { name: &apos;Back to Login&apos; });

    // Two-factor authentication
    this.twoFactorForm = page.locator(&apos;[data-testid=&quot;two-factor-form&quot;]&apos;);
    this.verificationCodeInput = page.getByLabel(&apos;Verification Code&apos;);
    this.verifyCodeButton = page.getByRole(&apos;button&apos;, { name: &apos;Verify Code&apos; });
    this.resendCodeButton = page.getByRole(&apos;button&apos;, { name: &apos;Resend Code&apos; });
  }

  // Navigation methods
  async gotoLogin() {
    await this.page.goto(&apos;/login&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.loginForm.waitFor({ state: &apos;visible&apos; });
  }

  async gotoSignup() {
    await this.page.goto(&apos;/signup&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.signupForm.waitFor({ state: &apos;visible&apos; });
  }

  async gotoPasswordReset() {
    await this.page.goto(&apos;/reset-password&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.resetPasswordForm.waitFor({ state: &apos;visible&apos; });
  }

  async navigateToSignupFromLogin() {
    await this.signupLink.click();
    await this.page.waitForURL(&apos;**/signup&apos;);
    await this.signupForm.waitFor({ state: &apos;visible&apos; });
  }

  async navigateToLoginFromSignup() {
    await this.loginLinkFromSignup.click();
    await this.page.waitForURL(&apos;**/login&apos;);
    await this.loginForm.waitFor({ state: &apos;visible&apos; });
  }

  async navigateToPasswordResetFromLogin() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL(&apos;**/reset-password&apos;);
    await this.resetPasswordForm.waitFor({ state: &apos;visible&apos; });
  }

  async backToHome() {
    await this.backToHomeLink.click();
    await this.page.waitForURL(&apos;/');'
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
      await this.page.waitForURL(&apos;**/dashboard&apos;, { timeout: 10000 });
    } else {
      await this.errorMessage.waitFor({ state: &apos;visible&apos; });
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
      await this.errorMessage.waitFor({ state: &apos;visible&apos; });
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
    await this.successMessage.waitFor({ state: &apos;visible&apos; });
  }

  async backToLoginFromReset() {
    await this.backToLoginLink.click();
    await this.page.waitForURL(&apos;**/login&apos;);
  }

  // Two-factor authentication methods
  async enterVerificationCode(code: string) {
    await this.verificationCodeInput.fill(code);
    await this.verifyCodeButton.click();
  }

  async resendVerificationCode() {
    await this.resendCodeButton.click();
    await this.successMessage.waitFor({ state: &apos;visible&apos; });
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
    await this.errorMessage.waitFor({ state: &apos;visible&apos; });
    return await this.getErrorMessage();
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: &apos;visible&apos; });
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
    const emailFilled = await this.emailInput.inputValue() !== '&apos;;'
    const passwordFilled = await this.passwordInput.inputValue() !== '&apos;;'
    
    if (await this.nameInput.isVisible()) {
      const nameFilled = await this.nameInput.inputValue() !== '&apos;;'
      const confirmPasswordFilled = await this.confirmPasswordInput.inputValue() !== '&apos;;'
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
    const strengthIndicator = this.page.locator(&apos;[data-testid=&quot;password-strength&quot;]&apos;);
    if (await strengthIndicator.isVisible()) {
      return await strengthIndicator.textContent();
    }
    return null;
  }

  async testEmailValidation(email: string) {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
    
    // Look for email validation message
    const validationMessage = this.page.locator(&apos;[data-testid=&quot;email-validation&quot;]&apos;);
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
    const inputs = await this.page.locator(&apos;input&apos;).all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute(&apos;id&apos;);
      const ariaLabel = await input.getAttribute(&apos;aria-label&apos;);
      const label = this.page.locator(`label[for=&quot;${id}&quot;]`);
      
      if (!ariaLabel && !(await label.isVisible())) {
        inputsWithoutLabels.push(id);
      }
    }
    
    // Check for proper button roles
    const buttons = await this.page.locator(&apos;button&apos;).all();
    const buttonsWithoutText = [];
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute(&apos;aria-label&apos;);
      
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
    const maliciousInput = &quot;&apos;; DROP TABLE users; --&quot;;
    await this.emailInput.fill(maliciousInput);
    await this.passwordInput.fill(&apos;password&apos;);
    await this.loginButton.click();
    
    // Should handle gracefully with error message
    return await this.getErrorMessage();
  }

  async testXSSAttempt() {
    const xssInput = &apos;<script>alert(&quot;XSS&quot;)</script>&apos;;
    await this.emailInput.fill(xssInput);
    await this.passwordInput.fill(&apos;password&apos;);
    await this.loginButton.click();
    
    return await this.getErrorMessage();
  }

  async testRateLimiting() {
    const attempts = [];
    
    // Attempt multiple logins quickly
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await this.attemptLogin(&apos;test@example.com&apos;, &apos;wrongpassword&apos;, false);
      const endTime = Date.now();
      attempts.push(endTime - startTime);
      
      await this.clearForm();
    }
    
    return attempts;
  }
} 