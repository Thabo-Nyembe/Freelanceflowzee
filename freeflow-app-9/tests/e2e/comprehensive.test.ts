import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

// Test data
const TEST_USER = {
  email: 'test@freeflowzee.com',
  password: 'testpassword',
  name: 'Test User'
};

test.describe('FreeflowZee Comprehensive Test Suite', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'user-agent': 'Playwright/Test Runner'
    });
  });

  test.describe('Authentication Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      await helpers.fillLoginForm(TEST_USER.email, TEST_USER.password);
      await helpers.submitLoginForm();
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await helpers.fillLoginForm('wrong@email.com', 'wrongpassword');
      await helpers.submitLoginForm();
      await expect(await helpers.checkForErrorMessage()).toBeTruthy();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');
      await helpers.fillLoginForm('invalid-email', TEST_USER.password);
      await helpers.submitLoginForm();
      const emailInput = page.locator('#email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBeFalsy();
    });
  });

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
    });

    test('should load all dashboard sections', async ({ page }) => {
      // Check main dashboard components
      await expect(page.locator('h1')).toContainText(/Dashboard|Welcome/);
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
      
      // Check navigation to different sections
      const sections = ['projects-hub', 'files-escrow', 'video-studio', 'my-day', 'collaboration', 'analytics'];
      for (const section of sections) {
        await page.click(`[data-testid="${section}-nav"]`);
        await expect(page).toHaveURL(new RegExp(`.*${section}`));
        await expect(page.locator(`[data-testid="${section}-content"]`)).toBeVisible();
      }
    });

    test('should handle project creation flow', async ({ page }) => {
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Test Project');
      await page.fill('[data-testid="project-description-input"]', 'Test Description');
      await page.click('[data-testid="submit-project-button"]');
      
      // Verify project creation
      await expect(page.locator('text=Test Project')).toBeVisible();
      await expect(page.locator('text=Test Description')).toBeVisible();
    });
  });

  test.describe('File Management', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard/files-escrow');
    });

    test('should upload and download files', async ({ page }) => {
      // Test file upload
      await page.setInputFiles('[data-testid="file-input"]', 'test-files/sample.pdf');
      await expect(page.locator('text=sample.pdf')).toBeVisible();
      
      // Test file download
      await page.click('[data-testid="download-button"]');
      const download = await page.waitForEvent('download');
      expect(download.suggestedFilename()).toBe('sample.pdf');
    });

    test('should handle file sharing', async ({ page }) => {
      await page.click('[data-testid="share-file-button"]');
      await page.fill('[data-testid="share-email-input"]', 'collaborator@example.com');
      await page.click('[data-testid="confirm-share-button"]');
      await expect(page.locator('text=File shared successfully')).toBeVisible();
    });
  });

  test.describe('Video Studio', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard/video-studio');
    });

    test('should create and edit video project', async ({ page }) => {
      await page.click('[data-testid="new-video-project"]');
      await page.fill('[data-testid="video-title-input"]', 'Test Video');
      await page.click('[data-testid="create-video-button"]');
      
      // Verify video project creation
      await expect(page.locator('text=Test Video')).toBeVisible();
      
      // Test video editing features
      await page.click('[data-testid="edit-video-button"]');
      await expect(page.locator('[data-testid="video-editor"]')).toBeVisible();
    });
  });

  test.describe('Settings and Profile', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard/settings');
    });

    test('should update user profile', async ({ page }) => {
      await page.fill('[data-testid="display-name-input"]', 'Updated Name');
      await page.click('[data-testid="save-profile-button"]');
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
      
      // Verify changes persisted
      await page.reload();
      await expect(page.locator('[data-testid="display-name-input"]')).toHaveValue('Updated Name');
    });

    test('should handle notification preferences', async ({ page }) => {
      await page.click('[data-testid="notifications-tab"]');
      await page.click('[data-testid="email-notifications-toggle"]');
      await page.click('[data-testid="save-notifications-button"]');
      await expect(page.locator('text=Preferences saved')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.route('**/*', route => route.abort());
      await page.goto('/dashboard');
      await expect(page.locator('text=Unable to connect')).toBeVisible();
    });

    test('should handle invalid routes', async ({ page }) => {
      await page.goto('/invalid-route');
      await expect(page.locator('text=Page not found')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second budget
    });
  });
}); 