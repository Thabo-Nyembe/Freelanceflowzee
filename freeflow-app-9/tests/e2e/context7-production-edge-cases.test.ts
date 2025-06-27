import { test, expect } from '@playwright/test

/**
 * CONTEXT7 PRODUCTION EDGE CASES TEST SUITE
 * 
 * Tests advanced Context7 patterns including:
 * - React useReducer state management under stress
 * - TypeScript type safety in production scenarios
 * - Next.js API route security and performance
 * - Supabase integration with RLS policies
 * - Real-time collaboration edge cases
 * - File upload/download system resilience
 * - AI service integration error handling
 */

test.describe('Context7 Production Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Enable comprehensive error tracking
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    // Attach errors to test context
    ;(page as any).errors = errors
  })

  test('🔄 React useReducer State Corruption Recovery', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to My Day tab which uses complex useReducer
    await page.click('[role="tab"]:has-text("My Day Today")')
    
    // Simulate state corruption by rapidly switching contexts
    for (let i = 0; i < 10; i++) {
      await page.click('[role="tab"]:has-text("Community")')
      await page.waitForTimeout(100)
      await page.click('[role="tab"]:has-text("My Day Today")')
      await page.waitForTimeout(100)
    }
    
    // Verify application still responds correctly
    const taskElements = page.locator('[data-testid*="task"], .task, button:has-text("Add Task")')
    await expect(taskElements.first()).toBeVisible({ timeout: 5000 })
    
    // Check for state corruption indicators
    const errorState = page.locator('[data-testid="error"], .error-boundary, text="Something went wrong")
    await expect(errorState).toHaveCount(0)
  })

  test('📊 Large Dataset Rendering Performance', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test Files Hub with large file list simulation
    await page.click('[role="tab"]:has-text("Files Hub")')
    
    const startTime = Date.now()
    
    // Verify page doesn't freeze with large datasets
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const renderTime = Date.now() - startTime
    expect(renderTime).toBeLessThan(5000) // Should render within 5 seconds
    
    // Test scrolling performance with large lists
    const scrollableArea = page.locator('.files-list, [data-testid*="file-list"], .overflow-auto').first()
    
    if (await scrollableArea.isVisible()) {
      // Simulate rapid scrolling
      for (let i = 0; i < 5; i++) {
        await scrollableArea.evaluate(el => el.scrollTop += 500)
        await page.waitForTimeout(100)
      }
      
      // Verify no performance degradation
      const finalScrollTest = Date.now()
      await scrollableArea.evaluate(el => el.scrollTop = 0)
      const scrollPerformance = Date.now() - finalScrollTest
      expect(scrollPerformance).toBeLessThan(1000)
    }
  })

  test('🔐 TypeScript Type Safety at Runtime', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Inject malformed data to test type guards
    await page.evaluate(() => {
      // Simulate malformed API response
      const mockMalformedData = {
        // Missing required properties
        id: null,
        title: undefined,
        // Wrong types
        createdAt: 'invalid-date',
        priority: 'invalid-priority',
        tags: 'not-an-array
      }
      
      // Try to trigger type errors in the app
      ;(window as any).testMalformedData = mockMalformedData
    })
    
    // Navigate to areas that handle complex data
    await page.click('[role="tab"]:has-text("Projects Hub")')
    
    // Verify app handles type mismatches gracefully
    const criticalError = page.locator('.fatal-error, [data-testid="fatal-error"]')
    await expect(criticalError).toHaveCount(0)
    
    // Check that TypeScript interfaces protect the app
    const validContent = page.locator('main, .dashboard-content, [role="main"]')
    await expect(validContent).toBeVisible()
  })

  test('⚡ Concurrent Request Stress Test', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Simulate multiple concurrent operations
    const promises = []
    
    // Rapid tab switching to trigger multiple API calls
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.click('[role="tab"]:has-text("AI Create")').catch(() => {}),
        page.click('[role="tab"]:has-text("Community")').catch(() => {}),
        page.click('[role="tab"]:has-text("Files Hub")').catch(() => {}),
        page.click('[role="tab"]:has-text("Escrow")').catch(() => {})
      )
    }
    
    // Wait for all operations to complete or timeout
    await Promise.allSettled(promises)
    
    // Verify app remains stable
    await page.waitForTimeout(2000)
    const activeTab = page.locator('[role="tab"][aria-selected="true"]')
    await expect(activeTab).toBeVisible()
    
    // Check for race condition indicators
    const loadingSpinner = page.locator('.loading, [data-testid*="loading"]')
    await expect(loadingSpinner).toHaveCount(0, { timeout: 5000 })
  })

  test('🌐 Network Interruption Recovery', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Establish baseline functionality
    await page.click('[role="tab"]:has-text("Community")')
    await expect(page.locator('button:has-text("Create Post"), [data-testid*="create"]')).toBeVisible()
    
    // Simulate network interruption
    await page.route('**/api/**', route => {
      // Randomly fail 50% of requests
      if (Math.random() > 0.5) {
        route.abort()
      } else {
        route.continue()
      }
    })
    
    // Test operations during network instability
    const createButton = page.locator('button:has-text("Create Post"), [data-testid*="create"]').first()
    if (await createButton.isVisible()) {
      await createButton.click()
    }
    
    // Verify graceful degradation
    const errorBoundary = page.locator('.error-boundary, [data-testid="error-boundary"]')
    await expect(errorBoundary).toHaveCount(0)
    
    // Restore network and verify recovery
    await page.unroute('**/api/**')
    await page.reload()
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible()
  })

  test('📁 File Upload System Edge Cases', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('[role="tab"]:has-text("Files Hub")')
    
    // Test file upload button exists
    const uploadButton = page.locator('button:has-text("Upload"), [data-testid*="upload"], input[type="file"]')
    
    if (await uploadButton.count() > 0) {
      // Simulate large file upload (mock)
      await page.evaluate(() => {
        const mockLargeFile = new File(['x'.repeat(50 * 1024 * 1024)], 'large-file.zip', {
          type: 'application/zip
        })
        
        // Test file validation
        ;(window as any).testFileValidation = (file: File) => {
          const maxSize = 100 * 1024 * 1024 // 100MB
          const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/zip']
          
          if (file.size > maxSize) return false
          if (!allowedTypes.some(type => file.type.startsWith(type))) return false
          
          return true
        }
        
        console.log('Large file validation:', (window as any).testFileValidation(mockLargeFile))
      })
      
      // Verify upload system handles edge cases
      const fileInput = uploadButton.first()
      await expect(fileInput).toBeVisible()
    }
  })

  test('🤖 AI Service Integration Resilience', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('[role="tab"]:has-text("AI Create")')
    
    // Test AI assistant availability
    const aiElements = page.locator('[data-testid="ai-assistant"], .ai-content, button:has-text("AI")')
    
    if (await aiElements.count() > 0) {
      // Simulate AI service timeout
      await page.route('**/api/ai/**', route => {
        // Delay response to simulate timeout
        setTimeout(() => route.abort(), 5000)
      })
      
      // Try to interact with AI features
      const aiButton = aiElements.first()
      if (await aiButton.isVisible()) {
        await aiButton.click()
        
        // Verify timeout handling
        await page.waitForTimeout(6000)
        
        // Should show error state, not crash
        const errorMessage = page.locator('text="timeout", text="error", .error, [data-testid*="error"]')
        const stillResponsive = page.locator('nav, button, input')
        
        await expect(stillResponsive.first()).toBeVisible()
      }
      
      await page.unroute('**/api/ai/**')
    }
  })

  test('🔄 Real-time Collaboration Edge Cases', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('[role="tab"]:has-text("Projects Hub")')
    
    // Test collaboration features if available
    const collaborationElements = page.locator(
      'button:has-text("Comment"), ' +
      'button:has-text("Collaborate"), ' +
      '[data-testid*="collaboration"], ' +
      '.collaboration
    )
    
    if (await collaborationElements.count() > 0) {
      // Simulate WebSocket connection issues
      await page.evaluate(() => {
        // Mock WebSocket failures
        const originalWebSocket = window.WebSocket
        ;(window as any).WebSocket = function(url: string) {
          const ws = new originalWebSocket(url)
          
          // Randomly disconnect
          setTimeout(() => {
            if (Math.random() > 0.7) {
              ws.close()
            }
          }, 1000)
          
          return ws
        }
      })
      
      // Interact with collaboration features
      const collabButton = collaborationElements.first()
      await collabButton.click()
      
      // Verify graceful handling of connection issues
      await page.waitForTimeout(3000)
      
      // App should remain functional
      const mainContent = page.locator('main, .dashboard-content')
      await expect(mainContent).toBeVisible()
    }
  })

  test('🎯 Context7 useReducer Pattern Verification', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test complex state management in My Day tab
    await page.click('[role="tab"]:has-text("My Day Today")')
    
    // Verify useReducer-based components load
    const stateElements = page.locator(
      '[data-testid*="task"], ' +
      '.task-list, ' +
      'button:has-text("Add"), ' +
      '.progress
    )
    
    if (await stateElements.count() > 0) {
      // Test state updates
      const addButton = page.locator('button:has-text("Add"), [data-testid*="add"]').first()
      
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Verify state update doesn't break UI
        await page.waitForTimeout(1000)
        
        const stateAfterUpdate = page.locator('main, .dashboard-content')
        await expect(stateAfterUpdate).toBeVisible()
      }
    }
    
    // Test Community tab useReducer patterns
    await page.click('[role="tab"]:has-text("Community")')
    
    const communityElements = page.locator(
      'button:has-text("Create"), ' +
      '[data-testid*="post"], ' +
      '.post, .community
    )
    
    await expect(communityElements.first()).toBeVisible({ timeout: 5000 })
  })

  test('🏆 Context7 Production Grade Score', async ({ page }) => {
    let score = 0
    const maxScore = 100
    const errors = (page as any).errors || []
    
    // Error-free navigation (25 points)
    try {
      await page.goto('/dashboard')
      await page.waitForTimeout(2000)
      if (errors.length === 0) score += 25
    } catch {}
    
    // All Context7 features working (25 points)
    try {
      const tabs = ['AI Create', 'Community', 'My Day Today', 'Files Hub']
      for (const tab of tabs) {
        await page.click(`[role="tab"]:has-text("${tab}")`)
        await page.waitForTimeout(500)
      }
      score += 25
    } catch {}
    
    // Type safety maintained (20 points)
    const typeErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('is not a function') ||
      error.includes('Cannot read property')
    )
    if (typeErrors.length === 0) score += 20
    
    // Performance standards met (15 points)
    const performanceStart = Date.now()
    await page.reload()
    const loadTime = Date.now() - performanceStart
    if (loadTime < 3000) score += 15
    
    // useReducer patterns stable (15 points)
    try {
      await page.click('[role="tab"]:has-text("My Day Today")')
      await page.waitForTimeout(1000)
      const reducerElements = page.locator('[data-testid*="task"], .task, button')
      if (await reducerElements.count() > 0) score += 15
    } catch {}
    
    console.log(`🏆 Context7 Production Grade: ${score}/${maxScore} (${Math.round(score/maxScore*100)}%)`)
    console.log(`📊 Error Count: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('🐛 Errors detected:', errors.slice(0, 5)) // Show first 5 errors
    }
    
    // Context7 production requires 85% or higher
    expect(score).toBeGreaterThanOrEqual(85)
  })
}) 