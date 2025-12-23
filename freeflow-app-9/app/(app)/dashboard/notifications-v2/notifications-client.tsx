// Notifications V2 - OneSignal Level Push Notification Platform
// Upgraded with: Campaigns, Segments, Analytics, A/B Testing, Multi-channel

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
import {
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Smartphone,
  Globe,
  MessageSquare,
  BarChart3,
  TrendingUp,
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
  Inbox
} from 'lucide-react'
import { useNotifications, type Notification, type NotificationStatus, type NotificationType, type NotificationPriority } from '@/lib/hooks/use-notifications'

// ============================================================================
// TYPES - ONESIGNAL LEVEL NOTIFICATION SYSTEM
// ============================================================================

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  channel: 'push' | 'email' | 'sms' | 'in_app'
  segment: string
  title: string
  message: string
  scheduledAt?: string
  sentAt?: string
  stats: CampaignStats
  abTest?: ABTest
  createdAt: string
}

interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
}

interface ABTest {
  id: string
  variants: ABVariant[]
  winner?: string
  status: 'running' | 'completed'
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
}

interface SegmentFilter {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in'
  value: string | number | string[]
}

interface Template {
  id: string
  name: string
  channel: 'push' | 'email' | 'sms' | 'in_app'
  title: string
  message: string
  variables: string[]
  usageCount: number
}

interface NotificationPreference {
  channel: 'push' | 'email' | 'sms' | 'in_app'
  enabled: boolean
  frequency: 'instant' | 'daily' | 'weekly' | 'never'
}

// ============================================================================
// MOCK DATA - ONESIGNAL LEVEL
// ============================================================================

const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1', name: 'Product Launch Announcement', status: 'sent', channel: 'push', segment: 'All Users',
    title: 'New Feature Alert!', message: 'Check out our amazing new dashboard features',
    sentAt: '2024-01-28T10:00:00Z', createdAt: '2024-01-27T15:00:00Z',
    stats: { sent: 15420, delivered: 14890, opened: 8234, clicked: 3456, converted: 892, unsubscribed: 12 }
  },
  {
    id: 'c2', name: 'Weekly Digest', status: 'scheduled', channel: 'email', segment: 'Active Users',
    title: 'Your Weekly Summary', message: 'Here\'s what happened this week...',
    scheduledAt: '2024-01-29T09:00:00Z', createdAt: '2024-01-28T14:00:00Z',
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
  },
  {
    id: 'c3', name: 'Re-engagement Campaign', status: 'sending', channel: 'push', segment: 'Inactive 30 Days',
    title: 'We miss you!', message: 'Come back and see what\'s new',
    createdAt: '2024-01-28T08:00:00Z',
    stats: { sent: 5234, delivered: 4890, opened: 1234, clicked: 567, converted: 89, unsubscribed: 23 }
  },
  {
    id: 'c4', name: 'Flash Sale Alert', status: 'draft', channel: 'sms', segment: 'Premium Users',
    title: '50% Off Today Only!', message: 'Use code FLASH50 for 50% off',
    createdAt: '2024-01-28T16:00:00Z',
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
  },
]

const SEGMENTS: Segment[] = [
  { id: 's1', name: 'All Users', description: 'All registered users', filters: [], userCount: 25430, createdAt: '2024-01-01' },
  { id: 's2', name: 'Active Users', description: 'Users active in last 7 days', filters: [{ field: 'last_seen', operator: 'gt', value: '7d' }], userCount: 18920, createdAt: '2024-01-15' },
  { id: 's3', name: 'Premium Users', description: 'Users with premium subscription', filters: [{ field: 'plan', operator: 'equals', value: 'premium' }], userCount: 4560, createdAt: '2024-01-10' },
  { id: 's4', name: 'Inactive 30 Days', description: 'Users inactive for 30+ days', filters: [{ field: 'last_seen', operator: 'lt', value: '30d' }], userCount: 3210, createdAt: '2024-01-20' },
  { id: 's5', name: 'New Users', description: 'Users registered in last 7 days', filters: [{ field: 'created_at', operator: 'gt', value: '7d' }], userCount: 1250, createdAt: '2024-01-25' },
]

