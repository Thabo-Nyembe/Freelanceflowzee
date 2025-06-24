import { test, expect } from '@playwright/test'

test.describe('AI Create Page', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authentication
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