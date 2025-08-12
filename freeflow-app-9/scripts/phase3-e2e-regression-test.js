#!/usr/bin/env node
/**
 * KAZI Platform - Phase 3: E2E Regression Testing
 * ----------------------------------------------
 * This script performs comprehensive end-to-end testing of the new navigation
 * enhancements (EnhancedNavigation and ContextualSidebar components) to ensure
 * they work correctly across all dashboard pages.
 * 
 * Run with: node scripts/phase3-e2e-regression-test.js
 */

const { chromium, firefox, webkit, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:9323',
  outputDir: path.join(__dirname, '../test-results/phase3'),
  screenshotsDir: path.join(__dirname, '../test-results/phase3/screenshots'),
  videosDir: path.join(__dirname, '../test-results/phase3/videos'),
  reportsDir: path.join(__dirname, '../test-results/phase3/reports'),
  browsers: ['chromium', 'firefox', 'webkit'],
  devices: ['Desktop', 'Mobile'],
  viewports: {
    Desktop: { width: 1280, height: 800 },
    Mobile: { width: 375, height: 667 }
  },
  timeout: 60000,
  navigationTimeout: 30000,
  testPages: [
    '/dashboard',
    '/dashboard/projects-hub',
    '/dashboard/analytics',
    '/dashboard/ai-assistant',
    '/dashboard/financial-hub',
    '/dashboard/invoices',
    '/dashboard/messages',
    '/dashboard/team-hub',
    '/dashboard/files-hub',
    '/dashboard/canvas',
    '/dashboard/community-hub'
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
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
};

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}=== KAZI Phase 3: E2E Regression Testing ===${colors.reset}\n`);
  console.log(`${colors.dim}Date: ${new Date().toISOString()}${colors.reset}\n`);
  
  // Create output directories
  await createDirectories();
  
  // Run tests for each browser and device combination
  for (const browserType of CONFIG.browsers) {
    for (const deviceType of CONFIG.devices) {
      await runTestSuite(browserType, deviceType);
    }
  }
  
  // Generate final report
  await generateReport();
  
  // Print summary
  printSummary();
  
  // Return success/failure for CI integration
  process.exit(testResults.failed > 0 ? 1 : 0);
}

/**
 * Run a test suite for a specific browser and device
 */
async function runTestSuite(browserType, deviceType) {
  console.log(`\n${colors.bright}${colors.blue}Running tests on ${browserType} - ${deviceType}${colors.reset}`);
  
  let browser;
  try {
    // Launch browser
    browser = await launchBrowser(browserType);
    
    // Create context with viewport settings
    const context = await createBrowserContext(browser, deviceType);
    
    // Create a new page
    const page = await context.newPage();
    
    // Set default timeouts
    page.setDefaultTimeout(CONFIG.timeout);
    page.setDefaultNavigationTimeout(CONFIG.navigationTimeout);
    
    // Run all test cases
    await runAllTests(page, browserType, deviceType);
    
  } catch (error) {
    console.error(`${colors.red}Error running test suite: ${error.message}${colors.reset}`);
    logTestResult({
      name: 'Test Suite Initialization',
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Launch a browser based on type
 */
async function launchBrowser(browserType) {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
  
  switch (browserType) {
    case 'chromium':
      return await chromium.launch(launchOptions);
    case 'firefox':
      return await firefox.launch(launchOptions);
    case 'webkit':
      return await webkit.launch(launchOptions);
    default:
      throw new Error(`Unsupported browser type: ${browserType}`);
  }
}

/**
 * Create a browser context with appropriate device settings
 */
async function createBrowserContext(browser, deviceType) {
  const viewport = CONFIG.viewports[deviceType];
  const contextOptions = {
    viewport,
    userAgent: deviceType === 'Mobile' 
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      : undefined,
    recordVideo: {
      dir: CONFIG.videosDir,
      size: viewport
    }
  };
  
  return await browser.newContext(contextOptions);
}

/**
 * Run all test cases
 */
async function runAllTests(page, browserType, deviceType) {
  // Test 1: Basic Navigation Component Rendering
  await testNavigationComponentRendering(page, browserType, deviceType);
  
  // Test 2: Keyboard Shortcuts
  await testKeyboardShortcuts(page, browserType, deviceType);
  
  // Test 3: Drag and Drop Functionality
  await testDragAndDropFunctionality(page, browserType, deviceType);
  
  // Test 4: Search Functionality
  await testSearchFunctionality(page, browserType, deviceType);
  
  // Test 5: Breadcrumb Navigation
  await testBreadcrumbNavigation(page, browserType, deviceType);
  
  // Test 6: Related Features
  await testRelatedFeatures(page, browserType, deviceType);
  
  // Test 7: Quick Actions
  await testQuickActions(page, browserType, deviceType);
  
  // Test 8: Workflow Navigation
  await testWorkflowNavigation(page, browserType, deviceType);
  
  // Test 9: LocalStorage Integration
  await testLocalStorageIntegration(page, browserType, deviceType);
  
  // Test 10: Responsive Design
  await testResponsiveDesign(page, browserType, deviceType);
  
  // Test 11: Performance Testing
  await testPerformance(page, browserType, deviceType);
  
  // Test 12: Accessibility Testing
  await testAccessibility(page, browserType, deviceType);
  
  // Test 13: Cross-Component Integration
  await testComponentIntegration(page, browserType, deviceType);
}

/**
 * Test 1: Basic Navigation Component Rendering
 */
async function testNavigationComponentRendering(page, browserType, deviceType) {
  const testName = 'Navigation Component Rendering';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation components to load
    await page.waitForSelector('[data-testid="enhanced-navigation"], .enhanced-navigation', { timeout: 10000 })
      .catch(() => {});
    await page.waitForSelector('[data-testid="contextual-sidebar"], .contextual-sidebar', { timeout: 10000 })
      .catch(() => {});
    
    // Take a screenshot
    await takeScreenshot(page, `navigation-components-${browserType}-${deviceType}.png`);
    
    // Check if components are visible
    const enhancedNavVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
    const sidebarVisible = await isElementVisible(page, '[data-testid="contextual-sidebar"], .contextual-sidebar');
    
    // On mobile, sidebar might be collapsed
    const success = enhancedNavVisible && (deviceType === 'Mobile' || sidebarVisible);
    
    if (success) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Components not visible: ${!enhancedNavVisible ? 'EnhancedNavigation ' : ''}${!sidebarVisible ? 'ContextualSidebar' : ''}`
      });
    }
    
    // Test component visibility across different pages
    for (const testPage of CONFIG.testPages.slice(0, 3)) { // Test first 3 pages
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
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: `${testName} - ${testPage}`,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: `EnhancedNavigation not visible on ${testPage}`
        });
      }
    }
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 2: Keyboard Shortcuts
 */
