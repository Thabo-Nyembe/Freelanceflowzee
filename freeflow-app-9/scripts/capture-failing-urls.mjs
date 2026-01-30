import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

const PAGES_TO_CHECK = [
  '/dashboard',
  '/dashboard/clients-v2',
  '/dashboard/invoices-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/tasks-v2',
  '/dashboard/time-tracking-v2',
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

  const failingUrls = new Map()

  page.on('response', async response => {
    const status = response.status()
    if (status >= 400 && response.url().includes('localhost')) {
      const url = new URL(response.url())
      const key = `${status}:${url.pathname}`
      if (!failingUrls.has(key)) {
        failingUrls.set(key, {
          status,
          path: url.pathname,
          search: url.search,
          fullUrl: response.url()
        })
      }
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
      console.log(`Checking ${pagePath}...`)
      try {
        await page.goto(`${BASE_URL}${pagePath}`, { timeout: 15000 })
        await page.waitForTimeout(3000)
      } catch (e) {
        // Ignore
      }
    }

    console.log('\n========================================')
    console.log('=== FAILING API ENDPOINTS ===')
    console.log('========================================\n')

    // Group by status
    const grouped = {}
    for (const [key, info] of failingUrls) {
      if (!grouped[info.status]) grouped[info.status] = []
      grouped[info.status].push(info)
    }

    for (const status of Object.keys(grouped).sort()) {
      console.log(`\n🔴 Status ${status}:`)
      grouped[status].forEach(info => {
        console.log(`   ${info.path}${info.search ? info.search : ''}`)
      })
    }

  } catch (e) {
    console.error('Error:', e.message)
  }

  await browser.close()
}

checkErrors()
