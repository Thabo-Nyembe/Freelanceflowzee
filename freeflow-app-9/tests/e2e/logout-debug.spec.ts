import { test, expect } from '@playwright/test';

test.describe('Logout Debug Tests', () => {
  test('should find and click logout button', async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'valid-token');
    });
    
    await page.goto('http://localhost:9323/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check what page we're actually on
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log('Current URL:', currentUrl);
    console.log('Page title:', pageTitle);
    
    // Check page content
    const pageText = await page.textContent('body');
    console.log('Page contains "FreeflowZee":', pageText?.includes('FreeflowZee'));
    console.log('Page contains "Enterprise Dashboard":', pageText?.includes('Enterprise Dashboard'));
    console.log('Page contains "Overview":', pageText?.includes('Overview'));
    
    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/dashboard-before-logout.png' });
    
    // Check if logout button exists
    const logoutButton = page.locator('[data-testid="logout"]');
    console.log('Logout button visible:', await logoutButton.isVisible());
    
    if (await logoutButton.isVisible()) {
      console.log('Clicking logout button...');
      await logoutButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('Logout button not found. Looking for alternatives...');
      
      // Try other selectors
      const selectors = [
        'text=Log out',
        'text=Logout', 
        'text=Sign Out',
        'button:has-text("Log out")',
        'button:has-text("Logout")',
        '[aria-label="logout"]'
      ];
      
      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`Found logout with selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }
    
    // Check final token state
    const authToken = await page.evaluate(() => localStorage.getItem('auth-token'));
    console.log('Final auth token:', authToken);
    
    await page.screenshot({ path: 'test-results/dashboard-after-logout.png' });
    
    expect(authToken).toBeNull();
  });
});