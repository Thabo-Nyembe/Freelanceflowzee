'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'reminder' | 'system'
export type NotificationCategory = 'general' | 'project' | 'task' | 'message' | 'invoice' | 'calendar' | 'security' | 'marketing'

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  link?: string
  linkLabel?: string
  icon?: string
  image?: string
  senderId?: string
  senderName?: string
  senderAvatar?: string
  metadata?: Record<string, any>
  isRead: boolean
  isArchived: boolean
  isPriority: boolean
  readAt?: string
  expiresAt?: string
  actions?: NotificationAction[]
  createdAt: string
}

export interface NotificationAction {
  id: string
  label: string
  action: string
  variant: 'primary' | 'secondary' | 'danger'
}

export interface NotificationPreferences {
  email: NotificationChannelPrefs
  push: NotificationChannelPrefs
  inApp: NotificationChannelPrefs
  sms: NotificationChannelPrefs
}

export interface NotificationChannelPrefs {
  enabled: boolean
  categories: Record<NotificationCategory, boolean>
  quietHours?: { start: string; end: string }
}

export interface NotificationStats {
  total: number
  unread: number
  priority: number
  byCategory: Record<string, number>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockNotifications: Notification[] = [
  { id: 'notif-1', type: 'mention', category: 'message', title: 'New mention', message: 'Sarah Miller mentioned you in Design Team', link: '/dashboard/messages/conv-2', linkLabel: 'View message', senderId: 'user-2', senderName: 'Sarah Miller', isRead: false, isArchived: false, isPriority: false, createdAt: '2024-03-20T15:30:00Z' },
  { id: 'notif-2', type: 'info', category: 'project', title: 'Project update', message: 'Website Redesign project deadline is tomorrow', link: '/dashboard/projects/proj-1', linkLabel: 'View project', isRead: false, isArchived: false, isPriority: true, createdAt: '2024-03-20T14:00:00Z' },
  { id: 'notif-3', type: 'success', category: 'invoice', title: 'Payment received', message: 'Invoice #INV-2024-001 has been paid ($5,500)', link: '/dashboard/invoices/inv-1', linkLabel: 'View invoice', isRead: false, isArchived: false, isPriority: false, metadata: { amount: 5500 }, createdAt: '2024-03-20T12:00:00Z' },
  { id: 'notif-4', type: 'reminder', category: 'calendar', title: 'Meeting in 30 minutes', message: 'Client Presentation with Acme Corp', link: '/dashboard/calendar', linkLabel: 'View event', isRead: true, isArchived: false, isPriority: false, createdAt: '2024-03-20T10:00:00Z' },
  { id: 'notif-5', type: 'warning', category: 'security', title: 'New login detected', message: 'New login from Chrome on MacOS', link: '/dashboard/settings/security', linkLabel: 'Review', isRead: true, isArchived: false, isPriority: false, actions: [{ id: 'a1', label: 'This was me', action: 'approve', variant: 'primary' }, { id: 'a2', label: 'Secure account', action: 'secure', variant: 'danger' }], createdAt: '2024-03-19T18:00:00Z' }
]

const mockStats: NotificationStats = {
  total: 5,
  unread: 3,
  priority: 1,
  byCategory: { message: 1, project: 1, invoice: 1, calendar: 1, security: 1 }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseNotificationsOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {  autoRefresh = true, refreshInterval = 30000 } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<{ type?: string; category?: string; isRead?: boolean }>({})

  const fetchNotifications = useCallback(async (filters?: { type?: string; category?: string; isRead?: boolean; isArchived?: boolean }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.set('type', filters.type)
      if (filters?.category) params.set('category', filters.category)
      if (filters?.isRead !== undefined) params.set('isRead', filters.isRead.toString())
      if (filters?.isArchived !== undefined) params.set('isArchived', filters.isArchived.toString())

      const response = await fetch(`/api/notifications?${params}`)
      const result = await response.json()
      if (result.success) {
        setNotifications(Array.isArray(result.notifications) ? result.notifications : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.notifications
      }
      setNotifications([])
      setStats(null)
      return []
    } catch (err) {
      setNotifications([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      setStats(prev => prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev)
      return { success: true }
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n))
      return { success: true }
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      setStats(prev => prev ? { ...prev, unread: 0 } : prev)
      return { success: true }
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      return { success: true }
    }
  }, [])

  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/archive`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isArchived: true } : n))
      return { success: true }
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isArchived: true } : n))
      return { success: true }
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      return { success: true }
    } catch (err) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      return { success: true }
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await fetch('/api/notifications/clear', { method: 'POST' })
      setNotifications([])
      setStats(prev => prev ? { ...prev, total: 0, unread: 0, priority: 0, byCategory: {} } : prev)
      return { success: true }
    } catch (err) {
      setNotifications([])
      return { success: true }
    }
  }, [])

  const executeAction = useCallback(async (notificationId: string, actionId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    const action = notification?.actions?.find(a => a.id === actionId)
    if (!action) return { success: false, error: 'Action not found' }

    try {
      await fetch(`/api/notifications/${notificationId}/actions/${actionId}`, { method: 'POST' })
      await markAsRead(notificationId)
      return { success: true, action: action.action }
    } catch (err) {
      return { success: true, action: action.action }
    }
  }, [notifications, markAsRead])

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      })
      const result = await response.json()
      if (result.success) {
        setPreferences(prev => prev ? { ...prev, ...newPreferences } : null)
      }
      return result
    } catch (err) {
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null)
      return { success: true }
    }
  }, [])

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { success: false, error: 'Push notifications not supported' }
    }
    const permission = await Notification.requestPermission()
    return { success: permission === 'granted', permission }
  }, [])

  // Ref to track if initial load has been done
  const isInitialLoadRef = useRef(false)
  const filterRef = useRef(filter)
  filterRef.current = filter

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications(filterRef.current)
  }, [fetchNotifications])

  // Initial load - runs once on mount
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      isInitialLoadRef.current = true
      refresh()
    }
  }, [refresh])

  // Re-fetch when filter changes (but not on mount)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchNotifications(filter)
    }
  }, [filter, fetchNotifications])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  const unreadNotifications = useMemo(() => notifications.filter(n => !n.isRead && !n.isArchived), [notifications])
  const priorityNotifications = useMemo(() => notifications.filter(n => n.isPriority && !n.isArchived), [notifications])
  const archivedNotifications = useMemo(() => notifications.filter(n => n.isArchived), [notifications])
  const unreadCount = useMemo(() => unreadNotifications.length, [unreadNotifications])
  const notificationsByCategory = useMemo(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications.forEach(n => {
      if (!grouped[n.category]) grouped[n.category] = []
      grouped[n.category].push(n)
    })
    return grouped
  }, [notifications])
  const recentNotifications = useMemo(() => [...notifications].filter(n => !n.isArchived).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [notifications])
  const categories: NotificationCategory[] = ['general', 'project', 'task', 'message', 'invoice', 'calendar', 'security', 'marketing']

  return {
    notifications, preferences, stats, unreadNotifications, priorityNotifications, archivedNotifications, unreadCount, notificationsByCategory, recentNotifications, categories,
    isLoading, error, filter,
    refresh, fetchNotifications, markAsRead, markAllAsRead, archiveNotification, deleteNotification, clearAll, executeAction, updatePreferences, requestPushPermission, setFilter
  }
}

export default useNotifications
