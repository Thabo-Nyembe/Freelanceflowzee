import { Page, expect } from &apos;@playwright/test&apos;;

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(&apos;/dashboard&apos;);
  }

  async navigateToProjects() {
    await this.page.click(&apos;[data-testid=&quot;projects-nav&quot;]&apos;);
  }

  async navigateToAnalytics() {
    await this.page.click(&apos;[data-testid=&quot;analytics-nav&quot;]&apos;);
  }

  async verifyDashboardLoaded() {
    await expect(this.page.locator(&apos;[data-testid=&quot;dashboard-container&quot;]&apos;)).toBeVisible();
    return {
      sidebar: await this.page.locator(&apos;[data-testid=&quot;sidebar&quot;]&apos;),
      header: await this.page.locator(&apos;[data-testid=&quot;header&quot;]&apos;),
      mainContent: await this.page.locator(&apos;[data-testid=&quot;main-content&quot;]&apos;)
    };
  }

  async logout() {
    await this.page.click(&apos;[data-testid=&quot;user-menu&quot;]&apos;);
    await this.page.click(&apos;[data-testid=&quot;logout-button&quot;]&apos;);
  }
} 