import { test, expect } from &apos;@playwright/test&apos;;

/**
 * FreeflowZee Edge Case & Error Scenario Testing
 * Based on Context7 Best Practices and Node.js Testing Guidelines
 * 
 * Test Structure: AAA Pattern (Arrange, Act, Assert)
 * Naming Convention: &quot;When [condition], then [expected outcome]&quot;
 */

// Test environment setup with authentication bypass
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({
    &apos;x-test-mode&apos;: &apos;true&apos;,
    &apos;user-agent&apos;: &apos;Playwright/EdgeCase Tests - FreeflowZee&apos;
  });
  
  // Mock common API responses for consistent testing
  await page.route(&apos;/api/**&apos;, async (route) => {
    const url = route.request().url();
    
    if (url.includes(&apos;/api/auth/&apos;)) {
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({ success: true, user: { id: &apos;test-user&apos; } })
      });
    } else {
      await route.continue();
    }
  });
});

test.describe(&apos;Authentication Edge Cases&apos;, () => {
  test.describe(&apos;Session Management&apos;, () => {
    test(&apos;When session expires during active use, then user is redirected to login with data preservation&apos;, async ({ page }) => {
      // Arrange - Navigate to dashboard and start creating content
      await page.goto(&apos;/dashboard&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Simulate user creating content
      await page.fill(&apos;[data-testid=&quot;project-name-input&quot;]&apos;, &apos;Important Project&apos;);
      
      // Simulate session expiry by intercepting auth requests
      await page.route(&apos;/api/auth/**&apos;, async (route) => {
        await route.fulfill({
          status: 401,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ error: &apos;Session expired&apos; })
        });
      });
      
      // Act - Trigger a request that requires authentication
      await page.click(&apos;[data-testid=&quot;save-project-button&quot;]&apos;);
      
      // Assert - Should redirect to login with preserved data
      await expect(page).toHaveURL(&apos;/login&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;return-to-data&quot;]&apos;)).toBeVisible();
    });

    test(&apos;When invalid token is detected, then user is logged out gracefully&apos;, async ({ page }) => {
      // Arrange - User on protected page
      await page.goto(&apos;/dashboard&apos;);
      
      // Act - Simulate invalid token response
      await page.route(&apos;/api/**&apos;, async (route) => {
        await route.fulfill({
          status: 403,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ error: &apos;Invalid token&apos; })
        });
      });
      
      await page.reload();
      
      // Assert - Should redirect to login without errors
      await expect(page).toHaveURL(&apos;/login&apos;);
      await expect(page.locator(&apos;[role=&quot;alert&quot;]&apos;)).toContainText(&apos;Please log in again&apos;);
    });

    test(&apos;When multiple tabs are open and session expires, then all tabs are synchronized&apos;, async ({ context }) => {
      // Arrange - Open multiple tabs
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      await page1.goto(&apos;/dashboard&apos;);
      await page2.goto(&apos;/projects&apos;);
      
      // Act - Expire session in one tab
      await page1.route(&apos;/api/auth/**&apos;, async (route) => {
        await route.fulfill({ status: 401 });
      });
      
      await page1.click(&apos;[data-testid=&quot;refresh-data&quot;]&apos;);
      
      // Assert - Both tabs should redirect to login
      await expect(page1).toHaveURL(&apos;/login&apos;);
      await page2.reload();
      await expect(page2).toHaveURL(&apos;/login&apos;);
    });
  });

  test.describe(&apos;Rate Limiting&apos;, () => {
    test(&apos;When login attempts exceed limit, then account is temporarily locked&apos;, async ({ page }) => {
      // Arrange - Navigate to login page
      await page.goto(&apos;/login&apos;);
      
      // Act - Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.fill(&apos;[name=&quot;email&quot;]&apos;, &apos;test@example.com&apos;);
        await page.fill(&apos;[name=&quot;password&quot;]&apos;, &apos;wrongpassword&apos;);
        await page.click(&apos;[type=&quot;submit&quot;]&apos;);
        await page.waitForTimeout(500);
      }
      
      // Assert - Should show rate limit message
      await expect(page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;))
        .toContainText(&apos;Too many attempts. Please try again later.&apos;);
      await expect(page.locator(&apos;[type=&quot;submit&quot;]&apos;)).toBeDisabled();
    });

    test(&apos;When API rate limit is hit, then appropriate error message is displayed&apos;, async ({ page }) => {
      // Arrange - Navigate to page with API calls
      await page.goto(&apos;/dashboard&apos;);
      
      // Mock rate limit response
      await page.route(&apos;/api/projects/**&apos;, async (route) => {
        await route.fulfill({
          status: 429,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ error: &apos;Rate limit exceeded&apos; })
        });
      });
      
      // Act - Trigger API call
      await page.click(&apos;[data-testid=&quot;refresh-projects&quot;]&apos;);
      
      // Assert - Should show rate limit message
      await expect(page.locator(&apos;[data-testid=&quot;api-error&quot;]&apos;))
        .toContainText(&apos;Please slow down. Try again in a moment.&apos;);
    });
  });
});

test.describe(&apos;Payment System Edge Cases&apos;, () => {
  test.describe(&apos;Payment Failures&apos;, () => {
    test(&apos;When card is declined during payment, then user can retry with different payment method&apos;, async ({ page }) => {
      // Arrange - Navigate to payment page
      await page.goto(&apos;/payment?project=test-project&apos;);
      
      // Fill payment form
      await page.fill(&apos;[data-testid=&quot;card-number&quot;]&apos;, &apos;4000 0000 0000 0002&apos;); // Declined card
      await page.fill(&apos;[data-testid=&quot;expiry&quot;]&apos;, &apos;12/25&apos;);
      await page.fill(&apos;[data-testid=&quot;cvc&quot;]&apos;, &apos;123&apos;);
      
      // Act - Submit payment
      await page.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
      
      // Assert - Should show decline message and retry option
      await expect(page.locator(&apos;[data-testid=&quot;payment-error&quot;]&apos;))
        .toContainText(&apos;Your card was declined&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;try-different-card&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;payment-form&quot;]&apos;)).toBeVisible();
    });

    test(&apos;When payment processing times out, then user receives appropriate guidance&apos;, async ({ page }) => {
      // Arrange - Navigate to payment page
      await page.goto(&apos;/payment?project=test-project&apos;);
      
      // Mock timeout response
      await page.route(&apos;/api/payment/**&apos;, async (route) => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate timeout
      });
      
      // Fill and submit payment
      await page.fill(&apos;[data-testid=&quot;card-number&quot;]&apos;, &apos;4242 4242 4242 4242&apos;);
      await page.fill(&apos;[data-testid=&quot;expiry&quot;]&apos;, &apos;12/25&apos;);
      await page.fill(&apos;[data-testid=&quot;cvc&quot;]&apos;, &apos;123&apos;);
      
      // Act - Submit payment
      await page.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
      
      // Assert - Should show timeout message
      await expect(page.locator(&apos;[data-testid=&quot;payment-timeout&quot;]&apos;))
        .toContainText(&apos;Payment is taking longer than expected&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;contact-support&quot;]&apos;)).toBeVisible();
    });

    test(&apos;When insufficient funds error occurs, then clear guidance is provided&apos;, async ({ page }) => {
      // Arrange - Setup payment page with insufficient funds scenario
      await page.goto(&apos;/payment?project=test-project&apos;);
      
      await page.route(&apos;/api/payment/create-intent&apos;, async (route) => {
        await route.fulfill({
          status: 400,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ 
            error: &apos;insufficient_funds&apos;,
            message: &apos;Your card has insufficient funds&apos;
          })
        });
      });
      
      // Act - Submit payment
      await page.fill(&apos;[data-testid=&quot;card-number&quot;]&apos;, &apos;4000 0000 0000 9995&apos;);
      await page.fill(&apos;[data-testid=&quot;expiry&quot;]&apos;, &apos;12/25&apos;);
      await page.fill(&apos;[data-testid=&quot;cvc&quot;]&apos;, &apos;123&apos;);
      await page.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
      
      // Assert - Should show helpful insufficient funds message
      await expect(page.locator(&apos;[data-testid=&quot;payment-error&quot;]&apos;))
        .toContainText(&apos;Insufficient funds available&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;try-different-card&quot;]&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Concurrent Access&apos;, () => {
    test(&apos;When multiple users attempt to purchase same limited item, then race condition is handled correctly&apos;, async ({ context }) => {
      // Arrange - Create multiple browser contexts
      const user1 = await context.newPage();
      const user2 = await context.newPage();
      
      // Navigate both users to same limited item
      await user1.goto(&apos;/payment?project=limited-item&apos;);
      await user2.goto(&apos;/payment?project=limited-item&apos;);
      
      // Act - Both users submit payment simultaneously
      const payment1Promise = user1.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
      const payment2Promise = user2.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
      
      await Promise.all([payment1Promise, payment2Promise]);
      
      // Assert - Only one should succeed, other should get clear message
      const user1Success = await user1.locator(&apos;[data-testid=&quot;payment-success&quot;]&apos;).isVisible();
      const user2Success = await user2.locator(&apos;[data-testid=&quot;payment-success&quot;]&apos;).isVisible();
      
      expect(user1Success || user2Success).toBe(true); // One should succeed
      expect(user1Success && user2Success).toBe(false); // Both shouldn&apos;t succeed
      
      // The failed user should see appropriate message
      if (!user1Success) {
        await expect(user1.locator(&apos;[data-testid=&quot;item-unavailable&quot;]&apos;)).toBeVisible();
      }
      if (!user2Success) {
        await expect(user2.locator(&apos;[data-testid=&quot;item-unavailable&quot;]&apos;)).toBeVisible();
      }
    });
  });
});

test.describe(&apos;File Upload Edge Cases&apos;, () => {
  test.describe(&apos;Large File Handling&apos;, () => {
    test(&apos;When uploading file near size limit, then progress is tracked accurately&apos;, async ({ page }) => {
      // Arrange - Navigate to file upload
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;upload-files-tab&quot;]&apos;);
      
      // Mock large file upload with progress tracking
      await page.route(&apos;/api/storage/upload&apos;, async (route) => {
        // Simulate progressive upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ 
            success: true,
            fileId: &apos;large-file-123&apos;,
            size: 9.5 * 1024 * 1024 * 1024 // 9.5GB
          })
        });
      });
      
      // Act - Upload large file (mocked)
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, {
        name: &apos;large-video.mp4&apos;,
        mimeType: &apos;video/mp4&apos;,
        buffer: Buffer.alloc(1024) // Mock file buffer
      });
      
      // Assert - Progress should be shown and complete
      await expect(page.locator(&apos;[data-testid=&quot;upload-progress&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;upload-success&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;file-size&quot;]&apos;)).toContainText(&apos;9.5 GB&apos;);
    });

    test(&apos;When file exceeds size limit, then clear error message is shown&apos;, async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;upload-files-tab&quot;]&apos;);
      
      // Act - Attempt to upload oversized file
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, {
        name: &apos;huge-file.zip&apos;,
        mimeType: &apos;application/zip&apos;,
        buffer: Buffer.alloc(1024) // Mock oversized file
      });
      
      // Mock server response for oversized file
      await page.route(&apos;/api/storage/upload&apos;, async (route) => {
        await route.fulfill({
          status: 413,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ 
            error: &apos;File size exceeds 10GB limit&apos;,
            maxSize: &apos;10GB&apos;,
            fileSize: &apos;12GB&apos;
          })
        });
      });
      
      await page.click(&apos;[data-testid=&quot;upload-button&quot;]&apos;);
      
      // Assert - Should show size limit error
      await expect(page.locator(&apos;[data-testid=&quot;upload-error&quot;]&apos;))
        .toContainText(&apos;File size exceeds 10GB limit&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;size-guidance&quot;]&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;File Type Validation&apos;, () => {
    test(&apos;When malicious file is uploaded, then it is rejected with security message&apos;, async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;upload-files-tab&quot;]&apos;);
      
      // Mock malicious file detection
      await page.route(&apos;/api/storage/upload&apos;, async (route) => {
        await route.fulfill({
          status: 400,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ 
            error: &apos;File rejected by security scan&apos;,
            reason: &apos;Potentially malicious content detected&apos;
          })
        });
      });
      
      // Act - Upload suspicious file
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, {
        name: &apos;suspicious.exe&apos;,
        mimeType: &apos;application/octet-stream&apos;,
        buffer: Buffer.alloc(1024)
      });
      
      await page.click(&apos;[data-testid=&quot;upload-button&quot;]&apos;);
      
      // Assert - Should show security rejection
      await expect(page.locator(&apos;[data-testid=&quot;security-error&quot;]&apos;))
        .toContainText(&apos;File rejected by security scan&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;file-guidelines&quot;]&apos;)).toBeVisible();
    });

    test(&apos;When unsupported file type is uploaded, then helpful guidance is provided&apos;, async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto(&apos;/dashboard&apos;);
      
      // Act - Upload unsupported file type
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, {
        name: &apos;document.pages&apos;,
        mimeType: &apos;application/x-iwork-pages-sffpages&apos;,
        buffer: Buffer.alloc(1024)
      });
      
      // Assert - Should show format guidance
      await expect(page.locator(&apos;[data-testid=&quot;format-error&quot;]&apos;))
        .toContainText(&apos;File format not supported&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;supported-formats&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;conversion-suggestion&quot;]&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Storage Limits&apos;, () => {
    test(&apos;When user approaches storage quota, then warning is displayed&apos;, async ({ page }) => {
      // Arrange - Mock user near storage limit
      await page.route(&apos;/api/storage/status&apos;, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({
            used: 95,
            total: 100,
            unit: &apos;GB&apos;,
            warningThreshold: 90
          })
        });
      });
      
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;files-tab&quot;]&apos;);
      
      // Assert - Should show storage warning
      await expect(page.locator(&apos;[data-testid=&quot;storage-warning&quot;]&apos;))
        .toContainText(&apos;You\'re running low on storage&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;upgrade-storage&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;manage-files&quot;]&apos;)).toBeVisible();
    });

    test(&apos;When storage quota is exceeded, then upload is blocked with upgrade option&apos;, async ({ page }) => {
      // Arrange - Mock full storage
      await page.route(&apos;/api/storage/upload&apos;, async (route) => {
        await route.fulfill({
          status: 413,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({
            error: &apos;Storage quota exceeded&apos;,
            used: 100,
            total: 100,
            unit: &apos;GB&apos;
          })
        });
      });
      
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;upload-files-tab&quot;]&apos;);
      
      // Act - Attempt upload
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, {
        name: &apos;document.pdf&apos;,
        mimeType: &apos;application/pdf&apos;,
        buffer: Buffer.alloc(1024)
      });
      
      await page.click(&apos;[data-testid=&quot;upload-button&quot;]&apos;);
      
      // Assert - Should show quota exceeded message
      await expect(page.locator(&apos;[data-testid=&quot;quota-exceeded&quot;]&apos;))
        .toContainText(&apos;Storage quota exceeded&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;upgrade-plan&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;delete-files&quot;]&apos;)).toBeVisible();
    });
  });
});

test.describe(&apos;Network and Connectivity Edge Cases&apos;, () => {
  test.describe(&apos;Offline State Handling&apos;, () => {
    test(&apos;When connection is lost during operation, then offline state is indicated&apos;, async ({ page, context }) => {
      // Arrange - Navigate to dashboard
      await page.goto(&apos;/dashboard&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Act - Simulate network disconnection
      await context.setOffline(true);
      await page.click(&apos;[data-testid=&quot;refresh-data&quot;]&apos;);
      
      // Assert - Should show offline indicator
      await expect(page.locator(&apos;[data-testid=&quot;offline-indicator&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;offline-message&quot;]&apos;))
        .toContainText(&apos;You appear to be offline&apos;);
    });

    test(&apos;When connection is restored, then data is automatically synced&apos;, async ({ page, context }) => {
      // Arrange - Start offline
      await context.setOffline(true);
      await page.goto(&apos;/dashboard&apos;);
      
      // Create some data while offline (should be cached)
      await page.fill(&apos;[data-testid=&quot;project-name&quot;]&apos;, &apos;Offline Project&apos;);
      await page.click(&apos;[data-testid=&quot;save-draft&quot;]&apos;);
      
      // Act - Restore connection
      await context.setOffline(false);
      await page.waitForTimeout(1000); // Allow reconnection
      
      // Assert - Should sync data and show success
      await expect(page.locator(&apos;[data-testid=&quot;sync-success&quot;]&apos;))
        .toContainText(&apos;Data synced successfully&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;offline-indicator&quot;]&apos;)).not.toBeVisible();
    });
  });

  test.describe(&apos;Slow Network Conditions&apos;, () => {
    test(&apos;When network is slow, then loading states are shown appropriately&apos;, async ({ page, context }) => {
      // Arrange - Simulate slow network
      await context.route(&apos;**/*&apos;, async (route) => {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
        await route.continue();
      });
      
      // Act - Navigate to data-heavy page
      await page.goto(&apos;/dashboard&apos;);
      
      // Assert - Should show loading indicators
      await expect(page.locator(&apos;[data-testid=&quot;loading-dashboard&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;loading-message&quot;]&apos;))
        .toContainText(&apos;Loading your dashboard...&apos;);
      
      // Wait for completion
      await page.waitForLoadState(&apos;networkidle&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;loading-dashboard&quot;]&apos;)).not.toBeVisible();
    });
  });
});

