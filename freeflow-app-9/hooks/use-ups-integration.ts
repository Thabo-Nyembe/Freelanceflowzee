"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUPS } from '@/components/providers/ups-provider'
import { Comment, CommentPriority, CommentStatus } from '@/components/projects-hub/universal-pinpoint-feedback-system'
import { AICommentAnalysis } from '@/lib/ai/comment-analysis-service'
import { ExportOptions } from '@/components/projects-hub/comment-export-system'
import { UPSEvent } from '@/lib/ups/communication-bus'

// Core UPS integration hook
export function useUPSIntegration() {
  const ups = useUPS()
  return ups
}

// Comment management with optimistic updates
export function useUPSCommentManagement() {
  const { state, actions, publishEvent } = useUPS()
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

  const optimisticUpdate = useCallback(async <T>(
    commentId: string,
    operation: () => Promise<T>,
    eventType: UPSEvent['type'],
    eventData: any
  ): Promise<T> => {
    setIsUpdating(prev => ({ ...prev, [commentId]: true }))

    try {
      const result = await operation()

      publishEvent({
        type: eventType,
        payload: { commentId, ...eventData }
      })

      return result
    } catch (error) {
      publishEvent({
        type: 'system.error',
        payload: { error: error instanceof Error ? error.message : 'Unknown error', commentId }
      })
      throw error
    } finally {
      setIsUpdating(prev => ({ ...prev, [commentId]: false }))
    }
  }, [publishEvent])

  const createComment = useCallback(async (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    return optimisticUpdate(
      'new',
      () => actions.addComment(commentData),
      'comment.created',
      { content: commentData.content.substring(0, 100) }
    )
  }, [actions, optimisticUpdate])

  const updateComment = useCallback(async (id: string, updates: Partial<Comment>) => {
    return optimisticUpdate(
      id,
      () => actions.updateComment(id, updates),
      'comment.updated',
      { updates }
    )
  }, [actions, optimisticUpdate])

  const deleteComment = useCallback(async (id: string) => {
    return optimisticUpdate(
      id,
      () => actions.deleteComment(id),
      'comment.deleted',
      {}
    )
  }, [actions, optimisticUpdate])

  const resolveComment = useCallback(async (id: string) => {
    return optimisticUpdate(
      id,
      () => actions.resolveComment(id),
      'comment.resolved',
      {}
    )
  }, [actions, optimisticUpdate])

  return {
    comments: state.comments,
    selectedCommentId: state.selectedCommentId,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    assignComment: actions.assignComment,
    selectComment: actions.selectComment,
    isUpdating
  }
}

// Real-time collaboration features
export function useUPSCollaboration() {
  const { state, actions, subscribeToEvent, publishEvent } = useUPS()
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; user: string }>>({})
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Mouse cursor tracking
  const updateCursor = useCallback((x: number, y: number) => {
    if (state.currentUser) {
      publishEvent({
        type: 'collaboration.cursor',
        payload: { x, y, userId: state.currentUser.id, userName: state.currentUser.name }
      })
    }
  }, [state.currentUser, publishEvent])

  // Typing indicators
  const setTyping = useCallback((isTyping: boolean, commentId?: string) => {
    if (state.currentUser) {
      publishEvent({
        type: 'collaboration.typing',
        payload: {
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          isTyping,
          commentId
        }
      })
    }
  }, [state.currentUser, publishEvent])

  // Subscribe to collaboration events
  useEffect(() => {
    const unsubscribeCursor = subscribeToEvent('collaboration.cursor', (data: any) => {
      if (data.userId !== state.currentUser?.id) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: { x: data.x, y: data.y, user: data.userName }
        }))
      }
    })

    const unsubscribeTyping = subscribeToEvent('collaboration.typing', (data: any) => {
      if (data.userId !== state.currentUser?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userName)

            // Clear existing timeout for this user
            if (typingTimeoutRef.current[data.userId]) {
              clearTimeout(typingTimeoutRef.current[data.userId])
            }

            // Set new timeout
            typingTimeoutRef.current[data.userId] = setTimeout(() => {
              setTypingUsers(currentSet => {
                const updatedSet = new Set(currentSet)
                updatedSet.delete(data.userName)
                return updatedSet
              })
              delete typingTimeoutRef.current[data.userId]
            }, 3000)
          } else {
            newSet.delete(data.userName)
            if (typingTimeoutRef.current[data.userId]) {
              clearTimeout(typingTimeoutRef.current[data.userId])
              delete typingTimeoutRef.current[data.userId]
            }
          }
          return newSet
        })
      }
    })

    return () => {
      unsubscribeCursor()
      unsubscribeTyping()
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
    }
  }, [state.currentUser, subscribeToEvent])

  return {
    onlineUsers: state.onlineUsers,
    activities: state.activities,
    connectionStatus: state.connectionStatus,
    cursors,
    typingUsers: Array.from(typingUsers),
    updateCursor,
    setTyping,
    updateUserPresence: actions.updateUserPresence,
    inviteUser: actions.inviteUser,
    removeUser: actions.removeUser
  }
}

