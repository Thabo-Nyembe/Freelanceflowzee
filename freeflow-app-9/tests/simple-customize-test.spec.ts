import { test } from '@playwright/test'

test('Simple customize navigation visual test', async ({ page }) => {
  // Use a larger viewport
  await page.setViewportSize({ width: 1920, height: 1080 })

  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  console.log('\n📸 Taking screenshot of initial state')
  await page.screenshot({ path: 'test-results/step1-dashboard.png', fullPage: true })

  // Click customize navigation
  const customizeButton = page.locator('aside button:has-text("Customize Navigation")').first()
  await customizeButton.click()
  await page.waitForTimeout(1500)

  console.log('📸 Taking screenshot of dialog open')
  await page.screenshot({ path: 'test-results/step2-dialog-open.png', fullPage: true })

  // Get all content from dialog
  const dialogText = await page.locator('[role="dialog"]').first().textContent()
  console.log('\n📋 Dialog content preview:')
  console.log(dialogText?.substring(0, 500))

  // Count elements
  const switches = await page.locator('[role="dialog"] [role="switch"]').count()
  console.log(`\n🔢 Total switches found: ${switches}`)

  // Get dialog dimensions
  const dialogDims = await page.locator('[role="dialog"]').first().boundingBox()
  console.log(`\n📐 Dialog dimensions:`)
  console.log(`   x: ${dialogDims?.x}, y: ${dialogDims?.y}`)
  console.log(`   width: ${dialogDims?.width}, height: ${dialogDims?.height}`)

  // Get viewport size
  const viewportSize = page.viewportSize()
  console.log(`\n🖥️  Viewport: ${viewportSize?.width} x ${viewportSize?.height}`)

  // Check if reorder toggle is visible
  const reorderToggle = page.locator('#customize-mode')
  const isVisible = await reorderToggle.isVisible()
  const box = await reorderToggle.boundingBox()
  console.log(`\n🎯 Reorder Mode Toggle:`)
  console.log(`   Visible: ${isVisible}`)
  console.log(`   Position: x=${box?.x}, y=${box?.y}`)
  console.log(`   Size: ${box?.width} x ${box?.height}`)

  if (box && viewportSize) {
    const inViewport = box.y >= 0 && box.y + box.height <= viewportSize.height
    console.log(`   In viewport: ${inViewport ? '✅ YES' : '❌ NO (y=${box.y}, viewport height=${viewportSize.height})'}`)
  }

  console.log('\n✅ Visual test complete - check screenshots')
})
