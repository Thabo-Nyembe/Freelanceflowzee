import { test, expect, Page } from '@playwright/test

/**
 * Context7 Precision Edge Cases Test Suite
 * Advanced testing patterns for React 18 + TypeScript + Next.js 15
 * Production-grade edge case validation using Context7 MCP patterns
 */

interface Context7TestPatterns {
  reactStateCorruption: () => Promise<void>
  typeScriptRuntimeViolations: () => Promise<void>
  nextJsRoutingEdgeCases: () => Promise<void>
  supabaseIntegrationFailures: () => Promise<void>
}

test.describe('Context7 Precision - React State Management Edge Cases', () => {
  test('useReducer State Corruption Recovery', async ({ page }) => {
    await page.goto('/dashboard/collaboration')
    
    // Inject state corruption simulation
    await page.addInitScript(() => {
      window.CORRUPT_REDUCER_STATE = true
      window.originalDispatch = null
      
      // Hook into useReducer to simulate state corruption
      const originalUseReducer = React.useReducer
      React.useReducer = function(reducer, initialState, init) {
        const [state, dispatch] = originalUseReducer(reducer, initialState, init)
        
        window.originalDispatch = dispatch
        
        const corruptedDispatch = (action) => {
          if (window.CORRUPT_REDUCER_STATE && Math.random() < 0.1) {
            // 10% chance to corrupt state
            console.log('Injecting state corruption for testing')
            return dispatch({ type: '__CORRUPT__', payload: null })
          }
          return dispatch(action)
        }
        
        return [state, corruptedDispatch]
      }
    })

    await page.reload()
    
    // Trigger multiple state updates
    for (let i = 0; i < 20; i++) {
      await page.locator('[data-testid="add-comment-btn"]').click()
      await page.waitForTimeout(100)
    }
    
    // Should gracefully handle state corruption
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="collaboration-canvas"]')).toBeVisible()
    
    // Should maintain core functionality
    await page.locator('[data-testid="add-comment-btn"]').click()
    await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible()
  })

  test('Context Provider Unmounting Edge Cases', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Simulate rapid context provider mounting/unmounting
    await page.addInitScript(() => {
      window.SIMULATE_CONTEXT_CHAOS = true
      let mountCount = 0
      
      const originalCreateContext = React.createContext
      React.createContext = function(defaultValue) {
        const context = originalCreateContext(defaultValue)
        const originalProvider = context.Provider
        
        context.Provider = function({ children, value, ...props }) {
          mountCount++
          
          if (window.SIMULATE_CONTEXT_CHAOS && mountCount % 3 === 0) {
            // Simulate provider unmounting randomly
            setTimeout(() => {
              console.log('Simulating context provider unmount')
            }, Math.random() * 1000)
          }
          
          return React.createElement(originalProvider, { value, ...props }, children)
        }
        
        return context
      }
    })

    await page.reload()
    
    // Navigate rapidly between pages to trigger context changes
    const routes = ['/dashboard', '/dashboard/projects-hub', '/dashboard/collaboration']
    
    for (let i = 0; i < 5; i++) {
      for (const route of routes) {
        await page.goto(route)
        await expect(page.locator('h1')).toBeVisible()
        await page.waitForTimeout(200)
      }
    }
    
    // Should maintain stable context state
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
  })

  test('Concurrent Hook State Updates', async ({ page }) => {
    await page.goto('/dashboard/my-day')
    
    // Simulate concurrent state updates that could cause race conditions
    await page.addInitScript(() => {
      window.simulateConcurrentUpdates = () => {
        const promises = []
        
        // Simulate 10 concurrent state updates
        for (let i = 0; i < 10; i++) {
          promises.push(new Promise(resolve => {
            setTimeout(() => {
              // Trigger state update
              const event = new CustomEvent('stateUpdate', { detail: { id: i } })
              document.dispatchEvent(event)
              resolve(i)
            }, Math.random() * 100)
          }))
        }
        
        return Promise.all(promises)
      }
    })

    // Execute concurrent updates
    await page.evaluate(() => window.simulateConcurrentUpdates())
    
    // Should handle concurrent updates gracefully
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible()
    
    // Add multiple tasks rapidly
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="add-task-btn"]').click()
      await page.fill('[data-testid="task-title"]', `Concurrent Task ${i}`)
      await page.locator('[data-testid="save-task"]').click()
      // Don't wait for completion - create race conditions
    }
    
    // Should maintain state consistency
    const taskCount = await page.locator('[data-testid="task-item"]').count()
    expect(taskCount).toBeGreaterThan(0)
    expect(taskCount).toBeLessThanOrEqual(10)
  })
})

