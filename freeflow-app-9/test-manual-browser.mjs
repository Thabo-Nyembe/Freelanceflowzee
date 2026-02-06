#!/usr/bin/env node
import { chromium } from 'playwright'

const PAGES = [
  { name: '1. Dashboard (My Day)', url: '/dashboard' },
  { name: '2. Business Intelligence', url: '/dashboard/business-intelligence' },
  { name: '3. Business Admin', url: '/dashboard/admin-v2' },
  { name: '4. Client CRM', url: '/dashboard/clients-v2' },
  { name: '5. CV/Portfolio', url: '/dashboard/cv-portfolio' },
  { name: '6. Portfolio V2', url: '/dashboard/portfolio-v2' },
  { name: '7. Storage V2', url: '/dashboard/storage-v2' },
  { name: '8. Files Hub V2', url: '/dashboard/files-hub-v2' },
  { name: '9. Collaboration V2', url: '/dashboard/collaboration-v2' },
  { name: '10. My Day V2', url: '/dashboard/my-day-v2' },
]

console.log('\n🌐 Manual Browser Test - Interactive Demo\n')
console.log('=' .repeat(70))
console.log('\n📌 This will open a browser window and navigate through all pages')
console.log('📌 Watch the browser to verify each page loads correctly')
console.log('📌 Each page will display for 8 seconds\n')
console.log('=' .repeat(70))

const browser = await chromium.launch({
  headless: false,
  slowMo: 500,
  args: ['--start-maximized']
})

const context = await browser.newContext({
  viewport: null, // Use full window
  recordVideo: {
    dir: './tmp/videos/',
    size: { width: 1920, height: 1080 }
  }
})

const page = await context.newPage()

try {
  // Login
  console.log('\n🔐 Step 1: Logging in...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })

  console.log('   ⏳ Filling credentials...')
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')

  console.log('   ⏳ Submitting login...')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(4000)

  console.log('   ✅ Logged in!\n')
  console.log('=' .repeat(70))

  // Test each page
  let pageNum = 1
  for (const pageInfo of PAGES) {
    console.log(`\n📄 Testing ${pageInfo.name}`)
    console.log('-'.repeat(70))

    try {
      console.log(`   ⏳ Navigating to: ${pageInfo.url}`)
      await page.goto(`http://localhost:9323${pageInfo.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })

      // Wait for content to load
      await page.waitForTimeout(2000)

      const analysis = await page.evaluate(() => {
        const text = document.body.innerText
        const textLower = text.toLowerCase()
        return {
          url: window.location.href,
          title: document.title,
          textLength: text.length,
          isOnLogin: window.location.href.includes('/login'),
          hasError: textLower.includes('error') && !textLower.includes('0 error'),
          has404: textLower.includes('404') || textLower.includes('not found'),
          hasLoading: textLower.includes('loading'),
          contentSample: text.substring(0, 150)
        }
      })

      // Status check
      let status = '✅'
      let message = 'Page loaded successfully'

      if (analysis.isOnLogin) {
        status = '❌'
        message = 'Redirected to login (session issue)'
      } else if (analysis.has404) {
        status = '❌'
        message = '404 - Page not found'
      } else if (analysis.hasError) {
        status = '⚠️'
        message = 'Page has errors'
      } else if (analysis.textLength < 100) {
        status = '⚠️'
        message = 'Very little content'
      } else if (analysis.hasLoading) {
        status = '⏳'
        message = 'Still loading...'
      }

      console.log(`   ${status} ${message}`)
      console.log(`   📊 Content length: ${analysis.textLength} characters`)
      console.log(`   🔗 Current URL: ${analysis.url}`)
      console.log(`   📝 Page title: ${analysis.title}`)

      if (!analysis.isOnLogin) {
        console.log(`   📄 Preview: ${analysis.contentSample.substring(0, 100)}...`)

        // Take screenshot
        const screenshotName = pageInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        await page.screenshot({
          path: `./tmp/manual-${screenshotName}.png`,
          fullPage: false
        })
        console.log(`   📸 Screenshot saved: ./tmp/manual-${screenshotName}.png`)
      }

      // Wait so user can see the page
      console.log(`   ⏸️  Displaying for 8 seconds...`)
      await page.waitForTimeout(8000)

    } catch (error) {
      console.log(`   ❌ Error loading page: ${error.message}`)
    }

    console.log('-'.repeat(70))
    pageNum++
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n✅ Manual browser test complete!')
  console.log('\n📸 All screenshots saved to ./tmp/')
  console.log('🎥 Video recording saved to ./tmp/videos/')
  console.log('\n⏳ Browser will close in 10 seconds...')

  await page.waitForTimeout(10000)

} catch (error) {
  console.log(`\n❌ Test Error: ${error.message}\n`)
  await page.screenshot({ path: './tmp/manual-error.png' })
  console.log('📸 Error screenshot saved: ./tmp/manual-error.png')
} finally {
  await context.close()
  await browser.close()
  console.log('\n✅ Browser closed. Test complete!\n')
}
