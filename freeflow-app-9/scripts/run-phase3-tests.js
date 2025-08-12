#!/usr/bin/env node
/**
 * KAZI Platform - Phase 3: E2E Navigation Enhancement Tests
 * --------------------------------------------------------
 * This script runs focused tests on the new navigation components
 * (EnhancedNavigation and ContextualSidebar) to validate they work correctly.
 * 
 * Run with: node scripts/run-phase3-tests.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:9323',
  outputDir: path.join(__dirname, '../test-results/phase3'),
  screenshotsDir: path.join(__dirname, '../test-results/phase3/screenshots'),
  timeout: 30000,
  navigationTimeout: 20000,
  testPages: [
    '/dashboard',
    '/dashboard/projects-hub',
    '/dashboard/analytics',
    '/dashboard/ai-assistant',
    '/dashboard/financial-hub'
  ]
};

// Results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Console formatting helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}=== KAZI Phase 3: Navigation Enhancement Tests ===${colors.reset}\n`);
  console.log(`${colors.bright}Date: ${new Date().toISOString()}${colors.reset}\n`);
  
  // Check if server is running
  if (!await isServerRunning()) {
    console.error(`${colors.red}Error: Development server is not running on port 9323.${colors.reset}`);
    console.log(`Please start the server with: ${colors.bright}npm run dev${colors.reset}`);
    process.exit(1);
  }
  
  // Create output directories
  await createDirectories();
  
  // Launch browser and run tests
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create desktop context
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    });
    
    // Create mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    // Run desktop tests
    console.log(`\n${colors.bright}${colors.blue}Running tests on Desktop${colors.reset}`);
    const desktopPage = await desktopContext.newPage();
    desktopPage.setDefaultTimeout(CONFIG.timeout);
    desktopPage.setDefaultNavigationTimeout(CONFIG.navigationTimeout);
    await runAllTests(desktopPage, 'Desktop');
    
    // Run mobile tests
    console.log(`\n${colors.bright}${colors.blue}Running tests on Mobile${colors.reset}`);
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(CONFIG.timeout);
    mobilePage.setDefaultNavigationTimeout(CONFIG.navigationTimeout);
    await runAllTests(mobilePage, 'Mobile');
    
  } finally {
    // Close browser
    await browser.close();
  }
  
  // Generate report
  await generateReport();
  
  // Print summary
  printSummary();
  
  // Return success/failure for CI integration
  process.exit(testResults.failed > 0 ? 1 : 0);
}

/**
 * Check if server is running on port 9323
 */
