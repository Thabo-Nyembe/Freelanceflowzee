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
  '/dashboard/growth-hub-v2',
  '/dashboard/certifications-v2',
  '/dashboard/collaboration-v2',
  '/dashboard/api-keys-v2',
  '/dashboard/assets-v2',
  '/dashboard/crm-v2',
  '/dashboard/vulnerability-scan-v2',
  '/dashboard/marketplace-v2',
]

async function checkErrors() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const failingUrls = []
  let currentPage = ''

  page.on('response', async response => {
    const status = response.status()
    if (status >= 400 && response.url().includes('localhost')) {
      const url = new URL(response.url())
      // Skip static assets and RSC requests
      if (url.pathname.includes('_next') || url.pathname.includes('.svg') || url.pathname.includes('.jpg') || url.pathname.includes('.png')) return
      if (url.search.includes('_rsc')) return

      failingUrls.push({
        page: currentPage,
        status,
        path: url.pathname,
        search: url.search
      })
    }
  })

  try {
    console.log('Logging in...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', 'test@kazi.dev')
    await page.fill('input[type="password"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    for (const pagePath of PAGES_TO_CHECK) {
      currentPage = pagePath
      console.log(`Checking ${pagePath}...`)
      try {
        await page.goto(`${BASE_URL}${pagePath}`, { timeout: 20000, waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)
      } catch (e) {
        // Ignore timeouts
      }
    }

    console.log('\n========================================')
    console.log('=== DETAILED FAILING API CALLS ===')
    console.log('========================================\n')

    // Group by status and path
    const byStatus = {}
    for (const item of failingUrls) {
      const key = `${item.status}:${item.path}`
      if (!byStatus[key]) {
        byStatus[key] = { status: item.status, path: item.path, pages: new Set(), search: item.search }
      }
      byStatus[key].pages.add(item.page)
    }

    // Sort by status
    const entries = Object.values(byStatus).sort((a, b) => a.status - b.status)

    let currentStatus = null
    for (const item of entries) {
      if (item.status !== currentStatus) {
        currentStatus = item.status
        console.log(`\n🔴 Status ${currentStatus}:`)
      }
      console.log(`   ${item.path}${item.search || ''}`)
      console.log(`      Pages: ${[...item.pages].join(', ')}`)
    }

    console.log(`\n📊 Total unique failing endpoints: ${entries.length}`)

  } catch (e) {
    console.error('Error:', e.message)
  }

  await browser.close()
}

checkErrors()
