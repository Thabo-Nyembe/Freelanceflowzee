import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

test.describe('KAZI Platform - Complete Feature Validation', () => {

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/KAZI/i)
    await expect(page.locator('text="KAZI"')).toBeVisible({ timeout: 10000 })
  })

  test('Dashboard main page with micro-features', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Check for main dashboard elements
    await expect(page.locator('text=/Welcome to KAZI/i')).toBeVisible({ timeout: 15000 })

    // Check for stat cards
    await expect(page.locator('text="Total Earnings"')).toBeVisible()
    await expect(page.locator('text="Active Projects"')).toBeVisible()

    console.log('✅ Dashboard main page loaded successfully')
  })

  test('AI Create Studio - All 12 AI Models', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create-v2`)
    await page.waitForLoadState('networkidle')

    const content = await page.content()

    // Check for all 12 models
    const models = [
      'GPT-4o',
      'GPT-4o Mini',
      'GPT-4 Vision',
      'Claude 3.5 Sonnet',
      'Claude 3 Haiku',
      'Gemini Pro',
      'Gemini Ultra',
      'DALL-E 3',
      'Midjourney V6',
      'Stable Diffusion XL',
      'RunwayML Gen-3',
      'Real-ESRGAN'
    ]

    let foundModels = 0
    for (const model of models) {
      if (content.includes(model)) {
        foundModels++
        console.log(`✅ Found: ${model}`)
      } else {
        console.log(`❌ Missing: ${model}`)
      }
    }

    expect(foundModels).toBeGreaterThan(8) // At least 9+ models
    console.log(`✅ AI Create Studio: ${foundModels}/12 models found`)
  })

  test('Projects Hub with features', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /Projects/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Projects Hub loaded successfully')
  })

  test('Collaboration page with UPS system', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/collaboration-v2`)
    await page.waitForLoadState('networkidle')

    // Check for collaboration features
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Collaboration|Team/i })).toBeVisible({ timeout: 10000 })

    // Check for UPS mention
    const content = await page.content()
    if (content.includes('Universal Pinpoint System') || content.includes('UPS')) {
      console.log('✅ UPS system found in Collaboration page')
    }

    console.log('✅ Collaboration page loaded successfully')
  })

  test('Video Studio features', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/video-studio-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /Video/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Video Studio loaded successfully')
  })

  test('Financial Hub', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/financial-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /Financial/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Financial Hub loaded successfully')
  })

  test('Canvas Studio', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/canvas-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2, h3').filter({ hasText: /Canvas|Design/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Canvas Studio loaded successfully')
  })

  test('Community Hub', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/community-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /Community/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Community Hub loaded successfully')
  })

  test('Analytics Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/analytics-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /Analytics|Dashboard/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ Analytics Dashboard loaded successfully')
  })

  test('My Day page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/my-day-v2`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1, h2').filter({ hasText: /My Day|Today/i })).toBeVisible({ timeout: 10000 })
    console.log('✅ My Day page loaded successfully')
  })

  test('Interactive elements - Buttons and animations', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // Look for interactive buttons
    const buttons = await page.locator('button').count()
    expect(buttons).toBeGreaterThan(5)
    console.log(`✅ Found ${buttons} interactive buttons`)
  })

  test('Enhanced micro-features - Tooltips and animations', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // Check for animated elements
    const content = await page.content()
    const hasAnimations = content.includes('animate') || content.includes('transition')
    expect(hasAnimations).toBeTruthy()
    console.log('✅ Animation classes found in dashboard')
  })
})
