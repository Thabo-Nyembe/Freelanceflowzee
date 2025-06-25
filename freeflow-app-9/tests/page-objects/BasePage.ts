import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getByTestId(testId: string): Promise<Locator> {
    return this.page.getByTestId(testId);
  }

  async getByRole(role: 'button' | 'link' | 'heading' | 'textbox' | 'checkbox' | 'radio' | 'tab' | 'tabpanel' | 'dialog' | 'alert' | 'alertdialog' | 'menu' | 'menuitem' | 'menubar' | 'navigation' | 'list' | 'listitem', name?: string): Promise<Locator> {
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