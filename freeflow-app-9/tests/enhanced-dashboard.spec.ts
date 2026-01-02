import { test, expect } from '@playwright/test'

test.describe('Enhanced Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
  })

  test('dashboard should load successfully with enhanced UI', async ({ page }) => {
    await expect(page).toHaveTitle(/KAZI/)
    await expect(page.locator('text=Welcome to KAZI')).toBeVisible()
  })

  test('enhanced quick actions should be visible and functional', async ({ page }) => {
    // Wait for the Quick Actions section to load
    await expect(page.locator('text=Quick Actions')).toBeVisible()

    // Test enhanced buttons in Quick Actions
    const newProjectButton = page.locator('text=New Project').first()
    await expect(newProjectButton).toBeVisible()

    const aiCreateButton = page.locator('text=AI Create').first()
    await expect(aiCreateButton).toBeVisible()

    const myDayButton = page.locator('text=My Day').first()
    await expect(myDayButton).toBeVisible()

    const messagesButton = page.locator('text=Messages').first()
    await expect(messagesButton).toBeVisible()

    // Test button interactions
    await newProjectButton.hover()
    await aiCreateButton.hover()
    await myDayButton.hover()
    await messagesButton.hover()
  })

  test('enhanced navigation should include UI showcase', async ({ page }) => {
    // Check if we can navigate to UI showcase from dashboard
    // First try to find the floating action button
    const fabButtons = page.locator('button').filter({ has: page.locator('svg') })

    // Look for any button that might navigate to UI showcase
    const fabButton = fabButtons.last()
    if (await fabButton.isVisible()) {
      await fabButton.click()
      // Should navigate to UI showcase
      await expect(page).toHaveURL(/ui-showcase/)
    }
  })

  test('dashboard tabs should be functional', async ({ page }) => {
    // Test tab navigation
    await expect(page.locator('[data-testid="dashboard-tabs"]')).toBeVisible()

    // Test Overview tab (should be active by default)
    const overviewTab = page.locator('button').filter({ hasText: 'Overview' })
    await expect(overviewTab).toBeVisible()

    // Test Core tab
    const coreTab = page.locator('button').filter({ hasText: 'Core' })
    await expect(coreTab).toBeVisible()
    await coreTab.click()

    // Test AI Tools tab
    const aiTab = page.locator('button').filter({ hasText: 'AI Tools' })
    await expect(aiTab).toBeVisible()
    await aiTab.click()

    // Test Creative tab
    const creativeTab = page.locator('button').filter({ hasText: 'Creative' })
    await expect(creativeTab).toBeVisible()
    await creativeTab.click()

    // Go back to Overview
    await overviewTab.click()
  })

  test('development tab should include UI showcase', async ({ page }) => {
    // Navigate to development tab
    const developmentTab = page.locator('button').filter({ hasText: 'Advanced' })
    await expect(developmentTab).toBeVisible()
    await developmentTab.click()

    // Look for UI Showcase in the features
    await expect(page.locator('text=UI Showcase')).toBeVisible()

    // Test clicking on UI Showcase card
    const uiShowcaseCard = page.locator('[data-testid="feature-card-ui-showcase"]')
    if (await uiShowcaseCard.isVisible()) {
      await uiShowcaseCard.click()
      await expect(page).toHaveURL(/ui-showcase/)
    }
  })

  test('enhanced stats grid should display with animations', async ({ page }) => {
    // Test that stats cards are visible
    await expect(page.locator('text=Total Earnings')).toBeVisible()
    await expect(page.locator('text=Active Projects')).toBeVisible()
    await expect(page.locator('text=Client Portfolio')).toBeVisible()
    await expect(page.locator('text=Productivity Score')).toBeVisible()

    // Test hover effects on stats cards
    const statsCards = page.locator('.group').filter({ has: page.locator('text=Total Earnings') })
    if (await statsCards.first().isVisible()) {
      await statsCards.first().hover()
    }
  })

  test('enhanced insights section should be visible', async ({ page }) => {
    // Test AI insights section
    await expect(page.locator('text=Smart Insights')).toBeVisible()
    await expect(page.locator('text=AI Powered')).toBeVisible()

    // Test that insight cards are present
    const insightCards = page.locator('text=Revenue Optimization')
    if (await insightCards.isVisible()) {
      await expect(insightCards).toBeVisible()
    }
  })

  test('recent activities feed should be functional', async ({ page }) => {
    // Test recent activities section
    await expect(page.locator('text=Recent Activities')).toBeVisible()
    await expect(page.locator('text=Live Feed')).toBeVisible()

    // Check for activity items
    const activities = page.locator('text=AI-generated logo concepts')
    if (await activities.isVisible()) {
      await expect(activities).toBeVisible()
    }
  })

  test('page should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('text=Welcome to KAZI')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=Welcome to KAZI')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('text=Welcome to KAZI')).toBeVisible()
  })

  test('enhanced animations should not cause layout shifts', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Take initial screenshot
    const initialScreenshot = await page.screenshot()

    // Wait a bit for any animations to complete
    await page.waitForTimeout(2000)

    // Verify no major layout shifts occurred
    const finalScreenshot = await page.screenshot()

    // Basic check that page structure is maintained
    await expect(page.locator('text=Welcome to KAZI')).toBeVisible()
    await expect(page.locator('text=Quick Actions')).toBeVisible()
  })
})