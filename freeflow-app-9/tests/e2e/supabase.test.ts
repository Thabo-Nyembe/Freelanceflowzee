import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Supabase Integration Tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(&apos;http://localhost:3001&apos;);
    await page.waitForLoadState(&apos;networkidle&apos;);
  });

  test(&apos;should load without Supabase connection errors&apos;, async ({ page }) => {
    // Check for Supabase-related console errors
    const errors: string[] = [];
    page.on(&apos;console&apos;, msg => {
      if (msg.type() === &apos;error&apos; && msg.text().toLowerCase().includes(&apos;supabase&apos;)) {
        errors.push(`Supabase Error: ${msg.text()}`);
      }
    });

    // Check for failed Supabase requests
    const failedRequests: string[] = [];
    page.on(&apos;requestfailed&apos;, request => {
      const url = request.url();
      if (url.includes(&apos;supabase&apos;)) {
        const failure = request.failure();
        failedRequests.push(`Failed Supabase Request: ${url} - ${failure?.errorText || &apos;Unknown error&apos;}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (errors.length > 0) {
      console.log(&apos;Supabase Console Errors:&apos;, errors);
    }
    if (failedRequests.length > 0) {
      console.log(&apos;Failed Supabase Requests:&apos;, failedRequests);
    }

    // Assert no errors were found
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);
  });

  test(&apos;should handle auth state&apos;, async ({ page }) => {
    // Check if auth state is properly initialized
    const hasAuthError = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return html.includes(&apos;authentication error&apos;) || html.includes(&apos;auth error&apos;);
    });
    expect(hasAuthError).toBe(false);
  });

  test(&apos;should handle database queries&apos;, async ({ page }) => {
    // Monitor for database query errors
    const queryErrors: string[] = [];
    page.on(&apos;console&apos;, msg => {
      if (msg.type() === &apos;error&apos; && msg.text().toLowerCase().includes(&apos;query&apos;)) {
        queryErrors.push(`Query Error: ${msg.text()}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Assert no query errors
    expect(queryErrors.length).toBe(0);
  });

  test(&apos;should handle storage operations&apos;, async ({ page }) => {
    // Monitor for storage-related errors
    const storageErrors: string[] = [];
    page.on(&apos;console&apos;, msg => {
      if (msg.type() === &apos;error&apos; && msg.text().toLowerCase().includes(&apos;storage&apos;)) {
        storageErrors.push(`Storage Error: ${msg.text()}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Assert no storage errors
    expect(storageErrors.length).toBe(0);
  });
}); 