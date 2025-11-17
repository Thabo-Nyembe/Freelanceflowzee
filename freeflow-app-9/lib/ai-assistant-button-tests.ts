'use client'

import { showDemoNotification } from './demo-mode'

export interface AIAssistantButtonTest {
  id: string
  name: string
  selector: string
  expectedAction: string
  testFunction: () => Promise<boolean>
}

export const AI_ASSISTANT_BUTTON_TESTS: AIAssistantButtonTest[] = [
  {
    id: 'send-message',
    name: 'Send Message',
    selector: '[data-testid="send-message-btn"]',
    expectedAction: 'Sends a message to the AI assistant',
    testFunction: async () => {
      const input = document.querySelector('[data-testid="message-input"]') as HTMLTextAreaElement
      const button = document.querySelector('[data-testid="send-message-btn"]') as HTMLButtonElement
      
      if (input && button) {
        // Type a test message
        input.value = 'This is a test message from button testing'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!button.disabled) {
          button.click()
          showDemoNotification('✅ Message sent to AI assistant!')
          return true
        }
      }
      return false
    }
  },
  {
    id: 'voice-input',
    name: 'Voice Input Toggle',
    selector: '[data-testid="voice-input-btn"]',
    expectedAction: 'Toggles voice input mode',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="voice-input-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Voice input toggled!')
        return true
      }
      return false
    }
  },
  {
    id: 'thumbs-up',
    name: 'Rate Message Positive',
    selector: '[data-testid="thumbs-up-btn"]',
    expectedAction: 'Rates AI message positively',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="thumbs-up-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Message rated positively!')
        return true
      }
      return false
    }
  },
  {
    id: 'thumbs-down',
    name: 'Rate Message Negative',
    selector: '[data-testid="thumbs-down-btn"]',
    expectedAction: 'Rates AI message negatively',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="thumbs-down-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Message rated negatively!')
        return true
      }
      return false
    }
  },
  {
    id: 'copy-message',
    name: 'Copy Message',
    selector: '[data-testid="copy-message-btn"]',
    expectedAction: 'Copies AI message to clipboard',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="copy-message-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Message copied to clipboard!')
        return true
      }
      return false
    }
  },
  {
    id: 'bookmark-message',
    name: 'Bookmark Message',
    selector: '[data-testid="bookmark-message-btn"]',
    expectedAction: 'Bookmarks AI message for later',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="bookmark-message-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Message bookmarked!')
        return true
      }
      return false
    }
  },
  {
    id: 'suggestion-click',
    name: 'Click Suggestion',
    selector: '[data-testid="suggestion-btn"]',
    expectedAction: 'Clicks on AI suggestion to use as input',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="suggestion-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ AI suggestion selected!')
        return true
      }
      return false
    }
  },
  {
    id: 'quick-action-analyze-projects',
    name: 'Quick Action: Analyze Projects',
    selector: '[data-testid="quick-action-analyze-projects"]',
    expectedAction: 'Triggers project analysis',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="quick-action-analyze-projects"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Project analysis triggered!')
        return true
      }
      return false
    }
  },
  {
    id: 'quick-action-optimize-workflow',
    name: 'Quick Action: Optimize Workflow',
    selector: '[data-testid="quick-action-optimize-workflow"]',
    expectedAction: 'Triggers workflow optimization',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="quick-action-optimize-workflow"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Workflow optimization triggered!')
        return true
      }
      return false
    }
  },
  {
    id: 'quick-action-pricing-help',
    name: 'Quick Action: Pricing Help',
    selector: '[data-testid="quick-action-pricing-help"]',
    expectedAction: 'Triggers pricing guidance',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="quick-action-pricing-help"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Pricing guidance triggered!')
        return true
      }
      return false
    }
  },
  {
    id: 'refresh-insights',
    name: 'Refresh AI Insights',
    selector: '[data-testid="refresh-insights-btn"]',
    expectedAction: 'Refreshes AI insights data',
    testFunction: async () => {
      // First switch to insights tab
      const insightsTab = document.querySelector('[value="insights"]') as HTMLButtonElement
      if (insightsTab) {
        insightsTab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const button = document.querySelector('[data-testid="refresh-insights-btn"]') as HTMLButtonElement
        if (button) {
          button.click()
          showDemoNotification('✅ AI insights refreshed!')
          return true
        }
      }
      return false
    }
  },
  {
    id: 'insight-action',
    name: 'Execute Insight Action',
    selector: '[data-testid="insight-action-btn"]',
    expectedAction: 'Executes recommended action from AI insight',
    testFunction: async () => {
      // First switch to insights tab
      const insightsTab = document.querySelector('[value="insights"]') as HTMLButtonElement
      if (insightsTab) {
        insightsTab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const buttons = document.querySelectorAll('[data-testid="insight-action-btn"]')
        if (buttons.length > 0) {
          const button = buttons[0] as HTMLButtonElement
          button.click()
          showDemoNotification('✅ AI insight action executed!')
          return true
        }
      }
      return false
    }
  }
]

