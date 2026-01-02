import { test, expect } from '@playwright/test';

test.describe('Contact Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9323/contact');
  });

  test('should load contact page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact Us.*FreeFlow/);
    await expect(page.locator('h1')).toContainText('Contact Us');
  });

  test('should display contact form', async ({ page }) => {
    // Check for form elements
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[id="lastName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="subject"]')).toBeVisible();
    await expect(page.locator('textarea[id="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    // Check for contact details
    await expect(page.locator('text=hello@freeflow.app')).toBeVisible();
    await expect(page.locator('text=+1 (555) 123-4567')).toBeVisible();
    await expect(page.locator('text=123 Tech Street')).toBeVisible();
    await expect(page.locator('text=Mon-Fri: 9:00 AM - 6:00 PM PST')).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation (HTML5 validation or custom)
    const firstName = page.locator('input[id="firstName"]');
    await expect(firstName).toBeFocused();
  });

  test('should validate email format', async ({ page }) => {
    // Fill form with invalid email
    await page.fill('input[id="firstName"]', 'John');
    await page.fill('input[id="lastName"]', 'Doe');
    await page.fill('input[id="email"]', 'invalid-email');
    await page.fill('input[id="subject"]', 'Test Subject');
    await page.fill('textarea[id="message"]', 'Test message');
    
    await page.click('button[type="submit"]');
    
    // Email field should show validation error
    const emailField = page.locator('input[id="email"]');
    const isValid = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should fill out and submit contact form', async ({ page }) => {
    // Fill out the form
    await page.fill('input[id="firstName"]', 'John');
    await page.fill('input[id="lastName"]', 'Doe');
    await page.fill('input[id="email"]', 'john.doe@example.com');
    await page.fill('input[id="subject"]', 'Test Inquiry');
    await page.fill('textarea[id="message"]', 'This is a test message for the contact form.');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Form should be submittable (implementation specific)
    await page.waitForTimeout(1000);
  });

  test('should display quick help links', async ({ page }) => {
    // Check for FAQ/help links
    await expect(page.locator('text=Getting Started Guide')).toBeVisible();
    await expect(page.locator('text=Payment & Billing')).toBeVisible();
    await expect(page.locator('text=Technical Support')).toBeVisible();
    await expect(page.locator('text=Feature Requests')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Form should still be visible and usable
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('textarea[id="message"]')).toBeVisible();
    
    // Contact info should be visible
    await expect(page.locator('text=hello@freeflow.app')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/contact-mobile.png' });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('input[id="firstName"]')).toBeVisible();
    await expect(page.locator('text=Contact Us')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/contact-tablet.png' });
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
    await expect(page.locator('label[for="firstName"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="message"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('input[id="firstName"]')).toBeFocused();
  });

  test('should display contact icons correctly', async ({ page }) => {
    // Check for contact method icons (Mail, Phone, MapPin, Clock)
    const iconSelectors = [
      'svg[class*="lucide-mail"]',
      'svg[class*="lucide-phone"]', 
      'svg[class*="lucide-map-pin"]',
      'svg[class*="lucide-clock"]'
    ];
    
    for (const selector of iconSelectors) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });
});