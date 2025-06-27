import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;AI Create&apos;, () => {
  test.beforeEach(async ({ page }) => {
          // Navigate to the AI Create page
    await page.goto(&apos;/dashboard/ai-create&apos;)
    await page.waitForLoadState(&apos;networkidle&apos;)
  })

  test(&apos;should display the main AI Create interface&apos;, async ({ page }) => {
    // Check main header
    await expect(page.getByRole(&apos;heading&apos;, { name: &apos;AI Create&apos; })).toBeVisible()
    
    // Check description
    await expect(page.getByText(&apos;Generate professional assets tailored to your creative field&apos;)).toBeVisible()
    
    // Check tabs
    await expect(page.getByRole(&apos;tab&apos;, { name: &apos;Generate Assets&apos; })).toBeVisible()
    await expect(page.getByRole(&apos;tab&apos;, { name: &apos;Asset Library&apos; })).toBeVisible()
    await expect(page.getByRole(&apos;tab&apos;, { name: &apos;Advanced Settings&apos; })).toBeVisible()
  })

  test(&apos;should display all creative fields&apos;, async ({ page }) => {
    // Check that all 6 creative fields are displayed
    await expect(page.getByText(&apos;Photography&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Videography&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Graphic Design&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Music Production&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Web Development&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Content Writing&apos;)).toBeVisible()
    
    // Check that each field shows asset count
    await expect(page.getByText(&apos;5 asset types available&apos;)).toHaveCount(6)
  })

  test(&apos;should allow field selection and show asset types&apos;, async ({ page }) => {
    // Click on Photography field
    await page.getByText(&apos;Photography&apos;).click()
    
    // Wait for asset types to appear
    await expect(page.getByText(&apos;Choose Asset Type for Photography&apos;)).toBeVisible()
    
    // Check that photography asset types are displayed
    await expect(page.getByText(&apos;LUTs (Color Grading)&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Lightroom Presets&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Photoshop Actions&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Photo Overlays&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Portfolio Templates&apos;)).toBeVisible()
  })

  test(&apos;should show generation parameters after selecting asset type&apos;, async ({ page }) => {
    // Select Photography field
    await page.getByText(&apos;Photography&apos;).click()
    
    // Select LUTs asset type
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Wait for parameters section
    await expect(page.getByText(&apos;Customize Generation Parameters&apos;)).toBeVisible()
    
    // Check style dropdown
    await expect(page.getByRole(&apos;combobox&apos;).first()).toBeVisible()
    
    // Check color scheme dropdown
    await expect(page.getByRole(&apos;combobox&apos;).nth(1)).toBeVisible()
    
    // Check custom prompt textarea
    await expect(page.getByPlaceholder(&apos;Describe specific requirements&apos;)).toBeVisible()
    
    // Check generate button
    await expect(page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; })).toBeVisible()
  })

  test(&apos;should complete full asset generation workflow for photography LUTs&apos;, async ({ page }) => {
    // Select Photography
    await page.getByText(&apos;Photography&apos;).click()
    
    // Select LUTs
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Set style to &quot;Cinematic&quot;
    await page.getByRole(&apos;combobox&apos;).first().click()
    await page.getByText(&apos;Modern&apos;).click()
    
    // Set color scheme
    await page.getByRole(&apos;combobox&apos;).nth(1).click()
    await page.getByText(&apos;Vibrant&apos;).click()
    
    // Add custom prompt
    await page.getByPlaceholder(&apos;Describe specific requirements&apos;).fill(&apos;Create cinematic color grading LUTs with warm tones for sunset photography&apos;)
    
    // Start generation
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Check that generation starts
    await expect(page.getByText(&apos;Generating Assets...&apos;)).toBeVisible()
    
    // Wait for progress bar
    await expect(page.getByRole(&apos;progressbar&apos;)).toBeVisible()
    
    // Wait for generation to complete (max 10 seconds)
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
    
    // Check that assets are displayed
    await expect(page.getByText(&apos;Generated Assets (&apos;)).toBeVisible()
    
    // Check for asset cards
    const assetCards = page.locator(&apos;[data-testid=&quot;asset-card&quot;]&apos;).or(page.locator(&apos;.aspect-video&apos;))
    await expect(assetCards.first()).toBeVisible()
  })

  test(&apos;should work with videography transitions&apos;, async ({ page }) => {
    // Select Videography
    await page.getByText(&apos;Videography&apos;).click()
    
    // Select Video Transitions
    await page.getByText(&apos;Video Transitions&apos;).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for completion
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should work with design templates&apos;, async ({ page }) => {
    // Select Graphic Design
    await page.getByText(&apos;Graphic Design&apos;).click()
    
    // Select Design Templates
    await page.getByText(&apos;Design Templates&apos;).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for completion
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should work with music samples&apos;, async ({ page }) => {
    // Select Music Production
    await page.getByText(&apos;Music Production&apos;).click()
    
    // Select Audio Samples
    await page.getByText(&apos;Audio Samples&apos;).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for completion
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should work with web components&apos;, async ({ page }) => {
    // Select Web Development
    await page.getByText(&apos;Web Development&apos;).click()
    
    // Select UI Components
    await page.getByText(&apos;UI Components&apos;).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for completion
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should work with writing templates&apos;, async ({ page }) => {
    // Select Content Writing
    await page.getByText(&apos;Content Writing&apos;).click()
    
    // Select Content Templates
    await page.getByText(&apos;Content Templates&apos;).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for completion
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should show asset preview modal&apos;, async ({ page }) => {
    // Complete generation workflow
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for assets
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
    
    // Click preview button (eye icon)
    const previewButton = page.getByRole(&apos;button&apos;).filter({ has: page.locator(&apos;svg&apos;) }).first()
    await previewButton.click()
    
    // Check modal appears
    await expect(page.locator(&apos;.fixed.inset-0&apos;)).toBeVisible()
    
    // Check modal content
    await expect(page.getByRole(&apos;button&apos;, { name: &apos;Download Asset&apos; })).toBeVisible()
  })

  test(&apos;should display AI model selection interface&apos;, async ({ page }) => {
    // Select a field and asset type to show model selection
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Check AI Model Selection section
    await expect(page.getByText(&apos;AI Model Selection&apos;)).toBeVisible()
    
    // Check model dropdown
    await expect(page.getByRole(&apos;combobox&apos;, { name: /select ai model/i })).toBeVisible()
    
    // Check default model is selected
    await expect(page.getByText(&apos;GPT-4o Mini&apos;)).toBeVisible()
    
    // Check model info display
    await expect(page.getByText(&apos;OpenAI&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Fast&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Good&apos;)).toBeVisible()
  })

  test(&apos;should allow switching between AI models&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Open model selection dropdown
    await page.getByRole(&apos;combobox&apos;, { name: /select ai model/i }).click()
    
    // Check available models
    await expect(page.getByText(&apos;GPT-3.5 Turbo&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Claude 3 Haiku&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Gemini Pro&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Llama 2 7B&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Mistral 7B&apos;)).toBeVisible()
    
    // Select a different model
    await page.getByText(&apos;Claude 3 Haiku&apos;).click()
    
    // Check model info updates
    await expect(page.getByText(&apos;Anthropic&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Fast&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Excellent&apos;)).toBeVisible()
  })

  test(&apos;should show custom API key interface when enabled&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Enable custom API toggle
    await page.getByRole(&apos;switch&apos;, { name: /use custom api/i }).click()
    
    // Check API key input appears
    await expect(page.getByPlaceholder(&apos;Enter your API key&apos;)).toBeVisible()
    
    // Check warning message
    await expect(page.getByText(&apos;Your API key will be used securely&apos;)).toBeVisible()
  })

  test(&apos;should display cost information for different models&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Check cost display for default model
    await expect(page.getByText(&apos;$0.01 per request&apos;)).toBeVisible()
    
    // Switch to a free model
    await page.getByRole(&apos;combobox&apos;, { name: /select ai model/i }).click()
    await page.getByText(&apos;Llama 2 7B&apos;).click()
    
    // Check free model indicator
    await expect(page.getByText(&apos;Free&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Hugging Face&apos;)).toBeVisible()
  })

  test(&apos;should generate assets with custom API key&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Enable custom API and add test key
    await page.getByRole(&apos;switch&apos;, { name: /use custom api/i }).click()
    await page.getByPlaceholder(&apos;Enter your API key&apos;).fill(&apos;test-api-key-12345&apos;)
    
    // Add custom prompt
    await page.getByPlaceholder(&apos;Describe specific requirements&apos;).fill(&apos;Create professional cinematic LUTs with warm sunset tones&apos;)
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Wait for generation to complete
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 15000 })
    
    // Check that AI enhancement was used (should show in metadata)
    await expect(page.getByText(&apos;AI Enhanced&apos;)).toBeVisible()
  })

  test(&apos;should show model performance indicators&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Check performance badges for default model
    await expect(page.getByText(&apos;Fast&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Good&apos;)).toBeVisible()
    
    // Switch to premium model
    await page.getByRole(&apos;combobox&apos;, { name: /select ai model/i }).click()
    await page.getByText(&apos;GPT-3.5 Turbo&apos;).click()
    
    // Check updated performance indicators
    await expect(page.getByText(&apos;Fast&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Good&apos;)).toBeVisible()
  })

  test(&apos;should validate API key requirement for paid models&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Enable custom API but don&apos;t provide key
    await page.getByRole(&apos;switch&apos;, { name: /use custom api/i }).click()
    
    // Try to generate without API key
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Should show validation error
    await expect(page.getByText(&apos;API key required&apos;)).toBeVisible()
  })

  test(&apos;should work with free models without API key&apos;, async ({ page }) => {
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Select free model
    await page.getByRole(&apos;combobox&apos;, { name: /select ai model/i }).click()
    await page.getByText(&apos;Llama 2 7B&apos;).click()
    
    // Enable custom API (should work without key for free models)
    await page.getByRole(&apos;switch&apos;, { name: /use custom api/i }).click()
    
    // Generate assets
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Should work without API key
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 15000 })
  })

  test(&apos;should show advanced settings tab&apos;, async ({ page }) => {
    // Click Advanced Settings tab
    await page.getByRole(&apos;tab&apos;, { name: &apos;Advanced Settings&apos; }).click()
    
    // Check quality setting
    await expect(page.getByText(&apos;Quality Level&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Standard - Balanced quality&apos;)).toBeVisible()
    
    // Check resolution setting
    await expect(page.getByText(&apos;Output Resolution&apos;)).toBeVisible()
    await expect(page.getByText(&apos;High (1440p)&apos;)).toBeVisible()
    
    // Check pro tip
    await expect(page.getByText(&apos;Pro Tip&apos;)).toBeVisible()
  })

  test(&apos;should show empty asset library&apos;, async ({ page }) => {
    // Click Asset Library tab
    await page.getByRole(&apos;tab&apos;, { name: &apos;Asset Library&apos; }).click()
    
    // Check empty state
    await expect(page.getByText(&apos;No assets in library yet&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Generate your first assets&apos;)).toBeVisible()
    await expect(page.getByRole(&apos;button&apos;, { name: &apos;Start Generating&apos; })).toBeVisible()
  })

  test(&apos;should handle API errors gracefully&apos;, async ({ page }) => {
    // Intercept API call and make it fail
    await page.route(&apos;/api/ai/create&apos;, route => {
      route.fulfill({
        status: 500,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({ error: &apos;Internal server error&apos; })
      })
    })
    
    // Try to generate assets
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    await page.getByRole(&apos;button&apos;, { name: &apos;Generate AI Assets&apos; }).click()
    
    // Should still complete with mock assets
    await expect(page.getByText(&apos;Generated Assets&apos;)).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should be responsive on mobile&apos;, async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that interface is still usable
    await expect(page.getByRole(&apos;heading&apos;, { name: &apos;AI Create&apos; })).toBeVisible()
    
    // Check fields are displayed in single column
    await expect(page.getByText(&apos;Photography&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Videography&apos;)).toBeVisible()
  })

  test(&apos;should maintain state between tab switches&apos;, async ({ page }) => {
    // Select field and asset type
    await page.getByText(&apos;Photography&apos;).click()
    await page.getByText(&apos;LUTs (Color Grading)&apos;).click()
    
    // Switch to Advanced Settings
    await page.getByRole(&apos;tab&apos;, { name: &apos;Advanced Settings&apos; }).click()
    
    // Switch back to Generate Assets
    await page.getByRole(&apos;tab&apos;, { name: &apos;Generate Assets&apos; }).click()
    
    // Check that selection is maintained
    await expect(page.getByText(&apos;Choose Asset Type for Photography&apos;)).toBeVisible()
    await expect(page.getByText(&apos;Customize Generation Parameters&apos;)).toBeVisible()
  })
})

