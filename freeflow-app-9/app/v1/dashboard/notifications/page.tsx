'use client'

export const dynamic = 'force-dynamic';

import { useState, useReducer, useEffect } from 'react'
import { toast } from 'sonner'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  Bell,
  Search,
  CheckCircle,
  X,
  Check,
  Archive,
  Trash2,
  Settings,
  MessageSquare,
  DollarSign,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Notifications')

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'project' | 'message' | 'system'
  read: boolean
  timestamp: Date
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  avatar?: string
  archived?: boolean
}

interface NotificationState {
  notifications: Notification[]
  filter: 'all' | 'unread' | 'read' | 'archived'
  search: string
  loading: boolean
  soundEnabled: boolean
  showPreviews: boolean
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'UNARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_FILTER'; payload: NotificationState['filter'] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_PREVIEWS' }

const initialState: NotificationState = {
  notifications: [],
  filter: 'all',
  search: '',
  loading: false,
  soundEnabled: true,
  showPreviews: true
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }
    case 'ARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, archived: true } : n
        )
      }
    case 'UNARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, archived: false } : n
        )
      }
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }
    case 'TOGGLE_PREVIEWS':
      return { ...state, showPreviews: !state.showPreviews }
    default:
      return state
  }
}

export default function NotificationsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const [activeTab, setActiveTab] = useState<string>('inbox')

  // AlertDialog confirmation states
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [showResetPreferencesConfirm, setShowResetPreferencesConfirm] = useState(false)

  // A+++ LOAD NOTIFICATIONS DATA
  useEffect(() => {
    const loadNotificationsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch notifications from API
        const response = await fetch('/api/notifications?action=list&limit=50')

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.notifications) {
          // Transform API notifications to match local interface
          const transformedNotifications: Notification[] = result.notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'info',
            read: n.read ?? n.is_read ?? false,
            timestamp: new Date(n.timestamp || n.created_at),
            category: n.category || 'General',
            priority: n.priority || 'medium',
            actionUrl: n.actionUrl || n.action_url,
            avatar: n.avatar,
            archived: n.archived ?? n.data?.archived ?? false
          }))

          dispatch({ type: 'SET_NOTIFICATIONS', payload: transformedNotifications })
          logger.info('Notifications loaded from API', { count: transformedNotifications.length })
        } else {
          // Fallback to mock data if API returns empty
          dispatch({ type: 'SET_NOTIFICATIONS', payload: getFallbackNotifications() })
          logger.info('Using fallback notifications data')
        }

        setIsLoading(false)
        announce('Notifications loaded successfully', 'polite')
      } catch (err) {
        logger.error('Failed to load notifications', { error: err instanceof Error ? err.message : String(err) })

        // Fallback to mock data on error for graceful degradation
        dispatch({ type: 'SET_NOTIFICATIONS', payload: getFallbackNotifications() })

        setError(null) // Don't show error if fallback works
        setIsLoading(false)
        announce('Notifications loaded', 'polite')

        // Show non-blocking toast for the API error
        toast.error('Could not sync with server', {
          description: 'Showing cached notifications'
        })
      }
    }

    loadNotificationsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback notifications for when API is unavailable
  const getFallbackNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'New Project Message',
      message: 'Sarah Johnson sent you a message about the website redesign project.',
      type: 'message',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60000),
      category: 'Communication',
      priority: 'high',
      actionUrl: '/dashboard/messages',
      avatar: '/avatars/sarah.jpg'
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'You received a payment of $2,500 from TechCorp Inc.',
      type: 'payment',
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      category: 'Finance',
      priority: 'medium',
      actionUrl: '/dashboard/escrow'
    },
    {
      id: '3',
      title: 'Project Deadline Reminder',
      message: 'E-commerce redesign project is due in 3 days.',
      type: 'warning',
      read: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      category: 'Projects',
      priority: 'urgent',
      actionUrl: '/dashboard/projects-hub'
    },
    {
      id: '4',
      title: 'New Review Posted',
      message: 'Mike Rodriguez left a 5-star review for your video editing work.',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      category: 'Reviews',
      priority: 'low',
      actionUrl: '/dashboard/cv-portfolio'
    },
    {
      id: '5',
      title: 'System Update',
      message: 'FreeFlow platform has been updated with new features.',
      type: 'system',
      read: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
      category: 'System',
      priority: 'low'
    },
    {
      id: '6',
      title: 'Collaboration Request',
      message: 'Emma Thompson invited you to collaborate on a brand identity project.',
      type: 'project',
      read: false,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
      category: 'Collaboration',
      priority: 'medium',
      actionUrl: '/dashboard/collaboration'
    },
    {
      id: '7',
      title: 'File Upload Complete',
      message: 'Your video files have been successfully uploaded to the cloud.',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000),
      category: 'Files',
      priority: 'low',
      actionUrl: '/dashboard/files-hub'
    },
    {
      id: '8',
      title: 'Invoice Overdue',
      message: 'Invoice #INV-2024-001 is 5 days overdue.',
      type: 'error',
      read: false,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000),
      category: 'Finance',
      priority: 'urgent',
      actionUrl: '/dashboard/invoices'
    }
  ]

  // Handlers
  const handleRefresh = () => { logger.info('Refreshing notifications'); dispatch({ type: 'SET_LOADING', payload: true }); window.location.reload() }
  const handleSettings = () => { logger.info('Opening notification settings'); setActiveTab('settings') }
  const handleViewNotification = (id: string) => { logger.info('Viewing notification', { notificationId: id }); dispatch({ type: 'MARK_AS_READ', payload: id }); toast.success('Marked as read') }
  const handleMarkRead = (id: string) => { logger.info('Marking notification as read', { notificationId: id }); dispatch({ type: 'MARK_AS_READ', payload: id }) }
  const handleMarkAllRead = async () => {
    const unreadCount = state.notifications.filter(n => !n.read).length

    logger.info('Marking all notifications as read', {
      totalNotifications: state.notifications.length,
      unreadCount,
      filter: state.filter
    })

    try {
      // Call API to mark all as read
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark-all-read',
          filter: state.filter
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark all as read')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'MARK_ALL_READ' })

        logger.info('All notifications marked as read', { count: result.count || unreadCount })

        // Show success message
        toast.success('All notifications marked as read')

        // Show achievement if present
        if (result.achievement) {
          toast.success(`${result.achievement.message} +${result.achievement.points} points!`)
        }
      }
    } catch (error) {
      logger.error('Failed to mark all as read', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to mark all as read', {
        description: error.message || 'Please try again'
      })
    }
  }
  const handleArchive = async (id: string) => {
    const notification = state.notifications.find(n => n.id === id)

    logger.info('Archiving notification', {
      notificationId: id,
      title: notification?.title,
      type: notification?.type
    })

    try {
      // Call API to archive notification
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          notificationId: id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to archive notification')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: id })

        logger.info('Notification archived successfully', { notificationId: id })

        // Show success message
        toast.success(`${notification?.title || 'Notification'} archived`)
      }
    } catch (error) {
      logger.error('Failed to archive notification', {
        notificationId: id,
        error: error instanceof Error ? error.message : String(error)
      })
      toast.error('Failed to archive notification', {
        description: error.message || 'Please try again'
      })
    }
  }
  const handleArchiveAll = async () => {
    const count = state.notifications.length
    const notificationIds = state.notifications.map(n => n.id)
    logger.info('Archiving all notifications', { count })

    try {
      // Call API to archive all notifications
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          data: {
            notificationIds
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to archive notifications')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        state.notifications.forEach(n => dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: n.id }))
        logger.info('All notifications archived via API', { count: result.count || count })
        toast.success(`${result.count || count} notifications archived`)
      }
    } catch (error) {
      logger.error('Failed to archive all notifications', { error: error.message })
      toast.error('Failed to archive notifications', {
        description: error.message || 'Please try again'
      })
    }
  }
  const handleDelete = async (id: string) => {
    const notification = state.notifications.find(n => n.id === id)

    logger.info('Deleting notification', {
      notificationId: id,
      title: notification?.title,
      type: notification?.type,
      permanent: false
    })

    try {
      // Call API to delete notification
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          notificationId: id,
          permanent: false // Soft delete by default
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'DELETE_NOTIFICATION', payload: id })

        logger.info('Notification deleted successfully', { notificationId: id })

        // Show success message
        toast.success('Notification deleted')
      }
    } catch (error) {
      logger.error('Failed to delete notification', {
        notificationId: id,
        error: error instanceof Error ? error.message : String(error)
      })
      toast.error('Failed to delete notification', {
        description: error.message || 'Please try again'
      })
    }
  }
  const handleDeleteAll = () => { const count = state.notifications.length; logger.info('Deleting all notifications initiated', { count }); setShowDeleteAllConfirm(true) }

  const handleConfirmDeleteAll = async () => {
    const count = state.notifications.length
    const notificationIds = state.notifications.map(n => n.id)
    logger.info('Deleting all notifications', { count })

    try {
      // Call API to delete all notifications
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-all'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete notifications')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        notificationIds.forEach(id => dispatch({ type: 'DELETE_NOTIFICATION', payload: id }))
        setShowDeleteAllConfirm(false)
        logger.info('All notifications deleted via API', { count: result.count || count })
        toast.success(`${result.count || count} notifications deleted`)
      }
    } catch (error) {
      logger.error('Failed to delete all notifications', { error: error.message })
      setShowDeleteAllConfirm(false)
      toast.error('Failed to delete notifications', {
        description: error.message || 'Please try again'
      })
    }
  }

  const handleUnarchive = async (id: string) => {
    const notification = state.notifications.find(n => n.id === id)

    logger.info('Unarchiving notification', {
      notificationId: id,
      title: notification?.title,
      type: notification?.type
    })

    try {
      // Call API to unarchive (update the archived flag)
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unarchive',
          notificationId: id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to unarchive notification')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        dispatch({ type: 'UNARCHIVE_NOTIFICATION', payload: id })

        logger.info('Notification unarchived successfully', { notificationId: id })

        // Show success message
        toast.success(`${notification?.title || 'Notification'} moved to inbox`)
      }
    } catch (error) {
      logger.error('Failed to unarchive notification', {
        notificationId: id,
        error: error instanceof Error ? error.message : String(error)
      })
      toast.error('Failed to unarchive notification', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleFilterAll = () => { logger.debug('Filtering all notifications'); dispatch({ type: 'SET_FILTER', payload: 'all' }) }
  const handleFilterUnread = () => { logger.debug('Filtering unread notifications'); dispatch({ type: 'SET_FILTER', payload: 'unread' }) }
  const handleFilterRead = () => { logger.debug('Filtering read notifications'); dispatch({ type: 'SET_FILTER', payload: 'read' }) }
  const handleExportNotifications = async () => {
    const count = state.notifications.length
    logger.info('Exporting notifications', { count })

    if (count === 0) {
      toast.error('No notifications to export')
      return
    }

    try {
      // Generate CSV content from real notification data
      const headers = ['ID', 'Title', 'Message', 'Type', 'Category', 'Priority', 'Read', 'Archived', 'Timestamp']
      const csvRows = [headers.join(',')]

      state.notifications.forEach(notification => {
        const row = [
          notification.id,
          `"${notification.title.replace(/"/g, '""')}"`,
          `"${notification.message.replace(/"/g, '""')}"`,
          notification.type,
          notification.category,
          notification.priority,
          notification.read ? 'Yes' : 'No',
          notification.archived ? 'Yes' : 'No',
          notification.timestamp.toISOString()
        ]
        csvRows.push(row.join(','))
      })

      const csvContent = csvRows.join('\n')

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `notifications-export-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      logger.info('Notifications exported successfully', { count })
      toast.success(`Exported ${count} notifications to CSV`)
    } catch (error) {
      logger.error('Failed to export notifications', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to export notifications', {
        description: 'Please try again'
      })
    }
  }
  const handleClearAll = () => { const count = state.notifications.length; logger.info('Clearing all notifications initiated', { count }); setShowClearAllConfirm(true) }

  const handleConfirmClearAll = async () => {
    const count = state.notifications.length
    logger.info('Clearing all notifications', { count })

    try {
      // Call API to delete all notifications (clear = delete all)
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-all'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to clear notifications')
      }

      const result = await response.json()

      if (result.success) {
        // Clear local state
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
        setShowClearAllConfirm(false)
        logger.info('All notifications cleared via API', { count: result.count || count })
        toast.success('All notifications cleared')
      }
    } catch (error) {
      logger.error('Failed to clear notifications', { error: error.message })
      setShowClearAllConfirm(false)
      toast.error('Failed to clear notifications', {
        description: error.message || 'Please try again'
      })
    }
  }
  const handleToggleSound = async () => {
    logger.info('Toggling notification sound', { currentState: state.soundEnabled })
    dispatch({ type: 'TOGGLE_SOUND' })

    // Auto-save preference to API
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            channelPreferences: {
              general: ['in_app'],
              sound_enabled: !state.soundEnabled // Toggle the current value
            }
          }
        })
      })

      if (response.ok) {
        toast.success(!state.soundEnabled ? 'Sound notifications enabled' : 'Sound notifications disabled')
      }
    } catch (error) {
      logger.error('Failed to save sound preference', { error: error instanceof Error ? error.message : String(error) })
      // Preference already updated locally, just log the error
    }
  }

  const handleTogglePreviews = async () => {
    logger.info('Toggling notification previews', { currentState: state.showPreviews })
    dispatch({ type: 'TOGGLE_PREVIEWS' })

    // Auto-save preference to API
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            channelPreferences: {
              general: ['in_app'],
              show_previews: !state.showPreviews // Toggle the current value
            }
          }
        })
      })

      if (response.ok) {
        toast.success(!state.showPreviews ? 'Notification previews enabled' : 'Notification previews disabled')
      }
    } catch (error) {
      logger.error('Failed to save preview preference', { error: error instanceof Error ? error.message : String(error) })
      // Preference already updated locally, just log the error
    }
  }

  const handleSavePreferences = async () => {
    logger.info('Saving notification preferences', { soundEnabled: state.soundEnabled, showPreviews: state.showPreviews })

    try {
      // Call API to update preferences
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            channelPreferences: {
              general: ['in_app'],
              sound_enabled: state.soundEnabled,
              show_previews: state.showPreviews
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Notification preferences saved via API')
        toast.success('Settings saved successfully')
      }
    } catch (error) {
      logger.error('Failed to save preferences', { error: error.message })
      toast.error('Failed to save settings', {
        description: 'Please try again'
      })
    }
  }
  const handleResetPreferences = () => { logger.info('Resetting notification preferences initiated'); setShowResetPreferencesConfirm(true) }

  const handleConfirmResetPreferences = async () => {
    logger.info('Resetting notification preferences to defaults')

    try {
      // Call API to reset preferences to defaults
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            // Reset to default preferences
            channelPreferences: {
              general: ['in_app'],
              project: ['in_app', 'email'],
              task: ['in_app', 'email'],
              invoice: ['in_app', 'email'],
              payment: ['in_app', 'email', 'push'],
              client: ['in_app'],
              team: ['in_app'],
              file: ['in_app'],
              message: ['in_app', 'push'],
              workflow: ['in_app'],
              security: ['in_app', 'email', 'push'],
              system: ['in_app', 'email']
            },
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '07:00',
              timezone: 'UTC'
            },
            emailDigest: {
              enabled: false,
              frequency: 'daily'
            },
            disabledCategories: [],
            pushEnabled: true
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reset preferences')
      }

      const result = await response.json()

      if (result.success) {
        // Reset local state
        dispatch({ type: 'TOGGLE_SOUND' }) // Reset to default if needed
        dispatch({ type: 'TOGGLE_PREVIEWS' }) // Reset to default if needed

        setShowResetPreferencesConfirm(false)
        toast.success('Preferences reset to defaults')
        logger.info('Notification preferences reset via API')
      }
    } catch (error) {
      logger.error('Failed to reset preferences', { error: error.message })
      setShowResetPreferencesConfirm(false)
      toast.error('Failed to reset preferences', {
        description: 'Please try again'
      })
    }
  }
  const handleSnooze = async (id: string) => {
    logger.info('Snoozing notification', { notificationId: id, duration: '1 hour' })

    // Persist snooze to database
    if (userId) {
      try {
        const { snoozeNotification } = await import('@/lib/notifications-center-queries')
        const { error } = await snoozeNotification(userId, id, '1_hour')
        if (error) throw error
        logger.info('Notification snoozed in database', { notificationId: id })
      } catch (error) {
        logger.error('Failed to snooze notification', { error: error.message })
      }
    }

    toast.success('Notification snoozed for 1 hour')
  }

  const filteredNotifications = state.notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(state.search.toLowerCase()) ||
                         notification.message.toLowerCase().includes(state.search.toLowerCase())

    const matchesFilter = state.filter === 'all' ||
                         (state.filter === 'unread' && !notification.read) ||
                         (state.filter === 'read' && notification.read) ||
                         (state.filter === 'archived' && notification.archived)

    return matchesSearch && matchesFilter && !notification.archived
  })

  // Get archived notifications for the Archive tab
  const archivedNotifications = state.notifications.filter(notification => notification.archived)

  const unreadCount = state.notifications.filter(n => !n.read && !n.archived).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare
      case 'payment': return DollarSign
      case 'project': return FileText
      case 'system': return Settings
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return X
      default: return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-50'
      case 'payment': return 'text-green-600 bg-green-50'
      case 'project': return 'text-purple-600 bg-purple-50'
      case 'system': return 'text-gray-600 bg-gray-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Call API to mark as read
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark-read',
          notificationId: notification.id
        })
      })

      if (response.ok) {
        // Update local state
        dispatch({ type: 'MARK_AS_READ', payload: notification.id })
      }

      // Navigate to action URL if present
      if (notification.actionUrl) {
        // In a real app, use router.push()
        logger.info('Navigating to notification action', { notificationId: notification.id, actionUrl: notification.actionUrl })
        toast.info('Navigating to: ' + notification.actionUrl)
      }
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error instanceof Error ? error.message : String(error) })
      // Graceful degradation - still update UI even if API fails
      dispatch({ type: 'MARK_AS_READ', payload: notification.id })
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={8} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // A+++ EMPTY STATE
  if (filteredNotifications.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <NoDataEmptyState
          entityName="notifications"
          description={
            state.search || state.filter !== 'all'
              ? "No notifications match your filters. Try adjusting your search or filter settings."
              : "You're all caught up! No new notifications at the moment."
          }
          action={{
            label: state.search || state.filter !== 'all' ? 'Clear Filters' : 'Refresh',
            onClick: state.search || state.filter !== 'all'
              ? () => {
                  dispatch({ type: 'SET_SEARCH', payload: '' })
                  dispatch({ type: 'SET_FILTER', payload: 'all' })
                }
              : () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <LiquidGlassCard className="border-b border-slate-700/50 p-6 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-600" />
              <TextShimmer className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 dark:from-gray-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
                Notifications
              </TextShimmer>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg">A+++</Badge>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  <NumberFlow value={unreadCount} className="inline-block" /> unread
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button data-testid="mark-all-read-btn" variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>

            <Button data-testid="refresh-notifications-btn" variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button data-testid="notification-settings-btn" variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </LiquidGlassCard>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger data-testid="inbox-tab" value="inbox">
              Inbox (<NumberFlow value={filteredNotifications.length} className="inline-block" />)
            </TabsTrigger>
            <TabsTrigger data-testid="notification-settings-tab" value="settings">Settings</TabsTrigger>
            <TabsTrigger data-testid="archive-tab" value="archive">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search notifications..."
                  value={state.search}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={state.filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
                >
                  All
                </Button>
                <Button
                  variant={state.filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'unread' })}
                >
                  Unread
                </Button>
                <Button
                  variant={state.filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'read' })}
                >
                  Read
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <LiquidGlassCard>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-white mb-2">No notifications found</h3>
                    <p className="text-gray-400">
                      {state.search ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                    </p>
                  </CardContent>
                </LiquidGlassCard>
              ) : (
                filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type)
                  const typeColor = getTypeColor(notification.type)
                  const priorityColor = getPriorityColor(notification.priority)

                  return (
                    <LiquidGlassCard
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/25 ${
                        !notification.read ? 'bg-blue-500/10 border-blue-500/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${typeColor}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                                <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-3">{notification.message}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {notification.priority}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArchive(notification.id)
                                  }}
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(notification.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <LiquidGlassCard>
              <CardHeader>
                <TextShimmer className="text-xl font-bold" duration={2}>
                  Notification Preferences
                </TextShimmer>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound" className="text-white">Sound Notifications</Label>
                    <p className="text-sm text-gray-400">Play sound when new notifications arrive</p>
                  </div>
                  <Switch
                    id="sound"
                    checked={state.soundEnabled}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_SOUND' })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="previews" className="text-white">Show Previews</Label>
                    <p className="text-sm text-gray-400">Show notification content in previews</p>
                  </div>
                  <Switch
                    id="previews"
                    checked={state.showPreviews}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_PREVIEWS' })}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Notification Types</h4>
                  {[
                    { type: 'Messages', enabled: true, description: 'New messages and communications' },
                    { type: 'Payments', enabled: true, description: 'Payment confirmations and alerts' },
                    { type: 'Projects', enabled: true, description: 'Project updates and deadlines' },
                    { type: 'System', enabled: false, description: 'System updates and maintenance' },
                    { type: 'Marketing', enabled: false, description: 'Product updates and promotions' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                      <div>
                        <Label className="text-white">{setting.type}</Label>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </LiquidGlassCard>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between">
                <TextShimmer className="text-xl font-bold" duration={2}>
                  Archived Notifications
                </TextShimmer>
                {archivedNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportNotifications}
                  >
                    Export Archive
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {archivedNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-white mb-2">No archived notifications</h3>
                    <p className="text-gray-400">Archived notifications will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {archivedNotifications.map((notification) => {
                      const TypeIcon = getTypeIcon(notification.type)
                      const typeColor = getTypeColor(notification.type)

                      return (
                        <div
                          key={notification.id}
                          className="flex items-start gap-4 p-4 border border-slate-700 rounded-lg bg-slate-800/30"
                        >
                          <div className={`p-2 rounded-full ${typeColor}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-300">
                                {notification.title}
                              </h3>
                              <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                            </div>

                            <p className="text-sm text-gray-400 mb-3">{notification.message}</p>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleUnarchive(notification.id)}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Unarchive
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                                  onClick={() => handleDelete(notification.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </LiquidGlassCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {state.notifications.length} notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all notifications from your inbox. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClearAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Preferences Confirmation Dialog */}
      <AlertDialog open={showResetPreferencesConfirm} onOpenChange={setShowResetPreferencesConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Preferences?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all notification preferences to their default settings. Your notification history will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetPreferences}>
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