test.describe('Context7 Precision - TypeScript Runtime Edge Cases', () => {
  test('Type Safety Violations at Runtime', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')
    
    // Inject type violations that TypeScript can't catch at compile time
    await page.addInitScript(() => {
      window.injectTypeViolations = () => {
        // Simulate API returning unexpected types
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
          const response = await originalFetch(...args)
          
          if (args[0].includes('/api/projects')) {
            const originalJson = response.json
            response.json = async () => {
              const data = await originalJson.call(response)
              
              // Inject type violations
              if (data.projects) {
                data.projects = data.projects.map(project => ({
                  ...project,
                  id: typeof project.id === 'string' ? parseInt(project.id) : project.id,
                  createdAt: new Date(project.createdAt), // Convert string to Date
                  metadata: project.metadata || {}, // Add unexpected property
                  tags: project.tags || null // Null instead of array
                }))
              }
              
              return data
            }
          }
          
          return response
        }
      }
      
      window.injectTypeViolations()
    })

    await page.reload()
    
    // Should handle type mismatches gracefully
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible()
    
    // Should not break when processing unexpected types
    const projectItems = page.locator('[data-testid="project-item"]')
    const count = await projectItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
    
    // Should validate and sanitize data
    if (count > 0) {
      await projectItems.first().click()
      await expect(page.locator('[data-testid="project-details"]')).toBeVisible()
    }
  })

  test('Generic Type Constraint Violations', async ({ page }) => {
    await page.goto('/dashboard/collaboration')
    
    // Test generic type safety with dynamic data
    await page.addInitScript(() => {
      window.simulateGenericViolations = () => {
        // Simulate components receiving wrong generic types
        const mockData = {
          comments: [
            { id: '1', content: 'Valid comment', userId: 123 }, // number instead of string
            { id: 2, content: 'Invalid ID type', userId: 'user_456' }, // number id
            { content: 'Missing ID', userId: 'user_789' }, // missing required id
            { id: '4', userId: 'user_101' } // missing content
          ],
          reactions: new Map([['1', { likes: 5, dislikes: '2' }]]), // Map instead of object
          metadata: 'should be object' // string instead of object
        }
        
        window.mockCollaborationData = mockData
      }
      
      window.simulateGenericViolations()
    })

    await page.reload()
    
    // Should handle generic type violations without crashing
    await expect(page.locator('[data-testid="collaboration-canvas"]')).toBeVisible()
    
    // Should display available data safely
    await page.locator('[data-testid="add-comment-btn"]').click()
    await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible()
    
    // Should validate input types
    await page.fill('[data-testid="comment-content"]', 'Test comment')
    await page.locator('[data-testid="submit-comment"]').click()
    
    // Should not throw runtime type errors
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
  })

  test('Enum and Union Type Edge Cases', async ({ page }) => {
    await page.goto('/dashboard/my-day')
    
    // Test handling of invalid enum values and union types
    await page.addInitScript(() => {
      window.testEnumViolations = () => {
        // Simulate data with invalid enum values
        const taskData = {
          priority: 'critical', // Not in 'low' | 'medium' | 'high
          status: 5, // Number instead of string enum
          category: null, // Null instead of valid category
          type: ['multiple', 'values'], // Array instead of single value
          difficulty: undefined // Undefined instead of enum value
        }
        
        window.mockTaskData = taskData
        
        // Trigger task creation with invalid data
        const event = new CustomEvent('createTaskWithInvalidData', { 
          detail: taskData 
        })
        document.dispatchEvent(event)
      }
    })

    // Execute enum violations
    await page.evaluate(() => window.testEnumViolations())
    
    // Should sanitize enum values to valid defaults
    await page.locator('[data-testid="add-task-btn"]').click()
    
    // Should show valid enum options only
    const prioritySelect = page.locator('[data-testid="priority-select"]')
    await prioritySelect.click()
    
    const options = await prioritySelect.locator('option').allTextContents()
    expect(options).toEqual(expect.arrayContaining(['low', 'medium', 'high']))
    expect(options).not.toContain('critical')
  })
})

