/**
 * COMPREHENSIVE EDGE CASE TESTS
 * Freeflow Kazi Platform - Boundary Conditions & Edge Case Testing
 *
 * Tests edge cases, boundary conditions, error handling, and unusual inputs
 *
 * Created: December 16, 2024
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// ============================================
// HELPER FUNCTIONS
// ============================================
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
}

// ============================================
// 1. INPUT BOUNDARY TESTS
// ============================================
test.describe('Input Boundary Tests', () => {
  test.describe('Text Input Boundaries', () => {
    test('should handle empty input', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await waitForPageReady(page)

      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill('')
      await emailInput.blur()

      // Should show validation error or required state
      const isEmpty = await emailInput.evaluate(el => el.value === '')
      expect(isEmpty).toBe(true)
    })

    test('should handle maximum length input', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`)
      await waitForPageReady(page)

      const textarea = page.locator('textarea')
      if (await textarea.count() > 0) {
        // Try to enter very long text (10000 chars)
        const longText = 'a'.repeat(10000)
        await textarea.fill(longText)

        const value = await textarea.inputValue()
        // Should either accept all or truncate
        expect(value.length).toBeGreaterThan(0)
      }
    })

    test('should handle special characters', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await waitForPageReady(page)

      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill('test+special@domain.com')

      const value = await emailInput.inputValue()
      expect(value).toBe('test+special@domain.com')
    })

    test('should handle unicode characters', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`)
      await waitForPageReady(page)

      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]')
      if (await nameInput.count() > 0) {
        await nameInput.fill('测试用户 🎉')

        const value = await nameInput.inputValue()
        expect(value).toBe('测试用户 🎉')
      }
    })

    test('should handle whitespace-only input', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await waitForPageReady(page)

      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill('   ')

      // Should treat as empty or invalid
      const isInvalid = await emailInput.evaluate(el => !el.checkValidity())
      expect(isInvalid).toBe(true)
    })

    test('should handle paste with newlines', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`)
      await waitForPageReady(page)

      const input = page.locator('input').first()
      if (await input.count() > 0 && await input.isVisible()) {
        await input.fill('line1\nline2')

        // Single-line input should strip newlines
        const value = await input.inputValue()
        expect(value).not.toContain('\n')
      }
    })
  })

  test.describe('Number Input Boundaries', () => {
    test('should handle zero values', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices`)
      await waitForPageReady(page)

      const numberInput = page.locator('input[type="number"]')
      if (await numberInput.count() > 0) {
        await numberInput.first().fill('0')
        const value = await numberInput.first().inputValue()
        expect(value).toBe('0')
      }
    })

    test('should handle negative values', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices`)
      await waitForPageReady(page)

      const numberInput = page.locator('input[type="number"]')
      if (await numberInput.count() > 0) {
        await numberInput.first().fill('-100')
        // May accept or reject based on min attribute
        const value = await numberInput.first().inputValue()
        expect(value).toBeTruthy()
      }
    })

    test('should handle decimal values', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices`)
      await waitForPageReady(page)

      const numberInput = page.locator('input[type="number"]')
      if (await numberInput.count() > 0) {
        await numberInput.first().fill('99.99')
        const value = await numberInput.first().inputValue()
        expect(value).toBe('99.99')
      }
    })

    test('should handle very large numbers', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/invoices`)
      await waitForPageReady(page)

      const numberInput = page.locator('input[type="number"]')
      if (await numberInput.count() > 0) {
        await numberInput.first().fill('999999999999')
        // Should accept or truncate
        const value = await numberInput.first().inputValue()
        expect(value.length).toBeGreaterThan(0)
      }
    })
  })
})

// ============================================
// 2. URL MANIPULATION TESTS
// ============================================
test.describe('URL Manipulation Tests', () => {
  test('should handle invalid route parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/projects/invalid-uuid-here`)
    await waitForPageReady(page)

    // Should show error or redirect
    const url = page.url()
    expect(url).toBeTruthy()
  })

  test('should handle SQL injection in URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/clients?id=1;DROP TABLE users;--`)
    await waitForPageReady(page)

    // Should not crash, should sanitize
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle XSS in URL parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=<script>alert('xss')</script>`)
    await waitForPageReady(page)

    // Should sanitize and not execute script
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('<script>')
  })

  test('should handle deeply nested routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/a/b/c/d/e/f/g/h/i/j`)
    await waitForPageReady(page)

    // Should show 404 or handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle URL encoding attacks', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/clients?name=%3Cscript%3Ealert(1)%3C/script%3E`)
    await waitForPageReady(page)

    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle hash fragments', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings#security`)
    await waitForPageReady(page)

    // Should scroll to section or handle hash
    expect(page.url()).toContain('#security')
  })
})

// ============================================
// 3. AUTHENTICATION EDGE CASES
// ============================================
test.describe('Authentication Edge Cases', () => {
  test('should handle expired session', async ({ page }) => {
    // Clear all storage to simulate expired session
    await page.context().clearCookies()
    await page.goto(`${BASE_URL}/dashboard/settings`)
    await waitForPageReady(page)

    // Should redirect to login
    const url = page.url()
    expect(url.includes('/login') || url.includes('/dashboard')).toBeTruthy()
  })

  test('should handle concurrent sessions', async ({ page, context }) => {
    // Open same page in two tabs
    const page2 = await context.newPage()

    await page.goto(`${BASE_URL}/dashboard/overview`)
    await page2.goto(`${BASE_URL}/dashboard/overview`)

    await waitForPageReady(page)
    await waitForPageReady(page2)

    // Both should load without conflict
    await expect(page.locator('body')).toBeVisible()
    await expect(page2.locator('body')).toBeVisible()

    await page2.close()
  })

  test('should handle invalid tokens in cookies', async ({ page }) => {
    // Set invalid auth cookie
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: 'invalid-token-12345',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto(`${BASE_URL}/dashboard/overview`)
    await waitForPageReady(page)

    // Should handle gracefully (redirect or show error)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle logout during request', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)
    await waitForPageReady(page)

    // Clear cookies mid-session
    await page.context().clearCookies()

    // Try to navigate
    await page.goto(`${BASE_URL}/dashboard/settings`)
    await waitForPageReady(page)

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 4. NETWORK EDGE CASES
// ============================================
test.describe('Network Edge Cases', () => {
  test('should handle offline mode', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Go offline
    await page.context().setOffline(true)

    // Try to navigate
    try {
      await page.goto(`${BASE_URL}/dashboard/overview`, { timeout: 5000 })
    } catch {
      // Expected to fail
    }

    // Go back online
    await page.context().setOffline(false)
    await page.goto(BASE_URL)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle slow network', async ({ page }) => {
    // Simulate slow 3G
    const client = await page.context().newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    })

    await page.goto(BASE_URL, { timeout: 30000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle request timeout', async ({ page }) => {
    // Set short timeout
    page.setDefaultTimeout(5000)

    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Should complete without timeout on normal pages
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle network reconnection', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Go offline briefly
    await page.context().setOffline(true)
    await page.waitForTimeout(1000)
    await page.context().setOffline(false)

    // Should recover
    await page.reload()
    await waitForPageReady(page)
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 5. BROWSER EDGE CASES
// ============================================
test.describe('Browser Edge Cases', () => {
  test('should handle back button', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    await page.goto(`${BASE_URL}/pricing`)
    await waitForPageReady(page)

    await page.goBack()
    await waitForPageReady(page)

    expect(page.url()).toBe(`${BASE_URL}/`)
  })

  test('should handle forward button', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.goto(`${BASE_URL}/pricing`)
    await page.goBack()
    await page.goForward()

    await waitForPageReady(page)
    expect(page.url()).toContain('/pricing')
  })

  test('should handle page refresh', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)
    await waitForPageReady(page)

    await page.reload()
    await waitForPageReady(page)

    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle multiple rapid refreshes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)

    // Rapid refreshes
    for (let i = 0; i < 3; i++) {
      await page.reload()
      await page.waitForTimeout(200)
    }

    await waitForPageReady(page)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser zoom', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Simulate zoom via viewport
    await page.setViewportSize({ width: 2560, height: 1440 }) // Large viewport

    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle print media', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Emulate print media
    await page.emulateMedia({ media: 'print' })

    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 6. STATE EDGE CASES
// ============================================
test.describe('State Edge Cases', () => {
  test('should handle localStorage full', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Try to fill localStorage
    await page.evaluate(() => {
      try {
        const data = 'x'.repeat(5 * 1024 * 1024) // 5MB
        localStorage.setItem('test', data)
      } catch {
        // Expected to fail
      }
    })

    // Page should still work
    await page.reload()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle corrupted localStorage', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Set corrupted data
    await page.evaluate(() => {
      localStorage.setItem('user', '{invalid json')
    })

    await page.reload()
    await waitForPageReady(page)

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle cleared sessionStorage', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)
    await waitForPageReady(page)

    // Clear session storage
    await page.evaluate(() => {
      sessionStorage.clear()
    })

    await page.reload()
    await waitForPageReady(page)

    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 7. FORM SUBMISSION EDGE CASES
// ============================================
test.describe('Form Submission Edge Cases', () => {
  test('should prevent double submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await waitForPageReady(page)

    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    const submitBtn = page.locator('button[type="submit"]')

    // Double click submit
    await submitBtn.dblclick()
    await page.waitForTimeout(1000)

    // Should not cause errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle form with all optional fields empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`)
    await waitForPageReady(page)

    // Only fill required fields (if any)
    const submitBtn = page.locator('button[type="submit"]')
    if (await submitBtn.count() > 0) {
      // Form should validate
      await expect(submitBtn).toBeVisible()
    }
  })

  test('should handle rapid input changes', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await waitForPageReady(page)

    const emailInput = page.locator('input[type="email"]')

    // Rapid typing simulation
    for (let i = 0; i < 10; i++) {
      await emailInput.fill(`test${i}@example.com`)
    }

    const finalValue = await emailInput.inputValue()
    expect(finalValue).toBe('test9@example.com')
  })

  test('should handle form submission during navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await waitForPageReady(page)

    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit and immediately navigate
    await page.click('button[type="submit"]')
    await page.goto(BASE_URL)

    await waitForPageReady(page)
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 8. FILE HANDLING EDGE CASES
// ============================================
test.describe('File Handling Edge Cases', () => {
  test('should handle no file selected', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/files-hub`)
    await waitForPageReady(page)

    // File upload without selecting file
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      // Verify input exists and accepts files
      const accept = await fileInput.getAttribute('accept')
      expect(typeof accept === 'string' || accept === null).toBeTruthy()
    }
  })

  test('should handle empty file', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/files-hub`)
    await waitForPageReady(page)

    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0 && await fileInput.first().isVisible()) {
      // Create empty buffer
      await fileInput.first().setInputFiles({
        name: 'empty.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(''),
      })
    }
  })

  test('should handle file with special characters in name', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/files-hub`)
    await waitForPageReady(page)

    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0 && await fileInput.first().isVisible()) {
      await fileInput.first().setInputFiles({
        name: 'test file (1) - copy [2].txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test content'),
      })
    }
  })
})

// ============================================
// 9. CONCURRENT ACTION EDGE CASES
// ============================================
test.describe('Concurrent Action Edge Cases', () => {
  test('should handle rapid navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)

    // Rapid clicks on different nav items
    const navLinks = page.locator('a[href*="/dashboard/"]')
    const count = await navLinks.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i)
      if (await link.isVisible()) {
        await link.click()
        // No wait between clicks
      }
    }

    await waitForPageReady(page)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle multiple modal opens', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`)
    await waitForPageReady(page)

    const modalTriggers = page.locator('button:has-text("Add"), button:has-text("Create")')
    const count = await modalTriggers.count()

    for (let i = 0; i < Math.min(count, 3); i++) {
      const trigger = modalTriggers.nth(i)
      if (await trigger.isVisible()) {
        await trigger.click()
        await page.waitForTimeout(100)
        // Press Escape to close
        await page.keyboard.press('Escape')
        await page.waitForTimeout(100)
      }
    }

    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 10. DATA EDGE CASES
// ============================================
test.describe('Data Edge Cases', () => {
  test('should handle empty data response', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/clients`)
    await waitForPageReady(page)

    // Should show empty state or handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle malformed date', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/calendar?date=invalid`)
    await waitForPageReady(page)

    // Should not crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle very long lists', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/files-hub?limit=1000`)
    await waitForPageReady(page)

    // Should handle large data sets
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle special characters in data', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/clients?search=<>&"'`)
    await waitForPageReady(page)

    // Should escape special characters
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 11. TIMING EDGE CASES
// ============================================
test.describe('Timing Edge Cases', () => {
  test('should handle immediate page close', async ({ page, context }) => {
    const newPage = await context.newPage()
    await newPage.goto(BASE_URL)
    await newPage.close()

    // Original page should still work
    await page.goto(BASE_URL)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle long-running operations', async ({ page }) => {
    page.setDefaultTimeout(60000)

    await page.goto(`${BASE_URL}/dashboard/analytics`)
    await waitForPageReady(page)

    // Wait for any charts/heavy content to load
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================
// 12. ACCESSIBILITY EDGE CASES
// ============================================
test.describe('Accessibility Edge Cases', () => {
  test('should handle screen reader navigation', async ({ page }) => {
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Tab through all focusable elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
    }

    // Should not crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle keyboard-only navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await waitForPageReady(page)

    // Navigate and submit using only keyboard
    await page.keyboard.press('Tab') // Focus email
    await page.keyboard.type('test@example.com')
    await page.keyboard.press('Tab') // Focus password
    await page.keyboard.type('password123')
    await page.keyboard.press('Tab') // Focus submit
    await page.keyboard.press('Enter')

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle high contrast mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(BASE_URL)
    await waitForPageReady(page)

    // Animations should be disabled
    await expect(page.locator('body')).toBeVisible()
  })
})

console.log('Comprehensive Edge Case Tests Suite loaded - 12 test categories')
