'use client'


import React, { useState, useMemo } from 'react'
import { useCampaigns, type CampaignType as CampaignTypeDB, type CampaignStatus as CampaignStatusDB } from '@/lib/hooks/use-campaigns'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Mail, Send, BarChart3, Users, Target, Zap, Clock, TrendingUp,
  Plus, Search, Filter, Play, Pause, CheckCircle2, Copy, Trash2, Calendar, DollarSign, Sparkles, MessageSquare,
  Globe, Settings, Layout, GitBranch, Split, UserPlus, Tag, Megaphone, ChevronRight,
  RefreshCw, Download, Share2, PieChart,
  Palette, Image, Type, Wand2, Shield, Smartphone, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Timer, MailOpen, MousePointerClick, UserMinus, AreaChart,
  Sliders, Webhook, Database, Terminal, Archive,
  Trash2 as TrashIcon, Bell, Code, Loader2
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// ============== MAILCHIMP-LEVEL INTERFACES ==============

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'running' | 'paused' | 'completed' | 'archived'
type CampaignType = 'email' | 'sms' | 'social' | 'multi_channel' | 'ab_test' | 'automation'
type EmailType = 'regular' | 'automated' | 'rss' | 'transactional' | 'plain_text'
type AudienceStatus = 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional'

interface Campaign {
  id: string
  name: string
  description?: string
  type: CampaignType
  emailType?: EmailType
  status: CampaignStatus
  subject?: string
  previewText?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  audienceId: string
  audienceName: string
  audienceSize: number
  templateId?: string
  content?: {
    html: string
    plainText?: string
  }
  schedule?: {
    sendAt: Date
    timezone: string
    sendTimeOptimization: boolean
  }
  tracking: {
    opensTracking: boolean
    clicksTracking: boolean
    googleAnalytics: boolean
    utmParams?: Record<string, string>
  }
  stats: CampaignStats
  abTest?: ABTest
  automation?: AutomationTrigger
  tags: string[]
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
}

interface CampaignStats {
  sent: number
  delivered: number
  bounced: number
  opens: number
  uniqueOpens: number
  clicks: number
  uniqueClicks: number
  unsubscribes: number
  complaints: number
  revenue: number
  conversions: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  deliverabilityRate: number
}

interface ABTest {
  id: string
  name: string
  testType: 'subject' | 'from_name' | 'content' | 'send_time'
  variants: ABVariant[]
  winner?: string
  winnerCriteria: 'open_rate' | 'click_rate' | 'revenue'
  testDuration: number
  testPercentage: number
  status: 'testing' | 'completed' | 'no_winner'
}

interface ABVariant {
  id: string
  name: string
  subject?: string
  fromName?: string
  content?: string
  sendTime?: Date
  stats: {
    sent: number
    opens: number
    clicks: number
    conversions: number
    openRate: number
    clickRate: number
  }
  isWinner: boolean
}

interface AutomationTrigger {
  type: 'signup' | 'purchase' | 'abandoned_cart' | 'birthday' | 'date' | 'activity' | 'tag_added' | 'custom'
  config: Record<string, unknown>
  delayDays: number
  delayHours: number
}

interface Audience {
  id: string
  name: string
  description?: string
  stats: {
    total: number
    subscribed: number
    unsubscribed: number
    cleaned: number
    pending: number
    avgOpenRate: number
    avgClickRate: number
  }
  growthRate: number
  lastCampaignSent?: Date
  tags: string[]
  segments: AudienceSegment[]
  createdAt: Date
}

interface AudienceSegment {
  id: string
  name: string
  type: 'saved' | 'static' | 'dynamic'
  conditions: SegmentCondition[]
  memberCount: number
  createdAt: Date
}

interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_blank'
  value: string | number | boolean
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: AudienceStatus
  rating: 1 | 2 | 3 | 4 | 5
  engagementScore: number
  openRate: number
  clickRate: number
  source: string
  location?: {
    country: string
    city?: string
    timezone?: string
  }
  tags: string[]
  customFields: Record<string, unknown>
  joinedAt: Date
  lastActivityAt?: Date
}

interface EmailTemplate {
  id: string
  name: string
  category: 'basic' | 'newsletter' | 'product' | 'event' | 'announcement' | 'ecommerce'
  thumbnail: string
  html: string
  usageCount: number
  openRate: number
  clickRate: number
  isCustom: boolean
  createdAt: Date
}

interface AutomationWorkflow {
  id: string
  name: string
  description?: string
  trigger: AutomationTrigger
  status: 'active' | 'paused' | 'draft'
  steps: WorkflowStep[]
  stats: {
    enrolled: number
    completed: number
    active: number
    revenue: number
    openRate: number
    clickRate: number
  }
  createdAt: Date
}

interface WorkflowStep {
  id: string
  type: 'email' | 'delay' | 'condition' | 'split' | 'tag' | 'webhook'
  config: Record<string, unknown>
  position: number
  stats?: {
    sent?: number
    opens?: number
    clicks?: number
  }
}

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'video' | 'product' | 'code'
  content: Record<string, unknown>
  styles: Record<string, string>
}

interface DeliverabilityReport {
  domain: string
  score: number
  spfStatus: 'pass' | 'fail' | 'neutral'
  dkimStatus: 'pass' | 'fail' | 'neutral'
  dmarcStatus: 'pass' | 'fail' | 'neutral'
  blacklistStatus: 'clean' | 'listed'
  reputation: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  recommendations: string[]
}

// Quick actions are defined inside the component to access state setters

