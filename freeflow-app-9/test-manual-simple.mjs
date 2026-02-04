#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🔍 Simple Manual Test - Opening Browser\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 500
})

const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 }
})

try {
  console.log('Step 1: Going to login page...')
  await page.goto('http://localhost:9323/login')
  await page.waitForTimeout(3000)

  console.log('Step 2: Filling credentials...')
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await page.waitForTimeout(1000)

  console.log('Step 3: Clicking login...')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(10000)

  const url1 = page.url()
  console.log(`After login: ${url1}\n`)

  // Try to go to dashboard
  console.log('Step 4: Navigating to /dashboard...')
  await page.goto('http://localhost:9323/dashboard')
  await page.waitForTimeout(5000)

  const url2 = page.url()
  console.log(`After /dashboard navigation: ${url2}`)

  const title = await page.title()
  console.log(`Page title: ${title}\n`)

  // Check if we're on login page
  if (url2.includes('/login')) {
    console.log('⚠️  REDIRECTED TO LOGIN - Session not persisting!\n')
  } else {
    console.log('✅ Stayed on dashboard page\n')
  }

  // Try clients page
  console.log('Step 5: Navigating to /dashboard/clients-v2...')
  await page.goto('http://localhost:9323/dashboard/clients-v2')
  await page.waitForTimeout(5000)

  const url3 = page.url()
  console.log(`After clients navigation: ${url3}`)

  if (url3.includes('/login')) {
    console.log('⚠️  REDIRECTED TO LOGIN\n')
  } else {
    console.log('✅ On clients page\n')

    // Check for data
    const text = await page.textContent('body')
    if (text.includes('Acme') || text.includes('TechStart') || text.includes('client')) {
      console.log('✅ Data visible on page!')
    } else {
      console.log('⚠️  No data visible')
    }
  }

  // Take screenshots
  await page.screenshot({ path: '/tmp/test-after-login.png' })
  console.log('\n📸 Screenshot saved: /tmp/test-after-login.png')

  console.log('\n═════════════════════════════════════════')
  console.log('Browser will stay open for 5 MINUTES')
  console.log('Please manually check:')
  console.log('  - Can you see data?')
  console.log('  - Can you navigate between pages?')
  console.log('  - Does authentication persist?')
  console.log('═════════════════════════════════════════\n')

  await page.waitForTimeout(300000) // 5 minutes

} catch (error) {
  console.error('Error:', error.message)
  await page.waitForTimeout(60000) // 1 minute on error
} finally {
  await browser.close()
}
