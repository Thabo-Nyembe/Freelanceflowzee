import type { Page, Locator } from '@playwright/test';

export class ProjectPage {
  readonly page: Page;
  readonly projectForm: Locator;
  readonly projectTitle: Locator;
  readonly projectDescription: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectForm = page.locator('[data-testid="project-form"]');
    this.projectTitle = page.getByLabel('Project Title');
    this.projectDescription = page.getByLabel('Description');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async goto() {
    await this.page.goto('/projects');
    await this.page.waitForLoadState('networkidle');
  }

  async createProject(title: string, description: string) {
    await this.projectTitle.fill(title);
    await this.projectDescription.fill(description);
    await this.saveButton.click();
  }
} 