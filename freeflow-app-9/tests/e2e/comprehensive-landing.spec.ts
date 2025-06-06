import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/landing-page';

// Configure retries and timeouts for landing page tests
test.describe.configure({ 
  retries: 3,
  timeout: 30_000 
});

test.describe('🏠 Comprehensive Landing Page Tests', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }, testInfo) => {
    // Extend timeout for all tests in this suite
    testInfo.setTimeout(testInfo.timeout + 15000);
    
    landingPage = new LandingPage(page);
    await landingPage.goto();
    
    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.readyState === 'complete');
  });

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
    test('should navigate to login from navigation menu', async ({ page }) => {
      // Use expect.toPass() for retry logic on potentially flaky navigation
      await expect(async () => {
        await landingPage.navigateToLogin();
        await expect(page).toHaveURL(/.*login/);
        await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
      }).toPass();
    });

    test('should navigate to signup from navigation menu', async ({ page }) => {
      await expect(async () => {
        await landingPage.navigateToSignup();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole('heading', { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test('should navigate to signup when clicking Start Creating Free', async ({ page }) => {
      await expect(async () => {
        await landingPage.clickStartCreating();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole('heading', { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test('should navigate to signup from final CTA', async ({ page }) => {
      // Scroll to final CTA section first
      await page.locator('#cta-section, [data-testid="cta-section"]').scrollIntoViewIfNeeded();
      
      await expect(async () => {
        await landingPage.clickFinalCta();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole('heading', { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test('should contact sales from pricing section', async ({ page }) => {
      await expect(async () => {
        await landingPage.contactSales();
        await expect(page).toHaveURL(/.*contact/);
        await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();
      }).toPass();
    });
  });

  test.describe('📊 Content Verification', () => {
    test('should display workflow steps', async ({ page }) => {
      // Scroll to how it works section
      await page.getByTestId('how-it-works-section').scrollIntoViewIfNeeded();
      
      await expect(async () => {
        // Verify section is visible
        await expect(page.getByTestId('how-it-works-section')).toBeVisible();
        
        // Verify workflow steps are present
        const workflowSteps = page.locator('[data-testid^="workflow-step-"]');
        await expect(workflowSteps).toHaveCount(3);
        
        // Verify each step has required elements
        for (let i = 0; i < 3; i++) {
          await expect(page.getByTestId(`step-title-${i}`)).toBeVisible();
          await expect(page.getByTestId(`step-description-${i}`)).toBeVisible();
          await expect(page.getByTestId(`step-cta-${i}`)).toBeVisible();
        }
      }).toPass();
    });

    test('should display statistics and testimonials', async ({ page }) => {
      // Scroll to social proof section
      await page.getByTestId('social-proof-section').scrollIntoViewIfNeeded();
      
      await expect(async () => {
        // Verify statistics
        const statistics = page.locator('[data-testid^="statistic-"]');
        await expect(statistics).toHaveCount(4);
        
        // Verify testimonials
        const testimonials = page.locator('[data-testid^="testimonial-"]');
        await expect(testimonials).toHaveCount(3);
        
        // Verify specific statistics content
        await expect(page.getByTestId('stat-number-0')).toContainText('50K+');
        await expect(page.getByTestId('stat-number-1')).toContainText('2M+');
        await expect(page.getByTestId('stat-number-2')).toContainText('$10M+');
        await expect(page.getByTestId('stat-number-3')).toContainText('99.9%');
      }).toPass();
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