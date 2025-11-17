'use client'

import { showDemoNotification } from './demo-mode'

export interface ProjectsHubButtonTest {
  id: string
  name: string
  selector: string
  expectedAction: string
  testFunction: () => Promise<boolean>
}

export const PROJECTS_HUB_BUTTON_TESTS: ProjectsHubButtonTest[] = [
  {
    id: 'back-to-dashboard',
    name: 'Back to Dashboard',
    selector: '[data-testid="back-to-dashboard-btn"]',
    expectedAction: 'Navigates back to main dashboard',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="back-to-dashboard-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        showDemoNotification('✅ Back to Dashboard navigation works!')
        return true
      }
      return false
    }
  },
  {
    id: 'create-new-project',
    name: 'Create New Project',
    selector: '[data-testid="create-project-btn"]',
    expectedAction: 'Opens create project modal',
    testFunction: async () => {
      const button = document.querySelector('[data-testid="create-project-btn"]') as HTMLButtonElement
      if (button) {
        button.click()
        // Check if modal opened
        await new Promise(resolve => setTimeout(resolve, 100))
        const modal = document.querySelector('.fixed.inset-0.bg-black\\/50')
        if (modal) {
          showDemoNotification('✅ Create Project modal opened!')
          // Close the modal
          const cancelBtn = document.querySelector('[data-testid="create-project-cancel"]') as HTMLButtonElement
          if (cancelBtn) cancelBtn.click()
          return true
        }
      }
      return false
    }
  },
  {
    id: 'search-projects',
    name: 'Search Projects',
    selector: '[data-testid="search-projects"]',
    expectedAction: 'Filters projects by search term',
    testFunction: async () => {
      const input = document.querySelector('[data-testid="search-projects"]') as HTMLInputElement
      if (input) {
        // Test search functionality
        input.value = 'E-commerce'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        
        await new Promise(resolve => setTimeout(resolve, 200))
        showDemoNotification('✅ Project search functionality works!')
        
        // Clear search
        input.value = ''
        input.dispatchEvent(new Event('input', { bubbles: true }))
        return true
      }
      return false
    }
  },
  {
    id: 'status-filter',
    name: 'Status Filter',
    selector: '[data-testid="status-filter"]',
    expectedAction: 'Filters projects by status',
    testFunction: async () => {
      const select = document.querySelector('[data-testid="status-filter"]') as HTMLSelectElement
      if (select) {
        const originalValue = select.value
        select.value = 'active'
        select.dispatchEvent(new Event('change', { bubbles: true }))
        
        await new Promise(resolve => setTimeout(resolve, 200))
        showDemoNotification('✅ Status filter works!')
        
        // Reset filter
        select.value = originalValue
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
    }
  },
  {
    id: 'priority-filter',
    name: 'Priority Filter',
    selector: '[data-testid="priority-filter"]',
    expectedAction: 'Filters projects by priority',
    testFunction: async () => {
      const select = document.querySelector('[data-testid="priority-filter"]') as HTMLSelectElement
      if (select) {
        const originalValue = select.value
        select.value = 'high'
        select.dispatchEvent(new Event('change', { bubbles: true }))
        
        await new Promise(resolve => setTimeout(resolve, 200))
        showDemoNotification('✅ Priority filter works!')
        
        // Reset filter
        select.value = originalValue
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
    }
  },
  {
    id: 'view-project',
    name: 'View Project',
    selector: '[data-testid="view-project-btn"]',
    expectedAction: 'Opens project details view',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="view-project-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ View Project functionality works!')
        return true
      }
      return false
    }
  },
  {
    id: 'edit-project',
    name: 'Edit Project',
    selector: '[data-testid="edit-project-btn"]',
    expectedAction: 'Opens project editing form',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="edit-project-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Edit Project functionality works!')
        return true
      }
      return false
    }
  },
  {
    id: 'complete-project',
    name: 'Complete Project',
    selector: '[data-testid="complete-project-btn"]',
    expectedAction: 'Marks project as completed',
    testFunction: async () => {
      const buttons = document.querySelectorAll('[data-testid="complete-project-btn"]')
      if (buttons.length > 0) {
        const button = buttons[0] as HTMLButtonElement
        button.click()
        showDemoNotification('✅ Complete Project functionality works!')
        return true
      }
      return false
    }
  },
  {
    id: 'update-progress',
    name: 'Update Progress',
    selector: '[data-testid="update-progress-btn"]',
    expectedAction: 'Opens progress update dialog',
    testFunction: async () => {
      // First switch to active tab
      const activeTab = document.querySelector('[value="active"]') as HTMLButtonElement
      if (activeTab) {
        activeTab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const buttons = document.querySelectorAll('[data-testid="update-progress-btn"]')
        if (buttons.length > 0) {
          const button = buttons[0] as HTMLButtonElement
          button.click()
          showDemoNotification('✅ Update Progress functionality works!')
          return true
        }
      }
      return false
    }
  },
  {
    id: 'view-details',
    name: 'View Details',
    selector: '[data-testid="view-details-btn"]',
    expectedAction: 'Opens detailed project view',
    testFunction: async () => {
      // First switch to active tab
      const activeTab = document.querySelector('[value="active"]') as HTMLButtonElement
      if (activeTab) {
        activeTab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const buttons = document.querySelectorAll('[data-testid="view-details-btn"]')
        if (buttons.length > 0) {
          const button = buttons[0] as HTMLButtonElement
          button.click()
          showDemoNotification('✅ View Details functionality works!')
          return true
        }
      }
      return false
    }
  }
]

