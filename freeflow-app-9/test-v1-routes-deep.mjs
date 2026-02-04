import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function deepDive() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiErrors = []
  const consoleErrors = []
  const notFoundPages = []
  const slowPages = []
  const workingPages = []

  page.on('response', async (response) => {
    const url = response.url()
    const status = response.status()

    if (url.includes('supabase') && status >= 400) {
      let body = ''
      try { body = await response.text() } catch {}
      apiErrors.push({
        table: url.split('/rest/v1/')[1]?.split('?')[0] || 'unknown',
        query: url.split('?')[1]?.substring(0, 100),
        status,
        body: body.substring(0, 200),
        page: page.url().replace(BASE_URL, '').split('?')[0]
      })
    }
  })

  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error' && !text.includes('favicon') && !text.includes('Third-party') && !text.includes('DevTools') && !text.includes('hydrat')) {
      consoleErrors.push({
        text: text.substring(0, 250),
        page: page.url().replace(BASE_URL, '').split('?')[0]
      })
    }
  })

  // All v1 routes (non -v2)
  const v1Routes = [
    'a-plus-showcase', 'admin-overview', 'advanced-features-demo', 'advanced-micro-features',
    'ai-business-advisor', 'ai-code-builder', 'ai-code-completion', 'ai-content-studio',
    'ai-create', 'ai-enhanced', 'ai-image-generator', 'ai-music-studio', 'ai-settings',
    'ai-video-generation', 'ai-video-studio', 'ai-voice-synthesis', 'analytics-advanced',
    'ar-collaboration', 'audit-trail', 'bank-connections', 'booking', 'bookings',
    'browser-extension', 'business-intelligence', 'buyer', 'calendar', 'canvas-collaboration',
    'client', 'client-portal', 'client-zone', 'clients', 'collaboration', 'collaboration-demo',
    'coming-soon', 'community-hub', 'comprehensive-testing', 'crypto-payments', 'custom-reports',
    'cv-portfolio', 'disputes', 'email-agent', 'feature-testing', 'files', 'financial-hub',
    'freelancer', 'goals', 'invoices', 'jobs', 'marketplace', 'messages', 'micro-features-showcase',
    'ml-insights', 'my-day', 'notifications', 'orders', 'plugin-marketplace', 'project-templates',
    'projects', 'projects-hub', 'real-time-translation', 'recurring-invoices', 'resource-library',
    'seller', 'seller-dashboard', 'settings', 'shadcn-showcase', 'storage', 'tasks', 'team',
    'ui-showcase', 'upgrades-showcase', 'voice-collaboration', 'white-label', 'widgets'
  ]

  console.log(`Testing ${v1Routes.length} v1 routes...\n`)

  for (const route of v1Routes) {
    const path = `/dashboard/${route}`
    const startTime = Date.now()
    process.stdout.write(`${route}...`)

    try {
      const response = await page.goto(`${BASE_URL}${path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 12000
      })

      const loadTime = Date.now() - startTime
      const status = response?.status()

      if (status === 404) {
        notFoundPages.push(route)
        console.log(` 404`)
      } else if (loadTime > 5000) {
        slowPages.push({ route, loadTime })
        console.log(` slow (${loadTime}ms)`)
      } else {
        workingPages.push({ route, loadTime })
        console.log(` ok (${loadTime}ms)`)
      }

      await page.waitForTimeout(1000)

    } catch (e) {
      if (e.message.includes('timeout')) {
        slowPages.push({ route, loadTime: 12000 })
        console.log(` timeout`)
      } else {
        console.log(` error`)
      }
    }
  }

  await browser.close()

  // Report
  console.log('\n' + '='.repeat(70))
  console.log('V1 ROUTES DEEP DIVE REPORT')
  console.log('='.repeat(70))

  console.log(`\n--- WORKING PAGES: ${workingPages.length} ---`)

  console.log(`\n--- 404 PAGES: ${notFoundPages.length} ---`)
  notFoundPages.forEach(p => console.log(`  /dashboard/${p}`))

  console.log(`\n--- SLOW/TIMEOUT PAGES: ${slowPages.length} ---`)
  slowPages.forEach(p => console.log(`  /dashboard/${p.route} (${p.loadTime}ms)`))

  console.log(`\n--- API ERRORS: ${apiErrors.length} ---`)
  if (apiErrors.length > 0) {
    const byTable = {}
    apiErrors.forEach(e => {
      if (!byTable[e.table]) byTable[e.table] = []
      byTable[e.table].push(e)
    })
    for (const [table, errors] of Object.entries(byTable)) {
      console.log(`\n  Table: ${table} (${errors.length} errors)`)
      const sample = errors[0]
      console.log(`    Status: ${sample.status}`)
      console.log(`    Query: ${sample.query}`)
      console.log(`    Body: ${sample.body}`)
      console.log(`    Pages: ${[...new Set(errors.map(e => e.page))].join(', ')}`)
    }
  }

  console.log(`\n--- CONSOLE ERRORS: ${consoleErrors.length} ---`)
  if (consoleErrors.length > 0) {
    const unique = [...new Map(consoleErrors.map(e => [e.text.substring(0, 60), e])).values()]
    unique.slice(0, 15).forEach(e => {
      console.log(`\n  ${e.text}`)
      console.log(`  Page: ${e.page}`)
    })
  }

  console.log('\n' + '='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))
  console.log(`Working: ${workingPages.length}`)
  console.log(`404 Pages: ${notFoundPages.length}`)
  console.log(`Slow/Timeout: ${slowPages.length}`)
  console.log(`API Errors: ${apiErrors.length}`)
  console.log(`Console Errors: ${consoleErrors.length}`)
}

deepDive().catch(console.error)
