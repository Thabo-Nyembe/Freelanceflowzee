/**
 * Correct Dashboard Test - Using proper field selectors
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

    // Fill by field type/attribute
    console.log('Filling form by field type...')

    // Name - usually first text input or has name/placeholder
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    if (await nameInput.count() > 0) {
      await nameInput.fill('Demo Investor')
      console.log('✓ Name filled')
    }

    // Email - type="email"
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_EMAIL)
      console.log('✓ Email filled')
    }

    // Password fields - type="password"
    const passwordInputs = page.locator('input[type="password"]')
    const pwdCount = await passwordInputs.count()
    console.log(`Found ${pwdCount} password fields`)

    if (pwdCount >= 1) {
      await passwordInputs.nth(0).fill(TEST_PASSWORD)
      console.log('✓ Password filled')
    }
    if (pwdCount >= 2) {
      await passwordInputs.nth(1).fill(TEST_PASSWORD)
      console.log('✓ Confirm password filled')
    }

    await page.screenshot({ path: '/tmp/correct-01-filled.png' })

    // Handle terms checkbox - click the label or container
    try {
      const checkboxContainer = page.locator('[role="checkbox"], label:has(input[type="checkbox"]), .checkbox').first()
      if (await checkboxContainer.count() > 0) {
        await checkboxContainer.click({ force: true, timeout: 3000 })
        console.log('✓ Terms checkbox clicked')
      }
    } catch {
      console.log('No clickable checkbox found')
    }

    await page.screenshot({ path: '/tmp/correct-02-ready.png' })

    // Submit
    console.log('Submitting...')
    const submitBtn = page.locator('button[type="submit"]').first()
    await submitBtn.click()

    await page.waitForTimeout(5000)
    await page.screenshot({ path: '/tmp/correct-03-submitted.png' })

    const afterUrl = page.url()
    console.log('URL after submit:', afterUrl)

    // Check for success/error messages
    const pageContent = await page.content()
    if (pageContent.includes('check your email') || pageContent.includes('verification')) {
      console.log('📧 Email verification required')
    }
    if (pageContent.includes('error') || pageContent.includes('Error')) {
      const errorEl = page.locator('[class*="error"], [role="alert"]').first()
      if (await errorEl.count() > 0) {
        console.log('Error:', await errorEl.textContent())
      }
    }

    // Try to go to dashboard
    console.log('\nNavigating to dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 30000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/correct-04-dashboard.png' })

    const dashUrl = page.url()
    console.log('Dashboard URL:', dashUrl)

    if (!dashUrl.includes('login') && !dashUrl.includes('signup')) {
      console.log('✅ DASHBOARD LOADED!')

      // Test all pages
      const pages = ['clients', 'invoices', 'projects', 'tasks', 'calendar']
      for (const p of pages) {
        await page.goto(`${BASE_URL}/dashboard/${p}`, { timeout: 30000 })
        await page.waitForTimeout(2000)
        await page.screenshot({ path: `/tmp/correct-${p}.png` })
        console.log(`✓ ${p} page captured`)
      }
    } else {
      console.log('❌ Not authenticated - checking why...')
    }

    console.log('\n✅ Test complete!')

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: '/tmp/correct-error.png' })
  }

  await page.waitForTimeout(3000)
  await browser.close()
}

test()
