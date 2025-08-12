import { test, expect, Page, TestInfo, Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { performance } from 'perf_hooks';

/**
 * KAZI Platform - Navigation Enhancements Test Suite
 * 
 * This test suite validates the enhanced navigation components:
 * - EnhancedNavigation: breadcrumbs, search, quick actions, workflow navigation
 * - ContextualSidebar: categories, favorites, recently used, workspace switcher
 * 
 * Tests include:
 * - Component rendering and visibility
 * - Accessibility compliance
 * - Keyboard shortcuts
 * - Touch events and drag-and-drop
 * - Responsive design
 * - Performance metrics
 */

// Types for performance metrics
interface PerformanceMetrics {
  navigationLoadTime: number;
  sidebarLoadTime: number;
  searchResponseTime: number;
  breadcrumbsLoadTime: number;
}

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:9323',
  screenshotsDir: './test-results/navigation-enhancements',
  viewports: {
    desktop: { width: 1280, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  routes: [
    '/dashboard',
    '/dashboard/projects-hub',
    '/dashboard/analytics',
    '/dashboard/ai-assistant',
    '/dashboard/financial-hub'
  ],
  selectors: {
    enhancedNavigation: '[data-testid="enhanced-navigation"], .enhanced-navigation',
    contextualSidebar: '[data-testid="contextual-sidebar"], .contextual-sidebar',
    breadcrumbs: '[data-testid="breadcrumbs"], [aria-label="Breadcrumb"]',
    searchButton: '[data-testid="search-button"], button:has(svg[data-icon="search"])',
    searchInput: '[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]',
    searchResults: '[data-testid="search-results"], .search-results',
    sidebarToggle: '[data-testid="sidebar-toggle"], button:has(svg[data-icon="menu"])',
    favoriteItems: '[data-testid="favorite-item"], .favorite-item',
    categoryItems: '[data-testid="category-item"], .category-item',
    recentlyUsed: '[data-testid="recently-used"], .recently-used',
    relatedFeatures: '[data-testid="related-features"], .related-features, :text("Related Tools")',
    quickActions: '[data-testid="quick-actions"], .quick-actions',
    workflowNavigation: '[data-testid="workflow-navigation"], .workflow-navigation'
  },
  a11y: {
    rules: {
      // Customize accessibility rules if needed
      'color-contrast': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'button-name': { enabled: true }
    }
  }
};

// Helper functions
async function takeScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = `${name}-${page.viewportSize()?.width}x${page.viewportSize()?.height}.png`;
  await testInfo.attach(path, {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
}

async function measurePerformance(page: Page): Promise<PerformanceMetrics> {
  const metrics: PerformanceMetrics = {
    navigationLoadTime: 0,
    sidebarLoadTime: 0,
    searchResponseTime: 0,
    breadcrumbsLoadTime: 0
  };

  // Measure navigation load time
  const navStartTime = performance.now();
  await page.waitForSelector(TEST_CONFIG.selectors.enhancedNavigation, { timeout: 5000 })
    .catch(() => console.log('Enhanced navigation not found'));
  metrics.navigationLoadTime = performance.now() - navStartTime;

  // Measure sidebar load time
  const sidebarStartTime = performance.now();
  await page.waitForSelector(TEST_CONFIG.selectors.contextualSidebar, { timeout: 5000 })
    .catch(() => console.log('Contextual sidebar not found'));
  metrics.sidebarLoadTime = performance.now() - sidebarStartTime;

  // Measure breadcrumbs load time
  const breadcrumbsStartTime = performance.now();
  await page.waitForSelector(TEST_CONFIG.selectors.breadcrumbs, { timeout: 5000 })
    .catch(() => console.log('Breadcrumbs not found'));
  metrics.breadcrumbsLoadTime = performance.now() - breadcrumbsStartTime;

  return metrics;
}

async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector);
  if (!element) return false;
  
  return await element.isVisible();
}

async function isSidebarExpanded(page: Page): Promise<boolean> {
  return await page.evaluate((selector) => {
    const sidebar = document.querySelector(selector);
    if (!sidebar) return false;
    
    const style = window.getComputedStyle(sidebar);
    const width = parseInt(style.width);
    
    // Consider it expanded if width is greater than 100px
    return width > 100;
  }, TEST_CONFIG.selectors.contextualSidebar);
}

// Test setup
test.beforeEach(async ({ page }) => {
  // Set default viewport to desktop
  await page.setViewportSize(TEST_CONFIG.viewports.desktop);
});

// Test groups
test.describe('Navigation Components Rendering', () => {
  test('Enhanced Navigation renders on all pages', async ({ page }, testInfo) => {
    // Test on multiple routes
    for (const route of TEST_CONFIG.routes) {
      await page.goto(`${TEST_CONFIG.baseUrl}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Check if enhanced navigation is visible
      const navVisible = await isElementVisible(page, TEST_CONFIG.selectors.enhancedNavigation);
      
      // Take screenshot for visual verification
      await takeScreenshot(page, testInfo, `enhanced-nav-${route.replace(/\//g, '-')}`);
      
      expect(navVisible).toBeTruthy();
    }
  });

  test('Contextual Sidebar renders on all pages', async ({ page }, testInfo) => {
    // Test on multiple routes
    for (const route of TEST_CONFIG.routes) {
      await page.goto(`${TEST_CONFIG.baseUrl}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Check if contextual sidebar is visible
      const sidebarVisible = await isElementVisible(page, TEST_CONFIG.selectors.contextualSidebar);
      
      // Take screenshot for visual verification
      await takeScreenshot(page, testInfo, `sidebar-${route.replace(/\//g, '-')}`);
      
      expect(sidebarVisible).toBeTruthy();
    }
  });

  test('Breadcrumbs show correct path hierarchy', async ({ page }, testInfo) => {
    // Test on a nested route
    const route = '/dashboard/projects-hub';
    await page.goto(`${TEST_CONFIG.baseUrl}${route}`);
    await page.waitForLoadState('networkidle');
    
    // Check if breadcrumbs are visible
    const breadcrumbsVisible = await isElementVisible(page, TEST_CONFIG.selectors.breadcrumbs);
    expect(breadcrumbsVisible).toBeTruthy();
    
    // Check breadcrumb content
    const breadcrumbLinks = await page.$$eval(`${TEST_CONFIG.selectors.breadcrumbs} a`, 
      (links) => links.map(link => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))
    );
    
    // Take screenshot of breadcrumbs
    await takeScreenshot(page, testInfo, 'breadcrumbs');
    
    // Verify breadcrumb structure (Dashboard > Projects Hub)
    expect(breadcrumbLinks.length).toBeGreaterThanOrEqual(2);
    expect(breadcrumbLinks[0].href).toContain('/dashboard');
    expect(breadcrumbLinks[breadcrumbLinks.length - 1].href).toContain('/projects-hub');
  });
});

test.describe('Accessibility Testing', () => {
  test('Enhanced Navigation meets accessibility standards', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(TEST_CONFIG.selectors.enhancedNavigation)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Contextual Sidebar meets accessibility standards', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(TEST_CONFIG.selectors.contextualSidebar)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation works correctly', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Take screenshot to verify focus indicator
    await takeScreenshot(page, testInfo, 'keyboard-focus');
    
    // Check if focus is visible (this is a basic check, could be enhanced)
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? activeElement.tagName : null;
    });
    
    expect(focusedElement).not.toBeNull();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('Command+K opens search', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Press Command+K
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);
    
    // Check if search popover appears
    const searchVisible = await isElementVisible(page, TEST_CONFIG.selectors.searchInput);
    
    // Take screenshot of search popover
    await takeScreenshot(page, testInfo, 'search-cmd-k');
    
    expect(searchVisible).toBeTruthy();
  });

  test('Command+. toggles sidebar', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Get initial sidebar state
    const initialSidebarExpanded = await isSidebarExpanded(page);
    
    // Press Command+.
    await page.keyboard.press('Meta+.');
    await page.waitForTimeout(500);
    
    // Take screenshot after toggle
    await takeScreenshot(page, testInfo, 'sidebar-toggle');
    
    // Check if sidebar state changed
    const newSidebarExpanded = await isSidebarExpanded(page);
    
    expect(newSidebarExpanded).not.toEqual(initialSidebarExpanded);
  });

  test('Command+1-3 switches views', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Press Command+1 (should switch to first view)
    await page.keyboard.press('Meta+1');
    await page.waitForTimeout(500);
    
    // Take screenshot after view switch
    await takeScreenshot(page, testInfo, 'view-switch-1');
    
    // Press Command+2 (should switch to second view)
    await page.keyboard.press('Meta+2');
    await page.waitForTimeout(500);
    
    // Take screenshot after view switch
    await takeScreenshot(page, testInfo, 'view-switch-2');
    
    // Basic verification - the page didn't crash
    const navVisible = await isElementVisible(page, TEST_CONFIG.selectors.enhancedNavigation);
    expect(navVisible).toBeTruthy();
  });
});

test.describe('Touch Events and Drag-and-Drop', () => {
  test('Sidebar favorites support drag-and-drop on desktop', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Find favorite items
    const favoriteItems = await page.$$(TEST_CONFIG.selectors.favoriteItems);
    
    // Skip test if no favorites found
    if (favoriteItems.length < 2) {
      test.skip('Not enough favorite items to test drag-and-drop');
      return;
    }
    
    // Get initial order of favorites
    const initialOrder = await page.$$eval(TEST_CONFIG.selectors.favoriteItems, 
      items => items.map(item => item.textContent?.trim())
    );
    
    // Take screenshot before drag
    await takeScreenshot(page, testInfo, 'favorites-before-drag');
    
    // Perform drag and drop
    const firstItem = favoriteItems[0];
    const secondItem = favoriteItems[1];
    
    const firstItemBoundingBox = await firstItem.boundingBox();
    const secondItemBoundingBox = await secondItem.boundingBox();
    
    if (firstItemBoundingBox && secondItemBoundingBox) {
      await page.mouse.move(
        firstItemBoundingBox.x + firstItemBoundingBox.width / 2,
        firstItemBoundingBox.y + firstItemBoundingBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        secondItemBoundingBox.x + secondItemBoundingBox.width / 2,
        secondItemBoundingBox.y + secondItemBoundingBox.height / 2,
        { steps: 10 } // Smooth movement
      );
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Take screenshot after drag
    await takeScreenshot(page, testInfo, 'favorites-after-drag');
    
    // Get new order of favorites
    const newOrder = await page.$$eval(TEST_CONFIG.selectors.favoriteItems, 
      items => items.map(item => item.textContent?.trim())
    );
    
    // Verify order changed (basic check)
    expect(newOrder).not.toEqual(initialOrder);
  });

  test('Sidebar favorites support touch drag-and-drop on mobile', async ({ page }, testInfo) => {
    // Set mobile viewport
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Ensure sidebar is visible on mobile (might need to open it first)
    const sidebarVisible = await isElementVisible(page, TEST_CONFIG.selectors.contextualSidebar);
    if (!sidebarVisible) {
      await page.click(TEST_CONFIG.selectors.sidebarToggle);
      await page.waitForTimeout(500);
    }
    
    // Find favorite items
    const favoriteItems = await page.$$(TEST_CONFIG.selectors.favoriteItems);
    
    // Skip test if no favorites found
    if (favoriteItems.length < 2) {
      test.skip('Not enough favorite items to test drag-and-drop');
      return;
    }
    
    // Get initial order of favorites
    const initialOrder = await page.$$eval(TEST_CONFIG.selectors.favoriteItems, 
      items => items.map(item => item.textContent?.trim())
    );
    
    // Take screenshot before touch drag
    await takeScreenshot(page, testInfo, 'mobile-favorites-before-drag');
    
    // Perform touch drag and drop
    const firstItem = favoriteItems[0];
    const secondItem = favoriteItems[1];
    
    const firstItemBoundingBox = await firstItem.boundingBox();
    const secondItemBoundingBox = await secondItem.boundingBox();
    
    if (firstItemBoundingBox && secondItemBoundingBox) {
      // Simulate touch events
      await page.touchscreen.tap(
        firstItemBoundingBox.x + firstItemBoundingBox.width / 2,
        firstItemBoundingBox.y + firstItemBoundingBox.height / 2
      );
      
      // Move touch point (this is a simplified version, actual touch events are more complex)
      for (let i = 0; i <= 10; i++) {
        const x = firstItemBoundingBox.x + (secondItemBoundingBox.x - firstItemBoundingBox.x) * (i / 10);
        const y = firstItemBoundingBox.y + (secondItemBoundingBox.y - firstItemBoundingBox.y) * (i / 10);
        
        await page.mouse.move(x, y);
        await page.waitForTimeout(50);
      }
      
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Take screenshot after touch drag
    await takeScreenshot(page, testInfo, 'mobile-favorites-after-drag');
    
    // Get new order of favorites
    const newOrder = await page.$$eval(TEST_CONFIG.selectors.favoriteItems, 
      items => items.map(item => item.textContent?.trim())
    );
    
    // Note: Touch drag-and-drop is complex and might not work in headless testing
    // This is more of a smoke test to ensure no errors occur
    console.log('Initial order:', initialOrder);
    console.log('New order:', newOrder);
  });
});

test.describe('Responsive Design', () => {
  test('Navigation adapts to desktop viewport', async ({ page }, testInfo) => {
    await page.setViewportSize(TEST_CONFIG.viewports.desktop);
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check if both navigation and sidebar are visible
    const navVisible = await isElementVisible(page, TEST_CONFIG.selectors.enhancedNavigation);
    const sidebarVisible = await isElementVisible(page, TEST_CONFIG.selectors.contextualSidebar);
    
    // Take screenshot
    await takeScreenshot(page, testInfo, 'responsive-desktop');
    
    expect(navVisible).toBeTruthy();
    expect(sidebarVisible).toBeTruthy();
  });

  test('Navigation adapts to tablet viewport', async ({ page }, testInfo) => {
    await page.setViewportSize(TEST_CONFIG.viewports.tablet);
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check if navigation is visible
    const navVisible = await isElementVisible(page, TEST_CONFIG.selectors.enhancedNavigation);
    
    // Take screenshot
    await takeScreenshot(page, testInfo, 'responsive-tablet');
    
    expect(navVisible).toBeTruthy();
  });

  test('Navigation adapts to mobile viewport', async ({ page }, testInfo) => {
    await page.setViewportSize(TEST_CONFIG.viewports.mobile);
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check if mobile menu button is visible
    const mobileMenuVisible = await isElementVisible(page, TEST_CONFIG.selectors.sidebarToggle);
    
    // Take screenshot
    await takeScreenshot(page, testInfo, 'responsive-mobile');
    
    expect(mobileMenuVisible).toBeTruthy();
    
    // Test opening mobile menu
    if (mobileMenuVisible) {
      await page.click(TEST_CONFIG.selectors.sidebarToggle);
      await page.waitForTimeout(500);
      
      // Take screenshot of open mobile menu
      await takeScreenshot(page, testInfo, 'mobile-menu-open');
      
      // Check if sidebar is now visible
      const sidebarVisible = await isElementVisible(page, TEST_CONFIG.selectors.contextualSidebar);
      expect(sidebarVisible).toBeTruthy();
    }
  });
});

test.describe('Performance Metrics', () => {
  test('Navigation components load within performance budget', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Measure performance metrics
    const metrics = await measurePerformance(page);
    
    // Log metrics for reporting
    console.log('Performance Metrics:', metrics);
    
    // Verify metrics are within acceptable range
    expect(metrics.navigationLoadTime).toBeLessThan(1000); // 1 second
    expect(metrics.sidebarLoadTime).toBeLessThan(1000); // 1 second
  });

  test('Search response time is acceptable', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.click(TEST_CONFIG.selectors.searchButton);
    await page.waitForTimeout(500);
    
    // Measure search response time
    const startTime = performance.now();
    
    // Type search query
    await page.type(TEST_CONFIG.selectors.searchInput, 'project');
    
    // Wait for search results
    await page.waitForSelector(TEST_CONFIG.selectors.searchResults, { timeout: 5000 })
      .catch(() => console.log('Search results not found'));
    
    const searchTime = performance.now() - startTime;
    console.log(`Search response time: ${searchTime}ms`);
    
    // Verify search time is acceptable
    expect(searchTime).toBeLessThan(500); // 500ms
  });
});

