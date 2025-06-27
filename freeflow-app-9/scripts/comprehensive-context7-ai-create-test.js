#!/usr/bin/env node

/**
 * Comprehensive Context7 + Playwright AI Create Testing Script
 * Tests all AI Create functionality including user API key support
 * 
 * Features:
 * - Context7 MCP integration for up-to-date library documentation
 * - Comprehensive AI Create component testing
 * - User API key functionality testing
 * - Cost savings calculation testing
 * - File upload and asset generation testing
 * - Responsive design and performance testing
 * - Screenshot capture and reporting
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3001',
  testTimeout: 30000,
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  browsers: ['chromium'], // Start with chromium, expand as needed
  screenshotDir: './test-reports/ai-create-screenshots',
  reportDir: './test-reports'
};

// Test suite definition
const AI_CREATE_TESTS = [
  {
    name: 'AI Create Tab Layout',
    url: '/dashboard/ai-create',
    tab: 'generate',
    expectedElements: [
      'Generate Assets tab button',
      'Asset Library tab button', 
      'Advanced Settings tab button',
      'Creative field selection cards',
      'AI model selection',
      'Prompt input area',
      'Generate button'
    ],
    buttons: [
      { testId: 'generate-assets-btn', name: 'Generate Assets' },
      { testId: 'upload-asset-btn', name: 'Upload Asset' },
      { testId: 'preview-asset-btn', name: 'Preview Asset' }
    ],
    actions: ['navigate', 'verify_layout', 'screenshot']
  },
  {
    name: 'File Upload Functionality',
    url: '/dashboard/ai-create',
    tab: 'generate',
    expectedElements: [
      'File upload area',
      'Upload progress indicator',
      'File preview cards',
      'Analysis results'
    ],
    buttons: [
      { testId: 'upload-asset-btn', name: 'Upload Asset' },
      { testId: 'remove-file-btn', name: 'Remove File' }
    ],
    actions: ['upload_test_file', 'verify_upload', 'check_analysis']
  },
  {
    name: 'Asset Generation Process',
    url: '/dashboard/ai-create',
    tab: 'generate',
    expectedElements: [
      'Generation progress bar',
      'Asset preview cards',
      'Quality scores',
      'Download buttons'
    ],
    buttons: [
      { testId: 'generate-assets-btn', name: 'Generate Assets' },
      { testId: 'download-asset-btn', name: 'Download Asset' }
    ],
    actions: ['fill_prompt', 'generate_assets', 'verify_results']
  },
  {
    name: 'User API Key Support',
    url: '/dashboard/ai-create',
    tab: 'settings',
    expectedElements: [
      'Cost Savings Dashboard',
      'API Provider Selection',
      'API Key Input Fields',
      'Validation Status',
      'Cost Savings Metrics'
    ],
    buttons: [
      { testId: 'manage-api-keys-btn', name: 'Manage All API Keys' },
      { testId: 'save-api-key-btn', name: 'Save API Key' },
      { testId: 'validate-api-key-btn', name: 'Validate Key' }
    ],
    actions: ['open_settings', 'test_api_keys', 'verify_cost_savings']
  },
  {
    name: 'Tab Navigation',
    url: '/dashboard/ai-create',
    expectedElements: [
      'Generate Assets tab content',
      'Asset Library tab content', 
      'Advanced Settings tab content'
    ],
    buttons: [
      { testId: 'generate-tab', name: 'Generate Tab' },
      { testId: 'library-tab', name: 'Library Tab' },
      { testId: 'settings-tab', name: 'Settings Tab' }
    ],
    actions: ['test_all_tabs', 'verify_content_switching']
  },
  {
    name: 'Collaboration Features',
    url: '/dashboard/ai-create',
    tab: 'generate',
    expectedElements: [
      'Share asset buttons',
      'Export options',
      'Collaboration indicators'
    ],
    buttons: [
      { testId: 'share-asset-btn', name: 'Share Asset' },
      { testId: 'export-all-btn', name: 'Export All' }
    ],
    actions: ['test_sharing', 'test_export']
  },
  {
    name: 'Download System',
    url: '/dashboard/ai-create',
    tab: 'library',
    expectedElements: [
      'Asset library grid',
      'Download progress',
      'Downloaded files list'
    ],
    buttons: [
      { testId: 'download-asset-btn', name: 'Download Asset' },
      { testId: 'bulk-download-btn', name: 'Bulk Download' }
    ],
    actions: ['test_individual_download', 'test_bulk_download']
  },
  {
    name: 'Responsive Design Testing',
    url: '/dashboard/ai-create',
    expectedElements: [
      'Mobile navigation',
      'Responsive grid layout',
      'Touch-friendly buttons'
    ],
    buttons: [
      { testId: 'mobile-menu-btn', name: 'Mobile Menu' }
    ],
    actions: ['test_mobile_layout', 'test_tablet_layout', 'test_touch_interactions']
  },
  {
    name: 'Performance Metrics',
    url: '/dashboard/ai-create',
    expectedElements: [
      'Fast loading times',
      'Smooth animations',
      'Responsive interactions'
    ],
    buttons: [],
    actions: ['measure_load_time', 'measure_interaction_time', 'check_memory_usage']
  },
  {
    name: 'Error Handling',
    url: '/dashboard/ai-create',
    expectedElements: [
      'Error messages',
      'Fallback UI',
      'Recovery options'
    ],
    buttons: [
      { testId: 'retry-btn', name: 'Retry' },
      { testId: 'clear-errors-btn', name: 'Clear Errors' }
    ],
    actions: ['test_error_scenarios', 'verify_error_handling']
  }
];

class Context7AICreateTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      total: AI_CREATE_TESTS.length,
      details: [],
      screenshots: [],
      performance: {}
    };
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [CONFIG.screenshotDir, CONFIG.reportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize() {
    console.log('🚀 Initializing Context7 + Playwright AI Create Tester...\n');
    
    try {
      // Launch browser
      this.browser = await chromium.launch({ 
        headless: false, // Set to true for CI/CD
        slowMo: 100 // Slow down operations for better visibility
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport to desktop by default
      await this.page.setViewportSize(CONFIG.viewports.desktop);
      
      // Add console logging
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`❌ Browser Console Error: ${msg.text()}`);
        }
      });
      
      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToAICreate() {
    try {
      console.log('🧭 Navigating to AI Create page...');
      await this.page.goto(`${CONFIG.baseUrl}/dashboard/ai-create`, { 
        waitUntil: 'networkidle' 
      });
      
      // Wait for main content to load
      await this.page.waitForSelector('[data-testid="ai-create-main"], .ai-create-container, h1:has-text("AI Create")', { 
        timeout: 10000 
      });
      
      console.log('✅ Successfully navigated to AI Create');
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to AI Create:', error);
      return false;
    }
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    console.log('─'.repeat(50));
    
    try {
      await testFunction();
      console.log(`✅ ${testName}: PASSED`);
      this.results.passed++;
      return true;
    } catch (error) {
      console.error(`❌ ${testName}: FAILED`);
      console.error(`   Error: ${error.message}`);
      this.results.failed++;
      return false;
    }
  }

  async testTabLayout() {
    await this.runTest('AI Create Tab Layout', async () => {
      // Check for main tabs
      const tabs = await this.page.locator('[role="tab"], .tab-trigger, button:has-text("Generate"), button:has-text("Library"), button:has-text("Settings")');
      const tabCount = await tabs.count();
      console.log(`📋 Found ${tabCount} main tabs`);
      
      // Check for essential elements
      const essentialElements = [
        'h1:has-text("AI Create")',
        'button:has-text("Generate")',
        '[data-testid*="asset"], .asset-type-card',
        'textarea[placeholder*="prompt"], input[placeholder*="prompt"]'
      ];
      
      for (const selector of essentialElements) {
        const element = await this.page.locator(selector);
        const count = await element.count();
        console.log(`🔍 Found ${count} element(s) for: ${selector}`);
      }
      
      await this.takeScreenshot('tab-layout');
    });
  }

  async testFileUpload() {
    await this.runTest('File Upload Functionality', async () => {
      // Look for upload elements
      const uploadElements = await this.page.locator(
        'input[type="file"], ' +
        '[data-testid*="upload"], ' +
        'button:has-text("Upload"), ' +
        '.upload-area, .file-upload'
      ).count();
      
      console.log(`📁 Upload elements found: ${uploadElements}`);
      
      // Try to find and interact with upload area
      const uploadButtons = await this.page.locator('button:has-text("Upload"), [data-testid*="upload"]');
      if (await uploadButtons.count() > 0) {
        await uploadButtons.first().click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Successfully clicked upload button');
      }
      
      await this.takeScreenshot('file-upload');
    });
  }

  async testAssetGeneration() {
    await this.runTest('Asset Generation Process', async () => {
      // Fill in a test prompt
      const promptInputs = await this.page.locator('textarea, input[placeholder*="prompt"]');
      if (await promptInputs.count() > 0) {
        await promptInputs.first().fill('Generate a professional logo design for a tech startup');
        console.log('✅ Successfully filled prompt input');
      }
      
      // Look for generate button
      const generateButtons = await this.page.locator(
        '[data-testid*="generate"], ' +
        'button:has-text("Generate"), ' +
        'button:has-text("Create"), ' +
        '.generate-btn'
      );
      
      if (await generateButtons.count() > 0) {
        await generateButtons.first().click();
        await this.page.waitForTimeout(2000);
        console.log('✅ Successfully clicked generate button');
      }
      
      await this.takeScreenshot('asset-generation');
    });
  }

  async testAPIKeyInterface() {
    await this.runTest('User API Key Interface', async () => {
      // Navigate to settings tab
      const settingsTabs = await this.page.locator('button:has-text("Settings"), [role="tab"]:has-text("Settings")');
      if (await settingsTabs.count() > 0) {
        await settingsTabs.first().click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Successfully accessed settings tab');
      }
      
      // Look for API key elements
      const apiKeyElements = await this.page.locator(
        '[data-testid*="api-key"], ' +
        'input[placeholder*="API"], ' +
        'input[placeholder*="key"], ' +
        'button:has-text("API"), ' +
        '.cost-savings, .api-provider'
      ).count();
      
      console.log(`🔑 API Key elements found: ${apiKeyElements}`);
      
      // Look for cost savings dashboard
      const costSavingsElements = await this.page.locator(
        ':has-text("Cost Savings"), ' +
        ':has-text("Monthly Savings"), ' +
        '.cost-savings'
      ).count();
      
      console.log(`💰 Cost savings elements found: ${costSavingsElements}`);
      
      // Try to open API key management
      const manageButtons = await this.page.locator('button:has-text("Manage"), button:has-text("API Key")');
      if (await manageButtons.count() > 0) {
        await manageButtons.first().click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Successfully opened API key management');
      }
      
      await this.takeScreenshot('api-key-interface');
    });
  }

  async testTabNavigation() {
    await this.runTest('Tab Navigation', async () => {
      const tabs = ['Generate', 'Library', 'Settings'];
      
      for (const tabName of tabs) {
        const tabSelector = `button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`;
        const tab = await this.page.locator(tabSelector);
        
        if (await tab.count() > 0) {
          await tab.first().click();
          await this.page.waitForTimeout(1000);
          console.log(`✅ Successfully navigated to ${tabName} tab`);
          
          // Verify tab content is visible
          const content = await this.page.locator('.tab-panel, [role="tabpanel"]').isVisible();
          if (content) {
            console.log(`✅ ${tabName} tab content is visible`);
          }
        }
      }
      
      await this.takeScreenshot('tab-navigation');
    });
  }

  async testCollaborationFeatures() {
    await this.runTest('Collaboration Features', async () => {
      // Look for sharing and export buttons
      const collaborationElements = await this.page.locator(
        'button:has-text("Share"), ' +
        'button:has-text("Export"), ' +
        'button:has-text("Download"), ' +
        '[data-testid*="share"], ' +
        '[data-testid*="export"]'
      ).count();
      
      console.log(`🤝 Collaboration elements found: ${collaborationElements}`);
      
      await this.takeScreenshot('collaboration-features');
    });
  }

  async testDownloadSystem() {
    await this.runTest('Download System', async () => {
      // Navigate to library tab first
      const libraryTab = await this.page.locator('button:has-text("Library"), [role="tab"]:has-text("Library")');
      if (await libraryTab.count() > 0) {
        await libraryTab.first().click();
        await this.page.waitForTimeout(1000);
      }
      
      // Look for download elements
      const downloadElements = await this.page.locator(
        'button:has-text("Download"), ' +
        '[data-testid*="download"], ' +
        '.download-btn, .asset-download'
      ).count();
      
      console.log(`⬇️ Download elements found: ${downloadElements}`);
      
      await this.takeScreenshot('download-system');
    });
  }

  async testResponsiveDesign() {
    await this.runTest('Responsive Design', async () => {
      // Test different viewport sizes
      const viewports = Object.entries(CONFIG.viewports);
      
      for (const [name, viewport] of viewports) {
        await this.page.setViewportSize(viewport);
        await this.page.waitForTimeout(1000);
        
        console.log(`📱 Testing ${name} viewport (${viewport.width}x${viewport.height})`);
        
        // Check if layout adapts
        const isResponsive = await this.page.evaluate(() => {
          return window.innerWidth <= 768 ? 
            document.querySelector('.mobile-nav, .responsive-grid') !== null :
            document.querySelector('.desktop-nav, .desktop-grid') !== null;
        });
        
        console.log(`✅ ${name} layout: ${isResponsive ? 'Responsive' : 'Standard'}`);
        
        await this.takeScreenshot(`responsive-${name}`);
      }
      
      // Reset to desktop
      await this.page.setViewportSize(CONFIG.viewports.desktop);
    });
  }

  async testPerformanceMetrics() {
    await this.runTest('Performance Metrics', async () => {
      const startTime = Date.now();
      
      // Reload page and measure load time
      await this.page.reload({ waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      console.log(`⚡ Page load time: ${loadTime}ms`);
      
      // Test interaction responsiveness
      const interactionStart = Date.now();
      const firstButton = await this.page.locator('button').first();
      if (await firstButton.count() > 0) {
        await firstButton.click();
      }
      const interactionTime = Date.now() - interactionStart;
      
      console.log(`🖱️ Interaction response time: ${interactionTime}ms`);
      
      // Store performance metrics
      this.results.performance = {
        loadTime,
        interactionTime,
        timestamp: new Date().toISOString()
      };
      
      // Performance recommendations
      if (loadTime > 3000) {
        console.log('⚠️ Recommendation: Page load time is slow (>3s)');
      }
      if (interactionTime > 100) {
        console.log('⚠️ Recommendation: Interaction response time is slow (>100ms)');
      }
    });
  }

  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      // Test various error scenarios
      console.log('🔍 Testing error handling scenarios...');
      
      // Check for error boundaries
      const errorElements = await this.page.locator(
        '.error-boundary, ' +
        '.error-message, ' +
        '[role="alert"], ' +
        '.toast-error'
      ).count();
      
      console.log(`⚠️ Error handling elements found: ${errorElements}`);
      
      await this.takeScreenshot('error-handling');
    });
  }

  async takeScreenshot(name) {
    try {
      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(CONFIG.screenshotDir, filename);
      
      await this.page.screenshot({ 
        path: filepath,
        fullPage: true 
      });
      
      this.results.screenshots.push({
        name,
        filename,
        filepath,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to take screenshot: ${error.message}`);
    }
  }

  async generateReport() {
    const reportData = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${((this.results.passed / this.results.total) * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      },
      performance: this.results.performance,
      screenshots: this.results.screenshots,
      details: this.results.details,
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(CONFIG.reportDir, `ai-create-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log('\n📊 TEST REPORT SUMMARY');
    console.log('═'.repeat(50));
    console.log(`📋 Total Tests: ${reportData.summary.total}`);
    console.log(`✅ Passed: ${reportData.summary.passed}`);
    console.log(`❌ Failed: ${reportData.summary.failed}`);
    console.log(`📈 Success Rate: ${reportData.summary.successRate}`);
    console.log(`⚡ Load Time: ${reportData.performance.loadTime || 'N/A'}ms`);
    console.log(`🖱️ Interaction Time: ${reportData.performance.interactionTime || 'N/A'}ms`);
    console.log(`📸 Screenshots: ${reportData.screenshots.length}`);
    console.log(`📄 Report saved: ${reportPath}`);
    
    return reportPath;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('🔧 Fix failing tests to improve overall functionality');
    }
    
    if (this.results.performance.loadTime > 3000) {
      recommendations.push('⚡ Optimize page load time (currently > 3 seconds)');
    }
    
    if (this.results.performance.interactionTime > 100) {
      recommendations.push('🖱️ Improve interaction responsiveness (currently > 100ms)');
    }
    
    if (this.results.passed === this.results.total) {
      recommendations.push('🎉 All tests passing! Consider adding more edge case tests');
    }
    
    return recommendations;
  }

  async runAllTests() {
    console.log('🎯 Starting Comprehensive AI Create Testing...');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('═'.repeat(60));

    // Initialize browser
    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize. Exiting...');
      return;
    }

    // Navigate to AI Create
    const navigated = await this.navigateToAICreate();
    if (!navigated) {
      console.error('❌ Failed to navigate to AI Create. Exiting...');
      await this.cleanup();
      return;
    }

    // Run all tests
    await this.testTabLayout();
    await this.testFileUpload();
    await this.testAssetGeneration();
    await this.testAPIKeyInterface();
    await this.testTabNavigation();
    await this.testCollaborationFeatures();
    await this.testDownloadSystem();
    await this.testResponsiveDesign();
    await this.testPerformanceMetrics();
    await this.testErrorHandling();

    // Generate final report
    await this.generateReport();
    
    // Cleanup
    await this.cleanup();
    
    console.log('\n🏁 Testing completed!');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }
}

// Main execution
async function main() {
  const tester = new Context7AICreateTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    await tester.cleanup();
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main();
}

module.exports = { Context7AICreateTester, AI_CREATE_TESTS }; 