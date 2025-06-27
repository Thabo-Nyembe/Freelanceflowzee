import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;Basic Hydration Tests&apos;, () => {
  test(&apos;should load dashboard without hydration errors&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Wait for hydration
    await page.waitForFunction(() => {
      return document.documentElement.hasAttribute(&apos;data-hydrated&apos;)
    }, { timeout: 5000 })
    
    // Check for hydration errors
    const errors = await page.evaluate(() => {
      const errors: string[] = []
      document.querySelectorAll(&apos;[data-hydration-error]&apos;).forEach(el => {
        const error = el.getAttribute(&apos;data-hydration-error&apos;)
        if (error) errors.push(error)
      })
      return errors
    })
    
    expect(errors).toHaveLength(0, &apos;Should have no hydration errors&apos;)
  })

  test(&apos;should handle navigation without hydration issues&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Navigate to projects hub
    await page.click(&apos;text=Projects Hub&apos;)
    await page.waitForURL(&apos;**/dashboard/projects-hub&apos;)
    
    // Check for expected content
    await expect(page.locator(&apos;text=Projects Hub&apos;)).toBeVisible()
    await expect(page.locator(&apos;text=Create Project&apos;)).toBeVisible()
  })
}) 