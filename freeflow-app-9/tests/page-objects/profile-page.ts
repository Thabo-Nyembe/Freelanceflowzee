import type { Page, Locator } from &apos;@playwright/test&apos;;

export class ProfilePage {
  readonly page: Page;
  readonly profileForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileForm = page.locator(&apos;[data-testid=&quot;profile-form&quot;]&apos;);
    this.nameInput = page.getByLabel(&apos;Name&apos;);
    this.emailInput = page.getByLabel(&apos;Email&apos;);
    this.saveButton = page.getByRole(&apos;button&apos;, { name: &apos;Save Changes&apos; });
  }

  async goto() {
    await this.page.goto(&apos;/profile&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async updateProfile(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.saveButton.click();
  }
} 