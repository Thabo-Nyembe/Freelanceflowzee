import { test, expect } from '@playwright/test'

test('Create test user and login to dashboard', async ({ page }) => {
  const testEmail = 'test@kazi.dev'
  const testPassword = 'test12345'

  console.log('\n🚀 Creating test user and logging in...\n')

  // Step 1: Go to signup page
  await page.goto('/signup')
  console.log('✅ Navigated to signup page')

  // Step 2: Fill signup form
  await page.locator('#firstName').fill('Test')
  await page.locator('#lastName').fill('User')
  await page.locator('#email').fill(testEmail)
  await page.locator('#password').fill(testPassword)

  // Step 3: Check terms checkbox
  const termsCheckbox = page.locator('#terms')
  await termsCheckbox.waitFor({ state: 'visible', timeout: 10000 })
  await termsCheckbox.check({ force: true })
  console.log('✅ Filled signup form')

  // Step 4: Submit signup
  await page.locator('button[type="submit"]').first().click()
  await page.waitForTimeout(3000)
  console.log('✅ Submitted signup form')

  // Step 5: Go to login page
  await page.goto('/login')
  console.log('✅ Navigated to login page')

  // Step 6: Login
  await page.locator('#email').fill(testEmail)
  await page.locator('#password').fill(testPassword)
  console.log('✅ Filled login form')

  // Step 7: Submit login
  await Promise.all([
    page.waitForURL('**/dashboard**', { timeout: 15000 }),
    page.locator('button[type="submit"]').first().click()
  ])

  console.log('✅ Successfully logged in!')
  console.log('📍 Current URL:', page.url())

  // Verify we're on the dashboard
  expect(page.url()).toContain('/dashboard')
  console.log('\n🎉 SUCCESS! You are now logged in to the dashboard!\n')

  // Keep browser open for a few seconds so you can see it
  await page.waitForTimeout(5000)
})
