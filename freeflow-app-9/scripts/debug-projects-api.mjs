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

    // Call projects API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/projects', { credentials: 'include' })
      const text = await res.text()
      return { status: res.status, text: text.substring(0, 1000) }
    })
    
    console.log('Projects API status:', response.status)
    console.log('Projects API response:', response.text)

  } catch (e) {
    console.error('Error:', e.message)
  }

  await browser.close()
}

debug()
