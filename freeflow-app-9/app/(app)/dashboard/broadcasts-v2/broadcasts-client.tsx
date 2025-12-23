'use client'
import { useState, useMemo } from 'react'
import { useBroadcasts, type Broadcast, type BroadcastType, type BroadcastStatus } from '@/lib/hooks/use-broadcasts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Intercom / Customer.io / OneSignal level interfaces
interface Campaign {
  id: string
  name: string
  subject: string
  previewText: string
  content: string
  type: 'email' | 'push' | 'in_app' | 'sms' | 'banner'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'
  audience: AudienceSegment
  schedule: CampaignSchedule | null
  metrics: CampaignMetrics
  createdAt: string
  updatedAt: string
  sentAt?: string
  author: { name: string; avatar: string }
  tags: string[]
  abTest?: ABTest
}

interface AudienceSegment {
  id: string
  name: string
  count: number
  filters: { field: string; operator: string; value: string }[]
}

interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring'
  scheduledFor?: string
  timezone?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
}

interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
  bounced: number
  complained: number
  deliveryRate: number
  openRate: number
  clickRate: number
  conversionRate: number
  revenue: number
}

interface ABTest {
  enabled: boolean
  variants: { id: string; name: string; subject: string; percentage: number }[]
  winner?: string
}

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  usageCount: number
}

interface Subscriber {
  id: string
  email: string
  name: string
  status: 'active' | 'unsubscribed' | 'bounced'
  subscribedAt: string
  lastEngaged: string
  segments: string[]
}

// Intercom Automation interfaces
interface Automation {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
  status: 'active' | 'paused' | 'draft'
  stats: { triggered: number; completed: number; failed: number }
  createdAt: string
  lastTriggered: string
}

interface AutomationTrigger {
  type: 'event' | 'segment_entry' | 'time_based' | 'api'
  event?: string
  segment?: string
  schedule?: string
  conditions: { field: string; operator: string; value: string }[]
}

interface AutomationAction {
  type: 'send_email' | 'send_push' | 'add_tag' | 'remove_tag' | 'update_attribute' | 'wait' | 'split'
  config: Record<string, unknown>
  delay?: string
}

interface Series {
  id: string
  name: string
  description: string
  steps: SeriesStep[]
  status: 'active' | 'paused' | 'draft'
  enrolledCount: number
  completedCount: number
  exitRate: number
  createdAt: string
}

interface SeriesStep {
  id: string
  type: 'email' | 'push' | 'wait' | 'condition' | 'exit'
  name: string
  delay?: string
  content?: string
  condition?: { field: string; operator: string; value: string }
}

interface EventTracking {
  name: string
  count: number
  lastSeen: string
  automations: number
}

