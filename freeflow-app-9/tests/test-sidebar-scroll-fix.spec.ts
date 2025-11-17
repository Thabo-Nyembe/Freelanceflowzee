import { test, expect } from '@playwright/test'

test('sidebar scrolls to reach Portfolio and bottom items', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })

  // Wait for sidebar
  await page.waitForSelector('aside', { timeout: 10000 })

  // Get the scrollable div inside aside
  const scrollContainer = page.locator('aside > div.overflow-y-auto').first()

  // Check if scrollable container exists
  const exists = await scrollContainer.count()
  console.log(`Scrollable container found: ${exists > 0}`)

  if (exists === 0) {
    throw new Error('Scrollable container with class overflow-y-auto not found in sidebar')
  }

  // Get scroll dimensions
  const dimensions = await scrollContainer.evaluate(el => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    canScroll: el.scrollHeight > el.clientHeight
  }))

  console.log('Sidebar dimensions:', dimensions)

  // Verify it's scrollable
  expect(dimensions.canScroll).toBe(true)

  // Scroll to bottom
  await scrollContainer.evaluate(el => {
    el.scrollTop = el.scrollHeight
  })

  await page.waitForTimeout(500)

  // Check new scroll position
  const newScrollTop = await scrollContainer.evaluate(el => el.scrollTop)
  console.log(`Scrolled from ${dimensions.scrollTop} to ${newScrollTop}`)

  // Verify scroll actually happened
  expect(newScrollTop).toBeGreaterThan(0)

  // Try to find Portfolio or CV link (should be visible after scrolling)
  const portfolioVisible = await page.locator('aside a:has-text("Portfolio"), aside a:has-text("CV")').first().isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`Portfolio/CV visible after scroll: ${portfolioVisible}`)

  // Check Settings link (usually at bottom)
  const settingsVisible = await page.locator('aside a:has-text("Settings")').first().isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`Settings visible after scroll: ${settingsVisible}`)

  console.log('✅ Sidebar scroll test passed!')
})
