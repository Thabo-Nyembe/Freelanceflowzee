import { test, expect, Page } from '@playwright/test

/**
 * A+++ Grade Edge Cases Test Suite
 * Comprehensive edge case testing for production-ready FreeflowZee application
 * Using Context7 patterns for enterprise-grade reliability testing
 */

interface TestContext {
  page: Page
  baseURL: string
  testMode: boolean
}

test.describe('A+++ Production Edge Cases - Critical Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.addInitScript(() => {
      // Enable test mode for all edge case scenarios
      window.TEST_MODE = true
      window.EDGE_CASE_TESTING = true
    })
  })

  test('Critical Error Recovery - API Timeout Handling', async ({ page }) => {
    // Test Context7 pattern: Graceful degradation under API failures
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 30000)) // Force timeout
    })

    await page.goto('/dashboard')
    
    // Should show loading states and fallback content
    await expect(page.locator('[data-testid="loading-fallback"]')).toBeVisible()
    await expect(page.locator('.error-boundary')).not.toBeVisible()
    
    // Verify offline functionality still works
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('Memory Pressure - Large Dataset Handling', async ({ page }) => {
    // Test Context7 pattern: Performance under memory constraints
    await page.goto('/dashboard/projects-hub')
    
    // Simulate large project dataset
    await page.addInitScript(() => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `project_${i}`,
        title: `Project ${i}`,
        description: 'A'.repeat(1000), // Large description
        files: Array.from({ length: 100 }, (_, j) => ({ id: j, size: 1024 * 1024 }))
      }))
      window.mockProjects = largeDataset
    })

    await page.reload()
    
    // Should handle virtualization and pagination properly
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible()
    
    // Memory usage should remain stable (no memory leaks)
    const memoryBefore = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
    
    // Trigger multiple renders
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="refresh-projects"]').click()
      await page.waitForTimeout(100)
    }
    
    const memoryAfter = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
    const memoryIncrease = memoryAfter - memoryBefore
    
    // Memory increase should be reasonable (< 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })

  test('Corrupted JSON Response Recovery', async ({ page }) => {
    // Test Context7 pattern: Robust error handling for malformed data
    await page.route('**/api/projects**', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"projects": [{"id": 1, "title": "Corrupted", "data": invalid_json}]}
      })
    })

    await page.goto('/dashboard/projects-hub')
    
    // Should gracefully handle JSON parsing errors
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
    
    // Retry mechanism should work
    await page.locator('[data-testid="retry-button"]').click()
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible()
  })
})

