import { test, expect } from '@playwright/test'

test.describe('Debug Header Issue', () => {
  test('should investigate duplicate elements', async ({ page }) => {
    await page.goto('http://localhost:9323')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Count elements
    const headerCount = await page.locator('[data-testid="site-header"]').count()
    const featuresCount = await page.locator('[data-testid="nav-features"]').count()
    const loginCount = await page.locator('[data-testid="nav-login"]').count()
    
    console.log('Element counts:', {
      headers: headerCount,
      features: featuresCount,
      login: loginCount
    })
    
    // Get all matching elements
    const headers = page.locator('[data-testid="site-header"]')
    const features = page.locator('[data-testid="nav-features"]')
    
    // Log details about each element
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i)
      const isVisible = await header.isVisible()
      const boundingBox = await header.boundingBox()
      console.log(`Header ${i}:`, { visible: isVisible, boundingBox })
    }
    
    for (let i = 0; i < featuresCount; i++) {
      const feature = features.nth(i)
      const isVisible = await feature.isVisible()
      const boundingBox = await feature.boundingBox()
      console.log(`Features ${i}:`, { visible: isVisible, boundingBox })
    }
    
    // Check if elements are actually different
    if (featuresCount > 1) {
      const first = features.first()
      const second = features.nth(1)
      const firstText = await first.textContent()
      const secondText = await second.textContent()
      const firstHref = await first.getAttribute('href')
      const secondHref = await second.getAttribute('href')
      
      console.log('Comparison:', {
        firstText,
        secondText,
        firstHref,
        secondHref,
        same: firstText === secondText && firstHref === secondHref
      })
    }
  })
}) 