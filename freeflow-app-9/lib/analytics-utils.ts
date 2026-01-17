// ============================================================================
// ANALYTICS UTILITIES FOR KAZI PLATFORM
// ============================================================================

import { Target, Lightbulb, TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  Metric,
  ChartData,
  Goal,
  FunnelStage,
  AnalyticsStats,
  MetricType
} from './analytics-types'

// ============================================================================
// KAZI-SPECIFIC TYPES
// ============================================================================

export interface KaziInsight {
  id: string
  type: 'revenue' | 'efficiency' | 'growth'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  recommendation: string
  potentialValue: number
}

export interface ProjectCategory {
  category: string
  count: number
  revenue: number
  color: string
  growth: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  projects: number
  clients: number
}

export interface RevenueForecast {
  month: string
  revenue: number
  confidence: number
}

export interface TopClient {
  name: string
  revenue: number
  projects: number
  satisfaction: number
}

// ============================================================================
// KAZI ANALYTICS DATA
// ============================================================================
// MIGRATED: Batch #15 - Removed mock data, using database hooks

export const KAZI_ANALYTICS_DATA = {
  overview: {
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeProjects: 0,
    totalProjects: 0,
    totalClients: 0,
    newClients: 0,
    efficiency: 0,
    billableHours: 0,
    revenueGrowth: 0,
    projectGrowth: 0,
    clientGrowth: 0,
    efficiencyGrowth: 0
  },

  revenue: {
    monthly: [] as MonthlyRevenue[],
    forecast: [] as RevenueForecast[]
  },

  projectCategories: [] as ProjectCategory[],

  insights: [] as KaziInsight[],

  clients: {
    topPerformers: [] as TopClient[],
    retention: 0,
    averageLifetimeValue: 0,
    churnRate: 0
  },

  performance: {
    projectCompletionRate: 0,
    onTimeDelivery: 0,
    clientSatisfaction: 0,
    revenuePerProject: 0,
    profitMargin: 0
  }
}

// ============================================================================
// LEGACY MOCK DATA (PRESERVED FOR COMPATIBILITY)
// ============================================================================

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_METRICS: Metric[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_REVENUE_CHART: ChartData = {
  id: 'revenue-chart',
  name: 'Revenue Over Time',
  type: 'area',
  data: [],
  config: {
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: ['#10b981'],
    height: 300,
    smooth: true
  }
}

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_USERS_CHART: ChartData = {
  id: 'users-chart',
  name: 'User Growth',
  type: 'line',
  data: [],
  config: {
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: ['#3b82f6', '#8b5cf6'],
    height: 300,
    smooth: true
  }
}

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_TRAFFIC_SOURCES: ChartData = {
  id: 'traffic-sources',
  name: 'Traffic Sources',
  type: 'donut',
  data: [],
  config: {
    showLegend: true,
    showGrid: false,
    showTooltip: true,
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
    height: 300
  }
}

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_CONVERSION_FUNNEL: FunnelStage[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_INSIGHTS: Insight[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_GOALS: Goal[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_ANALYTICS_STATS: AnalyticsStats = {
  totalRevenue: 0,
  totalUsers: 0,
  activeUsers: 0,
  conversionRate: 0,
  averageOrderValue: 0,
  customerLifetimeValue: 0,
  churnRate: 0,
  retentionRate: 0,
  monthlyRecurringRevenue: 0,
  annualRecurringRevenue: 0,
  revenueGrowth: 0,
  userGrowth: 0,
  topMetrics: [],
  insights: [],
  goals: []
}

// Helper Functions
export function formatMetricValue(value: number, unit: Metric['unit']): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    case 'time':
      return `${value}s`
    default:
      return value.toString()
  }
}

export function formatChange(change: number, unit: Metric['unit']): string {
  const prefix = change >= 0 ? '+' : ''
  return prefix + formatMetricValue(Math.abs(change), unit)
}

export function getMetricIcon(type: MetricType): string {
  const icons: Record<MetricType, string> = {
    revenue: '💰',
    users: '👥',
    engagement: '🎯',
    conversion: '📈',
    retention: '⭐',
    performance: '⚡'
  }
  return icons[type]
}

export function getTrendColor(trend: Metric['trend']): string {
  const colors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  }
  return colors[trend]
}

export function getInsightIcon(type: Insight['type']): string {
  const icons = {
    trend: '📈',
    anomaly: '⚠️',
    opportunity: '💡',
    warning: '🚨',
    achievement: '🎉'
  }
  return icons[type]
}

export function getInsightColor(impact: Insight['impact']): string {
  const colors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  }
  return colors[impact]
}

export function getGoalStatusColor(status: Goal['status']): string {
  const colors = {
    'on-track': 'text-green-500',
    'at-risk': 'text-yellow-500',
    completed: 'text-blue-500',
    missed: 'text-red-500'
  }
  return colors[status]
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function calculateFunnelConversion(stages: FunnelStage[]): number {
  if (stages.length < 2) return 0
  const first = stages[0].count
  const last = stages[stages.length - 1].count
  return (last / first) * 100
}

export function getTimeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    today: 'Today',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    quarter: 'Last 90 Days',
    year: 'Last 365 Days',
    custom: 'Custom Range'
  }
  return labels[range] || range
}

export function filterMetricsByType(metrics: Metric[], type: MetricType): Metric[] {
  return metrics.filter(m => m.type === type)
}

export function sortMetricsByChange(metrics: Metric[]): Metric[] {
  return [...metrics].sort((a, b) => b.changePercent - a.changePercent)
}

export function getTopPerformingMetrics(metrics: Metric[], count: number = 3): Metric[] {
  return sortMetricsByChange(metrics).slice(0, count)
}

export function calculateChurnRate(lost: number, total: number): number {
  if (total === 0) return 0
  return (lost / total) * 100
}

export function calculateRetentionRate(retained: number, total: number): number {
  if (total === 0) return 0
  return (retained / total) * 100
}

export function projectRevenue(current: number, growthRate: number, months: number): number {
  return current * Math.pow(1 + growthRate / 100, months)
}

export function calculateARR(mrr: number): number {
  return mrr * 12
}

export function calculateMRR(arr: number): number {
  return arr / 12
}

export function getChartColors(count: number): string[] {
  const baseColors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899',
    '#06b6d4', '#14b8a6', '#f97316', '#ef4444', '#6366f1'
  ]
  return baseColors.slice(0, count)
}

// ============================================================================
// KAZI-SPECIFIC UTILITY FUNCTIONS
// ============================================================================

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const getKaziInsightColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
    case 'medium': return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30'
    case 'low': return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30'
    default: return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
  }
}

export const getKaziInsightIcon = (type: string) => {
  switch (type) {
    case 'revenue': return Target
    case 'efficiency': return Lightbulb
    case 'growth': return TrendingUp
    default: return Zap
  }
}

export const getGrowthIndicator = (growth: number) => {
  if (growth > 0) {
    return {
      icon: ArrowUpRight,
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  } else {
    return {
      icon: ArrowDownRight,
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  }
}
