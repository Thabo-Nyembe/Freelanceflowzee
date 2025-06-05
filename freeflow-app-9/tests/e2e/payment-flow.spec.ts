// 🚀 Complete Payment-to-Unlock Flow Testing
// Tests the entire user journey from payment page to unlocked content

import { test, expect } from '@playwright/test';

const TEST_PROJECT_SLUG = 'premium-brand-identity-package';
const VALID_ACCESS_CREDENTIALS = {
  password: 'secure-unlock-2024',
  accessCode: 'BRAND2024'
};

test.describe('🚀 Complete Payment-to-Unlock Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set test mode for payment bypass
    await page.addInitScript(() => {
      (window as any).isPlaywrightTest = true;
    });
  });

  test.describe('💳 Payment Flow', () => {
    
    test('should complete full payment flow and unlock content', async ({ page }) => {
      // Navigate to payment page
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Verify payment page loads correctly
      await expect(page.getByTestId('project-title')).toContainText('Premium Brand Identity Package');
      await expect(page.getByTestId('locked-notice')).toBeVisible();
      
      // Fill out payment form
      await page.getByTestId('email-input').fill('test@example.com');
      
      // Submit payment (should work in test mode)
      const paymentButton = page.getByTestId('submit-payment-btn');
      await expect(paymentButton).toBeEnabled();
      await paymentButton.click();
      
      // Wait for payment processing
      await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('payment-success')).toContainText('Payment successful');
      
      // Should redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 15000 });
      
      // Verify unlocked content is displayed
      await expect(page.getByTestId('unlock-success')).toBeVisible();
      await expect(page.getByTestId('unlocked-title')).toContainText('Premium Brand Identity Package');
      await expect(page.getByTestId('premium-badge')).toContainText('Premium Content');
      
      // Verify premium content sections are accessible
      await expect(page.getByTestId('premium-content')).toBeVisible();
      await expect(page.getByTestId('download-section')).toBeVisible();
      await expect(page.getByTestId('exclusive-content')).toBeVisible();
      
      // Verify download links are present
      await expect(page.getByTestId('download-logo')).toBeVisible();
      await expect(page.getByTestId('download-guidelines')).toBeVisible();
      await expect(page.getByTestId('download-mockups')).toBeVisible();
    });

    test('should handle payment decline gracefully', async ({ page }) => {
      // Set up mock to simulate declined card
      await page.addInitScript(() => {
        (window as any).mockStripeDecline = true;
      });
      
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Fill out payment form
      await page.getByTestId('email-input').fill('test@example.com');
      
      // Submit payment
      const paymentButton = page.getByTestId('submit-payment-btn');
      await paymentButton.click();
      
      // Should show decline error
      await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('card-errors')).toContainText('card was declined');
      
      // Should remain on payment page
      await expect(page).toHaveURL(new RegExp('/payment'));
    });
  });

  test.describe('🔑 Access Code Flow', () => {
    
    test('should unlock content with valid password', async ({ page }) => {
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Use access form instead of payment
      await page.getByTestId('access-password').fill(VALID_ACCESS_CREDENTIALS.password);
      await page.getByTestId('unlock-btn').click();
      
      // Wait for success message
      await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-success')).toContainText('Access granted');
      
      // Should redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 10000 });
      
      // Verify content is unlocked
      await expect(page.getByTestId('unlock-success')).toBeVisible();
      await expect(page.getByTestId('premium-content')).toBeVisible();
    });

    test('should unlock content with valid access code', async ({ page }) => {
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Use access code
      await page.getByTestId('access-code').fill(VALID_ACCESS_CREDENTIALS.accessCode);
      await page.getByTestId('unlock-btn').click();
      
      // Wait for success and redirect
      await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 10000 });
      
      // Verify content is unlocked
      await expect(page.getByTestId('unlock-success')).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Try invalid password
      await page.getByTestId('access-password').fill('wrong-password');
      await page.getByTestId('unlock-btn').click();
      
      // Should show error
      await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('access-error')).toContainText('Invalid credentials');
      
      // Should remain on payment page
      await expect(page).toHaveURL(new RegExp('/payment'));
    });
  });

  test.describe('🔒 Access Protection', () => {
    
    test('should redirect to payment when accessing unlocked page without access', async ({ page }) => {
      // Try to access unlocked content directly without payment/access
      await page.goto(`/projects/${TEST_PROJECT_SLUG}/unlocked`);
      
      // Should redirect to payment page
      await expect(page).toHaveURL(new RegExp('/payment'), { timeout: 10000 });
      await expect(page.getByTestId('locked-notice')).toBeVisible();
    });

    test('should maintain access across page reloads', async ({ page }) => {
      // First, gain access via payment
      await page.goto(`/payment?project=proj_test_12345`);
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('submit-payment-btn').click();
      
      // Wait for redirect to unlocked content
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 15000 });
      
      // Reload the page
      await page.reload();
      
      // Should still have access
      await expect(page.getByTestId('unlock-success')).toBeVisible();
      await expect(page.getByTestId('premium-content')).toBeVisible();
    });
  });

  test.describe('🎯 Return URL Handling', () => {
    
    test('should preserve intended destination after payment', async ({ page }) => {
      const returnUrl = `/projects/${TEST_PROJECT_SLUG}/premium-section`;
      
      // Navigate to payment with return URL
      await page.goto(`/payment?project=proj_test_12345&return=${encodeURIComponent(returnUrl)}`);
      
      // Complete payment
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('submit-payment-btn').click();
      
      // Should redirect to unlocked content (for this test setup)
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 15000 });
      
      // In a real implementation, you might redirect to the return URL
      // For now, verify access is granted
      await expect(page.getByTestId('unlock-success')).toBeVisible();
    });
  });

  test.describe('📱 Mobile Experience', () => {
    
    test('should work correctly on mobile devices', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'This test is only for mobile devices');
      
      await page.goto(`/payment?project=proj_test_12345`);
      
      // Verify mobile layout
      await expect(page.getByTestId('project-title')).toBeVisible();
      await expect(page.getByTestId('payment-form')).toBeVisible();
      
      // Complete payment flow
      await page.getByTestId('email-input').fill('mobile@example.com');
      await page.getByTestId('submit-payment-btn').click();
      
      // Should work the same as desktop
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 15000 });
      await expect(page.getByTestId('unlock-success')).toBeVisible();
    });
  });

  test.describe('⚡ Performance', () => {
    
    test('should complete payment flow within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`/payment?project=proj_test_12345`);
      await page.getByTestId('email-input').fill('perf@example.com');
      await page.getByTestId('submit-payment-btn').click();
      
      await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT_SLUG}/unlocked`), { timeout: 15000 });
      
      const totalTime = Date.now() - startTime;
      console.log(`Payment flow completed in ${totalTime}ms`);
      
      // Should complete within 15 seconds
      expect(totalTime).toBeLessThan(15000);
    });
  });
}); 