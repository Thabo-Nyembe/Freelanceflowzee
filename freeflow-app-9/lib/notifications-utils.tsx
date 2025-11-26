/**
 * Notifications System Utilities
 *
 * Comprehensive notification management with real-time updates, filtering,
 * priority system, and multi-channel delivery (email, push, SMS, in-app).
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('NotificationsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'payment'
  | 'project'
  | 'message'
  | 'system'
  | 'review'
  | 'deadline'
  | 'collaboration'
  | 'file'
  | 'invoice'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'webhook'
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted'
export type FilterType = 'all' | 'unread' | 'read' | 'archived'
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  category: string
  actionUrl?: string
  actionLabel?: string
  avatar?: string
  imageUrl?: string
  metadata?: Record<string, any>
  relatedId?: string
  relatedType?: string
  readAt?: string
  archivedAt?: string
  deletedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationPreference {
  id: string
  userId: string
  notificationType: NotificationType
  channels: NotificationChannel[]
  enabled: boolean
  soundEnabled: boolean
  showPreviews: boolean
  quietHoursStart?: string // HH:MM format
  quietHoursEnd?: string // HH:MM format
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly'
  createdAt: string
  updatedAt: string
}

export interface NotificationGroup {
  id: string
  type: NotificationType
  count: number
  latestNotification: Notification
  notifications: Notification[]
  isExpanded: boolean
}

export interface NotificationDelivery {
  id: string
  notificationId: string
  channel: NotificationChannel
  status: DeliveryStatus
  sentAt?: string
  deliveredAt?: string
  failureReason?: string
  retryCount: number
  metadata?: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  titleTemplate: string
  messageTemplate: string
  variables: string[]
  defaultPriority: NotificationPriority
  channels: NotificationChannel[]
  isActive: boolean
}

export interface NotificationStats {
  userId: string
  totalReceived: number
  totalRead: number
  totalUnread: number
  totalArchived: number
  averageReadTime: number // minutes
  mostCommonType: NotificationType
  readRate: number // percentage
  responseRate: number // percentage
  lastNotificationAt?: string
}

export interface BulkAction {
  action: 'read' | 'unread' | 'archive' | 'delete'
  notificationIds: string[]
  timestamp: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export function generateMockNotifications(count: number = 50, userId: string = 'user-1'): Notification[] {
  const types: NotificationType[] = [
    'message', 'payment', 'project', 'system', 'success', 'warning',
    'error', 'review', 'deadline', 'collaboration', 'file', 'invoice'
  ]
  const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent']
  const statuses: NotificationStatus[] = ['unread', 'read', 'archived']

  const titles = [
    'New Project Message',
    'Payment Received',
    'Project Deadline Reminder',
    'New Review Posted',
    'System Update Available',
    'Collaboration Request',
    'File Upload Complete',
    'Invoice Overdue',
    'Payment Pending',
    'Project Milestone Reached',
    'New Team Member Added',
    'Document Shared',
    'Meeting Scheduled',
    'Task Assigned',
    'Approval Required'
  ]

  const messages = [
    'Sarah Johnson sent you a message about the website redesign project.',
    'You received a payment of $2,500 from TechCorp Inc.',
    'E-commerce redesign project is due in 3 days.',
    'Mike Rodriguez left a 5-star review for your video editing work.',
    'FreeFlow platform has been updated with new features.',
    'Emma Thompson invited you to collaborate on a brand identity project.',
    'Your video files have been successfully uploaded to the cloud.',
    'Invoice #INV-2024-001 is 5 days overdue.',
    'Payment of $1,200 is pending approval.',
    'Mobile app project reached 75% completion milestone.',
    'John Doe joined your team as a designer.',
    'New document "Project Brief.pdf" was shared with you.',
    'Team standup meeting scheduled for tomorrow at 10 AM.',
    'New task "Update homepage design" was assigned to you.',
    'Your expense report requires manager approval.'
  ]

  const categories = [
    'Communication',
    'Finance',
    'Projects',
    'Reviews',
    'System',
    'Collaboration',
    'Files',
    'Team',
    'Meetings',
    'Tasks'
  ]

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    const isRead = status === 'read'

    return {
      id: `notification-${i + 1}`,
      userId,
      title: titles[i % titles.length],
      message: messages[i % messages.length],
      type,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      actionUrl: Math.random() > 0.3 ? `/dashboard/${type}` : undefined,
      actionLabel: Math.random() > 0.3 ? 'View Details' : undefined,
      avatar: Math.random() > 0.5 ? `/avatars/user-${(i % 10) + 1}.jpg` : undefined,
      imageUrl: Math.random() > 0.7 ? `/images/notification-${(i % 5) + 1}.jpg` : undefined,
      metadata: {
        sourceId: `source-${Math.floor(Math.random() * 100)}`,
        tags: ['important', 'work'].slice(0, Math.floor(Math.random() * 2) + 1)
      },
      readAt: isRead ? new Date(new Date(createdAt).getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
      archivedAt: status === 'archived' ? new Date().toISOString() : undefined,
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function generateMockNotificationPreferences(userId: string = 'user-1'): NotificationPreference[] {
  const types: NotificationType[] = [
    'message', 'payment', 'project', 'system', 'success', 'warning',
    'error', 'review', 'deadline', 'collaboration', 'file', 'invoice'
  ]

  return types.map((type) => ({
    id: `pref-${type}`,
    userId,
    notificationType: type,
    channels: getDefaultChannels(type),
    enabled: type !== 'system', // System notifications often disabled by default
    soundEnabled: ['message', 'payment', 'urgent'].includes(type),
    showPreviews: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    frequency: type === 'system' ? 'daily' : 'instant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

function getDefaultChannels(type: NotificationType): NotificationChannel[] {
  switch (type) {
    case 'message':
    case 'payment':
    case 'urgent':
      return ['in_app', 'email', 'push']
    case 'deadline':
    case 'invoice':
      return ['in_app', 'email']
    case 'system':
      return ['in_app']
    default:
      return ['in_app', 'push']
  }
}

export function generateMockNotificationTemplates(count: number = 15): NotificationTemplate[] {
  const templates = [
    {
      name: 'Payment Received',
      type: 'payment' as NotificationType,
      titleTemplate: 'Payment Received: {{amount}}',
      messageTemplate: 'You received a payment of {{amount}} from {{clientName}}.',
      variables: ['amount', 'clientName'],
      channels: ['in_app', 'email', 'push'] as NotificationChannel[]
    },
    {
      name: 'Project Deadline',
      type: 'deadline' as NotificationType,
      titleTemplate: 'Project Deadline: {{projectName}}',
      messageTemplate: '{{projectName}} is due in {{daysRemaining}} days.',
      variables: ['projectName', 'daysRemaining'],
      channels: ['in_app', 'email'] as NotificationChannel[]
    },
    {
      name: 'New Message',
      type: 'message' as NotificationType,
      titleTemplate: 'New Message from {{senderName}}',
      messageTemplate: '{{senderName}}: {{messagePreview}}',
      variables: ['senderName', 'messagePreview'],
      channels: ['in_app', 'push'] as NotificationChannel[]
    },
    {
      name: 'Invoice Overdue',
      type: 'invoice' as NotificationType,
      titleTemplate: 'Invoice Overdue: {{invoiceNumber}}',
      messageTemplate: 'Invoice {{invoiceNumber}} is {{daysOverdue}} days overdue.',
      variables: ['invoiceNumber', 'daysOverdue'],
      channels: ['in_app', 'email'] as NotificationChannel[]
    },
    {
      name: 'Collaboration Request',
      type: 'collaboration' as NotificationType,
      titleTemplate: 'Collaboration Request from {{userName}}',
      messageTemplate: '{{userName}} invited you to collaborate on {{projectName}}.',
      variables: ['userName', 'projectName'],
      channels: ['in_app', 'email'] as NotificationChannel[]
    }
  ]

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length]
    return {
      id: `template-${i + 1}`,
      name: template.name,
      type: template.type,
      titleTemplate: template.titleTemplate,
      messageTemplate: template.messageTemplate,
      variables: template.variables,
      defaultPriority: 'medium' as NotificationPriority,
      channels: template.channels,
      isActive: Math.random() > 0.1
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function groupNotificationsByType(notifications: Notification[]): NotificationGroup[] {
  const groups = new Map<NotificationType, Notification[]>()

  notifications.forEach(notification => {
    const existing = groups.get(notification.type) || []
    groups.set(notification.type, [...existing, notification])
  })

  return Array.from(groups.entries()).map(([type, notifs]) => ({
    id: `group-${type}`,
    type,
    count: notifs.length,
    latestNotification: notifs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0],
    notifications: notifs,
    isExpanded: false
  }))
}

export function filterNotifications(
  notifications: Notification[],
  filter: FilterType,
  searchQuery?: string
): Notification[] {
  let filtered = notifications

  // Apply status filter
  switch (filter) {
    case 'unread':
      filtered = filtered.filter(n => n.status === 'unread')
      break
    case 'read':
      filtered = filtered.filter(n => n.status === 'read')
      break
    case 'archived':
      filtered = filtered.filter(n => n.status === 'archived')
      break
    case 'all':
    default:
      filtered = filtered.filter(n => n.status !== 'deleted')
      break
  }

  // Apply search query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query) ||
      n.category.toLowerCase().includes(query)
    )
  }

  return filtered
}

export function sortNotifications(
  notifications: Notification[],
  sortBy: 'date' | 'priority' | 'type' = 'date'
): Notification[] {
  const sorted = [...notifications]

  switch (sortBy) {
    case 'priority':
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    case 'type':
      return sorted.sort((a, b) => a.type.localeCompare(b.type))

    case 'date':
    default:
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

export function formatNotificationTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return time.toLocaleDateString()
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    message: '💬',
    payment: '💰',
    project: '📁',
    system: '⚙️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    review: '⭐',
    deadline: '⏰',
    collaboration: '🤝',
    file: '📄',
    invoice: '🧾',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}

export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    urgent: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'green'
  }
  return colors[priority]
}

export function getTypeColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    message: 'blue',
    payment: 'green',
    project: 'purple',
    system: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    review: 'yellow',
    deadline: 'orange',
    collaboration: 'cyan',
    file: 'indigo',
    invoice: 'pink',
    info: 'blue'
  }
  return colors[type] || 'gray'
}

export function calculateNotificationStats(notifications: Notification[]): NotificationStats {
  const total = notifications.length
  const read = notifications.filter(n => n.status === 'read').length
  const unread = notifications.filter(n => n.status === 'unread').length
  const archived = notifications.filter(n => n.status === 'archived').length

  const typeCounts = new Map<NotificationType, number>()
  notifications.forEach(n => {
    typeCounts.set(n.type, (typeCounts.get(n.type) || 0) + 1)
  })

  const mostCommonType = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'info'

  const readNotifications = notifications.filter(n => n.readAt)
  const avgReadTime = readNotifications.length > 0
    ? readNotifications.reduce((sum, n) => {
        const created = new Date(n.createdAt).getTime()
        const read = n.readAt ? new Date(n.readAt).getTime() : created
        return sum + (read - created)
      }, 0) / readNotifications.length / (1000 * 60)
    : 0

  const lastNotification = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  return {
    userId: notifications[0]?.userId || 'unknown',
    totalReceived: total,
    totalRead: read,
    totalUnread: unread,
    totalArchived: archived,
    averageReadTime: Math.round(avgReadTime),
    mostCommonType,
    readRate: total > 0 ? Math.round((read / total) * 100) : 0,
    responseRate: total > 0 ? Math.round((read / total) * 100) : 0,
    lastNotificationAt: lastNotification?.createdAt
  }
}

export function isInQuietHours(preference: NotificationPreference): boolean {
  if (!preference.quietHoursStart || !preference.quietHoursEnd) return false

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const [startHour, startMin] = preference.quietHoursStart.split(':').map(Number)
  const [endHour, endMin] = preference.quietHoursEnd.split(':').map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime < endTime
  }
}

export function shouldSendNotification(
  notification: Notification,
  preference: NotificationPreference,
  channel: NotificationChannel
): boolean {
  if (!preference.enabled) return false
  if (!preference.channels.includes(channel)) return false
  if (channel !== 'in_app' && isInQuietHours(preference)) return false

  return true
}

export function batchNotifications(notifications: Notification[], batchSize: number = 10): Notification[][] {
  const batches: Notification[][] = []
  for (let i = 0; i < notifications.length; i += batchSize) {
    batches.push(notifications.slice(i, i + batchSize))
  }
  return batches
}

export function renderNotificationTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>
): { title: string; message: string } {
  let title = template.titleTemplate
  let message = template.messageTemplate

  template.variables.forEach(variable => {
    const value = variables[variable] || `[${variable}]`
    title = title.replace(`{{${variable}}}`, value)
    message = message.replace(`{{${variable}}}`, value)
  })

  return { title, message }
}

logger.info('Notifications utilities initialized', {
  notificationTypes: 13,
  mockDataGenerators: 3,
  utilityFunctions: 15
})
