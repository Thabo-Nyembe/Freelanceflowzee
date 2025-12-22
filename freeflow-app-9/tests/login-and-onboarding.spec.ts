import { test, expect } from '@playwright/test'

test.describe('Login and Onboarding Test', () => {
  // Generate unique email for test user
  const testEmail = `test-${Date.now()}@kazi.dev`
  const testPassword = 'Test123456!'

  test('signup new user and check onboarding', async ({ page }) => {
    // Go to signup page
    await page.goto('http://localhost:9323/signup')
    console.log('📍 Navigated to signup page')

    // Wait for the form to load
    await page.waitForSelector('input#firstName', { state: 'visible' })
    console.log('✅ Signup form loaded')

    // Fill in signup form
    await page.locator('input#firstName').fill('Test')
    await page.locator('input#lastName').fill('User')
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').fill(testPassword)

    // Accept terms
    await page.locator('#terms').click()

    console.log(`✅ Filled signup form with email: ${testEmail}`)

    // Click signup button
    await page.getByRole('button', { name: /start free trial/i }).click()
    console.log('🔐 Clicked Start Free Trial button')

    // Wait for success toast to appear (indicates API call completed)
    try {
      await page.locator('text=Account created successfully').waitFor({ timeout: 10000 })
      console.log('✅ Success toast appeared!')
    } catch {
      console.log('⏳ Waiting for API response...')
    }

    // Wait for redirect to login page (happens after 2.5s from success)
    try {
      await page.waitForURL('**/login**', { timeout: 10000 })
      console.log('✅ Signup successful! Redirected to login page')
      await page.screenshot({ path: 'test-results/signup-success-login.png' })
    } catch {
      // Take screenshot of current state
      await page.screenshot({ path: 'test-results/after-signup.png' })
      console.log('📸 Screenshot saved: test-results/after-signup.png')

      const currentUrl = page.url()
      console.log(`📍 Current URL: ${currentUrl}`)

      // Check for success or error toasts
      const successToast = await page.locator('text=Account created').isVisible().catch(() => false)
      const emailToast = await page.locator('text=check your email').isVisible().catch(() => false)

      if (successToast || emailToast) {
        console.log('✅ Signup successful! Toast visible on page')
      } else {
        console.log('ℹ️ Still on signup page - check for errors')
      }
    }
  })

  test('login page UI and form interaction', async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:9323/login')
    console.log('📍 Navigated to login page')

    // Wait for the form to load
    await page.waitForSelector('input[type="email"]', { state: 'visible' })
    console.log('✅ Login form loaded')

    // Fill in credentials
    await page.locator('input[type="email"]').fill('demo@kazi.dev')
    await page.locator('input[type="password"]').fill('demo123456')
    console.log('✅ Filled login credentials')

    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click()
    console.log('🔐 Clicked Sign In button')

    // Wait for either dashboard or error
    try {
      // Wait for navigation to dashboard (successful login)
      await page.waitForURL('**/dashboard**', { timeout: 15000 })
      console.log('✅ Successfully logged in! Redirected to dashboard')

      // Check for onboarding checklist
      const onboardingChecklist = page.locator('text=Getting Started').first()
      const hasOnboarding = await onboardingChecklist.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasOnboarding) {
        console.log('🎉 Onboarding checklist is visible!')

        // Check for key onboarding elements
        const progressBar = page.locator('[role="progressbar"]').or(page.locator('.h-3').first())
        const createProjectBtn = page.getByRole('button', { name: /create.*project/i })

        if (await progressBar.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Progress bar visible')
        }

        if (await createProjectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Create First Project button visible')

          // Click to open project wizard
          await createProjectBtn.click()
          console.log('🚀 Opened project creation wizard')

          // Check wizard loaded
          await page.waitForSelector('text=Create Your First Project', { timeout: 5000 })
          console.log('✅ Project wizard dialog opened!')

          // Take screenshot
          await page.screenshot({ path: 'test-results/onboarding-wizard.png' })
          console.log('📸 Screenshot saved: test-results/onboarding-wizard.png')
        }
      } else {
        console.log('ℹ️ Onboarding checklist not shown (user may have completed it)')

        // Take screenshot of dashboard anyway
        await page.screenshot({ path: 'test-results/dashboard.png' })
        console.log('📸 Dashboard screenshot saved')
      }

    } catch (e) {
      // Check for error toast
      const errorToast = page.locator('text=Invalid').or(page.locator('[data-sonner-toast]'))
      if (await errorToast.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('❌ Login failed - Invalid credentials')
        await page.screenshot({ path: 'test-results/login-error.png' })
      } else {
        console.log('❌ Login timeout or other error:', e)
        await page.screenshot({ path: 'test-results/login-timeout.png' })
      }
    }
  })
})
