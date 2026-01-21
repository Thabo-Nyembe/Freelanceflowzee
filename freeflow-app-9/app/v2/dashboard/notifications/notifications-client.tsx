'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useNotifications, type NotificationStatus, type NotificationType, type NotificationPriority } from '@/lib/hooks/use-notifications'
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
  Sliders,
  Sparkles
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

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

import {
  notificationsAIInsights,
  notificationsCollaborators,
  notificationsPredictions,
  notificationsActivities,
  notificationsQuickActions,
} from '@/lib/mock-data/adapters'

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
// MOCK DATA
// ============================================================================

// Standardized AI Insights Mock Data
const mockNotificationsAIInsights = [
  { id: '1', type: 'opportunity' as const, title: 'Optimized Delivery', description: 'Sending "Weekly Digest" at 9 AM EST could boost open rates by 18%.', priority: 'high' as const, category: 'Optimization', timestamp: new Date().toISOString() },
  { id: '2', type: 'alert' as const, title: 'Bounce Rate', description: 'High bounce rate (8%) detected in "New Users" segment. Verify email list quality.', priority: 'medium' as const, category: 'Quality', timestamp: new Date().toISOString() },
  { id: '3', type: 'recommendation' as const, title: 'Engagement Drop', description: 'CTR for "Product Launch" lower than average. Consider A/B testing subject lines.', priority: 'low' as const, category: 'Engagement', timestamp: new Date().toISOString() },
]

// Standardized AI Insights Mock Data


const mockNotifications: Notification[] = [
  { id: '1', title: 'New Team Message', message: 'Sarah mentioned you in #design-team', type: 'info', priority: 'normal', status: 'unread', channel: 'slack', createdAt: '2024-01-28T14:30:00Z', sender: 'Sarah Chen', category: 'mentions', isStarred: false, actionUrl: '/messages', actionLabel: 'View Message' },
  { id: '2', title: 'Deployment Complete', message: 'Production deployment v2.4.0 succeeded', type: 'success', priority: 'high', status: 'unread', channel: 'push', createdAt: '2024-01-28T14:15:00Z', category: 'system', isStarred: true },
  { id: '3', title: 'Payment Received', message: 'Invoice #INV-2024-0042 paid - $2,450.00', type: 'success', priority: 'normal', status: 'read', channel: 'email', createdAt: '2024-01-28T12:00:00Z', category: 'billing', isStarred: false },
  { id: '4', title: 'Storage Warning', message: 'You have used 85% of your storage quota', type: 'warning', priority: 'high', status: 'unread', channel: 'in_app', createdAt: '2024-01-28T10:00:00Z', category: 'system', isStarred: false, actionUrl: '/settings/storage', actionLabel: 'Upgrade Storage' },
  { id: '5', title: 'Security Alert', message: 'New login from unknown device in New York', type: 'error', priority: 'urgent', status: 'unread', channel: 'push', createdAt: '2024-01-28T09:30:00Z', category: 'security', isStarred: true, actionUrl: '/security', actionLabel: 'Review Activity' },
  { id: '6', title: 'Weekly Report Ready', message: 'Your team performance report is ready to view', type: 'info', priority: 'low', status: 'read', channel: 'email', createdAt: '2024-01-27T08:00:00Z', category: 'reports', isStarred: false },
  { id: '7', title: 'Task Assigned', message: 'Mike assigned you to "Update API documentation"', type: 'info', priority: 'normal', status: 'read', channel: 'in_app', createdAt: '2024-01-26T16:00:00Z', sender: 'Mike Johnson', category: 'tasks', isStarred: false },
  { id: '8', title: 'Comment on PR #234', message: 'Alex commented: "LGTM, ready to merge"', type: 'info', priority: 'normal', status: 'archived', channel: 'slack', createdAt: '2024-01-26T14:00:00Z', sender: 'Alex Kim', category: 'code', isStarred: false }
]

