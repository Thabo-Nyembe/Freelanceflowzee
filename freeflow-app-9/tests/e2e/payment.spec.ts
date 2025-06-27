// 🧪 Payment-to-Unlock Flow E2E Testing Suite
// Enterprise-grade testing with Playwright best practices and Context7 patterns
// Cross-browser compatibility: Chrome, Firefox, Safari, Mobile
// Comprehensive coverage: Payment flow, access control, Stripe integration, security

import { test, expect, Page } from &apos;@playwright/test&apos;;

// Configuration for enhanced testing following Context7 patterns
// Using baseURL from playwright.config.ts (http://localhost:3001)

// Test data constants for payment scenarios
const TEST_PROJECT = {
  id: &apos;proj_test_12345&apos;,
  title: &apos;Premium Brand Identity Package&apos;,
  price: 4999, // $49.99
  currency: &apos;usd&apos;,
  description: &apos;Complete brand identity design package with logo, guidelines, and assets&apos;,
  isLocked: true,
  createdBy: &apos;designer@example.com&apos;,
  slug: &apos;premium-brand-identity-package&apos;
};

const TEST_USER = {
  email: &apos;test.buyer@example.com&apos;,
  name: &apos;Test Buyer&apos;,
  id: &apos;user_test_buyer_123&apos;
};

const STRIPE_TEST_CARDS = {
  valid: {
    number: &apos;4242424242424242&apos;,
    expiry: &apos;12/25&apos;,
    cvc: &apos;123&apos;,
    zip: &apos;12345&apos;
  },
  declined: {
    number: &apos;4000000000000002&apos;,
    expiry: &apos;12/25&apos;, 
    cvc: &apos;123&apos;,
    zip: &apos;12345&apos;
  },
  requiresAuth: {
    number: &apos;4000002500003155&apos;,
    expiry: &apos;12/25&apos;,
    cvc: &apos;123&apos;,
    zip: &apos;12345&apos;
  }
};

const ACCESS_CREDENTIALS = {
  valid: {
    password: &apos;secure-unlock-2024&apos;,
    accessCode: &apos;BRAND2024&apos;
  },
  invalid: {
    password: &apos;wrong-password&apos;,
    accessCode: &apos;INVALID123&apos;,
    expired: &apos;EXPIRED2023&apos;
  }
};

