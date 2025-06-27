import { test, expect, Page } from &apos;@playwright/test&apos;;

// Simple dashboard test to verify setup
test.describe(&apos;Dashboard Simple Test&apos;, () => {
  test(&apos;should load the dashboard page&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Check if login page loads
    await expect(page.locator(&apos;input[type=&quot;email&quot;]&apos;)).toBeVisible();
  });
}); 