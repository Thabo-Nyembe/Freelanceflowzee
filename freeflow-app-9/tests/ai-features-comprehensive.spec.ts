import { test, expect } from '@playwright/test'

test.describe('🤖 AI Features - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Navigate to AI Create tab
    const aiTab = page.getByRole('tab', { name: /ai.*create|ai.*studio/i })
    await aiTab.click()
    await page.waitForTimeout(1000)
  })

  test('should test AI chat functionality with various prompts', async ({ page }) => {
    const testPrompts = [
      'Help me create a marketing strategy for my freelance business',
      'Generate a project proposal for web design services',
      'Write a professional email to a potential client',
      'Create a social media content calendar',
      'Help me price my design services',
      'Generate invoice terms and conditions',
      'Create a client onboarding checklist',
      'Write a project completion email',
      'Help me organize my project timeline',
      'Generate creative brief questions for clients'
    ]

    const chatInput = page.getByPlaceholder(/ask.*ai|chat.*ai|message|prompt/i)
    const sendBtn = page.getByRole('button', { name: /send|submit/i })

    for (const prompt of testPrompts) {
      if (await chatInput.isVisible() && await sendBtn.isVisible()) {
        console.log(`Testing AI prompt: ${prompt.substring(0, 50)}...`)
        
        await chatInput.fill(prompt)
        await page.waitForTimeout(500)
        
        await sendBtn.click()
        await page.waitForTimeout(3000) // Wait for AI response
        
        // Check for response indicators
        const responseElements = [
          page.getByText(/response|generated|ai.*says|result/i),
          page.locator('[data-testid*="ai-response"], [data-testid*="message"]'),
          page.locator('.ai-response, .chat-message, .response-content')
        ]
        
        let responseFound = false
        for (const element of responseElements) {
          if (await element.isVisible()) {
            responseFound = true
            break
          }
        }
        
        if (responseFound) {
          console.log(`✅ AI responded to: ${prompt.substring(0, 30)}...`)
        } else {
          console.log(`⚠️ No visible response for: ${prompt.substring(0, 30)}...`)
        }
        
        // Clear for next prompt
        await chatInput.clear()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should test AI content generation tools', async ({ page }) => {
    const contentTools = [
      { 
        name: 'Blog Post Generator',
        prompt: 'Write a blog post about freelancing tips',
        expected: /blog|post|freelancing|tips/i
      },
      {
        name: 'Email Template Creator',
        prompt: 'Create a professional follow-up email template',
        expected: /email|follow.*up|template/i
      },
      {
        name: 'Social Media Content',
        prompt: 'Generate Instagram captions for design posts',
        expected: /instagram|caption|design/i
      },
      {
        name: 'Project Description Writer',
        prompt: 'Write a project description for a website redesign',
        expected: /project|description|website|redesign/i
      },
      {
        name: 'Proposal Generator',
        prompt: 'Create a project proposal for logo design',
        expected: /proposal|logo|design/i
      }
    ]

    for (const tool of contentTools) {
      console.log(`Testing: ${tool.name}`)
      
      // Look for specific tool buttons
      const toolBtn = page.getByRole('button', { name: new RegExp(tool.name, 'i') })
      if (await toolBtn.isVisible()) {
        await toolBtn.click()
        await page.waitForTimeout(1000)
      }
      
      // Use the chat interface if no specific tool button
      const chatInput = page.getByPlaceholder(/prompt|describe|input|message/i)
      if (await chatInput.isVisible()) {
        await chatInput.fill(tool.prompt)
        
        const generateBtn = page.getByRole('button', { name: /generate|create|submit|send/i })
        if (await generateBtn.isVisible()) {
          await generateBtn.click()
          await page.waitForTimeout(3000)
          
          // Check for generated content
          const content = page.getByText(tool.expected)
          if (await content.isVisible()) {
            console.log(`✅ Generated content for: ${tool.name}`)
          }
        }
      }
      
      // Close any modals
      const closeBtn = page.getByRole('button', { name: /close|cancel|done/i })
      if (await closeBtn.isVisible()) {
        await closeBtn.click()
      } else {
        await page.keyboard.press('Escape')
      }
      
      await page.waitForTimeout(500)
    }
  })

  test('should test AI creative assistance features', async ({ page }) => {
    const creativeFeatures = [
      'Generate design ideas',
      'Create color palette suggestions',
      'Suggest typography combinations',
      'Generate layout concepts',
      'Create mood board ideas',
      'Suggest branding elements',
      'Generate icon concepts',
      'Create style guide content',
      'Suggest image compositions',
      'Generate creative briefs'
    ]

    for (const feature of creativeFeatures) {
      console.log(`Testing creative feature: ${feature}`)
      
      const featureBtn = page.getByRole('button', { name: new RegExp(feature, 'i') })
      if (await featureBtn.isVisible()) {
        await featureBtn.click()
        await page.waitForTimeout(1000)
        
        // Test feature-specific inputs
        const inputs = page.locator('input, textarea')
        const inputCount = await inputs.count()
        
        for (let i = 0; i < Math.min(inputCount, 2); i++) {
          const input = inputs.nth(i)
          if (await input.isVisible()) {
            await input.fill('Modern, minimalist design for tech startup')
          }
        }
        
        const submitBtn = page.getByRole('button', { name: /generate|create|submit/i })
        if (await submitBtn.isVisible()) {
          await submitBtn.click()
          await page.waitForTimeout(2000)
        }
        
        // Close modal
        const closeBtn = page.getByRole('button', { name: /close|done/i })
        if (await closeBtn.isVisible()) {
          await closeBtn.click()
        } else {
          await page.keyboard.press('Escape')
        }
      }
    }
  })

  test('should test AI business optimization features', async ({ page }) => {
    const businessPrompts = [
      'Analyze my freelance pricing strategy',
      'Optimize my project workflow',
      'Suggest time management improvements',
      'Help me identify new revenue streams',
      'Optimize my client communication process',
      'Suggest ways to scale my business',
      'Analyze my project completion times',
      'Help me improve client satisfaction',
      'Suggest marketing strategies for freelancers',
      'Optimize my service offerings'
    ]

    const chatInput = page.getByPlaceholder(/ask.*ai|message|prompt/i)
    const sendBtn = page.getByRole('button', { name: /send|submit/i })

    if (await chatInput.isVisible() && await sendBtn.isVisible()) {
      for (const prompt of businessPrompts) {
        console.log(`Testing business optimization: ${prompt.substring(0, 40)}...`)
        
        await chatInput.fill(prompt)
        await page.waitForTimeout(500)
        
        await sendBtn.click()
        await page.waitForTimeout(3000)
        
        // Look for business-specific response elements
        const businessKeywords = [
          /strategy|optimize|improve|revenue|pricing/i,
          /workflow|efficiency|productivity|scale/i,
          /client|satisfaction|communication|marketing/i
        ]
        
        let relevantResponse = false
        for (const keyword of businessKeywords) {
          const response = page.getByText(keyword)
          if (await response.isVisible()) {
            relevantResponse = true
            break
          }
        }
        
        if (relevantResponse) {
          console.log(`✅ Received business advice for: ${prompt.substring(0, 30)}...`)
        }
        
        await chatInput.clear()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should test AI error handling and edge cases', async ({ page }) => {
    const edgeCasePrompts = [
      '', // Empty prompt
      'a', // Single character
      'Very long prompt that exceeds normal limits: ' + 'a'.repeat(2000),
      '!@#$%^&*()_+-=[]{}|;\':",./<>?', // Special characters
      '<script>alert("test")</script>', // XSS attempt
      'Tell me something inappropriate', // Content filter test
      '🚀💯🎨🔥✨', // Only emojis
      'prompt in multiple languages: Hola, こんにちは, Bonjour', // Multi-language
      'CAPS LOCK PROMPT TESTING SHOUTING', // All caps
      '   spaces   everywhere   in   this   prompt   ' // Excessive whitespace
    ]

    const chatInput = page.getByPlaceholder(/ask.*ai|message|prompt/i)
    const sendBtn = page.getByRole('button', { name: /send|submit/i })

    if (await chatInput.isVisible() && await sendBtn.isVisible()) {
      for (const prompt of edgeCasePrompts) {
        console.log(`Testing edge case: ${prompt.substring(0, 30)}...`)
        
        await chatInput.fill(prompt)
        await page.waitForTimeout(300)
        
        // Check if send button is enabled/disabled appropriately
        const isEnabled = await sendBtn.isEnabled()
        if (prompt === '') {
          // Empty prompt should disable send button
          expect(isEnabled).toBe(false)
        } else {
          if (isEnabled) {
            await sendBtn.click()
            await page.waitForTimeout(2000)
            
            // Check for error messages or appropriate responses
            const errorIndicators = [
              page.getByText(/error|invalid|failed|sorry/i),
              page.getByText(/try.*again|please.*rephrase/i)
            ]
            
            let errorHandled = false
            for (const indicator of errorIndicators) {
              if (await indicator.isVisible()) {
                errorHandled = true
                console.log(`✅ Error properly handled for: ${prompt.substring(0, 20)}...`)
                break
              }
            }
            
            if (!errorHandled) {
              console.log(`ℹ️ No error message for: ${prompt.substring(0, 20)}...`)
            }
          }
        }
        
        await chatInput.clear()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should test AI response interaction features', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask.*ai|message|prompt/i)
    const sendBtn = page.getByRole('button', { name: /send|submit/i })

    if (await chatInput.isVisible() && await sendBtn.isVisible()) {
      // Send a test prompt to get a response
      await chatInput.fill('Help me create a professional portfolio website')
      await sendBtn.click()
      await page.waitForTimeout(3000)
      
      // Test response interaction buttons
      const responseActions = [
        'Copy',
        'Copy Text',
        'Save',
        'Save Response',
        'Share',
        'Share Response',
        'Edit',
        'Refine',
        'Regenerate',
        'Try Again',
        'Thumbs Up',
        'Like',
        'Thumbs Down',
        'Dislike',
        'Feedback',
        'Report',
        'Follow Up',
        'Continue',
        'Expand',
        'Summarize'
      ]
      
      for (const action of responseActions) {
        const actionBtn = page.getByRole('button', { name: new RegExp(action, 'i') })
        if (await actionBtn.isVisible()) {
          console.log(`Testing response action: ${action}`)
          await actionBtn.click()
          await page.waitForTimeout(500)
          
          // Handle any resulting modals or confirmations
          const confirmBtn = page.getByRole('button', { name: /confirm|yes|ok/i })
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click()
          }
          
          const closeBtn = page.getByRole('button', { name: /close|cancel|done/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          }
        }
      }
    }
  })

  test('should test AI template and preset features', async ({ page }) => {
    const templateCategories = [
      'Marketing Templates',
      'Business Templates',
      'Creative Templates',
      'Communication Templates',
      'Project Templates',
      'Proposal Templates',
      'Email Templates',
      'Social Media Templates',
      'Content Templates',
      'Design Briefs'
    ]
    
    for (const category of templateCategories) {
      const categoryBtn = page.getByRole('button', { name: new RegExp(category, 'i') })
      if (await categoryBtn.isVisible()) {
        console.log(`Testing template category: ${category}`)
        await categoryBtn.click()
        await page.waitForTimeout(1000)
        
        // Test template selection
        const templateItems = page.locator('[data-testid*="template"], .template-item, .template-card')
        const templateCount = await templateItems.count()
        
        if (templateCount > 0) {
          // Test first template
          await templateItems.first().click()
          await page.waitForTimeout(1000)
          
          // Test "Use Template" button
          const useTemplateBtn = page.getByRole('button', { name: /use.*template|apply.*template|select/i })
          if (await useTemplateBtn.isVisible()) {
            await useTemplateBtn.click()
            await page.waitForTimeout(1000)
          }
          
          // Test customization options
          const customizeBtn = page.getByRole('button', { name: /customize|edit.*template|modify/i })
          if (await customizeBtn.isVisible()) {
            await customizeBtn.click()
            await page.waitForTimeout(1000)
            
            // Fill customization fields
            const inputs = page.locator('input, textarea')
            const inputCount = await inputs.count()
            
            for (let i = 0; i < Math.min(inputCount, 2); i++) {
              const input = inputs.nth(i)
              if (await input.isVisible()) {
                await input.fill('Custom test content')
              }
            }
            
            const saveBtn = page.getByRole('button', { name: /save|apply|update/i })
            if (await saveBtn.isVisible()) {
              await saveBtn.click()
              await page.waitForTimeout(1000)
            }
          }
        }
        
        // Close template browser
        const closeBtn = page.getByRole('button', { name: /close|back|done/i })
        if (await closeBtn.isVisible()) {
          await closeBtn.click()
        } else {
          await page.keyboard.press('Escape')
        }
      }
    }
  })
})
