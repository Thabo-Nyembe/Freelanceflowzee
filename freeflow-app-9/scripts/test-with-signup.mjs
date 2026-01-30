/**
 * Dashboard Test with Fresh Signup
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_EMAIL = `test-${Date.now()}@kazi.dev`
const TEST_PASSWORD = 'TestPassword123!'

async function testDashboards() {
  console.log('Starting browser...')
  console.log(`Test account: ${TEST_EMAIL}`)

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // 1. Go to login page and sign up
    console.log('\n1. Going to Sign Up...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Look for sign up link
    const signUpLink = page.locator('text=Sign up')
    if (await signUpLink.count() > 0) {
      await signUpLink.first().click()
      await page.waitForTimeout(1000)
    }

    await page.screenshot({ path: '/tmp/test-01-signup.png', fullPage: true })

    // Fill signup form
    console.log('   Filling signup form...')

    // Try different possible field selectors
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    const passwordField = page.locator('input[type="password"], input[name="password"]').first()

    if (await emailField.count() > 0) {
      await emailField.fill(TEST_EMAIL)
    }
    if (await passwordField.count() > 0) {
      await passwordField.fill(TEST_PASSWORD)
    }

    // Check for confirm password field
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]')
    if (await confirmPassword.count() > 0) {
      await confirmPassword.fill(TEST_PASSWORD)
    }

    await page.screenshot({ path: '/tmp/test-02-filled.png', fullPage: true })

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first()
    if (await submitBtn.count() > 0) {
      await submitBtn.click()
    }

    console.log('   Waiting for redirect...')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: '/tmp/test-03-after-submit.png', fullPage: true })

    // Check current URL
    const currentUrl = page.url()
    console.log(`   Current URL: ${currentUrl}`)

    // 2. Try to access dashboard
    console.log('\n2. Accessing Dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/test-04-dashboard.png', fullPage: true })

    // Check if we're on dashboard or redirected to login
    const dashboardUrl = page.url()
    console.log(`   Dashboard URL: ${dashboardUrl}`)

    if (dashboardUrl.includes('login')) {
      console.log('   ⚠️ Redirected to login - auth not working')
    } else {
      console.log('   ✅ Dashboard loaded!')

      // 3. Test Clients
      console.log('\n3. Testing Clients...')
      await page.goto(`${BASE_URL}/dashboard/clients`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/test-05-clients.png', fullPage: true })

      // 4. Test Invoices
      console.log('\n4. Testing Invoices...')
      await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/test-06-invoices.png', fullPage: true })

      // 5. Test Projects
      console.log('\n5. Testing Projects...')
      await page.goto(`${BASE_URL}/dashboard/projects`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/test-07-projects.png', fullPage: true })

      // 6. Test Tasks
      console.log('\n6. Testing Tasks...')
      await page.goto(`${BASE_URL}/dashboard/tasks`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/test-08-tasks.png', fullPage: true })
    }

    console.log('\n✅ Test complete! Screenshots saved to /tmp/')

  } catch (error) {
    console.error('Error:', error.message)
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true })
  }

  // Keep browser open for manual inspection
  console.log('\nBrowser left open for manual inspection. Press Ctrl+C to close.')
  await page.waitForTimeout(60000)

  await browser.close()
}

testDashboards()