async function isServerRunning() {
  return new Promise((resolve) => {
    http.get('http://localhost:9323/api/health', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Run all test cases
 */
async function runAllTests(page, deviceType) {
  // Test 1: Navigation Component Rendering
  await testNavigationComponentRendering(page, deviceType);
  
  // Test 2: Keyboard Shortcuts
  await testKeyboardShortcuts(page, deviceType);
  
  // Test 3: Search Functionality
  await testSearchFunctionality(page, deviceType);
  
  // Test 4: Responsive Design
  await testResponsiveDesign(page, deviceType);
  
  // Test 5: Breadcrumb Navigation
  await testBreadcrumbNavigation(page, deviceType);
  
  // Test 6: Related Features
  await testRelatedFeatures(page, deviceType);
}

/**
 * Test 1: Navigation Component Rendering
 */
async function testNavigationComponentRendering(page, deviceType) {
  const testName = 'Navigation Component Rendering';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation components to load
    await page.waitForSelector('[data-testid="enhanced-navigation"], .enhanced-navigation', { timeout: 10000 })
      .catch(() => {});
    await page.waitForSelector('[data-testid="contextual-sidebar"], .contextual-sidebar', { timeout: 10000 })
      .catch(() => {});
    
    // Take a screenshot
    await takeScreenshot(page, `navigation-components-${deviceType}.png`);
    
    // Check if components are visible
    const enhancedNavVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
    const sidebarVisible = await isElementVisible(page, '[data-testid="contextual-sidebar"], .contextual-sidebar');
    
    // On mobile, sidebar might be collapsed
    const success = enhancedNavVisible && (deviceType === 'Mobile' || sidebarVisible);
    
    if (success) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: `Components not visible: ${!enhancedNavVisible ? 'EnhancedNavigation ' : ''}${!sidebarVisible ? 'ContextualSidebar' : ''}`
      });
    }
    
    // Test component visibility across different pages
    for (const testPage of CONFIG.testPages.slice(1, 3)) { // Test 2 additional pages
      console.log(`  Testing on page: ${testPage}`);
      
      await page.goto(`${CONFIG.baseUrl}${testPage}`);
      
      // Wait for navigation components to load
      await page.waitForSelector('[data-testid="enhanced-navigation"], .enhanced-navigation', { timeout: 10000 })
        .catch(() => {});
      
      // Check if components are visible
      const navVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
      
      if (navVisible) {
        logTestResult({
          name: `${testName} - ${testPage}`,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: `${testName} - ${testPage}`,
          device: deviceType,
          status: 'failed',
          error: `EnhancedNavigation not visible on ${testPage}`
        });
      }
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 2: Keyboard Shortcuts
 */
async function testKeyboardShortcuts(page, deviceType) {
  const testName = 'Keyboard Shortcuts';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  // Skip keyboard shortcut tests on mobile as they're not applicable
  if (deviceType === 'Mobile') {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'skipped',
      message: 'Keyboard shortcuts not applicable on mobile devices'
    });
    return;
  }
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Test 2.1: Command+K for search
    console.log('  Testing ⌘K shortcut for search');
    
    // Press Command+K
    await page.keyboard.press('Meta+k');
    
    // Check if search popover appears
    const searchVisible = await isElementVisible(page, '[data-testid="search-popover"], .search-popover, [role="dialog"]');
    
    if (searchVisible) {
      logTestResult({
        name: `${testName} - Command+K`,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Command+K`,
        device: deviceType,
        status: 'failed',
        error: 'Search popover did not appear after Command+K'
      });
    }
    
    // Close search if it's open
    if (searchVisible) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Test 2.2: Command+. for sidebar toggle
    console.log('  Testing ⌘. shortcut for sidebar toggle');
    
    // Get initial sidebar state
    const initialSidebarExpanded = await isSidebarExpanded(page);
    
    // Press Command+.
    await page.keyboard.press('Meta+.');
    await page.waitForTimeout(500);
    
    // Check if sidebar state changed
    const newSidebarExpanded = await isSidebarExpanded(page);
    
    if (initialSidebarExpanded !== newSidebarExpanded) {
      logTestResult({
        name: `${testName} - Command+.`,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Command+.`,
        device: deviceType,
        status: 'failed',
        error: 'Sidebar did not toggle after Command+.'
      });
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 3: Search Functionality
 */
async function testSearchFunctionality(page, deviceType) {
  const testName = 'Search Functionality';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Find and click search button
    await page.click('[data-testid="search-button"], button:has(svg[data-icon="search"])');
    await page.waitForTimeout(500);
    
    // Check if search input is visible
    const searchInputVisible = await isElementVisible(page, '[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]');
    
    if (!searchInputVisible) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: 'Search input not visible after clicking search button'
      });
    } else {
      // Type a search query
      await page.type('[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]', 'project');
      await page.waitForTimeout(1000);
      
      // Check if search results appear
      const searchResultsVisible = await isElementVisible(page, '[data-testid="search-results"], .search-results');
      const hasResults = await page.$$eval(
        '[data-testid="search-results"] [data-testid="search-result"], .search-results .search-result', 
        items => items.length > 0
      ).catch(() => false);
      
      if (searchResultsVisible && hasResults) {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'passed'
        });
        
        // Take screenshot of search results
        await takeScreenshot(page, `search-results-${deviceType}.png`);
      } else {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'failed',
          error: 'Search results not visible or empty after typing query'
        });
      }
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 4: Responsive Design
 */
