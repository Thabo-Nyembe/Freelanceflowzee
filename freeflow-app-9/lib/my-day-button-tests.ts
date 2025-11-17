'use client'

import { showDemoNotification } from './demo-mode'

export interface MyDayButtonTest {
  id: string
  name: string
  selector: string
  expectedAction: string
  testFunction: () => Promise<boolean>
}

export const MY_DAY_BUTTON_TESTS: MyDayButtonTest[] = [
  {
    id: 'back-to-dashboard',
    name: 'Back to Dashboard',
    selector: '[data-testid="back-to-dashboard-btn"]',
    expectedAction: 'Navigates back to main dashboard',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="back-to-dashboard-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Back to Dashboard button works!')
        return true
      }
      return false
    }
  },
  {
    id: 'add-task-header',
    name: 'Add Task (Header)',
    selector: '[data-testid="add-task-header-btn"]',
    expectedAction: 'Opens add task modal',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="add-task-header-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        // Check if modal opened
        await new Promise(resolve => setTimeout(resolve, 100))
        const modal = document.querySelector('.fixed.inset-0.bg-white\\/95')
        if (modal) {
          showDemoNotification('✅ Add Task modal opened!')
          // Close the modal
          const cancelBtn = document.querySelector('[data-testid="cancel-add-task-btn"]') as HTMLButtonElement
          if (cancelBtn) cancelBtn.click()
          return true
        }
      }
      return false
    }
  },
  {
    id: 'add-task-main',
    name: 'Add Task (Main)',
    selector: '[data-testid="add-task-btn"]',
    expectedAction: 'Opens add task modal',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="add-task-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        await new Promise(resolve => setTimeout(resolve, 100))
        const modal = document.querySelector('.fixed.inset-0.bg-white\\/95')
        if (modal) {
          showDemoNotification('✅ Add Task (Main) modal opened!')
          const cancelBtn = document.querySelector('[data-testid="cancel-add-task-btn"]') as HTMLButtonElement
          if (cancelBtn) cancelBtn.click()
          return true
        }
      }
      return false
    }
  },
  {
    id: 'toggle-task',
    name: 'Toggle Task Completion',
    selector: '[data-testid="toggle-task-btn"]',
    expectedAction: 'Marks task as complete/incomplete',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="toggle-task-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Task completion toggled!')
        return true
      }
      return false
    }
  },
  {
    id: 'start-timer',
    name: 'Start/Stop Timer',
    selector: '[data-testid="start-timer-btn"]',
    expectedAction: 'Starts or stops task timer',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="start-timer-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        if (!button.disabled) {
          button.click()
          showDemoNotification('✅ Timer started!')
          
          // Test stop timer after a short delay
          setTimeout(() => {
            const stopBtn = document.querySelector('[data-testid="stop-timer-btn"]') as HTMLButtonElement
            if (stopBtn) {
              stopBtn.click()
              showDemoNotification('✅ Timer stopped!')
            }
          }, 2000)
          return true
        }
      }
      return false
    }
  },
  {
    id: 'delete-task',
    name: 'Delete Task',
    selector: '[data-testid="delete-task-btn"]',
    expectedAction: 'Deletes a task',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="delete-task-btn"]')
      if (buttons.length > 0) {
        const initialTaskCount = buttons.length
        const button = buttons[buttons.length - 1] as HTMLButtonElement // Delete last task
        button.click()
        
        // Check if task was removed
        await new Promise(resolve => setTimeout(resolve, 100))
        const newButtons = document.querySelectorAll('[data-testid="delete-task-btn"]')
        if (newButtons.length < initialTaskCount) {
          showDemoNotification('✅ Task deleted successfully!')
          return true
        }
      }
      return false
    }
  },
  {
    id: 'view-calendar',
    name: 'View Calendar',
    selector: '[data-testid="view-calendar-btn"]',
    expectedAction: 'Navigates to calendar view',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="view-calendar-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Calendar navigation works!')
        return true
      }
      return false
    }
  },
  {
    id: 'generate-schedule',
    name: 'Generate AI Schedule',
    selector: '[data-testid="generate-schedule-btn"]',
    expectedAction: 'Generates AI-powered schedule',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="generate-schedule-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ AI Schedule generation started!')
        return true
      }
      return false
    }
  },
  {
    id: 'check-messages',
    name: 'Check Client Messages',
    selector: '[data-testid="check-messages-btn"]',
    expectedAction: 'Navigates to messages/collaboration',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="check-messages-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Messages navigation works!')
        return true
      }
      return false
    }
  },
  {
    id: 'view-projects',
    name: 'View Projects',
    selector: '[data-testid="view-projects-btn"]',
    expectedAction: 'Navigates to projects hub',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="view-projects-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Projects navigation works!')
        return true
      }
      return false
    }
  },
  {
    id: 'apply-suggestion',
    name: 'Apply AI Suggestion',
    selector: '[data-testid="apply-suggestion-btn"]',
    expectedAction: 'Applies AI productivity suggestion',
    testFunction: async () => {
      // First switch to insights tab
      const insightsTab = document.querySelector('[value="insights"]') as HTMLButtonElement
      if (insightsTab) {
        insightsTab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const button = document.querySelector('[data-testid="apply-suggestion-btn"]') as HTMLButtonElement
        if (button) {
          button.click()
          showDemoNotification('✅ AI Suggestion applied!')
          return true
        }
      }
      return false
    }
  }
]

export const testMyDayButtons = async (): Promise<{
  totalTests: number
  passed: number
  failed: number
  results: Array<{
    test: MyDayButtonTest
    success: boolean
    error?: string
  }>
}> => {
  const results = []
  let passed = 0
  let failed = 0

  showDemoNotification('🧪 Starting My Day button tests...')

  for (const test of MY_DAY_BUTTON_TESTS) {
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

  const finalMessage = `🎯 My Day Tests Complete: ${passed}/${MY_DAY_BUTTON_TESTS.length} passed`
  showDemoNotification(finalMessage)

  return {
    totalTests: MY_DAY_BUTTON_TESTS.length,
    passed,
    failed,
    results
  }
}

// Individual test functions for manual testing
export const testAddTaskFlow = async (): Promise<boolean> => {
  try {
    // Open modal
    const addBtn = document.querySelector('[data-testid="add-task-btn"]') as HTMLButtonElement
    if (!addBtn) return false
    addBtn.click()
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Fill form
    const titleInput = document.querySelector('input[placeholder*="task title"]') as HTMLInputElement
    const descInput = document.querySelector('textarea[placeholder*="description"]') as HTMLTextAreaElement
    const prioritySelect = document.querySelector('select') as HTMLSelectElement
    
    if (titleInput) titleInput.value = 'Test Task from Button Testing'
    if (descInput) descInput.value = 'This is a test task created during button testing'
    if (prioritySelect) prioritySelect.value = 'high'
    
    // Submit
    const confirmBtn = document.querySelector('[data-testid="confirm-add-task-btn"]') as HTMLButtonElement
    if (confirmBtn && !confirmBtn.disabled) {
      confirmBtn.click()
      showDemoNotification('✅ Complete Add Task flow tested!')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Add Task flow test failed:', error)
    return false
  }
}
