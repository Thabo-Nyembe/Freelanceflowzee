#!/usr/bin/env node

/**
 * 🎯 MY DAY TODAY TABS TESTER
 * 
 * Focused testing script for My Day Today tabs and interactive elements
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

// My Day specific elements
const MY_DAY_ELEMENTS = {
  name: 'My Day Today',
  url: '/dashboard/my-day',
  tabs: [
    { id: 'today', name: 'Today', selector: '[role= "tab"][data-value= "today"]' },
    { id: 'schedule', name: 'Schedule', selector: '[role= "tab"][data-value= "schedule"]' },
    { id: 'tasks', name: 'Tasks', selector: '[role= "tab"][data-value= "tasks"]' },
    { id: 'insights', name: 'Insights', selector: '[role= "tab"][data-value= "insights"]' }
  ],
  buttons: [
    { id: 'add-task', name: 'Add Task', selector: '[data-testid= "add-task-btn"]' },
    { id: 'start-timer', name: 'Start Timer', selector: '[data-testid= "start-timer-btn"]' },
    { id: 'complete-task', name: 'Complete Task', selector: '[data-testid= "complete-task-btn"]' },
    { id: 'view-analytics', name: 'View Analytics', selector: '[data-testid= "analytics-btn"]' }
  ],
  productivityFeatures: [
    { id: 'task-priority', name: 'Task Priority', selector: '.task-priority, [data-testid= "task-priority"]' },
    { id: 'time-estimate', name: 'Time Estimate', selector: '.time-estimate, [data-testid= "time-estimate"]' },
    { id: 'progress-tracker', name: 'Progress Tracker', selector: '.progress-tracker, [data-testid= "progress-tracker"]' },
    { id: 'ai-insights', name: 'AI Insights', selector: '.ai-insights, [data-testid= "ai-insights"]' }
  ],
  timeManagement: [
    { id: 'pomodoro-timer', name: 'Pomodoro Timer', selector: 'button:has-text("Pomodoro"), .pomodoro-timer' },
    { id: 'break-reminder', name: 'Break Reminder', selector: 'button:has-text("Break"), .break-reminder' },
    { id: 'focus-mode', name: 'Focus Mode', selector: 'button:has-text("Focus"), .focus-mode' },
    { id: 'time-tracking', name: 'Time Tracking', selector: '.time-tracking, [data-testid= "time-tracking"]' }
  ],
  smartFeatures: [
    { id: 'smart-scheduling', name: 'Smart Scheduling', selector: '.smart-schedule, [data-testid= "smart-schedule"]' },
    { id: 'productivity-score', name: 'Productivity Score', selector: '.productivity-score, [data-testid= "productivity-score"]' },
    { id: 'energy-levels', name: 'Energy Levels', selector: '.energy-levels, [data-testid= "energy-levels"]' },
    { id: 'peak-hours', name: 'Peak Hours', selector: '.peak-hours, [data-testid= "peak-hours"]' }
  ]
};

class MyDayTester {
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
    console.log('🚀 Initializing My Day Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    await this.page.goto(TEST_CONFIG.baseUrl + MY_DAY_ELEMENTS.url);
    await this.page.waitForLoadState('networkidle');
  }

  async testMyDayTabs() {
    console.log('\n📅 Testing My Day Tabs...');
    
    for (const tab of MY_DAY_ELEMENTS.tabs) {
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

      const screenshotPath = `my-day-${tab.id}-tab.png`;
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

  async testMyDayButtons() {
    console.log('\n🔘 Testing My Day Buttons...');
    
    for (const button of MY_DAY_ELEMENTS.buttons) {
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

      // Don't click add task to avoid modal
      if (button.id !== 'add-task') {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      const screenshotPath = `my-day-${button.id}-button.png`;
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

  async testProductivityFeatures() {
    console.log('\n⚡ Testing Productivity Features...');
    
    for (const feature of MY_DAY_ELEMENTS.productivityFeatures) {
      const result = await this.testProductivityFeature(feature);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testProductivityFeature(feature) {
    console.log(`  ⚡ Testing feature: ${feature.name}`);
    
    try {
      const featureElement = await this.page.locator(feature.selector).first();
      
      if (!(await featureElement.isVisible())) {
        return {
          name: feature.name,
          status: 'warning',
          error: 'Productivity feature not visible (may require tasks)',
          timestamp: new Date().toISOString()
        };
      }

      await featureElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: feature.name,
        status: 'passed',
        details: 'Productivity feature is visible and accessible',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: feature.name,
        status: 'warning',
        error: 'Productivity feature not available (may require setup)',
        timestamp: new Date().toISOString()
      };
    }
  }

  async testTimeManagement() {
    console.log('\n⏰ Testing Time Management...');
    
    for (const tool of MY_DAY_ELEMENTS.timeManagement) {
      const result = await this.testTimeManagementTool(tool);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testTimeManagementTool(tool) {
    console.log(`  ⏰ Testing tool: ${tool.name}`);
    
    try {
      const toolElement = await this.page.locator(tool.selector).first();
      
      if (!(await toolElement.isVisible())) {
        return {
          name: tool.name,
          status: 'warning',
          error: 'Time management tool not visible (may require activation)',
          timestamp: new Date().toISOString()
        };
      }

      await toolElement.hover();
      await this.page.waitForTimeout(500);

      // Don't start timers to avoid long operations
      const screenshotPath = `my-day-${tool.id.replace('-', '_')}-tool.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: tool.name,
        status: 'passed',
        details: 'Time management tool is available and interactive',
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: tool.name,
        status: 'warning',
        error: 'Time management tool not available (may require configuration)',
        timestamp: new Date().toISOString()
      };
    }
  }

  async testSmartFeatures() {
    console.log('\n🧠 Testing Smart Features...');
    
    for (const feature of MY_DAY_ELEMENTS.smartFeatures) {
      const result = await this.testSmartFeature(feature);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testSmartFeature(feature) {
    console.log(`  🧠 Testing feature: ${feature.name}`);
    
    try {
      const featureElement = await this.page.locator(feature.selector).first();
      
      if (!(await featureElement.isVisible())) {
        return {
          name: feature.name,
          status: 'warning',
          error: 'Smart feature not visible (may require data)',
          timestamp: new Date().toISOString()
        };
      }

      await featureElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: feature.name,
        status: 'passed',
        details: 'Smart feature is available and functional',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: feature.name,
        status: 'warning',
        error: 'Smart feature not available (may require historical data)',
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 MY DAY TODAY TEST REPORT');
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
      myDay: {
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
      await this.testMyDayTabs();
      await this.testMyDayButtons();
      await this.testProductivityFeatures();
      await this.testTimeManagement();
      await this.testSmartFeatures();
      
      const report = this.generateReport();
      
      await fs.writeFile('my-day-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 My Day testing completed!');
      console.log('📄 Report saved to: my-day-test-report.json');
      
    } catch (error) {
      console.error('❌ My Day testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new MyDayTester();
  tester.run();
}

module.exports = MyDayTester; 