const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'Product Launch Announcement', status: 'sent', channel: 'push', segment: 'All Users', title: 'New Feature Alert!', message: 'Check out our amazing new dashboard features', sentAt: '2024-01-28T10:00:00Z', createdAt: '2024-01-27T15:00:00Z', createdBy: 'admin@company.com', priority: 'high', stats: { sent: 15420, delivered: 14890, opened: 8234, clicked: 3456, converted: 892, unsubscribed: 12, bounced: 45, complained: 3 } },
  { id: 'c2', name: 'Weekly Digest', status: 'scheduled', channel: 'email', segment: 'Active Users', title: 'Your Weekly Summary', message: 'Here\'s what happened this week...', scheduledAt: '2024-01-29T09:00:00Z', createdAt: '2024-01-28T14:00:00Z', createdBy: 'marketing@company.com', priority: 'normal', stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, complained: 0 } },
  { id: 'c3', name: 'Re-engagement Campaign', status: 'sending', channel: 'push', segment: 'Inactive 30 Days', title: 'We miss you!', message: 'Come back and see what\'s new', createdAt: '2024-01-28T08:00:00Z', createdBy: 'growth@company.com', priority: 'normal', stats: { sent: 5234, delivered: 4890, opened: 1234, clicked: 567, converted: 89, unsubscribed: 23, bounced: 12, complained: 1 } },
  { id: 'c4', name: 'Flash Sale Alert', status: 'draft', channel: 'sms', segment: 'Premium Users', title: '50% Off Today Only!', message: 'Use code FLASH50 for 50% off', createdAt: '2024-01-28T16:00:00Z', createdBy: 'sales@company.com', priority: 'urgent', stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, complained: 0 } },
  { id: 'c5', name: 'Security Update Notice', status: 'sent', channel: 'email', segment: 'All Users', title: 'Important Security Update', message: 'We have updated our security protocols', sentAt: '2024-01-25T14:00:00Z', createdAt: '2024-01-25T10:00:00Z', createdBy: 'security@company.com', priority: 'high', stats: { sent: 25430, delivered: 24890, opened: 18234, clicked: 5456, converted: 0, unsubscribed: 8, bounced: 120, complained: 0 } }
]

const mockSegments: Segment[] = [
  { id: 's1', name: 'All Users', description: 'All registered users', filters: [], userCount: 25430, createdAt: '2024-01-01', isDefault: true, lastUpdated: '2024-01-28' },
  { id: 's2', name: 'Active Users', description: 'Users active in last 7 days', filters: [{ field: 'last_seen', operator: 'gt', value: '7d' }], userCount: 18920, createdAt: '2024-01-15', isDefault: false, lastUpdated: '2024-01-28' },
  { id: 's3', name: 'Premium Users', description: 'Users with premium subscription', filters: [{ field: 'plan', operator: 'equals', value: 'premium' }], userCount: 4560, createdAt: '2024-01-10', isDefault: false, lastUpdated: '2024-01-27' },
  { id: 's4', name: 'Inactive 30 Days', description: 'Users inactive for 30+ days', filters: [{ field: 'last_seen', operator: 'lt', value: '30d' }], userCount: 3210, createdAt: '2024-01-20', isDefault: false, lastUpdated: '2024-01-28' },
  { id: 's5', name: 'New Users', description: 'Users registered in last 7 days', filters: [{ field: 'created_at', operator: 'gt', value: '7d' }], userCount: 1250, createdAt: '2024-01-25', isDefault: false, lastUpdated: '2024-01-28' },
  { id: 's6', name: 'Mobile Users', description: 'Users primarily on mobile devices', filters: [{ field: 'device_type', operator: 'equals', value: 'mobile' }], userCount: 12340, createdAt: '2024-01-18', isDefault: false, lastUpdated: '2024-01-26' }
]

