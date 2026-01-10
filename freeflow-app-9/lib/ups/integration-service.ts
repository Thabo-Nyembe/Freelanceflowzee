import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Comment, CommentPriority, CommentStatus } from '@/components/projects-hub/universal-pinpoint-feedback-system-enhanced'
import { AICommentAnalysis } from '@/lib/ai/comment-analysis-service'
import { DrawingState } from '@/components/projects-hub/enhanced-drawing-tools'
import { ExportOptions } from '@/components/projects-hub/comment-export-system'

export interface UPSUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'viewer' | 'commenter' | 'editor' | 'admin'
  isOnline: boolean
  lastSeen: Date
  currentProject?: string
}

export interface UPSProject {
  id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
  members: UPSUser[]
  settings: UPSProjectSettings
}

export interface UPSProjectSettings {
  allowAnonymousComments: boolean
  requireApproval: boolean
  emailNotifications: boolean
  realTimeUpdates: boolean
  aiAnalysisEnabled: boolean
  exportFormats: string[]
  maxFileSize: number
  allowedFileTypes: string[]
}

export interface UPSNotification {
  id: string
  type: 'comment' | 'reply' | 'mention' | 'assignment' | 'status_change' | 'ai_insight'
  title: string
  message: string
  data: any
  userId: string
  projectId?: string
  commentId?: string
  read: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface UPSActivity {
  id: string
  type: 'comment_created' | 'comment_updated' | 'comment_resolved' | 'user_joined' | 'user_left' | 'drawing_created' | 'export_generated'
  userId: string
  projectId: string
  commentId?: string
  data: any
  timestamp: Date
  description: string
}

export interface UPSIntegrationState {
  // Core State
  currentProject: UPSProject | null
  currentUser: UPSUser | null
  comments: Comment[]
  users: UPSUser[]
  projects: UPSProject[]

  // Features State
  aiAnalyses: Record<string, AICommentAnalysis>
  drawingStates: Record<string, DrawingState>
  exportHistory: ExportOptions[]

  // Communication State
  notifications: UPSNotification[]
  activities: UPSActivity[]
  onlineUsers: UPSUser[]

  // UI State
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  activeView: 'comments' | 'ai-insights' | 'analytics' | 'export' | 'settings'
  selectedCommentId: string | null

  // Filters & Search
  filters: {
    status: CommentStatus[]
    priority: CommentPriority[]
    assignee: string[]
    dateRange: [Date, Date] | null
    searchQuery: string
    tags: string[]
  }