// Mock data for Intercom level features
const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Product Launch Announcement',
    subject: 'Introducing our biggest update yet! 🚀',
    previewText: 'New features to supercharge your workflow',
    content: '<h1>Big news!</h1><p>We\'ve launched something incredible...</p>',
    type: 'email',
    status: 'sent',
    audience: { id: 'seg-1', name: 'All Active Users', count: 15420, filters: [{ field: 'status', operator: 'equals', value: 'active' }] },
    schedule: { type: 'scheduled', scheduledFor: '2024-12-18T10:00:00Z', timezone: 'America/New_York' },
    metrics: { sent: 15420, delivered: 15108, opened: 6845, clicked: 2456, converted: 892, unsubscribed: 45, bounced: 312, complained: 8, deliveryRate: 98.0, openRate: 45.3, clickRate: 16.3, conversionRate: 5.9, revenue: 45680 },
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-18T10:00:00Z',
    sentAt: '2024-12-18T10:00:00Z',
    author: { name: 'Sarah Chen', avatar: 'SC' },
    tags: ['Product', 'Launch', 'Major'],
    abTest: { enabled: true, variants: [{ id: 'a', name: 'Emoji Subject', subject: '🚀 Big news!', percentage: 50 }, { id: 'b', name: 'Plain Subject', subject: 'Big news!', percentage: 50 }], winner: 'a' }
  },
  {
    id: 'camp-2',
    name: 'Weekly Digest',
    subject: 'Your weekly summary is here',
    previewText: 'See what you accomplished this week',
    content: '<h1>Weekly Summary</h1><p>Here\'s what happened...</p>',
    type: 'email',
    status: 'sent',
    audience: { id: 'seg-2', name: 'Engaged Users', count: 8750, filters: [{ field: 'last_activity', operator: 'within', value: '7d' }] },
    schedule: { type: 'recurring', frequency: 'weekly', timezone: 'UTC' },
    metrics: { sent: 8750, delivered: 8625, opened: 4890, clicked: 1456, converted: 234, unsubscribed: 12, bounced: 125, complained: 2, deliveryRate: 98.6, openRate: 56.7, clickRate: 16.9, conversionRate: 2.7, revenue: 12340 },
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
    sentAt: '2024-12-20T09:00:00Z',
    author: { name: 'Emily Rodriguez', avatar: 'ER' },
    tags: ['Digest', 'Recurring']
  },
  {
    id: 'camp-3',
    name: 'Black Friday Sale',
    subject: '50% OFF - Today Only! 🔥',
    previewText: 'Don\'t miss our biggest sale of the year',
    content: '<h1>Black Friday Sale</h1><p>50% off everything...</p>',
    type: 'email',
    status: 'sent',
    audience: { id: 'seg-3', name: 'All Subscribers', count: 24560, filters: [] },
    schedule: { type: 'scheduled', scheduledFor: '2024-11-29T00:00:00Z', timezone: 'America/New_York' },
    metrics: { sent: 24560, delivered: 24012, opened: 14890, clicked: 8456, converted: 3456, unsubscribed: 234, bounced: 548, complained: 45, deliveryRate: 97.8, openRate: 62.0, clickRate: 35.2, conversionRate: 14.4, revenue: 234567 },
    createdAt: '2024-11-25T09:00:00Z',
    updatedAt: '2024-11-29T00:00:00Z',
    sentAt: '2024-11-29T00:00:00Z',
    author: { name: 'Marcus Johnson', avatar: 'MJ' },
    tags: ['Sales', 'Holiday', 'Promo']
  },
  {
    id: 'camp-4',
    name: 'New Feature Notification',
    subject: '',
    previewText: '',
    content: 'Check out our new AI features!',
    type: 'push',
    status: 'sent',
    audience: { id: 'seg-4', name: 'Mobile Users', count: 12340, filters: [{ field: 'platform', operator: 'in', value: 'ios,android' }] },
    schedule: { type: 'immediate' },
    metrics: { sent: 12340, delivered: 11890, opened: 4567, clicked: 2345, converted: 567, unsubscribed: 0, bounced: 450, complained: 0, deliveryRate: 96.4, openRate: 38.4, clickRate: 19.7, conversionRate: 4.8, revenue: 23450 },
    createdAt: '2024-12-19T14:00:00Z',
    updatedAt: '2024-12-19T14:00:00Z',
    sentAt: '2024-12-19T14:00:00Z',
    author: { name: 'David Kim', avatar: 'DK' },
    tags: ['Push', 'Feature']
  },
  {
    id: 'camp-5',
    name: 'Holiday Greeting',
    subject: 'Happy Holidays from our team! 🎄',
    previewText: 'Wishing you joy and peace this holiday season',
    content: '<h1>Happy Holidays!</h1><p>Thank you for being part of our community...</p>',
    type: 'email',
    status: 'scheduled',
    audience: { id: 'seg-1', name: 'All Active Users', count: 15420, filters: [{ field: 'status', operator: 'equals', value: 'active' }] },
    schedule: { type: 'scheduled', scheduledFor: '2024-12-25T09:00:00Z', timezone: 'America/New_York' },
    metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, complained: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0, revenue: 0 },
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
    author: { name: 'Sarah Chen', avatar: 'SC' },
    tags: ['Holiday', 'Greeting']
  },
  {
    id: 'camp-6',
    name: 'Welcome Banner',
    subject: '',
    previewText: '',
    content: 'Welcome to the platform! Click here to take a tour.',
    type: 'in_app',
    status: 'sending',
    audience: { id: 'seg-5', name: 'New Users (7 days)', count: 890, filters: [{ field: 'created_at', operator: 'within', value: '7d' }] },
    schedule: null,
    metrics: { sent: 650, delivered: 648, opened: 580, clicked: 456, converted: 234, unsubscribed: 0, bounced: 2, complained: 0, deliveryRate: 99.7, openRate: 89.5, clickRate: 70.4, conversionRate: 36.1, revenue: 0 },
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
    author: { name: 'Lisa Thompson', avatar: 'LT' },
    tags: ['Onboarding', 'In-App']
  }
]

