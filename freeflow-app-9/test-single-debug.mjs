import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function debugPage() {
  console.log('Starting debug test...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Set demo mode cookie
  await context.addCookies([{
    name: 'demo_mode',
    value: 'true',
    domain: 'localhost',
    path: '/'
  }])

  const page = await context.newPage()

  // Log ALL requests
  page.on('request', req => {
    const url = req.url()
    if (url.includes('localhost') && (url.includes('/api/') || url.endsWith('.json'))) {
      console.log(`📤 REQUEST: ${req.method()} ${url.replace(BASE_URL, '')}`)
    }
  })

  // Log ALL responses (including external that return errors)
  page.on('response', res => {
    const url = res.url()
    const status = res.status()
    // Show all localhost API calls
    if (url.includes('localhost') && (url.includes('/api/') || url.endsWith('.json'))) {
      const statusIcon = status >= 400 ? '❌' : '✅'
      console.log(`${statusIcon} RESPONSE: ${status} ${url.replace(BASE_URL, '')}`)
    }
    // Also show any 4xx/5xx from any source
    if (status >= 400) {
      console.log(`⚠️ ERROR ${status}: ${url.substring(0, 100)}`)
    }
  })

  // Log request failures
  page.on('requestfailed', req => {
    console.log(`🚫 FAILED: ${req.url().replace(BASE_URL, '')} - ${req.failure()?.errorText}`)
  })

  // Log console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('DevTools') && !text.includes('ResizeObserver')) {
        console.log(`🔴 CONSOLE: ${text.substring(0, 200)}`)
      }
    }
  })

  console.log('Testing /dashboard/messages-v2?demo=true\n')
  await page.goto(`${BASE_URL}/dashboard/messages-v2?demo=true`, {
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  })

  console.log('\nWaiting 3 seconds for async operations...')
  await page.waitForTimeout(3000)

  await browser.close()
  console.log('\nDone!')
}

debugPage().catch(console.error)
