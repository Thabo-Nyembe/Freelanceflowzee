import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.fill('[data-testid="email-input"]', email);
    await this.fill('[data-testid="password-input"]', password);
    await this.click('[data-testid="login-button"]');
    await this.waitForPageLoad();
  }

  async getErrorMessage(): Promise<string | null> {
    const errorElement = await this.page.getByTestId('error-message');
    return errorElement ? await errorElement.textContent() : null;
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.isVisible('[data-testid="user-menu"]');
  }
} 