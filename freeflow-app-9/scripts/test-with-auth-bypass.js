#!/usr/bin/env node

/**
 * 🔓 AUTHENTICATION BYPASS TESTING
 * 
 * Tests all buttons and interactive elements while bypassing authentication
 */

const { chromium } = require('playwright');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: false,
  timeout: 15000
};

// Pages to test with their expected buttons
const PAGES_TO_TEST = [
  {
    url: '/dashboard',
    name: 'Dashboard',
    expectedButtons: [
      'create-project-btn',
      'create-invoice-btn', 
      'upload-files-btn',
      'schedule-meeting-btn'
    ]
  },
  {
    url: '/dashboard/projects-hub',
    name: 'Projects Hub',
    expectedButtons: [
      'create-project-btn',
      'import-project-btn',
      'quick-start-btn',
      'view-all-btn',
      'export-data-btn'
    ]
  },
  {
    url: '/dashboard/ai-create',
    name: 'AI Create',
    expectedButtons: [
      'generate-btn'
    ]
  },
  {
    url: '/dashboard/files-hub',
    name: 'Files Hub', 
    expectedButtons: [
      'upload-file-btn',
      'new-folder-btn'
    ]
  }
];

class AuthBypassTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async initialize() {
    console.log('🔓 Initializing Authentication Bypass Tester...');
    
    this.browser = await chromium.launch({ 
      headless: TEST_CONFIG.headless,
      timeout: TEST_CONFIG.timeout 
    });
    
    this.page = await this.browser.newPage();
    
    // Set headers to bypass authentication
    await this.page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'x-dev-bypass': 'true',
      'user-agent': 'Playwright/Test-Runner-Auth-Bypass'
    });
    
    // Add initialization script for local storage
    await this.page.addInitScript(() => {
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('dev-bypass', 'true');
      
      // Mock auth session
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test_token_bypass',
        user: { id: 'test_user', email: 'test@bypass.com' }
      }));
    });

    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async testPage(pageConfig) {
    console.log(`\n🔍 Testing ${pageConfig.name}`);
    console.log(`🔗 URL: ${pageConfig.url}`);
    
    try {
      // Navigate with extra wait time
      await this.page.goto(`${TEST_CONFIG.baseUrl}${pageConfig.url}`, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeout
      });
      
      // Extra wait for dynamic content
      await this.page.waitForTimeout(3000);
      
      // Check if we're still on login page (auth didn't bypass)
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        console.log('  ⚠️  Still on login page - auth bypass may not be working');
        
        // Try to continue anyway by looking for buttons on login page
        const loginButtons = await this.page.locator('button').all();
        console.log(`  🔘 Found ${loginButtons.length} buttons on login page`);
        return;
      }
      
      console.log(`  ✅ Successfully loaded: ${currentUrl}`);
      
      // Check for expected buttons
      let foundButtons = 0;
      for (const buttonTestId of pageConfig.expectedButtons) {
        try {
          const button = this.page.locator(`[data-testid="${buttonTestId}"]`);
          const exists = await button.count() > 0;
          
          if (exists) {
            const isVisible = await button.isVisible();
            const text = await button.textContent();
            console.log(`    ✅ Found: ${buttonTestId} - "${text}" (Visible: ${isVisible})`);
            foundButtons++;
            
            // Try clicking if visible
            if (isVisible) {
              try {
                await button.click();
                await this.page.waitForTimeout(1000);
                console.log(`      🖱️  Clicked successfully`);
              } catch (clickError) {
                console.log(`      ⚠️  Click failed: ${clickError.message}`);
              }
            }
          } else {
            console.log(`    ❌ Missing: ${buttonTestId}`);
          }
        } catch (error) {
          console.log(`    ❌ Error testing ${buttonTestId}: ${error.message}`);
        }
      }
      
      // Look for any buttons with data-testid
      const allTestIdButtons = await this.page.locator('[data-testid]').all();
      console.log(`  📊 Total elements with data-testid: ${allTestIdButtons.length}`);
      
      for (const element of allTestIdButtons.slice(0, 10)) { // Limit output
        const testId = await element.getAttribute('data-testid');
        const tagName = await element.evaluate(el => el.tagName);
        const text = await element.textContent();
        const isVisible = await element.isVisible();
        
        if (tagName === 'BUTTON' || testId?.includes('btn')) {
          console.log(`    🔘 ${testId}: ${tagName} - "${text?.slice(0, 30)}" (Visible: ${isVisible})`);
        }
      }
      
      // Take screenshot
      await this.page.screenshot({ 
        path: `debug-screenshots/${pageConfig.name.replace(/\s+/g, '-').toLowerCase()}-bypass.png`,
        fullPage: true 
      });
      
      this.results.push({
        page: pageConfig.name,
        url: pageConfig.url,
        loaded: true,
        buttonsFound: foundButtons,
        buttonsExpected: pageConfig.expectedButtons.length,
        successRate: Math.round((foundButtons / pageConfig.expectedButtons.length) * 100)
      });
      
    } catch (error) {
      console.log(`  ❌ Error testing ${pageConfig.name}: ${error.message}`);
      this.results.push({
        page: pageConfig.name,
        url: pageConfig.url,
        loaded: false,
        error: error.message
      });
    }
  }

  async runAllTests() {
    console.log('\n🎯 Testing All Pages with Auth Bypass...');
    
    for (const pageConfig of PAGES_TO_TEST) {
      await this.testPage(pageConfig);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUTH BYPASS TEST RESULTS');
    console.log('='.repeat(60));
    
    let totalPages = this.results.length;
    let loadedPages = this.results.filter(r => r.loaded).length;
    let totalButtons = 0;
    let foundButtons = 0;
    
    for (const result of this.results) {
      if (result.loaded) {
        console.log(`✅ ${result.page}: ${result.buttonsFound}/${result.buttonsExpected} buttons (${result.successRate}%)`);
        totalButtons += result.buttonsExpected;
        foundButtons += result.buttonsFound;
      } else {
        console.log(`❌ ${result.page}: Failed to load - ${result.error}`);
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`   Pages Loaded: ${loadedPages}/${totalPages}`);
    console.log(`   Buttons Found: ${foundButtons}/${totalButtons}`);
    console.log(`   Overall Success: ${totalButtons > 0 ? Math.round((foundButtons / totalButtons) * 100) : 0}%`);
    
    if (loadedPages === 0) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('   - Check if development server is running on port 3000');
      console.log('   - Verify middleware.ts is allowing local development bypass');
      console.log('   - Check browser console for JavaScript errors');
      console.log('   - Try manually navigating to http://localhost:3000/dashboard');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new AuthBypassTester();
  
  try {
    const fs = require('fs');
    if (!fs.existsSync('debug-screenshots')) {
      fs.mkdirSync('debug-screenshots');
    }

    await tester.initialize();
    await tester.runAllTests();
    tester.generateReport();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main().catch(console.error); 