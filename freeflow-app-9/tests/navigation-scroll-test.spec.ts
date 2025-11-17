import { test, expect } from '@playwright/test'

test.describe('Navigation Scrolling Test', () => {
  test('sidebar scrolls independently without scrolling dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Get initial dashboard scroll position
    const initialDashboardScroll = await page.evaluate(() => {
      const main = document.querySelector('main')
      return main ? main.scrollTop : 0
    })

    console.log('Initial dashboard scroll:', initialDashboardScroll)

    // Expand Business Intelligence category
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(500)

    // Expand several subcategories to make content overflow
    await page.click('button:has-text("Overview")').catch(() => {})
    await page.waitForTimeout(300)

    await page.click('button:has-text("Project Management")').catch(() => {})
    await page.waitForTimeout(300)

    await page.click('button:has-text("Analytics & Reports")').catch(() => {})
    await page.waitForTimeout(300)

    // Hover over sidebar to trigger body scroll lock
    const sidebar = page.locator('aside').first()
    await sidebar.hover()
    await page.waitForTimeout(500)

    // Try to scroll in the sidebar area
    await sidebar.evaluate((element) => {
      element.scrollTop = 100
    })
    await page.waitForTimeout(500)

    // Get sidebar scroll position
    const sidebarScroll = await sidebar.evaluate((element) => element.scrollTop)
    console.log('Sidebar scroll position:', sidebarScroll)

    // Get dashboard scroll position after scrolling sidebar
    const finalDashboardScroll = await page.evaluate(() => {
      const main = document.querySelector('main')
      return main ? main.scrollTop : 0
    })
    console.log('Final dashboard scroll:', finalDashboardScroll)

    // Verify sidebar scrolled
    expect(sidebarScroll).toBeGreaterThan(0)

    // Verify dashboard did NOT scroll
    expect(finalDashboardScroll).toBe(initialDashboardScroll)

    console.log('✅ Test passed: Sidebar scrolls independently!')
  })

  test('customize navigation button opens dialog', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Click Customize Navigation button
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForTimeout(500)

    // Verify dialog opened
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Verify dialog title
    await expect(page.locator('text=Customize Your Navigation')).toBeVisible()

    console.log('✅ Customize Navigation dialog opens!')
  })

  test('reorder mode toggle works', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Open customize dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForTimeout(500)

    // Find reorder mode switch
    const reorderSwitch = page.locator('button[role="switch"]').first()

    // Check initial state
    const initialState = await reorderSwitch.getAttribute('data-state')
    console.log('Initial reorder mode state:', initialState)

    // Click to toggle
    await reorderSwitch.click()
    await page.waitForTimeout(500)

    // Check new state
    const newState = await reorderSwitch.getAttribute('data-state')
    console.log('New reorder mode state:', newState)

    // Verify state changed
    expect(newState).not.toBe(initialState)

    console.log('✅ Reorder mode toggle works!')
  })

  test('reset to default button works', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Open customize dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForTimeout(500)

    // Click Reset to Default button
    await page.click('button:has-text("Reset to Default")')
    await page.waitForTimeout(500)

    // Dialog should close
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).not.toBeVisible()

    console.log('✅ Reset to default works and closes dialog!')
  })

  test('body scroll is locked when hovering sidebar', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Check body overflow before hover
    const beforeHover = await page.evaluate(() => document.body.style.overflow)
    console.log('Body overflow before hover:', beforeHover || 'default')

    // Hover over sidebar
    const sidebar = page.locator('aside').first()
    await sidebar.hover()
    await page.waitForTimeout(300)

    // Check body overflow after hover
    const afterHover = await page.evaluate(() => document.body.style.overflow)
    console.log('Body overflow after hover:', afterHover)

    // Verify body scroll is locked
    expect(afterHover).toBe('hidden')

    // Move mouse away
    await page.mouse.move(1000, 500)
    await page.waitForTimeout(300)

    // Check body overflow after leaving
    const afterLeave = await page.evaluate(() => document.body.style.overflow)
    console.log('Body overflow after leave:', afterLeave || 'default')

    // Verify body scroll is unlocked
    expect(afterLeave).toBe('')

    console.log('✅ Body scroll lock works correctly!')
  })
})
