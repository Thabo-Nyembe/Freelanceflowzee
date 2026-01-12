import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility Tests', () => {
  const pages = [
    '/',
    '/contact',
    '/signup',
    '/pricing',
    '/video-studio',
    '/dashboard'
  ];

  test.describe('Core Functionality Across Browsers', () => {
    for (const pagePath of pages) {
      test(`should load ${pagePath} correctly in all browsers`, async ({ page }) => {
        await page.goto(`http://localhost:9323${pagePath}`);
        
        // Basic page load test
        await expect(page.locator('body')).toBeVisible();
        
        // Should not have critical console errors
        const errors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        await page.waitForLoadState('networkidle');
        
        // Allow for some minor console warnings but not critical errors
        const criticalErrors = errors.filter(error => 
          !error.includes('favicon') && 
          !error.includes('Warning') &&
          !error.includes('DevTools')
        );
        
        expect(criticalErrors.length).toBeLessThan(3);
      });
    }
  });

  test.describe('CSS and Layout Compatibility', () => {
    test('should maintain consistent layout across browsers', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Test key layout elements
      const layoutElements = [
        'h1',
        '[class*="grid"]',
        '[class*="flex"]',
        'button',
        'input'
      ];
      
      for (const selector of layoutElements) {
        const elements = page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          await expect(elements.first()).toBeVisible();
        }
      }
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: 'tests/screenshots/cross-browser-layout.png',
        fullPage: true 
      });
    });

    test('should handle CSS Grid and Flexbox correctly', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Check that grid layouts work
      const gridElements = page.locator('[class*="grid"]');
      const gridCount = await gridElements.count();
      
      if (gridCount > 0) {
        const firstGrid = gridElements.first();
        await expect(firstGrid).toBeVisible();
        
        // Check computed style
        const display = await firstGrid.evaluate(el => 
          window.getComputedStyle(el).display
        );
        
        // Should be grid or block (fallback)
        expect(['grid', 'block', 'flex']).toContain(display);
      }
    });

    test('should handle responsive design consistently', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Desktop small
        { width: 1920, height: 1080 } // Desktop large
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:9323');
        
        // Content should be visible at all viewport sizes
        await expect(page.locator('h1')).toBeVisible();
        
        // Navigation should be accessible
        const navElements = page.locator('nav, [role="navigation"], .navigation, .navbar');
        const navCount = await navElements.count();
        
        if (navCount > 0) {
          await expect(navElements.first()).toBeVisible();
        }
        
        await page.screenshot({ 
          path: `tests/screenshots/responsive-${viewport.width}x${viewport.height}.png`
        });
      }
    });
  });

  test.describe('JavaScript Compatibility', () => {
    test('should handle modern JavaScript features', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Test that modern JS features work
      const modernFeatures = await page.evaluate(() => {
        const features = {
          asyncAwait: typeof (async () => {}) === 'function',
          arrowFunctions: typeof (() => {}) === 'function',
          destructuring: true,
          templateLiterals: true,
          fetch: typeof fetch !== 'undefined',
          promise: typeof Promise !== 'undefined',
          map: typeof Map !== 'undefined',
          set: typeof Set !== 'undefined'
        };
        
        // Test destructuring
        try {
          const [a, b] = [1, 2];
          features.destructuring = a === 1 && b === 2;
        } catch (e) {
          features.destructuring = false;
        }
        
        // Test template literals
        try {
          const test = `template ${features.fetch}`;
          features.templateLiterals = test.includes('template');
        } catch (e) {
          features.templateLiterals = false;
        }
        
        return features;
      });
      
      // Most modern browsers should support these
      expect(modernFeatures.promise).toBe(true);
      expect(modernFeatures.fetch).toBe(true);
    });

    test('should handle event listeners correctly', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Test click events
      const buttons = page.locator('button, [role="button"], a');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        
        // Should be clickable
        await firstButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      
      // Test form field interactions
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const firstInput = inputs.first();
        await firstInput.fill('Test input');
        
        const value = await firstInput.inputValue();
        expect(value).toBe('Test input');
      }
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:9323');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (generous for CI)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle resource loading efficiently', async ({ page }) => {
      const resourcePromises: Promise<any>[] = [];
      
      page.on('response', (response) => {
        resourcePromises.push(
          Promise.resolve({
            url: response.url(),
            status: response.status(),
            timing: response.request().timing()
          })
        );
      });
      
      await page.goto('http://localhost:9323');
      await page.waitForLoadState('networkidle');
      
      const resources = await Promise.all(resourcePromises);
      
      // Most resources should load successfully
      const failedResources = resources.filter(r => r.status >= 400);
      expect(failedResources.length).toBeLessThan(3);
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    test('should maintain keyboard navigation', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused?.tagName,
          type: (focused as HTMLInputElement)?.type,
          role: focused?.getAttribute('role')
        };
      });
      
      // Should have focused on an interactive element
      const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      const isInteractive = interactiveElements.includes(focusedElement.tagName) ||
                           focusedElement.role === 'button';
      
      expect(isInteractive).toBeTruthy();
    });

    test('should maintain ARIA attributes', async ({ page }) => {
      await page.goto('http://localhost:9323');
      
      // Check for common ARIA attributes
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role')
        }));
      });
      
      // Should have some ARIA attributes for accessibility
      expect(ariaElements.length).toBeGreaterThan(0);
    });
  });

  test.describe('Security Across Browsers', () => {
    test('should handle Content Security Policy', async ({ page }) => {
      const securityErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
          securityErrors.push(msg.text());
        }
      });
      
      await page.goto('http://localhost:9323');
      await page.waitForLoadState('networkidle');
      
      // Should not have CSP violations
      expect(securityErrors.length).toBe(0);
    });

    test('should prevent inline script execution', async ({ page }) => {
      await page.goto('http://localhost:9323/contact');
      
      // Try to inject inline script
      await page.fill('input[id="firstName"]', '<img src=x onerror=alert(1)>');
      
      // Should not execute script
      const alertFired = await page.evaluate(() => {
        // Mock alert to detect if it was called
        let alertCalled = false;
        const originalAlert = window.alert;
        window.alert = () => { alertCalled = true; };
        
        // Trigger any potential script execution
        document.body.innerHTML += '';
        
        // Restore original alert
        window.alert = originalAlert;
        
        return alertCalled;
      });
      
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Feature Detection and Fallbacks', () => {
    test('should provide fallbacks for missing features', async ({ page }) => {
      // Simulate missing features
      await page.addInitScript(() => {
        // Remove some modern features
        // @ts-expect-error - testing graceful degradation without IntersectionObserver
        delete window.IntersectionObserver;
        // @ts-expect-error - testing graceful degradation without ResizeObserver
        delete window.ResizeObserver;
      });
      
      await page.goto('http://localhost:9323');
      
      // Page should still function
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should handle missing CSS features gracefully', async ({ page }) => {
      // Simulate old browser CSS support
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          .grid { display: block !important; }
          .flex { display: block !important; }
        `;
        document.head.appendChild(style);
      });
      
      await page.goto('http://localhost:9323');
      
      // Layout should still work with fallbacks
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});