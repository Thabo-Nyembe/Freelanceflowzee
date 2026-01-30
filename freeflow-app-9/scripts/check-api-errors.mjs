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

  const apiErrors = {}

  // Capture failed API responses
  page.on('response', response => {
    const url = response.url()
    const status = response.status()

    // Only track API errors (not static assets)
    if (url.includes('/api/') && status >= 400) {
      const path = new URL(url).pathname
      if (!apiErrors[path]) {
        apiErrors[path] = { status, count: 0, pages: new Set() }
      }
      apiErrors[path].count++
      apiErrors[path].pages.add(page.url())
    }
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
      console.log(`Checking ${pagePath}...`)
      try {
        await page.goto(`${BASE_URL}${pagePath}`, { timeout: 15000, waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)
      } catch (e) {
        // Ignore navigation timeouts
      }
    }

    console.log('\n========================================')
    console.log('=== API ERRORS BY ENDPOINT ===')
    console.log('========================================\n')

    // Group by status code
    const byStatus = {}
    for (const [path, info] of Object.entries(apiErrors)) {
      if (!byStatus[info.status]) byStatus[info.status] = []
      byStatus[info.status].push({ path, count: info.count })
    }

    for (const status of Object.keys(byStatus).sort()) {
      console.log(`\n📛 Status ${status}:`)
      byStatus[status]
        .sort((a, b) => b.count - a.count)
        .forEach(({ path, count }) => {
          console.log(`   ${path} (${count}x)`)
        })
    }

    console.log('\n📊 Summary:')
    console.log(`   Total unique failing endpoints: ${Object.keys(apiErrors).length}`)

  } catch (e) {
    console.error('Test error:', e.message)
  }

  await browser.close()
}

checkErrors()
