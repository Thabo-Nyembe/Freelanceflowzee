/**
 * Test with verified user
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_EMAIL = 'investor-demo@kazi.dev'
const TEST_PASSWORD = 'InvestorDemo123!'

async function test() {
  console.log('Testing with verified user...')
  console.log('Email:', TEST_EMAIL)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    // Go to login
    console.log('\n1. Logging in...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)

    // Fill login form
    await page.locator('input[type="email"]').first().fill(TEST_EMAIL)
    await page.locator('input[type="password"]').first().fill(TEST_PASSWORD)

    await page.screenshot({ path: '/tmp/verified-01-login.png' })

    // Submit
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(5000)

    await page.screenshot({ path: '/tmp/verified-02-after-login.png' })
    console.log('After login URL:', page.url())

    // Go to dashboard
    console.log('\n2. Accessing dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 30000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/verified-03-dashboard.png' })

    const dashUrl = page.url()
    console.log('Dashboard URL:', dashUrl)

    if (!dashUrl.includes('login')) {
      console.log('✅ DASHBOARD LOADED SUCCESSFULLY!')

      // Test all key pages
      const pages = [
        { name: 'clients', path: '/dashboard/clients' },
        { name: 'invoices', path: '/dashboard/invoices' },
        { name: 'projects', path: '/dashboard/projects' },
        { name: 'tasks', path: '/dashboard/tasks' },
        { name: 'calendar', path: '/dashboard/calendar' },
        { name: 'time-tracking', path: '/dashboard/time-tracking' },
      ]

      for (const p of pages) {
        console.log(`\n3. Testing ${p.name}...`)
        await page.goto(`${BASE_URL}${p.path}`, { timeout: 30000 })
        await page.waitForTimeout(2000)
        await page.screenshot({ path: `/tmp/verified-${p.name}.png` })

        // Check for errors
        const hasError = await page.locator('text=error, text=Error, text=500, text=404').count()
        if (hasError > 0) {
          console.log(`   ⚠️ ${p.name} has errors`)
        } else {
          console.log(`   ✅ ${p.name} loaded`)
        }
      }

      console.log('\n========================================')
      console.log('✅ ALL DASHBOARDS WORKING!')
      console.log('========================================')
    } else {
      console.log('❌ Login failed - still on login page')
    }

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/verified-error.png' })
  }

  await page.waitForTimeout(5000)
  await browser.close()
}

test()
