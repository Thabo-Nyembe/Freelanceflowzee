import { test } from '@playwright/test'

test('Debug expenses page - capture console errors', async ({ page }) => {
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error') {
      consoleErrors.push(text)
      console.log(`❌ Browser Error: ${text}`)
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text)
      console.log(`⚠️  Browser Warning: ${text}`)
    }
  })

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`💥 Page Error: ${error.message}`)
    console.log(`Stack: ${error.stack}`)
  })

  console.log('\n🔍 Loading expenses page and capturing console output...\n')

  try {
    await page.goto('http://localhost:9323/dashboard/expenses-v2', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    // Wait a bit to capture async errors
    await page.waitForTimeout(8000)

    await page.screenshot({
      path: 'test-results/tax-verification/31-expenses-console-debug.png',
      fullPage: true
    })

    console.log(`\n📊 Total console errors: ${consoleErrors.length}`)
    console.log(`📊 Total console warnings: ${consoleWarnings.length}\n`)

    if (consoleErrors.length > 0) {
      console.log('🔍 Detailed error analysis:')
      consoleErrors.forEach((err, i) => {
        console.log(`\nError ${i + 1}:`)
        console.log(err)
      })
    }

  } catch (error) {
    console.log(`\n❌ Failed to load page: ${error}\n`)
  }
})
