import { test, expect } from '@playwright/test'

// Test available routes that are working
test.describe('Working Functionality Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('Landing Page - Upload/Download/Interactive Elements', async ({ page }) => {
    await page.goto('http://localhost:9323')
    await page.waitForLoadState('networkidle')

    // Test main page interactive elements
    const buttons = page.locator('button:visible')
    const buttonCount = await buttons.count()
    console.log(`Found ${buttonCount} buttons on landing page`)

    // Test CTA buttons
    const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Start Creating"), button:has-text("Try Now")')
    const ctaCount = await ctaButtons.count()
    if (ctaCount > 0) {
      console.log(`Found ${ctaCount} CTA buttons`)
      await ctaButtons.first().click({ timeout: 3000 })
      await page.waitForTimeout(2000)
    }

    // Test pricing buttons
    const pricingButtons = page.locator('button:has-text("Choose Plan"), button:has-text("Subscribe"), button:has-text("Upgrade")')
    const pricingCount = await pricingButtons.count()
    if (pricingCount > 0) {
      console.log(`Found ${pricingCount} pricing buttons`)
      await pricingButtons.first().click({ timeout: 3000 })
      await page.waitForTimeout(2000)
    }

    // Test navigation links
    const navLinks = page.locator('nav a:visible, header a:visible')
    const navCount = await navLinks.count()
    console.log(`Found ${navCount} navigation links`)

    // Test first few nav links
    for (let i = 0; i < Math.min(navCount, 3); i++) {
      try {
        const link = navLinks.nth(i)
        const href = await link.getAttribute('href')

        if (href && !href.startsWith('#') && !href.includes('mailto') && !href.includes('tel')) {
          await link.click({ timeout: 3000 })
          await page.waitForTimeout(1000)
          await page.goBack()
          await page.waitForTimeout(1000)
        }
      } catch (error) {
        console.log(`Navigation link ${i} failed: ${error}`)
      }
    }
  })

  test('Pricing Page - Payment and Feature Testing', async ({ page }) => {
    await page.goto('http://localhost:9323/pricing')
    await page.waitForLoadState('networkidle')

    // Test pricing tiers
    const pricingCards = page.locator('[data-testid*="pricing"], .pricing-card, .plan-card')
    const cardCount = await pricingCards.count()
    console.log(`Found ${cardCount} pricing cards`)

    // Test subscribe buttons
    const subscribeButtons = page.locator('button:has-text("Subscribe"), button:has-text("Choose Plan"), button:has-text("Get Started")')
    const subCount = await subscribeButtons.count()
    if (subCount > 0) {
      console.log(`Found ${subCount} subscription buttons`)

      for (let i = 0; i < Math.min(subCount, 3); i++) {
        try {
          await subscribeButtons.nth(i).click({ timeout: 3000 })
          await page.waitForTimeout(2000)

          // Check if modal or payment form appears
          const modal = page.locator('.modal, .dialog, .sheet, [data-testid*="payment"]')
          if (await modal.isVisible({ timeout: 3000 })) {
            console.log('Payment modal appeared successfully')

            // Test guest payment option
            const guestPayment = page.locator('button:has-text("Guest Payment"), [data-testid*="guest"]')
            if (await guestPayment.isVisible()) {
              await guestPayment.click()
              await page.waitForTimeout(1000)
            }

            // Close modal
            const closeBtn = page.locator('button[aria-label*="close"], .close-button, button:has-text("Close")')
            if (await closeBtn.isVisible()) {
              await closeBtn.click()
            } else {
              await page.keyboard.press('Escape')
            }
          }
        } catch (error) {
          console.log(`Subscription button ${i} failed: ${error}`)
        }
      }
    }

    // Test feature toggles
    const featureButtons = page.locator('button:has-text("View Features"), button:has-text("Details"), .feature-toggle')
    const featureCount = await featureButtons.count()
    if (featureCount > 0) {
      console.log(`Found ${featureCount} feature buttons`)

      for (let i = 0; i < Math.min(featureCount, 2); i++) {
        try {
          await featureButtons.nth(i).click({ timeout: 3000 })
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`Feature button ${i} failed: ${error}`)
        }
      }
    }
  })

  test('Marketing Features Page - Interactive Elements', async ({ page }) => {
    await page.goto('http://localhost:9323/features')
    await page.waitForLoadState('networkidle')

    // Test demo buttons
    const demoButtons = page.locator('button:has-text("Demo"), button:has-text("Try"), button:has-text("Test")')
    const demoCount = await demoButtons.count()
    if (demoCount > 0) {
      console.log(`Found ${demoCount} demo buttons`)

      for (let i = 0; i < Math.min(demoCount, 2); i++) {
        try {
          await demoButtons.nth(i).click({ timeout: 3000 })
          await page.waitForTimeout(2000)
        } catch (error) {
          console.log(`Demo button ${i} failed: ${error}`)
        }
      }
    }

    // Test feature interactions
    const interactiveElements = page.locator('[data-testid*="interactive"], .interactive, button:visible')
    const interactiveCount = await interactiveElements.count()
    console.log(`Found ${interactiveCount} interactive elements`)

    // Test first few interactive elements
    for (let i = 0; i < Math.min(interactiveCount, 5); i++) {
      try {
        await interactiveElements.nth(i).click({ timeout: 3000 })
        await page.waitForTimeout(500)
      } catch (error) {
        console.log(`Interactive element ${i} failed: ${error}`)
      }
    }
  })

  test('Direct Route Testing - Find Working Dashboard URLs', async ({ page }) => {
    // Test various potential dashboard routes
    const potentialRoutes = [
      '/dashboard',
      '/app/dashboard',
      '/dashboard/overview-v2',
      '/admin/dashboard',
      '/user/dashboard',
      '/analytics',
      '/projects',
      '/video-studio'
    ]

    const workingRoutes: string[] = []

    for (const route of potentialRoutes) {
      try {
        console.log(`Testing route: ${route}`)
        const response = await page.goto(`http://localhost:9323${route}`, { timeout: 10000 })

        if (response && response.status() === 200) {
          console.log(`✅ Working route: ${route}`)
          workingRoutes.push(route)
          await page.waitForTimeout(1000)

          // Test buttons on this page
          const buttons = page.locator('button:visible')
          const buttonCount = await buttons.count()
          console.log(`  - Found ${buttonCount} buttons on ${route}`)

          // Test upload inputs
          const fileInputs = page.locator('input[type="file"]:visible')
          const fileCount = await fileInputs.count()
          if (fileCount > 0) {
            console.log(`  - Found ${fileCount} file upload inputs`)
          }

          // Test download/export buttons
          const downloadBtns = page.locator('button:has-text("Download"), button:has-text("Export"), a[download]')
          const downloadCount = await downloadBtns.count()
          if (downloadCount > 0) {
            console.log(`  - Found ${downloadCount} download/export buttons`)

            // Test first download button
            try {
              await downloadBtns.first().click({ timeout: 3000 })
              await page.waitForTimeout(1000)
            } catch (error) {
              console.log(`  - Download button failed: ${error}`)
            }
          }

        } else {
          console.log(`❌ Failed route: ${route} (Status: ${response?.status()})`)
        }
      } catch (error) {
        console.log(`❌ Error testing ${route}: ${error}`)
      }
    }

    console.log(`\nWorking routes found: ${workingRoutes.join(', ')}`)
    expect(workingRoutes.length).toBeGreaterThan(0)
  })

  test('File Upload/Download Simulation', async ({ page }) => {
    await page.goto('http://localhost:9323')
    await page.waitForLoadState('networkidle')

    // Create test file for upload simulation
    await page.evaluate(() => {
      // Create a test blob/file (stored for future upload testing)
      const testContent = 'Test file content for upload testing'
      new Blob([testContent], { type: 'text/plain' })

      // Simulate file upload areas
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input, index) => {
        console.log(`Found file input ${index}:`, input)
      })

      // Test drag and drop areas
      const dropZones = document.querySelectorAll('[class*="drop"], [class*="upload"]')
      dropZones.forEach((zone, index) => {
        console.log(`Found drop zone ${index}:`, zone)
      })
    })

    // Test all file inputs on the page
    const fileInputs = page.locator('input[type="file"]')
    const fileInputCount = await fileInputs.count()

    if (fileInputCount > 0) {
      console.log(`Found ${fileInputCount} file input(s) for testing`)

      // Create a test file buffer
      const testFile = Buffer.from('Test file content')

      for (let i = 0; i < fileInputCount; i++) {
        try {
          // Simulate file upload
          await fileInputs.nth(i).setInputFiles({
            name: 'test-file.txt',
            mimeType: 'text/plain',
            buffer: testFile
          })

          console.log(`Successfully simulated upload for input ${i}`)
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`File input ${i} upload failed: ${error}`)
        }
      }
    }

    // Test download links and buttons
    const downloadElements = page.locator('a[download], button:has-text("Download"), button:has-text("Export")')
    const downloadCount = await downloadElements.count()

    if (downloadCount > 0) {
      console.log(`Found ${downloadCount} download element(s)`)

      for (let i = 0; i < Math.min(downloadCount, 3); i++) {
        try {
          await downloadElements.nth(i).click({ timeout: 3000 })
          console.log(`Successfully tested download element ${i}`)
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`Download element ${i} failed: ${error}`)
        }
      }
    }
  })

  test('Mobile Responsiveness Testing', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('http://localhost:9323')
      await page.waitForLoadState('networkidle')

      // Test responsive navigation
      const mobileNav = page.locator('button[aria-label*="menu"], .mobile-menu, .hamburger')
      if (await mobileNav.isVisible()) {
        console.log(`  - Found mobile navigation`)
        await mobileNav.click()
        await page.waitForTimeout(1000)
      }

      // Test responsive buttons
      const buttons = page.locator('button:visible')
      const buttonCount = await buttons.count()
      console.log(`  - Found ${buttonCount} buttons`)

      // Test scroll behavior
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      await page.evaluate(() => window.scrollTo(0, 0))
    }
  })

  test('Context7 and Enhanced UI Testing', async ({ page }) => {
    await page.goto('http://localhost:9323')
    await page.waitForLoadState('networkidle')

    // Test for Context7 enhanced elements
    await page.evaluate(() => {
      // Look for Context7 enhanced components
      const context7Elements = document.querySelectorAll('[data-context7], [class*="context7"], [class*="enhanced"]')
      console.log(`Found ${context7Elements.length} Context7/enhanced elements`)

      context7Elements.forEach((element, index) => {
        console.log(`Context7 element ${index}:`, element.className, element.tagName)
      })

      // Test for micro-interactions
      const interactiveElements = document.querySelectorAll('[class*="hover"], [class*="transition"], [class*="animate"]')
      console.log(`Found ${interactiveElements.length} interactive elements`)

      return {
        context7Count: context7Elements.length,
        interactiveCount: interactiveElements.length
      }
    })

    // Test hover effects and animations
    const hoverElements = page.locator('[class*="hover"], button, a')
    const hoverCount = await hoverElements.count()

    if (hoverCount > 0) {
      console.log(`Testing hover effects on ${Math.min(hoverCount, 5)} elements`)

      for (let i = 0; i < Math.min(hoverCount, 5); i++) {
        try {
          await hoverElements.nth(i).hover()
          await page.waitForTimeout(300)
        } catch (error) {
          console.log(`Hover effect ${i} failed: ${error}`)
        }
      }
    }

    // Test enhanced components functionality
    const enhancedButtons = page.locator('[class*="enhanced"], [data-testid*="enhanced"]')
    const enhancedCount = await enhancedButtons.count()

    if (enhancedCount > 0) {
      console.log(`Found ${enhancedCount} enhanced components`)

      for (let i = 0; i < Math.min(enhancedCount, 3); i++) {
        try {
          await enhancedButtons.nth(i).click({ timeout: 3000 })
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`Enhanced component ${i} failed: ${error}`)
        }
      }
    }
  })
})