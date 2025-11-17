import { test } from '@playwright/test'

test('Debug dialog opening', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('http://localhost:9323/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  console.log('\n🔍 Checking page state before clicking')

  // Check if button exists
  const button = page.locator('aside button:has-text("Customize Navigation")').first()
  const buttonExists = await button.count() > 0
  console.log(`Customize button exists: ${buttonExists}`)

  if (buttonExists) {
    const buttonVisible = await button.isVisible()
    console.log(`Button visible: ${buttonVisible}`)

    // Take screenshot before click
    await page.screenshot({ path: 'test-results/before-click.png' })

    // Click the button
    console.log('\n🖱️  Clicking Customize Navigation button')
    await button.click()
    await page.waitForTimeout(2000)

    // Take screenshot after click
    await page.screenshot({ path: 'test-results/after-click.png' })

    // Check for dialog in DOM
    const dialogInDOM = await page.locator('[role="dialog"]').count()
    console.log(`\nDialogs in DOM: ${dialogInDOM}`)

    if (dialogInDOM > 0) {
      const dialog = page.locator('[role="dialog"]').first()

      // Get dialog attributes
      const dataState = await dialog.getAttribute('data-state')
      console.log(`Dialog data-state: ${dataState}`)

      const isVisible = await dialog.isVisible()
      console.log(`Dialog isVisible(): ${isVisible}`)

      const box = await dialog.boundingBox()
      console.log(`Dialog bounding box:`, box)

      // Get computed styles
      const styles = await dialog.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          top: computed.top,
          left: computed.left,
          transform: computed.transform,
          zIndex: computed.zIndex
        }
      })
      console.log(`\nDialog computed styles:`, styles)

      // Check overlay
      const overlay = page.locator('[role="dialog"]').locator('..').locator('[class*="backdrop-blur"]').first()
      const overlayExists = await overlay.count() > 0
      console.log(`\nOverlay exists: ${overlayExists}`)
      if (overlayExists) {
        const overlayVisible = await overlay.isVisible()
        console.log(`Overlay visible: ${overlayVisible}`)
      }

      // Get all parent elements
      const parents = await dialog.evaluate(el => {
        const parentChain = []
        let current = el.parentElement
        let depth = 0
        while (current && depth < 5) {
          parentChain.push({
            tag: current.tagName,
            classes: current.className,
            id: current.id
          })
          current = current.parentElement
          depth++
        }
        return parentChain
      })
      console.log(`\nParent elements:`, parents)
    }

    // Check for portal
    const portals = await page.locator('[data-radix-portal]').count()
    console.log(`\nRadix portals found: ${portals}`)
  }

  console.log('\n✅ Debug complete')
})
