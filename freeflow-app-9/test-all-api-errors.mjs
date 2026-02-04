import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function testErrors() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiErrors = new Map()
  const consoleErrors = new Map()

  // Capture API errors
  page.on('response', async (response) => {
    if (response.url().includes('supabase') && response.status() >= 400) {
      const url = response.url()
      const status = response.status()
      let body = ''
      try { body = await response.text() } catch {}
      const key = url.split('?')[1]?.substring(0, 80) || url.split('/').pop()
      if (!apiErrors.has(key)) {
        apiErrors.set(key, { url: url.split('?')[0], query: url.split('?')[1]?.substring(0, 100), status, body: body.substring(0, 200), count: 1 })
      } else {
        apiErrors.get(key).count++
      }
    }
  })

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('Third-party') && !text.includes('download the React DevTools')) {
        const key = text.substring(0, 50)
        if (!consoleErrors.has(key)) {
          consoleErrors.set(key, { text: text.substring(0, 200), count: 1 })
        } else {
          consoleErrors.get(key).count++
        }
      }
    }
  })

  // Test all major dashboard pages in demo mode
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
    process.stdout.write(`Testing: ${path}...`)
    try {
      await page.goto(`${BASE_URL}${path}?demo=true`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(2000)
      console.log(' done')
    } catch (e) {
      console.log(` error: ${e.message.substring(0, 50)}`)
    }
  }

  await browser.close()

  console.log('\n=== API ERRORS ===')
  if (apiErrors.size === 0) {
    console.log('No API errors!')
  } else {
    for (const [key, err] of apiErrors) {
      console.log(`\n${err.status}: ${err.url}`)
      console.log(`  Query: ${err.query}`)
      console.log(`  Body: ${err.body}`)
      console.log(`  Count: ${err.count}`)
    }
  }

  console.log('\n=== CONSOLE ERRORS ===')
  if (consoleErrors.size === 0) {
    console.log('No console errors!')
  } else {
    for (const [key, err] of consoleErrors) {
      console.log(`- ${err.text} (x${err.count})`)
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Unique API Errors: ${apiErrors.size}`)
  console.log(`Unique Console Errors: ${consoleErrors.size}`)
}

testErrors().catch(console.error)
