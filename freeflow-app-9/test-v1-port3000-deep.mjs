import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3000'

async function deepDive() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiErrors = []
  const consoleErrors = []
  const notFoundPages = []
  const slowPages = []
  const errorPages = []
  const workingPages = []

  page.on('response', async (response) => {
    const url = response.url()
    const status = response.status()

    if (url.includes('supabase') && status >= 400) {
      let body = ''
      try { body = await response.text() } catch {}
      apiErrors.push({
        table: url.split('/rest/v1/')[1]?.split('?')[0] || 'unknown',
        query: url.split('?')[1]?.substring(0, 80),
        status,
        body: body.substring(0, 150),
        page: page.url().replace(BASE_URL, '').split('?')[0]
      })
    }
  })

  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'error' &&
        !text.includes('favicon') &&
        !text.includes('Third-party') &&
        !text.includes('DevTools') &&
        !text.includes('hydrat') &&
        !text.includes('Permissions-Policy')) {
      consoleErrors.push({
        text: text.substring(0, 200),
        page: page.url().replace(BASE_URL, '').split('?')[0]
      })
    }
  })

  // V1 dashboard pages (from freeflow-app-9 copy)
  const routes = [
    'analytics', 'clients', 'invoices', 'calendar', 'tasks', 'files', 'files-hub',
    'messages', 'settings', 'ai-assistant', 'ai-create', 'ai-enhanced', 'booking',
    'bookings', 'canvas', 'client-zone', 'cloud-storage', 'collaboration', 'community',
    'community-hub', 'cv-portfolio', 'escrow', 'financial', 'financial-hub', 'gallery',
    'my-day', 'notifications', 'payments', 'portfolio', 'projects', 'projects-hub',
    'proposals', 'resources', 'scheduling', 'security', 'storage', 'team', 'templates',
    'time-tracking', 'video-studio', 'voice', 'ai-design', 'ai-image-generator',
    'ai-music-studio', 'ai-settings', 'ai-video-generation', 'ai-video-studio',
    'ai-voice-synthesis', 'crm', 'custom-reports', 'disputes', 'email-agent',
    'goals', 'jobs', 'marketplace', 'mobile-app', 'referrals', 'reporting',
    'workflow-builder', 'admin', 'admin-overview'
  ]

  console.log(`\n${'='.repeat(70)}`)
  console.log(`V1 DEEP DIVE - PORT 3000`)
  console.log(`Testing ${routes.length} pages`)
  console.log(`${'='.repeat(70)}\n`)

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const path = `/dashboard/${route}`
    const startTime = Date.now()
    process.stdout.write(`[${i+1}/${routes.length}] ${route.padEnd(25)}`)

    try {
      const response = await page.goto(`${BASE_URL}${path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 12000
      })

      const loadTime = Date.now() - startTime
      const status = response?.status()

      if (status === 404) {
        notFoundPages.push(route)
        console.log(`404`)
      } else if (status >= 500) {
        errorPages.push({ route, status })
        console.log(`${status}`)
      } else if (loadTime > 5000) {
        slowPages.push({ route, loadTime })
        console.log(`SLOW (${loadTime}ms)`)
      } else {
        workingPages.push({ route, loadTime })
        console.log(`OK (${loadTime}ms)`)
      }

      await page.waitForTimeout(1000)

    } catch (e) {
      if (e.message.includes('timeout')) {
        slowPages.push({ route, loadTime: 12000 })
        console.log(`TIMEOUT`)
      } else {
        errorPages.push({ route, error: e.message.substring(0, 40) })
        console.log(`ERROR`)
      }
    }
  }

  await browser.close()

  // Report
  console.log('\n' + '='.repeat(70))
  console.log('V1 DEEP DIVE REPORT')
  console.log('='.repeat(70))

  console.log(`\nWORKING: ${workingPages.length}/${routes.length}`)

  console.log(`\n404 NOT FOUND: ${notFoundPages.length}`)
  notFoundPages.forEach(p => console.log(`  /dashboard/${p}`))

  console.log(`\nSLOW/TIMEOUT: ${slowPages.length}`)
  slowPages.forEach(p => console.log(`  ${p.route} (${p.loadTime}ms)`))

  console.log(`\nERROR PAGES: ${errorPages.length}`)
  errorPages.forEach(p => console.log(`  ${p.route}: ${p.status || p.error}`))

  console.log(`\nAPI ERRORS: ${apiErrors.length}`)
  if (apiErrors.length > 0) {
    const byTable = {}
    apiErrors.forEach(e => {
      if (!byTable[e.table]) byTable[e.table] = { count: 0, status: e.status, body: e.body, pages: new Set() }
      byTable[e.table].count++
      byTable[e.table].pages.add(e.page)
    })
    Object.entries(byTable).sort((a,b) => b[1].count - a[1].count).forEach(([table, info]) => {
      console.log(`  [${info.status}] ${table} (${info.count}x)`)
      console.log(`    ${info.body}`)
    })
  }

  console.log(`\nCONSOLE ERRORS: ${consoleErrors.length}`)
  if (consoleErrors.length > 0) {
    const unique = [...new Map(consoleErrors.map(e => [e.text.substring(0, 40), e])).values()]
    unique.slice(0, 8).forEach(e => console.log(`  ${e.text.substring(0, 100)}`))
  }

  console.log('\n' + '='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))
  console.log(`Working:    ${workingPages.length}/${routes.length} (${(workingPages.length/routes.length*100).toFixed(0)}%)`)
  console.log(`404:        ${notFoundPages.length}`)
  console.log(`Slow:       ${slowPages.length}`)
  console.log(`Errors:     ${errorPages.length}`)
  console.log(`API Errors: ${apiErrors.length}`)
  console.log(`Console:    ${consoleErrors.length}`)
}

deepDive().catch(console.error)