const mockTemplates: Template[] = [
  { id: 't1', name: 'Welcome Email', category: 'Onboarding', thumbnail: '📧', usageCount: 45 },
  { id: 't2', name: 'Product Update', category: 'Product', thumbnail: '🚀', usageCount: 32 },
  { id: 't3', name: 'Weekly Digest', category: 'Engagement', thumbnail: '📊', usageCount: 89 },
  { id: 't4', name: 'Sale Announcement', category: 'Promotions', thumbnail: '🔥', usageCount: 23 },
  { id: 't5', name: 'Feature Release', category: 'Product', thumbnail: '✨', usageCount: 56 },
  { id: 't6', name: 'Re-engagement', category: 'Engagement', thumbnail: '💌', usageCount: 18 }
]

const mockAutomations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Welcome Series',
    description: 'Automatically onboard new users with a multi-step email sequence',
    trigger: { type: 'event', event: 'user.created', conditions: [] },
    actions: [
      { type: 'send_email', config: { template: 'welcome' } },
      { type: 'wait', config: {}, delay: '2d' },
      { type: 'send_email', config: { template: 'getting_started' } }
    ],
    status: 'active',
    stats: { triggered: 4580, completed: 4123, failed: 45 },
    createdAt: '2024-01-15T09:00:00Z',
    lastTriggered: '2024-12-20T14:32:00Z'
  },
  {
    id: 'auto-2',
    name: 'Re-engagement Campaign',
    description: 'Win back inactive users after 30 days of inactivity',
    trigger: { type: 'segment_entry', segment: 'Inactive 30+ days', conditions: [{ field: 'last_activity', operator: 'older_than', value: '30d' }] },
    actions: [
      { type: 'send_email', config: { template: 're_engage' } },
      { type: 'wait', config: {}, delay: '7d' },
      { type: 'send_push', config: { message: 'We miss you!' } }
    ],
    status: 'active',
    stats: { triggered: 2340, completed: 1890, failed: 12 },
    createdAt: '2024-03-10T09:00:00Z',
    lastTriggered: '2024-12-19T08:15:00Z'
  },
  {
    id: 'auto-3',
    name: 'Purchase Follow-up',
    description: 'Send thank you and upsell after purchase',
    trigger: { type: 'event', event: 'purchase.completed', conditions: [] },
    actions: [
      { type: 'send_email', config: { template: 'thank_you' } },
      { type: 'add_tag', config: { tag: 'customer' } },
      { type: 'wait', config: {}, delay: '5d' },
      { type: 'send_email', config: { template: 'upsell' } }
    ],
    status: 'active',
    stats: { triggered: 8920, completed: 8456, failed: 23 },
    createdAt: '2024-02-20T09:00:00Z',
    lastTriggered: '2024-12-20T16:45:00Z'
  },
  {
    id: 'auto-4',
    name: 'Trial Expiration Warning',
    description: 'Notify users before trial ends',
    trigger: { type: 'time_based', schedule: '3 days before trial_end', conditions: [] },
    actions: [
      { type: 'send_email', config: { template: 'trial_ending' } },
      { type: 'send_push', config: { message: 'Your trial ends soon!' } }
    ],
    status: 'paused',
    stats: { triggered: 1234, completed: 1189, failed: 8 },
    createdAt: '2024-04-05T09:00:00Z',
    lastTriggered: '2024-12-15T12:00:00Z'
  }
]

