import type { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  
  // Navigation elements
  readonly logo: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly navigationMenu: Locator;

  // Hero section elements
  readonly heroHeading: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButtons: Locator;
  readonly startCreatingButton: Locator;
  readonly watchDemoButton: Locator;

  // Features section
  readonly featuresSection: Locator;
  readonly featureCards: Locator;
  readonly fileManagementFeature: Locator;
  readonly paymentProcessingFeature: Locator;
  readonly collaborationFeature: Locator;

  // How it works section
  readonly howItWorksSection: Locator;
  readonly workflowSteps: Locator;
  readonly learnMoreButtons: Locator;

  // Social proof section
  readonly socialProofSection: Locator;
  readonly statistics: Locator;
  readonly testimonials: Locator;
  readonly customerLogos: Locator;

  // Pricing section
  readonly pricingSection: Locator;
  readonly pricingCards: Locator;
  readonly freePricingCard: Locator;
  readonly proPricingCard: Locator;
  readonly agencyPricingCard: Locator;
  readonly pricingButtons: Locator;

  // Final CTA section
  readonly finalCtaSection: Locator;
  readonly finalCtaButton: Locator;
  readonly contactSalesButton: Locator;

  // Footer elements
  readonly footer: Locator;
  readonly footerLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.logo = page.getByTestId('nav-logo');
    this.loginLink = page.getByTestId('nav-login');
    this.signupLink = page.getByTestId('nav-signup');
    this.navigationMenu = page.getByTestId('navigation');

    // Hero section elements
    this.heroHeading = page.getByTestId('hero-title');
    this.heroSubtitle = page.getByTestId('hero-subtitle');
    this.ctaButtons = page.getByTestId('hero-cta-buttons');
    this.startCreatingButton = page.getByTestId('hero-cta-primary');
    this.watchDemoButton = page.getByTestId('hero-cta-demo');

    // Features section
    this.featuresSection = page.getByTestId('features-section');
    this.featureCards = page.locator('[data-testid^="feature-card-"]');
    this.fileManagementFeature = page.getByTestId('feature-card-0');
    this.paymentProcessingFeature = page.getByTestId('feature-card-2');
    this.collaborationFeature = page.getByTestId('feature-card-1');

    // How it works section
    this.howItWorksSection = page.getByTestId('how-it-works-section');
    this.workflowSteps = page.locator('[data-testid^="workflow-step-"]');
    this.learnMoreButtons = page.locator('[data-testid^="step-cta-"]');

    // Social proof section
    this.socialProofSection = page.getByTestId('social-proof-section');
    this.statistics = page.locator('[data-testid^="statistic-"]');
    this.testimonials = page.locator('[data-testid^="testimonial-"]');
    this.customerLogos = page.locator('.flex.items-center.justify-center.gap-8');

    // Pricing section
    this.pricingSection = page.getByTestId('pricing-section');
    this.pricingCards = page.locator('[data-testid^="pricing-card-"]');
    this.freePricingCard = page.getByTestId('pricing-card-starter');
    this.proPricingCard = page.getByTestId('pricing-card-professional');
    this.agencyPricingCard = page.getByTestId('pricing-card-agency');
    this.pricingButtons = page.locator('[data-testid^="pricing-cta-"]');

    // Final CTA section
    this.finalCtaSection = page.getByTestId('cta-section');
    this.finalCtaButton = page.getByTestId('cta-primary');
    this.contactSalesButton = page.getByTestId('cta-sales');

    // Footer elements
    this.footer = page.locator('footer');
    this.footerLinks = page.locator('footer a');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLogin() {
    await this.loginLink.click();
    await this.page.waitForURL('**/login');
  }

  async navigateToSignup() {
    await this.signupLink.click();
    await this.page.waitForURL('**/signup');
  }

  async clickStartCreating() {
    await this.startCreatingButton.click();
    await this.page.waitForURL('**/signup');
  }

  async clickWatchDemo() {
    await this.watchDemoButton.click();
  }

  async scrollToSection(sectionId: string) {
    await this.page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  }

  async scrollToFeatures() {
    await this.scrollToSection('features');
  }

  async scrollToHowItWorks() {
    await this.scrollToSection('how-it-works');
  }

  async scrollToPricing() {
    await this.scrollToSection('pricing');
  }

  async selectFreePlan() {
    await this.freePricingCard.getByRole('button').click();
    await this.page.waitForURL('**/signup');
  }

  async selectProPlan() {
    await this.proPricingCard.getByRole('button').click();
    await this.page.waitForURL('**/signup');
  }

  async contactSales() {
    await this.agencyPricingCard.getByRole('button').click();
    await this.page.waitForURL('**/contact');
  }

  async clickFinalCta() {
    await this.finalCtaButton.click();
    await this.page.waitForURL('**/signup');
  }

  async contactSalesFromFinalCta() {
    await this.contactSalesButton.click();
    await this.page.waitForURL('**/contact');
  }

  // Assertion helpers
  async verifyHeroSection() {
    await this.page.waitForSelector('h1');
    return {
      heading: await this.heroHeading.isVisible(),
      subtitle: await this.heroSubtitle.isVisible(),
      ctaButtons: await this.ctaButtons.isVisible()
    };
  }

  async verifyFeaturesSection() {
    await this.scrollToFeatures();
    return {
      section: await this.featuresSection.isVisible(),
      cardCount: await this.featureCards.count(),
      fileManagement: await this.fileManagementFeature.isVisible(),
      paymentProcessing: await this.paymentProcessingFeature.isVisible(),
      collaboration: await this.collaborationFeature.isVisible()
    };
  }

  async verifyPricingSection() {
    await this.scrollToPricing();
    return {
      section: await this.pricingSection.isVisible(),
      cardCount: await this.pricingCards.count(),
      freePlan: await this.freePricingCard.isVisible(),
      proPlan: await this.proPricingCard.isVisible(),
      agencyPlan: await this.agencyPricingCard.isVisible()
    };
  }

  async getAllFeatureCards() {
    await this.scrollToFeatures();
    return await this.featureCards.all();
  }

  async getAllPricingCards() {
    await this.scrollToPricing();
    return await this.pricingCards.all();
  }

  async getAllWorkflowSteps() {
    await this.scrollToHowItWorks();
    return await this.workflowSteps.all();
  }

  async getStatistics() {
    await this.scrollToSection('testimonials');
    const stats = await this.statistics.all();
    const statData = [];
    
    for (const stat of stats) {
      const text = await stat.textContent();
      statData.push(text?.trim());
    }
    
    return statData;
  }

  async getTestimonials() {
    await this.scrollToSection('testimonials');
    const testimonials = await this.testimonials.all();
    const testimonialData = [];
    
    for (const testimonial of testimonials) {
      const text = await testimonial.textContent();
      testimonialData.push(text?.trim());
    }
    
    return testimonialData;
  }

  // Accessibility helpers
  async checkAccessibility() {
    // Check for proper heading hierarchy
    const h1Count = await this.page.locator('h1').count();
    const h2Count = await this.page.locator('h2').count();
    const h3Count = await this.page.locator('h3').count();
    
    // Check for alt text on images
    const images = await this.page.locator('img').all();
    const imagesWithoutAlt = [];
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        imagesWithoutAlt.push(await img.getAttribute('src'));
      }
    }
    
    // Check for aria-labels on buttons
    const buttons = await this.page.locator('button').all();
    const buttonsWithoutLabels = [];
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      if (!ariaLabel && !text?.trim()) {
        buttonsWithoutLabels.push(await button.innerHTML());
      }
    }
    
    return {
      headingHierarchy: { h1: h1Count, h2: h2Count, h3: h3Count },
      imagesWithoutAlt,
      buttonsWithoutLabels
    };
  }

  // Performance helpers
  async measureLoadTime() {
    const startTime = Date.now();
    await this.goto();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async waitForAnimations() {
    // Wait for CSS animations to complete
    await this.page.waitForTimeout(1000);
  }
} 