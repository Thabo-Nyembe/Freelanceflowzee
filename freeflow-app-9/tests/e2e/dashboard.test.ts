import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Dashboard Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Authenticate before each test
    await helpers.authenticateUser('test@freeflowzee.com', 'testpassword');
  });

  test('should load dashboard page successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText(/Dashboard|Welcome/);
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@freeflowzee.com');
  });

  test('should navigate to different dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test Projects Hub navigation
    await page.click('[data-testid="projects-hub-link"]');
    await expect(page).toHaveURL(/.*projects-hub/);
    
    // Test Files & Escrow navigation
    await page.click('[data-testid="files-escrow-link"]');
    await expect(page).toHaveURL(/.*files-escrow/);
    
    // Test Video Studio navigation
    await page.click('[data-testid="video-studio-link"]');
    await expect(page).toHaveURL(/.*video-studio/);
  });

  test('should handle notifications', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open notifications panel
    await page.click('[data-testid="notifications-button"]');
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
    
    // Close notifications panel
    await page.click('[data-testid="close-notifications"]');
    await expect(page.locator('[data-testid="notifications-panel"]')).not.toBeVisible();
  });

  test('should handle user settings', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open settings panel
    await page.click('[data-testid="settings-button"]');
    await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
    
    // Test theme toggle
    await page.click('[data-testid="theme-toggle"]');
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDarkMode).toBeTruthy();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open search
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    
    // Test search input
    await page.fill('[data-testid="search-input"]', 'test project');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Verify search results
    const resultsCount = await page.locator('[data-testid="search-result-item"]').count();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('should handle file uploads', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to files section
    await page.click('[data-testid="files-escrow-link"]');
    
    // Test file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content')
    });
    
    // Verify upload success
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
  });

  test('should handle project creation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to projects hub
    await page.click('[data-testid="projects-hub-link"]');
    
    // Create new project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Test Project');
    await page.fill('[data-testid="project-description-input"]', 'Test Description');
    await page.click('[data-testid="submit-project"]');
    
    // Verify project creation
    await expect(page.locator('text=Test Project')).toBeVisible();
  });
}); 