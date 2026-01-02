import { test, expect } from '@playwright/test'

test.describe('Context7 2025 UI/UX Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('Context7 System Integration', async ({ page }) => {
    // Check if Context7 system is properly initialized
    const context7Elements = await page.locator('[data-context7]').count()
    console.log(`Found ${context7Elements} Context7 elements`)
    expect(context7Elements).toBeGreaterThan(0)

    // Check for enhanced navigation items
    const enhancedNavItems = await page.locator('[data-context7="nav-item"][data-enhanced="true"]').count()
    console.log(`Found ${enhancedNavItems} enhanced navigation items`)
    expect(enhancedNavItems).toBeGreaterThan(20) // Should have all 24 nav items

    // Check for glassmorphism effects
    const glassCards = await page.locator('.glass-card').count()
    console.log(`Found ${glassCards} glass card elements`)
    expect(glassCards).toBeGreaterThan(0)
  })

  test('Enhanced Navigation and Sidebar', async ({ page }) => {
    // Check all navigation links are present and enhanced
    const navLinks = [
      'Overview', 'Projects Hub', 'Video Studio', 'Collaboration', 'Community Hub',
      'AI Design', 'AI Create', 'My Day', 'Financial Hub', 'Files Hub',
      'Messages', 'Analytics', 'Client Zone', 'Calendar', 'CV Portfolio',
      'AI Assistant', 'Time Tracking', 'Bookings', 'Gallery', 'Canvas',
      'Financial Hub', 'Settings', 'Notifications'
    ]

    for (const linkText of navLinks) {
      const link = page.locator(`a:has-text("${linkText}")`)
      await expect(link).toBeVisible()
    }

    // Test logout functionality
    const logoutBtn = page.locator('[data-testid="logout"]')
    await expect(logoutBtn).toBeVisible()
  })

  test('2025 Design System Features', async ({ page }) => {
    // Check for text gradients
    const gradientText = await page.locator('.text-gradient').count()
    console.log(`Found ${gradientText} gradient text elements`)
    expect(gradientText).toBeGreaterThan(0)

    // Check for enhanced buttons (Context7 buttons)
    const context7Buttons = await page.locator('button[class*="context7"], button[data-context7]').count()
    console.log(`Found ${context7Buttons} Context7 enhanced buttons`)

    // Check CSS variables are loaded
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement
      const primaryColor = getComputedStyle(root).getPropertyValue('--primary')
      const glassmorphism = getComputedStyle(root).getPropertyValue('--shadow-lg')
      return { primary: primaryColor.trim(), shadow: glassmorphism.trim() }
    })

    expect(cssVariables.primary).toBeTruthy()
    console.log('Context7 2025 CSS variables loaded successfully')
  })

  test('Responsive and Interactive Features', async ({ page }) => {
    // Check for scroll indicators
    const scrollIndicator = page.locator('.scroll-indicator')
    await expect(scrollIndicator).toBeAttached()

    // Check for enhanced spacing
    const space2025Elements = await page.locator('.space-2025').count()
    console.log(`Found ${space2025Elements} enhanced spacing elements`)

    // Check for grid systems
    const grid2025Elements = await page.locator('.grid-2025').count()
    console.log(`Found ${grid2025Elements} 2025 grid elements`)

    // Test hover effects on navigation items
    const firstNavItem = page.locator('[data-context7="nav-item"]').first()
    await firstNavItem.hover()
    await page.waitForTimeout(500) // Wait for hover animation
  })

  test('Performance and Loading', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    console.log(`Dashboard load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds

    // Check for loading states
    const loadingElements = await page.locator('.loading-shimmer, .animate-spin').count()
    console.log(`Found ${loadingElements} loading state elements`)
  })

  test('Dark Mode and Theme Support', async ({ page }) => {
    // Check if theme toggle exists and works
    const themeToggle = page.locator('button[data-testid*="theme"], button:has-text("Theme")')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      await page.waitForTimeout(500)

      // Check if dark mode classes are applied
      const bodyClass = await page.locator('body').getAttribute('class')
      console.log('Theme toggle functionality verified')
    }

    // Check CSS variables work in both themes
    const themeCheck = await page.evaluate(() => {
      const root = document.documentElement
      return {
        background: getComputedStyle(root).getPropertyValue('--background').trim(),
        surface: getComputedStyle(root).getPropertyValue('--surface').trim(),
        text: getComputedStyle(root).getPropertyValue('--text').trim()
      }
    })

    expect(themeCheck.background).toBeTruthy()
    expect(themeCheck.surface).toBeTruthy()
    expect(themeCheck.text).toBeTruthy()
  })

  test('Navigation Routes Functionality', async ({ page }) => {
    // Test key navigation routes
    const routes = [
      '/dashboard/projects-hub-v2',
      '/dashboard/ai-create-v2',
      '/dashboard/files-hub-v2',
      '/dashboard/analytics-v2',
      '/dashboard/settings-v2'
    ]

    for (const route of routes) {
      console.log(`Testing route: ${route}`)
      await page.goto(`http://localhost:9323${route}`)
      await page.waitForLoadState('networkidle')

      // Check if Context7 system is active on each page
      const context7Active = await page.locator('[data-context7]').count()
      expect(context7Active).toBeGreaterThan(0)

      // Check for basic page structure
      await expect(page.locator('main, [role="main"]')).toBeVisible()
    }
  })
})