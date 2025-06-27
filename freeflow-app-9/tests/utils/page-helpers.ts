import { Page, expect } from &apos;@playwright/test&apos;;

export class PageHelpers {
  constructor(private page: Page) {}

  async waitForPageReady() {
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.page.waitForLoadState(&apos;domcontentloaded&apos;);
  }

  async setViewportSize(size: &apos;mobile&apos; | &apos;tablet&apos; | &apos;desktop&apos;) {
    const viewports = {
      mobile: { width: 375, height: 812 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 800 }
    };
    await this.page.setViewportSize(viewports[size]);
    await this.page.waitForTimeout(1000); // Wait for responsive changes
  }

  async toggleTheme(theme: &apos;light&apos; | &apos;dark&apos; | &apos;system&apos;) {
    const themeToggle = this.page.locator(&apos;button[aria-label=&quot;Toggle theme&quot;]&apos;);
    await themeToggle.click();
    
    const themeOption = this.page.locator(&apos;div[role=&quot;menuitem&quot;]&apos;, { hasText: theme.charAt(0).toUpperCase() + theme.slice(1) });
    await themeOption.click();
  }

  async navigateTo(path: string) {
    await this.page.goto(`http://localhost:3001${path}`);
    await this.waitForPageReady();
  }

  async openMobileMenu() {
    const mobileMenuButton = this.page.locator(&apos;button&apos;, { has: this.page.locator(&apos;svg[data-testid=&quot;menu-icon&quot;]&apos;) });
    await mobileMenuButton.click();
    const mobileNav = this.page.locator(&apos;div[role=&quot;navigation&quot;]&apos;);
    await expect(mobileNav).toBeVisible();
  }

  async verifyNavigation(path: string) {
    await expect(this.page.url()).toContain(path);
  }
} 