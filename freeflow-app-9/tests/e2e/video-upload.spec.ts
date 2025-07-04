import { test, expect } from '../utils';
import path from 'path';

test.describe('Video Upload Flow', () => {
  test('should upload video successfully', async ({ authenticatedPage: page }) => {
    // Navigate to upload page
    await page.goto('/video/upload');
    await expect(page).toHaveURL('/video/upload');

    // Setup file input handler
    const fileInput = await page.locator('input[type="file"]');
    
    // Upload test video file
    const testVideoPath = path.join(__dirname, '../fixtures/test-video.mp4');
    await fileInput.setInputFiles(testVideoPath);

    // Check upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Wait for processing to complete
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 30000 });
    
    // Verify video details form appears
    await expect(page.locator('[data-testid="video-details-form"]')).toBeVisible();
  });

  test('should handle upload errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/video/upload');

    // Mock network error
    await page.route('**/upload', route => route.abort());

    // Attempt upload with invalid file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      path.join(__dirname, '../fixtures/invalid.txt')
    ]);

    // Check error message
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
  });

  test('should validate video metadata', async ({ authenticatedPage: page }) => {
    await page.goto('/video/upload');

    // Upload valid video
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      path.join(__dirname, '../fixtures/test-video.mp4')
    ]);

    // Wait for upload completion
    await expect(page.locator('[data-testid="video-details-form"]')).toBeVisible();

    // Try to submit without required fields
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();

    // Fill required fields
    await page.fill('[data-testid="title-input"]', 'Test Video');
    await page.fill('[data-testid="description-input"]', 'Test Description');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify redirect to video page
    await expect(page).toHaveURL(/\/video\/.*$/);
  });

  test('should support drag and drop upload', async ({ authenticatedPage: page }) => {
    await page.goto('/video/upload');

    // Create data transfer
    await page.evaluate(() => {
      const dropZone = document.querySelector('[data-testid="drop-zone"]');
      const dragEvent = new DragEvent('drop', {
        dataTransfer: new DataTransfer(),
      });
      dropZone?.dispatchEvent(dragEvent);
    });

    // Verify drop zone highlight
    await expect(page.locator('[data-testid="drop-zone"]')).toHaveClass(/active/);
  });
}); 