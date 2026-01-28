'use client'

/**
 * Demo Mode Configuration
 *
 * Provides rich demo data for showcasing the platform
 */

export const DEMO_MODE = {
  enabled: true,
  showNotifications: true
}

// Demo user for showcase
export const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex@freeflow.io',
  name: 'Alexandra Chen',
  avatar: '/avatars/demo-user.png',
  role: 'Product Manager',
  company: 'KAZI Technologies'
}

/**
 * Check if demo mode is enabled on the client side
 * Checks for demo=true in URL, demo_mode cookie, or localStorage
 */
export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false

  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true

  // Check cookie
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }

  // Check localStorage
  try {
    if (localStorage.getItem('demo_mode') === 'true') return true
  } catch {
    // localStorage not available
  }

  return false
}

/**
 * Demo-aware fetch utility
 * Automatically appends demo=true to API requests when in demo mode
 */
export async function demoFetch(url: string, options?: RequestInit): Promise<Response> {
  const isDemo = isDemoModeEnabled()

  if (isDemo) {
    // Add demo=true to URL
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}demo=true`

    // Add demo header
    options = {
      ...options,
      headers: {
        ...options?.headers,
        'X-Demo-Mode': 'true'
      }
    }
  }

  return fetch(url, options)
}

/**
 * Get demo user ID for API calls
 */
export function getDemoUserId(): string {
  return DEMO_USER.id
}

// Generate rich mock projects
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockProjects = () => []

// Generate rich mock tasks
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockTasks = () => []

// Generate rich analytics data
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockAnalytics = () => ({
  overview: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    clientSatisfaction: 0,
    revenue: 0,
    revenueGrowth: 0,
    activeClients: 0,
  },
  chartData: {
    projectsOverTime: [],
    taskCompletion: [],
    revenueByMonth: [],
  },
})

// Generate mock files
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockFiles = () => []

// Generate mock messages
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockMessages = () => []

// Generate mock invoices
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockInvoices = () => []

// Generate mock calendar events
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockCalendarEvents = () => []

// Generate mock team members
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockTeamMembers = () => []

// Generate mock notifications
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const generateMockNotifications = () => []

// Demo notification utility
export const showDemoNotification = (message: string) => {
  if (DEMO_MODE.showNotifications) {
    console.log('📢 Demo:', message)
  }
}

// API simulation for demo
export const simulateApiCall = async <T>(data: T, delay: number = 500): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay))
  return data
}
