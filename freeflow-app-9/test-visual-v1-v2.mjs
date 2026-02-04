import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE_URL_V1 = 'http://localhost:3000'
const BASE_URL_V2 = 'http://localhost:9323'

async function visualTest() {
  mkdirSync('/tmp/visual-test-results', { recursive: true })
  
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  console.log('=' .repeat(70))
  console.log('VISUAL TEST: V1 vs V2')
  console.log('=' .repeat(70))

  // V1 Tests
  console.log('\n📸 V1 SCREENSHOTS (port 3000)')
  console.log('-'.repeat(40))

  // V1 Landing Page
  console.log('  Landing page...')
  await page.goto(`${BASE_URL_V1}/`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v1-landing.png', fullPage: true })
  const v1LandingTitle = await page.locator('h1').first().textContent().catch(() => 'N/A')
  console.log(`    Title: "${v1LandingTitle?.substring(0, 50)}..."`)

  // V1 Login Page
  console.log('  Login page...')
  await page.goto(`${BASE_URL_V1}/login`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/visual-test-results/v1-login.png', fullPage: true })

  // V1 Dashboard
  console.log('  Dashboard (demo mode)...')
  await page.goto(`${BASE_URL_V1}/v1/dashboard/admin?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v1-dashboard.png', fullPage: true })

  // V1 Projects
  console.log('  Projects page...')
  await page.goto(`${BASE_URL_V1}/v1/dashboard/projects?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v1-projects.png', fullPage: true })

  // V1 AI Create
  console.log('  AI Create page...')
  await page.goto(`${BASE_URL_V1}/v1/dashboard/ai-create?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v1-ai-create.png', fullPage: true })

  // V2 Tests
  console.log('\n📸 V2 SCREENSHOTS (port 9323)')
  console.log('-'.repeat(40))

  // V2 Landing Page
  console.log('  Landing page...')
  await page.goto(`${BASE_URL_V2}/`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v2-landing.png', fullPage: true })
  const v2LandingTitle = await page.locator('h1').first().textContent().catch(() => 'N/A')
  console.log(`    Title: "${v2LandingTitle?.substring(0, 50)}..."`)

  // V2 Login Page
  console.log('  Login page...')
  await page.goto(`${BASE_URL_V2}/login`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/visual-test-results/v2-login.png', fullPage: true })

  // V2 Dashboard
  console.log('  Dashboard (demo mode)...')
  await page.goto(`${BASE_URL_V2}/dashboard/admin-v2?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v2-dashboard.png', fullPage: true })

  // V2 Projects
  console.log('  Projects page...')
  await page.goto(`${BASE_URL_V2}/dashboard/projects-hub-v2?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v2-projects.png', fullPage: true })

  // V2 AI Create
  console.log('  AI Create page...')
  await page.goto(`${BASE_URL_V2}/dashboard/ai-create-v2?demo=true`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/visual-test-results/v2-ai-create.png', fullPage: true })

  await browser.close()

  console.log('\n' + '='.repeat(70))
  console.log('VISUAL TEST COMPLETE')
  console.log('='.repeat(70))
  console.log('\nScreenshots saved to /tmp/visual-test-results/')
  console.log('\nV1 (port 3000):')
  console.log('  - v1-landing.png')
  console.log('  - v1-login.png')
  console.log('  - v1-dashboard.png')
  console.log('  - v1-projects.png')
  console.log('  - v1-ai-create.png')
  console.log('\nV2 (port 9323):')
  console.log('  - v2-landing.png')
  console.log('  - v2-login.png')
  console.log('  - v2-dashboard.png')
  console.log('  - v2-projects.png')
  console.log('  - v2-ai-create.png')
}

visualTest().catch(console.error)
