import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Increase timeout for all tests
test.setTimeout(120000)

test.describe('KAZI Platform - Simple Validation', () => {

  test('Homepage loads', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ Homepage loaded')
  })

  test('Dashboard loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)

    // Wait a bit for client-side rendering
    await page.waitForTimeout(5000)

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard-validation.png', fullPage: true })
    console.log('✅ Dashboard loaded - screenshot saved')
  })

  test('AI Create Studio loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/ai-create-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)

    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'test-results/ai-create-validation.png', fullPage: true })
    console.log('✅ AI Create Studio loaded')
  })

  test('Projects Hub loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)

    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'test-results/projects-hub-validation.png', fullPage: true })
    console.log('✅ Projects Hub loaded')
  })

  test('Collaboration page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/collaboration-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)

    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'test-results/collaboration-validation.png', fullPage: true })
    console.log('✅ Collaboration page loaded')
  })

  test('Video Studio loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/video-studio-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)

    await page.waitForTimeout(5000)
    console.log('✅ Video Studio loaded')
  })

  test('Financial Hub loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/financial-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ Financial Hub loaded')
  })

  test('Canvas Studio loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/canvas-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ Canvas Studio loaded')
  })

  test('Community Hub loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/community-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ Community Hub loaded')
  })

  test('Analytics Dashboard loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/analytics-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ Analytics Dashboard loaded')
  })

  test('My Day page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/my-day-v2`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(response?.status()).toBeLessThan(400)
    console.log('✅ My Day page loaded')
  })
})
