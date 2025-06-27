import { test, expect, Page } from '@playwright/test

/**
 * CONTEXT7 PRECISION EDGE CASES TEST SUITE
 * Advanced testing patterns using Context7 MCP integration
 * Focus on precise error reproduction and edge case validation
 */

test.describe('Context7 Precision Edge Cases', () => {

  test.describe('React State Management Edge Cases', () => {
    
    test('should handle useReducer state corruption', async ({ page }) => {
      await page.goto('/dashboard/community-hub')
      
      // Inject state corruption
      await page.evaluate(() => {
        // Simulate corrupted Redux/useReducer state
        const event = new CustomEvent('stateCorruption', {
          detail: { 
            corruptedState: { 
              posts: null, 
              activeTab: undefined,
              selectedCategory: 42 // wrong type
            }
          }
        })
        window.dispatchEvent(event)
      })
      
      // Component should handle gracefully
      await expect(page.getByText('Community')).toBeVisible()
      await expect(page.getByText(/error.*state/i)).toBeVisible()
      
      // Should provide reset option
      await page.click('button:has-text("Reset")')
      await expect(page.getByText('Creator Marketplace')).toBeVisible()
    })

    test('should handle rapid prop changes in dynamic components', async ({ page }) => {
      await page.goto('/dashboard/ai-create')
      
      // Rapidly change component props
      for (let i = 0; i < 100; i++) {
        await page.evaluate((iteration) => {
          const event = new CustomEvent('propChange', {
            detail: { 
              newProps: { 
                mode: iteration % 2 === 0 ? 'design' : 'analyze',
                theme: iteration % 3 === 0 ? 'dark' : 'light',
                complexity: Math.random()
              }
            }
          })
          window.dispatchEvent(event)
        }, i)
        
        if (i % 10 === 0) {
          await page.waitForTimeout(10) // Brief pause
        }
      }
      
      // Component should remain stable
      await expect(page.getByText('AI Create')).toBeVisible()
      
      // Should not have memory leaks
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      expect(memoryUsage).toBeLessThan(100000000) // 100MB limit
    })

    test('should handle context provider failures', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Simulate React Context provider failure
      await page.evaluate(() => {
        // Override React Context
        const originalCreateContext = React.createContext
        React.createContext = () => {
          throw new Error('Context Provider Failed')
        }
      })
      
      await page.reload()
      
      // Should show fallback UI
      await expect(page.getByText(/unable to load/i)).toBeVisible()
      
      // Should provide recovery option
      await expect(page.getByRole('button', { name: /reload/i })).toBeVisible()
    })
  })

  test.describe('TypeScript Type Safety Edge Cases', () => {
    
    test('should handle runtime type mismatches', async ({ page }) => {
      await page.route('**/api/projects', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // Violate TypeScript interfaces at runtime
            projects: [
              {
                id: 123, // should be string
                title: null, // should be string
                status: 'invalid_status', // not in enum
                createdAt: 'invalid_date', // invalid date format
                budget: 'not_a_number' // should be number
              }
            ]
          })
        })
      })
      
      await page.goto('/dashboard/projects-hub')
      
      // Should handle type violations gracefully
      await expect(page.getByText(/data validation error/i)).toBeVisible()
      
      // Should show sanitized data
      await expect(page.getByText('Project 123')).toBeVisible() // ID converted
      await expect(page.getByText('Untitled Project')).toBeVisible() // null title handled
    })

    test('should validate API response schemas', async ({ page }) => {
      await page.route('**/api/analytics', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // Missing required fields
            analytics: {
              // visitors: missing
              pageviews: "not_a_number",
              // conversion_rate: missing
              top_pages: "should_be_array
            }
          })
        })
      })
      
      await page.goto('/dashboard/analytics')
      
      // Should show schema validation error
      await expect(page.getByText(/invalid.*data.*format/i)).toBeVisible()
      
      // Should fallback to safe defaults
      await expect(page.getByText('0 visitors')).toBeVisible()
      await expect(page.getByText('0% conversion')).toBeVisible()
    })
  })

  test.describe('Next.js Routing Edge Cases', () => {
    
    test('should handle dynamic route parameter injection', async ({ page }) => {
      // Try to inject malicious route parameters
      const maliciousParams = [
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
        '../../../../../../',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2f',
        'null\0byte',
        '../admin/sensitive-data
      ]
      
      for (const param of maliciousParams) {
        await page.goto(`/dashboard/projects/${encodeURIComponent(param)}`)
        
        // Should show 404 or safe error page
        const isErrorPage = await page.getByText('404').isVisible() || 
                           await page.getByText('Not Found').isVisible() ||
                           await page.getByText('Invalid Project').isVisible()
        
        expect(isErrorPage).toBe(true)
        
        // Should not execute any injected scripts
        const alerts = []
        page.on('dialog', dialog => {
          alerts.push(dialog.message())
          dialog.dismiss()
        })
        
        await page.waitForTimeout(1000)
        expect(alerts).toHaveLength(0)
      }
    })

    test('should handle middleware failures', async ({ page }) => {
      // Simulate middleware failure
      await page.route('**/_next/**', route => {
        if (route.request().url().includes('middleware')) {
          route.fulfill({
            status: 500,
            body: 'Middleware Error
          })
        } else {
          route.continue()
        }
      })
      
      await page.goto('/dashboard')
      
      // Should fallback gracefully
      await expect(page.locator('body')).toBeVisible()
      
      // Should not expose internal errors
      await expect(page.getByText('Internal Server Error')).not.toBeVisible()
      await expect(page.getByText('Middleware Error')).not.toBeVisible()
    })

    test('should handle SSR hydration mismatches', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Simulate hydration mismatch
      await page.evaluate(() => {
        // Modify DOM after SSR but before hydration
        const elements = document.querySelectorAll('[data-hydration-test]')
        elements.forEach(el => {
          el.textContent = 'Modified after SSR
        })
      })
      
      await page.reload()
      
      // Should handle hydration gracefully
      await expect(page.getByText('Dashboard')).toBeVisible()
      
      // Should not crash the application
      await page.click('text=Projects Hub')
      await expect(page.getByText('Projects Hub')).toBeVisible()
    })
  })

  test.describe('Supabase Integration Edge Cases', () => {
    
    test('should handle database connection failures', async ({ page }) => {
      await page.route('**/supabase/**', route => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Database connection failed',
            code: 'CONNECTION_ERROR
          })
        })
      })
      
      await page.goto('/dashboard')
      
      // Should show database error message
      await expect(page.getByText(/database.*unavailable/i)).toBeVisible()
      
      // Should provide offline mode
      await expect(page.getByText(/offline mode/i)).toBeVisible()
      
      // Should cache basic functionality
      await page.click('text=Files Hub')
      await expect(page.getByText('Files Hub')).toBeVisible()
    })

    test('should handle real-time subscription failures', async ({ page }) => {
      let connectionAttempts = 0
      
      await page.route('**/realtime/**', route => {
        connectionAttempts++
        if (connectionAttempts <= 3) {
          route.fulfill({
            status: 408,
            body: 'Connection timeout
          })
        } else {
          route.continue()
        }
      })
      
      await page.goto('/dashboard/community-hub')
      
      // Should retry connection
      await page.waitForTimeout(5000)
      expect(connectionAttempts).toBeGreaterThan(1)
      
      // Should show connection status
      await expect(page.getByText(/connecting/i)).toBeVisible()
      
      // Should eventually connect or show offline mode
      await expect(page.getByText(/connected|offline/i)).toBeVisible({ timeout: 10000 })
    })

    test('should handle RLS policy violations', async ({ page }) => {
      await page.route('**/api/projects/create', route => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Row Level Security policy violation',
            code: 'INSUFFICIENT_PRIVILEGE
          })
        })
      })
      
      await page.goto('/dashboard/projects-hub')
      await page.click('text=Create Project')
      
      await page.fill('input[name="title"]', 'Test Project')
      await page.click('button[type="submit"]')
      
      // Should show permission error
      await expect(page.getByText(/permission.*denied/i)).toBeVisible()
      
      // Should suggest appropriate action
      await expect(page.getByText(/contact.*administrator/i)).toBeVisible()
    })
  })

  test.describe('File Upload Edge Cases', () => {
    
    test('should handle corrupted file uploads', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      
      await page.route('**/api/storage/upload', route => {
        route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'File appears to be corrupted',
            code: 'CORRUPTED_FILE
          })
        })
      })
      
      // Simulate corrupted file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        const corruptedData = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]) // Invalid header
        const file = new File([corruptedData], 'corrupted.pdf', { type: 'application/pdf' })
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
      
      // Should show corruption error
      await expect(page.getByText(/file.*corrupted/i)).toBeVisible()
      
      // Should suggest re-uploading
      await expect(page.getByText(/try.*different.*file/i)).toBeVisible()
    })

    test('should handle simultaneous file uploads', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      
      let uploadCount = 0
      await page.route('**/api/storage/upload', route => {
        uploadCount++
        // Simulate varying upload times
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              fileId: `file_${uploadCount}`,
              uploadTime: Date.now()
            })
          })
        }, Math.random() * 3000)
      })
      
      // Start multiple uploads simultaneously
      for (let i = 0; i < 5; i++) {
        await page.evaluate((index) => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement
          const file = new File([`content ${index}`], `file_${index}.txt`, { type: 'text/plain' })
          const dt = new DataTransfer()
          dt.items.add(file)
          input.files = dt.files
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }, i)
      }
      
      // Should handle concurrent uploads
      await expect(page.getByText(/uploading.*5.*files/i)).toBeVisible()
      
      // Should complete all uploads
      await expect(page.getByText(/5.*files.*uploaded/i)).toBeVisible({ timeout: 10000 })
    })

    test('should handle storage quota exceeded', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      
      await page.route('**/api/storage/upload', route => {
        route.fulfill({
          status: 413,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Storage quota exceeded',
            code: 'QUOTA_EXCEEDED',
            quota: {
              used: '4.8 GB',
              limit: '5 GB
            }
          })
        })
      })
      
      // Try to upload file
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        const largeData = new Uint8Array(1024 * 1024) // 1MB
        const file = new File([largeData], 'large.pdf', { type: 'application/pdf' })
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
      
      // Should show quota error
      await expect(page.getByText(/storage.*quota.*exceeded/i)).toBeVisible()
      
      // Should show usage details
      await expect(page.getByText(/4\.8 GB.*5 GB/i)).toBeVisible()
      
      // Should offer upgrade option
      await expect(page.getByRole('button', { name: /upgrade.*storage/i })).toBeVisible()
    })
  })

  test.describe('AI Integration Edge Cases', () => {
    
    test('should handle AI service timeouts', async ({ page }) => {
      await page.goto('/dashboard/ai-create')
      
      await page.route('**/api/ai/**', route => {
        // Never respond to simulate timeout
        // Don't call route.fulfill() or route.continue()
      })
      
      await page.fill('textarea[placeholder*="describe"]', 'Create a modern landing page')
      await page.click('button:has-text("Generate")')
      
      // Should show timeout warning
      await expect(page.getByText(/ai.*taking.*longer/i)).toBeVisible({ timeout: 10000 })
      
      // Should offer cancel option
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
      
      // Should allow retry
      await page.click('button:has-text("Cancel")')
      await expect(page.getByRole('button', { name: /try.*again/i })).toBeVisible()
    })

    test('should handle AI service rate limiting', async ({ page }) => {
      await page.goto('/dashboard/ai-create')
      
      await page.route('**/api/ai/**', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60,
            remaining: 0,
            resetTime: Date.now() + 60000
          })
        })
      })
      
      await page.fill('textarea[placeholder*="describe"]', 'Create a design')
      await page.click('button:has-text("Generate")')
      
      // Should show rate limit message
      await expect(page.getByText(/rate.*limit.*exceeded/i)).toBeVisible()
      
      // Should show retry countdown
      await expect(page.getByText(/try.*again.*60.*seconds/i)).toBeVisible()
      
      // Should disable generate button
      await expect(page.getByRole('button', { name: /generate/i })).toBeDisabled()
    })

    test('should handle invalid AI responses', async ({ page }) => {
      await page.goto('/dashboard/ai-create')
      
      await page.route('**/api/ai/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // Invalid/unexpected response format
            result: null,
            data: "not_an_object",
            suggestions: 42, // should be array
            confidence: "high" // should be number
          })
        })
      })
      
      await page.fill('textarea[placeholder*="describe"]', 'Create a design')
      await page.click('button:has-text("Generate")')
      
      // Should handle invalid response gracefully
      await expect(page.getByText(/unexpected.*response/i)).toBeVisible()
      
      // Should offer to try with different prompt
      await expect(page.getByText(/try.*different.*prompt/i)).toBeVisible()
    })
  })

  test.describe('WebSocket/Real-time Edge Cases', () => {
    
    test('should handle WebSocket connection drops', async ({ page }) => {
      await page.goto('/dashboard/collaboration')
      
      // Simulate WebSocket connection drop
      await page.evaluate(() => {
        // Override WebSocket to simulate drops
        const originalWebSocket = window.WebSocket
        window.WebSocket = class extends originalWebSocket {
          constructor(...args: any[]) {
            super(...args)
            // Simulate connection drop after 2 seconds
            setTimeout(() => {
              this.close(1006, 'Connection dropped')
            }, 2000)
          }
        } as any
      })
      
      // Should detect connection drop
      await expect(page.getByText(/connection.*lost/i)).toBeVisible({ timeout: 5000 })
      
      // Should attempt reconnection
      await expect(page.getByText(/reconnecting/i)).toBeVisible()
      
      // Should show offline mode if reconnection fails
      await expect(page.getByText(/offline.*mode/i)).toBeVisible({ timeout: 10000 })
    })

    test('should handle message flooding', async ({ page }) => {
      await page.goto('/dashboard/collaboration')
      
      // Simulate message flooding
      await page.evaluate(() => {
        const mockSocket = {
          readyState: 1,
          send: () => {},
          close: () => {},
          addEventListener: (event: string, callback: Function) => {
            if (event === 'message') {
              // Flood with messages
              for (let i = 0; i < 1000; i++) {
                setTimeout(() => {
                  callback({
                    data: JSON.stringify({
                      type: 'chat_message',
                      id: `msg_${i}`,
                      content: `Flood message ${i}`,
                      timestamp: Date.now()
                    })
                  })
                }, i * 10) // 10ms intervals
              }
            }
          }
        }
        
        // Replace WebSocket instance
        ;(window as any).__mockSocket = mockSocket
      })
      
      // Should throttle message processing
      await page.waitForTimeout(15000) // Wait for flooding
      
      // Should remain responsive
      await expect(page.getByRole('button', { name: /send/i })).toBeEnabled()
      
      // Should not show all 1000 messages
      const messageCount = await page.locator('[data-testid="chat-message"]').count()
      expect(messageCount).toBeLessThan(100) // Should be throttled
    })
  })

  test.describe('Performance Memory Edge Cases', () => {
    
    test('should handle memory pressure during file processing', async ({ page }) => {
      await page.goto('/dashboard/files-hub')
      
      // Simulate memory-intensive file processing
      await page.evaluate(() => {
        // Create large arrays to simulate memory pressure
        const largeArrays = []
        for (let i = 0; i < 100; i++) {
          largeArrays.push(new Array(100000).fill(`memory_test_${i}`))
        }
        
        // Store in global scope to prevent GC
        ;(window as any).__memoryTest = largeArrays
      })
      
      // Try file operations under memory pressure
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
      
      // Should handle gracefully
      await expect(page.getByText(/processing/i)).toBeVisible()
      
      // Should not crash
      await expect(page.getByText('Files Hub')).toBeVisible()
    })

    test('should handle DOM node limits', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Create excessive DOM nodes
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.id = 'stress-test-container
        
        // Create 50,000 DOM nodes
        for (let i = 0; i < 50000; i++) {
          const div = document.createElement('div')
          div.textContent = `Node ${i}
          div.className = 'stress-test-node
          container.appendChild(div)
        }
        
        document.body.appendChild(container)
      })
      
      // Should remain responsive
      await page.click('text=Projects Hub')
      await expect(page.getByText('Projects Hub')).toBeVisible()
      
      // Should allow cleanup
      await page.evaluate(() => {
        const container = document.getElementById('stress-test-container')
        if (container) {
          container.remove()
        }
      })
      
      // Should restore normal performance
      await page.click('text=Dashboard')
      await expect(page.getByText('Dashboard')).toBeVisible()
    })
  })
})

// Context7 Test Utilities
export class Context7TestHelper {
  
  static async simulateNetworkFailure(page: Page, duration: number = 5000) {
    await page.route('**/*', route => {
      setTimeout(() => route.abort(), duration)
    })
  }
  
  static async simulateSlowNetwork(page: Page, delay: number = 2000) {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), delay)
    })
  }
  
  static async injectMemoryPressure(page: Page) {
    await page.evaluate(() => {
      const arrays = []
      for (let i = 0; i < 1000; i++) {
        arrays.push(new Array(10000).fill(`memory_${i}`))
      }
      ;(window as any).__memoryPressure = arrays
    })
  }
  
  static async simulateUserSpam(page: Page, selector: string, count: number = 100) {
    for (let i = 0; i < count; i++) {
      await page.click(selector, { timeout: 100 })
      if (i % 10 === 0) await page.waitForTimeout(10)
    }
  }
} 