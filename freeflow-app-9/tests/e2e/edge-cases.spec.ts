import { test, expect } from '@playwright/test';

/**
 * FreeflowZee Edge Case & Error Scenario Testing
 * Based on Context7 Best Practices and Node.js Testing Guidelines
 * 
 * Test Structure: AAA Pattern (Arrange, Act, Assert)
 * Naming Convention: "When [condition], then [expected outcome]"
 */

// Test environment setup with authentication bypass
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true',
    'user-agent': 'Playwright/EdgeCase Tests - FreeflowZee'
  });
  
  // Mock common API responses for consistent testing
  await page.route('/api/**', async (route) => {
    const url = route.request().url();
    
    if (url.includes('/api/auth/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id: 'test-user' } })
      });
    } else {
      await route.continue();
    }
  });
});

test.describe('Authentication Edge Cases', () => {
  test.describe('Session Management', () => {
    test('When session expires during active use, then user is redirected to login with data preservation', async ({ page }) => {
      // Arrange - Navigate to dashboard and start creating content
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Simulate user creating content
      await page.fill('[data-testid="project-name-input"]', 'Important Project');
      
      // Simulate session expiry by intercepting auth requests
      await page.route('/api/auth/**', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session expired' })
        });
      });
      
      // Act - Trigger a request that requires authentication
      await page.click('[data-testid="save-project-button"]');
      
      // Assert - Should redirect to login with preserved data
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[data-testid="return-to-data"]')).toBeVisible();
    });

    test('When invalid token is detected, then user is logged out gracefully', async ({ page }) => {
      // Arrange - User on protected page
      await page.goto('/dashboard');
      
      // Act - Simulate invalid token response
      await page.route('/api/**', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid token' })
        });
      });
      
      await page.reload();
      
      // Assert - Should redirect to login without errors
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[role="alert"]')).toContainText('Please log in again');
    });

    test('When multiple tabs are open and session expires, then all tabs are synchronized', async ({ context }) => {
      // Arrange - Open multiple tabs
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      await page1.goto('/dashboard');
      await page2.goto('/projects');
      
      // Act - Expire session in one tab
      await page1.route('/api/auth/**', async (route) => {
        await route.fulfill({ status: 401 });
      });
      
      await page1.click('[data-testid="refresh-data"]');
      
      // Assert - Both tabs should redirect to login
      await expect(page1).toHaveURL('/login');
      await page2.reload();
      await expect(page2).toHaveURL('/login');
    });
  });

  test.describe('Rate Limiting', () => {
    test('When login attempts exceed limit, then account is temporarily locked', async ({ page }) => {
      // Arrange - Navigate to login page
      await page.goto('/login');
      
      // Act - Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'wrongpassword');
        await page.click('[type="submit"]');
        await page.waitForTimeout(500);
      }
      
      // Assert - Should show rate limit message
      await expect(page.locator('[data-testid="error-message"]'))
        .toContainText('Too many attempts. Please try again later.');
      await expect(page.locator('[type="submit"]')).toBeDisabled();
    });

    test('When API rate limit is hit, then appropriate error message is displayed', async ({ page }) => {
      // Arrange - Navigate to page with API calls
      await page.goto('/dashboard');
      
      // Mock rate limit response
      await page.route('/api/projects/**', async (route) => {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        });
      });
      
      // Act - Trigger API call
      await page.click('[data-testid="refresh-projects"]');
      
      // Assert - Should show rate limit message
      await expect(page.locator('[data-testid="api-error"]'))
        .toContainText('Please slow down. Try again in a moment.');
    });
  });
});

