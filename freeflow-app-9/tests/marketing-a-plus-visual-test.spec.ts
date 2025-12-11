import { test, expect } from '@playwright/test'

test.describe('A+++ Marketing Pages - Visual Verification', () => {
  test.setTimeout(120000) // 2 minutes for visual inspection

  test.beforeEach(async ({ page }) => {
    // Give time to load
    page.setDefaultTimeout(15000)
  })

  test('Homepage - A+++ shadcn Upgrade Visual Check', async ({ page }) => {
    await page.goto('http://localhost:9323/', { waitUntil: 'networkidle' })

    // Wait for main content to load
    await page.waitForTimeout(3000)

    // Check for shadcn components
    console.log('✅ Homepage loaded')
    console.log('📝 Look for:')
    console.log('  - Bright design (no dark mode)')
    console.log('  - H1: "Run Your Entire Business From One Platform"')
    console.log('  - shadcn Button components with gradients')
    console.log('  - shadcn Card components for features')
    console.log('  - Trust badges (SSL, GDPR, SOC 2, 30-Day Guarantee)')
    console.log('  - Glassmorphism navigation')
    console.log('  - 9 feature cards in grid')
    console.log('  - Testimonials section')

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-a-plus-upgrade.png', fullPage: true })

    // Keep browser open for visual inspection
    await page.waitForTimeout(30000) // 30 seconds
  })

  test('Pricing Page - A+++ shadcn Upgrade Visual Check', async ({ page }) => {
    await page.goto('http://localhost:9323/pricing', { waitUntil: 'networkidle' })

    // Wait for main content to load
    await page.waitForTimeout(3000)

    // Check for pricing page components
    console.log('✅ Pricing page loaded')
    console.log('📝 Look for:')
    console.log('  - H1: "Pricing That Grows With Your Business"')
    console.log('  - Billing toggle (Monthly/Annual)')
    console.log('  - 3 pricing tiers in shadcn Cards')
    console.log('  - "Most Popular" badge on Professional plan')
    console.log('  - Trust badges below pricing cards')
    console.log('  - FAQ section (6 questions)')
    console.log('  - Gradient CTA section')

    // Take screenshot
    await page.screenshot({ path: 'test-results/pricing-a-plus-upgrade.png', fullPage: true })

    // Keep browser open for visual inspection
    await page.waitForTimeout(30000) // 30 seconds
  })
})
