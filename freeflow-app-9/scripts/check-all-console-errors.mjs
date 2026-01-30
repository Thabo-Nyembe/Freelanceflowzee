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
  '/dashboard/settings-v2',
  '/dashboard/growth-hub-v2',
  '/dashboard/certifications-v2',
  '/dashboard/help-docs-v2',
  '/dashboard/collaboration-v2',
  '/dashboard/api-keys-v2',
  '/dashboard/assets-v2',
  '/dashboard/access-logs-v2',
  '/dashboard/crm-v2',
  '/dashboard/vulnerability-scan-v2',
  '/dashboard/add-ons-v2',
  '/dashboard/integrations-marketplace-v2',
  '/dashboard/marketplace-v2',
]

async function checkErrors() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const pageErrors = {}
  let currentPage = ''

  // Capture all console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Skip some known noise
      if (text.includes('favicon') || text.includes('DevTools')) return
      if (!pageErrors[currentPage]) pageErrors[currentPage] = []
      pageErrors[currentPage].push(text.substring(0, 300))
    }
  })

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', err => {
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push(`[PageError] ${err.message.substring(0, 300)}`)
  })

  // Capture failed requests
  page.on('requestfailed', request => {
    const url = request.url()
    // Skip external resources
    if (!url.includes('localhost')) return
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push(`[RequestFailed] ${url.substring(0, 150)} - ${request.failure()?.errorText || 'unknown'}`)
  })

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
      currentPage = pagePath
      console.log(`Checking ${pagePath}...`)
      try {
        await page.goto(`${BASE_URL}${pagePath}`, { timeout: 15000 })
        await page.waitForTimeout(3000)
      } catch (e) {
        console.log(`  ⚠️ Navigation error: ${e.message.substring(0, 50)}`)
      }
    }

    console.log('\n========================================')
    console.log('=== ALL CONSOLE ERRORS BY PAGE ===')
    console.log('========================================')

    let totalErrors = 0
    for (const [pagePath, errors] of Object.entries(pageErrors)) {
      if (errors.length > 0) {
        console.log(`\n📄 ${pagePath} (${errors.length} errors):`)
        const uniqueErrors = [...new Set(errors)]
        uniqueErrors.forEach(e => {
          totalErrors++
          console.log(`  ❌ ${e}`)
        })
      }
    }

    if (totalErrors === 0) {
      console.log('\n✅ No console errors found!')
    } else {
      console.log(`\n📊 Total unique errors: ${totalErrors}`)
    }

  } catch (e) {
    console.error('Test error:', e.message)
  }

  await browser.close()
}

checkErrors()