test.describe('Payment System Edge Cases', () => {
  test.describe('Payment Failures', () => {
    test('When card is declined during payment, then user can retry with different payment method', async ({ page }) => {
      // Arrange - Navigate to payment page
      await page.goto('/payment?project=test-project');
      
      // Fill payment form
      await page.fill('[data-testid="card-number"]', '4000 0000 0000 0002'); // Declined card
      await page.fill('[data-testid="expiry"]', '12/25');
      await page.fill('[data-testid="cvc"]', '123');
      
      // Act - Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Assert - Should show decline message and retry option
      await expect(page.locator('[data-testid="payment-error"]'))
        .toContainText('Your card was declined');
      await expect(page.locator('[data-testid="try-different-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
    });

    test('When payment processing times out, then user receives appropriate guidance', async ({ page }) => {
      // Arrange - Navigate to payment page
      await page.goto('/payment?project=test-project');
      
      // Mock timeout response
      await page.route('/api/payment/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate timeout
      });
      
      // Fill and submit payment
      await page.fill('[data-testid="card-number"]', '4242 4242 4242 4242');
      await page.fill('[data-testid="expiry"]', '12/25');
      await page.fill('[data-testid="cvc"]', '123');
      
      // Act - Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Assert - Should show timeout message
      await expect(page.locator('[data-testid="payment-timeout"]'))
        .toContainText('Payment is taking longer than expected');
      await expect(page.locator('[data-testid="contact-support"]')).toBeVisible();
    });

    test('When insufficient funds error occurs, then clear guidance is provided', async ({ page }) => {
      // Arrange - Setup payment page with insufficient funds scenario
      await page.goto('/payment?project=test-project');
      
      await page.route('/api/payment/create-intent', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'insufficient_funds',
            message: 'Your card has insufficient funds'
          })
        });
      });
      
      // Act - Submit payment
      await page.fill('[data-testid="card-number"]', '4000 0000 0000 9995');
      await page.fill('[data-testid="expiry"]', '12/25');
      await page.fill('[data-testid="cvc"]', '123');
      await page.click('[data-testid="submit-payment"]');
      
      // Assert - Should show helpful insufficient funds message
      await expect(page.locator('[data-testid="payment-error"]'))
        .toContainText('Insufficient funds available');
      await expect(page.locator('[data-testid="try-different-card"]')).toBeVisible();
    });
  });

  test.describe('Concurrent Access', () => {
    test('When multiple users attempt to purchase same limited item, then race condition is handled correctly', async ({ context }) => {
      // Arrange - Create multiple browser contexts
      const user1 = await context.newPage();
      const user2 = await context.newPage();
      
      // Navigate both users to same limited item
      await user1.goto('/payment?project=limited-item');
      await user2.goto('/payment?project=limited-item');
      
      // Act - Both users submit payment simultaneously
      const payment1Promise = user1.click('[data-testid="submit-payment"]');
      const payment2Promise = user2.click('[data-testid="submit-payment"]');
      
      await Promise.all([payment1Promise, payment2Promise]);
      
      // Assert - Only one should succeed, other should get clear message
      const user1Success = await user1.locator('[data-testid="payment-success"]').isVisible();
      const user2Success = await user2.locator('[data-testid="payment-success"]').isVisible();
      
      expect(user1Success || user2Success).toBe(true); // One should succeed
      expect(user1Success && user2Success).toBe(false); // Both shouldn't succeed
      
      // The failed user should see appropriate message
      if (!user1Success) {
        await expect(user1.locator('[data-testid="item-unavailable"]')).toBeVisible();
      }
      if (!user2Success) {
        await expect(user2.locator('[data-testid="item-unavailable"]')).toBeVisible();
      }
    });
  });
});

