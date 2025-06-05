import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Wait for app to be ready
  async waitForAppReady() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid]', { timeout: 10000 });
  }

  // Authentication helper
  async authenticateUser(email = 'test@freeflowzee.com', password = 'test123') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.waitForAppReady();
  }

  // Dashboard navigation helper
  async navigateToDashboard() {
    await this.page.goto('/dashboard');
    await this.waitForAppReady();
    await expect(this.page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  }

  // Check for console errors
  async checkConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  // Take screenshot with timestamp
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  // Wait for element with better error handling
  async waitForElement(selector: string, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Element ${selector} not found within ${timeout}ms`);
      await this.takeTimestampedScreenshot(`element-not-found-${selector.replace(/[^\w]/g, '-')}`);
      throw error;
    }
  }

  // Verify no 404 errors on page
  async verifyNo404Errors() {
    const failed404s: string[] = [];
    
    this.page.on('response', (response) => {
      if (response.status() === 404) {
        failed404s.push(response.url());
      }
    });

    await this.page.waitForTimeout(2000); // Wait for resources to load
    
    if (failed404s.length > 0) {
      console.error('404 errors found:', failed404s);
      await this.takeTimestampedScreenshot('404-errors-found');
    }
    
    return failed404s;
  }

  // Mobile responsive testing helper
  async testMobileResponsiveness() {
    const viewports = [
      { width: 375, height: 667, name: 'iPhone' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000);
      await this.takeTimestampedScreenshot(`responsive-${viewport.name}`);
    }
  }

  // Performance testing helper
  async measurePagePerformance(pageName: string) {
    const navigationStart = await this.page.evaluate(() => performance.timing.navigationStart);
    const loadEventEnd = await this.page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadEventEnd - navigationStart;
    
    console.log(`${pageName} load time: ${loadTime}ms`);
    
    // Log performance metrics
    const performanceEntries = await this.page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    console.log(`${pageName} performance:`, performanceEntries);
    
    return { loadTime, performanceEntries };
  }
}
