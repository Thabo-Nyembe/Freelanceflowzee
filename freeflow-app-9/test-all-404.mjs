import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function test404() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const notFound = new Map()

  page.on('response', (response) => {
    if (response.status() === 404) {
      const url = response.url()
      if (!notFound.has(url)) {
        notFound.set(url, { url, pages: [] })
      }
      notFound.get(url).pages.push(page.url())
    }
  })

  const testPages = [
    '/dashboard',
    '/dashboard/analytics-v2',
    '/dashboard/crm-v2',
    '/dashboard/projects-v2',
    '/dashboard/clients-v2',
    '/dashboard/invoices-v2',
    '/dashboard/calendar-v2',
    '/dashboard/tasks-v2',
    '/dashboard/team-v2',
    '/dashboard/files-v2',
    '/dashboard/messages-v2',
    '/dashboard/settings-v2',
    '/dashboard/reports-v2',
    '/dashboard/ai-assistant-v2'
  ]

  for (const path of testPages) {
    try {
      await page.goto(`${BASE_URL}${path}?demo=true`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(2000)
    } catch {}
  }

  await browser.close()

  console.log('404 Resources:')
  if (notFound.size === 0) {
    console.log('  None!')
  } else {
    for (const [url, data] of notFound) {
      console.log(`  - ${url}`)
    }
  }
}

test404().catch(console.error)
