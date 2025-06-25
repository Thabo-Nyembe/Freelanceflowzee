import { Page } from '@playwright/test'
import { Project } from '@/types/projects'

export interface HydrationTestData {
  componentName: string
  expectedContent: string[]
  shouldRefresh?: boolean
}

export const hydrationTestCases: HydrationTestData[] = [
  {
    componentName: 'ProjectsHub',
    expectedContent: [
      'Projects Hub',
      'Manage all your freelance projects in one place',
      'Create Project'
    ]
  },
  {
    componentName: 'VideoStudio',
    expectedContent: [
      'Video Studio',
      'Create and edit professional videos'
    ],
    shouldRefresh: true
  }
]

export async function setupHydrationTest(page: Page, componentName: string) {
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type()}] ${msg.text()}`)
    }
  })

  // Enable uncaught error logging
  page.on('pageerror', error => {
    console.error('Uncaught error:', error)
  })

  // Add custom attribute to help identify hydration issues
  await page.evaluate((name) => {
    window.__HYDRATION_TEST_COMPONENT__ = name
  }, componentName)
}

export async function checkHydrationErrors(page: Page): Promise<string[]> {
  const errors = await page.evaluate(() => {
    const errors: string[] = []
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target as HTMLElement
          if (target.getAttribute('data-hydration-error')) {
            errors.push(target.getAttribute('data-hydration-error') || '')
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    })

    return errors
  })

  return errors
}

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return document.documentElement.hasAttribute('data-hydrated')
  }, { timeout: 5000 })
}

export async function checkComponentRendering(page: Page, expectedContent: string[]): Promise<boolean> {
  for (const content of expectedContent) {
    try {
      await page.waitForSelector(`text=${content}`, { timeout: 5000 })
    } catch (error) {
      console.error(`Failed to find content: ${content}`)
      return false
    }
  }
  return true
}

// Mock project data for testing
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Test Project 1',
    description: 'A test project for hydration testing',
    status: 'active',
    priority: 'high',
    budget: 1000,
    spent: 500,
    client_name: 'Test Client',
    client_email: 'client@test.com',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    progress: 50,
    team_members: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
    ],
    attachments: [
      { id: '1', name: 'doc.pdf', url: '/files/doc.pdf' }
    ],
    comments_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User'
}

// Mock state changes for testing hydration
export const mockStateChanges = {
  projectUpdates: {
    id: '1',
    progress: 75,
    status: 'completed' as const
  },
  newComment: {
    id: 'comment-1',
    text: 'Test comment',
    user_id: 'test-user-id',
    created_at: '2024-01-03T00:00:00Z'
  }
}

// Mock server-side props
export const mockServerProps = {
  projects: mockProjects,
  userId: mockUser.id
}

// Mock client-side state
export const mockClientState = {
  searchQuery: 'test',
  statusFilter: 'active',
  priorityFilter: 'high',
  viewMode: 'grid' as const
}

// Mock hydration boundary cases
export const mockHydrationCases = {
  // Case 1: Different server/client timestamps
  timestamps: {
    server: '2024-01-01T00:00:00Z',
    client: new Date().toISOString()
  },
  
  // Case 2: Different data lengths
  dataLengths: {
    server: mockProjects,
    client: [...mockProjects, {
      ...mockProjects[0],
      id: '2',
      title: 'Client-only Project'
    }]
  },
  
  // Case 3: Different sort orders
  sortOrders: {
    server: mockProjects,
    client: mockProjects.slice().reverse()
  },
  
  // Case 4: Different filter states
  filterStates: {
    server: mockProjects,
    client: mockProjects.filter(p => p.status === 'active')
  }
}

// Mock error scenarios
export const mockErrorScenarios = {
  // Network errors
  networkError: new Error('Failed to fetch'),
  
  // Authentication errors
  authError: new Error('Unauthorized'),
  
  // Data validation errors
  validationError: new Error('Invalid data format'),
  
  // State synchronization errors
  syncError: new Error('State synchronization failed')
}

// Mock event handlers for testing
export const mockEventHandlers = {
  onProjectUpdate: jest.fn(),
  onStatusChange: jest.fn(),
  onFilterChange: jest.fn(),
  onSearch: jest.fn(),
  onViewModeChange: jest.fn()
}

// Mock DOM elements for testing
export const mockDOMElements = {
  projectCard: {
    id: 'project-1',
    className: 'project-card',
    dataset: {
      status: 'active',
      priority: 'high'
    }
  },
  filterButton: {
    id: 'filter-btn',
    className: 'filter-button',
    dataset: {
      filter: 'status'
    }
  }
}

// Mock component states for testing
export const mockComponentStates = {
  loading: {
    isLoading: true,
    error: null,
    data: null
  },
  error: {
    isLoading: false,
    error: new Error('Failed to load'),
    data: null
  },
  success: {
    isLoading: false,
    error: null,
    data: mockProjects
  }
}

// Helper function to simulate state changes
export const simulateStateChange = (initialState: any, updates: any) => {
  return {
    ...initialState,
    ...updates
  }
}

// Helper function to simulate hydration mismatch
export const simulateHydrationMismatch = (serverData: any, clientData: any) => {
  return {
    server: serverData,
    client: clientData,
    hasMismatch: JSON.stringify(serverData) !== JSON.stringify(clientData)
  }
}

// Helper function to create test IDs
export const createTestId = (component: string, element: string) => {
  return `${component}-${element}-test-id`
} 