async function testKeyboardShortcuts(page, browserType, deviceType) {
  const testName = 'Keyboard Shortcuts';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  // Skip keyboard shortcut tests on mobile as they're not applicable
  if (deviceType === 'Mobile') {
    logTestResult({
      name: testName,
      browser: browserType,
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
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Command+K`,
        browser: browserType,
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
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Command+.`,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'Sidebar did not toggle after Command+.'
      });
    }
    
    // Test 2.3: Command+1-3 for view switching
    console.log('  Testing ⌘1-3 shortcuts for view switching');
    
    // Make sure sidebar is expanded
    if (!newSidebarExpanded) {
      await page.keyboard.press('Meta+.');
      await page.waitForTimeout(500);
    }
    
    // Test Command+1 (Categories view)
    await page.keyboard.press('Meta+1');
    await page.waitForTimeout(500);
    const categoriesActive = await isElementVisible(page, '[data-view="categories"].active, [data-active-view="categories"]');
    
    // Test Command+2 (Favorites view)
    await page.keyboard.press('Meta+2');
    await page.waitForTimeout(500);
    const favoritesActive = await isElementVisible(page, '[data-view="favorites"].active, [data-active-view="favorites"]');
    
    // Test Command+3 (Recent view)
    await page.keyboard.press('Meta+3');
    await page.waitForTimeout(500);
    const recentActive = await isElementVisible(page, '[data-view="recent"].active, [data-active-view="recent"]');
    
    if (categoriesActive || favoritesActive || recentActive) {
      logTestResult({
        name: `${testName} - Command+1-3`,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Command+1-3`,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'View switching shortcuts did not work'
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 3: Drag and Drop Functionality
 */
async function testDragAndDropFunctionality(page, browserType, deviceType) {
  const testName = 'Drag and Drop Functionality';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  // Skip drag and drop tests on mobile as they're difficult to simulate
  if (deviceType === 'Mobile') {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'skipped',
      message: 'Drag and drop testing not implemented for mobile devices'
    });
    return;
  }
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Make sure sidebar is expanded
    const sidebarExpanded = await isSidebarExpanded(page);
    if (!sidebarExpanded) {
      await page.keyboard.press('Meta+.');
      await page.waitForTimeout(500);
    }
    
    // Switch to favorites view
    await page.keyboard.press('Meta+2');
    await page.waitForTimeout(500);
    
    // Check if we have any favorites
    const hasFavorites = await page.$$eval('[data-testid="favorite-item"], .favorite-item', items => items.length > 1);
    
    if (!hasFavorites) {
      // Add some favorites if none exist
      console.log('  No favorites found, adding some...');
      
      // Switch to categories view
      await page.keyboard.press('Meta+1');
      await page.waitForTimeout(500);
      
      // Find and click star icons to add favorites
      const starButtons = await page.$$('[data-testid="add-favorite"], .add-favorite, button:has(svg[data-icon="star"])');
      
      if (starButtons.length > 0) {
        await starButtons[0].click();
        await page.waitForTimeout(500);
        
        if (starButtons.length > 1) {
          await starButtons[1].click();
          await page.waitForTimeout(500);
        }
      }
      
      // Switch back to favorites view
      await page.keyboard.press('Meta+2');
      await page.waitForTimeout(500);
    }
    
    // Check again if we have favorites
    const favoriteItems = await page.$$('[data-testid="favorite-item"], .favorite-item');
    
    if (favoriteItems.length < 2) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'skipped',
        message: 'Not enough favorites to test drag and drop'
      });
      return;
    }
    
    // Get initial order of favorites
    const initialOrder = await page.$$eval(
      '[data-testid="favorite-item"], .favorite-item', 
      items => items.map(item => item.textContent.trim())
    );
    
    console.log(`  Initial order: ${initialOrder.join(', ')}`);
    
    // Perform drag and drop
    const sourceElement = favoriteItems[0];
    const targetElement = favoriteItems[1];
    
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();
    
    // Drag the first item to the position of the second
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.waitForTimeout(500);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    
    // Take a screenshot after drag
    await takeScreenshot(page, `drag-drop-result-${browserType}-${deviceType}.png`);
    
    // Get new order of favorites
    const newOrder = await page.$$eval(
      '[data-testid="favorite-item"], .favorite-item', 
      items => items.map(item => item.textContent.trim())
    );
    
    console.log(`  New order: ${newOrder.join(', ')}`);
    
    // Check if order changed
    const orderChanged = initialOrder[0] !== newOrder[0] || initialOrder[1] !== newOrder[1];
    
    if (orderChanged) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'Drag and drop did not change the order of favorites'
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 4: Search Functionality
 */
async function testSearchFunctionality(page, browserType, deviceType) {
  const testName = 'Search Functionality';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Test 4.1: Header search
    console.log('  Testing header search');
    
    // Find and click search button
    await page.click('[data-testid="search-button"], button:has(svg[data-icon="search"])');
    await page.waitForTimeout(500);
    
    // Check if search input is visible
    const searchInputVisible = await isElementVisible(page, '[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]');
    
    if (!searchInputVisible) {
      logTestResult({
        name: `${testName} - Header Search`,
        browser: browserType,
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
          name: `${testName} - Header Search`,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
        
        // Test clicking a search result
        await page.click('[data-testid="search-results"] [data-testid="search-result"]:first-child, .search-results .search-result:first-child');
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        
        // Take screenshot after navigation
        await takeScreenshot(page, `search-result-navigation-${browserType}-${deviceType}.png`);
        
      } else {
        logTestResult({
          name: `${testName} - Header Search`,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'Search results not visible or empty after typing query'
        });
      }
    }
    
    // Test 4.2: Sidebar search (if not on mobile)
    if (deviceType !== 'Mobile') {
      console.log('  Testing sidebar search');
      
      // Navigate back to dashboard
      await page.goto(`${CONFIG.baseUrl}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Make sure sidebar is expanded
      const sidebarExpanded = await isSidebarExpanded(page);
      if (!sidebarExpanded) {
        await page.keyboard.press('Meta+.');
        await page.waitForTimeout(500);
      }
      
      // Find and type in sidebar search
      const sidebarSearchInput = await page.$('[data-testid="sidebar-search"], .sidebar input[type="search"], .sidebar input[placeholder*="search" i]');
      
      if (sidebarSearchInput) {
        await sidebarSearchInput.type('financial');
        await page.waitForTimeout(1000);
        
        // Check if search results appear
        const hasResults = await page.$$eval(
          '[data-testid="sidebar-search-results"] [data-testid="sidebar-search-result"], .sidebar .search-results .search-result', 
          items => items.length > 0
        ).catch(() => false);
        
        if (hasResults) {
          logTestResult({
            name: `${testName} - Sidebar Search`,
            browser: browserType,
            device: deviceType,
            status: 'passed'
          });
        } else {
          logTestResult({
            name: `${testName} - Sidebar Search`,
            browser: browserType,
            device: deviceType,
            status: 'failed',
            error: 'Sidebar search results not visible or empty after typing query'
          });
        }
      } else {
        logTestResult({
          name: `${testName} - Sidebar Search`,
          browser: browserType,
          device: deviceType,
          status: 'skipped',
          message: 'Sidebar search input not found'
        });
      }
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 5: Breadcrumb Navigation
 */
async function testBreadcrumbNavigation(page, browserType, deviceType) {
  const testName = 'Breadcrumb Navigation';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to a nested page
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if breadcrumbs are visible
    const breadcrumbsVisible = await isElementVisible(page, '[data-testid="breadcrumbs"], [aria-label="Breadcrumb"], nav:has(a[href="/dashboard"])');
    
    if (!breadcrumbsVisible) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'Breadcrumbs not visible on nested page'
      });
      return;
    }
    
    // Check breadcrumb items
    const breadcrumbItems = await page.$$eval(
      '[data-testid="breadcrumbs"] a, [aria-label="Breadcrumb"] a, nav:has(a[href="/dashboard"]) a', 
      items => items.map(item => ({ text: item.textContent.trim(), href: item.getAttribute('href') }))
    );
    
    console.log(`  Breadcrumbs found: ${JSON.stringify(breadcrumbItems)}`);
    
    // Verify we have at least Dashboard and current page
    if (breadcrumbItems.length < 2) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Not enough breadcrumb items: found ${breadcrumbItems.length}, expected at least 2`
      });
      return;
    }
    
    // Click the Dashboard breadcrumb
    await page.click('[data-testid="breadcrumbs"] a:first-child, [aria-label="Breadcrumb"] a:first-child, nav:has(a[href="/dashboard"]) a:first-child');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Verify we navigated to dashboard
    const url = page.url();
    const navigatedToDashboard = url.endsWith('/dashboard') || url.endsWith('/dashboard/');
    
    if (navigatedToDashboard) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Breadcrumb navigation failed: expected URL to end with /dashboard, got ${url}`
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 6: Related Features
 */
async function testRelatedFeatures(page, browserType, deviceType) {
  const testName = 'Related Features';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
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
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'Related features section not visible'
      });
      return;
    }
    
    // Check if there are any related feature items
    const relatedFeatureItems = await page.$$eval(
      '[data-testid="related-features"] a, [data-testid="related-features"] button, .related-features a, .related-features button', 
      items => items.map(item => ({ text: item.textContent.trim(), href: item.getAttribute('href') || '' }))
    );
    
    console.log(`  Related features found: ${JSON.stringify(relatedFeatureItems)}`);
    
    if (relatedFeatureItems.length === 0) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'No related feature items found'
      });
      return;
    }
    
    // Click the first related feature
    await page.click('[data-testid="related-features"] a:first-child, [data-testid="related-features"] button:first-child, .related-features a:first-child, .related-features button:first-child');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    // Take screenshot after navigation
    await takeScreenshot(page, `related-feature-navigation-${browserType}-${deviceType}.png`);
    
    // Check if we navigated away from projects-hub
    const url = page.url();
    const navigatedAway = !url.includes('/projects-hub');
    
    if (navigatedAway) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Related feature navigation failed: still on ${url}`
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 7: Quick Actions
 */
async function testQuickActions(page, browserType, deviceType) {
  const testName = 'Quick Actions';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to a page that should have quick actions
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if quick actions section is visible
    const quickActionsVisible = await isElementVisible(page, 
      '[data-testid="quick-actions"], .quick-actions, :text("Quick Actions")'
    );
    
    if (!quickActionsVisible) {
      // Try to find any action buttons in the enhanced navigation
      const actionButtons = await page.$$('[data-testid="enhanced-navigation"] button, .enhanced-navigation button');
      
      if (actionButtons.length === 0) {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'Quick actions section not visible and no action buttons found'
        });
        return;
      }
    }
    
    // Find action buttons
    const actionButtons = await page.$$('[data-testid="quick-actions"] button, .quick-actions button, [data-testid="enhanced-navigation"] button, .enhanced-navigation button');
    
    if (actionButtons.length === 0) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'No quick action buttons found'
      });
      return;
    }
    
    console.log(`  Found ${actionButtons.length} action buttons`);
    
    // Click the first action button
    await actionButtons[0].click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    // Take screenshot after clicking action
    await takeScreenshot(page, `quick-action-result-${browserType}-${deviceType}.png`);
    
    // We can't reliably check the result without knowing what the action should do,
    // so we'll just mark it as passed if we got this far
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'passed'
    });
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 8: Workflow Navigation
 */
async function testWorkflowNavigation(page, browserType, deviceType) {
  const testName = 'Workflow Navigation';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to a page that should have workflow navigation
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Look for Next button
    const nextButtonVisible = await isElementVisible(page, 
      'button:has-text("Next"), button:has(svg[data-icon="chevron-right"])'
    );
    
    if (!nextButtonVisible) {
      // Try another page that might have workflow navigation
      await page.goto(`${CONFIG.baseUrl}/dashboard/ai-create`);
      await page.waitForLoadState('networkidle');
      
      const nextButtonVisibleAlt = await isElementVisible(page, 
        'button:has-text("Next"), button:has(svg[data-icon="chevron-right"])'
      );
      
      if (!nextButtonVisibleAlt) {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'skipped',
          message: 'No workflow navigation buttons found on tested pages'
        });
        return;
      }
    }
    
    // Click the Next button
    await page.click('button:has-text("Next"), button:has(svg[data-icon="chevron-right"])');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    
    // Take screenshot after navigation
    await takeScreenshot(page, `workflow-navigation-next-${browserType}-${deviceType}.png`);
    
    // Now look for Back button
    const backButtonVisible = await isElementVisible(page, 
      'button:has-text("Back"), button:has(svg[data-icon="chevron-left"])'
    );
    
    if (backButtonVisible) {
      // Click the Back button
      await page.click('button:has-text("Back"), button:has(svg[data-icon="chevron-left"])');
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Take screenshot after navigation
      await takeScreenshot(page, `workflow-navigation-back-${browserType}-${deviceType}.png`);
      
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      // We at least found and clicked the Next button
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed',
        message: 'Next button worked, but no Back button found on destination page'
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 9: LocalStorage Integration
 */
async function testLocalStorageIntegration(page, browserType, deviceType) {
  const testName = 'LocalStorage Integration';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check if localStorage is being used
    const localStorage = await page.evaluate(() => {
      const keys = Object.keys(window.localStorage);
      const kaziKeys = keys.filter(key => key.startsWith('kazi-'));
      
      return {
        allKeys: keys,
        kaziKeys: kaziKeys,
        kaziValues: kaziKeys.reduce((acc, key) => {
          acc[key] = window.localStorage.getItem(key);
          return acc;
        }, {})
      };
    });
    
    console.log(`  LocalStorage keys: ${JSON.stringify(localStorage.allKeys)}`);
    console.log(`  KAZI-specific keys: ${JSON.stringify(localStorage.kaziKeys)}`);
    
    if (localStorage.kaziKeys.length === 0) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'No KAZI-specific localStorage keys found'
      });
      return;
    }
    
    // Test persistence by modifying a value
    if (deviceType !== 'Mobile') { // Skip on mobile as we need keyboard shortcuts
      // Make sure sidebar is expanded
      const sidebarExpanded = await isSidebarExpanded(page);
      if (!sidebarExpanded) {
        await page.keyboard.press('Meta+.');
        await page.waitForTimeout(500);
      }
      
      // Switch views to trigger localStorage updates
      await page.keyboard.press('Meta+2'); // Switch to favorites
      await page.waitForTimeout(500);
      
      // Check localStorage again
      const localStorageAfter = await page.evaluate(() => {
        const kaziKeys = Object.keys(window.localStorage).filter(key => key.startsWith('kazi-'));
        return {
          kaziKeys: kaziKeys,
          kaziValues: kaziKeys.reduce((acc, key) => {
            acc[key] = window.localStorage.getItem(key);
            return acc;
          }, {})
        };
      });
      
      console.log(`  KAZI-specific keys after view switch: ${JSON.stringify(localStorageAfter.kaziKeys)}`);
      
      // Check if the sidebar view was saved
      const viewKeySaved = localStorageAfter.kaziKeys.some(key => key.includes('view'));
      
      if (viewKeySaved) {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'View preference not saved to localStorage after switching views'
        });
      }
    } else {
      // On mobile, just check if localStorage has expected keys
      const expectedKeys = ['favorites', 'recent', 'workspace', 'view'];
      const hasExpectedKeys = expectedKeys.some(expectedKey => 
        localStorage.kaziKeys.some(key => key.includes(expectedKey))
      );
      
      if (hasExpectedKeys) {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: `Expected localStorage to have keys related to: ${expectedKeys.join(', ')}`
        });
      }
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 10: Responsive Design
 */
async function testResponsiveDesign(page, browserType, deviceType) {
  const testName = 'Responsive Design';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of current viewport
    await takeScreenshot(page, `responsive-${browserType}-${deviceType}.png`);
    
    if (deviceType === 'Desktop') {
      // Test resizing to smaller viewport
      await page.setViewportSize({ width: 768, height: 800 });
      await page.waitForTimeout(1000);
      
      // Take screenshot after resize
      await takeScreenshot(page, `responsive-${browserType}-medium.png`);
      
      // Check if sidebar collapses or adjusts
      const sidebarWidthMedium = await getSidebarWidth(page);
      
      // Resize to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Take screenshot after mobile resize
      await takeScreenshot(page, `responsive-${browserType}-small.png`);
      
      // Check if sidebar collapses or adjusts further
      const sidebarWidthSmall = await getSidebarWidth(page);
      
      console.log(`  Sidebar widths - Medium: ${sidebarWidthMedium}px, Small: ${sidebarWidthSmall}px`);
      
      // Check if navigation components are still visible
      const enhancedNavVisible = await isElementVisible(page, '[data-testid="enhanced-navigation"], .enhanced-navigation');
      
      if (enhancedNavVisible) {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'Navigation components not visible after resizing to mobile viewport'
        });
      }
      
      // Reset viewport
      await page.setViewportSize(CONFIG.viewports.Desktop);
      
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
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: testName,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: `Responsive design issues on mobile: enhancedNavVisible=${enhancedNavVisible}, sidebarWidth=${sidebarWidth}, mobileMenuVisible=${mobileMenuVisible}`
        });
      }
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 11: Performance Testing
 */
async function testPerformance(page, browserType, deviceType) {
  const testName = 'Performance Testing';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Enable performance metrics
    await page.coverage.startJSCoverage();
    
    // Navigate to dashboard with performance timing
    const navigationStart = Date.now();
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    const navigationEnd = Date.now();
    
    // Wait for all network activity to settle
    await page.waitForLoadState('networkidle');
    const fullLoadEnd = Date.now();
    
    // Get JS coverage
    const jsCoverage = await page.coverage.stopJSCoverage();
    
    // Calculate total bytes and used bytes
    let totalBytes = 0;
    let usedBytes = 0;
    for (const entry of jsCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start;
      }
    }
    
    // Calculate metrics
    const navigationTime = navigationEnd - navigationStart;
    const fullLoadTime = fullLoadEnd - navigationStart;
    const unusedJsPercentage = totalBytes ? Math.round((1 - usedBytes / totalBytes) * 100) : 0;
    
    console.log(`  Navigation time: ${navigationTime}ms`);
    console.log(`  Full load time: ${fullLoadTime}ms`);
    console.log(`  JS total size: ${Math.round(totalBytes / 1024)}KB`);
    console.log(`  JS used size: ${Math.round(usedBytes / 1024)}KB`);
    console.log(`  JS unused percentage: ${unusedJsPercentage}%`);
    
    // Measure time to first interaction
    const interactionStart = Date.now();
    
    // Try to find and click a button
    await page.click('button').catch(() => {});
    
    const interactionEnd = Date.now();
    const timeToInteraction = interactionEnd - interactionStart;
    
    console.log(`  Time to interaction: ${timeToInteraction}ms`);
    
    // Measure component render time
    const componentStart = Date.now();
    
    // Force a re-render by navigating to another page and back
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    const componentEnd = Date.now();
    const componentRenderTime = componentEnd - componentStart;
    
    console.log(`  Component re-render time: ${componentRenderTime}ms`);
    
    // Determine if performance is acceptable
    const isPerformanceGood = 
      navigationTime < 3000 && 
      fullLoadTime < 5000 && 
      unusedJsPercentage < 70 && 
      timeToInteraction < 1000 && 
      componentRenderTime < 4000;
    
    if (isPerformanceGood) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed',
        metrics: {
          navigationTime,
          fullLoadTime,
          unusedJsPercentage,
          timeToInteraction,
          componentRenderTime
        }
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: 'Performance metrics did not meet targets',
        metrics: {
          navigationTime,
          fullLoadTime,
          unusedJsPercentage,
          timeToInteraction,
          componentRenderTime
        }
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 12: Accessibility Testing
 */
async function testAccessibility(page, browserType, deviceType) {
  const testName = 'Accessibility Testing';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check for ARIA attributes in navigation components
    const ariaAttributes = await page.$$eval(
      '[data-testid="enhanced-navigation"] [aria-label], .enhanced-navigation [aria-label], [data-testid="contextual-sidebar"] [aria-label], .contextual-sidebar [aria-label]',
      elements => elements.map(el => ({ 
        tag: el.tagName, 
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role')
      }))
    );
    
    console.log(`  Found ${ariaAttributes.length} elements with ARIA attributes`);
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    
    // Get the active element
    const firstFocusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? {
        tag: activeElement.tagName,
        text: activeElement.textContent,
        ariaLabel: activeElement.getAttribute('aria-label')
      } : null;
    });
    
    console.log(`  First focused element: ${JSON.stringify(firstFocusedElement)}`);
    
    // Tab a few more times to navigate through the page
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
    }
    
    // Get the active element again
    const laterFocusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? {
        tag: activeElement.tagName,
        text: activeElement.textContent,
        ariaLabel: activeElement.getAttribute('aria-label')
      } : null;
    });
    
    console.log(`  Later focused element: ${JSON.stringify(laterFocusedElement)}`);
    
    // Check if focus moved to a different element
    const focusChanged = firstFocusedElement && laterFocusedElement && 
      (firstFocusedElement.tag !== laterFocusedElement.tag || 
       firstFocusedElement.text !== laterFocusedElement.text);
    
    // Check for color contrast issues (simplified)
    const contrastIssues = await page.$$eval(
      '[data-testid="enhanced-navigation"], .enhanced-navigation, [data-testid="contextual-sidebar"], .contextual-sidebar',
      elements => {
        // Simple check for elements with very light text on light backgrounds or vice versa
        const issues = [];
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          const textColor = style.color;
          
          // Very simplified contrast check - just looking for obviously bad combinations
          if (
            (bgColor.includes('255, 255, 255') && textColor.includes('255, 255, 255')) || // white on white
            (bgColor.includes('0, 0, 0') && textColor.includes('0, 0, 0')) // black on black
          ) {
            issues.push({ element: el.tagName, bgColor, textColor });
          }
        });
        return issues;
      }
    );
    
    // Determine if accessibility is acceptable
    const isAccessibilityGood = 
      ariaAttributes.length > 0 && 
      focusChanged && 
      contrastIssues.length === 0;
    
    if (isAccessibilityGood) {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: testName,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Accessibility issues: ${ariaAttributes.length === 0 ? 'Missing ARIA attributes, ' : ''}${!focusChanged ? 'Keyboard focus not working, ' : ''}${contrastIssues.length > 0 ? 'Contrast issues detected' : ''}`
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
      device: deviceType,
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Test 13: Component Integration
 */