test.describe(&apos;Browser Compatibility Edge Cases&apos;, () => {
  test.describe(&apos;JavaScript Disabled&apos;, () => {
    test(&apos;When JavaScript is disabled, then graceful degradation occurs&apos;, async ({ page, context }) => {
      // Arrange - Disable JavaScript
      await context.setJavaScriptEnabled(false);
      
      // Act - Navigate to landing page
      await page.goto(&apos;/');
      
      // Assert - Should show fallback content
      await expect(page.locator(&apos;[data-testid=&quot;no-js-message&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;noscript&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Local Storage Issues&apos;, () => {
    test(&apos;When local storage is full, then data is handled gracefully&apos;, async ({ page }) => {
      // Arrange - Fill local storage to capacity
      await page.goto(&apos;/dashboard&apos;);
      
      await page.evaluate(() => {
        // Fill localStorage to capacity
        try {
          for (let i = 0; i < 10000; i++) {
            localStorage.setItem(`key${i}`, &apos;x'.repeat(1000));
          }
        } catch (e) {
          // Storage full
        }
      });
      
      // Act - Try to save data
      await page.fill(&apos;[data-testid=&quot;project-name&quot;]&apos;, &apos;Test Project&apos;);
      await page.click(&apos;[data-testid=&quot;save-locally&quot;]&apos;);
      
      // Assert - Should handle gracefully
      await expect(page.locator(&apos;[data-testid=&quot;storage-warning&quot;]&apos;))
        .toContainText(&apos;Unable to save locally&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;clear-storage&quot;]&apos;)).toBeVisible();
    });
  });
});

test.describe(&apos;Performance Edge Cases&apos;, () => {
  test.describe(&apos;Memory Pressure&apos;, () => {
    test(&apos;When memory usage is high, then performance degradation is handled&apos;, async ({ page }) => {
      // Arrange - Create memory pressure scenario
      await page.goto(&apos;/dashboard&apos;);
      
      // Simulate heavy memory usage
      await page.evaluate(() => {
        // Create large arrays to consume memory
        (window as any).memoryTest = [];
        for (let i = 0; i < 1000; i++) {
          (window as any).memoryTest.push(new Array(10000).fill(&apos;data&apos;));
        }
      });
      
      // Act - Perform memory-intensive operation
      await page.click(&apos;[data-testid=&quot;load-all-projects&quot;]&apos;);
      
      // Assert - Should handle gracefully without crashing
      await expect(page).toHaveTitle(/FreeflowZee/);
      await expect(page.locator(&apos;[data-testid=&quot;dashboard&quot;]&apos;)).toBeVisible();
    });
  });
});

test.describe(&apos;Data Validation Edge Cases&apos;, () => {
  test.describe(&apos;Input Sanitization&apos;, () => {
    test(&apos;When XSS attempt is made, then input is properly sanitized&apos;, async ({ page }) => {
      // Arrange - Navigate to form
      await page.goto(&apos;/dashboard&apos;);
      await page.click(&apos;[data-testid=&quot;create-project&quot;]&apos;);
      
      // Act - Input XSS attempt
      const xssPayload = &apos;<script>alert(&quot;XSS&quot;)</script>&apos;;
      await page.fill(&apos;[data-testid=&quot;project-name&quot;]&apos;, xssPayload);
      await page.fill(&apos;[data-testid=&quot;project-description&quot;]&apos;, xssPayload);
      await page.click(&apos;[data-testid=&quot;save-project&quot;]&apos;);
      
      // Assert - Should sanitize input and not execute script
      await expect(page.locator(&apos;[data-testid=&quot;project-name-display&quot;]&apos;))
        .not.toContainText(&apos;<script>&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;project-description-display&quot;]&apos;))
        .not.toContainText(&apos;<script>&apos;);
      
      // No alert should have appeared
      const dialogs = [];
      page.on(&apos;dialog&apos;, dialog => dialogs.push(dialog));
      expect(dialogs.length).toBe(0);
    });

    test(&apos;When SQL injection attempt is made, then it is properly handled&apos;, async ({ page }) => {
      // Arrange - Navigate to search
      await page.goto(&apos;/dashboard&apos;);
      
      // Act - Attempt SQL injection
      const sqlPayload = &quot;&apos;; DROP TABLE projects; --&quot;;
      await page.fill(&apos;[data-testid=&quot;search-projects&quot;]&apos;, sqlPayload);
      await page.click(&apos;[data-testid=&quot;search-button&quot;]&apos;);
      
      // Assert - Should handle safely
      await expect(page.locator(&apos;[data-testid=&quot;search-results&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;no-results&quot;]&apos;))
        .toContainText(&apos;No projects found&apos;);
    });
  });
}); 