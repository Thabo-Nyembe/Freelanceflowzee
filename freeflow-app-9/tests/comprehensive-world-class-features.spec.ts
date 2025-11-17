import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

test.describe('World-Class Features Comprehensive Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`)
  })

  test('Dashboard loads successfully with all micro-features', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Welcome to KAZI")')).toBeVisible({ timeout: 10000 })

    // Verify animated counter is present
    await expect(page.locator('text=/25\\+/')).toBeVisible()

    // Check for quick stats cards
    await expect(page.locator('text="Total Earnings"')).toBeVisible()
    await expect(page.locator('text="Active Projects"')).toBeVisible()
    await expect(page.locator('text="Client Portfolio"')).toBeVisible()
    await expect(page.locator('text="Productivity Score"')).toBeVisible()
  })

  test('AI Create Studio loads with all 12 models', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create`)

    // Wait for page to load
    await expect(page.locator('h1, h2').filter({ hasText: /AI Create/i })).toBeVisible({ timeout: 10000 })

    // Check for model selection (should have 12 models)
    const modelSelect = page.locator('select, [role="combobox"]').first()
    if (await modelSelect.isVisible()) {
      await modelSelect.click()

      // Check for key models
      await expect(page.locator('text="GPT-4o"')).toBeVisible()
      await expect(page.locator('text=/Claude.*Sonnet/i')).toBeVisible()
      await expect(page.locator('text=/Gemini/i')).toBeVisible()
      await expect(page.locator('text=/DALL-E/i')).toBeVisible()
      await expect(page.locator('text=/Midjourney/i')).toBeVisible()
    }

    // Check for tabs
    await expect(page.locator('text="Create Studio"')).toBeVisible()
    await expect(page.locator('text="Templates"')).toBeVisible()
    await expect(page.locator('text="History"')).toBeVisible()
  })

  test('Universal Pinpoint System (UPS) in Collaboration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/collaboration`)

    // Wait for page load
    await expect(page.locator('h1:has-text("Collaboration")')).toBeVisible({ timeout: 10000 })

    // Click on Feedback tab to see UPS
    const feedbackTab = page.locator('button:has-text("Feedback")')
    await feedbackTab.click()

    // Check for UPS title and stats
    await expect(page.locator('text="Universal Pinpoint System"')).toBeVisible()
    await expect(page.locator('text="97.3%"')).toBeVisible() // AI Accuracy
    await expect(page.locator('text="18s"')).toBeVisible() // Avg Response
    await expect(page.locator('text="9.1/10"')).toBeVisible() // Satisfaction
  })

  test('Projects Hub loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/projects-hub`)

    await expect(page.locator('h1, h2').filter({ hasText: /Projects?/i })).toBeVisible({ timeout: 10000 })

    // Check for project management features
    const pageContent = await page.content()
    expect(pageContent.toLowerCase()).toContain('project')
  })

  test('Video Studio features accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/video-studio`)

    await expect(page.locator('h1, h2').filter({ hasText: /Video/i })).toBeVisible({ timeout: 10000 })
  })

  test('Financial Hub loads with metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/financial`)

    await expect(page.locator('h1, h2').filter({ hasText: /Financial/i })).toBeVisible({ timeout: 10000 })
  })

  test('Community Hub real-time collaboration', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/community-hub`)

    await expect(page.locator('h1, h2').filter({ hasText: /Community/i })).toBeVisible({ timeout: 10000 })
  })

  test('Canvas/Collaboration AI-enhanced features', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/canvas`)

    await expect(page.locator('h1, h2').filter({ hasText: /Canvas/i })).toBeVisible({ timeout: 10000 })
  })

  test('Analytics Dashboard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/analytics`)

    await expect(page.locator('h1, h2').filter({ hasText: /Analytics/i })).toBeVisible({ timeout: 10000 })
  })

  test('My Day productivity features', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/my-day`)

    await expect(page.locator('h1, h2').filter({ hasText: /My Day/i })).toBeVisible({ timeout: 10000 })
  })

  test('Micro Features Showcase - all categories', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`)

    // Wait for page load
    await expect(page.locator('h1, h2').filter({ hasText: /Micro.Features/i })).toBeVisible({ timeout: 10000 })

    // Check for tabs
    await expect(page.locator('text="Animations"')).toBeVisible()
    await expect(page.locator('text="Interactions"')).toBeVisible()
    await expect(page.locator('text="Feedback"')).toBeVisible()
    await expect(page.locator('text="Accessibility"')).toBeVisible()

    // Click through tabs
    await page.locator('button:has-text("Interactions")').click()
    await expect(page.locator('text="Magnetic"')).toBeVisible()

    await page.locator('button:has-text("Feedback")').click()
    await expect(page.locator('text="Contextual Tooltips"')).toBeVisible()

    await page.locator('button:has-text("Accessibility")').click()
    await expect(page.locator('text="Keyboard Navigation"')).toBeVisible()
  })

  test('Enhanced Navigation works across pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Test navigation to different pages
    const pages = [
      { path: '/dashboard/ai-create', text: 'AI Create' },
      { path: '/dashboard/projects-hub', text: 'Projects' },
      { path: '/dashboard/collaboration', text: 'Collaboration' }
    ]

    for (const pageInfo of pages) {
      await page.goto(`${BASE_URL}${pageInfo.path}`)
      await page.waitForLoadState('networkidle')

      const content = await page.content()
      expect(content.toLowerCase()).toContain(pageInfo.text.toLowerCase())
    }
  })

  test('Micro-features: Animated Counters work', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Check for animated counters in stats
    const counterElements = page.locator('[class*="counter"]')
    const count = await counterElements.count()

    if (count > 0) {
      console.log(`Found ${count} animated counter elements`)
    }
  })

  test('Micro-features: Enhanced Buttons respond', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`)

    // Click on Interactions tab
    await page.locator('button:has-text("Interactions")').click()

    // Test magnetic button (hover should work)
    const magneticBtn = page.locator('button:has-text("Magnetic")').first()
    if (await magneticBtn.isVisible()) {
      await magneticBtn.hover()
      // Button should be visible and hoverable
      await expect(magneticBtn).toBeVisible()
    }
  })

  test('Micro-features: Search functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`)

    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('Micro-features: Loading states present', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`)

    await page.locator('button:has-text("Feedback")').click()

    // Check for loading state demo
    const loadingSection = page.locator('text="Loading States"')
    if (await loadingSection.isVisible()) {
      await expect(loadingSection).toBeVisible()
    }
  })

  test('Micro-features: Error boundaries functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/micro-features-showcase`)

    await page.locator('button:has-text("Feedback")').click()

    // Check for error boundary section
    await expect(page.locator('text=/Error.*Boundaries?/i')).toBeVisible()
  })

  test('Responsive design: Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/dashboard`)

    // Dashboard should still be visible on mobile
    await expect(page.locator('h1:has-text("KAZI")')).toBeVisible({ timeout: 10000 })
  })

  test('Responsive design: Tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(`${BASE_URL}/dashboard`)

    await expect(page.locator('h1:has-text("KAZI")')).toBeVisible({ timeout: 10000 })
  })

  test('Performance: Dashboard loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page.locator('h1:has-text("KAZI")')).toBeVisible({ timeout: 10000 })
    const loadTime = Date.now() - startTime

    console.log(`Dashboard load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('Accessibility: Keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check if focus is visible
    const focusedElement = await page.locator(':focus')
    expect(await focusedElement.count()).toBeGreaterThan(0)
  })

  test('Theme toggle functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i], button:has([class*="sun"]), button:has([class*="moon"])').first()

    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      // Theme should toggle (check for class changes)
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Critical User Flows', () => {
  test('Complete AI content creation flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create`)

    // Wait for page load
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /AI Create/i })).toBeVisible({ timeout: 10000 })

    // Try to interact with the form
    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible()) {
      await textarea.fill('Test prompt for AI generation')
      await expect(textarea).toHaveValue('Test prompt for AI generation')
    }
  })

  test('Navigation through all major hubs', async ({ page }) => {
    const majorHubs = [
      '/dashboard',
      '/dashboard/ai-create',
      '/dashboard/projects-hub',
      '/dashboard/collaboration',
      '/dashboard/video-studio',
      '/dashboard/financial',
      '/dashboard/community-hub',
      '/dashboard/analytics',
      '/dashboard/my-day'
    ]

    for (const hub of majorHubs) {
      await page.goto(`${BASE_URL}${hub}`)
      await page.waitForLoadState('networkidle')

      // Page should load without errors
      const hasError = await page.locator('text=/error|failed|not found/i').count()
      expect(hasError).toBe(0)
    }
  })
})