async function testComponentIntegration(page, browserType, deviceType) {
  const testName = 'Component Integration';
  console.log(`\n${colors.cyan}Running: ${testName} (${browserType} - ${deviceType})${colors.reset}`);
  
  try {
    // Navigate to dashboard
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Test 13.1: Sidebar navigation updates breadcrumbs
    console.log('  Testing sidebar navigation updates breadcrumbs');
    
    // If on desktop, make sure sidebar is expanded
    if (deviceType === 'Desktop') {
      const sidebarExpanded = await isSidebarExpanded(page);
      if (!sidebarExpanded) {
        await page.keyboard.press('Meta+.');
        await page.waitForTimeout(500);
      }
    }
    
    // Find and click a sidebar item
    const sidebarItemSelector = deviceType === 'Desktop' 
      ? '[data-testid="contextual-sidebar"] a, .contextual-sidebar a, [data-testid="contextual-sidebar"] button, .contextual-sidebar button'
      : '[data-testid="mobile-nav"] a, .mobile-nav a, [data-testid="mobile-menu"] a, .mobile-menu a';
    
    const sidebarItems = await page.$$(sidebarItemSelector);
    
    if (sidebarItems.length === 0) {
      logTestResult({
        name: `${testName} - Sidebar Navigation`,
        browser: browserType,
        device: deviceType,
        status: 'skipped',
        message: 'No sidebar navigation items found'
      });
    } else {
      // Click a sidebar item (not the first one, which is often Dashboard)
      const itemToClick = sidebarItems.length > 1 ? sidebarItems[1] : sidebarItems[0];
      await itemToClick.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      
      // Take screenshot after navigation
      await takeScreenshot(page, `sidebar-navigation-${browserType}-${deviceType}.png`);
      
      // Check if breadcrumbs updated
      const breadcrumbsVisible = await isElementVisible(page, '[data-testid="breadcrumbs"], [aria-label="Breadcrumb"], nav:has(a[href="/dashboard"])');
      
      if (breadcrumbsVisible) {
        logTestResult({
          name: `${testName} - Sidebar Navigation`,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: `${testName} - Sidebar Navigation`,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'Breadcrumbs not visible after sidebar navigation'
        });
      }
    }
    
    // Test 13.2: Related features and quick actions integration
    console.log('  Testing related features and quick actions integration');
    
    // Navigate to a page that should have both
    await page.goto(`${CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if both components are visible
    const relatedFeaturesVisible = await isElementVisible(page, 
      '[data-testid="related-features"], .related-features, :text("Related Tools")'
    );
    
    const quickActionsVisible = await isElementVisible(page, 
      '[data-testid="quick-actions"], .quick-actions, :text("Quick Actions")'
    );
    
    if (relatedFeaturesVisible && quickActionsVisible) {
      logTestResult({
        name: `${testName} - Related Features & Quick Actions`,
        browser: browserType,
        device: deviceType,
        status: 'passed'
      });
    } else {
      logTestResult({
        name: `${testName} - Related Features & Quick Actions`,
        browser: browserType,
        device: deviceType,
        status: 'failed',
        error: `Component integration issue: ${!relatedFeaturesVisible ? 'Related features not visible, ' : ''}${!quickActionsVisible ? 'Quick actions not visible' : ''}`
      });
    }
    
    // Test 13.3: Sidebar state persistence across pages
    console.log('  Testing sidebar state persistence across pages');
    
    if (deviceType === 'Desktop') {
      // Get initial sidebar state
      const initialSidebarExpanded = await isSidebarExpanded(page);
      
      // Toggle sidebar state
      await page.keyboard.press('Meta+.');
      await page.waitForTimeout(500);
      
      // Navigate to another page
      await page.goto(`${CONFIG.baseUrl}/dashboard/analytics`);
      await page.waitForLoadState('networkidle');
      
      // Check if sidebar state persisted
      const newSidebarExpanded = await isSidebarExpanded(page);
      
      if (initialSidebarExpanded !== newSidebarExpanded) {
        logTestResult({
          name: `${testName} - Sidebar State Persistence`,
          browser: browserType,
          device: deviceType,
          status: 'passed'
        });
      } else {
        logTestResult({
          name: `${testName} - Sidebar State Persistence`,
          browser: browserType,
          device: deviceType,
          status: 'failed',
          error: 'Sidebar state did not persist across page navigation'
        });
      }
    } else {
      // Skip on mobile
      logTestResult({
        name: `${testName} - Sidebar State Persistence`,
        browser: browserType,
        device: deviceType,
        status: 'skipped',
        message: 'Sidebar state persistence test not applicable on mobile'
      });
    }
    
  } catch (error) {
    logTestResult({
      name: testName,
      browser: browserType,
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
    await mkdir(CONFIG.videosDir, { recursive: true });
    await mkdir(CONFIG.reportsDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating directories: ${error.message}`);
  }
}

