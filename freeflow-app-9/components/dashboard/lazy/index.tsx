/**
 * Lazy-loaded Dashboard Components
 *
 * This barrel file exports:
 * 1. All skeleton components for loading states
 * 2. Memoized presentational components
 * 3. Performance-optimized list items
 */

'use client'

// Re-export all skeletons
export {
  ChartSkeleton,
  AnalyticsOverviewSkeleton,
  AnalyticsSettingsSkeleton,
  MetricsSkeleton,
  FunnelsSkeleton,
  CohortsSkeleton,
  RealtimeSkeleton,
  ReportsSkeleton,
  DashboardsSkeleton,
  ProjectsSkeleton,
  SprintsSkeleton,
  ShipmentsSkeleton,
  TrackingSkeleton,
  CarriersSkeleton,
  ShippingAnalyticsSkeleton,
  TabContentSkeleton,
} from './dashboard-skeleton'

// Re-export memoized components
export {
  MemoizedStatCard,
  MemoizedProjectCard,
  MemoizedActivityItem,
  MemoizedInsightCard,
  MemoizedMetricCard,
  MemoizedFeatureCard,
  MemoizedQuickActionButton,
} from './memoized-components'
