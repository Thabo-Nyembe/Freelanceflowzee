import { test, expect } from '@playwright/test'

test.describe('AI Create', () => {
  test.beforeEach(async ({ page }) => {
          // Navigate to the AI Create page
    await page.goto('/dashboard/ai-create')
    await page.waitForLoadState('networkidle')
  })

  test('should display the main AI Create interface', async ({ page }) => {
    // Check main header
    await expect(page.getByRole('heading', { name: 'AI Create' })).toBeVisible()
    
    // Check description
    await expect(page.getByText('Generate professional assets tailored to your creative field')).toBeVisible()
    
    // Check tabs
    await expect(page.getByRole('tab', { name: 'Generate Assets' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Asset Library' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Advanced Settings' })).toBeVisible()
  })

  test('should display all creative fields', async ({ page }) => {
    // Check that all 6 creative fields are displayed
    await expect(page.getByText('Photography')).toBeVisible()
    await expect(page.getByText('Videography')).toBeVisible()
    await expect(page.getByText('Graphic Design')).toBeVisible()
    await expect(page.getByText('Music Production')).toBeVisible()
    await expect(page.getByText('Web Development')).toBeVisible()
    await expect(page.getByText('Content Writing')).toBeVisible()
    
    // Check that each field shows asset count
    await expect(page.getByText('5 asset types available')).toHaveCount(6)
  })

  test('should allow field selection and show asset types', async ({ page }) => {
    // Click on Photography field
    await page.getByText('Photography').click()
    
    // Wait for asset types to appear
    await expect(page.getByText('Choose Asset Type for Photography')).toBeVisible()
    
    // Check that photography asset types are displayed
    await expect(page.getByText('LUTs (Color Grading)')).toBeVisible()
    await expect(page.getByText('Lightroom Presets')).toBeVisible()
    await expect(page.getByText('Photoshop Actions')).toBeVisible()
    await expect(page.getByText('Photo Overlays')).toBeVisible()
    await expect(page.getByText('Portfolio Templates')).toBeVisible()
  })

  test('should show generation parameters after selecting asset type', async ({ page }) => {
    // Select Photography field
    await page.getByText('Photography').click()
    
    // Select LUTs asset type
    await page.getByText('LUTs (Color Grading)').click()
    
    // Wait for parameters section
    await expect(page.getByText('Customize Generation Parameters')).toBeVisible()
    
    // Check style dropdown
    await expect(page.getByRole('combobox').first()).toBeVisible()
    
    // Check color scheme dropdown
    await expect(page.getByRole('combobox').nth(1)).toBeVisible()
    
    // Check custom prompt textarea
    await expect(page.getByPlaceholder('Describe specific requirements')).toBeVisible()
    
    // Check generate button
    await expect(page.getByRole('button', { name: 'Generate AI Assets' })).toBeVisible()
  })

  test('should complete full asset generation workflow for photography LUTs', async ({ page }) => {
    // Select Photography
    await page.getByText('Photography').click()
    
    // Select LUTs
    await page.getByText('LUTs (Color Grading)').click()
    
    // Set style to "Cinematic"
    await page.getByRole('combobox').first().click()
    await page.getByText('Modern').click()
    
    // Set color scheme
    await page.getByRole('combobox').nth(1).click()
    await page.getByText('Vibrant').click()
    
    // Add custom prompt
    await page.getByPlaceholder('Describe specific requirements').fill('Create cinematic color grading LUTs with warm tones for sunset photography')
    
    // Start generation
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Check that generation starts
    await expect(page.getByText('Generating Assets...')).toBeVisible()
    
    // Wait for progress bar
    await expect(page.getByRole('progressbar')).toBeVisible()
    
    // Wait for generation to complete (max 10 seconds)
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
    
    // Check that assets are displayed
    await expect(page.getByText('Generated Assets (')).toBeVisible()
    
    // Check for asset cards
    const assetCards = page.locator('[data-testid="asset-card"]').or(page.locator('.aspect-video'))
    await expect(assetCards.first()).toBeVisible()
  })

  test('should work with videography transitions', async ({ page }) => {
    // Select Videography
    await page.getByText('Videography').click()
    
    // Select Video Transitions
    await page.getByText('Video Transitions').click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for completion
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should work with design templates', async ({ page }) => {
    // Select Graphic Design
    await page.getByText('Graphic Design').click()
    
    // Select Design Templates
    await page.getByText('Design Templates').click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for completion
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should work with music samples', async ({ page }) => {
    // Select Music Production
    await page.getByText('Music Production').click()
    
    // Select Audio Samples
    await page.getByText('Audio Samples').click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for completion
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should work with web components', async ({ page }) => {
    // Select Web Development
    await page.getByText('Web Development').click()
    
    // Select UI Components
    await page.getByText('UI Components').click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for completion
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should work with writing templates', async ({ page }) => {
    // Select Content Writing
    await page.getByText('Content Writing').click()
    
    // Select Content Templates
    await page.getByText('Content Templates').click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for completion
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should show asset preview modal', async ({ page }) => {
    // Complete generation workflow
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for assets
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
    
    // Click preview button (eye icon)
    const previewButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()
    await previewButton.click()
    
    // Check modal appears
    await expect(page.locator('.fixed.inset-0')).toBeVisible()
    
    // Check modal content
    await expect(page.getByRole('button', { name: 'Download Asset' })).toBeVisible()
  })

  test('should display AI model selection interface', async ({ page }) => {
    // Select a field and asset type to show model selection
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Check AI Model Selection section
    await expect(page.getByText('AI Model Selection')).toBeVisible()
    
    // Check model dropdown
    await expect(page.getByRole('combobox', { name: /select ai model/i })).toBeVisible()
    
    // Check default model is selected
    await expect(page.getByText('GPT-4o Mini')).toBeVisible()
    
    // Check model info display
    await expect(page.getByText('OpenAI')).toBeVisible()
    await expect(page.getByText('Fast')).toBeVisible()
    await expect(page.getByText('Good')).toBeVisible()
  })

  test('should allow switching between AI models', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Open model selection dropdown
    await page.getByRole('combobox', { name: /select ai model/i }).click()
    
    // Check available models
    await expect(page.getByText('GPT-3.5 Turbo')).toBeVisible()
    await expect(page.getByText('Claude 3 Haiku')).toBeVisible()
    await expect(page.getByText('Gemini Pro')).toBeVisible()
    await expect(page.getByText('Llama 2 7B')).toBeVisible()
    await expect(page.getByText('Mistral 7B')).toBeVisible()
    
    // Select a different model
    await page.getByText('Claude 3 Haiku').click()
    
    // Check model info updates
    await expect(page.getByText('Anthropic')).toBeVisible()
    await expect(page.getByText('Fast')).toBeVisible()
    await expect(page.getByText('Excellent')).toBeVisible()
  })

  test('should show custom API key interface when enabled', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Enable custom API toggle
    await page.getByRole('switch', { name: /use custom api/i }).click()
    
    // Check API key input appears
    await expect(page.getByPlaceholder('Enter your API key')).toBeVisible()
    
    // Check warning message
    await expect(page.getByText('Your API key will be used securely')).toBeVisible()
  })

  test('should display cost information for different models', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Check cost display for default model
    await expect(page.getByText('$0.01 per request')).toBeVisible()
    
    // Switch to a free model
    await page.getByRole('combobox', { name: /select ai model/i }).click()
    await page.getByText('Llama 2 7B').click()
    
    // Check free model indicator
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Hugging Face')).toBeVisible()
  })

  test('should generate assets with custom API key', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Enable custom API and add test key
    await page.getByRole('switch', { name: /use custom api/i }).click()
    await page.getByPlaceholder('Enter your API key').fill('test-api-key-12345')
    
    // Add custom prompt
    await page.getByPlaceholder('Describe specific requirements').fill('Create professional cinematic LUTs with warm sunset tones')
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Wait for generation to complete
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 15000 })
    
    // Check that AI enhancement was used (should show in metadata)
    await expect(page.getByText('AI Enhanced')).toBeVisible()
  })

  test('should show model performance indicators', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Check performance badges for default model
    await expect(page.getByText('Fast')).toBeVisible()
    await expect(page.getByText('Good')).toBeVisible()
    
    // Switch to premium model
    await page.getByRole('combobox', { name: /select ai model/i }).click()
    await page.getByText('GPT-3.5 Turbo').click()
    
    // Check updated performance indicators
    await expect(page.getByText('Fast')).toBeVisible()
    await expect(page.getByText('Good')).toBeVisible()
  })

  test('should validate API key requirement for paid models', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Enable custom API but don't provide key
    await page.getByRole('switch', { name: /use custom api/i }).click()
    
    // Try to generate without API key
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Should show validation error
    await expect(page.getByText('API key required')).toBeVisible()
  })

  test('should work with free models without API key', async ({ page }) => {
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Select free model
    await page.getByRole('combobox', { name: /select ai model/i }).click()
    await page.getByText('Llama 2 7B').click()
    
    // Enable custom API (should work without key for free models)
    await page.getByRole('switch', { name: /use custom api/i }).click()
    
    // Generate assets
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Should work without API key
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 15000 })
  })

  test('should show advanced settings tab', async ({ page }) => {
    // Click Advanced Settings tab
    await page.getByRole('tab', { name: 'Advanced Settings' }).click()
    
    // Check quality setting
    await expect(page.getByText('Quality Level')).toBeVisible()
    await expect(page.getByText('Standard - Balanced quality')).toBeVisible()
    
    // Check resolution setting
    await expect(page.getByText('Output Resolution')).toBeVisible()
    await expect(page.getByText('High (1440p)')).toBeVisible()
    
    // Check pro tip
    await expect(page.getByText('Pro Tip')).toBeVisible()
  })

  test('should show empty asset library', async ({ page }) => {
    // Click Asset Library tab
    await page.getByRole('tab', { name: 'Asset Library' }).click()
    
    // Check empty state
    await expect(page.getByText('No assets in library yet')).toBeVisible()
    await expect(page.getByText('Generate your first assets')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Generating' })).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and make it fail
    await page.route('/api/ai/create', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    // Try to generate assets
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    await page.getByRole('button', { name: 'Generate AI Assets' }).click()
    
    // Should still complete with mock assets
    await expect(page.getByText('Generated Assets')).toBeVisible({ timeout: 10000 })
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that interface is still usable
    await expect(page.getByRole('heading', { name: 'AI Create' })).toBeVisible()
    
    // Check fields are displayed in single column
    await expect(page.getByText('Photography')).toBeVisible()
    await expect(page.getByText('Videography')).toBeVisible()
  })

  test('should maintain state between tab switches', async ({ page }) => {
    // Select field and asset type
    await page.getByText('Photography').click()
    await page.getByText('LUTs (Color Grading)').click()
    
    // Switch to Advanced Settings
    await page.getByRole('tab', { name: 'Advanced Settings' }).click()
    
    // Switch back to Generate Assets
    await page.getByRole('tab', { name: 'Generate Assets' }).click()
    
    // Check that selection is maintained
    await expect(page.getByText('Choose Asset Type for Photography')).toBeVisible()
    await expect(page.getByText('Customize Generation Parameters')).toBeVisible()
  })
})

