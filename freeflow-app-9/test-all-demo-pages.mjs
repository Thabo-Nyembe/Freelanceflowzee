#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 Testing ALL Demo Pages                               ║')
console.log('║  Verifying data across multiple pages                   ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const DEMO_PAGES = [
  { name: 'Dashboard', url: '/dashboard', shouldHaveData: 'project' },
  { name: 'Clients', url: '/dashboard/clients-v2', shouldHaveData: 'client' },
  { name: 'Projects', url: '/dashboard/projects-v2', shouldHaveData: 'project' },
  { name: 'Invoices', url: '/dashboard/invoices-v2', shouldHaveData: 'invoice' },
  { name: 'Tasks', url: '/dashboard/tasks-v2', shouldHaveData: 'task' },
  { name: 'CRM', url: '/dashboard/crm-v2', shouldHaveData: 'client' },
  { name: 'Analytics', url: '/dashboard/analytics-v2', shouldHaveData: 'analytics' },
  { name: 'Time Tracking', url: '/dashboard/time-tracking-v2', shouldHaveData: 'time' },
  { name: 'Expenses', url: '/dashboard/expenses-v2', shouldHaveData: 'expense' },
  { name: 'Team', url: '/dashboard/team-v2', shouldHaveData: 'team' },
  { name: 'Calendar', url: '/dashboard/calendar-v2', shouldHaveData: 'calendar' },
  { name: 'Messages', url: '/dashboard/messages-v2', shouldHaveData: 'message' },
  { name: 'Files', url: '/dashboard/files-v2', shouldHaveData: 'file' },
]

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

let results = []

try {
  // Login first
  console.log('1️⃣  Logging in as alex@freeflow.io...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)

  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)

  console.log('✅ Logged in\n')

  // Test each page
  console.log('2️⃣  Testing pages...\n')

  for (const testPage of DEMO_PAGES) {
    try {
      console.log(`Testing: ${testPage.name}`)
      console.log(`   URL: ${testPage.url}`)

      await page.goto(`http://localhost:9323${testPage.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })
      await page.waitForTimeout(3000)

      const content = await page.content()

      // Check for common "no data" messages
      const isEmpty = content.includes('No projects yet') ||
                      content.includes('No clients yet') ||
                      content.includes('No data') ||
                      content.includes('no items') ||
                      content.includes('Get started')

      // Check if page loaded successfully
      const is404 = content.includes('404') || content.includes('Not Found')
      const hasError = content.includes('Error occurred') || content.includes('Something went wrong')

      // Check for expected data keywords
      const hasData = content.toLowerCase().includes(testPage.shouldHaveData.toLowerCase())

      let status = '✅'
      let message = 'Page loaded with data'

      if (is404) {
        status = '❌'
        message = '404 Not Found'
      } else if (hasError) {
        status = '⚠️'
        message = 'Page has errors'
      } else if (isEmpty) {
        status = '⚠️'
        message = 'Page empty - no data displayed'
      } else if (!hasData) {
        status = '⚠️'
        message = 'Page loaded but data unclear'
      }

      console.log(`   ${status} ${message}`)

      // Take screenshot
      const filename = `/tmp/demo-page-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`
      await page.screenshot({ path: filename, fullPage: false })
      console.log(`   📸 Screenshot: ${filename}\n`)

      results.push({
        name: testPage.name,
        url: testPage.url,
        status: status,
        message: message
      })

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
      results.push({
        name: testPage.name,
        url: testPage.url,
        status: '❌',
        message: error.message
      })
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')

  const passed = results.filter(r => r.status === '✅').length
  const warnings = results.filter(r => r.status === '⚠️').length
  const failed = results.filter(r => r.status === '❌').length

  console.log(`✅ Working: ${passed}/${results.length}`)
  console.log(`⚠️  Issues:  ${warnings}/${results.length}`)
  console.log(`❌ Failed:  ${failed}/${results.length}`)

  console.log('\n📋 Detailed Results:')
  results.forEach(r => {
    console.log(`${r.status} ${r.name.padEnd(20)} - ${r.message}`)
  })

  console.log('\n📸 Screenshots saved to /tmp/demo-page-*.png')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log('Browser will close in 10 seconds...\n')
  await page.waitForTimeout(10000)

} catch (error) {
  console.error('\n❌ Test error:', error.message)
} finally {
  await browser.close()
}
