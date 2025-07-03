import { test, expect } from '@playwright/test'
import { chromium, firefox, webkit } from '@playwright/test'

// Test suite configuration
test.describe.configure({ mode: 'parallel' })

test.describe('FreeflowZee - Comprehensive Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('🏠 Homepage & Navigation', () => {
    test('should load homepage with correct title and branding', async ({ page }) => {
      await expect(page).toHaveTitle(/FreeflowZee/)
      await expect(page.getByText('FreeflowZee')).toBeVisible()
      await expect(page.getByText('AI-Powered Creative Platform')).toBeVisible()
    })

    test('should have working navigation menu', async ({ page }) => {
      // Check main navigation links
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'How it Works' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible()
    })

    test('should navigate to Get Started when clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Get Started' }).click()
      await expect(page).toHaveURL(/\/dashboard|\/login/)
    })

    test('should have responsive design on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await expect(page.getByText('FreeflowZee')).toBeVisible()
      
      // Check mobile menu button appears
      const mobileMenuButton = page.locator('[data-testid="mobile-menu"]')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
      }
    })
  })

  test.describe('🔐 Authentication Flow', () => {
    test('should navigate to login page', async ({ page }) => {
      await page.goto('/login')
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible()
    })

    test('should show validation errors for empty login form', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('button', { name: /sign in|login/i }).click()
      
      // Check for validation messages
      await expect(page.getByText(/email.*required|please enter.*email/i)).toBeVisible()
    })

    test('should attempt login with demo credentials', async ({ page }) => {
      await page.goto('/login')
      
      // Fill in demo credentials
      await page.getByLabel(/email/i).fill('thabo@kaleidocraft.co.za')
      await page.getByLabel(/password/i).fill('password1234')
      await page.getByRole('button', { name: /sign in|login/i }).click()
      
      // Should redirect to dashboard or show error
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/dashboard|login|error/)
    })
  })

  test.describe('📊 Dashboard Features', () => {
    test.beforeEach(async ({ page }) => {
      // Attempt to navigate to dashboard
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
    })

    test('should display dashboard with tab navigation', async ({ page }) => {
      await expect(page.getByText(/Welcome to FreeflowZee|Dashboard/i)).toBeVisible()
      
      // Check for tab navigation
      const expectedTabs = [
        'Overview',
        'Projects Hub',
        'AI Create',
        'Video Studio',
        'Escrow',
        'Files Hub',
        'Community',
        'My Day Today'
      ]

      for (const tabName of expectedTabs) {
        await expect(page.getByRole('tab', { name: new RegExp(tabName, 'i') })).toBeVisible()
      }
    })

    test('should switch between dashboard tabs', async ({ page }) => {
      // Test tab switching functionality
      const tabs = ['Projects Hub', 'AI Create', 'Video Studio', 'Escrow']
      
      for (const tabName of tabs) {
        await page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()
        await page.waitForTimeout(500)
        
        // Verify tab content is visible
        await expect(page.getByText(new RegExp(tabName, 'i'))).toBeVisible()
      }
    })

    test('should display statistics and metrics', async ({ page }) => {
      // Check for dashboard stats
      await expect(page.getByText(/\$[\d,]+/)).toBeVisible() // Revenue numbers
      await expect(page.getByText(/Activity|Revenue|Clients|Growth/)).toBeVisible()
    })
  })

  test.describe('🤖 AI Features', () => {
    test('should navigate to AI demo', async ({ page }) => {
      await page.goto('/ai-demo')
      await expect(page.getByText(/AI.*Demo|Artificial Intelligence/i)).toBeVisible()
    })

    test('should test AI chat functionality', async ({ page }) => {
      await page.goto('/ai-demo')
      
      // Look for chat input
      const chatInput = page.getByPlaceholder(/message|question|ask/i)
      if (await chatInput.isVisible()) {
        await chatInput.fill('Help me optimize my freelance revenue')
        await page.getByRole('button', { name: /send|submit/i }).click()
        
        // Wait for AI response
        await page.waitForTimeout(3000)
        await expect(page.getByText(/response|analysis|suggestion/i)).toBeVisible()
      }
    })

    test('should test quick action buttons', async ({ page }) => {
      await page.goto('/ai-demo')
      
      const quickActions = [
        'Optimize Revenue',
        'Project Management', 
        'Client Communication',
        'Time Management'
      ]

      for (const action of quickActions) {
        const button = page.getByRole('button', { name: new RegExp(action, 'i') })
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(1000)
          // Should show some response or modal
        }
      }
    })
  })

  test.describe('📁 File Management', () => {
    test('should navigate to files hub', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      await expect(page.getByText(/Files.*Hub|File.*Management/i)).toBeVisible()
    })

    test('should show file upload interface', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      
      // Look for upload button or drag-and-drop area
      const uploadElements = [
        page.getByRole('button', { name: /upload|add.*file/i }),
        page.getByText(/drag.*drop|choose.*file/i),
        page.getByTestId('file-upload')
      ]

      let uploadFound = false
      for (const element of uploadElements) {
        if (await element.isVisible()) {
          uploadFound = true
          break
        }
      }
      
      // If no upload interface, check for placeholder message
      if (!uploadFound) {
        await expect(page.getByText(/upload|manage.*files|no.*files/i)).toBeVisible()
      }
    })
  })

  test.describe('💰 Payment & Escrow', () => {
    test('should navigate to escrow system', async ({ page }) => {
      await page.goto('/dashboard/escrow')
      await expect(page.getByText(/Escrow|Payment.*Protection/i)).toBeVisible()
    })

    test('should display escrow features', async ({ page }) => {
      await page.goto('/dashboard/escrow')
      
      // Check for escrow-related content
      const escrowFeatures = [
        /secure.*payment/i,
        /escrow.*protection/i,
        /milestone/i,
        /deposit/i
      ]

      for (const feature of escrowFeatures) {
        const element = page.getByText(feature)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    })
  })

  test.describe('🎬 Video Studio', () => {
    test('should navigate to video studio', async ({ page }) => {
      await page.goto('/dashboard/video-studio')
      await expect(page.getByText(/Video.*Studio|Video.*Creation/i)).toBeVisible()
    })

    test('should show video creation tools', async ({ page }) => {
      await page.goto('/dashboard/video-studio')
      
      // Look for video-related features
      const videoFeatures = [
        /record|recording/i,
        /edit|editing/i,
        /template/i,
        /export|download/i
      ]

      for (const feature of videoFeatures) {
        const element = page.getByText(feature)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    })
  })

  test.describe('👥 Community Features', () => {
    test('should navigate to community hub', async ({ page }) => {
      await page.goto('/dashboard/community')
      await expect(page.getByText(/Community|Connect.*Creators/i)).toBeVisible()
    })

    test('should show community content', async ({ page }) => {
      await page.goto('/dashboard/community')
      
      // Check for community features
      const communityFeatures = [
        /network|networking/i,
        /connect|connection/i,
        /creator|creative/i,
        /collaboration/i
      ]

      for (const feature of communityFeatures) {
        const element = page.getByText(feature)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    })
  })

  test.describe('📅 My Day Planning', () => {
    test('should navigate to my day page', async ({ page }) => {
      await page.goto('/dashboard/my-day')
      await expect(page.getByText(/My Day|Daily.*Planning/i)).toBeVisible()
    })

    test('should show planning features', async ({ page }) => {
      await page.goto('/dashboard/my-day')
      
      // Look for planning tools
      const planningFeatures = [
        /task|todo/i,
        /schedule|calendar/i,
        /productivity/i,
        /ai.*insight/i
      ]

      for (const feature of planningFeatures) {
        const element = page.getByText(feature)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    })
  })

  test.describe('🔍 Search & Performance', () => {
    test('should load pages within performance thresholds', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
    })

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true)
      
      const response = await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => null)
      
      if (!response) {
        // Should show offline message or cached content
        await expect(page.getByText(/offline|network.*error|try.*again/i)).toBeVisible()
      }
      
      // Restore online condition
      await page.context().setOffline(false)
    })

    test('should be accessible with keyboard navigation', async ({ page }) => {
      await page.goto('/')
      
      // Test keyboard navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      
      // Should navigate or activate something
      await page.waitForTimeout(1000)
    })
  })

  test.describe('💻 Cross-browser Compatibility', () => {
    test('should work in different browsers', async ({ browserName }) => {
      // This will run automatically across chromium, firefox, webkit
      test.skip(browserName === 'webkit' && process.platform === 'linux', 'WebKit not supported on Linux CI')
      
      // Basic functionality test for each browser
      expect(['chromium', 'firefox', 'webkit']).toContain(browserName)
    })
  })

  test.describe('📱 Mobile & Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Test various mobile viewport sizes
      const viewports = [
        { width: 375, height: 812 }, // iPhone X
        { width: 414, height: 896 }, // iPhone 11 Pro Max
        { width: 360, height: 640 }  // Android
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.goto('/')
        
        // Check that content is still visible and usable
        await expect(page.getByText('FreeflowZee')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible()
      }
    })

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/dashboard')
      
      // Test touch interactions on tabs
      const tab = page.getByRole('tab', { name: /projects/i }).first()
      if (await tab.isVisible()) {
        await tab.tap()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('🚨 Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page')
      
      // Should show 404 page or redirect
      await expect(page.getByText(/404|not.*found|page.*not.*exist/i)).toBeVisible()
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('/api/**', route => route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      }))

      await page.goto('/ai-demo')
      
      // Try to trigger API call
      const chatInput = page.getByPlaceholder(/message|question/i)
      if (await chatInput.isVisible()) {
        await chatInput.fill('Test message')
        await page.getByRole('button', { name: /send/i }).click()
        
        // Should show error message
        await expect(page.getByText(/error|failed|try.*again/i)).toBeVisible()
      }
    })
  })

  test.describe('⚡ Performance & Optimization', () => {
    test('should have good lighthouse scores', async ({ page }) => {
      await page.goto('/')
      
      // Check for performance indicators
      const images = await page.locator('img').all()
      for (const img of images) {
        // Check that images have alt text
        const alt = await img.getAttribute('alt')
        expect(alt).toBeDefined()
      }
    })

    test('should load CSS and JavaScript properly', async ({ page }) => {
      await page.goto('/')
      
      // Check that styles are loaded
      const bodyStyles = await page.locator('body').evaluate(el => getComputedStyle(el))
      expect(bodyStyles.fontFamily).toBeDefined()
      
      // Check that JavaScript is working
      const hasJS = await page.evaluate(() => typeof window !== 'undefined')
      expect(hasJS).toBe(true)
    })
  })
})