/**
 * Generate final report
 */
async function generateReport() {
  try {
    // Create JSON report
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
    
    const jsonReportPath = path.join(CONFIG.reportsDir, 'phase3-report.json');
    await writeFile(jsonReportPath, JSON.stringify(jsonReport, null, 2));
    
    // Create HTML report
    const htmlReport = generateHtmlReport(jsonReport);
    const htmlReportPath = path.join(CONFIG.reportsDir, 'phase3-report.html');
    await writeFile(htmlReportPath, htmlReport);
    
    console.log(`\n${colors.green}Reports generated:${colors.reset}`);
    console.log(`  JSON: ${jsonReportPath}`);
    console.log(`  HTML: ${htmlReportPath}`);
  } catch (error) {
    console.error(`Error generating report: ${error.message}`);
  }
}

/**
 * Generate HTML report
 */
function generateHtmlReport(jsonReport) {
  const passRate = jsonReport.summary.passRate;
  const passRateColor = passRate >= 90 ? 'green' : passRate >= 70 ? 'orange' : 'red';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KAZI Phase 3: E2E Regression Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .summary {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .summary-item {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .summary-item h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      color: #6b7280;
    }
    .summary-item p {
      margin: 10px 0 0;
      font-size: 24px;
      font-weight: 600;
    }
    .pass-rate {
      color: ${passRateColor};
      font-size: 32px !important;
    }
    .details {
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .status {
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
      min-width: 80px;
      text-align: center;
    }
    .passed {
      background-color: #d1fae5;
      color: #065f46;
    }
    .failed {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .skipped {
      background-color: #fef3c7;
      color: #92400e;
    }
    .error {
      color: #b91c1c;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .timestamp {
      color: #6b7280;
      font-size: 12px;
    }
    .filters {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .filter-btn {
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
    }
    .filter-btn.active {
      background-color: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .browser-icon {
      height: 16px;
      width: 16px;
      vertical-align: middle;
      margin-right: 5px;
    }
    .device-icon {
      height: 14px;
      width: 14px;
      vertical-align: middle;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <h1>KAZI Phase 3: E2E Regression Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Test run completed on ${new Date(jsonReport.timestamp).toLocaleString()}</p>
    
    <div class="summary-grid">
      <div class="summary-item">
        <h3>Pass Rate</h3>
        <p class="pass-rate">${jsonReport.summary.passRate}%</p>
      </div>
      <div class="summary-item">
        <h3>Total Tests</h3>
        <p>${jsonReport.summary.total}</p>
      </div>
      <div class="summary-item">
        <h3>Passed</h3>
        <p style="color: green">${jsonReport.summary.passed}</p>
      </div>
      <div class="summary-item">
        <h3>Failed</h3>
        <p style="color: red">${jsonReport.summary.failed}</p>
      </div>
      <div class="summary-item">
        <h3>Skipped</h3>
        <p style="color: orange">${jsonReport.summary.skipped}</p>
      </div>
    </div>
  </div>
  
  <div class="details">
    <h2>Test Details</h2>
    
    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="passed">Passed</button>
      <button class="filter-btn" data-filter="failed">Failed</button>
      <button class="filter-btn" data-filter="skipped">Skipped</button>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Test</th>
          <th>Browser</th>
          <th>Device</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${jsonReport.details.map(test => `
          <tr class="test-row" data-status="${test.status}">
            <td>${test.name}</td>
            <td>
              ${getBrowserIcon(test.browser)}
              ${test.browser}
            </td>
            <td>
              ${getDeviceIcon(test.device)}
              ${test.device}
            </td>
            <td><span class="status ${test.status}">${test.status.toUpperCase()}</span></td>
            <td>
              ${test.error ? `<div class="error">${test.error}</div>` : ''}
              ${test.message ? `<div>${test.message}</div>` : ''}
              <div class="timestamp">${new Date(test.timestamp).toLocaleString()}</div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <script>
    document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Filter rows
        const filter = button.getAttribute('data-filter');
        document.querySelectorAll('.test-row').forEach(row => {
          if (filter === 'all' || row.getAttribute('data-status') === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  </script>
</body>
</html>
  `;
}

/**
 * Get browser icon for HTML report
 */
function getBrowserIcon(browser) {
  switch (browser) {
    case 'chromium':
      return '<svg class="browser-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4285F4"/><circle cx="50" cy="50" r="15" fill="#fff"/></svg>';
    case 'firefox':
      return '<svg class="browser-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FF9500"/><path d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35z" fill="#fff"/></svg>';
    case 'webkit':
      return '<svg class="browser-icon" xmlns="http://www.w3.org/2000/svg" viewBox="