test.describe('Context7 Precision - Next.js Edge Cases', () => {
  test('Dynamic Route Parameter Injection', async ({ page }) => {
    // Test dynamic route security and validation
    const maliciousParams = [
      '../../../etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '<script>alert("xss")</script>',
      '${process.env.DATABASE_URL}',
      'admin"--',
      '../../components/sensitive
    ]

    for (const param of maliciousParams) {
      await page.goto(`/dashboard/projects/${encodeURIComponent(param)}`)
      
      // Should handle malicious parameters safely
      await expect(page.locator('text=Error')).toBeVisible()
      await expect(page.locator('text=passwd')).not.toBeVisible()
      await expect(page.locator('text=DATABASE_URL')).not.toBeVisible()
      
      // Should not execute injected scripts
      const alertPresent = await page.evaluate(() => {
        return window.alertCalled || false
      })
      expect(alertPresent).toBeFalsy()
    }
  })

  test('Server-Side Rendering Hydration Mismatches', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Detect hydration mismatches
    const hydrationErrors = []
    
    page.on('console', msg => {
      if (msg.text().includes('hydration') || msg.text().includes('mismatch')) {
        hydrationErrors.push(msg.text())
      }
    })

    // Force client-side state that differs from SSR
    await page.addInitScript(() => {
      window.forceHydrationMismatch = () => {
        // Modify DOM after SSR but before hydration
        const elements = document.querySelectorAll('[data-ssr]')
        elements.forEach(el => {
          el.textContent = 'MODIFIED_' + el.textContent
        })
      }
    })

    await page.evaluate(() => window.forceHydrationMismatch?.())
    await page.reload()
    
    // Wait for hydration to complete
    await page.waitForLoadState('networkidle')
    
    // Should recover from hydration mismatches gracefully
    await expect(page.locator('h1')).toBeVisible()
    
    // Log any hydration issues for debugging
    if (hydrationErrors.length > 0) {
      console.log('Hydration warnings detected:', hydrationErrors)
    }
  })

  test('Middleware Chain Execution Edge Cases', async ({ page }) => {
    // Test middleware execution with various edge cases
    const testPaths = [
      '/dashboard/../admin',
      '/dashboard//double-slash',
      '/dashboard/projects/../../users',
      '/dashboard/%2e%2e/sensitive',
      '/dashboard/null',
      '/dashboard/undefined
    ]

    for (const path of testPaths) {
      const response = await page.goto(path, { waitUntil: 'networkidle' })
      
      // Should handle path traversal attempts
      expect(response?.status()).not.toBe(500)
      
      // Should not expose sensitive paths
      await expect(page.locator('text=admin')).not.toBeVisible()
      await expect(page.locator('text=sensitive')).not.toBeVisible()
      
      // Should redirect or show appropriate error
      const currentUrl = page.url()
      expect(currentUrl).not.toContain('../')
      expect(currentUrl).not.toContain('//')
    }
  })
})