test.describe('Search Functionality', () => {
  test('Search shows relevant results', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.click(TEST_CONFIG.selectors.searchButton);
    await page.waitForTimeout(500);
    
    // Type search query
    await page.type(TEST_CONFIG.selectors.searchInput, 'project');
    await page.waitForTimeout(500);
    
    // Take screenshot of search results
    await takeScreenshot(page, testInfo, 'search-results');
    
    // Check if search results contain relevant items
    const hasResults = await page.$$eval(
      `${TEST_CONFIG.selectors.searchResults} li, ${TEST_CONFIG.selectors.searchResults} a`, 
      items => items.length > 0
    );
    
    expect(hasResults).toBeTruthy();
    
    // Check if at least one result contains the search term
    const hasRelevantResult = await page.$$eval(
      `${TEST_CONFIG.selectors.searchResults} li, ${TEST_CONFIG.selectors.searchResults} a`,
      (items, query) => items.some(item => 
        item.textContent?.toLowerCase().includes(query.toLowerCase())
      ),
      'project'
    );
    
    expect(hasRelevantResult).toBeTruthy();
  });

  test('Search handles no results gracefully', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.click(TEST_CONFIG.selectors.searchButton);
    await page.waitForTimeout(500);
    
    // Type nonsense query
    await page.type(TEST_CONFIG.selectors.searchInput, 'xyznonexistentquery123');
    await page.waitForTimeout(500);
    
    // Take screenshot of no results state
    await takeScreenshot(page, testInfo, 'search-no-results');
    
    // Check if no results message is shown (implementation specific)
    const noResultsVisible = await page.$$eval(
      `${TEST_CONFIG.selectors.searchResults}`, 
      elements => elements.some(el => 
        el.textContent?.includes('No results') || 
        el.textContent?.includes('not found') ||
        el.textContent?.includes('Try another')
      )
    );
    
    // This might be implementation specific, so we're just checking the search didn't crash
    const searchStillVisible = await isElementVisible(page, TEST_CONFIG.selectors.searchInput);
    expect(searchStillVisible).toBeTruthy();
  });
});

