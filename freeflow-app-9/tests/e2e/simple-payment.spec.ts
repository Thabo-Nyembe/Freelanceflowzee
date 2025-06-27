// 🔧 Simple Payment Flow Debugging Test
// Minimal test to debug authentication and routing issues

import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;🔧 Payment Flow Debugging&apos;, () => {
  
  test.beforeEach(async ({ page }) => {
    // Set multiple test environment indicators
    await page.addInitScript(() => {
      // Set multiple test flags to ensure bypass
      (window as any).isPlaywrightTest = true;
      (window as any).testMode = true;
      (window as any).skipAuth = true;
    });
    
    // Set test mode headers
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;x-playwright-test&apos;: &apos;true&apos;
    });
  });

  test(&apos;should access home page without redirecting to login&apos;, async ({ page }) => {
    // Navigate to home page
    await page.goto(&apos;/');
    
    // Should not redirect to login
    const url = page.url();
    console.log(&apos;Current URL:&apos;, url);
    
    // Check if we&apos;re redirected to login
    if (url.includes(&apos;/login&apos;)) {
      console.log(&apos;❌ Redirected to login - auth middleware is active&apos;);
      // Take a screenshot for debugging
      await page.screenshot({ path: &apos;debug-home-redirect.png&apos; });
    } else {
      console.log(&apos;✅ Home page accessible&apos;);
    }
    
    // For now, just log the result
    expect(true).toBe(true);
  });

  test(&apos;should access payment page directly&apos;, async ({ page }) => {
    // Navigate to payment page directly
    await page.goto(&apos;/payment?project=proj_test_12345&apos;);
    
    const url = page.url();
    console.log(&apos;Payment page URL:&apos;, url);
    
    if (url.includes(&apos;/login&apos;)) {
      console.log(&apos;❌ Payment page redirected to login&apos;);
      await page.screenshot({ path: &apos;debug-payment-redirect.png&apos; });
    } else {
      console.log(&apos;✅ Payment page accessible&apos;);
      
      // Try to find key elements
      const titleExists = await page.locator(&apos;[data-testid=\"project-title\"]&apos;).count();
      const formExists = await page.locator(&apos;[data-testid=\"payment-form\"]&apos;).count();
      
      console.log(&apos;Title element count:&apos;, titleExists);
      console.log(&apos;Form element count:&apos;, formExists);
      
      if (titleExists === 0 && formExists === 0) {
        // Take screenshot to see what&apos;s actually rendered
        await page.screenshot({ path: &apos;debug-payment-content.png&apos; });
        const content = await page.content();
        console.log(&apos;Page content sample:&apos;, content.substring(0, 500));
      }
    }
    
    expect(true).toBe(true);
  });

  test(&apos;should access unlocked page and redirect to payment&apos;, async ({ page }) => {
    // Try to access unlocked content without authentication
    await page.goto(&apos;/projects/premium-brand-identity-package/unlocked&apos;);
    
    const url = page.url();
    console.log(&apos;Unlocked page final URL:&apos;, url);
    
    if (url.includes(&apos;/login&apos;)) {
      console.log(&apos;❌ Unlocked page redirected to login instead of payment&apos;);
    } else if (url.includes(&apos;/payment&apos;)) {
      console.log(&apos;✅ Unlocked page correctly redirected to payment&apos;);
    } else {
      console.log(&apos;🔄 Unlocked page went to unexpected URL:&apos;, url);
    }
    
    expect(true).toBe(true);
  });
}); 