import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'
const page_path = process.argv[2] || '/dashboard/growth-hub-v2'

async function debug() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  await context.addCookies([{ name: 'demo_mode', value: 'true', domain: 'localhost', path: '/' }])
  const page = await context.newPage()

  page.on('response', res => {
    const status = res.status()
    if (status >= 400) {
      console.log(status + ': ' + res.url().replace(BASE_URL, ''))
    }
  })

  await page.goto(BASE_URL + page_path + '?demo=true', { timeout: 20000, waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(2000)
  await browser.close()
}

debug().catch(console.error)
