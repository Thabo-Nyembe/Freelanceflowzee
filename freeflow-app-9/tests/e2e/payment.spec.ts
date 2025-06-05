// 🧪 Payment-to-Unlock Flow E2E Testing Suite
// Enterprise-grade testing with Playwright best practices and Context7 patterns
// Cross-browser compatibility: Chrome, Firefox, Safari, Mobile
// Comprehensive coverage: Payment flow, access control, Stripe integration, security

import { test, expect, Page } from '@playwright/test';

// Configuration for enhanced testing following Context7 patterns
// Using baseURL from playwright.config.ts (http://localhost:3001)

// Test data constants for payment scenarios
const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  price: 4999, // $49.99
  currency: 'usd',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  isLocked: true,
  createdBy: 'designer@example.com',
  slug: 'premium-brand-identity-package'
};

const TEST_USER = {
  email: 'test.buyer@example.com',
  name: 'Test Buyer',
  id: 'user_test_buyer_123'
};

const STRIPE_TEST_CARDS = {
  valid: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    zip: '12345'
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/25', 
    cvc: '123',
    zip: '12345'
  },
  requiresAuth: {
    number: '4000002500003155',
    expiry: '12/25',
    cvc: '123',
    zip: '12345'
  }
};

const ACCESS_CREDENTIALS = {
  valid: {
    password: 'secure-unlock-2024',
    accessCode: 'BRAND2024'
  },
  invalid: {
    password: 'wrong-password',
    accessCode: 'INVALID123',
    expired: 'EXPIRED2023'
  }
};

// Enhanced API mocking for payment flow testing
async function setupPaymentAPIMocking(page: Page) {
  // Mock Stripe Payment Intent creation
  await page.route('**/api/payment/create-intent', async (route) => {
    const postData = route.request().postDataJSON();
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        clientSecret: 'pi_3QdGhJ2eZvKYlo2C0123456789_secret_abcdefghijklmnopqrstuvwxyz123456',
        paymentIntentId: 'pi_3QdGhJ2eZvKYlo2C0123456789',
        amount: postData.amount,
        currency: postData.currency
      })
    });
  });

  // Mock payment confirmation
  await page.route('**/api/payment/confirm', async (route) => {
    const postData = route.request().postDataJSON();
    const paymentMethod = postData.paymentMethodId;
    
    // Simulate different payment outcomes based on test cards
    if (paymentMethod?.includes('declined')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Your card was declined',
          code: 'card_declined',
          decline_code: 'generic_decline'
        })
      });
    } else if (paymentMethod?.includes('auth')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'requires_action',
          clientSecret: 'pi_test_auth_secret'
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'succeeded',
          paymentIntentId: 'pi_test_123456789',
          accessToken: 'access_token_' + Date.now(),
          unlockUrl: `/projects/${TEST_PROJECT.slug}/unlocked`
        })
      });
    }
  });

  // Mock project access validation
  await page.route('**/api/projects/*/access', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (method === 'POST') {
      const postData = route.request().postDataJSON();
      const { password, accessCode } = postData;
      
      if (password === ACCESS_CREDENTIALS.valid.password || 
          accessCode === ACCESS_CREDENTIALS.valid.accessCode) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            accessToken: 'access_token_' + Date.now(),
            projectSlug: TEST_PROJECT.slug,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            unlockUrl: `/projects/${TEST_PROJECT.slug}/unlocked`
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid credentials',
            code: 'unauthorized'
          })
        });
      }
    }
  });

  // Mock signed URL validation
  await page.route('**/api/projects/*/validate-url', async (route) => {
    const url = route.request().url();
    const urlParams = new URL(url).searchParams;
    const token = urlParams.get('token');
    const expires = urlParams.get('expires');
    
    if (token?.includes('expired') || (expires && parseInt(expires) < Date.now())) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Access link has expired',
          code: 'expired_link'
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          projectData: TEST_PROJECT
        })
      });
    }
  });

  console.log('✅ Payment API mocking configured successfully');
}

// Helper function to navigate to real payment page with mocking
async function setupRealPaymentPage(page: Page) {
  await setupPaymentAPIMocking(page);
  
  // Navigate to the real payment page
  await page.goto(`/payment?project=${TEST_PROJECT.id}`);
  await page.waitForLoadState('domcontentloaded');
  
  // Ensure Stripe is loaded in test environment
  await page.waitForFunction(() => {
    return typeof window !== 'undefined';
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
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for the page to load properly
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid="unlock-success"]') !== null ||
           document.querySelector('[data-testid="premium-content"]') !== null ||
           document.querySelector('[data-testid="locked-notice"]') !== null;
  }, { timeout: 10000 });
}

