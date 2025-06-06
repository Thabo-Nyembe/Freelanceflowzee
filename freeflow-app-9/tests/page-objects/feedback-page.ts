import type { Page, Locator } from '@playwright/test';

export class FeedbackPage {
  readonly page: Page;
  readonly feedbackForm: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.feedbackForm = page.locator('[data-testid="feedback-form"]');
    this.messageInput = page.getByLabel('Feedback');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async goto() {
    await this.page.goto('/feedback');
    await this.page.waitForLoadState('networkidle');
  }

  async submitFeedback(message: string) {
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
} 