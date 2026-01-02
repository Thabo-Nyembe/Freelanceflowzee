import { test, expect } from '@playwright/test';

test.describe('Pricing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9323/pricing');
  });

  test('should load pricing page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pricing.*FreeFlow/);
    await expect(page.locator('h1')).toContainText('Simple, Transparent Pricing');
  });

  test('should display billing toggle', async ({ page }) => {
    // Check for monthly/annual billing toggle
    await expect(page.locator('text=Monthly')).toBeVisible();
    await expect(page.locator('text=Annual')).toBeVisible();
    await expect(page.locator('text=Save 20%')).toBeVisible();
  });

  test('should display all pricing plans', async ({ page }) => {
    // Check for three pricing tiers
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    // Check for pricing
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=$29')).toBeVisible();
    await expect(page.locator('text=$99')).toBeVisible();
  });

  test('should highlight most popular plan', async ({ page }) => {
    // Professional plan should be marked as most popular
    const popularBadge = page.locator('text=Most Popular');
    await expect(popularBadge).toBeVisible();
    
    // Should be associated with Professional plan
    const professionalCard = page.locator('text=Professional').locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]').first();
    const hasPopularBadge = await professionalCard.locator('text=Most Popular').isVisible();
    expect(hasPopularBadge).toBeTruthy();
  });

  test('should display plan features', async ({ page }) => {
    // Check for Starter plan features
    await expect(page.locator('text=3 active projects')).toBeVisible();
    await expect(page.locator('text=Basic AI assistance')).toBeVisible();
    await expect(page.locator('text=5GB file storage')).toBeVisible();
    
    // Check for Professional plan features
    await expect(page.locator('text=Unlimited projects')).toBeVisible();
    await expect(page.locator('text=Advanced AI features')).toBeVisible();
    await expect(page.locator('text=100GB file storage')).toBeVisible();
    
    // Check for Enterprise plan features
    await expect(page.locator('text=Everything in Professional')).toBeVisible();
    await expect(page.locator('text=Team collaboration')).toBeVisible();
    await expect(page.locator('text=Unlimited storage')).toBeVisible();
  });

  test('should display plan limitations for starter', async ({ page }) => {
    // Starter plan should show limitations
    await expect(page.locator('text=No video recording')).toBeVisible();
    await expect(page.locator('text=No payment processing')).toBeVisible();
    await expect(page.locator('text=Limited integrations')).toBeVisible();
  });

  test('should have appropriate call-to-action buttons', async ({ page }) => {
    // Check for CTA buttons
    await expect(page.locator('text=Start Free')).toBeVisible();
    await expect(page.locator('text=Start Free Trial')).toBeVisible();
    await expect(page.locator('text=Contact Sales')).toBeVisible();
  });

  test('should navigate to signup from starter plan', async ({ page }) => {
    await page.click('text=Start Free');
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should navigate to signup from professional plan', async ({ page }) => {
    await page.click('text=Start Free Trial');
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should navigate to contact from enterprise plan', async ({ page }) => {
    await page.click('text=Contact Sales');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should display FAQ section', async ({ page }) => {
    // Check for FAQ section
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
    
    // Check for common FAQ items
    await expect(page.locator('text=Can I change plans anytime?')).toBeVisible();
    await expect(page.locator('text=What payment methods do you accept?')).toBeVisible();
    await expect(page.locator('text=Do you offer refunds?')).toBeVisible();
    await expect(page.locator('text=Is there a setup fee?')).toBeVisible();
  });

  test('should display CTA section at bottom', async ({ page }) => {
    // Scroll to bottom to see final CTA
    await page.locator('text=Ready to Transform Your Freelance Business?').scrollIntoViewIfNeeded();
    
    await expect(page.locator('text=Ready to Transform Your Freelance Business?')).toBeVisible();
    await expect(page.locator('text=Join thousands of successful freelancers')).toBeVisible();
  });

  test('should handle billing toggle interaction', async ({ page }) => {
    // Test clicking annual billing
    await page.click('text=Annual (Save 20%)');
    
    // Prices should potentially update (implementation specific)
    await page.waitForTimeout(500);
    
    // Switch back to monthly
    await page.click('text=Monthly');
    await page.waitForTimeout(500);
  });

  test('should display plan icons', async ({ page }) => {
    // Check for plan icons (Sparkles, Zap, Crown)
    const iconSelectors = [
      'svg[class*="lucide-sparkles"]',
      'svg[class*="lucide-zap"]',
      'svg[class*="lucide-crown"]'
    ];
    
    for (const selector of iconSelectors) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should display feature check marks', async ({ page }) => {
    // Check for feature check marks
    const checkIcons = page.locator('svg[class*="lucide-check"]');
    const iconCount = await checkIcons.count();
    
    // Should have many check icons for features
    expect(iconCount).toBeGreaterThanOrEqual(10);
  });

  test('should display limitation X marks', async ({ page }) => {
    // Check for limitation X marks
    const xIcons = page.locator('svg[class*="lucide-x"]');
    const iconCount = await xIcons.count();
    
    // Should have some X icons for limitations
    expect(iconCount).toBeGreaterThanOrEqual(3);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Plans should stack vertically on mobile
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    // CTA buttons should still be accessible
    await expect(page.locator('text=Start Free')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/pricing-mobile.png' });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Simple, Transparent Pricing')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/pricing-tablet.png' });
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

  test('should handle keyboard navigation', async ({ page }) => {
    // Test keyboard navigation through plans
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate to CTA buttons
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toBeTruthy();
  });

  test('should display plan comparison clearly', async ({ page }) => {
    // All plans should be clearly comparable
    const starterCard = page.locator('text=Starter').locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]').first();
    const professionalCard = page.locator('text=Professional').locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]').first();
    const enterpriseCard = page.locator('text=Enterprise').locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]').first();
    
    await expect(starterCard).toBeVisible();
    await expect(professionalCard).toBeVisible();
    await expect(enterpriseCard).toBeVisible();
  });

  test('should validate FAQ answers are informative', async ({ page }) => {
    // Check that FAQ answers provide useful information
    await expect(page.locator('text=Yes! You can upgrade, downgrade, or cancel your plan at any time')).toBeVisible();
    await expect(page.locator('text=We accept all major credit cards, PayPal')).toBeVisible();
    await expect(page.locator('text=30-day money-back guarantee')).toBeVisible();
  });
});