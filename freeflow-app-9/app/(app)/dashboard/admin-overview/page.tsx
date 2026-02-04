'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatRelativeTime
} from '@/lib/admin-overview-utils'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  Mail,
  Zap,
  Eye,
  BarChart3,
  FileText,
  ArrowRight
} from 'lucide-react'

const logger = createSimpleLogger('admin-dashboard-overview')

export default function AdminOverviewPage() {
  const router = useRouter()
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [highValueDeals, setHighValueDeals] = useState<any[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([])
  const [hotLeads, setHotLeads] = useState<any[]>([])
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])

  // Calculate totals from state
  const totalPipelineValue = dashboardStats?.totalPipelineValue || 0
  const totalOutstanding = dashboardStats?.totalOutstanding || 0

  // System alerts
  const alerts = [
    {
      id: 'alert-1',
      level: 'warning',
      title: 'Overdue Invoices Require Attention',
      message: `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? 's' : ''} totaling ${formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0))} are overdue`,
      action: 'View Invoicing',
      path: '/dashboard/admin-overview/invoicing',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'alert-2',
      level: 'success',
      title: 'High-Value Deals in Pipeline',
      message: `${highValueDeals.length} deals worth ${formatCurrency(highValueDeals.reduce((sum, d) => sum + d.value, 0))} are in final stages`,
      action: 'View CRM',
      path: '/dashboard/admin-overview/crm',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 'alert-3',
      level: 'info',
      title: 'Hot Leads Ready for Contact',
      message: `${hotLeads.length} high-score leads are awaiting follow-up`,
      action: 'View Marketing',
      path: '/dashboard/admin-overview/marketing',
      timestamp: new Date(Date.now() - 10800000)
    },
    {
      id: 'alert-4',
      level: 'success',
      title: 'Campaign Performance Exceeds Goals',
      message: `${activeCampaigns.length} active campaigns showing strong ROI`,
      action: 'View Analytics',
      path: '/dashboard/admin-overview/analytics',
      timestamp: new Date(Date.now() - 14400000)
    }
  ]

  // Load admin overview data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        logger.info('Loading admin dashboard overview', { userId })

        // Import query functions
        const {
          getDashboardStats,
          getHighValueDeals: getHighValueDealsQuery,
          getOverdueInvoices: getOverdueInvoicesQuery,
          getHotLeads: getHotLeadsQuery,
          getActiveCampaigns: getActiveCampaignsQuery,
          getActiveWorkflows: getActiveWorkflowsQuery
        } = await import('@/lib/admin-overview-queries')

        // Load all dashboard data in parallel
        const [stats, deals, invoices, leads, campaigns, workflows] = await Promise.all([
          getDashboardStats(userId),
          getHighValueDealsQuery(userId, 75000),
          getOverdueInvoicesQuery(userId),
          getHotLeadsQuery(userId, 70),
          getActiveCampaignsQuery(userId),
          getActiveWorkflowsQuery(userId)
        ])

        setDashboardStats(stats)
        setHighValueDeals(deals)
        setOverdueInvoices(invoices)
        setHotLeads(leads)
        setActiveCampaigns(campaigns)
        setActiveWorkflows(workflows)

        setIsLoading(false)
        announce('Admin dashboard loaded successfully', 'polite')
        logger.info('Dashboard data loaded', {
          success: true,
          stats: {
            deals: deals.length,
            invoices: invoices.length,
            leads: leads.length,
            campaigns: campaigns.length,
            workflows: workflows.length
          }
        })

        toast.success('Dashboard Loaded', {
          description: `Tracking ${stats.activeDeals || 0} deals, ${stats.totalInvoices || 0} invoices, ${stats.totalLeads || 0} leads`
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard'
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading dashboard', 'assertive')
        logger.error('Dashboard load failed', { error: err, userId })
        toast.error('Failed to Load Dashboard', {
          description: errorMessage
        })
      }
    }

    loadDashboardData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle refresh dashboard
  const handleRefreshDashboard = async () => {
    if (!userId) {
      toast.error('Please log in to refresh dashboard')
      return
    }

    try {
      setRefreshing(true)
      logger.info('Refreshing dashboard data', { userId })

      // Import query functions
      const {
        getDashboardStats,
        getHighValueDeals: getHighValueDealsQuery,
        getOverdueInvoices: getOverdueInvoicesQuery,
        getHotLeads: getHotLeadsQuery,
        getActiveCampaigns: getActiveCampaignsQuery,
        getActiveWorkflows: getActiveWorkflowsQuery
      } = await import('@/lib/admin-overview-queries')

      // Reload all data
      const [stats, deals, invoices, leads, campaigns, workflows] = await Promise.all([
        getDashboardStats(userId),
        getHighValueDealsQuery(userId, 75000),
        getOverdueInvoicesQuery(userId),
        getHotLeadsQuery(userId, 70),
        getActiveCampaignsQuery(userId),
        getActiveWorkflowsQuery(userId)
      ])

      setDashboardStats(stats)
      setHighValueDeals(deals)
      setOverdueInvoices(invoices)
      setHotLeads(leads)
      setActiveCampaigns(campaigns)
      setActiveWorkflows(workflows)

      toast.success('Dashboard Refreshed', {
        description: 'All dashboard widgets have been updated with latest data'
      })
      logger.info('Dashboard refresh completed', { success: true })
      announce('Dashboard refreshed successfully', 'polite')
    } catch (error) {
      toast.error('Refresh Failed', {
        description: error instanceof Error ? error.message : 'Unable to refresh dashboard'
      })
      logger.error('Dashboard refresh failed', { error, userId })
    } finally {
      setRefreshing(false)
    }
  }

  // Handle mark alert as read
  const handleMarkAlertRead = async (alertId: string) => {
    try {
      const { acknowledgeAlert } = await import('@/lib/admin-overview-queries')
      await acknowledgeAlert(alertId)

      logger.info('Alert marked as read', { alertId, userId })
      toast.success('Alert Marked as Read', {
        description: 'The alert has been acknowledged'
      })
      announce('Alert acknowledged', 'polite')

      // Refresh dashboard data to update alerts list
      await handleRefreshDashboard()
    } catch (error) {
      logger.error('Failed to acknowledge alert', { error, alertId, userId })
      toast.error('Failed to mark alert as read', {
        description: error.message || 'Please try again'
      })
    }
  }

  // Handle dismiss alert
  const handleDismissAlert = async (alertId: string) => {
    try {
      const { dismissAlert } = await import('@/lib/admin-overview-queries')
      await dismissAlert(alertId)

      logger.info('Alert dismissed', { alertId, userId })
      toast.success('Alert Dismissed', {
        description: 'The alert has been removed from view'
      })
      announce('Alert dismissed', 'polite')

      // Refresh dashboard data to update alerts list
      await handleRefreshDashboard()
    } catch (error) {
      logger.error('Failed to dismiss alert', { error, alertId, userId })
      toast.error('Failed to dismiss alert', {
        description: error.message || 'Please try again'
      })
    }
  }

  // Handle view module
  const handleViewModule = (moduleName: string, path: string) => {
    logger.info('Navigating to module', { module: moduleName, path })
    router.push(path)
    toast.info(`Opening ${moduleName}`, {
      description: 'Navigating to detailed view'
    })
  }

  // Get alert level styling
  const getAlertStyling = (level: string) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      success: 'bg-green-50 border-green-200 text-green-700'
    }
    return styles[level as keyof typeof styles] || styles.info
  }

  // Get alert icon
  const getAlertIcon = (level: string) => {
    const icons = {
      info: <AlertCircle className="w-5 h-5" />,
      warning: <AlertCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />
    }
    return icons[level as keyof typeof icons] || icons.info
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* System Alerts */}
      {alerts.length > 0 && (
        <ScrollReveal>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  System Alerts
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                    {alerts.length}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    {showAllAlerts ? 'Show Less' : 'View All'}
                  </button>
                  <button
                    onClick={handleRefreshDashboard}
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(showAllAlerts ? alerts : alerts.slice(0, 3)).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertStyling(alert.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.level)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{alert.title}</div>
                        <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="opacity-75">
                            {formatRelativeTime(alert.timestamp.toISOString())}
                          </span>
                          {alert.path && (
                            <button
                              onClick={() => handleViewModule(alert.action, alert.path)}
                              className="font-medium hover:underline"
                            >
                              {alert.action} →
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkAlertRead(alert.id)}
                          className="p-1.5 hover:bg-white/50 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="p-1.5 hover:bg-white/50 rounded transition-colors"
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>
      )}

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Analytics Module */}
        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Business Intelligence</h3>
                    <p className="text-xs text-gray-600">Revenue & Analytics</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-blue-600 mb-1">Revenue</div>
                  <div className="text-lg font-bold text-blue-700">
                    <NumberFlow
                      value={284500}
                      format="currency"
                    />
                  </div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +16.2%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <div className="text-xs text-purple-600 mb-1">Conversion</div>
                  <div className="text-lg font-bold text-purple-700">3.8%</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +18.7%
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Recent Insight</div>
                <div className="text-sm font-medium text-gray-800">
                  Revenue trending 8% above projections
                </div>
                <div className="text-xs text-gray-500">Consider scaling operations</div>
              </div>

              <button
                onClick={() => handleViewModule('Analytics', '/dashboard/admin-overview/analytics')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open Analytics
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* CRM Module */}
        <ScrollReveal delay={0.2}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">CRM & Sales Pipeline</h3>
                    <p className="text-xs text-gray-600">Deals & Contacts</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <div className="text-xs text-green-600 mb-1">Pipeline</div>
                  <div className="text-lg font-bold text-green-700">
                    <NumberFlow
                      value={totalPipelineValue}
                      format="currency"
                    />
                  </div>
                  <div className="text-xs text-gray-600">{dashboardStats?.activeDeals || 0} deals</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-blue-600 mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-blue-700">
                    {formatPercentage(dashboardStats?.dealWinRate || 0)}
                  </div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Strong
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Hot Deals</div>
                <div className="text-sm font-medium text-gray-800">
                  {highValueDeals.length} high-value deals in final stages
                </div>
                <div className="text-xs text-gray-500">
                  Worth {formatCurrency(highValueDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0))}
                </div>
              </div>

              <button
                onClick={() => handleViewModule('CRM', '/dashboard/admin-overview/crm')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open CRM
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Invoicing Module */}
        <ScrollReveal delay={0.3}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Billing Management</h3>
                    <p className="text-xs text-gray-600">Invoices & Payments</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                  {overdueInvoices.length} Overdue
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <div className="text-xs text-green-600 mb-1">Paid</div>
                  <div className="text-lg font-bold text-green-700">
                    <NumberFlow
                      value={dashboardStats?.totalRevenue || 0}
                      format="currency"
                    />
                  </div>
                  <div className="text-xs text-gray-600">On time</div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg p-3 border border-red-100 dark:border-red-800">
                  <div className="text-xs text-red-600 mb-1">Outstanding</div>
                  <div className="text-lg font-bold text-red-700">
                    <NumberFlow
                      value={totalOutstanding}
                      format="currency"
                    />
                  </div>
                  <div className="text-xs text-red-600">{overdueInvoices.length} overdue</div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Action Required</div>
                <div className="text-sm font-medium text-gray-800">
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? 's' : ''} need follow-up
                </div>
                <div className="text-xs text-gray-500">Send payment reminders</div>
              </div>

              <button
                onClick={() => handleViewModule('Invoicing', '/dashboard/admin-overview/invoicing')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open Invoicing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Marketing Module */}
        <ScrollReveal delay={0.4}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Lead Gen & Marketing</h3>
                    <p className="text-xs text-gray-600">Leads & Campaigns</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg p-3 border border-red-100 dark:border-red-800">
                  <div className="text-xs text-red-600 mb-1">Hot Leads</div>
                  <div className="text-lg font-bold text-red-700">
                    <NumberFlow value={hotLeads.length} />
                  </div>
                  <div className="text-xs text-gray-600">Ready to convert</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <div className="text-xs text-purple-600 mb-1">ROI</div>
                  <div className="text-lg font-bold text-purple-700">
                    {formatPercentage(dashboardStats?.emailOpenRate || 0, 0)}
                  </div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Excellent
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Active Campaigns</div>
                <div className="text-sm font-medium text-gray-800">
                  {activeCampaigns.length} campaigns generating strong results
                </div>
                <div className="text-xs text-gray-500">
                  {formatNumber(dashboardStats?.totalEmailsSent || 0)} total reach
                </div>
              </div>

              <button
                onClick={() => handleViewModule('Marketing', '/dashboard/admin-overview/marketing')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open Marketing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Operations Module */}
        <ScrollReveal delay={0.5}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">User Management</h3>
                    <p className="text-xs text-gray-600">Team & Permissions</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-blue-600 mb-1">Team</div>
                  <div className="text-lg font-bold text-blue-700">
                    <NumberFlow value={dashboardStats?.totalTeamMembers || 0} />
                  </div>
                  <div className="text-xs text-gray-600">{dashboardStats?.activeTeamMembers || 0} active</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <div className="text-xs text-green-600 mb-1">Productivity</div>
                  <div className="text-lg font-bold text-green-700">{formatPercentage(dashboardStats?.teamProductivity || 0)}</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    High
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Status</div>
                <div className="text-sm font-medium text-gray-800">
                  1 pending invite awaiting acceptance
                </div>
                <div className="text-xs text-gray-500">All roles configured</div>
              </div>

              <button
                onClick={() => handleViewModule('Operations', '/dashboard/admin-overview/operations')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open Operations
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Automation Module */}
        <ScrollReveal delay={0.6}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Business Automation</h3>
                    <p className="text-xs text-gray-600">Workflows & Integrations</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                  {activeWorkflows.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <div className="text-xs text-purple-600 mb-1">Workflows</div>
                  <div className="text-lg font-bold text-purple-700">
                    <NumberFlow value={activeWorkflows.length} />
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatPercentage(dashboardStats?.workflowSuccessRate || 0)} success
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <div className="text-xs text-green-600 mb-1">Time Saved</div>
                  <div className="text-lg font-bold text-green-700">94h</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    This month
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <div className="text-xs text-gray-600 mb-2">Integrations</div>
                <div className="text-sm font-medium text-gray-800">
                  5 integrations connected and syncing
                </div>
                <div className="text-xs text-gray-500">
                  {formatNumber(dashboardStats?.totalWorkflowRuns || 0)} total runs
                </div>
              </div>

              <button
                onClick={() => handleViewModule('Automation', '/dashboard/admin-overview/automation')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Open Automation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScrollReveal delay={0.7}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pipeline Value</div>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                <NumberFlow
                  value={totalPipelineValue}
                  format="currency"
                />
              </div>
              <div className="text-xs text-gray-500">{dashboardStats?.activeDeals || 0} active deals</div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.75}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Campaigns</div>
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                <NumberFlow value={activeCampaigns.length} />
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage(dashboardStats?.emailOpenRate || 0, 0)} open rate
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.8}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Automation Runs</div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                <NumberFlow value={dashboardStats?.totalWorkflowRuns || 0} />
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage(dashboardStats?.workflowSuccessRate || 0)} success
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.85}>
          <LiquidGlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Time Saved</div>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                <NumberFlow value={94} suffix="h" />
              </div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>
      </div>
    </div>
  )
}
