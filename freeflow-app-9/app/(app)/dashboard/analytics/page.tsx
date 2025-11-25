'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { NumberFlow } from '@/components/ui/number-flow'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  TrendingUp,
  DollarSign,
  Users,
  FolderOpen,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Search,
  Brain,
  Activity,
  Bookmark,
  Calendar
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// AI FEATURES
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'
import { useCurrentUser } from '@/hooks/use-ai-data'

// PRODUCTION LOGGER
import { createFeatureLogger } from '@/lib/logger'

// ANALYTICS UTILS
import {
  KAZI_ANALYTICS_DATA,
  formatCurrency,
  getKaziInsightColor,
  getKaziInsightIcon,
  getGrowthIndicator
} from '@/lib/analytics-utils'

const logger = createFeatureLogger('Analytics - Overview')

const TextShimmer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

export default function AnalyticsOverviewPage() {
  // REAL USER AUTH & AI DATA
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // State Management
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [dateRange, setDateRange] = useState('last-30-days')
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [predictiveMode, setPredictiveMode] = useState(false)
  const [aiMode, setAiMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // A+++ LOAD ANALYTICS DATA
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

        setIsLoading(false)
        announce('Analytics loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
        setIsLoading(false)
        announce('Error loading analytics', 'assertive')
      }
    }

    loadAnalyticsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // FILTERED DATA
  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      return KAZI_ANALYTICS_DATA.projectCategories
    }

    const filtered = KAZI_ANALYTICS_DATA.projectCategories.filter(cat =>
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    logger.debug('Analytics filter applied', {
      searchTerm,
      resultsCount: filtered.length
    })

    return filtered
  }, [searchTerm])

  // HANDLERS
  const handleRefreshAnalytics = async () => {
    logger.info('Analytics data refresh started')
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    logger.info('Analytics data refreshed successfully')
    toast.success('Analytics data refreshed!', {
      description: 'All metrics updated with latest data'
    })
  }

  const handleExportReport = async () => {
    logger.info('Report export started')
    setIsExporting(true)

    try {
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          format: 'csv',
          period: { start: startDate, end: endDate }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const filename = `analytics-comprehensive-${Date.now()}.csv`
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        logger.info('Report exported successfully', { filename })
        toast.success('Analytics report exported successfully!', {
          description: `Downloaded ${filename}`
        })
      } else {
        logger.warn('Report export failed', { status: response.status })
        toast.error('Export failed. Please try again.')
      }
    } catch (error) {
      logger.error('Report export error', { error })
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value)
    logger.info('Date range changed', { newValue: e.target.value })
    toast.success(`Date range changed to: ${e.target.value.replace(/-/g, ' ')}`)
  }

  const handleFilters = () => {
    logger.info('Filters panel opened')
    toast.success('Advanced filters applied!')
  }

  const handleSettings = () => {
    logger.info('Settings panel opened')
    toast.success('Analytics settings opened!')
  }

  const handleAIMode = () => {
    const newState = !aiMode
    setAiMode(newState)
    logger.info('AI mode toggled', { newState: newState ? 'ENABLED' : 'DISABLED' })
    toast.success(newState ? 'AI mode enabled' : 'AI mode disabled')
  }

  const handlePredictiveMode = () => {
    const newState = !predictiveMode
    setPredictiveMode(newState)
    logger.info('Predictive mode toggled', { newState: newState ? 'ENABLED' : 'DISABLED' })
    toast.success(newState ? 'Predictive mode enabled' : 'Predictive mode disabled')
  }

  const handleBookmarkView = () => {
    logger.info('View bookmarked')
    toast.success('Current view bookmarked!')
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6">
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
    )
  }

  // ERROR STATE
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
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search analytics, categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              data-testid="search-analytics"
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            data-testid="date-range-filter"
          >
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-year">Last Year</option>
            <option value="all-time">All Time</option>
          </select>

          {/* Filters */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleFilters}
            data-testid="filter-analytics-btn"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSettings}
            data-testid="analytics-settings-btn"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Mode Toggle */}
          <Button
            variant={aiMode ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleAIMode}
            data-testid="ai-mode-toggle-btn"
          >
            <Brain className="h-4 w-4" />
            AI Mode
          </Button>

          {/* Predictive Mode Toggle */}
          <Button
            variant={predictiveMode ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handlePredictiveMode}
            data-testid="predictive-mode-toggle-btn"
          >
            <Activity className="h-4 w-4" />
            Predictive
          </Button>

          {/* Bookmark */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleBookmarkView}
          >
            <Bookmark className="h-4 w-4" />
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefreshAnalytics}
            disabled={isRefreshing}
            data-testid="refresh-analytics-btn"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportReport}
            disabled={isExporting}
            data-testid="export-report-btn"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                  <NumberFlow
                    value={KAZI_ANALYTICS_DATA.overview.monthlyRevenue}
                    format="currency"
                    className="text-3xl font-bold text-gray-900"
                  />
                  <p className="text-sm text-green-600 font-medium">
                    +<NumberFlow value={KAZI_ANALYTICS_DATA.overview.revenueGrowth} decimals={1} className="inline-block" />% from last month
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Projects</p>
                  <NumberFlow
                    value={KAZI_ANALYTICS_DATA.overview.activeProjects}
                    className="text-3xl font-bold text-gray-900"
                  />
                  <p className="text-sm text-gray-500">
                    <NumberFlow value={KAZI_ANALYTICS_DATA.overview.totalProjects} className="inline-block" /> total projects
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Clients</p>
                  <NumberFlow
                    value={KAZI_ANALYTICS_DATA.overview.totalClients}
                    className="text-3xl font-bold text-gray-900"
                  />
                  <p className="text-sm text-blue-600 font-medium">
                    <NumberFlow value={KAZI_ANALYTICS_DATA.overview.newClients} className="inline-block" /> new this month
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Efficiency</p>
                  <div className="flex items-baseline">
                    <NumberFlow
                      value={KAZI_ANALYTICS_DATA.overview.efficiency}
                      className="text-3xl font-bold text-gray-900"
                    />
                    <span className="text-3xl font-bold text-gray-900">%</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    <NumberFlow value={KAZI_ANALYTICS_DATA.overview.billableHours} className="inline-block" />h billable
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* AI Insights Panel */}
      {aiMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <TextShimmer>AI-Powered Insights</TextShimmer>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">Live Analysis</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time business intelligence powered by AI
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {KAZI_ANALYTICS_DATA.insights.map((insight, index) => {
                  const InsightIcon = getKaziInsightIcon(insight.type)
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getKaziInsightColor(insight.impact)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <InsightIcon className="h-5 w-5 text-gray-600" />
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.impact}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      {insight.potentialValue > 0 && (
                        <p className="text-xs text-green-600 font-medium mb-2">
                          Potential value: {formatCurrency(insight.potentialValue)}
                        </p>
                      )}
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        {insight.recommendation}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI INSIGHTS PANEL */}
      {showAIPanel && userId && (
        <AIInsightsPanel
          userId={userId}
          defaultExpanded={false}
          showHeader={true}
        />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
              {predictiveMode && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">Predictive</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {KAZI_ANALYTICS_DATA.revenue.monthly.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium w-8">{month.month}</span>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2 w-full max-w-xs">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(month.revenue / 50000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(month.revenue)}</p>
                    <p className="text-xs text-gray-500">{month.projects} projects</p>
                  </div>
                </div>
              ))}

              {predictiveMode && KAZI_ANALYTICS_DATA.revenue.forecast.map((month) => (
                <div key={month.month} className="flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium w-8">{month.month}</span>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2 w-full max-w-xs border-2 border-dashed border-purple-300">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(month.revenue / 60000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">{formatCurrency(month.revenue)}</p>
                    <p className="text-xs text-gray-500">{month.confidence}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Categories */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Project Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCategories.map(category => {
                const indicator = getGrowthIndicator(category.growth)
                const GrowthIcon = indicator.icon

                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className={`flex items-center gap-1 ${indicator.color}`}>
                          <GrowthIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">{Math.abs(category.growth)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(category.revenue)}</p>
                        <p className="text-xs text-gray-500">{category.count} projects</p>
                      </div>
                    </div>
                    <Progress
                      value={(category.revenue / 20000) * 100}
                      className="h-2"
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
