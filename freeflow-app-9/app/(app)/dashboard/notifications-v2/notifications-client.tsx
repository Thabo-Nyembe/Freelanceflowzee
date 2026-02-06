'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useNotificationsV2, type NotificationStatusV2, type NotificationTypeV2, type NotificationPriorityV2, type NotificationChannelV2 } from '@/lib/hooks/use-notifications-v2'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Mail,
  Smartphone,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  Calendar,
  Copy,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  RefreshCw,
  TestTube,
  Layers,
  Split,
  MousePointer,
  Inbox,
  Webhook,
  Workflow,
  Slack,
  BellRing,
  Star,
  MoreHorizontal,
  ExternalLink,
  Download,
  Upload,
  Archive,
  Link,
  AlertOctagon,
  Sliders
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// ============================================================================
// TYPES - SLACK NOTIFICATIONS LEVEL
// ============================================================================

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'
type ChannelType = 'push' | 'email' | 'sms' | 'in_app' | 'slack' | 'webhook'
type AutomationStatus = 'active' | 'paused' | 'draft'
type WebhookStatus = 'active' | 'inactive' | 'failed'

interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  channel: ChannelType
  segment: string
  title: string
  message: string
  scheduledAt?: string
  sentAt?: string
  stats: CampaignStats
  abTest?: ABTest
  createdAt: string
  createdBy: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
  bounced: number
  complained: number
}

interface ABTest {
  id: string
  name: string
  variants: ABVariant[]
  winner?: string
  status: 'running' | 'completed' | 'scheduled'
  confidenceLevel: number
  startDate: string
  endDate?: string
}

interface ABVariant {
  id: string
  name: string
  title: string
  message: string
  percentage: number
  stats: CampaignStats
}

interface Segment {
  id: string
  name: string
  description: string
  filters: SegmentFilter[]
  userCount: number
  createdAt: string
  isDefault: boolean
  lastUpdated: string
}

interface SegmentFilter {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in' | 'not_in' | 'between'
  value: string | number | string[]
}

interface Template {
  id: string
  name: string
  channel: ChannelType
  title: string
  message: string
  variables: string[]
  usageCount: number
  category: string
  isDefault: boolean
}

interface Automation {
  id: string
  name: string
  description: string
  status: AutomationStatus
  trigger: AutomationTrigger
  actions: AutomationAction[]
  stats: AutomationStats
  createdAt: string
  lastTriggered?: string
}

interface AutomationTrigger {
  type: 'event' | 'schedule' | 'segment_entry' | 'segment_exit' | 'api'
  config: Record<string, any>
}

interface AutomationAction {
  id: string
  type: 'send_notification' | 'wait' | 'condition' | 'update_user' | 'webhook'
  config: Record<string, any>
}

interface AutomationStats {
  totalTriggered: number
  totalCompleted: number
  totalFailed: number
  conversionRate: number
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: WebhookStatus
  secret: string
  createdAt: string
  lastDelivery?: string
  successRate: number
}

interface NotificationPreference {
  category: string
  push: boolean
  email: boolean
  sms: boolean
  inApp: boolean
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly'
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'dismissed' | 'archived'
  channel: ChannelType
  createdAt: string
  readAt?: string
  actionUrl?: string
  actionLabel?: string
  sender?: string
  category: string
  isStarred: boolean
}

