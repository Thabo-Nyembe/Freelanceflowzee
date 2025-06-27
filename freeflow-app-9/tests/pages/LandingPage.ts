import { Page, expect } from &apos;@playwright/test&apos;;

export class LandingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(&apos;/');'
  }

  async verifyHeroSection() {
    await expect(this.page.locator(&apos;[data-testid=&quot;hero-section&quot;]&apos;)).toBeVisible();
    return {
      title: await this.page.locator(&apos;[data-testid=&quot;hero-title&quot;]&apos;),
      subtitle: await this.page.locator(&apos;[data-testid=&quot;hero-subtitle&quot;]&apos;),
      cta: await this.page.locator(&apos;[data-testid=&quot;hero-cta&quot;]&apos;)
    };
  }

  async verifyFeaturesSection() {
    await expect(this.page.locator(&apos;[data-testid=&quot;features-section&quot;]&apos;)).toBeVisible();
    return {
      title: await this.page.locator(&apos;[data-testid=&quot;features-title&quot;]&apos;),
      cards: await this.page.locator(&apos;[data-testid=&quot;feature-card&quot;]&apos;).all()
    };
  }

  async verifyPricingSection() {
    await expect(this.page.locator(&apos;[data-testid=&quot;pricing-section&quot;]&apos;)).toBeVisible();
    return {
      title: await this.page.locator(&apos;[data-testid=&quot;pricing-title&quot;]&apos;),
      plans: await this.page.locator(&apos;[data-testid=&quot;pricing-plan&quot;]&apos;).all()
    };
  }

  async measureLoadTime() {
    const startTime = Date.now();
    await this.goto();
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    return Date.now() - startTime;
  }

  async waitForAnimations() {
    // Wait for any CSS animations to complete
    await this.page.waitForTimeout(1000);
  }

  async scrollToFeatures() {
    await this.page.click(&apos;[data-testid=&quot;features-nav-link&quot;]&apos;);
  }

  async scrollToPricing() {
    await this.page.click(&apos;[data-testid=&quot;pricing-nav-link&quot;]&apos;);
  }

  async scrollToHowItWorks() {
    await this.page.click(&apos;[data-testid=&quot;how-it-works-nav-link&quot;]&apos;);
  }

  async clickWatchDemo() {
    await this.page.click(&apos;[data-testid=&quot;watch-demo-button&quot;]&apos;);
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const headings = await this.page.locator(&apos;h1, h2, h3&apos;).all();
    const buttons = await this.page.locator(&apos;button&apos;).all();
    
    return {
      headings,
      buttons,
      hasAltText: await this.page.locator(&apos;img[alt]&apos;).count() > 0
    };
  }
} 