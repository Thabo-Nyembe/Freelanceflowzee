import { test, expect } from &apos;@playwright/test&apos;;

test(&apos;basic test&apos;, async ({ page }) => {
  await page.goto(&apos;http://localhost:3001&apos;);
  
  // Wait for the page to be loaded
  await page.waitForLoadState(&apos;networkidle&apos;);
  
  // Check if we can access the page
  const title = await page.title();
  expect(title).toBeTruthy();
  
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
  
  // Wait a bit to catch any errors
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