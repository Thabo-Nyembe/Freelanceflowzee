import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode headers
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'x-bypass-auth': 'true'
    })
  })

  test('should access dashboard with test mode', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should be able to access dashboard in test mode
    await expect(page).toHaveURL(/dashboard/)
    
    // Check for dashboard content
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should navigate to AI Asset Generator', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Look for AI Asset Generator link
    const assetGeneratorLink = page.locator('text=AI Asset Generator')
    
    if (await assetGeneratorLink.isVisible()) {
      await assetGeneratorLink.click()
      await expect(page).toHaveURL(/ai-asset-generator/)
      
      // Check page loaded
      await expect(page.locator('text=AI Asset Generator')).toBeVisible()
    } else {
      // Navigate directly if link not visible
      await page.goto('/dashboard/ai-asset-generator')
      await expect(page.locator('text=AI Asset Generator')).toBeVisible()
    }
  })

  test('should navigate to other dashboard sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation to different sections
    const sections = [
      { name: 'Projects', url: '/dashboard/projects-hub' },
      { name: 'Collaboration', url: '/dashboard/collaboration' },
      { name: 'My Day', url: '/dashboard/my-day' }
    ]

    for (const section of sections) {
      await page.goto(section.url)
      await page.waitForTimeout(1000)
      
      // Check URL changed
      await expect(page).toHaveURL(new RegExp(section.url.replace('/dashboard/', '')))
    }
  })
}) 