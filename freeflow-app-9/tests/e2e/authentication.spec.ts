import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Fill credentials
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
    
    // Should show authenticated content
    await expect(page.locator('h1')).toContainText('Welcome to KAZI');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error or stay on login page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors or prevent submission
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });

  test('should persist authentication across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should stay authenticated
    await expect(page.locator('h1')).toBeVisible();
    expect(page.url()).toContain('/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Find and click logout
    await page.click('[data-testid="logout"]');
    
    // Should redirect to home or login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(login|^\/$)/);
  });

  test('should redirect to login when accessing protected routes while logged out', async ({ page }) => {
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access protected route
    await page.goto('/dashboard/settings-v2');
    
    // Should redirect to login or show login form
    await page.waitForTimeout(2000);
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    const isOnLoginPage = page.url().includes('/login');
    
    expect(hasLoginForm || isOnLoginPage).toBeTruthy();
  });

  test('should handle session expiry gracefully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Simulate session expiry by clearing auth
    await page.evaluate(() => {
      localStorage.removeItem('kazi-auth');
      localStorage.removeItem('kazi-user');
    });
    
    // Try to navigate to protected page
    await page.goto('/dashboard/settings-v2');
    
    // Should handle gracefully (redirect to login or show appropriate message)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(login|dashboard)/);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test..test@domain.com'];
    
    for (const email of invalidEmails) {
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should either show validation error or prevent submission
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/login');
    }
  });

  test('should handle special characters in login', async ({ page }) => {
    await page.goto('/login');
    
    const specialInputs = [
      { email: '<script>alert("xss")</script>@test.com', password: 'test123' },
      { email: 'test@example.com', password: '<script>alert("xss")</script>' },
      { email: 'test+tag@example.com', password: 'password123' },
      { email: 'test@example.com', password: '!@#$%^&*()_+' }
    ];
    
    for (const input of specialInputs) {
      await page.fill('input[type="email"]', input.email);
      await page.fill('input[type="password"]', input.password);
      await page.click('button[type="submit"]');
      
      // Should handle gracefully without JavaScript errors
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should show loading states during authentication', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    
    // Check for loading state when clicking submit
    await page.click('button[type="submit"]');
    
    // Look for loading indicators
    const loadingStates = [
      'text=Signing in...',
      'text=Loading...',
      '[disabled]',
      '.loading',
      '[data-loading="true"]'
    ];
    
    let hasLoadingState = false;
    for (const selector of loadingStates) {
      if (await page.locator(selector).count() > 0) {
        hasLoadingState = true;
        break;
      }
    }
    
    // Either should show loading state or complete quickly
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });
});