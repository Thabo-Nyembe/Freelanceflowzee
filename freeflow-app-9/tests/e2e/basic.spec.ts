import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Basic functionality tests&apos;, () => {
  test(&apos;should load the homepage&apos;, async ({ page }) => {
    await page.goto(&apos;/');'
    await expect(page).toHaveTitle(/FreeflowZee/);
  });

  test(&apos;should navigate to projects hub&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard/projects-hub&apos;);
    await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();
  });
}); 