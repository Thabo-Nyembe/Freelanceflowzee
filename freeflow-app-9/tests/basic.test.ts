import { test, expect } from &apos;@playwright/test&apos;;
import { PageHelpers } from &apos;./utils/page-helpers&apos;;

test.describe(&apos;Basic Application Tests&apos;, () => {
  let helpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new PageHelpers(page);
  });

  test(&apos;homepage loads successfully&apos;, async ({ page }) => {
    await helpers.navigateTo(&apos;/');'
    await expect(page).toHaveTitle(/Freeflow/);
  });

  test(&apos;navigation works correctly&apos;, async ({ page }) => {
    await helpers.navigateTo(&apos;/');'
    
    // Click on navigation links using more specific selectors
    const projectsLink = page.locator(&apos;a', { hasText: &apos;Projects Hub&apos; });'
    await projectsLink.click();
    await helpers.verifyNavigation(&apos;projects&apos;);
    
    const dashboardLink = page.locator(&apos;a', { hasText: &apos;Dashboard&apos; });'
    await dashboardLink.click();
    await helpers.verifyNavigation(&apos;dashboard&apos;);
  });

  test(&apos;theme toggle works&apos;, async ({ page }) => {
    await helpers.navigateTo(&apos;/');'
    
    // Test dark theme
    await helpers.toggleTheme(&apos;dark&apos;);
    const html = page.locator(&apos;html&apos;);
    await expect(html).toHaveClass(/dark/);
    
    // Test light theme
    await helpers.toggleTheme(&apos;light&apos;);
    await expect(html).not.toHaveClass(/dark/);
  });

  test(&apos;responsive design&apos;, async ({ page }) => {
    await helpers.navigateTo(&apos;/');'
    
    // Test mobile layout
    await helpers.setViewportSize(&apos;mobile&apos;);
    await helpers.openMobileMenu();
    
    // Test desktop layout
    await helpers.setViewportSize(&apos;desktop&apos;);
    const desktopNav = page.locator(&apos;nav.hidden.md\\:flex&apos;);
    await expect(desktopNav).toBeVisible();
  });
}); 