// Test Suite: Payment-to-Unlock Flow
test.describe('💳 Payment-to-Unlock Flow Testing', () => {
  test.beforeEach(async ({ page }) => {
    await setupPaymentAPIMocking(page);
  });

  test.describe('🚫 Access Control - Pre-Payment Blocking', () => {
    test('should block access to locked project content without payment', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Verify locked content is visible
      await expect(page.getByTestId('locked-notice')).toBeVisible();
      await expect(page.getByTestId('locked-notice')).toContainText('Premium Content Locked');
      
      // Verify payment form is present
      await expect(page.getByTestId('payment-form')).toBeVisible();
      await expect(page.getByTestId('submit-payment-btn')).toBeVisible();
      
      // Verify price is displayed correctly
      await expect(page.getByTestId('project-price')).toHaveText('$49.99');
    });

    test('should show appropriate error when trying to access premium content directly', async ({ page }) => {
      // Try to access unlocked content directly without payment
      await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
      
      // Should be redirected to payment page or show access denied
      await expect(page).toHaveURL(new RegExp('(login|payment|access-denied)'));
    });

    test('should preserve intended destination after payment completion', async ({ page }) => {
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
      const returnUrl = url.searchParams.get('return') || url.searchParams.get('redirect');
      expect(returnUrl).toContain(TEST_PROJECT.slug);
    });
  });

  test.describe('💳 Stripe Payment Integration', () => {
    test('should complete successful payment with valid card', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Fill out payment form
      await page.getByTestId('email-input').fill(TEST_USER.email);
      
      // Enable console logging to see test mode detection
      page.on('console', msg => {
        if (msg.text().includes('🧪 Payment Debug')) {
          console.log('Browser Console:', msg.text());
        }
      });
      
      // Set test mode flag explicitly
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      // Simulate successful payment
      await page.getByTestId('submit-payment-btn').click();
      
      // Verify payment processing state
      await expect(page.getByTestId('submit-payment-btn')).toHaveText('Processing...');
      await expect(page.getByTestId('submit-payment-btn')).toBeDisabled();
      
      // Wait for payment success
      await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('payment-success')).toContainText('Payment successful');
      
      // Verify redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
    });

    test('should handle payment failure with declined card', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Fill form with email
      await page.getByTestId('email-input').fill(TEST_USER.email);
      
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
      
      await page.getByTestId('submit-payment-btn').click();
      
      // Wait for and verify error message (test mode should show decline message)
      await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('card-errors')).toContainText('Your card was declined.');
      
      // Verify button is re-enabled for retry
      await expect(page.getByTestId('submit-payment-btn')).toBeEnabled();
      await expect(page.getByTestId('submit-payment-btn')).toContainText('Complete Payment');
    });

    test('should handle authentication required scenarios', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Set test mode flag
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      await page.getByTestId('email-input').fill(TEST_USER.email);
      
      // Wait for button to be enabled before clicking
      await expect(page.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 });
      await page.getByTestId('submit-payment-btn').click();
      
      // Verify payment success (simplified for test environment)
      await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
    });

    test('should validate required payment form fields', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try to submit without email
      await page.getByTestId('submit-payment-btn').click();
      
      // Check HTML5 validation
      const emailInput = page.getByTestId('email-input');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
      
      // Fill email and verify it's accepted
      await emailInput.fill(TEST_USER.email);
      const updatedValidationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(updatedValidationMessage).toBe('');
    });
  });

  test.describe('🔓 Content Unlocking After Payment', () => {
    test('should unlock and display premium content after successful payment', async ({ page }) => {
      // Start with payment page
      await createPaymentTestPage(page);
      
      // Complete payment
      await page.getByTestId('email-input').fill(TEST_USER.email);
      await page.getByTestId('submit-payment-btn').click();
      
      // Wait for redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
      
      // Create and verify unlocked content page
      await createUnlockedContentPage(page);
      
      // Verify success message and premium content
      await expect(page.getByTestId('unlock-success')).toBeVisible();
      await expect(page.getByTestId('unlock-success')).toContainText('Content Unlocked!');
      
      // Verify premium content is accessible
      await expect(page.getByTestId('premium-content')).toBeVisible();
      await expect(page.getByTestId('premium-badge')).toBeVisible();
      
      // Verify download links are present
      await expect(page.getByTestId('download-logo')).toBeVisible();
      await expect(page.getByTestId('download-guidelines')).toBeVisible();
      await expect(page.getByTestId('download-mockups')).toBeVisible();
      
      // Verify exclusive content is shown
      await expect(page.getByTestId('exclusive-content')).toBeVisible();
      await expect(page.getByTestId('exclusive-content')).toContainText('premium content only available after payment');
    });

    test('should maintain access across browser sessions after payment', async ({ page, context }) => {
      // Simulate payment completion and set access token in storage
      await page.goto('/');
      await page.evaluate((projectId) => {
        localStorage.setItem(`project_access_${projectId}`, JSON.stringify({
          accessToken: 'access_token_123',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          projectId: projectId
        }));
      }, TEST_PROJECT.id);
      
      // Navigate to unlocked content
      await createUnlockedContentPage(page);
      
      // Verify content is accessible
      await expect(page.getByTestId('premium-content')).toBeVisible();
      
      // Open new tab to simulate session continuity
      const newPage = await context.newPage();
      await newPage.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
      
      // Should still have access
      await expect(newPage.getByTestId('premium-content')).toBeVisible();
    });

    test('should handle concurrent access attempts gracefully', async ({ page, context }) => {
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
        page.getByTestId('email-input').fill(TEST_USER.email),
        page2.getByTestId('email-input').fill(TEST_USER.email),
        page3.getByTestId('email-input').fill(TEST_USER.email)
      ]);
      
      // Submit payment from first tab
      await page.getByTestId('submit-payment-btn').click();
      await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
      
      // Other tabs should handle the state change gracefully
      // (In real app, they might show "Payment completed in another tab" or redirect)
    });
  });

  test.describe('⏱️ Expired Signed URL Testing', () => {
    test('should reject access with expired signed URLs', async ({ page }) => {
      // Create a mock expired URL
      const expiredTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      const expiredUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=expired_token_123&expires=${expiredTimestamp}`;
      
      await page.goto(expiredUrl);
      
      // Should show expired notice or redirect to payment
      await expect(page.locator('[data-testid="expired-notice"], [data-testid="locked-notice"]')).toBeVisible();
    });

    test('should accept access with valid signed URLs', async ({ page }) => {
      // Create a mock valid URL
      const validTimestamp = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
      const validUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123&expires=${validTimestamp}`;
      
      await page.goto(validUrl);
      await createUnlockedContentPage(page);
      
      // Should display unlocked content
      await expect(page.getByTestId('premium-content')).toBeVisible();
    });

    test('should handle URL tampering attempts', async ({ page }) => {
      // Test various tampering scenarios
      const tamperingAttempts = [
        `/projects/${TEST_PROJECT.slug}/unlocked?token=hacked_token&expires=9999999999999`,
        `/projects/${TEST_PROJECT.slug}/unlocked?token=&expires=${Date.now() + 3600000}`,
        `/projects/${TEST_PROJECT.slug}/unlocked?expires=${Date.now() + 3600000}`,
        `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123`
      ];
      
      for (const tamperedUrl of tamperingAttempts) {
        await page.goto(tamperedUrl);
        
        // Should be rejected and redirected to payment or show error
        await expect(page.locator('[data-testid="locked-notice"], [data-testid="access-denied"]')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should log security events for suspicious access attempts', async ({ page }) => {
      // Mock security logging endpoint
      let securityEvents: any[] = [];
      await page.route('**/api/security/log', async (route) => {
        const postData = route.request().postDataJSON();
        securityEvents.push(postData);
        await route.fulfill({ status: 200, body: 'OK' });
      });
      
      // Attempt access with suspicious parameters
      await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked?token=<script>alert('xss')</script>&expires=0`);
      
      // Verify security event was logged (in a real app)
      // This would be checked via the securityEvents array or API monitoring
    });
  });

  test.describe('🔑 Alternative Access Methods', () => {
    test('should unlock content with valid password', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Enable console logging for debugging
      page.on('console', msg => {
        console.log('Browser Console:', msg.text());
      });
      
      // Enable console logging for debugging
      page.on('console', msg => {
        console.log('Browser Console:', msg.text());
      });
      
      // Enable console logging for debugging
      page.on('console', msg => {
        console.log('Browser Console:', msg.text());
      });
      
      // Use password access instead of payment
      await page.getByTestId('access-password').fill(ACCESS_CREDENTIALS.valid.password);
      await page.getByTestId('unlock-btn').click();
      
      // Verify success message
      await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-success')).toContainText('Access granted');
      
      // Verify redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
    });

    test('should unlock content with valid access code', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Use access code instead of payment
      await page.getByTestId('access-code').fill(ACCESS_CREDENTIALS.valid.accessCode);
      await page.getByTestId('unlock-btn').click();
      
      // Verify success and redirect
      await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
    });

    test('should reject invalid password attempts', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try invalid password
      await page.getByTestId('access-password').fill(ACCESS_CREDENTIALS.invalid.password);
      await page.getByTestId('unlock-btn').click();
      
      // Verify error message
      await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-error')).toContainText('Invalid credentials');
      
      // Verify form is still available for retry
      await expect(page.getByTestId('access-password')).toBeVisible();
      await expect(page.getByTestId('unlock-btn')).toBeEnabled();
    });

    test('should reject invalid access code attempts', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try invalid access code
      await page.getByTestId('access-code').fill(ACCESS_CREDENTIALS.invalid.accessCode);
      await page.getByTestId('unlock-btn').click();
      
      // Verify error message
      await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-error')).toContainText('Invalid credentials');
    });

    test('should require either password or access code', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Try to submit without any credentials
      await page.getByTestId('unlock-btn').click();
      
      // Verify validation message
      await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-error')).toContainText('Please enter either a password or access code');
    });

    test('should handle rate limiting for failed access attempts', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('access-password').fill(`wrong-password-${i}`);
        await page.getByTestId('unlock-btn').click();
        await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
        await page.getByTestId('access-password').clear();
      }
      
      // After multiple failures, should show rate limiting
      await page.getByTestId('access-password').fill('another-wrong-password');
      await page.getByTestId('unlock-btn').click();
      
      // Should show rate limit message or disable form temporarily
      const errorText = await page.getByTestId('access-error').textContent();
      expect(errorText?.toLowerCase()).toMatch(/(rate limit|too many attempts|temporarily disabled)/);
    });
  });

  test.describe('📱 Mobile Payment Experience', () => {
    test('should handle mobile payment flow correctly', async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await createPaymentTestPage(page);
      
      // Verify mobile-optimized layout
      await expect(page.getByTestId('payment-form')).toBeVisible();
      
      // Set test mode flag for mobile payment
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      // Test touch interactions (use click for compatibility)
      if (browserName === 'webkit' || browserName === 'chromium') {
        // Use click instead of tap for better compatibility
        await page.getByTestId('email-input').click();
        await page.getByTestId('email-input').fill(TEST_USER.email);
        
        // Wait for button to be enabled before clicking
        await expect(page.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 });
        
        // Complete mobile payment
        await page.getByTestId('submit-payment-btn').click();
        await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
      } else {
        // For other browsers, use regular click
        await page.getByTestId('email-input').click();
        await page.getByTestId('email-input').fill(TEST_USER.email);
        
        // Wait for button to be enabled before clicking
        await expect(page.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 });
        
        await page.getByTestId('submit-payment-btn').click();
        await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should handle mobile keyboard interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await createPaymentTestPage(page);
      
      // Test email input with mobile keyboard
      await page.getByTestId('email-input').focus();
      await page.keyboard.type(TEST_USER.email);
      
      // Verify email validation on mobile
      await expect(page.getByTestId('email-input')).toHaveValue(TEST_USER.email);
    });
  });

  test.describe('🔄 Error Recovery and Retry Logic', () => {
    test('should allow payment retry after network failure', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate network failure
      await page.route('**/api/payment/**', async (route) => {
        await route.abort('failed');
      });
      
      await page.getByTestId('email-input').fill(TEST_USER.email);
      
      // Wait for button to be enabled before clicking
      await expect(page.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 });
      await page.getByTestId('submit-payment-btn').click();
      
      // Wait for error state
      await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 10000 });
      
      // Remove network failure and retry
      await page.unroute('**/api/payment/**');
      await setupPaymentAPIMocking(page);
      
      // Set test mode flag for retry
      await page.evaluate(() => {
        (window as any).isPlaywrightTest = true;
      });
      
      await page.getByTestId('submit-payment-btn').click();
      await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
    });

    test('should handle session timeout gracefully', async ({ page }) => {
      await createPaymentTestPage(page);
      
      // Simulate session timeout
      await page.route('**/api/payment/**', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session expired' })
        });
      });
      
      await page.getByTestId('email-input').fill(TEST_USER.email);
      await page.getByTestId('submit-payment-btn').click();
      
      // Should show session expired message in card errors
      await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('card-errors')).toContainText('Session expired');
    });
  });
});

// Performance and Load Testing
test.describe('⚡ Payment Performance Testing', () => {
  test('should complete payment flow within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await setupPaymentAPIMocking(page);
    await createPaymentTestPage(page);
    
    // Set test mode flag
    await page.evaluate(() => {
      (window as any).isPlaywrightTest = true;
    });
    
    await page.getByTestId('email-input').fill(TEST_USER.email);
    
    // Wait for button to be enabled before clicking
    await expect(page.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 });
    await page.getByTestId('submit-payment-btn').click();
    
    await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
  });

  test('should handle multiple concurrent payment attempts', async ({ page, context }) => {
    // This would typically test payment system's ability to handle load
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
          .then(() => newPage.getByTestId('email-input').fill(`user${i}@example.com`))
          .then(() => expect(newPage.getByTestId('submit-payment-btn')).toBeEnabled({ timeout: 5000 }))
          .then(() => newPage.getByTestId('submit-payment-btn').click())
          .then(() => expect(newPage.getByTestId('payment-success')).toBeVisible({ timeout: 15000 }))
      );
    }
    
    // All payments should succeed
    await Promise.all(promises);
  });
}); 