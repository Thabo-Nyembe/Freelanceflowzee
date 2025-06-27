import { test, expect } from &apos;../fixtures/app-fixtures&apos;;
import { LandingPage } from &apos;../page-objects/landing-page&apos;;

// Configure retries and timeouts for landing page tests
test.describe.configure({ 
  retries: 3,
  timeout: 30_000 
});

test.describe(&apos;🏠 Comprehensive Landing Page Tests&apos;, () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Extend timeout for all tests in this suite
    testInfo.setTimeout(testInfo.timeout + 15000);
    
    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState(&apos;networkidle&apos;);
    await page.waitForFunction(() => document.readyState === &apos;complete&apos;);
  });

  test.describe(&apos;📱 Core Functionality&apos;, () => {
    test(&apos;should display all hero section elements&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      const heroElements = await landingPage.verifyHeroSection();
      
      expect(heroElements.heading).toBe(true);
      expect(heroElements.subtitle).toBe(true);
      expect(heroElements.ctaButtons).toBe(true);
    });

    test(&apos;should display all features section elements&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      const featuresElements = await landingPage.verifyFeaturesSection();
      
      expect(featuresElements.section).toBe(true);
      expect(featuresElements.cardCount).toBeGreaterThan(0);
      expect(featuresElements.fileManagement).toBe(true);
      expect(featuresElements.paymentProcessing).toBe(true);
      expect(featuresElements.collaboration).toBe(true);
    });

    test(&apos;should display all pricing section elements&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      const pricingElements = await landingPage.verifyPricingSection();
      
      expect(pricingElements.section).toBe(true);
      expect(pricingElements.cardCount).toBe(3);
      expect(pricingElements.freePlan).toBe(true);
      expect(pricingElements.proPlan).toBe(true);
      expect(pricingElements.agencyPlan).toBe(true);
    });
  });

  test.describe(&apos;🎯 User Navigation & Actions&apos;, () => {
    test(&apos;should navigate to login from navigation menu&apos;, async ({ page }) => {
      // Use expect.toPass() for retry logic on potentially flaky navigation
      await expect(async () => {
        await landingPage.navigateToLogin();
        await expect(page).toHaveURL(/.*login/);
        await expect(page.getByRole(&apos;heading&apos;, { name: /welcome/i })).toBeVisible();
      }).toPass();
    });

    test(&apos;should navigate to signup from navigation menu&apos;, async ({ page }) => {
      await expect(async () => {
        await landingPage.navigateToSignup();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole(&apos;heading&apos;, { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test(&apos;should navigate to signup when clicking Start Creating Free&apos;, async ({ page }) => {
      await expect(async () => {
        await landingPage.clickStartCreating();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole(&apos;heading&apos;, { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test(&apos;should navigate to signup from final CTA&apos;, async ({ page }) => {
      // Scroll to final CTA section first
      await page.locator(&apos;#cta-section, [data-testid=&quot;cta-section&quot;]&apos;).scrollIntoViewIfNeeded();
      
      await expect(async () => {
        await landingPage.clickFinalCta();
        await expect(page).toHaveURL(/.*signup/);
        await expect(page.getByRole(&apos;heading&apos;, { name: /join/i })).toBeVisible();
      }).toPass();
    });

    test(&apos;should contact sales from pricing section&apos;, async ({ page }) => {
      await expect(async () => {
        await landingPage.contactSales();
        await expect(page).toHaveURL(/.*contact/);
        await expect(page.getByRole(&apos;heading&apos;, { name: /contact/i })).toBeVisible();
      }).toPass();
    });
  });

  test.describe(&apos;📊 Content Verification&apos;, () => {
    test(&apos;should display workflow steps&apos;, async ({ page }) => {
      // Scroll to how it works section
      await page.getByTestId(&apos;how-it-works-section&apos;).scrollIntoViewIfNeeded();
      
      await expect(async () => {
        // Verify section is visible
        await expect(page.getByTestId(&apos;how-it-works-section&apos;)).toBeVisible();
        
        // Verify workflow steps are present
        const workflowSteps = page.locator(&apos;[data-testid^=&quot;workflow-step-&quot;]&apos;);
        await expect(workflowSteps).toHaveCount(3);
        
        // Verify each step has required elements
        for (let i = 0; i < 3; i++) {
          await expect(page.getByTestId(`step-title-${i}`)).toBeVisible();
          await expect(page.getByTestId(`step-description-${i}`)).toBeVisible();
          await expect(page.getByTestId(`step-cta-${i}`)).toBeVisible();
        }
      }).toPass();
    });

    test(&apos;should display statistics and testimonials&apos;, async ({ page }) => {
      // Scroll to social proof section
      await page.getByTestId(&apos;social-proof-section&apos;).scrollIntoViewIfNeeded();
      
      await expect(async () => {
        // Verify statistics
        const statistics = page.locator(&apos;[data-testid^=&quot;statistic-&quot;]&apos;);
        await expect(statistics).toHaveCount(4);
        
        // Verify testimonials
        const testimonials = page.locator(&apos;[data-testid^=&quot;testimonial-&quot;]&apos;);
        await expect(testimonials).toHaveCount(3);
        
        // Verify specific statistics content
        await expect(page.getByTestId(&apos;stat-number-0&apos;)).toContainText(&apos;50K+&apos;);
        await expect(page.getByTestId(&apos;stat-number-1&apos;)).toContainText(&apos;2M+&apos;);
        await expect(page.getByTestId(&apos;stat-number-2&apos;)).toContainText(&apos;$10M+&apos;);
        await expect(page.getByTestId(&apos;stat-number-3&apos;)).toContainText(&apos;99.9%&apos;);
      }).toPass();
    });
  });

  test.describe(&apos;♿ Accessibility & SEO&apos;, () => {
    test(&apos;should have proper heading hierarchy&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      const accessibility = await landingPage.checkAccessibility();
      
      expect(accessibility.headingHierarchy.h1).toBe(1);
      expect(accessibility.headingHierarchy.h2).toBeGreaterThan(0);
      expect(accessibility.imagesWithoutAlt.length).toBe(0);
    });

    test(&apos;should have proper button labels&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      const accessibility = await landingPage.checkAccessibility();
      
      expect(accessibility.buttonsWithoutLabels.length).toBe(0);
    });
  });

  test.describe(&apos;📱 Responsive Design&apos;, () => {
    test(&apos;should be responsive on mobile viewport&apos;, async ({ landingPage, mobileViewport }) => {
      await landingPage.page.setViewportSize(mobileViewport);
      await landingPage.goto();
      
      const heroElements = await landingPage.verifyHeroSection();
      
      expect(heroElements.heading).toBe(true);
      expect(heroElements.ctaButtons).toBe(true);
    });

    test(&apos;should be responsive on tablet viewport&apos;, async ({ landingPage }) => {
      await landingPage.page.setViewportSize({ width: 768, height: 1024 });
      await landingPage.goto();
      
      const featuresElements = await landingPage.verifyFeaturesSection();
      
      expect(featuresElements.section).toBe(true);
      expect(featuresElements.cardCount).toBeGreaterThan(0);
    });
  });

  test.describe(&apos;⚡ Performance&apos;, () => {
    test(&apos;should load within acceptable time&apos;, async ({ landingPage }) => {
      const loadTime = await landingPage.measureLoadTime();
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test(&apos;should handle animations smoothly&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.waitForAnimations();
      
      const heroElements = await landingPage.verifyHeroSection();
      expect(heroElements.heading).toBe(true);
    });
  });

  test.describe(&apos;🔄 Scrolling & Sections&apos;, () => {
    test(&apos;should scroll to features section&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToFeatures();
      
      await expect(landingPage.featuresSection).toBeVisible();
    });

    test(&apos;should scroll to pricing section&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToPricing();
      
      await expect(landingPage.pricingSection).toBeVisible();
    });

    test(&apos;should scroll to how it works section&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.scrollToHowItWorks();
      
      await expect(landingPage.howItWorksSection).toBeVisible();
    });
  });

  test.describe(&apos;🎯 Edge Cases&apos;, () => {
    test(&apos;should handle demo button click&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      await landingPage.clickWatchDemo();
      
      // Demo button might open modal or video - just verify no errors
      await landingPage.page.waitForTimeout(1000);
    });

    test(&apos;should handle pricing plan selections&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      // Test free plan
      await landingPage.selectFreePlan();
      expect(landingPage.page.url()).toContain(&apos;/signup&apos;);
      
      // Go back and test pro plan
      await landingPage.goto();
      await landingPage.selectProPlan();
      expect(landingPage.page.url()).toContain(&apos;/signup&apos;);
    });

    test(&apos;should handle rapid navigation&apos;, async ({ landingPage }) => {
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

  test.describe(&apos;🌐 Cross-browser Compatibility&apos;, () => {
    test(&apos;should display correctly in different viewports&apos;, async ({ landingPage }) => {
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

  test.describe(&apos;🔒 Security & Privacy&apos;, () => {
    test(&apos;should not expose sensitive information&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      // Check page source for sensitive data
      const content = await landingPage.page.content();
      
      expect(content).not.toContain(&apos;password&apos;);
      expect(content).not.toContain(&apos;secret&apos;);
      expect(content).not.toContain(&apos;token&apos;);
    });

    test(&apos;should have secure links&apos;, async ({ landingPage }) => {
      await landingPage.goto();
      
      // Check all external links have proper attributes
      const externalLinks = await landingPage.page.locator(&apos;a[href^=&quot;http&quot;]&apos;).all();
      
      for (const link of externalLinks) {
        const rel = await link.getAttribute(&apos;rel&apos;);
        const target = await link.getAttribute(&apos;target&apos;);
        
        if (target === &apos;_blank&apos;) {
          expect(rel).toContain(&apos;noopener&apos;);
        }
      }
    });
  });
}); 