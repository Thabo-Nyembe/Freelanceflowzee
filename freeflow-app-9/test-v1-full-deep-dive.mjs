import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const BASE_URL = 'http://localhost:9323'

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

  // Read v1 routes from file
  const routes = readFileSync('/tmp/v1-routes.txt', 'utf8').trim().split('\n').filter(r => r.length > 0)

  console.log(`\n${'='.repeat(70)}`)
  console.log(`TESTING ${routes.length} V1 DASHBOARD PAGES`)
  console.log(`${'='.repeat(70)}\n`)

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const path = `/v1/dashboard/${route}`
    const startTime = Date.now()
    process.stdout.write(`[${i+1}/${routes.length}] ${route.padEnd(30)}`)

    try {
      const response = await page.goto(`${BASE_URL}${path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })

      const loadTime = Date.now() - startTime
      const status = response?.status()

      if (status === 404) {
        notFoundPages.push(route)
        console.log(`404`)
      } else if (status >= 500) {
        errorPages.push({ route, status })
        console.log(`${status} ERROR`)
      } else if (loadTime > 4000) {
        slowPages.push({ route, loadTime })
        console.log(`SLOW (${loadTime}ms)`)
      } else {
        workingPages.push({ route, loadTime })
        console.log(`OK (${loadTime}ms)`)
      }

      await page.waitForTimeout(800)

    } catch (e) {
      if (e.message.includes('timeout')) {
        slowPages.push({ route, loadTime: 10000 })
        console.log(`TIMEOUT`)
      } else {
        errorPages.push({ route, error: e.message.substring(0, 50) })
        console.log(`ERROR`)
      }
    }
  }

  await browser.close()

  // Detailed Report
  console.log('\n' + '='.repeat(70))
  console.log('V1 DEEP DIVE REPORT')
  console.log('='.repeat(70))

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`WORKING PAGES: ${workingPages.length}/${routes.length}`)
  console.log(`${'─'.repeat(70)}`)

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`404 NOT FOUND: ${notFoundPages.length}`)
  console.log(`${'─'.repeat(70)}`)
  notFoundPages.forEach(p => console.log(`  /v1/dashboard/${p}`))

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`SLOW/TIMEOUT PAGES: ${slowPages.length}`)
  console.log(`${'─'.repeat(70)}`)
  slowPages.forEach(p => console.log(`  ${p.route} (${p.loadTime}ms)`))

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`ERROR PAGES (500+): ${errorPages.length}`)
  console.log(`${'─'.repeat(70)}`)
  errorPages.forEach(p => console.log(`  ${p.route}: ${p.status || p.error}`))

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`API ERRORS BY TABLE: ${apiErrors.length} total`)
  console.log(`${'─'.repeat(70)}`)
  if (apiErrors.length > 0) {
    const byTable = {}
    apiErrors.forEach(e => {
      if (!byTable[e.table]) byTable[e.table] = { count: 0, status: e.status, body: e.body, pages: new Set() }
      byTable[e.table].count++
      byTable[e.table].pages.add(e.page)
    })
    Object.entries(byTable).sort((a,b) => b[1].count - a[1].count).forEach(([table, info]) => {
      console.log(`\n  [${info.status}] ${table} (${info.count}x)`)
      console.log(`    Body: ${info.body}`)
      console.log(`    Pages: ${[...info.pages].slice(0,5).join(', ')}${info.pages.size > 5 ? '...' : ''}`)
    })
  }

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`CONSOLE ERRORS: ${consoleErrors.length}`)
  console.log(`${'─'.repeat(70)}`)
  if (consoleErrors.length > 0) {
    const unique = [...new Map(consoleErrors.map(e => [e.text.substring(0, 50), e])).values()]
    unique.slice(0, 10).forEach(e => {
      console.log(`\n  ${e.text}`)
      console.log(`  Page: ${e.page}`)
    })
  }

  console.log('\n' + '='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total Pages:     ${routes.length}`)
  console.log(`Working:         ${workingPages.length} (${(workingPages.length/routes.length*100).toFixed(1)}%)`)
  console.log(`404 Not Found:   ${notFoundPages.length}`)
  console.log(`Slow/Timeout:    ${slowPages.length}`)
  console.log(`Error (500+):    ${errorPages.length}`)
  console.log(`API Errors:      ${apiErrors.length}`)
  console.log(`Console Errors:  ${consoleErrors.length}`)
  console.log('='.repeat(70))
}

deepDive().catch(console.error)
