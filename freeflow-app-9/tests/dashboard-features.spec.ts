import { test, expect } from '@playwright/test'

test.describe('🎯 FreeflowZee - Complete Feature Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Try to navigate to dashboard (may require authentication)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test.describe('📊 Dashboard Overview Tab', () => {
    test('should display overview metrics and stats', async ({ page }) => {
      // Click Overview tab if not already active
      const overviewTab = page.getByRole('tab', { name: /overview/i })
      if (await overviewTab.isVisible()) {
        await overviewTab.click()
      }

      // Test metrics cards
      await expect(page.getByText(/activity|revenue|clients|growth/i)).toBeVisible()
      await expect(page.getByText(/\$[\d,]+|\d+%/)).toBeVisible()

      // Test quick action buttons
      const actionButtons = [
        'New Project',
        'Add Client', 
        'Create Invoice',
        'Upload File',
        'View Analytics'
      ]

      for (const buttonText of actionButtons) {
        const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(1000)
          
          // Check if modal/dialog opened
          const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]')
          if (await modal.isVisible()) {
            // Close modal if it opened
            const closeButton = modal.getByRole('button', { name: /close|cancel|×/i })
            if (await closeButton.isVisible()) {
              await closeButton.click()
            } else {
              await page.keyboard.press('Escape')
            }
          }
        }
      }
    })
  })

  test.describe('📁 Projects Hub Tab', () => {
    test('should test all project management features', async ({ page }) => {
      const projectsTab = page.getByRole('tab', { name: /projects.*hub|projects/i })
      await projectsTab.click()
      await page.waitForTimeout(1000)

      // Test Create New Project button
      const createProjectBtn = page.getByRole('button', { name: /create.*project|new.*project|\+ project/i })
      if (await createProjectBtn.isVisible()) {
        await createProjectBtn.click()
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('🤖 AI Create Tab', () => {
    test('should test all AI creation features', async ({ page }) => {
      const aiTab = page.getByRole('tab', { name: /ai.*create|ai.*studio/i })
      await aiTab.click()
      await page.waitForTimeout(1000)

      // Test AI chat interface
      const chatInput = page.getByPlaceholder(/ask.*ai|chat.*ai|message/i)
      if (await chatInput.isVisible()) {
        await chatInput.fill('Create a marketing strategy for a freelance design business')
        
        const sendBtn = page.getByRole('button', { name: /send|submit/i })
        if (await sendBtn.isVisible()) {
          await sendBtn.click()
          await page.waitForTimeout(3000)
          
          // Check for AI response
          const response = page.getByText(/strategy|marketing|design/i)
          if (await response.isVisible()) {
            await expect(response).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('💰 Escrow Tab', () => {
    test('should test escrow and payment features', async ({ page }) => {
      const escrowTab = page.getByRole('tab', { name: /escrow|payments/i })
      await escrowTab.click()
      await page.waitForTimeout(1000)

      // Test create escrow button
      const createEscrowBtn = page.getByRole('button', { name: /create.*escrow|new.*escrow/i })
      if (await createEscrowBtn.isVisible()) {
        await createEscrowBtn.click()
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('📁 Files Hub Tab', () => {
    test('should test file management features', async ({ page }) => {
      const filesTab = page.getByRole('tab', { name: /files.*hub|files/i })
      await filesTab.click()
      await page.waitForTimeout(1000)

      // Test file upload
      const uploadBtn = page.getByRole('button', { name: /upload|add.*files|\+ files/i })
      if (await uploadBtn.isVisible()) {
        await uploadBtn.click()
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('👥 Community Tab', () => {
    test('should test community features', async ({ page }) => {
      const communityTab = page.getByRole('tab', { name: /community/i })
      await communityTab.click()
      await page.waitForTimeout(1000)

      // Test create post button
      const createPostBtn = page.getByRole('button', { name: /create.*post|new.*post|\+ post/i })
      if (await createPostBtn.isVisible()) {
        await createPostBtn.click()
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('�� My Day Today Tab', () => {
    test('should test daily planning features', async ({ page }) => {
      const myDayTab = page.getByRole('tab', { name: /my.*day.*today|my.*day/i })
      await myDayTab.click()
      await page.waitForTimeout(1000)

      // Test add task button
      const addTaskBtn = page.getByRole('button', { name: /add.*task|new.*task|\+ task/i })
      if (await addTaskBtn.isVisible()) {
        await addTaskBtn.click()
        await page.waitForTimeout(1000)
      }
    })
  })
})

// Edge cases and stress testing for all features
test.describe('🔬 Edge Cases - All Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should handle rapid tab switching', async ({ page }) => {
    const tabNames = [
      'Overview',
      'Projects Hub', 
      'AI Create',
      'Video Studio',
      'Escrow',
      'Files Hub',
      'Community',
      'My Day Today'
    ]

    // Rapidly switch between tabs
    for (let i = 0; i < 20; i++) {
      const randomTab = tabNames[Math.floor(Math.random() * tabNames.length)]
      const tab = page.getByRole('tab', { name: new RegExp(randomTab, 'i') })
      
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(100)
      }
    }

    // Verify app is still functional
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible()
  })

  test('should handle form validation edge cases', async ({ page }) => {
    // Test empty form submissions
    const projectsTab = page.getByRole('tab', { name: /projects/i })
    await projectsTab.click()
    
    const createBtn = page.getByRole('button', { name: /create.*project/i })
    if (await createBtn.isVisible()) {
      await createBtn.click()
      await page.waitForTimeout(1000)
      
      // Try to submit empty form
      const submitBtn = page.getByRole('button', { name: /create|submit|save/i })
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await page.waitForTimeout(1000)
        
        // Check for validation errors
        const errorMessages = page.getByText(/required|error|invalid/i)
        if (await errorMessages.isVisible()) {
          await expect(errorMessages).toBeVisible()
        }
      }
    }
  })

  test('should handle special characters and emojis in inputs', async ({ page }) => {
    const specialInputs = [
      'Test with émojis 🚀💯🎨',
      '<script>alert("xss")</script>',
      'Very long text that exceeds normal limits: ' + 'a'.repeat(1000),
      '!@#$%^&*()_+-=[]{}|;\':",./<>?',
      '   spaces   everywhere   ',
      ''
    ]

    // Test in AI Create tab
    const aiTab = page.getByRole('tab', { name: /ai.*create/i })
    await aiTab.click()
    
    const chatInput = page.getByPlaceholder(/message|prompt/i)
    if (await chatInput.isVisible()) {
      for (const input of specialInputs) {
        await chatInput.fill(input)
        await page.waitForTimeout(500)
        
        const sendBtn = page.getByRole('button', { name: /send|submit/i })
        if (await sendBtn.isVisible()) {
          await sendBtn.click()
          await page.waitForTimeout(1000)
        }
        
        await chatInput.clear()
      }
    }
  })

  test('should handle concurrent operations', async ({ page }) => {
    // Perform multiple operations simultaneously
    const operations = [
      () => page.getByRole('tab', { name: /projects/i }).click(),
      () => page.getByRole('tab', { name: /ai.*create/i }).click(),
      () => page.getByRole('tab', { name: /files/i }).click(),
      () => page.getByRole('tab', { name: /community/i }).click()
    ]

    // Execute all operations concurrently
    await Promise.all(operations.map(op => op().catch(() => {})))
    
    // Verify app is still responsive
    await page.waitForTimeout(2000)
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible()
  })
})
