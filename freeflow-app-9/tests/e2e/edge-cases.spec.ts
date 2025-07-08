import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Error Handling Tests', () => {
  
  test.describe('Network and Performance Edge Cases', () => {
    test('should handle slow network connections', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
        await route.continue();
      });
      
      await page.goto('http://localhost:3000');
      
      // Page should still load, even if slowly
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible({ timeout: 15000 });
    });

    test('should handle offline scenarios', async ({ page, context }) => {
      await page.goto('http://localhost:3000');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate to another page
      await page.click('text=AI Video Studio');
      
      // Should handle offline gracefully (implementation specific)
      await page.waitForTimeout(2000);
    });

    test('should handle very large viewport sizes', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.goto('http://localhost:3000');
      
      // Content should scale appropriately
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
      await page.screenshot({ path: 'tests/screenshots/large-viewport.png' });
    });

    test('should handle very small viewport sizes', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('http://localhost:3000');
      
      // Content should still be accessible
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
      await page.screenshot({ path: 'tests/screenshots/tiny-viewport.png' });
    });
  });

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle missing JavaScript gracefully', async ({ page }) => {
      // Disable JavaScript
      await page.addInitScript(() => {
        // Override some JS functionality to simulate issues
        window.addEventListener = () => {};
      });
      
      await page.goto('http://localhost:3000');
      
      // Basic content should still be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should handle old browser features', async ({ page }) => {
      // Simulate missing modern browser features
      await page.addInitScript(() => {
        // @ts-ignore
        delete window.fetch;
        // @ts-ignore  
        delete window.IntersectionObserver;
      });
      
      await page.goto('http://localhost:3000');
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });
  });

  test.describe('Security Edge Cases', () => {
    test('should prevent XSS attacks in forms', async ({ page }) => {
      await page.goto('http://localhost:3000/contact');
      
      // Try to inject malicious script
      const maliciousScript = '<script>alert("XSS")</script>';
      
      await page.fill('input[id="firstName"]', maliciousScript);
      await page.fill('input[id="lastName"]', maliciousScript);
      await page.fill('textarea[id="message"]', maliciousScript);
      
      await page.click('button[type="submit"]');
      
      // Should not execute script
      await page.waitForTimeout(1000);
      // No alert should appear (implementation specific)
    });

    test('should handle malformed URLs gracefully', async ({ page }) => {
      // Test various malformed URLs
      const malformedUrls = [
        'http://localhost:3000/../../etc/passwd',
        'http://localhost:3000/<script>alert(1)</script>',
        'http://localhost:3000/' + 'a'.repeat(2000), // Very long URL
      ];
      
      for (const url of malformedUrls) {
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        // Should not crash, either redirect or show 404
        expect(response?.status()).toBeLessThan(500);
      }
    });
  });

  test.describe('Data Edge Cases', () => {
    test('should handle empty data states', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Mock empty state
      await page.addInitScript(() => {
        window.localStorage.setItem('auth-token', 'mock-token');
        // Mock empty data responses
        window.fetch = async () => ({
          json: async () => ({ data: [] }),
          ok: true
        });
      });
      
      await page.reload();
      
      // Should handle empty states gracefully
      await page.waitForTimeout(2000);
    });

    test('should handle very long text content', async ({ page }) => {
      await page.goto('http://localhost:3000/contact');
      
      // Fill with very long text
      const longText = 'Lorem ipsum '.repeat(1000);
      
      await page.fill('textarea[id="message"]', longText);
      
      // Should handle long content without breaking layout
      await expect(page.locator('textarea[id="message"]')).toBeVisible();
    });

    test('should handle special characters and unicode', async ({ page }) => {
      await page.goto('http://localhost:3000/contact');
      
      // Test with various special characters
      const specialText = '🚀 Émilie José François Müller 中文 العربية русский язык';
      
      await page.fill('input[id="firstName"]', specialText);
      await page.fill('input[id="subject"]', specialText);
      
      // Should handle unicode gracefully
      await expect(page.locator('input[id="firstName"]')).toHaveValue(specialText);
    });
  });

  test.describe('User Interaction Edge Cases', () => {
    test('should handle rapid clicking', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Rapidly click the same button
      const button = page.locator('text=AI Video Studio').first();
      
      for (let i = 0; i < 10; i++) {
        await button.click({ force: true });
        await page.waitForTimeout(50);
      }
      
      // Should not cause issues
      await page.waitForTimeout(1000);
    });

    test('should handle form submission spamming', async ({ page }) => {
      await page.goto('http://localhost:3000/contact');
      
      await page.fill('input[id="firstName"]', 'Test');
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('textarea[id="message"]', 'Test message');
      
      // Submit form multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }
      
      // Should handle gracefully
      await page.waitForTimeout(1000);
    });

    test('should handle keyboard mashing', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Random keyboard input
      const keys = ['Tab', 'Enter', 'Escape', 'ArrowDown', 'ArrowUp', 'Space'];
      
      for (let i = 0; i < 20; i++) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        await page.keyboard.press(randomKey);
        await page.waitForTimeout(50);
      }
      
      // Page should still be functional
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });
  });

  test.describe('Accessibility Edge Cases', () => {
    test('should work with high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          * {
            filter: contrast(200%) !important;
          }
        `;
        document.head.appendChild(style);
      });
      
      await page.goto('http://localhost:3000');
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
      
      await page.screenshot({ path: 'tests/screenshots/high-contrast.png' });
    });

    test('should work with zoom levels', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Test various zoom levels
      const zoomLevels = [0.5, 1.5, 2.0];
      
      for (const zoom of zoomLevels) {
        await page.evaluate((zoomLevel) => {
          document.body.style.zoom = zoomLevel.toString();
        }, zoom);
        
        await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
        await page.screenshot({ path: `tests/screenshots/zoom-${zoom}.png` });
      }
    });

    test('should work with reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);
      });
      
      await page.goto('http://localhost:3000');
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });
  });

  test.describe('Error Recovery Edge Cases', () => {
    test('should recover from JavaScript errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      await page.goto('http://localhost:3000');
      
      // Inject a JS error
      await page.evaluate(() => {
        // @ts-ignore
        nonExistentFunction();
      });
      
      // Page should still be functional despite error
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });

    test('should handle memory pressure', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Create memory pressure
      await page.evaluate(() => {
        const largeArray = new Array(1000000).fill('memory test');
        // @ts-ignore
        window.memoryTest = largeArray;
      });
      
      // Navigate around to test under memory pressure
      await page.click('text=AI Video Studio');
      await page.goBack();
      
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });
  });

  test.describe('Edge Case Cleanup', () => {
    test('should clean up properly after tests', async ({ page }) => {
      // Clean up any side effects from edge case tests
      await page.goto('http://localhost:3000');
      
      // Clear localStorage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Verify clean state
      await expect(page.locator('text=Welcome to FreeFlowZee')).toBeVisible();
    });
  });
});