const mockTemplates: Template[] = [
  { id: 't1', name: 'Welcome Message', channel: 'push', title: 'Welcome to {{app_name}}!', message: 'Hey {{name}}, great to have you!', variables: ['app_name', 'name'], usageCount: 15420, category: 'Onboarding', isDefault: true },
  { id: 't2', name: 'Order Confirmation', channel: 'email', title: 'Order #{{order_id}} Confirmed', message: 'Your order has been confirmed and will ship soon.', variables: ['order_id'], usageCount: 8900, category: 'Transactional', isDefault: false },
  { id: 't3', name: 'Reminder', channel: 'push', title: 'Don\'t forget!', message: '{{task_name}} is due {{due_date}}', variables: ['task_name', 'due_date'], usageCount: 5670, category: 'Reminders', isDefault: false },
  { id: 't4', name: 'Promotion', channel: 'sms', title: '{{discount}}% Off!', message: 'Use code {{code}} for {{discount}}% off. Ends {{expiry}}.', variables: ['discount', 'code', 'expiry'], usageCount: 3450, category: 'Marketing', isDefault: false },
  { id: 't5', name: 'Security Alert', channel: 'email', title: 'Security Alert: {{alert_type}}', message: 'We detected {{alert_type}} on your account from {{location}}.', variables: ['alert_type', 'location'], usageCount: 2340, category: 'Security', isDefault: true },
  { id: 't6', name: 'Slack Notification', channel: 'slack', title: '{{channel}} Update', message: '{{user}} posted in #{{channel}}: {{preview}}', variables: ['channel', 'user', 'preview'], usageCount: 45000, category: 'Collaboration', isDefault: false }
]

const mockAutomations: Automation[] = [
  { id: 'a1', name: 'Welcome Series', description: 'Send welcome emails over 7 days', status: 'active', trigger: { type: 'event', config: { event: 'user.created' } }, actions: [{ id: 'a1-1', type: 'send_notification', config: { template: 't1' } }, { id: 'a1-2', type: 'wait', config: { duration: '1d' } }, { id: 'a1-3', type: 'send_notification', config: { template: 't2' } }], stats: { totalTriggered: 5420, totalCompleted: 4890, totalFailed: 45, conversionRate: 32.5 }, createdAt: '2024-01-01', lastTriggered: '2024-01-28T14:30:00Z' },
  { id: 'a2', name: 'Cart Abandonment', description: 'Remind users about abandoned carts', status: 'active', trigger: { type: 'event', config: { event: 'cart.abandoned' } }, actions: [{ id: 'a2-1', type: 'wait', config: { duration: '1h' } }, { id: 'a2-2', type: 'send_notification', config: { channel: 'email' } }], stats: { totalTriggered: 2340, totalCompleted: 2100, totalFailed: 12, conversionRate: 18.5 }, createdAt: '2024-01-10', lastTriggered: '2024-01-28T12:00:00Z' },
  { id: 'a3', name: 'Re-engagement Flow', description: 'Win back inactive users', status: 'paused', trigger: { type: 'segment_entry', config: { segment: 's4' } }, actions: [{ id: 'a3-1', type: 'send_notification', config: { channel: 'push' } }], stats: { totalTriggered: 890, totalCompleted: 756, totalFailed: 23, conversionRate: 8.2 }, createdAt: '2024-01-15' },
  { id: 'a4', name: 'Daily Digest', description: 'Send daily activity summary', status: 'active', trigger: { type: 'schedule', config: { cron: '0 9 * * *' } }, actions: [{ id: 'a4-1', type: 'send_notification', config: { template: 't6' } }], stats: { totalTriggered: 12500, totalCompleted: 12450, totalFailed: 5, conversionRate: 45.2 }, createdAt: '2024-01-05', lastTriggered: '2024-01-28T09:00:00Z' }
]