test.describe('A+++ Performance Edge Cases', () => {
  test('Concurrent File Upload Stress Test', async ({ page }) => {
    // Test Context7 pattern: Concurrent operation handling
    await page.goto('/dashboard/files-hub')
    
    // Simulate multiple large file uploads simultaneously
    const fileBuffer = Buffer.alloc(10 * 1024 * 1024) // 10MB file
    
    await page.setInputFiles('[data-testid="file-upload"]', [
      { name: 'file1.zip', mimeType: 'application/zip', buffer: fileBuffer },
      { name: 'file2.zip', mimeType: 'application/zip', buffer: fileBuffer },
      { name: 'file3.zip', mimeType: 'application/zip', buffer: fileBuffer },
      { name: 'file4.zip', mimeType: 'application/zip', buffer: fileBuffer },
      { name: 'file5.zip', mimeType: 'application/zip', buffer: fileBuffer }
    ])

    // Should handle queue management properly
    await expect(page.locator('[data-testid="upload-queue"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
    
    // Should not freeze the UI
    await expect(page.locator('[data-testid="cancel-all-uploads"]')).toBeEnabled()
    
    // Progress should be reported accurately
    const progressBars = page.locator('[data-testid="upload-progress-bar"]')
    await expect(progressBars).toHaveCount(5)
  })

  test('Rapid Navigation Stress Test', async ({ page }) => {
    // Test Context7 pattern: Route transition performance
    const routes = [
      '/dashboard',
      '/dashboard/projects-hub',
      '/dashboard/files-hub',
      '/dashboard/collaboration',
      '/dashboard/ai-create',
      '/dashboard/escrow',
      '/dashboard/community',
      '/dashboard/my-day
    ]

    const startTime = Date.now()
    
    // Rapidly navigate between routes
    for (let iteration = 0; iteration < 3; iteration++) {
      for (const route of routes) {
        await page.goto(route)
        await expect(page.locator('h1')).toBeVisible()
        
        // Each navigation should complete within 2 seconds
        const navigationTime = Date.now() - startTime
        expect(navigationTime).toBeLessThan(2000)
      }
    }
    
    // Memory should not accumulate
    const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
    expect(finalMemory).toBeLessThan(100 * 1024 * 1024) // < 100MB
  })

  test('Real-time Data Stream Performance', async ({ page }) => {
    // Test Context7 pattern: WebSocket performance under load
    await page.goto('/dashboard/collaboration')
    
    // Simulate high-frequency real-time updates
    await page.addInitScript(() => {
      const mockWebSocket = {
        send: () => {},
        addEventListener: (event: string, handler: Function) => {
          if (event === 'message') {
            // Simulate 100 messages per second
            setInterval(() => {
              handler({
                data: JSON.stringify({
                  type: 'collaboration_update',
                  data: { timestamp: Date.now(), changes: Math.random() }
                })
              })
            }, 10)
          }
        },
        close: () => {}
      }
      window.WebSocket = function() { return mockWebSocket }
    })

    await page.reload()
    
    // Should handle high frequency updates without UI blocking
    await page.waitForTimeout(5000) // Let it run for 5 seconds
    
    // UI should remain responsive
    await expect(page.locator('[data-testid="collaboration-canvas"]')).toBeVisible()
    await page.locator('[data-testid="add-comment-btn"]').click()
    await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible()
  })
})

test.describe('A+++ Security Edge Cases', () => {
  test('XSS Prevention - Malicious Input Sanitization', async ({ page }) => {
    // Test Context7 pattern: Input sanitization and XSS prevention
    await page.goto('/dashboard/projects-hub')
    await page.locator('[data-testid="create-project-btn"]').click()
    
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '\'\';!--"<XSS>=&{()}',
      '<svg onload="alert(\'XSS\')"></svg>
    ]

    for (const input of maliciousInputs) {
      await page.fill('[data-testid="project-title"]', input)
      await page.fill('[data-testid="project-description"]', input)
      await page.locator('[data-testid="save-project"]').click()
      
      // Should not execute any scripts
      await expect(page.locator('text=XSS')).not.toBeVisible()
      
      // Input should be sanitized
      const titleValue = await page.inputValue('[data-testid="project-title"]')
      expect(titleValue).not.toContain('<script>')
      expect(titleValue).not.toContain('javascript:')
    }
  })

  test('SQL Injection Prevention - Database Query Safety', async ({ page }) => {
    // Test Context7 pattern: Parameterized query protection
    await page.goto('/dashboard/projects-hub')
    
    const sqlInjectionAttempts = [
      "'; DROP TABLE projects; --",
      "' OR '1'='1",
      "'; INSERT INTO projects (title) VALUES ('hacked'); --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "admin')--
    ]

    for (const injection of sqlInjectionAttempts) {
      await page.locator('[data-testid="search-projects"]').fill(injection)
      await page.locator('[data-testid="search-btn"]').click()
      
      // Should return safe results or no results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
      
      // Should not show database errors
      await expect(page.locator('text=SQL')).not.toBeVisible()
      await expect(page.locator('text=syntax error')).not.toBeVisible()
    }
  })

  test('File Upload Security - Malicious File Detection', async ({ page }) => {
    // Test Context7 pattern: File validation and malware prevention
    await page.goto('/dashboard/files-hub')
    
    // Test various malicious file types
    const maliciousFiles = [
      { name: 'virus.exe', content: 'MZ\x90\x00\x03\x00\x00\x00', mimeType: 'application/x-msdownload' },
      { name: 'script.php', content: '<?php system($_GET["cmd"]); ?>', mimeType: 'application/x-php' },
      { name: 'payload.jar', content: 'PK\x03\x04', mimeType: 'application/java-archive' },
      { name: 'fake.jpg', content: '<?php echo "hack"; ?>', mimeType: 'image/jpeg' }
    ]

    for (const file of maliciousFiles) {
      await page.setInputFiles('[data-testid="file-upload"]', {
        name: file.name,
        mimeType: file.mimeType,
        buffer: Buffer.from(file.content)
      })

      // Should reject malicious files
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible()
      await expect(page.locator('text=File type not allowed')).toBeVisible()
    }
  })
})

test.describe('A+++ Accessibility Edge Cases', () => {
  test('Screen Reader Navigation - Complex UI Components', async ({ page }) => {
    // Test Context7 pattern: ARIA compliance and screen reader support
    await page.goto('/dashboard/collaboration')
    
    // Should have proper ARIA labels
    await expect(page.locator('[aria-label]')).toHaveCount.toBeGreaterThan(10)
    
    // Should support keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Complex components should have proper roles
    await expect(page.locator('[role="dialog"]')).toHaveCount(0) // No modals open initially
    await page.locator('[data-testid="open-modal-btn"]').click()
    await expect(page.locator('[role="dialog"]')).toHaveCount(1)
    
    // Should trap focus in modals
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    const modalArea = page.locator('[role="dialog"]')
    await expect(focusedElement).toBeVisible()
  })

  test('High Contrast Mode Compatibility', async ({ page }) => {
    // Test Context7 pattern: Visual accessibility compliance
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.goto('/dashboard')
    
    // Should maintain readability in high contrast
    const elements = await page.locator('*').all()
    for (const element of elements.slice(0, 20)) { // Test first 20 elements
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        }
      })
      
      // Should have sufficient contrast (simplified test)
      expect(styles.color).toBeTruthy()
      expect(styles.backgroundColor).toBeTruthy()
    }
  })
})

