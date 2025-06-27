import { test, expect } from &apos;@playwright/test&apos;;
import { TestHelpers } from &apos;../utils/test-helpers&apos;;

// Test data
const TEST_USER = {
  email: &apos;test@freeflowzee.com&apos;,
  password: &apos;testpassword&apos;,
  name: &apos;Test User&apos;
};

test.describe(&apos;FreeflowZee Comprehensive Test Suite&apos;, () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;user-agent&apos;: &apos;Playwright/Test Runner&apos;
    });
  });

  test.describe(&apos;Authentication Flow&apos;, () => {
    test(&apos;should successfully login with valid credentials&apos;, async ({ page }) => {
      await page.goto(&apos;/login&apos;);
      await helpers.fillLoginForm(TEST_USER.email, TEST_USER.password);
      await helpers.submitLoginForm();
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test(&apos;should show error with invalid credentials&apos;, async ({ page }) => {
      await page.goto(&apos;/login&apos;);
      await helpers.fillLoginForm(&apos;wrong@email.com&apos;, &apos;wrongpassword&apos;);
      await helpers.submitLoginForm();
      await expect(await helpers.checkForErrorMessage()).toBeTruthy();
    });

    test(&apos;should validate email format&apos;, async ({ page }) => {
      await page.goto(&apos;/login&apos;);
      await helpers.fillLoginForm(&apos;invalid-email&apos;, TEST_USER.password);
      await helpers.submitLoginForm();
      const emailInput = page.locator(&apos;#email&apos;);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBeFalsy();
    });
  });

  test.describe(&apos;Dashboard Navigation&apos;, () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
    });

    test(&apos;should load all dashboard sections&apos;, async ({ page }) => {
      // Check main dashboard components
      await expect(page.locator(&apos;h1&apos;)).toContainText(/Dashboard|Welcome/);
      await expect(page.locator(&apos;[data-testid=&quot;user-profile&quot;]&apos;)).toBeVisible();
      
      // Check navigation to different sections
      const sections = [&apos;projects-hub&apos;, &apos;files-escrow&apos;, &apos;video-studio&apos;, &apos;my-day&apos;, &apos;collaboration&apos;, &apos;analytics&apos;];
      for (const section of sections) {
        await page.click(`[data-testid=&quot;${section}-nav&quot;]`);
        await expect(page).toHaveURL(new RegExp(`.*${section}`));
        await expect(page.locator(`[data-testid=&quot;${section}-content&quot;]`)).toBeVisible();
      }
    });

    test(&apos;should handle project creation flow&apos;, async ({ page }) => {
      await page.click(&apos;[data-testid=&quot;create-project-button&quot;]&apos;);
      await page.fill(&apos;[data-testid=&quot;project-name-input&quot;]&apos;, &apos;Test Project&apos;);
      await page.fill(&apos;[data-testid=&quot;project-description-input&quot;]&apos;, &apos;Test Description&apos;);
      await page.click(&apos;[data-testid=&quot;submit-project-button&quot;]&apos;);
      
      // Verify project creation
      await expect(page.locator(&apos;text=Test Project&apos;)).toBeVisible();
      await expect(page.locator(&apos;text=Test Description&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;File Management&apos;, () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto(&apos;/dashboard/files-escrow&apos;);
    });

    test(&apos;should upload and download files&apos;, async ({ page }) => {
      // Test file upload
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, &apos;test-files/sample.pdf&apos;);
      await expect(page.locator(&apos;text=sample.pdf&apos;)).toBeVisible();
      
      // Test file download
      await page.click(&apos;[data-testid=&quot;download-button&quot;]&apos;);
      const download = await page.waitForEvent(&apos;download&apos;);
      expect(download.suggestedFilename()).toBe(&apos;sample.pdf&apos;);
    });

    test(&apos;should handle file sharing&apos;, async ({ page }) => {
      await page.click(&apos;[data-testid=&quot;share-file-button&quot;]&apos;);
      await page.fill(&apos;[data-testid=&quot;share-email-input&quot;]&apos;, &apos;collaborator@example.com&apos;);
      await page.click(&apos;[data-testid=&quot;confirm-share-button&quot;]&apos;);
      await expect(page.locator(&apos;text=File shared successfully&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Video Studio&apos;, () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto(&apos;/dashboard/video-studio&apos;);
    });

    test(&apos;should create and edit video project&apos;, async ({ page }) => {
      await page.click(&apos;[data-testid=&quot;new-video-project&quot;]&apos;);
      await page.fill(&apos;[data-testid=&quot;video-title-input&quot;]&apos;, &apos;Test Video&apos;);
      await page.click(&apos;[data-testid=&quot;create-video-button&quot;]&apos;);
      
      // Verify video project creation
      await expect(page.locator(&apos;text=Test Video&apos;)).toBeVisible();
      
      // Test video editing features
      await page.click(&apos;[data-testid=&quot;edit-video-button&quot;]&apos;);
      await expect(page.locator(&apos;[data-testid=&quot;video-editor&quot;]&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Settings and Profile&apos;, () => {
    test.beforeEach(async ({ page }) => {
      await helpers.authenticateUser(TEST_USER.email, TEST_USER.password);
      await page.goto(&apos;/dashboard/settings&apos;);
    });

    test(&apos;should update user profile&apos;, async ({ page }) => {
      await page.fill(&apos;[data-testid=&quot;display-name-input&quot;]&apos;, &apos;Updated Name&apos;);
      await page.click(&apos;[data-testid=&quot;save-profile-button&quot;]&apos;);
      await expect(page.locator(&apos;text=Profile updated successfully&apos;)).toBeVisible();
      
      // Verify changes persisted
      await page.reload();
      await expect(page.locator(&apos;[data-testid=&quot;display-name-input&quot;]&apos;)).toHaveValue(&apos;Updated Name&apos;);
    });

    test(&apos;should handle notification preferences&apos;, async ({ page }) => {
      await page.click(&apos;[data-testid=&quot;notifications-tab&quot;]&apos;);
      await page.click(&apos;[data-testid=&quot;email-notifications-toggle&quot;]&apos;);
      await page.click(&apos;[data-testid=&quot;save-notifications-button&quot;]&apos;);
      await expect(page.locator(&apos;text=Preferences saved&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Error Handling&apos;, () => {
    test(&apos;should handle network errors gracefully&apos;, async ({ page }) => {
      await page.route(&apos;**/*&apos;, route => route.abort());
      await page.goto(&apos;/dashboard&apos;);
      await expect(page.locator(&apos;text=Unable to connect&apos;)).toBeVisible();
    });

    test(&apos;should handle invalid routes&apos;, async ({ page }) => {
      await page.goto(&apos;/invalid-route&apos;);
      await expect(page.locator(&apos;text=Page not found&apos;)).toBeVisible();
    });
  });

  test.describe(&apos;Performance&apos;, () => {
    test(&apos;should load dashboard within performance budget&apos;, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(&apos;/dashboard&apos;);
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second budget
    });
  });
}); 