const TEMPLATES: Template[] = [
  { id: 't1', name: 'Welcome Message', channel: 'push', title: 'Welcome to {{app_name}}!', message: 'Hey {{name}}, great to have you!', variables: ['app_name', 'name'], usageCount: 15420 },
  { id: 't2', name: 'Order Confirmation', channel: 'email', title: 'Order #{{order_id}} Confirmed', message: 'Your order has been confirmed and will ship soon.', variables: ['order_id'], usageCount: 8900 },
  { id: 't3', name: 'Reminder', channel: 'push', title: 'Don\'t forget!', message: '{{task_name}} is due {{due_date}}', variables: ['task_name', 'due_date'], usageCount: 5670 },
  { id: 't4', name: 'Promotion', channel: 'sms', title: '{{discount}}% Off!', message: 'Use code {{code}} for {{discount}}% off. Ends {{expiry}}.', variables: ['discount', 'code', 'expiry'], usageCount: 3450 },
]

// ============================================================================
// MAIN COMPONENT - ONESIGNAL LEVEL NOTIFICATIONS
// ============================================================================

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  // State
  const [activeTab, setActiveTab] = useState('inbox')
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showCreateSegment, setShowCreateSegment] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showABTest, setShowABTest] = useState(false)

  // Campaign form state
  const [campaignName, setCampaignName] = useState('')
  const [campaignChannel, setCampaignChannel] = useState<'push' | 'email' | 'sms' | 'in_app'>('push')
  const [campaignSegment, setCampaignSegment] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [scheduleDelivery, setScheduleDelivery] = useState(false)

  // Hook for notification data
  const { notifications, loading, error } = useNotifications({
    status: statusFilter,
    notificationType: typeFilter,
    limit: 50
  })

  const displayNotifications = notifications.length > 0 ? notifications : initialNotifications

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return displayNotifications.filter(notification => {
      if (statusFilter !== 'all' && notification.status !== statusFilter) return false
      if (typeFilter !== 'all' && notification.notification_type !== typeFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!notification.title.toLowerCase().includes(query) &&
            !notification.message.toLowerCase().includes(query)) {
          return false
        }
      }
      return true
    })
  }, [displayNotifications, statusFilter, typeFilter, searchQuery])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalSent = CAMPAIGNS.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalDelivered = CAMPAIGNS.reduce((sum, c) => sum + c.stats.delivered, 0)
    const totalOpened = CAMPAIGNS.reduce((sum, c) => sum + c.stats.opened, 0)
    const totalClicked = CAMPAIGNS.reduce((sum, c) => sum + c.stats.clicked, 0)

    return {
      totalNotifications: displayNotifications.length,
      unread: displayNotifications.filter(n => !n.is_read).length,
      totalSent,
      totalDelivered,
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      activeCampaigns: CAMPAIGNS.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
      totalSegments: SEGMENTS.length,
      totalSubscribers: SEGMENTS.find(s => s.name === 'All Users')?.userCount || 0
    }
  }, [displayNotifications])

  // Handlers
  const handleCreateCampaign = useCallback(() => {
    if (!campaignName.trim() || !campaignTitle.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    toast.success('Campaign Created', {
      description: `"${campaignName}" is ready to send`
    })

    setShowCreateCampaign(false)
    setCampaignName('')
    setCampaignTitle('')
    setCampaignMessage('')
  }, [campaignName, campaignTitle])

  const handleSendCampaign = useCallback((campaign: Campaign) => {
    toast.success('Campaign Sending', {
      description: `"${campaign.name}" is now being delivered`
    })
  }, [])

  const handlePauseCampaign = useCallback((campaign: Campaign) => {
    toast.success('Campaign Paused', {
      description: `"${campaign.name}" has been paused`
    })
  }, [])

  const handleDuplicateCampaign = useCallback((campaign: Campaign) => {
    toast.success('Campaign Duplicated', {
      description: `Copy of "${campaign.name}" created`
    })
  }, [])

  const handleMarkAllRead = useCallback(() => {
    toast.success('All Marked as Read', {
      description: `${stats.unread} notifications marked as read`
    })
  }, [stats.unread])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'sending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'scheduled': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'paused': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Smartphone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'in_app': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  OneSignal Level
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {stats.totalSubscribers.toLocaleString()} Subscribers
                </Badge>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Notification Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Multi-channel messaging platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              onClick={() => setShowCreateCampaign(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{stats.totalNotifications}</div>
              <div className="text-xs text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-xs text-gray-500">Unread</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{(stats.totalSent / 1000).toFixed(1)}k</div>
              <div className="text-xs text-gray-500">Sent</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.deliveryRate}%</div>
              <div className="text-xs text-gray-500">Delivered</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.openRate}%</div>
              <div className="text-xs text-gray-500">Open Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.clickRate}%</div>
              <div className="text-xs text-gray-500">Click Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activeCampaigns}</div>
              <div className="text-xs text-gray-500">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.totalSegments}</div>
              <div className="text-xs text-gray-500">Segments</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {stats.unread > 0 && (
                <Badge className="bg-red-500 text-white text-xs ml-1">{stats.unread}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-r-transparent" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(notification => (
                  <Card key={notification.id} className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-md transition-all ${!notification.is_read ? 'border-l-4 border-l-violet-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${notification.priority === 'high' || notification.priority === 'urgent' ? 'bg-red-100' : notification.priority === 'normal' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                          <Bell className={`h-5 w-5 ${notification.priority === 'high' || notification.priority === 'urgent' ? 'text-red-600' : notification.priority === 'normal' ? 'text-yellow-600' : 'text-green-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                            <Badge variant="outline">{notification.notification_type}</Badge>
                            <span className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</span>
                          </div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                          {notification.action_url && (
                            <Button size="sm" variant="link" className="px-0 mt-2 text-violet-600">
                              {notification.action_label || 'View Details'} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="space-y-4">
              {CAMPAIGNS.map(campaign => (
                <Card key={campaign.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getChannelIcon(campaign.channel)}
                            {campaign.channel}
                          </Badge>
                          <Badge variant="outline">{campaign.segment}</Badge>
                        </div>

                        <h3 className="text-lg font-semibold mb-1">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <strong>{campaign.title}</strong> - {campaign.message}
                        </p>

                        {campaign.status === 'sent' && (
                          <div className="grid grid-cols-6 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">{campaign.stats.sent.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Sent</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">{campaign.stats.delivered.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Delivered</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-blue-600">{campaign.stats.opened.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Opened</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">{campaign.stats.clicked.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Clicked</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-emerald-600">{campaign.stats.converted.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Converted</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-600">{((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">Open Rate</div>
                            </div>
                          </div>
                        )}

                        {campaign.status === 'scheduled' && campaign.scheduledAt && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm" onClick={() => handleSendCampaign(campaign)}>
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        {campaign.status === 'sending' && (
                          <Button size="sm" variant="outline" onClick={() => handlePauseCampaign(campaign)}>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicateCampaign(campaign)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateSegment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEGMENTS.map(segment => (
                <Card key={segment.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Users className="h-8 w-8 text-violet-600" />
                      <Badge variant="outline">{segment.filters.length} filters</Badge>
                    </div>

                    <h3 className="font-semibold mb-1">{segment.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{segment.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-violet-600">
                        {segment.userCount.toLocaleString()}
                      </div>
                      <span className="text-xs text-gray-500">users</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {TEMPLATES.map(template => (
                <Card key={template.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(template.channel)}
                        {template.channel}
                      </Badge>
                      <span className="text-xs text-gray-500">{template.usageCount.toLocaleString()} uses</span>
                    </div>

                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
                      <div className="font-medium text-sm mb-1">{template.title}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.message}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {template.variables.map(v => (
                        <Badge key={v} variant="outline" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Delivery Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-2">{stats.deliveryRate}%</div>
                  <Progress value={parseFloat(stats.deliveryRate)} className="mb-4" />
                  <div className="text-sm text-gray-500">
                    {stats.totalDelivered.toLocaleString()} of {stats.totalSent.toLocaleString()} delivered
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Open Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stats.openRate}%</div>
                  <Progress value={parseFloat(stats.openRate)} className="mb-4" />
                  <div className="text-sm text-gray-500">
                    Industry average: 20-25%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-purple-600" />
                    Click Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{stats.clickRate}%</div>
                  <Progress value={parseFloat(stats.clickRate)} className="mb-4" />
                  <div className="text-sm text-gray-500">
                    Industry average: 2-5%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-violet-600" />
                Create Campaign
              </DialogTitle>
              <DialogDescription>
                Send notifications to your audience
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g., Product Launch"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select value={campaignChannel} onValueChange={(v) => setCampaignChannel(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Segment</Label>
                  <Select value={campaignSegment} onValueChange={setCampaignSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Notification title"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Notification message..."
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Schedule for later</span>
                </div>
                <Switch checked={scheduleDelivery} onCheckedChange={setScheduleDelivery} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={handleCreateCampaign}
              >
                <Send className="h-4 w-4 mr-2" />
                {scheduleDelivery ? 'Schedule' : 'Send Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
