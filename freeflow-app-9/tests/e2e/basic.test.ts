import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // Wait for the page to be loaded
  await page.waitForLoadState('networkidle');
  
  // Check if we can access the page
  const title = await page.title();
  expect(title).toBeTruthy();
  
  // Check for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  
  // Check for failed requests
  const failedRequests: string[] = [];
  page.on('requestfailed', request => {
    const failure = request.failure();
    failedRequests.push(`Failed Request: ${request.url()} - ${failure?.errorText || 'Unknown error'}`);
  });
  
  // Wait a bit to catch any errors
  await page.waitForTimeout(2000);
  
  // Log any errors found
  if (errors.length > 0) {
    console.log('Console Errors:', errors);
  }
  if (failedRequests.length > 0) {
    console.log('Failed Requests:', failedRequests);
  }
  
  // Assert no errors were found
  expect(errors.length).toBe(0);
  expect(failedRequests.length).toBe(0);
}); 