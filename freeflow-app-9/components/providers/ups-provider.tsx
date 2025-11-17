"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { useUPSIntegration, UPSIntegrationState, UPSIntegrationActions } from '@/lib/ups/integration-service'
import { upsCommunicationBus, useUPSCommunication, UPSEvent } from '@/lib/ups/communication-bus'
import { useToast } from '@/components/ui/use-toast'

interface UPSContextValue {
  // Core State
  state: UPSIntegrationState
  actions: UPSIntegrationActions

  // Communication
  bus: typeof upsCommunicationBus
  publishEvent: (event: Omit<UPSEvent, 'source' | 'timestamp'>) => void
  subscribeToEvent: <T = any>(
    eventType: UPSEvent['type'] | UPSEvent['type'][],
    handler: (event: T) => void,
    options?: { filter?: (event: T) => boolean; once?: boolean }
  ) => () => void

  // Application Integration
  enableFeature: (feature: string) => void
  disableFeature: (feature: string) => void
  isFeatureEnabled: (feature: string) => boolean
  getFeatureConfig: (feature: string) => any

  // Cross-app Communication
  notifyApp: (type: string, data: any) => void
  broadcastToSuite: (type: string, data: any) => void

  // Performance & Analytics
  getMetrics: () => any
  trackEvent: (event: string, properties?: Record<string, any>) => void

  // Error Handling
  reportError: (error: Error, context?: Record<string, any>) => void

  // Health Status
  isHealthy: boolean
  healthStatus: any
}

interface UPSProviderProps {
  children: ReactNode
  config?: {
    projectId?: string
    userId?: string
    enabledFeatures?: string[]
    realTimeEnabled?: boolean
    aiEnabled?: boolean
    theme?: 'light' | 'dark' | 'auto'
    apiEndpoint?: string
    wsEndpoint?: string
    debug?: boolean
  }
  onError?: (error: Error) => void
  onEvent?: (event: UPSEvent) => void
}

const UPSContext = createContext<UPSContextValue | null>(null)

