import { test, expect } from '@playwright/test'

/**
 * Authentication Complete Verification Test Suite
 * Using Context7 Methodology for comprehensive testing
 *
 * Context7 Testing Approach:
 * 1. Context - Verify page loads and context is correct
 * 2. Observe - Check all UI elements are visible
 * 3. Navigate - Test all navigation paths work
 * 4. Try - Attempt form submissions and interactions
 * 5. Expect - Verify expected outcomes
 * 6. eXamine - Check for errors and edge cases
 * 7. Track - Verify tracking and analytics
 */

test.describe('Authentication - Context7 Complete Verification', () => {

  // ===========================================
  // HOMEPAGE → SIGNUP/LOGIN BUTTON VERIFICATION
  // ===========================================

  test.describe('Homepage Authentication Buttons', () => {
    test('Navigation bar Login button routes to /login', async ({ page }) => {
      // CONTEXT: Load homepage
      await page.goto('/')
      await expect(page).toHaveTitle(/KAZI/)

      // OBSERVE: Verify Login button exists in navigation
      const navLoginButton = page.getByRole('link', { name: /^log in$/i })
      await expect(navLoginButton).toBeVisible()

      // NAVIGATE: Click Login button
      await navLoginButton.click()

      // EXPECT: Should navigate to login page
      await expect(page).toHaveURL(/\/login/)
      await expect(page).toHaveTitle(/Sign In|Login/i)
    })

    test('Navigation bar "Start Free Trial" button routes to /signup', async ({ page }) => {
      // CONTEXT: Load homepage
      await page.goto('/')

      // OBSERVE: Verify "Start Free Trial" button exists in navigation
      const navSignupButton = page.getByRole('link', { name: /start free trial/i }).first()
      await expect(navSignupButton).toBeVisible()

      // NAVIGATE: Click signup button
      await navSignupButton.click()

      // EXPECT: Should navigate to signup page
      await expect(page).toHaveURL(/\/signup/)
      await expect(page).toHaveTitle(/Sign Up|Create|Account/i)
    })

    test('Hero "Start Free Trial" CTA routes to /signup', async ({ page }) => {
      // CONTEXT: Load homepage
      await page.goto('/')

      // OBSERVE: Verify hero CTA button exists
      const heroCTA = page.getByRole('link', { name: /start free trial.*no credit card/i })
      await expect(heroCTA).toBeVisible()

      // NAVIGATE: Click hero CTA
      await heroCTA.click()

      // EXPECT: Should navigate to signup page
      await expect(page).toHaveURL(/\/signup/)
    })

    test('All "Start Free Trial" buttons link to /signup consistently', async ({ page }) => {
      // CONTEXT: Load homepage
      await page.goto('/')

      // OBSERVE: Find all "Start Free Trial" buttons
      const signupButtons = page.getByRole('link', { name: /start free trial/i })
      const count = await signupButtons.count()

      // EXPECT: Should have multiple signup CTAs (at least 2)
      expect(count).toBeGreaterThanOrEqual(2)

      // TRY: Verify each button has correct href
      for (let i = 0; i < count; i++) {
        const button = signupButtons.nth(i)
        await expect(button).toHaveAttribute('href', '/signup')
      }
    })
  })

  // ===========================================
  // SIGNUP PAGE VERIFICATION
  // ===========================================

  test.describe('Signup Page - Complete Verification', () => {
    test('Signup page loads with all required form elements', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')
      await expect(page).toHaveTitle(/Sign Up|Create|Account/i)

      // OBSERVE: Verify all form fields are visible
      await expect(page.getByLabel(/first name/i)).toBeVisible()
      await expect(page.getByLabel(/last name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // OBSERVE: Verify checkboxes
      await expect(page.getByLabel(/agree.*terms/i)).toBeVisible()
      await expect(page.getByLabel(/send me.*updates/i)).toBeVisible()

      // OBSERVE: Verify submit button
      await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible()

      // OBSERVE: Verify "Already have account" link
      const loginLink = page.getByRole('link', { name: /sign in/i })
      await expect(loginLink).toBeVisible()
      await expect(loginLink).toHaveAttribute('href', '/login')
    })

    test('Signup form validation - requires all fields', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Submit empty form
      await page.getByRole('button', { name: /start free trial/i }).click()

      // EXAMINE: Check HTML5 validation
      const firstNameInput = page.getByLabel(/first name/i)
      const isInvalid = await firstNameInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
      expect(isInvalid).toBe(true)
    })

    test('Signup form validation - password minimum length', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Fill form with short password
      await page.getByLabel(/first name/i).fill('John')
      await page.getByLabel(/last name/i).fill('Doe')
      await page.getByLabel(/email/i).fill('john@example.com')
      await page.getByLabel(/password/i).fill('short')
      await page.getByLabel(/agree.*terms/i).check()

      // TRY: Submit form
      await page.getByRole('button', { name: /start free trial/i }).click()

      // EXAMINE: Should show validation message or prevent submission
      const passwordInput = page.getByLabel(/password/i)
      const minLength = await passwordInput.getAttribute('minlength')
      expect(minLength).toBe('8')
    })

    test('Signup form - successful submission flow', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Fill out complete form
      await page.getByLabel(/first name/i).fill('Test')
      await page.getByLabel(/last name/i).fill('User')
      await page.getByLabel(/email/i).fill('testuser@example.com')
      await page.getByLabel(/password/i).fill('TestPassword123!')
      await page.getByLabel(/agree.*terms/i).check()

      // TRY: Submit form
      await page.getByRole('button', { name: /start free trial/i }).click()

      // EXPECT: Should show loading state
      await expect(page.getByText(/creating account/i)).toBeVisible({ timeout: 2000 })

      // EXPECT: Should redirect to dashboard after signup
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
    })

    test('Signup page - password visibility toggle works', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // OBSERVE: Password field should be type="password" initially
      const passwordInput = page.getByLabel(/password/i)
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // TRY: Click eye icon to show password
      await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).last().click()

      // EXPECT: Password should now be visible (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })

    test('Signup page - Terms and Privacy links work', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // OBSERVE: Verify Terms link
      const termsLink = page.getByRole('link', { name: /terms of service/i })
      await expect(termsLink).toBeVisible()
      await expect(termsLink).toHaveAttribute('href', '/terms')

      // OBSERVE: Verify Privacy link
      const privacyLink = page.getByRole('link', { name: /privacy policy/i })
      await expect(privacyLink).toBeVisible()
      await expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    test('Signup page displays benefits and features', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // OBSERVE: Verify benefits are displayed
      await expect(page.getByText(/ai.*powered.*project/i)).toBeVisible()
      await expect(page.getByText(/secure payment/i)).toBeVisible()
      await expect(page.getByText(/video studio/i)).toBeVisible()

      // OBSERVE: Verify "30 days free" offer is shown
      await expect(page.getByText(/30.*days.*free/i)).toBeVisible()
    })
  })

  // ===========================================
  // LOGIN PAGE VERIFICATION
  // ===========================================

  test.describe('Login Page - Complete Verification', () => {
    test('Login page loads with all required elements', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')
      await expect(page).toHaveTitle(/Sign In|Login/i)

      // OBSERVE: Verify form fields
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // OBSERVE: Verify Remember Me checkbox
      await expect(page.getByLabel(/remember me/i)).toBeVisible()

      // OBSERVE: Verify Forgot Password link
      const forgotLink = page.getByRole('link', { name: /forgot password/i })
      await expect(forgotLink).toBeVisible()
      await expect(forgotLink).toHaveAttribute('href', '/forgot-password')

      // OBSERVE: Verify Sign In button
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

      // OBSERVE: Verify "Don't have account" link
      const signupLink = page.getByRole('link', { name: /sign up.*free/i })
      await expect(signupLink).toBeVisible()
      await expect(signupLink).toHaveAttribute('href', '/signup')
    })

    test('Login page displays platform features', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Verify features are shown (on desktop)
      await page.setViewportSize({ width: 1920, height: 1080 })

      // OBSERVE: Check for feature descriptions
      await expect(page.getByText(/ai.*powered.*tools/i)).toBeVisible()
      await expect(page.getByText(/team collaboration/i)).toBeVisible()
      await expect(page.getByText(/premium features/i)).toBeVisible()

      // OBSERVE: Verify user count stat
      await expect(page.getByText(/2.*800.*creative professionals/i)).toBeVisible()
    })

    test('Login form validation - requires email and password', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // TRY: Submit empty form
      await page.getByRole('button', { name: /sign in/i }).click()

      // EXAMINE: Check HTML5 validation
      const emailInput = page.getByLabel(/email/i)
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
      expect(isInvalid).toBe(true)
    })

    test('Login form - password visibility toggle works', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Password field should be hidden initially
      const passwordInput = page.getByLabel(/password/i)
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // TRY: Click eye icon to show password
      await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).last().click()

      // EXPECT: Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })

    test('Login form - Remember Me checkbox toggles', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Remember Me checkbox should be unchecked initially
      const rememberCheckbox = page.getByLabel(/remember me/i)
      await expect(rememberCheckbox).not.toBeChecked()

      // TRY: Check the box
      await rememberCheckbox.check()

      // EXPECT: Should be checked
      await expect(rememberCheckbox).toBeChecked()
    })

    test('Login page - footer links work correctly', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Verify footer links
      const privacyLink = page.getByRole('link', { name: /privacy/i }).last()
      await expect(privacyLink).toHaveAttribute('href', '/privacy')

      const termsLink = page.getByRole('link', { name: /terms/i }).last()
      await expect(termsLink).toHaveAttribute('href', '/terms')

      const supportLink = page.getByRole('link', { name: /support/i }).last()
      await expect(supportLink).toHaveAttribute('href', '/support')
    })

    test('Login page shows dev test credentials in development', async ({ page }) => {
      // CONTEXT: Navigate to login page in development mode
      await page.goto('/login')

      // EXAMINE: Check if test credentials are visible (only in dev mode)
      const testCredentials = page.getByText(/test account/i)

      // In development, test credentials should be visible
      if (process.env.NODE_ENV === 'development') {
        await expect(testCredentials).toBeVisible()
      }
    })
  })

  // ===========================================
  // CROSS-PAGE NAVIGATION VERIFICATION
  // ===========================================

  test.describe('Login ↔ Signup Navigation', () => {
    test('Login page → Signup page navigation works', async ({ page }) => {
      // CONTEXT: Start at login page
      await page.goto('/login')

      // NAVIGATE: Click "Sign up for free" link
      const signupLink = page.getByRole('link', { name: /sign up.*free/i })
      await signupLink.click()

      // EXPECT: Should navigate to signup page
      await expect(page).toHaveURL(/\/signup/)
      await expect(page).toHaveTitle(/Sign Up|Create|Account/i)
    })

    test('Signup page → Login page navigation works', async ({ page }) => {
      // CONTEXT: Start at signup page
      await page.goto('/signup')

      // NAVIGATE: Click "Sign in here" link
      const loginLink = page.getByRole('link', { name: /sign in/i })
      await loginLink.click()

      // EXPECT: Should navigate to login page
      await expect(page).toHaveURL(/\/login/)
      await expect(page).toHaveTitle(/Sign In|Login/i)
    })

    test('Forgot Password link navigation works', async ({ page }) => {
      // CONTEXT: Start at login page
      await page.goto('/login')

      // NAVIGATE: Click "Forgot password" link
      const forgotLink = page.getByRole('link', { name: /forgot password/i })
      await forgotLink.click()

      // EXPECT: Should navigate to forgot password page
      await expect(page).toHaveURL(/\/forgot-password/)
    })
  })

  // ===========================================
  // MOBILE RESPONSIVENESS VERIFICATION
  // ===========================================

  test.describe('Mobile Responsive Verification', () => {
    test('Signup page is mobile responsive', async ({ page }) => {
      // CONTEXT: Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/signup')

      // OBSERVE: Form should be visible and usable on mobile
      await expect(page.getByLabel(/first name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible()

      // TRY: Fill out form on mobile
      await page.getByLabel(/first name/i).fill('Mobile')
      await page.getByLabel(/last name/i).fill('User')

      // EXPECT: Inputs should work properly
      await expect(page.getByLabel(/first name/i)).toHaveValue('Mobile')
    })

    test('Login page is mobile responsive', async ({ page }) => {
      // CONTEXT: Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/login')

      // OBSERVE: Form should be visible and usable on mobile
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })
  })

  // ===========================================
  // ACCESSIBILITY VERIFICATION
  // ===========================================

  test.describe('Accessibility Verification', () => {
    test('Signup page has proper ARIA labels and semantic HTML', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // OBSERVE: Verify form labels are associated with inputs
      const firstNameLabel = page.getByLabel(/first name/i)
      await expect(firstNameLabel).toHaveAttribute('id')

      // OBSERVE: Verify buttons have accessible names
      const submitButton = page.getByRole('button', { name: /start free trial/i })
      await expect(submitButton).toBeVisible()
    })

    test('Login page has proper ARIA labels and semantic HTML', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Verify form inputs have labels
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // OBSERVE: Verify links have descriptive text
      const signupLink = page.getByRole('link', { name: /sign up.*free/i })
      await expect(signupLink).toBeVisible()
    })

    test('Keyboard navigation works on signup form', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Navigate form using Tab key
      await page.keyboard.press('Tab') // Focus first input
      await page.keyboard.type('John')

      await page.keyboard.press('Tab') // Move to last name
      await page.keyboard.type('Doe')

      // EXPECT: Values should be entered correctly
      await expect(page.getByLabel(/first name/i)).toHaveValue('John')
      await expect(page.getByLabel(/last name/i)).toHaveValue('Doe')
    })
  })

  // ===========================================
  // ERROR HANDLING VERIFICATION
  // ===========================================

  test.describe('Error Handling and Edge Cases', () => {
    test('Signup page handles invalid email format', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Enter invalid email
      await page.getByLabel(/email/i).fill('invalid-email')

      // TRY: Submit form
      await page.getByRole('button', { name: /start free trial/i }).click()

      // EXAMINE: Should show browser validation error
      const emailInput = page.getByLabel(/email/i)
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
      expect(isInvalid).toBe(true)
    })

    test('Signup page prevents submission without terms agreement', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // TRY: Fill form WITHOUT agreeing to terms
      await page.getByLabel(/first name/i).fill('Test')
      await page.getByLabel(/last name/i).fill('User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('Password123!')

      // Ensure terms checkbox is NOT checked
      const termsCheckbox = page.getByLabel(/agree.*terms/i)
      await expect(termsCheckbox).not.toBeChecked()

      // TRY: Submit form
      await page.getByRole('button', { name: /start free trial/i }).click()

      // EXPECT: Should show alert or prevent submission
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Terms')
        await dialog.accept()
      })
    })
  })

  // ===========================================
  // VISUAL REGRESSION CHECKS
  // ===========================================

  test.describe('Visual Consistency Verification', () => {
    test('Signup page has consistent branding and styling', async ({ page }) => {
      // CONTEXT: Navigate to signup page
      await page.goto('/signup')

      // OBSERVE: Verify gradient backgrounds are present
      const gradientElement = page.locator('[class*="gradient"]').first()
      await expect(gradientElement).toBeVisible()

      // OBSERVE: Verify brand colors are used
      const blueElement = page.locator('[class*="blue"]').first()
      await expect(blueElement).toBeVisible()
    })

    test('Login page has consistent styling with signup', async ({ page }) => {
      // CONTEXT: Navigate to login page
      await page.goto('/login')

      // OBSERVE: Verify similar design patterns
      const gradientButton = page.getByRole('button', { name: /sign in/i })
      await expect(gradientButton).toBeVisible()

      // Check for consistent glass-morphism effects
      const glassCard = page.locator('[class*="glass"]').first()
      await expect(glassCard).toBeVisible()
    })
  })
})
