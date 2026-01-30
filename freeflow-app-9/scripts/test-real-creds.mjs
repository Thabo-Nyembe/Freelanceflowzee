/**
 * Test with actual dev credentials
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
// From login page - development test credentials
const TEST_EMAIL = 'test@kazi.dev'
const TEST_PASSWORD = 'test12345'

async function test() {
  console.log('Testing with dev credentials...')
  console.log('Email:', TEST_EMAIL)
  console.log('Password:', TEST_PASSWORD)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    // Login
    console.log('\n1. Logging in...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)

    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.screenshot({ path: '/tmp/real-01-login.png' })

    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    await page.screenshot({ path: '/tmp/real-02-after-login.png' })
    console.log('URL:', page.url())

    // Dashboard
    console.log('\n2. Dashboard...')
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/real-03-dashboard.png' })
    console.log('Dashboard URL:', page.url())

    if (!page.url().includes('login')) {
      console.log('\n✅ LOGIN SUCCESSFUL!')

      // Test pages
      for (const p of ['clients', 'invoices', 'projects', 'tasks']) {
        await page.goto(`${BASE_URL}/dashboard/${p}`)
        await page.waitForTimeout(2000)
        await page.screenshot({ path: `/tmp/real-${p}.png` })
        console.log(`✓ ${p}`)
      }
    } else {
      console.log('\n❌ Login failed')
    }

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/real-error.png' })
  }

  await page.waitForTimeout(3000)
  await browser.close()
}

test()
