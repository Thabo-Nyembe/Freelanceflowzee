'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'
import type { MonthlyRevenue, AnalyticsOverview } from '@/lib/analytics-queries'

const logger = createSimpleLogger('Analytics - Revenue')

export default function RevenueAnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { announce } = useAnnouncer()

  // Data State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([])

  // Load revenue data
  useEffect(() => {
    const loadRevenueData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading revenue analytics', { userId })

        // Dynamic import for code splitting
        const { getAnalyticsOverview, getMonthlyRevenue } = await import('@/lib/analytics-queries')

        // Load data in parallel
        const [overviewResult, monthlyResult] = await Promise.all([
          getAnalyticsOverview(userId),
          getMonthlyRevenue(userId, 12)
        ])

        if (overviewResult.error || monthlyResult.error) {
          throw new Error('Failed to load revenue data')
        }

        setOverview(overviewResult.data)
        setMonthlyData(monthlyResult.data || [])

        setIsLoading(false)
        announce('Revenue analytics loaded', 'polite')
        logger.info('Revenue analytics loaded', {
          userId,
          hasOverview: !!overviewResult.data,
          monthlyCount: monthlyResult.data?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load revenue analytics'
        logger.error('Failed to load revenue analytics', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading revenue analytics', 'assertive')
      }
    }

    loadRevenueData()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsRefreshing(true)

    try {
      const { getAnalyticsOverview, getMonthlyRevenue } = await import('@/lib/analytics-queries')
      const [overviewResult, monthlyResult] = await Promise.all([
        getAnalyticsOverview(userId),
        getMonthlyRevenue(userId, 12)
      ])

      setOverview(overviewResult.data)
      setMonthlyData(monthlyResult.data || [])
      toast.success('Revenue data refreshed')
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
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

  // Use real data or fallback
  const totalRevenue = overview?.totalRevenue ?? KAZI_ANALYTICS_DATA.overview.totalRevenue
  const monthlyRevenue = overview?.monthlyRevenue ?? KAZI_ANALYTICS_DATA.overview.monthlyRevenue
  const revenueGrowth = overview?.revenueGrowth ?? KAZI_ANALYTICS_DATA.overview.revenueGrowth
  const activeProjects = overview?.activeProjects ?? KAZI_ANALYTICS_DATA.overview.activeProjects
  const isGrowthPositive = revenueGrowth >= 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Track your earnings and financial performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              <NumberFlow value={totalRevenue} format="currency" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              <NumberFlow value={monthlyRevenue} format="currency" />
            </div>
            <div className="flex items-center mt-1">
              {isGrowthPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isGrowthPositive ? '+' : ''}{revenueGrowth}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Project Value */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              <NumberFlow value={activeProjects > 0 ? totalRevenue / activeProjects : 0} format="currency" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per active project</p>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              <NumberFlow value={revenueGrowth} suffix="%" />
            </div>
            <Badge variant={isGrowthPositive ? 'default' : 'destructive'} className="mt-1">
              {isGrowthPositive ? 'Growing' : 'Declining'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
          <CardDescription>
            {monthlyData.length > 0
              ? `Showing last ${monthlyData.length} months of revenue data`
              : 'No monthly data available yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(month.revenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      {month.projects} projects • {month.clients} clients
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Complete projects to see monthly breakdown</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
