/**
 * Dashboard Screenshot Test
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function testDashboards() {
  console.log('Starting browser...')

  const browser = await chromium.launch({
    headless: false,  // Show browser
    slowMo: 500
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // 1. Go to login page
    console.log('\n1. Testing Login Page...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: '/tmp/test-01-login.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-01-login.png')

    // Check if we need to log in
    const loginForm = await page.locator('input[type="email"]').count()

    if (loginForm > 0) {
      console.log('   Logging in...')
      await page.fill('input[type="email"]', 'test@kazi.dev')
      await page.fill('input[type="password"]', 'Test123!')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(3000)
    }

    // 2. Dashboard
    console.log('\n2. Testing Main Dashboard...')
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/test-02-dashboard.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-02-dashboard.png')

    // 3. Clients
    console.log('\n3. Testing Clients Page...')
    await page.goto(`${BASE_URL}/dashboard/clients`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/test-03-clients.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-03-clients.png')

    // 4. Invoices
    console.log('\n4. Testing Invoices Page...')
    await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/test-04-invoices.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-04-invoices.png')

    // 5. Projects
    console.log('\n5. Testing Projects Page...')
    await page.goto(`${BASE_URL}/dashboard/projects`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/test-05-projects.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-05-projects.png')

    // 6. Tasks
    console.log('\n6. Testing Tasks Page...')
    await page.goto(`${BASE_URL}/dashboard/tasks`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/test-06-tasks.png', fullPage: true })
    console.log('   Screenshot: /tmp/test-06-tasks.png')

    console.log('\n✅ All screenshots captured!')
    console.log('\nView screenshots:')
    console.log('  open /tmp/test-*.png')

  } catch (error) {
    console.error('Error:', error.message)
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true })
    console.log('Error screenshot: /tmp/test-error.png')
  } finally {
    await browser.close()
  }
}

testDashboards()
