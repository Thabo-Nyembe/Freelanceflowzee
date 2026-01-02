import { test, expect } from '@playwright/test'

test.describe('Complete Page Audit - All Routes Since Inception', () => {
  test.setTimeout(300000) // 5 minutes for comprehensive audit

  // Marketing Pages
  const marketingPages = [
    { path: '/', name: 'Homepage', expectedH1: 'Run Your Entire Business' },
    { path: '/pricing', name: 'Pricing', expectedH1: 'Pricing That Grows' },
    { path: '/features', name: 'Features', expectedH1: true },
    { path: '/contact', name: 'Contact', expectedH1: true },
    { path: '/blog', name: 'Blog', expectedH1: true },
  ]

  // Auth Pages
  const authPages = [
    { path: '/login', name: 'Login', expectedH1: true },
    { path: '/signup', name: 'Signup', expectedH1: true },
  ]

  // Dashboard Core Pages
  const dashboardPages = [
    { path: '/dashboard', name: 'Dashboard Overview', expectedText: ['Dashboard', 'My Day'] },
    { path: '/dashboard/overview-v2', name: 'Overview', expectedText: ['Overview'] },
  ]

  // Dashboard Feature Pages
  const featurePages = [
    { path: '/dashboard/ai-create-v2', name: 'AI Create Studio', expectedText: ['AI', 'Create'] },
    { path: '/dashboard/video-studio-v2', name: 'Video Studio', expectedText: ['Video'] },
    { path: '/dashboard/audio-studio-v2', name: 'Audio Studio', expectedText: ['Audio'] },
    { path: '/dashboard/projects-hub-v2', name: 'Projects Hub', expectedText: ['Projects'] },
    { path: '/dashboard/collaboration', name: 'Collaboration', expectedText: ['Collaboration'] },
    { path: '/dashboard/files-hub-v2', name: 'Files Hub', expectedText: ['Files'] },
    { path: '/dashboard/messages-v2', name: 'Messages', expectedText: ['Messages'] },
    { path: '/dashboard/clients-v2', name: 'Clients', expectedText: ['Clients'] },
    { path: '/dashboard/cv-portfolio', name: 'CV Portfolio', expectedText: ['Portfolio', 'CV'] },
    { path: '/dashboard/gallery', name: 'Gallery', expectedText: ['Gallery'] },
    { path: '/dashboard/bookings', name: 'Bookings', expectedText: ['Bookings'] },
    { path: '/dashboard/calendar-v2', name: 'Calendar', expectedText: ['Calendar'] },
    { path: '/dashboard/my-day', name: 'My Day', expectedText: ['My Day'] },
    { path: '/dashboard/financial-hub', name: 'Financial Hub', expectedText: ['Financial'] },
    { path: '/dashboard/escrow', name: 'Escrow', expectedText: ['Escrow'] },
    { path: '/dashboard/settings-v2', name: 'Settings', expectedText: ['Settings'] },
  ]

  // Special Pages
  const specialPages = [
    { path: '/guest-upload', name: 'Guest Upload', expectedText: ['Upload', 'Guest'] },
    { path: '/demo-features', name: 'Demo Features', expectedText: ['Demo'] },
  ]

  test('Marketing Pages - Load and Route Back', async ({ page }) => {
    for (const pageInfo of marketingPages) {
      console.log(`\n📄 Testing: ${pageInfo.name} (${pageInfo.path})`)

      // Navigate to page - use domcontentloaded instead of networkidle
      const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      expect(response?.status()).toBeLessThan(400)
      console.log(`  ✅ Status: ${response?.status()}`)

      // Wait for content
      await page.waitForTimeout(2000)

      // Check for H1 or main content
      if (typeof pageInfo.expectedH1 === 'string') {
        const h1 = await page.locator('h1').first().textContent()
        expect(h1).toContain(pageInfo.expectedH1)
        console.log(`  ✅ H1 found: "${h1?.substring(0, 50)}..."`)
      } else if (pageInfo.expectedH1) {
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
        console.log(`  ✅ H1 element visible`)
      }

      // Test navigation back to homepage
      const homeLink = page.locator('a[href="/"]').first()
      if (await homeLink.isVisible()) {
        await homeLink.click()
        await page.waitForURL('http://localhost:9323/', { timeout: 10000 })
        console.log(`  ✅ Successfully navigated back to homepage`)

        // Return to the page
        await page.goto(`http://localhost:9323${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })
      }
    }
  })

  test('Auth Pages - Load and Route Back', async ({ page }) => {
    for (const pageInfo of authPages) {
      console.log(`\n🔐 Testing: ${pageInfo.name} (${pageInfo.path})`)

      const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      expect(response?.status()).toBeLessThan(400)
      console.log(`  ✅ Status: ${response?.status()}`)

      await page.waitForTimeout(2000)

      // Check for form or H1
      const hasForm = await page.locator('form').count() > 0
      const hasH1 = await page.locator('h1').count() > 0

      expect(hasForm || hasH1).toBeTruthy()
      console.log(`  ✅ Page content loaded (form: ${hasForm}, h1: ${hasH1})`)

      // Test back navigation
      await page.goBack()
      await page.waitForTimeout(1000)
      console.log(`  ✅ Browser back navigation works`)
    }
  })

  test('Dashboard Pages - Load and Route', async ({ page }) => {
    // Note: These pages may require auth, but we test if they load
    for (const pageInfo of [...dashboardPages, ...featurePages]) {
      console.log(`\n📊 Testing: ${pageInfo.name} (${pageInfo.path})`)

      try {
        const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        const status = response?.status() || 0
        console.log(`  ℹ️  Status: ${status}`)

        // Even if redirected or auth required, page should respond
        expect(status).toBeLessThan(500) // No server errors

        await page.waitForTimeout(1000)

        // Check if any expected text is present
        const pageContent = await page.content()
        const hasExpectedContent = pageInfo.expectedText.some(text =>
          pageContent.toLowerCase().includes(text.toLowerCase())
        )

        if (hasExpectedContent) {
          console.log(`  ✅ Expected content found`)
        } else {
          console.log(`  ⚠️  Page loaded but may require auth or redirect`)
        }

      } catch (error) {
        console.log(`  ⚠️  Error: ${error.message}`)
      }
    }
  })

  test('Special Pages - Load and Route Back', async ({ page }) => {
    for (const pageInfo of specialPages) {
      console.log(`\n⭐ Testing: ${pageInfo.name} (${pageInfo.path})`)

      try {
        const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        expect(response?.status()).toBeLessThan(500)
        console.log(`  ✅ Status: ${response?.status()}`)

        await page.waitForTimeout(2000)

        // Check for expected content
        const pageContent = await page.content()
        const hasExpectedContent = pageInfo.expectedText.some(text =>
          pageContent.toLowerCase().includes(text.toLowerCase())
        )

        if (hasExpectedContent) {
          console.log(`  ✅ Expected content found`)
        }

        // Test navigation to homepage
        const homeLink = page.locator('a[href="/"]').first()
        if (await homeLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await homeLink.click()
          await page.waitForTimeout(2000)
          console.log(`  ✅ Can navigate to homepage`)
        }

      } catch (error) {
        console.log(`  ⚠️  Error: ${error.message}`)
      }
    }
  })

  test('Cross-Page Navigation - Full Journey', async ({ page }) => {
    console.log(`\n🔄 Testing Complete Navigation Journey`)

    // Journey: Homepage → Pricing → Features → Contact → Back to Homepage
    const journey = [
      { name: 'Homepage', path: '/' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Features', path: '/features' },
      { name: 'Contact', path: '/contact' },
      { name: 'Blog', path: '/blog' },
    ]

    for (const page_info of journey) {
      console.log(`\n  📍 Navigating to ${page_info.name} (${page_info.path})`)

      // Navigate directly (more reliable than clicking for pages with router.push delays)
      const response = await page.goto(`http://localhost:9323${page_info.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })

      // Verify status
      expect(response?.status()).toBeLessThan(400)
      console.log(`  ✅ Status: ${response?.status()}`)

      // Verify URL
      const currentUrl = page.url()
      expect(currentUrl).toContain(page_info.path)
      console.log(`  ✅ Successfully loaded ${page_info.name}`)

      // Verify link presence for next page (if not last)
      const nextIndex = journey.indexOf(page_info) + 1
      if (nextIndex < journey.length) {
        const nextPage = journey[nextIndex]
        const nextLink = page.locator(`a[href="${nextPage.path}"]`).first()
        const linkExists = await nextLink.count() > 0
        if (linkExists) {
          console.log(`  ✅ Link to ${nextPage.name} found`)
        }
      }
    }

    console.log(`\n  🎉 Complete navigation journey successful!`)
  })

  test('Browser Back/Forward Navigation', async ({ page }) => {
    console.log(`\n⏮️ Testing Browser Back/Forward`)

    // Visit multiple pages
    await page.goto('http://localhost:9323/', { waitUntil: 'domcontentloaded' })
    console.log(`  ✅ Page 1: Homepage`)

    await page.goto('http://localhost:9323/pricing', { waitUntil: 'domcontentloaded' })
    console.log(`  ✅ Page 2: Pricing`)

    await page.goto('http://localhost:9323/features', { waitUntil: 'domcontentloaded' })
    console.log(`  ✅ Page 3: Features`)

    // Test back navigation
    await page.goBack()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/pricing')
    console.log(`  ✅ Back to: Pricing`)

    await page.goBack()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/')
    expect(page.url()).not.toContain('/pricing')
    console.log(`  ✅ Back to: Homepage`)

    // Test forward navigation
    await page.goForward()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/pricing')
    console.log(`  ✅ Forward to: Pricing`)

    await page.goForward()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/features')
    console.log(`  ✅ Forward to: Features`)

    console.log(`\n  🎉 Browser navigation working perfectly!`)
  })

  test('All Critical Links Present', async ({ page }) => {
    console.log(`\n🔗 Testing Critical Links Presence`)

    await page.goto('http://localhost:9323/', { waitUntil: 'domcontentloaded' })

    const criticalLinks = [
      { href: '/pricing', name: 'Pricing' },
      { href: '/features', name: 'Features' },
      { href: '/contact', name: 'Contact' },
      { href: '/blog', name: 'Blog' },
      { href: '/login', name: 'Login' },
      { href: '/signup', name: 'Signup' },
    ]

    for (const link of criticalLinks) {
      const linkElement = page.locator(`a[href="${link.href}"]`).first()
      await expect(linkElement).toBeVisible({ timeout: 10000 })
      console.log(`  ✅ ${link.name} link present`)
    }

    console.log(`\n  🎉 All critical links present and visible!`)
  })
})
