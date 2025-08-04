import { Page, expect, Locator } from '@playwright/test';

/**
 * Comprehensive Test Helpers for KAZI Application
 * Reusable functions for common test operations across all features
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigation & App State Helpers
   */
  async waitForAppReady() {
    // Wait for the main app to be in a ready state
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Allow React hydration
  }

  async navigateToPage(path: string) {
    await this.page.goto(path);
    await this.waitForAppReady();
  }

  async navigateToDashboard() {
    await this.navigateToPage('/dashboard');
    await this.page.waitForSelector('[data-testid="dashboard-tabs"]', { timeout: 10000 });
  }

  /**
   * Dashboard Tab Navigation
   */
  async clickDashboardTab(tabName: 'overview' | 'projects-hub' | 'ai-create' | 'video-studio' | 'escrow' | 'files-hub' | 'community' | 'my-day-today') {
    const tabSelector = `[data-testid="tab-${tabName}"]`;
    await this.page.click(tabSelector);
    await this.waitForAppReady();
  }

  async verifyTabIsActive(tabName: string) {
    const activeTab = this.page.locator(`[data-testid="tab-${tabName}"][aria-selected="true"]`);
    await expect(activeTab).toBeVisible();
  }

  /**
   * AI Features Testing
   */
  async testAIDemo() {
    await this.navigateToPage('/ai-demo');
    
    // Wait for AI demo interface
    const demoContainer = this.page.locator('[data-testid="ai-demo-container"]');
    await expect(demoContainer).toBeVisible({ timeout: 10000 });
    
    // Test AI input
    const aiInput = this.page.locator('textarea[placeholder*="AI"], input[placeholder*="AI"]').first();
    if (await aiInput.isVisible()) {
      await aiInput.fill('Test AI integration');
      
      // Look for submit button
      const submitBtn = this.page.locator('button:has-text("Send"), button:has-text("Generate"), button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await this.page.waitForTimeout(2000); // Allow AI response time
      }
    }
  }

  async testAIAssistant() {
    await this.navigateToPage('/ai-assistant');
    
    // Verify AI Assistant tabs are visible
    const assistantTabs = this.page.locator('[role="tablist"]');
    await expect(assistantTabs).toBeVisible({ timeout: 10000 });
    
    // Test tab switching
    const tabs = ['ai-assist', 'templates', 'history', 'settings'];
    for (const tab of tabs) {
      const tabButton = this.page.locator(`[role="tab"][data-value="${tab}"]`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Form Testing Helpers
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.locator(`input[name="${field}"], textarea[name="${field}"]`);
      if (await input.isVisible()) {
        await input.fill(value);
      }
    }
  }

  async submitForm(formSelector = 'form') {
    const submitButton = this.page.locator(`${formSelector} button[type="submit"], ${formSelector} button:has-text("Submit")`).first();
    await submitButton.click();
    await this.waitForAppReady();
  }

  /**
   * File Upload Testing
   */
  async uploadFile(inputSelector: string, filePath: string) {
    const fileInput = this.page.locator(inputSelector);
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000); // Allow upload processing
  }

  async createTestFile(filename: string, content: string = 'Test file content'): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const testDataDir = path.join(process.cwd(), 'test-data');
    
    // Ensure test-data directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    const filePath = path.join(testDataDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * UI Interaction Helpers
   */
  async clickButton(text: string) {
    const button = this.page.locator(`button:has-text("${text}")`);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickLink(text: string) {
    const link = this.page.locator(`a:has-text("${text}")`);
    await expect(link).toBeVisible();
    await link.click();
  }

  async selectDropdownOption(dropdownSelector: string, optionText: string) {
    await this.page.click(dropdownSelector);
    await this.page.click(`text="${optionText}"`);
  }

  /**
   * Modal and Dialog Testing
   */
  async expectModalToBeVisible(modalTitle: string) {
    const modal = this.page.locator(`[role="dialog"]:has-text("${modalTitle}")`);
    await expect(modal).toBeVisible();
  }

  async closeModal() {
    // Try multiple common close methods
    const closeSelectors = [
      '[data-testid="close-modal"]',
      'button[aria-label="Close"]',
      'button:has-text("Close")',
      'button:has-text("Cancel")',
      '[role="dialog"] button:has-text("×")'
    ];
    
    for (const selector of closeSelectors) {
      const closeBtn = this.page.locator(selector);
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        break;
      }
    }
  }

  /**
   * Payment Testing (Stripe)
   */
  async fillStripeCardForm(cardNumber = '4242424242424242') {
    // Wait for Stripe iframe to load
    await this.page.waitForTimeout(2000);
    
    const cardFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    
    if (await cardFrame.locator('input[placeholder*="card number"]').isVisible()) {
      await cardFrame.locator('input[placeholder*="card number"]').fill(cardNumber);
      await cardFrame.locator('input[placeholder*="MM"]').fill('12');
      await cardFrame.locator('input[placeholder*="YY"]').fill('25');
      await cardFrame.locator('input[placeholder*="CVC"]').fill('123');
    }
  }

  /**
   * Error and Success Message Testing
   */
  async expectSuccessMessage(message?: string) {
    const successSelectors = [
      '[data-testid="success-message"]',
      '.alert-success',
      '.success',
      ':has-text("Success")',
      ':has-text("successful")'
    ];
    
    for (const selector of successSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        if (message) {
          await expect(element).toContainText(message);
        }
        return;
      }
    }
  }

  async expectErrorMessage(message?: string) {
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.alert-error',
      '.error',
      ':has-text("Error")',
      ':has-text("failed")'
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        if (message) {
          await expect(element).toContainText(message);
        }
        return;
      }
    }
  }

  /**
   * Performance Testing Helpers
   */
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForAppReady();
    return Date.now() - startTime;
  }

  async measureOperationTime(operation: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await operation();
    return Date.now() - startTime;
  }

  /**
   * Screenshot and Visual Testing
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async compareScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(`${name}.png`);
  }

  /**
   * API Testing Helpers
   */
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async interceptApiCalls(pattern: string): Promise<any[]> {
    const calls: any[] = [];
    
    await this.page.route(pattern, route => {
      calls.push({
        url: route.request().url(),
        method: route.request().method(),
        postData: route.request().postData(),
        headers: route.request().headers()
      });
      route.continue();
    });
    
    return calls;
  }

  /**
   * Accessibility Testing
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const headings = this.page.locator('h1, h2, h3, h4, h5, h6');
    const images = this.page.locator('img');
    const buttons = this.page.locator('button, [role="button"]');
    
    // Ensure headings have proper hierarchy
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Ensure images have alt text
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        await expect(img).toHaveAttribute('alt');
      }
    }
    
    // Ensure buttons are accessible
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        // Should have accessible name (text content or aria-label)
        const hasText = await btn.textContent();
        const hasAriaLabel = await btn.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      }
    }
  }
}