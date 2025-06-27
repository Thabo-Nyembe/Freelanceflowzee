import type { Page, Locator } from &apos;@playwright/test&apos;;

export class FeedbackPage {
  readonly page: Page;
  readonly feedbackForm: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.feedbackForm = page.locator(&apos;[data-testid=&quot;feedback-form&quot;]&apos;);
    this.messageInput = page.getByLabel(&apos;Feedback&apos;);
    this.submitButton = page.getByRole(&apos;button&apos;, { name: &apos;Submit&apos; });
  }

  async goto() {
    await this.page.goto(&apos;/feedback&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async submitFeedback(message: string) {
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
} 