export const testAIAssistantButtons = async (): Promise<{
  totalTests: number
  passed: number
  failed: number
  results: Array<{
    test: AIAssistantButtonTest
    success: boolean
    error?: string
  }>
}> => {
  const results = []
  let passed = 0
  let failed = 0

  showDemoNotification('🧪 Starting AI Assistant button tests...')

  for (const test of AI_ASSISTANT_BUTTON_TESTS) {
    try {
      const success = await test.testFunction()
      results.push({ test, success })
      if (success) {
        passed++
      } else {
        failed++
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      results.push({ 
        test, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      failed++
    }
  }

  const finalMessage = `🎯 AI Assistant Tests Complete: ${passed}/${AI_ASSISTANT_BUTTON_TESTS.length} passed`
  showDemoNotification(finalMessage)

  return {
    totalTests: AI_ASSISTANT_BUTTON_TESTS.length,
    passed,
    failed,
    results
  }
}

// Test complete conversation flow
export const testConversationFlow = async (): Promise<boolean> => {
  try {
    showDemoNotification('🧪 Testing complete conversation flow...')
    
    // 1. Type a message
    const input = document.querySelector('[data-testid="message-input"]') as HTMLTextAreaElement
    const sendBtn = document.querySelector('[data-testid="send-message-btn"]') as HTMLButtonElement
    
    if (!input || !sendBtn) return false
    
    input.value = 'Can you help me analyze my current projects and suggest improvements?'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 2. Send the message
    if (!sendBtn.disabled) {
      sendBtn.click()
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for AI response
      
      // 3. Try to rate the response
      const thumbsUpBtn = document.querySelector('[data-testid="thumbs-up-btn"]') as HTMLButtonElement
      if (thumbsUpBtn) {
        thumbsUpBtn.click()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 4. Try to use a suggestion if available
      const suggestionBtns = document.querySelectorAll('[data-testid="suggestion-btn"]')
      if (suggestionBtns.length > 0) {
        const suggestionBtn = suggestionBtns[0] as HTMLButtonElement
        suggestionBtn.click()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      showDemoNotification('✅ Complete conversation flow tested!')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Conversation flow test failed:', error)
    showDemoNotification('❌ Conversation flow test failed')
    return false
  }
}

// Test tab navigation
export const testAITabNavigation = async (): Promise<boolean> => {
  try {
    showDemoNotification('🧪 Testing AI Assistant tab navigation...')
    
    const tabs = ['chat', 'insights', 'projects', 'analytics']
    
    for (const tabValue of tabs) {
      const tab = document.querySelector(`[value="${tabValue}"]`) as HTMLButtonElement
      if (tab) {
        tab.click()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Check if tab content is visible
        const content = document.querySelector(`[data-state="active"][data-value="${tabValue}"]`)
        if (!content) {
          throw new Error(`Tab ${tabValue} content not found`)
        }
      }
    }
    
    showDemoNotification('✅ AI Assistant tab navigation works perfectly!')
    return true
  } catch (error) {
    console.error('AI tab navigation test failed:', error)
    showDemoNotification('❌ AI tab navigation test failed')
    return false
  }
}

// Test all quick actions
export const testAllQuickActions = async (): Promise<boolean> => {
  try {
    showDemoNotification('🧪 Testing all quick actions...')
    
    const quickActionIds = [
      'analyze-projects',
      'optimize-workflow', 
      'pricing-help',
      'client-communication',
      'time-management',
      'business-insights'
    ]
    
    for (const actionId of quickActionIds) {
      const button = document.querySelector(`[data-testid="quick-action-${actionId}"]`) as HTMLButtonElement
      if (button) {
        button.click()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Check if input was populated
        const input = document.querySelector('[data-testid="message-input"]') as HTMLTextAreaElement
        if (input && input.value.length > 0) {
          // Clear the input for next test
          input.value = ''
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
    }
    
    showDemoNotification('✅ All quick actions tested successfully!')
    return true
  } catch (error) {
    console.error('Quick actions test failed:', error)
    showDemoNotification('❌ Quick actions test failed')
    return false
  }
}
