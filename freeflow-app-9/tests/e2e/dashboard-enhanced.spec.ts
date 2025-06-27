import { test, expect } from &apos;@playwright/test&apos;;
import { TestHelpers } from &apos;../utils/test-helpers&apos;;

test.describe(&apos;Dashboard Enhanced Tests&apos;, () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({ &apos;x-test-mode&apos;: &apos;true&apos; });
  });

  test(&apos;should load dashboard without any 404 errors&apos;, async ({ page }) => {
    const failed404s = await helpers.verifyNo404Errors();
    
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();
    
    // Wait for all resources to load
    await page.waitForTimeout(3000);
    
    // Check that no 404 errors occurred
    expect(failed404s).toHaveLength(0);
  });

  test(&apos;should display all dashboard components correctly&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Test all major dashboard elements
    const elements = [
      &apos;[data-testid=&quot;dashboard-container&quot;]&apos;,
      &apos;[data-testid=&quot;dashboard-title&quot;]&apos;,
      &apos;[data-testid=&quot;new-project-button&quot;]&apos;,
      &apos;[data-testid=&quot;stat-active-projects&quot;]&apos;,
      &apos;[data-testid=&quot;stat-total-revenue&quot;]&apos;,
      &apos;[data-testid=&quot;stat-team-members&quot;]&apos;,
      &apos;[data-testid=&quot;stat-completed-tasks&quot;]&apos;,
      &apos;[data-testid=&quot;dashboard-tabs&quot;]&apos;
    ];

    for (const element of elements) {
      await expect(page.locator(element)).toBeVisible();
    }
  });

  test(&apos;should navigate between all dashboard tabs&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    const tabs = [
      { tab: &apos;projects-tab&apos;, hub: &apos;projects-hub&apos; },
      { tab: &apos;team-tab&apos;, hub: &apos;team-hub&apos; },
      { tab: &apos;analytics-tab&apos;, hub: &apos;analytics-hub&apos; },
      { tab: &apos;settings-tab&apos;, hub: &apos;settings-hub&apos; }
    ];

    for (const { tab, hub } of tabs) {
      await page.click(`[data-testid=&quot;${tab}&quot;]`);
      await expect(page.locator(`[data-testid=&quot;${hub}&quot;]`)).toBeVisible();
      await page.waitForTimeout(500); // Small delay for smooth UX
    }
  });

  test(&apos;should display projects with proper structure&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Navigate to projects hub
    await page.click(&apos;[data-testid=&quot;projects-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();

    // Check project items
    await expect(page.locator(&apos;[data-testid=&quot;project-1&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;project-status-1&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;view-project-1&quot;]&apos;)).toBeVisible();

    // Verify project has title and status
    const projectElement = page.locator(&apos;[data-testid=&quot;project-1&quot;]&apos;);
    await expect(projectElement).toContainText(&apos;Premium Brand Identity Package&apos;);
    
    const statusElement = page.locator(&apos;[data-testid=&quot;project-status-1&quot;]&apos;);
    await expect(statusElement).toContainText(&apos;active&apos;);
  });

  test(&apos;should display team members with avatars and status&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Navigate to team hub
    await page.click(&apos;[data-testid=&quot;team-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;team-hub&quot;]&apos;)).toBeVisible();

    // Check team members
    const teamMembers = [&apos;alice&apos;, &apos;john&apos;, &apos;bob&apos;, &apos;jane&apos;, &apos;mike&apos;];
    
    for (const member of teamMembers) {
      await expect(page.locator(`[data-testid=&quot;team-member-${member}&quot;]`)).toBeVisible();
      await expect(page.locator(`[data-testid=&quot;member-status-${member}&quot;]`)).toBeVisible();
    }

    // Verify avatar images load properly
    const avatarImages = page.locator(&apos;img[src*=&quot;/avatars/&quot;]&apos;);
    const avatarCount = await avatarImages.count();
    expect(avatarCount).toBeGreaterThan(0);
  });

  test(&apos;should be accessible with proper ARIA labels&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Check main heading
    const mainHeading = page.locator(&apos;h1[data-testid=&quot;dashboard-title&quot;]&apos;);
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveText(&apos;Dashboard&apos;);

    // Check navigation structure
    const tabList = page.locator(&apos;[role=&quot;tablist&quot;]&apos;);
    await expect(tabList).toBeVisible();

    // Check buttons are focusable and have proper labels
    const newProjectButton = page.locator(&apos;[data-testid=&quot;new-project-button&quot;]&apos;);
    await expect(newProjectButton).toBeVisible();
    await expect(newProjectButton).toBeEnabled();
  });

  test(&apos;should handle responsive design across viewports&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Test responsive behavior
    await helpers.testMobileResponsiveness();

    // Verify dashboard is usable on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator(&apos;[data-testid=&quot;dashboard-container&quot;]&apos;)).toBeVisible();
    
    // Stats should still be visible but may be stacked
    await expect(page.locator(&apos;[data-testid=&quot;stat-active-projects&quot;]&apos;)).toBeVisible();
    
    // Tabs should still work on mobile
    await page.click(&apos;[data-testid=&quot;team-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;team-hub&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should measure dashboard performance&apos;, async ({ page }) => {
    const performance = await helpers.measurePagePerformance(&apos;Dashboard&apos;);
    
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();
    
    // Dashboard should load quickly
    expect(performance.loadTime).toBeLessThan(3000); // 3 seconds max
  });

  test(&apos;should handle interactions properly&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();

    // Test new project button
    const newProjectButton = page.locator(&apos;[data-testid=&quot;new-project-button&quot;]&apos;);
    await expect(newProjectButton).toBeEnabled();
    
    // Test view project buttons
    await page.click(&apos;[data-testid=&quot;projects-tab&quot;]&apos;);
    const viewProjectButton = page.locator(&apos;[data-testid=&quot;view-project-1&quot;]&apos;);
    await expect(viewProjectButton).toBeVisible();
    await expect(viewProjectButton).toBeEnabled();
  });

  test(&apos;should not have console errors&apos;, async ({ page }) => {
    const consoleErrors = await helpers.checkConsoleErrors();
    
    await page.goto(&apos;/dashboard&apos;);
    await helpers.waitForAppReady();
    
    // Navigate through all tabs to trigger any errors
    const tabs = [&apos;projects-tab&apos;, &apos;team-tab&apos;, &apos;analytics-tab&apos;, &apos;settings-tab&apos;];
    for (const tab of tabs) {
      await page.click(`[data-testid=&quot;${tab}&quot;]`);
      await page.waitForTimeout(500);
    }
    
    // Should have minimal console errors
    expect(consoleErrors.length).toBeLessThan(3);
  });
});
