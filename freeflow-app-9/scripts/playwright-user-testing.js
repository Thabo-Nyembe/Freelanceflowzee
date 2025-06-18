#!/usr/bin/env node

const { chromium } = require('playwright');

// Test user credentials
const TEST_USER = {
  email: 'test@freeflowzee.com',
  password: 'TestUser123!'
};

const BASE_URL = 'http://localhost:3004';

// Test configuration
const BUTTON_TESTS = [
  {
    page: 'Dashboard',
    url: '/dashboard',
    buttons: [
      { testId: 'new-project-btn', name: 'New Project' },
      { testId: 'create-project-btn', name: 'Create Project' },
      { testId: 'create-invoice-btn', name: 'Create Invoice' },
      { testId: 'upload-files-btn', name: 'Upload Files' },
      { testId: 'schedule-meeting-btn', name: 'Schedule Meeting' }
    ]
  },
  {
    page: 'Projects Hub',
    url: '/dashboard/projects-hub',
    buttons: [
      { testId: 'create-project-btn', name: 'Create Project' },
      { testId: 'new-project-btn', name: 'New Project' }
    ]
  },
  {
    page: 'AI Create',
    url: '/dashboard/ai-create',
    buttons: [
      { testId: 'generate-assets-btn', name: 'Generate Assets' },
      { testId: 'preview-asset-btn', name: 'Preview Asset' },
      { testId: 'download-asset-btn', name: 'Download Asset' },
      { testId: 'upload-asset-btn', name: 'Upload Asset' },
      { testId: 'export-all-btn', name: 'Export All' }
    ]
  },
  {
    page: 'Video Studio',
    url: '/dashboard/video-studio',
    buttons: [
      { testId: 'create-video-btn', name: 'Create Video' },
      { testId: 'upload-media-btn', name: 'Upload Media' },
      { testId: 'upload-btn', name: 'Upload' }
    ]
  },
  {
    page: 'Escrow',
    url: '/dashboard/escrow',
    buttons: [
      { testId: 'create-escrow-btn', name: 'Create Escrow' },
      { testId: 'create-deposit-btn', name: 'Create Deposit' },
      { testId: 'add-milestone-btn', name: 'Add Milestone' }
    ]
  },
  {
    page: 'Time Tracking',
    url: '/dashboard/time-tracking',
    buttons: [
      { testId: 'start-timer-btn', name: 'Start Timer' },
      { testId: 'export-timesheet-btn', name: 'Export Timesheet' }
    ]
  }
];

class PlaywrightUserTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      login: { success: false, error: null },
      pages: {},
      buttons: {},
      summary: {
        totalPages: 0,
        successfulPages: 0,
        totalButtons: 0,
        workingButtons: 0,
        interactiveButtons: 0
      }
    };
  }

  async init() {
    console.log('🚀 Launching Playwright browser...');
    this.browser = await chromium.launch({ 
      headless: false, // Show browser for demo
      slowMo: 500 // Slow down for visibility
    });
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Browser launched successfully');
  }

  async login() {
    try {
      console.log('🔐 Logging in with test user...');
      
      // Navigate to login page
      await this.page.goto(`${BASE_URL}/login`);
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      await this.page.fill('input[type="email"]', TEST_USER.email);
      await this.page.fill('input[type="password"]', TEST_USER.password);
      
      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
      await this.page.waitForLoadState('networkidle');
      
      console.log('✅ Successfully logged in');
      this.results.login.success = true;
      
      // Take screenshot
      await this.page.screenshot({ path: 'login-success.png' });
      
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      this.results.login.error = error.message;
      throw error;
    }
  }

  async testPage(pageConfig) {
    try {
      console.log(`\n📍 Testing ${pageConfig.page}...`);
      
      // Navigate to page
      await this.page.goto(`${BASE_URL}${pageConfig.url}`);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000); // Wait for animations
      
      this.results.summary.totalPages++;
      this.results.pages[pageConfig.page] = {
        url: pageConfig.url,
        loaded: true,
        buttons: {},
        error: null
      };
      
      console.log(`   ✅ Page loaded: ${pageConfig.url}`);
      
      // Test each button
      for (const button of pageConfig.buttons) {
        await this.testButton(pageConfig.page, button);
      }
      
      this.results.summary.successfulPages++;
      
      // Take screenshot
      await this.page.screenshot({ 
        path: `${pageConfig.page.toLowerCase().replace(/\s+/g, '-')}-test.png` 
      });
      
    } catch (error) {
      console.log(`   ❌ Page failed: ${error.message}`);
      this.results.pages[pageConfig.page] = {
        url: pageConfig.url,
        loaded: false,
        error: error.message,
        buttons: {}
      };
    }
  }

  async testButton(pageName, buttonConfig) {
    try {
      this.results.summary.totalButtons++;
      
      // Check if button exists
      const button = await this.page.locator(`[data-testid="${buttonConfig.testId}"]`);
      const exists = await button.count() > 0;
      
      if (!exists) {
        console.log(`   ❌ Button not found: ${buttonConfig.name} (${buttonConfig.testId})`);
        this.results.buttons[`${pageName}-${buttonConfig.testId}`] = {
          exists: false,
          visible: false,
          clickable: false,
          error: 'Button not found'
        };
        return;
      }
      
      // Check if button is visible
      const visible = await button.isVisible();
      if (!visible) {
        console.log(`   ⚠️  Button hidden: ${buttonConfig.name}`);
        this.results.buttons[`${pageName}-${buttonConfig.testId}`] = {
          exists: true,
          visible: false,
          clickable: false,
          error: 'Button not visible'
        };
        return;
      }
      
      // Check if button is enabled/clickable
      const enabled = await button.isEnabled();
      if (!enabled) {
        console.log(`   ⚠️  Button disabled: ${buttonConfig.name}`);
        this.results.buttons[`${pageName}-${buttonConfig.testId}`] = {
          exists: true,
          visible: true,
          clickable: false,
          error: 'Button disabled'
        };
        return;
      }
      
      // Test click interaction
      const currentUrl = this.page.url();
      
      // Hover over button first
      await button.hover();
      await this.page.waitForTimeout(500);
      
      // Click button
      await button.click();
      await this.page.waitForTimeout(1500); // Wait for navigation/action
      
      // Check if URL changed or action occurred
      const newUrl = this.page.url();
      const urlChanged = currentUrl !== newUrl;
      
      if (urlChanged) {
        console.log(`   ✅ Button interactive: ${buttonConfig.name} → ${newUrl}`);
        this.results.summary.interactiveButtons++;
        
        // Navigate back to test other buttons
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
      } else {
        console.log(`   🟡 Button clicked: ${buttonConfig.name} (no navigation)`);
      }
      
      this.results.summary.workingButtons++;
      this.results.buttons[`${pageName}-${buttonConfig.testId}`] = {
        exists: true,
        visible: true,
        clickable: true,
        interactive: urlChanged,
        error: null
      };
      
    } catch (error) {
      console.log(`   ❌ Button error: ${buttonConfig.name} - ${error.message}`);
      this.results.buttons[`${pageName}-${buttonConfig.testId}`] = {
        exists: false,
        visible: false,
        clickable: false,
        error: error.message
      };
    }
  }

  generateReport() {
    console.log('\n📊 Playwright User Testing Results');
    console.log('=====================================');
    
    const pageSuccessRate = this.results.summary.totalPages > 0 ? 
      Math.round((this.results.summary.successfulPages / this.results.summary.totalPages) * 100) : 0;
    
    const buttonSuccessRate = this.results.summary.totalButtons > 0 ? 
      Math.round((this.results.summary.workingButtons / this.results.summary.totalButtons) * 100) : 0;
    
    const interactivityRate = this.results.summary.totalButtons > 0 ? 
      Math.round((this.results.summary.interactiveButtons / this.results.summary.totalButtons) * 100) : 0;
    
    console.log(`🔐 Login: ${this.results.login.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`📄 Pages: ${this.results.summary.successfulPages}/${this.results.summary.totalPages} loaded (${pageSuccessRate}%)`);
    console.log(`🔘 Buttons: ${this.results.summary.workingButtons}/${this.results.summary.totalButtons} working (${buttonSuccessRate}%)`);
    console.log(`⚡ Interactive: ${this.results.summary.interactiveButtons}/${this.results.summary.totalButtons} buttons (${interactivityRate}%)`);
    
    const overallScore = Math.round((
      (this.results.login.success ? 100 : 0) + 
      pageSuccessRate + 
      buttonSuccessRate + 
      interactivityRate
    ) / 4);
    
    console.log(`📈 Overall Score: ${overallScore}%`);
    
    if (overallScore >= 90) {
      console.log('🎉 EXCELLENT! User experience is outstanding!');
    } else if (overallScore >= 75) {
      console.log('✅ GOOD! Most user interactions work well.');
    } else if (overallScore >= 50) {
      console.log('🟡 PARTIAL! Some user experience issues.');
    } else {
      console.log('❌ NEEDS WORK! Significant user experience problems.');
    }
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      testUser: TEST_USER.email,
      results: this.results,
      scores: {
        login: this.results.login.success ? 100 : 0,
        pages: pageSuccessRate,
        buttons: buttonSuccessRate,
        interactivity: interactivityRate,
        overall: overallScore
      }
    };
    
    require('fs').writeFileSync('playwright-user-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to: playwright-user-test-results.json');
    console.log('📸 Screenshots saved for each page tested');
    
    return overallScore >= 75;
  }

  async run() {
    try {
      console.log('🧪 FreeflowZee User Testing with Playwright');
      console.log('===========================================');
      console.log(`👤 Test User: ${TEST_USER.email}`);
      console.log(`🌐 Base URL: ${BASE_URL}`);
      console.log('');
      
      await this.init();
      await this.login();
      
      // Test each page
      for (const pageConfig of BUTTON_TESTS) {
        await this.testPage(pageConfig);
      }
      
      const success = this.generateReport();
      
      console.log('\n🎬 Keeping browser open for 10 seconds for review...');
      await this.page.waitForTimeout(10000);
      
      await this.browser.close();
      console.log('✅ Browser closed');
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      if (this.browser) {
        await this.browser.close();
      }
      process.exit(1);
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new PlaywrightUserTester();
  tester.run();
}

module.exports = PlaywrightUserTester; 