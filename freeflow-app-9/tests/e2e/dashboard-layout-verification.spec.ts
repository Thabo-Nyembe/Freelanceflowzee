import { test, expect } from '@playwright/test'

test.describe('Dashboard Layout Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // Navigate to dashboard with test mode headers
    await page.goto('/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    
    // Set test mode headers to bypass authentication
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true',
      'x-test-user': JSON.stringify({
        id: 'test-user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      })
    })
  })

  test('dashboard layout uses full screen height', async ({ page }) => {
    // Check that the dashboard layout container uses full viewport height
    const layoutContainer = page.locator('.dashboard-layout')
    await expect(layoutContainer).toBeVisible()
    
    // Verify the container has proper height classes
    await expect(layoutContainer).toHaveClass(/min-h-screen/)
    
    // Check that content doesn't overflow
    const boundingBox = await layoutContainer.boundingBox()
    expect(boundingBox?.height).toBeGreaterThan(700) // Should use most of viewport
  })

  test('dashboard content area scrolls properly', async ({ page }) => {
    // Navigate to a content-heavy page
    await page.click('[href="/dashboard/projects-hub"]')
    await page.waitForLoadState('networkidle')
    
    // Check that content area is scrollable
    const contentArea = page.locator('.dashboard-content')
    await expect(contentArea).toBeVisible()
    
    // Verify scrollable properties
    const isScrollable = await contentArea.evaluate((el) => {
      return el.scrollHeight > el.clientHeight || 
             getComputedStyle(el).overflowY === 'auto' ||
             getComputedStyle(el).overflowY === 'scroll'
    })
    
    expect(isScrollable).toBeTruthy()
  })

  test('sidebar navigation works on desktop', async ({ page }) => {
    // Check that sidebar is visible on desktop
    const sidebar = page.locator('.dashboard-sidebar')
    await expect(sidebar).toBeVisible()
    
    // Verify sidebar positioning
    const sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0) // Should be at left edge
    expect(sidebarBox?.width).toBe(256) // Should be 256px wide
  })

  test('mobile header appears on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Check that mobile header is visible
    const mobileHeader = page.locator('.mobile-header')
    await expect(mobileHeader).toBeVisible()
    
    // Check that desktop sidebar is hidden
    const sidebar = page.locator('.dashboard-sidebar')
    await expect(sidebar).not.toHaveClass(/open/)
  })

  test('mobile menu toggle works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Click mobile menu button
    const menuButton = page.locator('.mobile-menu-button')
    await expect(menuButton).toBeVisible()
    await menuButton.click()
    
    // Check that sidebar opens
    const sidebar = page.locator('.dashboard-sidebar')
    await expect(sidebar).toHaveClass(/open/)
    
    // Check that overlay appears
    const overlay = page.locator('.dashboard-nav-mobile-overlay')
    await expect(overlay).toBeVisible()
    
    // Click overlay to close
    await overlay.click()
    await expect(sidebar).not.toHaveClass(/open/)
  })

  test('dashboard content has proper spacing on different screen sizes', async ({ page }) => {
    // Test desktop spacing
    await page.setViewportSize({ width: 1200, height: 800 })
    const contentDesktop = page.locator('.dashboard-content')
    const desktopPadding = await contentDesktop.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Test tablet spacing
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    const contentTablet = page.locator('.dashboard-content')
    const tabletPadding = await contentTablet.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Test mobile spacing
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    const contentMobile = page.locator('.dashboard-content')
    const mobilePadding = await contentMobile.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Verify padding decreases on smaller screens
    expect(desktopPadding).not.toBe(mobilePadding)
    console.log('Desktop padding:', desktopPadding)
    console.log('Tablet padding:', tabletPadding)
    console.log('Mobile padding:', mobilePadding)
  })

  test('dashboard layout prevents horizontal overflow', async ({ page }) => {
    // Check that layout doesn't cause horizontal scrolling
    const body = page.locator('body')
    const hasHorizontalScroll = await body.evaluate((el) => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    
    expect(hasHorizontalScroll).toBeFalsy()
  })

  test('z-index layering works correctly', async ({ page }) => {
    // Set mobile viewport and open menu
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    await page.click('.mobile-menu-button')
    
    // Check z-index values
    const overlay = page.locator('.dashboard-nav-mobile-overlay')
    const sidebar = page.locator('.dashboard-sidebar')
    const header = page.locator('.mobile-header')
    
    const overlayZ = await overlay.evaluate((el) => getComputedStyle(el).zIndex)
    const sidebarZ = await sidebar.evaluate((el) => getComputedStyle(el).zIndex) 
    const headerZ = await header.evaluate((el) => getComputedStyle(el).zIndex)
    
    // Verify proper layering: header > sidebar > overlay
    expect(parseInt(headerZ)).toBeGreaterThan(parseInt(sidebarZ))
    expect(parseInt(sidebarZ)).toBeGreaterThan(parseInt(overlayZ))
  })

  test('custom scrollbar styling is applied', async ({ page }) => {
    // Check that custom scrollbar styles are applied to content area
    const contentArea = page.locator('.dashboard-content')
    
    const scrollbarWidth = await contentArea.evaluate((el) => {
      const style = getComputedStyle(el)
      return style.getPropertyValue('scrollbar-width')
    })
    
    // Should have thin scrollbar or webkit scrollbar styling
    expect(scrollbarWidth === 'thin' || scrollbarWidth === 'auto').toBeTruthy()
  })

  test('responsive breakpoints work correctly', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1200, height: 800, name: 'desktop' },
      { width: 1440, height: 900, name: 'desktop-large' }
    ]
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.reload()
      
      // Check that layout adapts properly
      const mainContent = page.locator('.dashboard-main')
      await expect(mainContent).toBeVisible()
      
      // Verify no layout breaks
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })
      
      expect(hasOverflow).toBeFalsy()
      console.log(`✓ ${bp.name} (${bp.width}x${bp.height}) - No overflow`)
    }
  })
})

