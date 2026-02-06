#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🔐 Testing Business Admin Page\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 500
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // Login
  console.log('1️⃣  Logging in as admin...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.waitForTimeout(3000)
  console.log('   ✅ Logged in\n')

  // Navigate to Admin page
  console.log('2️⃣  Loading Business Admin page...')
  await page.goto('http://localhost:9323/dashboard/admin-v2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  console.log('   ⏳ Waiting for content to load...')
  await page.waitForTimeout(8000)

  // Analyze content
  const content = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      url: window.location.href,
      hasContent: text.length > 500,
      hasError: text.toLowerCase().includes('error') && !text.toLowerCase().includes('0 errors'),
      has404: text.includes('404'),
      hasAdmin: text.toLowerCase().includes('admin'),
      hasUsers: text.toLowerCase().includes('users') || text.toLowerCase().includes('user'),
      hasSettings: text.toLowerCase().includes('settings'),
      hasSystem: text.toLowerCase().includes('system'),
      textLength: text.length,
      textSample: text.substring(0, 800)
    }
  })

  console.log('\n📊 Page Analysis:')
  console.log(`   URL: ${content.url}`)
  console.log(`   Content Length: ${content.textLength} chars`)
  console.log(`   ${content.hasContent ? '✅' : '❌'} Has substantial content`)
  console.log(`   ${content.hasAdmin ? '✅' : '❌'} Admin-related content`)
  console.log(`   ${content.hasUsers ? '✅' : '❌'} User management`)
  console.log(`   ${content.hasSettings ? '✅' : '❌'} Settings`)
  console.log(`   ${content.hasSystem ? '✅' : '❌'} System info`)
  console.log(`   ${content.hasError ? '❌ ERROR' : '✅'} No errors`)
  console.log(`   ${content.has404 ? '❌ 404' : '✅'} Page found`)

  // Take screenshots
  await page.screenshot({ path: './tmp/admin-full.png', fullPage: true })
  console.log('\n   📸 Full page: ./tmp/admin-full.png')

  await page.screenshot({ path: './tmp/admin-viewport.png', fullPage: false })
  console.log('   📸 Viewport: ./tmp/admin-viewport.png')

  console.log('\n📝 Content Sample:')
  console.log('   ' + content.textSample.substring(0, 400).replace(/\n/g, '\n   '))

  console.log('\n⏳ Browser will stay open for 15 seconds...')
  await page.waitForTimeout(15000)

} catch (error) {
  console.log(`\n❌ Error: ${error.message}`)
  await page.screenshot({ path: './tmp/admin-error.png' })
  console.log('   📸 Error screenshot: ./tmp/admin-error.png')
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
