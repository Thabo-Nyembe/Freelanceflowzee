import type { Page, Locator } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactForm = page.locator('[data-testid="contact-form"]');
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.messageInput = page.getByLabel('Message');
    this.submitButton = page.getByRole('button', { name: 'Send Message' });
  }

  async goto() {
    await this.page.goto('/contact');
    await this.page.waitForLoadState('networkidle');
  }

  async submitContact(name: string, email: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
} 