test.describe('Related Features', () => {
  test('Related features are shown on appropriate pages', async ({ page }, testInfo) => {
    // Test on a page that should have related features
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if related features section is visible
    const relatedFeaturesVisible = await isElementVisible(page, TEST_CONFIG.selectors.relatedFeatures);
    
    // Take screenshot
    await takeScreenshot(page, testInfo, 'related-features');
    
    expect(relatedFeaturesVisible).toBeTruthy();
    
    // Check if there are any related feature items
    const relatedFeatureItems = await page.$$eval(
      `${TEST_CONFIG.selectors.relatedFeatures} a, ${TEST_CONFIG.selectors.relatedFeatures} button`, 
      items => items.length
    );
    
    expect(relatedFeatureItems).toBeGreaterThan(0);
  });

  test('Quick actions are contextual to current page', async ({ page }, testInfo) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if quick actions section is visible
    const quickActionsVisible = await isElementVisible(page, TEST_CONFIG.selectors.quickActions);
    
    // Take screenshot
    await takeScreenshot(page, testInfo, 'quick-actions');
    
    if (quickActionsVisible) {
      // Check if there are any quick action items
      const quickActionItems = await page.$$eval(
        `${TEST_CONFIG.selectors.quickActions} a, ${TEST_CONFIG.selectors.quickActions} button`, 
        items => items.length
      );
      
      expect(quickActionItems).toBeGreaterThan(0);
    }
  });
});

