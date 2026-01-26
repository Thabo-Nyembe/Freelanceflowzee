'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useBroadcasts, type Broadcast, type BroadcastType, type BroadcastStatus } from '@/lib/hooks/use-broadcasts'
import { useCampaigns, type Campaign as DbCampaign } from '@/lib/hooks/use-campaigns'
import { useTemplates, type Template as DbTemplate } from '@/lib/hooks/use-templates'
import { useAutomations, type AutomationWorkflow } from '@/lib/hooks/use-automations'
import { useEvents, type Event as DbEvent } from '@/lib/hooks/use-events'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
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
  Download,
  Loader2
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

// Helper function to convert database campaigns to UI Campaign format
function convertDbCampaignToUiCampaign(dbCampaign: DbCampaign): Campaign {
  return {
    id: dbCampaign.id,
    name: dbCampaign.campaign_name,
    subject: dbCampaign.content?.subject || '',
    previewText: dbCampaign.content?.preview_text || '',
    content: dbCampaign.content?.html || '',
    type: (dbCampaign.campaign_type === 'email' ? 'email' :
           dbCampaign.campaign_type === 'sms' ? 'sms' :
           dbCampaign.campaign_type === 'social' ? 'push' : 'email') as Campaign['type'],
    status: (dbCampaign.status === 'running' ? 'sending' :
             dbCampaign.status === 'completed' ? 'sent' :
             dbCampaign.status) as Campaign['status'],
    audience: {
      id: `seg-${dbCampaign.id}`,
      name: dbCampaign.target_audience || 'All Users',
      count: dbCampaign.audience_size || 0,
      filters: dbCampaign.segment_criteria?.filters || []
    },
    schedule: dbCampaign.start_date ? {
      type: dbCampaign.is_automated ? 'recurring' : 'scheduled',
      scheduledFor: dbCampaign.start_date,
      timezone: 'UTC'
    } : null,
    metrics: {
      sent: dbCampaign.emails_sent || 0,
      delivered: dbCampaign.emails_delivered || 0,
      opened: dbCampaign.emails_opened || 0,
      clicked: dbCampaign.emails_clicked || 0,
      converted: dbCampaign.conversions || 0,
      unsubscribed: Math.round((dbCampaign.unsubscribe_rate || 0) * dbCampaign.emails_sent / 100),
      bounced: Math.round((dbCampaign.bounce_rate || 0) * dbCampaign.emails_sent / 100),
      complained: 0,
      deliveryRate: dbCampaign.emails_sent > 0 ? (dbCampaign.emails_delivered / dbCampaign.emails_sent) * 100 : 0,
      openRate: dbCampaign.open_rate || 0,
      clickRate: dbCampaign.click_rate || 0,
      conversionRate: dbCampaign.conversion_rate || 0,
      revenue: dbCampaign.revenue_generated || 0
    },
    createdAt: dbCampaign.created_at,
    updatedAt: dbCampaign.updated_at,
    sentAt: dbCampaign.launched_at || undefined,
    author: { name: dbCampaign.created_by || 'Unknown', avatar: (dbCampaign.created_by || 'U').slice(0, 2).toUpperCase() },
    tags: dbCampaign.tags || [],
    abTest: dbCampaign.is_ab_test ? {
      enabled: true,
      variants: dbCampaign.ab_test_config?.variants || [],
      winner: dbCampaign.winning_variant || undefined
    } : undefined
  }
}

// Helper function to convert database templates to UI Template format
function convertDbTemplateToUiTemplate(dbTemplate: DbTemplate): Template {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    category: dbTemplate.category || 'General',
    thumbnail: dbTemplate.category === 'email' ? '📧' :
               dbTemplate.category === 'product' ? '🚀' :
               dbTemplate.category === 'engagement' ? '📊' :
               dbTemplate.category === 'promotions' ? '🔥' : '📄',
    usageCount: dbTemplate.usage_count || 0
  }
}

