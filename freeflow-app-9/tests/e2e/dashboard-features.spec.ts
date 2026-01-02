import { test, expect } from '@playwright/test';

test.describe('Dashboard Features Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should load main dashboard with all tabs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main dashboard elements
    await expect(page.locator('h1')).toContainText('Welcome to KAZI');
    
    // Check for tab navigation
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    
    // Verify tab content loads
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    // Check for statistics cards
    await expect(page.locator('text=Earnings')).toBeVisible();
    await expect(page.locator('text=Active Projects')).toBeVisible();
  });

  test('should switch between dashboard tabs', async ({ page }) => {
    await page.goto('/dashboard');
    
    const tabs = ['Overview', 'Projects Hub', 'AI Create', 'Community'];
    
    for (const tab of tabs) {
      await page.click(`[role="tab"]:has-text("${tab}")`);
      await page.waitForTimeout(500); // Allow tab to switch
      
      // Verify tab is active
      await expect(page.locator(`[role="tab"]:has-text("${tab}")`)).toHaveAttribute('data-state', 'active');
    }
  });

  test('should have functional AI Design page', async ({ page }) => {
    await page.goto('/dashboard/ai-design-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('AI Design Studio');
    
    // Check for tool cards
    await expect(page.locator('text=Logo Generator')).toBeVisible();
    await expect(page.locator('text=Color Palette Generator')).toBeVisible();
    
    // Check tabs functionality
    await page.click('[role="tab"]:has-text("Projects")');
    await expect(page.locator('text=Recent Projects')).toBeVisible();
    
    await page.click('[role="tab"]:has-text("Tools")');
    await expect(page.locator('text=AI Tools')).toBeVisible();
  });

  test('should have functional Calendar page', async ({ page }) => {
    await page.goto('/dashboard/calendar-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('Calendar');
    
    // Check for calendar grid
    await expect(page.locator('text=Sun')).toBeVisible();
    await expect(page.locator('text=Mon')).toBeVisible();
    
    // Check for events sidebar
    await expect(page.locator('text=Today\'s Events')).toBeVisible();
    
    // Test month navigation
    const prevButton = page.locator('button').filter({ hasText: /Previous/ }).or(page.locator('svg[data-lucide="chevron-left"]').locator('..'));
    if (await prevButton.count() > 0) {
      await prevButton.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should have functional CV Portfolio page', async ({ page }) => {
    await page.goto('/dashboard/profile-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('CV & Portfolio');
    
    // Check profile section
    await expect(page.locator('text=Thabo Nkanyane')).toBeVisible();
    
    // Check tabs
    const tabs = ['Overview', 'Experience', 'Projects', 'Education', 'Awards'];
    for (const tab of tabs) {
      await page.click(`[role="tab"]:has-text("${tab}")`);
      await page.waitForTimeout(300);
      await expect(page.locator(`[role="tab"]:has-text("${tab}")`)).toHaveAttribute('data-state', 'active');
    }
  });

  test('should have working Projects Hub', async ({ page }) => {
    await page.goto('/dashboard/projects-hub-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Check for project cards or empty state
    const projectCards = page.locator('[class*="card"]');
    await expect(projectCards).toHaveCount.greaterThan(0);
    
    // Check for filters or actions
    await expect(page.locator('button')).toHaveCount.greaterThan(0);
  });

  test('should have working Community Hub', async ({ page }) => {
    await page.goto('/dashboard/community-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('Community');
    
    // Check for community content
    await expect(page.locator('[class*="card"]')).toHaveCount.greaterThan(0);
  });

  test('should have working Files Hub', async ({ page }) => {
    await page.goto('/dashboard/files-hub-v2');
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('Files');
    
    // Check for file management interface
    await expect(page.locator('button')).toHaveCount.greaterThan(0);
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for search input
    const searchInputs = page.locator('input[placeholder*="search" i], input[type="search"]');
    const searchCount = await searchInputs.count();
    
    if (searchCount > 0) {
      await searchInputs.first().fill('test');
      await page.waitForTimeout(1000);
      // Search should not cause errors
      await expect(page.locator('body')).toBeVisible();
    }
  });
});