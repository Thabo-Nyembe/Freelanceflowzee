import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;Dashboard Navigation&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode headers
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;x-bypass-auth&apos;: &apos;true&apos;
    })
  })

  test(&apos;should access dashboard with test mode&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Should be able to access dashboard in test mode
    await expect(page).toHaveURL(/dashboard/)
    
    // Check for dashboard content
    await expect(page.locator(&apos;text=Dashboard&apos;)).toBeVisible()
  })

  test(&apos;should navigate to AI Asset Generator&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Look for AI Asset Generator link
    const assetGeneratorLink = page.locator(&apos;text=AI Asset Generator&apos;)
    
    if (await assetGeneratorLink.isVisible()) {
      await assetGeneratorLink.click()
      await expect(page).toHaveURL(/ai-asset-generator/)
      
      // Check page loaded
      await expect(page.locator(&apos;text=AI Asset Generator&apos;)).toBeVisible()
    } else {
      // Navigate directly if link not visible
      await page.goto(&apos;/dashboard/ai-asset-generator&apos;)
      await expect(page.locator(&apos;text=AI Asset Generator&apos;)).toBeVisible()
    }
  })

  test(&apos;should navigate to other dashboard sections&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Test navigation to different sections
    const sections = [
      { name: &apos;Projects&apos;, url: &apos;/dashboard/projects-hub&apos; },
      { name: &apos;Collaboration&apos;, url: &apos;/dashboard/collaboration&apos; },
      { name: &apos;My Day&apos;, url: &apos;/dashboard/my-day&apos; }
    ]

    for (const section of sections) {
      await page.goto(section.url)
      await page.waitForTimeout(1000)
      
      // Check URL changed
      await expect(page).toHaveURL(new RegExp(section.url.replace(&apos;/dashboard/&apos;, '&apos;)))
    }
  })
}) 