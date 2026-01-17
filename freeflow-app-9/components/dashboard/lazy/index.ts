/**
 * Lazy-loaded Dashboard Components
 *
 * This module exports skeleton loaders for use with next/dynamic
 * to implement code splitting and lazy loading for heavy dashboard pages.
 *
 * Usage:
 * ```tsx
 * import dynamic from 'next/dynamic'
 * import { ChartSkeleton } from '@/components/dashboard/lazy'
 *
 * const HeavyChart = dynamic(
 *   () => import('@/components/world-class/charts/line-chart').then(mod => mod.WorldClassLineChart),
 *   {
 *     loading: () => <ChartSkeleton />,
 *     ssr: false
 *   }
 * )
 * ```
 */

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
