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

    // Get session
    const sessionResponse = await page.evaluate(async () => {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      return await res.json()
    })
    
    console.log('Session user:', JSON.stringify(sessionResponse?.user, null, 2))
    console.log('Has authId:', !!sessionResponse?.user?.authId)
    console.log('authId value:', sessionResponse?.user?.authId)
    console.log('user.id:', sessionResponse?.user?.id)

  } catch (e) {
    console.error('Error:', e.message)
  }

  await browser.close()
}

debug()
