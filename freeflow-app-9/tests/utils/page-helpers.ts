import { Page, expect } from '@playwright/test';

export class PageHelpers {
  constructor(private page: Page) {}

  async waitForPageReady() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async setViewportSize(size: 'mobile' | 'tablet' | 'desktop') {
    const viewports = {
      mobile: { width: 375, height: 812 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 800 }
    };
    await this.page.setViewportSize(viewports[size]);
    await this.page.waitForTimeout(1000); // Wait for responsive changes
  }

  async toggleTheme(theme: 'light' | 'dark' | 'system') {
    const themeToggle = this.page.locator('button[aria-label="Toggle theme"]');
    await themeToggle.click();
    
    const themeOption = this.page.locator('div[role="menuitem"]', { hasText: theme.charAt(0).toUpperCase() + theme.slice(1) });
    await themeOption.click();
  }

  async navigateTo(path: string) {
    await this.page.goto(`http://localhost:3001${path}`);
    await this.waitForPageReady();
  }

  async openMobileMenu() {
    const mobileMenuButton = this.page.locator('button', { has: this.page.locator('svg[data-testid="menu-icon"]') });
    await mobileMenuButton.click();
    const mobileNav = this.page.locator('div[role="navigation"]');
    await expect(mobileNav).toBeVisible();
  }

  async verifyNavigation(path: string) {
    await expect(this.page.url()).toContain(path);
  }
} 