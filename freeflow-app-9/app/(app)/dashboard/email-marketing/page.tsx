'use client'

import { useState, useEffect } from 'react'
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

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('EmailMarketingPage')

type ViewMode = 'overview' | 'campaigns' | 'subscribers' | 'automation' | 'templates'

export default function EmailMarketingPage() {
  // A+++ STATE MANAGEMENT
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

  // A+++ LOAD EMAIL MARKETING DATA
  useEffect(() => {
    const loadEmailMarketingData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading email marketing data', { userId })

        // Dynamic import for code splitting
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
        toast.success('Email marketing loaded', {
          description: `${campaignsResult.data?.length || 0} campaigns, ${subscribersResult.data?.length || 0} subscribers, ${templatesResult.data?.length || 0} templates`
        })
        logger.info('Email marketing data loaded successfully', {
          campaignsCount: campaignsResult.data?.length,
          subscribersCount: subscribersResult.data?.length,
          templatesCount: templatesResult.data?.length
        })
        announce('Email marketing data loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load email marketing data'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load email marketing data', { error: errorMessage, userId })
        toast.error('Failed to load email marketing', { description: errorMessage })
        announce('Error loading email marketing data', 'assertive')
      }
    }

    loadEmailMarketingData()
  }, [userId, announce])

  // ============================================================================
  // EMAIL MARKETING HANDLERS
  // ============================================================================

  const handleCreateCampaign = () => {
    announce('Switched to campaign creation view', 'polite')
    // TODO: Open campaign creation modal or navigate to creation page
    toast.info('Campaign creation coming soon', {
      description: 'Full email campaign builder in development'
    })
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

      logger.info('Sending campaign', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.name,
        recipientCount: campaign.recipientCount || campaign.recipient_count
      })

      toast.info('Sending campaign...', {
        description: `To ${campaign.recipientCount || campaign.recipient_count} recipients`
      })

      const { sendCampaign } = await import('@/lib/email-marketing-queries')
      const { data, error} = await sendCampaign(campaign.id)

      if (error) {
        logger.error('Failed to send campaign', { error })
        toast.error('Failed to send campaign')
        return
      }

      logger.info('Campaign sent successfully', { campaignId: campaign.id })

      toast.success('Campaign sent', {
        description: `Sending to ${campaign.recipientCount || campaign.recipient_count} subscribers`
      })

      // Update local state
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id
          ? { ...c, status: 'sending' }
          : c
      ))

      announce(`Campaign ${campaign.name} sent successfully`, 'polite')
    } catch (err: any) {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      logger.error('Send campaign error', { error: err.message })

      const { toast } = await import('sonner')
      toast.error('Failed to send campaign')
    }
  }

  const handleViewReport = (campaign: any) => {
    announce(`Viewing report for campaign ${campaign.name}`, 'polite')
    toast.info('Campaign analytics', {
      description: `Open Rate: ${campaign.openRate || campaign.open_rate}% | Click Rate: ${campaign.clickRate || campaign.click_rate}%`
    })
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

      logger.info('Duplicating campaign', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.name
      })

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

      logger.info('Campaign duplicated successfully', {
        originalId: campaign.id,
        newId: data.id,
        newName: newCampaignName
      })

      toast.success('Campaign duplicated', {
        description: newCampaignName
      })

      // Add to local state
      setCampaigns(prev => [data, ...prev])

      announce(`Campaign duplicated as ${newCampaignName}`, 'polite')
    } catch (err: any) {
      const { createFeatureLogger } = await import('@/lib/logger')
      const logger = createFeatureLogger('email-marketing')
      logger.error('Duplicate campaign error', { error: err.message })

      const { toast } = await import('sonner')
      toast.error('Failed to duplicate campaign')
    }
  }

  const handleAddSubscriber = () => {
    announce('Opening subscriber creation form', 'polite')
    toast.info('Add subscriber', {
      description: 'Subscriber management form coming soon'
    })
  }

  const handleCreateAutomation = () => {
    announce('Opening automation builder', 'polite')
    toast.info('Automation builder', {
      description: 'Advanced email automation workflows coming soon'
    })
  }

  const handleCreateTemplate = async () => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to create templates' })
      return
    }

    try {
      logger.info('Creating email template', { userId })

      const { createEmailTemplate, getEmailTemplates } = await import('@/lib/email-marketing-queries')

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

      logger.info('Template created successfully', { templateId: data?.id })

      toast.success('Template Created', {
        description: 'Start customizing your new template'
      })
      announce('Template created successfully', 'polite')

      // Reload templates
      const templatesResult = await getEmailTemplates(userId)
      setTemplates(templatesResult.data || [])

    } catch (err: any) {
      logger.error('Create template error', { error: err.message })
      toast.error('Failed to create template')
      announce('Failed to create template', 'assertive')
    }
  }

  const handleUseTemplate = (template: any) => {
    announce(`Using template: ${template.name}`, 'polite')
    toast.success('Template selected', {
      description: `Starting campaign with ${template.name}`
    })
    // TODO: Navigate to campaign creation with template pre-loaded
  }

  const handlePreviewTemplate = (template: any) => {
    announce(`Previewing template: ${template.name}`, 'polite')
    toast.info('Template preview', {
      description: `${template.name} - ${template.category}`
    })
    // TODO: Open template preview modal
  }

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
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
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

      <LiquidGlassCard className="p-12">
        <NoDataEmptyState
          title="Advanced Email Automation"
          message="Automated email workflows and drip campaigns are coming soon. Create powerful sequences triggered by subscriber actions."
          action={{
            label: "Learn More",
            onClick: () => {
              toast.info('Email Automation', {
                description: 'Advanced workflow automation features in development'
              })
            }
          }}
        />
      </LiquidGlassCard>
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

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    </div>
  )
}
