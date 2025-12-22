import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:9323/login')

    // Check page title
    await expect(page).toHaveTitle(/KAZI/)

    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    // Check OAuth providers
    await expect(page.locator('button:has-text("Google")').or(page.locator('button svg[viewBox="0 0 488 512"]'))).toBeVisible()

    console.log('✅ Login page loads correctly')
  })

  test('signup page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:9323/signup')

    // Check signup form elements
    await expect(page.locator('input#firstName')).toBeVisible()
    await expect(page.locator('input#lastName')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible()

    console.log('✅ Signup page loads correctly')
  })

  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/login/)

    console.log('✅ Dashboard redirects unauthenticated users to login')
  })

  test('can fill login form', async ({ page }) => {
    await page.goto('http://localhost:9323/login')

    // Wait for form to be ready
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    await emailInput.waitFor({ state: 'visible' })
    await passwordInput.waitFor({ state: 'visible' })

    // Clear and fill in the form with explicit waits
    await emailInput.click()
    await emailInput.fill('test@kazi.dev')

    await passwordInput.click()
    await passwordInput.fill('test12345')

    // Check values are filled with timeout
    await expect(emailInput).toHaveValue('test@kazi.dev', { timeout: 5000 })
    await expect(passwordInput).toHaveValue('test12345', { timeout: 5000 })

    console.log('✅ Login form can be filled')
  })

  test('forgot password link works', async ({ page }) => {
    await page.goto('http://localhost:9323/login')

    // Click forgot password
    await page.click('a[href="/forgot-password"]')

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/forgot-password/)

    console.log('✅ Forgot password link works')
  })

  test('signup link from login works', async ({ page }) => {
    await page.goto('http://localhost:9323/login')

    // Click sign up link
    await page.click('a[href="/signup"]')

    // Should navigate to signup page
    await expect(page).toHaveURL(/signup/)

    console.log('✅ Signup link works')
  })
})