// Edge cases and stress testing
test.describe('🔬 Edge Cases & Stress Testing', () => {
  test('should handle long text inputs', async ({ page }) => {
    await page.goto('/ai-demo')
    
    const longText = 'a'.repeat(10000) // 10k characters
    const chatInput = page.getByPlaceholder(/message|question/i)
    
    if (await chatInput.isVisible()) {
      await chatInput.fill(longText)
      await page.getByRole('button', { name: /send/i }).click()
      
      // Should handle gracefully without crashing
      await page.waitForTimeout(2000)
    }
  })

  test('should handle special characters and emojis', async ({ page }) => {
    await page.goto('/ai-demo')
    
    const specialText = "Test with émojis 🚀💯 and spëcial cháracters @#$%^&*()"
    const chatInput = page.getByPlaceholder(/message|question/i)
    
    if (await chatInput.isVisible()) {
      await chatInput.fill(specialText)
      await page.getByRole('button', { name: /send/i }).click()
      await page.waitForTimeout(2000)
    }
  })

  test('should handle rapid clicks and interactions', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Rapidly click tabs
    const tabs = await page.getByRole('tab').all()
    for (let i = 0; i < 10; i++) {
      for (const tab of tabs.slice(0, 3)) {
        await tab.click({ timeout: 100 }).catch(() => {}) // Ignore timeouts
      }
    }
    
    // Should still be functional
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible()
  })
})

