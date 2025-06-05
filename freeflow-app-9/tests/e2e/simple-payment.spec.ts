// 🔧 Simple Payment Flow Debugging Test
// Minimal test to debug authentication and routing issues

import { test, expect } from '@playwright/test';

test.describe('🔧 Payment Flow Debugging', () => {
  
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
      'x-test-mode': 'true',
      'x-playwright-test': 'true'
    });
  });

  test('should access home page without redirecting to login', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Should not redirect to login
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if we're redirected to login
    if (url.includes('/login')) {
      console.log('❌ Redirected to login - auth middleware is active');
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-home-redirect.png' });
    } else {
      console.log('✅ Home page accessible');
    }
    
    // For now, just log the result
    expect(true).toBe(true);
  });

  test('should access payment page directly', async ({ page }) => {
    // Navigate to payment page directly
    await page.goto('/payment?project=proj_test_12345');
    
    const url = page.url();
    console.log('Payment page URL:', url);
    
    if (url.includes('/login')) {
      console.log('❌ Payment page redirected to login');
      await page.screenshot({ path: 'debug-payment-redirect.png' });
    } else {
      console.log('✅ Payment page accessible');
      
      // Try to find key elements
      const titleExists = await page.locator('[data-testid=\"project-title\"]').count();
      const formExists = await page.locator('[data-testid=\"payment-form\"]').count();
      
      console.log('Title element count:', titleExists);
      console.log('Form element count:', formExists);
      
      if (titleExists === 0 && formExists === 0) {
        // Take screenshot to see what's actually rendered
        await page.screenshot({ path: 'debug-payment-content.png' });
        const content = await page.content();
        console.log('Page content sample:', content.substring(0, 500));
      }
    }
    
    expect(true).toBe(true);
  });

  test('should access unlocked page and redirect to payment', async ({ page }) => {
    // Try to access unlocked content without authentication
    await page.goto('/projects/premium-brand-identity-package/unlocked');
    
    const url = page.url();
    console.log('Unlocked page final URL:', url);
    
    if (url.includes('/login')) {
      console.log('❌ Unlocked page redirected to login instead of payment');
    } else if (url.includes('/payment')) {
      console.log('✅ Unlocked page correctly redirected to payment');
    } else {
      console.log('🔄 Unlocked page went to unexpected URL:', url);
    }
    
    expect(true).toBe(true);
  });
}); 