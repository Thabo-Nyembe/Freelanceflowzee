import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
// Test credentials from the investor demo
const TEST_EMAIL = 'investor@demo.kazi.co'
const TEST_PASSWORD = 'Investor123!'

async function testErrors() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiErrors = []
  const consoleErrors = []

  // Capture API errors
  page.on('response', async (response) => {
    if (response.url().includes('supabase') && response.status() >= 400) {
      const url = response.url()
      const status = response.status()
      let body = ''
      try { body = await response.text() } catch {}
      apiErrors.push({ url: url.split('?')[0], query: url.split('?')[1]?.substring(0, 100), status, body: body.substring(0, 200), page: page.url() })
    }
  })

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('React') && !text.includes('Third-party')) {
        consoleErrors.push({ text: text.substring(0, 200), page: page.url() })
      }
    }
  })

  // Login first
  console.log('Logging in...')
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    console.log('Current URL:', page.url())
  } catch (e) {
    console.log('Login failed:', e.message)
  }

  // Test specific pages that had errors
  const testPages = [
    '/dashboard',
    '/dashboard/crm-v2'
  ]

  for (const path of testPages) {
    console.log(`\nTesting: ${path}`)
    try {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(5000)
    } catch (e) {
      console.log(`  Error loading: ${e.message}`)
    }
  }

  await browser.close()

  console.log('\n=== API ERRORS ===')
  if (apiErrors.length === 0) {
    console.log('No API errors!')
  } else {
    const unique = [...new Map(apiErrors.map(e => [e.query, e])).values()]
    for (const err of unique) {
      console.log(`\n${err.status}: ${err.url}`)
      console.log(`  Query: ${err.query}`)
      console.log(`  Body: ${err.body}`)
    }
  }

  console.log('\n=== CONSOLE ERRORS ===')
  if (consoleErrors.length === 0) {
    console.log('No console errors!')
  } else {
    const unique = [...new Map(consoleErrors.map(e => [e.text.substring(0, 50), e])).values()]
    unique.slice(0, 10).forEach(e => console.log(`- ${e.text}`))
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`API Errors: ${apiErrors.length}`)
  console.log(`Console Errors: ${consoleErrors.length}`)
}

testErrors().catch(console.error)
