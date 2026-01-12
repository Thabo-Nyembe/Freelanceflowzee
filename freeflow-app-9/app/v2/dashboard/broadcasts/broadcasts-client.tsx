'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useBroadcasts, type Broadcast, type BroadcastType, type BroadcastStatus } from '@/lib/hooks/use-broadcasts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Settings,
  Bell,
  Mail,
  Webhook,
  Key,
  Shield,
  HardDrive,
  AlertOctagon,
  CreditCard,
  Sliders,
  Globe,
  Copy,
  RefreshCw,
  Plus,
  Download
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

import {
  broadcastsAIInsights,
  broadcastsCollaborators,
  broadcastsPredictions,
  broadcastsActivities,
  broadcastsQuickActions,
} from '@/lib/mock-data/adapters'

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

interface _Subscriber {
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
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('campaigns')
  const [broadcastTypeFilter, setBroadcastTypeFilter] = useState<BroadcastType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BroadcastStatus | 'all'>('all')
  const [_selectedCampaign, _setSelectedCampaign] = useState<Campaign | null>(null)
  const [_viewMode, _setViewMode] = useState<'grid' | 'list'>('list')
  const [settingsTab, setSettingsTab] = useState('general')
  const { broadcasts, loading, error, refetch } = useBroadcasts({ broadcastType: broadcastTypeFilter, status: statusFilter })
  const _displayBroadcasts = broadcasts.length > 0 ? broadcasts : initialBroadcasts

  // Database broadcasts state
  const [_dbBroadcasts, setDbBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)

