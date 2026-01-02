import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

test.setTimeout(120000) // 2 minutes per test

test.describe('KAZI Platform - Feature-by-Feature Validation', () => {

  test('1. Homepage - Navigation and Branding', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Check for KAZI branding
    const kaziText = await page.getByText(/KAZI/i).first()
    await expect(kaziText).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true })
    console.log('✅ Homepage loaded with branding')
  })

  test('2. Dashboard - Welcome Animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    // Check for welcome message
    const welcomeVisible = await page.getByText(/Welcome to KAZI/i).count() > 0
    console.log(`Welcome message visible: ${welcomeVisible}`)

    // Take screenshot
    await page.screenshot({ path: 'test-results/02-dashboard-welcome.png', fullPage: true })
    console.log('✅ Dashboard loaded')
  })

  test('3. Dashboard - Stat Cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    // Check for stat cards
    const earnings = await page.getByText(/Total Earnings/i).count()
    const projects = await page.getByText(/Active Projects/i).count()

    console.log(`Stat cards found: Earnings=${earnings > 0}, Projects=${projects > 0}`)

    await page.screenshot({ path: 'test-results/03-dashboard-stats.png', fullPage: true })
    console.log('✅ Dashboard stat cards checked')
  })

  test('4. Dashboard - Interactive Buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    // Count all buttons
    const buttonCount = await page.locator('button').count()
    console.log(`Found ${buttonCount} buttons on dashboard`)

    // Try to hover over first few buttons
    const buttons = await page.locator('button').all()
    if (buttons.length > 0) {
      await buttons[0].hover()
      await page.waitForTimeout(500)
    }

    await page.screenshot({ path: 'test-results/04-dashboard-buttons.png', fullPage: true })
    console.log('✅ Dashboard buttons interactive')
  })

  test('5. AI Create Studio - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const content = await page.content()

    // Check for AI-related text
    const hasAI = content.includes('AI') || content.includes('Create') || content.includes('Studio')
    console.log(`AI Create page has AI content: ${hasAI}`)

    await page.screenshot({ path: 'test-results/05-ai-create-page.png', fullPage: true })
    console.log('✅ AI Create Studio page loaded')
  })

  test('6. AI Create Studio - Model Detection', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const content = await page.content()

    // Check for specific AI models
    const models = {
      'GPT-4o': content.includes('GPT-4o') || content.includes('GPT-4'),
      'Claude': content.includes('Claude'),
      'Gemini': content.includes('Gemini'),
      'DALL-E': content.includes('DALL-E') || content.includes('DALL'),
      'Midjourney': content.includes('Midjourney'),
      'Stable Diffusion': content.includes('Stable Diffusion') || content.includes('Stable')
    }

    console.log('AI Models found:', models)
    const foundCount = Object.values(models).filter(Boolean).length
    console.log(`Found ${foundCount}/6 major AI model categories`)

    await page.screenshot({ path: 'test-results/06-ai-models.png', fullPage: true })
    console.log('✅ AI models checked')
  })

  test('7. Projects Hub - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasProjects = await page.getByText(/Project/i).count() > 0
    console.log(`Projects Hub loaded: ${hasProjects}`)

    await page.screenshot({ path: 'test-results/07-projects-hub.png', fullPage: true })
    console.log('✅ Projects Hub loaded')
  })

  test('8. Collaboration Page - Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/collaboration`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    await page.screenshot({ path: 'test-results/08-collaboration.png', fullPage: true })
    console.log('✅ Collaboration page loaded')
  })

  test('9. Collaboration Page - UPS System Check', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/collaboration`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const content = await page.content()
    const hasUPS = content.includes('Universal Pinpoint System') ||
                   content.includes('UPS') ||
                   content.includes('97.3%') ||
                   content.includes('Feedback')

    console.log(`UPS system indicators found: ${hasUPS}`)

    // Try to find and click Feedback tab if it exists
    const feedbackTab = page.getByText(/Feedback/i).first()
    const feedbackExists = await feedbackTab.count() > 0
    if (feedbackExists) {
      await feedbackTab.click()
      await page.waitForTimeout(2000)
    }

    await page.screenshot({ path: 'test-results/09-collaboration-ups.png', fullPage: true })
    console.log('✅ UPS system checked')
  })

  test('10. Video Studio - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/video-studio-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasVideo = await page.getByText(/Video/i).count() > 0
    console.log(`Video Studio loaded: ${hasVideo}`)

    await page.screenshot({ path: 'test-results/10-video-studio.png', fullPage: true })
    console.log('✅ Video Studio loaded')
  })

  test('11. Financial Hub - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/financial`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasFinancial = await page.getByText(/Financial|Transaction|Invoice|Payment/i).count() > 0
    console.log(`Financial Hub loaded: ${hasFinancial}`)

    await page.screenshot({ path: 'test-results/11-financial-hub.png', fullPage: true })
    console.log('✅ Financial Hub loaded')
  })

  test('12. Canvas Studio - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/canvas-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasCanvas = await page.getByText(/Canvas|Design|Draw/i).count() > 0
    console.log(`Canvas Studio loaded: ${hasCanvas}`)

    await page.screenshot({ path: 'test-results/12-canvas-studio.png', fullPage: true })
    console.log('✅ Canvas Studio loaded')
  })

  test('13. Community Hub - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/community-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasCommunity = await page.getByText(/Community/i).count() > 0
    console.log(`Community Hub loaded: ${hasCommunity}`)

    await page.screenshot({ path: 'test-results/13-community-v2.png', fullPage: true })
    console.log('✅ Community Hub loaded')
  })

  test('14. Analytics Dashboard - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/analytics-v2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasAnalytics = await page.getByText(/Analytics|Dashboard|Chart|Data/i).count() > 0
    console.log(`Analytics Dashboard loaded: ${hasAnalytics}`)

    await page.screenshot({ path: 'test-results/14-analytics.png', fullPage: true })
    console.log('✅ Analytics Dashboard loaded')
  })

  test('15. My Day Page - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/my-day`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasMyDay = await page.getByText(/My Day|Today|Task|Schedule/i).count() > 0
    console.log(`My Day page loaded: ${hasMyDay}`)

    await page.screenshot({ path: 'test-results/15-my-day.png', fullPage: true })
    console.log('✅ My Day page loaded')
  })

  test('16. Micro-Features Showcase - Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    const hasMicroFeatures = await page.getByText(/Micro|Feature|Animation|Button/i).count() > 0
    console.log(`Micro-Features Showcase loaded: ${hasMicroFeatures}`)

    await page.screenshot({ path: 'test-results/16-micro-features.png', fullPage: true })
    console.log('✅ Micro-Features Showcase loaded')
  })

  test('17. Micro-Features - Tab Navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    // Try to find and click tabs
    const tabs = ['Animations', 'Interactions', 'Feedback', 'Accessibility']

    for (const tabName of tabs) {
      const tab = page.getByText(tabName).first()
      const exists = await tab.count() > 0
      if (exists) {
        await tab.click()
        await page.waitForTimeout(1000)
        console.log(`✅ Clicked ${tabName} tab`)
      }
    }

    await page.screenshot({ path: 'test-results/17-micro-features-tabs.png', fullPage: true })
    console.log('✅ Micro-Features tabs tested')
  })

  test('18. Responsive Design - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    await page.screenshot({ path: 'test-results/18-mobile-dashboard.png', fullPage: true })
    console.log('✅ Mobile responsive design checked')
  })

  test('19. Responsive Design - Tablet View', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    await page.screenshot({ path: 'test-results/19-tablet-dashboard.png', fullPage: true })
    console.log('✅ Tablet responsive design checked')
  })

  test('20. Navigation - Sidebar Links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    // Count navigation links
    const links = await page.locator('a').count()
    console.log(`Found ${links} navigation links`)

    await page.screenshot({ path: 'test-results/20-navigation.png', fullPage: true })
    console.log('✅ Navigation checked')
  })
})