export const UPSProvider: React.FC<UPSProviderProps> = ({
  children,
  config = {},
  onError,
  onEvent
}) => {
  const {
    projectId,
    userId,
    enabledFeatures = ['comments', 'ai-insights', 'filters', 'export', 'collaboration', 'shortcuts'],
    realTimeEnabled = true,
    aiEnabled = true,
    theme = 'auto',
    apiEndpoint = '/api/ups',
    wsEndpoint = '/api/ups/ws',
    debug = false
  } = config

  const integration = useUPSIntegration()
  const communication = useUPSCommunication('ups-provider')
  const { toast } = useToast()

  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [isHealthy, setIsHealthy] = useState(true)
  const [activeFeatures, setActiveFeatures] = useState(new Set(enabledFeatures))

  // Initialize UPS system
  useEffect(() => {
    const initializeUPS = async () => {
      try {
        // Set up error handling
        const errorHandler = (error: any) => {
          console.error('UPS Error:', error)

          integration.setError(error.message || 'An unexpected error occurred')

          if (onError) {
            onError(error instanceof Error ? error : new Error(error.message || 'Unknown error'))
          }

          // Show user-friendly error notification
          toast({
            title: "UPS System Error",
            description: error.message || 'Something went wrong. Please try again.',
            variant: "destructive"
          })
        }

        // Subscribe to system events
        communication.subscribeToEvent(['system.error', 'system.warning'], errorHandler)

        // Subscribe to notification events
        communication.subscribeToEvent('notification.created', (notification) => {
          if (notification.priority === 'urgent' || notification.priority === 'high') {
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.priority === 'urgent' ? 'destructive' : 'default'
            })
          }
        })

        // Subscribe to connection events
        communication.subscribeToEvent(['integration.connected', 'integration.disconnected'], (event) => {
          if (debug) {
            console.log('UPS Connection Event:', event)
          }
        })

        // Initialize project if provided
        if (projectId && !integration.currentProject) {
          try {
            // Load or create project
            const existingProject = integration.projects.find(p => p.id === projectId)
            if (existingProject) {
              integration.setCurrentProject(existingProject)
            } else {
              const newProject = await integration.createProject({
                name: `Project ${projectId}`,
                description: 'Auto-created project',
                status: 'active',
                members: [],
                settings: {
                  allowAnonymousComments: true,
                  requireApproval: false,
                  emailNotifications: true,
                  realTimeUpdates: realTimeEnabled,
                  aiAnalysisEnabled: aiEnabled,
                  exportFormats: ['pdf', 'excel', 'csv'],
                  maxFileSize: 10 * 1024 * 1024,
                  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf']
                }
              })
              integration.setCurrentProject(newProject)
            }
          } catch (error) {
            console.error('Failed to initialize project:', error)
          }
        }

        // Set current user if provided
        if (userId && !integration.currentUser) {
          const user = {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
            role: 'editor' as const,
            isOnline: true,
            lastSeen: new Date()
          }
          integration.setCurrentUser(user)
        }

        // Connect to real-time services
        if (realTimeEnabled) {
          await integration.connect()
        }

        // Publish initialization event
        communication.publishEvent({
          type: 'system.info',
          payload: { message: 'UPS Provider initialized successfully' },
          metadata: { projectId, userId, enabledFeatures }
        })

        if (debug) {
          console.log('UPS Provider initialized with config:', config)
        }

      } catch (error) {
        errorHandler(error)
      }
    }

    initializeUPS()

    // Cleanup on unmount
    return () => {
      if (realTimeEnabled) {
        integration.disconnect()
      }
    }
  }, [projectId, userId, realTimeEnabled, aiEnabled])

  // Health monitoring
  useEffect(() => {
    const checkHealth = () => {
      const busHealth = communication.bus.getHealthStatus()
      const integrationHealth = {
        hasProject: !!integration.currentProject,
        hasUser: !!integration.currentUser,
        isConnected: integration.connectionStatus === 'connected',
        hasErrors: !!integration.error
      }

      const overall = {
        bus: busHealth,
        integration: integrationHealth,
        timestamp: new Date()
      }

      const healthy = busHealth.isHealthy &&
                     !integrationHealth.hasErrors &&
                     (realTimeEnabled ? integrationHealth.isConnected : true)

      setHealthStatus(overall)
      setIsHealthy(healthy)

      if (debug) {
        console.log('UPS Health Check:', overall)
      }
    }

    // Initial check
    checkHealth()

    // Periodic health checks
    const interval = setInterval(checkHealth, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [integration.currentProject, integration.currentUser, integration.connectionStatus, integration.error, realTimeEnabled, debug])

  // Event forwarding
  useEffect(() => {
    if (onEvent) {
      const unsubscribe = communication.subscribeToEvent(
        [
          'comment.created', 'comment.updated', 'comment.deleted', 'comment.resolved',
          'user.joined', 'user.left', 'user.presence',
          'ai.analysis.complete', 'ai.suggestion.generated',
          'export.complete', 'export.failed',
          'notification.created',
          'system.error', 'system.warning', 'system.info'
        ],
        onEvent
      )

      return unsubscribe
    }
  }, [onEvent])

  // Feature management
  const enableFeature = (feature: string) => {
    setActiveFeatures(prev => new Set([...prev, feature]))
    communication.publishEvent({
      type: 'system.info',
      payload: { message: `Feature '${feature}' enabled` },
      metadata: { feature, action: 'enable' }
    })
  }

  const disableFeature = (feature: string) => {
    setActiveFeatures(prev => {
      const newSet = new Set(prev)
      newSet.delete(feature)
      return newSet
    })
    communication.publishEvent({
      type: 'system.info',
      payload: { message: `Feature '${feature}' disabled` },
      metadata: { feature, action: 'disable' }
    })
  }

  const isFeatureEnabled = (feature: string) => {
    return activeFeatures.has(feature)
  }

  const getFeatureConfig = (feature: string) => {
    // Return feature-specific configuration
    const configs: Record<string, any> = {
      comments: {
        enableReplies: true,
        enableVoiceNotes: true,
        enableDrawing: true,
        maxAttachmentSize: 10 * 1024 * 1024
      },
      'ai-insights': {
        enabled: aiEnabled,
        autoAnalyze: true,
        suggestionsEnabled: true,
        confidence: 0.7
      },
      collaboration: {
        enabled: realTimeEnabled,
        showPresence: true,
        showTyping: true,
        maxUsers: 50
      },
      export: {
        formats: ['pdf', 'excel', 'csv', 'json'],
        templates: ['standard', 'executive', 'detailed'],
        maxFileSize: 50 * 1024 * 1024
      }
    }

    return configs[feature] || {}
  }

  // Cross-app communication
  const notifyApp = (type: string, data: any) => {
    communication.broadcast(type, data, {
      channels: ['global'],
      priority: 'medium'
    })
  }

  const broadcastToSuite = (type: string, data: any) => {
    // Broadcast to the entire application suite
    window.postMessage({
      type: 'ups-broadcast',
      eventType: type,
      data,
      source: 'ups-provider',
      timestamp: new Date().toISOString()
    }, '*')

    communication.broadcast(type, data, {
      channels: ['global'],
      priority: 'high'
    })
  }

  // Performance tracking
  const getMetrics = () => {
    return {
      communication: communication.bus.getPerformanceMetrics(),
      integration: {
        commentsCount: integration.comments.length,
        usersCount: integration.users.length,
        projectsCount: integration.projects.length,
        notificationsCount: integration.notifications.length,
        activitiesCount: integration.activities.length
      },
      features: {
        enabled: Array.from(activeFeatures),
        total: enabledFeatures.length
      },
      health: healthStatus
    }
  }

  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    communication.publishEvent({
      type: 'system.info',
      payload: {
        event,
        properties,
        timestamp: new Date(),
        userId: integration.currentUser?.id,
        projectId: integration.currentProject?.id
      },
      metadata: { category: 'analytics' }
    })

    if (debug) {
      console.log('UPS Event Tracked:', event, properties)
    }
  }

  // Error reporting
  const reportError = (error: Error, context: Record<string, any> = {}) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      userId: integration.currentUser?.id,
      projectId: integration.currentProject?.id,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    communication.publishEvent({
      type: 'system.error',
      payload: errorReport,
      metadata: { severity: 'error' }
    })

    // Also report to integration service
    integration.setError(error.message)

    if (debug) {
      console.error('UPS Error Reported:', errorReport)
    }
  }

  // Memoized context value
  const contextValue = useMemo<UPSContextValue>(() => ({
    state: integration,
    actions: integration,
    bus: communication.bus,
    publishEvent: communication.publishEvent,
    subscribeToEvent: communication.subscribeToEvent,
    enableFeature,
    disableFeature,
    isFeatureEnabled,
    getFeatureConfig,
    notifyApp,
    broadcastToSuite,
    getMetrics,
    trackEvent,
    reportError,
    isHealthy,
    healthStatus
  }), [
    integration,
    communication,
    activeFeatures,
    isHealthy,
    healthStatus
  ])

  return (
    <UPSContext.Provider value={contextValue}>
      {children}
    </UPSContext.Provider>
  )
}

