/**
 * Dashboard Test - Full Signup with all fields
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const TEST_NAME = 'Test Investor'
const TEST_EMAIL = `investor-${Date.now()}@kazi.dev`
const TEST_PASSWORD = 'TestPassword123!'

async function testDashboards() {
  console.log('Starting browser...')
  console.log(`Test account: ${TEST_EMAIL}`)

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // 1. Go to signup page
    console.log('\n1. Going to Sign Up page...')
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // Fill ALL fields
    console.log('   Filling all signup fields...')

    // Name field (first input or specific name field)
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i], input[type="text"]').first()
    if (await nameField.count() > 0) {
      await nameField.fill(TEST_NAME)
      console.log('   ✓ Name filled')
    }

    // Email field
    const emailField = page.locator('input[type="email"], input[name="email"]').first()
    if (await emailField.count() > 0) {
      await emailField.fill(TEST_EMAIL)
      console.log('   ✓ Email filled')
    }

    // Password field
    const passwordFields = page.locator('input[type="password"]')
    const passwordCount = await passwordFields.count()

    if (passwordCount >= 1) {
      await passwordFields.nth(0).fill(TEST_PASSWORD)
      console.log('   ✓ Password filled')
    }

    if (passwordCount >= 2) {
      await passwordFields.nth(1).fill(TEST_PASSWORD)
      console.log('   ✓ Confirm password filled')
    }

    // Check terms checkbox if exists
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check()
      console.log('   ✓ Terms accepted')
    }

    await page.screenshot({ path: '/tmp/test-01-signup-filled.png', fullPage: true })

    // Submit form
    console.log('   Submitting...')
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Start")').first()
    await submitBtn.click()

    // Wait for response
    await page.waitForTimeout(5000)
    await page.screenshot({ path: '/tmp/test-02-after-signup.png', fullPage: true })

    const currentUrl = page.url()
    console.log(`   Current URL: ${currentUrl}`)

    // Check for errors on page
    const errorText = await page.locator('.error, [class*="error"], [role="alert"]').textContent().catch(() => null)
    if (errorText) {
      console.log(`   ⚠️ Error on page: ${errorText}`)
    }

    // 2. Navigate to dashboard
    console.log('\n2. Accessing Dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/test-03-dashboard.png', fullPage: true })

    const dashUrl = page.url()
    console.log(`   URL: ${dashUrl}`)

    if (dashUrl.includes('login') || dashUrl.includes('signup')) {
      console.log('   ❌ Not authenticated - redirected to login')

      // Try logging in instead
      console.log('\n   Trying to log in...')
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      const loginEmail = page.locator('input[type="email"]').first()
      const loginPass = page.locator('input[type="password"]').first()

      await loginEmail.fill(TEST_EMAIL)
      await loginPass.fill(TEST_PASSWORD)

      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(5000)
      await page.screenshot({ path: '/tmp/test-04-after-login.png', fullPage: true })

      // Try dashboard again
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/test-05-dashboard-retry.png', fullPage: true })
    }

    // Take screenshots of various pages
    const pages = [
      { name: 'clients', path: '/dashboard/clients' },
      { name: 'invoices', path: '/dashboard/invoices' },
      { name: 'projects', path: '/dashboard/projects' },
      { name: 'tasks', path: '/dashboard/tasks' },
    ]

    let pageNum = 6
    for (const p of pages) {
      console.log(`\n${pageNum}. Testing ${p.name}...`)
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: `/tmp/test-${String(pageNum).padStart(2, '0')}-${p.name}.png`, fullPage: true })
      console.log(`   Screenshot saved`)
      pageNum++
    }

    console.log('\n✅ All tests complete!')

  } catch (error) {
    console.error('Error:', error.message)
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true })
  }

  // Keep open briefly
  await page.waitForTimeout(10000)
  await browser.close()
}

testDashboards()
