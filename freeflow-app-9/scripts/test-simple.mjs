/**
 * Simple Dashboard Test
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_EMAIL = `demo-${Date.now()}@kazi.dev`
const TEST_PASSWORD = 'DemoPass123!'

async function test() {
  console.log('Starting test...')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    // Go to signup
    await page.goto(`${BASE_URL}/signup`)
    await page.waitForTimeout(2000)

    // Fill form using keyboard
    console.log('Filling signup form...')

    // Tab through and fill fields
    await page.keyboard.press('Tab')
    await page.keyboard.type('Demo User')  // Name
    await page.keyboard.press('Tab')
    await page.keyboard.type(TEST_EMAIL)   // Email
    await page.keyboard.press('Tab')
    await page.keyboard.type(TEST_PASSWORD) // Password
    await page.keyboard.press('Tab')
    await page.keyboard.type(TEST_PASSWORD) // Confirm

    // Click terms checkbox label
    const termsLabel = page.locator('label:has-text("Terms"), label:has-text("agree"), text=Terms').first()
    if (await termsLabel.count() > 0) {
      await termsLabel.click({ force: true })
    }

    await page.screenshot({ path: '/tmp/simple-01-filled.png' })

    // Submit with Enter or button click
    await page.keyboard.press('Enter')
    await page.waitForTimeout(5000)

    await page.screenshot({ path: '/tmp/simple-02-submitted.png' })
    console.log('After submit URL:', page.url())

    // Go to dashboard
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/simple-03-dashboard.png' })
    console.log('Dashboard URL:', page.url())

    // If on login, the signup might need email confirmation
    if (page.url().includes('login')) {
      console.log('\n⚠️ Signup requires email confirmation or failed')
      console.log('Checking Supabase for the user...')
    }

    // Test other pages anyway
    await page.goto(`${BASE_URL}/dashboard/clients`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/simple-04-clients.png' })

    await page.goto(`${BASE_URL}/dashboard/invoices`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/simple-05-invoices.png' })

    console.log('\nScreenshots saved to /tmp/simple-*.png')

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/simple-error.png' })
  }

  await page.waitForTimeout(5000)
  await browser.close()
}

test()