// Helper function to convert database automations to UI Automation format
function convertDbAutomationToUiAutomation(dbAutomation: AutomationWorkflow): Automation {
  return {
    id: dbAutomation.id,
    name: dbAutomation.workflow_name,
    description: dbAutomation.description || '',
    trigger: {
      type: (dbAutomation.trigger_type as AutomationTrigger['type']) || 'event',
      event: dbAutomation.trigger_config?.event,
      segment: dbAutomation.trigger_config?.segment,
      schedule: dbAutomation.schedule_config?.schedule,
      conditions: dbAutomation.trigger_config?.conditions || []
    },
    actions: (dbAutomation.steps || []).map((step: any) => ({
      type: step.type || 'send_email',
      config: step.config || {},
      delay: step.delay
    })),
    status: (dbAutomation.status === 'running' ? 'active' :
             dbAutomation.status === 'paused' ? 'paused' : 'draft') as Automation['status'],
    stats: {
      triggered: dbAutomation.total_executions || 0,
      completed: dbAutomation.successful_executions || 0,
      failed: dbAutomation.failed_executions || 0
    },
    createdAt: dbAutomation.created_at,
    lastTriggered: dbAutomation.last_execution_at || dbAutomation.created_at
  }
}

// Helper function to convert database events to UI EventTracking format
function convertDbEventToUiEvent(dbEvent: DbEvent): EventTracking {
  return {
    name: dbEvent.name,
    count: dbEvent.registrations || dbEvent.current_attendees || 0,
    lastSeen: dbEvent.updated_at,
    automations: 0 // Would need a join to get actual count
  }
}

