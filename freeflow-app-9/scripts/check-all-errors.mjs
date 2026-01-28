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

async function checkErrors() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const pageErrors = {}
  const apiErrors = {}
  let currentPage = ''

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (text.includes('favicon') || text.includes('DevTools')) return
      if (!pageErrors[currentPage]) pageErrors[currentPage] = []
      const short = text.substring(0, 300)
      if (!pageErrors[currentPage].includes(short)) {
        pageErrors[currentPage].push(short)
      }
    }
  })

  page.on('response', res => {
    const status = res.status()
    const url = res.url()
    if (status >= 400 && !url.includes('favicon')) {
      if (!apiErrors[currentPage]) apiErrors[currentPage] = []
      const entry = status + ': ' + url.replace(BASE_URL, '').substring(0, 100)
      if (!apiErrors[currentPage].includes(entry)) {
        apiErrors[currentPage].push(entry)
      }
    }
  })

  page.on('pageerror', err => {
    if (!pageErrors[currentPage]) pageErrors[currentPage] = []
    pageErrors[currentPage].push('[PageError] ' + err.message.substring(0, 200))
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
      pageErrors[currentPage] = []
      apiErrors[currentPage] = []
      process.stdout.write('Checking ' + pagePath + '...')
      try {
        await page.goto(BASE_URL + pagePath, { timeout: 20000, waitUntil: 'networkidle' })
        await page.waitForTimeout(3000)
        console.log(' done')
      } catch (e) {
        console.log(' timeout')
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('CONSOLE ERRORS')
    console.log('='.repeat(60))

    let totalConsole = 0
    for (const [path, errors] of Object.entries(pageErrors)) {
      const unique = [...new Set(errors)].filter(e => e.trim())
      if (unique.length > 0) {
        console.log('\n' + path + ':')
        unique.forEach(e => { console.log('   X ' + e.substring(0, 150)); totalConsole++ })
      }
    }
    if (totalConsole === 0) console.log('\nNo console errors!')

    console.log('\n' + '='.repeat(60))
    console.log('API ERRORS (4xx/5xx)')
    console.log('='.repeat(60))

    let totalApi = 0
    for (const [path, errors] of Object.entries(apiErrors)) {
      const unique = [...new Set(errors)]
      if (unique.length > 0) {
        console.log('\n' + path + ':')
        unique.forEach(e => { console.log('   ! ' + e); totalApi++ })
      }
    }
    if (totalApi === 0) console.log('\nNo API errors!')

    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY: ' + totalConsole + ' console errors, ' + totalApi + ' API errors')
    console.log('='.repeat(60))
  } finally {
    await browser.close()
  }
}

checkErrors().catch(console.error)
