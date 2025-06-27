import type { Page, Locator } from &apos;@playwright/test&apos;;

export class ProjectPage {
  readonly page: Page;
  readonly projectForm: Locator;
  readonly projectTitle: Locator;
  readonly projectDescription: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectForm = page.locator(&apos;[data-testid=&quot;project-form&quot;]&apos;);
    this.projectTitle = page.getByLabel(&apos;Project Title&apos;);
    this.projectDescription = page.getByLabel(&apos;Description&apos;);
    this.saveButton = page.getByRole(&apos;button&apos;, { name: &apos;Save&apos; });
    this.deleteButton = page.getByRole(&apos;button&apos;, { name: &apos;Delete&apos; });
  }

  async goto() {
    await this.page.goto(&apos;/projects&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async createProject(title: string, description: string) {
    await this.projectTitle.fill(title);
    await this.projectDescription.fill(description);
    await this.saveButton.click();
  }
} 