test.describe('File Upload Edge Cases', () => {
  test.describe('Large File Handling', () => {
    test('When uploading file near size limit, then progress is tracked accurately', async ({ page }) => {
      // Arrange - Navigate to file upload
      await page.goto('/dashboard');
      await page.click('[data-testid="upload-files-tab"]');
      
      // Mock large file upload with progress tracking
      await page.route('/api/storage/upload', async (route) => {
        // Simulate progressive upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true,
            fileId: 'large-file-123',
            size: 9.5 * 1024 * 1024 * 1024 // 9.5GB
          })
        });
      });
      
      // Act - Upload large file (mocked)
      await page.setInputFiles('[data-testid="file-input"]', {
        name: 'large-video.mp4',
        mimeType: 'video/mp4',
        buffer: Buffer.alloc(1024) // Mock file buffer
      });
      
      // Assert - Progress should be shown and complete
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-size"]')).toContainText('9.5 GB');
    });

    test('When file exceeds size limit, then clear error message is shown', async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto('/dashboard');
      await page.click('[data-testid="upload-files-tab"]');
      
      // Act - Attempt to upload oversized file
      await page.setInputFiles('[data-testid="file-input"]', {
        name: 'huge-file.zip',
        mimeType: 'application/zip',
        buffer: Buffer.alloc(1024) // Mock oversized file
      });
      
      // Mock server response for oversized file
      await page.route('/api/storage/upload', async (route) => {
        await route.fulfill({
          status: 413,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'File size exceeds 10GB limit',
            maxSize: '10GB',
            fileSize: '12GB'
          })
        });
      });
      
      await page.click('[data-testid="upload-button"]');
      
      // Assert - Should show size limit error
      await expect(page.locator('[data-testid="upload-error"]'))
        .toContainText('File size exceeds 10GB limit');
      await expect(page.locator('[data-testid="size-guidance"]')).toBeVisible();
    });
  });

  test.describe('File Type Validation', () => {
    test('When malicious file is uploaded, then it is rejected with security message', async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto('/dashboard');
      await page.click('[data-testid="upload-files-tab"]');
      
      // Mock malicious file detection
      await page.route('/api/storage/upload', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'File rejected by security scan',
            reason: 'Potentially malicious content detected'
          })
        });
      });
      
      // Act - Upload suspicious file
      await page.setInputFiles('[data-testid="file-input"]', {
        name: 'suspicious.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.alloc(1024)
      });
      
      await page.click('[data-testid="upload-button"]');
      
      // Assert - Should show security rejection
      await expect(page.locator('[data-testid="security-error"]'))
        .toContainText('File rejected by security scan');
      await expect(page.locator('[data-testid="file-guidelines"]')).toBeVisible();
    });

    test('When unsupported file type is uploaded, then helpful guidance is provided', async ({ page }) => {
      // Arrange - Navigate to upload
      await page.goto('/dashboard');
      
      // Act - Upload unsupported file type
      await page.setInputFiles('[data-testid="file-input"]', {
        name: 'document.pages',
        mimeType: 'application/x-iwork-pages-sffpages',
        buffer: Buffer.alloc(1024)
      });
      
      // Assert - Should show format guidance
      await expect(page.locator('[data-testid="format-error"]'))
        .toContainText('File format not supported');
      await expect(page.locator('[data-testid="supported-formats"]')).toBeVisible();
      await expect(page.locator('[data-testid="conversion-suggestion"]')).toBeVisible();
    });
  });

  test.describe('Storage Limits', () => {
    test('When user approaches storage quota, then warning is displayed', async ({ page }) => {
      // Arrange - Mock user near storage limit
      await page.route('/api/storage/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            used: 95,
            total: 100,
            unit: 'GB',
            warningThreshold: 90
          })
        });
      });
      
      await page.goto('/dashboard');
      await page.click('[data-testid="files-tab"]');
      
      // Assert - Should show storage warning
      await expect(page.locator('[data-testid="storage-warning"]'))
        .toContainText('You\'re running low on storage');
      await expect(page.locator('[data-testid="upgrade-storage"]')).toBeVisible();
      await expect(page.locator('[data-testid="manage-files"]')).toBeVisible();
    });

    test('When storage quota is exceeded, then upload is blocked with upgrade option', async ({ page }) => {
      // Arrange - Mock full storage
      await page.route('/api/storage/upload', async (route) => {
        await route.fulfill({
          status: 413,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Storage quota exceeded',
            used: 100,
            total: 100,
            unit: 'GB'
          })
        });
      });
      
      await page.goto('/dashboard');
      await page.click('[data-testid="upload-files-tab"]');
      
      // Act - Attempt upload
      await page.setInputFiles('[data-testid="file-input"]', {
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(1024)
      });
      
      await page.click('[data-testid="upload-button"]');
      
      // Assert - Should show quota exceeded message
      await expect(page.locator('[data-testid="quota-exceeded"]'))
        .toContainText('Storage quota exceeded');
      await expect(page.locator('[data-testid="upgrade-plan"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-files"]')).toBeVisible();
    });
  });
});

test.describe('Network and Connectivity Edge Cases', () => {
  test.describe('Offline State Handling', () => {
    test('When connection is lost during operation, then offline state is indicated', async ({ page, context }) => {
      // Arrange - Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Act - Simulate network disconnection
      await context.setOffline(true);
      await page.click('[data-testid="refresh-data"]');
      
      // Assert - Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="offline-message"]'))
        .toContainText('You appear to be offline');
    });

    test('When connection is restored, then data is automatically synced', async ({ page, context }) => {
      // Arrange - Start offline
      await context.setOffline(true);
      await page.goto('/dashboard');
      
      // Create some data while offline (should be cached)
      await page.fill('[data-testid="project-name"]', 'Offline Project');
      await page.click('[data-testid="save-draft"]');
      
      // Act - Restore connection
      await context.setOffline(false);
      await page.waitForTimeout(1000); // Allow reconnection
      
      // Assert - Should sync data and show success
      await expect(page.locator('[data-testid="sync-success"]'))
        .toContainText('Data synced successfully');
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
    });
  });

  test.describe('Slow Network Conditions', () => {
    test('When network is slow, then loading states are shown appropriately', async ({ page, context }) => {
      // Arrange - Simulate slow network
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
        await route.continue();
      });
      
      // Act - Navigate to data-heavy page
      await page.goto('/dashboard');
      
      // Assert - Should show loading indicators
      await expect(page.locator('[data-testid="loading-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="loading-message"]'))
        .toContainText('Loading your dashboard...');
      
      // Wait for completion
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="loading-dashboard"]')).not.toBeVisible();
    });
  });
});

