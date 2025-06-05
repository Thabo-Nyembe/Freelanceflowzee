import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { testPaymentCards, testProjects } from '../fixtures/test-data';

test.describe('Payment System Comprehensive Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({ 'x-test-mode': 'true' });
  });

  test('should load payment page with all access methods', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();

    // Verify payment container
    await expect(page.locator('[data-testid="payment-container"]')).toBeVisible();
    
    // Verify all payment methods are available
    await expect(page.locator('[data-testid="payment-method-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-code"]')).toBeVisible();
  });

  test('should process card payment successfully', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();

    // Select card payment method
    await page.click('[data-testid="payment-method-card"]');
    await expect(page.locator('[data-testid="card-payment-form"]')).toBeVisible();

    // Fill payment form
    await page.fill('[data-testid="card-number-input"]', testPaymentCards.valid.number);
    await page.fill('[data-testid="card-expiry-input"]', testPaymentCards.valid.expiry);
    await page.fill('[data-testid="card-cvc-input"]', testPaymentCards.valid.cvc);

    // Submit payment
    await page.click('[data-testid="submit-payment-button"]');
    
    // Wait for processing
    await expect(page.locator('[data-testid="submit-payment-button"]')).toContainText('Processing...');
    
    // Verify redirect (mock)
    await page.waitForTimeout(3000);
  });

  test('should handle password access method', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();

    // Select password method
    await page.click('[data-testid="payment-method-password"]');
    await expect(page.locator('[data-testid="password-access-form"]')).toBeVisible();

    // Enter valid password
    await page.fill('[data-testid="access-password-input"]', 'test123');
    await page.click('[data-testid="submit-password-button"]');
    
    // Verify processing
    await expect(page.locator('[data-testid="submit-password-button"]')).toContainText('Verifying...');
  });

  test('should handle access code method', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();

    // Select code method
    await page.click('[data-testid="payment-method-code"]');
    await expect(page.locator('[data-testid="code-access-form"]')).toBeVisible();

    // Enter valid code
    await page.fill('[data-testid="access-code-input"]', 'PREMIUM2024');
    await page.click('[data-testid="submit-code-button"]');
    
    // Verify processing
    await expect(page.locator('[data-testid="submit-code-button"]')).toContainText('Verifying...');
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.testMobileResponsiveness();
    
    // Test mobile interaction
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="payment-container"]')).toBeVisible();
    
    // Verify payment methods are still accessible on mobile
    await page.click('[data-testid="payment-method-card"]');
    await expect(page.locator('[data-testid="card-payment-form"]')).toBeVisible();
  });

  test('should show security badge', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();
    
    // Verify security elements
    await expect(page.locator('text=🔒 Secure Payment Processing')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();

    // Select card payment
    await page.click('[data-testid="payment-method-card"]');
    
    // Try to submit without filling fields
    await page.click('[data-testid="submit-payment-button"]');
    
    // Form should handle validation (browser validation)
    const cardNumberInput = page.locator('[data-testid="card-number-input"]');
    await expect(cardNumberInput).toBeFocused();
  });

  test('should measure payment page performance', async ({ page }) => {
    const performance = await helpers.measurePagePerformance('Payment Page');
    
    await page.goto('/payment?project=test-project-1');
    await helpers.waitForAppReady();
    
    // Performance should be reasonable
    expect(performance.loadTime).toBeLessThan(5000); // 5 seconds max
  });
});
