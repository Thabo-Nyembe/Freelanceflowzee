import { Page, Locator } from &apos;@playwright/test&apos;;

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async getByTestId(testId: string): Promise<Locator> {
    return this.page.getByTestId(testId);
  }

  async getByRole(role: &apos;button&apos; | &apos;link&apos; | &apos;heading&apos; | &apos;textbox&apos; | &apos;checkbox&apos; | &apos;radio&apos; | &apos;tab&apos; | &apos;tabpanel&apos; | &apos;dialog&apos; | &apos;alert&apos; | &apos;alertdialog&apos; | &apos;menu&apos; | &apos;menuitem&apos; | &apos;menubar&apos; | &apos;navigation&apos; | &apos;list&apos; | &apos;listitem&apos;, name?: string): Promise<Locator> {
    return name ? this.page.getByRole(role, { name }) : this.page.getByRole(role);
  }

  async getByText(text: string): Promise<Locator> {
    return this.page.getByText(text);
  }

  async fill(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async click(selector: string) {
    await this.page.click(selector);
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }
} 