import { Page } from &apos;@playwright/test&apos;;
import { BasePage } from &apos;./BasePage&apos;;

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin() {
    await this.page.goto(&apos;/login&apos;);
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, email);
    await this.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, password);
    await this.click(&apos;[data-testid=&quot;login-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async getErrorMessage(): Promise<string | null> {
    const errorElement = await this.page.getByTestId(&apos;error-message&apos;);
    return errorElement ? await errorElement.textContent() : null;
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;user-menu&quot;]&apos;);
  }
} 