const mockSeries: Series[] = [
  {
    id: 'series-1',
    name: 'Onboarding Journey',
    description: '7-day onboarding sequence for new users',
    steps: [
      { id: 's1-1', type: 'email', name: 'Welcome', content: 'Welcome to the platform!' },
      { id: 's1-2', type: 'wait', name: 'Wait 1 day', delay: '1d' },
      { id: 's1-3', type: 'email', name: 'Setup Guide', content: 'Complete your profile setup' },
      { id: 's1-4', type: 'wait', name: 'Wait 2 days', delay: '2d' },
      { id: 's1-5', type: 'condition', name: 'Check Profile', condition: { field: 'profile_complete', operator: 'equals', value: 'true' } },
      { id: 's1-6', type: 'email', name: 'Pro Tips', content: 'Advanced features guide' }
    ],
    status: 'active',
    enrolledCount: 3450,
    completedCount: 2890,
    exitRate: 16.2,
    createdAt: '2024-01-01T09:00:00Z'
  },
  {
    id: 'series-2',
    name: 'Feature Education',
    description: 'Educate users about key features',
    steps: [
      { id: 's2-1', type: 'email', name: 'Feature 1', content: 'Discover Project Management' },
      { id: 's2-2', type: 'wait', name: 'Wait 3 days', delay: '3d' },
      { id: 's2-3', type: 'email', name: 'Feature 2', content: 'Explore Analytics' },
      { id: 's2-4', type: 'wait', name: 'Wait 3 days', delay: '3d' },
      { id: 's2-5', type: 'email', name: 'Feature 3', content: 'Master Automation' }
    ],
    status: 'active',
    enrolledCount: 2100,
    completedCount: 1560,
    exitRate: 25.7,
    createdAt: '2024-02-15T09:00:00Z'
  }
]

const mockEvents: EventTracking[] = [
  { name: 'user.created', count: 4580, lastSeen: '2024-12-20T14:32:00Z', automations: 2 },
  { name: 'purchase.completed', count: 8920, lastSeen: '2024-12-20T16:45:00Z', automations: 3 },
  { name: 'subscription.upgraded', count: 1234, lastSeen: '2024-12-20T11:20:00Z', automations: 1 },
  { name: 'feature.used', count: 45670, lastSeen: '2024-12-20T17:00:00Z', automations: 0 },
  { name: 'support.ticket.created', count: 890, lastSeen: '2024-12-20T15:30:00Z', automations: 1 },
  { name: 'profile.updated', count: 12340, lastSeen: '2024-12-20T16:55:00Z', automations: 0 }
]

