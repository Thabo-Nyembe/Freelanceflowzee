import { Page, expect } from &apos;@playwright/test&apos;;

export class TestHelpers {
  constructor(protected readonly page: Page) {}

  async goto() {
    await this.page.goto(&apos;/');'
    await this.waitForLoadState();
  }

  async waitForLoadState() {
    await this.page.waitForLoadState(&apos;networkidle&apos;);
  }

  async measureLoadTime(): Promise<number> {
    const metrics = await this.page.evaluate(() => {
      const { navigationStart, loadEventEnd } = performance.timing;
      return loadEventEnd - navigationStart;
    });
    
    console.log(`Page load time: ${metrics}ms`);
    return metrics;
  }

  // Wait for app to be ready
  async waitForAppReady() {
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.page.waitForSelector(&apos;[data-testid]&apos;, { timeout: 10000 });
  }

  // Authentication helper
  async authenticateUser(email = &apos;test@freeflowzee.com&apos;, password = &apos;testpassword&apos;) {
    await this.page.goto(&apos;/login&apos;);
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
    await this.waitForLoginResponse();
  }

  // Dashboard navigation helper
  async navigateToDashboard() {
    await this.page.goto(&apos;/dashboard&apos;);
    await this.waitForAppReady();
    await expect(this.page.locator(&apos;[data-testid=&quot;dashboard-container&quot;]&apos;)).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    // Wait for form to be ready
    await this.page.waitForSelector(&apos;[data-testid=&quot;login-form&quot;]&apos;, { timeout: 10000 });
    
    // Fill email
    await this.page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, email);
    
    // Fill password
    await this.page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, password);
  }

  async submitLoginForm() {
    await this.page.click(&apos;[data-testid=&quot;submit-button&quot;]&apos;);
  }

  async waitForLoginResponse() {
    try {
      // Wait for either successful navigation or error message
      await Promise.race([
        this.page.waitForURL(&apos;/dashboard&apos;, { timeout: 10000 }),
        this.page.waitForSelector(&apos;[data-testid=&quot;error-message&quot;]&apos;, { state: &apos;visible&apos;, timeout: 5000 })
      ]);
    } catch (error) {
      // Take screenshot on failure
      await this.takeTimestampedScreenshot(&apos;login-failure&apos;);
      throw error;
    }
  }

  async checkForErrorMessage() {
    const errorMessage = this.page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    return await errorMessage.isVisible();
  }

  async getErrorMessage() {
    const errorMessage = this.page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    return null;
  }

  // Take screenshot with timestamp
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, &apos;-');'
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  // Check for console errors
  async checkConsoleErrors() {
    const errors: string[] = [];
    this.page.on(&apos;console&apos;, (msg) => {
      if (msg.type() === &apos;error&apos;) {
        errors.push(msg.text());
      }
    });
    return errors;
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
    await this.page.waitForLoadState(&apos;networkidle&apos;, { timeout });
  }

  // Clear browser storage
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  // Mock API response
  async mockApiResponse(url: string, response: unknown) {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify(response)
      });
    });
  }

  // Check for accessibility issues
  async checkAccessibility() {
    const headings = await this.page.locator(&apos;h1, h2, h3&apos;).count();
    const buttons = await this.page.locator(&apos;button&apos;).count();
    const images = await this.page.locator(&apos;img[alt]&apos;).count();
    
    console.log(`
      Accessibility check results:
      - Headings: ${headings}
      - Buttons: ${buttons}
      - Images with alt text: ${images}
    `);
    
    return { headings, buttons, images };
  }

  // Get all form validation errors
  async getFormValidationErrors() {
    return await this.page.evaluate(() => {
      const errors: string[] = [];
      document.querySelectorAll(&apos;[data-testid*=&quot;error&quot;]&apos;).forEach((el) => {
        errors.push(el.textContent || '&apos;);'
      });
      return errors;
    });
  }

  // Wait for page load with timeout
  async waitForPageLoad(timeout = 30000) {
    await Promise.all([
      this.page.waitForLoadState(&apos;domcontentloaded&apos;, { timeout }),
      this.page.waitForLoadState(&apos;networkidle&apos;, { timeout })
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
    
    this.page.on(&apos;response&apos;, (response) => {
      if (response.status() === 404) {
        failed404s.push(response.url());
      }
    });

    await this.page.waitForTimeout(2000); // Wait for resources to load
    
    if (failed404s.length > 0) {
      console.error(&apos;404 errors found:&apos;, failed404s);
      await this.takeTimestampedScreenshot(&apos;404-errors-found&apos;);
    }
    
    return failed404s;
  }

  // Mobile responsive testing helper
  async testMobileResponsiveness() {
    const viewports = [
      { width: 375, height: 667, name: &apos;iPhone&apos; },
      { width: 768, height: 1024, name: &apos;iPad&apos; },
      { width: 1920, height: 1080, name: &apos;Desktop&apos; }
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
    
    console.log(`Performance metrics for ${pageName}:
      - Load time: ${loadTime}ms
      - Navigation start: ${navigationStart}
      - Load event end: ${loadEventEnd}
    `);
    
    return {
      loadTime,
      navigationStart,
      loadEventEnd
    };
  }
}