async function testResponsiveDesign(page, deviceType) {
  const testName = 'Responsive Design';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of current viewport
    await takeScreenshot(page, `responsive-${deviceType}.png`);
    
    if (deviceType === 'Desktop') {
      // Test resizing to smaller viewport
      await page.setViewportSize({ width: 768, height: 800 });
      await page.waitForTimeout(1000);
      
      // Take screenshot after resize
      await takeScreenshot(page, `responsive-medium.png`);
      
      // Check if sidebar collapses or adjusts
      const sidebarWidthMedium = await getSidebarWidth(page);
      
      // Resize to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Take screenshot after mobile resize
      await takeScreenshot(page, `responsive-small.png`);
      
      // Check if sidebar collapses or adjusts further
      const sidebarWidthSmall = await getSidebarWidth(page);
      
      console.log(`  Sidebar widths - Medium: ${sidebarWidthMedium}px, Small: ${sidebarWidthSmall}px`);
      
      // Check if navigation components are still visible
      const enhancedNavVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
      
      if (enhancedNavVisible) {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'failed',
          error: 'Navigation components not visible after resizing to mobile viewport'
        });
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 800 });
    } else {
      // On mobile, check if navigation is appropriately sized
      const enhancedNavVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
      const sidebarWidth = await getSidebarWidth(page);
      
      console.log(`  Mobile sidebar width: ${sidebarWidth}px`);
      
      // Check if mobile menu button is visible
      const mobileMenuVisible = await isElementVisible(page, 
        'button:has(svg[data-icon="menu"]), [data-testid="mobile-menu"], .mobile-menu-button'
      );
      
      if (enhancedNavVisible && (sidebarWidth < 100 || mobileMenuVisible)) {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          device: deviceType,
          status: 'failed',
          error: `Responsive design issues on mobile: enhancedNavVisible=${enhancedNavVisible}, sidebarWidth=${sidebarWidth}, mobileMenuVisible=${mobileMenuVisible}`
        });
      }
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 5: Breadcrumb Navigation
 */
async function testBreadcrumbNavigation(page, deviceType) {
  const testName = 'Breadcrumb Navigation';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  try {
    // Navigate to a nested page
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if breadcrumbs are visible
    const breadcrumbsVisible = await isElementVisible(page, '[data-testid="breadcrumbs"], [aria-label="Breadcrumb"], nav:has(a[href="/dashboard"])');
    
    if (!breadcrumbsVisible) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: 'Breadcrumbs not visible on nested page'
      });
      return;
    }
    
    // Take screenshot of breadcrumbs
    await takeScreenshot(page, `breadcrumbs-${deviceType}.png`);
    
    // Click the Dashboard breadcrumb
    await page.click('[data-testid="breadcrumbs"] a:first-child, [aria-label="Breadcrumb"] a:first-child, nav:has(a[href="/dashboard"]) a:first-child');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Verify we navigated to dashboard
    const url = page.url();
    const navigatedToDashboard = url.endsWith('/dashboard') || url.endsWith('/dashboard/');
    
    if (navigatedToDashboard) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: `Breadcrumb navigation failed: expected URL to end with /dashboard, got ${url}`
      });
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 6: Related Features
 */