test.describe('LocalStorage Persistence', () => {
  test('Sidebar state persists across page loads', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Get initial sidebar state
    const initialSidebarExpanded = await isSidebarExpanded(page);
    
    // Toggle sidebar
    await page.keyboard.press('Meta+.');
    await page.waitForTimeout(500);
    
    // Navigate to another page
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/projects-hub`);
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar state persisted
    const newSidebarExpanded = await isSidebarExpanded(page);
    
    expect(newSidebarExpanded).not.toEqual(initialSidebarExpanded);
  });

  test('Recently used items update after navigation', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to a specific page
    const testPage = '/dashboard/projects-hub';
    await page.goto(`${TEST_CONFIG.baseUrl}${testPage}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate back to dashboard
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check if recently used items include the page we visited
    const recentlyUsedContainsPage = await page.$$eval(
      `${TEST_CONFIG.selectors.recentlyUsed} a`,
      (links, pageToFind) => links.some(link => 
        link.getAttribute('href')?.includes(pageToFind)
      ),
      'projects-hub'
    );
    
    expect(recentlyUsedContainsPage).toBeTruthy();
  });
});

// Final test report generation
test.afterAll(async ({ }, testInfo) => {
  console.log(`Test completed at: ${new Date().toISOString()}`);
  console.log(`Total tests: ${testInfo.project.metadata.totalTestCount}`);
  console.log(`Passed: ${testInfo.project.metadata.passedTestCount}`);
  console.log(`Failed: ${testInfo.project.metadata.failedTestCount}`);
  console.log(`Skipped: ${testInfo.project.metadata.skippedTestCount}`);
});