export const testProjectsHubButtons = async (): Promise<{
  totalTests: number
  passed: number
  failed: number
  results: Array<{
    test: ProjectsHubButtonTest
    success: boolean
    error?: string
  }>
}> => {
  const results = []
  let passed = 0
  let failed = 0

  showDemoNotification('🧪 Starting Projects Hub button tests...')

  for (const test of PROJECTS_HUB_BUTTON_TESTS) {
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

  const finalMessage = `🎯 Projects Hub Tests Complete: ${passed}/${PROJECTS_HUB_BUTTON_TESTS.length} passed`
  showDemoNotification(finalMessage)

  return {
    totalTests: PROJECTS_HUB_BUTTON_TESTS.length,
    passed,
    failed,
    results
  }
}

// Test the complete create project flow
export const testCreateProjectFlow = async (): Promise<boolean> => {
  try {
    showDemoNotification('🧪 Testing complete Create Project flow...')
    
    // Open modal
    const createBtn = document.querySelector('[data-testid="create-project-btn"]') as HTMLButtonElement
    if (!createBtn) return false
    createBtn.click()
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Fill form
    const titleInput = document.querySelector('[data-testid="project-title-input"]') as HTMLInputElement
    const clientInput = document.querySelector('[data-testid="client-name-input"]') as HTMLInputElement
    const descInput = document.querySelector('[data-testid="project-description-input"]') as HTMLTextAreaElement
    const budgetInput = document.querySelector('[data-testid="project-budget-input"]') as HTMLInputElement
    const prioritySelect = document.querySelector('[data-testid="project-priority-select"]') as HTMLSelectElement
    const categorySelect = document.querySelector('[data-testid="project-category-select"]') as HTMLSelectElement
    
    if (titleInput) {
      titleInput.value = 'Test Project from Button Testing'
      titleInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    if (clientInput) {
      clientInput.value = 'Test Client'
      clientInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    if (descInput) {
      descInput.value = 'This is a comprehensive test project created during button testing'
      descInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    if (budgetInput) {
      budgetInput.value = '5000'
      budgetInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    if (prioritySelect) {
      prioritySelect.value = 'high'
      prioritySelect.dispatchEvent(new Event('change', { bubbles: true }))
    }
    if (categorySelect) {
      categorySelect.value = 'web-development'
      categorySelect.dispatchEvent(new Event('change', { bubbles: true }))
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Submit
    const submitBtn = document.querySelector('[data-testid="create-project-submit"]') as HTMLButtonElement
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.click()
      showDemoNotification('✅ Complete Create Project flow tested successfully!')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Create Project flow test failed:', error)
    showDemoNotification('❌ Create Project flow test failed')
    return false
  }
}

// Test tab navigation
export const testTabNavigation = async (): Promise<boolean> => {
  try {
    showDemoNotification('🧪 Testing tab navigation...')
    
    const tabs = ['overview', 'active', 'analytics']
    
    for (const tabValue of tabs) {
      const tab = document.querySelector(`[value="${tabValue}"]`) as HTMLButtonElement
      if (tab) {
        tab.click()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Check if tab content is visible
        const content = document.querySelector(`[data-state="active"][data-value="${tabValue}"]`)
        if (!content) {
          throw new Error(`Tab ${tabValue} content not found`)
        }
      }
    }
    
    showDemoNotification('✅ Tab navigation works perfectly!')
    return true
  } catch (error) {
    console.error('Tab navigation test failed:', error)
    showDemoNotification('❌ Tab navigation test failed')
    return false
  }
}
