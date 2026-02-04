import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:9323'

async function test404() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const notFound = []

  page.on('response', (response) => {
    if (response.status() === 404) {
      notFound.push(response.url())
    }
  })

  await page.goto(`${BASE_URL}/dashboard?demo=true`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)

  await browser.close()

  console.log('404 Resources:')
  notFound.forEach(url => console.log(`  - ${url}`))
}

test404().catch(console.error)
