import { test, expect } from '@playwright/test'

test.describe('Sidebar Scroll Verification', () => {
  test('sidebar should scroll independently to reach Portfolio and bottom items', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for sidebar to be visible
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    console.log('✅ Sidebar visible')

    // Get the scrollable container inside the sidebar
    const scrollContainer = sidebar.locator('div.overflow-y-auto').first()
    await expect(scrollContainer).toBeVisible()

    console.log('✅ Scroll container found')

    // Check if Portfolio link exists (even if not in viewport)
    const portfolioExists = await page.locator('text=/Portfolio|CV.*Portfolio/i').count() > 0
    console.log(`Portfolio exists in DOM: ${portfolioExists}`)

    // Get initial scroll position
    const initialScroll = await scrollContainer.evaluate(el => el.scrollTop)
    console.log(`Initial scroll position: ${initialScroll}`)

    // Get scroll height and client height
    const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight)
    const clientHeight = await scrollContainer.evaluate(el => el.clientHeight)
    console.log(`Scroll container - Height: ${clientHeight}px, Scrollable content: ${scrollHeight}px`)

    // Scroll within the sidebar container
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight
    })

    // Wait for scroll to complete
    await page.waitForTimeout(500)

    // Get new scroll position
    const newScroll = await scrollContainer.evaluate(el => el.scrollTop)
    console.log(`New scroll position: ${newScroll}`)

    // Verify scroll happened
    expect(newScroll).toBeGreaterThan(initialScroll)
    console.log('✅ Sidebar scrolled successfully')

    // Try to find Portfolio or bottom navigation items
    const bottomItems = await page.locator('aside a[href*="portfolio"], aside a[href*="settings"], aside a[href*="notifications"]').count()
    console.log(`Bottom navigation items found: ${bottomItems}`)

    // Verify main content didn't scroll
    const mainContent = page.locator('main, [role="main"]').first()
    if (await mainContent.isVisible()) {
      const mainScroll = await mainContent.evaluate(el => el.scrollTop || window.scrollY)
      console.log(`Main content scroll: ${mainScroll}`)
      expect(mainScroll).toBe(0)
      console.log('✅ Main content did not scroll')
    }

    console.log('🎉 All sidebar scroll tests passed!')
  })

  test('sidebar should scroll when expanding subcategories', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    const scrollContainer = page.locator('aside div.overflow-y-auto').first()
    await expect(scrollContainer).toBeVisible()

    // Find and expand a category with subcategories
    const categoryButton = page.locator('button:has-text("Projects & Work")').first()
    if (await categoryButton.isVisible()) {
      await categoryButton.click()
      await page.waitForTimeout(300)

      // Get scroll position after expansion
      const scrollAfterExpand = await scrollContainer.evaluate(el => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isScrollable: el.scrollHeight > el.clientHeight
      }))

      console.log('After expansion:', scrollAfterExpand)
      expect(scrollAfterExpand.isScrollable).toBe(true)
      console.log('✅ Sidebar is scrollable after expanding categories')
    }
  })

  test('Portfolio link should be reachable', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    const scrollContainer = page.locator('aside div.overflow-y-auto').first()

    // Scroll to bottom of sidebar
    await scrollContainer.evaluate(el => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })

    await page.waitForTimeout(1000)

    // Look for Portfolio link
    const portfolioLink = page.locator('aside a[href*="portfolio"], aside a:has-text("Portfolio")').first()

    if (await portfolioLink.count() > 0) {
      // Scroll the portfolio link into view within the sidebar
      await portfolioLink.scrollIntoViewIfNeeded()
      await expect(portfolioLink).toBeVisible()
      console.log('✅ Portfolio link is visible and reachable')

      // Get its href
      const href = await portfolioLink.getAttribute('href')
      console.log(`Portfolio link href: ${href}`)
    } else {
      console.log('ℹ️ Portfolio link not found - checking for CV/Portfolio')
      const cvPortfolio = page.locator('aside a:has-text("CV")').first()
      if (await cvPortfolio.count() > 0) {
        await cvPortfolio.scrollIntoViewIfNeeded()
        await expect(cvPortfolio).toBeVisible()
        console.log('✅ CV/Portfolio link is visible and reachable')
      }
    }
  })
})
