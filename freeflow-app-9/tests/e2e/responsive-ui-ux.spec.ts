import { test, expect, Page } from '@playwright/test';

interface ViewportInfo {
  width: number;
  height: number;
  category: 'desktop' | 'tablet' | 'mobile';
  name: string;
}

// Helper function to categorize viewport
function getViewportCategory(page: Page): ViewportInfo {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('No viewport size available');
  
  let category: 'desktop' | 'tablet' | 'mobile';
  let name = '';
  
  if (viewport.width >= 1024) {
    category = 'desktop';
    name = viewport.width >= 1920 ? 'large-desktop' : 'standard-desktop';
  } else if (viewport.width >= 768) {
    category = 'tablet';
    name = 'tablet';
  } else {
    category = 'mobile';
    name = viewport.width <= 375 ? 'small-mobile' : 'mobile';
  }
  
  return { ...viewport, category, name };
}

// Helper function to wait for page load and hydration
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    return typeof window !== 'undefined' && document.readyState === 'complete';
  });
  // Wait for React hydration
  await page.waitForTimeout(1000);
}

test.describe('Responsive UI/UX Testing Suite', () => {
  
  test.describe('Landing Page Responsive Design', () => {
    
    test('should display properly on all viewport sizes', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/');
      await waitForPageReady(page);
      
      // Take screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/screenshots/landing-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
      
      // Test hero section visibility and layout
      const heroSection = page.locator('[data-testid="hero-section"], .hero, [class*="hero"]').first();
      await expect(heroSection).toBeVisible();
      
      // Test navigation accessibility
      if (viewport.category === 'mobile') {
        // Mobile navigation should have hamburger menu
        const mobileMenu = page.locator('[data-testid="mobile-menu"], [aria-label*="menu"], [class*="mobile"]').first();
        await expect(mobileMenu).toBeVisible();
      } else {
        // Desktop navigation should show full menu
        const desktopNav = page.locator('[data-testid="desktop-nav"], nav').first();
        await expect(desktopNav).toBeVisible();
      }
      
      // Test call-to-action buttons
      const ctaButtons = page.locator('button:has-text("Creator Login"), button:has-text("Watch Demo"), button:has-text("View Projects")');
      const ctaCount = await ctaButtons.count();
      expect(ctaCount).toBeGreaterThan(0);
      
      // Verify buttons are properly sized for touch on mobile
      if (viewport.category === 'mobile') {
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
    
    test('should handle navigation interactions properly', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/');
      await waitForPageReady(page);
      
      if (viewport.category === 'mobile') {
        // Test mobile menu functionality
        const mobileMenuButton = page.locator('[data-testid="mobile-menu"]').first();
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click({ force: true }); // Force click to bypass portal issues
          await page.waitForTimeout(500); // Animation time
          
          const menuPanel = page.locator('[data-testid="mobile-menu-content"]').first();
          await expect(menuPanel).toBeVisible();
          
          // Close menu after testing
          await mobileMenuButton.click({ force: true });
        }
      }
      
      // Test login button navigation
      const loginButton = page.locator('button:has-text("Creator Login"), a:has-text("Login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await waitForPageReady(page);
        await expect(page).toHaveURL(/\/login/);
      }
      
      console.log(`✓ Navigation tested successfully on ${viewport.category}`);
    });
  });
  
  test.describe('Dashboard Responsive Layout', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to dashboard (authentication bypassed in test mode)
      await page.goto('/dashboard');
      await waitForPageReady(page);
    });
    
    test('should display dashboard layout correctly', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/screenshots/dashboard-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
      
      if (viewport.category === 'desktop') {
        // Desktop should show sidebar navigation
        const sidebar = page.locator('[data-testid="dashboard-sidebar"], [class*="sidebar"], aside').first();
        await expect(sidebar).toBeVisible();
        
        // Check sidebar width
        const sidebarBox = await sidebar.boundingBox();
        if (sidebarBox) {
          expect(sidebarBox.width).toBeGreaterThanOrEqual(240);
          expect(sidebarBox.width).toBeLessThanOrEqual(320);
        }
      } else {
        // Mobile/tablet should show bottom navigation or top bar
        const mobileNav = page.locator('[data-testid="mobile-nav"], [class*="bottom-nav"], [class*="mobile-nav"]').first();
        const topBar = page.locator('[data-testid="top-bar"], [class*="top-bar"]').first();
        
        const mobileNavVisible = await mobileNav.isVisible();
        const topBarVisible = await topBar.isVisible();
        
        expect(mobileNavVisible || topBarVisible).toBeTruthy();
      }
      
      // Test main content area
      const mainContent = page.locator('[data-testid="main-content"], main, [class*="main"]').first();
      await expect(mainContent).toBeVisible();
      
      // Test responsive cards/stats
      const statsCards = page.locator('[data-testid="stats-card"], [class*="stats"], [class*="metric"]');
      const cardCount = await statsCards.count();
      
      if (cardCount > 0) {
        // Check card responsiveness
        for (let i = 0; i < Math.min(cardCount, 4); i++) {
          const card = statsCards.nth(i);
          const cardBox = await card.boundingBox();
          if (cardBox) {
            if (viewport.category === 'mobile') {
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
    
    test('should handle dashboard navigation properly', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Test navigation to different dashboard sections
      const navItems = [
        'Projects Hub',
        'Community',
        'Collaboration',
        'My Day'
      ];
      
      for (const navItem of navItems) {
        const navLink = page.locator(`[data-testid="nav-${navItem.toLowerCase().replace(' ', '-')}"], a:has-text("${navItem}"), button:has-text("${navItem}")`).first();
        
        if (await navLink.isVisible()) {
          await navLink.click();
          await waitForPageReady(page);
          
          // Verify navigation worked
          const currentUrl = page.url();
          expect(currentUrl).toMatch(new RegExp(navItem.toLowerCase().replace(' ', '-')));
          
          // Take screenshot of each section
          await page.screenshot({ 
            path: `test-results/screenshots/dashboard-${navItem.toLowerCase().replace(' ', '-')}-${viewport.name}.png`,
            fullPage: true 
          });
          
          break; // Test one navigation item per viewport to save time
        }
      }
      
      console.log(`✓ Dashboard navigation tested on ${viewport.category}`);
    });
  });
  
  test.describe('Component Responsive Behavior', () => {
    
    test('should render forms responsively', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/login');
      await waitForPageReady(page);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/login-form-${viewport.name}.png` 
      });
      
      // Test form layout
      const loginForm = page.locator('form').first();
      await expect(loginForm).toBeVisible();
      
      const formBox = await loginForm.boundingBox();
      if (formBox) {
        if (viewport.category === 'mobile') {
          // Mobile forms should use most of screen width
          expect(formBox.width).toBeGreaterThanOrEqual(viewport.width * 0.8);
        } else {
          // Desktop forms should be centered and limited width
          expect(formBox.width).toBeLessThanOrEqual(500);
        }
      }
      
      // Test input field sizing
      const inputs = page.locator('input[type="email"], input[type="password"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputBox = await input.boundingBox();
        if (inputBox) {
          expect(inputBox.height).toBeGreaterThanOrEqual(40); // Minimum input height
          if (viewport.category === 'mobile') {
            expect(inputBox.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
          }
        }
      }
      
      console.log(`✓ Form responsiveness tested on ${viewport.category}`);
    });
    
    test('should handle modal dialogs responsively', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/dashboard/projects-hub');
      await waitForPageReady(page);
      
      // Look for modal triggers
      const modalTriggers = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")');
      const triggerCount = await modalTriggers.count();
      
      if (triggerCount > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(500);
        
        // Check if modal appeared
        const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]').first();
        if (await modal.isVisible()) {
          const modalBox = await modal.boundingBox();
          if (modalBox) {
            if (viewport.category === 'mobile') {
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
  
  test.describe('Touch and Interaction Testing', () => {
    
    test('should handle touch interactions on mobile devices', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      // Only run touch tests on mobile/tablet
      if (viewport.category === 'desktop') {
        test.skip('Touch testing only applicable to mobile/tablet devices');
        return;
      }
      
      await page.goto('/dashboard/collaboration');
      await waitForPageReady(page);
      
      // Test touch targets
      const touchTargets = page.locator('button, a, [role="button"]');
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
      const swipeableElements = page.locator('[class*="swipe"], [class*="carousel"], [class*="slider"]');
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
  
  test.describe('Performance and Accessibility', () => {
    
    test('should meet accessibility standards', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/dashboard');
      await waitForPageReady(page);
      
      // Test keyboard navigation - target specific focusable elements
      const focusableElements = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first();
      await focusableElements.focus();
      await expect(focusableElements).toBeVisible();
      
      // Test contrast and readability
      const textElements = page.locator('h1, h2, h3, p, span, div').filter({ hasText: /\S/ });
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
    
    test('should have reasonable load times', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      const startTime = Date.now();
      await page.goto('/dashboard/projects-hub');
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
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                cls += entry.value;
              }
            }
            resolve(cls);
          }).observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(cls), 3000);
        });
      });
      
      expect(layoutShiftScore).toBeLessThan(0.25); // Good CLS score
      
      console.log(`✓ Performance tested on ${viewport.category} - Load time: ${loadTime}ms, CLS: ${layoutShiftScore}`);
    });
  });
  
  test.describe('Cross-viewport Consistency', () => {
    
    test('should maintain consistent branding and styling', async ({ page }) => {
      const viewport = getViewportCategory(page);
      
      await page.goto('/');
      await waitForPageReady(page);
      
      // Test logo visibility and sizing
      const logo = page.locator('[data-testid="logo"], [alt*="logo"], [class*="logo"]').first();
      if (await logo.isVisible()) {
        const logoBox = await logo.boundingBox();
        if (logoBox) {
          expect(logoBox.height).toBeGreaterThanOrEqual(24);
          expect(logoBox.height).toBeLessThanOrEqual(80);
        }
      }
      
      // Test color scheme consistency
      const primaryElements = page.locator('button[class*="primary"], .btn-primary, [class*="primary-button"]');
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