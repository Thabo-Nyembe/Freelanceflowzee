const { chromium } = require('playwright');

// Test user credentials
const TEST_CREDENTIALS = {
  email: 'test@freeflowzee.com',
  password: 'TestUser123!'
};

// Comprehensive list of all create/add buttons to test
const BUTTON_TEST_MATRIX = {
  dashboard: {
    name: 'Dashboard',
    url: 'http://localhost:3000/dashboard',
    buttons: [
      { testId: 'header-new-project-btn', name: 'Header New Project', expectsRoute: '/dashboard/projects-hub' },
      { testId: 'create-project-btn', name: 'Quick Action - Create Project', expectsRoute: '/dashboard/projects-hub' },
      { testId: 'create-invoice-btn', name: 'Quick Action - Create Invoice', expectsRoute: '/dashboard/invoices' },
      { testId: 'upload-files-btn', name: 'Quick Action - Upload Files', expectsRoute: '/dashboard/files-hub' },
      { testId: 'schedule-meeting-btn', name: 'Quick Action - Schedule Meeting', expectsRoute: '/dashboard/calendar' }
    ]
  },
  projectsHub: {
    name: 'Projects Hub',
    url: 'http://localhost:3000/dashboard/projects-hub',
    buttons: [
      { testId: 'create-project-btn', name: 'Create Project', expectsRoute: '/projects/new' },
      { testId: 'import-project-btn', name: 'Import Project', expectsAlert: true },
      { testId: 'quick-start-btn', name: 'Quick Start', expectsAlert: true }
    ]
  },
  filesHub: {
    name: 'Files Hub',
    url: 'http://localhost:3000/dashboard/files-hub',
    buttons: [
      { testId: 'upload-file-btn', name: 'Upload File', expectsFunction: true },
      { testId: 'new-folder-btn', name: 'New Folder', expectsFunction: true }
    ]
  },
  aiCreate: {
    name: 'AI Create',
    url: 'http://localhost:3000/dashboard/ai-create',
    buttons: [
      { testId: 'generate-assets-btn', name: 'Generate Assets', expectsFunction: true },
      { testId: 'upload-asset-btn', name: 'Upload Asset', expectsFunction: true },
      { testId: 'export-all-btn', name: 'Export All', expectsFunction: true },
      { testId: 'preview-asset-btn', name: 'Preview Asset', expectsFunction: true },
      { testId: 'download-asset-btn', name: 'Download Asset', expectsFunction: true }
    ]
  },
  videoStudio: {
    name: 'Video Studio',
    url: 'http://localhost:3000/dashboard/video-studio',
    buttons: [
      { testId: 'create-video-btn', name: 'Create Video', expectsAlert: true },
      { testId: 'upload-media-btn', name: 'Upload Media', expectsAlert: true },
      { testId: 'upload-btn', name: 'Upload Button', expectsFunction: true },
      { testId: 'export-btn', name: 'Export', expectsAlert: true }
    ]
  },
  community: {
    name: 'Community Hub',
    url: 'http://localhost:3000/dashboard/community',
    buttons: [
      { testId: 'create-post-btn', name: 'Create Post', expectsFunction: true }
    ]
  },
  myDay: {
    name: 'My Day',
    url: 'http://localhost:3000/dashboard/my-day',
    buttons: [
      { testId: 'add-task-btn', name: 'Add Task', expectsFunction: true },
      { testId: 'generate-schedule-btn', name: 'Generate Schedule', expectsAlert: true },
      { testId: 'view-calendar-btn', name: 'View Calendar', expectsRoute: '/dashboard/calendar' }
    ]
  },
  escrow: {
    name: 'Escrow System',
    url: 'http://localhost:3000/dashboard/escrow',
    buttons: [
      { testId: 'create-escrow-btn', name: 'Create Escrow', expectsAlert: true },
      { testId: 'create-deposit-btn', name: 'Create Deposit', expectsAlert: true },
      { testId: 'add-milestone-btn', name: 'Add Milestone', expectsAlert: true },
      { testId: 'release-funds-btn', name: 'Release Funds', expectsFunction: true }
    ]
  },
  timeTracking: {
    name: 'Time Tracking',
    url: 'http://localhost:3000/dashboard/time-tracking',
    buttons: [
      { testId: 'start-timer-btn', name: 'Start Timer', expectsFunction: true },
      { testId: 'add-manual-entry-btn', name: 'Add Manual Entry', expectsAlert: true },
      { testId: 'export-timesheet-btn', name: 'Export Timesheet', expectsAlert: true }
    ]
  }
};

class ComprehensiveButtonTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
    this.browser = null;
    this.page = null;
  }

  async setup() {
    console.log('🚀 Setting up browser...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down for visibility
    });
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async login() {
    console.log('🔐 Logging in...');
    
    try {
      await this.page.goto('http://localhost:3000/login');
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      await this.page.fill('input[type="email"]', TEST_CREDENTIALS.email);
      await this.page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      
      // Submit form
      await this.page.click('button[type="submit"]');
      await this.page.waitForLoadState('networkidle');
      
      // Wait for dashboard
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
      
      console.log('✅ Login successful');
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      this.results.errors.push(`Login failed: ${error.message}`);
      return false;
    }
  }

  async testButton(pageKey, button) {
    const pageName = BUTTON_TEST_MATRIX[pageKey].name;
    const testName = `${pageName} - ${button.name}`;
    
    console.log(`\\n🔍 Testing: ${testName}`);
    
    try {
      // Find the button
      const buttonElement = await this.page.locator(`[data-testid="${button.testId}"]`);
      
      if (!(await buttonElement.count())) {
        throw new Error(`Button with test ID "${button.testId}" not found`);
      }

      // Check if button is visible and enabled
      await buttonElement.waitFor({ state: 'visible', timeout: 5000 });
      
      if (!(await buttonElement.isEnabled())) {
        throw new Error('Button is disabled');
      }

      // Setup for different types of expected behavior
      let dialogPromise = null;
      let navigationPromise = null;

      if (button.expectsAlert) {
        // Setup dialog handler for alert
        dialogPromise = this.page.waitForEvent('dialog', { timeout: 3000 });
      } else if (button.expectsRoute) {
        // Setup navigation watcher
        navigationPromise = this.page.waitForURL(`**${button.expectsRoute}`, { timeout: 5000 });
      }

      // Click the button
      await buttonElement.click();
      await this.page.waitForTimeout(1000); // Give time for action to trigger

      // Verify expected behavior
      if (button.expectsAlert && dialogPromise) {
        const dialog = await dialogPromise;
        await dialog.accept();
        console.log(`  ✅ Alert triggered: "${dialog.message()}"`);
      } else if (button.expectsRoute && navigationPromise) {
        await navigationPromise;
        console.log(`  ✅ Navigation to ${button.expectsRoute} successful`);
        // Navigate back to the original page
        await this.page.goto(BUTTON_TEST_MATRIX[pageKey].url);
        await this.page.waitForLoadState('networkidle');
      } else if (button.expectsFunction) {
        // For function buttons, just verify click was successful
        console.log(`  ✅ Function button clicked successfully`);
      }

      this.results.passed++;
      this.results.details.push({
        test: testName,
        status: 'PASSED',
        message: 'Button working correctly'
      });

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`${testName}: ${error.message}`);
      this.results.details.push({
        test: testName,
        status: 'FAILED',
        message: error.message
      });
    }
  }

  async testPage(pageKey) {
    const pageData = BUTTON_TEST_MATRIX[pageKey];
    console.log(`\\n📄 Testing page: ${pageData.name}`);
    
    try {
      // Navigate to page
      await this.page.goto(pageData.url);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000); // Extra wait for dynamic content
      
      console.log(`  ✅ Successfully loaded ${pageData.name}`);
      
      // Test each button on this page
      for (const button of pageData.buttons) {
        this.results.total++;
        await this.testButton(pageKey, button);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to load ${pageData.name}: ${error.message}`);
      this.results.errors.push(`Page load failed for ${pageData.name}: ${error.message}`);
      
      // Mark all buttons as failed for this page
      pageData.buttons.forEach(button => {
        this.results.total++;
        this.results.failed++;
        this.results.details.push({
          test: `${pageData.name} - ${button.name}`,
          status: 'FAILED',
          message: `Page failed to load: ${error.message}`
        });
      });
    }
  }

  async runAllTests() {
    console.log('🧪 COMPREHENSIVE CREATE/ADD BUTTON TEST');
    console.log('=' .repeat(60));
    
    if (!(await this.login())) {
      return this.results;
    }

    // Test each page
    for (const pageKey of Object.keys(BUTTON_TEST_MATRIX)) {
      await this.testPage(pageKey);
    }

    return this.results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE BUTTON TEST REPORT');
    console.log('='.repeat(60));
    
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    console.log(`\\n📈 Summary:`);
    console.log(`   Total Tests: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed} ✅`);
    console.log(`   Failed: ${this.results.failed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log(`\\n❌ Failed Tests:`);
      this.results.details
        .filter(detail => detail.status === 'FAILED')
        .forEach(detail => {
          console.log(`   • ${detail.test}: ${detail.message}`);
        });
    }
    
    if (this.results.errors.length > 0) {
      console.log(`\\n🚨 Errors:`);
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    console.log(`\\n🎯 Pages Tested:`);
    Object.keys(BUTTON_TEST_MATRIX).forEach(pageKey => {
      const pageData = BUTTON_TEST_MATRIX[pageKey];
      const pageTests = this.results.details.filter(d => d.test.startsWith(pageData.name));
      const pagePassed = pageTests.filter(t => t.status === 'PASSED').length;
      const pageTotal = pageTests.length;
      const pageRate = pageTotal > 0 ? ((pagePassed / pageTotal) * 100).toFixed(0) : 0;
      
      console.log(`   ${pageData.name}: ${pagePassed}/${pageTotal} (${pageRate}%)`);
    });

    console.log(`\\n🎉 Test completed! Overall success rate: ${successRate}%`);
    
    return this.results;
  }
}

async function main() {
  const tester = new ComprehensiveButtonTester();
  
  try {
    await tester.setup();
    const results = await tester.runAllTests();
    tester.generateReport();
    
    // Exit with appropriate code
    process.exit(results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('🚨 Test suite failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { ComprehensiveButtonTester, BUTTON_TEST_MATRIX }; 