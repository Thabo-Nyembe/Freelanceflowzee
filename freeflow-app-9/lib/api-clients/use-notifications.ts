/**
 * Notifications React Hooks
 *
 * TanStack Query hooks for notification management and user preferences
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  notificationsClient,
  Notification,
  NotificationPreferences,
  CreateNotificationData,
  NotificationFilters,
  NotificationStats
} from './notifications-client'

/**
 * Get notifications with pagination and filters
 */
export function useNotifications(
  page: number = 1,
  pageSize: number = 20,
  filters?: NotificationFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['notifications', page, pageSize, filters],
    queryFn: async () => {
      const response = await notificationsClient.getNotifications(page, pageSize, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch notifications')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Get single notification by ID
 */
export function useNotification(
  id: string,
  options?: Omit<UseQueryOptions<Notification>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      const response = await notificationsClient.getNotification(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch notification')
      }
      return response.data
    },
    enabled: !!id,
    ...options
  })
}

/**
 * Create a new notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationData: CreateNotificationData) => {
      const response = await notificationsClient.createNotification(notificationData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create notification')
      }
      return response.data
    },
    onSuccess: (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      queryClient.setQueryData(['notification', notification.id], notification)

      // Show in-app toast for new notification
      if (notification.priority === 'urgent') {
        toast.error(notification.title, { description: notification.message })
      } else if (notification.type === 'success') {
        toast.success(notification.title, { description: notification.message })
      } else if (notification.type === 'warning') {
        toast.warning(notification.title, { description: notification.message })
      } else {
        toast.info(notification.title, { description: notification.message })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsClient.markAsRead(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to mark notification as read')
      }
      return response.data
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification', id] })

      const previousNotification = queryClient.getQueryData(['notification', id])

      queryClient.setQueryData(['notification', id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })

      return { previousNotification }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousNotification) {
        queryClient.setQueryData(['notification', _variables], context.previousNotification)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    }
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsClient.markAllAsRead()
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark all as read')
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('All notifications marked as read')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Archive notification
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsClient.archiveNotification(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to archive notification')
      }
      return response.data
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification', id] })

      const previousNotification = queryClient.getQueryData(['notification', id])

      queryClient.setQueryData(['notification', id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          is_archived: true,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })

      return { previousNotification }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousNotification) {
        queryClient.setQueryData(['notification', _variables], context.previousNotification)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('Notification archived')
    }
  })
}

/**
 * Toggle pin status of notification
 */
export function useTogglePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const response = await notificationsClient.togglePin(id, isPinned)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to toggle pin')
      }
      return response.data
    },
    onMutate: async ({ id, isPinned }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification', id] })

      const previousNotification = queryClient.getQueryData(['notification', id])

      queryClient.setQueryData(['notification', id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          is_pinned: isPinned,
          updated_at: new Date().toISOString()
        }
      })

      return { previousNotification }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousNotification) {
        queryClient.setQueryData(['notification', _variables.id], context.previousNotification)
      }
      toast.error(error.message)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success(variables.isPinned ? 'Notification pinned' : 'Notification unpinned')
    }
  })
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsClient.deleteNotification(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete notification')
      }
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      queryClient.removeQueries({ queryKey: ['notification', id] })
      toast.success('Notification deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete all archived notifications
 */
export function useDeleteAllArchived() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsClient.deleteAllArchived()
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete archived notifications')
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('All archived notifications deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences(
  options?: Omit<UseQueryOptions<NotificationPreferences>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await notificationsClient.getPreferences()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch preferences')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Update notification preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await notificationsClient.updatePreferences(preferences)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update preferences')
      }
      return response.data
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification-preferences'] })

      const previousPreferences = queryClient.getQueryData(['notification-preferences'])

      queryClient.setQueryData(['notification-preferences'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          ...updates,
          updated_at: new Date().toISOString()
        }
      })

      return { previousPreferences }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['notification-preferences'], context.previousPreferences)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Notification preferences updated')
    }
  })
}

/**
 * Get notification statistics
 */
export function useNotificationStats(
  options?: Omit<UseQueryOptions<NotificationStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await notificationsClient.getStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch notification stats')
      }
      return response.data
    },
    staleTime: 30000, // Stats are fresh for 30 seconds
    ...options
  })
}
