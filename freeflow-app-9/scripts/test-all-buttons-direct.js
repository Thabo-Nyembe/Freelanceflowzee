#!/usr/bin/env node

/**
 * 🎯 DIRECT BUTTON FUNCTIONALITY TESTER
 * 
 * Tests all interactive buttons and components across FreeflowZee 
 * dashboard pages without requiring authentication.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 10000,
  headless: false
};

// Pages and their expected buttons
const PAGES_TO_TEST = {
  dashboard: {
    url: '/dashboard',
    buttons: [
      { id: 'create-project-btn', name: 'Create Project', action: 'navigation' },
      { id: 'create-invoice-btn', name: 'Create Invoice', action: 'navigation' },
      { id: 'upload-files-btn', name: 'Upload Files', action: 'navigation' },
      { id: 'schedule-meeting-btn', name: 'Schedule Meeting', action: 'navigation' }
    ]
  },
  projectsHub: {
    url: '/dashboard/projects-hub',
    buttons: [
      { id: 'create-project-btn', name: 'Create Project', action: 'navigation' },
      { id: 'import-project-btn', name: 'Import Project', action: 'function' },
      { id: 'quick-start-btn', name: 'Quick Start', action: 'function' },
      { id: 'view-all-btn', name: 'View All', action: 'function' },
      { id: 'export-data-btn', name: 'Export Data', action: 'function' }
    ],
    tabs: ['overview', 'project-tracking', 'collaboration', 'client-galleries']
  },
  aiCreate: {
    url: '/dashboard/ai-create',
    buttons: [
      { id: 'generate-btn', name: 'Generate Content', action: 'function' }
    ],
    tabs: ['create', 'library', 'settings']
  },
  aiAssistant: {
    url: '/dashboard/ai-assistant',
    buttons: [
      { id: 'chat-button', name: 'Send Message', action: 'function' },
      { id: 'analyze-button', name: 'Analyze', action: 'function' },
      { id: 'generate-button', name: 'Generate', action: 'function' },
      { id: 'take-action-button', name: 'Take Action', action: 'function' }
    ],
    tabs: ['chat', 'analyze', 'generate', 'history']
  },
  myDay: {
    url: '/dashboard/my-day',
    buttons: [
      { id: 'add-task-btn', name: 'Add Task', action: 'function' },
      { id: 'generate-schedule-btn', name: 'Generate Schedule', action: 'function' },
      { id: 'view-calendar-btn', name: 'View Calendar', action: 'navigation' }
    ]
  },
  filesHub: {
    url: '/dashboard/files-hub',
    buttons: [
      { id: 'upload-file-btn', name: 'Upload File', action: 'function' },
      { id: 'new-folder-btn', name: 'New Folder', action: 'function' }
    ]
  },
  videoStudio: {
    url: '/dashboard/video-studio',
    buttons: [
      { id: 'create-video-btn', name: 'Create Video', action: 'function' },
      { id: 'upload-media-btn', name: 'Upload Media', action: 'function' },
      { id: 'upload-btn', name: 'Upload', action: 'function' }
    ]
  },
  escrow: {
    url: '/dashboard/escrow',
    buttons: [
      { id: 'create-escrow-btn', name: 'Create Escrow', action: 'function' },
      { id: 'create-deposit-btn', name: 'Create Deposit', action: 'function' },
      { id: 'add-milestone-btn', name: 'Add Milestone', action: 'function' }
    ]
  },
  communityHub: {
    url: '/dashboard/community-hub',
    buttons: [
      { id: 'create-post-btn', name: 'Create Post', action: 'function' }
    ]
  }
};

class DirectButtonTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Direct Button Tester...');
    this.browser = await chromium.launch({ 
      headless: TEST_CONFIG.headless,
      timeout: TEST_CONFIG.timeout 
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async testPage(pageKey, pageConfig) {
    console.log(`\n📄 Testing Page: ${pageKey}`);
    console.log(`🔗 URL: ${pageConfig.url}`);
    
    try {
      // Navigate to page
      await this.page.goto(`${TEST_CONFIG.baseUrl}${pageConfig.url}`);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000); // Let page fully load

      // Test tabs if present
      if (pageConfig.tabs) {
        await this.testTabs(pageKey, pageConfig.tabs);
      }

      // Test buttons
      if (pageConfig.buttons) {
        await this.testButtons(pageKey, pageConfig.buttons);
      }

      // Take screenshot
      await this.page.screenshot({ 
        path: `test-results/${pageKey}-page.png`,
        fullPage: true 
      });

    } catch (error) {
      console.log(`❌ Error testing page ${pageKey}: ${error.message}`);
      this.results.details.push({
        page: pageKey,
        status: 'failed',
        error: error.message
      });
    }
  }

  async testTabs(pageKey, tabs) {
    console.log(`  🗂️ Testing tabs for ${pageKey}...`);
    
    for (const tab of tabs) {
      try {
        // Try multiple tab selectors
        const tabSelectors = [
          `[role= "tab"][aria-selected= "false"]:has-text("${tab}")`,
          `[role= "tab"]:has-text("${tab}")`,
          `button:has-text("${tab}")`,
          `[data-value= "${tab}"]`
        ];

        let tabElement = null;
        for (const selector of tabSelectors) {
          try {
            tabElement = this.page.locator(selector).first();
            if (await tabElement.isVisible()) break;
          } catch (e) {
            continue;
          }
        }

        if (tabElement && await tabElement.isVisible()) {
          await tabElement.click();
          await this.page.waitForTimeout(1000);
          console.log(`    ✅ Tab "${tab}" clicked successfully`);
        } else {
          console.log(`    ⚠️ Tab "${tab}" not found`);
        }
      } catch (error) {
        console.log(`    ❌ Error testing tab "${tab}": ${error.message}`);
      }
    }
  }

  async testButtons(pageKey, buttons) {
    console.log(`  🔘 Testing buttons for ${pageKey}...`);
    
    for (const button of buttons) {
      try {
        const buttonElement = this.page.locator(`[data-testid= "${button.id}"]`).first();
        
        if (await buttonElement.isVisible()) {
          // Test button click based on expected action
          if (button.action === 'navigation') {
            // For navigation buttons, just verify they exist and are clickable
            const isEnabled = await buttonElement.isEnabled();
            if (isEnabled) {
              console.log(`    ✅ Navigation button "${button.name}" found and enabled`);
              this.results.passed++;
            } else {
              console.log(`    ⚠️ Navigation button "${button.name}" found but disabled`);
            }
          } else if (button.action === 'function') {
            // For function buttons, try to click and check for response
            await buttonElement.click();
            await this.page.waitForTimeout(500);
            console.log(`    ✅ Function button "${button.name}" clicked successfully`);
            this.results.passed++;
          }
        } else {
          console.log(`    ❌ Button "${button.name}" not found`);
          this.results.failed++;
        }
        
        this.results.total++;
      } catch (error) {
        console.log(`    ❌ Error testing button "${button.name}": ${error.message}`);
        this.results.failed++;
        this.results.total++;
      }
    }
  }

  async testAllPages() {
    console.log('\n🎯 Testing All Pages...');
    
    for (const [pageKey, pageConfig] of Object.entries(PAGES_TO_TEST)) {
      await this.testPage(pageKey, pageConfig);
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results,
      successRate: this.results.total > 0 ? 
        Math.round((this.results.passed / this.results.total) * 100) : 0
    };

    console.log('\n' + '='.repeat(60));'
    console.log('📊 DIRECT BUTTON TEST RESULTS');
    console.log('='.repeat(60));'
    console.log(`📈 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Success Rate: ${report.successRate}%`);

    // Save detailed report
    await fs.writeFile('test-results/direct-button-test-results.json',
      JSON.stringify(report, null, 2)
    );
    console.log('💾 Report saved to: test-results/direct-button-test-results.json');

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new DirectButtonTester();
  
  try {
    await tester.initialize();
    await tester.testAllPages();
    await tester.generateReport();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run the test
main().catch(console.error); 