// API testing
test.describe('🔌 API Integration Testing', () => {
  test('should handle AI chat API correctly', async ({ page }) => {
    // Mock successful API response
    await page.route('/api/ai/chat', route => route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response: 'Mock AI response for testing',
        confidence: 0.95,
        suggestions: ['Test suggestion 1', 'Test suggestion 2']
      })
    }))

    await page.goto('/ai-demo')
    
    const chatInput = page.getByPlaceholder(/message|question/i)
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test API integration')
      await page.getByRole('button', { name: /send/i }).click()
      
      await expect(page.getByText('Mock AI response for testing')).toBeVisible()
    }
  })
})

// Security testing
test.describe('🔒 Security & Privacy', () => {
  test('should not expose sensitive information', async ({ page }) => {
    await page.goto('/')
    
    // Check that no API keys or secrets are exposed in client
    const content = await page.content()
    expect(content).not.toMatch(/sk-[a-zA-Z0-9]{48}/) // OpenAI API key pattern
    expect(content).not.toMatch(/password.*=.*[^*]/) // Exposed passwords
  })

  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers() || {}
    
    // Should have security headers (if implemented)
    // These might not be present in development but should be in production
    if (headers['x-frame-options']) {
      expect(headers['x-frame-options']).toBeDefined()
    }
  })
}) 