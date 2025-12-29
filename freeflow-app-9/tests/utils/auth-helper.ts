import { Page } from '@playwright/test';

/**
 * Authentication helper for Playwright tests
 * Handles login flow for protected routes
 */

// Test credentials
export const TEST_USER = {
  email: 'thabo@kaleidocraft.co.za',
  password: 'test12345'
};

/**
 * Login to the application
 */
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  // Navigate to login page
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Fill in email - try multiple selectors
  const emailInput = page.locator('input[type="email"], input#email, input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  // Fill in password - try multiple selectors
  const passwordInput = page.locator('input[type="password"], input#password, input[name="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(password);

  // Click login button - try multiple selectors
  const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")').first();
  await loginButton.click();

  // Wait for either redirect to dashboard or page change
  await Promise.race([
    page.waitForURL(/.*dashboard.*/, { timeout: 30000 }),
    page.waitForURL(/.*\/app.*/, { timeout: 30000 }),
    page.waitForNavigation({ timeout: 30000 })
  ]).catch(() => {
    // If no redirect, check if we're still on login with an error
    console.log('Login may have failed or page did not redirect');
  });

  // Additional wait for page to settle
  await page.waitForTimeout(2000);
}

/**
 * Check if user is on login page and login if needed
 */
export async function ensureAuthenticated(page: Page) {
  const currentUrl = page.url();

  if (currentUrl.includes('/login')) {
    await login(page);
  }
}

/**
 * Navigate to a protected route, handling login if needed
 */
export async function navigateToProtectedRoute(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');

  // Check if redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await login(page);
    // Navigate to intended route after login
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Try clicking logout button or navigate to logout endpoint
  const logoutButton = page.locator('text=Logout, text=Sign Out, button[aria-label="logout"]');

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    await page.goto('/api/auth/signout');
  }

  await page.waitForLoadState('networkidle');
}