// AI-powered features
export function useUPSAI() {
  const { state, actions, subscribeToEvent, publishEvent, isFeatureEnabled } = useUPS()
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})

  const analyzeComment = useCallback(async (commentId: string) => {
    if (!isFeatureEnabled('ai-insights')) {
      throw new Error('AI insights feature is not enabled')
    }

    setIsAnalyzing(prev => ({ ...prev, [commentId]: true }))

    try {
      const analysis = await actions.analyzeComment(commentId)

      publishEvent({
        type: 'ai.analysis.complete',
        payload: { commentId, analysis }
      })

      return analysis
    } catch (error) {
      publishEvent({
        type: 'system.error',
        payload: { error: error instanceof Error ? error.message : 'AI analysis failed', commentId }
      })
      throw error
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [commentId]: false }))
    }
  }, [actions, publishEvent, isFeatureEnabled])

  const generateSuggestions = useCallback(async (commentId: string) => {
    if (!isFeatureEnabled('ai-insights')) return []

    try {
      const newSuggestions = await actions.generateAISuggestions(commentId)
      setSuggestions(prev => ({ ...prev, [commentId]: newSuggestions }))

      publishEvent({
        type: 'ai.suggestion.generated',
        payload: { commentId, suggestions: newSuggestions }
      })

      return newSuggestions
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      return []
    }
  }, [actions, publishEvent, isFeatureEnabled])

  // Auto-analyze new comments
  useEffect(() => {
    if (!isFeatureEnabled('ai-insights')) return

    const unsubscribe = subscribeToEvent('comment.created', (data: any) => {
      setTimeout(() => {
        analyzeComment(data.commentId).catch(console.error)
      }, 1000) // Small delay to ensure comment is saved
    })

    return unsubscribe
  }, [analyzeComment, subscribeToEvent, isFeatureEnabled])

  return {
    analyses: state.aiAnalyses,
    suggestions,
    isAnalyzing,
    analyzeComment,
    generateSuggestions,
    getAIInsights: actions.getAIInsights,
    isEnabled: isFeatureEnabled('ai-insights')
  }
}

// Smart filtering with saved filters
export function useUPSFilters() {
  const { state, actions, publishEvent } = useUPS()
  const [savedFilters, setSavedFilters] = useState<Record<string, any>>({})
  const [isFilteringEnabled, setIsFilteringEnabled] = useState(true)

  const applyFilter = useCallback((filterName: string, filterConfig: any) => {
    actions.updateFilters(filterConfig)

    publishEvent({
      type: 'filter.applied',
      payload: { filterName, filterConfig }
    })
  }, [actions, publishEvent])

  const saveFilter = useCallback((name: string, filters: any) => {
    setSavedFilters(prev => ({ ...prev, [name]: filters }))
    localStorage.setItem('ups-saved-filters', JSON.stringify({ ...savedFilters, [name]: filters }))
  }, [savedFilters])

  const loadFilter = useCallback((name: string) => {
    const filter = savedFilters[name]
    if (filter) {
      applyFilter(name, filter)
    }
  }, [savedFilters, applyFilter])

  const deleteFilter = useCallback((name: string) => {
    setSavedFilters(prev => {
      const { [name]: removed, ...rest } = prev
      localStorage.setItem('ups-saved-filters', JSON.stringify(rest))
      return rest
    })
  }, [])

  // Load saved filters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ups-saved-filters')
      if (saved) {
        setSavedFilters(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error)
    }
  }, [])

  return {
    filters: state.filters,
    savedFilters,
    isFilteringEnabled,
    updateFilters: actions.updateFilters,
    clearFilters: actions.clearFilters,
    search: actions.search,
    applyFilter,
    saveFilter,
    loadFilter,
    deleteFilter,
    setIsFilteringEnabled
  }
}

// Export management with templates and scheduling
export function useUPSExport() {
  const { state, actions, publishEvent, isFeatureEnabled } = useUPS()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<number>(0)

  const exportWithProgress = useCallback(async (options: ExportOptions) => {
    if (!isFeatureEnabled('export')) {
      throw new Error('Export feature is not enabled')
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      publishEvent({
        type: 'export.started',
        payload: { options }
      })

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const exportId = await actions.exportComments(options)

      clearInterval(progressInterval)
      setExportProgress(100)

      publishEvent({
        type: 'export.complete',
        payload: { exportId, options }
      })

      setTimeout(() => {
        setExportProgress(0)
        setIsExporting(false)
      }, 1000)

      return exportId
    } catch (error) {
      setIsExporting(false)
      setExportProgress(0)

      publishEvent({
        type: 'export.failed',
        payload: { error: error instanceof Error ? error.message : 'Export failed', options }
      })

      throw error
    }
  }, [actions, publishEvent, isFeatureEnabled])

  return {
    exportHistory: actions.getExportHistory(),
    isExporting,
    exportProgress,
    exportComments: exportWithProgress,
    scheduleExport: actions.scheduleExport,
    isEnabled: isFeatureEnabled('export')
  }
}

