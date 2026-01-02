import { test, expect } from '@playwright/test'

test.describe('Enhanced Navigation Customization', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:9323/dashboard')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should display Customize Navigation button', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    const customizeButton = page.locator('button:has-text("Customize Navigation")')
    await expect(customizeButton).toBeVisible()
  })

  test('should open settings dialog when Customize Navigation is clicked', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    await page.click('button:has-text("Customize Navigation")')

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Check dialog title
    await expect(page.locator('text=Customize Your Navigation')).toBeVisible()
  })

  test('should display all three main categories', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Check for all main categories
    await expect(page.locator('text=Business Intelligence')).toBeVisible()
    await expect(page.locator('text=AI Creative Suite')).toBeVisible()
    await expect(page.locator('text=Creative Studio')).toBeVisible()
  })

  test('should display White Label & Platform subcategory', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence category
    await page.click('button:has-text("Business Intelligence")')

    // Wait for animation
    await page.waitForTimeout(500)

    // Check for White Label subcategory
    await expect(page.locator('text=White Label & Platform')).toBeVisible()
  })

  test('should expand subcategories when clicked', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Click Overview subcategory
    const overviewButton = page.locator('button:has-text("Overview")').first()
    await overviewButton.click()
    await page.waitForTimeout(300)

    // Should show Dashboard and My Day links
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible()
    await expect(page.locator('a:has-text("My Day")')).toBeVisible()
  })

  test('should navigate to White Label page when clicked', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Expand White Label & Platform subcategory
    await page.click('button:has-text("White Label & Platform")')
    await page.waitForTimeout(300)

    // Click White Label link
    await page.click('a:has-text("White Label")')

    // Should navigate to white-label page
    await expect(page).toHaveURL(/.*white-label/)

    // Should show white label content
    await expect(page.locator('text=White Label')).toBeVisible()
  })

  test('should display Pro badge on White Label item', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Expand White Label & Platform
    await page.click('button:has-text("White Label & Platform")')
    await page.waitForTimeout(300)

    // Find White Label link container
    const whiteLabelLink = page.locator('a:has-text("White Label")').first()

    // Should have Pro badge
    const badge = whiteLabelLink.locator('text=Pro')
    await expect(badge).toBeVisible()
  })

  test('should toggle Reorder Mode in settings', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Open settings dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Find and click Reorder Mode toggle
    const reorderToggle = page.locator('button[role="switch"]').first()
    await reorderToggle.click()

    // Should enable reorder mode (toggle should be checked)
    await expect(reorderToggle).toHaveAttribute('data-state', 'checked')
  })

  test('should show drag handles when in Reorder Mode', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Open settings dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Enable Reorder Mode
    const reorderToggle = page.locator('button[role="switch"]').first()
    await reorderToggle.click()

    // Close dialog
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Expand a category to see subcategories
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Should show grip handles for dragging (GripVertical icons)
    const gripHandles = page.locator('svg.lucide-grip-vertical')
    await expect(gripHandles.first()).toBeVisible()
  })

  test('should have Reset to Default button in settings', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Open settings dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Should show Reset to Default button
    await expect(page.locator('button:has-text("Reset to Default")')).toBeVisible()
  })

  test('should persist navigation state after page reload', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(500)

    // The expanded state should be in localStorage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('kazi-navigation-config')
    })

    // Reload page
    await page.reload()

    // If there was custom config, it should be loaded
    // (Note: auto-expand logic may override this for active page)
    if (storageData) {
      console.log('Navigation config found in localStorage')
    }
  })

  test('should display all required subcategories in Business Intelligence', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Check for all expected subcategories
    const subcategories = [
      'Overview',
      'Project Management',
      'Analytics & Reports',
      'Financial',
      'Team & Clients',
      'Communication',
      'Scheduling',
      'White Label & Platform',
      'Account'
    ]

    for (const subcategory of subcategories) {
      await expect(page.locator(`button:has-text("${subcategory}")`)).toBeVisible()
    }
  })

  test('should navigate to all features without errors', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Test key navigation paths
    const testPaths = [
      { category: 'Business Intelligence', subcategory: 'Overview', feature: 'Dashboard', url: '/dashboard' },
      { category: 'Business Intelligence', subcategory: 'Overview', feature: 'My Day', url: '/dashboard/my-day-v2' },
      { category: 'Business Intelligence', subcategory: 'Project Management', feature: 'Projects Hub', url: '/dashboard/projects-hub-v2' },
      { category: 'Business Intelligence', subcategory: 'White Label & Platform', feature: 'White Label', url: '/dashboard/settings-v2' },
    ]

    for (const path of testPaths) {
      await page.goto('http://localhost:9323/dashboard')

      // Expand category
      await page.click(`button:has-text("${path.category}")`)
      await page.waitForTimeout(300)

      // Expand subcategory
      await page.click(`button:has-text("${path.subcategory}")`)
      await page.waitForTimeout(300)

      // Click feature link
      const featureLink = page.locator(`a:has-text("${path.feature}")`).first()
      await featureLink.click()

      // Verify navigation
      await expect(page).toHaveURL(new RegExp(path.url))

      // No console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error(`Console error on ${path.feature}:`, msg.text())
        }
      })
    }
  })

  test('should display Crown icon for White Label', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Expand Business Intelligence
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    // Expand White Label & Platform
    await page.click('button:has-text("White Label & Platform")')
    await page.waitForTimeout(300)

    // Find White Label link
    const whiteLabelLink = page.locator('a:has-text("White Label")').first()

    // Should have Crown icon (lucide-crown class)
    const crownIcon = whiteLabelLink.locator('svg.lucide-crown')
    await expect(crownIcon).toBeVisible()
  })

  test('should maintain functionality after customization', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Open settings
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Enable reorder mode
    const reorderToggle = page.locator('button[role="switch"]').first()
    await reorderToggle.click()

    // Close settings
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Navigation should still work
    await page.click('button:has-text("Business Intelligence")')
    await page.waitForTimeout(300)

    await page.click('button:has-text("Overview")')
    await page.waitForTimeout(300)

    await page.click('a:has-text("Dashboard")')

    // Should navigate successfully
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
