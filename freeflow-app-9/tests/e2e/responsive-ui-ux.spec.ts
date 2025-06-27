import { test, expect, Page } from &apos;@playwright/test&apos;;

interface ViewportInfo {
  width: number;
  height: number;
  category: &apos;desktop&apos; | &apos;tablet&apos; | &apos;mobile&apos;;
  name: string;
}

// Helper function to categorize viewport
function getViewportCategory(page: Page): ViewportInfo {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error(&apos;No viewport size available&apos;);
  
  let category: &apos;desktop&apos; | &apos;tablet&apos; | &apos;mobile&apos;;
  let name = '&apos;;'
  
  if (viewport.width >= 1024) {
    category = &apos;desktop&apos;;
    name = viewport.width >= 1920 ? &apos;large-desktop&apos; : &apos;standard-desktop&apos;;
  } else if (viewport.width >= 768) {
    category = &apos;tablet&apos;;
    name = &apos;tablet&apos;;
  } else {
    category = &apos;mobile&apos;;
    name = viewport.width <= 375 ? &apos;small-mobile&apos; : &apos;mobile&apos;;
  }
  
  return { ...viewport, category, name };
}

// Helper function to wait for page load and hydration
async function waitForPageReady(page: Page) {
  await page.waitForLoadState(&apos;networkidle&apos;);
  await page.waitForFunction(() => {
    return typeof window !== &apos;undefined&apos; && document.readyState === &apos;complete&apos;;
  });
  // Wait for React hydration
  await page.waitForTimeout(1000);
}

