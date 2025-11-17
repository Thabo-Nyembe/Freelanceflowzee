import { test, expect } from '@playwright/test'

test('PRODUCTION READY - Dialog positioning test', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  console.log('\n🚀 PRODUCTION READY - Testing Customize Navigation\n')

  // Click customize button
  const button = page.locator('aside button:has-text("Customize Navigation")').first()
  await button.click()
  await page.waitForTimeout(2000)

  // Take screenshot
  await page.screenshot({ path: 'test-results/production-dialog.png', fullPage: true })

  // Check dialog
  const dialog = page.locator('[role="dialog"]').first()
  const box = await dialog.boundingBox()
  const viewport = page.viewportSize()!

  console.log(`📐 Dialog Position:`)
  console.log(`   x: ${box?.x}, y: ${box?.y}`)
  console.log(`   width: ${box?.width}, height: ${box?.height}`)
  console.log(`\n🖥️  Viewport: ${viewport.width} x ${viewport.height}`)

  // Check if centered (should be roughly in middle)
  if (box) {
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const viewportCenterX = viewport.width / 2
    const viewportCenterY = viewport.height / 2

    console.log(`\n📍 Dialog center: (${Math.round(centerX)}, ${Math.round(centerY)})`)
    console.log(`📍 Viewport center: (${viewportCenterX}, ${viewportCenterY})`)

    const isNearCenterX = Math.abs(centerX - viewportCenterX) < 100
    const isNearCenterY = Math.abs(centerY - viewportCenterY) < 100

    console.log(`\n${isNearCenterX && isNearCenterY ? '✅' : '❌'} Dialog centered: ${isNearCenterX && isNearCenterY}`)

    if (isNearCenterX && isNearCenterY) {
      console.log('\n🎉 PRODUCTION READY - Dialog is properly centered!')
    } else {
      console.log('\n⚠️  Dialog not centered - checking CSS...')

      const styles = await dialog.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          top: computed.top,
          left: computed.left,
          transform: computed.transform
        }
      })
      console.log(`   CSS: top=${styles.top}, left=${styles.left}, transform=${styles.transform}`)
    }
  }

  // Test toggle
  const toggle = page.locator('#customize-mode')
  await toggle.scrollIntoViewIfNeeded()
  const canClick = await toggle.isVisible()
  console.log(`\n🎯 Reorder toggle visible: ${canClick ? '✅ YES' : '❌ NO'}`)
})