async function testRelatedFeatures(page, deviceType) {
  const testName = 'Related Features';
  console.log(`\n${colors.cyan}Running: ${testName} (${deviceType})${colors.reset}`);
  
  try {
    // Navigate to a page that should have related features
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if related features section is visible
    const relatedFeaturesVisible = await isElementVisible(page, 
      '[data-testid="related-features"], .related-features, :text("Related Tools")'
    );
    
    if (!relatedFeaturesVisible) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: 'Related features section not visible'
      });
      return;
    }
    
    // Take screenshot of related features
    await takeScreenshot(page, `related-features-${deviceType}.png`);
    
    // Check if there are any related feature items
    const relatedFeatureItems = await page.$$eval(
      '[data-testid="related-features"] a, [data-testid="related-features"] button, .related-features a, .related-features button', 
      items => items.length
    );
    
    if (relatedFeatureItems > 0) {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        device: deviceType,
        status: 'failed',
        error: 'No related feature items found'
      });
    }
  } catch (error) {
    logTestResult({
      name: testName,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Helper Functions
 */

/**
 * Check if an element is visible
 */
async function isElementVisible(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }, selector);
}

/**
 * Check if sidebar is expanded
 */
async function isSidebarExpanded(page) {
  return await page.evaluate(() => {
    const sidebar = document.querySelector('[data-testid="contextual-sidebar"], .contextual-sidebar');
    if (!sidebar) return false;
    
    const style = window.getComputedStyle(sidebar);
    const width = parseInt(style.width);
    
    // Consider it expanded if width is greater than 100px
    return width > 100;
  });
}

/**
 * Get sidebar width
 */
async function getSidebarWidth(page) {
  return await page.evaluate(() => {
    const sidebar = document.querySelector('[data-testid="contextual-sidebar"], .contextual-sidebar');
    if (!sidebar) return 0;
    
    const style = window.getComputedStyle(sidebar);
    return parseInt(style.width);
  });
}

/**
 * Take a screenshot
 */
async function takeScreenshot(page, filename) {
  try {
    const screenshotPath = path.join(CONFIG.screenshotsDir, filename);
    await page.screenshot({ path: screenshotPath });
    console.log(`  Screenshot saved: ${filename}`);
  } catch (error) {
    console.error(`  Failed to take screenshot: ${error.message}`);
  }
}

/**
 * Log a test result
 */
function logTestResult(result) {
  testResults.total++;
  
  switch (result.status) {
    case 'passed':
      testResults.passed++;
      console.log(`  ${colors.green}✓ PASS:${colors.reset} ${result.name}`);
      break;
    case 'failed':
      testResults.failed++;
      console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${result.name} - ${result.error}`);
      break;
    case 'skipped':
      testResults.skipped++;
      console.log(`  ${colors.yellow}○ SKIP:${colors.reset} ${result.name} - ${result.message}`);
      break;
  }
  
  testResults.details.push({
    ...result,
    timestamp: new Date().toISOString()
  });
}

/**
 * Create output directories
 */
async function createDirectories() {
  try {
    await mkdir(CONFIG.outputDir, { recursive: true });
    await mkdir(CONFIG.screenshotsDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating directories: ${error.message}`);
  }
}

/**
 * Generate final report
 */
async function generateReport() {
  try {
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        passRate: testResults.total > 0 
          ? Math.round((testResults.passed / testResults.total) * 100) 
          : 0
      },
      details: testResults.details
    };
    
    const reportPath = path.join(CONFIG.outputDir, 'phase3-report.json');
    await writeFile(reportPath, JSON.stringify(jsonReport, null, 2));
    
    console.log(`\n${colors.green}Report generated:${colors.reset} ${reportPath}`);
  } catch (error) {
    console.error(`Error generating report: ${error.message}`);
  }
}

/**
 * Print summary
 */
function printSummary() {
  const passRate = testResults.total > 0 
    ? Math.round((testResults.passed / testResults.total) * 100) 
    : 0;
  
  console.log(`\n${colors.bright}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.yellow}Skipped:${colors.reset} ${testResults.skipped}`);
  console.log(`${colors.bright}Pass Rate:${colors.reset} ${passRate}%`);
  
  if (testResults.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    testResults.details
      .filter(detail => detail.status === 'failed')
      .forEach(detail => {
        console.log(`${colors.red}✗${colors.reset} ${detail.name} - ${detail.error}`);
      });
  }
  
  if (passRate === 100) {
    console.log(`\n${colors.green}${colors.bright}✓ All tests passed!${colors.reset}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite encountered an error:${colors.reset}`, error);
  process.exit(1);
});