  // Real-time
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  subscriptions: Record<string, () => void>
}

export interface UPSIntegrationActions {
  // Project Management
  setCurrentProject: (project: UPSProject | null) => void
  createProject: (project: Omit<UPSProject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UPSProject>
  updateProject: (id: string, updates: Partial<UPSProject>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // User Management
  setCurrentUser: (user: UPSUser | null) => void
  updateUserPresence: (userId: string, isOnline: boolean) => void
  inviteUser: (projectId: string, email: string, role: UPSUser['role']) => Promise<void>
  removeUser: (projectId: string, userId: string) => Promise<void>

  // Comment Management
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Comment>
  updateComment: (id: string, updates: Partial<Comment>) => Promise<void>
  deleteComment: (id: string) => Promise<void>
  resolveComment: (id: string) => Promise<void>
  assignComment: (id: string, assigneeId: string) => Promise<void>

  // AI Integration
  analyzeComment: (commentId: string) => Promise<AICommentAnalysis>
  getAIInsights: (projectId: string) => Promise<AICommentAnalysis[]>
  generateAISuggestions: (commentId: string) => Promise<string[]>

  // Drawing Integration
  saveDrawing: (commentId: string, drawingData: any) => Promise<void>
  loadDrawing: (commentId: string) => Promise<any>
  updateDrawingState: (commentId: string, state: DrawingState) => void

  // Export Integration
  exportComments: (options: ExportOptions) => Promise<string>
  scheduleExport: (options: ExportOptions, schedule: string) => Promise<string>
  getExportHistory: () => ExportOptions[]

  // Notifications
  addNotification: (notification: Omit<UPSNotification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void

  // Activities
  logActivity: (activity: Omit<UPSActivity, 'id' | 'timestamp'>) => void
  getActivities: (projectId: string, limit?: number) => UPSActivity[]
  clearActivities: (projectId: string) => void

  // Real-time
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (channel: string, callback: (data: any) => void) => () => void
  broadcast: (channel: string, data: any) => void

  // Filters & Search
  updateFilters: (filters: Partial<UPSIntegrationState['filters']>) => void
  clearFilters: () => void
  search: (query: string) => Comment[]

  // UI Actions
  setActiveView: (view: UPSIntegrationState['activeView']) => void
  toggleSidebar: () => void
  selectComment: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUPSIntegration = create<UPSIntegrationState & UPSIntegrationActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    currentProject: null,
    currentUser: null,
    comments: [],
    users: [],
    projects: [],
    aiAnalyses: {},
    drawingStates: {},
    exportHistory: [],
    notifications: [],
    activities: [],
    onlineUsers: [],
    isLoading: false,
    error: null,
    sidebarOpen: true,
    activeView: 'comments',
    selectedCommentId: null,
    filters: {
      status: [],
      priority: [],
      assignee: [],
      dateRange: null,
      searchQuery: '',
      tags: []
    },
    connectionStatus: 'disconnected',
    subscriptions: {},

    // Project Management Actions
    setCurrentProject: (project) => {
      set({ currentProject: project })
      if (project) {
        get().logActivity({
          type: 'user_joined',
          userId: get().currentUser?.id || 'anonymous',
          projectId: project.id,
          data: { projectName: project.name },
          description: `Joined project: ${project.name}`
        })
      }
    },

    createProject: async (projectData) => {
      set({ isLoading: true, error: null })
      try {
        const project: UPSProject = {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set(state => ({
          projects: [...state.projects, project],
          currentProject: project,
          isLoading: false
        }))

        get().addNotification({
          type: 'comment',
          title: 'Project Created',
          message: `Project "${project.name}" has been created successfully`,
          data: { projectId: project.id },
          userId: get().currentUser?.id || 'system',
          projectId: project.id,
          read: false,
          priority: 'medium'
        })

        return project
      } catch (error) {
        set({ error: 'Failed to create project', isLoading: false })
        throw error
      }
    },

    updateProject: async (id, updates) => {
      set({ isLoading: true, error: null })
      try {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentProject: state.currentProject?.id === id
            ? { ...state.currentProject, ...updates, updatedAt: new Date() }
            : state.currentProject,
          isLoading: false
        }))
      } catch (error) {
        set({ error: 'Failed to update project', isLoading: false })
        throw error
      }
    },

    deleteProject: async (id) => {
      set({ isLoading: true, error: null })
      try {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
          isLoading: false
        }))
      } catch (error) {
        set({ error: 'Failed to delete project', isLoading: false })
        throw error
      }
    },

    // User Management Actions
    setCurrentUser: (user) => set({ currentUser: user }),

    updateUserPresence: (userId, isOnline) => {
      set(state => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, isOnline, lastSeen: new Date() } : u
        ),
        onlineUsers: isOnline
          ? [...state.onlineUsers.filter(u => u.id !== userId), state.users.find(u => u.id === userId)].filter(Boolean)
          : state.onlineUsers.filter(u => u.id !== userId)
      }))
    },

    inviteUser: async (projectId, email, role) => {
      set({ isLoading: true, error: null })
      try {
        // Implementation would involve API call
        get().addNotification({
          type: 'comment',
          title: 'User Invited',
          message: `Invitation sent to ${email}`,
          data: { email, role, projectId },
          userId: get().currentUser?.id || 'system',
          projectId,
          read: false,
          priority: 'low'
        })
        set({ isLoading: false })
      } catch (error) {
        set({ error: 'Failed to invite user', isLoading: false })
        throw error
      }
    },

    removeUser: async (projectId, userId) => {
      set({ isLoading: true, error: null })
      try {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, members: p.members.filter(m => m.id !== userId) }
              : p
          ),
          isLoading: false
        }))
      } catch (error) {
        set({ error: 'Failed to remove user', isLoading: false })
        throw error
      }
    },

    // Comment Management Actions
    addComment: async (commentData) => {
      set({ isLoading: true, error: null })
      try {
        const comment: Comment = {
          ...commentData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set(state => ({
          comments: [...state.comments, comment],
          isLoading: false
        }))

        get().logActivity({
          type: 'comment_created',
          userId: comment.authorId,
          projectId: get().currentProject?.id || '',
          commentId: comment.id,
          data: { content: comment.content.substring(0, 100) },
          description: `Created comment: ${comment.content.substring(0, 50)}...`
        })

        // Trigger AI analysis if enabled
        if (get().currentProject?.settings.aiAnalysisEnabled) {
          get().analyzeComment(comment.id)
        }

        return comment
      } catch (error) {
        set({ error: 'Failed to add comment', isLoading: false })
        throw error
      }
    },

    updateComment: async (id, updates) => {
      set({ isLoading: true, error: null })
      try {
        set(state => ({
          comments: state.comments.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
          isLoading: false
        }))

        get().logActivity({
          type: 'comment_updated',
          userId: get().currentUser?.id || 'system',
          projectId: get().currentProject?.id || '',
          commentId: id,
          data: updates,
          description: `Updated comment`
        })
      } catch (error) {
        set({ error: 'Failed to update comment', isLoading: false })
        throw error
      }
    },

    deleteComment: async (id) => {
      set({ isLoading: true, error: null })
      try {
        set(state => ({
          comments: state.comments.filter(c => c.id !== id),
          isLoading: false
        }))
      } catch (error) {
        set({ error: 'Failed to delete comment', isLoading: false })
        throw error
      }
    },

    resolveComment: async (id) => {
      await get().updateComment(id, { status: 'resolved' })
      get().logActivity({
        type: 'comment_resolved',
        userId: get().currentUser?.id || 'system',
        projectId: get().currentProject?.id || '',
        commentId: id,
        data: {},
        description: `Resolved comment`
      })
    },

    assignComment: async (id, assigneeId) => {
      await get().updateComment(id, { assigneeId })
      get().addNotification({
        type: 'assignment',
        title: 'Comment Assigned',
        message: 'You have been assigned a new comment',
        data: { commentId: id },
        userId: assigneeId,
        projectId: get().currentProject?.id,
        commentId: id,
        read: false,
        priority: 'medium'
      })
    },

    // AI Integration Actions
    analyzeComment: async (commentId) => {
      const comment = get().comments.find(c => c.id === commentId)
      if (!comment) throw new Error('Comment not found')

      // Mock AI analysis - replace with actual API call
      const analysis: AICommentAnalysis = {
        id: crypto.randomUUID(),
        commentId,
        sentiment: Math.random() > 0.5 ? 'positive' : 'constructive',
        confidence: Math.random() * 0.3 + 0.7,
        themes: ['design', 'user experience'],
        suggestedPriority: 'medium',
        actionItems: [],
        estimatedEffort: 'small',
        category: 'design',
        suggestions: []
      }

      set(state => ({
        aiAnalyses: { ...state.aiAnalyses, [commentId]: analysis }
      }))

      return analysis
    },

    getAIInsights: async (projectId) => {
      return Object.values(get().aiAnalyses)
    },

    generateAISuggestions: async (commentId) => {
      // Mock suggestions - replace with actual API call
      return ['Consider user accessibility', 'Review design consistency', 'Test on mobile devices']
    },

    // Drawing Integration Actions
    saveDrawing: async (commentId, drawingData) => {
      // Implementation for saving drawing data
      get().logActivity({
        type: 'drawing_created',
        userId: get().currentUser?.id || 'system',
        projectId: get().currentProject?.id || '',
        commentId,
        data: { drawingSize: JSON.stringify(drawingData).length },
        description: `Added drawing to comment`
      })
    },

    loadDrawing: async (commentId) => {
      // Implementation for loading drawing data
      return null
    },

    updateDrawingState: (commentId, state) => {
      set(prevState => ({
        drawingStates: { ...prevState.drawingStates, [commentId]: state }
      }))
    },

    // Export Integration Actions
    exportComments: async (options) => {
      set({ isLoading: true })
      try {
        // Mock export - replace with actual implementation
        const exportId = crypto.randomUUID()

        set(state => ({
          exportHistory: [...state.exportHistory, options],
          isLoading: false
        }))

        get().logActivity({
          type: 'export_generated',
          userId: get().currentUser?.id || 'system',
          projectId: get().currentProject?.id || '',
          data: { format: options.format, template: options.template },
          description: `Exported comments as ${options.format}`
        })

        get().addNotification({
          type: 'comment',
          title: 'Export Complete',
          message: `Comments exported successfully as ${options.format}`,
          data: { exportId, options },
          userId: get().currentUser?.id || 'system',
          projectId: get().currentProject?.id,
          read: false,
          priority: 'low'
        })

        return exportId
      } catch (error) {
        set({ error: 'Failed to export comments', isLoading: false })
        throw error
      }
    },

    scheduleExport: async (options, schedule) => {
      // Implementation for scheduled exports
      return crypto.randomUUID()
    },

    getExportHistory: () => get().exportHistory,

    // Notification Actions
    addNotification: (notificationData) => {
      const notification: UPSNotification = {
        ...notificationData,
        id: crypto.randomUUID(),
        createdAt: new Date()
      }

      set(state => ({
        notifications: [notification, ...state.notifications]
      }))
    },

    markNotificationRead: (id) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }))
    },

    markAllNotificationsRead: () => {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }))
    },

    clearNotifications: () => set({ notifications: [] }),

    // Activity Actions
    logActivity: (activityData) => {
      const activity: UPSActivity = {
        ...activityData,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }

      set(state => ({
        activities: [activity, ...state.activities.slice(0, 999)] // Keep last 1000 activities
      }))
    },

    getActivities: (projectId, limit = 50) => {
      return get().activities
        .filter(a => a.projectId === projectId)
        .slice(0, limit)
    },

    clearActivities: (projectId) => {
      set(state => ({
        activities: state.activities.filter(a => a.projectId !== projectId)
      }))
    },

    // Real-time Actions
    connect: async () => {
      set({ connectionStatus: 'connecting' })
      try {
        // Implementation for real-time connection
        set({ connectionStatus: 'connected' })
      } catch (error) {
        set({ connectionStatus: 'error' })
        throw error
      }
    },

    disconnect: () => {
      Object.values(get().subscriptions).forEach(unsubscribe => unsubscribe())
      set({ connectionStatus: 'disconnected', subscriptions: {} })
    },

    subscribe: (channel, callback) => {
      // Implementation for real-time subscriptions
      const unsubscribe = () => {
        set(state => {
          const { [channel]: removed, ...rest } = state.subscriptions
          return { subscriptions: rest }
        })
      }

      set(state => ({
        subscriptions: { ...state.subscriptions, [channel]: unsubscribe }
      }))

      return unsubscribe
    },

    broadcast: (channel, data) => {
      // Implementation for broadcasting data
    },

    // Filter & Search Actions
    updateFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }))
    },

    clearFilters: () => {
      set({
        filters: {
          status: [],
          priority: [],
          assignee: [],
          dateRange: null,
          searchQuery: '',
          tags: []
        }
      })
    },

    search: (query) => {
      const { comments } = get()
      return comments.filter(comment =>
        comment.content.toLowerCase().includes(query.toLowerCase()) ||
        comment.authorName.toLowerCase().includes(query.toLowerCase())
      )
    },

    // UI Actions
    setActiveView: (view) => set({ activeView: view }),
    toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
    selectComment: (id) => set({ selectedCommentId: id }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error })
  }))
)

// Selector hooks for optimized re-renders
export const useUPSProject = () => useUPSIntegration(state => state.currentProject)
export const useUPSUser = () => useUPSIntegration(state => state.currentUser)
export const useUPSComments = () => useUPSIntegration(state => state.comments)
export const useUPSNotifications = () => useUPSIntegration(state => state.notifications)
export const useUPSActivities = () => useUPSIntegration(state => state.activities)
export const useUPSConnectionStatus = () => useUPSIntegration(state => state.connectionStatus)
export const useUPSFilters = () => useUPSIntegration(state => state.filters)
export const useUPSUI = () => useUPSIntegration(state => ({
  activeView: state.activeView,
  sidebarOpen: state.sidebarOpen,
  selectedCommentId: state.selectedCommentId,
  isLoading: state.isLoading,
  error: state.error
}))