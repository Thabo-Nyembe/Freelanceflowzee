import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;App Tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(&apos;http://localhost:3001&apos;);
    await page.waitForLoadState(&apos;networkidle&apos;);
  });

  test(&apos;should load the app without errors&apos;, async ({ page }) => {
    // Check for console errors
    const errors: string[] = [];
    page.on(&apos;console&apos;, msg => {
      if (msg.type() === &apos;error&apos;) {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Check for failed requests
    const failedRequests: string[] = [];
    page.on(&apos;requestfailed&apos;, request => {
      const failure = request.failure();
      failedRequests.push(`Failed Request: ${request.url()} - ${failure?.errorText || &apos;Unknown error&apos;}`);
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (errors.length > 0) {
      console.log(&apos;Console Errors:&apos;, errors);
    }
    if (failedRequests.length > 0) {
      console.log(&apos;Failed Requests:&apos;, failedRequests);
    }

    // Assert no errors were found
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);
  });

  test(&apos;should have proper meta tags&apos;, async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();

    const description = await page.getAttribute(&apos;meta[name=&quot;description&quot;]&apos;, &apos;content&apos;);
    expect(description).toBeTruthy();
  });

  test(&apos;should load main content&apos;, async ({ page }) => {
    // Wait for main content to be visible
    await page.waitForSelector(&apos;main&apos;, { state: &apos;visible&apos; });
    
    // Check if main content exists
    const mainContent = await page.$(&apos;main&apos;);
    expect(mainContent).toBeTruthy();
  });

  test(&apos;should handle navigation&apos;, async ({ page }) => {
    // Check if navigation exists
    const nav = await page.$(&apos;nav&apos;);
    expect(nav).toBeTruthy();

    // Ensure navigation links are visible
    const links = await page.$$(&apos;nav a&apos;);
    expect(links.length).toBeGreaterThan(0);
  });

  test(&apos;should be responsive&apos;, async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileMenu = await page.$(&apos;[data-testid=&quot;mobile-menu&quot;]&apos;);
    expect(mobileMenu).toBeTruthy();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
  });

  test(&apos;should handle theme switching&apos;, async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = await page.$(&apos;[data-testid=&quot;theme-toggle&quot;]&apos;);
    if (themeToggle) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => document.documentElement.classList.contains(&apos;dark&apos;));
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Check if theme changed
      const newTheme = await page.evaluate(() => document.documentElement.classList.contains(&apos;dark&apos;));
      expect(newTheme).not.toBe(initialTheme);
    }
  });
}); 