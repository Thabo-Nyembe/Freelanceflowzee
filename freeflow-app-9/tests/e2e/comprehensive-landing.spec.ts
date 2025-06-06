import { test, expect } from '../fixtures/app-fixtures';

test.describe('🏠 Comprehensive Landing Page Tests', () => {
  test.describe('📱 Core Functionality', () => {
    test('should display all hero section elements', async ({ landingPage }) => {
      await landingPage.goto();
      
      const heroElements = await landingPage.verifyHeroSection();
      
      expect(heroElements.heading).toBe(true);
      expect(heroElements.subtitle).toBe(true);
      expect(heroElements.ctaButtons).toBe(true);
    });

    test('should display all features section elements', async ({ landingPage }) => {
      await landingPage.goto();
      
      const featuresElements = await landingPage.verifyFeaturesSection();
      
      expect(featuresElements.section).toBe(true);
      expect(featuresElements.cardCount).toBeGreaterThan(0);
      expect(featuresElements.fileManagement).toBe(true);
      expect(featuresElements.paymentProcessing).toBe(true);
      expect(featuresElements.collaboration).toBe(true);
    });

    test('should display all pricing section elements', async ({ landingPage }) => {
      await landingPage.goto();
      
      const pricingElements = await landingPage.verifyPricingSection();
      
      expect(pricingElements.section).toBe(true);
      expect(pricingElements.cardCount).toBe(3);
      expect(pricingElements.freePlan).toBe(true);
      expect(pricingElements.proPlan).toBe(true);
      expect(pricingElements.agencyPlan).toBe(true);
    });
  });

  test.describe('🎯 User Navigation & Actions', () => {
    test('should navigate to signup when clicking "Start Creating Free"', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.clickStartCreating();
      
      expect(landingPage.page.url()).toContain('/signup');
    });

    test('should navigate to login from navigation menu', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.navigateToLogin();
      
      expect(landingPage.page.url()).toContain('/login');
    });

    test('should navigate to signup from navigation menu', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.navigateToSignup();
      
      expect(landingPage.page.url()).toContain('/signup');
    });

    test('should navigate to contact page from pricing "Contact Sales"', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.contactSales();
      
      expect(landingPage.page.url()).toContain('/contact');
    });

    test('should navigate to signup from final CTA', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.clickFinalCta();
      
      expect(landingPage.page.url()).toContain('/signup');
    });
  });

  test.describe('📊 Content Verification', () => {
    test('should display correct number of feature cards', async ({ landingPage }) => {
      await landingPage.goto();
      
      const featureCards = await landingPage.getAllFeatureCards();
      expect(featureCards.length).toBeGreaterThanOrEqual(3);
    });

    test('should display correct number of pricing cards', async ({ landingPage }) => {
      await landingPage.goto();
      
      const pricingCards = await landingPage.getAllPricingCards();
      expect(pricingCards.length).toBe(3);
    });

    test('should display workflow steps', async ({ landingPage }) => {
      await landingPage.goto();
      
      const workflowSteps = await landingPage.getAllWorkflowSteps();
      expect(workflowSteps.length).toBeGreaterThan(0);
    });

    test('should display statistics and testimonials', async ({ landingPage }) => {
      await landingPage.goto();
      
      const stats = await landingPage.getStatistics();
      const testimonials = await landingPage.getTestimonials();
      
      expect(stats.length).toBeGreaterThan(0);
      expect(testimonials.length).toBeGreaterThan(0);
    });
  });

  test.describe('♿ Accessibility & SEO', () => {
    test('should have proper heading hierarchy', async ({ landingPage }) => {
      await landingPage.goto();
      
      const accessibility = await landingPage.checkAccessibility();
      
      expect(accessibility.headingHierarchy.h1).toBe(1);
      expect(accessibility.headingHierarchy.h2).toBeGreaterThan(0);
      expect(accessibility.imagesWithoutAlt.length).toBe(0);
    });

    test('should have proper button labels', async ({ landingPage }) => {
      await landingPage.goto();
      
      const accessibility = await landingPage.checkAccessibility();
      
      expect(accessibility.buttonsWithoutLabels.length).toBe(0);
    });
  });

  test.describe('📱 Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ landingPage, mobileViewport }) => {
      await landingPage.page.setViewportSize(mobileViewport);
      await landingPage.goto();
      
      const heroElements = await landingPage.verifyHeroSection();
      
      expect(heroElements.heading).toBe(true);
      expect(heroElements.ctaButtons).toBe(true);
    });

    test('should be responsive on tablet viewport', async ({ landingPage }) => {
      await landingPage.page.setViewportSize({ width: 768, height: 1024 });
      await landingPage.goto();
      
      const featuresElements = await landingPage.verifyFeaturesSection();
      
      expect(featuresElements.section).toBe(true);
      expect(featuresElements.cardCount).toBeGreaterThan(0);
    });
  });

  test.describe('⚡ Performance', () => {
    test('should load within acceptable time', async ({ landingPage }) => {
      const loadTime = await landingPage.measureLoadTime();
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle animations smoothly', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.waitForAnimations();
      
      const heroElements = await landingPage.verifyHeroSection();
      expect(heroElements.heading).toBe(true);
    });
  });

  test.describe('🔄 Scrolling & Sections', () => {
    test('should scroll to features section', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToFeatures();
      
      await expect(landingPage.featuresSection).toBeVisible();
    });

    test('should scroll to pricing section', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToPricing();
      
      await expect(landingPage.pricingSection).toBeVisible();
    });

    test('should scroll to how it works section', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToHowItWorks();
      
      await expect(landingPage.howItWorksSection).toBeVisible();
    });
  });

  test.describe('🎯 Edge Cases', () => {
    test('should handle demo button click', async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.clickWatchDemo();
      
      // Demo button might open modal or video - just verify no errors
      await landingPage.page.waitForTimeout(1000);
    });

    test('should handle pricing plan selections', async ({ landingPage }) => {
      await landingPage.goto();
      
      // Test free plan
      await landingPage.selectFreePlan();
      expect(landingPage.page.url()).toContain('/signup');
      
      // Go back and test pro plan
      await landingPage.goto();
      await landingPage.selectProPlan();
      expect(landingPage.page.url()).toContain('/signup');
    });

    test('should handle rapid navigation', async ({ landingPage }) => {
      await landingPage.goto();
      
      // Rapid navigation test
      await landingPage.scrollToFeatures();
      await landingPage.scrollToPricing();
      await landingPage.scrollToHowItWorks();
      
      // Should still be functional
      const featuresElements = await landingPage.verifyFeaturesSection();
      expect(featuresElements.section).toBe(true);
    });
  });

  test.describe('🌐 Cross-browser Compatibility', () => {
    test('should display correctly in different viewports', async ({ landingPage }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1366, height: 768 },  // Laptop
        { width: 834, height: 1194 },  // Tablet Portrait
        { width: 375, height: 812 }    // Mobile
      ];
      
      for (const viewport of viewports) {
        await landingPage.page.setViewportSize(viewport);
        await landingPage.goto();
        
        const heroElements = await landingPage.verifyHeroSection();
        expect(heroElements.heading).toBe(true);
      }
    });
  });

  test.describe('🔒 Security & Privacy', () => {
    test('should not expose sensitive information', async ({ landingPage }) => {
      await landingPage.goto();
      
      // Check page source for sensitive data
      const content = await landingPage.page.content();
      
      expect(content).not.toContain('password');
      expect(content).not.toContain('secret');
      expect(content).not.toContain('token');
    });

    test('should have secure links', async ({ landingPage }) => {
      await landingPage.goto();
      
      // Check all external links have proper attributes
      const externalLinks = await landingPage.page.locator('a[href^="http"]').all();
      
      for (const link of externalLinks) {
        const rel = await link.getAttribute('rel');
        const target = await link.getAttribute('target');
        
        if (target === '_blank') {
          expect(rel).toContain('noopener');
        }
      }
    });
  });
}); 