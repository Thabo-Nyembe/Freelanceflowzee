'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  getLeadStatusColor,
  getLeadScoreColor,
  getCampaignStatusColor,
  formatROI
} from '@/lib/lead-gen-utils'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('LeadGenerationPage')

type ViewMode = 'overview' | 'leads' | 'forms' | 'pages' | 'campaigns'

export default function LeadGenerationPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Database state
  const [leads, setLeads] = useState<any[]>([])
  const [forms, setForms] = useState<any[]>([])
  const [landingPages, setLandingPages] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [leadStats, setLeadStats] = useState<any>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('overview')

  // A+++ LOAD LEAD GENERATION DATA
  useEffect(() => {
    const loadLeadGenerationData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading lead generation data', { userId })

        const {
          getLeads,
          getLeadForms,
          getLandingPages,
          getLeadCampaigns,
          getLeadStats
        } = await import('@/lib/lead-generation-queries')

        const [leadsResult, formsResult, pagesResult, campaignsResult, statsResult] = await Promise.all([
          getLeads(userId),
          getLeadForms(userId),
          getLandingPages(userId),
          getLeadCampaigns(userId),
          getLeadStats(userId)
        ])

        setLeads(leadsResult.data || [])
        setForms(formsResult.data || [])
        setLandingPages(pagesResult.data || [])
        setCampaigns(campaignsResult.data || [])
        setLeadStats(statsResult.data || null)

        setIsLoading(false)
        toast.success('Lead generation loaded', {
          description: `${leadsResult.data?.length || 0} leads, ${formsResult.data?.length || 0} forms from database`
        })
        logger.info('Lead generation data loaded successfully', {
          leadsCount: leadsResult.data?.length,
          formsCount: formsResult.data?.length,
          pagesCount: pagesResult.data?.length,
          campaignsCount: campaignsResult.data?.length
        })
        announce('Lead generation dashboard loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load lead generation data'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load lead generation data', { error: errorMessage, userId })
        toast.error('Failed to load lead generation', { description: errorMessage })
        announce('Error loading lead generation dashboard', 'assertive')
      }
    }

    loadLeadGenerationData()
  }, [userId, announce])

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '👥' },
    { id: 'forms', label: 'Forms', icon: '📝' },
    { id: 'pages', label: 'Landing Pages', icon: '🌐' },
    { id: 'campaigns', label: 'Campaigns', icon: '🚀' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Leads</div>
                <div className="text-3xl font-bold text-blue-500">
                  {leadStats?.totalLeads || 0}
                </div>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="text-xs text-green-500">
              +{leadStats?.newLeadsThisMonth || 0} this month
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Hot Leads</div>
                <div className="text-3xl font-bold text-red-500">
                  {leadStats?.hotLeads || 0}
                </div>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
            <div className="text-xs text-muted-foreground">
              High-quality prospects
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold text-green-500">
                  {(leadStats?.conversionRate || 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl">📈</div>
            </div>
            <div className="text-xs text-green-500">
              Above industry avg
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Avg Lead Score</div>
                <div className="text-3xl font-bold text-purple-500">
                  {leadStats?.averageLeadScore || 0}
                </div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Out of 100
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Leads by Source</h3>
            <div className="space-y-4">
              {(leadStats?.leadsBySource || []).map((source, index) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize">{source.source.replace('-', ' ')}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{source.count} leads</span>
                      <span className="text-sm text-green-500">{source.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(source.count / (leadStats?.totalLeads || 1)) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Top Performing Forms</h3>
            <div className="space-y-4">
              {(leadStats?.topPerformingForms || []).map((form, index) => (
                <div key={form.formId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{form.formName}</div>
                    <div className="text-sm text-muted-foreground">{form.submissions} submissions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  )

  const renderLeads = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + Add Lead
        </button>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <LiquidGlassCard key={lead.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{lead.firstName} {lead.lastName}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getLeadStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getLeadScoreColor(lead.scoreLabel)}`}>
                      {lead.scoreLabel}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {lead.company && `${lead.company} • `}
                    {lead.email}
                    {lead.phone && ` • ${lead.phone}`}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="capitalize">Source: {lead.source.replace('-', ' ')}</span>
                    <span>{lead.metadata.pageViews} page views</span>
                    <span>{lead.metadata.emailOpens} email opens</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-500 mb-1">{lead.score}</div>
                  <div className="text-sm text-muted-foreground">Lead Score</div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderForms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Capture Forms</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <LiquidGlassCard key={form.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{form.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{form.submissions}</div>
                  <div className="text-xs text-muted-foreground">Submissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{form.conversionRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground mb-2">Fields: {form.fields.length}</div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Edit Form
                  </button>
                  <button className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                    Embed
                  </button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderPages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Landing Pages</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {landingPages.map((page) => (
          <LiquidGlassCard key={page.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{page.name}</h3>
                  <div className="text-xs text-muted-foreground mb-2">/{page.slug}</div>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-500">{page.stats.views}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-500">{page.stats.submissions}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-500">{page.stats.conversionRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">CVR</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Edit Page
                  </button>
                  <button className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Campaigns</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + New Campaign
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <LiquidGlassCard key={campaign.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getCampaignStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Budget: ${(campaign.budget || 0) / 1000}K</span>
                    <span>Spent: ${(campaign.spent || 0) / 1000}K</span>
                    <span className="text-green-500">ROI: {formatROI(campaign.stats.roi)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 mb-4 text-center text-sm">
                <div>
                  <div className="text-xl font-bold text-blue-500">{(campaign.stats.impressions / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-500">{campaign.stats.clicks}</div>
                  <div className="text-xs text-muted-foreground">Clicks</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-500">{campaign.stats.leads}</div>
                  <div className="text-xs text-muted-foreground">Leads</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-500">{campaign.stats.conversions}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-pink-500">{campaign.stats.conversionRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">CVR</div>
                </div>
              </div>

              <div className="border-t pt-4">
                {campaign.goals.map((goal) => (
                  <div key={goal.id} className="mb-3">
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="capitalize">{goal.metric} Goal</span>
                      <span className="font-semibold">{goal.current} / {goal.target}</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                ))}
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
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Lead Generation
              </TextShimmer>
              <p className="text-muted-foreground">
                Capture, nurture, and convert high-quality leads
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
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
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
          {viewMode === 'leads' && renderLeads()}
          {viewMode === 'forms' && renderForms()}
          {viewMode === 'pages' && renderPages()}
          {viewMode === 'campaigns' && renderCampaigns()}
        </ScrollReveal>
      </div>
    </div>
  )
}
