import { test, expect, createTestVideo } from '../utils';

test.describe('Video Search', () => {
  const testVideos: Array<{ id: string; title: string }> = [];

  test.beforeEach(async ({ supabase }) => {
    // Create test videos with different titles
    const videos = [
      { title: 'React Tutorial', description: 'Learn React basics' },
      { title: 'TypeScript Guide', description: 'Advanced TypeScript concepts' },
      { title: 'Next.js Project', description: 'Building with Next.js' }
    ];

    for (const video of videos) {
      const result = await createTestVideo(supabase, video);
      testVideos.push({ id: result.id, title: video.title });
    }
  });

  test.afterEach(async ({ supabase }) => {
    // Cleanup test videos
    const ids = testVideos.map(v => v.id);
    await supabase.from('videos').delete().in('id', ids);
    testVideos.length = 0;
  });

  test('should search videos by title', async ({ authenticatedPage: page }) => {
    await page.goto('/video/search');

    // Enter search query
    await page.fill('[data-testid="search-input"]', 'React');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toContainText('React Tutorial');
    await expect(page.locator('[data-testid="search-results"]')).not.toContainText('TypeScript Guide');
  });

  test('should search videos by transcript', async ({ authenticatedPage: page }) => {
    await page.goto('/video/search');

    // Switch to transcript search
    await page.click('[data-testid="transcript-search-tab"]');
    
    // Enter transcript search query
    await page.fill('[data-testid="transcript-search-input"]', 'TypeScript concepts');
    await page.keyboard.press('Enter');

    // Verify transcript search results
    await expect(page.locator('[data-testid="transcript-results"]')).toContainText('TypeScript Guide');
  });

  test('should filter search results', async ({ authenticatedPage: page }) => {
    await page.goto('/video/search');

    // Open filter menu
    await page.click('[data-testid="filter-button"]');

    // Apply date filter
    await page.click('[data-testid="date-filter"]');
    await page.selectOption('[data-testid="date-range"]', 'last-7-days');

    // Apply duration filter
    await page.click('[data-testid="duration-filter"]');
    await page.selectOption('[data-testid="duration-range"]', '0-5min');

    // Apply filters
    await page.click('[data-testid="apply-filters"]');

    // Verify filtered results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should sort search results', async ({ authenticatedPage: page }) => {
    await page.goto('/video/search');

    // Open sort menu
    await page.click('[data-testid="sort-button"]');

    // Sort by date
    await page.click('[data-testid="sort-by-date"]');

    // Verify sorted results
    const results = await page.locator('[data-testid="video-item"]').all();
    const dates = await Promise.all(
      results.map(result => result.getAttribute('data-created-at'))
    );

    // Check if dates are sorted
    const sortedDates = [...dates].sort().reverse();
    expect(dates).toEqual(sortedDates);
  });

  test('should handle mobile search interface', async ({ authenticatedPage: page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/video/search');

    // Verify mobile search UI
    await expect(page.locator('[data-testid="mobile-search-bar"]')).toBeVisible();

    // Open mobile filters
    await page.click('[data-testid="mobile-filter-button"]');
    await expect(page.locator('[data-testid="mobile-filter-sheet"]')).toBeVisible();

    // Apply mobile filter
    await page.click('[data-testid="mobile-date-filter"]');
    await page.click('[data-testid="apply-mobile-filters"]');

    // Verify filter applied
    await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
  });

  test('should handle empty search results', async ({ authenticatedPage: page }) => {
    await page.goto('/video/search');

    // Search for non-existent content
    await page.fill('[data-testid="search-input"]', 'nonexistent content 12345');
    await page.keyboard.press('Enter');

    // Verify empty state
    await expect(page.locator('[data-testid="empty-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-results"]')).toContainText('No results found');
  });
}); 