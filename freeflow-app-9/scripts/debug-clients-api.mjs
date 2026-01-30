import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function debug() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', 'test@kazi.dev')
    await page.fill('input[type="password"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)

    // Call clients API - get raw response text first
    const clientsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/clients', { credentials: 'include' })
      const text = await res.text()
      return { status: res.status, text: text.substring(0, 500) }
    })
    
    console.log('Clients API status:', clientsResponse.status)
    console.log('Clients API response (first 500 chars):')
    console.log(clientsResponse.text)

  } catch (e) {
    console.error('Error:', e.message)
  }

  await browser.close()
}

debug()