// Notification management with priority handling
export function useUPSNotifications() {
  const { state, actions, subscribeToEvent } = useUPS()
  const [priorityFilter, setPriorityFilter] = useState<string[]>(['urgent', 'high', 'medium', 'low'])
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)

  const filteredNotifications = state.notifications.filter(notification =>
    isNotificationsEnabled && priorityFilter.includes(notification.priority)
  )

  const unreadCount = filteredNotifications.filter(n => !n.read).length

  const markAsRead = useCallback((id: string) => {
    actions.markNotificationRead(id)
  }, [actions])

  const markAllAsRead = useCallback(() => {
    actions.markAllNotificationsRead()
  }, [actions])

  const clearAll = useCallback(() => {
    actions.clearNotifications()
  }, [actions])

  // Auto-mark notifications as read after a delay
  useEffect(() => {
    const unsubscribe = subscribeToEvent('notification.created', (data: any) => {
      if (data.priority === 'low') {
        setTimeout(() => {
          markAsRead(data.id)
        }, 10000) // Auto-read low priority notifications after 10 seconds
      }
    })

    return unsubscribe
  }, [subscribeToEvent, markAsRead])

  return {
    notifications: filteredNotifications,
    unreadCount,
    priorityFilter,
    isNotificationsEnabled,
    markAsRead,
    markAllAsRead,
    clearAll,
    setPriorityFilter,
    setIsNotificationsEnabled,
    addNotification: actions.addNotification
  }
}

// Performance monitoring
export function useUPSPerformance() {
  const { getMetrics } = useUPS()
  const [metrics, setMetrics] = useState<any>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const refreshMetrics = useCallback(() => {
    setMetrics(getMetrics())
  }, [getMetrics])

  useEffect(() => {
    if (isMonitoring) {
      refreshMetrics()
      const interval = setInterval(refreshMetrics, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isMonitoring, refreshMetrics])

  return {
    metrics,
    isMonitoring,
    refreshMetrics,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false)
  }
}

// Keyboard shortcuts integration
export function useUPSKeyboardShortcuts() {
  const { publishEvent } = useUPS()

  const registerShortcut = useCallback((keys: string, action: string, description: string) => {
    publishEvent({
      type: 'system.info',
      payload: {
        message: 'Keyboard shortcut registered',
        keys,
        action,
        description
      },
      metadata: { category: 'shortcuts' }
    })
  }, [publishEvent])

  const triggerShortcut = useCallback((action: string, data?: any) => {
    publishEvent({
      type: 'system.info',
      payload: {
        message: 'Keyboard shortcut triggered',
        action,
        data
      },
      metadata: { category: 'shortcuts' }
    })
  }, [publishEvent])

  return {
    registerShortcut,
    triggerShortcut
  }
}

// Error handling with recovery
export function useUPSErrorHandling() {
  const { state, actions, reportError, subscribeToEvent } = useUPS()
  const [errorHistory, setErrorHistory] = useState<any[]>([])
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({})

  const handleError = useCallback((error: Error, context: Record<string, any> = {}, canRetry = false) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const errorInfo = {
      id: errorId,
      error: error.message,
      context,
      canRetry,
      timestamp: new Date(),
      attempts: retryAttempts[error.message] || 0
    }

    setErrorHistory(prev => [errorInfo, ...prev.slice(0, 49)]) // Keep last 50 errors
    reportError(error, context)

    return errorId
  }, [reportError, retryAttempts])

  const retryOperation = useCallback(async (operation: () => Promise<any>, maxAttempts = 3) => {
    let attempts = 0
    let lastError: Error

    while (attempts < maxAttempts) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        attempts++
        setRetryAttempts(prev => ({ ...prev, [lastError.message]: attempts }))

        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)) // Exponential backoff
        }
      }
    }

    throw lastError!
  }, [])

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([])
    setRetryAttempts({})
  }, [])

  // Subscribe to system errors
  useEffect(() => {
    const unsubscribe = subscribeToEvent('system.error', (data: any) => {
      setErrorHistory(prev => [{
        id: `system_${Date.now()}`,
        error: data.error || data.message,
        context: data,
        canRetry: false,
        timestamp: new Date(),
        attempts: 0
      }, ...prev.slice(0, 49)])
    })

    return unsubscribe
  }, [subscribeToEvent])

  return {
    currentError: state.error,
    errorHistory,
    retryAttempts,
    handleError,
    retryOperation,
    clearErrorHistory,
    clearCurrentError: () => actions.setError(null)
  }
}