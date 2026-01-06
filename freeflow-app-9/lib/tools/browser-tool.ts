/**
 * Browser Automation Tool
 *
 * Provides Playwright-based browser automation for the Manus AI agent.
 * Inspired by OpenManus and OpenHands browser implementations.
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface BrowserAction {
  action: 'navigate' | 'screenshot' | 'click' | 'type' | 'scroll' | 'wait' | 'evaluate' | 'select' | 'hover' | 'press' | 'fill' | 'extract';
  url?: string;
  selector?: string;
  text?: string;
  key?: string;
  direction?: 'up' | 'down';
  amount?: number;
  timeout?: number;
  script?: string;
  value?: string;
  attribute?: string;
}

export interface BrowserResult {
  success: boolean;
  action: string;
  url?: string;
  screenshot?: string; // Base64 encoded
  title?: string;
  content?: string;
  error?: string;
  extractedData?: unknown;
  timestamp: string;
}

export interface BrowserToolConfig {
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
  userAgent?: string;
  proxy?: string;
}

/**
 * Browser Tool - Playwright-based automation
 */
export class BrowserTool {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserToolConfig;
  private isInitialized = false;

  constructor(config: BrowserToolConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      timeout: config.timeout ?? 30000,
      viewport: config.viewport ?? { width: 1280, height: 720 },
      userAgent: config.userAgent,
      proxy: config.proxy
    };
  }

  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const contextOptions: {
        viewport: { width: number; height: number };
        userAgent?: string;
        proxy?: { server: string };
      } = {
        viewport: this.config.viewport!
      };

      if (this.config.userAgent) {
        contextOptions.userAgent = this.config.userAgent;
      }

      if (this.config.proxy) {
        contextOptions.proxy = { server: this.config.proxy };
      }

      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.config.timeout!);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.page = null;
    this.isInitialized = false;
  }

  /**
   * Execute a browser action
   */
  async execute(action: BrowserAction): Promise<BrowserResult> {
    await this.initialize();

    if (!this.page) {
      return {
        success: false,
        action: action.action,
        error: 'Browser not initialized',
        timestamp: new Date().toISOString()
      };
    }

    try {
      switch (action.action) {
        case 'navigate':
          return await this.navigate(action.url!);
        case 'screenshot':
          return await this.screenshot();
        case 'click':
          return await this.click(action.selector!);
        case 'type':
          return await this.type(action.selector!, action.text!);
        case 'fill':
          return await this.fill(action.selector!, action.text!);
        case 'scroll':
          return await this.scroll(action.direction!, action.amount);
        case 'wait':
          return await this.wait(action.selector, action.timeout);
        case 'evaluate':
          return await this.evaluate(action.script!);
        case 'select':
          return await this.select(action.selector!, action.value!);
        case 'hover':
          return await this.hover(action.selector!);
        case 'press':
          return await this.press(action.key!);
        case 'extract':
          return await this.extract(action.selector!, action.attribute);
        default:
          return {
            success: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      return {
        success: false,
        action: action.action,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Navigate to a URL
   */
  private async navigate(url: string): Promise<BrowserResult> {
    await this.page!.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await this.page!.title();

    return {
      success: true,
      action: 'navigate',
      url: this.page!.url(),
      title,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Take a screenshot
   */
  private async screenshot(): Promise<BrowserResult> {
    const buffer = await this.page!.screenshot({
      type: 'png',
      fullPage: false
    });
    const screenshot = buffer.toString('base64');

    return {
      success: true,
      action: 'screenshot',
      url: this.page!.url(),
      screenshot,
      title: await this.page!.title(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Click an element
   */
  private async click(selector: string): Promise<BrowserResult> {
    await this.page!.click(selector);

    return {
      success: true,
      action: 'click',
      url: this.page!.url(),
      content: `Clicked element: ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Type text into an element
   */
  private async type(selector: string, text: string): Promise<BrowserResult> {
    await this.page!.type(selector, text);

    return {
      success: true,
      action: 'type',
      url: this.page!.url(),
      content: `Typed "${text}" into ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fill an input (clears first)
   */
  private async fill(selector: string, text: string): Promise<BrowserResult> {
    await this.page!.fill(selector, text);

    return {
      success: true,
      action: 'fill',
      url: this.page!.url(),
      content: `Filled "${text}" into ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scroll the page
   */
  private async scroll(direction: 'up' | 'down', amount: number = 500): Promise<BrowserResult> {
    const scrollAmount = direction === 'up' ? -amount : amount;
    await this.page!.evaluate((scrollY) => {
      window.scrollBy(0, scrollY);
    }, scrollAmount);

    return {
      success: true,
      action: 'scroll',
      url: this.page!.url(),
      content: `Scrolled ${direction} by ${amount}px`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wait for an element or timeout
   */
  private async wait(selector?: string, timeout: number = 5000): Promise<BrowserResult> {
    if (selector) {
      await this.page!.waitForSelector(selector, { timeout });
      return {
        success: true,
        action: 'wait',
        url: this.page!.url(),
        content: `Element found: ${selector}`,
        timestamp: new Date().toISOString()
      };
    } else {
      await this.page!.waitForTimeout(timeout);
      return {
        success: true,
        action: 'wait',
        url: this.page!.url(),
        content: `Waited ${timeout}ms`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Evaluate JavaScript in the page context
   */
  private async evaluate(script: string): Promise<BrowserResult> {
    const result = await this.page!.evaluate(script);

    return {
      success: true,
      action: 'evaluate',
      url: this.page!.url(),
      extractedData: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Select an option from a dropdown
   */
  private async select(selector: string, value: string): Promise<BrowserResult> {
    await this.page!.selectOption(selector, value);

    return {
      success: true,
      action: 'select',
      url: this.page!.url(),
      content: `Selected "${value}" in ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Hover over an element
   */
  private async hover(selector: string): Promise<BrowserResult> {
    await this.page!.hover(selector);

    return {
      success: true,
      action: 'hover',
      url: this.page!.url(),
      content: `Hovered over ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Press a key
   */
  private async press(key: string): Promise<BrowserResult> {
    await this.page!.keyboard.press(key);

    return {
      success: true,
      action: 'press',
      url: this.page!.url(),
      content: `Pressed key: ${key}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract data from elements
   */
  private async extract(selector: string, attribute?: string): Promise<BrowserResult> {
    const elements = await this.page!.$$(selector);
    const data: string[] = [];

    for (const element of elements) {
      if (attribute) {
        const value = await element.getAttribute(attribute);
        if (value) data.push(value);
      } else {
        const text = await element.textContent();
        if (text) data.push(text.trim());
      }
    }

    return {
      success: true,
      action: 'extract',
      url: this.page!.url(),
      extractedData: data,
      content: `Extracted ${data.length} items from ${selector}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string | null {
    return this.page?.url() || null;
  }

  /**
   * Get page content (HTML)
   */
  async getContent(): Promise<string | null> {
    if (!this.page) return null;
    return await this.page.content();
  }

  /**
   * Get page text content
   */
  async getTextContent(): Promise<string | null> {
    if (!this.page) return null;
    return await this.page.evaluate(() => document.body.innerText);
  }

  /**
   * Check if browser is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.page !== null;
  }
}

/**
 * Create a singleton browser tool instance
 */
let browserToolInstance: BrowserTool | null = null;

export function getBrowserTool(config?: BrowserToolConfig): BrowserTool {
  if (!browserToolInstance) {
    browserToolInstance = new BrowserTool(config);
  }
  return browserToolInstance;
}

/**
 * Cleanup browser tool
 */
export async function closeBrowserTool(): Promise<void> {
  if (browserToolInstance) {
    await browserToolInstance.close();
    browserToolInstance = null;
  }
}

export default BrowserTool;
