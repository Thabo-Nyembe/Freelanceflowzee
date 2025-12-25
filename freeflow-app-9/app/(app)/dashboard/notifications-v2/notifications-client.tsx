'use client'

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Smartphone,
  Globe,
  MessageSquare,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
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
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TestTube,
  Layers,
  Split,
  ChevronRight,
  Activity,
  MousePointer,
  Inbox,
  Webhook,
  Bot,
  Workflow,
  Timer,
  GitBranch,
  Hash,
  AtSign,
  Slack,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Star,
  MoreHorizontal,
  ExternalLink,
  Download,
  Upload,
  Archive,
  Bookmark,
  Flag,
  Link,
  Image,
  FileText,
  Code,
  Terminal
} from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showCreateAutomation, setShowCreateAutomation] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [settingsTab, setSettingsTab] = useState('channels')
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter(n => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (channelFilter !== 'all' && n.channel !== channelFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
      }
      return true
    })
  }, [statusFilter, channelFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const totalSent = mockCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
    const totalOpened = mockCampaigns.reduce((sum, c) => sum + c.stats.opened, 0)
    const totalClicked = mockCampaigns.reduce((sum, c) => sum + c.stats.clicked, 0)
    return {
      totalNotifications: mockNotifications.length,
      unread: mockNotifications.filter(n => n.status === 'unread').length,
      starred: mockNotifications.filter(n => n.isStarred).length,
      totalSent,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      activeAutomations: mockAutomations.filter(a => a.status === 'active').length
    }
  }, [])

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
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
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
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
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
                            {campaign.status === 'draft' && <Button size="sm"><Send className="h-4 w-4 mr-1" />Send</Button>}
                            {campaign.status === 'sending' && <Button size="sm" variant="outline"><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                            <Button size="sm" variant="ghost"><Copy className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost"><BarChart3 className="h-4 w-4" /></Button>
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
            <div className="grid grid-cols-3 gap-6">
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
            <div className="grid grid-cols-2 gap-6">
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
                        {automation.status === 'active' && <Button size="sm" variant="outline"><Pause className="h-4 w-4 mr-1" />Pause</Button>}
                        {automation.status === 'paused' && <Button size="sm"><Play className="h-4 w-4 mr-1" />Resume</Button>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Trigger: {automation.trigger.type}</Badge>
                      <Badge variant="outline">{automation.actions.length} actions</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
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
                    <div className="grid grid-cols-2 gap-6">
                      {test.variants.map(variant => (
                        <div key={variant.id} className={`p-4 rounded-lg ${test.winner === variant.id ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{variant.name}</h4>
                            {test.winner === variant.id && <Badge className="bg-green-500">Winner</Badge>}
                          </div>
                          <p className="text-sm font-medium mb-1">{variant.title}</p>
                          <p className="text-sm text-gray-500 mb-4">{variant.message}</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
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
              <Button><Plus className="h-4 w-4 mr-2" />Add Webhook</Button>
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
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="channels"><Smartphone className="h-4 w-4 mr-2" />Channels</TabsTrigger>
                <TabsTrigger value="delivery"><Send className="h-4 w-4 mr-2" />Delivery</TabsTrigger>
                <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
                <TabsTrigger value="preferences"><BellRing className="h-4 w-4 mr-2" />Preferences</TabsTrigger>
                <TabsTrigger value="integrations"><Link className="h-4 w-4 mr-2" />Integrations</TabsTrigger>
                <TabsTrigger value="advanced"><Settings className="h-4 w-4 mr-2" />Advanced</TabsTrigger>
              </TabsList>

              {/* Channels Settings */}
              <TabsContent value="channels">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Push Notifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable Push</p><p className="text-sm text-gray-500">Send via Firebase Cloud Messaging</p></div><Switch defaultChecked /></div>
                      <div><Label>FCM Server Key</Label><Input type="password" placeholder="Enter server key" className="mt-1" /></div>
                      <div><Label>iOS Certificate</Label><div className="mt-1 flex items-center gap-2"><Input placeholder="Upload .p12 file" disabled /><Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button></div></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Rich Push</p><p className="text-sm text-gray-500">Include images in notifications</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable Email</p><p className="text-sm text-gray-500">Send via SendGrid</p></div><Switch defaultChecked /></div>
                      <div><Label>SendGrid API Key</Label><Input type="password" placeholder="Enter API key" className="mt-1" /></div>
                      <div><Label>From Email</Label><Input placeholder="noreply@company.com" className="mt-1" /></div>
                      <div><Label>From Name</Label><Input placeholder="Company Name" className="mt-1" /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>SMS Notifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable SMS</p><p className="text-sm text-gray-500">Send via Twilio</p></div><Switch defaultChecked /></div>
                      <div><Label>Twilio Account SID</Label><Input placeholder="Enter Account SID" className="mt-1" /></div>
                      <div><Label>Auth Token</Label><Input type="password" placeholder="Enter Auth Token" className="mt-1" /></div>
                      <div><Label>Phone Number</Label><Input placeholder="+1234567890" className="mt-1" /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Slack Integration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable Slack</p><p className="text-sm text-gray-500">Send to Slack channels</p></div><Switch defaultChecked /></div>
                      <div><Label>Webhook URL</Label><Input placeholder="https://hooks.slack.com/..." className="mt-1" /></div>
                      <div><Label>Default Channel</Label><Input placeholder="#notifications" className="mt-1" /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Thread Replies</p><p className="text-sm text-gray-500">Group related messages</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Delivery Settings */}
              <TabsContent value="delivery">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Timing Optimization</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Smart Delivery</p><p className="text-sm text-gray-500">Optimize send time per user</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Timezone Aware</p><p className="text-sm text-gray-500">Respect user timezones</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Predictive Send</p><p className="text-sm text-gray-500">AI-optimized delivery times</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Frequency Control</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Frequency Capping</p><p className="text-sm text-gray-500">Limit notifications per day</p></div><Switch defaultChecked /></div>
                      <div><Label>Max per Day</Label><Select defaultValue="5"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3 notifications</SelectItem><SelectItem value="5">5 notifications</SelectItem><SelectItem value="10">10 notifications</SelectItem><SelectItem value="unlimited">Unlimited</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Priority Override</p><p className="text-sm text-gray-500">Urgent bypasses limits</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Quiet Hours</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable Quiet Hours</p><p className="text-sm text-gray-500">Pause non-urgent notifications</p></div><Switch defaultChecked /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Start</Label><Input type="time" defaultValue="22:00" className="mt-1" /></div>
                        <div><Label>End</Label><Input type="time" defaultValue="08:00" className="mt-1" /></div>
                      </div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Weekend Quiet</p><p className="text-sm text-gray-500">Apply quiet hours on weekends</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Fallback Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Fallback Channels</p><p className="text-sm text-gray-500">Try alternate channels on failure</p></div><Switch /></div>
                      <div><Label>Primary Channel</Label><Select defaultValue="push"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="push">Push</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent></Select></div>
                      <div><Label>Fallback Order</Label><Select defaultValue="email_sms"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="email_sms">Email → SMS</SelectItem><SelectItem value="sms_email">SMS → Email</SelectItem></SelectContent></Select></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Settings */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Tracking</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Track Opens</p><p className="text-sm text-gray-500">Track email and push opens</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Track Clicks</p><p className="text-sm text-gray-500">Track link clicks</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Track Conversions</p><p className="text-sm text-gray-500">Track goal completions</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Revenue Attribution</p><p className="text-sm text-gray-500">Track revenue from campaigns</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Export Format</Label><Select defaultValue="csv"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="json">JSON</SelectItem><SelectItem value="xlsx">Excel</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Auto Export</p><p className="text-sm text-gray-500">Daily automated exports</p></div><Switch /></div>
                      <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" />Export All Data</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Third-Party Analytics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Google Analytics</p><p className="text-sm text-gray-500">Send events to GA</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Mixpanel</p><p className="text-sm text-gray-500">Send events to Mixpanel</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Amplitude</p><p className="text-sm text-gray-500">Send events to Amplitude</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Reporting</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Report Frequency</Label><Select defaultValue="weekly"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Email Reports</p><p className="text-sm text-gray-500">Send reports via email</p></div><Switch defaultChecked /></div>
                      <div><Label>Recipients</Label><Input placeholder="team@company.com" className="mt-1" /></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Preferences Settings */}
              <TabsContent value="preferences">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>User Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Allow Opt-out</p><p className="text-sm text-gray-500">Let users manage preferences</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Category Selection</p><p className="text-sm text-gray-500">Per-category opt-out</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Channel Selection</p><p className="text-sm text-gray-500">Per-channel opt-out</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Default Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Default Push</Label><Select defaultValue="on"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on">Enabled</SelectItem><SelectItem value="off">Disabled</SelectItem></SelectContent></Select></div>
                      <div><Label>Default Email</Label><Select defaultValue="on"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on">Enabled</SelectItem><SelectItem value="off">Disabled</SelectItem></SelectContent></Select></div>
                      <div><Label>Default SMS</Label><Select defaultValue="off"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on">Enabled</SelectItem><SelectItem value="off">Disabled</SelectItem></SelectContent></Select></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Connected Services</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Slack', status: 'connected', icon: Slack },
                        { name: 'Discord', status: 'disconnected', icon: MessageSquare },
                        { name: 'MS Teams', status: 'connected', icon: Users },
                        { name: 'Intercom', status: 'disconnected', icon: MessageSquare },
                      ].map(service => (
                        <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${service.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <service.icon className={`h-4 w-4 ${service.status === 'connected' ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                            <div><p className="font-medium">{service.name}</p><p className="text-xs text-gray-500">{service.status}</p></div>
                          </div>
                          <Button variant="outline" size="sm">{service.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>API Access</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>API Key</Label><div className="flex items-center gap-2 mt-1"><Input value="STRIPE_KEY_PLACEHOLDER" disabled /><Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button></div></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable API</p><p className="text-sm text-gray-500">Allow API access</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Rate Limiting</p><p className="text-sm text-gray-500">1000 requests/min</p></div><Switch defaultChecked /></div>
                      <Button variant="outline" className="w-full"><RefreshCw className="h-4 w-4 mr-2" />Regenerate API Key</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Testing & Debug</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Debug Mode</p><p className="text-sm text-gray-500">Log all delivery attempts</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Test Mode</p><p className="text-sm text-gray-500">Send only to test users</p></div><Switch /></div>
                      <div><Label>Test Email</Label><Input placeholder="test@company.com" className="mt-1" /></div>
                      <Button variant="outline" className="w-full"><TestTube className="h-4 w-4 mr-2" />Send Test Notification</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>AI Features</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">A/B Testing</p><p className="text-sm text-gray-500">Enable split testing</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Personalization</p><p className="text-sm text-gray-500">AI-powered content</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Smart Segments</p><p className="text-sm text-gray-500">Auto-segment users</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Churn Prediction</p><p className="text-sm text-gray-500">Predict user churn</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Data Retention</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Notification History</Label><Select defaultValue="90"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="60">60 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent></Select></div>
                      <div><Label>Analytics Data</Label><Select defaultValue="365"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="90">90 days</SelectItem><SelectItem value="180">180 days</SelectItem><SelectItem value="365">1 year</SelectItem><SelectItem value="forever">Forever</SelectItem></SelectContent></Select></div>
                      <Button variant="outline" className="w-full text-red-600"><Trash2 className="h-4 w-4 mr-2" />Purge Old Data</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">IP Allowlist</p><p className="text-sm text-gray-500">Restrict API access</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Webhook Signing</p><p className="text-sm text-gray-500">Sign all webhooks</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Audit Logging</p><p className="text-sm text-gray-500">Log all actions</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

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
                    <Button className="w-full">
                      {selectedNotification.actionLabel || 'View Details'}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1"><Archive className="h-4 w-4 mr-2" />Archive</Button>
                    <Button variant="outline" className="flex-1"><Star className="h-4 w-4 mr-2" />Star</Button>
                    <Button variant="outline" className="flex-1"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
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
              <div><Label>Campaign Name</Label><Input placeholder="e.g., Product Launch" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Channel</Label><Select><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger><SelectContent><SelectItem value="push">Push</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="slack">Slack</SelectItem></SelectContent></Select></div>
                <div><Label>Segment</Label><Select><SelectTrigger><SelectValue placeholder="Select segment" /></SelectTrigger><SelectContent>{mockSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Title</Label><Input placeholder="Notification title" /></div>
              <div><Label>Message</Label><Textarea placeholder="Notification message..." rows={3} /></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /><span className="text-sm">Schedule for later</span></div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600"><Send className="h-4 w-4 mr-2" />Send Now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
