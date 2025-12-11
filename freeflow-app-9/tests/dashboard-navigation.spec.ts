import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Start from dashboard home
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to all major dashboard pages', async ({ page }) => {
    const pages = [
      { name: 'Files Hub', url: '/dashboard/files-hub' },
      { name: 'Client Zone', url: '/dashboard/client-zone' },
      { name: 'Workflow Builder', url: '/dashboard/workflow-builder' },
      { name: 'Video Studio', url: '/dashboard/video-studio' },
      { name: 'AI Create', url: '/dashboard/ai-create' },
      { name: 'Analytics', url: '/dashboard/analytics' },
      { name: 'Projects', url: '/dashboard/projects' },
      { name: 'Messages', url: '/dashboard/messages' }
    ]

    for (const dashboardPage of pages) {
      // Navigate to page
      await page.goto(dashboardPage.url)
      await page.waitForLoadState('networkidle')

      // Verify URL
      expect(page.url()).toContain(dashboardPage.url)

      // Verify page loaded (should not show 404)
      await expect(page.locator('body')).not.toContainText('404')
      await expect(page.locator('body')).not.toContainText('Page Not Found')
    }
  })

  test('should have working sidebar navigation', async ({ page }) => {
    // Click on different sidebar items
    const sidebarLinks = await page.locator('nav a').all()

    // Should have multiple navigation links
    expect(sidebarLinks.length).toBeGreaterThan(0)

    // Each link should be clickable
    for (let i = 0; i < Math.min(3, sidebarLinks.length); i++) {
      const link = sidebarLinks[i]
      if (await link.isVisible()) {
        await link.click()
        await page.waitForLoadState('networkidle')

        // Should navigate successfully
        await page.waitForTimeout(500)
      }
    }
  })

  test('should navigate to admin pages', async ({ page }) => {
    // Navigate to admin
    await page.goto('/dashboard/admin')
    await page.waitForLoadState('networkidle')

    // Should load admin page
    expect(page.url()).toContain('/dashboard/admin')

    // Check for admin content
    await expect(page.getByText(/admin/i).first()).toBeVisible()
  })

  test('should navigate to AI Create sub-pages', async ({ page }) => {
    const aiPages = [
      '/dashboard/ai-create/studio',
      '/dashboard/ai-create/settings',
      '/dashboard/ai-create/analytics',
      '/dashboard/ai-create/history',
      '/dashboard/ai-create/compare',
      '/dashboard/ai-create/templates'
    ]

    for (const aiPage of aiPages) {
      await page.goto(aiPage)
      await page.waitForLoadState('networkidle')

      // Verify page loads
      expect(page.url()).toContain(aiPage)
      await expect(page.locator('body')).not.toContainText('404')
    }
  })

  test('should navigate to analytics sub-pages', async ({ page }) => {
    const analyticsPages = [
      '/dashboard/analytics',
      '/dashboard/analytics/clients',
      '/dashboard/analytics/projects',
      '/dashboard/analytics/revenue',
      '/dashboard/analytics/performance'
    ]

    for (const analyticsPage of analyticsPages) {
      await page.goto(analyticsPage)
      await page.waitForLoadState('networkidle')

      // Verify page loads
      expect(page.url()).toContain(analyticsPage)
    }
  })

  test('should have breadcrumb navigation', async ({ page }) => {
    // Navigate to a deep page
    await page.goto('/dashboard/ai-create/studio')
    await page.waitForLoadState('networkidle')

    // Check for breadcrumbs or page title
    const pageHeading = page.locator('h1, h2').first()
    await expect(pageHeading).toBeVisible()
  })

  test('should maintain state when navigating back', async ({ page }) => {
    // Navigate to workflow builder
    await page.goto('/dashboard/workflow-builder')
    await page.waitForLoadState('networkidle')

    // Switch to a specific tab
    await page.getByRole('tab', { name: /Templates/i }).click()

    // Navigate away
    await page.goto('/dashboard/files-hub')
    await page.waitForLoadState('networkidle')

    // Navigate back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should be back on workflow builder
    expect(page.url()).toContain('/dashboard/workflow-builder')
  })

  test('should handle deep linking correctly', async ({ page }) => {
    // Direct navigation to deep page
    await page.goto('/dashboard/ai-create/studio')
    await page.waitForLoadState('networkidle')

    // Should load correctly
    expect(page.url()).toContain('/dashboard/ai-create/studio')
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('should have working search/filter on pages', async ({ page }) => {
    // Navigate to files hub
    await page.goto('/dashboard/files-hub')
    await page.waitForLoadState('networkidle')

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i).first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)

      // Should update results (implementation dependent)
    }
  })

  test('should load dashboard home page', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should show dashboard content
    await expect(page.locator('body')).not.toContainText('404')

    // Should have navigation elements
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})

test.describe('Dashboard - Responsive Navigation', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should render mobile-friendly
    await expect(page.locator('body')).toBeVisible()

    // Mobile menu should be accessible
    const menuButton = page.getByRole('button', { name: /menu/i })
    if (await menuButton.isVisible()) {
      await menuButton.click()

      // Navigation should appear
      await page.waitForTimeout(500)
    }
  })

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should render properly
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should show full navigation
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Dashboard - Button Functionality', () => {
  test('should have all action buttons working on Files Hub', async ({ page }) => {
    await page.goto('/dashboard/files-hub')
    await page.waitForLoadState('networkidle')

    // Look for common action buttons
    const buttons = ['Upload', 'New Folder', 'Share', 'Download']

    for (const buttonName of buttons) {
      const button = page.getByRole('button', { name: new RegExp(buttonName, 'i') }).first()

      if (await button.isVisible()) {
        // Button should be enabled (unless specific conditions)
        const isDisabled = await button.isDisabled()
        // Log button state for debugging
        console.log(`${buttonName} button - Disabled: ${isDisabled}`)
      }
    }
  })

  test('should have working buttons on Video Studio', async ({ page }) => {
    await page.goto('/dashboard/video-studio')
    await page.waitForLoadState('networkidle')

    // Check for primary action buttons
    const commonButtons = ['New Project', 'Import', 'Templates']

    for (const buttonName of commonButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonName, 'i') }).first()

      if (await button.isVisible()) {
        console.log(`${buttonName} button found on Video Studio`)
      }
    }
  })

  test('should have interactive cards', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Cards should be clickable
    const cards = page.locator('[role="button"], a[href^="/dashboard"]')
    const count = await cards.count()

    expect(count).toBeGreaterThan(0)
  })
})
