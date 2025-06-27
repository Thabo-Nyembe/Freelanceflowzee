import { test, expect } from &apos;@playwright/test&apos;;

test(&apos;basic application test&apos;, async ({ page }) => {
  // Navigate to the homepage
  await page.goto(&apos;http://localhost:3001&apos;);
  
  // Check if the page loads successfully
  await expect(page).toHaveTitle(/FreeflowZee/);
  
  // Check if main navigation elements are present
  await expect(page.locator(&apos;nav&apos;)).toBeVisible();
  
  // Check if the Projects Hub component is present
  await expect(page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)).toBeVisible();
  
  // Check if the glass morphism styles are applied
  const projectsHub = await page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;);
  const styles = await projectsHub.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      backgroundColor: computedStyle.backgroundColor,
      backdropFilter: computedStyle.backdropFilter,
      borderRadius: computedStyle.borderRadius,
    };
  });
  
  // Verify glass morphism styles
  expect(styles.backdropFilter).toContain(&apos;blur&apos;);
}); 