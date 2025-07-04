import { test, expect, createTestVideo } from '../utils';

test.describe('Video Playback', () => {
  let videoId: string;

  test.beforeEach(async ({ supabase }) => {
    const video = await createTestVideo(supabase);
    videoId = video.id;
  });

  test.afterEach(async ({ supabase }) => {
    await supabase.from('videos').delete().eq('id', videoId);
  });

  test('should play video successfully', async ({ authenticatedPage: page }) => {
    await page.goto(`/video/${videoId}`);

    // Wait for video player to load
    const player = page.locator('[data-testid="video-player"]');
    await expect(player).toBeVisible();

    // Check play button
    const playButton = page.locator('[data-testid="play-button"]');
    await expect(playButton).toBeVisible();
    await playButton.click();

    // Verify video is playing
    await expect(player).toHaveAttribute('data-playing', 'true');
  });

  test('should handle playback controls', async ({ authenticatedPage: page }) => {
    await page.goto(`/video/${videoId}`);

    // Test volume control
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    await volumeSlider.click();
    await expect(page.locator('[data-testid="volume-value"]')).toBeVisible();

    // Test seek functionality
    const seekBar = page.locator('[data-testid="seek-bar"]');
    await seekBar.click();
    await expect(page.locator('[data-testid="current-time"]')).not.toHaveText('0:00');

    // Test quality selection
    const qualityButton = page.locator('[data-testid="quality-button"]');
    await qualityButton.click();
    await expect(page.locator('[data-testid="quality-menu"]')).toBeVisible();
  });

  test('should support mobile playback', async ({ authenticatedPage: page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/video/${videoId}`);

    // Check mobile-specific controls
    await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible();

    // Test touch interactions
    await page.touchscreen.tap(200, 300); // Tap center to toggle controls
    await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible();
  });

  test('should handle offline playback', async ({ authenticatedPage: page }) => {
    await page.goto(`/video/${videoId}`);

    // Simulate offline state
    await page.context().setOffline(true);

    // Check offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

    // Restore online state
    await page.context().setOffline(false);

    // Verify playback resumes
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
  });

  test('should track video analytics', async ({ authenticatedPage: page }) => {
    await page.goto(`/video/${videoId}`);

    // Start playback
    await page.click('[data-testid="play-button"]');

    // Wait for analytics event
    await expect(page.locator('[data-testid="analytics-event"]')).toHaveAttribute(
      'data-event-type',
      'play'
    );

    // Verify view count update
    await expect(page.locator('[data-testid="view-count"]')).toContainText('1');
  });
}); 