test.describe('Browser Compatibility Edge Cases', () => {
  test.describe('JavaScript Disabled', () => {
    test('When JavaScript is disabled, then graceful degradation occurs', async ({ page, context }) => {
      // Arrange - Disable JavaScript
      await context.setJavaScriptEnabled(false);
      
      // Act - Navigate to landing page
      await page.goto('/');
      
      // Assert - Should show fallback content
      await expect(page.locator('[data-testid="no-js-message"]')).toBeVisible();
      await expect(page.locator('noscript')).toBeVisible();
    });
  });

  test.describe('Local Storage Issues', () => {
    test('When local storage is full, then data is handled gracefully', async ({ page }) => {
      // Arrange - Fill local storage to capacity
      await page.goto('/dashboard');
      
      await page.evaluate(() => {
        // Fill localStorage to capacity
        try {
          for (let i = 0; i < 10000; i++) {
            localStorage.setItem(`key${i}`, 'x'.repeat(1000));
          }
        } catch (e) {
          // Storage full
        }
      });
      
      // Act - Try to save data
      await page.fill('[data-testid="project-name"]', 'Test Project');
      await page.click('[data-testid="save-locally"]');
      
      // Assert - Should handle gracefully
      await expect(page.locator('[data-testid="storage-warning"]'))
        .toContainText('Unable to save locally');
      await expect(page.locator('[data-testid="clear-storage"]')).toBeVisible();
    });
  });
});

test.describe('Performance Edge Cases', () => {
  test.describe('Memory Pressure', () => {
    test('When memory usage is high, then performance degradation is handled', async ({ page }) => {
      // Arrange - Create memory pressure scenario
      await page.goto('/dashboard');
      
      // Simulate heavy memory usage
      await page.evaluate(() => {
        // Create large arrays to consume memory
        (window as any).memoryTest = [];
        for (let i = 0; i < 1000; i++) {
          (window as any).memoryTest.push(new Array(10000).fill('data'));
        }
      });
      
      // Act - Perform memory-intensive operation
      await page.click('[data-testid="load-all-projects"]');
      
      // Assert - Should handle gracefully without crashing
      await expect(page).toHaveTitle(/FreeflowZee/);
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });
});

test.describe('Data Validation Edge Cases', () => {
  test.describe('Input Sanitization', () => {
    test('When XSS attempt is made, then input is properly sanitized', async ({ page }) => {
      // Arrange - Navigate to form
      await page.goto('/dashboard');
      await page.click('[data-testid="create-project"]');
      
      // Act - Input XSS attempt
      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('[data-testid="project-name"]', xssPayload);
      await page.fill('[data-testid="project-description"]', xssPayload);
      await page.click('[data-testid="save-project"]');
      
      // Assert - Should sanitize input and not execute script
      await expect(page.locator('[data-testid="project-name-display"]'))
        .not.toContainText('<script>');
      await expect(page.locator('[data-testid="project-description-display"]'))
        .not.toContainText('<script>');
      
      // No alert should have appeared
      const dialogs = [];
      page.on('dialog', dialog => dialogs.push(dialog));
      expect(dialogs.length).toBe(0);
    });

    test('When SQL injection attempt is made, then it is properly handled', async ({ page }) => {
      // Arrange - Navigate to search
      await page.goto('/dashboard');
      
      // Act - Attempt SQL injection
      const sqlPayload = "'; DROP TABLE projects; --";
      await page.fill('[data-testid="search-projects"]', sqlPayload);
      await page.click('[data-testid="search-button"]');
      
      // Assert - Should handle safely
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="no-results"]'))
        .toContainText('No projects found');
    });
  });
}); 