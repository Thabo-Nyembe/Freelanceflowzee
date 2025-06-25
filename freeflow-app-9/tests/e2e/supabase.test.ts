import { test, expect } from '@playwright/test';

test.describe('Supabase Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('should load without Supabase connection errors', async ({ page }) => {
    // Check for Supabase-related console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('supabase')) {
        errors.push(`Supabase Error: ${msg.text()}`);
      }
    });

    // Check for failed Supabase requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      const url = request.url();
      if (url.includes('supabase')) {
        const failure = request.failure();
        failedRequests.push(`Failed Supabase Request: ${url} - ${failure?.errorText || 'Unknown error'}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (errors.length > 0) {
      console.log('Supabase Console Errors:', errors);
    }
    if (failedRequests.length > 0) {
      console.log('Failed Supabase Requests:', failedRequests);
    }

    // Assert no errors were found
    expect(errors.length).toBe(0);
    expect(failedRequests.length).toBe(0);
  });

  test('should handle auth state', async ({ page }) => {
    // Check if auth state is properly initialized
    const hasAuthError = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return html.includes('authentication error') || html.includes('auth error');
    });
    expect(hasAuthError).toBe(false);
  });

  test('should handle database queries', async ({ page }) => {
    // Monitor for database query errors
    const queryErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('query')) {
        queryErrors.push(`Query Error: ${msg.text()}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Assert no query errors
    expect(queryErrors.length).toBe(0);
  });

  test('should handle storage operations', async ({ page }) => {
    // Monitor for storage-related errors
    const storageErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('storage')) {
        storageErrors.push(`Storage Error: ${msg.text()}`);
      }
    });

    // Wait for any potential errors
    await page.waitForTimeout(2000);

    // Assert no storage errors
    expect(storageErrors.length).toBe(0);
  });
}); 