import { test, expect } from '@playwright/test'

test('Quick check - Expenses page after server restart', async ({ page }) => {
  console.log('\n🔍 Quick check of expenses page with fresh server...\n')

  await page.goto('http://localhost:9323/dashboard/expenses-v2', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(5000)

  await page.screenshot({
    path: 'test-results/tax-verification/30-expenses-after-restart.png',
    fullPage: true
  })

  const errorVisible = await page.locator('text=/Something went wrong|Maximum update/i').isVisible({ timeout: 3000 }).catch(() => false)

  if (errorVisible) {
    console.log('❌ ERROR STILL EXISTS!\n')

    // Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser error: ${msg.text()}`)
      }
    })

    expect(errorVisible).toBe(false)
  } else {
    console.log('✅ SUCCESS! No error on expenses page!\n')
    expect(errorVisible).toBe(false)
  }
})
