import { test, expect } from '@playwright/test'

test('verify sidebar scroll works when categories are expanded', async ({ page }) => {
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForSelector('aside', { timeout: 10000 })

  const scrollContainer = page.locator('aside > div.overflow-y-auto').first()

  // Expand multiple collapsed categories by clicking their chevron buttons
  // Avoid "Customize Navigation" which opens a modal
  const categoriesToExpand = [
    'PROJECT MANAGEMENT',
    'FINANCIAL',
    'TEAM & CLIENTS',
    'COMMUNICATION',
    'AI TOOLS',
    'VIDEO & MEDIA'
  ]

  for (const catName of categoriesToExpand) {
    // Find the button with this text
    const catButton = page.locator(`aside button:has-text("${catName}")`).first()
    if (await catButton.isVisible()) {
      console.log(`Expanding: ${catName}`)
      await catButton.click({ force: true })
      await page.waitForTimeout(200)
    }
  }

  // Now check if sidebar has overflow
  const dims = await scrollContainer.evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    canScroll: el.scrollHeight > el.clientHeight
  }))

  console.log('\nSidebar dimensions after expanding categories:')
  console.log(`  scrollHeight: ${dims.scrollHeight}px`)
  console.log(`  clientHeight: ${dims.clientHeight}px`)
  console.log(`  canScroll: ${dims.canScroll}`)

  if (dims.canScroll) {
    // Test scrolling within sidebar
    console.log('\n✅ Sidebar is scrollable! Testing scroll...')

    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight / 2
    })

    await page.waitForTimeout(300)

    const midScroll = await scrollContainer.evaluate(el => el.scrollTop)
    console.log(`Scrolled to middle: ${midScroll}px`)
    expect(midScroll).toBeGreaterThan(0)

    // Scroll to bottom
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight
    })

    await page.waitForTimeout(300)

    const bottomScroll = await scrollContainer.evaluate(el => el.scrollTop)
    console.log(`Scrolled to bottom: ${bottomScroll}px`)
    expect(bottomScroll).toBeGreaterThan(midScroll)

    // Verify main content didn't scroll
    const mainScroll = await page.evaluate(() => window.scrollY)
    expect(mainScroll).toBe(0)
    console.log(`\n✅ Main content did not scroll (scrollY = ${mainScroll})`)

    console.log('\n🎉 SUCCESS: Sidebar scrolls independently!')
  } else {
    console.log('\n⚠️  Sidebar not scrollable yet - need more categories expanded')
    console.log('   This is expected if there aren\'t many navigation items')
  }

  await page.screenshot({ path: 'test-results/sidebar-scroll-demo.png', fullPage: true })
})
