import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Dashboard Tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode header
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;
    });
    
    await page.goto(&apos;/dashboard&apos;);
    await page.waitForLoadState(&apos;domcontentloaded&apos;);
    // Wait for critical elements to be visible
    await page.waitForSelector(&apos;[data-testid=&quot;dashboard-title&quot;]&apos;, { timeout: 30000 }).catch(() => {
      console.log(&apos;Dashboard title not found, continuing...&apos;);
    });
  });

  test(&apos;should load dashboard page successfully&apos;, async ({ page }) => {
    await expect(page.locator(&apos;[data-testid=&quot;dashboard-container&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;dashboard-title&quot;]&apos;)).toHaveText(&apos;Dashboard&apos;);
  });

  test(&apos;should display dashboard stats&apos;, async ({ page }) => {
    await expect(page.locator(&apos;[data-testid=&quot;stat-active-projects&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;stat-total-revenue&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;stat-team-members&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;stat-completed-tasks&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should have working navigation tabs&apos;, async ({ page }) => {
    const tabs = page.locator(&apos;[data-testid=&quot;dashboard-tabs&quot;]&apos;);
    await expect(tabs).toBeVisible();
    
    // Test Projects tab
    await page.click(&apos;[data-testid=&quot;projects-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();
    
    // Test Team tab
    await page.click(&apos;[data-testid=&quot;team-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;team-hub&quot;]&apos;)).toBeVisible();
    
    // Test Analytics tab
    await page.click(&apos;[data-testid=&quot;analytics-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;analytics-hub&quot;]&apos;)).toBeVisible();
    
    // Test Settings tab
    await page.click(&apos;[data-testid=&quot;settings-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;settings-hub&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should display projects in Projects Hub&apos;, async ({ page }) => {
    await page.click(&apos;[data-testid=&quot;projects-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();
    
    // Check for project items
    await expect(page.locator(&apos;[data-testid=&quot;project-1&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;project-status-1&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;view-project-1&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should display team members with avatars&apos;, async ({ page }) => {
    await page.click(&apos;[data-testid=&quot;team-tab&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;team-hub&quot;]&apos;)).toBeVisible();
    
    // Check team members
    const teamMembers = [&apos;alice&apos;, &apos;john&apos;, &apos;bob&apos;, &apos;jane&apos;, &apos;mike&apos;];
    for (const member of teamMembers) {
      await expect(page.locator(`[data-testid=&quot;team-member-${member}&quot;]`)).toBeVisible();
      await expect(page.locator(`[data-testid=&quot;member-status-${member}&quot;]`)).toBeVisible();
    }
  });

  test(&apos;should handle new project button click&apos;, async ({ page }) => {
    const newProjectButton = page.locator(&apos;[data-testid=&quot;new-project-button&quot;]&apos;);
    await expect(newProjectButton).toBeVisible();
    await expect(newProjectButton).toBeEnabled();
    
    // Click should be possible (actual navigation tested separately)
    await newProjectButton.click();
  });

  test(&apos;should be responsive on mobile&apos;, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator(&apos;[data-testid=&quot;dashboard-container&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;dashboard-title&quot;]&apos;)).toBeVisible();
    
    // Stats should stack on mobile
    const statsGrid = page.locator(&apos;.grid-cols-1.md\\:grid-cols-4&apos;);
    await expect(statsGrid).toBeVisible();
  });

  test(&apos;should load team member avatars without 404 errors&apos;, async ({ page }) => {
    // Listen for failed image requests
    const failedRequests: string[] = [];
    page.on(&apos;response&apos;, response => {
      if (response.url().includes(&apos;/avatars/&apos;) && response.status() === 404) {
        failedRequests.push(response.url());
      }
    });
    
    await page.click(&apos;[data-testid=&quot;team-tab&quot;]&apos;);
    await page.waitForTimeout(2000); // Wait for images to load
    
    expect(failedRequests).toHaveLength(0);
  });

  test(&apos;should have proper accessibility labels&apos;, async ({ page }) => {
    // Check for proper ARIA labels and semantic HTML
    await expect(page.locator(&apos;h1[data-testid=&quot;dashboard-title&quot;]&apos;)).toBeVisible();
    
    // Navigation should be accessible
    const tabs = page.locator(&apos;[role=&quot;tablist&quot;]&apos;);
    await expect(tabs).toBeVisible();
  });
});
