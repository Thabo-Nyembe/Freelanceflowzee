import { Page, expect } from '@playwright/test';

export class LandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async verifyHeroSection() {
    await expect(this.page.locator('[data-testid="hero-section"]')).toBeVisible();
    return {
      title: await this.page.locator('[data-testid="hero-title"]'),
      subtitle: await this.page.locator('[data-testid="hero-subtitle"]'),
      cta: await this.page.locator('[data-testid="hero-cta"]')
    };
  }

  async verifyFeaturesSection() {
    await expect(this.page.locator('[data-testid="features-section"]')).toBeVisible();
    return {
      title: await this.page.locator('[data-testid="features-title"]'),
      cards: await this.page.locator('[data-testid="feature-card"]').all()
    };
  }

  async verifyPricingSection() {
    await expect(this.page.locator('[data-testid="pricing-section"]')).toBeVisible();
    return {
      title: await this.page.locator('[data-testid="pricing-title"]'),
      plans: await this.page.locator('[data-testid="pricing-plan"]').all()
    };
  }

  async measureLoadTime() {
    const startTime = Date.now();
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async waitForAnimations() {
    // Wait for any CSS animations to complete
    await this.page.waitForTimeout(1000);
  }

  async scrollToFeatures() {
    await this.page.click('[data-testid="features-nav-link"]');
  }

  async scrollToPricing() {
    await this.page.click('[data-testid="pricing-nav-link"]');
  }

  async scrollToHowItWorks() {
    await this.page.click('[data-testid="how-it-works-nav-link"]');
  }

  async clickWatchDemo() {
    await this.page.click('[data-testid="watch-demo-button"]');
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const headings = await this.page.locator('h1, h2, h3').all();
    const buttons = await this.page.locator('button').all();
    
    return {
      headings,
      buttons,
      hasAltText: await this.page.locator('img[alt]').count() > 0
    };
  }
} 