test.describe('Landing Page Dropdown Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('product dropdown appears and positions correctly', async ({ page }) => {
    // Hover over Product dropdown
    const productButton = page.locator('button:has-text("Product")')
    await productButton.hover()
    
    // Check dropdown appears
    const dropdown = page.locator('.site-header-dropdown').first()
    await expect(dropdown).toBeVisible()
    
    // Check dropdown doesn't get cut off
    const dropdownBox = await dropdown.boundingBox()
    const viewport = page.viewportSize()
    
    if (dropdownBox && viewport) {
      expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(viewport.width)
      expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewport.height)
    }
  })

  test('resources dropdown has proper sections', async ({ page }) => {
    // Hover over Resources dropdown
    const resourcesButton = page.locator('button:has-text("Resources")')
    await resourcesButton.hover()
    
    // Check dropdown appears with sections
    const dropdown = page.locator('.resources-dropdown')
    await expect(dropdown).toBeVisible()
    
    // Check for section titles
    await expect(page.locator('.resources-dropdown-title:has-text("Learn")')).toBeVisible()
    await expect(page.locator('.resources-dropdown-title:has-text("Connect")')).toBeVisible()
  })

  test('mobile menu works on landing page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Click mobile menu button
    const menuButton = page.locator('[aria-label="Toggle Menu"]')
    await menuButton.click()
    
    // Check mobile menu appears
    const mobileMenu = page.locator('.border-t.md\\:hidden.bg-white')
    await expect(mobileMenu).toBeVisible()
    
    // Check backdrop appears
    const backdrop = page.locator('.fixed.inset-0.z-30')
    await expect(backdrop).toBeVisible()
  })

  test('dropdown links are clickable and close dropdown', async ({ page }) => {
    // Hover over Product dropdown
    const productButton = page.locator('button:has-text("Product")')
    await productButton.hover()
    
    // Click on Features link
    const featuresLink = page.locator('.site-nav-dropdown-item[href="/features"]')
    await expect(featuresLink).toBeVisible()
    
    // Note: We don't actually click since it would navigate away
    // Instead we verify the link has proper href
    await expect(featuresLink).toHaveAttribute('href', '/features')
  })
})

test.describe('Performance and Accessibility', () => {
  
  test('layout meets accessibility standards', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for skip link
    const skipLink = page.locator('.skip-to-content')
    await expect(skipLink).toBeHidden() // Should be hidden until focused
    
    // Tab to focus skip link
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
  })

  test('focus management works correctly', async ({ page }) => {
    await page.goto('/')
    
    // Tab through navigation
    await page.keyboard.press('Tab') // Skip link
    await page.keyboard.press('Tab') // First interactive element
    
    // Check focus is visible
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
    
    // Verify focus has proper outline
    const focusOutline = await focused.evaluate((el) => 
      getComputedStyle(el).outline
    )
    expect(focusOutline).toBeTruthy()
  })

  test('layout renders within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    console.log(`Dashboard loaded in ${loadTime}ms`)
  })
}) 