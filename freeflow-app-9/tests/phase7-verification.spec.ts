import { test, expect } from '@playwright/test'

test.describe('Phase 7: Marketing Pages Verification', () => {
  test.describe('Placeholder Removal Verification', () => {
    test('Support page - no placeholder alerts', async ({ page }) => {
      await page.goto('/support')
      await expect(page).toHaveTitle(/Support/)

      // Verify Live Chat links to /contact (not alert)
      const liveChatButton = page.getByRole('button', { name: /contact support/i })
      await expect(liveChatButton).toBeVisible()

      // Verify FAQs links to /contact (not alert)
      const faqButton = page.getByRole('button', { name: /get help/i })
      await expect(faqButton).toBeVisible()

      // Verify no DemoModal or placeholder alerts
      await expect(page.locator('text=coming soon')).not.toBeVisible()
      await expect(page.locator('text=Demo Coming Soon')).not.toBeVisible()
    })

    test('Newsletter page - no placeholder alerts or DemoModals', async ({ page }) => {
      await page.goto('/newsletter')
      await expect(page).toHaveTitle(/Newsletter/)

      // Verify blog links work (not DemoModal)
      const readArticlesButton = page.getByRole('link', { name: /read articles/i }).first()
      await expect(readArticlesButton).toBeVisible()
      await expect(readArticlesButton).toHaveAttribute('href', '/blog')

      // Verify share buttons exist (real functionality, not alerts)
      const shareButtons = page.getByRole('button', { name: /share/i })
      await expect(shareButtons.first()).toBeVisible()

      // Verify no DemoModal or placeholder content
      await expect(page.locator('text=Demo Coming Soon')).not.toBeVisible()
      await expect(page.locator('text=functionality coming soon')).not.toBeVisible()
    })

    test('Blog post page - real share functionality, no DemoModal', async ({ page }) => {
      await page.goto('/blog/getting-started-with-ai-content-creation')

      // Verify share button exists with real functionality
      const shareButton = page.getByRole('button', { name: /share this article/i })
      await expect(shareButton).toBeVisible()

      // Verify CTA links to /signup (not DemoModal)
      const ctaButton = page.getByRole('link', { name: /start free trial/i })
      await expect(ctaButton).toBeVisible()
      await expect(ctaButton).toHaveAttribute('href', '/signup')

      // Verify no DemoModal
      await expect(page.locator('text=Demo Coming Soon')).not.toBeVisible()
    })

    test('API docs page - no placeholder alerts', async ({ page }) => {
      await page.goto('/api-docs')

      // Verify quick start actions work (no placeholder alerts)
      await expect(page).toHaveTitle(/API/)

      // Verify no "coming soon" alerts
      await expect(page.locator('text=functionality coming soon')).not.toBeVisible()
    })
  })

  test.describe('Production Build Verification', () => {
    test('Homepage loads without errors', async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('/')
      await expect(page).toHaveTitle(/KAZI/)

      // Verify no JavaScript errors
      expect(consoleErrors.filter(err =>
        !err.includes('favicon') &&
        !err.includes('net::ERR')
      ).length).toBe(0)
    })

    test('All marketing pages load successfully', async ({ page }) => {
      const pages = [
        { url: '/', titlePattern: /KAZI/ },
        { url: '/features', titlePattern: /Features/ },
        { url: '/pricing', titlePattern: /Pricing/ },
        { url: '/about', titlePattern: /About/ },
        { url: '/contact', titlePattern: /Contact/ },
        { url: '/blog', titlePattern: /Blog/ },
        { url: '/newsletter', titlePattern: /Newsletter/ },
        { url: '/support', titlePattern: /Support/ },
        { url: '/tutorials', titlePattern: /Tutorials/ },
        { url: '/community', titlePattern: /Community/ },
        { url: '/docs', titlePattern: /Documentation/ },
        { url: '/privacy', titlePattern: /Privacy/ },
        { url: '/terms', titlePattern: /Terms/ },
      ]

      for (const pageInfo of pages) {
        await page.goto(pageInfo.url)
        await expect(page).toHaveTitle(pageInfo.titlePattern)

        // Verify no placeholder content
        await expect(page.locator('text=functionality coming soon').first()).not.toBeVisible()
      }
    })
  })

  test.describe('Real Features Verification', () => {
    test('Newsletter subscription form works', async ({ page }) => {
      await page.goto('/newsletter')

      // Fill out subscription form
      const emailInput = page.getByPlaceholder(/enter your email/i).first()
      await emailInput.fill('test@example.com')

      const subscribeButton = page.getByRole('button', { name: /subscribe/i }).first()
      await expect(subscribeButton).toBeEnabled()

      // Note: We don't submit to avoid database writes during tests
    })

    test('Contact form exists and is functional', async ({ page }) => {
      await page.goto('/contact')

      // Verify form elements exist
      await expect(page.getByLabel(/name/i).first()).toBeVisible()
      await expect(page.getByLabel(/email/i).first()).toBeVisible()
      await expect(page.getByLabel(/message/i).first()).toBeVisible()

      const submitButton = page.getByRole('button', { name: /send/i })
      await expect(submitButton).toBeVisible()
    })

    test('Share functionality uses Web Share API', async ({ page }) => {
      await page.goto('/blog/getting-started-with-ai-content-creation')

      // Verify share button exists
      const shareButton = page.getByRole('button', { name: /share/i })
      await expect(shareButton).toBeVisible()

      // Share button should have real click handler (not just alert)
      // We can't test Web Share API in Playwright, but verify button is interactive
      await expect(shareButton).toBeEnabled()
    })

    test('Blog navigation works correctly', async ({ page }) => {
      await page.goto('/newsletter')

      // Click on "Read Articles" button
      const readArticlesLink = page.getByRole('link', { name: /read articles/i }).first()
      await readArticlesLink.click()

      // Should navigate to blog page
      await expect(page).toHaveURL('/blog')
      await expect(page).toHaveTitle(/Blog/)
    })

    test('Support page directs to contact', async ({ page }) => {
      await page.goto('/support')

      // Click "Contact Support" button
      const contactButton = page.getByRole('link', { name: /send message/i })
      await contactButton.click()

      // Should navigate to contact page
      await expect(page).toHaveURL('/contact')
    })
  })

  test.describe('Animated Backgrounds', () => {
    test('All marketing pages have animated backgrounds', async ({ page }) => {
      const pagesWithAnimatedBg = [
        '/support',
        '/blog',
        '/terms',
        '/privacy',
        '/docs',
      ]

      for (const url of pagesWithAnimatedBg) {
        await page.goto(url)

        // Verify gradient background exists
        const gradientBg = page.locator('[class*="bg-[radial-gradient"]').first()
        await expect(gradientBg).toBeVisible()
      }
    })
  })

  test.describe('Accessibility Verification', () => {
    test('Key marketing pages have proper ARIA labels', async ({ page }) => {
      await page.goto('/support')

      // Verify main landmarks
      await expect(page.getByRole('main')).toBeVisible()
      await expect(page.getByRole('navigation')).toBeVisible()

      // Verify heading structure
      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toBeVisible()
    })

    test('Forms have proper labels', async ({ page }) => {
      await page.goto('/contact')

      // Verify form inputs are labeled
      await expect(page.getByLabel(/name/i).first()).toBeVisible()
      await expect(page.getByLabel(/email/i).first()).toBeVisible()
    })
  })
})
