'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  MOCK_METRICS,
  MOCK_REVENUE_CHART,
  MOCK_USERS_CHART,
  MOCK_TRAFFIC_SOURCES,
  MOCK_CONVERSION_FUNNEL,
  MOCK_INSIGHTS,
  MOCK_GOALS,
  MOCK_ANALYTICS_STATS,
  formatMetricValue,
  formatChange,
  getTrendColor,
  getInsightIcon,
  getInsightColor,
  getGoalStatusColor,
  calculateFunnelConversion,
  getTimeRangeLabel
} from '@/lib/analytics-utils'
import {
  Metric,
  ChartData,
  Insight,
  Goal,
  FunnelStage,
  TimeRange
} from '@/lib/analytics-types'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

type ViewMode = 'overview' | 'revenue' | 'users' | 'conversion' | 'insights' | 'goals'

export default function AdvancedAnalyticsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(MOCK_METRICS)

  // A+++ LOAD ADVANCED ANALYTICS DATA
  useEffect(() => {
    const loadAdvancedAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load advanced analytics'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Advanced analytics loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load advanced analytics')
        setIsLoading(false)
        announce('Error loading advanced analytics', 'assertive')
      }
    }

    loadAdvancedAnalyticsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'conversion', label: 'Conversion', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'goals', label: 'Goals', icon: '🎯' }
  ]

  const timeRanges: TimeRange[] = ['today', 'week', 'month', 'quarter', 'year']

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedMetrics.map((metric) => (
          <LiquidGlassCard key={metric.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                  <div className="text-3xl font-bold" style={{ color: metric.color }}>
                    {formatMetricValue(metric.value, metric.unit)}
                  </div>
                </div>
                <div className="text-2xl">{metric.icon}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  {formatChange(metric.change, metric.unit)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{MOCK_REVENUE_CHART.name}</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {MOCK_REVENUE_CHART.data.map((point, index) => {
                const maxValue = Math.max(...MOCK_REVENUE_CHART.data.map(d => d.value))
                const height = (point.value / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400 relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatMetricValue(point.value, 'currency')}
                      </div>
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{point.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{MOCK_TRAFFIC_SOURCES.name}</h3>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {MOCK_TRAFFIC_SOURCES.data.map((source, index) => {
                  const total = MOCK_TRAFFIC_SOURCES.data.reduce((sum, s) => sum + s.value, 0)
                  const percentage = (source.value / total) * 100
                  const colors = MOCK_TRAFFIC_SOURCES.config.colors || []
                  return (
                    <div key={index} className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-sm flex-1">{source.label}</span>
                      <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Recent Insights */}
      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
          <div className="space-y-3">
            {MOCK_INSIGHTS.slice(0, 3).map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{insight.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getInsightColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-blue-600 mt-1">💡 {insight.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-green-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.totalRevenue, 'currency')}
            </div>
            <div className="text-xs text-green-500 mt-1">
              +{MOCK_ANALYTICS_STATS.revenueGrowth.toFixed(1)}% vs last period
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">MRR</div>
            <div className="text-2xl font-bold text-blue-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.monthlyRecurringRevenue, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Monthly Recurring</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">ARR</div>
            <div className="text-2xl font-bold text-purple-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.annualRecurringRevenue, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Annual Recurring</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Avg Order Value</div>
            <div className="text-2xl font-bold text-orange-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.averageOrderValue, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Per Transaction</div>
          </div>
        </LiquidGlassCard>
      </div>

      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
          <div className="h-80 flex items-end justify-between gap-3">
            {MOCK_REVENUE_CHART.data.map((point, index) => {
              const maxValue = Math.max(...MOCK_REVENUE_CHART.data.map(d => d.value))
              const height = (point.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-green-600 via-green-500 to-emerald-400 relative group cursor-pointer hover:from-green-500 hover:via-green-400 hover:to-emerald-300 transition-colors"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div className="font-bold">{formatMetricValue(point.value, 'currency')}</div>
                      <div className="text-xs text-gray-300">{point.label}</div>
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-muted-foreground">{point.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-bold text-blue-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.totalUsers, 'number')}
            </div>
            <div className="text-xs text-blue-500 mt-1">All Time</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Users</div>
            <div className="text-2xl font-bold text-green-500">
              {formatMetricValue(MOCK_ANALYTICS_STATS.activeUsers, 'number')}
            </div>
            <div className="text-xs text-green-500 mt-1">
              +{MOCK_ANALYTICS_STATS.userGrowth.toFixed(1)}% growth
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Retention Rate</div>
            <div className="text-2xl font-bold text-purple-500">
              {MOCK_ANALYTICS_STATS.retentionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last 30 Days</div>
          </div>
        </LiquidGlassCard>
      </div>

      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">User Growth</h3>
          <div className="h-80 flex items-end justify-between gap-3">
            {MOCK_USERS_CHART.data.map((point, index) => {
              const maxValue = Math.max(...MOCK_USERS_CHART.data.map(d => d.value))
              const height = (point.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 relative group cursor-pointer hover:from-blue-500 hover:via-blue-400 hover:to-cyan-300 transition-colors"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div className="font-bold">{formatMetricValue(point.value, 'number')}</div>
                      <div className="text-xs text-gray-300">{point.label}</div>
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-muted-foreground">{point.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderConversion = () => {
    const totalConversion = calculateFunnelConversion(MOCK_CONVERSION_FUNNEL)

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiquidGlassCard>
            <div className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Overall Conversion</div>
              <div className="text-3xl font-bold text-green-500">
                {totalConversion.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Visitor to Customer
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Conversion Rate</div>
              <div className="text-3xl font-bold text-purple-500">
                {MOCK_ANALYTICS_STATS.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Current Period
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {MOCK_CONVERSION_FUNNEL.map((stage, index) => {
                const maxCount = MOCK_CONVERSION_FUNNEL[0].count
                const width = (stage.count / maxCount) * 100

                return (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {formatMetricValue(stage.count, 'number')}
                        </span>
                        <span className="text-sm font-semibold text-blue-500">
                          {stage.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-4"
                      >
                        {stage.conversionRate && (
                          <span className="text-white text-sm font-semibold">
                            {stage.conversionRate.toFixed(1)}% conversion
                          </span>
                        )}
                      </motion.div>
                    </div>

                    {stage.dropoffRate && (
                      <div className="text-xs text-red-500 mt-1">
                        ↓ {stage.dropoffRate.toFixed(1)}% drop-off
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    )
  }

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {MOCK_INSIGHTS.filter(i => !i.isRead).length} unread
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_INSIGHTS.map((insight) => (
          <LiquidGlassCard key={insight.id}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{insight.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getInsightColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!insight.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>

                  {insight.recommendation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div>
                          <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Recommendation
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Goals & Targets</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidGlassCard>
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">On Track</div>
            <div className="text-3xl font-bold text-green-500">
              {MOCK_GOALS.filter(g => g.status === 'on-track').length}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">At Risk</div>
            <div className="text-3xl font-bold text-yellow-500">
              {MOCK_GOALS.filter(g => g.status === 'at-risk').length}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Completed</div>
            <div className="text-3xl font-bold text-blue-500">
              {MOCK_GOALS.filter(g => g.status === 'completed').length}
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <div className="space-y-4">
        {MOCK_GOALS.map((goal) => (
          <LiquidGlassCard key={goal.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <span className={`text-sm font-semibold ${getGoalStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Start: {new Date(goal.startDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      End: {new Date(goal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {goal.progress.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {formatMetricValue(goal.current, goal.metric === 'revenue' ? 'currency' : goal.metric === 'conversion' ? 'percentage' : 'number')} / {formatMetricValue(goal.target, goal.metric === 'revenue' ? 'currency' : goal.metric === 'conversion' ? 'percentage' : 'number')}
                  </span>
                </div>
                <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      goal.status === 'on-track'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : goal.status === 'at-risk'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                        : goal.status === 'completed'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-400'
                        : 'bg-gradient-to-r from-red-500 to-pink-400'
                    }`}
                  />
                </div>
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
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-8">
            <CardSkeleton />
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Advanced Analytics
              </TextShimmer>
              <p className="text-muted-foreground">
                Comprehensive business intelligence and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 rounded-lg border bg-background"
              >
                {timeRanges.map((range) => (
                  <option key={range} value={range}>
                    {getTimeRangeLabel(range)}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* View Mode Tabs */}
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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
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

        {/* Content */}
        <ScrollReveal delay={0.2}>
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'revenue' && renderRevenue()}
          {viewMode === 'users' && renderUsers()}
          {viewMode === 'conversion' && renderConversion()}
          {viewMode === 'insights' && renderInsights()}
          {viewMode === 'goals' && renderGoals()}
        </ScrollReveal>
      </div>
    </div>
  )
}
