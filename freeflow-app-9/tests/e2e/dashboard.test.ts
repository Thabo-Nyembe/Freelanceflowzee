import { test, expect } from &apos;@playwright/test&apos;;
import { TestHelpers } from &apos;../utils/test-helpers&apos;;

test.describe(&apos;Dashboard Tests&apos;, () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Authenticate before each test
    await helpers.authenticateUser(&apos;test@freeflowzee.com&apos;, &apos;testpassword&apos;);
  });

  test(&apos;should load dashboard page successfully&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator(&apos;h1&apos;)).toContainText(/Dashboard|Welcome/);
  });

  test(&apos;should display user profile information&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;user-profile&quot;]&apos;)).toBeVisible();
    await expect(page.locator(&apos;[data-testid=&quot;user-email&quot;]&apos;)).toContainText(&apos;test@freeflowzee.com&apos;);
  });

  test(&apos;should navigate to different dashboard sections&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Test Projects Hub navigation
    await page.click(&apos;[data-testid=&quot;projects-hub-link&quot;]&apos;);
    await expect(page).toHaveURL(/.*projects-hub/);
    
    // Test Files & Escrow navigation
    await page.click(&apos;[data-testid=&quot;files-escrow-link&quot;]&apos;);
    await expect(page).toHaveURL(/.*files-escrow/);
    
    // Test Video Studio navigation
    await page.click(&apos;[data-testid=&quot;video-studio-link&quot;]&apos;);
    await expect(page).toHaveURL(/.*video-studio/);
  });

  test(&apos;should handle notifications&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Open notifications panel
    await page.click(&apos;[data-testid=&quot;notifications-button&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;notifications-panel&quot;]&apos;)).toBeVisible();
    
    // Close notifications panel
    await page.click(&apos;[data-testid=&quot;close-notifications&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;notifications-panel&quot;]&apos;)).not.toBeVisible();
  });

  test(&apos;should handle user settings&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Open settings panel
    await page.click(&apos;[data-testid=&quot;settings-button&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;settings-panel&quot;]&apos;)).toBeVisible();
    
    // Test theme toggle
    await page.click(&apos;[data-testid=&quot;theme-toggle&quot;]&apos;);
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains(&apos;dark&apos;);
    });
    expect(isDarkMode).toBeTruthy();
  });

  test(&apos;should handle search functionality&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Open search
    await page.click(&apos;[data-testid=&quot;search-button&quot;]&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;search-modal&quot;]&apos;)).toBeVisible();
    
    // Test search input
    await page.fill(&apos;[data-testid=&quot;search-input&quot;]&apos;, &apos;test project&apos;);
    await page.waitForSelector(&apos;[data-testid=&quot;search-results&quot;]&apos;);
    
    // Verify search results
    const resultsCount = await page.locator(&apos;[data-testid=&quot;search-result-item&quot;]&apos;).count();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test(&apos;should handle file uploads&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Navigate to files section
    await page.click(&apos;[data-testid=&quot;files-escrow-link&quot;]&apos;);
    
    // Test file upload
    const fileInput = page.locator(&apos;input[type=&quot;file&quot;]&apos;);
    await fileInput.setInputFiles({
      name: &apos;test.txt&apos;,
      mimeType: &apos;text/plain&apos;,
      buffer: Buffer.from(&apos;Test file content&apos;)
    });
    
    // Verify upload success
    await expect(page.locator(&apos;[data-testid=&quot;upload-success&quot;]&apos;)).toBeVisible();
  });

  test(&apos;should handle project creation&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;);
    
    // Navigate to projects hub
    await page.click(&apos;[data-testid=&quot;projects-hub-link&quot;]&apos;);
    
    // Create new project
    await page.click(&apos;[data-testid=&quot;create-project-button&quot;]&apos;);
    await page.fill(&apos;[data-testid=&quot;project-name-input&quot;]&apos;, &apos;Test Project&apos;);
    await page.fill(&apos;[data-testid=&quot;project-description-input&quot;]&apos;, &apos;Test Description&apos;);
    await page.click(&apos;[data-testid=&quot;submit-project&quot;]&apos;);
    
    // Verify project creation
    await expect(page.locator(&apos;text=Test Project&apos;)).toBeVisible();
  });
}); 