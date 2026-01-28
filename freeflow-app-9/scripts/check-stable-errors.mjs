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
  const context = await browser.newContext()

  // Set demo mode cookie
  await context.addCookies([{
    name: 'demo_mode',
    value: 'true',
    domain: 'localhost',
    path: '/'
  }])

  const page = await context.newPage()

  const pageErrors = {}
  let currentPage = ''

  // Capture console errors after page is stable
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Skip navigation-related errors
      if (text.includes('ERR_ABORTED') || text.includes('favicon')) return
      if (!pageErrors[currentPage]) pageErrors[currentPage] = []
      pageErrors[currentPage].push(text.substring(0, 200))
    }
  })

  page.on('pageerror', err => {
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push(`[PageError] ${err.message.substring(0, 200)}`)
  })

  try {
    // Demo mode - no login needed
    console.log('Starting demo mode test...')

    // Visit each page with longer waits
    for (const pagePath of PAGES_TO_CHECK) {
      currentPage = pagePath
      pageErrors[currentPage] = [] // Reset for this page
      console.log(`Checking ${pagePath}...`)
      try {
        await page.goto(`${BASE_URL}${pagePath}?demo=true`, { timeout: 20000, waitUntil: 'networkidle' })
        // Wait for any delayed errors
        await page.waitForTimeout(3000)
      } catch (e) {
        console.log(`  ⚠️ Timeout on ${pagePath}`)
      }
    }

    console.log('\n========================================')
    console.log('=== STABLE PAGE ERRORS ===')
    console.log('========================================')

    let totalErrors = 0
    for (const [pagePath, errors] of Object.entries(pageErrors)) {
      const uniqueErrors = [...new Set(errors)].filter(e => e.trim())
      if (uniqueErrors.length > 0) {
        console.log(`\n📄 ${pagePath}:`)
        uniqueErrors.forEach(e => {
          totalErrors++
          console.log(`  ❌ ${e}`)
        })
      }
    }

    if (totalErrors === 0) {
      console.log('\n✅ No console errors found on stable pages!')
    } else {
      console.log(`\n📊 Total: ${totalErrors} errors`)
    }

  } catch (e) {
    console.error('Test error:', e.message)
  }

  await browser.close()
}

checkErrors()
