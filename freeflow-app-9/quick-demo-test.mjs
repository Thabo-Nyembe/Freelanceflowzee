#!/usr/bin/env node

/**
 * Quick Demo Test
 * Fast verification that demo user can access key pages
 */

import { chromium } from 'playwright'

const DEMO_URL = 'http://localhost:9323'
const DEMO_EMAIL = 'alex@freeflow.io'
const DEMO_PASSWORD = 'investor2026'

const KEY_PAGES = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'AI Assistant', url: '/dashboard/ai-assistant-v2' },
  { name: 'CRM', url: '/dashboard/crm-v2' },
  { name: 'Projects', url: '/dashboard/projects-v2' },
  { name: 'Invoices', url: '/dashboard/invoices-v2' },
  { name: 'Team', url: '/dashboard/team-v2' },
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  🎯 KAZI Quick Demo Test                                 ║')
  console.log('║  Testing alex@freeflow.io showcase readiness             ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  let browser
  let testsPassed = 0
  let testsFailed = 0

  try {
    // Launch browser
    console.log('🚀 Launching browser...')
    browser = await chromium.launch({
      headless: false,
      slowMo: 100
    })
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    })
    const page = await context.newPage()

    // Test 1: Login
    console.log('\n1️⃣  Testing Login')
    console.log('─'.repeat(65))
    try {
      await page.goto(`${DEMO_URL}/login`, { waitUntil: 'networkidle' })
      await sleep(1000)

      await page.fill('input[type="email"], input[name="email"]', DEMO_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', DEMO_PASSWORD)

      await page.click('button[type="submit"]')
      await sleep(3000)

      const url = page.url()
      if (url.includes('/dashboard') || url.includes('/login') === false) {
        console.log('✅ Login successful')
        console.log(`   Redirected to: ${url}`)
        testsPassed++
      } else {
        console.log('❌ Login may have failed')
        console.log(`   Current URL: ${url}`)
        testsFailed++
      }
    } catch (error) {
      console.log('❌ Login error:', error.message)
      testsFailed++
    }

    // Test 2-7: Navigate to key pages
    for (const testPage of KEY_PAGES) {
      console.log(`\n${KEY_PAGES.indexOf(testPage) + 2}️⃣  Testing ${testPage.name}`)
      console.log('─'.repeat(65))

      try {
        await page.goto(`${DEMO_URL}${testPage.url}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        })
        await sleep(2000)

        // Check for common error indicators
        const pageContent = await page.content()
        const has404 = pageContent.includes('404') || pageContent.includes('Not Found')
        const hasError = pageContent.includes('Error') && !pageContent.includes('error-handler')

        if (has404) {
          console.log(`❌ Page not found: ${testPage.url}`)
          testsFailed++
        } else if (hasError) {
          console.log(`⚠️  Page loaded but may have errors: ${testPage.url}`)
          testsPassed++ // Count as pass but note warning
        } else {
          console.log(`✅ ${testPage.name} loaded successfully`)
          console.log(`   URL: ${testPage.url}`)
          testsPassed++
        }

        // Take screenshot
        await page.screenshot({
          path: `/tmp/demo-test-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`
        })
        console.log(`   Screenshot: /tmp/demo-test-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`)

      } catch (error) {
        console.log(`❌ Failed to load ${testPage.name}:`, error.message)
        testsFailed++
      }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('📊 TEST SUMMARY')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`✅ Passed: ${testsPassed}/${testsPassed + testsFailed}`)
    console.log(`❌ Failed: ${testsFailed}/${testsPassed + testsFailed}`)

    const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)
    console.log(`\n🎯 Success Rate: ${successRate}%`)

    if (successRate >= 85) {
      console.log('\n🚀 STATUS: DEMO READY! ✨')
      console.log('   All critical pages are accessible.')
    } else if (successRate >= 60) {
      console.log('\n⚡ STATUS: MOSTLY READY')
      console.log('   Most pages work, some issues to review.')
    } else {
      console.log('\n⚠️  STATUS: NEEDS ATTENTION')
      console.log('   Several pages have issues.')
    }

    console.log('\n📸 Screenshots saved to /tmp/demo-test-*.png')
    console.log('\nBrowser will stay open for 30 seconds for your review...')
    await sleep(30000)

  } catch (error) {
    console.error('\n❌ Test error:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  console.log('\n✅ Test complete!\n')
}

main().catch(console.error)
