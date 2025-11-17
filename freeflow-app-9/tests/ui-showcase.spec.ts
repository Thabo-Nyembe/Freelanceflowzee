import { test, expect } from '@playwright/test'

test.describe('UI Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ui-showcase')
  })

  test('should load UI showcase page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/KAZI/)
    // Wait for page to load and check for heading
    await page.waitForTimeout(5000)
    // Wait for content to be loaded
    await page.waitForLoadState('networkidle')
    // Check for the main title
    await expect(page.locator('h1:has-text("Advanced UI Component Showcase")')).toBeVisible({timeout: 10000})
  })

  test('enhanced buttons section should be visible and interactive', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // Check if Enhanced Buttons section is visible
    await expect(page.locator('h2:has-text("Enhanced Buttons")')).toBeVisible({timeout: 10000})

    // Test Magnetic Button
    const magneticButton = page.locator('button:has-text("Hover Me")')
    await expect(magneticButton).toBeVisible()
    await magneticButton.hover()

    // Test Ripple Button
    const rippleButton = page.locator('button:has-text("Click for Ripples")')
    await expect(rippleButton).toBeVisible()
    await rippleButton.click()

    // Test Morphing Button
    const morphingButton = page.locator('button:has-text("Process")')
    await expect(morphingButton).toBeVisible()
    await morphingButton.click()

    // Test Neon Button
    const neonButton = page.locator('button:has-text("Download")')
    await expect(neonButton).toBeVisible()

    // Test Slide Fill Button
    const slideFillButton = page.locator('button:has-text("Play Video")')
    await expect(slideFillButton).toBeVisible()

    // Test Particle Button
    const particleButton = page.locator('button:has-text("Explode!")')
    await expect(particleButton).toBeVisible()
    await particleButton.click()
  })

  test('advanced cards section should be visible and interactive', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // Check if Advanced Cards section is visible
    await expect(page.locator('h2:has-text("Advanced Card Components")')).toBeVisible({timeout: 10000})

    // Test Direction Aware Card
    const directionCard = page.locator('text=Hover Me').nth(1)
    await expect(directionCard).toBeVisible()
    await directionCard.hover()

    // Test 3D Shift Card
    const shiftCard = page.locator('text=3D Shift Card')
    await expect(shiftCard).toBeVisible()
    await shiftCard.hover()

    // Test Texture Cards
    await expect(page.locator('text=Texture Card')).toBeVisible()
    await expect(page.locator('text=Wave Pattern')).toBeVisible()
    await expect(page.locator('text=Grid Pattern')).toBeVisible()

    // Test Spotlight Card
    const spotlightCard = page.locator('text=Spotlight Effect')
    await expect(spotlightCard).toBeVisible()
    await spotlightCard.hover()
  })

  test('bento grid layout should be visible', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // Check if Bento Grid section is visible
    await expect(page.locator('h2:has-text("Bento Grid Layout")')).toBeVisible({timeout: 10000})

    // Test Bento Cards
    await expect(page.locator('text=Large Card')).toBeVisible()
    await expect(page.locator('text=Medium Card').first()).toBeVisible()
    await expect(page.locator('text=Small').first()).toBeVisible()
  })

  test('interactive elements should be functional', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    // Check if Interactive Elements section is visible
    await expect(page.locator('h2:has-text("Interactive Elements")')).toBeVisible({timeout: 10000})

    // Test Dynamic Island
    const dynamicIslandButton = page.locator('button').filter({hasText: /Recording|Dynamic Island/})
    await expect(dynamicIslandButton).toBeVisible()
    await dynamicIslandButton.click()

    // Test Magnetic Element
    const magneticElement = page.locator('text=Magnetic Element')
    await expect(magneticElement).toBeVisible()
    await magneticElement.hover()
  })

  test('floating action button should be visible', async ({ page }) => {
    // Check if floating action button is visible
    const fab = page.locator('button').filter({ has: page.locator('svg') }).last()
    await expect(fab).toBeVisible()
  })

  test('page should be responsive', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('h1:has-text("Advanced UI Component Showcase")')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1:has-text("Advanced UI Component Showcase")')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('h1:has-text("Advanced UI Component Showcase")')).toBeVisible()
  })
})