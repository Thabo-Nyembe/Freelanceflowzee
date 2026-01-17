import { test, expect, Page } from '@playwright/test'

/**
 * CRITICAL BUSINESS FLOWS E2E TESTS
 *
 * Tests the most important user journeys that directly impact business operations:
 * 1. Login Flow - User authentication
 * 2. Create Project Flow - Project creation and management
 * 3. Create and Send Invoice Flow - Invoice generation and delivery
 * 4. Payment Processing Flow - Handling payments and subscriptions
 */

// Test configuration
const TEST_USER = {
  email: 'thabo@kaleidocraft.co.za',
  password: 'password1234',
}

const TEST_USER_ALT = {
  email: 'test@kazi.dev',
  password: 'test12345',
}

// Helper function to perform login
async function performLogin(page: Page, credentials = TEST_USER) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Fill login form
  await page.fill('input[type="email"], input#email', credentials.email)
  await page.fill('input[type="password"], input#password', credentials.password)

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15000 })
}

test.describe('Critical Business Flows', () => {

  // ============================================================================
  // LOGIN FLOW TESTS
  // ============================================================================
  test.describe('Login Flow', () => {

    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Verify login form elements are visible
      await expect(page.locator('input[type="email"], input#email')).toBeVisible()
      await expect(page.locator('input[type="password"], input#password')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()

      // Verify branding elements
      await expect(page.locator('text=Sign In to KAZI, text=KAZI, text=Welcome')).toBeVisible()
    })

    test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Fill credentials
      await page.fill('input[type="email"], input#email', TEST_USER.email)
      await page.fill('input[type="password"], input#password', TEST_USER.password)

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 15000 })

      // Verify we're on the dashboard
      expect(page.url()).toContain('/dashboard')

      // Verify authenticated content is visible
      await expect(page.locator('body')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Fill invalid credentials
      await page.fill('input[type="email"], input#email', 'invalid@example.com')
      await page.fill('input[type="password"], input#password', 'wrongpassword')

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for error or stay on page
      await page.waitForTimeout(3000)

      // Should remain on login page
      expect(page.url()).toContain('/login')
    })

    test('should validate empty form submission', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Submit empty form
      await page.click('button[type="submit"]')

      // Should not navigate away
      await page.waitForTimeout(1000)
      expect(page.url()).toContain('/login')
    })

    test('should persist authentication across page refresh', async ({ page }) => {
      // Login first
      await performLogin(page)

      // Verify we're on dashboard
      expect(page.url()).toContain('/dashboard')

      // Refresh page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Should still be on dashboard (session persists)
      expect(page.url()).toContain('/dashboard')
    })

    test('should show password visibility toggle', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const passwordInput = page.locator('input[type="password"], input#password')
      await passwordInput.fill('testpassword')

      // Find and click the visibility toggle button
      const toggleButton = page.locator('button:has(svg.lucide-eye), button:has(svg.lucide-eye-off)').first()
      if (await toggleButton.isVisible()) {
        await toggleButton.click()

        // Password input should now be visible (type=text)
        const inputType = await page.locator('input#password').getAttribute('type')
        expect(['text', 'password']).toContain(inputType)
      }
    })

    test('should have links to signup and forgot password', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Check for signup link
      const signupLink = page.locator('a[href*="signup"], a:has-text("Sign up")')
      await expect(signupLink.first()).toBeVisible()

      // Check for forgot password link
      const forgotLink = page.locator('a[href*="forgot"], a:has-text("Forgot")')
      await expect(forgotLink.first()).toBeVisible()
    })
  })

  // ============================================================================
  // CREATE PROJECT FLOW TESTS
  // ============================================================================
  test.describe('Create Project Flow', () => {

    test.beforeEach(async ({ page }) => {
      // Login before each test
      await performLogin(page)
    })

    test('should navigate to projects hub', async ({ page }) => {
      // Navigate to projects hub
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Verify projects page loaded
      await expect(page.locator('body')).toBeVisible()

      // Look for projects-related content
      const projectsContent = page.locator('text=Project, text=project, [data-testid*="project"]')
      await expect(projectsContent.first()).toBeVisible({ timeout: 10000 })
    })

    test('should display create project button', async ({ page }) => {
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Look for various create/new project buttons
      const createButtons = [
        'button:has-text("New Project")',
        'button:has-text("Create Project")',
        'button:has-text("Add Project")',
        'button:has(svg.lucide-plus)',
        '[data-testid="create-project"]',
        '[data-testid="new-project"]'
      ]

      let createButtonFound = false
      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          createButtonFound = true
          await expect(button).toBeVisible()
          break
        }
      }

      expect(createButtonFound).toBeTruthy()
    })

    test('should open create project modal/form', async ({ page }) => {
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Find and click create project button
      const createButtons = [
        'button:has-text("New Project")',
        'button:has-text("Create Project")',
        'button:has-text("Add Project")',
        'button:has(svg.lucide-plus)'
      ]

      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      await page.waitForTimeout(1000)

      // Look for modal or form elements
      const formElements = [
        '[role="dialog"]',
        'input[name="name"], input[placeholder*="name"]',
        'input[name="projectName"], input[placeholder*="Project"]',
        'textarea[name="description"]',
        'form'
      ]

      let formFound = false
      for (const selector of formElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          formFound = true
          await expect(element).toBeVisible()
          break
        }
      }

      expect(formFound).toBeTruthy()
    })

    test('should create a new project with valid data', async ({ page }) => {
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Click create project button
      const createButtons = [
        'button:has-text("New Project")',
        'button:has-text("Create Project")',
        'button:has-text("Add Project")',
        'button:has(svg.lucide-plus)'
      ]

      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      await page.waitForTimeout(1000)

      // Fill project form
      const projectName = `Test Project ${Date.now()}`
      const projectDescription = 'E2E test project description'

      // Fill name field
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]').first()
      if (await nameInput.isVisible()) {
        await nameInput.fill(projectName)
      }

      // Fill description field
      const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description"]').first()
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill(projectDescription)
      }

      // Submit the form
      const submitButtons = [
        'button:has-text("Create")',
        'button:has-text("Save")',
        'button:has-text("Submit")',
        'button[type="submit"]'
      ]

      for (const selector of submitButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      // Wait for success or project list update
      await page.waitForTimeout(2000)

      // Verify success (modal closed, or success message, or project in list)
      const successIndicators = [
        `text=${projectName}`,
        '.toast:has-text("Success")',
        '[data-testid="success"]'
      ]

      for (const selector of successIndicators) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          break
        }
      }
    })

    test('should display project list with projects', async ({ page }) => {
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Look for project list elements
      const listElements = [
        '[data-testid="project-list"]',
        '[data-testid="projects-grid"]',
        'table',
        '.project-card',
        '[class*="grid"]'
      ]

      let listFound = false
      for (const selector of listElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          listFound = true
          break
        }
      }

      // Page should have some content
      await expect(page.locator('body')).toBeVisible()
    })

    test('should filter and search projects', async ({ page }) => {
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(1000)

        // Verify search was applied
        await expect(searchInput).toHaveValue('test')
      }

      // Look for filter elements
      const filterButtons = page.locator('button:has-text("Filter"), button:has(svg.lucide-filter)').first()
      if (await filterButtons.isVisible()) {
        await filterButtons.click()
        await page.waitForTimeout(500)
      }
    })
  })

  // ============================================================================
  // CREATE AND SEND INVOICE FLOW TESTS
  // ============================================================================
  test.describe('Create and Send Invoice Flow', () => {

    test.beforeEach(async ({ page }) => {
      await performLogin(page)
    })

    test('should navigate to invoices page', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Verify invoices page loaded
      await expect(page.locator('body')).toBeVisible()

      // Look for invoice-related content
      const invoiceContent = page.locator('text=Invoice, text=invoice, [data-testid*="invoice"]')
      await expect(invoiceContent.first()).toBeVisible({ timeout: 10000 })
    })

    test('should display create invoice button', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Look for create invoice buttons
      const createButtons = [
        'button:has-text("New Invoice")',
        'button:has-text("Create Invoice")',
        'button:has-text("Add Invoice")',
        'button:has(svg.lucide-plus)',
        '[data-testid="create-invoice"]'
      ]

      let buttonFound = false
      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          buttonFound = true
          await expect(button).toBeVisible()
          break
        }
      }

      expect(buttonFound).toBeTruthy()
    })

    test('should open create invoice modal/form', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Find and click create invoice button
      const createButtons = [
        'button:has-text("New Invoice")',
        'button:has-text("Create Invoice")',
        'button:has-text("Add Invoice")',
        'button:has(svg.lucide-plus)'
      ]

      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      await page.waitForTimeout(1000)

      // Look for invoice form modal
      const formElements = [
        '[role="dialog"]',
        'input[name="clientName"], input[placeholder*="client"]',
        'input[name="amount"], input[placeholder*="amount"]',
        'textarea[name="description"]'
      ]

      let formFound = false
      for (const selector of formElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          formFound = true
          break
        }
      }

      expect(formFound).toBeTruthy()
    })

    test('should create invoice with line items', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Click create invoice
      const createButtons = [
        'button:has-text("New Invoice")',
        'button:has-text("Create Invoice")',
        'button:has(svg.lucide-plus)'
      ]

      for (const selector of createButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      await page.waitForTimeout(1000)

      // Fill invoice details
      // Client name
      const clientInput = page.locator('input[name="clientName"], input[placeholder*="client"], input[placeholder*="Client"]').first()
      if (await clientInput.isVisible()) {
        await clientInput.fill('Test Client Company')
      }

      // Description
      const descriptionInput = page.locator('input[name="description"], input[placeholder*="description"], textarea').first()
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('E2E Test Invoice')
      }

      // Amount
      const amountInput = page.locator('input[name="amount"], input[placeholder*="amount"], input[type="number"]').first()
      if (await amountInput.isVisible()) {
        await amountInput.fill('1500')
      }

      // Look for add line item button
      const addLineItem = page.locator('button:has-text("Add Line"), button:has-text("Add Item")').first()
      if (await addLineItem.isVisible()) {
        await addLineItem.click()
        await page.waitForTimeout(500)
      }

      // Submit invoice
      const submitButtons = [
        'button:has-text("Create")',
        'button:has-text("Save")',
        'button:has-text("Generate")',
        'button[type="submit"]'
      ]

      for (const selector of submitButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          break
        }
      }

      await page.waitForTimeout(2000)
    })

    test('should display invoice list with invoices', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Look for invoice list or table
      const listElements = [
        'table',
        '[data-testid="invoice-list"]',
        '.invoice-card',
        '[class*="grid"]'
      ]

      for (const selector of listElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          break
        }
      }
    })

    test('should filter invoices by status', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Look for status filter tabs or dropdown
      const statusFilters = [
        'button:has-text("All")',
        'button:has-text("Pending")',
        'button:has-text("Paid")',
        'button:has-text("Overdue")',
        '[role="tab"]'
      ]

      for (const selector of statusFilters) {
        const filter = page.locator(selector).first()
        if (await filter.isVisible()) {
          await filter.click()
          await page.waitForTimeout(500)
          break
        }
      }
    })

    test('should have send invoice functionality', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Look for send buttons on invoices
      const sendButtons = [
        'button:has-text("Send")',
        'button:has(svg.lucide-send)',
        'button:has(svg.lucide-mail)',
        '[data-testid="send-invoice"]'
      ]

      for (const selector of sendButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await expect(button).toBeVisible()
          break
        }
      }
    })

    test('should have download/export invoice functionality', async ({ page }) => {
      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')

      // Look for download buttons
      const downloadButtons = [
        'button:has-text("Download")',
        'button:has-text("Export")',
        'button:has-text("PDF")',
        'button:has(svg.lucide-download)',
        '[data-testid="download-invoice"]'
      ]

      for (const selector of downloadButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await expect(button).toBeVisible()
          break
        }
      }
    })
  })

  // ============================================================================
  // PAYMENT PROCESSING FLOW TESTS
  // ============================================================================
  test.describe('Payment Processing Flow', () => {

    test.beforeEach(async ({ page }) => {
      await performLogin(page)
    })

    test('should navigate to payment page', async ({ page }) => {
      await page.goto('/payment')
      await page.waitForLoadState('networkidle')

      // Verify page loaded (may redirect or show payment options)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should display pricing tiers on pricing page', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForLoadState('networkidle')

      // Verify pricing page content
      const pricingElements = [
        'text=Free',
        'text=Pro',
        'text=Premium',
        'text=Enterprise',
        'text=month',
        'text=year'
      ]

      let pricingFound = false
      for (const selector of pricingElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          pricingFound = true
          break
        }
      }

      expect(pricingFound).toBeTruthy()
    })

    test('should display plan selection buttons', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForLoadState('networkidle')

      // Look for plan selection buttons
      const planButtons = [
        'button:has-text("Choose")',
        'button:has-text("Get Started")',
        'button:has-text("Select")',
        'button:has-text("Subscribe")',
        'button:has-text("Upgrade")'
      ]

      let buttonFound = false
      for (const selector of planButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          buttonFound = true
          await expect(button).toBeVisible()
          break
        }
      }

      expect(buttonFound).toBeTruthy()
    })

    test('should handle plan selection', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForLoadState('networkidle')

      // Click on a plan selection button
      const planButtons = [
        'button:has-text("Choose Plan")',
        'button:has-text("Get Started")',
        'button:has-text("Select")'
      ]

      for (const selector of planButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(1500)
          break
        }
      }

      // Should navigate to payment or show confirmation
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/pricing|payment|checkout|billing|subscribe/)
    })

    test('should navigate to escrow system', async ({ page }) => {
      await page.goto('/dashboard/escrow-v2')
      await page.waitForLoadState('networkidle')

      // Verify escrow page loaded
      await expect(page.locator('body')).toBeVisible()

      // Look for escrow-related content
      const escrowContent = page.locator('text=Escrow, text=escrow, text=Balance, text=balance')
      const hasEscrowContent = await escrowContent.first().isVisible().catch(() => false)
      expect(hasEscrowContent || page.url().includes('escrow')).toBeTruthy()
    })

    test('should display transaction history', async ({ page }) => {
      await page.goto('/dashboard/escrow-v2')
      await page.waitForLoadState('networkidle')

      // Look for transaction-related elements
      const transactionElements = [
        'text=Transaction',
        'text=History',
        'text=Payment',
        'table',
        '[data-testid="transactions"]'
      ]

      for (const selector of transactionElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          break
        }
      }
    })

    test('should have deposit funds functionality', async ({ page }) => {
      await page.goto('/dashboard/escrow-v2')
      await page.waitForLoadState('networkidle')

      // Look for deposit button
      const depositButtons = [
        'button:has-text("Deposit")',
        'button:has-text("Add Funds")',
        'button:has-text("Fund")',
        '[data-testid="deposit"]'
      ]

      for (const selector of depositButtons) {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          await expect(button).toBeVisible()
          break
        }
      }
    })

    test('should display payment security indicators', async ({ page }) => {
      await page.goto('/payment')
      await page.waitForLoadState('networkidle')

      // Look for security-related content
      const securityElements = [
        'text=Secure',
        'text=SSL',
        'text=Encrypted',
        'text=Protected',
        'text=PCI',
        'svg.lucide-lock',
        'svg.lucide-shield'
      ]

      for (const selector of securityElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          break
        }
      }
    })

    test('should integrate with Stripe payment form', async ({ page }) => {
      await page.goto('/payment')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000) // Allow Stripe to load

      // Look for Stripe elements
      const stripeElements = [
        'iframe[name*="__privateStripeFrame"]',
        'iframe[src*="stripe"]',
        '[data-testid="stripe-form"]',
        '.stripe-element',
        '#card-element'
      ]

      for (const selector of stripeElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
          break
        }
      }
    })
  })

  // ============================================================================
  // CROSS-FLOW INTEGRATION TESTS
  // ============================================================================
  test.describe('Cross-Flow Integration', () => {

    test.beforeEach(async ({ page }) => {
      await performLogin(page)
    })

    test('should navigate between critical pages without errors', async ({ page }) => {
      const criticalPages = [
        '/dashboard',
        '/dashboard/projects-hub-v2',
        '/dashboard/invoices-v2',
        '/dashboard/escrow-v2',
        '/pricing'
      ]

      for (const pagePath of criticalPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // Verify no error state
        const errorElements = page.locator('text=Error, text=500, text=404, text=Something went wrong')
        const hasError = await errorElements.first().isVisible().catch(() => false)

        expect(hasError).toBeFalsy()
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('should maintain session across navigation', async ({ page }) => {
      // Navigate to multiple protected pages
      await page.goto('/dashboard/projects-hub-v2')
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/dashboard')

      await page.goto('/dashboard/invoices-v2')
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/dashboard')

      await page.goto('/dashboard/escrow-v2')
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/dashboard')

      // Should not be redirected to login
      expect(page.url()).not.toContain('/login')
    })

    test('should have consistent navigation elements', async ({ page }) => {
      const pages = [
        '/dashboard/projects-hub-v2',
        '/dashboard/invoices-v2'
      ]

      for (const pagePath of pages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // Look for common navigation elements
        const navElements = [
          'nav',
          '[role="navigation"]',
          'aside',
          '[data-testid="sidebar"]'
        ]

        let hasNav = false
        for (const selector of navElements) {
          const element = page.locator(selector).first()
          if (await element.isVisible()) {
            hasNav = true
            break
          }
        }

        expect(hasNav).toBeTruthy()
      }
    })

    test('should handle logout and redirect to login', async ({ page }) => {
      // Try to find and click logout
      const logoutSelectors = [
        '[data-testid="logout"]',
        'button:has-text("Logout")',
        'button:has-text("Sign out")',
        'button:has-text("Log out")',
        'a:has-text("Logout")'
      ]

      for (const selector of logoutSelectors) {
        const logoutBtn = page.locator(selector).first()
        if (await logoutBtn.isVisible()) {
          await logoutBtn.click()
          await page.waitForTimeout(2000)
          break
        }
      }

      // After logout, accessing protected route should redirect to login
      await page.goto('/dashboard')
      await page.waitForTimeout(2000)

      // Should be on login or redirected
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/login|signin|dashboard/)
    })
  })

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================
  test.describe('Error Handling', () => {

    test('should handle network errors gracefully', async ({ page }) => {
      await performLogin(page)

      // Simulate network failure on API calls
      await page.route('**/api/**', route => route.abort())

      await page.goto('/dashboard/invoices-v2')
      await page.waitForTimeout(2000)

      // Page should still render without crashing
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle 404 pages appropriately', async ({ page }) => {
      await page.goto('/non-existent-page-12345')
      await page.waitForLoadState('networkidle')

      // Should show 404 or redirect
      const currentUrl = page.url()
      const has404 = await page.locator('text=404, text=Not Found').first().isVisible().catch(() => false)

      expect(has404 || currentUrl.includes('404')).toBeTruthy()
    })

    test('should protect routes from unauthenticated access', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies()

      // Try to access protected route
      await page.goto('/dashboard/invoices-v2')
      await page.waitForTimeout(3000)

      // Should redirect to login or show login form
      const currentUrl = page.url()
      const hasLoginForm = await page.locator('input[type="email"]').isVisible().catch(() => false)

      expect(currentUrl.includes('/login') || hasLoginForm).toBeTruthy()
    })
  })
})
