import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;AI Create Page&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authentication
    await page.goto(&apos;/dashboard/ai-create&apos;)
  })

  test(&apos;displays all tabs and asset types&apos;, async ({ page }) => {
    // Check tabs
    await expect(page.getByText(&apos;Create&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Library&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Settings&apos;)).toBeVisible()

    // Check asset type buttons
    await expect(page.getByText(&apos;Image&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Code&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Text&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Audio&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Video&apos;)).toBeVisible()
  })

  test(&apos;can switch between asset types&apos;, async ({ page }) => {
    // Click each asset type and verify it becomes active
    const assetTypes = [&apos;Image&apos;, &apos;Code&apos;, &apos;Text&apos;, &apos;Audio&apos;, &apos;Video&apos;]
    
    for (const type of assetTypes) {
      const button = page.getByText(type)
      await button.click()
      await expect(button).toHaveClass(/default/)
    }
  })

  test(&apos;can enter prompt and generate content&apos;, async ({ page }) => {
    // Enter prompt
    const prompt = &apos;Generate a test prompt&apos;
    await page.getByPlaceholder(&apos;Describe what you want to create...&apos;).fill(prompt)

    // Click generate
    await page.getByText(&apos;Generate&apos;).click()

    // Verify loading state
    await expect(page.getByText(&apos;Generating&apos;)).toBeVisible()

    // Wait for generation to complete
    await expect(page.getByText(&apos;Generating&apos;)).not.toBeVisible()

    // Verify content appears in library
    await page.getByText(&apos;Library&apos;).click()
    await expect(page.getByText(prompt)).toBeVisible()
  })

  test(&apos;can modify settings&apos;, async ({ page }) => {
    // Go to settings tab
    await page.getByText(&apos;Settings&apos;).click()

    // Change quality
    await page.getByText(&apos;Select quality&apos;).click()
    await page.getByText(&apos;Premium&apos;).click()
    await expect(page.getByText(&apos;Premium&apos;)).toBeVisible()

    // Change creativity
    const slider = page.locator(&apos;input[type=&quot;range&quot;]&apos;)
    await slider.click()
    
    // Change model
    await page.getByText(&apos;Select model&apos;).click()
    await page.getByText(&apos;GPT-4&apos;).click()
    await expect(page.getByText(&apos;GPT-4&apos;)).toBeVisible()

    // Go back to create tab and verify settings persist
    await page.getByText(&apos;Create&apos;).click()
    await page.getByText(&apos;Settings&apos;).click()
    await expect(page.getByText(&apos;Premium&apos;)).toBeVisible()
    await expect(page.getByText(&apos;GPT-4&apos;)).toBeVisible()
  })

  test(&apos;handles library actions&apos;, async ({ page }) => {
    // Generate content first
    const prompt = &apos;Test content for library actions&apos;
    await page.getByPlaceholder(&apos;Describe what you want to create...&apos;).fill(prompt)
    await page.getByText(&apos;Generate&apos;).click()
    await expect(page.getByText(&apos;Generating&apos;)).not.toBeVisible()

    // Go to library
    await page.getByText(&apos;Library&apos;).click()

    // Verify action buttons
    await expect(page.getByText(&apos;Download&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Share&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Delete&apos;)).toBeVisible()

    // Test delete action
    await page.getByText(&apos;Delete&apos;).click()
    await expect(page.getByText(prompt)).not.toBeVisible()
  })
}) 