import type { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly profileForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileForm = page.locator('[data-testid="profile-form"]');
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.saveButton = page.getByRole('button', { name: 'Save Changes' });
  }

  async goto() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async updateProfile(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.saveButton.click();
  }
} 