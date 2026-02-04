'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Lightbulb,
  Target,
  AlertTriangle,
  Zap,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { KAZI_ANALYTICS_DATA, formatCurrency, getKaziInsightColor, getKaziInsightIcon } from '@/lib/analytics-utils'
import type { AnalyticsOverview, PerformanceMetrics } from '@/lib/analytics-queries'

const logger = createSimpleLogger('Analytics - Intelligence')

export default function IntelligenceAnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { announce } = useAnnouncer()

  // Data State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)

  // Load intelligence data
  useEffect(() => {
    const loadIntelligenceData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading business intelligence', { userId })

        // Dynamic import for code splitting
        const { getAnalyticsOverview, getPerformanceMetrics } = await import('@/lib/analytics-queries')

        // Load data in parallel
        const [overviewResult, performanceResult] = await Promise.all([
          getAnalyticsOverview(userId),
          getPerformanceMetrics(userId)
        ])

        if (overviewResult.error || performanceResult.error) {
          throw new Error('Failed to load intelligence data')
        }

        setOverview(overviewResult.data)
        setPerformance(performanceResult.data)

        setIsLoading(false)
        announce('Business intelligence loaded', 'polite')
        logger.info('Business intelligence loaded', {
          userId,
          hasOverview: !!overviewResult.data,
          hasPerformance: !!performanceResult.data
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load business intelligence'
        logger.error('Failed to load business intelligence', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading business intelligence', 'assertive')
      }
    }

    loadIntelligenceData()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsRefreshing(true)

    try {
      const { getAnalyticsOverview, getPerformanceMetrics } = await import('@/lib/analytics-queries')
      const [overviewResult, performanceResult] = await Promise.all([
        getAnalyticsOverview(userId),
        getPerformanceMetrics(userId)
      ])

      setOverview(overviewResult.data)
      setPerformance(performanceResult.data)
      toast.success('Intelligence data refreshed')
    } catch (err) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="space-y-6 p-6">
        <CardSkeleton />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={handleRefresh} />
      </div>
    )
  }

  // Generate dynamic insights based on real data
  const generateInsights = () => {
    const insights = []

    // Revenue insight
    const revenueGrowth = overview?.revenueGrowth ?? KAZI_ANALYTICS_DATA.overview.revenueGrowth
    if (revenueGrowth > 10) {
      insights.push({
        id: 'revenue-growth',
        type: 'opportunity',
        title: 'Strong Revenue Growth',
        description: `Your revenue is growing at ${revenueGrowth}%, outpacing industry average. Consider expanding service offerings.`,
        impact: 'high',
        confidence: 92,
        potentialValue: (overview?.monthlyRevenue ?? 0) * 0.15,
        recommendation: 'Expand Services'
      })
    } else if (revenueGrowth < 0) {
      insights.push({
        id: 'revenue-decline',
        type: 'warning',
        title: 'Revenue Decline Detected',
        description: `Revenue has decreased by ${Math.abs(revenueGrowth)}%. Review pricing strategy and client retention.`,
        impact: 'high',
        confidence: 88,
        potentialValue: 0,
        recommendation: 'Review Pricing'
      })
    }

    // Performance insight
    const completionRate = performance?.projectCompletionRate ?? KAZI_ANALYTICS_DATA.performance.projectCompletionRate
    if (completionRate >= 95) {
      insights.push({
        id: 'high-completion',
        type: 'success',
        title: 'Excellent Completion Rate',
        description: `${completionRate}% project completion rate indicates strong operational efficiency.`,
        impact: 'medium',
        confidence: 95,
        potentialValue: 0,
        recommendation: 'Maintain Quality'
      })
    }

    // Client insight
    const newClients = overview?.newClients ?? KAZI_ANALYTICS_DATA.overview.newClients
    if (newClients >= 3) {
      insights.push({
        id: 'client-growth',
        type: 'opportunity',
        title: 'Client Base Expanding',
        description: `${newClients} new clients this month. Consider implementing a referral program to accelerate growth.`,
        impact: 'medium',
        confidence: 85,
        potentialValue: newClients * 2500,
        recommendation: 'Launch Referrals'
      })
    }

    // Add default insights if we have few
    if (insights.length < 3) {
      insights.push(...KAZI_ANALYTICS_DATA.insights.slice(0, 3 - insights.length))
    }

    return insights
  }

  const insights = generateInsights()

  // Calculate business health score
  const healthScore = Math.round(
    ((performance?.projectCompletionRate ?? 85) +
    (performance?.onTimeDelivery ?? 88) +
    (performance?.clientSatisfaction ?? 92)) / 3
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">AI-powered insights and recommendations for your business</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Business Health Score */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Health Score</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-4xl font-bold text-indigo-700">
                  <NumberFlow value={healthScore} />
                </span>
                <span className="text-2xl text-indigo-500">/100</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on completion rate, on-time delivery, and client satisfaction
              </p>
            </div>
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
              <Brain className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline" className={`${healthScore >= 90 ? 'border-green-300 text-green-700' : healthScore >= 70 ? 'border-amber-300 text-amber-700' : 'border-red-300 text-red-700'}`}>
              {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Attention'}
            </Badge>
            <Badge variant="outline" className="border-indigo-300 text-indigo-700">
              <Zap className="h-3 w-3 mr-1" />
              AI Analysis Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={overview?.monthlyRevenue ?? KAZI_ANALYTICS_DATA.overview.monthlyRevenue} format="currency" />
            </div>
            <div className="flex items-center mt-1">
              {(overview?.revenueGrowth ?? 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${(overview?.revenueGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(overview?.revenueGrowth ?? 0) >= 0 ? '+' : ''}{overview?.revenueGrowth ?? KAZI_ANALYTICS_DATA.overview.revenueGrowth}% this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Growth</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={overview?.totalClients ?? KAZI_ANALYTICS_DATA.overview.totalClients} />
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">
                +{overview?.newClients ?? KAZI_ANALYTICS_DATA.overview.newClients} new this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={overview?.efficiency ?? KAZI_ANALYTICS_DATA.overview.efficiency} suffix="%" />
            </div>
            <Badge variant="outline" className="mt-1">
              {(overview?.efficiency ?? 85) >= 80 ? 'Above Target' : 'Room to Improve'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI-Powered Insights
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">Live Analysis</Badge>
          </CardTitle>
          <CardDescription>
            Real-time business intelligence powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {insights.map((insight, index) => {
              const InsightIcon = getKaziInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border-l-4 ${getKaziInsightColor(insight.impact)} flex items-start gap-4`}
                >
                  <InsightIcon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {insight.potentialValue > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Potential value: {formatCurrency(insight.potentialValue)}
                        </p>
                      )}
                      <Button size="sm" variant="outline">
                        {insight.recommendation}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Recommended next steps based on AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start gap-2 h-auto py-3">
              <Target className="h-4 w-4 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Set Revenue Goals</p>
                <p className="text-xs text-muted-foreground">Define Q1 targets</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3">
              <Users className="h-4 w-4 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Client Outreach</p>
                <p className="text-xs text-muted-foreground">Contact dormant clients</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div className="text-left">
                <p className="font-medium">Review Pricing</p>
                <p className="text-xs text-muted-foreground">Optimize profit margins</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
