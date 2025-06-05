import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Dashboard Enhanced Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({ 'x-test-mode': 'true' });
  });

  test('should load dashboard without any 404 errors', async ({ page }) => {
    const failed404s = await helpers.verifyNo404Errors();
    
    await page.goto('/dashboard');
    await helpers.waitForAppReady();
    
    // Wait for all resources to load
    await page.waitForTimeout(3000);
    
    // Check that no 404 errors occurred
    expect(failed404s).toHaveLength(0);
  });

  test('should display all dashboard components correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Test all major dashboard elements
    const elements = [
      '[data-testid="dashboard-container"]',
      '[data-testid="dashboard-title"]',
      '[data-testid="new-project-button"]',
      '[data-testid="stat-active-projects"]',
      '[data-testid="stat-total-revenue"]',
      '[data-testid="stat-team-members"]',
      '[data-testid="stat-completed-tasks"]',
      '[data-testid="dashboard-tabs"]'
    ];

    for (const element of elements) {
      await expect(page.locator(element)).toBeVisible();
    }
  });

  test('should navigate between all dashboard tabs', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    const tabs = [
      { tab: 'projects-tab', hub: 'projects-hub' },
      { tab: 'team-tab', hub: 'team-hub' },
      { tab: 'analytics-tab', hub: 'analytics-hub' },
      { tab: 'settings-tab', hub: 'settings-hub' }
    ];

    for (const { tab, hub } of tabs) {
      await page.click(`[data-testid="${tab}"]`);
      await expect(page.locator(`[data-testid="${hub}"]`)).toBeVisible();
      await page.waitForTimeout(500); // Small delay for smooth UX
    }
  });

  test('should display projects with proper structure', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Navigate to projects hub
    await page.click('[data-testid="projects-tab"]');
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();

    // Check project items
    await expect(page.locator('[data-testid="project-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-status-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-project-1"]')).toBeVisible();

    // Verify project has title and status
    const projectElement = page.locator('[data-testid="project-1"]');
    await expect(projectElement).toContainText('Premium Brand Identity Package');
    
    const statusElement = page.locator('[data-testid="project-status-1"]');
    await expect(statusElement).toContainText('active');
  });

  test('should display team members with avatars and status', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Navigate to team hub
    await page.click('[data-testid="team-tab"]');
    await expect(page.locator('[data-testid="team-hub"]')).toBeVisible();

    // Check team members
    const teamMembers = ['alice', 'john', 'bob', 'jane', 'mike'];
    
    for (const member of teamMembers) {
      await expect(page.locator(`[data-testid="team-member-${member}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="member-status-${member}"]`)).toBeVisible();
    }

    // Verify avatar images load properly
    const avatarImages = page.locator('img[src*="/avatars/"]');
    const avatarCount = await avatarImages.count();
    expect(avatarCount).toBeGreaterThan(0);
  });

  test('should be accessible with proper ARIA labels', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Check main heading
    const mainHeading = page.locator('h1[data-testid="dashboard-title"]');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveText('Dashboard');

    // Check navigation structure
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    // Check buttons are focusable and have proper labels
    const newProjectButton = page.locator('[data-testid="new-project-button"]');
    await expect(newProjectButton).toBeVisible();
    await expect(newProjectButton).toBeEnabled();
  });

  test('should handle responsive design across viewports', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Test responsive behavior
    await helpers.testMobileResponsiveness();

    // Verify dashboard is usable on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Stats should still be visible but may be stacked
    await expect(page.locator('[data-testid="stat-active-projects"]')).toBeVisible();
    
    // Tabs should still work on mobile
    await page.click('[data-testid="team-tab"]');
    await expect(page.locator('[data-testid="team-hub"]')).toBeVisible();
  });

  test('should measure dashboard performance', async ({ page }) => {
    const performance = await helpers.measurePagePerformance('Dashboard');
    
    await page.goto('/dashboard');
    await helpers.waitForAppReady();
    
    // Dashboard should load quickly
    expect(performance.loadTime).toBeLessThan(3000); // 3 seconds max
  });

  test('should handle interactions properly', async ({ page }) => {
    await page.goto('/dashboard');
    await helpers.waitForAppReady();

    // Test new project button
    const newProjectButton = page.locator('[data-testid="new-project-button"]');
    await expect(newProjectButton).toBeEnabled();
    
    // Test view project buttons
    await page.click('[data-testid="projects-tab"]');
    const viewProjectButton = page.locator('[data-testid="view-project-1"]');
    await expect(viewProjectButton).toBeVisible();
    await expect(viewProjectButton).toBeEnabled();
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = await helpers.checkConsoleErrors();
    
    await page.goto('/dashboard');
    await helpers.waitForAppReady();
    
    // Navigate through all tabs to trigger any errors
    const tabs = ['projects-tab', 'team-tab', 'analytics-tab', 'settings-tab'];
    for (const tab of tabs) {
      await page.click(`[data-testid="${tab}"]`);
      await page.waitForTimeout(500);
    }
    
    // Should have minimal console errors
    expect(consoleErrors.length).toBeLessThan(3);
  });
});
