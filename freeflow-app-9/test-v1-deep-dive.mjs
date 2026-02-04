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
  const networkErrors = []

  // Capture all responses
  page.on('response', async (response) => {
    const url = response.url()
    const status = response.status()

    if (url.includes('supabase') && status >= 400) {
      let body = ''
      try { body = await response.text() } catch {}
      apiErrors.push({
        url: url.split('?')[0].split('/').pop(),
        query: url.split('?')[1]?.substring(0, 120),
        status,
        body: body.substring(0, 250),
        page: page.url().replace(BASE_URL, '')
      })
    }

    if (status === 404 && !url.includes('favicon') && !url.includes('_next')) {
      networkErrors.push({ url, status, page: page.url().replace(BASE_URL, '') })
    }
  })

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text()
    const type = msg.type()

    if (type === 'error' && !text.includes('favicon') && !text.includes('Third-party') && !text.includes('DevTools')) {
      consoleErrors.push({
        text: text.substring(0, 300),
        type,
        page: page.url().replace(BASE_URL, '')
      })
    }
  })

  // All v1 dashboard pages to test
  const testPages = [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/clients',
    '/dashboard/invoices',
    '/dashboard/calendar',
    '/dashboard/tasks',
    '/dashboard/files',
    '/dashboard/files-hub',
    '/dashboard/messages',
    '/dashboard/settings',
    '/dashboard/ai-assistant',
    '/dashboard/ai-create',
    '/dashboard/ai-enhanced',
    '/dashboard/booking',
    '/dashboard/bookings',
    '/dashboard/canvas',
    '/dashboard/client-zone',
    '/dashboard/cloud-storage',
    '/dashboard/collaboration',
    '/dashboard/community',
    '/dashboard/community-hub',
    '/dashboard/cv-portfolio',
    '/dashboard/escrow',
    '/dashboard/financial',
    '/dashboard/financial-hub',
    '/dashboard/gallery',
    '/dashboard/my-day',
    '/dashboard/notifications',
    '/dashboard/payments',
    '/dashboard/portfolio',
    '/dashboard/projects',
    '/dashboard/projects-hub',
    '/dashboard/proposals',
    '/dashboard/resources',
    '/dashboard/scheduling',
    '/dashboard/security',
    '/dashboard/storage',
    '/dashboard/team',
    '/dashboard/templates',
    '/dashboard/time-tracking',
    '/dashboard/video-studio',
    '/dashboard/voice'
  ]

  console.log(`Testing ${testPages.length} pages...\n`)

  for (const path of testPages) {
    const startTime = Date.now()
    process.stdout.write(`${path}...`)

    try {
      const response = await page.goto(`${BASE_URL}${path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })

      const loadTime = Date.now() - startTime

      if (response?.status() === 404) {
        notFoundPages.push(path)
        console.log(` 404`)
      } else if (loadTime > 5000) {
        slowPages.push({ path, loadTime })
        console.log(` slow (${loadTime}ms)`)
      } else {
        console.log(` ok (${loadTime}ms)`)
      }

      await page.waitForTimeout(1500)

    } catch (e) {
      if (e.message.includes('timeout')) {
        slowPages.push({ path, loadTime: 15000 })
        console.log(` timeout`)
      } else {
        console.log(` error: ${e.message.substring(0, 40)}`)
      }
    }
  }

  await browser.close()

  // Report
  console.log('\n' + '='.repeat(60))
  console.log('V1 DEEP DIVE REPORT')
  console.log('='.repeat(60))

  console.log('\n--- 404 PAGES ---')
  if (notFoundPages.length === 0) {
    console.log('None')
  } else {
    notFoundPages.forEach(p => console.log(`  ${p}`))
  }

  console.log('\n--- SLOW PAGES (>5s) ---')
  if (slowPages.length === 0) {
    console.log('None')
  } else {
    slowPages.forEach(p => console.log(`  ${p.path} (${p.loadTime}ms)`))
  }

  console.log('\n--- API ERRORS ---')
  if (apiErrors.length === 0) {
    console.log('None')
  } else {
    const unique = [...new Map(apiErrors.map(e => [e.query?.substring(0, 50), e])).values()]
    unique.forEach(e => {
      console.log(`\n  [${e.status}] ${e.url}`)
      console.log(`  Query: ${e.query}`)
      console.log(`  Body: ${e.body}`)
      console.log(`  Page: ${e.page}`)
    })
  }

  console.log('\n--- CONSOLE ERRORS ---')
  if (consoleErrors.length === 0) {
    console.log('None')
  } else {
    const unique = [...new Map(consoleErrors.map(e => [e.text.substring(0, 50), e])).values()]
    unique.forEach(e => {
      console.log(`\n  ${e.text}`)
      console.log(`  Page: ${e.page}`)
    })
  }

  console.log('\n--- NETWORK 404s ---')
  if (networkErrors.length === 0) {
    console.log('None')
  } else {
    const unique = [...new Map(networkErrors.map(e => [e.url, e])).values()]
    unique.forEach(e => console.log(`  ${e.url}`))
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`404 Pages: ${notFoundPages.length}`)
  console.log(`Slow Pages: ${slowPages.length}`)
  console.log(`API Errors: ${apiErrors.length}`)
  console.log(`Console Errors: ${consoleErrors.length}`)
  console.log(`Network 404s: ${networkErrors.length}`)
}

deepDive().catch(console.error)