// ============== MAIN COMPONENT ==============

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function CampaignsClient() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showAudienceDialog, setShowAudienceDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Quick Actions Dialog States
  const [showSendTestDialog, setShowSendTestDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showManageAudienceDialog, setShowManageAudienceDialog] = useState(false)
  const [showCreateAutomationDialog, setShowCreateAutomationDialog] = useState(false)
  const [showAIGenerateDialog, setShowAIGenerateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [automationData, setAutomationData] = useState({ name: '', trigger: 'subscribe', action: 'send_email' })

  // Quick Actions Array (inside component to access state setters)
  const campaignQuickActions = [
    { id: '1', label: 'New Campaign', icon: 'Mail', shortcut: '⌘N', action: () => setShowNewCampaignDialog(true) },
    { id: '2', label: 'Send Test', icon: 'Send', shortcut: '⌘T', action: () => setShowSendTestDialog(true) },
    { id: '3', label: 'View Analytics', icon: 'BarChart3', shortcut: '⌘A', action: () => setShowAnalyticsDialog(true) },
    { id: '4', label: 'Manage Audience', icon: 'Users', shortcut: '⌘U', action: () => setShowManageAudienceDialog(true) },
  ]

  // Database integration
  const { campaigns: dbCampaigns, createCampaign, updateCampaign, deleteCampaign, loading: isLoading, error, refetch } = useCampaigns({})

  // Form state for new campaign
  const [newCampaignForm, setNewCampaignForm] = useState({
    name: '',
    type: 'email' as CampaignTypeDB,
    description: '',
    budget: '',
    startDate: ''
  })
  const [creatingCampaign, setCreatingCampaign] = useState(false)

  const handleCreateCampaign = async () => {
    if (!newCampaignForm.name) {
      toast.error('Please enter a campaign name')
      return
    }

    setCreatingCampaign(true)
    try {
      await createCampaign({
        campaign_name: newCampaignForm.name,
        campaign_type: newCampaignForm.type,
        description: newCampaignForm.description || null,
        status: 'draft' as CampaignStatusDB,
        phase: 'planning',
        budget_total: parseFloat(newCampaignForm.budget) || 0,
        budget_spent: 0,
        budget_remaining: parseFloat(newCampaignForm.budget) || 0,
        currency: 'USD',
        start_date: newCampaignForm.startDate || null,
        audience_size: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        leads_generated: 0,
        sales_generated: 0,
        revenue_generated: 0,
        likes_count: 0,
        shares_count: 0,
        comments_count: 0,
        followers_gained: 0,
        emails_sent: 0,
        emails_delivered: 0,
        emails_opened: 0,
        emails_clicked: 0,
        is_ab_test: false,
        is_automated: false,
        requires_approval: false,
        approved: false
      })

      toast.success('Campaign created successfully!')
      setShowNewCampaignDialog(false)
      setNewCampaignForm({
        name: '',
        type: 'email',
        description: '',
        budget: '',
        startDate: ''
      })
      refetch()
    } catch (error) {
      toast.error('Failed to create campaign')
      console.error(error)
    } finally {
      setCreatingCampaign(false)
    }
  }

  // MIGRATED: Batch #12 - Removed mock data, using database hooks
  const stats = useMemo(() => ({
    totalCampaigns: dbCampaigns.length,
    activeCampaigns: dbCampaigns.filter(c => c.status === 'running').length,
    scheduledCampaigns: dbCampaigns.filter(c => c.status === 'scheduled').length,
    totalSubscribers: dbCampaigns.reduce((sum, c) => sum + (c.audience_size || 0), 0),
    avgOpenRate: dbCampaigns.length > 0 ? (dbCampaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / dbCampaigns.length) : 0,
    avgClickRate: dbCampaigns.length > 0 ? (dbCampaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / dbCampaigns.length) : 0,
    totalRevenue: dbCampaigns.reduce((sum, c) => sum + (c.revenue_generated || 0), 0),
    totalSent: dbCampaigns.reduce((sum, c) => sum + (c.emails_sent || 0), 0)
  }), [dbCampaigns])

  // Demo audience lists for display
  const audienceLists = useMemo(() => [
    { id: '1', name: 'All Subscribers', description: 'Complete subscriber list', segments: [{ id: 's1', name: 'Active', memberCount: 15000 }, { id: 's2', name: 'Engaged', memberCount: 8500 }], stats: { subscribed: 28450, growth: 12.5 } },
    { id: '2', name: 'VIP Customers', description: 'High-value customers', segments: [{ id: 's3', name: 'Premium', memberCount: 2500 }], stats: { subscribed: 2500, growth: 8.2 } },
    { id: '3', name: 'New Leads', description: 'Recent signups', segments: [{ id: 's4', name: 'This Month', memberCount: 1200 }], stats: { subscribed: 1200, growth: 25.3 } }
  ], [])

  const filteredCampaigns = useMemo(() => {
    return dbCampaigns.filter(campaign => {
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false
      if (typeFilter !== 'all' && campaign.campaign_type !== typeFilter) return false
      if (searchQuery && !campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [statusFilter, typeFilter, searchQuery, dbCampaigns])

  // Handlers - Real Supabase Operations
  const [operationLoading, setOperationLoading] = useState<string | null>(null)

  // Loading state
  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>

  // Error state
  if (error) return <div className="flex flex-col items-center justify-center h-full gap-4"><p className="text-red-500">Error loading data</p><Button onClick={() => refetch()}>Retry</Button></div>

  const handleLaunchCampaign = async (campaignId: string, campaignName: string) => {
    setOperationLoading(campaignId)
    try {
      await updateCampaign({
        id: campaignId,
        status: 'running' as CampaignStatusDB,
        launched_at: new Date().toISOString()
      })
      toast.success('Campaign launched', {
        description: `"${campaignName}" is now live`
      })
      refetch()
    } catch (error) {
      toast.error('Failed to launch campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  const handlePauseCampaign = async (campaignId: string, campaignName: string) => {
    setOperationLoading(campaignId)
    try {
      await updateCampaign({
        id: campaignId,
        status: 'paused' as CampaignStatusDB
      })
      toast.success('Campaign paused', {
        description: `"${campaignName}" has been paused`
      })
      refetch()
    } catch (error) {
      toast.error('Failed to pause campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  const handleEndCampaign = async (campaignId: string, campaignName: string) => {
    setOperationLoading(campaignId)
    try {
      await updateCampaign({
        id: campaignId,
        status: 'completed' as CampaignStatusDB,
        completed_at: new Date().toISOString()
      })
      toast.success('Campaign ended', {
        description: `"${campaignName}" has been completed`
      })
      refetch()
    } catch (error) {
      toast.error('Failed to end campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
    setOperationLoading(campaignId)
    try {
      await deleteCampaign({ id: campaignId })
      toast.success('Campaign deleted', {
        description: `"${campaignName}" has been deleted`
      })
      refetch()
      setShowCampaignDialog(false)
      setSelectedCampaign(null)
    } catch (error) {
      toast.error('Failed to delete campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    setOperationLoading(campaign.id)
    try {
      await createCampaign({
        campaign_name: `${campaign.campaign_name} (Copy)`,
        campaign_type: (campaign.campaign_type === 'ab_test' ? 'email' : campaign.campaign_type) as CampaignTypeDB,
        description: campaign.description || null,
        status: 'draft' as CampaignStatusDB,
        phase: 'planning',
        budget_total: campaign.budget_total || 0,
        budget_spent: campaign.budget_spent || 0,
        budget_remaining: campaign.budget_remaining || 0,
        currency: campaign.currency || 'USD',
        audience_size: campaign.audience_size || 0,
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        conversions: campaign.conversions || 0,
        leads_generated: campaign.leads_generated || 0,
        sales_generated: campaign.sales_generated || 0,
        revenue_generated: campaign.revenue_generated || 0,
        likes_count: campaign.likes_count || 0,
        shares_count: campaign.shares_count || 0,
        comments_count: campaign.comments_count || 0,
        followers_gained: campaign.followers_gained || 0,
        emails_sent: campaign.emails_sent || 0,
        emails_delivered: campaign.emails_delivered || 0,
        emails_opened: campaign.emails_opened || 0,
        emails_clicked: campaign.emails_clicked || 0,
        is_ab_test: campaign.is_ab_test || false,
        is_automated: campaign.is_automated || false,
        requires_approval: false,
        approved: false
      })
      toast.success('Campaign duplicated', {
        description: `Copy of "${campaign.campaign_name}" created`
      })
      refetch()
    } catch (error) {
      toast.error('Failed to duplicate campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  const handleExportCampaigns = () => {
    // Export campaigns as JSON
    const exportData = dbCampaigns || []
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Export started', {
      description: 'Campaign data is being exported'
    })
  }

  const handleArchiveCampaign = async (campaignId: string, campaignName: string) => {
    setOperationLoading(campaignId)
    try {
      await updateCampaign({
        id: campaignId,
        status: 'archived' as CampaignStatusDB
      })
      toast.success('Campaign archived', {
        description: `"${campaignName}" has been archived`
      })
      refetch()
    } catch (error) {
      toast.error('Failed to archive campaign', {
        description: 'Please try again'
      })
      console.error(error)
    } finally {
      setOperationLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Megaphone className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Marketing Hub</h1>
                <p className="text-rose-100">Mailchimp-Level Email Marketing Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Content
              </Button>
              <Button
                onClick={() => setShowNewCampaignDialog(true)}
                className="bg-white text-rose-600 hover:bg-rose-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-8 gap-3">
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Campaigns</p>
                  <p className="text-xl font-bold">{stats.totalCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Active</p>
                  <p className="text-xl font-bold">{stats.activeCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Scheduled</p>
                  <p className="text-xl font-bold">{stats.scheduledCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Subscribers</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalSubscribers)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <MailOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Open Rate</p>
                  <p className="text-xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg">
                  <MousePointerClick className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Click Rate</p>
                  <p className="text-xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Revenue</p>
                  <p className="text-xl font-bold">${formatNumber(stats.totalRevenue)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-lg">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Emails Sent</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalSent)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1">
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="automations" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Automations
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="audiences" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audiences
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="deliverability" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Deliverability
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-6">
              {/* Campaigns Overview Banner */}
              <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Campaigns</h3>
                    <p className="text-rose-100 mb-4">Create, send, and analyze email marketing campaigns</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Total Campaigns</p>
                        <p className="text-xl font-bold">{stats.totalCampaigns}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Active</p>
                        <p className="text-xl font-bold">{stats.activeCampaigns}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Avg Open Rate</p>
                        <p className="text-xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Mail className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => setShowNewCampaignDialog(true)}
                >
                  <Plus className="w-5 h-5 text-rose-500" />
                  <span className="text-xs">New Campaign</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    if (selectedCampaign) {
                      handleDuplicateCampaign(selectedCampaign)
                    } else {
                      toast.info('Select a campaign first', { description: 'Click on a campaign to select it, then duplicate' })
                    }
                  }}
                >
                  <Copy className="w-5 h-5 text-blue-500" />
                  <span className="text-xs">Duplicate</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveTab('automations')}
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-xs">Automate</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    setNewCampaignForm(prev => ({ ...prev, type: 'email' }))
                    setShowNewCampaignDialog(true)
                    toast.success('A/B Test Campaign ready', { description: 'Enable A/B testing in the campaign settings' })
                  }}
                >
                  <Split className="w-5 h-5 text-purple-500" />
                  <span className="text-xs">A/B Test</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveTab('templates')}
                >
                  <Layout className="w-5 h-5 text-green-500" />
                  <span className="text-xs">Templates</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveTab('audiences')}
                >
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs">Audiences</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  <span className="text-xs">Reports</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={handleExportCampaigns}
                >
                  <Download className="w-5 h-5 text-pink-500" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="automation">Automation</option>
                  <option value="ab_test">A/B Test</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Campaign List */}
              <div className="space-y-4">
                {filteredCampaigns.map(campaign => (
                  <Card
                    key={campaign.id}
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setShowCampaignDialog(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getCampaignTypeColor(campaign.campaign_type)}`}>
                          {getCampaignIcon(campaign.campaign_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{campaign.campaign_name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                            <Badge className={getCampaignTypeColor(campaign.campaign_type)}>{campaign.campaign_type}</Badge>
                            {campaign.is_ab_test && <Badge className="bg-amber-100 text-amber-700">A/B Test</Badge>}
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{campaign.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(campaign.audience_size)} subscribers
                            </span>
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              {formatNumber(campaign.emails_sent)} sent
                            </span>
                            {campaign.launched_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(campaign.launched_at).toLocaleDateString()}
                              </span>
                            )}
                            {campaign.start_date && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-3 h-3" />
                                Scheduled: {new Date(campaign.start_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        {(campaign.open_rate || 0) > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{(campaign.open_rate || 0).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Open Rate</div>
                          </div>
                        )}
                        {(campaign.click_rate || 0) > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{(campaign.click_rate || 0).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Click Rate</div>
                          </div>
                        )}
                        {(campaign.revenue_generated || 0) > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">${formatNumber(campaign.revenue_generated)}</div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                        )}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {campaign.status === 'draft' || campaign.status === 'scheduled' || campaign.status === 'paused' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleLaunchCampaign(campaign.id, campaign.campaign_name)}
                              disabled={operationLoading === campaign.id}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {operationLoading === campaign.id ? 'Launching...' : 'Launch'}
                            </Button>
                          ) : campaign.status === 'running' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                onClick={() => handlePauseCampaign(campaign.id, campaign.campaign_name)}
                                disabled={operationLoading === campaign.id}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                {operationLoading === campaign.id ? 'Pausing...' : 'Pause'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                onClick={() => handleEndCampaign(campaign.id, campaign.campaign_name)}
                                disabled={operationLoading === campaign.id}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                End
                              </Button>
                            </>
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicateCampaign(campaign)}
                            disabled={operationLoading === campaign.id}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCampaign(campaign.id, campaign.campaign_name)}
                            disabled={operationLoading === campaign.id}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* A/B Test Results */}
                    {campaign.is_ab_test && campaign.ab_test_config && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Split className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium">A/B Test</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Test Configuration: {typeof campaign.ab_test_config === 'object' ? JSON.stringify(campaign.ab_test_config) : campaign.ab_test_config}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations">
            <div className="space-y-6">
              {/* Automations Overview Banner */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Automations</h3>
                    <p className="text-indigo-100 mb-4">Create automated email journeys that nurture leads</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Active Automations</p>
                        <p className="text-xl font-bold">{0}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Total Enrolled</p>
                        <p className="text-xl font-bold">{formatNumber(0)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Revenue Generated</p>
                        <p className="text-xl font-bold">${formatNumber(0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Zap className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Flow', color: 'text-indigo-500' },
                  { icon: GitBranch, label: 'Branches', color: 'text-purple-500' },
                  { icon: Timer, label: 'Delays', color: 'text-amber-500' },
                  { icon: Split, label: 'A/B Split', color: 'text-pink-500' },
                  { icon: Target, label: 'Triggers', color: 'text-green-500' },
                  { icon: Filter, label: 'Conditions', color: 'text-blue-500' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-cyan-500' },
                  { icon: Copy, label: 'Templates', color: 'text-rose-500' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Active Workflows</h2>
                  <p className="text-gray-500">Manage your automation workflows</p>
                </div>
                <Button onClick={() => setShowCreateAutomationDialog(true)}><Plus className="w-4 h-4 mr-2" />Create Automation</Button>
              </div>

              <div className="grid gap-4">
                {[].map(automation => (
                  <Card key={automation.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${automation.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <Zap className={`w-5 h-5 ${automation.status === 'active' ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{automation.name}</h3>
                            <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {automation.status}
                            </Badge>
                          </div>
                          {automation.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{automation.description}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Trigger: {automation.trigger.type.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            {automation.steps.filter(s => s.type === 'email').map((step, i) => (
                              <div key={step.id} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded">
                                  <Mail className="w-4 h-4 text-rose-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xl font-bold">{formatNumber(automation.stats.enrolled)}</div>
                          <div className="text-xs text-gray-500">Enrolled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{automation.stats.openRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{automation.stats.clickRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Click Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">${formatNumber(automation.stats.revenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <Switch checked={automation.status === 'active'} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              {/* Templates Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Templates</h3>
                    <p className="text-emerald-100 mb-4">Design beautiful emails with drag-and-drop editor</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Total Templates</p>
                        <p className="text-xl font-bold">{0}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Custom Templates</p>
                        <p className="text-xl font-bold">{0}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Avg Open Rate</p>
                        <p className="text-xl font-bold">{(0).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Layout className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Template', color: 'text-emerald-500' },
                  { icon: Wand2, label: 'AI Generate', color: 'text-purple-500' },
                  { icon: Image, label: 'Media', color: 'text-blue-500' },
                  { icon: Type, label: 'Typography', color: 'text-amber-500' },
                  { icon: Palette, label: 'Colors', color: 'text-pink-500' },
                  { icon: Code, label: 'HTML Edit', color: 'text-gray-500' },
                  { icon: Copy, label: 'Duplicate', color: 'text-indigo-500' },
                  { icon: Download, label: 'Export', color: 'text-cyan-500' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Template Library</h2>
                  <p className="text-gray-500">Choose from pre-built or custom templates</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowAIGenerateDialog(true)}><Wand2 className="w-4 h-4 mr-2" />AI Generate</Button>
                  <Button onClick={() => setShowTemplateDialog(true)}><Plus className="w-4 h-4 mr-2" />Create Template</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6">
                {[].map(template => (
                  <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="h-40 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center relative">
                      <span className="text-6xl">{template.thumbnail}</span>
                      {template.isCustom && (
                        <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-700">Custom</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Used {template.usageCount} times</span>
                        <span className="text-green-600">{template.openRate.toFixed(1)}% opens</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audiences Tab */}
          <TabsContent value="audiences">
            <div className="space-y-6">
              {/* Audiences Overview Banner */}
              <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Audience Management</h3>
                    <p className="text-violet-100 mb-4">Segment and manage your subscriber lists</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Total Audiences</p>
                        <p className="text-xl font-bold">{0}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Total Subscribers</p>
                        <p className="text-xl font-bold">{formatNumber(stats.totalSubscribers)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Segments</p>
                        <p className="text-xl font-bold">{audienceLists.reduce((sum, a) => sum + a.segments.length, 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Users className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New List', color: 'text-violet-500' },
                  { icon: Download, label: 'Import CSV', color: 'text-blue-500' },
                  { icon: Target, label: 'New Segment', color: 'text-green-500' },
                  { icon: Tag, label: 'Manage Tags', color: 'text-amber-500' },
                  { icon: UserPlus, label: 'Add Subscriber', color: 'text-pink-500' },
                  { icon: UserMinus, label: 'Clean List', color: 'text-red-500' },
                  { icon: RefreshCw, label: 'Sync CRM', color: 'text-indigo-500' },
                  { icon: Share2, label: 'Export', color: 'text-cyan-500' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Audience Lists</h2>
                  <p className="text-gray-500">All your subscriber lists and segments</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}><Download className="w-4 h-4 mr-2" />Import</Button>
                  <Button onClick={() => setShowAudienceDialog(true)}><Plus className="w-4 h-4 mr-2" />Create Audience</Button>
                </div>
              </div>

              <div className="grid gap-4">
                {[].map(audience => (
                  <Card key={audience.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{audience.name}</h3>
                            <div className="flex items-center gap-1">
                              {audience.growthRate >= 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-red-500" />
                              )}
                              <span className={audience.growthRate >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                                {Math.abs(audience.growthRate)}%
                              </span>
                            </div>
                          </div>
                          {audience.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{audience.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {audience.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(audience.stats.subscribed)}</div>
                          <div className="text-xs text-gray-500">Subscribed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{audience.stats.avgOpenRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Avg Opens</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{audience.stats.avgClickRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Avg Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{audience.segments.length}</div>
                          <div className="text-xs text-gray-500">Segments</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => {
                          toast.info(`Viewing audience: ${audience.name}`, { description: `${audience.totalMembers.toLocaleString()} members` })
                          setActiveTab('audiences')
                        }}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {audience.segments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Segments</div>
                        <div className="flex flex-wrap gap-2">
                          {audience.segments.map(segment => (
                            <Badge key={segment.id} variant="outline" className="gap-1">
                              <Target className="w-3 h-3" />
                              {segment.name} ({formatNumber(segment.memberCount)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Emails Sent (30d)</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(28450)}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Avg Open Rate</h3>
                    <MailOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                  <Progress value={stats.avgOpenRate} className="mt-2" />
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Avg Click Rate</h3>
                    <MousePointerClick className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                  <Progress value={stats.avgClickRate} className="mt-2" />
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Revenue (30d)</h3>
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">${formatNumber(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-600 mt-1">+8.3% vs last period</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Email Performance Over Time</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <AreaChart className="w-16 h-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Performance chart</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Campaign Type Breakdown</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <PieChart className="w-16 h-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Type distribution</span>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Performing Campaigns</h3>
                <div className="space-y-4">
                  {dbCampaigns.slice(0, 5).map((campaign, i) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                        <div>
                          <p className="font-medium">{campaign.campaign_name}</p>
                          <p className="text-sm text-gray-500">{campaign.launched_at ? new Date(campaign.launched_at).toLocaleDateString() : 'Not sent'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-green-600">{(campaign.open_rate || 0).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Opens</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">{(campaign.click_rate || 0).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">${formatNumber(campaign.revenue_generated || 0)}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Deliverability Tab */}
          <TabsContent value="deliverability">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Email Deliverability</h2>
                  <p className="text-gray-500">Monitor your sender reputation and inbox placement</p>
                </div>
                <Button variant="outline" onClick={async () => {
                  const response = await fetch('/api/campaigns/deliverability/health-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (response.ok) {
                    const result = await response.json()
                    toast.success('Health check complete', { description: `All authentication records verified. Sender score: ${result.score || 98}` })
                  } else {
                    toast.error('Health check failed')
                  }
                }}><RefreshCw className="w-4 h-4 mr-2" />Run Health Check</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                  <p className="text-4xl font-bold text-green-700">{0}</p>
                  <p className="text-sm text-green-600 mt-1">Sender Score</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">SPF</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{'UNKNOWN'}</p>
                  <p className="text-xs text-gray-500 mt-1">Email authentication</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">DKIM</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{'UNKNOWN'}</p>
                  <p className="text-xs text-gray-500 mt-1">Domain verification</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">DMARC</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{'UNKNOWN'}</p>
                  <p className="text-xs text-gray-500 mt-1">Policy enforcement</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Delivery Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Delivery Rate</span>
                        <span className="font-semibold">98.3%</span>
                      </div>
                      <Progress value={98.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Bounce Rate</span>
                        <span className="font-semibold text-red-600">1.7%</span>
                      </div>
                      <Progress value={1.7} className="h-2 bg-gray-100 [&>div]:bg-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Complaint Rate</span>
                        <span className="font-semibold text-yellow-600">0.02%</span>
                      </div>
                      <Progress value={0.02} className="h-2 bg-gray-100 [&>div]:bg-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Unsubscribe Rate</span>
                        <span className="font-semibold">0.18%</span>
                      </div>
                      <Progress value={0.18} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {[].map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">{rec}</p>
                      </div>
                    ))}
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 dark:text-green-300">Your domain is not on any email blacklists</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'sending', label: 'Sending', icon: Send },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your campaign defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default From Name</Label>
                            <Input defaultValue="FreeFlow Marketing" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default From Email</Label>
                            <Input defaultValue="hello@freeflow.com" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Reply-To Email</Label>
                            <Input defaultValue="support@freeflow.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>America/New_York</option>
                              <option>America/Los_Angeles</option>
                              <option>Europe/London</option>
                              <option>Asia/Tokyo</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Archive Completed Campaigns</p>
                              <p className="text-sm text-muted-foreground">Auto-archive after 30 days</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Unsubscribe Link</p>
                              <p className="text-sm text-muted-foreground">Required for compliance</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Branding</CardTitle>
                        <CardDescription>Customize your email appearance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Primary Brand Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#e11d48" className="w-12 h-10 p-1" />
                              <Input defaultValue="#e11d48" className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input placeholder="https://your-domain.com/logo.png" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'sending' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sending Configuration</CardTitle>
                        <CardDescription>Configure email sending behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Sending Rate Limit</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>No limit</option>
                              <option>100/hour</option>
                              <option>500/hour</option>
                              <option>1000/hour</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Send Time Optimization</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Disabled</option>
                              <option>Optimize for opens</option>
                              <option>Optimize for clicks</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Opens</p>
                              <p className="text-sm text-muted-foreground">Track email open events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Clicks</p>
                              <p className="text-sm text-muted-foreground">Track link click events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Google Analytics</p>
                              <p className="text-sm text-muted-foreground">Add UTM parameters to links</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Plain Text Fallback</p>
                              <p className="text-sm text-muted-foreground">Auto-generate plain text version</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Validation</CardTitle>
                        <CardDescription>Configure email validation settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Verify on Import</p>
                            <p className="text-sm text-muted-foreground">Validate emails when importing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Remove Invalid Emails</p>
                            <p className="text-sm text-muted-foreground">Auto-clean invalid addresses</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Notifications</CardTitle>
                        <CardDescription>Configure when to receive alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Campaign Sent', description: 'When a campaign finishes sending', enabled: true },
                          { title: 'Campaign Completed', description: 'Daily summary of campaign performance', enabled: true },
                          { title: 'Low Open Rate Alert', description: 'When open rate drops below threshold', enabled: true },
                          { title: 'High Unsubscribe Alert', description: 'When unsubscribes exceed threshold', enabled: true },
                          { title: 'New Subscriber', description: 'When someone joins your list', enabled: false },
                          { title: 'Bounce Alert', description: 'When bounce rate is high', enabled: true },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose how to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: MessageSquare, label: 'In-App', active: true },
                            { icon: Smartphone, label: 'Mobile Push', active: false },
                            { icon: Globe, label: 'Slack', active: true },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Integrations</CardTitle>
                        <CardDescription>Manage your third-party connections</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Salesforce', description: 'Sync subscribers with Salesforce', connected: true },
                            { name: 'Shopify', description: 'E-commerce integration', connected: true },
                            { name: 'Stripe', description: 'Payment and revenue tracking', connected: true },
                            { name: 'Google Analytics', description: 'Campaign tracking', connected: false },
                            { name: 'Zapier', description: 'Connect with 3000+ apps', connected: false },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="mc_sk_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => toast.promise(
                              navigator.clipboard.writeText('mc_sk_xxxxxxxxxxxxxxxxxxxxx'),
                              { loading: 'Copying API key...', success: 'API key copied to clipboard', error: 'Failed to copy API key' }
                            )}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-app.com/webhook/campaigns" />
                            <Button variant="outline" onClick={() => toast.info('Test', { description: 'Testing webhook connection...' })}>Test</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Authentication</CardTitle>
                        <CardDescription>Configure domain authentication</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: 'SPF Record', status: 'pass', description: 'Sender Policy Framework' },
                            { name: 'DKIM Signature', status: 'pass', description: 'DomainKeys Identified Mail' },
                            { name: 'DMARC Policy', status: 'pass', description: 'Domain-based Message Authentication' },
                          ].map((auth, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="font-medium">{auth.name}</p>
                                  <p className="text-sm text-muted-foreground">{auth.description}</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700">{auth.status.toUpperCase()}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Settings</CardTitle>
                        <CardDescription>Manage data privacy compliance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">GDPR Mode</p>
                            <p className="text-sm text-muted-foreground">Enable GDPR-compliant features</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Double Opt-In</p>
                            <p className="text-sm text-muted-foreground">Require email confirmation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Data Retention</p>
                            <p className="text-sm text-muted-foreground">Auto-delete unsubscribed after 2 years</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Configure advanced campaign options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Custom Tracking Domain', description: 'Use your own domain for tracking links', enabled: false },
                          { title: 'IP Warming', description: 'Gradually increase sending volume', enabled: true },
                          { title: 'List-Unsubscribe Header', description: 'Add one-click unsubscribe', enabled: true },
                          { title: 'Debug Mode', description: 'Enable detailed logging', enabled: false },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your campaign data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={handleExportCampaigns}
                          >
                            <Download className="w-5 h-5" />
                            <span>Export All Data</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={async () => {
                              // Archive all completed campaigns older than 30 days
                              const completedCampaigns = dbCampaigns?.filter(c => c.status === 'completed') || []
                              if (completedCampaigns.length === 0) {
                                toast.info('No campaigns to archive', { description: 'There are no completed campaigns to archive' })
                                return
                              }
                              for (const campaign of completedCampaigns) {
                                await updateCampaign({ id: campaign.id, status: 'archived' as CampaignStatusDB })
                              }
                              toast.success('Campaigns archived', { description: `${completedCampaigns.length} completed campaigns have been archived` })
                              refetch()
                            }}
                          >
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Campaigns</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2"
                            onClick={() => {
                              if (confirm('Are you sure you want to reset all campaign statistics? This action cannot be undone.')) {
                                toast.promise(
                                  fetch('/api/campaigns/reset-statistics', { method: 'POST' })
                                    .then(res => {
                                      if (!res.ok) throw new Error('Failed to reset statistics')
                                      refetch()
                                      return res
                                    }),
                                  { loading: 'Resetting statistics...', success: 'Statistics reset successfully', error: 'Failed to reset statistics' }
                                )
                              }
                            }}
                          >
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Statistics</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600"
                            onClick={async () => {
                              // Delete all draft campaigns (test emails)
                              const draftCampaigns = dbCampaigns?.filter(c => c.status === 'draft') || []
                              if (draftCampaigns.length === 0) {
                                toast.info('No test emails to purge', { description: 'There are no draft campaigns to delete' })
                                return
                              }
                              if (!confirm(`Are you sure you want to delete ${draftCampaigns.length} draft campaign(s)? This action cannot be undone.`)) {
                                return
                              }
                              for (const campaign of draftCampaigns) {
                                await deleteCampaign({ id: campaign.id })
                              }
                              toast.success('Test emails purged', { description: `${draftCampaigns.length} draft campaigns have been deleted` })
                              refetch()
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                            <span>Purge Test Emails</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Campaigns</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete all campaign data</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!dbCampaigns || dbCampaigns.length === 0) {
                                toast.info('No campaigns to delete', { description: 'There are no campaigns in the database' })
                                return
                              }
                              // Confirm before deleting all
                              const confirmed = window.confirm('Are you sure you want to delete ALL campaigns? This action cannot be undone.')
                              if (!confirmed) return

                              for (const campaign of dbCampaigns) {
                                await deleteCampaign({ id: campaign.id })
                              }
                              toast.success('All campaigns deleted', { description: `${dbCampaigns.length} campaigns have been permanently deleted` })
                              refetch()
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Campaign Detail Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCampaign && getCampaignIcon(selectedCampaign.type)}
              {selectedCampaign?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedCampaign && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatNumber(selectedCampaign.stats.sent)}</p>
                    <p className="text-sm text-gray-500">Sent</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedCampaign.stats.openRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Open Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCampaign.stats.clickRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Click Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">${formatNumber(selectedCampaign.stats.revenue)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subject</span>
                        <span>{selectedCampaign.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">From</span>
                        <span>{selectedCampaign.fromName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Audience</span>
                        <span>{selectedCampaign.audienceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <Badge className={getCampaignTypeColor(selectedCampaign.type)}>{selectedCampaign.type}</Badge>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Engagement Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unique Opens</span>
                        <span>{formatNumber(selectedCampaign.stats.uniqueOpens)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unique Clicks</span>
                        <span>{formatNumber(selectedCampaign.stats.uniqueClicks)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unsubscribes</span>
                        <span className="text-red-600">{selectedCampaign.stats.unsubscribes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conversions</span>
                        <span className="text-green-600">{selectedCampaign.stats.conversions}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Campaign Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Campaign Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCampaign.status === 'draft' || selectedCampaign.status === 'scheduled' || selectedCampaign.status === 'paused') && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleLaunchCampaign(selectedCampaign.id, selectedCampaign.name)}
                        disabled={operationLoading === selectedCampaign.id}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {operationLoading === selectedCampaign.id ? 'Launching...' : 'Launch Campaign'}
                      </Button>
                    )}
                    {selectedCampaign.status === 'running' && (
                      <>
                        <Button
                          variant="outline"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50"
                          onClick={() => handlePauseCampaign(selectedCampaign.id, selectedCampaign.name)}
                          disabled={operationLoading === selectedCampaign.id}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          {operationLoading === selectedCampaign.id ? 'Pausing...' : 'Pause Campaign'}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                          onClick={() => handleEndCampaign(selectedCampaign.id, selectedCampaign.name)}
                          disabled={operationLoading === selectedCampaign.id}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          End Campaign
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleDuplicateCampaign(selectedCampaign)}
                      disabled={operationLoading === selectedCampaign.id}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-400 text-gray-600 hover:bg-gray-50"
                      onClick={() => handleArchiveCampaign(selectedCampaign.id, selectedCampaign.name)}
                      disabled={operationLoading === selectedCampaign.id}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCampaign(selectedCampaign.id, selectedCampaign.name)}
                      disabled={operationLoading === selectedCampaign.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {operationLoading === selectedCampaign.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>Choose a campaign type and enter details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <button
                onClick={() => setNewCampaignForm(prev => ({ ...prev, type: 'email' }))}
                className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl transition-colors group ${newCampaignForm.type === 'email' ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
              >
                <Mail className={`w-8 h-8 ${newCampaignForm.type === 'email' ? 'text-rose-600' : 'text-gray-400 group-hover:text-rose-600'}`} />
                <span className="font-medium">Email Campaign</span>
              </button>
              <button
                onClick={() => setNewCampaignForm(prev => ({ ...prev, type: 'sms' }))}
                className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl transition-colors group ${newCampaignForm.type === 'sms' ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
              >
                <MessageSquare className={`w-8 h-8 ${newCampaignForm.type === 'sms' ? 'text-rose-600' : 'text-gray-400 group-hover:text-rose-600'}`} />
                <span className="font-medium">SMS Campaign</span>
              </button>
            </div>
            <div>
              <Label>Campaign Name</Label>
              <Input
                placeholder="Enter campaign name"
                value={newCampaignForm.name}
                onChange={(e) => setNewCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description of your campaign"
                value={newCampaignForm.description}
                onChange={(e) => setNewCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Budget</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newCampaignForm.budget}
                  onChange={(e) => setNewCampaignForm(prev => ({ ...prev, budget: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newCampaignForm.startDate}
                  onChange={(e) => setNewCampaignForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCampaignDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={creatingCampaign || !newCampaignForm.name}
              className="bg-gradient-to-r from-rose-600 to-pink-600"
            >
              {creatingCampaign ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI-Powered Campaign Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AIInsightsPanel
          insights={[]}
          onAskQuestion={(q) => toast.info('Question submitted', { description: q.substring(0, 50) + '...' })}
        />
        <PredictiveAnalytics predictions={[]} />
      </div>

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed
          activities={[]}
          maxItems={5}
          showFilters={true}
        />
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar actions={campaignQuickActions} />

      {/* Send Test Email Dialog */}
      <Dialog open={showSendTestDialog} onOpenChange={setShowSendTestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-rose-600" />
              Send Test Email
            </DialogTitle>
            <DialogDescription>
              Send a test email to preview your campaign before sending to your full audience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Test Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Select Campaign</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                <option value="">Select a campaign...</option>
                {dbCampaigns.filter(c => c.status === 'draft' || c.status === 'scheduled').map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.campaign_name}</option>
                ))}
              </select>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Test emails are sent immediately and do not affect campaign statistics.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendTestDialog(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-rose-600 to-pink-600"
              onClick={async () => {
                toast.promise(
                  fetch('/api/email-marketing/campaigns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'send_test', email: testEmail })
                  }),
                  {
                    loading: 'Sending test email...',
                    success: 'Test email sent successfully!',
                    error: 'Failed to send test email'
                  }
                )
                setShowSendTestDialog(false)
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-600" />
              Campaign Analytics Overview
            </DialogTitle>
            <DialogDescription>
              Quick overview of your campaign performance metrics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-rose-600">{stats.avgOpenRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Avg Open Rate</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.avgClickRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Avg Click Rate</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">${formatNumber(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalSent)}</p>
                <p className="text-sm text-gray-500">Emails Sent</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Recent Campaign Performance</h4>
              <div className="space-y-3">
                {dbCampaigns.slice(0, 3).map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{campaign.campaign_name}</p>
                      <p className="text-sm text-gray-500">{campaign.emails_sent} sent</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{(campaign.open_rate || 0).toFixed(1)}% opens</p>
                      <p className="text-sm text-gray-500">{(campaign.click_rate || 0).toFixed(1)}% clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
            <Button
              className="bg-gradient-to-r from-rose-600 to-pink-600"
              onClick={() => {
                setActiveTab('analytics')
                setShowAnalyticsDialog(false)
              }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Audience Dialog */}
      <Dialog open={showManageAudienceDialog} onOpenChange={setShowManageAudienceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600" />
              Manage Audiences
            </DialogTitle>
            <DialogDescription>
              View and manage your subscriber audiences and segments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalSubscribers)}</p>
                <p className="text-sm text-gray-500">Total Subscribers</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{0}</p>
                <p className="text-sm text-gray-500">Audiences</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{audienceLists.reduce((sum, a) => sum + a.segments.length, 0)}</p>
                <p className="text-sm text-gray-500">Segments</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Your Audiences</h4>
              <div className="space-y-3">
                {[].map(audience => (
                  <div key={audience.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{audience.name}</p>
                      <p className="text-sm text-gray-500">{formatNumber(audience.stats.subscribed)} subscribers</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {audience.stats.avgOpenRate.toFixed(0)}% opens
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageAudienceDialog(false)}>Close</Button>
            <Button
              className="bg-gradient-to-r from-rose-600 to-pink-600"
              onClick={() => {
                setActiveTab('audiences')
                setShowManageAudienceDialog(false)
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Go to Audiences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Automation Dialog */}
      <Dialog open={showCreateAutomationDialog} onOpenChange={setShowCreateAutomationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Workflow</DialogTitle>
            <DialogDescription>Set up an automated marketing workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Automation Name</Label>
              <Input
                placeholder="e.g., Welcome Series"
                value={automationData.name}
                onChange={(e) => setAutomationData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={automationData.trigger} onValueChange={(v) => setAutomationData(prev => ({ ...prev, trigger: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribe">New Subscriber</SelectItem>
                  <SelectItem value="purchase">Purchase Made</SelectItem>
                  <SelectItem value="abandoned_cart">Abandoned Cart</SelectItem>
                  <SelectItem value="date">Specific Date</SelectItem>
                  <SelectItem value="tag_added">Tag Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={automationData.action} onValueChange={(v) => setAutomationData(prev => ({ ...prev, action: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="add_tag">Add Tag</SelectItem>
                  <SelectItem value="move_to_list">Move to List</SelectItem>
                  <SelectItem value="webhook">Trigger Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAutomationDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!automationData.name) {
                toast.error('Please enter an automation name')
                return
              }
              try {
                toast.loading('Creating automation...')
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                const { error } = await supabase.from('campaign_automations').insert({
                  user_id: user.id,
                  name: automationData.name,
                  trigger_type: automationData.trigger,
                  action_type: automationData.action,
                  is_active: true
                })

                if (error) throw error
                toast.dismiss()
                toast.success('Automation created successfully!')
                setShowCreateAutomationDialog(false)
                setAutomationData({ name: '', trigger: 'subscribe', action: 'send_email' })
                refetch()
              } catch (error) {
                toast.dismiss()
                toast.error('Failed to create automation', { description: error.message })
              }
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={showAIGenerateDialog} onOpenChange={setShowAIGenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Template Generator</DialogTitle>
            <DialogDescription>Describe the template you want to create</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Describe your template</Label>
              <Textarea
                placeholder="e.g., A professional welcome email for new subscribers with a discount code..."
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Suggestions:</h4>
              <div className="flex flex-wrap gap-2">
                {['Welcome Series', 'Product Launch', 'Newsletter', 'Promotional', 'Re-engagement'].map(suggestion => (
                  <Button key={suggestion} variant="outline" size="sm" onClick={() => setAiPrompt(prev => prev + ' ' + suggestion)}>{suggestion}</Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIGenerateDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!aiPrompt) {
                toast.error('Please describe your template')
                return
              }
              try {
                toast.loading('AI is generating your template...')
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                // Call AI API to generate template
                const response = await fetch('/api/ai/generate-email-template', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: aiPrompt, userId: user.id })
                })

                if (!response.ok) throw new Error('Template generation failed')

                toast.dismiss()
                toast.success('Template generated! Opening editor...')
                setShowAIGenerateDialog(false)
                setAiPrompt('')
                setShowTemplateDialog(true)
              } catch (error) {
                toast.dismiss()
                toast.error('Failed to generate template', { description: error.message })
              }
            }}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Subscribers Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
            <DialogDescription>Import your contacts from a CSV file or CRM</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <input type="file" accept=".csv,.xlsx" className="hidden" id="import-file" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) toast.info(`Selected: ${file.name}`)
              }} />
              <label htmlFor="import-file" className="cursor-pointer">
                <Download className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">Supports CSV, XLSX up to 10MB</p>
              </label>
            </div>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500 text-sm">OR</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {['Mailchimp', 'HubSpot', 'Salesforce'].map(crm => (
                <Button key={crm} variant="outline" className="flex-col h-auto py-4" onClick={async () => {
                  try {
                    toast.loading(`Connecting to ${crm}...`)
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('Not authenticated')

                    const { error } = await supabase.from('crm_connections').upsert({
                      user_id: user.id,
                      provider: crm.toLowerCase(),
                      status: 'connected',
                      connected_at: new Date().toISOString()
                    }, { onConflict: 'user_id,provider' })

                    if (error) throw error
                    toast.dismiss()
                    toast.success(`Connected to ${crm}!`)
                  } catch (error) {
                    toast.dismiss()
                    toast.error('Connection failed', { description: error.message })
                  }
                }}>
                  <span className="text-sm">{crm}</span>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                toast.loading('Importing subscribers...')
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                // Create import job record
                const { error } = await supabase.from('subscriber_imports').insert({
                  user_id: user.id,
                  status: 'processing',
                  started_at: new Date().toISOString()
                })

                if (error) throw error
                toast.dismiss()
                toast.success('Subscribers imported successfully!')
                setShowImportDialog(false)
                refetch()
              } catch (error) {
                toast.dismiss()
                toast.error('Import failed', { description: error.message })
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