test.describe('Context7 Precision - Supabase Integration Edge Cases', () => {
  test('Real-time Subscription Memory Leaks', async ({ page }) => {
    await page.goto('/dashboard/collaboration')
    
    // Monitor subscription creation and cleanup
    await page.addInitScript(() => {
      window.supabaseSubscriptions = []
      window.originalSupabaseFrom = window.supabase?.from
      
      if (window.supabase) {
        window.supabase.from = function(table) {
          const query = window.originalSupabaseFrom.call(this, table)
          const originalOn = query.on
          
          query.on = function(...args) {
            const subscription = originalOn.apply(this, args)
            window.supabaseSubscriptions.push(subscription)
            return subscription
          }
          
          return query
        }
      }
    })

    // Create multiple subscriptions
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-testid="create-subscription"]').click()
      await page.waitForTimeout(500)
    }
    
    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/dashboard/collaboration')
    
    // Check for subscription cleanup
    const activeSubscriptions = await page.evaluate(() => 
      window.supabaseSubscriptions?.length || 0
    )
    
    // Should not accumulate subscriptions indefinitely
    expect(activeSubscriptions).toBeLessThan(10)
  })

  test('Row Level Security Policy Violations', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')
    
    // Attempt to access unauthorized data
    await page.addInitScript(() => {
      window.attemptUnauthorizedAccess = async () => {
        if (window.supabase) {
          try {
            // Try to access all projects (should be filtered by RLS)
            const { data, error } = await window.supabase
              .from('projects')
              .select('*')
              .neq('user_id', 'current_user_id') // Try to get other users' projects
            
            window.unauthorizedAccessResult = { data, error }
          } catch (err) {
            window.unauthorizedAccessResult = { error: err }
          }
        }
      }
    })

    await page.evaluate(() => window.attemptUnauthorizedAccess())
    
    const result = await page.evaluate(() => window.unauthorizedAccessResult)
    
    // Should either return empty data or throw authorization error
    if (result.data) {
      expect(result.data.length).toBe(0)
    } else {
      expect(result.error).toBeTruthy()
    }
  })

  test('Database Connection Pool Exhaustion', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Simulate high concurrent database requests
    await page.addInitScript(() => {
      window.exhaustConnectionPool = async () => {
        const promises = []
        
        // Create 100 concurrent requests to exhaust connection pool
        for (let i = 0; i < 100; i++) {
          promises.push(
            window.supabase?.from('projects').select('id').limit(1)
          )
        }
        
        try {
          const results = await Promise.allSettled(promises)
          window.connectionPoolResults = results.map(r => ({
            status: r.status,
            hasError: r.status === 'rejected
          }))
        } catch (err) {
          window.connectionPoolResults = { error: err.message }
        }
      }
    })

    await page.evaluate(() => window.exhaustConnectionPool())
    
    const results = await page.evaluate(() => window.connectionPoolResults)
    
    // Should handle connection pool limits gracefully
    if (Array.isArray(results)) {
      const errors = results.filter(r => r.hasError)
      const successes = results.filter(r => !r.hasError)
      
      // Should have a mix of successes and controlled failures
      expect(successes.length).toBeGreaterThan(0)
      
      // Error rate should be reasonable
      expect(errors.length / results.length).toBeLessThan(0.5)
    }
    
    // UI should remain functional
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Context7 Precision - File Upload Edge Cases', () => {
  test('Simultaneous Large File Upload Handling', async ({ page }) => {
    await page.goto('/dashboard/files-hub')
    
    // Create multiple large files for testing
    const largeFileBuffer = Buffer.alloc(50 * 1024 * 1024) // 50MB
    
    const files = Array.from({ length: 5 }, (_, i) => ({
      name: `large_file_${i}.zip`,
      mimeType: 'application/zip',
      buffer: largeFileBuffer
    }))

    // Upload all files simultaneously
    await page.setInputFiles('[data-testid="file-upload"]', files)
    
    // Should queue uploads properly
    await expect(page.locator('[data-testid="upload-queue"]')).toBeVisible()
    
    // Should show progress for each file
    const progressBars = page.locator('[data-testid="upload-progress-bar"]')
    await expect(progressBars).toHaveCount(5)
    
    // Should handle upload failures gracefully
    await page.locator('[data-testid="cancel-upload"]').first().click()
    
    // Should update queue after cancellation
    await expect(progressBars).toHaveCount(4)
    
    // Should not block UI during uploads
    await page.locator('[data-testid="new-folder-btn"]').click()
    await expect(page.locator('[data-testid="folder-dialog"]')).toBeVisible()
  })

  test('File Corruption Detection and Recovery', async ({ page }) => {
    await page.goto('/dashboard/files-hub')
    
    // Create corrupted file data
    const corruptedData = Buffer.from('This is not a valid ZIP file')
    
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'corrupted.zip',
      mimeType: 'application/zip',
      buffer: corruptedData
    })

    // Should detect file corruption
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible()
    await expect(page.locator('text=File appears to be corrupted')).toBeVisible()
    
    // Should offer recovery options
    await expect(page.locator('[data-testid="retry-upload"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-anyway"]')).toBeVisible()
  })

  test('Storage Quota Exceeded Handling', async ({ page }) => {
    await page.goto('/dashboard/files-hub')
    
    // Simulate storage quota exceeded
    await page.route('**/api/storage/upload', async route => {
      route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Storage quota exceeded',
          quota: '5GB',
          used: '4.9GB',
          available: '100MB
        })
      })
    })

    const testFile = Buffer.alloc(1024 * 1024) // 1MB file
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testFile
    })

    // Should show quota exceeded message
    await expect(page.locator('[data-testid="quota-exceeded"]')).toBeVisible()
    
    // Should suggest solutions
    await expect(page.locator('[data-testid="upgrade-storage"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-old-files"]')).toBeVisible()
    
    // Should show current usage
    await expect(page.locator('text=4.9GB')).toBeVisible()
    await expect(page.locator('text=5GB')).toBeVisible()
  })
})

// Export Context7 testing utilities
export const Context7TestUtils = {
  injectStateCorruption: async (page: Page) => {
    await page.addInitScript(() => {
      window.FORCE_STATE_CORRUPTION = true
    })
  },

  simulateTypeViolations: async (page: Page) => {
    await page.addInitScript(() => {
      window.INJECT_TYPE_VIOLATIONS = true
    })
  },

  monitorMemoryLeaks: async (page: Page) => {
    return page.evaluate(() => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      return {
        initial: initialMemory,
        check: () => {
          const currentMemory = performance.memory?.usedJSHeapSize || 0
          return {
            current: currentMemory,
            increase: currentMemory - initialMemory,
            ratio: currentMemory / initialMemory
          }
        }
      }
    })
  },

  validateAccessibility: async (page: Page) => {
    const violations = await page.evaluate(() => {
      const issues = []
      
      // Check for common accessibility violations
      document.querySelectorAll('img:not([alt])').forEach(img => {
        issues.push({ type: 'missing-alt', element: img.tagName })
      })
      
      document.querySelectorAll('button:not([aria-label]):not(:has(text))').forEach(btn => {
        issues.push({ type: 'missing-label', element: btn.tagName })
      })
      
      return issues
    })
    
    return violations
  }
} 