test.describe(&apos;AI Create API&apos;, () => {
  test(&apos;should return supported fields&apos;, async ({ request }) => {
    const response = await request.get(&apos;/api/ai/create&apos;)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.message).toBe(&apos;AI Asset Generation API&apos;)
    expect(data.supportedFields).toContain(&apos;photography&apos;)
    expect(data.supportedFields).toContain(&apos;videography&apos;)
    expect(data.supportedFields).toContain(&apos;design&apos;)
    expect(data.supportedFields).toContain(&apos;music&apos;)
    expect(data.supportedFields).toContain(&apos;web&apos;)
    expect(data.supportedFields).toContain(&apos;writing&apos;)
  })

  test(&apos;should generate photography LUTs&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/ai/create&apos;, {
      data: {
        field: &apos;photography&apos;,
        assetType: &apos;luts&apos;,
        parameters: {
          style: &apos;modern&apos;,
          colorScheme: &apos;vibrant&apos;
        },
        advancedSettings: {
          quality: &apos;standard&apos;,
          resolution: &apos;high&apos;
        }
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.assets).toBeDefined()
    expect(data.assets.length).toBeGreaterThan(0)
    expect(data.metadata.field).toBe(&apos;photography&apos;)
    expect(data.metadata.assetType).toBe(&apos;luts&apos;)
  })

  test(&apos;should handle invalid field&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/ai/create&apos;, {
      data: {
        field: &apos;invalid-field&apos;,
        assetType: &apos;luts&apos;,
        parameters: {
          style: &apos;modern&apos;,
          colorScheme: &apos;vibrant&apos;
        },
        advancedSettings: {
          quality: &apos;standard&apos;,
          resolution: &apos;high&apos;
        }
      }
    })
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain(&apos;Unsupported field&apos;)
  })

  test(&apos;should handle missing parameters&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/ai/create&apos;, {
      data: {
        field: &apos;photography&apos;
        // Missing assetType and parameters
      }
    })
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain(&apos;Missing required fields&apos;)
  })
})

