import type { Page, Locator } from &apos;@playwright/test&apos;;

export class ContactPage {
  readonly page: Page;
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactForm = page.locator(&apos;[data-testid=&quot;contact-form&quot;]&apos;);
    this.nameInput = page.getByLabel(&apos;Name&apos;);
    this.emailInput = page.getByLabel(&apos;Email&apos;);
    this.messageInput = page.getByLabel(&apos;Message&apos;);
    this.submitButton = page.getByRole(&apos;button&apos;, { name: &apos;Send Message&apos; });
  }

  async goto() {
    await this.page.goto(&apos;/contact&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async submitContact(name: string, email: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
} 