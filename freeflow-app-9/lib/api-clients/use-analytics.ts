/**
 * React hooks for Analytics API
 *
 * Uses TanStack Query for caching, loading states, and error handling
 * Provides dashboard metrics, revenue analytics, and predictive insights
 *
 * Caching Strategy:
 * - Dashboard metrics: 2 min staleTime (analytics)
 * - Revenue analytics: 2 min staleTime (analytics)
 * - Performance metrics: 1 min staleTime (semi-fresh)
 * - Predictive insights: 1 hour staleTime (computed data)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { analyticsClient } from './analytics-client'
import { STALE_TIMES, analyticsQueryOptions } from '@/lib/query-client'

/**
 * Get complete dashboard metrics
 */
export function useDashboardMetrics(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dashboard-metrics', startDate, endDate],
    queryFn: async () => {
      const response = await analyticsClient.getDashboardMetrics(startDate, endDate)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch dashboard metrics')
      }

      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options
  })
}

/**
 * Get revenue analytics
 */
export function useRevenueAnalytics(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['revenue-analytics', startDate, endDate],
    queryFn: async () => {
      const response = await analyticsClient.getRevenueAnalytics(startDate, endDate)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch revenue analytics')
      }

      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options
  })
}

/**
 * Get engagement metrics
 */
export function useEngagementMetrics(
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['engagement-metrics'],
    queryFn: async () => {
      const response = await analyticsClient.getEngagementMetrics()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch engagement metrics')
      }

      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options
  })
}

/**
 * Get performance metrics
 */
export function usePerformanceMetrics(
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const response = await analyticsClient.getPerformanceMetrics()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch performance metrics')
      }

      return response.data
    },
    staleTime: STALE_TIMES.SEMI_FRESH,
    refetchInterval: 60000, // Refetch every minute
    ...options
  })
}

/**
 * Get predictive insights
 */
export function usePredictiveInsights(
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      const response = await analyticsClient.getPredictiveInsights()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch predictive insights')
      }

      return response.data
    },
    staleTime: 60 * 60 * 1000, // 1 hour staleTime for computed insights
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
    refetchInterval: 3600000, // Refetch every hour
    ...options
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function AnalyticsDashboard() {
 *   const { data: metrics, isLoading } = useDashboardMetrics()
 *   const { data: revenue } = useRevenueAnalytics()
 *   const { data: insights } = usePredictiveInsights()
 *
 *   if (isLoading) return <Skeleton />
 *
 *   return (
 *     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 *       {/* Revenue Card *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Total Revenue</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <div className="text-2xl font-bold">
 *             ${metrics?.revenue.total.toLocaleString()}
 *           </div>
 *           <p className="text-xs text-muted-foreground">
 *             +{metrics?.revenue.change_percentage}% from last month
 *           </p>
 *         </CardContent>
 *       </Card>
 *
 *       {/* Projects Card *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Active Projects</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <div className="text-2xl font-bold">
 *             {metrics?.projects.active}
 *           </div>
 *           <p className="text-xs text-muted-foreground">
 *             {metrics?.projects.completion_rate}% completion rate
 *           </p>
 *         </CardContent>
 *       </Card>
 *
 *       {/* Clients Card *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Active Clients</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <div className="text-2xl font-bold">
 *             {metrics?.clients.active}
 *           </div>
 *           <p className="text-xs text-muted-foreground">
 *             +{metrics?.clients.new_this_month} this month
 *           </p>
 *         </CardContent>
 *       </Card>
 *
 *       {/* Tasks Card *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Tasks Completed</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <div className="text-2xl font-bold">
 *             {metrics?.tasks.completed}/{metrics?.tasks.total}
 *           </div>
 *           <p className="text-xs text-muted-foreground">
 *             {metrics?.tasks.completion_rate}% completion rate
 *           </p>
 *         </CardContent>
 *       </Card>
 *
 *       {/* Revenue Chart *\/}
 *       <Card className="col-span-4">
 *         <CardHeader>
 *           <CardTitle>Revenue Trend</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <RevenueChart data={revenue?.by_month} />
 *         </CardContent>
 *       </Card>
 *
 *       {/* Predictive Insights *\/}
 *       <Card className="col-span-4">
 *         <CardHeader>
 *           <CardTitle>AI Insights</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           {insights?.recommended_actions.map((action, i) => (
 *             <div key={i} className="mb-2">
 *               <Badge variant={action.priority === 'high' ? 'destructive' : 'default'}>
 *                 {action.priority}
 *               </Badge>
 *               <p>{action.action}</p>
 *             </div>
 *           ))}
 *         </CardContent>
 *       </Card>
 *     </div>
 *   )
 * }
 * ```
 */