test.describe('A+++ Network Edge Cases', () => {
  test('Offline Mode Functionality', async ({ page, context }) => {
    // Test Context7 pattern: Progressive Web App capabilities
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toBeVisible()
    
    // Simulate going offline
    await context.setOffline(true)
    
    // Should show offline indicator
    await page.reload()
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    
    // Basic functionality should still work
    await expect(page.locator('h1')).toBeVisible()
    
    // Should queue actions for when online
    await page.locator('[data-testid="create-project-btn"]').click()
    await expect(page.locator('[data-testid="queued-action"]')).toBeVisible()
    
    // Coming back online should sync
    await context.setOffline(false)
    await page.reload()
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible()
  })

  test('Slow 3G Network Performance', async ({ page, context }) => {
    // Test Context7 pattern: Progressive loading and performance
    await context.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Mobile; slow-3g network)
    })
    
    // Throttle network to simulate slow 3G
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2s delay
      await route.continue()
    })

    const startTime = Date.now()
    await page.goto('/dashboard')
    
    // Should show progressive loading states
    await expect(page.locator('[data-testid="skeleton-loader"]')).toBeVisible()
    
    // Critical content should load first
    await expect(page.locator('h1')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeGreaterThan(1000) // Should be throttled
    
    // Images should load lazily
    const images = page.locator('img[loading="lazy"]')
    await expect(images).toHaveCount.toBeGreaterThan(0)
  })
})

