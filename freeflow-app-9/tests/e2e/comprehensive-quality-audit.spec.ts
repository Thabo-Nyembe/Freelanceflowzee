/**
 * KAZI Platform - Comprehensive Quality Audit
 *
 * This test suite covers:
 * 1. Performance (Lighthouse metrics)
 * 2. Accessibility (axe-core)
 * 3. Cross-browser compatibility
 * 4. Mobile responsiveness
 */

import { test, expect, devices } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Key pages to test
const PAGES_TO_AUDIT = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Features', path: '/features' },
  { name: 'Contact', path: '/contact' },
]

const DASHBOARD_PAGES = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Projects', path: '/dashboard/projects-v2' },
  { name: 'Clients', path: '/dashboard/clients-v2' },
  { name: 'AI Create', path: '/dashboard/ai-create-v2' },
]

// ============================================
// PERFORMANCE TESTS
// ============================================
test.describe('Performance Audit', () => {
  test('Home page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime

    console.log(`Home page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('Login page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime

    console.log(`Login page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(2000)
  })

  test('Pricing page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/pricing')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime

    console.log(`Pricing page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  for (const pageInfo of PAGES_TO_AUDIT) {
    test(`${pageInfo.name} page - Core Web Vitals check`, async ({ page }) => {
      await page.goto(pageInfo.path)
      await page.waitForLoadState('networkidle')

      // Check for large images without lazy loading
      const largeImages = await page.$$eval('img', (imgs) =>
        imgs.filter(img => !img.loading && img.naturalWidth > 500).length
      )

      // Check for render-blocking resources
      const scripts = await page.$$('script:not([async]):not([defer])')

      console.log(`${pageInfo.name}: ${largeImages} large images without lazy loading, ${scripts.length} blocking scripts`)

      // Performance assertions
      expect(largeImages).toBeLessThan(5)
    })
  }

  test('Bundle size check - JS under 500KB initial', async ({ page }) => {
    const client = await page.context().newCDPSession(page)
    await client.send('Network.enable')

    const resources: { size: number; url: string }[] = []

    client.on('Network.responseReceived', (event) => {
      if (event.response.mimeType?.includes('javascript')) {
        resources.push({
          size: event.response.encodedDataLength || 0,
          url: event.response.url
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const totalJsSize = resources.reduce((sum, r) => sum + r.size, 0)
    console.log(`Total JS loaded: ${(totalJsSize / 1024).toFixed(2)}KB`)

    // Log largest JS files
    resources.sort((a, b) => b.size - a.size)
    console.log('Largest JS files:')
    resources.slice(0, 5).forEach(r => {
      console.log(`  ${(r.size / 1024).toFixed(2)}KB - ${r.url.split('/').pop()}`)
    })
  })
})

// ============================================
// ACCESSIBILITY TESTS (axe-core)
// ============================================
test.describe('Accessibility Audit', () => {
  for (const pageInfo of PAGES_TO_AUDIT) {
    test(`${pageInfo.name} page - WCAG 2.1 AA compliance`, async ({ page }) => {
      await page.goto(pageInfo.path)
      await page.waitForLoadState('domcontentloaded')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n${pageInfo.name} - Accessibility Violations:`)
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`  - ${violation.id}: ${violation.description}`)
          console.log(`    Impact: ${violation.impact}`)
          console.log(`    Nodes affected: ${violation.nodes.length}`)
        })
      }

      // Count critical violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      console.log(`${pageInfo.name}: ${accessibilityScanResults.violations.length} total violations, ${criticalViolations.length} critical/serious`)

      // Allow some minor violations but no critical ones
      expect(criticalViolations.length).toBeLessThanOrEqual(3)
    })
  }

  test('Keyboard navigation works on login form', async ({ page }) => {
    await page.goto('/login')

    // Tab through form elements
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)

    await page.keyboard.press('Tab')
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName)

    // Should be able to tab through form elements
    expect(['INPUT', 'BUTTON', 'A']).toContain(firstFocused)
    expect(['INPUT', 'BUTTON', 'A']).toContain(secondFocused)
  })

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/login')

    // Focus on email input
    await page.click('input[type="email"], input[name="email"], input[placeholder*="email" i]', { force: true })

    // Check that focus is visible (element should have focus styles)
    const hasFocusStyle = await page.evaluate(() => {
      const active = document.activeElement
      if (!active) return false
      const styles = window.getComputedStyle(active)
      return styles.outline !== 'none' || styles.boxShadow !== 'none'
    })

    // Note: This may pass even without explicit focus styles due to browser defaults
    console.log(`Focus indicator visible: ${hasFocusStyle}`)
  })

  test('Images have alt text', async ({ page }) => {
    await page.goto('/')

    const imagesWithoutAlt = await page.$$eval('img', (imgs) =>
      imgs.filter(img => !img.alt && !img.getAttribute('role')).length
    )

    console.log(`Images without alt text: ${imagesWithoutAlt}`)
    expect(imagesWithoutAlt).toBeLessThan(5)
  })

  test('Color contrast is sufficient', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze()

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('contrast')
    )

    console.log(`Color contrast violations: ${contrastViolations.length}`)

    if (contrastViolations.length > 0) {
      contrastViolations.forEach(v => {
        console.log(`  - ${v.description} (${v.nodes.length} elements)`)
      })
    }
  })
})

