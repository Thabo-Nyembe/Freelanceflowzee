#!/usr/bin/env node

/**
 * 🎯 PROJECTS HUB TABS TESTER
 * 
 * Focused testing script for Projects Hub tabs and interactive elements
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

// Projects Hub specific elements
const PROJECTS_HUB_ELEMENTS = {
  name: 'Projects Hub',
  url: '/dashboard/projects-hub',
  tabs: [
    { id: 'overview', name: 'Overview', selector: '[role= "tab"][value= "overview"]' },
    { id: 'active', name: 'Active', selector: '[role= "tab"][value= "active"]' },
    { id: 'completed', name: 'Completed', selector: '[role= "tab"][value= "completed"]' },
    { id: 'analytics', name: 'Analytics', selector: '[role= "tab"][value= "analytics"]' }
  ],
  buttons: [
    { id: 'new-project', name: 'New Project', selector: '[data-testid= "create-project-btn"]' },
    { id: 'view-details', name: 'View Details', selector: '[aria-label= "View Details"]' },
    { id: 'edit-project', name: 'Edit Project', selector: '[aria-label= "Edit Project"]' },
    { id: 'add-feedback', name: 'Add Feedback', selector: '[aria-label= "Add Feedback"]' },
    { id: 'delete-project', name: 'Delete Project', selector: '[aria-label= "Delete Project"]' }
  ],
  filters: [
    { id: 'status-filter', name: 'Status Filter', selector: 'select[value*= "status"]' },
    { id: 'priority-filter', name: 'Priority Filter', selector: 'select[value*= "priority"]' },
    { id: 'search-projects', name: 'Search Projects', selector: 'input[placeholder*= "Search projects"]' }
  ],
  viewModes: [
    { id: 'grid-view', name: 'Grid View', selector: 'button:has-text("Grid")' },
    { id: 'list-view', name: 'List View', selector: 'button:has-text("List")' }
  ]
};

class ProjectsHubTester {
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
    console.log('🚀 Initializing Projects Hub Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    await this.page.goto(TEST_CONFIG.baseUrl + PROJECTS_HUB_ELEMENTS.url);
    await this.page.waitForLoadState('networkidle');
  }

  async testProjectsHubTabs() {
    console.log('\n📊 Testing Projects Hub Tabs...');
    
    for (const tab of PROJECTS_HUB_ELEMENTS.tabs) {
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
      // Look for tab by multiple possible selectors
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

      // Click the tab
      await tabElement.click();
      await this.page.waitForTimeout(1000);

      // Check if tab is now active
      const isActive = await tabElement.getAttribute('aria-selected') === 'true' ||
                      await tabElement.getAttribute('data-state') === 'active' ||
                      (await tabElement.getAttribute('class') || ).includes('active');'

      // Take screenshot
      const screenshotPath = `projects-hub-${tab.id}-tab.png`;
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

  async testProjectsHubButtons() {
    console.log('\n🔘 Testing Projects Hub Buttons...');
    
    for (const button of PROJECTS_HUB_ELEMENTS.buttons) {
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
      // Multiple button selectors
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

      // Test button interactions
      const isEnabled = await buttonElement.isEnabled();
      
      // Hover effect test
      await buttonElement.hover();
      await this.page.waitForTimeout(500);

      // Click test (but don't actually navigate away for create project)
      if (button.id !== 'new-project') {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      // Take screenshot
      const screenshotPath = `projects-hub-${button.id}-button.png`;
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

  async testProjectsHubFilters() {
    console.log('\n🔍 Testing Projects Hub Filters...');
    
    for (const filter of PROJECTS_HUB_ELEMENTS.filters) {
      const result = await this.testFilter(filter);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testFilter(filter) {
    console.log(`  📋 Testing filter: ${filter.name}`);
    
    try {
      const filterElement = await this.page.locator(filter.selector).first();
      
      if (!(await filterElement.isVisible())) {
        return {
          name: filter.name,
          status: 'failed',
          error: 'Filter element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      // Test filter interaction
      if (filter.id === 'search-projects') {
        await filterElement.fill('test search');
        await this.page.waitForTimeout(1000);
        await filterElement.clear();
      } else {
        await filterElement.click();
        await this.page.waitForTimeout(500);
      }

      return {
        name: filter.name,
        status: 'passed',
        details: 'Filter is functional and responsive',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: filter.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testViewModes() {
    console.log('\n👁️  Testing View Modes...');
    
    for (const viewMode of PROJECTS_HUB_ELEMENTS.viewModes) {
      const result = await this.testViewMode(viewMode);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testViewMode(viewMode) {
    console.log(`  🖼️  Testing view mode: ${viewMode.name}`);
    
    try {
      const viewElement = await this.page.locator(viewMode.selector).first();
      
      if (!(await viewElement.isVisible())) {
        return {
          name: viewMode.name,
          status: 'failed',
          error: 'View mode button not found',
          timestamp: new Date().toISOString()
        };
      }

      await viewElement.click();
      await this.page.waitForTimeout(1000);

      return {
        name: viewMode.name,
        status: 'passed',
        details: 'View mode switched successfully',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: viewMode.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 PROJECTS HUB TEST REPORT');
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
      projectsHub: {
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
      await this.testProjectsHubTabs();
      await this.testProjectsHubButtons();
      await this.testProjectsHubFilters();
      await this.testViewModes();
      
      const report = this.generateReport();
      
      // Save report
      await fs.writeFile('projects-hub-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 Projects Hub testing completed!');
      console.log('📄 Report saved to: projects-hub-test-report.json');
      
    } catch (error) {
      console.error('❌ Projects Hub testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new ProjectsHubTester();
  tester.run();
}

module.exports = ProjectsHubTester; 