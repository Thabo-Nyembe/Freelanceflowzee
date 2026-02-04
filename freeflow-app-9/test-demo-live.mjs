#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 Live Demo Test - Patient Mode                        ║')
console.log('║  Browser will stay open - you can click around!         ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 100
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  console.log('Step 1: Opening login page...')
  await page.goto('http://localhost:9323/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })
  console.log('✅ Login page loaded\n')
  await page.waitForTimeout(2000)

  console.log('Step 2: Filling in credentials...')
  console.log('   Email: alex@freeflow.io')
  console.log('   Password: investor2026\n')

  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await page.waitForTimeout(1000)

  console.log('Step 3: Clicking Sign In...')
  await page.click('button[type="submit"]')
  console.log('   Waiting for redirect...\n')
  await page.waitForTimeout(8000)

  const currentUrl = page.url()
  console.log('✅ After login, current URL:', currentUrl)
  console.log('')

  // Take screenshot
  await page.screenshot({ path: '/tmp/demo-after-login.png', fullPage: true })
  console.log('📸 Screenshot saved: /tmp/demo-after-login.png\n')

  // Try to navigate to clients page
  console.log('Step 4: Navigating to clients page...')
  const clientUrls = [
    '/v2/dashboard/clients',
    '/dashboard/clients',
    '/dashboard/clients-v2'
  ]

  for (const url of clientUrls) {
    try {
      console.log(`\n   Trying: ${url}`)
      await page.goto(`http://localhost:9323${url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })
      await page.waitForTimeout(5000)

      const finalUrl = page.url()
      console.log(`   Final URL: ${finalUrl}`)

      // Check if we got redirected
      if (finalUrl.includes('login')) {
        console.log('   ⚠️  Redirected to login - session may have expired')
      } else {
        console.log('   ✅ Page loaded!')

        // Take screenshot
        const filename = `/tmp/demo-page${url.replace(/\//g, '-')}.png`
        await page.screenshot({ path: filename, fullPage: true })
        console.log(`   📸 Screenshot: ${filename}`)

        // Check page content
        const content = await page.content()
        const hasClients = content.toLowerCase().includes('client')
        const hasData = content.includes('Acme') || content.includes('TechStart')

        console.log(`   Contains "client": ${hasClients}`)
        console.log(`   Contains actual data: ${hasData}`)

        if (hasData) {
          console.log('   🎉 DATA VISIBLE! This URL works!')
          break
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('🔍 BROWSER INSPECTION TIME')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('The browser will stay open for 5 MINUTES.')
  console.log('You can:')
  console.log('  • Click around the dashboard')
  console.log('  • Try different pages manually')
  console.log('  • Check if data is visible')
  console.log('  • Open DevTools (F12) to check for errors')
  console.log('')
  console.log('Screenshots saved in /tmp/demo-*.png')
  console.log('═══════════════════════════════════════════════════════════\n')

  // Keep browser open for 5 minutes
  await page.waitForTimeout(300000)

} catch (error) {
  console.error('\n❌ Error during test:', error.message)
  console.log('\nBrowser will stay open for 2 minutes so you can inspect...\n')
  await page.waitForTimeout(120000)
} finally {
  await browser.close()
  console.log('\n✅ Browser closed. Test complete!\n')
}
