#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 Testing CRITICAL Showcase Pages                      ║')
console.log('║  Comprehensive verification with screenshots             ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

// Critical pages for the showcase
const CRITICAL_PAGES = [
  {
    name: 'Overview Dashboard',
    url: '/dashboard',
    dataCheck: ['project', 'client', 'revenue', 'task'],
    emptyCheck: ['No projects yet', 'No clients yet']
  },
  {
    name: 'Clients (CRM)',
    url: '/dashboard/clients-v2',
    dataCheck: ['Acme', 'TechStart', 'client'],
    emptyCheck: ['No clients yet', 'No data']
  },
  {
    name: 'Projects',
    url: '/dashboard/projects-v2',
    dataCheck: ['Nordic', 'HealthTech', 'project'],
    emptyCheck: ['No projects yet', 'No data']
  },
  {
    name: 'Invoices',
    url: '/dashboard/invoices-v2',
    dataCheck: ['invoice', 'amount', 'paid'],
    emptyCheck: ['No invoices yet', 'No data']
  },
  {
    name: 'Tasks',
    url: '/dashboard/tasks-v2',
    dataCheck: ['task', 'todo', 'complete'],
    emptyCheck: ['No tasks yet', 'No data']
  },
  {
    name: 'CRM/Sales',
    url: '/dashboard/crm-v2',
    dataCheck: ['deal', 'pipeline', 'lead'],
    emptyCheck: ['No deals yet', 'No data']
  },
  {
    name: 'Time Tracking',
    url: '/dashboard/time-tracking-v2',
    dataCheck: ['hour', 'time', 'entry'],
    emptyCheck: ['No time entries', 'No data']
  },
  {
    name: 'Analytics',
    url: '/dashboard/analytics-v2',
    dataCheck: ['revenue', 'chart', 'metric'],
    emptyCheck: ['No data', 'No analytics']
  }
]

const browser = await chromium.launch({
  headless: false,
  slowMo: 50
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

let results = []
let passed = 0
let failed = 0
let warnings = 0

try {
  console.log('1️⃣  Logging in as alex@freeflow.io...\n')

  await page.goto('http://localhost:9323/login', {
    waitUntil: 'networkidle',
    timeout: 30000
  })

  await page.waitForTimeout(2000)

  // Fill login form
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await page.click('button[type="submit"]')

  console.log('   Waiting for authentication...')
  await page.waitForTimeout(8000)

  const loginUrl = page.url()
  console.log(`   Current URL: ${loginUrl}`)

  if (loginUrl.includes('/login')) {
    console.log('   ⚠️  Still on login page - checking for errors...\n')
  } else {
    console.log('   ✅ Redirected from login\n')
  }

  // Test each critical page
  console.log('2️⃣  Testing critical pages...\n')
  console.log('═══════════════════════════════════════════════════════════\n')

  for (const testPage of CRITICAL_PAGES) {
    try {
      console.log(`🔍 Testing: ${testPage.name}`)
      console.log(`   URL: ${testPage.url}`)

      // Navigate to page
      await page.goto(`http://localhost:9323${testPage.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      // Wait for page to settle
      console.log('   ⏳ Waiting for content...')
      await page.waitForTimeout(5000)

      // Get page content
      const content = await page.content()
      const visibleText = await page.textContent('body').catch(() => '')

      // Check for redirects
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        console.log('   ❌ Redirected to login - auth issue')
        failed++
        results.push({
          name: testPage.name,
          status: '❌',
          message: 'Redirected to login - authentication failed'
        })
        continue
      }

      // Check for 404
      if (content.includes('404') || content.includes('Not Found')) {
        console.log('   ❌ 404 Not Found')
        failed++
        results.push({
          name: testPage.name,
          status: '❌',
          message: '404 Page not found'
        })
        continue
      }

      // Check for errors
      if (content.includes('Error occurred') || content.includes('Something went wrong')) {
        console.log('   ⚠️  Page has errors')
        warnings++
        results.push({
          name: testPage.name,
          status: '⚠️',
          message: 'Page loaded but has errors'
        })
        continue
      }

      // Check for empty state
      const isEmpty = testPage.emptyCheck.some(check =>
        content.toLowerCase().includes(check.toLowerCase()) ||
        visibleText.toLowerCase().includes(check.toLowerCase())
      )

      if (isEmpty) {
        console.log('   ⚠️  Page empty - no data displayed')
        console.log('   💡 May need to seed data or fix data fetching')
        warnings++
        results.push({
          name: testPage.name,
          status: '⚠️',
          message: 'Page loaded but shows no data'
        })
      } else {
        // Check for expected data
        const hasData = testPage.dataCheck.some(check =>
          content.toLowerCase().includes(check.toLowerCase()) ||
          visibleText.toLowerCase().includes(check.toLowerCase())
        )

        if (hasData) {
          console.log('   ✅ Data visible!')
          passed++
          results.push({
            name: testPage.name,
            status: '✅',
            message: 'Working with data'
          })
        } else {
          console.log('   ⚠️  Page loaded but data unclear')
          warnings++
          results.push({
            name: testPage.name,
            status: '⚠️',
            message: 'Page loaded but data not clearly visible'
          })
        }
      }

      // Take screenshot
      const filename = `/tmp/showcase-${testPage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
      await page.screenshot({ path: filename, fullPage: false })
      console.log(`   📸 Screenshot: ${filename}`)
      console.log('')

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      console.log('')
      failed++
      results.push({
        name: testPage.name,
        status: '❌',
        message: `Error: ${error.message}`
      })
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 SHOWCASE READINESS SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')

  console.log(`\n✅ Working:  ${passed}/${CRITICAL_PAGES.length}`)
  console.log(`⚠️  Issues:   ${warnings}/${CRITICAL_PAGES.length}`)
  console.log(`❌ Failed:   ${failed}/${CRITICAL_PAGES.length}`)

  console.log('\n📋 Page-by-Page Results:\n')
  results.forEach(r => {
    console.log(`${r.status} ${r.name.padEnd(25)} - ${r.message}`)
  })

  // Readiness assessment
  console.log('\n═══════════════════════════════════════════════════════════')
  const readinessScore = (passed / CRITICAL_PAGES.length) * 100

  if (readinessScore === 100) {
    console.log('🎉 SHOWCASE READY!')
    console.log('   All critical pages working perfectly!')
  } else if (readinessScore >= 75) {
    console.log('✅ MOSTLY READY')
    console.log('   Core pages working, minor issues to address')
  } else if (readinessScore >= 50) {
    console.log('⚠️  NEEDS WORK')
    console.log('   Some pages working but significant issues remain')
  } else {
    console.log('❌ NOT READY')
    console.log('   Major issues - extensive fixes needed')
  }

  console.log(`\n📸 All screenshots saved to /tmp/showcase-*.png`)
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log('Browser will stay open for 30 seconds for inspection...\n')
  await page.waitForTimeout(30000)

} catch (error) {
  console.error('\n❌ Test error:', error.message)
  console.error(error.stack)
} finally {
  await browser.close()
  console.log('✅ Test complete!\n')
}
