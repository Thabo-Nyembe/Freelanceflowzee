#!/usr/bin/env node

/**
 * 🔍 BUTTON DEBUGGING TEST
 * 
 * Detailed test to debug what buttons and elements are actually present
 */

const { chromium } = require('playwright');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: false,
  timeout: 10000
};

class ButtonDebugger {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🔍 Initializing Button Debugger...');
    this.browser = await chromium.launch({ 
      headless: TEST_CONFIG.headless,
      timeout: TEST_CONFIG.timeout 
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async debugPage(url, pageName) {
    console.log(`\n🔍 Debugging ${pageName}`);
    console.log(`📍 URL: ${url}`);
    
    try {
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000); // Extra wait for dynamic content

      // Check for all data-testid elements
      const testIdElements = await this.page.locator('[data-testid]').all();
      console.log(`  📊 Found ${testIdElements.length} elements with data-testid`);
      
      for (const element of testIdElements) {
        const testId = await element.getAttribute('data-testid');
        const isVisible = await element.isVisible();
        const isEnabled = await element.isEnabled();
        const tagName = await element.evaluate(el => el.tagName);
        const text = await element.textContent();
        
        console.log(`    🔘 ${testId}: ${tagName} - Visible: ${isVisible}, Enabled: ${isEnabled}, Text: "${text?.slice(0, 30)}..."`);
      }

      // Check for buttons by text content
      const allButtons = await this.page.locator('button').all();
      console.log(`  🔘 Found ${allButtons.length} button elements total`);
      
      for (const button of allButtons.slice(0, 10)) { // Limit to first 10
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        const testId = await button.getAttribute('data-testid');
        if (text && text.trim()) {
          console.log(`    Button: "${text.trim().slice(0, 30)}" - TestId: ${testId}, Visible: ${isVisible}`);
        }
      }

      // Check for tabs
      const tabs = await this.page.locator('[role="tab"]').all();
      console.log(`  📂 Found ${tabs.length} tab elements`);
      
      for (const tab of tabs) {
        const text = await tab.textContent();
        const isVisible = await tab.isVisible();
        const selected = await tab.getAttribute('aria-selected');
        console.log(`    Tab: "${text?.trim()}" - Visible: ${isVisible}, Selected: ${selected}`);
      }

      // Take screenshot for reference
      await this.page.screenshot({ 
        path: `debug-screenshots/${pageName.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true 
      });

    } catch (error) {
      console.log(`  ❌ Error debugging ${pageName}: ${error.message}`);
    }
  }

  async runDebugTests() {
    const pages = [
      { url: `${TEST_CONFIG.baseUrl}/dashboard`, name: 'Dashboard' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/projects-hub`, name: 'Projects Hub' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/ai-create`, name: 'AI Create' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/ai-assistant`, name: 'AI Assistant' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/files-hub`, name: 'Files Hub' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/my-day`, name: 'My Day' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/escrow`, name: 'Escrow' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/video-studio`, name: 'Video Studio' },
      { url: `${TEST_CONFIG.baseUrl}/dashboard/community-hub`, name: 'Community Hub' }
    ];

    for (const page of pages) {
      await this.debugPage(page.url, page.name);
    }
  }

  async testSpecificButton(url, testId, pageName) {
    console.log(`\n🧪 Testing specific button: ${testId} on ${pageName}`);
    
    try {
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      const button = this.page.locator(`[data-testid="${testId}"]`);
      const exists = await button.count() > 0;
      
      if (exists) {
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        const text = await button.textContent();
        
        console.log(`  ✅ Button found: ${testId}`);
        console.log(`    Text: "${text}"`);
        console.log(`    Visible: ${isVisible}`);
        console.log(`    Enabled: ${isEnabled}`);

        if (isVisible && isEnabled) {
          try {
            await button.click();
            await this.page.waitForTimeout(1000);
            console.log(`    ✅ Button clicked successfully`);
            
            // Check for any navigation or changes
            const currentUrl = this.page.url();
            console.log(`    Current URL after click: ${currentUrl}`);
            
          } catch (clickError) {
            console.log(`    ❌ Click failed: ${clickError.message}`);
          }
        }
      } else {
        console.log(`  ❌ Button not found: ${testId}`);
      }
    } catch (error) {
      console.log(`  ❌ Test error: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new ButtonDebugger();
  
  try {
    // Create debug directory
    const fs = require('fs');
    if (!fs.existsSync('debug-screenshots')) {
      fs.mkdirSync('debug-screenshots');
    }

    await tester.initialize();
    await tester.runDebugTests();
    
    // Test specific important buttons
    console.log('\n🎯 Testing Specific Important Buttons...');
    await tester.testSpecificButton(
      `${TEST_CONFIG.baseUrl}/dashboard/projects-hub`, 
      'create-project-btn', 
      'Projects Hub'
    );
    await tester.testSpecificButton(
      `${TEST_CONFIG.baseUrl}/dashboard/ai-create`, 
      'generate-btn', 
      'AI Create'
    );
    await tester.testSpecificButton(
      `${TEST_CONFIG.baseUrl}/dashboard`, 
      'create-project-btn', 
      'Dashboard'
    );

  } catch (error) {
    console.error('❌ Debug execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main().catch(console.error); 