test.describe(&apos;Responsive UI/UX Testing Suite&apos;, () => {
  
  test.describe(&apos;Landing Page Responsive Design&apos;, () => {
    
    test(&apos;should display properly on all viewport sizes&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/');'
      await waitForPageReady(page);
      
      // Take screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/screenshots/landing-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
      
      // Test hero section visibility and layout
      const heroSection = page.locator(&apos;[data-testid=&quot;hero-section&quot;], .hero, [class*=&quot;hero&quot;]&apos;).first();
      await expect(heroSection).toBeVisible();
      
      // Test navigation accessibility
      if (viewport.category === &apos;mobile&apos;) {
        // Mobile navigation should have hamburger menu
        const mobileMenu = page.locator(&apos;[data-testid=&quot;mobile-menu&quot;], [aria-label*=&quot;menu&quot;], [class*=&quot;mobile&quot;]&apos;).first();
        await expect(mobileMenu).toBeVisible();
      } else {
        // Desktop navigation should show full menu
        const desktopNav = page.locator(&apos;[data-testid=&quot;desktop-nav&quot;], nav&apos;).first();
        await expect(desktopNav).toBeVisible();
      }
      
      // Test call-to-action buttons
      const ctaButtons = page.locator(&apos;button:has-text(&quot;Creator Login&quot;), button:has-text(&quot;Watch Demo&quot;), button:has-text(&quot;View Projects&quot;)&apos;);
      const ctaCount = await ctaButtons.count();
      expect(ctaCount).toBeGreaterThan(0);
      
      // Verify buttons are properly sized for touch on mobile
      if (viewport.category === &apos;mobile&apos;) {
        for (let i = 0; i < ctaCount; i++) {
          const button = ctaButtons.nth(i);
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
          }
        }
      }
      
      console.log(`✓ Landing page tested successfully on ${viewport.category} (${viewport.width}x${viewport.height})`);
    });
    
    test(&apos;should handle navigation interactions properly&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/');'
      await waitForPageReady(page);
      
      if (viewport.category === &apos;mobile&apos;) {
        // Test mobile menu functionality
        const mobileMenuButton = page.locator(&apos;[data-testid=&quot;mobile-menu&quot;]&apos;).first();
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click({ force: true }); // Force click to bypass portal issues
          await page.waitForTimeout(500); // Animation time
          
          const menuPanel = page.locator(&apos;[data-testid=&quot;mobile-menu-content&quot;]&apos;).first();
          await expect(menuPanel).toBeVisible();
          
          // Close menu after testing
          await mobileMenuButton.click({ force: true });
        }
      }
      
      // Test login button navigation
      const loginButton = page.locator(&apos;button:has-text(&quot;Creator Login&quot;), a:has-text(&quot;Login&quot;)&apos;).first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await waitForPageReady(page);
        await expect(page).toHaveURL(/\/login/);
      }
      
      console.log(`✓ Navigation tested successfully on ${viewport.category}`);
    });
  });
  
  test.describe(&apos;Dashboard Responsive Layout&apos;, () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to dashboard (authentication bypassed in test mode)
      await page.goto(&apos;/dashboard&apos;);
      await waitForPageReady(page);
    });
    
    test(&apos;should display dashboard layout correctly&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/screenshots/dashboard-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
      
      if (viewport.category === &apos;desktop&apos;) {
        // Desktop should show sidebar navigation
        const sidebar = page.locator(&apos;[data-testid=&quot;dashboard-sidebar&quot;], [class*=&quot;sidebar&quot;], aside&apos;).first();
        await expect(sidebar).toBeVisible();
        
        // Check sidebar width
        const sidebarBox = await sidebar.boundingBox();
        if (sidebarBox) {
          expect(sidebarBox.width).toBeGreaterThanOrEqual(240);
          expect(sidebarBox.width).toBeLessThanOrEqual(320);
        }
      } else {
        // Mobile/tablet should show bottom navigation or top bar
        const mobileNav = page.locator(&apos;[data-testid=&quot;mobile-nav&quot;], [class*=&quot;bottom-nav&quot;], [class*=&quot;mobile-nav&quot;]&apos;).first();
        const topBar = page.locator(&apos;[data-testid=&quot;top-bar&quot;], [class*=&quot;top-bar&quot;]&apos;).first();
        
        const mobileNavVisible = await mobileNav.isVisible();
        const topBarVisible = await topBar.isVisible();
        
        expect(mobileNavVisible || topBarVisible).toBeTruthy();
      }
      
      // Test main content area
      const mainContent = page.locator(&apos;[data-testid=&quot;main-content&quot;], main, [class*=&quot;main&quot;]&apos;).first();
      await expect(mainContent).toBeVisible();
      
      // Test responsive cards/stats
      const statsCards = page.locator(&apos;[data-testid=&quot;stats-card&quot;], [class*=&quot;stats&quot;], [class*=&quot;metric&quot;]&apos;);
      const cardCount = await statsCards.count();
      
      if (cardCount > 0) {
        // Check card responsiveness
        for (let i = 0; i < Math.min(cardCount, 4); i++) {
          const card = statsCards.nth(i);
          const cardBox = await card.boundingBox();
          if (cardBox) {
            if (viewport.category === &apos;mobile&apos;) {
              // Mobile cards should stack or use smaller grid
              expect(cardBox.width).toBeGreaterThanOrEqual(viewport.width * 0.8);
            } else {
              // Desktop cards can be smaller in grid
              expect(cardBox.width).toBeLessThanOrEqual(viewport.width * 0.4);
            }
          }
        }
      }
      
      console.log(`✓ Dashboard layout tested on ${viewport.category} (${viewport.width}x${viewport.height})`);
    });
    
    test(&apos;should handle dashboard navigation properly&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Test navigation to different dashboard sections
      const navItems = [
        &apos;Projects Hub&apos;,
        &apos;Community&apos;,
        &apos;Collaboration&apos;,
        &apos;My Day&apos;
      ];
      
      for (const navItem of navItems) {
        const navLink = page.locator(`[data-testid=&quot;nav-${navItem.toLowerCase().replace(&apos; ', &apos;-')}&quot;], a:has-text(&quot;${navItem}&quot;), button:has-text(&quot;${navItem}&quot;)`).first();
        
        if (await navLink.isVisible()) {
          await navLink.click();
          await waitForPageReady(page);
          
          // Verify navigation worked
          const currentUrl = page.url();
          expect(currentUrl).toMatch(new RegExp(navItem.toLowerCase().replace(&apos; ', &apos;-')));
          
          // Take screenshot of each section
          await page.screenshot({ 
            path: `test-results/screenshots/dashboard-${navItem.toLowerCase().replace(&apos; ', &apos;-')}-${viewport.name}.png`,
            fullPage: true 
          });
          
          break; // Test one navigation item per viewport to save time
        }
      }
      
      console.log(`✓ Dashboard navigation tested on ${viewport.category}`);
    });
  });
  
  test.describe(&apos;Component Responsive Behavior&apos;, () => {
    
    test(&apos;should render forms responsively&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/login&apos;);
      await waitForPageReady(page);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/login-form-${viewport.name}.png` 
      });
      
      // Test form layout
      const loginForm = page.locator(&apos;form&apos;).first();
      await expect(loginForm).toBeVisible();
      
      const formBox = await loginForm.boundingBox();
      if (formBox) {
        if (viewport.category === &apos;mobile&apos;) {
          // Mobile forms should use most of screen width
          expect(formBox.width).toBeGreaterThanOrEqual(viewport.width * 0.8);
        } else {
          // Desktop forms should be centered and limited width
          expect(formBox.width).toBeLessThanOrEqual(500);
        }
      }
      
      // Test input field sizing
      const inputs = page.locator(&apos;input[type=&quot;email&quot;], input[type=&quot;password&quot;]&apos;);
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputBox = await input.boundingBox();
        if (inputBox) {
          expect(inputBox.height).toBeGreaterThanOrEqual(40); // Minimum input height
          if (viewport.category === &apos;mobile&apos;) {
            expect(inputBox.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
          }
        }
      }
      
      console.log(`✓ Form responsiveness tested on ${viewport.category}`);
    });
    
    test(&apos;should handle modal dialogs responsively&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/dashboard/projects-hub&apos;);
      await waitForPageReady(page);
      
      // Look for modal triggers
      const modalTriggers = page.locator(&apos;button:has-text(&quot;New&quot;), button:has-text(&quot;Add&quot;), button:has-text(&quot;Create&quot;)&apos;);
      const triggerCount = await modalTriggers.count();
      
      if (triggerCount > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(500);
        
        // Check if modal appeared
        const modal = page.locator(&apos;[role=&quot;dialog&quot;], [class*=&quot;modal&quot;], [class*=&quot;dialog&quot;]&apos;).first();
        if (await modal.isVisible()) {
          const modalBox = await modal.boundingBox();
          if (modalBox) {
            if (viewport.category === &apos;mobile&apos;) {
              // Mobile modals should be full-screen or nearly full-screen
              expect(modalBox.width).toBeGreaterThanOrEqual(viewport.width * 0.9);
            } else {
              // Desktop modals should be centered and limited size
              expect(modalBox.width).toBeLessThanOrEqual(viewport.width * 0.8);
            }
          }
          
          await page.screenshot({ 
            path: `test-results/screenshots/modal-${viewport.name}.png` 
          });
        }
      }
      
      console.log(`✓ Modal responsiveness tested on ${viewport.category}`);
    });
  });
  
  test.describe(&apos;Touch and Interaction Testing&apos;, () => {
    
    test(&apos;should handle touch interactions on mobile devices&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Only run touch tests on mobile/tablet
      if (viewport.category === &apos;desktop&apos;) {
        test.skip(&apos;Touch testing only applicable to mobile/tablet devices&apos;);
        return;
      }
      
      await page.goto(&apos;/dashboard/collaboration&apos;);
      await waitForPageReady(page);
      
      // Test touch targets
      const touchTargets = page.locator(&apos;button, a, [role=&quot;button&quot;]&apos;);
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        if (await target.isVisible()) {
          const targetBox = await target.boundingBox();
          if (targetBox) {
            expect(targetBox.height).toBeGreaterThanOrEqual(44); // iOS Human Interface Guidelines
            expect(targetBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      }
      
      // Test swipe gestures if applicable
      const swipeableElements = page.locator(&apos;[class*=&quot;swipe&quot;], [class*=&quot;carousel&quot;], [class*=&quot;slider&quot;]&apos;);
      const swipeCount = await swipeableElements.count();
      
      if (swipeCount > 0) {
        const swipeElement = swipeableElements.first();
        const elementBox = await swipeElement.boundingBox();
        
        if (elementBox) {
          // Simulate swipe gesture
          await page.touchscreen.tap(elementBox.x + elementBox.width * 0.8, elementBox.y + elementBox.height / 2);
          await page.mouse.move(elementBox.x + elementBox.width * 0.2, elementBox.y + elementBox.height / 2);
          await page.waitForTimeout(300);
        }
      }
      
      console.log(`✓ Touch interactions tested on ${viewport.category}`);
    });
  });
  
  test.describe(&apos;Performance and Accessibility&apos;, () => {
    
    test(&apos;should meet accessibility standards&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/dashboard&apos;);
      await waitForPageReady(page);
      
      // Test keyboard navigation - target specific focusable elements
      const focusableElements = page.locator(&apos;button, a, input, [tabindex]:not([tabindex=&quot;-1&quot;])&apos;).first();
      await focusableElements.focus();
      await expect(focusableElements).toBeVisible();
      
      // Test contrast and readability
      const textElements = page.locator(&apos;h1, h2, h3, p, span, div&apos;).filter({ hasText: /\S/ });
      const textCount = await textElements.count();
      
      for (let i = 0; i < Math.min(textCount, 5); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              fontSize: computed.fontSize,
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });
          
          const fontSize = parseInt(styles.fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable font size
        }
      }
      
      console.log(`✓ Accessibility tested on ${viewport.category}`);
    });
    
    test(&apos;should have reasonable load times&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      const startTime = Date.now();
      await page.goto(&apos;/dashboard/projects-hub&apos;);
      await waitForPageReady(page);
      const loadTime = Date.now() - startTime;
      
      // Load time should be reasonable (adjust based on requirements)
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
      
      // Check for layout shifts
      const layoutShiftScore = await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === &apos;layout-shift&apos; && !entry.hadRecentInput) {
                cls += entry.value;
              }
            }
            resolve(cls);
          }).observe({ entryTypes: [&apos;layout-shift&apos;] });
          
          setTimeout(() => resolve(cls), 3000);
        });
      });
      
      expect(layoutShiftScore).toBeLessThan(0.25); // Good CLS score
      
      console.log(`✓ Performance tested on ${viewport.category} - Load time: ${loadTime}ms, CLS: ${layoutShiftScore}`);
    });
  });
  
  test.describe(&apos;Cross-viewport Consistency&apos;, () => {
    
    test(&apos;should maintain consistent branding and styling&apos;, async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto(&apos;/');'
      await waitForPageReady(page);
      
      // Test logo visibility and sizing
      const logo = page.locator(&apos;[data-testid=&quot;logo&quot;], [alt*=&quot;logo&quot;], [class*=&quot;logo&quot;]&apos;).first();
      if (await logo.isVisible()) {
        const logoBox = await logo.boundingBox();
        if (logoBox) {
          expect(logoBox.height).toBeGreaterThanOrEqual(24);
          expect(logoBox.height).toBeLessThanOrEqual(80);
        }
      }
      
      // Test color scheme consistency
      const primaryElements = page.locator(&apos;button[class*=&quot;primary&quot;], .btn-primary, [class*=&quot;primary-button&quot;]&apos;);
      const primaryCount = await primaryElements.count();
      
      if (primaryCount > 0) {
        const primaryElement = primaryElements.first();
        const primaryStyles = await primaryElement.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color
          };
        });
        
        // Verify primary button has consistent styling
        expect(primaryStyles.backgroundColor).toBeTruthy();
        expect(primaryStyles.color).toBeTruthy();
      }
      
      console.log(`✓ Branding consistency verified on ${viewport.category}`);
    });
  });
});

// Export helper functions for use in other test files
export { getViewportCategory, waitForPageReady }; 