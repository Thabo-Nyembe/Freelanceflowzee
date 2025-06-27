import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;Landing Page&apos;, () => {
  test(&apos;should load landing page successfully&apos;, async ({ page }) => {
    await page.goto(&apos;/')
    
    // Check page title
    await expect(page).toHaveTitle(/FreeflowZee/)
    
    // Check main heading
    await expect(page.locator(&apos;h1&apos;)).toContainText(/Create, Share & Get Paid/)
    
    // Check navigation
    await expect(page.locator(&apos;nav&apos;)).toBeVisible()
    
    // Check CTA buttons
    await expect(page.locator(&apos;text=Creator Login&apos;)).toBeVisible()
    await expect(page.locator(&apos;text=Watch Demo&apos;)).toBeVisible()
    await expect(page.locator(&apos;text=View Projects&apos;)).toBeVisible()
  })

  test(&apos;should navigate to demo page&apos;, async ({ page }) => {
    await page.goto(&apos;/')
    
    // Click demo button
    await page.click(&apos;text=Watch Demo&apos;)
    
    // Should open demo modal or navigate to demo
    await page.waitForTimeout(1000)
    
    // Check for demo content
    const hasModal = await page.locator(&apos;[role=&quot;dialog&quot;]&apos;).isVisible()
    const hasDemo = await page.locator(&apos;text=Demo&apos;).isVisible()
    
    expect(hasModal || hasDemo).toBeTruthy()
  })

  test(&apos;should have working navigation&apos;, async ({ page }) => {
    await page.goto(&apos;/')
    
    // Test features link
    await page.click(&apos;text=Features&apos;)
    await page.waitForURL(&apos;**/features&apos;)
    await expect(page).toHaveURL(/features/)
    
    // Go back to home
    await page.goto(&apos;/')
    
    // Test pricing link
    await page.click(&apos;text=Pricing&apos;)
    await page.waitForURL(&apos;**/pricing&apos;)
    await expect(page).toHaveURL(/pricing/)
  })
}) 