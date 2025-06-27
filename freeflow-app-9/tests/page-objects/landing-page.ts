import type { Page, Locator } from &apos;@playwright/test&apos;;

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
    this.logo = page.getByTestId(&apos;nav-logo&apos;);
    this.loginLink = page.getByTestId(&apos;nav-login&apos;);
    this.signupLink = page.getByTestId(&apos;nav-signup&apos;);
    this.navigationMenu = page.getByTestId(&apos;navigation&apos;);

    // Hero section elements
    this.heroHeading = page.getByTestId(&apos;hero-title&apos;);
    this.heroSubtitle = page.getByTestId(&apos;hero-subtitle&apos;);
    this.ctaButtons = page.getByTestId(&apos;hero-cta-buttons&apos;);
    this.startCreatingButton = page.getByTestId(&apos;hero-cta-primary&apos;);
    this.watchDemoButton = page.getByTestId(&apos;hero-cta-demo&apos;);

    // Features section
    this.featuresSection = page.getByTestId(&apos;features-section&apos;);
    this.featureCards = page.locator(&apos;[data-testid^=&quot;feature-card-&quot;]&apos;);
    this.fileManagementFeature = page.getByTestId(&apos;feature-card-0&apos;);
    this.paymentProcessingFeature = page.getByTestId(&apos;feature-card-2&apos;);
    this.collaborationFeature = page.getByTestId(&apos;feature-card-1&apos;);

    // How it works section
    this.howItWorksSection = page.getByTestId(&apos;how-it-works-section&apos;);
    this.workflowSteps = page.locator(&apos;[data-testid^=&quot;workflow-step-&quot;]&apos;);
    this.learnMoreButtons = page.locator(&apos;[data-testid^=&quot;step-cta-&quot;]&apos;);

    // Social proof section
    this.socialProofSection = page.getByTestId(&apos;social-proof-section&apos;);
    this.statistics = page.locator(&apos;[data-testid^=&quot;statistic-&quot;]&apos;);
    this.testimonials = page.locator(&apos;[data-testid^=&quot;testimonial-&quot;]&apos;);
    this.customerLogos = page.locator(&apos;.flex.items-center.justify-center.gap-8&apos;);

    // Pricing section
    this.pricingSection = page.getByTestId(&apos;pricing-section&apos;);
    this.pricingCards = page.locator(&apos;[data-testid^=&quot;pricing-card-&quot;]&apos;);
    this.freePricingCard = page.getByTestId(&apos;pricing-card-starter&apos;);
    this.proPricingCard = page.getByTestId(&apos;pricing-card-professional&apos;);
    this.agencyPricingCard = page.getByTestId(&apos;pricing-card-agency&apos;);
    this.pricingButtons = page.locator(&apos;[data-testid^=&quot;pricing-cta-&quot;]&apos;);

    // Final CTA section
    this.finalCtaSection = page.getByTestId(&apos;cta-section&apos;);
    this.finalCtaButton = page.getByTestId(&apos;cta-primary&apos;);
    this.contactSalesButton = page.getByTestId(&apos;cta-sales&apos;);

    // Footer elements
    this.footer = page.locator(&apos;footer&apos;);
    this.footerLinks = page.locator(&apos;footer a&apos;);
  }

  async goto() {
    await this.page.goto(&apos;/');'
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async navigateToLogin() {
    await this.loginLink.click();
    await this.page.waitForURL(&apos;**/login&apos;);
  }

  async navigateToSignup() {
    await this.signupLink.click();
    await this.page.waitForURL(&apos;**/signup&apos;);
  }

  async clickStartCreating() {
    await this.startCreatingButton.click();
    await this.page.waitForURL(&apos;**/signup&apos;);
  }

  async clickWatchDemo() {
    await this.watchDemoButton.click();
  }

  async scrollToSection(sectionId: string) {
    await this.page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  }

  async scrollToFeatures() {
    await this.scrollToSection(&apos;features&apos;);
  }

  async scrollToHowItWorks() {
    await this.scrollToSection(&apos;how-it-works&apos;);
  }

  async scrollToPricing() {
    await this.scrollToSection(&apos;pricing&apos;);
  }

  async selectFreePlan() {
    await this.freePricingCard.getByRole(&apos;button&apos;).click();
    await this.page.waitForURL(&apos;**/signup&apos;);
  }

  async selectProPlan() {
    await this.proPricingCard.getByRole(&apos;button&apos;).click();
    await this.page.waitForURL(&apos;**/signup&apos;);
  }

  async contactSales() {
    await this.agencyPricingCard.getByRole(&apos;button&apos;).click();
    await this.page.waitForURL(&apos;**/contact&apos;);
  }

  async clickFinalCta() {
    await this.finalCtaButton.click();
    await this.page.waitForURL(&apos;**/signup&apos;);
  }

  async contactSalesFromFinalCta() {
    await this.contactSalesButton.click();
    await this.page.waitForURL(&apos;**/contact&apos;);
  }

  // Assertion helpers
  async verifyHeroSection() {
    await this.page.waitForSelector(&apos;h1&apos;);
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
    await this.scrollToSection(&apos;testimonials&apos;);
    const stats = await this.statistics.all();
    const statData = [];
    
    for (const stat of stats) {
      const text = await stat.textContent();
      statData.push(text?.trim());
    }
    
    return statData;
  }

  async getTestimonials() {
    await this.scrollToSection(&apos;testimonials&apos;);
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
    const h1Count = await this.page.locator(&apos;h1&apos;).count();
    const h2Count = await this.page.locator(&apos;h2&apos;).count();
    const h3Count = await this.page.locator(&apos;h3&apos;).count();
    
    // Check for alt text on images
    const images = await this.page.locator(&apos;img&apos;).all();
    const imagesWithoutAlt = [];
    
    for (const img of images) {
      const alt = await img.getAttribute(&apos;alt&apos;);
      if (!alt) {
        imagesWithoutAlt.push(await img.getAttribute(&apos;src&apos;));
      }
    }
    
    // Check for aria-labels on buttons
    const buttons = await this.page.locator(&apos;button&apos;).all();
    const buttonsWithoutLabels = [];
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute(&apos;aria-label&apos;);
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