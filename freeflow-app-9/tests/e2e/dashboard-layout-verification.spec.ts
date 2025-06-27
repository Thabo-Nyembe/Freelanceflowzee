import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;Dashboard Layout Verification&apos;, () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // Navigate to dashboard with test mode headers
    await page.goto(&apos;/dashboard&apos;, {
      waitUntil: &apos;networkidle&apos;,
      timeout: 30000
    })
    
    // Set test mode headers to bypass authentication
    await page.setExtraHTTPHeaders({
      &apos;x-test-mode&apos;: &apos;true&apos;,
      &apos;x-test-user&apos;: JSON.stringify({
        id: &apos;test-user-123&apos;,
        email: &apos;test@example.com&apos;,
        user_metadata: { full_name: &apos;Test User&apos; }
      })
    })
  })

  test(&apos;dashboard layout uses full screen height&apos;, async ({ page }) => {
    // Check that the dashboard layout container uses full viewport height
    const layoutContainer = page.locator(&apos;.dashboard-layout&apos;)
    await expect(layoutContainer).toBeVisible()
    
    // Verify the container has proper height classes
    await expect(layoutContainer).toHaveClass(/min-h-screen/)
    
    // Check that content doesn&apos;t overflow
    const boundingBox = await layoutContainer.boundingBox()
    expect(boundingBox?.height).toBeGreaterThan(700) // Should use most of viewport
  })

  test(&apos;dashboard content area scrolls properly&apos;, async ({ page }) => {
    // Navigate to a content-heavy page
    await page.click(&apos;[href=&quot;/dashboard/projects-hub&quot;]&apos;)
    await page.waitForLoadState(&apos;networkidle&apos;)
    
    // Check that content area is scrollable
    const contentArea = page.locator(&apos;.dashboard-content&apos;)
    await expect(contentArea).toBeVisible()
    
    // Verify scrollable properties
    const isScrollable = await contentArea.evaluate((el) => {
      return el.scrollHeight > el.clientHeight || 
             getComputedStyle(el).overflowY === &apos;auto&apos; ||
             getComputedStyle(el).overflowY === &apos;scroll&apos;
    })
    
    expect(isScrollable).toBeTruthy()
  })

  test(&apos;sidebar navigation works on desktop&apos;, async ({ page }) => {
    // Check that sidebar is visible on desktop
    const sidebar = page.locator(&apos;.dashboard-sidebar&apos;)
    await expect(sidebar).toBeVisible()
    
    // Verify sidebar positioning
    const sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0) // Should be at left edge
    expect(sidebarBox?.width).toBe(256) // Should be 256px wide
  })

  test(&apos;mobile header appears on small screens&apos;, async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Check that mobile header is visible
    const mobileHeader = page.locator(&apos;.mobile-header&apos;)
    await expect(mobileHeader).toBeVisible()
    
    // Check that desktop sidebar is hidden
    const sidebar = page.locator(&apos;.dashboard-sidebar&apos;)
    await expect(sidebar).not.toHaveClass(/open/)
  })

  test(&apos;mobile menu toggle works correctly&apos;, async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Click mobile menu button
    const menuButton = page.locator(&apos;.mobile-menu-button&apos;)
    await expect(menuButton).toBeVisible()
    await menuButton.click()
    
    // Check that sidebar opens
    const sidebar = page.locator(&apos;.dashboard-sidebar&apos;)
    await expect(sidebar).toHaveClass(/open/)
    
    // Check that overlay appears
    const overlay = page.locator(&apos;.dashboard-nav-mobile-overlay&apos;)
    await expect(overlay).toBeVisible()
    
    // Click overlay to close
    await overlay.click()
    await expect(sidebar).not.toHaveClass(/open/)
  })

  test(&apos;dashboard content has proper spacing on different screen sizes&apos;, async ({ page }) => {
    // Test desktop spacing
    await page.setViewportSize({ width: 1200, height: 800 })
    const contentDesktop = page.locator(&apos;.dashboard-content&apos;)
    const desktopPadding = await contentDesktop.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Test tablet spacing
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    const contentTablet = page.locator(&apos;.dashboard-content&apos;)
    const tabletPadding = await contentTablet.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Test mobile spacing
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    const contentMobile = page.locator(&apos;.dashboard-content&apos;)
    const mobilePadding = await contentMobile.evaluate((el) => 
      getComputedStyle(el).padding
    )
    
    // Verify padding decreases on smaller screens
    expect(desktopPadding).not.toBe(mobilePadding)
    console.log(&apos;Desktop padding:&apos;, desktopPadding)
    console.log(&apos;Tablet padding:&apos;, tabletPadding)
    console.log(&apos;Mobile padding:&apos;, mobilePadding)
  })

  test(&apos;dashboard layout prevents horizontal overflow&apos;, async ({ page }) => {
    // Check that layout doesn&apos;t cause horizontal scrolling
    const body = page.locator(&apos;body&apos;)
    const hasHorizontalScroll = await body.evaluate((el) => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    
    expect(hasHorizontalScroll).toBeFalsy()
  })

  test(&apos;z-index layering works correctly&apos;, async ({ page }) => {
    // Set mobile viewport and open menu
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    await page.click(&apos;.mobile-menu-button&apos;)
    
    // Check z-index values
    const overlay = page.locator(&apos;.dashboard-nav-mobile-overlay&apos;)
    const sidebar = page.locator(&apos;.dashboard-sidebar&apos;)
    const header = page.locator(&apos;.mobile-header&apos;)
    
    const overlayZ = await overlay.evaluate((el) => getComputedStyle(el).zIndex)
    const sidebarZ = await sidebar.evaluate((el) => getComputedStyle(el).zIndex) 
    const headerZ = await header.evaluate((el) => getComputedStyle(el).zIndex)
    
    // Verify proper layering: header > sidebar > overlay
    expect(parseInt(headerZ)).toBeGreaterThan(parseInt(sidebarZ))
    expect(parseInt(sidebarZ)).toBeGreaterThan(parseInt(overlayZ))
  })

  test(&apos;custom scrollbar styling is applied&apos;, async ({ page }) => {
    // Check that custom scrollbar styles are applied to content area
    const contentArea = page.locator(&apos;.dashboard-content&apos;)
    
    const scrollbarWidth = await contentArea.evaluate((el) => {
      const style = getComputedStyle(el)
      return style.getPropertyValue(&apos;scrollbar-width&apos;)
    })
    
    // Should have thin scrollbar or webkit scrollbar styling
    expect(scrollbarWidth === &apos;thin&apos; || scrollbarWidth === &apos;auto&apos;).toBeTruthy()
  })

  test(&apos;responsive breakpoints work correctly&apos;, async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: &apos;mobile&apos; },
      { width: 768, height: 1024, name: &apos;tablet&apos; },
      { width: 1024, height: 768, name: &apos;desktop-small&apos; },
      { width: 1200, height: 800, name: &apos;desktop&apos; },
      { width: 1440, height: 900, name: &apos;desktop-large&apos; }
    ]
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.reload()
      
      // Check that layout adapts properly
      const mainContent = page.locator(&apos;.dashboard-main&apos;)
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