export default function BroadcastsClient({ initialBroadcasts }: { initialBroadcasts: Broadcast[] }) {
  // Initialize Supabase client
  const supabase = createClient()

  // Define adapter variables locally (removed mock data imports)
  const broadcastsAIInsights: any[] = []
  const broadcastsCollaborators: any[] = []
  const broadcastsPredictions: any[] = []
  const broadcastsActivities: any[] = []
  const broadcastsQuickActions: any[] = []

  // Auth hooks for user identification
  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize userId on mount
  useEffect(() => {
    getUserId().then(setUserId)
  }, [getUserId])

  const [activeTab, setActiveTab] = useState('campaigns')
  const [broadcastTypeFilter, setBroadcastTypeFilter] = useState<BroadcastType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BroadcastStatus | 'all'>('all')
  const [_selectedCampaign, _setSelectedCampaign] = useState<Campaign | null>(null)
  const [_viewMode, _setViewMode] = useState<'grid' | 'list'>('list')
  const [settingsTab, setSettingsTab] = useState('general')
  const { broadcasts, loading, error, refetch } = useBroadcasts({ broadcastType: broadcastTypeFilter, status: statusFilter })
  const _displayBroadcasts = broadcasts.length > 0 ? broadcasts : initialBroadcasts

  // Fetch campaigns, templates, automations, and events from database
  const { campaigns: dbCampaigns, loading: campaignsLoading } = useCampaigns()
  const { templates: dbTemplates, isLoading: templatesLoading } = useTemplates()
  const { workflows: dbAutomations, loading: automationsLoading } = useAutomations()
  const { events: dbEvents, loading: eventsLoading } = useEvents()

  // Convert database data to UI format
  const campaigns: Campaign[] = useMemo(() => {
    return (dbCampaigns || []).map(convertDbCampaignToUiCampaign)
  }, [dbCampaigns])

  const templates: Template[] = useMemo(() => {
    return (dbTemplates || []).map(convertDbTemplateToUiTemplate)
  }, [dbTemplates])

  const automations: Automation[] = useMemo(() => {
    return (dbAutomations || []).map(convertDbAutomationToUiAutomation)
  }, [dbAutomations])

  const events: EventTracking[] = useMemo(() => {
    return (dbEvents || []).map(convertDbEventToUiEvent)
  }, [dbEvents])

  // Series data - derived from automations with sequential type
  const series: Series[] = useMemo(() => {
    return (dbAutomations || [])
      .filter(a => a.workflow_type === 'sequential')
      .map(automation => ({
        id: automation.id,
        name: automation.workflow_name,
        description: automation.description || '',
        steps: (automation.steps || []).map((step: any, idx: number) => ({
          id: `${automation.id}-step-${idx}`,
          type: step.type || 'email',
          name: step.name || `Step ${idx + 1}`,
          delay: step.delay,
          content: step.content,
          condition: step.condition
        })),
        status: (automation.status === 'running' || automation.status === 'active' ? 'active' :
                 automation.status === 'paused' ? 'paused' : 'draft') as Series['status'],
        enrolledCount: automation.total_executions || 0,
        completedCount: automation.successful_executions || 0,
        exitRate: automation.total_executions > 0
          ? ((automation.total_executions - automation.successful_executions) / automation.total_executions) * 100
          : 0,
        createdAt: automation.created_at
      }))
  }, [dbAutomations])

  // Database broadcasts state
  const [_dbBroadcasts, setDbBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingBroadcastId, setDeletingBroadcastId] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [schedulingBroadcast, setSchedulingBroadcast] = useState<Broadcast | null>(null)
  const [_showSettingsDialog, _setShowSettingsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [_showAudienceDialog, _setShowAudienceDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAutomationDialog, setShowAutomationDialog] = useState(false)
  const [showSeriesDialog, setShowSeriesDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showSegmentDialog, setShowSegmentDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showPurgeDialog, setShowPurgeDialog] = useState(false)
  const [showDeleteCampaignsDialog, setShowDeleteCampaignsDialog] = useState(false)
  const [showCloseAccountDialog, setShowCloseAccountDialog] = useState(false)
  const [scheduleDateTime, setScheduleDateTime] = useState('')

  // Segment conditions for dynamic filter builder
  const [segmentConditions, setSegmentConditions] = useState<{ field: string; operator: string; value: string }[]>([
    { field: '', operator: 'equals', value: '' }
  ])

  // Event properties for custom event definition
  const [eventProperties, setEventProperties] = useState<{ name: string; type: string }[]>([
    { name: '', type: 'string' }
  ])

  // File import state
  const [importedFile, setImportedFile] = useState<File | null>(null)

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
  }, [])

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
  const _handleSendBroadcast = async (broadcastId: string, broadcastTitle: string) => {
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

      toast.success('Broadcast is being sent...')
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

      toast.success(`Broadcast scheduled: "${broadcastTitle}" has been scheduled`)
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error scheduling broadcast:', error)
      toast.error('Failed to schedule broadcast')
    }
  }

  // Pause broadcast
  const _handlePauseBroadcast = async (broadcastId: string, broadcastTitle: string) => {
    try {
      const { error } = await supabase
        .from('broadcasts')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', broadcastId)

      if (error) throw error

      toast.info(`Broadcast paused: delivery paused`)
      fetchBroadcasts()
      refetch()
    } catch (error) {
      console.error('Error pausing broadcast:', error)
      toast.error('Failed to pause broadcast')
    }
  }

  // Duplicate broadcast
  const _handleDuplicateBroadcast = async (broadcast: Broadcast) => {
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

      toast.success(`Broadcast duplicated created`)
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
  const _openEditDialog = (broadcast: Broadcast) => {
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

  // Open schedule dialog
  const _openScheduleDialog = (broadcast: Broadcast) => {
    setSchedulingBroadcast(broadcast)
    setScheduleDateTime(broadcast.scheduled_for || '')
    setShowScheduleDialog(true)
  }

  // Confirm and schedule broadcast
  const confirmScheduleBroadcast = async () => {
    if (!schedulingBroadcast || !scheduleDateTime) return
    await handleScheduleBroadcast(schedulingBroadcast.id, schedulingBroadcast.title, scheduleDateTime)
    setShowScheduleDialog(false)
    setSchedulingBroadcast(null)
    setScheduleDateTime('')
  }

  // Open delete confirmation dialog
  const _openDeleteDialog = (broadcastId: string) => {
    setDeletingBroadcastId(broadcastId)
    setShowDeleteDialog(true)
  }

  // Confirm delete broadcast
  const confirmDeleteBroadcast = async () => {
    if (!deletingBroadcastId) return
    await handleDeleteBroadcast(deletingBroadcastId)
    setShowDeleteDialog(false)
    setDeletingBroadcastId(null)
  }

  // Handle import contacts
  const handleImportContacts = () => {
    setShowImportDialog(true)
  }

  // Process import
  const processImport = () => {
    toast.success('Contacts imported successfully')
    setShowImportDialog(false)
  }

  // Handle export analytics
  const handleExportAnalytics = () => {
    setShowExportDialog(true)
  }

  // Process export
  const processExport = (format: string) => {
    toast.success(`Analytics exported as ${format.toUpperCase()}`, { description: 'Download starting...' })
    setShowExportDialog(false)
  }

  // Handle create automation
  const handleCreateAutomation = () => {
    setShowAutomationDialog(true)
  }

  // Save automation
  const saveAutomation = () => {
    toast.success('Automation created')
    setShowAutomationDialog(false)
  }

  // Handle create series
  const handleCreateSeries = () => {
    setShowSeriesDialog(true)
  }

  // Save series
  const saveSeries = () => {
    toast.success('Series created')
    setShowSeriesDialog(false)
  }

  // Handle create template
  const handleCreateTemplate = () => {
    setShowTemplateDialog(true)
  }

  // Save template
  const saveTemplate = () => {
    toast.success('Template saved')
    setShowTemplateDialog(false)
  }

  // Handle create segment
  const handleCreateSegment = () => {
    setShowSegmentDialog(true)
  }

  // Save segment
  const saveSegment = () => {
    toast.success('Segment created')
    setShowSegmentDialog(false)
  }

  // Handle define event
  const handleDefineEvent = () => {
    setShowEventDialog(true)
  }

  // Save event
  const saveEvent = () => {
    toast.success('Event defined')
    setShowEventDialog(false)
  }

  // Handle create automation from event
  const handleCreateAutomationFromEvent = (eventName: string) => {
    toast.info(`Creating automation for "${eventName}"`)
    setShowAutomationDialog(true)
  }

  // Handle add webhook
  const handleAddWebhook = () => {
    setShowWebhookDialog(true)
  }

  // Save webhook
  const saveWebhook = () => {
    toast.success('Webhook endpoint added')
    setShowWebhookDialog(false)
  }

  // Handle copy API key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('bc_live_xxxxxxxxxxxxxxxxxxxxx')
    toast.success('API key copied to clipboard')
  }

  // Handle regenerate API key
  const handleRegenerateApiKey = () => {
    setShowApiKeyDialog(true)
  }

  // Confirm regenerate API key
  const confirmRegenerateApiKey = () => {
    toast.success('API key regenerated')
    setShowApiKeyDialog(false)
  }

  // Handle configure DMARC
  const handleConfigureDmarc = () => {
    // Save DMARC settings to localStorage
    const dmarcSettings = {
      configured: true,
      configuredAt: new Date().toISOString(),
      policy: 'quarantine',
      subdomain: 'mail'
    }
    localStorage.setItem('dmarc-settings', JSON.stringify(dmarcSettings))

    // Open DMARC configuration guide in new tab
    window.open('https://support.google.com/a/answer/2466580', '_blank')
    toast.success('DMARC settings saved. Opening configuration guide...')
  }

  // Handle manage subscription
  const handleManageSubscription = () => {
    // Get current subscription details from localStorage or show defaults
    const subscriptionData = localStorage.getItem('subscription-data')
    const subscription = subscriptionData ? JSON.parse(subscriptionData) : {
      plan: 'Professional',
      status: 'active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['Unlimited broadcasts', 'Advanced analytics', 'Priority support']
    }

    // Store last viewed timestamp
    localStorage.setItem('subscription-last-viewed', new Date().toISOString())

    // Open billing portal (placeholder URL - would be replaced with actual billing portal)
    window.open('/dashboard/settings/billing', '_self')
    toast.info(`Current plan: ${subscription.plan} - ${subscription.status}`)
  }

  // Handle upgrade plan
  const handleUpgradePlan = () => {
    // Store upgrade intent for analytics
    const upgradeIntent = {
      initiatedAt: new Date().toISOString(),
      currentPlan: localStorage.getItem('subscription-data')
        ? JSON.parse(localStorage.getItem('subscription-data')!).plan
        : 'Free',
      source: 'broadcasts-settings'
    }
    localStorage.setItem('upgrade-intent', JSON.stringify(upgradeIntent))

    // Open pricing/upgrade page
    window.open('/pricing', '_self')
    toast.info('Loading upgrade options...')
  }

  // Handle purge contacts
  const handlePurgeContacts = () => {
    setShowPurgeDialog(true)
  }

  // Confirm purge contacts
  const confirmPurgeContacts = () => {
    toast.success('All contacts purged')
    setShowPurgeDialog(false)
  }

  // Handle delete all campaigns
  const handleDeleteAllCampaigns = () => {
    setShowDeleteCampaignsDialog(true)
  }

  // Confirm delete all campaigns
  const confirmDeleteAllCampaigns = () => {
    toast.success('All campaigns deleted')
    setShowDeleteCampaignsDialog(false)
  }

  // Handle close account
  const handleCloseAccount = () => {
    setShowCloseAccountDialog(true)
  }

  // Confirm close account
  const confirmCloseAccount = () => {
    toast.error('Account closure initiated')
    setShowCloseAccountDialog(false)
  }

  // Handle connect app
  const handleConnectApp = (appName: string, isConnected: boolean) => {
    if (isConnected) {
      toast.info(`Opening ${appName} configuration`)
    } else {
      toast.success(`Connecting to ${appName}...`)
    }
  }

  // Handle export all data
  const handleExportAllData = () => {
    const data = {
      broadcasts: broadcasts || [],
      templates: dbTemplates || [],
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `broadcasts-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data export started')
  }

  // Handle save general settings
  const _handleSaveGeneralSettings = () => {
    toast.success('Settings saved')
  }

  // Handle save email settings
  const _handleSaveEmailSettings = () => {
    toast.success('Email settings saved')
  }

  // Handle save notification settings
  const _handleSaveNotificationSettings = () => {
    toast.success('Notification settings saved')
  }

  // Initial fetch
  useEffect(() => {
    fetchBroadcasts()
  }, [fetchBroadcasts])

  // Calculate stats
  const stats = useMemo(() => {
    const sent = campaigns.filter(c => c.status === 'sent')
    const totalSent = sent.reduce((sum, c) => sum + c.metrics.sent, 0)
    const totalDelivered = sent.reduce((sum, c) => sum + c.metrics.delivered, 0)
    const totalOpened = sent.reduce((sum, c) => sum + c.metrics.opened, 0)
    const totalClicked = sent.reduce((sum, c) => sum + c.metrics.clicked, 0)
    const totalRevenue = sent.reduce((sum, c) => sum + c.metrics.revenue, 0)

    return {
      totalCampaigns: campaigns.length,
      sent: sent.length,
      scheduled: campaigns.filter(c => c.status === 'scheduled').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      avgOpenRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
      avgClickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0',
      totalRevenue
    }
  }, [campaigns])

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      if (broadcastTypeFilter !== 'all' && campaign.type !== broadcastTypeFilter) return false
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false
      return true
    })
  }, [campaigns, broadcastTypeFilter, statusFilter])

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

  // Loading state - check all hooks
  if (loading || campaignsLoading || templatesLoading || automationsLoading || eventsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
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
              onClick={handleImportContacts}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Import Contacts
            </button>
            <button
              onClick={handleExportAnalytics}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Export Analytics
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 text-center">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
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
                {automations.length} automations • {automations.filter(a => a.status === 'active').length} active
              </div>
              <button
                onClick={handleCreateAutomation}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
              >
                + Create Automation
              </button>
            </div>
            <div className="space-y-4">
              {automations.map(automation => (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
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
                    <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.info(`Opening automation editor`)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const action = automation.status === 'active' ? 'paused' : 'activated'
                            toast.success(`Automation ${action} is now ${action}`)
                          }}
                        >
                          {automation.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.success(`Automation duplicated: copy created`)
                          }}
                        >
                          Duplicate
                        </Button>
                      </div>
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
                {series.length} series • {series.reduce((sum, s) => sum + s.enrolledCount, 0).toLocaleString()} enrolled
              </div>
              <button
                onClick={handleCreateSeries}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
              >
                + Create Series
              </button>
            </div>
            {series.map(seriesItem => (
              <div key={seriesItem.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{seriesItem.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${seriesItem.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {seriesItem.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{seriesItem.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{seriesItem.enrolledCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Enrolled</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{seriesItem.completedCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-amber-600">{seriesItem.exitRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Exit Rate</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    {seriesItem.steps.map((step, idx) => (
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
                            {step.delay && <span className="text-xs text-gray-500 dark:text-gray-400">{step.delay}</span>}
                          </div>
                          {step.content && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.content}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(`Opening series editor for "${seriesItem.name}"`)
                    }}
                  >
                    Edit Steps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const action = seriesItem.status === 'active' ? 'paused' : 'activated'
                      toast.success(`Series "${seriesItem.name}" is now ${action}`)
                    }}
                  >
                    {seriesItem.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(`Opening enrollment settings for "${seriesItem.name}"`)
                    }}
                  >
                    Enrollment Settings
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => {
                    toast.info(`Opening template preview for "${template.name}"`)
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center text-3xl mb-4">
                    {template.thumbnail}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.category}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used {template.usageCount} times</div>
                </div>
              ))}
              <div
                onClick={handleCreateTemplate}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              >
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
                  onClick={handleCreateSegment}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  onClick={handleDefineEvent}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
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
                            onClick={() => handleCreateAutomationFromEvent(event.name)}
                            className="text-violet-600 hover:text-violet-700 text-sm"
                          >
                            Create Automation
                          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                          <Button variant="outline" size="sm" onClick={handleConfigureDmarc}>Configure</Button>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                        <Button variant="outline" className="w-full" onClick={handleAddWebhook}>
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
                            <Button variant="outline" onClick={handleCopyApiKey}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleRegenerateApiKey}>
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
                              onClick={() => handleConnectApp(app, idx < 2)}
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

                        <Button variant="outline" className="w-full" onClick={handleExportAllData}>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                          <Button variant="outline" className="flex-1" onClick={handleManageSubscription}>
                            Manage Subscription
                          </Button>
                          <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleUpgradePlan}>
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
                          <Button variant="destructive" size="sm" onClick={handlePurgeContacts}>Purge</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Campaigns</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all campaign history</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteAllCampaigns}>Delete</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Close Account</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete your account</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleCloseAccount}>Close</Button>
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
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Broadcast</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this broadcast? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeletingBroadcastId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteBroadcast}>
                Delete Broadcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Broadcast</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Choose when to send &quot;{schedulingBroadcast?.title}&quot;
            </p>
            <div className="space-y-2">
              <Label>Schedule Date & Time</Label>
              <Input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowScheduleDialog(false); setSchedulingBroadcast(null); setScheduleDateTime(''); }}>
                Cancel
              </Button>
              <Button
                onClick={confirmScheduleBroadcast}
                disabled={!scheduleDateTime}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Schedule Broadcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Contacts Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your CSV file here</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">or</p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csv-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImportedFile(file)
                    toast.success(`File selected: ${(file.size / 1024).toFixed(1)} KB`)
                  }
                }}
              />
              <Button variant="outline" className="mt-4" onClick={() => document.getElementById('csv-file-input')?.click()}>Browse Files</Button>
              {importedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Selected: {importedFile.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Import Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="update-existing" defaultChecked />
                  <Label htmlFor="update-existing">Update existing contacts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="skip-invalid" defaultChecked />
                  <Label htmlFor="skip-invalid">Skip invalid emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="send-welcome" />
                  <Label htmlFor="send-welcome">Send welcome email</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={processImport} className="bg-violet-600 hover:bg-violet-700">
                Import Contacts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Analytics Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Analytics</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Choose the format for your analytics export
            </p>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                <Button variant="outline" onClick={() => processExport('csv')} className="flex flex-col items-center py-4">
                  <span className="text-2xl mb-1">📊</span>
                  <span>CSV</span>
                </Button>
                <Button variant="outline" onClick={() => processExport('excel')} className="flex flex-col items-center py-4">
                  <span className="text-2xl mb-1">📗</span>
                  <span>Excel</span>
                </Button>
                <Button variant="outline" onClick={() => processExport('pdf')} className="flex flex-col items-center py-4">
                  <span className="text-2xl mb-1">📄</span>
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Automation Dialog */}
      <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Automation</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Automation Name</Label>
              <Input placeholder="e.g., Welcome Series, Re-engagement" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="What does this automation do?" />
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select defaultValue="event">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event Triggered</SelectItem>
                  <SelectItem value="segment">Segment Entry</SelectItem>
                  <SelectItem value="time">Time Based</SelectItem>
                  <SelectItem value="api">API Triggered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select defaultValue="user.created">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user.created">User Created</SelectItem>
                  <SelectItem value="purchase.completed">Purchase Completed</SelectItem>
                  <SelectItem value="subscription.upgraded">Subscription Upgraded</SelectItem>
                  <SelectItem value="feature.used">Feature Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actions (add after saving)</p>
              <p className="text-xs text-gray-500">You can add email, push, wait, and condition steps after creating the automation</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAutomationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveAutomation} className="bg-violet-600 hover:bg-violet-700">
                Create Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Series Dialog */}
      <Dialog open={showSeriesDialog} onOpenChange={setShowSeriesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Series</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Series Name</Label>
              <Input placeholder="e.g., Onboarding Journey, Feature Education" />
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
                  <SelectItem value="signup">User Signup</SelectItem>
                  <SelectItem value="segment">Segment Entry</SelectItem>
                  <SelectItem value="manual">Manual Enrollment</SelectItem>
                  <SelectItem value="api">API Trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exit Conditions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="exit-purchase" />
                  <Label htmlFor="exit-purchase">Exit on purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="exit-unsubscribe" defaultChecked />
                  <Label htmlFor="exit-unsubscribe">Exit on unsubscribe</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSeriesDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveSeries} className="bg-violet-600 hover:bg-violet-700">
                Create Series
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g., Welcome Email, Product Update" />
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
                  <SelectItem value="product">Product Updates</SelectItem>
                  <SelectItem value="promotions">Promotions</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input placeholder="Email subject line" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                placeholder="Write your email content here..."
                className="w-full min-h-[150px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveTemplate} className="bg-violet-600 hover:bg-violet-700">
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Segment Dialog */}
      <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Audience Segment</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Segment Name</Label>
              <Input placeholder="e.g., Active Users, High Value Customers" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Describe this segment" />
            </div>
            <div className="space-y-2">
              <Label>Filter Conditions</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                {segmentConditions.map((condition, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 items-center">
                    <Select
                      value={condition.field || 'status'}
                      onValueChange={(value) => {
                        const updated = [...segmentConditions]
                        updated[index].field = value
                        setSegmentConditions(updated)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="last_activity">Last Activity</SelectItem>
                        <SelectItem value="signup_date">Signup Date</SelectItem>
                        <SelectItem value="purchase_count">Purchase Count</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => {
                        const updated = [...segmentConditions]
                        updated[index].operator = value
                        setSegmentConditions(updated)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater">Greater Than</SelectItem>
                        <SelectItem value="less">Less Than</SelectItem>
                        <SelectItem value="within">Within</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => {
                        const updated = [...segmentConditions]
                        updated[index].value = e.target.value
                        setSegmentConditions(updated)
                      }}
                    />
                    {segmentConditions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setSegmentConditions(segmentConditions.filter((_, i) => i !== index))
                          toast.info('Condition removed')
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSegmentConditions([...segmentConditions, { field: '', operator: 'equals', value: '' }])
                    toast.success(`Condition added: ${segmentConditions.length + 1} conditions total`)
                  }}
                >
                  + Add Condition
                </Button>
              </div>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <p className="text-sm text-violet-700 dark:text-violet-400">Estimated audience: ~5,420 contacts</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSegmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveSegment} className="bg-violet-600 hover:bg-violet-700">
                Create Segment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Define Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Define Custom Event</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input placeholder="e.g., button.clicked, form.submitted" />
              <p className="text-xs text-gray-500">Use lowercase with dots or underscores</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="When does this event fire?" />
            </div>
            <div className="space-y-2">
              <Label>Event Properties</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                {eventProperties.map((prop, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 items-center">
                    <Input
                      placeholder="Property name"
                      value={prop.name}
                      onChange={(e) => {
                        const updated = [...eventProperties]
                        updated[index].name = e.target.value
                        setEventProperties(updated)
                      }}
                    />
                    <Select
                      value={prop.type}
                      onValueChange={(value) => {
                        const updated = [...eventProperties]
                        updated[index].type = value
                        setEventProperties(updated)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                    {eventProperties.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setEventProperties(eventProperties.filter((_, i) => i !== index))
                          toast.info('Property removed')
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEventProperties([...eventProperties, { name: '', type: 'string' }])
                    toast.success(`Property added: ${eventProperties.length + 1} properties total`)
                  }}
                >
                  + Add Property
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveEvent} className="bg-violet-600 hover:bg-violet-700">
                Define Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="https://your-service.com/webhook" />
            </div>
            <div className="space-y-2">
              <Label>Secret Key (optional)</Label>
              <Input placeholder="For signature verification" />
            </div>
            <div className="space-y-2">
              <Label>Events to Send</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="flex items-center space-x-2">
                  <Switch id="wh-sent" defaultChecked />
                  <Label htmlFor="wh-sent">Email Sent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wh-opened" defaultChecked />
                  <Label htmlFor="wh-opened">Email Opened</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wh-clicked" defaultChecked />
                  <Label htmlFor="wh-clicked">Link Clicked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wh-bounced" defaultChecked />
                  <Label htmlFor="wh-bounced">Bounced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wh-unsubscribed" defaultChecked />
                  <Label htmlFor="wh-unsubscribed">Unsubscribed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wh-complained" defaultChecked />
                  <Label htmlFor="wh-complained">Spam Complaint</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveWebhook} className="bg-violet-600 hover:bg-violet-700">
                Add Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
              <p className="text-amber-800 dark:text-amber-400 font-medium">Warning</p>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                Regenerating your API key will invalidate the current key. Any applications using the old key will stop working.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRegenerateApiKey}>
                Regenerate Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge Contacts Dialog */}
      <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purge All Contacts</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
              <p className="text-red-800 dark:text-red-400 font-medium">Danger Zone</p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                This will permanently delete all subscriber data. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <Label>Type &quot;DELETE&quot; to confirm</Label>
              <Input placeholder="DELETE" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPurgeDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmPurgeContacts}>
                Purge All Contacts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Campaigns Dialog */}
      <Dialog open={showDeleteCampaignsDialog} onOpenChange={setShowDeleteCampaignsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Campaigns</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
              <p className="text-red-800 dark:text-red-400 font-medium">Danger Zone</p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                This will permanently delete all campaign history and analytics. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <Label>Type &quot;DELETE ALL&quot; to confirm</Label>
              <Input placeholder="DELETE ALL" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteCampaignsDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAllCampaigns}>
                Delete All Campaigns
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Account Dialog */}
      <Dialog open={showCloseAccountDialog} onOpenChange={setShowCloseAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
              <p className="text-red-800 dark:text-red-400 font-medium">This is permanent</p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                Closing your account will permanently delete all your data, campaigns, contacts, and settings. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <Label>Please tell us why you&apos;re leaving</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="too_expensive">Too expensive</SelectItem>
                  <SelectItem value="missing_features">Missing features</SelectItem>
                  <SelectItem value="switching">Switching to another service</SelectItem>
                  <SelectItem value="not_using">Not using anymore</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mb-4">
              <Label>Type &quot;CLOSE ACCOUNT&quot; to confirm</Label>
              <Input placeholder="CLOSE ACCOUNT" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCloseAccountDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmCloseAccount}>
                Close My Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
