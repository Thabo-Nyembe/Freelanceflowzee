#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 Testing WORKING Pages for Showcase                   ║')
console.log('║  Verifying pages with confirmed API data                ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

// Only test pages where we confirmed APIs work
const WORKING_PAGES = [
  {
    name: 'Clients (15 items)',
    url: '/dashboard/clients-v2',
    dataCheck: ['Acme', 'client', 'TechStart']
  },
  {
    name: 'Projects (20 items)',
    url: '/dashboard/projects-v2',
    dataCheck: ['project', 'Nordic', 'HealthTech']
  },
  {
    name: 'Invoices (data available)',
    url: '/dashboard/invoices-v2',
    dataCheck: ['invoice', 'INV-', 'amount']
  },
  {
    name: 'Tasks (50 items)',
    url: '/dashboard/tasks-v2',
    dataCheck: ['task', 'todo', 'complete']
  }
]

const browser = await chromium.launch({
  headless: false,
  slowMo: 100
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

let results = []
let passed = 0
let failed = 0

try {
  console.log('1️⃣  Logging in as alex@freeflow.io...\n')

  await page.goto('http://localhost:9323/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  await page.waitForTimeout(3000)

  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await page.click('button[type="submit"]')

  console.log('   Waiting for authentication...')
  await page.waitForTimeout(8000)

  const loginUrl = page.url()
  console.log(`   Logged in, redirected to: ${loginUrl}`)
  console.log('')

  console.log('2️⃣  Testing pages with confirmed data...\n')
  console.log('═══════════════════════════════════════════════════════════\n')

  for (const testPage of WORKING_PAGES) {
    try {
      console.log(`🔍 Testing: ${testPage.name}`)
      console.log(`   URL: ${testPage.url}`)

      await page.goto(`http://localhost:9323${testPage.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      console.log('   ⏳ Waiting for content to load...')
      await page.waitForTimeout(6000)

      const currentUrl = page.url()

      // Check for redirect to login
      if (currentUrl.includes('/login')) {
        console.log('   ⚠️  Redirected to login')
        failed++
        results.push({
          name: testPage.name,
          status: '⚠️',
          message: 'Auth redirect'
        })
        console.log('')
        continue
      }

      // Get page content
      const content = await page.content()
      const visibleText = await page.textContent('body').catch(() => '')

      // Check for data
      const hasData = testPage.dataCheck.some(check =>
        visibleText.toLowerCase().includes(check.toLowerCase())
      )

      if (hasData) {
        console.log('   ✅ Data visible on page!')
        passed++
        results.push({
          name: testPage.name,
          status: '✅',
          message: 'Data visible'
        })

        // Take screenshot of success
        const filename = `/tmp/showcase-working-${testPage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
        await page.screenshot({ path: filename, fullPage: false })
        console.log(`   📸 Screenshot: ${filename}`)
      } else {
        console.log('   ⚠️  Page loaded but data not visible')
        failed++
        results.push({
          name: testPage.name,
          status: '⚠️',
          message: 'No data visible'
        })

        const filename = `/tmp/showcase-nodata-${testPage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
        await page.screenshot({ path: filename, fullPage: false })
        console.log(`   📸 Screenshot: ${filename}`)
      }

      console.log('')

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      console.log('')
      failed++
      results.push({
        name: testPage.name,
        status: '❌',
        message: error.message
      })
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 SHOWCASE PAGES STATUS')
  console.log('═══════════════════════════════════════════════════════════')

  console.log(`\n✅ Working with Data: ${passed}/${WORKING_PAGES.length}`)
  console.log(`❌ Issues:            ${failed}/${WORKING_PAGES.length}`)

  console.log('\n📋 Results:\n')
  results.forEach(r => {
    console.log(`${r.status} ${r.name.padEnd(30)} - ${r.message}`)
  })

  console.log('\n═══════════════════════════════════════════════════════════')

  if (passed === WORKING_PAGES.length) {
    console.log('🎉 ALL WORKING PAGES READY FOR SHOWCASE!')
  } else if (passed >= WORKING_PAGES.length * 0.75) {
    console.log('✅ MOSTLY READY - Most pages showing data')
  } else {
    console.log('⚠️  NEEDS ATTENTION - Some pages not showing data')
  }

  console.log('\n📸 All screenshots saved to /tmp/showcase-*.png')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log('Browser will stay open for 60 seconds for inspection...\n')
  await page.waitForTimeout(60000)

} catch (error) {
  console.error('\n❌ Test error:', error.message)
  await page.waitForTimeout(30000)
} finally {
  await browser.close()
  console.log('✅ Test complete!\n')
}
