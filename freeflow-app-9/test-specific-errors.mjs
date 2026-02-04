import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

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
      apiErrors.push({ url: url.split('?')[0], query: url.split('?')[1], status, body })
    }
  })

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // Test specific pages that had errors
  const testPages = [
    '/dashboard',
    '/dashboard/crm-v2'
  ]

  for (const path of testPages) {
    console.log(`\nTesting: ${path}`)
    try {
      await page.goto(`${BASE_URL}${path}?demo=true`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(3000)
    } catch (e) {
      console.log(`  Error loading: ${e.message}`)
    }
  }

  await browser.close()

  console.log('\n=== API ERRORS ===')
  if (apiErrors.length === 0) {
    console.log('No API errors!')
  } else {
    for (const err of apiErrors) {
      console.log(`\n${err.status}: ${err.url}`)
      console.log(`  Query: ${err.query}`)
      console.log(`  Body: ${err.body.substring(0, 200)}`)
    }
  }

  console.log('\n=== CONSOLE ERRORS ===')
  if (consoleErrors.length === 0) {
    console.log('No console errors!')
  } else {
    consoleErrors.slice(0, 10).forEach(e => console.log(`- ${e.substring(0, 200)}`))
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`API Errors: ${apiErrors.length}`)
  console.log(`Console Errors: ${consoleErrors.length}`)
}

testErrors().catch(console.error)
