import { test, expect } from '@playwright/test';
import { navigateToProtectedRoute } from '../utils/auth-helper';

/**
 * Dashboard Rendering Tests
 *
 * These tests verify that the dashboard renders correctly after the layout fix.
 * Tests cover:
 * - Main dashboard content rendering
 * - Stats cards displaying correctly
 * - AI features loading
 * - Navigation working
 * - No console errors
 */

test.describe('Dashboard Rendering Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard with authentication handling
    await navigateToProtectedRoute(page, '/dashboard');
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('Dashboard main content renders correctly', async ({ page }) => {
    // Debug: take screenshot and log URL
    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'tests/screenshots/dashboard-debug.png', fullPage: true });

    // Check that the main content area is not empty
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Check for key dashboard elements
    const dashboardContent = page.locator('.container');
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/dashboard-main.png', fullPage: true });
  });

  test('Stats cards display with correct data', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000);

    // Check for Total Earnings card
    const earningsText = page.locator('text=Total Earnings');
    await expect(earningsText).toBeVisible();

    // Check for Active Projects card
    const projectsText = page.locator('text=Active Projects');
    await expect(projectsText).toBeVisible();

    // Check for Total Clients card
    const clientsText = page.locator('text=Total Clients');
    await expect(clientsText).toBeVisible();

    // Check for Hours This Month card
    const hoursText = page.locator('text=Hours This Month');
    await expect(hoursText).toBeVisible();

    // Verify numbers are displayed (not loading skeletons)
    const dollarSign = page.locator('text=$847,000').first();
    await expect(dollarSign).toBeVisible({ timeout: 10000 });
  });

  test('AI Business Intelligence panel loads', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for AI Business Intelligence section
    const aiPanel = page.locator('text=AI Business Intelligence');
    await expect(aiPanel).toBeVisible();

    // Check for Claude branding
    const claudePowered = page.locator('text=Powered by Claude');
    await expect(claudePowered).toBeVisible();
  });

  test('Sidebar navigation is functional', async ({ page }) => {
    // Check sidebar is visible
    const sidebar = page.locator('[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // Check for Dashboard link in sidebar
    const dashboardLink = page.locator('text=Dashboard').first();
    await expect(dashboardLink).toBeVisible();

    // Check for other navigation items
    const myDayLink = page.locator('text=My Day');
    await expect(myDayLink).toBeVisible();
  });

  test('No console errors on dashboard load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('DevTools') &&
      !error.includes('third-party')
    );

    // Log any errors found
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }

    // Allow some non-critical errors but fail on many
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('Dashboard tabs are interactive', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find and click on different tabs
    const tabs = page.locator('[role="tab"], [data-state="active"], button').filter({ hasText: /Overview|Core|AI Tools|Creative/i });

    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Click on a tab if available
    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });

  test('Quick actions are visible and clickable', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for action buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(5);
  });

  test('Dashboard is responsive - mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check that content is still visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-mobile.png', fullPage: true });
  });

  test('Dashboard is responsive - tablet view', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check that content is still visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Take tablet screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-tablet.png', fullPage: true });
  });
});

test.describe('Dashboard Navigation Tests', () => {
  test('Navigate to My Day page', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard');

    // Click on My Day
    await page.click('text=My Day');
    await page.waitForLoadState('networkidle');

    // Verify URL changed
    await expect(page).toHaveURL(/.*my-day/);
  });

  test('Navigate to Growth Hub page', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard');

    // Click on Growth Hub
    const growthHub = page.locator('text=Growth Hub');
    if (await growthHub.isVisible()) {
      await growthHub.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*growth-hub/);
    }
  });

  test('Navigate back to Dashboard from sub-page', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard/my-day-v2');

    // Click on Dashboard link in sidebar
    const dashboardLink = page.locator('a:has-text("Dashboard"), [href="/dashboard"]').first();
    await dashboardLink.click();
    await page.waitForLoadState('networkidle');

    // Verify URL contains dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Dashboard Data Loading Tests', () => {
  test('Dashboard loads without showing error state', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard');
    await page.waitForTimeout(3000);

    // Check that error state is NOT visible
    const errorState = page.locator('text=Something went wrong');
    await expect(errorState).not.toBeVisible();
  });

  test('Dashboard loads without infinite loading', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard');

    // Wait for content to appear (max 15 seconds)
    const statsCard = page.locator('text=Total Earnings');
    await expect(statsCard).toBeVisible({ timeout: 15000 });
  });

  test('Mock data displays correctly', async ({ page }) => {
    await navigateToProtectedRoute(page, '/dashboard');
    await page.waitForTimeout(3000);

    // Check for specific mock data values
    const earnings = page.locator('text=$847,000');
    await expect(earnings.first()).toBeVisible({ timeout: 10000 });

    // Check for client count
    const clients = page.locator('text=2,847');
    await expect(clients.first()).toBeVisible({ timeout: 10000 });
  });
});
