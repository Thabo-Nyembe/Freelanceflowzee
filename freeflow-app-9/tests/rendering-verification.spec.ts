import { test, expect } from '@playwright/test';

/**
 * Rendering Issues Verification Test Suite
 *
 * This test suite verifies that all rendering issues have been fixed,
 * specifically the OAuth routes that were causing prerender errors.
 */

const BASE_URL = 'http://localhost:9323';

test.describe('Rendering Issues Verification', () => {

  test.describe('OAuth Routes - No Prerender Errors', () => {

    test('Gmail OAuth route should load without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/api/integrations/gmail/auth`);

      // Should redirect (302/307) since OAuth is not configured with placeholder values
      expect(response?.status()).toBeLessThan(500);

      // Check that we're redirected to the setup page with an error message
      await page.waitForURL(/\/dashboard\/email-agent\/setup/);
      expect(page.url()).toContain('/dashboard/email-agent/setup');
      expect(page.url()).toContain('gmail=error');
      expect(page.url()).toContain('message=');
    });

    test('Outlook OAuth route should load without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/api/integrations/outlook/auth`);

      // Should redirect (302/307) since OAuth is not configured with placeholder values
      expect(response?.status()).toBeLessThan(500);

      // Check that we're redirected to the setup page with an error message
      await page.waitForURL(/\/dashboard\/email-agent\/setup/);
      expect(page.url()).toContain('/dashboard/email-agent/setup');
      expect(page.url()).toContain('outlook=error');
      expect(page.url()).toContain('message=');
    });

    test('Gmail OAuth error from provider should be handled', async ({ page }) => {
      // Simulate OAuth provider error
      await page.goto(`${BASE_URL}/api/integrations/gmail/auth?error=access_denied&error_description=User%20cancelled`);

      await page.waitForURL(/\/dashboard\/email-agent\/setup/);
      expect(page.url()).toContain('gmail=error');
      expect(page.url()).toContain('User%20cancelled');
    });

    test('Outlook OAuth error from provider should be handled', async ({ page }) => {
      // Simulate OAuth provider error
      await page.goto(`${BASE_URL}/api/integrations/outlook/auth?error=access_denied&error_description=User%20cancelled`);

      await page.waitForURL(/\/dashboard\/email-agent\/setup/);
      expect(page.url()).toContain('outlook=error');
      expect(page.url()).toContain('User%20cancelled');
    });
  });

  test.describe('Key Pages - Rendering Without Errors', () => {

    test('Homepage should render without errors', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      expect(response?.status()).toBe(200);

      // Check for no hydration errors
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.waitForLoadState('networkidle');

      // Filter out known deprecation warnings
      const criticalErrors = errors.filter(err =>
        !err.includes('punycode') &&
        !err.includes('DeprecationWarning')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('Dashboard should render without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard`);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      // Check that main dashboard elements are present
      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });

    test('Email Agent setup page should render without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/email-agent/setup`);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      // Page should load successfully
      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });

    test('Projects Hub should render without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/projects-hub`);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });

    test('AI Create should render without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/ai-create`);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });

    test('Video Studio should render without errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard/video-studio`);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });
  });

  test.describe('Error Handling Verification', () => {

    test('Gmail OAuth configuration error shows user-friendly message', async ({ page }) => {
      await page.goto(`${BASE_URL}/api/integrations/gmail/auth`);
      await page.waitForURL(/\/dashboard\/email-agent\/setup/);

      const url = new URL(page.url());
      const message = url.searchParams.get('message');

      expect(message).toBeTruthy();
      expect(message?.toLowerCase()).toContain('gmail');
      expect(message?.toLowerCase()).toContain('not configured');
    });

    test('Outlook OAuth configuration error shows user-friendly message', async ({ page }) => {
      await page.goto(`${BASE_URL}/api/integrations/outlook/auth`);
      await page.waitForURL(/\/dashboard\/email-agent\/setup/);

      const url = new URL(page.url());
      const message = url.searchParams.get('message');

      expect(message).toBeTruthy();
      expect(message?.toLowerCase()).toContain('outlook');
      expect(message?.toLowerCase()).toContain('not configured');
    });
  });

  test.describe('Build Verification', () => {

    test('No 404 errors on critical routes', async ({ page }) => {
      const criticalRoutes = [
        '/',
        '/dashboard',
        '/dashboard/email-agent/setup',
        '/dashboard/projects-hub',
        '/dashboard/ai-create',
        '/pricing',
        '/features'
      ];

      for (const route of criticalRoutes) {
        const response = await page.goto(`${BASE_URL}${route}`);
        expect(response?.status(), `Route ${route} should not return 404`).not.toBe(404);
        expect(response?.status(), `Route ${route} should not return 500`).not.toBe(500);
      }
    });

    test('API routes return valid responses', async ({ page }) => {
      const apiRoutes = [
        '/api/health',
      ];

      for (const route of apiRoutes) {
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'commit' });
        expect(response?.status(), `API route ${route} should return valid status`).toBeLessThan(500);
      }
    });
  });
});