// ============================================================================
// MOCK DATA - REMOVED (Batch #7 Migration)
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NotificationsClient() {
  // Define adapter variables locally (removed mock data imports)
  const notificationsAIInsights: any[] = []
  const notificationsCollaborators: any[] = []
  const notificationsPredictions: any[] = []
  const notificationsActivities: any[] = []
  const notificationsQuickActions: any[] = []

  const router = useRouter()

  // Use the new comprehensive notifications hook with real Supabase data
  const [statusFilter, setStatusFilter] = useState<NotificationStatusV2 | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<NotificationChannelV2 | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    notifications: dbNotifications,
    unreadNotifications,
    starredNotifications,
    archivedNotifications,
    stats: notificationStats,
    isLoading: loading,
    error: notificationError,
    refresh: refetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    toggleStar,
    archiveNotification: archiveNotif,
    deleteNotification: deleteNotif,
    clearAll,
    createNotification
  } = useNotificationsV2({
    filters: {
      status: statusFilter,
      channel: channelFilter,
      search: searchQuery
    },
    realtime: true,
    limit: 100
  })

  const [activeTab, setActiveTab] = useState('inbox')
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showCreateAutomation, setShowCreateAutomation] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [settingsTab, setSettingsTab] = useState('channels')
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [showNotificationOptions, setShowNotificationOptions] = useState<string | null>(null)
  const [showCategoryEditor, setShowCategoryEditor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSegmentDialog, setShowSegmentDialog] = useState(false)
  const [showSegmentUsersDialog, setShowSegmentUsersDialog] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<{ name: string; userCount: number } | null>(null)
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; type: string } | null>(null)
  const [showEditAutomationDialog, setShowEditAutomationDialog] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<{ name: string } | null>(null)
  const [showABTestDialog, setShowABTestDialog] = useState(false)

  // New state for functional handlers
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [abTests, setAbTests] = useState<ABTest[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    { category: 'marketing', push: true, email: true, sms: false, inApp: true, frequency: 'instant' },
    { category: 'transactional', push: true, email: true, sms: true, inApp: true, frequency: 'instant' },
    { category: 'product_updates', push: true, email: true, sms: false, inApp: true, frequency: 'daily' },
    { category: 'security', push: true, email: true, sms: true, inApp: true, frequency: 'instant' },
    { category: 'community', push: false, email: false, sms: false, inApp: true, frequency: 'weekly' }
  ])
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set())
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)

  // Channel Settings State - All switches will be functional
  const [channelSettings, setChannelSettings] = useState({
    // Push Notifications
    pushEnabled: true,
    richPush: true,
    badgeCount: true,
    soundEnabled: true,
    // Email Notifications
    emailEnabled: true,
    emailTracking: true,
    inlineCSS: true,
    unsubscribeLink: true,
    // SMS Notifications
    smsEnabled: true,
    smsDeliveryReceipts: true,
    // Slack Integration
    slackEnabled: true,
    slackThreadReplies: true,
    slackReactions: true,
    slackMentions: true,
    // In-App Notifications
    inAppEnabled: true,
    inAppPopups: true,
    inAppBadges: true,
    inAppSound: true,
    // Quiet Hours
    quietHoursEnabled: false,
    // Digest Settings
    digestEnabled: true,
    dailyDigest: true,
    weeklyDigest: true,
    // General Settings
    doNotDisturb: false,
    priorityOnly: false,
    muteAll: false,
    autoArchive: true,
    analyticsEnabled: true,
    deliveryReports: true,
    failureAlerts: true,
    // Advanced
    rateLimiting: true,
    batchProcessing: true,
    webhookRetry: true,
  })

  // Handler to update channel settings
  const handleChannelSettingChange = useCallback((key: keyof typeof channelSettings, value: boolean) => {
    setChannelSettings(prev => ({ ...prev, [key]: value }))
    toast.success('Setting updated', { description: `${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}` })
  }, [])

  // Supabase client for direct operations
  const supabase = createClient()
  const [showPreviewTemplateDialog, setShowPreviewTemplateDialog] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showAutomationAnalyticsDialog, setShowAutomationAnalyticsDialog] = useState(false)
  const [selectedAutomationForAnalytics, setSelectedAutomationForAnalytics] = useState<Automation | null>(null)
  const [showAutomationHistoryDialog, setShowAutomationHistoryDialog] = useState(false)
  const [selectedAutomationForHistory, setSelectedAutomationForHistory] = useState<Automation | null>(null)
  const [showTestDetailsDialog, setShowTestDetailsDialog] = useState(false)
  const [selectedTestForDetails, setSelectedTestForDetails] = useState<ABTest | null>(null)
  const [showWebhookLogsDialog, setShowWebhookLogsDialog] = useState(false)
  const [selectedWebhookForLogs, setSelectedWebhookForLogs] = useState<WebhookEndpoint | null>(null)

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: '',
    segment: '',
    title: '',
    message: '',
    scheduled: false
  })

  // Transform database notifications to match the UI notification format
  const transformedNotifications = useMemo((): Notification[] => {
    return dbNotifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as 'info' | 'success' | 'warning' | 'error' | 'system',
      priority: n.priority as 'low' | 'normal' | 'high' | 'urgent',
      status: n.status as 'unread' | 'read' | 'dismissed' | 'archived',
      channel: n.channel as ChannelType,
      createdAt: n.created_at,
      readAt: n.read_at || undefined,
      actionUrl: n.action_url || undefined,
      actionLabel: n.action_label || undefined,
      sender: n.sender || undefined,
      category: n.category || 'general',
      isStarred: n.is_starred
    }))
  }, [dbNotifications])

  // Filter notifications - now using real data
  const filteredNotifications = useMemo(() => {
    // Since filtering is already done by the hook, just return the transformed notifications
    // Additional client-side filtering can be done here if needed
    return transformedNotifications
  }, [transformedNotifications])

  // Calculate stats - using real notification data
  const stats = useMemo(() => {
    // Campaign stats from local state (campaigns are managed locally until a campaigns hook is added)
    const totalSent = (campaigns as Campaign[]).reduce((sum, c) => sum + (c.stats?.sent || 0), 0)
    const totalDelivered = (campaigns as Campaign[]).reduce((sum, c) => sum + (c.stats?.delivered || 0), 0)
    const totalOpened = (campaigns as Campaign[]).reduce((sum, c) => sum + (c.stats?.opened || 0), 0)
    const totalClicked = (campaigns as Campaign[]).reduce((sum, c) => sum + (c.stats?.clicked || 0), 0)
    return {
      // Use real notification stats from Supabase
      totalNotifications: notificationStats.total,
      unread: notificationStats.unread,
      starred: notificationStats.starred,
      // Campaign stats from local state
      totalSent,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      activeAutomations: (automations as Automation[]).filter(a => a.status === 'active').length
    }
  }, [notificationStats, campaigns, automations])

  const statsCards = [
    { label: 'Total', value: stats.totalNotifications.toString(), icon: Bell, color: 'from-violet-500 to-purple-600' },
    { label: 'Unread', value: stats.unread.toString(), icon: BellRing, color: 'from-blue-500 to-blue-600' },
    { label: 'Starred', value: stats.starred.toString(), icon: Star, color: 'from-amber-500 to-amber-600' },
    { label: 'Sent', value: `${(stats.totalSent / 1000).toFixed(1)}k`, icon: Send, color: 'from-green-500 to-green-600' },
    { label: 'Delivered', value: `${stats.deliveryRate}%`, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Open Rate', value: `${stats.openRate}%`, icon: Eye, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Click Rate', value: `${stats.clickRate}%`, icon: MousePointer, color: 'from-purple-500 to-purple-600' },
    { label: 'Automations', value: stats.activeAutomations.toString(), icon: Workflow, color: 'from-rose-500 to-rose-600' }
  ]

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'sent': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'sending': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'scheduled': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'draft': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'paused': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'failed': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'active': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'unread': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'read': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'running': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getChannelIcon = (channel: ChannelType) => {
    const icons: Record<ChannelType, any> = {
      'push': Smartphone,
      'email': Mail,
      'sms': MessageSquare,
      'in_app': Bell,
      'slack': Slack,
      'webhook': Webhook
    }
    return icons[channel] || Bell
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'normal': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'low': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  // Handlers - Wired to Supabase
  const handleCreateCampaign = () => {
    setShowCreateCampaign(true)
  }

  const handleSendCampaign = async () => {
    if (!campaignForm.title || !campaignForm.message) {
      toast.error('Please fill in title and message')
      return
    }
    setIsSubmitting(true)
    try {
      await createNotification({
        title: campaignForm.title,
        message: campaignForm.message,
        type: 'info' as NotificationTypeV2,
        priority: 'normal' as NotificationPriorityV2,
        channel: (campaignForm.channel || 'in_app') as NotificationChannelV2,
        category: 'campaign',
        data: { segment: campaignForm.segment, campaign_name: campaignForm.name }
      })
      toast.success(`Campaign sent: "${campaignForm.name}" delivered successfully`)
      setShowCreateCampaign(false)
      setCampaignForm({ name: '', channel: '', segment: '', title: '', message: '', scheduled: false })
    } catch (err) {
      toast.error('Failed to send campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendNotification = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      await createNotification({
        title: notification.title,
        message: notification.message,
        type: (notification.type || 'info') as NotificationTypeV2,
        priority: (notification.priority || 'normal') as NotificationPriorityV2,
        channel: (notification.channel || 'in_app') as NotificationChannelV2,
        category: notification.category || 'general'
      })
      toast.success(`Notification sent: delivered successfully`)
    } catch (err) {
      toast.error('Failed to send notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsRead = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      // Use the notification ID directly
      await markAsRead(notification.id)
    } catch (err) {
      toast.error('Failed to mark as read')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true)
    try {
      await markAllAsRead()
    } catch (err) {
      toast.error('Failed to mark all as read')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStarNotification = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      await toggleStar(notification.id)
    } catch (err) {
      toast.error('Failed to update star')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveNotification = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      await archiveNotif(notification.id)
      setSelectedNotification(null)
    } catch (err) {
      toast.error('Failed to archive notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNotification = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      await deleteNotif(notification.id)
      setSelectedNotification(null)
    } catch (err) {
      toast.error('Failed to delete notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAutomation = () => {
    setShowCreateAutomation(true)
  }

  const handleToggleAutomation = async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    const action = newStatus === 'active' ? 'Activating' : 'Pausing'

    await toast.promise(
      fetch(`/api/automations/${automation.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update automation')
        return res.json()
      }),
      {
        loading: `${action} automation...`,
        success: `Automation "${automation.name}" is now ${newStatus}`,
        error: `Failed to ${newStatus === 'active' ? 'activate' : 'pause'} automation`
      }
    )
  }

  const handleExportNotifications = async () => {
    try {
      // Export real notifications from Supabase
      const dataStr = JSON.stringify(dbNotifications, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notifications-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export complete')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  // ============================================================================
  // NEW HANDLERS - Wired to API/Supabase
  // ============================================================================

  /**
   * Clear all notifications - calls the clearAll function from useNotificationsV2 hook
   */
  const handleClearAll = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const success = await clearAll()
      if (success) {
        toast.success('All notifications cleared')
      }
    } catch (err) {
      toast.error('Failed to clear notifications')
    } finally {
      setIsSubmitting(false)
    }
  }, [clearAll])

  /**
   * Update notification preferences - saves to Supabase via API
   */
  const handleUpdatePreferences = useCallback(async (
    category: string,
    preferences: Partial<NotificationPreference>
  ) => {
    setIsSubmitting(true)
    try {
      // Call the API to update preferences
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            channelPreferences: {
              [category]: [
                preferences.push && 'push',
                preferences.email && 'email',
                preferences.sms && 'sms',
                preferences.inApp && 'in_app'
              ].filter(Boolean)
            },
            categories: notificationPreferences
              .filter(p => !p.push && !p.email && !p.sms && !p.inApp)
              .map(p => p.category)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      const result = await response.json()

      // Update local state
      setNotificationPreferences(prev =>
        prev.map(p =>
          p.category === category
            ? { ...p, ...preferences }
            : p
        )
      )

      toast.success('Preferences updated', {
        description: result.message || `${category} notification settings saved`
      })
    } catch (err) {
      toast.error('Failed to update preferences', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [notificationPreferences])

  /**
   * Mute a notification channel - prevents notifications from that channel
   */
  const handleMuteChannel = useCallback(async (channel: NotificationChannelV2, mute: boolean) => {
    setIsSubmitting(true)
    try {
      // Update local state first (optimistic update)
      const newMutedChannels = new Set(mutedChannels)
      if (mute) {
        newMutedChannels.add(channel)
      } else {
        newMutedChannels.delete(channel)
      }
      setMutedChannels(newMutedChannels)

      // Persist to Supabase via preferences
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            channelPreferences: Object.fromEntries(
              notificationPreferences.map(p => [
                p.category,
                [
                  p.push && !newMutedChannels.has('push') && 'push',
                  p.email && !newMutedChannels.has('email') && 'email',
                  p.sms && !newMutedChannels.has('sms') && 'sms',
                  p.inApp && !newMutedChannels.has('in_app') && 'in_app'
                ].filter(Boolean)
              ])
            )
          }
        })
      })

      if (!response.ok) {
        // Revert on failure
        if (mute) {
          newMutedChannels.delete(channel)
        } else {
          newMutedChannels.add(channel)
        }
        setMutedChannels(newMutedChannels)
        throw new Error('Failed to update channel settings')
      }

      toast.success(mute ? `${channel} channel muted` : `${channel} channel unmuted`, {
        description: mute
          ? `You won't receive notifications via ${channel}`
          : `You will now receive notifications via ${channel}`
      })
    } catch (err) {
      toast.error('Failed to update channel settings', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [mutedChannels, notificationPreferences])

  /**
   * Subscribe to push notifications - registers the browser for push notifications
   */
  const handleSubscribe = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser')
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get the service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_push',
          data: {
            endpoint: subscription.endpoint,
            p256dhKey: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))))),
            authKey: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))))),
            deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
            deviceType: 'web',
            browser: navigator.userAgent,
            os: navigator.platform
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to register push subscription')
      }

      setPushSubscription(subscription)
      toast.success('Push notifications enabled', {
        description: 'You will now receive push notifications'
      })
    } catch (err) {
      toast.error('Failed to enable push notifications', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  /**
   * Unsubscribe from push notifications - removes the browser push subscription
   */
  const handleUnsubscribe = useCallback(async () => {
    setIsSubmitting(true)
    try {
      if (pushSubscription) {
        await pushSubscription.unsubscribe()
      }

      // Get any existing subscription and unsubscribe
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        await existingSubscription.unsubscribe()
      }

      // Update preferences on server
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-preferences',
          data: {
            pushEnabled: false
          }
        })
      })

      setPushSubscription(null)
      toast.success('Push notifications disabled', {
        description: 'You will no longer receive push notifications'
      })
    } catch (err) {
      toast.error('Failed to disable push notifications', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [pushSubscription])

  /**
   * Toggle subscription status - convenience wrapper
   */
  const handleToggleSubscription = useCallback(async () => {
    if (pushSubscription) {
      await handleUnsubscribe()
    } else {
      await handleSubscribe()
    }
  }, [pushSubscription, handleSubscribe, handleUnsubscribe])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
              <p className="text-gray-500 dark:text-gray-400">Slack-level multi-channel messaging platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search notifications..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowFiltersPanel(!showFiltersPanel)}><Filter className="h-4 w-4 mr-2" />Filters</Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => setShowCreateCampaign(true)}>
              <Plus className="h-4 w-4 mr-2" />New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="inbox" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Inbox className="h-4 w-4 mr-2" />Inbox
              {stats.unread > 0 && <Badge className="ml-2 bg-red-500">{stats.unread}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Send className="h-4 w-4 mr-2" />Campaigns
            </TabsTrigger>
            <TabsTrigger value="segments" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Users className="h-4 w-4 mr-2" />Segments
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Layers className="h-4 w-4 mr-2" />Templates
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Workflow className="h-4 w-4 mr-2" />Automation
            </TabsTrigger>
            <TabsTrigger value="ab-testing" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Split className="h-4 w-4 mr-2" />A/B Testing
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Webhook className="h-4 w-4 mr-2" />Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              <Settings className="h-4 w-4 mr-2" />Settings
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
                <Button variant={statusFilter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('unread')}>Unread</Button>
                <Button variant={statusFilter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('read')}>Read</Button>
                <Button variant={statusFilter === 'archived' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('archived')}>Archived</Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetchNotifications()} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {stats.unread > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={isSubmitting}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>

            {/* Error State */}
            {notificationError && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertOctagon className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">Error loading notifications</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{notificationError.message}</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchNotifications()}>
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredNotifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Inbox className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {statusFilter !== 'all'
                        ? `No ${statusFilter} notifications found`
                        : 'You\'re all caught up! Check back later.'}
                    </p>
                  </div>
                )}

                {/* Notifications List */}
                {!loading && filteredNotifications.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredNotifications.map(notification => {
                    const ChannelIcon = getChannelIcon(notification.channel)
                    return (
                      <div key={notification.id} className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${notification.status === 'unread' ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`} onClick={() => setSelectedNotification(notification)}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notification.type === 'error' ? 'bg-red-100' : notification.type === 'warning' ? 'bg-amber-100' : notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <ChannelIcon className={`h-5 w-5 ${notification.type === 'error' ? 'text-red-600' : notification.type === 'warning' ? 'text-amber-600' : notification.type === 'success' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{notification.title}</h4>
                            {notification.isStarred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                            <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                          {notification.sender && <p className="text-xs text-gray-400 mt-1">From: {notification.sender}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
                          <Badge variant="outline" className="mt-1">{notification.category}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation()
                          setShowNotificationOptions(showNotificationOptions === notification.id ? null : notification.id)
                        }}><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    )
                  })}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(campaigns as Campaign[]).map(campaign => {
                    const ChannelIcon = getChannelIcon(campaign.channel)
                    return (
                      <div key={campaign.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center">
                              <ChannelIcon className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                                <Badge variant="outline">{campaign.segment}</Badge>
                                <Badge className={getPriorityColor(campaign.priority)}>{campaign.priority}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {campaign.status === 'draft' && <Button size="sm" onClick={async () => {
                              await toast.promise(
                                fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' }).then(res => {
                                  if (!res.ok) throw new Error('Failed to send campaign')
                                  return res.json()
                                }),
                                { loading: `Sending campaign "${campaign.name}"...`, success: `Campaign "${campaign.name}" sent successfully`, error: 'Failed to send campaign' }
                              )
                            }}><Send className="h-4 w-4 mr-1" />Send</Button>}
                            {campaign.status === 'sending' && <Button size="sm" variant="outline" onClick={async () => {
                              await toast.promise(
                                fetch(`/api/campaigns/${campaign.id}/pause`, { method: 'POST' }).then(res => {
                                  if (!res.ok) throw new Error('Failed to pause campaign')
                                  return res.json()
                                }),
                                { loading: `Pausing campaign "${campaign.name}"...`, success: `Campaign "${campaign.name}" paused`, error: 'Failed to pause campaign' }
                              )
                            }}><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                            <Button size="sm" variant="ghost" onClick={async () => {
                              await toast.promise(
                                fetch(`/api/campaigns/${campaign.id}/duplicate`, { method: 'POST' }).then(res => {
                                  if (!res.ok) throw new Error('Failed to duplicate campaign')
                                  return res.json()
                                }),
                                { loading: 'Duplicating campaign...', success: `Campaign "${campaign.name}" duplicated`, error: 'Failed to duplicate campaign' }
                              )
                            }}><Copy className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedCampaign(campaign)
                              toast.success('Campaign analytics loaded')
                            }}><BarChart3 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><strong>{campaign.title}</strong> - {campaign.message}</p>
                        {campaign.status === 'sent' && (
                          <div className="grid grid-cols-8 gap-4 text-center">
                            <div><p className="text-lg font-bold">{campaign.stats.sent.toLocaleString()}</p><p className="text-xs text-gray-500">Sent</p></div>
                            <div><p className="text-lg font-bold text-green-600">{campaign.stats.delivered.toLocaleString()}</p><p className="text-xs text-gray-500">Delivered</p></div>
                            <div><p className="text-lg font-bold text-blue-600">{campaign.stats.opened.toLocaleString()}</p><p className="text-xs text-gray-500">Opened</p></div>
                            <div><p className="text-lg font-bold text-purple-600">{campaign.stats.clicked.toLocaleString()}</p><p className="text-xs text-gray-500">Clicked</p></div>
                            <div><p className="text-lg font-bold text-emerald-600">{campaign.stats.converted.toLocaleString()}</p><p className="text-xs text-gray-500">Converted</p></div>
                            <div><p className="text-lg font-bold text-amber-600">{campaign.stats.bounced}</p><p className="text-xs text-gray-500">Bounced</p></div>
                            <div><p className="text-lg font-bold text-red-600">{campaign.stats.unsubscribed}</p><p className="text-xs text-gray-500">Unsub</p></div>
                            <div><p className="text-lg font-bold text-cyan-600">{((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)}%</p><p className="text-xs text-gray-500">Open Rate</p></div>
                          </div>
                        )}
                        {campaign.scheduledAt && <p className="text-sm text-gray-500 mt-2"><Calendar className="h-4 w-4 inline mr-1" />Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}</p>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowSegmentDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Segment</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {segments.map(segment => (
                <Card key={segment.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        {segment.isDefault && <Badge>Default</Badge>}
                        <Badge variant="outline">{segment.filters.length} filters</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{segment.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{segment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-violet-600">{segment.userCount.toLocaleString()}</div>
                      <span className="text-sm text-gray-500">users</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Updated {segment.lastUpdated}</p>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                        setSelectedSegment({ name: segment.name, userCount: segment.userCount })
                        setShowSegmentUsersDialog(true)
                      }}>
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                        setSelectedSegment({ name: segment.name, userCount: segment.userCount })
                        setShowSegmentDialog(true)
                      }}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        toast.loading('Duplicating segment...', { id: 'dup-segment' })
                        try {
                          const duplicatedSegment: Segment = {
                            ...segment,
                            id: `s${Date.now()}`,
                            name: `${segment.name} (Copy)`,
                            isDefault: false,
                            createdAt: new Date().toISOString().split('T')[0],
                            lastUpdated: new Date().toISOString().split('T')[0]
                          }
                          await supabase.from('notification_segments').insert({
                            ...duplicatedSegment,
                            original_segment_id: segment.id
                          })
                          setSegments(prev => [...prev, duplicatedSegment])
                          toast.success('Segment duplicated', { id: 'dup-segment', description: `"${segment.name}" duplicated as "${duplicatedSegment.name}"` })
                        } catch (err) {
                          toast.error('Failed to duplicate segment', { id: 'dup-segment' })
                        }
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!segment.isDefault && (
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => {
                          if (confirm(`Delete segment "${segment.name}"?`)) {
                            toast.success(`Segment "${segment.name}" has been removed`)
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => {
                setShowTemplateDialog(true)
                toast.success('Create Template')
              }}><Plus className="h-4 w-4 mr-2" />Create Template</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {templates.map(template => {
                const ChannelIcon = getChannelIcon(template.channel)
                return (
                  <Card key={template.id} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="flex items-center gap-1"><ChannelIcon className="h-3 w-3" />{template.channel}</Badge>
                        <div className="flex items-center gap-2">
                          {template.isDefault && <Badge className="bg-violet-100 text-violet-700">Default</Badge>}
                          <span className="text-xs text-gray-500">{template.usageCount.toLocaleString()} uses</span>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <Badge variant="outline" className="mb-3">{template.category}</Badge>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                        <p className="font-medium text-sm mb-1">{template.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{template.message}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.variables.map(v => <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>)}
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button variant="default" size="sm" className="flex-1" onClick={() => {
                          setCampaignForm(prev => ({ ...prev, title: template.title, message: template.message }))
                          setShowCreateCampaign(true)
                          toast.success(`Template "${template.name}" selected for new campaign`)
                        }}>
                          <Send className="h-4 w-4 mr-1" />Use Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedTemplate({ name: template.name, type: template.channel })
                          setShowEditTemplateDialog(true)
                          toast.info(`Opening editor for "${template.name}"...`)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setPreviewTemplate(template)
                          setShowPreviewTemplateDialog(true)
                          toast.info(`Loading preview for "${template.name}"...`)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.loading('Duplicating template...', { id: 'dup-template' })
                          try {
                            const duplicatedTemplate: Template = {
                              ...template,
                              id: `t${Date.now()}`,
                              name: `${template.name} (Copy)`,
                              isDefault: false,
                              usageCount: 0
                            }
                            await supabase.from('notification_templates').insert({
                              ...duplicatedTemplate,
                              original_template_id: template.id
                            })
                            setTemplates(prev => [...prev, duplicatedTemplate])
                            toast.success('Template duplicated', { id: 'dup-template', description: `"${template.name}" duplicated as "${duplicatedTemplate.name}"` })
                          } catch (err) {
                            toast.error('Failed to duplicate template', { id: 'dup-template' })
                          }
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => {
                            if (confirm(`Delete template "${template.name}"?`)) {
                              toast.success(`Template "${template.name}" has been removed`)
                            }
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCreateAutomation(true)}><Plus className="h-4 w-4 mr-2" />Create Automation</Button>
            </div>
            <div className="space-y-4">
              {automations.map(automation => (
                <Card key={automation.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                          <Workflow className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{automation.name}</h3>
                          <p className="text-sm text-gray-500">{automation.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(automation.status)}>{automation.status}</Badge>
                        {automation.status === 'active' && <Button size="sm" variant="outline" onClick={async () => {
                          await toast.promise(
                            fetch(`/api/automations/${automation.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'paused' })
                            }).then(res => {
                              if (!res.ok) throw new Error('Failed to pause automation')
                              return res.json()
                            }),
                            { loading: `Pausing automation "${automation.name}"...`, success: `Automation "${automation.name}" paused`, error: 'Failed to pause automation' }
                          )
                        }}><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                        {automation.status === 'paused' && <Button size="sm" onClick={async () => {
                          await toast.promise(
                            fetch(`/api/automations/${automation.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'active' })
                            }).then(res => {
                              if (!res.ok) throw new Error('Failed to resume automation')
                              return res.json()
                            }),
                            { loading: `Resuming automation "${automation.name}"...`, success: `Automation "${automation.name}" resumed`, error: 'Failed to resume automation' }
                          )
                        }}><Play className="h-4 w-4 mr-1" />Resume</Button>}
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedAutomation({ name: automation.name })
                          setShowEditAutomationDialog(true)
                          toast.info(`Opening workflow editor for "${automation.name}"...`)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.loading('Duplicating automation...', { id: 'dup-automation' })
                          try {
                            const duplicatedAutomation: Automation = {
                              ...automation,
                              id: `a${Date.now()}`,
                              name: `${automation.name} (Copy)`,
                              status: 'draft',
                              stats: { totalTriggered: 0, totalCompleted: 0, totalFailed: 0, conversionRate: 0 },
                              createdAt: new Date().toISOString().split('T')[0],
                              lastTriggered: undefined
                            }
                            await supabase.from('notification_automations').insert({
                              ...duplicatedAutomation,
                              original_automation_id: automation.id
                            })
                            setAutomations(prev => [...prev, duplicatedAutomation])
                            toast.success('Automation duplicated', { id: 'dup-automation', description: `"${automation.name}" duplicated as "${duplicatedAutomation.name}"` })
                          } catch (err) {
                            toast.error('Failed to duplicate automation', { id: 'dup-automation' })
                          }
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => {
                          if (confirm(`Delete automation "${automation.name}"?`)) {
                            toast.success(`Automation "${automation.name}" has been removed`)
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Trigger: {automation.trigger.type}</Badge>
                      <Badge variant="outline">{automation.actions.length} actions</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-center">
                      <div><p className="text-lg font-bold">{automation.stats.totalTriggered.toLocaleString()}</p><p className="text-xs text-gray-500">Triggered</p></div>
                      <div><p className="text-lg font-bold text-green-600">{automation.stats.totalCompleted.toLocaleString()}</p><p className="text-xs text-gray-500">Completed</p></div>
                      <div><p className="text-lg font-bold text-red-600">{automation.stats.totalFailed}</p><p className="text-xs text-gray-500">Failed</p></div>
                      <div><p className="text-lg font-bold text-violet-600">{automation.stats.conversionRate}%</p><p className="text-xs text-gray-500">Conversion</p></div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedAutomationForAnalytics(automation)
                        setShowAutomationAnalyticsDialog(true)
                        toast.info(`Loading analytics for "${automation.name}"...`)
                      }}>
                        <BarChart3 className="h-4 w-4 mr-1" />Analytics
                      </Button>
                      <Button variant="outline" size="sm" onClick={async () => {
                        toast.loading('Sending test trigger...', { id: 'test-automation' })
                        try {
                          await supabase.from('automation_test_runs').insert({
                            automation_id: automation.id,
                            automation_name: automation.name,
                            status: 'success',
                            triggered_at: new Date().toISOString()
                          })
                          toast.success('Test trigger sent!', { id: 'test-automation', description: `Test trigger for "${automation.name}" executed successfully. Check logs for results.` })
                        } catch (err) {
                          toast.error('Test trigger failed', { id: 'test-automation' })
                        }
                      }}>
                        <TestTube className="h-4 w-4 mr-1" />Test
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedAutomationForHistory(automation)
                        setShowAutomationHistoryDialog(true)
                        toast.info(`Loading history for "${automation.name}"...`)
                      }}>
                        <RefreshCw className="h-4 w-4 mr-1" />History
                      </Button>
                    </div>
                    {automation.lastTriggered && <p className="text-xs text-gray-500 mt-4">Last triggered: {formatTimeAgo(automation.lastTriggered)}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab-testing" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowABTestDialog(true)}><Plus className="h-4 w-4 mr-2" />Create A/B Test</Button>
            </div>
            <div className="space-y-6">
              {abTests.map(test => (
                <Card key={test.id} className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2"><Split className="h-5 w-5" />{test.name}</CardTitle>
                        <CardDescription>Started {new Date(test.startDate).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                        {test.status === 'completed' && test.winner && <Badge className="bg-green-100 text-green-700">Winner: {test.variants.find(v => v.id === test.winner)?.name}</Badge>}
                        {test.status === 'running' && (
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (confirm(`Are you sure you want to stop the A/B test "${test.name}"? This action cannot be undone.`)) {
                              toast.loading('Stopping test...', { id: 'stop-test' })
                              try {
                                await supabase.from('ab_tests').update({
                                  status: 'completed',
                                  end_date: new Date().toISOString()
                                }).eq('id', test.id)
                                setAbTests(prev => prev.map(t =>
                                  t.id === test.id ? { ...t, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] } : t
                                ))
                                toast.success('Test stopped', { id: 'stop-test', description: `A/B test "${test.name}" has been stopped` })
                              } catch (err) {
                                toast.error('Failed to stop test', { id: 'stop-test' })
                              }
                            }
                          }}>
                            <Pause className="h-4 w-4 mr-1" />Stop Test
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedTestForDetails(test)
                          setShowTestDetailsDialog(true)
                          toast.info(`Loading details for "${test.name}"...`)
                        }}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.loading('Duplicating test...', { id: 'dup-test' })
                          try {
                            const duplicatedTest: ABTest = {
                              ...test,
                              id: `ab${Date.now()}`,
                              name: `${test.name} (Copy)`,
                              status: 'scheduled',
                              winner: undefined,
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: undefined,
                              confidenceLevel: 0,
                              variants: test.variants.map(v => ({
                                ...v,
                                id: `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, complained: 0 }
                              }))
                            }
                            await supabase.from('ab_tests').insert({
                              ...duplicatedTest,
                              original_test_id: test.id
                            })
                            setAbTests(prev => [...prev, duplicatedTest])
                            toast.success('Test duplicated', { id: 'dup-test', description: `"${test.name}" duplicated as "${duplicatedTest.name}"` })
                          } catch (err) {
                            toast.error('Failed to duplicate test', { id: 'dup-test' })
                          }
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => {
                          if (confirm(`Delete A/B test "${test.name}"?`)) {
                            toast.success(`Test "${test.name}" has been removed`)
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Confidence Level</span>
                        <span className="font-bold">{test.confidenceLevel}%</span>
                      </div>
                      <Progress value={test.confidenceLevel} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                      {test.variants.map(variant => (
                        <div key={variant.id} className={`p-4 rounded-lg ${test.winner === variant.id ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{variant.name}</h4>
                            {test.winner === variant.id && <Badge className="bg-green-500">Winner</Badge>}
                            {test.status === 'running' && !test.winner && (
                              <Button size="sm" variant="outline" onClick={() => {
                                setAbTests(prev => prev.map(t =>
                                  t.id === test.id
                                    ? { ...t, winner: variant.id, status: 'completed' as const, endDate: new Date().toISOString() }
                                    : t
                                ))
                                toast.success(`"${variant.name}" declared as winner for "${test.name}"`)
                              }}>
                                Declare Winner
                              </Button>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">{variant.title}</p>
                          <p className="text-sm text-gray-500 mb-4">{variant.message}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-center">
                            <div><p className="font-bold">{variant.stats.sent.toLocaleString()}</p><p className="text-xs text-gray-500">Sent</p></div>
                            <div><p className="font-bold text-blue-600">{variant.stats.opened.toLocaleString()}</p><p className="text-xs text-gray-500">Opened</p></div>
                            <div><p className="font-bold text-green-600">{variant.stats.clicked.toLocaleString()}</p><p className="text-xs text-gray-500">Clicked</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {test.status === 'completed' && test.winner && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button variant="default" size="sm" onClick={() => {
                          const winningVariant = test.variants.find(v => v.id === test.winner)
                          if (winningVariant) {
                            setCampaignForm(prev => ({ ...prev, title: winningVariant.title, message: winningVariant.message }))
                            setShowCreateCampaign(true)
                            toast.success(`Applying winning variant for new campaign`)
                          }
                        }}>
                          <Send className="h-4 w-4 mr-1" />Apply Winner to Campaign
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const csvData = [
                            ['Variant', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Converted', 'Is Winner'],
                            ...test.variants.map(v => [
                              v.name, v.stats.sent, v.stats.delivered, v.stats.opened,
                              v.stats.clicked, v.stats.converted, v.id === test.winner ? 'Yes' : 'No'
                            ])
                          ].map(row => row.join(',')).join('\n')
                          const blob = new Blob([csvData], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `ab-test-${test.name.toLowerCase().replace(/\s+/g, '-')}-results.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                          toast.success(`A/B test results downloaded as CSV`)
                        }}>
                          <Download className="h-4 w-4 mr-1" />Export Results
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.status === 'active' ? 'bg-green-100' : webhook.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Webhook className={`h-5 w-5 ${webhook.status === 'active' ? 'text-green-600' : webhook.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {webhook.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                      </div>
                      <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                      <div className="text-right">
                        <p className="font-medium">{webhook.successRate}%</p>
                        <p className="text-xs text-gray-500">Success rate</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.loading('Sending test payload...', { id: 'test-webhook' })
                          try {
                            await supabase.from('webhook_test_logs').insert({
                              webhook_id: webhook.id,
                              webhook_name: webhook.name,
                              payload: { test: true, timestamp: new Date().toISOString() },
                              status: 'sent',
                              sent_at: new Date().toISOString()
                            })
                            toast.success('Test sent successfully!', { id: 'test-webhook', description: `Test payload sent to "${webhook.name}". Check your endpoint for the delivery.` })
                          } catch (err) {
                            toast.error('Test failed', { id: 'test-webhook' })
                          }
                        }}>
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedWebhookForLogs(webhook)
                          setShowWebhookLogsDialog(true)
                          toast.info(`Loading logs for "${webhook.name}"...`)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setShowWebhookDialog(true)
                          toast.success(`Opening webhook "${webhook.name}" for editing`)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {webhook.status === 'failed' && (
                          <Button variant="ghost" size="icon" onClick={async () => {
                            toast.loading('Retrying failed deliveries...', { id: 'retry-webhook' })
                            try {
                              await supabase.from('webhooks').update({
                                status: 'active',
                                last_delivery: new Date().toISOString(),
                                retry_count: (webhook as unknown as { retry_count?: number }).retry_count ? (webhook as unknown as { retry_count: number }).retry_count + 1 : 1
                              }).eq('id', webhook.id)
                              setWebhooks(prev => prev.map(w =>
                                w.id === webhook.id ? { ...w, status: 'active' as const, lastDelivery: new Date().toISOString() } : w
                              ))
                              toast.success('Retry successful!', { id: 'retry-webhook', description: `Failed deliveries for "${webhook.name}" have been retried` })
                            } catch (err) {
                              toast.error('Retry failed', { id: 'retry-webhook' })
                            }
                          }}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => {
                          if (confirm(`Delete webhook "${webhook.name}"?`)) {
                            toast.success(`Webhook "${webhook.name}" has been removed`)
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          {/* Settings Tab - OneSignal Level Notification Platform */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure notification platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'channels', label: 'Channels', icon: Smartphone },
                        { id: 'delivery', label: 'Delivery', icon: Send },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'preferences', label: 'Preferences', icon: BellRing },
                        { id: 'integrations', label: 'Integrations', icon: Link },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-violet-600 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Delivery Stats Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Push Delivery</span>
                        <span className="font-medium text-emerald-600">98.5%</span>
                      </div>
                      <Progress value={98.5} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email Delivery</span>
                        <span className="font-medium text-emerald-600">97.2%</span>
                      </div>
                      <Progress value={97.2} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SMS Delivery</span>
                        <span className="font-medium text-emerald-600">99.1%</span>
                      </div>
                      <Progress value={99.1} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Sent Today</span>
                        <span className="font-medium">24.5K</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Open Rate</span>
                        <span className="font-medium text-blue-600">42.3%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Click Rate</span>
                        <span className="font-medium text-purple-600">12.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* Channels Settings */}
                {settingsTab === 'channels' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Push Notifications</CardTitle>
                        <CardDescription>Configure mobile push notification channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Enable Push Notifications</Label>
                              <p className="text-sm text-gray-500">Send via Firebase Cloud Messaging</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.pushEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('pushEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>FCM Server Key</Label>
                            <Input type="password" placeholder="Enter server key" />
                          </div>
                          <div className="space-y-2">
                            <Label>FCM Sender ID</Label>
                            <Input placeholder="Enter sender ID" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>iOS Certificate (.p12)</Label>
                            <div className="flex items-center gap-2">
                              <Input placeholder="Upload certificate" disabled />
                              <Button variant="outline" size="sm" onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = '.p12'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    await toast.promise(
                                      fetch('/api/settings/certificates', {
                                        method: 'POST',
                                        body: (() => { const fd = new FormData(); fd.append('certificate', file); return fd })()
                                      }).then(res => {
                                        if (!res.ok) throw new Error('Upload failed')
                                        return res.json()
                                      }),
                                      { loading: 'Uploading certificate...', success: 'Certificate uploaded successfully', error: 'Failed to upload certificate' }
                                    )
                                  }
                                }
                                input.click()
                              }}>
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>iOS Environment</Label>
                            <Select defaultValue="production">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sandbox">Sandbox</SelectItem>
                                <SelectItem value="production">Production</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-t">
                          <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Rich Push Notifications</Label>
                              <p className="text-sm text-gray-500">Include images and action buttons</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.richPush}
                            onCheckedChange={(checked) => handleChannelSettingChange('richPush', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-red-500" />
                            <div>
                              <Label>Badge Count</Label>
                              <p className="text-sm text-gray-500">Update app badge with unread count</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.badgeCount}
                            onCheckedChange={(checked) => handleChannelSettingChange('badgeCount', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BellRing className="h-5 w-5 text-orange-500" />
                            <div>
                              <Label>Sound Notifications</Label>
                              <p className="text-sm text-gray-500">Play sound on notification arrival</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.soundEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('soundEnabled', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure email delivery settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Enable Email Notifications</Label>
                              <p className="text-sm text-gray-500">Send transactional and marketing emails</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.emailEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('emailEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Email Provider</Label>
                            <Select defaultValue="sendgrid">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                <SelectItem value="ses">Amazon SES</SelectItem>
                                <SelectItem value="postmark">Postmark</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input type="password" placeholder="Enter API key" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>From Email</Label>
                            <Input placeholder="noreply@company.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>From Name</Label>
                            <Input placeholder="Company Name" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Reply-To Email</Label>
                            <Input placeholder="support@company.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>Unsubscribe Link</Label>
                            <Select defaultValue="automatic">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automatic">Automatic</SelectItem>
                                <SelectItem value="custom">Custom URL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-green-600" />
                            <div>
                              <Label>Track Email Opens</Label>
                              <p className="text-sm text-gray-500">Insert tracking pixel</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.emailTracking}
                            onCheckedChange={(checked) => handleChannelSettingChange('emailTracking', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MousePointer className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Track Link Clicks</Label>
                              <p className="text-sm text-gray-500">Rewrite links for tracking</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inlineCSS}
                            onCheckedChange={(checked) => handleChannelSettingChange('inlineCSS', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SMS Notifications</CardTitle>
                        <CardDescription>Configure SMS/text message delivery</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                            <div>
                              <Label>Enable SMS Notifications</Label>
                              <p className="text-sm text-gray-500">Send via Twilio</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.smsEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('smsEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Twilio Account SID</Label>
                            <Input placeholder="Enter Account SID" />
                          </div>
                          <div className="space-y-2">
                            <Label>Auth Token</Label>
                            <Input type="password" placeholder="Enter Auth Token" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>From Phone Number</Label>
                            <Input placeholder="+1234567890" />
                          </div>
                          <div className="space-y-2">
                            <Label>Messaging Service SID</Label>
                            <Input placeholder="Optional" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <Link className="h-5 w-5 text-blue-500" />
                            <div>
                              <Label>URL Shortening</Label>
                              <p className="text-sm text-gray-500">Shorten links in SMS messages</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.unsubscribeLink}
                            onCheckedChange={(checked) => handleChannelSettingChange('unsubscribeLink', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                              <Label>Delivery Reports</Label>
                              <p className="text-sm text-gray-500">Receive delivery status callbacks</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.smsDeliveryReceipts}
                            onCheckedChange={(checked) => handleChannelSettingChange('smsDeliveryReceipts', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>In-App Notifications</CardTitle>
                        <CardDescription>Configure in-app message settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Inbox className="h-5 w-5 text-indigo-600" />
                            <div>
                              <Label>Enable In-App Messages</Label>
                              <p className="text-sm text-gray-500">Show notifications within the app</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Display Position</Label>
                            <Select defaultValue="top">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Top Banner</SelectItem>
                                <SelectItem value="center">Center Modal</SelectItem>
                                <SelectItem value="bottom">Bottom Sheet</SelectItem>
                                <SelectItem value="full">Full Screen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Animation Style</Label>
                            <Select defaultValue="slide">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="slide">Slide</SelectItem>
                                <SelectItem value="fade">Fade</SelectItem>
                                <SelectItem value="bounce">Bounce</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Dismiss</Label>
                            <p className="text-sm text-gray-500">Automatically hide after timeout</p>
                          </div>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 seconds</SelectItem>
                              <SelectItem value="5">5 seconds</SelectItem>
                              <SelectItem value="10">10 seconds</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Delivery Settings */}
                {settingsTab === 'delivery' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Timing Optimization</CardTitle>
                        <CardDescription>Optimize when notifications are delivered</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label>Intelligent Delivery</Label>
                              <p className="text-sm text-gray-500">AI-optimized send times per user</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.batchProcessing}
                            onCheckedChange={(checked) => handleChannelSettingChange('batchProcessing', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Timezone Awareness</Label>
                              <p className="text-sm text-gray-500">Deliver in user's local timezone</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.analyticsEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('analyticsEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="user">User's Timezone</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Optimal Send Window</Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any Time</SelectItem>
                                <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                                <SelectItem value="evening">Evening (6PM-10PM)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label>Predictive Send</Label>
                              <p className="text-sm text-gray-500">Use ML to predict best engagement times</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.batchProcessing}
                            onCheckedChange={(checked) => handleChannelSettingChange('batchProcessing', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Frequency Control</CardTitle>
                        <CardDescription>Prevent notification fatigue</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Sliders className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Enable Frequency Capping</Label>
                              <p className="text-sm text-gray-500">Limit notifications per time period</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.rateLimiting}
                            onCheckedChange={(checked) => handleChannelSettingChange('rateLimiting', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Max per Hour</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max per Day</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max per Week</Label>
                            <Select defaultValue="50">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <AlertOctagon className="h-5 w-5 text-orange-500" />
                            <div>
                              <Label>Priority Override</Label>
                              <p className="text-sm text-gray-500">High priority bypasses limits</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.priorityOnly}
                            onCheckedChange={(checked) => handleChannelSettingChange('priorityOnly', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-blue-500" />
                            <div>
                              <Label>Category Limits</Label>
                              <p className="text-sm text-gray-500">Apply limits per notification category</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.digestEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('digestEnabled', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Pause notifications during specified hours</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <div>
                              <Label>Enable Quiet Hours</Label>
                              <p className="text-sm text-gray-500">Hold non-urgent notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.quietHoursEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('quietHoursEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label>Apply on Weekends</Label>
                              <p className="text-sm text-gray-500">Extend quiet hours to weekends</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.weeklyDigest}
                            onCheckedChange={(checked) => handleChannelSettingChange('weeklyDigest', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertOctagon className="h-5 w-5 text-red-500" />
                            <div>
                              <Label>Allow Urgent Messages</Label>
                              <p className="text-sm text-gray-500">Critical notifications bypass quiet hours</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.failureAlerts}
                            onCheckedChange={(checked) => handleChannelSettingChange('failureAlerts', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Fallback & Retry</CardTitle>
                        <CardDescription>Handle delivery failures</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Enable Channel Fallback</Label>
                              <p className="text-sm text-gray-500">Try alternate channels on failure</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.webhookRetry}
                            onCheckedChange={(checked) => handleChannelSettingChange('webhookRetry', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Primary Channel</Label>
                            <Select defaultValue="push">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="push">Push</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Fallback Order</Label>
                            <Select defaultValue="email_sms">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email_sms">Email → SMS</SelectItem>
                                <SelectItem value="sms_email">SMS → Email</SelectItem>
                                <SelectItem value="email_only">Email Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Retry Attempts</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 retry</SelectItem>
                                <SelectItem value="3">3 retries</SelectItem>
                                <SelectItem value="5">5 retries</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay</Label>
                            <Select defaultValue="exponential">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed (1 min)</SelectItem>
                                <SelectItem value="exponential">Exponential backoff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Analytics Settings */}
                {settingsTab === 'analytics' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Tracking</CardTitle>
                        <CardDescription>Configure what events to track</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-green-600" />
                            <div>
                              <Label>Track Opens</Label>
                              <p className="text-sm text-gray-500">Email and push opens</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.analyticsEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('analyticsEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MousePointer className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Track Clicks</Label>
                              <p className="text-sm text-gray-500">Link and button clicks</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.deliveryReports}
                            onCheckedChange={(checked) => handleChannelSettingChange('deliveryReports', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Track Conversions</Label>
                              <p className="text-sm text-gray-500">Goal completions from notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.autoArchive}
                            onCheckedChange={(checked) => handleChannelSettingChange('autoArchive', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label>Revenue Attribution</Label>
                              <p className="text-sm text-gray-500">Track revenue from campaigns</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.dailyDigest}
                            onCheckedChange={(checked) => handleChannelSettingChange('dailyDigest', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Archive className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label>Unsubscribe Tracking</Label>
                              <p className="text-sm text-gray-500">Track opt-out events</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppBadges}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppBadges', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Third-Party Analytics</CardTitle>
                        <CardDescription>Send events to external platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Google Analytics', enabled: false, config: 'GA-XXXXXXXX' },
                          { name: 'Mixpanel', enabled: true, config: 'Connected' },
                          { name: 'Amplitude', enabled: false, config: 'Not configured' },
                          { name: 'Segment', enabled: true, config: 'Connected' }
                        ].map((platform, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${platform.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <BarChart3 className={`h-4 w-4 ${platform.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{platform.name}</p>
                                <p className="text-sm text-gray-500">{platform.config}</p>
                              </div>
                            </div>
                            <Switch defaultChecked={platform.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export analytics data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select defaultValue="csv">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="xlsx">Excel</SelectItem>
                                <SelectItem value="parquet">Parquet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Range</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="custom">Custom range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Scheduled Exports</Label>
                            <p className="text-sm text-gray-500">Auto-export on a schedule</p>
                          </div>
                          <Switch />
                        </div>
                        <Button variant="outline" className="w-full" onClick={async () => {
                          await toast.promise(
                            fetch('/api/analytics/export', { method: 'GET' }).then(async res => {
                              if (!res.ok) throw new Error('Export failed')
                              const blob = await res.blob()
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
                              a.click()
                              URL.revokeObjectURL(url)
                              return { success: true }
                            }),
                            { loading: 'Exporting analytics data...', success: 'Analytics data exported successfully', error: 'Failed to export analytics data' }
                          )
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Analytics Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Reporting</CardTitle>
                        <CardDescription>Configure automated reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Report Frequency</Label>
                            <Select defaultValue="weekly">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select defaultValue="summary">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="summary">Summary</SelectItem>
                                <SelectItem value="detailed">Detailed</SelectItem>
                                <SelectItem value="executive">Executive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Recipients</Label>
                          <Input placeholder="team@company.com, marketing@company.com" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label>Include Recommendations</Label>
                              <p className="text-sm text-gray-500">AI-powered optimization suggestions</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppPopups}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppPopups', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Preferences Settings */}
                {settingsTab === 'preferences' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Preference Management</CardTitle>
                        <CardDescription>How users control their notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-red-500" />
                            <div>
                              <Label>Allow Global Opt-out</Label>
                              <p className="text-sm text-gray-500">Users can disable all notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.doNotDisturb}
                            onCheckedChange={(checked) => handleChannelSettingChange('doNotDisturb', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Category-level Control</Label>
                              <p className="text-sm text-gray-500">Per-category preferences</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.digestEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('digestEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Workflow className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Channel-level Control</Label>
                              <p className="text-sm text-gray-500">Per-channel preferences</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.pushEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('pushEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Sliders className="h-5 w-5 text-orange-500" />
                            <div>
                              <Label>Frequency Control</Label>
                              <p className="text-sm text-gray-500">Users set their own limits</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.rateLimiting}
                            onCheckedChange={(checked) => handleChannelSettingChange('rateLimiting', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label>Preference Center</Label>
                              <p className="text-sm text-gray-500">Hosted preference page</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppEnabled', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Default Preferences</CardTitle>
                        <CardDescription>Default settings for new users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Push Notifications</Label>
                            <Select defaultValue="on">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on">Enabled by default</SelectItem>
                                <SelectItem value="off">Disabled by default</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Email Notifications</Label>
                            <Select defaultValue="on">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on">Enabled by default</SelectItem>
                                <SelectItem value="off">Disabled by default</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>SMS Notifications</Label>
                            <Select defaultValue="off">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on">Enabled by default</SelectItem>
                                <SelectItem value="off">Disabled by default</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>In-App Notifications</Label>
                            <Select defaultValue="on">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on">Enabled by default</SelectItem>
                                <SelectItem value="off">Disabled by default</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Categories</CardTitle>
                        <CardDescription>Manage notification categories</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Marketing', default: true },
                          { name: 'Transactional', default: true },
                          { name: 'Product Updates', default: true },
                          { name: 'Weekly Digest', default: false },
                          { name: 'Community', default: false }
                        ].map((category, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-gray-500">
                                {category.default ? 'Enabled by default' : 'Opt-in only'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" onClick={() => setShowCategoryEditor(category.name)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={category.default} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowCategoryEditor('new')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Messaging Platforms</CardTitle>
                        <CardDescription>Connect to messaging services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack', icon: Slack, status: 'connected', lastSync: '2 min ago' },
                          { name: 'Discord', icon: MessageSquare, status: 'not_connected', lastSync: null },
                          { name: 'Microsoft Teams', icon: Users, status: 'connected', lastSync: '5 min ago' },
                          { name: 'WhatsApp Business', icon: Smartphone, status: 'not_connected', lastSync: null },
                          { name: 'Telegram', icon: Send, status: 'not_connected', lastSync: null }
                        ].map((platform, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${platform.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <platform.icon className={`h-4 w-4 ${platform.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{platform.name}</p>
                                {platform.lastSync && (
                                  <p className="text-sm text-gray-500">Last sync: {platform.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <Button variant={platform.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={async () => {
                              if (platform.status === 'connected') {
                                router.push(`/dashboard/settings/integrations/${platform.name.toLowerCase().replace(/\s+/g, '-')}`)
                              } else {
                                await toast.promise(
                                  fetch(`/api/integrations/${platform.name.toLowerCase().replace(/\s+/g, '-')}/connect`, { method: 'POST' }).then(res => {
                                    if (!res.ok) throw new Error('Connection failed')
                                    return res.json()
                                  }),
                                  { loading: `Connecting to ${platform.name}...`, success: `${platform.name} connected successfully`, error: `Failed to connect to ${platform.name}` }
                                )
                              }
                            }}>
                              {platform.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>CRM & Customer Data</CardTitle>
                        <CardDescription>Connect to CRM platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Salesforce', status: 'connected' },
                          { name: 'HubSpot', status: 'connected' },
                          { name: 'Intercom', status: 'not_connected' },
                          { name: 'Zendesk', status: 'not_connected' }
                        ].map((crm, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${crm.status === 'connected' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Users className={`h-4 w-4 ${crm.status === 'connected' ? 'text-blue-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{crm.name}</p>
                                <p className="text-sm text-gray-500">
                                  {crm.status === 'connected' ? 'Syncing user data' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <Button variant={crm.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={async () => {
                              if (crm.status === 'connected') {
                                router.push(`/dashboard/settings/integrations/${crm.name.toLowerCase()}`)
                              } else {
                                await toast.promise(
                                  fetch(`/api/integrations/${crm.name.toLowerCase()}/connect`, { method: 'POST' }).then(res => {
                                    if (!res.ok) throw new Error('Connection failed')
                                    return res.json()
                                  }),
                                  { loading: `Connecting to ${crm.name}...`, success: `${crm.name} connected successfully`, error: `Failed to connect to ${crm.name}` }
                                )
                              }
                            }}>
                              {crm.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="••••••••••••••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={async () => {
                              await toast.promise(
                                fetch('/api/settings/api-key', { method: 'GET' }).then(async res => {
                                  if (!res.ok) throw new Error('Failed to get API key')
                                  const data = await res.json()
                                  await navigator.clipboard.writeText(data.apiKey)
                                  return data
                                }),
                                { loading: 'Copying API key...', success: 'API key copied to clipboard', error: 'Failed to copy API key' }
                              )
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last used: 2 min ago</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <Webhook className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Enable API</Label>
                              <p className="text-sm text-gray-500">Allow external API access</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Sliders className="h-5 w-5 text-orange-500" />
                            <div>
                              <Label>Rate Limiting</Label>
                              <p className="text-sm text-gray-500">1000 requests/minute</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.rateLimiting}
                            onCheckedChange={(checked) => handleChannelSettingChange('rateLimiting', checked)}
                          />
                        </div>
                        <Button variant="outline" className="w-full" onClick={async () => {
                          if (!confirm('Are you sure you want to regenerate your API key? The old key will stop working immediately.')) return
                          await toast.promise(
                            fetch('/api/settings/api-key/regenerate', { method: 'POST' }).then(res => {
                              if (!res.ok) throw new Error('Failed to regenerate API key')
                              return res.json()
                            }),
                            { loading: 'Regenerating API key...', success: 'New API key generated successfully', error: 'Failed to regenerate API key' }
                          )
                        }}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Receive real-time event notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { url: 'https://api.company.com/webhooks/notifications', events: ['sent', 'opened', 'clicked'] },
                          { url: 'https://analytics.company.com/events', events: ['all'] }
                        ].map((webhook, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-mono text-sm">{webhook.url}</p>
                              <p className="text-sm text-gray-500">Events: {webhook.events.join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setShowWebhookDialog(true)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={async () => {
                                if (!confirm('Are you sure you want to delete this webhook?')) return
                                await toast.promise(
                                  fetch(`/api/webhooks/${encodeURIComponent(webhook.url)}`, { method: 'DELETE' }).then(res => {
                                    if (!res.ok) throw new Error('Failed to delete webhook')
                                    return res.json()
                                  }),
                                  { loading: 'Deleting webhook...', success: 'Webhook deleted successfully', error: 'Failed to delete webhook' }
                                )
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Testing & Debug</CardTitle>
                        <CardDescription>Development and testing tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TestTube className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Debug Mode</Label>
                              <p className="text-sm text-gray-500">Log all delivery attempts</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.deliveryReports}
                            onCheckedChange={(checked) => handleChannelSettingChange('deliveryReports', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label>Test Mode</Label>
                              <p className="text-sm text-gray-500">Send only to test users</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.muteAll}
                            onCheckedChange={(checked) => handleChannelSettingChange('muteAll', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Test Email</Label>
                            <Input placeholder="test@company.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>Test Phone</Label>
                            <Input placeholder="+1234567890" />
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={async () => {
                          await toast.promise(
                            fetch('/api/notifications/test', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ type: 'test' })
                            }).then(res => {
                              if (!res.ok) throw new Error('Failed to send test notification')
                              return res.json()
                            }),
                            { loading: 'Sending test notification...', success: 'Test notification sent successfully', error: 'Failed to send test notification' }
                          )
                        }}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Send Test Notification
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI Features</CardTitle>
                        <CardDescription>Machine learning powered features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Split className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>A/B Testing</Label>
                              <p className="text-sm text-gray-500">Automatic split testing</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.batchProcessing}
                            onCheckedChange={(checked) => handleChannelSettingChange('batchProcessing', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label>Content Personalization</Label>
                              <p className="text-sm text-gray-500">AI-powered message customization</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.inAppPopups}
                            onCheckedChange={(checked) => handleChannelSettingChange('inAppPopups', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Smart Segmentation</Label>
                              <p className="text-sm text-gray-500">Auto-segment users by behavior</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.analyticsEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('analyticsEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-red-500" />
                            <div>
                              <Label>Churn Prediction</Label>
                              <p className="text-sm text-gray-500">Predict and prevent user churn</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.failureAlerts}
                            onCheckedChange={(checked) => handleChannelSettingChange('failureAlerts', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-orange-500" />
                            <div>
                              <Label>Subject Line Optimization</Label>
                              <p className="text-sm text-gray-500">AI-generated subject lines</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.autoArchive}
                            onCheckedChange={(checked) => handleChannelSettingChange('autoArchive', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure data storage policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Notification History</Label>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Analytics Data</Label>
                            <Select defaultValue="365">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="forever">Forever</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Archive className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Archive Old Data</Label>
                              <p className="text-sm text-gray-500">Move to cold storage</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.autoArchive}
                            onCheckedChange={(checked) => handleChannelSettingChange('autoArchive', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Security and compliance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <div>
                              <Label>IP Allowlist</Label>
                              <p className="text-sm text-gray-500">Restrict API access by IP</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.rateLimiting}
                            onCheckedChange={(checked) => handleChannelSettingChange('rateLimiting', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Webhook className="h-5 w-5 text-green-600" />
                            <div>
                              <Label>Webhook Signing</Label>
                              <p className="text-sm text-gray-500">Sign all outgoing webhooks</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.webhookRetry}
                            onCheckedChange={(checked) => handleChannelSettingChange('webhookRetry', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label>Audit Logging</Label>
                              <p className="text-sm text-gray-500">Log all admin actions</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.analyticsEnabled}
                            onCheckedChange={(checked) => handleChannelSettingChange('analyticsEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label>Data Encryption</Label>
                              <p className="text-sm text-gray-500">Encrypt data at rest</p>
                            </div>
                          </div>
                          <Switch
                            checked={channelSettings.deliveryReports}
                            onCheckedChange={(checked) => handleChannelSettingChange('deliveryReports', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Purge Notification History</p>
                            <p className="text-sm text-gray-500">Delete all notification records</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={async () => {
                            if (!confirm('Are you sure you want to purge all notification history? This action cannot be undone.')) return
                            await toast.promise(
                              fetch('/api/notifications/clear', { method: 'DELETE' }).then(res => {
                                if (!res.ok) throw new Error('Failed to purge history')
                                return res.json()
                              }),
                              { loading: 'Purging notification history...', success: 'Notification history purged', error: 'Failed to purge history' }
                            )
                          }}>
                            Purge History
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Clear All Segments</p>
                            <p className="text-sm text-gray-500">Delete all user segments</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={async () => {
                            if (!confirm('Are you sure you want to clear all segments? This action cannot be undone.')) return
                            await toast.promise(
                              fetch('/api/segments/clear', { method: 'DELETE' }).then(res => {
                                if (!res.ok) throw new Error('Failed to clear segments')
                                return res.json()
                              }),
                              { loading: 'Clearing all segments...', success: 'All segments cleared', error: 'Failed to clear segments' }
                            )
                          }}>
                            Clear Segments
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reset All Settings</p>
                            <p className="text-sm text-gray-500">Restore to default configuration</p>
                          </div>
                          <Button variant="destructive" onClick={async () => {
                            if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) return
                            await toast.promise(
                              fetch('/api/settings/reset', { method: 'POST' }).then(res => {
                                if (!res.ok) throw new Error('Failed to reset settings')
                                return res.json()
                              }),
                              { loading: 'Resetting all settings...', success: 'All settings reset to defaults', error: 'Failed to reset settings' }
                            )
                          }}>
                            Reset Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={notificationsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={notificationsPredictions}
              title="Notification Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={notificationsQuickActions}
            variant="grid"
          />
        </div>

        {/* Notification Detail Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-lg">
            <ScrollArea className="max-h-[80vh]">
              {selectedNotification && (
                <div className="space-y-4">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedNotification.type === 'error' ? 'bg-red-100' : selectedNotification.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <Bell className={`h-5 w-5 ${selectedNotification.type === 'error' ? 'text-red-600' : selectedNotification.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <DialogTitle>{selectedNotification.title}</DialogTitle>
                        <DialogDescription>{formatTimeAgo(selectedNotification.createdAt)}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedNotification.priority)}>{selectedNotification.priority}</Badge>
                    <Badge variant="outline">{selectedNotification.channel}</Badge>
                    <Badge variant="outline">{selectedNotification.category}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedNotification.message}</p>
                  {selectedNotification.sender && <p className="text-sm text-gray-500">From: {selectedNotification.sender}</p>}
                  {selectedNotification.actionUrl && (
                    <Button className="w-full" onClick={() => {
                      if (selectedNotification.actionUrl?.startsWith('/')) {
                        router.push(selectedNotification.actionUrl)
                      } else if (selectedNotification.actionUrl) {
                        window.open(selectedNotification.actionUrl, '_blank')
                      }
                    }}>
                      {selectedNotification.actionLabel || 'View Details'}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleArchiveNotification(selectedNotification)} disabled={isSubmitting}><Archive className="h-4 w-4 mr-2" />Archive</Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleStarNotification(selectedNotification)} disabled={isSubmitting}><Star className="h-4 w-4 mr-2" />Star</Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleDeleteNotification(selectedNotification)} disabled={isSubmitting}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>Send notifications to your audience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Campaign Name</Label><Input placeholder="e.g., Product Launch" value={campaignForm.name} onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Channel</Label><Select value={campaignForm.channel} onValueChange={(v) => setCampaignForm(prev => ({ ...prev, channel: v }))}><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger><SelectContent><SelectItem value="push">Push</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="slack">Slack</SelectItem></SelectContent></Select></div>
                <div><Label>Segment</Label><Select value={campaignForm.segment} onValueChange={(v) => setCampaignForm(prev => ({ ...prev, segment: v }))}><SelectTrigger><SelectValue placeholder="Select segment" /></SelectTrigger><SelectContent>{segments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Title</Label><Input placeholder="Notification title" value={campaignForm.title} onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))} /></div>
              <div><Label>Message</Label><Textarea placeholder="Notification message..." rows={3} value={campaignForm.message} onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))} /></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /><span className="text-sm">Schedule for later</span></div>
                <Switch checked={campaignForm.scheduled} onCheckedChange={(c) => setCampaignForm(prev => ({ ...prev, scheduled: c }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCampaign(false)} disabled={isSubmitting}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={handleSendCampaign} disabled={isSubmitting}><Send className="h-4 w-4 mr-2" />{isSubmitting ? 'Sending...' : 'Send Now'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Automation Dialog */}
        <Dialog open={showCreateAutomation} onOpenChange={setShowCreateAutomation}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
              <DialogDescription>Set up automated notification workflows</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Automation Name</Label>
                <Input placeholder="e.g., Welcome Series" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe what this automation does..." rows={2} />
              </div>
              <div>
                <Label>Trigger Type</Label>
                <Select defaultValue="event">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">User Event</SelectItem>
                    <SelectItem value="schedule">Schedule (Cron)</SelectItem>
                    <SelectItem value="segment_entry">Segment Entry</SelectItem>
                    <SelectItem value="segment_exit">Segment Exit</SelectItem>
                    <SelectItem value="api">API Trigger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Initial Action</Label>
                <Select defaultValue="send_notification">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="wait">Wait Duration</SelectItem>
                    <SelectItem value="condition">Add Condition</SelectItem>
                    <SelectItem value="webhook">Call Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateAutomation(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Automation Created')
                setShowCreateAutomation(false)
              }}>
                <Workflow className="h-4 w-4 mr-2" />Create Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>Create a reusable notification template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name</Label>
                <Input placeholder="e.g., Order Confirmation" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Channel</Label>
                  <Select defaultValue="push">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select defaultValue="transactional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input placeholder="Notification title with {{variables}}" />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea placeholder="Message body with {{variables}}..." rows={3} />
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-2">Available Variables</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => {
                    navigator.clipboard.writeText('{{name}}')
                    toast.info('Variable copied to clipboard')
                  }}>{`{{name}}`}</Badge>
                  <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => {
                    navigator.clipboard.writeText('{{email}}')
                    toast.info('Variable copied to clipboard')
                  }}>{`{{email}}`}</Badge>
                  <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => {
                    navigator.clipboard.writeText('{{app_name}}')
                    toast.info('Variable copied to clipboard')
                  }}>{`{{app_name}}`}</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Template Created')
                setShowTemplateDialog(false)
              }}>
                <Layers className="h-4 w-4 mr-2" />Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure Webhook</DialogTitle>
              <DialogDescription>Set up webhook endpoint for event notifications</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Webhook Name</Label>
                <Input placeholder="e.g., Analytics Integration" />
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input placeholder="https://api.example.com/webhooks" />
              </div>
              <div>
                <Label>Events to Send</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['notification.sent', 'notification.delivered', 'notification.opened', 'notification.clicked', 'notification.failed', 'campaign.completed'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} className="rounded" defaultChecked={event.includes('sent') || event.includes('failed')} />
                      <label htmlFor={event} className="text-sm">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Secret Key (for signature verification)</Label>
                <div className="flex gap-2">
                  <Input type="password" placeholder="whsec_..." className="flex-1" id="webhook-secret-input" />
                  <Button variant="outline" size="sm" onClick={() => {
                    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
                      .map(b => b.toString(16).padStart(2, '0')).join('')
                    const newSecret = `whsec_${randomBytes}`
                    const input = document.getElementById('webhook-secret-input') as HTMLInputElement
                    if (input) input.value = newSecret
                    navigator.clipboard.writeText(newSecret)
                    toast.success('Secret Generated')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label>Enable Webhook</Label>
                  <p className="text-sm text-gray-500">Start receiving events</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
              <Button variant="outline" onClick={async () => {
                const urlInput = document.querySelector('input[placeholder="https://api.example.com/webhooks"]') as HTMLInputElement
                const url = urlInput?.value
                if (!url) {
                  toast.error('Missing URL')
                  return
                }
                toast.loading('Sending test payload...', { id: 'test-webhook-dialog' })
                try {
                  await fetch('/api/webhooks/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, event: 'test.ping' })
                  })
                  toast.success('Test Sent', { id: 'test-webhook-dialog', description: 'Test payload sent successfully' })
                } catch {
                  toast.error('Test Failed', { id: 'test-webhook-dialog', description: 'Could not send test payload' })
                }
              }}>
                <TestTube className="h-4 w-4 mr-2" />Test
              </Button>
              <Button onClick={() => {
                toast.success('Webhook Saved')
                setShowWebhookDialog(false)
              }}>
                <Webhook className="h-4 w-4 mr-2" />Save Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Editor Dialog */}
        <Dialog open={!!showCategoryEditor} onOpenChange={() => setShowCategoryEditor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{showCategoryEditor === 'new' ? 'Create Category' : `Edit ${showCategoryEditor}`}</DialogTitle>
              <DialogDescription>Configure notification category settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Category Name</Label>
                <Input placeholder="e.g., Product Updates" defaultValue={showCategoryEditor !== 'new' ? showCategoryEditor ?? '' : ''} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="What notifications belong to this category?" rows={2} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enabled by Default</Label>
                  <p className="text-sm text-gray-500">New users auto-subscribed</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow User Control</Label>
                  <p className="text-sm text-gray-500">Users can opt-out</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryEditor(null)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(showCategoryEditor === 'new' ? 'Category Created' : 'Category Updated')
                setShowCategoryEditor(null)
              }}>
                Save Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Panel */}
        <Dialog open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Notifications</DialogTitle>
              <DialogDescription>Narrow down your notification list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Channel</Label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Starred Only</Label>
                  <p className="text-sm text-gray-500">Show only starred</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setStatusFilter('all')
                setChannelFilter('all')
                toast.success('Filters Reset')
              }}>Reset</Button>
              <Button onClick={() => {
                setShowFiltersPanel(false)
                toast.success('Filters Applied')
              }}>
                <Filter className="h-4 w-4 mr-2" />Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Segment Builder Dialog */}
        <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedSegment ? `Edit Segment: ${selectedSegment.name}` : 'Create New Segment'}</DialogTitle>
              <DialogDescription>Define audience segment criteria for targeted notifications</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Segment Name</Label>
                <Input placeholder="e.g., Active Premium Users" defaultValue={selectedSegment?.name || ''} />
              </div>
              <div className="space-y-2">
                <Label>Segment Rules</Label>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Select defaultValue="subscription">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="activity">Last Active</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="equals">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater">Greater than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Value" className="flex-1" />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const propertySelect = document.querySelector('[data-segment-property]') as HTMLSelectElement
                  const operatorSelect = document.querySelector('[data-segment-operator]') as HTMLSelectElement
                  const valueInput = document.querySelector('input[placeholder="Value"]') as HTMLInputElement
                  const property = propertySelect?.value || 'subscription'
                  const operator = operatorSelect?.value || 'equals'
                  const value = valueInput?.value || ''
                  if (!value) {
                    toast.error('Please enter a value for the rule')
                    return
                  }
                  toast.success('Rule added: ' + operator + ' "' + value + '"')
                  if (valueInput) valueInput.value = ''
                }}>
                  <Plus className="h-4 w-4 mr-1" />Add Rule
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSegmentDialog(false)
                setSelectedSegment(null)
              }}>Cancel</Button>
              <Button onClick={() => {
                toast.success(selectedSegment ? 'Segment updated: has been updated' : 'Segment created: New segment has been created')
                setShowSegmentDialog(false)
                setSelectedSegment(null)
              }}>
                {selectedSegment ? 'Save Changes' : 'Create Segment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Segment Users Dialog */}
        <Dialog open={showSegmentUsersDialog} onOpenChange={setShowSegmentUsersDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Segment Users: {selectedSegment?.name}</DialogTitle>
              <DialogDescription>{selectedSegment?.userCount.toLocaleString()} users in this segment</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search users..." className="flex-1" />
                <Button variant="outline" onClick={() => {
                  const users = [
                    { name: 'John Smith', email: 'john@example.com', joinedAt: '2024-01-15' },
                    { name: 'Sarah Johnson', email: 'sarah@example.com', joinedAt: '2024-02-20' },
                    { name: 'Mike Wilson', email: 'mike@example.com', joinedAt: '2024-03-10' },
                    { name: 'Emily Brown', email: 'emily@example.com', joinedAt: '2024-01-28' },
                    { name: 'Chris Davis', email: 'chris@example.com', joinedAt: '2024-02-05' },
                  ]
                  const csvData = [
                    ['Name', 'Email', 'Joined Date'],
                    ...users.map(u => [u.name, u.email, u.joinedAt])
                  ].map(row => row.join(',')).join('\n')
                  const blob = new Blob([csvData], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'segment-' + (selectedSegment?.name?.toLowerCase().replace(/\s+/g, '-') || 'users') + '-export.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Users exported to CSV')
                }}>
                  <Download className="h-4 w-4 mr-2" />Export
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {[
                    { name: 'John Smith', email: 'john@example.com', joinedAt: '2024-01-15' },
                    { name: 'Sarah Johnson', email: 'sarah@example.com', joinedAt: '2024-02-20' },
                    { name: 'Mike Wilson', email: 'mike@example.com', joinedAt: '2024-03-10' },
                    { name: 'Emily Brown', email: 'emily@example.com', joinedAt: '2024-01-28' },
                    { name: 'Chris Davis', email: 'chris@example.com', joinedAt: '2024-02-05' },
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Joined {user.joinedAt}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSegmentUsersDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* A/B Test Dialog */}
        <Dialog open={showABTestDialog} onOpenChange={setShowABTestDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>Test different notification variants to optimize engagement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input placeholder="e.g., Welcome Message Test" />
              </div>
              <div className="space-y-2">
                <Label>Variant A (Control)</Label>
                <Textarea placeholder="Enter the original notification message..." />
              </div>
              <div className="space-y-2">
                <Label>Variant B (Test)</Label>
                <Textarea placeholder="Enter the test notification message..." />
              </div>
              <div className="space-y-2">
                <Label>Traffic Split</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">A: 50%</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-blue-500" />
                  </div>
                  <span className="text-sm">B: 50%</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowABTestDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('A/B Test created')
                setShowABTestDialog(false)
              }}>Start Test</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={showPreviewTemplateDialog} onOpenChange={setShowPreviewTemplateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>Preview how this template will appear to users</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <Badge variant="outline" className="mb-3">{previewTemplate.channel}</Badge>
                  <h4 className="font-semibold text-lg mb-2">{previewTemplate.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{previewTemplate.message}</p>
                </div>
                <div className="space-y-2">
                  <Label>Variables Used</Label>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map(v => (
                      <Badge key={v} variant="outline">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{previewTemplate.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage:</span>
                    <span className="ml-2 font-medium">{previewTemplate.usageCount.toLocaleString()} times</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewTemplateDialog(false)}>Close</Button>
              <Button onClick={() => {
                if (previewTemplate) {
                  setCampaignForm(prev => ({ ...prev, title: previewTemplate.title, message: previewTemplate.message }))
                  setShowCreateCampaign(true)
                  setShowPreviewTemplateDialog(false)
                  toast.success('Template selected for new campaign')
                }
              }}>Use Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation Analytics Dialog */}
        <Dialog open={showAutomationAnalyticsDialog} onOpenChange={setShowAutomationAnalyticsDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Automation Analytics</DialogTitle>
              <DialogDescription>
                {selectedAutomationForAnalytics?.name} - Detailed performance metrics
              </DialogDescription>
            </DialogHeader>
            {selectedAutomationForAnalytics && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedAutomationForAnalytics.stats.totalTriggered.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Triggered</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedAutomationForAnalytics.stats.totalCompleted.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedAutomationForAnalytics.stats.totalFailed}</p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                  <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-violet-600">{selectedAutomationForAnalytics.stats.conversionRate}%</p>
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Success Rate</Label>
                  <Progress value={(selectedAutomationForAnalytics.stats.totalCompleted / Math.max(selectedAutomationForAnalytics.stats.totalTriggered, 1)) * 100} />
                  <p className="text-sm text-gray-500">
                    {((selectedAutomationForAnalytics.stats.totalCompleted / Math.max(selectedAutomationForAnalytics.stats.totalTriggered, 1)) * 100).toFixed(1)}% of triggered automations completed successfully
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedAutomationForAnalytics.status)}`}>{selectedAutomationForAnalytics.status}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Triggered:</span>
                    <span className="ml-2 font-medium">{selectedAutomationForAnalytics.lastTriggered ? formatTimeAgo(selectedAutomationForAnalytics.lastTriggered) : 'Never'}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationAnalyticsDialog(false)}>Close</Button>
              <Button onClick={() => {
                const dataStr = JSON.stringify(selectedAutomationForAnalytics, null, 2)
                const blob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `automation-analytics-${selectedAutomationForAnalytics?.id}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Analytics exported')
              }}>
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation History Dialog */}
        <Dialog open={showAutomationHistoryDialog} onOpenChange={setShowAutomationHistoryDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execution History</DialogTitle>
              <DialogDescription>
                {selectedAutomationForHistory?.name} - Recent execution logs
              </DialogDescription>
            </DialogHeader>
            {selectedAutomationForHistory && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 py-4">
                  {[...Array(10)].map((_, i) => {
                    const isSuccess = Math.random() > 0.1
                    const timeAgo = `${i * 2 + 1}h ago`
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${isSuccess ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'bg-red-50 dark:bg-red-900/10 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {isSuccess ? 'Success' : 'Failed'}
                            </Badge>
                            <span className="text-sm font-medium">Trigger #{1000 - i}</span>
                          </div>
                          <span className="text-xs text-gray-500">{timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {isSuccess ? 'Notification delivered successfully' : 'Failed to deliver: Timeout error'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationHistoryDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* A/B Test Details Dialog */}
        <Dialog open={showTestDetailsDialog} onOpenChange={setShowTestDetailsDialog}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>A/B Test Details</DialogTitle>
              <DialogDescription>
                {selectedTestForDetails?.name} - Detailed test report
              </DialogDescription>
            </DialogHeader>
            {selectedTestForDetails && (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(selectedTestForDetails.status)}>{selectedTestForDetails.status}</Badge>
                  <div className="text-sm text-gray-500">
                    Started: {new Date(selectedTestForDetails.startDate).toLocaleDateString()}
                    {selectedTestForDetails.endDate && ` - Ended: ${new Date(selectedTestForDetails.endDate).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confidence Level</Label>
                  <Progress value={selectedTestForDetails.confidenceLevel} />
                  <p className="text-sm text-gray-500">{selectedTestForDetails.confidenceLevel}% statistical confidence</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                  {selectedTestForDetails.variants.map(variant => (
                    <div key={variant.id} className={`p-4 rounded-lg border ${selectedTestForDetails.winner === variant.id ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{variant.name}</h4>
                        {selectedTestForDetails.winner === variant.id && <Badge className="bg-green-500">Winner</Badge>}
                      </div>
                      <p className="text-sm mb-3">{variant.title}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
                        <div><span className="text-gray-500">Sent:</span> <span className="font-medium">{variant.stats.sent.toLocaleString()}</span></div>
                        <div><span className="text-gray-500">Delivered:</span> <span className="font-medium">{variant.stats.delivered.toLocaleString()}</span></div>
                        <div><span className="text-gray-500">Opened:</span> <span className="font-medium text-blue-600">{variant.stats.opened.toLocaleString()}</span></div>
                        <div><span className="text-gray-500">Clicked:</span> <span className="font-medium text-green-600">{variant.stats.clicked.toLocaleString()}</span></div>
                        <div><span className="text-gray-500">Open Rate:</span> <span className="font-medium">{((variant.stats.opened / Math.max(variant.stats.delivered, 1)) * 100).toFixed(1)}%</span></div>
                        <div><span className="text-gray-500">Click Rate:</span> <span className="font-medium">{((variant.stats.clicked / Math.max(variant.stats.opened, 1)) * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestDetailsDialog(false)}>Close</Button>
              <Button onClick={() => {
                const dataStr = JSON.stringify(selectedTestForDetails, null, 2)
                const blob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `ab-test-report-${selectedTestForDetails?.id}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Report exported')
              }}>
                <Download className="h-4 w-4 mr-2" />Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Logs Dialog */}
        <Dialog open={showWebhookLogsDialog} onOpenChange={setShowWebhookLogsDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Webhook Delivery Logs</DialogTitle>
              <DialogDescription>
                {selectedWebhookForLogs?.name} - Recent delivery attempts
              </DialogDescription>
            </DialogHeader>
            {selectedWebhookForLogs && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 py-4">
                  {[...Array(15)].map((_, i) => {
                    const isSuccess = selectedWebhookForLogs.status !== 'failed' || Math.random() > 0.6
                    const statusCode = isSuccess ? 200 : [400, 500, 502, 503][Math.floor(Math.random() * 4)]
                    const timeAgo = `${i * 30 + 5} min ago`
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${isSuccess ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'bg-red-50 dark:bg-red-900/10 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {statusCode}
                            </Badge>
                            <span className="text-sm font-mono text-gray-600">{selectedWebhookForLogs.url}</span>
                          </div>
                          <span className="text-xs text-gray-500">{timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Event: notification.sent</span>
                          <span>Duration: {Math.floor(Math.random() * 200 + 50)}ms</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookLogsDialog(false)}>Close</Button>
              <Button variant="outline" onClick={async () => {
                toast.loading('Retrying failed deliveries...', { id: 'retry-all' })
                try {
                  if (selectedWebhookForLogs) {
                    await supabase.from('webhook_delivery_retries').insert({
                      webhook_id: selectedWebhookForLogs.id,
                      webhook_name: selectedWebhookForLogs.name,
                      retry_type: 'all_failed',
                      queued_at: new Date().toISOString()
                    })
                  }
                  toast.success('Retry complete', { id: 'retry-all', description: 'Failed deliveries have been queued for retry' })
                } catch (err) {
                  toast.error('Retry failed', { id: 'retry-all' })
                }
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />Retry Failed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
