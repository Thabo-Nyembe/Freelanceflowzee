'use client'

import { useEffect, useCallback, useState } from 'react'
import { Bell, Check, CheckCheck, X, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotifications, type Notification, type NotificationType, type NotificationPriority } from '@/lib/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

// Icon mapping for notification types
const notificationTypeIcons: Record<NotificationType, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'alert-circle',
  system: 'settings',
  user: 'user',
  task: 'check-square',
  message: 'message-circle',
  reminder: 'clock',
  alert: 'bell'
}

// Color mapping for notification types
const notificationTypeColors: Record<NotificationType, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  system: 'bg-gray-500',
  user: 'bg-purple-500',
  task: 'bg-indigo-500',
  message: 'bg-cyan-500',
  reminder: 'bg-orange-500',
  alert: 'bg-pink-500'
}

// Priority indicators
const priorityStyles: Record<NotificationPriority, string> = {
  low: 'border-l-gray-300',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
  critical: 'border-l-red-700 animate-pulse'
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onClose: () => void
}

function NotificationItem({ notification, onMarkAsRead, onDismiss, onClose }: NotificationItemProps) {
  const handleClick = useCallback(() => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    if (notification.action_url) {
      window.open(notification.action_url, '_blank')
      onClose()
    }
  }, [notification, onMarkAsRead, onClose])

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(notification.id)
  }, [notification.id, onDismiss])

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors border-l-4',
        !notification.is_read && 'bg-accent/30',
        priorityStyles[notification.priority]
      )}
      onClick={handleClick}
    >
      {/* Notification type indicator */}
      <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', notificationTypeColors[notification.notification_type])} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium line-clamp-1', !notification.is_read && 'font-semibold')}>
            {notification.title}
          </p>
          {notification.priority === 'urgent' || notification.priority === 'critical' ? (
            <Badge variant="destructive" className="text-[10px] px-1 py-0 flex-shrink-0">
              {notification.priority}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          {notification.action_url && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:text-destructive"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  )
}

interface NotificationBellProps {
  className?: string
  maxNotifications?: number
  showToastOnNew?: boolean
}

export function NotificationBell({
  className,
  maxNotifications = 50,
  showToastOnNew = true
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [shownToasts, setShownToasts] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Cleanup old shown toasts every 5 minutes to prevent memory leak
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setShownToasts(new Set()) // Clear all tracked toasts
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(cleanupInterval)
  }, [])

  // Handler for new notifications - shows toast (with deduplication)
  const handleNewNotification = useCallback((notification: Notification) => {
    if (!showToastOnNew || notification.is_silent) return

    // Deduplicate - only show toast once per notification ID
    if (shownToasts.has(notification.id)) {
      return
    }

    // Mark as shown
    setShownToasts(prev => new Set(prev).add(notification.id))

    // Map notification type to toast type
    const toastFn = notification.notification_type === 'error' ? toast.error
      : notification.notification_type === 'warning' ? toast.warning
      : notification.notification_type === 'success' ? toast.success
      : toast.info

    toastFn(notification.title, {
      description: notification.message,
      action: notification.action_url ? {
        label: notification.action_label || 'View',
        onClick: () => window.open(notification.action_url!, '_blank')
      } : undefined,
      duration: notification.priority === 'critical' || notification.priority === 'urgent' ? 10000 : 5000
    })
  }, [showToastOnNew, shownToasts])

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification
  } = useNotifications({
    realtime: true,
    limit: maxNotifications,
    onNewNotification: handleNewNotification
  })

  // Removed duplicate Supabase subscription - notifications handled by useNotifications hook with onNewNotification callback

  const handleMarkAllAsRead = useCallback(async () => {
    const success = await markAllAsRead()
    if (success) {
      toast.success('All notifications marked as read')
    }
  }, [markAllAsRead])

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id)
  }, [markAsRead])

  const handleDismiss = useCallback(async (id: string) => {
    await dismissNotification(id)
  }, [dismissNotification])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  // Filter out dismissed notifications for display
  const visibleNotifications = notifications.filter(n => !n.is_dismissed)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                  onClose={handleClose}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {visibleNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs h-8"
                onClick={handleClose}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
