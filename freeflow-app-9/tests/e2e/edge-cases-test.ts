import { test, expect } from '@playwright/test'

test.describe('Edge Cases Test Suite', () => {
  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2s delay
      await route.continue()
    })

    await page.goto('/')
    
    // Check if loading states are shown
    const loadingIndicator = await page.getByTestId('loading-spinner')
    await expect(loadingIndicator).toBeVisible()
    
    // Check if content eventually loads
    const mainContent = await page.getByTestId('main-content')
    await expect(mainContent).toBeVisible()
  })

  test('should handle large file uploads', async ({ page }) => {
    await page.goto('/upload')
    
    // Create a large file (10MB)
    const largeFile = await page.evaluate(() => {
      const buffer = new ArrayBuffer(10 * 1024 * 1024)
      return {
        name: 'large-file.bin',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from(buffer)
      }
    })
    
    // Attempt to upload
    const fileInput = await page.getByTestId('file-input')
    await fileInput.setInputFiles([largeFile])
    
    // Check if progress bar is shown
    const progressBar = await page.getByTestId('upload-progress')
    await expect(progressBar).toBeVisible()
  })

  test('should handle concurrent API requests', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Make multiple concurrent requests
    const promises: Promise<void>[] = []
    for (let i = 0; i < 5; i++) {
      promises.push(page.click(`[data-testid="load-data-${i}"]`))
    }
    
    await Promise.all(promises)
    
    // Check if all requests completed successfully
    const errorMessages = await page.$$('[data-testid="error-message"]')
    expect(errorMessages.length).toBe(0)
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through multiple pages
    await page.goto('/')
    await page.click('[data-testid="nav-features"]')
    await page.click('[data-testid="nav-pricing"]')
    
    // Go back
    await page.goBack()
    expect(page.url()).toContain('/features')
    
    await page.goBack()
    expect(page.url()).toBe(page.url().replace(/\/$/, ''))
    
    // Go forward
    await page.goForward()
    expect(page.url()).toContain('/features')
  })

  test('should handle form validation edge cases', async ({ page }) => {
    await page.goto('/contact')
    
    const testCases = [
      { field: 'email', value: 'a'.repeat(256), error: 'Email is too long' },
      { field: 'message', value: '', error: 'Message is required' },
      { field: 'name', value: '<script>alert("xss")</script>', error: 'Invalid characters in name' }
    ]
    
    for (const testCase of testCases) {
      await page.fill(`[data-testid="${testCase.field}-input"]`, testCase.value)
      await page.click('[data-testid="submit-button"]')
      
      const errorMessage = await page.getByText(testCase.error)
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should handle session timeout', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Simulate session timeout
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // Trigger an authenticated action
    await page.click('[data-testid="protected-action"]')
    
    // Check if user is redirected to login
    expect(page.url()).toContain('/login')
    
    // Check if error message is shown
    const sessionMessage = await page.getByText('Your session has expired')
    await expect(sessionMessage).toBeVisible()
  })

  test('should handle device orientation changes', async ({ page }) => {
    const viewport = page.viewportSize()
    if (!viewport) return // Skip if viewport size is not available
    
    // Only run on mobile viewport
    if (viewport.width > 768) {
      test.skip(true, 'Desktop viewport')
      return
    }
    
    await page.goto('/')
    
    // Simulate landscape orientation
    await page.setViewportSize({ width: 812, height: 375 })
    
    // Check if layout adjusts properly
    const navigation = await page.getByTestId('navigation')
    await expect(navigation).toBeVisible()
    
    // Simulate portrait orientation
    await page.setViewportSize({ width: 375, height: 812 })
    
    // Check if layout readjusts
    await expect(navigation).toBeVisible()
  })
}) 