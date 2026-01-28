import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

// All main dashboard pages to test in demo mode
const PAGES_TO_CHECK = [
  '/dashboard?demo=true',
  '/dashboard/clients-v2?demo=true',
  '/dashboard/projects-hub-v2?demo=true',
  '/dashboard/invoices-v2?demo=true',
  '/dashboard/tasks-v2?demo=true',
  '/dashboard/time-tracking-v2?demo=true',
  '/dashboard/analytics-v2?demo=true',
  '/dashboard/team-v2?demo=true',
  '/dashboard/escrow-v2?demo=true',
  '/dashboard/tax-intelligence-v2?demo=true',
  '/dashboard/gallery-v2?demo=true',
  '/dashboard/cv-portfolio?demo=true',
  '/dashboard/contracts-v2?demo=true',
  '/dashboard/cloud-storage-v2?demo=true',
  '/dashboard/api-keys-v2?demo=true',
  '/dashboard/calendar?demo=true',
  '/dashboard/lead-generation-v2?demo=true',
  '/dashboard/messages-v2?demo=true',
  '/dashboard/notifications-v2?demo=true',
  '/dashboard/expenses-v2?demo=true',
  '/dashboard/payroll-v2?demo=true',
  '/dashboard/maintenance-v2?demo=true',
  '/dashboard/compliance-v2?demo=true',
  '/dashboard/community-v2?demo=true',
  '/dashboard/announcements-v2?demo=true',
  '/dashboard/workflows-v2?demo=true',
  '/dashboard/milestones-v2?demo=true',
  '/dashboard/sprints-v2?demo=true',
]

async function checkDemoMode() {
  console.log('🚀 Starting Demo Mode Console Error Check\n')
  console.log('=' .repeat(60))

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
  const pageStatus = {}
  let currentPage = ''

  // Capture all console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Skip known noise
      if (text.includes('favicon') ||
          text.includes('DevTools') ||
          text.includes('third-party cookie') ||
          text.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT') ||
          text.includes('ResizeObserver loop')) return
      if (!pageErrors[currentPage]) pageErrors[currentPage] = []
      pageErrors[currentPage].push(text.substring(0, 400))
    }
  })

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', err => {
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push(`[PageError] ${err.message.substring(0, 400)}`)
  })

  // Capture failed API requests
  page.on('requestfailed', request => {
    const url = request.url()
    // Skip external resources and images
    if (!url.includes('localhost') || url.includes('.png') || url.includes('.jpg') || url.includes('.ico')) return
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push(`[RequestFailed] ${url.replace(BASE_URL, '')} - ${request.failure()?.errorText || 'unknown'}`)
  })

  try {
    for (const pagePath of PAGES_TO_CHECK) {
      currentPage = pagePath
      const shortPath = pagePath.split('?')[0]
      process.stdout.write(`Checking ${shortPath.padEnd(45)}`)

      try {
        const response = await page.goto(`${BASE_URL}${pagePath}`, {
          timeout: 30000,
          waitUntil: 'domcontentloaded'
        })

        pageStatus[pagePath] = response?.status() || 0

        // Wait for page to load and any async errors
        await page.waitForTimeout(2000)

        const errorCount = pageErrors[pagePath]?.length || 0
        const status = response?.status() || 0

        if (status >= 400) {
          console.log(`❌ ${status}`)
        } else if (errorCount > 0) {
          console.log(`⚠️  ${errorCount} error(s)`)
        } else {
          console.log(`✅ OK`)
        }

      } catch (e) {
        pageStatus[pagePath] = 'timeout'
        console.log(`⏱️  Timeout`)
        if (!pageErrors[currentPage]) pageErrors[currentPage] = []
        pageErrors[currentPage].push(`[Timeout] ${e.message.substring(0, 100)}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 DETAILED ERROR REPORT')
    console.log('='.repeat(60))

    let totalErrors = 0
    let pagesWithErrors = 0

    for (const [pagePath, errors] of Object.entries(pageErrors)) {
      if (errors && errors.length > 0) {
        pagesWithErrors++
        const shortPath = pagePath.split('?')[0]
        console.log(`\n📄 ${shortPath}`)
        const uniqueErrors = [...new Set(errors)]
        uniqueErrors.forEach(e => {
          totalErrors++
          console.log(`   ❌ ${e}`)
        })
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📈 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total pages checked: ${PAGES_TO_CHECK.length}`)
    console.log(`Pages with errors: ${pagesWithErrors}`)
    console.log(`Total unique errors: ${totalErrors}`)

    if (totalErrors === 0) {
      console.log('\n✅ All pages passed with no console errors!')
    } else {
      console.log(`\n⚠️  ${pagesWithErrors} pages have console errors that need fixing`)
    }

  } catch (e) {
    console.error('\n❌ Test runner error:', e.message)
  }

  await browser.close()
}

checkDemoMode().catch(console.error)
