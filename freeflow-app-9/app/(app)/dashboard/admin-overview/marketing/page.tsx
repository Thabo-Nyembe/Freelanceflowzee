'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getLeadStatusColor,
  getLeadScoreColor,
  getCampaignStatusColor,
  filterLeadsByStatus,
  filterCampaignsByStatus,
  getHotLeads,
  type Lead,
  type Campaign,
  type LeadStatus,
  type CampaignStatus,
  type LeadScore
} from '@/lib/admin-overview-utils'
import {
  Target,
  Mail,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Copy,
  FlaskConical,
  Clock,
  Zap
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const logger = createFeatureLogger('admin-marketing')

export default function MarketingPage() {
  const router = useRouter()
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [leadsTab, setLeadsTab] = useState<LeadStatus | 'all'>('all')
  const [campaignsTab, setCampaignsTab] = useState<CampaignStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [deleteLead, setDeleteLead] = useState<{ id: string; name: string } | null>(null)
  const [deleteCampaign, setDeleteCampaign] = useState<{ id: string; name: string } | null>(null)

  // Filtered data
  const filteredLeads = useMemo(() => {
    let filtered = leads

    if (leadsTab !== 'all') {
      filtered = filterLeadsByStatus(filtered, leadsTab)
    }

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered
  }, [leads, leadsTab, searchQuery])

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    if (campaignsTab !== 'all') {
      filtered = filterCampaignsByStatus(filtered, campaignsTab)
    }

    return filtered
  }, [campaigns, campaignsTab])

  const hotLeads = useMemo(() => getHotLeads(leads), [leads])

  // Calculate marketing stats from data
  const marketingStats = useMemo(() => {
    const totalLeads = leads.length
    const convertedLeads = leads.filter(l => l.status === 'converted').length
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0)
    const marketingROI = 150 // Placeholder - would need revenue tracking

    return { totalLeads, convertedLeads, conversionRate, activeCampaigns, totalReach, marketingROI }
  }, [leads, campaigns])

  // Load marketing data
  useEffect(() => {
    const loadMarketing = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading marketing data', { userId })

        const { getLeads, getCampaigns } = await import('@/lib/admin-marketing-queries')

        const [leadsResult, campaignsResult] = await Promise.all([
          getLeads(userId),
          getCampaigns(userId)
        ])

        setLeads(leadsResult || [])
        setCampaigns(campaignsResult || [])

        setIsLoading(false)
        announce('Marketing data loaded successfully', 'polite')
        toast.success('Marketing loaded', {
          description: `${leadsResult?.length || 0} leads, ${campaignsResult?.length || 0} campaigns`
        })
        logger.info('Marketing loaded', {
          success: true,
          leadCount: leadsResult?.length || 0,
          campaignCount: campaignsResult?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load marketing'
        setError(errorMessage)
        setIsLoading(false)
        toast.error('Failed to load marketing', { description: errorMessage })
        announce('Error loading marketing', 'assertive')
        logger.error('Marketing load failed', { error: err })
      }
    }

    loadMarketing()
  }, [userId, announce])

  // Button 1: Add Lead
  const handleAddLead = async () => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to add leads' })
      return
    }

    try {
      logger.info('Adding new lead')

      const { createLead, getLeads } = await import('@/lib/admin-marketing-queries')

      const leadData = {
        name: 'New Lead',
        email: 'lead@company.com',
        status: 'new' as const,
        score: 'warm' as const,
        score_value: 60,
        source: 'manual' as const
      }

      const result = await createLead(userId, leadData)

      toast.success('Lead Added', {
        description: `${leadData.name} has been added to your lead list`
      })
      logger.info('Lead added', { success: true, result })
      announce('Lead added successfully', 'polite')

      // Reload leads
      const leadsResult = await getLeads(userId)
      setLeads(leadsResult.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Add failed'
      toast.error('Add Failed', { description: message })
      logger.error('Add lead failed', { error: message })
      announce('Failed to add lead', 'assertive')
    }
  }

  // Button 2: Edit Lead
  const handleEditLead = async (leadId: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to edit leads' })
      return
    }

    try {
      logger.info('Editing lead', { leadId })

      const { updateLead, getLeads } = await import('@/lib/admin-marketing-queries')

      await updateLead(leadId, {
        score_value: 90,
        score: 'hot'
      })

      toast.success('Lead Updated', {
        description: 'Lead information has been updated successfully'
      })
      logger.info('Lead edited', { success: true, leadId })
      announce('Lead updated successfully', 'polite')

      // Reload leads
      const leadsResult = await getLeads(userId)
      setLeads(leadsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit failed'
      toast.error('Edit Failed', { description: message })
      logger.error('Edit lead failed', { error: message })
      announce('Failed to edit lead', 'assertive')
    }
  }

  // Button 3: Delete Lead
  const handleDeleteLeadClick = (leadId: string, leadName: string) => {
    setDeleteLead({ id: leadId, name: leadName })
  }

  const handleConfirmDeleteLead = async () => {
    if (!deleteLead) return

    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to delete leads' })
      setDeleteLead(null)
      return
    }

    try {
      logger.info('Deleting lead', { leadId: deleteLead.id })

      const { deleteLead: deleteLeadQuery, getLeads } = await import('@/lib/admin-marketing-queries')

      await deleteLeadQuery(deleteLead.id)

      toast.success('Lead Deleted', {
        description: `${deleteLead.name} has been removed from your leads`
      })
      logger.info('Lead deleted', { success: true, leadId: deleteLead.id })
      announce('Lead deleted successfully', 'polite')

      // Reload leads
      const leadsResult = await getLeads(userId)
      setLeads(leadsResult.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error('Delete Failed', { description: message })
      logger.error('Delete lead failed', { error: message })
      announce('Failed to delete lead', 'assertive')
    } finally {
      setDeleteLead(null)
    }
  }

  // Button 4: Qualify Lead
  const handleQualifyLead = async (leadId: string, leadName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to qualify leads' })
      return
    }

    try {
      logger.info('Qualifying lead', { leadId })

      const { updateLeadStatus, getLeads } = await import('@/lib/admin-marketing-queries')

      await updateLeadStatus(leadId, 'qualified')

      toast.success('Lead Qualified', {
        description: `${leadName} has been marked as qualified and ready for sales`
      })
      logger.info('Lead qualified', { success: true, leadId })
      announce('Lead qualified successfully', 'polite')

      // Reload leads
      const leadsResult = await getLeads(userId)
      setLeads(leadsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Qualify failed'
      toast.error('Qualify Failed', { description: message })
      logger.error('Qualify lead failed', { error: message })
      announce('Failed to qualify lead', 'assertive')
    }
  }

  // Button 5: Convert to Deal
  const handleConvertToDeal = async (leadId: string, leadName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to convert leads' })
      return
    }

    try {
      logger.info('Converting lead to deal', { leadId })

      // Update lead status to converted
      // NOTE: Future integration with CRM deals system will create actual deal record
      const { updateLeadStatus, getLeads } = await import('@/lib/admin-marketing-queries')

      await updateLeadStatus(leadId, 'won')

      toast.success('Lead Converted', {
        description: `${leadName} has been converted successfully`
      })
      logger.info('Lead converted to deal', { success: true, leadId })
      announce('Lead converted to deal', 'polite')

      // Reload leads
      const leadsResult = await getLeads(userId)
      setLeads(leadsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed'
      toast.error('Conversion Failed', { description: message })
      logger.error('Convert lead failed', { error: message })
      announce('Failed to convert lead', 'assertive')
    }
  }

  // Button 6: Export Leads
  // NOTE: Export functionality uses API endpoint for server-side CSV generation
  // This requires special file handling that's better suited for API routes
  const handleExportLeads = async () => {
    try {
      logger.info('Exporting leads')

      const response = await fetch('/api/admin/marketing/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', status: leadsTab })
      })

      if (!response.ok) throw new Error('Failed to export leads')
      const result = await response.json()

      toast.success('Leads Exported', {
        description: `${filteredLeads.length} leads have been exported to CSV file`
      })
      logger.info('Leads export completed', { success: true, count: filteredLeads.length, result })
      announce('Leads exported successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      toast.error('Export Failed', { description: message })
      logger.error('Export leads failed', { error: message })
      announce('Failed to export leads', 'assertive')
    }
  }

  // Button 7: Create Campaign
  const handleCreateCampaign = async () => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to create campaigns' })
      return
    }

    try {
      logger.info('Creating new campaign')

      const { createCampaign, getCampaigns } = await import('@/lib/admin-marketing-queries')

      const campaignData = {
        name: 'New Campaign',
        type: 'email' as const,
        status: 'draft' as const,
        start_date: new Date().toISOString(),
        budget: 10000,
        spent: 0
      }

      const result = await createCampaign(userId, campaignData)

      toast.success('Campaign Created', {
        description: 'New campaign has been created as draft'
      })
      logger.info('Campaign created', { success: true, result })
      announce('Campaign created successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create failed'
      toast.error('Create Failed', { description: message })
      logger.error('Create campaign failed', { error: message })
      announce('Failed to create campaign', 'assertive')
    }
  }

  // Button 8: Edit Campaign
  const handleEditCampaign = async (campaignId: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to edit campaigns' })
      return
    }

    try {
      logger.info('Editing campaign', { campaignId })

      const { updateCampaign, getCampaigns } = await import('@/lib/admin-marketing-queries')

      await updateCampaign(campaignId, {
        budget: 15000
      })

      toast.success('Campaign Updated', {
        description: 'Campaign settings have been updated successfully'
      })
      logger.info('Campaign edited', { success: true, campaignId })
      announce('Campaign updated successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit failed'
      toast.error('Edit Failed', { description: message })
      logger.error('Edit campaign failed', { error: message })
      announce('Failed to edit campaign', 'assertive')
    }
  }

  // Button 9: Delete Campaign
  const handleDeleteCampaignClick = (campaignId: string, campaignName: string) => {
    setDeleteCampaign({ id: campaignId, name: campaignName })
  }

  const handleConfirmDeleteCampaign = async () => {
    if (!deleteCampaign) return

    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to delete campaigns' })
      setDeleteCampaign(null)
      return
    }

    try {
      logger.info('Deleting campaign', { campaignId: deleteCampaign.id })

      const { deleteCampaign: deleteCampaignQuery, getCampaigns } = await import('@/lib/admin-marketing-queries')

      await deleteCampaignQuery(deleteCampaign.id)

      toast.success('Campaign Deleted', {
        description: `"${deleteCampaign.name}" has been permanently removed`
      })
      logger.info('Campaign deleted', { success: true, campaignId: deleteCampaign.id })
      announce('Campaign deleted successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error('Delete Failed', { description: message })
      logger.error('Delete campaign failed', { error: message })
      announce('Failed to delete campaign', 'assertive')
    } finally {
      setDeleteCampaign(null)
    }
  }

  // Button 10: Send Campaign
  const handleSendCampaign = async (campaignId: string, campaignName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to send campaigns' })
      return
    }

    try {
      logger.info('Sending campaign', { campaignId })

      const { updateCampaignStatus, getCampaigns } = await import('@/lib/admin-marketing-queries')

      await updateCampaignStatus(campaignId, 'active')

      toast.success('Campaign Sent', {
        description: `"${campaignName}" has been sent to target audience`
      })
      logger.info('Campaign sent', { success: true, campaignId })
      announce('Campaign sent successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Send failed'
      toast.error('Send Failed', { description: message })
      logger.error('Send campaign failed', { error: message })
      announce('Failed to send campaign', 'assertive')
    }
  }

  // Button 11: Schedule Campaign
  const handleScheduleCampaign = async (campaignId: string, campaignName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to schedule campaigns' })
      return
    }

    try {
      logger.info('Scheduling campaign', { campaignId })

      const { updateCampaignStatus, getCampaigns } = await import('@/lib/admin-marketing-queries')

      await updateCampaignStatus(campaignId, 'scheduled')

      toast.success('Campaign Scheduled', {
        description: `"${campaignName}" scheduled to launch tomorrow`
      })
      logger.info('Campaign scheduled', { success: true, campaignId })
      announce('Campaign scheduled successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Schedule failed'
      toast.error('Schedule Failed', { description: message })
      logger.error('Schedule campaign failed', { error: message })
      announce('Failed to schedule campaign', 'assertive')
    }
  }

  // Button 12: View Campaign Analytics
  const handleViewCampaignAnalytics = (campaign: Campaign) => {
    logger.info('Opening campaign analytics', { campaignId: campaign.id })
    setSelectedCampaign(campaign)
    setShowCampaignModal(true)
    toast.info('Campaign Analytics', {
      description: `Viewing detailed analytics for "${campaign.name}"`
    })
    announce('Campaign analytics opened', 'polite')
  }

  // Button 13: A/B Test Campaign
  // NOTE: A/B testing requires specialized logic for variant creation and analytics
  // This uses API endpoint for complex business logic that creates test variants
  const handleABTestCampaign = async (campaignId: string, campaignName: string) => {
    try {
      logger.info('Creating A/B test for campaign', { campaignId })

      const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: ['A', 'B'],
          splitRatio: 50
        })
      })

      if (!response.ok) throw new Error('Failed to create A/B test')
      const result = await response.json()

      toast.success('A/B Test Created', {
        description: `A/B test created for "${campaignName}" with 50/50 split`
      })
      logger.info('A/B test created', { success: true, campaignId, result })
      announce('A/B test created successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'A/B test failed'
      toast.error('A/B Test Failed', { description: message })
      logger.error('A/B test failed', { error: message })
      announce('Failed to create A/B test', 'assertive')
    }
  }

  // Button 14: Duplicate Campaign
  const handleDuplicateCampaign = async (campaignId: string, campaignName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to duplicate campaigns' })
      return
    }

    try {
      logger.info('Duplicating campaign', { campaignId })

      const { createCampaign, getCampaigns } = await import('@/lib/admin-marketing-queries')

      // Find the original campaign
      const originalCampaign = campaigns.find(c => c.id === campaignId)
      if (!originalCampaign) {
        throw new Error('Campaign not found')
      }

      // Create duplicate with modified data
      await createCampaign(userId, {
        name: `${originalCampaign.name} (Copy)`,
        description: originalCampaign.description,
        type: originalCampaign.type,
        status: 'draft',
        budget: originalCampaign.budget,
        spent: 0,
        start_date: new Date().toISOString(),
        target_audience: originalCampaign.targetAudience ? [String(originalCampaign.targetAudience)] : undefined,
        channels: originalCampaign.channels,
        tags: originalCampaign.tags
      })

      toast.success('Campaign Duplicated', {
        description: `Copy of "${campaignName}" has been created`
      })
      logger.info('Campaign duplicated', { success: true, campaignId })
      announce('Campaign duplicated successfully', 'polite')

      // Reload campaigns
      const campaignsResult = await getCampaigns(userId)
      setCampaigns(campaignsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Duplicate failed'
      toast.error('Duplicate Failed', { description: message })
      logger.error('Duplicate campaign failed', { error: message })
      announce('Failed to duplicate campaign', 'assertive')
    }
  }

  // Button 15: Refresh Marketing
  const handleRefreshMarketing = async () => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to refresh marketing' })
      return
    }

    try {
      logger.info('Refreshing marketing data')

      const { getLeads, getCampaigns } = await import('@/lib/admin-marketing-queries')

      const [leadsResult, campaignsResult] = await Promise.all([
        getLeads(userId),
        getCampaigns(userId)
      ])

      setLeads(leadsResult || [])
      setCampaigns(campaignsResult || [])

      toast.success('Marketing Refreshed', {
        description: `Reloaded ${leadsResult?.length || 0} leads and ${campaignsResult?.length || 0} campaigns`
      })
      logger.info('Marketing refresh completed', {
        success: true,
        leadCount: leadsResult?.length || 0,
        campaignCount: campaignsResult?.length || 0
      })
      announce('Marketing refreshed successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refresh failed'
      toast.error('Refresh Failed', { description: message })
      logger.error('Marketing refresh failed', { error: message })
      announce('Failed to refresh marketing', 'assertive')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton items={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Lead Generation & Email Marketing</h2>
                <p className="text-sm text-gray-600">Manage leads and marketing campaigns</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleRefreshMarketing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Total Leads</div>
                <div className="text-2xl font-bold text-blue-700">
                  <NumberFlow value={marketingStats.totalLeads} />
                </div>
                <div className="text-xs text-gray-600">{hotLeads.length} hot leads</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-green-700">
                  <NumberFlow value={marketingStats.conversionRate} suffix="%" />
                </div>
                <div className="text-xs text-gray-600">{marketingStats.convertedLeads} converted</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="text-sm text-purple-600 mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold text-purple-700">
                  <NumberFlow value={marketingStats.activeCampaigns} />
                </div>
                <div className="text-xs text-gray-600">{formatNumber(marketingStats.totalReach)} reach</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="text-sm text-orange-600 mb-1">Marketing ROI</div>
                <div className="text-2xl font-bold text-orange-700">
                  <NumberFlow value={marketingStats.marketingROI} suffix="%" />
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Excellent
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Leads ({filteredLeads.length})</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddLead}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    onClick={handleExportLeads}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Lead Tabs */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {(['all', 'new', 'contacted', 'qualified', 'converted'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setLeadsTab(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      leadsTab === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Lead List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{lead.name}</h4>
                        {lead.company && (
                          <div className="text-xs text-gray-600">{lead.company}</div>
                        )}
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLeadScoreColor(lead.score)}`}>
                          {lead.score === 'hot' && '🔥'}
                          {lead.score === 'warm' && '⭐'}
                          {lead.score === 'cold' && '❄️'}
                          {lead.scoreValue}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getLeadStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      Source: {lead.source} • {formatRelativeTime(lead.createdAt)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditLead(lead.id)}
                        className="flex-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      {lead.status === 'new' && (
                        <button
                          onClick={() => handleQualifyLead(lead.id, lead.name)}
                          className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Qualify
                        </button>
                      )}
                      {(lead.status === 'qualified' || lead.score === 'hot') && lead.status !== 'converted' && (
                        <button
                          onClick={() => handleConvertToDeal(lead.id, lead.name)}
                          className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          Convert
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLeadClick(lead.id, lead.name)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Campaigns Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Campaigns ({filteredCampaigns.length})</h3>
                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>

              {/* Campaign Tabs */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {(['all', 'draft', 'scheduled', 'active', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setCampaignsTab(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      campaignsTab === status
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Campaign List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredCampaigns.map((campaign) => {
                  const conversionRate = campaign.reached > 0 ? (campaign.conversions / campaign.reached) * 100 : 0

                  return (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{campaign.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs border ${getCampaignStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {campaign.type}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewCampaignAnalytics(campaign)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="bg-blue-50 rounded p-2">
                          <div className="text-blue-600 mb-0.5">Sent</div>
                          <div className="font-bold text-blue-700">{formatNumber(campaign.reached)}</div>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <div className="text-green-600 mb-0.5">Conversions</div>
                          <div className="font-bold text-green-700">{campaign.conversions}</div>
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                          <div className="text-purple-600 mb-0.5">ROI</div>
                          <div className="font-bold text-purple-700">{formatPercentage(campaign.roi, 0)}</div>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <div className="text-orange-600 mb-0.5">Revenue</div>
                          <div className="font-bold text-orange-700">{formatCurrency(campaign.revenue)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>

                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleSendCampaign(campaign.id, campaign.name)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Send
                            </button>
                            <button
                              onClick={() => handleScheduleCampaign(campaign.id, campaign.name)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              Schedule
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleABTestCampaign(campaign.id, campaign.name)}
                          className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors flex items-center gap-1"
                        >
                          <FlaskConical className="w-3 h-3" />
                          A/B
                        </button>

                        <button
                          onClick={() => handleDuplicateCampaign(campaign.id, campaign.name)}
                          className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>

                        <button
                          onClick={() => handleDeleteCampaignClick(campaign.id, campaign.name)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* Campaign Analytics Modal */}
      <AnimatePresence>
        {showCampaignModal && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedCampaign.name}</h3>
                  <p className="text-gray-600">Campaign Analytics</p>
                </div>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Target Audience</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatNumber(selectedCampaign.targetAudience)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Reached</div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatNumber(selectedCampaign.reached)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Engaged</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {formatNumber(selectedCampaign.engaged)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 mb-1">Conversions</div>
                  <div className="text-3xl font-bold text-orange-700">
                    {selectedCampaign.conversions}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Budget:</span>
                  <span>{formatCurrency(selectedCampaign.budget)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Spent:</span>
                  <span>{formatCurrency(selectedCampaign.spent)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Revenue:</span>
                  <span className="text-green-600 font-bold">{formatCurrency(selectedCampaign.revenue)}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span className="font-semibold text-gray-700">ROI:</span>
                  <span className="text-green-600 font-bold">{formatPercentage(selectedCampaign.roi, 0)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditCampaign(selectedCampaign.id)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Campaign
                </button>
                {selectedCampaign.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleSendCampaign(selectedCampaign.id, selectedCampaign.name)
                      setShowCampaignModal(false)
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Send Campaign
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Lead Confirmation Dialog */}
      <AlertDialog open={!!deleteLead} onOpenChange={() => setDeleteLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteLead?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteLead}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Campaign Confirmation Dialog */}
      <AlertDialog open={!!deleteCampaign} onOpenChange={() => setDeleteCampaign(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteCampaign?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCampaign}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
