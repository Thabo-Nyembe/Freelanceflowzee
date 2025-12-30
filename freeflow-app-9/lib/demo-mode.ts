'use client'

/**
 * Demo Mode Configuration
 *
 * DISABLED - All data now comes from real Supabase database
 * Real-time updates are handled via Supabase subscriptions
 */

// Demo mode is DISABLED - app uses real data only
export const DEMO_MODE = {
  enabled: false,
  showNotifications: false
}

// These functions are deprecated - use real database queries instead
// Kept for backward compatibility but return empty arrays

export const generateMockProjects = () => {
  console.warn('Demo mode disabled - use real database queries')
  return []
}

export const generateMockTasks = () => {
  console.warn('Demo mode disabled - use real database queries')
  return []
}

export const generateMockAnalytics = () => {
  console.warn('Demo mode disabled - use real database queries')
  return {
    overview: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      teamMembers: 0,
      clientSatisfaction: 0
    },
    chartData: {
      projectsOverTime: [],
      taskCompletion: []
    }
  }
}

export const generateMockFiles = () => {
  console.warn('Demo mode disabled - use real database queries')
  return []
}

export const generateMockMessages = () => {
  console.warn('Demo mode disabled - use real database queries')
  return []
}

// Demo notification utility - disabled
export const showDemoNotification = (message: string) => {
  // Demo notifications disabled - using real data
  console.debug('Demo notification suppressed:', message)
}

// API simulation - deprecated
export const simulateApiCall = async <T>(data: T, delay: number = 0): Promise<T> => {
  console.warn('simulateApiCall is deprecated - use real API calls')
  return data
}

// Mock API responses - deprecated
export const mockApiResponses = {
  createProject: () => {
    throw new Error('Demo mode disabled - use real API')
  },
  updateProject: () => {
    throw new Error('Demo mode disabled - use real API')
  },
  deleteProject: () => {
    throw new Error('Demo mode disabled - use real API')
  },
  uploadFile: () => {
    throw new Error('Demo mode disabled - use real API')
  },
  sendMessage: () => {
    throw new Error('Demo mode disabled - use real API')
  },
  aiGenerate: () => {
    throw new Error('Demo mode disabled - use real API')
  }
}