test.describe(&apos;AI Create Component&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI Create page
    await page.goto(&apos;/dashboard/ai-create&apos;)
  })

  test(&apos;should render all tabs and basic functionality&apos;, async ({ page }) => {
    // Check if all tabs are present
    await expect(page.getByTestId(&apos;create-tab&apos;)).toBeVisible()
    await expect(page.getByTestId(&apos;library-tab&apos;)).toBeVisible()
    await expect(page.getByTestId(&apos;settings-tab&apos;)).toBeVisible()

    // Check if the create tab is active by default
    await expect(page.getByTestId(&apos;create-tab&apos;)).toHaveAttribute(&apos;data-state&apos;, &apos;active&apos;)

    // Test tab switching
    await page.getByTestId(&apos;library-tab&apos;).click()
    await expect(page.getByTestId(&apos;library-tab&apos;)).toHaveAttribute(&apos;data-state&apos;, &apos;active&apos;)

    await page.getByTestId(&apos;settings-tab&apos;).click()
    await expect(page.getByTestId(&apos;settings-tab&apos;)).toHaveAttribute(&apos;data-state&apos;, &apos;active&apos;)
  })

  test(&apos;should handle content generation flow&apos;, async ({ page }) => {
    // Type in the prompt
    await page.getByTestId(&apos;prompt-input&apos;).fill(&apos;Create a test image&apos;)
    
    // Select image type
    await page.getByRole(&apos;combobox&apos;).first().click()
    await page.getByText(&apos;Image&apos;).click()

    // Select quality
    await page.getByRole(&apos;combobox&apos;).nth(1).click()
    await page.getByText(&apos;Premium&apos;).click()

    // Generate button should be enabled
    const generateButton = page.getByTestId(&apos;generate-btn&apos;)
    await expect(generateButton).toBeEnabled()

    // Click generate and check loading state
    await generateButton.click()
    await expect(generateButton).toBeDisabled()
    await expect(generateButton).toHaveText(&apos;Generating...&apos;)

    // Wait for generation to complete
    await expect(generateButton).toBeEnabled({ timeout: 10000 })
    await expect(generateButton).toHaveText(&apos;Generate&apos;)
  })

  test(&apos;should handle settings changes&apos;, async ({ page }) => {
    // Go to settings tab
    await page.getByTestId(&apos;settings-tab&apos;).click()

    // Change creativity level
    await page.getByText(&apos;Creativity level&apos;).click()
    await page.getByText(&apos;Experimental&apos;).click()
    await expect(page.getByText(&apos;Experimental&apos;)).toBeVisible()

    // Change AI model
    await page.getByText(&apos;Select AI model&apos;).click()
    await page.getByText(&apos;GPT-4&apos;).click()
    await expect(page.getByText(&apos;GPT-4&apos;)).toBeVisible()
  })

  test(&apos;should validate input requirements&apos;, async ({ page }) => {
    // Generate button should be disabled without prompt
    await expect(page.getByTestId(&apos;generate-btn&apos;)).toBeDisabled()

    // Type short prompt
    await page.getByTestId(&apos;prompt-input&apos;).fill(&apos;test&apos;)
    await expect(page.getByTestId(&apos;generate-btn&apos;)).toBeEnabled()

    // Clear prompt
    await page.getByTestId(&apos;prompt-input&apos;).fill('&apos;)'
    await expect(page.getByTestId(&apos;generate-btn&apos;)).toBeDisabled()
  })
}) 