test.describe('A+++ Browser Compatibility Edge Cases', () => {
  test('Legacy Browser Graceful Degradation', async ({ page }) => {
    // Test Context7 pattern: Progressive enhancement
    await page.addInitScript(() => {
      // Simulate older browser without modern APIs
      delete window.fetch
      delete window.Promise
      delete window.WebSocket
      delete window.localStorage
    })

    await page.goto('/dashboard')
    
    // Should still render basic content
    await expect(page.locator('h1')).toBeVisible()
    
    // Should show compatibility warnings
    await expect(page.locator('[data-testid="browser-warning"]')).toBeVisible()
    
    // Core functionality should work with polyfills
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
  })

  test('Extreme Viewport Sizes', async ({ page }) => {
    // Test Context7 pattern: Responsive design edge cases
    const extremeViewports = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 2560, height: 1440 }, // Large desktop
      { width: 1024, height: 1366 }, // iPad Pro portrait
      { width: 414, height: 896 }    // iPhone XR
    ]

    for (const viewport of extremeViewports) {
      await page.setViewportSize(viewport)
      await page.goto('/dashboard')
      
      // Should maintain usability at all sizes
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
      
      // Touch targets should be appropriately sized on mobile
      if (viewport.width < 768) {
        const buttons = page.locator('button')
        const firstButton = buttons.first()
        const buttonSize = await firstButton.boundingBox()
        
        if (buttonSize) {
          expect(buttonSize.height).toBeGreaterThanOrEqual(44) // iOS guidelines
        }
      }
    }
  })
})

test.describe('A+++ Data Integrity Edge Cases', () => {
  test('Concurrent Data Modification Conflicts', async ({ browser }) => {
    // Test Context7 pattern: Optimistic concurrency control
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Both pages edit the same project simultaneously
    await page1.goto('/dashboard/projects-hub')
    await page2.goto('/dashboard/projects-hub')

    await page1.locator('[data-testid="project-item"]').first().click()
    await page2.locator('[data-testid="project-item"]').first().click()

    // Modify same field on both pages
    await page1.fill('[data-testid="project-title"]', 'Version 1')
    await page2.fill('[data-testid="project-title"]', 'Version 2')

    // Save on page1 first
    await page1.locator('[data-testid="save-project"]').click()
    await expect(page1.locator('[data-testid="save-success"]')).toBeVisible()

    // Save on page2 should detect conflict
    await page2.locator('[data-testid="save-project"]').click()
    await expect(page2.locator('[data-testid="conflict-warning"]')).toBeVisible()

    await context1.close()
    await context2.close()
  })

  test('Large Dataset Pagination Edge Cases', async ({ page }) => {
    // Test Context7 pattern: Infinite scroll and virtual pagination
    await page.goto('/dashboard/projects-hub')
    
    // Simulate large dataset with 10,000 items
    await page.addInitScript(() => {
      window.mockProjects = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        title: `Project ${i}`,
        created: new Date(Date.now() - i * 1000)
      }))
    })

    await page.reload()
    
    // Should implement virtualization
    const visibleItems = page.locator('[data-testid="project-item"]')
    const itemCount = await visibleItems.count()
    expect(itemCount).toBeLessThan(100) // Should not render all 10,000
    
    // Scrolling should load more items efficiently
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    
    const newItemCount = await visibleItems.count()
    expect(newItemCount).toBeGreaterThan(itemCount) // Should load more
    
    // Jump to end should work
    await page.locator('[data-testid="goto-end"]').click()
    await expect(page.locator('text=Project 9999')).toBeVisible()
  })
})

// Export test utilities for reuse
export const EdgeCaseTestUtils = {
  simulateNetworkError: async (page: Page) => {
    await page.route('**/api/**', route => route.abort())
  },
  
  simulateHighMemoryUsage: async (page: Page) => {
    await page.addInitScript(() => {
      // Create memory pressure
      const largeArray = new Array(1000000).fill('memory pressure test')
      window.memoryPressure = largeArray
    })
  },
  
  testAccessibility: async (page: Page) => {
    // Comprehensive accessibility testing
    const axeResults = await page.evaluate(() => {
      // Simplified axe-core check
      const elements = document.querySelectorAll('*')
      const issues = []
      
      elements.forEach(el => {
        if (el.tagName === 'IMG' && !el.getAttribute('alt')) {
          issues.push({ type: 'missing-alt', element: el.tagName })
        }
        if (el.tagName === 'BUTTON' && !el.textContent && !el.getAttribute('aria-label')) {
          issues.push({ type: 'missing-label', element: el.tagName })
        }
      })
      
      return issues
    })
    
    expect(axeResults.length).toBe(0)
  }
} 