// Hook for using UPS context
export const useUPS = (): UPSContextValue => {
  const context = useContext(UPSContext)
  if (!context) {
    throw new Error('useUPS must be used within a UPSProvider')
  }
  return context
}

// Specialized hooks for specific functionality
export const useUPSComments = () => {
  const ups = useUPS()
  return {
    comments: ups.state.comments,
    addComment: ups.actions.addComment,
    updateComment: ups.actions.updateComment,
    deleteComment: ups.actions.deleteComment,
    resolveComment: ups.actions.resolveComment,
    assignComment: ups.actions.assignComment,
    selectedCommentId: ups.state.selectedCommentId,
    selectComment: ups.actions.selectComment
  }
}

export const useUPSAI = () => {
  const ups = useUPS()
  return {
    analyses: ups.state.aiAnalyses,
    analyzeComment: ups.actions.analyzeComment,
    getAIInsights: ups.actions.getAIInsights,
    generateAISuggestions: ups.actions.generateAISuggestions,
    isEnabled: ups.isFeatureEnabled('ai-insights')
  }
}

export const useUPSCollaboration = () => {
  const ups = useUPS()
  return {
    users: ups.state.users,
    onlineUsers: ups.state.onlineUsers,
    activities: ups.state.activities,
    connectionStatus: ups.state.connectionStatus,
    updateUserPresence: ups.actions.updateUserPresence,
    inviteUser: ups.actions.inviteUser,
    removeUser: ups.actions.removeUser,
    isEnabled: ups.isFeatureEnabled('collaboration')
  }
}

export const useUPSNotifications = () => {
  const ups = useUPS()
  return {
    notifications: ups.state.notifications,
    addNotification: ups.actions.addNotification,
    markNotificationRead: ups.actions.markNotificationRead,
    markAllNotificationsRead: ups.actions.markAllNotificationsRead,
    clearNotifications: ups.actions.clearNotifications,
    unreadCount: ups.state.notifications.filter(n => !n.read).length
  }
}

export const useUPSFilters = () => {
  const ups = useUPS()
  return {
    filters: ups.state.filters,
    updateFilters: ups.actions.updateFilters,
    clearFilters: ups.actions.clearFilters,
    search: ups.actions.search
  }
}

export const useUPSExport = () => {
  const ups = useUPS()
  return {
    exportComments: ups.actions.exportComments,
    scheduleExport: ups.actions.scheduleExport,
    exportHistory: ups.actions.getExportHistory(),
    isEnabled: ups.isFeatureEnabled('export')
  }
}

export const useUPSHealth = () => {
  const ups = useUPS()
  return {
    isHealthy: ups.isHealthy,
    healthStatus: ups.healthStatus,
    metrics: ups.getMetrics(),
    connectionStatus: ups.state.connectionStatus
  }
}

export default UPSProvider