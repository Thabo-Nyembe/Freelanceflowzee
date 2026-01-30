/**
 * Basic Dashboard Test
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_EMAIL = `demo-${Date.now()}@kazi.dev`
const TEST_PASSWORD = 'DemoPass123!'

async function test() {
  console.log('Starting test...')
  console.log('Email:', TEST_EMAIL)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    // Go to signup
    await page.goto(`${BASE_URL}/signup`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/basic-01-signup-page.png' })

    // Fill using input selectors
    console.log('Filling form...')

    const inputs = await page.locator('input').all()
    console.log(`Found ${inputs.length} input fields`)

    // Fill inputs in order: name, email, password, confirm
    if (inputs.length >= 4) {
      await inputs[0].fill('Demo User')
      await inputs[1].fill(TEST_EMAIL)
      await inputs[2].fill(TEST_PASSWORD)
      await inputs[3].fill(TEST_PASSWORD)
    }

    await page.screenshot({ path: '/tmp/basic-02-filled.png' })

    // Try to click terms if there's a checkbox area
    try {
      await page.locator('button:has-text("Terms")').click({ timeout: 2000 })
    } catch {
      // Try clicking any checkbox-related element
      try {
        await page.locator('[role="checkbox"]').first().click({ timeout: 2000 })
      } catch {
        console.log('No checkbox found or not needed')
      }
    }

    // Click submit button
    console.log('Submitting...')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(5000)

    await page.screenshot({ path: '/tmp/basic-03-after-submit.png' })
    console.log('URL after submit:', page.url())

    // Navigate to dashboard
    console.log('\nGoing to dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 30000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/basic-04-dashboard.png' })
    console.log('Dashboard URL:', page.url())

    // Clients page
    await page.goto(`${BASE_URL}/dashboard/clients`, { timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/basic-05-clients.png' })

    // Invoices
    await page.goto(`${BASE_URL}/dashboard/invoices`, { timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/basic-06-invoices.png' })

    // Projects
    await page.goto(`${BASE_URL}/dashboard/projects`, { timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/basic-07-projects.png' })

    // Tasks
    await page.goto(`${BASE_URL}/dashboard/tasks`, { timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/basic-08-tasks.png' })

    console.log('\n✅ Test complete! Screenshots in /tmp/basic-*.png')

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/basic-error.png' })
  }

  await page.waitForTimeout(3000)
  await browser.close()
}

test()
