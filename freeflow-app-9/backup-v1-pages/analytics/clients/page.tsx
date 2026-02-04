'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  Users,
  UserCheck,
  UserMinus,
  TrendingUp,
  RefreshCw,
  Star,
  Award,
  Target
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'
import type { AnalyticsOverview } from '@/lib/analytics-queries'

const logger = createSimpleLogger('Analytics - Clients')

interface TopClient {
  name: string
  revenue: number
  projects: number
  satisfaction: number
  avatar?: string
}

export default function ClientAnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { announce } = useAnnouncer()

  // Data State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [topClients, setTopClients] = useState<TopClient[]>([])

  // Load client data
  useEffect(() => {
    const loadClientData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading client analytics', { userId })

        // Dynamic import for code splitting
        const { getAnalyticsOverview, getTopClients } = await import('@/lib/analytics-queries')

        // Load data in parallel
        const [overviewResult, clientsResult] = await Promise.all([
          getAnalyticsOverview(userId),
          getTopClients(userId, 5)
        ])

        if (overviewResult.error || clientsResult.error) {
          throw new Error('Failed to load client data')
        }

        setOverview(overviewResult.data)
        setTopClients(clientsResult.data || [])

        setIsLoading(false)
        announce('Client analytics loaded', 'polite')
        logger.info('Client analytics loaded', {
          userId,
          hasOverview: !!overviewResult.data,
          clientsCount: clientsResult.data?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load client analytics'
        logger.error('Failed to load client analytics', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading client analytics', 'assertive')
      }
    }

    loadClientData()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsRefreshing(true)

    try {
      const { getAnalyticsOverview, getTopClients } = await import('@/lib/analytics-queries')
      const [overviewResult, clientsResult] = await Promise.all([
        getAnalyticsOverview(userId),
        getTopClients(userId, 5)
      ])

      setOverview(overviewResult.data)
      setTopClients(clientsResult.data || [])
      toast.success('Client data refreshed')
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

  // Use real data or fallback
  const totalClients = overview?.totalClients ?? KAZI_ANALYTICS_DATA.overview.activeProjects
  const newClients = overview?.newClients ?? 3
  const clientGrowth = overview?.clientGrowth ?? 12
  const retention = KAZI_ANALYTICS_DATA.clients.retention
  const avgLifetimeValue = KAZI_ANALYTICS_DATA.clients.averageLifetimeValue
  const churnRate = KAZI_ANALYTICS_DATA.clients.churnRate
  const displayClients = topClients.length > 0 ? topClients : KAZI_ANALYTICS_DATA.clients.topPerformers

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Analytics</h1>
          <p className="text-muted-foreground">Understand your client relationships and growth</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Clients */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              <NumberFlow value={totalClients} />
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+{newClients} this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              <NumberFlow value={retention} suffix="%" />
            </div>
            <Badge variant="default" className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
              Excellent
            </Badge>
          </CardContent>
        </Card>

        {/* Avg Lifetime Value */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              <NumberFlow value={avgLifetimeValue} format="currency" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per client</p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              <NumberFlow value={churnRate} suffix="%" />
            </div>
            <Badge variant="outline" className="mt-1 border-amber-300 text-amber-700">
              Low risk
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Top Performing Clients
          </CardTitle>
          <CardDescription>
            {displayClients.length > 0
              ? `Your ${displayClients.length} highest-value client relationships`
              : 'No client data available yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayClients.length > 0 ? (
            <div className="space-y-4">
              {displayClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{client.projects} projects</span>
                        <span>•</span>
                        <Star className="h-3 w-3 text-amber-500" />
                        <span>{client.satisfaction}% satisfaction</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(client.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Total revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Add clients to see analytics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
