import { Page, expect } from '@playwright/test';

export class TestHelpers {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Wait for app to be ready
  async waitForAppReady() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid]', { timeout: 15000 });
  }

  // Authentication helper with test mode
  async authenticateUser(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    try {
      await this.page.waitForURL('/dashboard', { timeout: 45000 });
    } catch (error) {
      // Take screenshot on failure
      await this.takeTimestampedScreenshot('auth-failure');
      throw error;
    }
  }

  async fillLoginForm(email: string, password: string) {
    // Wait for loading state to finish
    await this.page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 30000 });
    
    // Wait for form elements with increased timeout
    await this.page.waitForSelector('[data-testid="email-input"]', { timeout: 30000, state: 'visible' });
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
  }

  async submitLoginForm() {
    await this.page.click('[data-testid="login-button"]');
  }

  async checkForErrorMessage() {
    const errorElement = await this.page.locator('[data-testid="error-message"]');
    return errorElement.isVisible();
  }

  async getErrorMessage() {
    const errorElement = await this.page.locator('[data-testid="error-message"]');
    return errorElement.textContent();
  }

  async waitForLoginResponse() {
    // Wait for either success navigation or error message
    await Promise.race([
      this.page.waitForURL('/dashboard'),
      this.page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 5000 })
    ]);
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
  async waitForElement(selector: string, options = { timeout: 15000 }) {
    try {
      await this.page.waitForSelector(selector, options);
    } catch (error) {
      console.error(`Failed to find element: ${selector}`);
      await this.takeTimestampedScreenshot(`wait-failed-${selector}`);
      throw error;
    }
  }

  // Check if element exists
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0;
  }

  // Wait for network idle with timeout
  async waitForNetworkIdle(timeout = 15000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // Clear browser storage
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  // Mock API response
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  // Check for accessibility issues
  async checkAccessibility() {
    // Add your accessibility testing logic here
    // For example, using axe-core or similar tools
  }

  // Get all form validation errors
  async getFormValidationErrors() {
    return await this.page.evaluate(() => {
      const errors: string[] = [];
      document.querySelectorAll('[data-testid*="error"]').forEach((el) => {
        errors.push(el.textContent || '');
      });
      return errors;
    });
  }

  // Wait for page load with timeout
  async waitForPageLoad(timeout = 30000) {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded', { timeout }),
      this.page.waitForLoadState('networkidle', { timeout })
    ]);
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.navigateToDashboard();
      return true;
    } catch {
      return false;
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
