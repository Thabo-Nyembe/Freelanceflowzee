import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function testHydration() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const hydrationErrors = []

  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('hydrat') || text.includes('mismatch') || text.includes('server rendered')) {
      hydrationErrors.push({ text, url: page.url() })
    }
  })

  const testPages = [
    '/dashboard',
    '/dashboard/analytics-v2',
    '/dashboard/crm-v2',
    '/dashboard/clients-v2',
    '/dashboard/invoices-v2',
    '/dashboard/calendar-v2',
    '/dashboard/tasks-v2',
    '/dashboard/team-v2',
    '/dashboard/messages-v2',
    '/dashboard/settings-v2',
    '/dashboard/reports-v2',
    '/dashboard/ai-assistant-v2'
  ]

  for (const path of testPages) {
    try {
      await page.goto(`${BASE_URL}${path}?demo=true`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(1500)
      if (hydrationErrors.length > 0) {
        console.log(`\nHydration error on: ${path}`)
        console.log(`  ${hydrationErrors[hydrationErrors.length - 1].text.substring(0, 300)}`)
      }
    } catch {}
  }

  await browser.close()
  console.log(`\nTotal hydration warnings: ${hydrationErrors.length}`)
}

testHydration().catch(console.error)
