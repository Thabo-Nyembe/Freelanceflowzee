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
  '/dashboard/messages-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/team-hub-v2',
  '/dashboard/sprints-v2',
  '/dashboard/milestones-v2',
  '/dashboard/customers-v2',
]

async function deepDiveErrors() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const allErrors = {}
  let currentPage = ''

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (text.includes('favicon') || text.includes('DevTools')) return
      if (!allErrors[currentPage]) allErrors[currentPage] = { console: [], api: [], hydration: [], other: [] }

      if (text.includes('hydrat') || text.includes('SSR')) {
        allErrors[currentPage].hydration.push(text.substring(0, 500))
      } else if (text.includes('Failed to load resource') || text.includes('status of')) {
        allErrors[currentPage].api.push(text.substring(0, 500))
      } else {
        allErrors[currentPage].console.push(text.substring(0, 500))
      }
    }
  })

  page.on('response', async res => {
    const status = res.status()
    const url = res.url()
    if (status >= 400 && !url.includes('favicon')) {
      if (!allErrors[currentPage]) allErrors[currentPage] = { console: [], api: [], hydration: [], other: [] }

      let body = ''
      try {
        body = await res.text()
        const json = JSON.parse(body)
        body = JSON.stringify(json)
      } catch (e) {
        body = body.substring(0, 200)
      }

      const shortUrl = url.replace(BASE_URL, '').replace('https://gcinvwprtlnwuwuvmrux.supabase.co/rest/v1/', '')
      allErrors[currentPage].api.push({
        status,
        table: shortUrl.split('?')[0],
        body: body.substring(0, 300)
      })
    }
  })

  page.on('pageerror', err => {
    if (!allErrors[currentPage]) allErrors[currentPage] = { console: [], api: [], hydration: [], other: [] }
    allErrors[currentPage].other.push('[PageError] ' + err.message.substring(0, 300))
  })

  try {
    console.log('Logging in...')
    await page.goto(BASE_URL + '/login', { timeout: 30000 })
    await page.waitForTimeout(2000)

    try {
      await page.fill('input[type="email"]', 'test@kazi.dev')
      await page.fill('input[type="password"]', 'test12345')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(5000)
      console.log('Logged in!\n')
    } catch (e) {
      console.log('Login form not found\n')
    }

    for (const pagePath of PAGES_TO_CHECK) {
      currentPage = pagePath
      allErrors[currentPage] = { console: [], api: [], hydration: [], other: [] }

      process.stdout.write('Checking ' + pagePath + '...')
      const startTime = Date.now()

      try {
        await page.goto(BASE_URL + pagePath, { timeout: 25000, waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)
        const loadTime = Date.now() - startTime
        console.log(' ' + loadTime + 'ms')

        if (loadTime > 15000) {
          allErrors[currentPage].other.push('[SLOW] Page took ' + loadTime + 'ms to load')
        }
      } catch (e) {
        const loadTime = Date.now() - startTime
        console.log(' TIMEOUT (' + loadTime + 'ms)')
        allErrors[currentPage].other.push('[TIMEOUT] Page failed to load in 25s')
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('DETAILED ERROR ANALYSIS')
    console.log('='.repeat(70))

    // Group API errors by table
    const tableErrors = {}
    for (const [path, errors] of Object.entries(allErrors)) {
      for (const err of errors.api) {
        if (typeof err === 'object' && err.table) {
          if (!tableErrors[err.table]) tableErrors[err.table] = []
          tableErrors[err.table].push({ path, status: err.status, body: err.body })
        }
      }
    }

    console.log('\n--- API ERRORS BY TABLE ---')
    for (const [table, errs] of Object.entries(tableErrors)) {
      const uniqueStatuses = [...new Set(errs.map(e => e.status))]
      console.log('\n' + table + ' (' + uniqueStatuses.join(', ') + '):')
      const sample = errs[0]
      if (sample.body && sample.body !== '[]') {
        try {
          const parsed = JSON.parse(sample.body)
          if (parsed.message) console.log('  Error: ' + parsed.message)
          if (parsed.hint) console.log('  Hint: ' + parsed.hint)
        } catch (e) {
          console.log('  ' + sample.body.substring(0, 100))
        }
      }
      console.log('  Pages: ' + errs.map(e => e.path.replace('/dashboard/', '')).join(', '))
    }

    // Hydration warnings
    const hydrationPages = []
    for (const [path, errors] of Object.entries(allErrors)) {
      if (errors.hydration.length > 0) hydrationPages.push(path)
    }
    if (hydrationPages.length > 0) {
      console.log('\n--- HYDRATION WARNINGS ---')
      console.log('Pages with SSR mismatch: ' + hydrationPages.length)
      hydrationPages.forEach(p => console.log('  - ' + p))
    }

    // Timeouts
    const timeoutPages = []
    for (const [path, errors] of Object.entries(allErrors)) {
      if (errors.other.some(e => e.includes('TIMEOUT'))) timeoutPages.push(path)
    }
    if (timeoutPages.length > 0) {
      console.log('\n--- TIMEOUT PAGES ---')
      timeoutPages.forEach(p => console.log('  - ' + p))
    }

    console.log('\n' + '='.repeat(70))

  } finally {
    await browser.close()
  }
}

deepDiveErrors().catch(console.error)
