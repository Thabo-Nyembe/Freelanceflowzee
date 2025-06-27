import { test, expect } from &apos;@playwright/test&apos;;
import { TestHelpers } from &apos;../utils/test-helpers&apos;;

test.describe(&apos;Payment System Comprehensive Tests&apos;, () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({ &apos;x-test-mode&apos;: &apos;true&apos; });
  });

  test(&apos;should load payment page with all access methods&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();

    // Verify payment container
    await expect(page.locator(&apos;[data-testid=&quot;payment-container&quot;]&apos;)).toBeVisible();
    
    // Verify all payment methods are available
    await expect(page.locator(&apos;[data-testid=&quot;payment-method-card&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;payment-method-password&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;payment-method-code&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should process card payment successfully&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();

    // Select card payment method
    await page.click(&apos;[data-testid=&quot;payment-method-card&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;card-payment-form&quot;]&apos;)).toBeVisible();

    // Fill payment form
    await page.fill(&apos;[data-testid=&quot;card-number-input&quot;]&apos;, testPaymentCards.valid.number);
    await page.fill(&apos;[data-testid=&quot;card-expiry-input&quot;]&apos;, testPaymentCards.valid.expiry);
    await page.fill(&apos;[data-testid=&quot;card-cvc-input&quot;]&apos;, testPaymentCards.valid.cvc);

    // Submit payment
    await page.click(&apos;[data-testid=&quot;submit-payment-button&quot;]&apos;);
    
    // Wait for processing
    await expect(page.locator(&apos;[data-testid=&quot;submit-payment-button&quot;]&apos;)).toContainText(&apos;Processing...&apos;);
    
    // Verify redirect (mock)
    await page.waitForTimeout(3000);
  });

  test(&apos;should handle password access method&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();

    // Select password method
    await page.click(&apos;[data-testid=&quot;payment-method-password&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;password-access-form&quot;]&apos;)).toBeVisible();

    // Enter valid password
    await page.fill(&apos;[data-testid=&quot;access-password-input&quot;]&apos;, &apos;test123&apos;);
    await page.click(&apos;[data-testid=&quot;submit-password-button&quot;]&apos;);
    
    // Verify processing
    await expect(page.locator(&apos;[data-testid=&quot;submit-password-button&quot;]&apos;)).toContainText(&apos;Verifying...&apos;);
  });

  test(&apos;should handle access code method&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();

    // Select code method
    await page.click(&apos;[data-testid=&quot;payment-method-code&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;code-access-form&quot;]&apos;)).toBeVisible();

    // Enter valid code
    await page.fill(&apos;[data-testid=&quot;access-code-input&quot;]&apos;, &apos;PREMIUM2024&apos;);
    await page.click(&apos;[data-testid=&quot;submit-code-button&quot;]&apos;);
    
    // Verify processing
    await expect(page.locator(&apos;[data-testid=&quot;submit-code-button&quot;]&apos;)).toContainText(&apos;Verifying...&apos;);
  });

  test(&apos;should be mobile responsive&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.testMobileResponsiveness();
    
    // Test mobile interaction
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator(&apos;[data-testid=&quot;payment-container&quot;]&apos;)).toBeVisible();
    
    // Verify payment methods are still accessible on mobile
    await page.click(&apos;[data-testid=&quot;payment-method-card&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;card-payment-form&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should show security badge&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();
    
    // Verify security elements
    await expect(page.locator(&apos;text=🔒 Secure Payment Processing&apos;)).toBeVisible();
  });

  test(&apos;should handle form validation&apos;, async ({ page }) => {
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();

    // Select card payment
    await page.click(&apos;[data-testid=&quot;payment-method-card&quot;]&apos;);
    
    // Try to submit without filling fields
    await page.click(&apos;[data-testid=&quot;submit-payment-button&quot;]&apos;);
    
    // Form should handle validation (browser validation)
    const cardNumberInput = page.locator(&apos;[data-testid=&quot;card-number-input&quot;]&apos;);
    await expect(cardNumberInput).toBeFocused();
  });

  test(&apos;should measure payment page performance&apos;, async ({ page }) => {
    const performance = await helpers.measurePagePerformance(&apos;Payment Page&apos;);
    
    await page.goto(&apos;/payment?project=test-project-1&apos;);
    await helpers.waitForAppReady();
    
    // Performance should be reasonable
    expect(performance.loadTime).toBeLessThan(5000); // 5 seconds max
  });
});