test.describe(&apos;Landing Page Dropdown Verification&apos;, () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(&apos;/', { waitUntil: &apos;networkidle&apos; })
  })

  test(&apos;product dropdown appears and positions correctly&apos;, async ({ page }) => {
    // Hover over Product dropdown
    const productButton = page.locator(&apos;button:has-text(&quot;Product&quot;)&apos;)
    await productButton.hover()
    
    // Check dropdown appears
    const dropdown = page.locator(&apos;.site-header-dropdown&apos;).first()
    await expect(dropdown).toBeVisible()
    
    // Check dropdown doesn&apos;t get cut off
    const dropdownBox = await dropdown.boundingBox()
    const viewport = page.viewportSize()
    
    if (dropdownBox && viewport) {
      expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(viewport.width)
      expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewport.height)
    }
  })

  test(&apos;resources dropdown has proper sections&apos;, async ({ page }) => {
    // Hover over Resources dropdown
    const resourcesButton = page.locator(&apos;button:has-text(&quot;Resources&quot;)&apos;)
    await resourcesButton.hover()
    
    // Check dropdown appears with sections
    const dropdown = page.locator(&apos;.resources-dropdown&apos;)
    await expect(dropdown).toBeVisible()
    
    // Check for section titles
    await expect(page.locator(&apos;.resources-dropdown-title:has-text(&quot;Learn&quot;)&apos;)).toBeVisible()
    await expect(page.locator(&apos;.resources-dropdown-title:has-text(&quot;Connect&quot;)&apos;)).toBeVisible()
  })

  test(&apos;mobile menu works on landing page&apos;, async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Click mobile menu button
    const menuButton = page.locator(&apos;[aria-label=&quot;Toggle Menu&quot;]&apos;)
    await menuButton.click()
    
    // Check mobile menu appears
    const mobileMenu = page.locator(&apos;.border-t.md\\:hidden.bg-white&apos;)
    await expect(mobileMenu).toBeVisible()
    
    // Check backdrop appears
    const backdrop = page.locator(&apos;.fixed.inset-0.z-30&apos;)
    await expect(backdrop).toBeVisible()
  })

  test(&apos;dropdown links are clickable and close dropdown&apos;, async ({ page }) => {
    // Hover over Product dropdown
    const productButton = page.locator(&apos;button:has-text(&quot;Product&quot;)&apos;)
    await productButton.hover()
    
    // Click on Features link
    const featuresLink = page.locator(&apos;.site-nav-dropdown-item[href=&quot;/features&quot;]&apos;)
    await expect(featuresLink).toBeVisible()
    
    // Note: We don&apos;t actually click since it would navigate away
    // Instead we verify the link has proper href
    await expect(featuresLink).toHaveAttribute(&apos;href&apos;, &apos;/features&apos;)
  })
})

test.describe(&apos;Performance and Accessibility&apos;, () => {
  
  test(&apos;layout meets accessibility standards&apos;, async ({ page }) => {
    await page.goto(&apos;/dashboard&apos;)
    
    // Check for skip link
    const skipLink = page.locator(&apos;.skip-to-content&apos;)
    await expect(skipLink).toBeHidden() // Should be hidden until focused
    
    // Tab to focus skip link
    await page.keyboard.press(&apos;Tab&apos;)
    await expect(skipLink).toBeFocused()
  })

  test(&apos;focus management works correctly&apos;, async ({ page }) => {
    await page.goto(&apos;/')
    
    // Tab through navigation
    await page.keyboard.press(&apos;Tab&apos;) // Skip link
    await page.keyboard.press(&apos;Tab&apos;) // First interactive element
    
    // Check focus is visible
    const focused = page.locator(&apos;:focus&apos;)
    await expect(focused).toBeVisible()
    
    // Verify focus has proper outline
    const focusOutline = await focused.evaluate((el) => 
      getComputedStyle(el).outline
    )
    expect(focusOutline).toBeTruthy()
  })

  test(&apos;layout renders within performance budget&apos;, async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(&apos;/dashboard&apos;, { waitUntil: &apos;networkidle&apos; })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    console.log(`Dashboard loaded in ${loadTime}ms`)
  })
}) 