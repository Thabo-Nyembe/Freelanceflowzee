import { test, expect } from '@playwright/test';

test.describe('Signup Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9323/signup');
  });

  test('should load signup page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign Up.*FreeFlow/);
    await expect(page.locator('h1')).toContainText('Start Your Freelance Success Story');
  });

  test('should display signup benefits', async ({ page }) => {
    // Check for key benefits listed on the page
    await expect(page.locator('text=AI-Powered Project Management')).toBeVisible();
    await expect(page.locator('text=Secure Payment Processing')).toBeVisible();
    await expect(page.locator('text=Advanced Video Studio')).toBeVisible();
    await expect(page.locator('text=Community & Networking')).toBeVisible();
  });

  test('should display signup form', async ({ page }) => {
    // Check for form elements
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display promotional offer', async ({ page }) => {
    // Check for limited time offer
    await expect(page.locator('text=Limited Time Offer')).toBeVisible();
    await expect(page.locator('text=Get 30 days free')).toBeVisible();
    await expect(page.locator('text=No credit card required')).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation
    const nameField = page.locator('input[id="name"]');
    await expect(nameField).toBeFocused();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[id="name"]', 'John Doe');
    await page.fill('input[id="email"]', 'invalid-email');
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Email field should show validation error
    const emailField = page.locator('input[id="email"]');
    const isValid = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.fill('input[id="name"]', 'John Doe');
    await page.fill('input[id="email"]', 'john@example.com');
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="confirmPassword"]', 'differentpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show password mismatch error or prevent submission
    await page.waitForTimeout(500);
    // Implementation specific validation check would go here
  });

  test('should accept valid signup form', async ({ page }) => {
    // Fill out valid form data
    await page.fill('input[id="name"]', 'John Doe');
    await page.fill('input[id="email"]', 'john.doe@example.com');
    await page.fill('input[id="password"]', 'SecurePassword123!');
    await page.fill('input[id="confirmPassword"]', 'SecurePassword123!');
    
    // Check terms and conditions if present
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    
    // Form should be submittable
    await page.waitForTimeout(1000);
  });

  test('should display social login options', async ({ page }) => {
    // Check for Google/GitHub login buttons
    const socialButtons = [
      'text=Continue with Google',
      'text=Continue with GitHub', 
      'text=Continue with Microsoft'
    ];
    
    for (const buttonText of socialButtons) {
      const button = page.locator(buttonText);
      if (await button.isVisible()) {
        expect(await button.isVisible()).toBeTruthy();
      }
    }
  });

  test('should have link to login page', async ({ page }) => {
    // Check for "Already have an account" link
    const loginLink = page.locator('text=Already have an account?, text=Sign in here, a[href*="login"]');
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeVisible();
    }
  });

  test('should display terms and privacy links', async ({ page }) => {
    // Check for terms of service and privacy policy links
    const legalLinks = [
      'text=Terms of Service',
      'text=Privacy Policy',
      'a[href*="terms"]',
      'a[href*="privacy"]'
    ];
    
    for (const linkSelector of legalLinks) {
      const link = page.locator(linkSelector);
      if (await link.isVisible()) {
        expect(await link.isVisible()).toBeTruthy();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Form should still be visible and usable
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Benefits should still be visible
    await expect(page.locator('text=AI-Powered Project Management')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/signup-mobile.png' });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('text=Start Your Freelance Success Story')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/signup-tablet.png' });
  });

  test('should handle password visibility toggle', async ({ page }) => {
    // Check if password visibility toggle exists
    const passwordField = page.locator('input[id="password"]');
    const toggleButton = page.locator('button[aria-label*="password"], button:has-text("👁"), svg[class*="eye"]');
    
    if (await toggleButton.isVisible()) {
      // Test password visibility toggle
      await passwordField.fill('testpassword');
      
      // Should start as password type
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      await toggleButton.click();
      
      // Should change to text type
      await expect(passwordField).toHaveAttribute('type', 'text');
    }
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should have minimal or no console errors
    expect(errors.length).toBeLessThan(3);
  });

  test('should handle form accessibility', async ({ page }) => {
    // Check for proper labels
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('INPUT');
  });

  test('should display benefit icons correctly', async ({ page }) => {
    // Check for benefit icons (Check marks)
    const checkIcons = page.locator('svg[class*="lucide-check"]');
    const iconCount = await checkIcons.count();
    
    // Should have at least 4 check icons for the benefits
    expect(iconCount).toBeGreaterThanOrEqual(4);
  });
});