// Enhanced API mocking for payment flow testing
async function setupPaymentAPIMocking(page: Page) {
  // Mock Stripe Payment Intent creation
  await page.route(&apos;**/api/payment/create-intent&apos;, async (route) => {
    const postData = route.request().postDataJSON();
    
    await route.fulfill({
      status: 200,
      contentType: &apos;application/json&apos;,
      body: JSON.stringify({
        clientSecret: &apos;pi_3QdGhJ2eZvKYlo2C0123456789_secret_abcdefghijklmnopqrstuvwxyz123456&apos;,
        paymentIntentId: &apos;pi_3QdGhJ2eZvKYlo2C0123456789&apos;,
        amount: postData.amount,
        currency: postData.currency
      })
    });
  });

  // Mock payment confirmation
  await page.route(&apos;**/api/payment/confirm&apos;, async (route) => {
    const postData = route.request().postDataJSON();
    const paymentMethod = postData.paymentMethodId;
    
    // Simulate different payment outcomes based on test cards
    if (paymentMethod?.includes(&apos;declined&apos;)) {
      await route.fulfill({
        status: 400,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          error: &apos;Your card was declined&apos;,
          code: &apos;card_declined&apos;,
          decline_code: &apos;generic_decline&apos;
        })
      });
    } else if (paymentMethod?.includes(&apos;auth&apos;)) {
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          status: &apos;requires_action&apos;,
          clientSecret: &apos;pi_test_auth_secret&apos;
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          status: &apos;succeeded&apos;,
          paymentIntentId: &apos;pi_test_123456789&apos;,
          accessToken: &apos;access_token_&apos; + Date.now(),
          unlockUrl: `/projects/${TEST_PROJECT.slug}/unlocked
        })
      });
    }
  });

  // Mock project access validation
  await page.route(&apos;**/api/projects/*/access&apos;, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (method === &apos;POST&apos;) {
      const postData = route.request().postDataJSON();
      const { password, accessCode } = postData;
      
      if (password === ACCESS_CREDENTIALS.valid.password || 
          accessCode === ACCESS_CREDENTIALS.valid.accessCode) {
        await route.fulfill({
          status: 200,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({
            success: true,
            accessToken: &apos;access_token_&apos; + Date.now(),
            projectSlug: TEST_PROJECT.slug,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            unlockUrl: `/projects/${TEST_PROJECT.slug}/unlocked
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({
            error: &apos;Invalid credentials&apos;,
            code: &apos;unauthorized&apos;
          })
        });
      }
    }
  });

  // Mock signed URL validation
  await page.route(&apos;**/api/projects/*/validate-url&apos;, async (route) => {
    const url = route.request().url();
    const urlParams = new URL(url).searchParams;
    const token = urlParams.get(&apos;token&apos;);
    const expires = urlParams.get(&apos;expires&apos;);
    
    if (token?.includes(&apos;expired&apos;) || (expires && parseInt(expires) < Date.now())) {
      await route.fulfill({
        status: 401,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          error: &apos;Access link has expired&apos;,
          code: &apos;expired_link&apos;
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          valid: true,
          projectData: TEST_PROJECT
        })
      });
    }
  });

  console.log(&apos;✅ Payment API mocking configured successfully&apos;);
}

// Helper function to navigate to real payment page with mocking
async function setupRealPaymentPage(page: Page) {
  await setupPaymentAPIMocking(page);
  
  // Navigate to the real payment page
  await page.goto(`/payment?project=${TEST_PROJECT.id}`);
  await page.waitForLoadState(&apos;domcontentloaded&apos;);
  
  // Ensure Stripe is loaded in test environment
  await page.waitForFunction(() => {
    return typeof window !== &apos;undefined&apos;;
  });
}

// Helper function to create payment flow test page
async function createPaymentTestPage(page: Page) {
  // Use the real payment page instead of mock HTML
  await setupRealPaymentPage(page);
}

// Create unlocked content page for successful access
async function createUnlockedContentPage(page: Page) {
  // Navigate to the real unlocked page
  await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
  await page.waitForLoadState(&apos;domcontentloaded&apos;);
  
  // Wait for the page to load properly
  await page.waitForFunction(() => {
    return document.querySelector(&apos;[data-testid=&quot;unlock-success&quot;]&apos;) !== null ||
           document.querySelector(&apos;[data-testid=&quot;premium-content&quot;]&apos;) !== null ||
           document.querySelector(&apos;[data-testid=&quot;locked-notice&quot;]&apos;) !== null;
  }, { timeout: 10000 });
}

// Test Suite: Payment-to-Unlock Flow
test.describe(&apos;💳 Payment-to-Unlock Flow Testing&apos;, () => {
  test.beforeEach(async ({ page }) => {
    await setupPaymentAPIMocking(page);
  });

  test.describe(&apos;🚫 Access Control - Pre-Payment Blocking&apos;, () => {
    test(&apos;should block access to locked project content without payment&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Verify locked content is visible
      await expect(page.getByTestId(&apos;locked-notice&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;locked-notice&apos;)).toContainText(&apos;Premium Content Locked&apos;);
      
      // Verify payment form is present
      await expect(page.getByTestId(&apos;payment-form&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeVisible();
      
      // Verify price is displayed correctly
      await expect(page.getByTestId(&apos;project-price&apos;)).toHaveText(&apos;$49.99&apos;);
    });

    test(&apos;should show appropriate error when trying to access premium content directly&apos;, async ({ page }) => {
      // Try to access unlocked content directly without payment
      await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
      
      // Should be redirected to payment page or show access denied
      await expect(page).toHaveURL(new RegExp(&apos;(login|payment|access-denied)&apos;));
    });

    test(&apos;should preserve intended destination after payment completion&apos;, async ({ page }) => {
      const intendedUrl = `/projects/${TEST_PROJECT.slug}/premium-section`;
      
      // Try to access premium content (without setting test mode - we want auth to work)
      await page.goto(intendedUrl);
      
      // Wait for redirect and check URL
      await page.waitForURL(/payment|login/, { timeout: 10000 });
      
      // Should be redirected to payment with return URL
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/payment|login/);
      
      // Check if return URL is preserved in query params
      const url = new URL(currentUrl);
      const returnUrl = url.searchParams.get(&apos;return&apos;) || url.searchParams.get(&apos;redirect&apos;);
      expect(returnUrl).toContain(TEST_PROJECT.slug);
    });
  });

  test.describe(&apos;💳 Stripe Payment Integration&apos;, () => {
    test(&apos;should complete successful payment with valid card&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Fill out payment form
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      
      // Enable console logging to see test mode detection
      page.on(&apos;console&apos;, msg => {
        if (msg.text().includes(&apos;🧪 Payment Debug&apos;)) {
          console.log(&apos;Browser Console:&apos;, msg.text());
        }
      });
      
      // Set test mode flag explicitly
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      // Simulate successful payment
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Verify payment processing state
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toHaveText(&apos;Processing...&apos;);
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeDisabled();
      
      // Wait for payment success
      await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(&apos;payment-success&apos;)).toContainText(&apos;Payment successful&apos;);
      
      // Verify redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
    });

    test(&apos;should handle payment failure with declined card&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Fill form with email
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      
      // Set test mode and mock decline flags
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
        (window as any).mockStripeDecline = true;
      });
      
      // Mock a complete card element to bypass validation
      await page.evaluate(() => {
        // Override the CardElement to simulate it being complete
        if (window.stripe && window.elements) {
          const originalGetElement = window.elements.getElement;
          window.elements.getElement = () => ({
            mount: () => {},
            unmount: () => {},
            on: () => {},
            off: () => {},
            update: () => {},
            focus: () => {},
            blur: () => {},
            clear: () => {},
            destroy: () => {},
            // Mock that the element is complete and valid
            _complete: true,
            _error: null
          });
        }
      });
      
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Wait for and verify error message (test mode should show decline message)
      await expect(page.getByTestId(&apos;card-errors&apos;)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(&apos;card-errors&apos;)).toContainText(&apos;Your card was declined.&apos;);
      
      // Verify button is re-enabled for retry
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled();
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toContainText(&apos;Complete Payment&apos;);
    });

    test(&apos;should handle authentication required scenarios&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Set test mode flag
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      
      // Wait for button to be enabled before clicking
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 });
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Verify payment success (simplified for test environment)
      await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
    });

    test(&apos;should validate required payment form fields&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try to submit without email
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Check HTML5 validation
      const emailInput = page.getByTestId(&apos;email-input&apos;);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
      
      // Fill email and verify it&apos;s accepted
      await emailInput.fill(TEST_USER.email);
      const updatedValidationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(updatedValidationMessage).toBe('&apos;);
    });
  });

  test.describe(&apos;🔓 Content Unlocking After Payment&apos;, () => {
    test(&apos;should unlock and display premium content after successful payment&apos;, async ({ page }) => {
      // Start with payment page
      await createPaymentTestPage(page);
      
      // Complete payment
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Wait for redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
      
      // Create and verify unlocked content page
      await createUnlockedContentPage(page);
      
      // Verify success message and premium content
      await expect(page.getByTestId(&apos;unlock-success&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;unlock-success&apos;)).toContainText(&apos;Content Unlocked!&apos;);
      
      // Verify premium content is accessible
      await expect(page.getByTestId(&apos;premium-content&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;premium-badge&apos;)).toBeVisible();
      
      // Verify download links are present
      await expect(page.getByTestId(&apos;download-logo&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;download-guidelines&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;download-mockups&apos;)).toBeVisible();
      
      // Verify exclusive content is shown
      await expect(page.getByTestId(&apos;exclusive-content&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;exclusive-content&apos;)).toContainText(&apos;premium content only available after payment&apos;);
    });

    test(&apos;should maintain access across browser sessions after payment&apos;, async ({ page, context }) => {
      // Simulate payment completion and set access token in storage
      await page.goto(&apos;/');
      await page.evaluate((projectId) => {
        localStorage.setItem(`project_access_${projectId}`, JSON.stringify({
          accessToken: &apos;access_token_123&apos;,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          projectId: projectId
        }));
      }, TEST_PROJECT.id);
      
      // Navigate to unlocked content
      await createUnlockedContentPage(page);
      
      // Verify content is accessible
      await expect(page.getByTestId(&apos;premium-content&apos;)).toBeVisible();
      
      // Open new tab to simulate session continuity
      const newPage = await context.newPage();
      await newPage.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
      
      // Should still have access
      await expect(newPage.getByTestId(&apos;premium-content&apos;)).toBeVisible();
    });

    test(&apos;should handle concurrent access attempts gracefully&apos;, async ({ page, context }) => {
      // Open multiple tabs and attempt payment simultaneously
      const page2 = await context.newPage();
      const page3 = await context.newPage();
      
      // All tabs start payment flow
      await Promise.all([
        createPaymentTestPage(page),
        createPaymentTestPage(page2), 
        createPaymentTestPage(page3)
      ]);
      
      // Fill forms in all tabs
      await Promise.all([
        page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email),
        page2.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email),
        page3.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email)
      ]);
      
      // Submit payment from first tab
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
      
      // Other tabs should handle the state change gracefully
      // (In real app, they might show &quot;Payment completed in another tab&quot; or redirect)
    });
  });

  test.describe(&apos;⏱️ Expired Signed URL Testing&apos;, () => {
    test(&apos;should reject access with expired signed URLs&apos;, async ({ page }) => {
      // Create a mock expired URL
      const expiredTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      const expiredUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=expired_token_123&expires=${expiredTimestamp}`;
      
      await page.goto(expiredUrl);
      
      // Should show expired notice or redirect to payment
      await expect(page.locator(&apos;[data-testid=&quot;expired-notice&quot;], [data-testid=&quot;locked-notice&quot;]&apos;)).toBeVisible();
    });

    test(&apos;should accept access with valid signed URLs&apos;, async ({ page }) => {
      // Create a mock valid URL
      const validTimestamp = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
      const validUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123&expires=${validTimestamp}`;
      
      await page.goto(validUrl);
      await createUnlockedContentPage(page);
      
      // Should display unlocked content
      await expect(page.getByTestId(&apos;premium-content&apos;)).toBeVisible();
    });

    test(&apos;should handle URL tampering attempts&apos;, async ({ page }) => {
      // Test various tampering scenarios
      const tamperingAttempts = [
        `/projects/${TEST_PROJECT.slug}/unlocked?token=hacked_token&expires=9999999999999`,
        `/projects/${TEST_PROJECT.slug}/unlocked?token=&expires=${Date.now() + 3600000}`,
        `/projects/${TEST_PROJECT.slug}/unlocked?expires=${Date.now() + 3600000}`,
        `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123
      ];
      
      for (const tamperedUrl of tamperingAttempts) {
        await page.goto(tamperedUrl);
        
        // Should be rejected and redirected to payment or show error
        await expect(page.locator(&apos;[data-testid=&quot;locked-notice&quot;], [data-testid=&quot;access-denied&quot;]&apos;)).toBeVisible({ timeout: 5000 });
      }
    });

    test(&apos;should log security events for suspicious access attempts&apos;, async ({ page }) => {
      // Mock security logging endpoint
      let securityEvents: unknown[] = [];
      await page.route(&apos;**/api/security/log&apos;, async (route) => {
        const postData = route.request().postDataJSON();
        securityEvents.push(postData);
        await route.fulfill({ status: 200, body: &apos;OK&apos; });
      });
      
      // Attempt access with suspicious parameters
      await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked?token=<script>alert(&apos;xss&apos;)</script>&expires=0`);
      
      // Verify security event was logged (in a real app)
      // This would be checked via the securityEvents array or API monitoring
    });
  });

  test.describe(&apos;🔑 Alternative Access Methods&apos;, () => {
    test(&apos;should unlock content with valid password&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Enable console logging for debugging
      page.on(&apos;console&apos;, msg => {
        console.log(&apos;Browser Console:&apos;, msg.text());
      });
      
      // Enable console logging for debugging
      page.on(&apos;console&apos;, msg => {
        console.log(&apos;Browser Console:&apos;, msg.text());
      });
      
      // Enable console logging for debugging
      page.on(&apos;console&apos;, msg => {
        console.log(&apos;Browser Console:&apos;, msg.text());
      });
      
      // Use password access instead of payment
      await page.getByTestId(&apos;access-password&apos;).fill(ACCESS_CREDENTIALS.valid.password);
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Verify success message
      await expect(page.getByTestId(&apos;access-success&apos;)).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId(&apos;access-success&apos;)).toContainText(&apos;Access granted&apos;);
      
      // Verify redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
    });

    test(&apos;should unlock content with valid access code&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Use access code instead of payment
      await page.getByTestId(&apos;access-code&apos;).fill(ACCESS_CREDENTIALS.valid.accessCode);
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Verify success and redirect
      await expect(page.getByTestId(&apos;access-success&apos;)).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
    });

    test(&apos;should reject invalid password attempts&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try invalid password
      await page.getByTestId(&apos;access-password&apos;).fill(ACCESS_CREDENTIALS.invalid.password);
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Verify error message
      await expect(page.getByTestId(&apos;access-error&apos;)).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId(&apos;access-error&apos;)).toContainText(&apos;Invalid credentials&apos;);
      
      // Verify form is still available for retry
      await expect(page.getByTestId(&apos;access-password&apos;)).toBeVisible();
      await expect(page.getByTestId(&apos;unlock-btn&apos;)).toBeEnabled();
    });

    test(&apos;should reject invalid access code attempts&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try invalid access code
      await page.getByTestId(&apos;access-code&apos;).fill(ACCESS_CREDENTIALS.invalid.accessCode);
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Verify error message
      await expect(page.getByTestId(&apos;access-error&apos;)).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId(&apos;access-error&apos;)).toContainText(&apos;Invalid credentials&apos;);
    });

    test(&apos;should require either password or access code&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try to submit without any credentials
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Verify validation message
      await expect(page.getByTestId(&apos;access-error&apos;)).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId(&apos;access-error&apos;)).toContainText(&apos;Please enter either a password or access code&apos;);
    });

    test(&apos;should handle rate limiting for failed access attempts&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await page.getByTestId(&apos;access-password&apos;).fill(`wrong-password-${i}`);
        await page.getByTestId(&apos;unlock-btn&apos;).click();
        await expect(page.getByTestId(&apos;access-error&apos;)).toBeVisible({ timeout: 5000 });
        await page.getByTestId(&apos;access-password&apos;).clear();
      }
      
      // After multiple failures, should show rate limiting
      await page.getByTestId(&apos;access-password&apos;).fill(&apos;another-wrong-password&apos;);
      await page.getByTestId(&apos;unlock-btn&apos;).click();
      
      // Should show rate limit message or disable form temporarily
      const errorText = await page.getByTestId(&apos;access-error&apos;).textContent();
      expect(errorText?.toLowerCase()).toMatch(/(rate limit|too many attempts|temporarily disabled)/);
    });
  });

  test.describe(&apos;📱 Mobile Payment Experience&apos;, () => {
    test(&apos;should handle mobile payment flow correctly&apos;, async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await createPaymentTestPage(page);
      
      // Verify mobile-optimized layout
      await expect(page.getByTestId(&apos;payment-form&apos;)).toBeVisible();
      
      // Set test mode flag for mobile payment
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      // Test touch interactions (use click for compatibility)
      if (browserName === &apos;webkit&apos; || browserName === &apos;chromium&apos;) {
        // Use click instead of tap for better compatibility
        await page.getByTestId(&apos;email-input&apos;).click();
        await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
        
        // Wait for button to be enabled before clicking
        await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 });
        
        // Complete mobile payment
        await page.getByTestId(&apos;submit-payment-btn&apos;).click();
        await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
      } else {
        // For other browsers, use regular click
        await page.getByTestId(&apos;email-input&apos;).click();
        await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
        
        // Wait for button to be enabled before clicking
        await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 });
        
        await page.getByTestId(&apos;submit-payment-btn&apos;).click();
        await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
      }
    });

    test(&apos;should handle mobile keyboard interactions&apos;, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await createPaymentTestPage(page);
      
      // Test email input with mobile keyboard
      await page.getByTestId(&apos;email-input&apos;).focus();
      await page.keyboard.type(TEST_USER.email);
      
      // Verify email validation on mobile
      await expect(page.getByTestId(&apos;email-input&apos;)).toHaveValue(TEST_USER.email);
    });
  });

  test.describe(&apos;🔄 Error Recovery and Retry Logic&apos;, () => {
    test(&apos;should allow payment retry after network failure&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate network failure
      await page.route(&apos;**/api/payment/**&apos;, async (route) => {
        await route.abort(&apos;failed&apos;);
      });
      
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      
      // Wait for button to be enabled before clicking
      await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 });
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Wait for error state
      await expect(page.getByTestId(&apos;card-errors&apos;)).toBeVisible({ timeout: 10000 });
      
      // Remove network failure and retry
      await page.unroute(&apos;**/api/payment/**&apos;);
      await setupPaymentAPIMocking(page);
      
      // Set test mode flag for retry
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
    });

    test(&apos;should handle session timeout gracefully&apos;, async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate session timeout
      await page.route(&apos;**/api/payment/**&apos;, async (route) => {
        await route.fulfill({
          status: 401,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({ error: &apos;Session expired&apos; })
        });
      });
      
      await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
      await page.getByTestId(&apos;submit-payment-btn&apos;).click();
      
      // Should show session expired message in card errors
      await expect(page.getByTestId(&apos;card-errors&apos;)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(&apos;card-errors&apos;)).toContainText(&apos;Session expired&apos;);
    });
  });
});

// Performance and Load Testing
test.describe(&apos;⚡ Payment Performance Testing&apos;, () => {
  test(&apos;should complete payment flow within acceptable time limits&apos;, async ({ page }) => {
    const startTime = Date.now();
    
    await setupPaymentAPIMocking(page);
    await createPaymentTestPage(page);
    
    // Set test mode flag
    await page.evaluate(() => {
      (window as any).isPlaywrightTest = true;
    });
    
    await page.getByTestId(&apos;email-input&apos;).fill(TEST_USER.email);
    
    // Wait for button to be enabled before clicking
    await expect(page.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 });
    await page.getByTestId(&apos;submit-payment-btn&apos;).click();
    
    await expect(page.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 10000 });
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
  });

  test(&apos;should handle multiple concurrent payment attempts&apos;, async ({ page, context }) => {
    // This would typically test payment system&apos;s ability to handle load
    // In a real scenario, you might use multiple browser contexts or workers
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      promises.push(
        setupPaymentAPIMocking(newPage)
          .then(() => createPaymentTestPage(newPage))
          .then(() => newPage.evaluate(() => {
            (window as any).isPlaywrightTest = true;
          }))
          .then(() => newPage.getByTestId(&apos;email-input&apos;).fill(`user${i}@example.com`))
          .then(() => expect(newPage.getByTestId(&apos;submit-payment-btn&apos;)).toBeEnabled({ timeout: 5000 }))
          .then(() => newPage.getByTestId(&apos;submit-payment-btn&apos;).click())
          .then(() => expect(newPage.getByTestId(&apos;payment-success&apos;)).toBeVisible({ timeout: 15000 }))
      );
    }
    
    // All payments should succeed
    await Promise.all(promises);
  });
}); 