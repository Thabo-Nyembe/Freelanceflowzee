import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Smoke tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto(&apos;/login&apos;);
    
    // Fill in login form
    await page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, &apos;test@freeflowzee.com&apos;);
    await page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, &apos;testpassword&apos;);
    
    // Click login button
    await page.click(&apos;[data-testid=&quot;login-button&quot;]&apos;);
    
    // Wait for navigation
    await page.waitForURL(&apos;**/dashboard&apos;);
  });

  test(&apos;should load the homepage&apos;, async ({ page }) => {
    await page.goto(&apos;/');
    await expect(page).toHaveTitle(/FreeflowZee/);
  });

  test(&apos;should navigate to projects hub&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard/projects-hub&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should find login page elements&apos;, async ({ page }) => {
    // Go to login page
    await page.goto(&apos;/login&apos;);
    
    // Wait for page to load
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Log the page content for debugging
    console.log(&apos;Page content:&apos;, await page.content());
    
    // Check if login form elements exist
    const emailInput = page.locator(&apos;[data-testid=&quot;email-input&quot;]&apos;);
    const passwordInput = page.locator(&apos;[data-testid=&quot;password-input&quot;]&apos;);
    const loginButton = page.locator(&apos;[data-testid=&quot;login-button&quot;]&apos;);
    
    // Log element states
    console.log(&apos;Email input exists:&apos;, await emailInput.count() > 0);
    console.log(&apos;Password input exists:&apos;, await passwordInput.count() > 0);
    console.log(&apos;Login button exists:&apos;, await loginButton.count() > 0);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: &apos;login-page.png&apos;, fullPage: true });
  });
});
