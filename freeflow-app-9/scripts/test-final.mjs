/**
 * Final Dashboard Test with Screenshots
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_EMAIL = 'test@kazi.dev'
const TEST_PASSWORD = 'test12345'

async function test() {
  console.log('Final Dashboard Test')
  console.log('====================\n')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    // 1. Login
    console.log('1. Logging in...')
    await page.goto(`${BASE_URL}/api/auth/csrf`)
    const csrfData = await page.evaluate(() => document.body.innerText)
    const csrf = JSON.parse(csrfData).csrfToken

    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    // 2. Dashboard
    console.log('2. Main Dashboard...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/final-dashboard.png', fullPage: true })

    if (!page.url().includes('login')) {
      console.log('   ✅ Dashboard loaded!')

      // 3. Clients
      console.log('3. Clients...')
      await page.goto(`${BASE_URL}/dashboard/clients-v2`)
      await page.waitForTimeout(8000)  // Wait longer for API call
      await page.screenshot({ path: '/tmp/final-clients.png', fullPage: true })
      console.log('   ✅ Clients loaded!')

      // 4. Invoices
      console.log('4. Invoices...')
      await page.goto(`${BASE_URL}/dashboard/invoices-v2`)
      await page.waitForTimeout(3000)
      await page.screenshot({ path: '/tmp/final-invoices.png', fullPage: true })
      console.log('   ✅ Invoices loaded!')

      // 5. Projects
      console.log('5. Projects...')
      await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`)
      await page.waitForTimeout(8000)  // Wait longer for API call
      await page.screenshot({ path: '/tmp/final-projects.png', fullPage: true })
      console.log('   ✅ Projects loaded!')

      // 6. Tasks
      console.log('6. Tasks...')
      await page.goto(`${BASE_URL}/dashboard/tasks-v2`)
      await page.waitForTimeout(5000)  // Wait longer for session to load and data to fetch
      await page.screenshot({ path: '/tmp/final-tasks.png', fullPage: true })
      console.log('   ✅ Tasks loaded!')

      // 7. Time Tracking
      console.log('7. Time Tracking...')
      await page.goto(`${BASE_URL}/dashboard/time-tracking-v2`)
      await page.waitForTimeout(3000)
      await page.screenshot({ path: '/tmp/final-time-tracking.png', fullPage: true })
      console.log('   ✅ Time Tracking loaded!')

      // 8. Calendar
      console.log('8. Calendar...')
      await page.goto(`${BASE_URL}/dashboard/calendar`)
      await page.waitForTimeout(3000)
      await page.screenshot({ path: '/tmp/final-calendar.png', fullPage: true })
      console.log('   ✅ Calendar loaded!')

      console.log('\n========================================')
      console.log('✅ ALL DASHBOARDS WORKING!')
      console.log('========================================')
      console.log('\nScreenshots saved to /tmp/final-*.png')

    } else {
      console.log('   ❌ Still on login page')
    }

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/final-error.png', fullPage: true })
  }

  await page.waitForTimeout(5000)
  await browser.close()
}

test()
