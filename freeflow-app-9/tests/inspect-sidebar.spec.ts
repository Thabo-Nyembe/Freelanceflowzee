import { test } from '@playwright/test'

test('inspect sidebar structure', async ({ page }) => {
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForSelector('aside', { timeout: 10000 })

  // Take screenshot
  await page.screenshot({ path: 'test-results/sidebar-state.png', fullPage: true })

  // Get all navigation links
  const links = await page.locator('aside a').allTextContents()
  console.log(`\nTotal navigation links: ${links.length}`)
  console.log('Links:', links.join(', '))

  // Get all category buttons
  const categories = await page.locator('aside button:has(svg)').allTextContents()
  console.log(`\nTotal category buttons: ${categories.length}`)
  console.log('Categories:', categories.filter(c => c.trim()).join(', '))

  // Get sidebar height info
  const sidebarInfo = await page.locator('aside').first().evaluate(el => ({
    height: el.clientHeight,
    computedHeight: getComputedStyle(el).height,
    classes: el.className
  }))
  console.log('\nSidebar info:', sidebarInfo)

  // Get scrollable container info
  const scrollInfo = await page.locator('aside > div.overflow-y-auto').first().evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    offsetHeight: el.offsetHeight,
    computedMaxHeight: getComputedStyle(el).maxHeight,
    classes: el.className
  }))
  console.log('\nScroll container info:', scrollInfo)

  // Count total visible elements in sidebar
  const totalItems = await page.locator('aside a, aside button').count()
  console.log(`\nTotal interactive items in sidebar: ${totalItems}`)

  console.log('\n✅ Inspection complete - check sidebar-state.png')
})
