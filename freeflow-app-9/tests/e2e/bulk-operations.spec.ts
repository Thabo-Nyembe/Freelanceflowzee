import { test, expect, createTestVideo } from '../utils';

test.describe('Bulk Operations', () => {
  const testVideos: string[] = [];

  test.beforeEach(async ({ supabase }) => {
    // Create multiple test videos
    for (let i = 0; i < 3; i++) {
      const video = await createTestVideo(supabase);
      testVideos.push(video.id);
    }
  });

  test.afterEach(async ({ supabase }) => {
    // Cleanup test videos
    await supabase.from('videos').delete().in('id', testVideos);
    testVideos.length = 0;
  });

  test('should perform bulk delete operation', async ({ authenticatedPage: page }) => {
    await page.goto('/videos');

    // Select videos
    for (const videoId of testVideos) {
      await page.click(`[data-testid="video-checkbox-${videoId}"]`);
    }

    // Open bulk operations menu
    await page.click('[data-testid="bulk-operations-menu"]');
    await page.click('[data-testid="bulk-delete-option"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify videos are deleted
    for (const videoId of testVideos) {
      await expect(page.locator(`[data-testid="video-item-${videoId}"]`)).not.toBeVisible();
    }
  });

  test('should perform bulk move operation', async ({ authenticatedPage: page }) => {
    await page.goto('/videos');

    // Select videos
    for (const videoId of testVideos) {
      await page.click(`[data-testid="video-checkbox-${videoId}"]`);
    }

    // Open bulk operations menu
    await page.click('[data-testid="bulk-operations-menu"]');
    await page.click('[data-testid="bulk-move-option"]');

    // Select target project
    await page.click('[data-testid="project-select"]');
    await page.click('[data-testid="project-option-1"]');

    // Confirm move
    await page.click('[data-testid="confirm-move-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should perform bulk tag operation', async ({ authenticatedPage: page }) => {
    await page.goto('/videos');

    // Select videos
    for (const videoId of testVideos) {
      await page.click(`[data-testid="video-checkbox-${videoId}"]`);
    }

    // Open bulk operations menu
    await page.click('[data-testid="bulk-operations-menu"]');
    await page.click('[data-testid="bulk-tag-option"]');

    // Add tags
    await page.fill('[data-testid="tag-input"]', 'test-tag');
    await page.keyboard.press('Enter');

    // Confirm tag addition
    await page.click('[data-testid="confirm-tag-button"]');

    // Verify tags are added
    for (const videoId of testVideos) {
      await expect(page.locator(`[data-testid="video-tag-${videoId}"]`)).toContainText('test-tag');
    }
  });

  test('should handle bulk operation errors', async ({ authenticatedPage: page }) => {
    await page.goto('/videos');

    // Select videos
    for (const videoId of testVideos) {
      await page.click(`[data-testid="video-checkbox-${videoId}"]`);
    }

    // Simulate network error
    await page.route('**/bulk-operations', route => route.abort());

    // Attempt bulk operation
    await page.click('[data-testid="bulk-operations-menu"]');
    await page.click('[data-testid="bulk-delete-option"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should show operation progress', async ({ authenticatedPage: page }) => {
    await page.goto('/videos');

    // Select videos
    for (const videoId of testVideos) {
      await page.click(`[data-testid="video-checkbox-${videoId}"]`);
    }

    // Start bulk operation
    await page.click('[data-testid="bulk-operations-menu"]');
    await page.click('[data-testid="bulk-tag-option"]');
    await page.fill('[data-testid="tag-input"]', 'progress-test');
    await page.click('[data-testid="confirm-tag-button"]');

    // Verify progress indicator
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-status"]')).toContainText('Processing');

    // Wait for completion
    await expect(page.locator('[data-testid="progress-status"]')).toContainText('Complete', {
      timeout: 30000
    });
  });
}); 