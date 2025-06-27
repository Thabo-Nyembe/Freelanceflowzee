import { Page } from &apos;@playwright/test&apos;
import { Project } from &apos;@/types/projects&apos;

export interface HydrationTestData {
  componentName: string
  expectedContent: string[]
  shouldRefresh?: boolean
}

export const hydrationTestCases: HydrationTestData[] = [
  {
    componentName: &apos;ProjectsHub&apos;,
    expectedContent: [
      &apos;Projects Hub&apos;,
      &apos;Manage all your freelance projects in one place&apos;,
      &apos;Create Project&apos;
    ]
  },
  {
    componentName: &apos;VideoStudio&apos;,
    expectedContent: [
      &apos;Video Studio&apos;,
      &apos;Create and edit professional videos&apos;
    ],
    shouldRefresh: true
  }
]

export async function setupHydrationTest(page: Page, componentName: string) {
  // Enable console logging
  page.on(&apos;console&apos;, msg => {
    if (msg.type() === &apos;error&apos; || msg.type() === &apos;warning&apos;) {
      console.log(`[${msg.type()}] ${msg.text()}`)
    }
  })

  // Enable uncaught error logging
  page.on(&apos;pageerror&apos;, error => {
    console.error(&apos;Uncaught error:&apos;, error)
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
        if (mutation.type === &apos;childList&apos; || mutation.type === &apos;characterData&apos;) {
          const target = mutation.target as HTMLElement
          if (target.getAttribute(&apos;data-hydration-error&apos;)) {
            errors.push(target.getAttribute(&apos;data-hydration-error&apos;) || '&apos;)'
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
    return document.documentElement.hasAttribute(&apos;data-hydrated&apos;)
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
    id: &apos;1','
    title: &apos;Test Project 1&apos;,
    description: &apos;A test project for hydration testing&apos;,
    status: &apos;active&apos;,
    priority: &apos;high&apos;,
    budget: 1000,
    spent: 500,
    client_name: &apos;Test Client&apos;,
    client_email: &apos;client@test.com&apos;,
    start_date: &apos;2024-01-01&apos;,
    end_date: &apos;2024-12-31&apos;,
    progress: 50,
    team_members: [
      { id: &apos;1', name: &apos;John Doe&apos;, avatar: &apos;/avatars/john.jpg&apos; },'
      { id: &apos;2', name: &apos;Jane Smith&apos;, avatar: &apos;/avatars/jane.jpg&apos; }'
    ],
    attachments: [
      { id: &apos;1', name: &apos;doc.pdf&apos;, url: &apos;/files/doc.pdf&apos; }'
    ],
    comments_count: 5,
    created_at: &apos;2024-01-01T00:00:00Z&apos;,
    updated_at: &apos;2024-01-02T00:00:00Z&apos;
  }
]

// Mock user data for testing
export const mockUser = {
  id: &apos;test-user-id&apos;,
  email: &apos;test@example.com&apos;,
  name: &apos;Test User&apos;
}

// Mock state changes for testing hydration
export const mockStateChanges = {
  projectUpdates: {
    id: &apos;1','
    progress: 75,
    status: &apos;completed&apos; as const
  },
  newComment: {
    id: &apos;comment-1&apos;,
    text: &apos;Test comment&apos;,
    user_id: &apos;test-user-id&apos;,
    created_at: &apos;2024-01-03T00:00:00Z&apos;
  }
}

// Mock server-side props
export const mockServerProps = {
  projects: mockProjects,
  userId: mockUser.id
}

// Mock client-side state
export const mockClientState = {
  searchQuery: &apos;test&apos;,
  statusFilter: &apos;active&apos;,
  priorityFilter: &apos;high&apos;,
  viewMode: &apos;grid&apos; as const
}

// Mock hydration boundary cases
export const mockHydrationCases = {
  // Case 1: Different server/client timestamps
  timestamps: {
    server: &apos;2024-01-01T00:00:00Z&apos;,
    client: new Date().toISOString()
  },
  
  // Case 2: Different data lengths
  dataLengths: {
    server: mockProjects,
    client: [...mockProjects, {
      ...mockProjects[0],
      id: &apos;2','
      title: &apos;Client-only Project&apos;
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
    client: mockProjects.filter(p => p.status === &apos;active&apos;)
  }
}

// Mock error scenarios
export const mockErrorScenarios = {
  // Network errors
  networkError: new Error(&apos;Failed to fetch&apos;),
  
  // Authentication errors
  authError: new Error(&apos;Unauthorized&apos;),
  
  // Data validation errors
  validationError: new Error(&apos;Invalid data format&apos;),
  
  // State synchronization errors
  syncError: new Error(&apos;State synchronization failed&apos;)
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
    id: &apos;project-1&apos;,
    className: &apos;project-card&apos;,
    dataset: {
      status: &apos;active&apos;,
      priority: &apos;high&apos;
    }
  },
  filterButton: {
    id: &apos;filter-btn&apos;,
    className: &apos;filter-button&apos;,
    dataset: {
      filter: &apos;status&apos;
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
    error: new Error(&apos;Failed to load&apos;),
    data: null
  },
  success: {
    isLoading: false,
    error: null,
    data: mockProjects
  }
}

// Helper function to simulate state changes
export const simulateStateChange = (initialState: unknown, updates: unknown) => {
  return {
    ...initialState,
    ...updates
  }
}

// Helper function to simulate hydration mismatch
export const simulateHydrationMismatch = (serverData: unknown, clientData: unknown) => {
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