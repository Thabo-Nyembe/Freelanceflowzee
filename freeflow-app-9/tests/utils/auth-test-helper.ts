import { Page } from '@playwright/test';

// Test credentials that match our environment
export const TEST_CREDENTIALS = {
  email: 'test.user@example.com',
  password: 'ValidPassword123!'
};

export class AuthTestHelper {
  constructor(private page: Page) {}

  async setupTestMode() {
    await this.page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'user-agent': 'Playwright/Test Runner'
    });
  }

  async login(email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) {
    await this.page.goto('/login');
    await this.page.waitForSelector('[data-testid="submit-button"]');
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
    await this.page.waitForNavigation();
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
  }

  async submitLoginForm() {
    await this.page.click('[data-testid="submit-button"]');
  }

  async getErrorMessage() {
    const errorElement = await this.page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    return errorElement.textContent();
  }

  async getSuccessMessage() {
    const successElement = await this.page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
    return successElement.textContent();
  }

  async isLoggedIn() {
    return this.page.url().includes('/dashboard');
  }

  async checkFormValidation() {
    const emailInput = this.page.locator('[data-testid="email-input"]');
    const passwordInput = this.page.locator('[data-testid="password-input"]');
    
    return {
      emailValid: await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      passwordValid: await passwordInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      emailMessage: await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage),
      passwordMessage: await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    };
  }
} 