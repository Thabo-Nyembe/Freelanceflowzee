import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

const PAGES_TO_CHECK = [
  '/dashboard',
  '/dashboard/clients-v2',
  '/dashboard/invoices-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/tasks-v2',
  '/dashboard/time-tracking-v2',
  '/dashboard/calendar',
  '/dashboard/analytics-v2',
  '/dashboard/team-v2',
  '/dashboard/settings-v2'
]

async function checkErrors() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const allErrors = []
  const allWarnings = []

  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error') allErrors.push({ page: page.url(), error: text })
    if (msg.type() === 'warning' && !text.includes('DevTools')) allWarnings.push({ page: page.url(), warning: text })
  })

  page.on('pageerror', err => allErrors.push({ page: page.url(), error: err.message }))

  try {
    // Login
    console.log('Logging in...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', 'test@kazi.dev')
    await page.fill('input[type="password"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    // Visit each page
    for (const pagePath of PAGES_TO_CHECK) {
      console.log(`Checking ${pagePath}...`)
      await page.goto(`${BASE_URL}${pagePath}`)
      await page.waitForTimeout(3000)
    }

    console.log('\n========================================')
    console.log('=== CONSOLE ERRORS ===')
    console.log(`Total errors: ${allErrors.length}`)
    console.log('========================================')

    // Group errors by type
    const uniqueErrors = [...new Set(allErrors.map(e => e.error.substring(0, 150)))]
    uniqueErrors.forEach((e, i) => {
      console.log(`\n${i+1}. ${e}`)
    })

    console.log('\n========================================')
    console.log('=== CONSOLE WARNINGS (first 15) ===')
    console.log(`Total warnings: ${allWarnings.length}`)
    console.log('========================================')

    const uniqueWarnings = [...new Set(allWarnings.map(w => w.warning.substring(0, 150)))]
    uniqueWarnings.slice(0, 15).forEach((w, i) => {
      console.log(`\n${i+1}. ${w}`)
    })

  } catch (e) {
    console.error('Test error:', e.message)
  }

  await browser.close()
}

checkErrors()
