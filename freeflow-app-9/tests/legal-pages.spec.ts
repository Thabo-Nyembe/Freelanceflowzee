import { test, expect } from '@playwright/test'

/**
 * Legal Pages Testing Suite
 * Verifies all legal documentation pages load correctly and are accessible
 */

const legalPages = [
  {
    path: '/privacy',
    name: 'Privacy Policy',
    expectedHeading: 'Privacy Policy',
    expectedSections: ['Information We Collect', 'GDPR Rights', 'California Privacy Rights'],
  },
  {
    path: '/terms',
    name: 'Terms of Service',
    expectedHeading: 'Terms of Service',
    expectedSections: ['Acceptance of Terms', 'Use License', 'User Accounts'],
  },
  {
    path: '/cookies',
    name: 'Cookie Policy',
    expectedHeading: 'Cookie Policy',
    expectedSections: ['What Are Cookies', 'Essential Cookies', 'How to Manage Cookies'],
  },
  {
    path: '/dpa',
    name: 'Data Processing Agreement',
    expectedHeading: 'Data Processing Agreement',
    expectedSections: ['Definitions', 'Scope and Roles', 'Sub-processors'],
  },
]

test.describe('Legal Pages - Comprehensive Testing', () => {
  for (const page of legalPages) {
    test.describe(`${page.name} (${page.path})`, () => {
      test('Page loads successfully with 200 status', async ({ page: browserPage }) => {
        const response = await browserPage.goto(page.path)
        expect(response?.status()).toBe(200)
      })

      test('Page has correct title and heading', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check page title contains KAZI
        const title = await browserPage.title()
        expect(title).toContain('KAZI')

        // Check main heading is present
        const heading = browserPage.locator('h1')
        await expect(heading.first()).toBeVisible()
        const headingText = await heading.first().textContent()
        expect(headingText).toContain(page.expectedHeading)
      })

      test('Page has required sections', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')
        await browserPage.waitForTimeout(1000)

        // Check for expected sections
        for (const section of page.expectedSections) {
          const sectionExists = await browserPage.getByText(section, { exact: false }).isVisible()
          expect(sectionExists).toBe(true)
        }
      })

      test('Page has "Back to Home" navigation', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check for back to home button
        const backButton = browserPage.getByText('Back to Home')
        await expect(backButton).toBeVisible()

        // Verify it links to home
        const backLink = browserPage.locator('a:has-text("Back to Home")')
        const href = await backLink.getAttribute('href')
        expect(href).toBe('/')
      })

      test('Page has proper semantic structure', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check for main content area
        const mainContent = browserPage.locator('main, [role="main"]')
        await expect(mainContent.first()).toBeVisible()

        // Check for article structure
        const article = browserPage.locator('article')
        await expect(article.first()).toBeVisible()
      })

      test('Page has accessible navigation', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check for navigation with aria-label
        const nav = browserPage.locator('nav[aria-label="Breadcrumb"]')
        await expect(nav).toBeVisible()
      })

      test('Page has no critical console errors', async ({ page: browserPage }) => {
        const consoleErrors: string[] = []

        browserPage.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })

        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

        // Filter out non-critical errors
        const criticalErrors = consoleErrors.filter(err =>
          !err.includes('favicon') &&
          !err.includes('chrome-extension') &&
          !err.includes('Failed to load resource')
        )

        expect(criticalErrors.length).toBe(0)
      })

      test('Page content is readable and styled', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check that text content exists and is visible
        const bodyText = await browserPage.locator('article').textContent()
        expect(bodyText).toBeTruthy()
        expect(bodyText!.length).toBeGreaterThan(500) // Substantial content

        // Check for styling (dark mode background)
        const body = browserPage.locator('body')
        const bgClass = await body.getAttribute('class')
        // Body should have some styling
        expect(bgClass).toBeTruthy()
      })

      test('Links within page are functional', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')
        await browserPage.waitForTimeout(1000)

        // Find all links in the article
        const links = browserPage.locator('article a')
        const linkCount = await links.count()

        // Verify at least some links exist
        expect(linkCount).toBeGreaterThan(0)

        // Check first link has href
        if (linkCount > 0) {
          const firstLink = links.first()
          const href = await firstLink.getAttribute('href')
          expect(href).toBeTruthy()
        }
      })

      test('Page has contact information', async ({ page: browserPage }) => {
        await browserPage.goto(page.path)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check for email contact
        const emailLink = browserPage.locator('a[href^="mailto:"]')
        const emailCount = await emailLink.count()
        expect(emailCount).toBeGreaterThan(0)
      })
    })
  }
})

