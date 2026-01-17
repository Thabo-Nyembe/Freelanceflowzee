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
  id: 'demo-user-001',
  email: 'demo@kazi.io',
  name: 'Alex Thompson',
  avatar: '/avatars/demo-user.png',
  role: 'Product Manager',
  company: 'KAZI Technologies'
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