test.describe('AI Create API', () => {
  test('should return supported fields', async ({ request }) => {
    const response = await request.get('/api/ai/create')
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.message).toBe('AI Asset Generation API')
    expect(data.supportedFields).toContain('photography')
    expect(data.supportedFields).toContain('videography')
    expect(data.supportedFields).toContain('design')
    expect(data.supportedFields).toContain('music')
    expect(data.supportedFields).toContain('web')
    expect(data.supportedFields).toContain('writing')
  })

  test('should generate photography LUTs', async ({ request }) => {
    const response = await request.post('/api/ai/create', {
      data: {
        field: 'photography',
        assetType: 'luts',
        parameters: {
          style: 'modern',
          colorScheme: 'vibrant'
        },
        advancedSettings: {
          quality: 'standard',
          resolution: 'high'
        }
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.assets).toBeDefined()
    expect(data.assets.length).toBeGreaterThan(0)
    expect(data.metadata.field).toBe('photography')
    expect(data.metadata.assetType).toBe('luts')
  })

  test('should handle invalid field', async ({ request }) => {
    const response = await request.post('/api/ai/create', {
      data: {
        field: 'invalid-field',
        assetType: 'luts',
        parameters: {
          style: 'modern',
          colorScheme: 'vibrant'
        },
        advancedSettings: {
          quality: 'standard',
          resolution: 'high'
        }
      }
    })
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('Unsupported field')
  })

  test('should handle missing parameters', async ({ request }) => {
    const response = await request.post('/api/ai/create', {
      data: {
        field: 'photography'
        // Missing assetType and parameters
      }
    })
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('Missing required fields')
  })
})

test.describe('AI Create Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI Create page
    await page.goto('/dashboard/ai-create')
  })

  test('should render all tabs and basic functionality', async ({ page }) => {
    // Check if all tabs are present
    await expect(page.getByTestId('create-tab')).toBeVisible()
    await expect(page.getByTestId('library-tab')).toBeVisible()
    await expect(page.getByTestId('settings-tab')).toBeVisible()

    // Check if the create tab is active by default
    await expect(page.getByTestId('create-tab')).toHaveAttribute('data-state', 'active')

    // Test tab switching
    await page.getByTestId('library-tab').click()
    await expect(page.getByTestId('library-tab')).toHaveAttribute('data-state', 'active')

    await page.getByTestId('settings-tab').click()
    await expect(page.getByTestId('settings-tab')).toHaveAttribute('data-state', 'active')
  })

  test('should handle content generation flow', async ({ page }) => {
    // Type in the prompt
    await page.getByTestId('prompt-input').fill('Create a test image')
    
    // Select image type
    await page.getByRole('combobox').first().click()
    await page.getByText('Image').click()

    // Select quality
    await page.getByRole('combobox').nth(1).click()
    await page.getByText('Premium').click()

    // Generate button should be enabled
    const generateButton = page.getByTestId('generate-btn')
    await expect(generateButton).toBeEnabled()

    // Click generate and check loading state
    await generateButton.click()
    await expect(generateButton).toBeDisabled()
    await expect(generateButton).toHaveText('Generating...')

    // Wait for generation to complete
    await expect(generateButton).toBeEnabled({ timeout: 10000 })
    await expect(generateButton).toHaveText('Generate')
  })

  test('should handle settings changes', async ({ page }) => {
    // Go to settings tab
    await page.getByTestId('settings-tab').click()

    // Change creativity level
    await page.getByText('Creativity level').click()
    await page.getByText('Experimental').click()
    await expect(page.getByText('Experimental')).toBeVisible()

    // Change AI model
    await page.getByText('Select AI model').click()
    await page.getByText('GPT-4').click()
    await expect(page.getByText('GPT-4')).toBeVisible()
  })

  test('should validate input requirements', async ({ page }) => {
    // Generate button should be disabled without prompt
    await expect(page.getByTestId('generate-btn')).toBeDisabled()

    // Type short prompt
    await page.getByTestId('prompt-input').fill('test')
    await expect(page.getByTestId('generate-btn')).toBeEnabled()

    // Clear prompt
    await page.getByTestId('prompt-input').fill('')
    await expect(page.getByTestId('generate-btn')).toBeDisabled()
  })
}) 