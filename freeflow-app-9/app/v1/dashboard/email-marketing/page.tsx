'use client'

// MIGRATED: Batch #24 - Removed mock data, using database hooks

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  getCampaignStatusColor,
  getSubscriberStatusColor,
  getCampaignTypeIcon,
  formatPercentage,
  getEngagementColor
} from '@/lib/email-marketing-utils'
import { CampaignStatus } from '@/lib/email-marketing-types'

import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { sanitizeHtml } from '@/lib/sanitize'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const logger = createFeatureLogger('EmailMarketingPage')

type ViewMode = 'overview' | 'campaigns' | 'subscribers' | 'automation' | 'templates'

export default function EmailMarketingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Database state
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all')

  // Template preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  // Subscriber form modal state
  const [isSubscriberFormOpen, setIsSubscriberFormOpen] = useState(false)
  const [isSavingSubscriber, setIsSavingSubscriber] = useState(false)
  const [subscriberForm, setSubscriberForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    tags: [] as string[],
    source: 'manual' as string
  })

  // Automation modal state
  const [isAutomationOpen, setIsAutomationOpen] = useState(false)
  const [automationForm, setAutomationForm] = useState({
    name: '',
    trigger: 'signup' as string,
    delay: '1' as string,
    action: 'welcome' as string
  })
  const [automations, setAutomations] = useState([])

  useEffect(() => {
    const loadEmailMarketingData = async () => {
      if (!userId) {        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)        // Dynamic import for code splitting
        const { getEmailCampaigns, getEmailSubscribers, getEmailMarketingStats, getEmailTemplates } = await import('@/lib/email-marketing-queries')

        // Load campaigns, subscribers, stats, and templates in parallel
        const [campaignsResult, subscribersResult, statsResult, templatesResult] = await Promise.all([
          getEmailCampaigns(userId),
          getEmailSubscribers(userId),
          getEmailMarketingStats(userId),
          getEmailTemplates(userId)
        ])

        if (campaignsResult.error || subscribersResult.error || statsResult.error || templatesResult.error) {
          throw new Error('Failed to load email marketing data')
        }

        // Update state with database data
        setCampaigns(campaignsResult.data || [])
        setSubscribers(subscribersResult.data || [])
        setStats(statsResult.data || null)
        setTemplates(templatesResult.data || [])

        setIsLoading(false)
        toast.success(`Email marketing loaded: ${campaignsResult.data?.length || 0} campaigns, ${subscribersResult.data?.length || 0} subscribers, ${templatesResult.data?.length || 0} templates`)
        announce('Email marketing data loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load email marketing data'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load email marketing data', { error: errorMessage, userId })
        toast.error('Failed to load email marketing')
        announce('Error loading email marketing data', 'assertive')
      }
    }

    loadEmailMarketingData()
  }, [userId, announce])

  // ============================================================================
  // EMAIL MARKETING HANDLERS
  // ============================================================================

  const handleCreateCampaign = () => {
    announce('Opening campaign creation', 'polite')
    toast.success('Campaign Builder ready - Set up your new email campaign')
    // Navigate to campaign creation page
    window.location.href = '/dashboard/email-marketing/create'
  }

  const handleSendCampaign = async (campaign: any) => {
    if (!userId) {
      const { toast } = await import('sonner')
      toast.error('Please log in to send campaigns')
      return
    }

    try {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      const { toast } = await import('sonner')
    const { sendCampaign } = await import('@/lib/email-marketing-queries')

      const sendPromise = sendCampaign(campaign.id).then(result => {
        if (result.error) {
          logger.error('Failed to send campaign', { error: result.error })
          throw new Error('Failed to send campaign')
        }        return result
      })

      toast.promise(sendPromise, {
        loading: `Sending campaign to ${campaign.recipientCount || campaign.recipient_count} recipients...`,
        success: `Campaign sent to ${campaign.recipientCount || campaign.recipient_count} subscribers`,
        error: 'Failed to send campaign'
      })

      await sendPromise

      // Update local state
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id
          ? { ...c, status: 'sending' }
          : c
      ))

      announce(`Campaign ${campaign.name} sent successfully`, 'polite')
    } catch (err: unknown) {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      logger.error('Send campaign error', { error: err.message })

      const { toast } = await import('sonner')
      toast.error('Failed to send campaign')
    }
  }

  const handleViewReport = (campaign: any) => {
    announce(`Viewing report for campaign ${campaign.name}`, 'polite')
    toast.success(`Campaign analytics: Open Rate: ${campaign.openRate || campaign.open_rate}% | Click Rate: ${campaign.clickRate || campaign.click_rate}%`)
  }

  const handleDuplicateCampaign = async (campaign: any) => {
    if (!userId) {
      const { toast } = await import('sonner')
      toast.error('Please log in to duplicate campaigns')
      return
    }

    try {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      const { toast } = await import('sonner')
    const { createEmailCampaign } = await import('@/lib/email-marketing-queries')

      const newCampaignName = `${campaign.name} (Copy)`

      const { data, error } = await createEmailCampaign(userId, {
        name: newCampaignName,
        subject: campaign.subject,
        from_name: campaign.fromName || campaign.from_name,
        from_email: campaign.fromEmail || campaign.from_email,
        html_content: campaign.htmlContent || campaign.html_content || '',
        type: campaign.type,
        status: 'draft',
        recipient_count: 0,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        complained_count: 0,
        unsubscribed_count: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0,
        editor: campaign.editor || 'drag-drop'
      })

      if (error) {
        logger.error('Failed to duplicate campaign', { error })
        toast.error('Failed to duplicate campaign')
        return
      }
    toast.success(`Campaign duplicated: ${newCampaignName}`)

      // Add to local state
      setCampaigns(prev => [data, ...prev])

      announce(`Campaign duplicated as ${newCampaignName}`, 'polite')
    } catch (err: unknown) {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      logger.error('Duplicate campaign error', { error: err.message })

      const { toast } = await import('sonner')
      toast.error('Failed to duplicate campaign')
    }
  }

  const handleAddSubscriber = () => {
    setSubscriberForm({
      email: '',
      firstName: '',
      lastName: '',
      tags: [],
      source: 'manual'
    })
    setIsSubscriberFormOpen(true)
    announce('Opening subscriber creation form', 'polite')
  }

  const handleSubmitSubscriber = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to add subscribers')
      return
    }

    if (!subscriberForm.email.trim()) {
      toast.error('Email is required')
      return
    }

    setIsSavingSubscriber(true)
    announce('Adding subscriber', 'polite')

    try {
      const { addSubscriber } = await import('@/lib/email-marketing-queries')

      const newSubscriber = {
        email: subscriberForm.email,
        first_name: subscriberForm.firstName || null,
        last_name: subscriberForm.lastName || null,
        tags: subscriberForm.tags,
        source: subscriberForm.source,
        status: 'active'
      }

      const { data, error } = await addSubscriber(userId, newSubscriber)

      if (error) throw error

      setSubscribers(prev => [data, ...prev])
      toast.success(`Subscriber added: ${subscriberForm.email} is now subscribed`)
      announce('Subscriber added successfully', 'polite')
      setIsSubscriberFormOpen(false)
    } catch (err: unknown) {
      logger.error('Failed to add subscriber', { error: err })
      toast.error('Failed to add subscriber')
      announce('Failed to add subscriber', 'assertive')
    } finally {
      setIsSavingSubscriber(false)
    }
  }, [userId, subscriberForm, announce])

  const handleCreateAutomation = () => {
    setAutomationForm({
      name: '',
      trigger: 'signup',
      delay: '1',
      action: 'welcome'
    })
    setIsAutomationOpen(true)
    announce('Opening automation builder', 'polite')
  }

  const handleSaveAutomation = useCallback(async () => {
    if (!automationForm.name.trim()) {
      toast.error('Please enter an automation name')
      return
    }

    const triggerLabels: Record<string, string> = {
      signup: 'New Subscriber',
      purchase: 'Purchase Complete',
      cart_abandon: 'Abandoned Cart',
      inactive: 'Inactive 30 days',
      birthday: 'Birthday',
      tag_added: 'Tag Added'
    }

    try {
      let automationId = Date.now()

      // Create automation in database
      if (userId) {
        const { createEmailAutomation } = await import('@/lib/email-marketing-queries')
        const { data, error } = await createEmailAutomation(userId, {
          name: automationForm.name,
          trigger: automationForm.trigger as any,
          trigger_label: triggerLabels[automationForm.trigger] || automationForm.trigger,
          status: 'active',
          delay_hours: parseInt(automationForm.delay) || 1,
          action: automationForm.action,
          emails_count: 1,
          sent_count: 0,
          opened_count: 0
        })
        if (error) throw error
        if (data?.id) automationId = data.id      }

      const newAutomation = {
        id: automationId,
        name: automationForm.name,
        trigger: triggerLabels[automationForm.trigger] || automationForm.trigger,
        status: 'active' as const,
        emails: 1,
        sent: 0,
        opened: 0
      }

      setAutomations(prev => [...prev, newAutomation])
      setIsAutomationOpen(false)
      toast.success(`Automation created: ${automationForm.name} is now active`)
      announce('Automation created successfully', 'polite')
    } catch (error) {
      logger.error('Failed to create automation', { error: error.message })
      toast.error('Failed to create automation')
    }
  }, [automationForm, userId, announce])

  const handleToggleAutomation = useCallback(async (id: number) => {
    const automation = automations.find(a => a.id === id)
    const newStatus = automation?.status === 'active' ? 'paused' : 'active'

    try {
      // Update in database
      if (userId) {
        const { toggleAutomationStatus } = await import('@/lib/email-marketing-queries')
        const { error } = await toggleAutomationStatus(String(id), newStatus as any)
        if (error) throw error      }

      setAutomations(prev => prev.map(a =>
        a.id === id
          ? { ...a, status: newStatus as 'active' | 'paused' }
          : a
      ))
      announce('Automation status updated', 'polite')
    } catch (error) {
      logger.error('Failed to toggle automation', { error: error.message })
      toast.error('Failed to update automation status')
    }
  }, [automations, userId, announce])

  const handleDeleteAutomation = useCallback(async (id: number) => {
    try {
      // Delete from database
      if (userId) {
        const { deleteEmailAutomation } = await import('@/lib/email-marketing-queries')
        const { error } = await deleteEmailAutomation(String(id))
        if (error) throw error      }

      setAutomations(prev => prev.filter(a => a.id !== id))
      toast.success('Automation deleted successfully')
      announce('Automation deleted', 'polite')
    } catch (error) {
      logger.error('Failed to delete automation', { error: error.message })
      toast.error('Failed to delete automation')
    }
  }, [userId, announce])

  const handleCreateTemplate = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {      const { createEmailTemplate, getEmailTemplates } = await import('@/lib/email-marketing-queries')

      const newTemplate = {
        name: 'New Email Template',
        description: 'Customize this template',
        category: 'custom',
        html_content: '<div style="padding: 20px;"><h1>New Template</h1><p>Start editing...</p></div>',
        is_public: false,
        usage_count: 0
      }

      const { data, error } = await createEmailTemplate(userId, newTemplate)

      if (error) {
        logger.error('Failed to create template', { error })
        toast.error('Failed to create template')
        announce('Failed to create template', 'assertive')
        return
      }
    toast.success('Template created - Start customizing your new template')
      announce('Template created successfully', 'polite')

      // Reload templates
      const templatesResult = await getEmailTemplates(userId)
      setTemplates(templatesResult.data || [])

    } catch (err: unknown) {
      logger.error('Create template error', { error: err.message })
      toast.error('Failed to create template')
      announce('Failed to create template', 'assertive')
    }
  }

  const handleUseTemplate = useCallback((template: any) => {
    announce(`Using template: ${template.name}`, 'polite')
    toast.success(`Template selected: Starting campaign with ${template.name}`)
    // Navigate to campaign creation with template ID
    window.location.href = `/dashboard/email-marketing/create?template=${template.id}`
  }, [announce])

  const handlePreviewTemplate = useCallback((template: any) => {
    announce(`Previewing template: ${template.name}`, 'polite')
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }, [announce])

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'campaigns', label: 'Campaigns', icon: '📧' },
    { id: 'subscribers', label: 'Subscribers', icon: '👥' },
    { id: 'automation', label: 'Automation', icon: '⚡' },
    { id: 'templates', label: 'Templates', icon: '📋' }
  ]

  const filteredCampaigns = filterStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filterStatus)

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Subscribers</div>
                <div className="text-3xl font-bold text-blue-500">
                  {(stats?.totalSubscribers || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="text-xs text-green-500">
              +{stats?.newSubscribersThisMonth || 0} this month
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
                <div className="text-3xl font-bold text-green-500">
                  {formatPercentage(stats?.averageOpenRate || 0)}
                </div>
              </div>
              <div className="text-2xl">📬</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Industry avg: 21.5%
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Avg Click Rate</div>
                <div className="text-3xl font-bold text-purple-500">
                  {formatPercentage(stats?.averageClickRate || 0)}
                </div>
              </div>
              <div className="text-2xl">🖱️</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Industry avg: 2.6%
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Revenue This Month</div>
                <div className="text-3xl font-bold text-orange-500">
                  ${((stats?.revenueThisMonth || 0) / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-xs text-green-500">
              From email campaigns
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Subscriber Growth</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {(stats?.subscriberGrowth || []).map((data, index) => {
                const maxSubs = Math.max(...(stats?.subscriberGrowth || []).map(d => d.subscribers))
                const height = (data.subscribers / maxSubs) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 relative group cursor-pointer"
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        <div className="font-bold">{data.subscribers.toLocaleString()}</div>
                        <div className="text-xs text-gray-300">{data.month}</div>
                      </div>
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{data.month}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Top Performing Campaigns</h3>
            <div className="space-y-4">
              {(stats?.topPerformingCampaigns || []).map((campaign, index) => (
                <div key={campaign.campaignId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{campaign.campaignName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(campaign.openRate)} open rate
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${campaign.openRate}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  )

  const renderCampaigns = () => (
    <div className="space-y-6">
      <LiquidGlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
              className="px-4 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="all">All Campaigns</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="sending">Sending</option>
            </select>
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              + New Campaign
            </button>
          </div>
        </div>
      </LiquidGlassCard>

      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <LiquidGlassCard key={campaign.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{getCampaignTypeIcon(campaign.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <div className="text-sm text-muted-foreground">{campaign.subject}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getCampaignStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                    <span>From: {campaign.fromName}</span>
                    <span>•</span>
                    <span>Recipients: {campaign.recipientCount.toLocaleString()}</span>
                    <span>•</span>
                    <span>
                      {campaign.sentAt
                        ? `Sent: ${new Date(campaign.sentAt).toLocaleDateString()}`
                        : campaign.scheduledAt
                        ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleDateString()}`
                        : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              {campaign.status === 'sent' && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-6 gap-4 text-center text-sm">
                    <div>
                      <div className="text-xl font-bold text-blue-500">{campaign.stats.delivered.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Delivered</div>
                      <div className="text-xs text-green-500">{formatPercentage(campaign.stats.deliveryRate)}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-500">{campaign.stats.opened.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Opened</div>
                      <div className="text-xs text-green-500">{formatPercentage(campaign.stats.openRate)}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-500">{campaign.stats.clicked.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Clicked</div>
                      <div className="text-xs text-purple-500">{formatPercentage(campaign.stats.clickRate)}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-500">{campaign.stats.bounced}</div>
                      <div className="text-xs text-muted-foreground">Bounced</div>
                      <div className="text-xs text-red-500">{formatPercentage(campaign.stats.bounceRate)}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-500">{campaign.stats.unsubscribed}</div>
                      <div className="text-xs text-muted-foreground">Unsubscribed</div>
                      <div className="text-xs text-gray-500">{formatPercentage(campaign.stats.unsubscribeRate)}</div>
                    </div>
                    {campaign.stats.revenue && (
                      <div>
                        <div className="text-xl font-bold text-green-600">${(campaign.stats.revenue / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewReport(campaign)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Report
                  </button>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleSendCampaign(campaign)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Send Now
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicateCampaign(campaign)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderSubscribers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscribers</h2>
        <button
          onClick={handleAddSubscriber}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
        >
          + Add Subscriber
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscribers.map((subscriber) => (
          <LiquidGlassCard key={subscriber.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {subscriber.firstName?.charAt(0) || subscriber.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {subscriber.firstName} {subscriber.lastName}
                      </h3>
                      <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${getSubscriberStatusColor(subscriber.status)}`}>
                      {subscriber.status}
                    </span>
                    {subscriber.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${getEngagementColor(subscriber.engagement.engagementScore)}`}>
                    {subscriber.engagement.engagementScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-blue-500">{subscriber.engagement.emailsSent}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">{subscriber.engagement.emailsOpened}</div>
                    <div className="text-xs text-muted-foreground">Opened</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-500">{subscriber.engagement.emailsClicked}</div>
                    <div className="text-xs text-muted-foreground">Clicked</div>
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Automation</h2>
        <button
          onClick={handleCreateAutomation}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
        >
          + New Automation
        </button>
      </div>

      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LiquidGlassCard>
          <div className="p-4">
            <div className="text-sm text-muted-foreground">Active Automations</div>
            <div className="text-2xl font-bold text-green-500">
              {automations.filter(a => a.status === 'active').length}
            </div>
          </div>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <div className="p-4">
            <div className="text-sm text-muted-foreground">Total Emails Sent</div>
            <div className="text-2xl font-bold text-blue-500">
              {automations.reduce((sum, a) => sum + a.sent, 0).toLocaleString()}
            </div>
          </div>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <div className="p-4">
            <div className="text-sm text-muted-foreground">Total Opened</div>
            <div className="text-2xl font-bold text-purple-500">
              {automations.reduce((sum, a) => sum + a.opened, 0).toLocaleString()}
            </div>
          </div>
        </LiquidGlassCard>
        <LiquidGlassCard>
          <div className="p-4">
            <div className="text-sm text-muted-foreground">Avg Open Rate</div>
            <div className="text-2xl font-bold text-orange-500">
              {automations.length > 0
                ? Math.round(automations.reduce((sum, a) => sum + (a.sent > 0 ? (a.opened / a.sent) * 100 : 0), 0) / automations.length)
                : 0}%
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <LiquidGlassCard key={automation.id}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    automation.status === 'active' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{automation.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Trigger: {automation.trigger}</span>
                      <span>•</span>
                      <span>{automation.emails} email{automation.emails !== 1 ? 's' : ''} in sequence</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="text-sm text-muted-foreground">Sent / Opened</div>
                    <div className="font-semibold">{automation.sent.toLocaleString()} / {automation.opened.toLocaleString()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    automation.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {automation.status === 'active' ? '● Active' : '○ Paused'}
                  </span>
                  <button
                    onClick={() => handleToggleAutomation(automation.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      automation.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {automation.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>

      {automations.length === 0 && (
        <LiquidGlassCard className="p-12">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first automation to start sending targeted emails automatically</p>
            <button
              onClick={handleCreateAutomation}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              Create First Automation
            </button>
          </div>
        </LiquidGlassCard>
      )}
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
        >
          + New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <LiquidGlassCard className="p-12">
          <NoDataEmptyState
            title="No Templates Yet"
            message="Create your first email template to get started"
            action={{
              label: "Create Template",
              onClick: handleCreateTemplate
            }}
          />
        </LiquidGlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <LiquidGlassCard key={template.id}>
              <div className="p-6">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-4xl">📧</div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description || 'Email template'}</p>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="capitalize text-muted-foreground">{template.category || 'General'}</span>
                  <span className="text-muted-foreground">{template.usage_count || 0} uses</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-8">
            <CardSkeleton />
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={4} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Email Marketing
              </TextShimmer>
              <p className="text-muted-foreground">
                Create, automate, and optimize email campaigns
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-2">
              <div className="flex items-center gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'campaigns' && renderCampaigns()}
          {viewMode === 'subscribers' && renderSubscribers()}
          {viewMode === 'automation' && renderAutomation()}
          {viewMode === 'templates' && renderTemplates()}
        </ScrollReveal>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name || 'Template Preview'}</DialogTitle>
            <DialogDescription>
              {previewTemplate?.description || 'Preview your email template before using it'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize px-2 py-1 bg-muted rounded">{previewTemplate?.category || 'General'}</span>
              <span>{previewTemplate?.usage_count || 0} uses</span>
            </div>

            {/* Template preview */}
            <div className="border rounded-lg p-4 bg-white min-h-[400px]">
              {previewTemplate?.html_content ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewTemplate.html_content) }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  if (previewTemplate) {
                    handleUseTemplate(previewTemplate)
                  }
                  setIsPreviewOpen(false)
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
              >
                Use This Template
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscriber Form Dialog */}
      <Dialog open={isSubscriberFormOpen} onOpenChange={setIsSubscriberFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📧 Add Subscriber
            </DialogTitle>
            <DialogDescription>
              Add a new subscriber to your email list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                placeholder="subscriber@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriberForm.email}
                onChange={(e) => setSubscriberForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={subscriberForm.firstName}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={subscriberForm.lastName}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriberForm.source}
                onChange={(e) => setSubscriberForm(prev => ({ ...prev, source: e.target.value }))}
              >
                <option value="manual">Manual Entry</option>
                <option value="website">Website Signup</option>
                <option value="import">Imported</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="newsletter, vip, product-updates"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subscriberForm.tags.join(', ')}
                onChange={(e) => setSubscriberForm(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Add tags to segment your subscribers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <button
              onClick={handleSubmitSubscriber}
              disabled={isSavingSubscriber || !subscriberForm.email.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
            >
              {isSavingSubscriber ? 'Adding...' : 'Add Subscriber'}
            </button>
            <button
              onClick={() => setIsSubscriberFormOpen(false)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Automation Creation Dialog */}
      <Dialog open={isAutomationOpen} onOpenChange={setIsAutomationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚡ Create Automation
            </DialogTitle>
            <DialogDescription>
              Set up automated email sequences triggered by subscriber actions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Automation Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Automation Name *</label>
              <input
                type="text"
                placeholder="e.g., Welcome Series, Cart Recovery"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={automationForm.name}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Trigger */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Event</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={automationForm.trigger}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, trigger: e.target.value }))}
              >
                <option value="signup">New Subscriber Signs Up</option>
                <option value="purchase">Purchase Completed</option>
                <option value="cart_abandon">Cart Abandoned</option>
                <option value="inactive">Inactive for 30 Days</option>
                <option value="birthday">Subscriber Birthday</option>
                <option value="tag_added">Tag Added to Subscriber</option>
              </select>
            </div>

            {/* Delay */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Delay</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={automationForm.delay}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, delay: e.target.value }))}
              >
                <option value="0">Immediately</option>
                <option value="1">1 hour</option>
                <option value="24">1 day</option>
                <option value="72">3 days</option>
                <option value="168">1 week</option>
              </select>
            </div>

            {/* First Action */}
            <div className="space-y-2">
              <label className="text-sm font-medium">First Email Type</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={automationForm.action}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, action: e.target.value }))}
              >
                <option value="welcome">Welcome Email</option>
                <option value="onboarding">Onboarding Guide</option>
                <option value="promotion">Promotional Offer</option>
                <option value="reminder">Friendly Reminder</option>
                <option value="reengagement">Re-engagement Campaign</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              💡 After creating, you can add more emails to the sequence and customize content
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <button
              onClick={handleSaveAutomation}
              disabled={!automationForm.name.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
            >
              Create Automation
            </button>
            <button
              onClick={() => setIsAutomationOpen(false)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
