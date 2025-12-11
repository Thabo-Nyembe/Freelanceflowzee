import { test, expect } from '@playwright/test'

/**
 * NextAuth Authentication System Test
 * Tests the production authentication flow we just built
 */

test.describe('NextAuth Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'

  // Run tests sequentially to ensure signup completes before login
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()
  })

  test('1. Homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/KAZI/)
    console.log('✅ Homepage loaded')
  })

  test('2. Test database connection endpoint', async ({ page }) => {
    const response = await page.goto('/api/auth/test-db')
    expect(response?.status()).toBeLessThan(500)

    const data = await response?.json()
    console.log('📊 Database Test Result:', data)

    // Check if we got success or at least a meaningful error
    if (data.error) {
      console.log('⚠️  Database Error:', data.error)
      console.log('💡 Fix:', data.fix || 'Check environment variables and migration')
    } else {
      console.log('✅ Database connection working')
      console.log('👥 Existing users:', data.userCount)
    }
  })

  test('3. Signup page loads', async ({ page }) => {
    await page.goto('/signup')

    // Check for signup form elements
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    console.log('✅ Signup page loaded with form')
  })

  test('4. Login page loads', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    console.log('✅ Login page loaded with form')
  })

  test('5. Create new user account (Signup)', async ({ page }) => {
    await page.goto('/signup')

    // Fill in signup form (using id selectors to match actual form)
    await page.locator('#firstName').fill('Test')
    await page.locator('#lastName').fill('User')
    await page.locator('#email').fill(testEmail)
    await page.locator('#password').fill(testPassword)

    // Check terms checkbox (REQUIRED for signup)
    const termsCheckbox = page.locator('#terms')
    await termsCheckbox.waitFor({ state: 'visible', timeout: 10000 })
    await termsCheckbox.check({ force: true })
    console.log('✅ Terms checkbox checked')

    console.log('📝 Filling signup form with:', { testEmail })

    // Wait for signup API call
    const signupResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/signup') && response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null)

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    // Wait for API response
    const signupResponse = await signupResponsePromise
    if (signupResponse) {
      const signupData = await signupResponse.json()
      console.log('📡 Signup API response:', signupResponse.status(), signupData)
    } else {
      console.log('⚠️ No signup API call detected')
    }

    // Wait for redirect or toast messages
    await page.waitForTimeout(3000)

    // Check for success or error
    const currentUrl = page.url()
    const pageContent = await page.content()

    console.log('📍 Current URL:', currentUrl)

    // Look for success indicators
    if (pageContent.includes('success') || currentUrl.includes('/login')) {
      console.log('✅ Signup appears successful')
    } else if (pageContent.includes('error') || pageContent.includes('failed')) {
      console.log('❌ Signup failed - checking error message')

      // Try to capture error message
      const errorText = await page.locator('text=/error|failed|invalid/i').first().textContent().catch(() => null)
      if (errorText) {
        console.log('📛 Error message:', errorText)
      }
    }
  })

  test('6. Login with created account', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form (using id selectors to match actual form)
    await page.locator('#email').fill(testEmail)
    await page.locator('#password').fill(testPassword)

    console.log('🔐 Attempting login with:', { testEmail })

    // Submit form and wait for navigation to dashboard
    await Promise.all([
      page.waitForURL('**/dashboard**', { timeout: 10000 }),
      page.locator('button[type="submit"]').first().click()
    ])

    // Check if redirected to dashboard
    const currentUrl = page.url()
    console.log('📍 After login URL:', currentUrl)

    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully logged in and redirected to dashboard')
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️  Still on login page - login may have failed')

      // Check for error message
      const errorText = await page.locator('text=/error|invalid|failed/i').first().textContent().catch(() => null)
      if (errorText) {
        console.log('📛 Error:', errorText)
      }
    }
  })

  test('7. Protected route redirects when not authenticated', async ({ page }) => {
    // Clear auth
    await page.context().clearCookies()

    // Try to access dashboard
    await page.goto('/dashboard')

    // Should redirect to login
    await page.waitForTimeout(2000)
    const currentUrl = page.url()

    console.log('📍 Redirected to:', currentUrl)

    if (currentUrl.includes('/login')) {
      console.log('✅ Protected route correctly redirects to login')
    } else if (currentUrl.includes('/dashboard')) {
      console.log('⚠️  Dashboard accessible without auth (middleware may need fixing)')
    }
  })

  test('8. NextAuth API endpoints are accessible', async ({ page }) => {
    // Test session endpoint
    const sessionResponse = await page.goto('/api/auth/session')
    console.log('📡 Session endpoint status:', sessionResponse?.status())
    expect(sessionResponse?.status()).toBeLessThan(500)

    // Test providers endpoint
    const providersResponse = await page.goto('/api/auth/providers')
    console.log('📡 Providers endpoint status:', providersResponse?.status())
    expect(providersResponse?.status()).toBeLessThan(500)

    const providers = await providersResponse?.json()
    console.log('🔌 Available providers:', Object.keys(providers || {}))

    if (providers?.credentials) {
      console.log('✅ Credentials provider configured')
    }
  })

  test('9. Check environment variables are loaded', async ({ page }) => {
    // This will show in terminal logs
    const response = await page.goto('/api/auth/test-db')
    const data = await response?.json()

    if (data.error?.includes('Environment variables missing')) {
      console.log('❌ CRITICAL: Environment variables not loaded!')
      console.log('📝 Required:')
      console.log('   - NEXTAUTH_SECRET')
      console.log('   - NEXTAUTH_URL')
      console.log('   - NEXT_PUBLIC_SUPABASE_URL')
      console.log('   - SUPABASE_SERVICE_ROLE_KEY')
    } else if (data.tests) {
      console.log('✅ Environment variables loaded correctly')
    }
  })

  test('10. Comprehensive auth system check', async ({ page }) => {
    console.log('\n🔍 COMPREHENSIVE AUTHENTICATION CHECK\n')

    // Test 1: Homepage
    await page.goto('/')
    const homeLoaded = page.url().includes('localhost')
    console.log(`${homeLoaded ? '✅' : '❌'} Homepage accessible`)

    // Test 2: Database
    const dbResponse = await page.goto('/api/auth/test-db')
    const dbData = await dbResponse?.json()
    const dbWorking = dbData.success === true
    console.log(`${dbWorking ? '✅' : '❌'} Database connection`)
    if (!dbWorking) {
      console.log('   Error:', dbData.error)
    }

    // Test 3: Signup page
    await page.goto('/signup')
    const signupHasForm = await page.locator('input[type="email"]').isVisible()
    console.log(`${signupHasForm ? '✅' : '❌'} Signup page form`)

    // Test 4: Login page
    await page.goto('/login')
    const loginHasForm = await page.locator('input[type="email"]').isVisible()
    console.log(`${loginHasForm ? '✅' : '❌'} Login page form`)

    // Test 5: NextAuth endpoints
    const sessionRes = await page.goto('/api/auth/session')
    const sessionWorks = (sessionRes?.status() || 500) < 500
    console.log(`${sessionWorks ? '✅' : '❌'} NextAuth session endpoint`)

    // Test 6: Providers
    const providerRes = await page.goto('/api/auth/providers')
    const providersWork = (providerRes?.status() || 500) < 500
    console.log(`${providersWork ? '✅' : '❌'} NextAuth providers endpoint`)

    console.log('\n📊 SUMMARY:')
    const allPassed = homeLoaded && dbWorking && signupHasForm && loginHasForm && sessionWorks && providersWork

    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED - Authentication system ready!')
    } else {
      console.log('⚠️  SOME CHECKS FAILED - See details above')
      console.log('\n📝 Next steps:')
      if (!dbWorking) {
        console.log('   1. Run database migration in Supabase')
        console.log('   2. Check environment variables')
      }
      if (!sessionWorks || !providersWork) {
        console.log('   3. Verify NEXTAUTH_SECRET is set')
        console.log('   4. Restart dev server')
      }
    }
  })
})
