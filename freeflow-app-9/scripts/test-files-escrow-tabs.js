#!/usr/bin/env node

/**
 * 🎯 FILES HUB & ESCROW SYSTEM TABS TESTER
 * 
 * Focused testing script for Files Hub and Escrow System tabs and interactive elements
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

// Files Hub and Escrow specific elements
const FILES_ESCROW_ELEMENTS = {
  filesHub: {
    name: 'Files Hub',
    url: '/dashboard/files-hub',
    tabs: [
      { id: 'files', name: 'Files', selector: '[role= "tab"][data-value= "files"]' },
      { id: 'recent', name: 'Recent', selector: '[role= "tab"][data-value= "recent"]' },
      { id: 'shared', name: 'Shared', selector: '[role= "tab"][data-value= "shared"]' },
      { id: 'storage', name: 'Storage', selector: '[role= "tab"][data-value= "storage"]' },
      { id: 'analytics', name: 'Analytics', selector: '[role= "tab"][data-value= "analytics"]' }
    ],
    buttons: [
      { id: 'upload-file', name: 'Upload File', selector: '[data-testid= "upload-btn"]' },
      { id: 'create-folder', name: 'Create Folder', selector: '[data-testid= "folder-btn"]' },
      { id: 'share-file', name: 'Share File', selector: '[data-testid= "share-btn"]' },
      { id: 'download-file', name: 'Download File', selector: '[data-testid= "download-btn"]' }
    ]
  },
  escrowSystem: {
    name: 'Escrow System',
    url: '/dashboard/escrow',
    tabs: [
      { id: 'overview', name: 'Overview', selector: '[role= "tab"][data-value= "overview"]' },
      { id: 'deposits', name: 'Deposits', selector: '[role= "tab"][data-value= "deposits"]' },
      { id: 'milestones', name: 'Milestones', selector: '[role= "tab"][data-value= "milestones"]' },
      { id: 'transactions', name: 'Transactions', selector: '[role= "tab"][data-value= "transactions"]' }
    ],
    buttons: [
      { id: 'create-deposit', name: 'Create Deposit', selector: '[data-testid= "create-deposit-btn"]' },
      { id: 'release-funds', name: 'Release Funds', selector: '[data-testid= "release-funds-btn"]' },
      { id: 'add-milestone', name: 'Add Milestone', selector: '[data-testid= "add-milestone-btn"]' },
      { id: 'dispute-resolution', name: 'Dispute Resolution', selector: '[data-testid= "dispute-btn"]' }
    ]
  },
  fileFeatures: [
    { id: 'file-preview', name: 'File Preview', selector: '.file-preview, [data-testid= "file-preview"]' },
    { id: 'version-control', name: 'Version Control', selector: '.version-control, [data-testid= "version-control"]' },
    { id: 'file-comments', name: 'File Comments', selector: '.file-comments, [data-testid= "file-comments"]' },
    { id: 'access-control', name: 'Access Control', selector: '.access-control, [data-testid= "access-control"]' }
  ],
  escrowFeatures: [
    { id: 'payment-protection', name: 'Payment Protection', selector: '.payment-protection, [data-testid= "payment-protection"]' },
    { id: 'milestone-tracking', name: 'Milestone Tracking', selector: '.milestone-tracking, [data-testid= "milestone-tracking"]' },
    { id: 'auto-release', name: 'Auto Release', selector: '.auto-release, [data-testid= "auto-release"]' },
    { id: 'dispute-system', name: 'Dispute System', selector: '.dispute-system, [data-testid= "dispute-system"]' }
  ]
};

class FilesEscrowTester {
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
    console.log('🚀 Initializing Files Hub & Escrow Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
  }

  async testFilesHub() {
    console.log('\n📁 Testing Files Hub...');
    
    await this.page.goto(TEST_CONFIG.baseUrl + FILES_ESCROW_ELEMENTS.filesHub.url);
    await this.page.waitForLoadState('networkidle');

    // Test Files Hub tabs
    for (const tab of FILES_ESCROW_ELEMENTS.filesHub.tabs) {
      const result = await this.testTab(tab, 'files-hub');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }

    // Test Files Hub buttons
    for (const button of FILES_ESCROW_ELEMENTS.filesHub.buttons) {
      const result = await this.testButton(button, 'files-hub');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testEscrowSystem() {
    console.log('\n💰 Testing Escrow System...');
    
    await this.page.goto(TEST_CONFIG.baseUrl + FILES_ESCROW_ELEMENTS.escrowSystem.url);
    await this.page.waitForLoadState('networkidle');

    // Test Escrow System tabs
    for (const tab of FILES_ESCROW_ELEMENTS.escrowSystem.tabs) {
      const result = await this.testTab(tab, 'escrow');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }

    // Test Escrow System buttons
    for (const button of FILES_ESCROW_ELEMENTS.escrowSystem.buttons) {
      const result = await this.testButton(button, 'escrow');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testTab(tab, system) {
    console.log(`  🔍 Testing ${system} tab: ${tab.name}`);
    
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
          name: `${system}: ${tab.name}`,
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

      const screenshotPath = `${system}-${tab.id}-tab.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: `${system}: ${tab.name}`,
        status: isActive ? 'passed' : 'warning',
        details: isActive ? 'Tab activated successfully' : 'Tab clicked but activation unclear',
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: `${system}: ${tab.name}`,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testButton(button, system) {
    console.log(`  🎯 Testing ${system} button: ${button.name}`);
    
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
          name: `${system}: ${button.name}`,
          status: 'failed',
          error: 'Button element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      const isEnabled = await buttonElement.isEnabled();
      await buttonElement.hover();
      await this.page.waitForTimeout(500);

      // Don't click certain buttons to avoid modals/navigation
      const skipClick = ['upload-file', 'create-deposit', 'release-funds'].includes(button.id);
      if (!skipClick) {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      const screenshotPath = `${system}-${button.id}-button.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: `${system}: ${button.name}`,
        status: 'passed',
        details: `Button is ${isEnabled ? 'enabled' : 'disabled'} and interactive`,
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: `${system}: ${button.name}`,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testFileFeatures() {
    console.log('\n📎 Testing File Features...');
    
    await this.page.goto(TEST_CONFIG.baseUrl + FILES_ESCROW_ELEMENTS.filesHub.url);
    await this.page.waitForLoadState('networkidle');
    
    for (const feature of FILES_ESCROW_ELEMENTS.fileFeatures) {
      const result = await this.testFeature(feature, 'file');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testEscrowFeatures() {
    console.log('\n💸 Testing Escrow Features...');
    
    await this.page.goto(TEST_CONFIG.baseUrl + FILES_ESCROW_ELEMENTS.escrowSystem.url);
    await this.page.waitForLoadState('networkidle');
    
    for (const feature of FILES_ESCROW_ELEMENTS.escrowFeatures) {
      const result = await this.testFeature(feature, 'escrow');
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testFeature(feature, type) {
    console.log(`  ✨ Testing ${type} feature: ${feature.name}`);
    
    try {
      const featureElement = await this.page.locator(feature.selector).first();
      
      if (!(await featureElement.isVisible())) {
        return {
          name: `${type}: ${feature.name}`,
          status: 'warning',
          error: `${type} feature not visible (may require content)`,
          timestamp: new Date().toISOString()
        };
      }

      await featureElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: `${type}: ${feature.name}`,
        status: 'passed',
        details: `${type} feature is visible and accessible`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: `${type}: ${feature.name}`,
        status: 'warning',
        error: `${type} feature not available (may require setup)`,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 FILES HUB & ESCROW SYSTEM TEST REPORT');
    console.log('=' .repeat(60));'
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
      filesEscrow: {
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
      await this.testFilesHub();
      await this.testEscrowSystem();
      await this.testFileFeatures();
      await this.testEscrowFeatures();
      
      const report = this.generateReport();
      
      await fs.writeFile('files-escrow-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 Files Hub & Escrow System testing completed!');
      console.log('📄 Report saved to: files-escrow-test-report.json');
      
    } catch (error) {
      console.error('❌ Files Hub & Escrow System testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new FilesEscrowTester();
  tester.run();
}

module.exports = FilesEscrowTester; 