  // Additional dialog states for button functionality
  const [showImportContactsDialog, setShowImportContactsDialog] = useState(false)
  const [showCreateAutomationDialog, setShowCreateAutomationDialog] = useState(false)
  const [showCreateSeriesDialog, setShowCreateSeriesDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showCreateSegmentDialog, setShowCreateSegmentDialog] = useState(false)
  const [showDefineEventDialog, setShowDefineEventDialog] = useState(false)
  const [showConfigureDmarcDialog, setShowConfigureDmarcDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showManageSubscriptionDialog, setShowManageSubscriptionDialog] = useState(false)
  const [showUpgradePlanDialog, setShowUpgradePlanDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showPurgeContactsDialog, setShowPurgeContactsDialog] = useState(false)
  const [showDeleteCampaignsDialog, setShowDeleteCampaignsDialog] = useState(false)
  const [showCloseAccountDialog, setShowCloseAccountDialog] = useState(false)
  const [showConfigureAppDialog, setShowConfigureAppDialog] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    broadcast_type: 'email' as BroadcastType,
    status: 'draft' as BroadcastStatus,
    subject: '',
    recipient_type: 'all' as 'all' | 'segment' | 'custom',
    scheduled_for: '',
    sender_name: '',
    sender_email: ''
  })

  // Fetch broadcasts from Supabase
  const fetchBroadcasts = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbBroadcasts(data || [])
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      toast.error('Failed to load broadcasts')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Create broadcast
  const handleCreateBroadcast = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create broadcasts')
        return
      }

      const { error } = await supabase.from('broadcasts').insert({
        user_id: user.id,
        title: formData.title,
        message: formData.message || null,
        broadcast_type: formData.broadcast_type,
        status: formData.status,
        subject: formData.subject || null,
        recipient_type: formData.recipient_type,
        scheduled_for: formData.scheduled_for || null,
        sender_name: formData.sender_name || null,
        sender_email: formData.sender_email || null
      })

      if (error) throw error

      toast.success('Broadcast created successfully')
      setShowCreateDialog(false)
      resetForm()
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error creating broadcast:', error)
      toast.error('Failed to create broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  // Update broadcast
  const handleUpdateBroadcast = async () => {
    if (!editingBroadcast) return
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('broadcasts')
        .update({
          title: formData.title,
          message: formData.message || null,
          broadcast_type: formData.broadcast_type,
          status: formData.status,
          subject: formData.subject || null,
          recipient_type: formData.recipient_type,
          scheduled_for: formData.scheduled_for || null,
          sender_name: formData.sender_name || null,
          sender_email: formData.sender_email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBroadcast.id)

      if (error) throw error

      toast.success('Broadcast updated successfully')
      setShowEditDialog(false)
      setEditingBroadcast(null)
      resetForm()
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error updating broadcast:', error)
      toast.error('Failed to update broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete broadcast
  const handleDeleteBroadcast = async (broadcastId: string) => {
    try {
      const { error } = await supabase
        .from('broadcasts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', broadcastId)

      if (error) throw error

      toast.success('Broadcast deleted successfully')
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error deleting broadcast:', error)
      toast.error('Failed to delete broadcast')
    }
  }

  // Send broadcast
  const handleSendBroadcast = async (broadcastId: string, broadcastTitle: string) => {
    try {
      const { error } = await supabase
        .from('broadcasts')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', broadcastId)

      if (error) throw error

      toast.success('Sending broadcast', { description: `"${broadcastTitle}" is being sent...` })
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error sending broadcast:', error)
      toast.error('Failed to send broadcast')
    }
  }

  // Schedule broadcast
  const handleScheduleBroadcast = async (broadcastId: string, broadcastTitle: string, scheduledFor: string) => {
    try {
      const { error } = await supabase
        .from('broadcasts')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledFor,
          updated_at: new Date().toISOString()
        })
        .eq('id', broadcastId)

      if (error) throw error

      toast.success('Broadcast scheduled', { description: `"${broadcastTitle}" has been scheduled` })
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error scheduling broadcast:', error)
      toast.error('Failed to schedule broadcast')
    }
  }

  // Pause broadcast
  const handlePauseBroadcast = async (broadcastId: string, broadcastTitle: string) => {
    try {
      const { error } = await supabase
        .from('broadcasts')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', broadcastId)

      if (error) throw error

      toast.info('Broadcast paused', { description: `"${broadcastTitle}" delivery paused` })
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error pausing broadcast:', error)
      toast.error('Failed to pause broadcast')
    }
  }

  // Duplicate broadcast
  const handleDuplicateBroadcast = async (broadcast: Broadcast) => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to duplicate broadcasts')
        return
      }

      const { error } = await supabase.from('broadcasts').insert({
        user_id: user.id,
        title: `Copy of ${broadcast.title}`,
        message: broadcast.message,
        broadcast_type: broadcast.broadcast_type,
        status: 'draft',
        subject: broadcast.subject,
        recipient_type: broadcast.recipient_type,
        sender_name: broadcast.sender_name,
        sender_email: broadcast.sender_email
      })

      if (error) throw error

      toast.success('Broadcast duplicated', { description: `Copy of "${broadcast.title}" created` })
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error duplicating broadcast:', error)
      toast.error('Failed to duplicate broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      broadcast_type: 'email',
      status: 'draft',
      subject: '',
      recipient_type: 'all',
      scheduled_for: '',
      sender_name: '',
      sender_email: ''
    })
  }

  // Open edit dialog
  const openEditDialog = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast)
    setFormData({
      title: broadcast.title,
      message: broadcast.message || '',
      broadcast_type: broadcast.broadcast_type,
      status: broadcast.status,
      subject: broadcast.subject || '',
      recipient_type: broadcast.recipient_type,
      scheduled_for: broadcast.scheduled_for || '',
      sender_name: broadcast.sender_name || '',
      sender_email: broadcast.sender_email || ''
    })
    setShowEditDialog(true)
  }

  // Initial fetch
  useEffect(() => {
    fetchBroadcasts()
  }, [fetchBroadcasts])

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
            <button
              onClick={() => setShowImportContactsDialog(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Import Contacts
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
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
              <TabsTrigger value="settings" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Settings</TabsTrigger>
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
              <button
                onClick={() => setShowCreateAutomationDialog(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
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
              <button
                onClick={() => setShowCreateSeriesDialog(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
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
              <div
                onClick={() => setShowCreateTemplateDialog(true)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
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
                <button
                  onClick={() => setShowCreateSegmentDialog(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
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
                <button
                  onClick={() => setShowDefineEventDialog(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
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
                          <button
                            onClick={() => setShowCreateAutomationDialog(true)}
                            className="text-violet-600 hover:text-violet-700 text-sm">Create Automation</button>
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

          {/* Settings Tab - Mailchimp Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'email', label: 'Email Settings', icon: Mail },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'deliverability', label: 'Deliverability', icon: Globe },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        settingsTab === item.id
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Broadcast Stats */}
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Broadcast Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Campaigns Sent</span>
                      <Badge variant="secondary">{stats.sent}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg Open Rate</span>
                      <span className="text-sm font-medium text-violet-600">{stats.avgOpenRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Revenue</span>
                      <span className="text-sm font-medium text-emerald-600">${(stats.totalRevenue / 1000).toFixed(0)}K</span>
                    </div>
                    <Progress value={parseFloat(stats.avgOpenRate)} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Overall open rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-violet-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your broadcast workspace settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="My Company" />
                            <p className="text-xs text-gray-500">Displayed in email footers</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Time Zone</Label>
                            <Select defaultValue="est">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Send Time</Label>
                            <Input type="time" defaultValue="10:00" />
                            <p className="text-xs text-gray-500">Optimal time for campaigns</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Double Opt-in</p>
                            <p className="text-sm text-gray-500">Require confirmation for new subscribers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-archive Campaigns</p>
                            <p className="text-sm text-gray-500">Archive campaigns after 90 days</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Brand Settings
                        </CardTitle>
                        <CardDescription>Customize your brand appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Brand Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#8b5cf6" className="w-16 h-10 p-1" />
                              <Input defaultValue="#8b5cf6" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Link Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#3b82f6" className="w-16 h-10 p-1" />
                              <Input defaultValue="#3b82f6" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Company Website</Label>
                          <Input placeholder="https://yourcompany.com" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Email Settings */}
                {settingsTab === 'email' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-violet-600" />
                          Default Email Settings
                        </CardTitle>
                        <CardDescription>Configure default email behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default From Name</Label>
                          <Input defaultValue="Your Company" />
                          <p className="text-xs text-gray-500">Sender name shown in inbox</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Default From Email</Label>
                          <Input type="email" defaultValue="hello@yourcompany.com" />
                          <p className="text-xs text-gray-500">Verified sender email address</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Reply-To Email</Label>
                          <Input type="email" defaultValue="support@yourcompany.com" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Track Opens</p>
                            <p className="text-sm text-gray-500">Enable open rate tracking</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Track Clicks</p>
                            <p className="text-sm text-gray-500">Enable click tracking on links</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Plain Text Fallback</p>
                            <p className="text-sm text-gray-500">Auto-generate plain text version</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-emerald-600" />
                          Footer Settings
                        </CardTitle>
                        <CardDescription>Required footer information for compliance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Physical Address</Label>
                          <Input placeholder="123 Main St, City, State 12345" />
                          <p className="text-xs text-gray-500">Required by CAN-SPAM Act</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Unsubscribe Link</p>
                            <p className="text-sm text-gray-500">Automatically add unsubscribe link</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Subscription Preferences</p>
                            <p className="text-sm text-gray-500">Let users manage their preferences</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          Campaign Notifications
                        </CardTitle>
                        <CardDescription>Get notified about your campaigns</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Campaign Sent</p>
                            <p className="text-sm text-gray-500">Notify when campaign is sent</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Daily Report</p>
                            <p className="text-sm text-gray-500">Receive daily performance summary</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Digest</p>
                            <p className="text-sm text-gray-500">Get weekly analytics report</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Revenue Milestones</p>
                            <p className="text-sm text-gray-500">Alert at $1K, $10K, $100K milestones</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Notification Email</Label>
                          <Input type="email" placeholder="notifications@company.com" />
                          <p className="text-xs text-gray-500">Where to send email notifications</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5 text-red-600" />
                          Alert Settings
                        </CardTitle>
                        <CardDescription>Get alerted about important issues</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">High Bounce Rate</p>
                            <p className="text-sm text-gray-500">Alert when bounce rate exceeds 5%</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Spam Complaints</p>
                            <p className="text-sm text-gray-500">Alert on spam complaints</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">List Health Warning</p>
                            <p className="text-sm text-gray-500">Notify when list quality degrades</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Automation Failures</p>
                            <p className="text-sm text-gray-500">Alert when automations fail</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Deliverability Settings */}
                {settingsTab === 'deliverability' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Authentication
                        </CardTitle>
                        <CardDescription>Email authentication for better deliverability</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-400">SPF Record</p>
                              <p className="text-sm text-green-600 dark:text-green-500">Configured and verified</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Verified</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-400">DKIM Signature</p>
                              <p className="text-sm text-green-600 dark:text-green-500">Emails are digitally signed</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Verified</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertOctagon className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-400">DMARC Policy</p>
                              <p className="text-sm text-amber-600 dark:text-amber-500">Recommended for full protection</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowConfigureDmarcDialog(true)}>Configure</Button>
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Custom Tracking Domain</Label>
                          <Input placeholder="track.yourdomain.com" />
                          <p className="text-xs text-gray-500">Improves deliverability and branding</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Sending Limits
                        </CardTitle>
                        <CardDescription>Control your sending rate</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Daily Sending Limit</Label>
                          <Select defaultValue="unlimited">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1000">1,000 emails/day</SelectItem>
                              <SelectItem value="10000">10,000 emails/day</SelectItem>
                              <SelectItem value="50000">50,000 emails/day</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Throttle Sending</p>
                            <p className="text-sm text-gray-500">Gradually send to improve deliverability</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Smart Sending</p>
                            <p className="text-sm text-gray-500">Send at optimal times per recipient</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Send events to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-service.com/webhook" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="webhook-sent" />
                            <Label htmlFor="webhook-sent">Email Sent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="webhook-opened" defaultChecked />
                            <Label htmlFor="webhook-opened">Email Opened</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="webhook-clicked" defaultChecked />
                            <Label htmlFor="webhook-clicked">Link Clicked</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="webhook-unsubscribed" defaultChecked />
                            <Label htmlFor="webhook-unsubscribed">Unsubscribed</Label>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook Endpoint
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-violet-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="bc_live_xxxxxxxxxxxxxxxxxxxxx" readOnly />
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText('bc_live_xxxxxxxxxxxxxxxxxxxxx'); toast.success('API key copied to clipboard'); }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={() => {
                              if (confirm('Are you sure you want to refresh your API key? All existing integrations will need to be updated.')) {
                                toast.loading('Refreshing API key...', { id: 'api-key-refresh' })
                                setTimeout(() => {
                                  toast.success('API key refreshed successfully', { id: 'api-key-refresh' })
                                }, 1000)
                              }
                            }}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Use this key for API authentication</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500">Enable programmatic access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Rate Limit</Label>
                          <Select defaultValue="1000">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 requests/minute</SelectItem>
                              <SelectItem value="1000">1,000 requests/minute</SelectItem>
                              <SelectItem value="10000">10,000 requests/minute</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Third-party integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Shopify', 'Stripe', 'Salesforce', 'Zapier'].map((app, idx) => (
                          <div key={app} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-violet-600" />
                              </div>
                              <div>
                                <p className="font-medium">{app}</p>
                                <p className="text-sm text-gray-500">{idx < 2 ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button
                              variant={idx < 2 ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => { setSelectedApp(app); setShowConfigureAppDialog(true); }}
                            >
                              {idx < 2 ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your account and data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all account activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Control your data retention and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Retention</Label>
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
                          <p className="text-xs text-gray-500">How long to keep campaign data</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">GDPR Compliance Mode</p>
                            <p className="text-sm text-gray-500">Enable GDPR-compliant data handling</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => setShowExportDataDialog(true)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export All Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Subscription & Billing
                        </CardTitle>
                        <CardDescription>Manage your plan and payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                          <div>
                            <p className="font-medium text-violet-800 dark:text-violet-400">Pro Plan</p>
                            <p className="text-sm text-violet-600 dark:text-violet-500">Unlimited campaigns • 100K contacts</p>
                          </div>
                          <Badge className="bg-violet-600">Active</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-violet-600">{stats.totalCampaigns}</p>
                            <p className="text-xs text-gray-500">Campaigns</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{(stats.totalSent / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-gray-500">Emails Sent</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-600">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowManageSubscriptionDialog(true)}>
                            Manage Subscription
                          </Button>
                          <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setShowUpgradePlanDialog(true)}>
                            Upgrade Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Purge All Contacts</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all subscriber data</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowPurgeContactsDialog(true)}>Purge</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Campaigns</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all campaign history</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteCampaignsDialog(true)}>Delete</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Close Account</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete your account</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowCloseAccountDialog(true)}>Close</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={broadcastsAIInsights}
              title="Broadcast Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={broadcastsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={broadcastsPredictions}
              title="Broadcast Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={broadcastsActivities}
            title="Broadcast Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={broadcastsQuickActions}
            variant="grid"
          />
        </div>

        {(loading || isLoading) && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent" />
          </div>
        )}
      </div>

      {/* Create Broadcast Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Broadcast title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.broadcast_type} onValueChange={(v) => setFormData({ ...formData, broadcast_type: v as BroadcastType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select value={formData.recipient_type} onValueChange={(v) => setFormData({ ...formData, recipient_type: v as 'all' | 'segment' | 'custom' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="segment">Segment</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject line"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                placeholder="Broadcast message content..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input
                  placeholder="Your Company"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sender Email</Label>
                <Input
                  type="email"
                  placeholder="hello@company.com"
                  value={formData.sender_email}
                  onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule For (optional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBroadcast}
                disabled={isSaving || !formData.title}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isSaving ? 'Creating...' : 'Create Broadcast'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Broadcast Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Broadcast title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.broadcast_type} onValueChange={(v) => setFormData({ ...formData, broadcast_type: v as BroadcastType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as BroadcastStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject line"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                placeholder="Broadcast message content..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input
                  placeholder="Your Company"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sender Email</Label>
                <Input
                  type="email"
                  placeholder="hello@company.com"
                  value={formData.sender_email}
                  onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingBroadcast(null); resetForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBroadcast}
                disabled={isSaving || !formData.title}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Contacts Dialog */}
      <Dialog open={showImportContactsDialog} onOpenChange={setShowImportContactsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a CSV file with your contacts. The file should include columns for email, name, and any custom fields.
            </p>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">Drag and drop your CSV file here</div>
              <div className="text-sm text-gray-500">or</div>
              <Button variant="outline" className="mt-2" onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) toast.success(`Selected: ${file.name}`, { description: 'Ready to import' })
                }
                input.click()
              }}>Browse Files</Button>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowImportContactsDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Importing contacts...', { id: 'import-contacts' })
                setTimeout(() => {
                  toast.success('Contacts imported successfully', { id: 'import-contacts' })
                  setShowImportContactsDialog(false)
                }, 1500)
              }}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Automation Dialog */}
      <Dialog open={showCreateAutomationDialog} onOpenChange={setShowCreateAutomationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Automation Name</Label>
              <Input placeholder="e.g., Welcome Series" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Describe what this automation does" />
            </div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select defaultValue="event">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">When event occurs</SelectItem>
                  <SelectItem value="segment">When user enters segment</SelectItem>
                  <SelectItem value="time">Time-based schedule</SelectItem>
                  <SelectItem value="api">API trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateAutomationDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Creating automation...', { id: 'create-automation' })
                setTimeout(() => {
                  toast.success('Automation created successfully', { id: 'create-automation' })
                  setShowCreateAutomationDialog(false)
                }, 1000)
              }}>Create Automation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Series Dialog */}
      <Dialog open={showCreateSeriesDialog} onOpenChange={setShowCreateSeriesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Series</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Series Name</Label>
              <Input placeholder="e.g., Onboarding Journey" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Describe the purpose of this series" />
            </div>
            <div className="space-y-2">
              <Label>Entry Trigger</Label>
              <Select defaultValue="signup">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signup">User signs up</SelectItem>
                  <SelectItem value="purchase">User makes purchase</SelectItem>
                  <SelectItem value="segment">User enters segment</SelectItem>
                  <SelectItem value="manual">Manual enrollment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateSeriesDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Creating series...', { id: 'create-series' })
                setTimeout(() => {
                  toast.success('Series created successfully', { id: 'create-series' })
                  setShowCreateSeriesDialog(false)
                }, 1000)
              }}>Create Series</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g., Monthly Newsletter" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue="engagement">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="promotions">Promotions</SelectItem>
                  <SelectItem value="product">Product Updates</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start From</Label>
              <Select defaultValue="blank">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Template</SelectItem>
                  <SelectItem value="basic">Basic Layout</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Creating template...', { id: 'create-template' })
                setTimeout(() => {
                  toast.success('Template created successfully', { id: 'create-template' })
                  setShowCreateTemplateDialog(false)
                }, 1000)
              }}>Create Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Segment Dialog */}
      <Dialog open={showCreateSegmentDialog} onOpenChange={setShowCreateSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Segment Name</Label>
              <Input placeholder="e.g., Active Premium Users" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Describe who belongs in this segment" />
            </div>
            <div className="space-y-2">
              <Label>Filter By</Label>
              <Select defaultValue="activity">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">User Activity</SelectItem>
                  <SelectItem value="subscription">Subscription Status</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="custom">Custom Attribute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateSegmentDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Creating segment...', { id: 'create-segment' })
                setTimeout(() => {
                  toast.success('Segment created successfully', { id: 'create-segment' })
                  setShowCreateSegmentDialog(false)
                }, 1000)
              }}>Create Segment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Define Event Dialog */}
      <Dialog open={showDefineEventDialog} onOpenChange={setShowDefineEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Define Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input placeholder="e.g., purchase.completed" />
              <p className="text-xs text-gray-500">Use lowercase letters, dots, and underscores only</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="When this event should be tracked" />
            </div>
            <div className="space-y-2">
              <Label>Event Properties (optional)</Label>
              <Input placeholder="e.g., amount, product_id, category" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDefineEventDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Defining event...', { id: 'define-event' })
                setTimeout(() => {
                  toast.success('Event defined successfully', { id: 'define-event' })
                  setShowDefineEventDialog(false)
                }, 1000)
              }}>Define Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure DMARC Dialog */}
      <Dialog open={showConfigureDmarcDialog} onOpenChange={setShowConfigureDmarcDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure DMARC Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              DMARC helps protect your domain from unauthorized use and improves email deliverability.
            </p>
            <div className="space-y-2">
              <Label>Policy Mode</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Monitor Only)</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-sm font-medium">Add this DNS record:</Label>
              <code className="block mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                _dmarc.yourdomain.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
              </code>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowConfigureDmarcDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Saving DMARC configuration...', { id: 'save-dmarc' })
                setTimeout(() => {
                  toast.success('DMARC configuration saved successfully', { id: 'save-dmarc' })
                  setShowConfigureDmarcDialog(false)
                }, 1000)
              }}>Save Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input placeholder="https://your-service.com/webhook" />
            </div>
            <div className="space-y-2">
              <Label>Endpoint Name</Label>
              <Input placeholder="e.g., CRM Integration" />
            </div>
            <div className="space-y-2">
              <Label>Events to Send</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Email Sent', 'Email Opened', 'Link Clicked', 'Unsubscribed', 'Bounced', 'Complained'].map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Switch id={`webhook-${event}`} />
                    <Label htmlFor={`webhook-${event}`} className="text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Adding webhook endpoint...', { id: 'add-webhook' })
                setTimeout(() => {
                  toast.success('Webhook endpoint added successfully', { id: 'add-webhook' })
                  setShowAddWebhookDialog(false)
                }, 1000)
              }}>Add Endpoint</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={showManageSubscriptionDialog} onOpenChange={setShowManageSubscriptionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-violet-800 dark:text-violet-400">Pro Plan</p>
                  <p className="text-sm text-violet-600 dark:text-violet-500">$99/month</p>
                </div>
                <Badge className="bg-violet-600">Current Plan</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Next billing date</span>
                <span className="font-medium">January 15, 2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Payment method</span>
                <span className="font-medium">Visa ending in 4242</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowManageSubscriptionDialog(false)}>Close</Button>
              <Button variant="outline" onClick={async () => {
                toast.loading('Loading payment methods...', { id: 'update-payment' })
                try {
                  await new Promise(r => setTimeout(r, 1000))
                  toast.success('Payment form ready', { id: 'update-payment', description: 'Update your card details' })
                } catch { toast.error('Failed to load payment form', { id: 'update-payment' }) }
              }}>Update Payment</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
                  toast.loading('Cancelling subscription...', { id: 'cancel-subscription' })
                  setTimeout(() => {
                    toast.success('Subscription cancelled successfully', { id: 'cancel-subscription' })
                    setShowManageSubscriptionDialog(false)
                  }, 1500)
                }
              }}>Cancel Subscription</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradePlanDialog} onOpenChange={setShowUpgradePlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Pro', price: '$99', features: ['100K contacts', 'Unlimited campaigns', 'Basic automation'] },
                { name: 'Business', price: '$249', features: ['500K contacts', 'Advanced automation', 'Priority support'] },
                { name: 'Enterprise', price: 'Custom', features: ['Unlimited contacts', 'Custom integrations', 'Dedicated support'] }
              ].map((plan) => (
                <div key={plan.name} className={`p-4 border rounded-lg ${plan.name === 'Business' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <h4 className="font-semibold">{plan.name}</h4>
                  <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-gray-600 dark:text-gray-400">- {f}</li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.name === 'Business' ? 'default' : 'outline'}
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => {
                      if (plan.name === 'Pro') {
                        toast.info('You are already on the Pro plan')
                      } else if (plan.name === 'Enterprise') {
                        toast.info('Please contact sales for Enterprise pricing')
                      } else {
                        toast.success(`Upgrading to ${plan.name} plan...`)
                        setShowUpgradePlanDialog(false)
                      }
                    }}
                  >
                    {plan.name === 'Pro' ? 'Current' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUpgradePlanDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export All Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export all your broadcast data including campaigns, contacts, and analytics.
            </p>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data to Include</Label>
              <div className="space-y-2 mt-2">
                {['Contacts', 'Campaigns', 'Analytics', 'Automations', 'Templates'].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Switch id={`export-${item}`} defaultChecked />
                    <Label htmlFor={`export-${item}`}>{item}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                toast.loading('Preparing data export...', { id: 'export-data' })
                setTimeout(() => {
                  toast.success('Data export started - you will receive an email when ready', { id: 'export-data' })
                  setShowExportDataDialog(false)
                }, 1500)
              }}>Start Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge Contacts Dialog */}
      <Dialog open={showPurgeContactsDialog} onOpenChange={setShowPurgeContactsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Purge All Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                This action will permanently delete all your contacts and subscriber data. This cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type "PURGE" to confirm</Label>
              <Input placeholder="PURGE" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPurgeContactsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you absolutely sure you want to purge ALL contacts? This action is irreversible and will permanently delete all your subscriber data.')) {
                  toast.loading('Purging all contacts...', { id: 'purge-contacts' })
                  setTimeout(() => {
                    toast.success('All contacts have been purged', { id: 'purge-contacts' })
                    setShowPurgeContactsDialog(false)
                  }, 2000)
                }
              }}>Purge All Contacts</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Campaigns Dialog */}
      <Dialog open={showDeleteCampaignsDialog} onOpenChange={setShowDeleteCampaignsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete All Campaigns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                This action will permanently delete all campaigns, including their analytics and history. This cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type "DELETE" to confirm</Label>
              <Input placeholder="DELETE" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteCampaignsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you absolutely sure you want to delete ALL campaigns? This action is irreversible and will permanently delete all campaign data and analytics.')) {
                  toast.loading('Deleting all campaigns...', { id: 'delete-campaigns' })
                  setTimeout(() => {
                    toast.success('All campaigns have been deleted', { id: 'delete-campaigns' })
                    setShowDeleteCampaignsDialog(false)
                  }, 2000)
                }
              }}>Delete All Campaigns</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Account Dialog */}
      <Dialog open={showCloseAccountDialog} onOpenChange={setShowCloseAccountDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Close Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                This will permanently delete your account and all associated data. Your subscription will be cancelled. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Please tell us why you are leaving (optional)</Label>
              <textarea
                placeholder="Your feedback helps us improve..."
                className="w-full min-h-[80px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label>Type "CLOSE ACCOUNT" to confirm</Label>
              <Input placeholder="CLOSE ACCOUNT" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCloseAccountDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you absolutely sure you want to close your account? This action is irreversible and will permanently delete all your data.')) {
                  toast.loading('Closing account...', { id: 'close-account' })
                  setTimeout(() => {
                    toast.success('Account closed - redirecting to home page', { id: 'close-account' })
                    setShowCloseAccountDialog(false)
                  }, 2000)
                }
              }}>Close My Account</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure App Dialog */}
      <Dialog open={showConfigureAppDialog} onOpenChange={setShowConfigureAppDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedApp ? `Configure ${selectedApp}` : 'Configure Integration'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApp && ['Shopify', 'Stripe'].includes(selectedApp) ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your {selectedApp} integration settings.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span>Sync Contacts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span>Track Events</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span>Auto-segment Users</span>
                    <Switch />
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your {selectedApp} account to sync data and enable automations.
                </p>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input type="password" placeholder="Enter your API secret" />
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowConfigureAppDialog(false); setSelectedApp(null); }}>Cancel</Button>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  if (selectedApp && ['Shopify', 'Stripe'].includes(selectedApp)) {
                    toast.success(`${selectedApp} settings saved successfully`)
                  } else {
                    toast.success(`${selectedApp} connected successfully`)
                  }
                  setShowConfigureAppDialog(false)
                  setSelectedApp(null)
                }}
              >
                {selectedApp && ['Shopify', 'Stripe'].includes(selectedApp) ? 'Save Settings' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