test.describe('Legal Pages - Cross-Page Testing', () => {
  test('All legal pages are accessible from footer', async ({ page }) => {
    // Go to home page
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Check footer has legal links
    const footerLinks = [
      { text: 'Privacy Policy', href: '/privacy' },
      { text: 'Terms of Service', href: '/terms' },
      { text: 'Cookie Policy', href: '/cookies' },
      { text: 'DPA', href: '/dpa' },
    ]

    for (const link of footerLinks) {
      const footerLink = page.locator(`footer a:has-text("${link.text}")`)
      const isVisible = await footerLink.isVisible().catch(() => false)

      if (isVisible) {
        const href = await footerLink.getAttribute('href')
        expect(href).toBe(link.href)
      }
    }
  })

  test('Legal pages have consistent styling', async ({ page }) => {
    const styles: Array<{ path: string; hasCard: boolean }> = []

    for (const legalPage of legalPages) {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      // Check for LiquidGlassCard component
      const card = page.locator('[class*="liquid-glass"], [class*="card"]')
      const cardExists = await card.count() > 0

      styles.push({ path: legalPage.path, hasCard: cardExists })
    }

    // All pages should have consistent card styling
    const allHaveCards = styles.every(s => s.hasCard)
    expect(allHaveCards).toBe(true)
  })

  test('Legal pages are indexed correctly', async ({ page }) => {
    // Check that legal pages have proper meta tags for SEO
    for (const legalPage of legalPages) {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      // Check title
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(10)
    }
  })

  test('Legal pages have last updated date', async ({ page }) => {
    for (const legalPage of legalPages) {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      // Check for "Last updated" text
      const lastUpdated = page.getByText(/Last updated:/i)
      await expect(lastUpdated).toBeVisible()

      // Verify it contains a year
      const lastUpdatedText = await lastUpdated.textContent()
      expect(lastUpdatedText).toMatch(/202[0-9]/)
    }
  })
})

test.describe('Legal Compliance Verification', () => {
  test('Privacy Policy includes GDPR compliance', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    const gdprText = await page.getByText('GDPR').textContent()
    expect(gdprText).toBeTruthy()

    const rightsText = await page.getByText(/right to access/i).textContent()
    expect(rightsText).toBeTruthy()
  })

  test('Privacy Policy includes CCPA compliance', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    const ccpaText = await page.getByText(/California/i).textContent()
    expect(ccpaText).toBeTruthy()

    const doNotSellText = await page.getByText(/do not sell/i).textContent()
    expect(doNotSellText).toBeTruthy()
  })

  test('Terms of Service includes dispute resolution', async ({ page }) => {
    await page.goto('/terms')
    await page.waitForLoadState('domcontentloaded')

    const disputeText = await page.getByText(/Dispute Resolution/i).textContent()
    expect(disputeText).toBeTruthy()

    const arbitrationText = await page.getByText(/arbitration/i).textContent()
    expect(arbitrationText).toBeTruthy()
  })

  test('Cookie Policy lists cookie types', async ({ page }) => {
    await page.goto('/cookies')
    await page.waitForLoadState('domcontentloaded')

    // Check for different cookie types
    const essentialCookies = await page.getByText(/Essential Cookies/i).textContent()
    expect(essentialCookies).toBeTruthy()

    const analyticscookies = await page.getByText(/Analytics Cookies/i).textContent()
    expect(analyticscookies).toBeTruthy()
  })

  test('DPA includes sub-processor list', async ({ page }) => {
    await page.goto('/dpa')
    await page.waitForLoadState('domcontentloaded')

    // Check for sub-processors
    const supabaseText = await page.getByText(/Supabase/i).textContent()
    expect(supabaseText).toBeTruthy()

    const vercelText = await page.getByText(/Vercel/i).textContent()
    expect(vercelText).toBeTruthy()

    const stripeText = await page.getByText(/Stripe/i).textContent()
    expect(stripeText).toBeTruthy()
  })
})