export default function BroadcastsClient({ initialBroadcasts }: { initialBroadcasts: Broadcast[] }) {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [broadcastTypeFilter, setBroadcastTypeFilter] = useState<BroadcastType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BroadcastStatus | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const { broadcasts, loading, error } = useBroadcasts({ broadcastType: broadcastTypeFilter, status: statusFilter })
  const displayBroadcasts = broadcasts.length > 0 ? broadcasts : initialBroadcasts

  // Calculate stats
  const stats = useMemo(() => {
    const sent = mockCampaigns.filter(c => c.status === 'sent')
    const totalSent = sent.reduce((sum, c) => sum + c.metrics.sent, 0)
    const totalDelivered = sent.reduce((sum, c) => sum + c.metrics.delivered, 0)
    const totalOpened = sent.reduce((sum, c) => sum + c.metrics.opened, 0)
    const totalClicked = sent.reduce((sum, c) => sum + c.metrics.clicked, 0)
    const totalRevenue = sent.reduce((sum, c) => sum + c.metrics.revenue, 0)

    return {
      totalCampaigns: mockCampaigns.length,
      sent: sent.length,
      scheduled: mockCampaigns.filter(c => c.status === 'scheduled').length,
      draft: mockCampaigns.filter(c => c.status === 'draft').length,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      avgOpenRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      avgClickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      totalRevenue
    }
  }, [])

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      if (broadcastTypeFilter !== 'all' && campaign.type !== broadcastTypeFilter) return false
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false
      return true
    })
  }, [broadcastTypeFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      case 'sending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'paused': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧'
      case 'push': return '🔔'
      case 'in_app': return '💬'
      case 'sms': return '📱'
      case 'banner': return '🏷️'
      default: return '📨'
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full">Intercom Level</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Customer.io Style</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Broadcasts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Engage your audience with targeted messaging campaigns</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Import Contacts
            </button>
            <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors flex items-center gap-2">
              <span>+ New Campaign</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Campaigns</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sent</div>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Delivered</div>
            <div className="text-2xl font-bold text-blue-600">{(stats.totalDelivered / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Opened</div>
            <div className="text-2xl font-bold text-purple-600">{(stats.totalOpened / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Open Rate</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.avgOpenRate}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Click Rate</div>
            <div className="text-2xl font-bold text-amber-600">{stats.avgClickRate}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</div>
            <div className="text-2xl font-bold text-indigo-600">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="campaigns" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Campaigns</TabsTrigger>
              <TabsTrigger value="automations" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Automations</TabsTrigger>
              <TabsTrigger value="series" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Series</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Templates</TabsTrigger>
              <TabsTrigger value="audience" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Audience</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Events</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <select
                value={broadcastTypeFilter as string}
                onChange={(e) => setBroadcastTypeFilter(e.target.value as BroadcastType | 'all')}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="in_app">In-App</option>
                <option value="sms">SMS</option>
              </select>
              <select
                value={statusFilter as string}
                onChange={(e) => setStatusFilter(e.target.value as BroadcastStatus | 'all')}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <Dialog key={campaign.id}>
                <DialogTrigger asChild>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center text-2xl">
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                            {campaign.abTest?.enabled && (
                              <span className="px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">A/B Test</span>
                            )}
                          </div>
                          {campaign.subject && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.subject}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="capitalize">{campaign.type}</span>
                            <span>To: {campaign.audience.name}</span>
                            <span>({campaign.audience.count.toLocaleString()} recipients)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : campaign.schedule?.scheduledFor ? `Scheduled: ${new Date(campaign.schedule.scheduledFor).toLocaleDateString()}` : 'Draft'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs">
                            {campaign.author.avatar}
                          </div>
                        </div>
                      </div>
                    </div>

                    {campaign.status === 'sent' && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-5 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.metrics.sent.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Sent</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-600">{campaign.metrics.deliveryRate}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Delivered</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-purple-600">{campaign.metrics.openRate}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Opened</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-emerald-600">{campaign.metrics.clickRate}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Clicked</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-amber-600">${campaign.metrics.revenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      {campaign.name}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-6 p-4">
                      {/* Campaign Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Status</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>{campaign.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Type</span>
                              <span className="text-gray-900 dark:text-white capitalize">{campaign.type}</span>
                            </div>
                            {campaign.subject && (
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Subject</span>
                                <span className="text-gray-900 dark:text-white">{campaign.subject}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Author</span>
                              <span className="text-gray-900 dark:text-white">{campaign.author.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Created</span>
                              <span className="text-gray-900 dark:text-white">{new Date(campaign.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Audience</h4>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="font-medium text-gray-900 dark:text-white">{campaign.audience.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {campaign.audience.count.toLocaleString()} recipients
                            </div>
                            {campaign.audience.filters.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {campaign.audience.filters.map((filter, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                                    {filter.field} {filter.operator} {filter.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* A/B Test */}
                      {campaign.abTest?.enabled && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">A/B Test Results</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {campaign.abTest.variants.map(variant => (
                              <div key={variant.id} className={`p-4 rounded-lg border ${variant.id === campaign.abTest?.winner ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white">{variant.name}</span>
                                  {variant.id === campaign.abTest?.winner && (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded text-xs">Winner</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{variant.subject}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{variant.percentage}% of audience</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics */}
                      {campaign.status === 'sent' && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.metrics.sent.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Sent</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">{campaign.metrics.delivered.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Delivered ({campaign.metrics.deliveryRate}%)</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-purple-600">{campaign.metrics.opened.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Opened ({campaign.metrics.openRate}%)</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-emerald-600">{campaign.metrics.clicked.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Clicked ({campaign.metrics.clickRate}%)</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-amber-600">{campaign.metrics.converted.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Converted ({campaign.metrics.conversionRate}%)</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-600">{campaign.metrics.bounced.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Bounced</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-orange-600">{campaign.metrics.unsubscribed}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Unsubscribed</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-indigo-600">${campaign.metrics.revenue.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Tags:</span>
                        {campaign.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            ))}
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mockAutomations.length} automations • {mockAutomations.filter(a => a.status === 'active').length} active
              </div>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                + Create Automation
              </button>
            </div>
            <div className="space-y-4">
              {mockAutomations.map(automation => (
                <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${automation.status === 'active' ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${automation.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {automation.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{automation.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Trigger: {automation.trigger.type}</span>
                          <span>{automation.actions.length} actions</span>
                          <span>Last: {new Date(automation.lastTriggered).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{automation.stats.triggered.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Triggered</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{automation.stats.completed.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-red-600">{automation.stats.failed}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Failed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {automation.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs whitespace-nowrap">
                            {action.type.replace(/_/g, ' ')}
                            {action.delay && ` (${action.delay})`}
                          </span>
                          {idx < automation.actions.length - 1 && <span className="text-gray-400">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mockSeries.length} series • {mockSeries.reduce((sum, s) => sum + s.enrolledCount, 0).toLocaleString()} enrolled
              </div>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                + Create Series
              </button>
            </div>
            {mockSeries.map(series => (
              <div key={series.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{series.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${series.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {series.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{series.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{series.enrolledCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Enrolled</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{series.completedCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-amber-600">{series.exitRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Exit Rate</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    {series.steps.map((step, idx) => (
                      <div key={step.id} className="relative flex items-center gap-4 pl-4">
                        <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center text-xs
                          ${step.type === 'email' ? 'bg-blue-500 text-white' :
                            step.type === 'push' ? 'bg-amber-500 text-white' :
                            step.type === 'wait' ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                            step.type === 'condition' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">{step.name}</span>
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-600 dark:text-gray-300 capitalize">{step.type}</span>
                            </div>
                            {step.delay && <span className="text-xs text-gray-500 dark:text-gray-400">⏱️ {step.delay}</span>}
                          </div>
                          {step.content && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.content}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTemplates.map(template => (
                <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center text-3xl mb-4">
                    {template.thumbnail}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.category}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used {template.usageCount} times</div>
                </div>
              ))}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-400 mb-4">+</div>
                <span className="text-gray-600 dark:text-gray-400">Create Template</span>
              </div>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Segments</h3>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                  + Create Segment
                </button>
              </div>

              <div className="space-y-4">
                {mockCampaigns.map(c => c.audience).filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i).map(segment => (
                  <div key={segment.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{segment.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{segment.count.toLocaleString()} contacts</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {segment.filters.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                          {f.field} {f.operator} {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscriber Overview</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">32,450</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Contacts</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">28,120</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">3,845</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Unsubscribed</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">485</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bounced</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track user events and trigger automations</p>
                </div>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                  + Define Event
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Event Name</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Count</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Seen</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Automations</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEvents.map(event => (
                      <tr key={event.name} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">{event.name}</code>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">{event.count.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 text-sm">{new Date(event.lastSeen).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          {event.automations > 0 ? (
                            <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded text-xs">{event.automations} active</span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-violet-600 hover:text-violet-700 text-sm">Create Automation</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Volume (Last 7 days)</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400">Chart placeholder - Event volume over time</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Event Sources</h3>
                <div className="space-y-3">
                  {['Web App', 'Mobile iOS', 'Mobile Android', 'API'].map((source, idx) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${[65, 20, 10, 5][idx]}%` }} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{[65, 20, 10, 5][idx]}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400">Chart placeholder - Open/Click rates over time</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Attribution</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400">Chart placeholder - Revenue by campaign</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Campaigns</h3>
              <div className="space-y-4">
                {mockCampaigns.filter(c => c.status === 'sent').sort((a, b) => b.metrics.openRate - a.metrics.openRate).slice(0, 3).map((campaign, idx) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{campaign.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{campaign.metrics.openRate}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-emerald-600">{campaign.metrics.clickRate}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Click Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-indigo-600">${campaign.metrics.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Performance</h3>
              <div className="grid grid-cols-4 gap-4">
                {['Email', 'Push', 'In-App', 'SMS'].map((channel, idx) => (
                  <div key={channel} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl mb-2">{['📧', '🔔', '💬', '📱'][idx]}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{channel}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {[45.3, 38.4, 89.5, 42.1][idx]}% open rate
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {[15420, 12340, 890, 0][idx].toLocaleString()} sent
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}
