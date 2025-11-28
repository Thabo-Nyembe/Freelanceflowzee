'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  MOCK_CAMPAIGNS,
  MOCK_SUBSCRIBERS,
  MOCK_SEGMENTS,
  MOCK_TEMPLATES,
  MOCK_AUTOMATIONS,
  MOCK_EMAIL_STATS,
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

type ViewMode = 'overview' | 'campaigns' | 'subscribers' | 'automation' | 'templates'

export default function EmailMarketingPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all')
  const [campaigns, setCampaigns] = useState<any[]>(MOCK_CAMPAIGNS)
  const [subscribers, setSubscribers] = useState<any[]>(MOCK_SUBSCRIBERS)
  const [stats, setStats] = useState<any>(MOCK_EMAIL_STATS)

  // A+++ LOAD EMAIL MARKETING DATA
  useEffect(() => {
    const loadEmailMarketingData = async () => {
      const userId = 'demo-user-123' // TODO: Replace with real auth user ID

      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import for code splitting
        const { getEmailCampaigns, getEmailSubscribers, getEmailMarketingStats } = await import('@/lib/email-marketing-queries')

        // Load campaigns, subscribers, and stats in parallel
        const [campaignsResult, subscribersResult, statsResult] = await Promise.all([
          getEmailCampaigns(userId),
          getEmailSubscribers(userId),
          getEmailMarketingStats(userId)
        ])

        if (campaignsResult.error || subscribersResult.error || statsResult.error) {
          throw new Error('Failed to load email marketing data')
        }

        // Update state with real data if available, otherwise use mock data
        if (campaignsResult.data && campaignsResult.data.length > 0) {
          setCampaigns(campaignsResult.data)
        }
        if (subscribersResult.data && subscribersResult.data.length > 0) {
          setSubscribers(subscribersResult.data)
        }
        if (statsResult.data) {
          setStats(statsResult.data)
        }

        setIsLoading(false)
        announce('Email marketing data loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load email marketing data')
        setIsLoading(false)
        announce('Error loading email marketing data', 'assertive')
      }
    }

    loadEmailMarketingData()
  }, [announce])

  // ============================================================================
  // EMAIL MARKETING HANDLERS
  // ============================================================================

  const handleCreateCampaign = () => {
    announce('Switched to campaign creation view', 'polite')
    // TODO: Open campaign creation modal or navigate to creation page
    const { toast } = require('sonner')
    toast.info('Campaign creation coming soon', {
      description: 'Full email campaign builder in development'
    })
  }

  const handleSendCampaign = async (campaign: any) => {
    try {
      const userId = 'demo-user-123'
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
    const { toast } = require('sonner')
    toast.info('Campaign analytics', {
      description: `Open Rate: ${campaign.openRate || campaign.open_rate}% | Click Rate: ${campaign.clickRate || campaign.click_rate}%`
    })
  }

  const handleDuplicateCampaign = async (campaign: any) => {
    try {
      const userId = 'demo-user-123'
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
    const { toast } = require('sonner')
    toast.info('Add subscriber', {
      description: 'Subscriber management form coming soon'
    })
  }

  const handleCreateAutomation = () => {
    announce('Opening automation builder', 'polite')
    const { toast } = require('sonner')
    toast.info('Automation builder', {
      description: 'Advanced email automation workflows coming soon'
    })
  }

  const handleCreateTemplate = () => {
    announce('Opening template builder', 'polite')
    const { toast } = require('sonner')
    toast.info('Template builder', {
      description: 'Email template editor coming soon'
    })
  }

  const handleUseTemplate = (template: any) => {
    announce(`Using template: ${template.name}`, 'polite')
    const { toast } = require('sonner')
    toast.success('Template selected', {
      description: `Starting campaign with ${template.name}`
    })
    // TODO: Navigate to campaign creation with template pre-loaded
  }

  const handlePreviewTemplate = (template: any) => {
    announce(`Previewing template: ${template.name}`, 'polite')
    const { toast } = require('sonner')
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
                  {MOCK_EMAIL_STATS.totalSubscribers.toLocaleString()}
                </div>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="text-xs text-green-500">
              +{MOCK_EMAIL_STATS.newSubscribersThisMonth} this month
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
                <div className="text-3xl font-bold text-green-500">
                  {formatPercentage(MOCK_EMAIL_STATS.averageOpenRate)}
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
                  {formatPercentage(MOCK_EMAIL_STATS.averageClickRate)}
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
                  ${(MOCK_EMAIL_STATS.revenueThisMonth / 1000).toFixed(0)}K
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
              {MOCK_EMAIL_STATS.subscriberGrowth.map((data, index) => {
                const maxSubs = Math.max(...MOCK_EMAIL_STATS.subscriberGrowth.map(d => d.subscribers))
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
              {MOCK_EMAIL_STATS.topPerformingCampaigns.map((campaign, index) => (
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

      <div className="space-y-4">
        {MOCK_AUTOMATIONS.map((automation) => (
          <LiquidGlassCard key={automation.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{automation.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      automation.status === 'active' ? 'bg-green-100 text-green-700' :
                      automation.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {automation.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{automation.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Trigger: {automation.trigger.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>{automation.steps.length} steps</span>
                    <span>•</span>
                    <span>{automation.subscriberCount} enrolled</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500">{automation.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  {automation.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="capitalize">{step.type.replace('-', ' ')}</span>
                      {step.delay && (
                        <span className="text-muted-foreground">
                          (wait {step.delay} {step.delayUnit})
                        </span>
                      )}
                      <span className="ml-auto text-muted-foreground">
                        {step.stats.completed.toLocaleString()} completed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_TEMPLATES.map((template) => (
          <LiquidGlassCard key={template.id}>
            <div className="p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-4xl">📧</div>
              </div>

              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="capitalize text-muted-foreground">{template.category}</span>
                <span className="text-muted-foreground">{template.usageCount} uses</span>
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
