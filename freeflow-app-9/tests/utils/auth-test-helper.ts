import { Page } from &apos;@playwright/test&apos;;

// Test credentials that match our environment
export const TEST_CREDENTIALS = {
  email: &apos;test.user@example.com&apos;,
  password: &apos;ValidPassword123!&apos;
};

export class AuthTestHelper {
  constructor(private page: Page) {}

  async setupTestMode() {
    await this.page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;user-agent&apos;: &apos;Playwright/Test Runner&apos;
    });
  }

  async login(email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) {
    await this.page.goto(&apos;/login&apos;);
    await this.page.waitForSelector(&apos;[data-testid=&quot;submit-button&quot;]&apos;);
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
    await this.page.waitForNavigation();
  }

  async logout() {
    await this.page.click(&apos;[data-testid=&quot;user-menu&quot;]&apos;);
    await this.page.click(&apos;[data-testid=&quot;logout-button&quot;]&apos;);
    await this.page.waitForURL(&apos;/login&apos;);
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, email);
    await this.page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, password);
  }

  async submitLoginForm() {
    await this.page.click(&apos;[data-testid=&quot;submit-button&quot;]&apos;);
  }

  async getErrorMessage() {
    const errorElement = await this.page.waitForSelector(&apos;[data-testid=&quot;error-message&quot;]&apos;, { timeout: 5000 });
    return errorElement.textContent();
  }

  async getSuccessMessage() {
    const successElement = await this.page.waitForSelector(&apos;[data-testid=&quot;success-message&quot;]&apos;, { timeout: 5000 });
    return successElement.textContent();
  }

  async isLoggedIn() {
    return this.page.url().includes(&apos;/dashboard&apos;);
  }

  async checkFormValidation() {
    const emailInput = this.page.locator(&apos;[data-testid=&quot;email-input&quot;]&apos;);
    const passwordInput = this.page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;);
    
    return {
      emailValid: await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      passwordValid: await passwordInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      emailMessage: await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage),
      passwordMessage: await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    };
  }
} 