import { test, expect } from '@playwright/test'

/**
 * AI Create Page E2E Tests
 *
 * These tests verify the AI content generation functionality.
 * Authentication is handled via test user cookies or the auth flow below.
 */
test.describe('AI Create Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication using test credentials
    // In production tests, use Playwright's storageState for persistent auth
    // See: https://playwright.dev/docs/auth#reuse-signed-in-state

    // For local development, we use a test user session
    // The auth state is preserved via playwright.config.ts storageState option

    // Navigate to login first if not authenticated
    await page.goto('/auth/login')

    // Check if already authenticated (redirected to dashboard)
    if (page.url().includes('/auth/login')) {
      // Fill in test credentials
      await page.fill('[data-testid="email-input"], input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com')
      await page.fill('[data-testid="password-input"], input[type="password"]', process.env.TEST_USER_PASSWORD || 'testpassword123')
      await page.click('[data-testid="login-button"], button[type="submit"]')

      // Wait for authentication to complete
      await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => {
        // If login fails in test environment, continue anyway (component may be publicly accessible)
      })
    }

    // Navigate to AI Create page
    await page.goto('/dashboard/ai-create')
  })

  test('displays all tabs and asset types', async ({ page }) => {
    // Check tabs
    await expect(page.getByText('Create')).toBeVisible()
    await expect(page.getByText('Library')).toBeVisible()
    await expect(page.getByText('Settings')).toBeVisible()

    // Check asset type buttons
    await expect(page.getByText('Image')).toBeVisible()
    await expect(page.getByText('Code')).toBeVisible()
    await expect(page.getByText('Text')).toBeVisible()
    await expect(page.getByText('Audio')).toBeVisible()
    await expect(page.getByText('Video')).toBeVisible()
  })

  test('can switch between asset types', async ({ page }) => {
    // Click each asset type and verify it becomes active
    const assetTypes = ['Image', 'Code', 'Text', 'Audio', 'Video']
    
    for (const type of assetTypes) {
      const button = page.getByText(type)
      await button.click()
      await expect(button).toHaveClass(/default/)
    }
  })

  test('can enter prompt and generate content', async ({ page }) => {
    // Enter prompt
    const prompt = 'Generate a test prompt'
    await page.getByPlaceholder('Describe what you want to create...').fill(prompt)

    // Click generate
    await page.getByText('Generate').click()

    // Verify loading state
    await expect(page.getByText('Generating')).toBeVisible()

    // Wait for generation to complete
    await expect(page.getByText('Generating')).not.toBeVisible()

    // Verify content appears in library
    await page.getByText('Library').click()
    await expect(page.getByText(prompt)).toBeVisible()
  })

  test('can modify settings', async ({ page }) => {
    // Go to settings tab
    await page.getByText('Settings').click()

    // Change quality
    await page.getByText('Select quality').click()
    await page.getByText('Premium').click()
    await expect(page.getByText('Premium')).toBeVisible()

    // Change creativity
    const slider = page.locator('input[type="range"]')
    await slider.click()
    
    // Change model
    await page.getByText('Select model').click()
    await page.getByText('GPT-4').click()
    await expect(page.getByText('GPT-4')).toBeVisible()

    // Go back to create tab and verify settings persist
    await page.getByText('Create').click()
    await page.getByText('Settings').click()
    await expect(page.getByText('Premium')).toBeVisible()
    await expect(page.getByText('GPT-4')).toBeVisible()
  })

  test('handles library actions', async ({ page }) => {
    // Generate content first
    const prompt = 'Test content for library actions'
    await page.getByPlaceholder('Describe what you want to create...').fill(prompt)
    await page.getByText('Generate').click()
    await expect(page.getByText('Generating')).not.toBeVisible()

    // Go to library
    await page.getByText('Library').click()

    // Verify action buttons
    await expect(page.getByText('Download')).toBeVisible()
    await expect(page.getByText('Share')).toBeVisible()
    await expect(page.getByText('Delete')).toBeVisible()

    // Test delete action
    await page.getByText('Delete').click()
    await expect(page.getByText(prompt)).not.toBeVisible()
  })
}) 