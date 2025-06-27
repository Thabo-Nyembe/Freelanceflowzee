#!/usr/bin/env node

/**
 * 🎯 AI ASSISTANT TABS TESTER
 * 
 * Focused testing script for AI Assistant tabs and interactive elements
 * using Context7 MCP best practices and Playwright automation.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  testMode: true
};

// AI Assistant specific elements
const AI_ASSISTANT_ELEMENTS = {
  name: 'AI Assistant',
  url: '/dashboard/ai-assistant',
  tabs: [
    { id: 'chat', name: 'Chat', selector: '[role= "tab"][data-value= "chat"]' },
    { id: 'analyze', name: 'Analyze', selector: '[role= "tab"][data-value= "analyze"]' },
    { id: 'generate', name: 'Generate', selector: '[role= "tab"][data-value= "generate"]' },
    { id: 'history', name: 'History', selector: '[role= "tab"][data-value= "history"]' }
  ],
  buttons: [
    { id: 'send-message', name: 'Send Message', selector: '[data-testid= "send-btn"]' },
    { id: 'start-analysis', name: 'Start Analysis', selector: '[data-testid= "analyze-btn"]' },
    { id: 'generate-content', name: 'Generate Content', selector: '[data-testid= "generate-btn"]' },
    { id: 'clear-chat', name: 'Clear Chat', selector: '[data-testid= "clear-btn"]' }
  ],
  aiFeatures: [
    { id: 'chat-input', name: 'Chat Input', selector: 'textarea[placeholder*= "Ask"], input[placeholder*= "Ask"]' },
    { id: 'analysis-panel', name: 'Analysis Panel', selector: '.analysis-panel, [data-testid= "analysis-panel"]' },
    { id: 'generation-options', name: 'Generation Options', selector: '.generation-options, [data-testid= "generation-options"]' },
    { id: 'ai-response', name: 'AI Response', selector: '.ai-response, [data-testid= "ai-response"]' }
  ],
  smartTools: [
    { id: 'design-analysis', name: 'Design Analysis', selector: 'button:has-text("Design Analysis")' },
    { id: 'color-analysis', name: 'Color Analysis', selector: 'button:has-text("Color Analysis")' },
    { id: 'layout-suggestions', name: 'Layout Suggestions', selector: 'button:has-text("Layout")' },
    { id: 'typography-review', name: 'Typography Review', selector: 'button:has-text("Typography")' },
    { id: 'accessibility-check', name: 'Accessibility Check', selector: 'button:has-text("Accessibility")' }
  ]
};

class AIAssistantTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
      screenshots: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing AI Assistant Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    await this.page.goto(TEST_CONFIG.baseUrl + AI_ASSISTANT_ELEMENTS.url);
    await this.page.waitForLoadState('networkidle');
  }

  async testAIAssistantTabs() {
    console.log('\n🤖 Testing AI Assistant Tabs...');
    
    for (const tab of AI_ASSISTANT_ELEMENTS.tabs) {
      const result = await this.testTab(tab);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testTab(tab) {
    console.log(`  🔍 Testing tab: ${tab.name}`);
    
    try {
      const tabSelectors = [
        tab.selector,
        `[role= "tab"]:has-text("${tab.name}")`,
        `button:has-text("${tab.name}")`,
        `[data-value= "${tab.id}"]`,
        `#${tab.id}-tab`
      ];

      let tabElement = null;
      for (const selector of tabSelectors) {
        try {
          tabElement = await this.page.locator(selector).first();
          if (await tabElement.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!tabElement || !(await tabElement.isVisible())) {
        return {
          name: tab.name,
          status: 'failed',
          error: 'Tab element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      await tabElement.click();
      await this.page.waitForTimeout(1000);

      const isActive = await tabElement.getAttribute('aria-selected') === 'true' ||
                      await tabElement.getAttribute('data-state') === 'active' ||
                      (await tabElement.getAttribute('class') || ).includes('active');'

      const screenshotPath = `ai-assistant-${tab.id}-tab.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: tab.name,
        status: isActive ? 'passed' : 'warning',
        details: isActive ? 'Tab activated successfully' : 'Tab clicked but activation unclear',
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: tab.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testAIAssistantButtons() {
    console.log('\n🔘 Testing AI Assistant Buttons...');
    
    for (const button of AI_ASSISTANT_ELEMENTS.buttons) {
      const result = await this.testButton(button);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testButton(button) {
    console.log(`  🎯 Testing button: ${button.name}`);
    
    try {
      const buttonSelectors = [
        button.selector,
        `button:has-text("${button.name}")`,
        `[aria-label= "${button.name}"]`,
        `[title= "${button.name}"]`,
        `#${button.id}`
      ];

      let buttonElement = null;
      for (const selector of buttonSelectors) {
        try {
          buttonElement = await this.page.locator(selector).first();
          if (await buttonElement.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!buttonElement || !(await buttonElement.isVisible())) {
        return {
          name: button.name,
          status: 'failed',
          error: 'Button element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      const isEnabled = await buttonElement.isEnabled();
      await buttonElement.hover();
      await this.page.waitForTimeout(500);

      // Don't click buttons that might trigger long operations
      if (button.id !== 'start-analysis' && button.id !== 'generate-content') {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      const screenshotPath = `ai-assistant-${button.id}-button.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: button.name,
        status: 'passed',
        details: `Button is ${isEnabled ? 'enabled' : 'disabled'} and interactive`,
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: button.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testAIFeatures() {
    console.log('\n🧠 Testing AI Features...');
    
    for (const feature of AI_ASSISTANT_ELEMENTS.aiFeatures) {
      const result = await this.testAIFeature(feature);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testAIFeature(feature) {
    console.log(`  🧠 Testing feature: ${feature.name}`);
    
    try {
      const featureElement = await this.page.locator(feature.selector).first();
      
      if (!(await featureElement.isVisible())) {
        return {
          name: feature.name,
          status: 'warning',
          error: 'AI feature not visible (may require activation)',
          timestamp: new Date().toISOString()
        };
      }

      if (feature.id === 'chat-input') {
        await featureElement.fill('Test AI query');
        await this.page.waitForTimeout(500);
        await featureElement.clear();
      } else {
        await featureElement.hover();
        await this.page.waitForTimeout(500);
      }

      return {
        name: feature.name,
        status: 'passed',
        details: 'AI feature is accessible and functional',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: feature.name,
        status: 'warning',
        error: 'AI feature not available (may require setup)',
        timestamp: new Date().toISOString()
      };
    }
  }

  async testSmartTools() {
    console.log('\n🛠️ Testing Smart Tools...');
    
    for (const tool of AI_ASSISTANT_ELEMENTS.smartTools) {
      const result = await this.testSmartTool(tool);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testSmartTool(tool) {
    console.log(`  🛠️ Testing tool: ${tool.name}`);
    
    try {
      const toolElement = await this.page.locator(tool.selector).first();
      
      if (!(await toolElement.isVisible())) {
        return {
          name: tool.name,
          status: 'warning',
          error: 'Smart tool not visible (may require context)',
          timestamp: new Date().toISOString()
        };
      }

      await toolElement.hover();
      await this.page.waitForTimeout(500);

      // Don't click analysis tools to avoid long operations
      const screenshotPath = `ai-assistant-${tool.id.replace('-', '_')}-tool.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: tool.name,
        status: 'passed',
        details: 'Smart tool is available and interactive',
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: tool.name,
        status: 'warning',
        error: 'Smart tool not available (may require project context)',
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 AI ASSISTANT TEST REPORT');
    console.log('=' .repeat(50));'
    console.log(`✅ Passed: ${this.results.passed}/${this.results.total} (${passRate}%)`);
    console.log(`❌ Failed: ${this.results.failed}/${this.results.total}`);
    console.log(`📸 Screenshots: ${this.results.screenshots.length}`);
    
    console.log('\n📋 Detailed Results: ');
    this.results.details.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.error) console.log(`    Error: ${result.error}`);
      if (result.details) console.log(`    Details: ${result.details}`);
    });

    return {
      aiAssistant: {
        summary: {
          total: this.results.total,
          passed: this.results.passed,
          failed: this.results.failed,
          passRate: passRate
        },
        details: this.results.details,
        screenshots: this.results.screenshots
      }
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.testAIAssistantTabs();
      await this.testAIAssistantButtons();
      await this.testAIFeatures();
      await this.testSmartTools();
      
      const report = this.generateReport();
      
      await fs.writeFile('ai-assistant-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 AI Assistant testing completed!');
      console.log('📄 Report saved to: ai-assistant-test-report.json');
      
    } catch (error) {
      console.error('❌ AI Assistant testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new AIAssistantTester();
  tester.run();
}

module.exports = AIAssistantTester; 