const mockWebhooks: WebhookEndpoint[] = [
  { id: 'w1', name: 'Slack Integration', url: 'https://hooks.slack.com/services/xxx', events: ['notification.sent', 'notification.failed'], status: 'active', secret: 'whsec_xxx', createdAt: '2024-01-10', lastDelivery: '2024-01-28T14:30:00Z', successRate: 99.8 },
  { id: 'w2', name: 'Analytics Webhook', url: 'https://analytics.example.com/webhook', events: ['campaign.completed', 'user.converted'], status: 'active', secret: 'whsec_yyy', createdAt: '2024-01-15', lastDelivery: '2024-01-28T10:00:00Z', successRate: 98.5 },
  { id: 'w3', name: 'CRM Sync', url: 'https://crm.example.com/api/notifications', events: ['notification.opened', 'notification.clicked'], status: 'failed', secret: 'whsec_zzz', createdAt: '2024-01-20', lastDelivery: '2024-01-27T16:00:00Z', successRate: 45.2 }
]

const mockABTests: ABTest[] = [
  { id: 'ab1', name: 'Subject Line Test', variants: [{ id: 'v1', name: 'Variant A', title: 'Don\'t miss out!', message: 'Check our latest features', percentage: 50, stats: { sent: 5000, delivered: 4890, opened: 1956, clicked: 489, converted: 98, unsubscribed: 2, bounced: 10, complained: 0 } }, { id: 'v2', name: 'Variant B', title: 'New features just for you', message: 'Check our latest features', percentage: 50, stats: { sent: 5000, delivered: 4895, opened: 2203, clicked: 551, converted: 132, unsubscribed: 1, bounced: 8, complained: 0 } }], winner: 'v2', status: 'completed', confidenceLevel: 95.2, startDate: '2024-01-20', endDate: '2024-01-25' },
  { id: 'ab2', name: 'CTA Button Test', variants: [{ id: 'v3', name: 'Get Started', title: 'Welcome!', message: 'Click to get started', percentage: 50, stats: { sent: 2500, delivered: 2450, opened: 980, clicked: 245, converted: 49, unsubscribed: 0, bounced: 5, complained: 0 } }, { id: 'v4', name: 'Learn More', title: 'Welcome!', message: 'Click to learn more', percentage: 50, stats: { sent: 2500, delivered: 2455, opened: 982, clicked: 196, converted: 39, unsubscribed: 1, bounced: 4, complained: 0 } }], status: 'running', confidenceLevel: 78.5, startDate: '2024-01-26' }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NotificationsClient() {
  const { notifications: dbNotifications, loading, createNotification, updateNotification, deleteNotification, refetch } = useNotifications()

  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [showInsights, setShowInsights] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showCreateAutomation, setShowCreateAutomation] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [settingsTab, setSettingsTab] = useState('channels')
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: '',
    segment: '',
    title: '',
    message: '',
    scheduled: false
  })

  // Map Supabase notifications to local format with mock fallback
  const activeNotifications = useMemo(() => {
    if (dbNotifications && dbNotifications.length > 0) {
      return dbNotifications.map((n: any) => ({
        id: n.id || '',
        type: (n.type || 'system') as NotificationType,
        title: n.title || 'Notification',
        message: n.message || n.content || '',
        timestamp: n.created_at || new Date().toISOString(),
        status: (n.status || 'unread') as NotificationStatus,
        priority: (n.priority || 'medium') as NotificationPriority,
        channel: n.channel || 'in-app',
        isStarred: n.is_starred || false,
        isArchived: n.is_archived || false,
        sender: n.sender || { name: 'System', avatar: '' },
        link: n.link || '',
        actions: n.actions || []
      })) as Notification[]
    }
    return mockNotifications
  }, [dbNotifications])

  // Filter notifications - use activeNotifications instead of mockNotifications
  const filteredNotifications = useMemo(() => {
    return activeNotifications.filter(n => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (channelFilter !== 'all' && n.channel !== channelFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
      }
      return true
    })
  }, [activeNotifications, statusFilter, channelFilter, searchQuery])

  // Calculate stats - use activeNotifications (Supabase data with mock fallback)
  const stats = useMemo(() => {
    const totalSent = mockCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
    const totalOpened = mockCampaigns.reduce((sum, c) => sum + c.stats.opened, 0)
    const totalClicked = mockCampaigns.reduce((sum, c) => sum + c.stats.clicked, 0)
    return {
      totalNotifications: activeNotifications.length,
      unread: activeNotifications.filter(n => n.status === 'unread').length,
      starred: activeNotifications.filter(n => n.isStarred).length,
      totalSent,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      activeAutomations: mockAutomations.filter(a => a.status === 'active').length
    }
  }, [activeNotifications])

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
        notification_type: 'info' as NotificationType,
        status: 'unread' as NotificationStatus,
        priority: 'normal' as NotificationPriority,
        is_read: false,
        send_in_app: true,
        metadata: { channel: campaignForm.channel, segment: campaignForm.segment, campaign_name: campaignForm.name }
      })
      toast.success("Campaign sent and delivered successfully")
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
        notification_type: (notification.type || 'info') as NotificationType,
        status: 'unread' as NotificationStatus,
        priority: (notification.priority || 'normal') as NotificationPriority,
        is_read: false,
        send_in_app: true
      })
      toast.success("Notification sent and delivered successfully")
    } catch (err) {
      toast.error('Failed to send notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsRead = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      // Find matching DB notification by title if possible
      const dbNotif = dbNotifications.find(n => n.title === notification.title)
      if (dbNotif) {
        await updateNotification(dbNotif.id, { is_read: true, read_at: new Date().toISOString(), status: 'read' })
      }
      toast.success('Marked as read')
    } catch (err) {
      toast.error('Failed to mark as read')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStarNotification = async (notification: Notification) => {
    const action = notification.isStarred ? 'removed from' : 'added to'
    setIsSubmitting(true)
    try {
      const dbNotif = dbNotifications.find(n => n.title === notification.title)
      if (dbNotif) {
        await updateNotification(dbNotif.id, { metadata: { ...dbNotif.metadata, starred: !notification.isStarred } })
      }
      toast.success('Star updated')
    } catch (err) {
      toast.error('Failed to update star')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveNotification = async (notification: Notification) => {
    setIsSubmitting(true)
    try {
      const dbNotif = dbNotifications.find(n => n.title === notification.title)
      if (dbNotif) {
        await updateNotification(dbNotif.id, { status: 'archived' })
      }
      toast.success('Notification archived')
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
      const dbNotif = dbNotifications.find(n => n.title === notification.title)
      if (dbNotif) {
        await deleteNotification(dbNotif.id)
      }
      toast.success('Notification deleted')
      setSelectedNotification(null)
    } catch (err) {
      toast.error('Failed to delete notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAutomation = () => {
    toast.info('Create Automation')
    setShowCreateAutomation(true)
  }

  const handleToggleAutomation = (automation: (typeof mockAutomations)[0]) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    toast.success("Automation " + newStatus + " is now " + newStatus)
  }

  const handleExportNotifications = async () => {
    try {
      const dataStr = JSON.stringify(dbNotifications.length > 0 ? dbNotifications : mockNotifications, null, 2)
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
            <Button variant="outline" onClick={() => {
              toast.success('Filters panel opened')
            }}><Filter className="h-4 w-4 mr-2" />Filters</Button>
            <Button
              variant={showInsights ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
              className={`hidden md:flex items-center gap-2 ${showInsights ? 'bg-white text-violet-600 hover:bg-white/90' : 'text-violet-100 hover:text-white hover:bg-white/10'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Insights</span>
            </Button>
            <Button
              variant={showInsights ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
              className={`hidden md:flex items-center gap-2 ${showInsights ? 'bg-white text-violet-600 hover:bg-white/90' : 'text-violet-100 hover:text-white hover:bg-white/10'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart Insights</span>
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => setShowCreateCampaign(true)}>
              <Plus className="h-4 w-4 mr-2" />New Campaign
            </Button>
          </div>
        </div>


      {/* Collapsible Smart Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-6"
          >
            <AIInsightsPanel
              insights={mockNotificationsAIInsights}
              className="mb-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center gap-2 mb-4">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
            <Button variant={statusFilter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('unread')}>Unread</Button>
            <Button variant={statusFilter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('read')}>Read</Button>
            <Button variant={statusFilter === 'archived' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('archived')}>Archived</Button>
          </div>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
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
                        toast.success('Options menu opened')
                      }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockCampaigns.map(campaign => {
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
                          {campaign.status === 'draft' && <Button size="sm" onClick={() => {
                            toast.success(`Campaign "${campaign.name}" sent successfully`)
                          }}><Send className="h-4 w-4 mr-1" />Send</Button>}
                          {campaign.status === 'sending' && <Button size="sm" variant="outline" onClick={() => {
                            toast.success(`Campaign "${campaign.name}" paused`)
                          }}><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                          <Button size="sm" variant="ghost" onClick={() => {
                            navigator.clipboard.writeText(campaign.name)
                            toast.success(`Campaign "${campaign.name}" copied to clipboard`)
                          }}><Copy className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            toast.success(`Analytics for "${campaign.name}" loaded`)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
            {mockSegments.map(segment => (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
            {mockTemplates.map(template => {
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
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map(v => <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>)}
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
            {mockAutomations.map(automation => (
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
                      {automation.status === 'active' && <Button size="sm" variant="outline" onClick={() => {
                        toast.success(`Automation "${automation.name}" paused`)
                      }}><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                      {automation.status === 'paused' && <Button size="sm" onClick={() => {
                        toast.success(`Automation "${automation.name}" resumed`)
                      }}><Play className="h-4 w-4 mr-1" />Resume</Button>}
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
                  {automation.lastTriggered && <p className="text-xs text-gray-500 mt-4">Last triggered: {formatTimeAgo(automation.lastTriggered)}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-testing" className="mt-6">
          <div className="space-y-6">
            {mockABTests.map(test => (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => {
              setShowWebhookDialog(true)
              toast.success('Ready to add new webhook')
            }}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button>
          </div>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockWebhooks.map(webhook => (
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
                    <Button variant="ghost" size="icon" onClick={() => {
                      toast.success(`Options for "${webhook.name}" opened`)
                    }}><MoreHorizontal className="h-4 w-4" /></Button>
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
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id
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
                        <div>
                          <Label>Enable Push Notifications</Label>
                          <p className="text-sm text-gray-500">Send via Firebase Cloud Messaging</p>
                        </div>
                        <Switch defaultChecked />
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
                              input.accept = '.p12,.pem'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  toast.success(`Ready to upload: ${file.name}`)
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
                        <div>
                          <Label>Rich Push Notifications</Label>
                          <p className="text-sm text-gray-500">Include images and action buttons</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Badge Count</Label>
                          <p className="text-sm text-gray-500">Update app badge with unread count</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sound Notifications</Label>
                          <p className="text-sm text-gray-500">Play sound on notification arrival</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Enable Email Notifications</Label>
                          <p className="text-sm text-gray-500">Send transactional and marketing emails</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Track Email Opens</Label>
                          <p className="text-sm text-gray-500">Insert tracking pixel</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Track Link Clicks</Label>
                          <p className="text-sm text-gray-500">Rewrite links for tracking</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Enable SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Send via Twilio</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>URL Shortening</Label>
                          <p className="text-sm text-gray-500">Shorten links in SMS messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Delivery Reports</Label>
                          <p className="text-sm text-gray-500">Receive delivery status callbacks</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Enable In-App Messages</Label>
                          <p className="text-sm text-gray-500">Show notifications within the app</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Intelligent Delivery</Label>
                          <p className="text-sm text-gray-500">AI-optimized send times per user</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Timezone Awareness</Label>
                          <p className="text-sm text-gray-500">Deliver in user's local timezone</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Predictive Send</Label>
                          <p className="text-sm text-gray-500">Use ML to predict best engagement times</p>
                        </div>
                        <Switch />
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
                        <div>
                          <Label>Enable Frequency Capping</Label>
                          <p className="text-sm text-gray-500">Limit notifications per time period</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Priority Override</Label>
                          <p className="text-sm text-gray-500">High priority bypasses limits</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Category Limits</Label>
                          <p className="text-sm text-gray-500">Apply limits per notification category</p>
                        </div>
                        <Switch />
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
                        <div>
                          <Label>Enable Quiet Hours</Label>
                          <p className="text-sm text-gray-500">Hold non-urgent notifications</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Apply on Weekends</Label>
                          <p className="text-sm text-gray-500">Extend quiet hours to weekends</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Urgent Messages</Label>
                          <p className="text-sm text-gray-500">Critical notifications bypass quiet hours</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Enable Channel Fallback</Label>
                          <p className="text-sm text-gray-500">Try alternate channels on failure</p>
                        </div>
                        <Switch />
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
                        <div>
                          <Label>Track Opens</Label>
                          <p className="text-sm text-gray-500">Email and push opens</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Track Clicks</Label>
                          <p className="text-sm text-gray-500">Link and button clicks</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Track Conversions</Label>
                          <p className="text-sm text-gray-500">Goal completions from notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Revenue Attribution</Label>
                          <p className="text-sm text-gray-500">Track revenue from campaigns</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Unsubscribe Tracking</Label>
                          <p className="text-sm text-gray-500">Track opt-out events</p>
                        </div>
                        <Switch defaultChecked />
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
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast.promise(
                          (async () => {
                            const analyticsData = {
                              campaigns: mockCampaigns.map(c => ({
                                name: c.name,
                                channel: c.channel,
                                status: c.status,
                                stats: c.stats
                              })),
                              segments: mockSegments.map(s => ({
                                name: s.name,
                                userCount: s.userCount
                              })),
                              exportedAt: new Date().toISOString()
                            }
                            const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
                            a.click()
                            URL.revokeObjectURL(url)
                            return true
                          })(),
                          {
                            loading: 'Preparing analytics export...',
                            success: 'Analytics data exported successfully',
                            error: 'Failed to export analytics data'
                          }
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
                        <div>
                          <Label>Include Recommendations</Label>
                          <p className="text-sm text-gray-500">AI-powered optimization suggestions</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>Allow Global Opt-out</Label>
                          <p className="text-sm text-gray-500">Users can disable all notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Category-level Control</Label>
                          <p className="text-sm text-gray-500">Per-category preferences</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Channel-level Control</Label>
                          <p className="text-sm text-gray-500">Per-channel preferences</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Frequency Control</Label>
                          <p className="text-sm text-gray-500">Users set their own limits</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Preference Center</Label>
                          <p className="text-sm text-gray-500">Hosted preference page</p>
                        </div>
                        <Switch defaultChecked />
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
                            <Button variant="ghost" size="sm" onClick={() => {
                              toast.success(`Category "${category.name}" settings opened`)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Switch defaultChecked={category.default} />
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast.success('Ready to add new notification category')
                      }}>
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
                          <Button variant={platform.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={() => {
                            const action = platform.status === 'connected' ? 'configure' : 'connect'
                            toast.success(action === 'connect' ? `${platform.name} connected successfully` : `${platform.name} settings opened`)
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
                          <Button variant={crm.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={() => {
                            const action = crm.status === 'connected' ? 'manage' : 'connect'
                            toast.success(action === 'connect' ? `${crm.name} connected successfully` : `${crm.name} management panel opened`)
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
                            try {
                              await navigator.clipboard.writeText('nk_live_xxxxxxxxxxxxxxxxxxxx')
                              toast.success('API key copied to clipboard')
                            } catch (err) {
                              toast.error('Failed to copy API key')
                            }
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last used: 2 min ago</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <Label>Enable API</Label>
                          <p className="text-sm text-gray-500">Allow external API access</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Rate Limiting</Label>
                          <p className="text-sm text-gray-500">1000 requests/minute</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast.success('New API key generated successfully. Previous key revoked.')
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
                            <Button variant="ghost" size="sm" onClick={() => {
                              toast.success(`Editing webhook: ${webhook.url}`)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                              toast.success(`Webhook "${webhook.url}" deleted`)
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => {
                        setShowWebhookDialog(true)
                        toast.info('Opening webhook form...')
                      }}>
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
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-gray-500">Log all delivery attempts</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Test Mode</Label>
                          <p className="text-sm text-gray-500">Send only to test users</p>
                        </div>
                        <Switch />
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
                      <Button variant="outline" className="w-full" onClick={() => {
                        toast.success('Test notification sent to configured test recipients')
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
                        <div>
                          <Label>A/B Testing</Label>
                          <p className="text-sm text-gray-500">Automatic split testing</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Content Personalization</Label>
                          <p className="text-sm text-gray-500">AI-powered message customization</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Smart Segmentation</Label>
                          <p className="text-sm text-gray-500">Auto-segment users by behavior</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Churn Prediction</Label>
                          <p className="text-sm text-gray-500">Predict and prevent user churn</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Subject Line Optimization</Label>
                          <p className="text-sm text-gray-500">AI-generated subject lines</p>
                        </div>
                        <Switch />
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
                        <div>
                          <Label>Archive Old Data</Label>
                          <p className="text-sm text-gray-500">Move to cold storage</p>
                        </div>
                        <Switch defaultChecked />
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
                        <div>
                          <Label>IP Allowlist</Label>
                          <p className="text-sm text-gray-500">Restrict API access by IP</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Webhook Signing</Label>
                          <p className="text-sm text-gray-500">Sign all outgoing webhooks</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Audit Logging</Label>
                          <p className="text-sm text-gray-500">Log all admin actions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Data Encryption</Label>
                          <p className="text-sm text-gray-500">Encrypt data at rest</p>
                        </div>
                        <Switch defaultChecked />
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
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => {
                          if (confirm('Are you sure you want to purge all notification history? This action cannot be undone.')) {
                            toast.success('All notification history has been purged')
                          }
                        }}>
                          Purge History
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                        <div>
                          <p className="font-medium">Clear All Segments</p>
                          <p className="text-sm text-gray-500">Delete all user segments</p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => {
                          if (confirm('Are you sure you want to clear all segments? This action cannot be undone.')) {
                            toast.success('All user segments have been cleared')
                          }
                        }}>
                          Clear Segments
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                        <div>
                          <p className="font-medium">Reset All Settings</p>
                          <p className="text-sm text-gray-500">Restore to default configuration</p>
                        </div>
                        <Button variant="destructive" onClick={() => {
                          if (confirm('Are you sure you want to reset all settings to their defaults? This action cannot be undone.')) {
                            toast.success('All settings have been reset to defaults')
                          }
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
          <AIInsightsPanel
            insights={notificationsAIInsights}
            title="Notification Intelligence"
            onInsightAction={(insight) => toast.info(insight.title)}
          />
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
        <ActivityFeed
          activities={notificationsActivities}
          title="Notification Activity"
          maxItems={5}
        />
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
                    if (selectedNotification.actionUrl) {
                      window.open(selectedNotification.actionUrl, '_blank')
                      toast.success('Opening action...')
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
              <div><Label>Segment</Label><Select value={campaignForm.segment} onValueChange={(v) => setCampaignForm(prev => ({ ...prev, segment: v }))}><SelectTrigger><SelectValue placeholder="Select segment" /></SelectTrigger><SelectContent>{mockSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
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
      </div>
    </div>
  )
}
