import { test, expect } from '@playwright/test';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode header
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    // Wait for critical elements to be visible
    await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 30000 }).catch(() => {
      console.log('Dashboard title not found, continuing...');
    });
  });

  test('should load dashboard page successfully', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-title"]')).toHaveText('Dashboard');
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.locator('[data-testid="stat-active-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-team-members"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-completed-tasks"]')).toBeVisible();
  });

  test('should have working navigation tabs', async ({ page }) => {
    const tabs = page.locator('[data-testid="dashboard-tabs"]');
    await expect(tabs).toBeVisible();
    
    // Test Projects tab
    await page.click('[data-testid="projects-tab"]');
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();
    
    // Test Team tab
    await page.click('[data-testid="team-tab"]');
    await expect(page.locator('[data-testid="team-hub"]')).toBeVisible();
    
    // Test Analytics tab
    await page.click('[data-testid="analytics-tab"]');
    await expect(page.locator('[data-testid="analytics-hub"]')).toBeVisible();
    
    // Test Settings tab
    await page.click('[data-testid="settings-tab"]');
    await expect(page.locator('[data-testid="settings-hub"]')).toBeVisible();
  });

  test('should display projects in Projects Hub', async ({ page }) => {
    await page.click('[data-testid="projects-tab"]');
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible();
    
    // Check for project items
    await expect(page.locator('[data-testid="project-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-status-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-project-1"]')).toBeVisible();
  });

  test('should display team members with avatars', async ({ page }) => {
    await page.click('[data-testid="team-tab"]');
    await expect(page.locator('[data-testid="team-hub"]')).toBeVisible();
    
    // Check team members
    const teamMembers = ['alice', 'john', 'bob', 'jane', 'mike'];
    for (const member of teamMembers) {
      await expect(page.locator(`[data-testid="team-member-${member}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="member-status-${member}"]`)).toBeVisible();
    }
  });

  test('should handle new project button click', async ({ page }) => {
    const newProjectButton = page.locator('[data-testid="new-project-button"]');
    await expect(newProjectButton).toBeVisible();
    await expect(newProjectButton).toBeEnabled();
    
    // Click should be possible (actual navigation tested separately)
    await newProjectButton.click();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    
    // Stats should stack on mobile
    const statsGrid = page.locator('.grid-cols-1.md\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
  });

  test('should load team member avatars without 404 errors', async ({ page }) => {
    // Listen for failed image requests
    const failedRequests: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/avatars/') && response.status() === 404) {
        failedRequests.push(response.url());
      }
    });
    
    await page.click('[data-testid="team-tab"]');
    await page.waitForTimeout(2000); // Wait for images to load
    
    expect(failedRequests).toHaveLength(0);
  });

  test('should have proper accessibility labels', async ({ page }) => {
    // Check for proper ARIA labels and semantic HTML
    await expect(page.locator('h1[data-testid="dashboard-title"]')).toBeVisible();
    
    // Navigation should be accessible
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
  });
});