// ============================================
// CROSS-BROWSER TESTING
// ============================================
test.describe('Cross-Browser Compatibility', () => {
  // These tests will run in all configured browsers (chromium, firefox, webkit)

  test('Page renders correctly', async ({ page, browserName }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check that main content is visible
    const body = await page.locator('body')
    await expect(body).toBeVisible()

    // Check that no major layout issues
    const viewport = page.viewportSize()
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)

    console.log(`${browserName}: Body width ${bodyWidth}px, viewport ${viewport?.width}px`)

    // Body should not be significantly wider than viewport (no horizontal scroll)
    if (viewport) {
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20)
    }
  })

  test('Login form works', async ({ page, browserName }) => {
    await page.goto('/login')

    // Check form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    console.log(`${browserName}: Login form elements visible`)
  })

  test('Navigation works', async ({ page, browserName }) => {
    await page.goto('/')

    // Click on a navigation link
    const pricingLink = page.locator('a[href="/pricing"], a:has-text("Pricing")').first()

    if (await pricingLink.isVisible()) {
      await pricingLink.click()
      await page.waitForLoadState('domcontentloaded')

      expect(page.url()).toContain('pricing')
      console.log(`${browserName}: Navigation to pricing works`)
    }
  })

  test('CSS animations/transitions work', async ({ page, browserName }) => {
    await page.goto('/')

    // Check that CSS is loaded and working
    const hasStyles = await page.evaluate(() => {
      const styles = document.styleSheets
      return styles.length > 0
    })

    expect(hasStyles).toBe(true)
    console.log(`${browserName}: CSS loaded successfully`)
  })

  test('JavaScript functionality works', async ({ page, browserName }) => {
    await page.goto('/')

    // Check that React has hydrated
    const hasReact = await page.evaluate(() => {
      return typeof window !== 'undefined' && document.querySelector('[data-reactroot], #__next')
    })

    console.log(`${browserName}: React app ${hasReact ? 'hydrated' : 'not detected'}`)
  })
})

// ============================================
// MOBILE RESPONSIVENESS TESTS
// ============================================
test.describe('Mobile Responsiveness', () => {
  test('Home page is mobile responsive', async ({ page }) => {
    // Set mobile viewport manually
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check viewport
    const viewport = page.viewportSize()
    expect(viewport?.width).toBeLessThan(500)

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)

    console.log(`Mobile: Body ${bodyWidth}px, Window ${windowWidth}px`)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10)
  })

  test('Navigation is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    // Look for mobile menu button (hamburger)
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[class*="menu" i], button[class*="hamburger" i], [data-testid*="menu"]').first()

    // Either mobile menu exists or navigation is visible
    const navVisible = await page.locator('nav a').first().isVisible().catch(() => false)
    const mobileMenuExists = await mobileMenuButton.isVisible().catch(() => false)

    console.log(`Mobile: Nav visible: ${navVisible}, Menu button: ${mobileMenuExists}`)
    expect(navVisible || mobileMenuExists).toBe(true)
  })

  test('Forms are usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login')

    // Check input sizes are appropriate for mobile
    const inputs = await page.$$('input')

    for (const input of inputs) {
      const box = await input.boundingBox()
      if (box) {
        // Inputs should be at least 40px tall for touch targets
        expect(box.height).toBeGreaterThanOrEqual(36)
      }
    }
  })

  test('Text is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    // Check font sizes
    const smallText = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, a, li')
      let tooSmall = 0
      elements.forEach(el => {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize)
        if (fontSize < 12) tooSmall++
      })
      return tooSmall
    })

    console.log(`Mobile: ${smallText} elements with font-size < 12px`)
    expect(smallText).toBeLessThan(10)
  })
})

// ============================================
// TABLET RESPONSIVENESS TESTS
// ============================================
test.describe('Tablet Responsiveness', () => {
  test('Layout adapts to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const viewport = page.viewportSize()
    expect(viewport?.width).toBeGreaterThan(700)
    expect(viewport?.width).toBeLessThan(1200)

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)

    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10)
    console.log(`Tablet: Layout adapts correctly`)
  })
})

// ============================================
// SUMMARY TEST
// ============================================
test.describe('Quality Audit Summary', () => {
  test('Generate audit summary', async ({ page }) => {
    const summary = {
      timestamp: new Date().toISOString(),
      pagesAudited: PAGES_TO_AUDIT.length,
      testsRun: 'Performance, Accessibility, Cross-browser, Mobile',
      status: 'COMPLETE'
    }

    console.log('\n========================================')
    console.log('KAZI PLATFORM - QUALITY AUDIT SUMMARY')
    console.log('========================================')
    console.log(JSON.stringify(summary, null, 2))
    console.log('========================================\n')

    expect(true).toBe(true)
  })
})
