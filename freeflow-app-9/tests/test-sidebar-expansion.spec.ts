import { test, expect } from '@playwright/test'

test('sidebar expands categories and creates scroll', async ({ page }) => {
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForSelector('aside', { timeout: 10000 })

  const scrollContainer = page.locator('aside > div.overflow-y-auto').first()

  // Initial state
  const initialDims = await scrollContainer.evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  }))
  console.log('Initial dimensions:', initialDims)

  // Find and click the first expandable category (e.g., "Business Intelligence")
  const categoryButtons = page.locator('aside button:has(svg)')
  const firstCategory = categoryButtons.first()
  const categoryName = await firstCategory.textContent()
  console.log(`\nExpanding category: "${categoryName}"`)

  await firstCategory.click()
  await page.waitForTimeout(500)

  // Check dimensions after expanding
  const afterFirstExpand = await scrollContainer.evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    canScroll: el.scrollHeight > el.clientHeight
  }))
  console.log('After expanding first category:', afterFirstExpand)

  // Expand a few more categories
  const categoriesToExpand = ['Project Management', 'AI Creative Suite', 'Creative Studio']

  for (const catName of categoriesToExpand) {
    const catButton = page.locator(`aside button:has-text("${catName}")`).first()
    if (await catButton.count() > 0) {
      console.log(`\nExpanding: "${catName}"`)
      await catButton.click()
      await page.waitForTimeout(300)
    }
  }

  // Check final dimensions
  const finalDims = await scrollContainer.evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    scrollTop: el.scrollTop,
    canScroll: el.scrollHeight > el.clientHeight
  }))
  console.log('\nFinal dimensions after expanding categories:', finalDims)

  // Verify scrolling is now possible
  expect(finalDims.canScroll).toBe(true)

  // Now scroll to bottom
  await scrollContainer.evaluate(el => {
    el.scrollTop = el.scrollHeight
  })

  await page.waitForTimeout(500)

  const scrolledPosition = await scrollContainer.evaluate(el => el.scrollTop)
  console.log(`\nScrolled to position: ${scrolledPosition}px`)
  expect(scrolledPosition).toBeGreaterThan(0)

  // Take screenshot of expanded state
  await page.screenshot({ path: 'test-results/sidebar-expanded.png', fullPage: true })

  console.log('\n✅ Sidebar expansion and scroll test passed!')
})
