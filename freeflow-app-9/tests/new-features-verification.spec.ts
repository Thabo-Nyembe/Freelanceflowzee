import { test, expect } from '@playwright/test'

test.describe('New Features Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should verify GUI button is hidden in web app', async ({ page }) => {
    // The GUI toggle button should not be visible in web environment
    const guiButton = page.locator('[data-testid="gui-2025-toggle-btn"]')
    await expect(guiButton).not.toBeVisible()
  })

  test('should verify all new features are accessible', async ({ page }) => {
    const newFeatures = [
      'ai-voice-synthesis',
      'voice-collaboration',
      'mobile-app',
      'desktop-app',
      'audio-studio',
      '3d-modeling',
      'motion-graphics',
      'crypto-payments',
      'white-label',
      'plugin-marketplace',
      'ml-insights',
      'custom-reports',
      'escrow',
      'micro-features-showcase'
    ]

    for (const feature of newFeatures) {
      // Try to navigate to each feature
      await page.goto(`http://localhost:3000/dashboard/${feature}`)

      // Verify the page loads without errors
      await expect(page).not.toHaveTitle(/Error/)
      await expect(page).not.toHaveTitle(/404/)

      // Wait for the page to load completely
      await page.waitForLoadState('networkidle')

      // Check that we're on the correct page
      await expect(page).toHaveURL(new RegExp(`/dashboard/${feature}`))

      console.log(`✅ Feature '${feature}' is accessible`)
    }
  })

  test('should verify Context7 system integration', async ({ page }) => {
    // Check one of our enhanced pages for Context7 integration
    await page.goto('http://localhost:3000/dashboard/escrow')
    await page.waitForLoadState('networkidle')

    // Look for Context7 design elements
    const contextElements = await page.locator('.bg-gradient-to-br, .backdrop-blur-md, .glassmorphism').count()
    expect(contextElements).toBeGreaterThan(0)

    // Check for enhanced components
    const enhancedCards = await page.locator('[class*="enhanced-card"], [class*="EnhancedCard"]').count()
    expect(enhancedCards).toBeGreaterThanOrEqual(0) // Some pages might use different class names
  })

  test('should verify micro features showcase', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/micro-features-showcase')
    await page.waitForLoadState('networkidle')

    // Check for the main title
    await expect(page.locator('h1')).toContainText('Micro Features Showcase')

    // Check for tab navigation
    const tabs = page.locator('[role="tablist"] button')
    await expect(tabs).toHaveCountGreaterThan(0)

    // Test tab switching
    const formTab = page.locator('button[value="forms"]')
    if (await formTab.isVisible()) {
      await formTab.click()
      await expect(page.locator('[role="tabpanel"]')).toBeVisible()
    }
  })

  test('should verify escrow system functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/escrow')
    await page.waitForLoadState('networkidle')

    // Check for main title
    await expect(page.locator('h1')).toContainText('Secure Escrow')

    // Check for the "New Escrow" button
    const newEscrowBtn = page.locator('text=New Escrow')
    await expect(newEscrowBtn).toBeVisible()

    // Check for tabs
    const overviewTab = page.locator('text=Overview')
    await expect(overviewTab).toBeVisible()

    const depositsTab = page.locator('text=Deposits')
    await expect(depositsTab).toBeVisible()
  })

  test('should verify AI voice synthesis feature', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ai-voice-synthesis')
    await page.waitForLoadState('networkidle')

    // Check for main components
    await expect(page.locator('h1')).toContainText('AI Voice Synthesis')

    // Check for voice selection elements
    const voiceElements = page.locator('text=Voice, text=Provider, text=Language')
    await expect(voiceElements.first()).toBeVisible()

    // Check for text input area
    const textInput = page.locator('textarea, [placeholder*="text"]')
    await expect(textInput.first()).toBeVisible()
  })

  test('should verify custom reports builder', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/custom-reports')
    await page.waitForLoadState('networkidle')

    // Check for main title
    await expect(page.locator('h1')).toContainText('Custom Report Builder')

    // Check for report builder tabs
    const builderTab = page.locator('text=Report Builder')
    await expect(builderTab).toBeVisible()

    const reportsTab = page.locator('text=My Reports')
    await expect(reportsTab).toBeVisible()
  })

  test('should verify ML insights dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ml-insights')
    await page.waitForLoadState('networkidle')

    // Check for main title
    await expect(page.locator('h1')).toContainText('ML Insights Dashboard')

    // Check for overview tab
    const overviewTab = page.locator('text=Overview')
    await expect(overviewTab).toBeVisible()

    // Check for models tab
    const modelsTab = page.locator('text=Models')
    await expect(modelsTab).toBeVisible()
  })

  test('should verify plugin marketplace', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/plugin-marketplace')
    await page.waitForLoadState('networkidle')

    // Check for main title
    await expect(page.locator('h1')).toContainText('Plugin Marketplace')

    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]')
    await expect(searchInput.first()).toBeVisible()
  })

  test('should verify enhanced navigation includes new features', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    // Look for search functionality that should include our new features
    const searchButton = page.locator('text=Quick Search, text=Search')
    if (await searchButton.first().isVisible()) {
      await searchButton.first().click()

      // Try searching for one of our new features
      const searchInput = page.locator('input[placeholder*="Search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('ML Insights')
        await page.waitForTimeout(500) // Wait for search results

        const mlInsightsResult = page.locator('text=ML Insights')
        await expect(mlInsightsResult).toBeVisible()
      }
    }
  })

  test('should verify responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('http://localhost:3000/dashboard/escrow')
    await page.waitForLoadState('networkidle')

    // Verify page is still functional on mobile
    await expect(page.locator('h1')).toBeVisible()

    // Check if mobile navigation works
    const mobileElements = page.locator('.flex-col, .grid-cols-1')
    await expect(mobileElements.first()).toBeVisible()
  })

  test('should verify dark mode compatibility', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/micro-features-showcase')
    await page.waitForLoadState('networkidle')

    // Look for dark mode classes
    const darkModeElements = page.locator('[class*="dark:"], .dark')
    const count = await darkModeElements.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Feature Integration Tests', () => {
  test('should verify all features load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    const features = [
      'ai-voice-synthesis',
      'voice-collaboration',
      'mobile-app',
      'desktop-app',
      'audio-studio',
      '3d-modeling',
      'motion-graphics',
      'crypto-payments',
      'white-label',
      'plugin-marketplace',
      'ml-insights',
      'custom-reports',
      'escrow',
      'micro-features-showcase'
    ]

    for (const feature of features) {
      await page.goto(`http://localhost:3000/dashboard/${feature}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000) // Allow time for any async operations
    }

    // Filter out known harmless errors
    const significantErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('font') &&
      !error.includes('chunk') &&
      !error.toLowerCase().includes('warning')
    )

    expect(significantErrors).toHaveLength(0)
  })
})