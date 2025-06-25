import { Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateToProjects() {
    await this.page.click('[data-testid="projects-nav"]');
  }

  async navigateToAnalytics() {
    await this.page.click('[data-testid="analytics-nav"]');
  }

  async verifyDashboardLoaded() {
    await expect(this.page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    return {
      sidebar: await this.page.locator('[data-testid="sidebar"]'),
      header: await this.page.locator('[data-testid="header"]'),
      mainContent: await this.page.locator('[data-testid="main-content"]')
    };
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
  }
} 