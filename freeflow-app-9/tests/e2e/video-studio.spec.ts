import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import path from 'path';

test.describe('Video Studio Feature', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToFeature('Video Studio');
  });

  test('should create a new video project', async ({ page }) => {
    const projectName = 'Test Video Project';
    await helpers.createVideoProject(projectName);
    
    // Verify project creation
    await expect(page.locator('[data-testid="project-title"]')).toHaveText(projectName);
    await expect(page.locator('[data-testid="video-editor"]')).toBeVisible();
  });

  test('should upload and process video file', async ({ page }) => {
    const videoPath = path.join(__dirname, '../../public/media/sample-video.mp4');
    
    // Create project and upload video
    await helpers.createVideoProject('Video Upload Test');
    await helpers.uploadFile('[data-testid="video-upload-input"]', videoPath);
    
    // Wait for processing
    await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 60000 });
    
    // Verify upload success
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-duration"]')).not.toBeEmpty();
  });

  test('should apply video editing features', async ({ page }) => {
    // Create project with video
    const videoPath = path.join(__dirname, '../../public/media/sample-video.mp4');
    await helpers.createVideoProject('Video Editing Test');
    await helpers.uploadFile('[data-testid="video-upload-input"]', videoPath);
    await page.waitForSelector('[data-testid="processing-complete"]');

    // Test trim feature
    await page.click('[data-testid="trim-button"]');
    await page.fill('[data-testid="trim-start-input"]', '0:01');
    await page.fill('[data-testid="trim-end-input"]', '0:05');
    await page.click('[data-testid="apply-trim"]');
    await expect(page.locator('[data-testid="video-duration"]')).toContainText('0:04');

    // Test text overlay
    await page.click('[data-testid="text-overlay-button"]');
    await page.fill('[data-testid="overlay-text-input"]', 'Test Overlay');
    await page.click('[data-testid="add-overlay"]');
    await expect(page.locator('[data-testid="text-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-overlay"]')).toContainText('Test Overlay');

    // Test filters
    await page.click('[data-testid="filters-button"]');
    await page.click('[data-testid="filter-brightness"]');
    await page.fill('[data-testid="brightness-value"]', '1.2');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('Brightness');
  });

  test('should enable video collaboration features', async ({ page }) => {
    await helpers.createVideoProject('Collaboration Test');
    
    // Add collaborator
    await page.click('[data-testid="share-button"]');
    await page.fill('[data-testid="collaborator-email"]', 'collaborator@test.com');
    await page.click('[data-testid="add-collaborator"]');
    await expect(page.locator('[data-testid="collaborator-list"]')).toContainText('collaborator@test.com');

    // Add comment
    await page.click('[data-testid="add-comment"]');
    await page.fill('[data-testid="comment-input"]', 'Test comment at 0:02');
    await page.fill('[data-testid="timestamp-input"]', '0:02');
    await page.click('[data-testid="submit-comment"]');
    
    // Verify comment
    await expect(page.locator('[data-testid="comment-list"]')).toContainText('Test comment at 0:02');
    await expect(page.locator('[data-testid="timestamp-marker"]')).toBeVisible();
  });

  test('should export video with different options', async ({ page }) => {
    // Create and prepare video project
    await helpers.createVideoProject('Export Test');
    const videoPath = path.join(__dirname, '../../public/media/sample-video.mp4');
    await helpers.uploadFile('[data-testid="video-upload-input"]', videoPath);
    await page.waitForSelector('[data-testid="processing-complete"]');

    // Test different export options
    await page.click('[data-testid="export-button"]');
    
    // Test HD export
    await page.selectOption('[data-testid="quality-select"]', 'hd');
    await page.click('[data-testid="start-export"]');
    await page.waitForSelector('[data-testid="export-complete"]', { timeout: 120000 });
    await expect(page.locator('[data-testid="download-link"]')).toBeVisible();

    // Test with watermark
    await page.click('[data-testid="add-watermark"]');
    await page.setInputFiles('[data-testid="watermark-upload"]', path.join(__dirname, '../../public/images/logo.png'));
    await page.click('[data-testid="start-export"]');
    await page.waitForSelector('[data-testid="export-complete"]', { timeout: 120000 });
    await expect(page.locator('[data-testid="download-link"]')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test invalid video upload
    await helpers.createVideoProject('Error Test');
    const invalidPath = path.join(__dirname, '../../public/images/invalid.txt');
    await helpers.uploadFile('[data-testid="video-upload-input"]', invalidPath);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid file type');

    // Test export without video
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('No video to export');

    // Test invalid trim values
    const videoPath = path.join(__dirname, '../../public/media/sample-video.mp4');
    await helpers.uploadFile('[data-testid="video-upload-input"]', videoPath);
    await page.waitForSelector('[data-testid="processing-complete"]');
    await page.click('[data-testid="trim-button"]');
    await page.fill('[data-testid="trim-start-input"]', '9:99');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid timestamp');
  });

  test('should optimize performance', async ({ page }) => {
    // Create project with large video
    await helpers.createVideoProject('Performance Test');
    const videoPath = path.join(__dirname, '../../public/media/sample-video.mp4');
    await helpers.uploadFile('[data-testid="video-upload-input"]', videoPath);

    // Monitor processing time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="processing-complete"]');
    const processingTime = Date.now() - startTime;
    
    // Processing should complete within reasonable time
    expect(processingTime).toBeLessThan(30000); // 30 seconds max

    // Check rendering performance
    const fpsMeasurements = await page.evaluate(async () => {
      const measurements: number[] = [];
      let lastTime = performance.now();
      let frames = 0;
      
      // Measure FPS for 5 seconds
      for (let i = 0; i < 5; i++) {
        await new Promise<void>(resolve => requestAnimationFrame(function measure() {
          frames++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            measurements.push(frames);
            frames = 0;
            lastTime = now;
            resolve();
          } else {
            requestAnimationFrame(measure);
          }
        }));
      }
      return measurements;
    });

    // Average FPS should be reasonable
    const avgFPS = fpsMeasurements.reduce((a, b) => a + b, 0) / fpsMeasurements.length;
    expect(avgFPS).toBeGreaterThan(30); // Should maintain at least 30 FPS

    // Verify smooth playback
    await page.click('[data-testid="play-button"]');
    await page.waitForTimeout(5000); // Play for 5 seconds
    const frameDrops = await page.evaluate(() => {
      // @ts-ignore - video element exists
      return document.querySelector('video').webkitDroppedFrameCount || 0;
    });
    expect(frameDrops).toBeLessThan(5); // Less than 5 dropped frames
  });
});