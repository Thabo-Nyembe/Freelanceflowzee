#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🧪 Testing Remaining Category Pages\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 700
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // Login
  console.log('1️⃣  Logging in...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.waitForTimeout(3000)
  console.log('   ✅ Logged in\n')

  const pages = [
    { name: 'Business Admin', url: '/dashboard/admin-v2', category: 'admin' },
    { name: 'CV/Portfolio', url: '/dashboard/cv-portfolio', category: 'cv' },
    { name: 'Storage', url: '/dashboard/storage-v2', category: 'storage' },
    { name: 'Files Hub', url: '/dashboard/files-hub-v2', category: 'files' },
    { name: 'Collaboration', url: '/dashboard/collaboration-v2', category: 'collaboration' },
    { name: 'My Day', url: '/dashboard/my-day-v2', category: 'myday' }
  ]

  for (const pageInfo of pages) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`📄 Testing: ${pageInfo.name}`)
    console.log('='.repeat(50))

    await page.goto(`http://localhost:9323${pageInfo.url}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    })
    await page.waitForTimeout(4000)

    const analysis = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        url: window.location.href,
        hasContent: text.length > 500,
        hasError: text.toLowerCase().includes('error') && !text.includes('0 errors'),
        has404: text.includes('404'),
        textLength: text.length,
        textSample: text.substring(0, 600),
        hasData: (text.match(/\d+/g) || []).length > 10,
        hasDollar: text.includes('$'),
        hasMetrics: text.includes('Total') || text.includes('Active')
      }
    })

    console.log(`   URL: ${analysis.url}`)
    console.log(`   Content Length: ${analysis.textLength} chars`)
    console.log(`   ${analysis.hasContent ? '✅' : '❌'} Has substantial content`)
    console.log(`   ${analysis.hasData ? '✅' : '⚠️ '} Has numeric data`)
    console.log(`   ${analysis.hasError ? '❌ ERROR' : '✅'} No errors`)
    console.log(`   ${analysis.has404 ? '❌ 404' : '✅'} Page found`)

    if (analysis.hasError || analysis.has404 || !analysis.hasContent) {
      console.log('\n   📝 Content Sample:')
      console.log('   ' + analysis.textSample.substring(0, 300).replace(/\n/g, '\n   '))
    }

    await page.screenshot({
      path: `./tmp/${pageInfo.category}-page.png`,
      fullPage: false
    })
    console.log(`   📸 Screenshot: ./tmp/${pageInfo.category}-page.png`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ All pages tested')
  console.log('='.repeat(50))

  console.log('\n⏳ Browser will stay open for 10 seconds...')
  await page.waitForTimeout(10000)

} catch (error) {
  console.log(`\n❌ Error: ${error.message}`)
  await page.screenshot({ path: './tmp/test-error.png' })
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
