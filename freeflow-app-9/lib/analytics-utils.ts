/**
 * Advanced Analytics Utilities
 * Helper functions and mock data for analytics dashboard
 */

import {
  Metric,
  ChartData,
  Insight,
  Goal,
  FunnelStage,
  AnalyticsStats,
  MetricType
} from './analytics-types'

export const MOCK_METRICS: Metric[] = [
  {
    id: 'revenue',
    name: 'Total Revenue',
    type: 'revenue',
    value: 284500,
    previousValue: 245000,
    change: 39500,
    changePercent: 16.1,
    trend: 'up',
    unit: 'currency',
    icon: '💰',
    color: '#10b981'
  },
  {
    id: 'users',
    name: 'Active Users',
    type: 'users',
    value: 12548,
    previousValue: 11230,
    change: 1318,
    changePercent: 11.7,
    trend: 'up',
    unit: 'number',
    icon: '👥',
    color: '#3b82f6'
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    type: 'conversion',
    value: 3.8,
    previousValue: 3.2,
    change: 0.6,
    changePercent: 18.75,
    trend: 'up',
    unit: 'percentage',
    icon: '📈',
    color: '#8b5cf6'
  },
  {
    id: 'retention',
    name: 'Retention Rate',
    type: 'retention',
    value: 87.5,
    previousValue: 85.2,
    change: 2.3,
    changePercent: 2.7,
    trend: 'up',
    unit: 'percentage',
    icon: '🎯',
    color: '#f59e0b'
  },
  {
    id: 'aov',
    name: 'Avg Order Value',
    type: 'revenue',
    value: 156,
    previousValue: 142,
    change: 14,
    changePercent: 9.9,
    trend: 'up',
    unit: 'currency',
    icon: '💳',
    color: '#06b6d4'
  },
  {
    id: 'clv',
    name: 'Customer LTV',
    type: 'revenue',
    value: 2450,
    previousValue: 2280,
    change: 170,
    changePercent: 7.5,
    trend: 'up',
    unit: 'currency',
    icon: '⭐',
    color: '#ec4899'
  }
]

export const MOCK_REVENUE_CHART: ChartData = {
  id: 'revenue-chart',
  name: 'Revenue Over Time',
  type: 'area',
  data: [
    { label: 'Jan', value: 185000, date: new Date('2024-01-01') },
    { label: 'Feb', value: 195000, date: new Date('2024-02-01') },
    { label: 'Mar', value: 215000, date: new Date('2024-03-01') },
    { label: 'Apr', value: 225000, date: new Date('2024-04-01') },
    { label: 'May', value: 245000, date: new Date('2024-05-01') },
    { label: 'Jun', value: 284500, date: new Date('2024-06-01') }
  ],
  config: {
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: ['#10b981'],
    height: 300,
    smooth: true
  }
}

export const MOCK_USERS_CHART: ChartData = {
  id: 'users-chart',
  name: 'User Growth',
  type: 'line',
  data: [
    { label: 'Jan', value: 8500 },
    { label: 'Feb', value: 9200 },
    { label: 'Mar', value: 9800 },
    { label: 'Apr', value: 10500 },
    { label: 'May', value: 11230 },
    { label: 'Jun', value: 12548 }
  ],
  config: {
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: ['#3b82f6', '#8b5cf6'],
    height: 300,
    smooth: true
  }
}

export const MOCK_TRAFFIC_SOURCES: ChartData = {
  id: 'traffic-sources',
  name: 'Traffic Sources',
  type: 'donut',
  data: [
    { label: 'Organic Search', value: 42, category: 'organic' },
    { label: 'Direct', value: 28, category: 'direct' },
    { label: 'Social Media', value: 18, category: 'social' },
    { label: 'Referral', value: 8, category: 'referral' },
    { label: 'Email', value: 4, category: 'email' }
  ],
  config: {
    showLegend: true,
    showGrid: false,
    showTooltip: true,
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
    height: 300
  }
}

export const MOCK_CONVERSION_FUNNEL: FunnelStage[] = [
  {
    id: 'stage-1',
    name: 'Visitors',
    count: 45800,
    percentage: 100,
    conversionRate: 100
  },
  {
    id: 'stage-2',
    name: 'Sign Ups',
    count: 12548,
    percentage: 27.4,
    conversionRate: 27.4,
    dropoffRate: 72.6
  },
  {
    id: 'stage-3',
    name: 'Active Users',
    count: 8945,
    percentage: 19.5,
    conversionRate: 71.3,
    dropoffRate: 28.7
  },
  {
    id: 'stage-4',
    name: 'Trial Users',
    count: 4523,
    percentage: 9.9,
    conversionRate: 50.6,
    dropoffRate: 49.4
  },
  {
    id: 'stage-5',
    name: 'Paid Customers',
    count: 1745,
    percentage: 3.8,
    conversionRate: 38.6,
    dropoffRate: 61.4
  }
]

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'insight-1',
    type: 'achievement',
    title: 'Revenue Milestone Reached',
    description: 'Total revenue exceeded $280K for the first time this month',
    impact: 'high',
    metric: 'revenue',
    value: 284500,
    createdAt: new Date(Date.now() - 86400000 * 2),
    isRead: false
  },
  {
    id: 'insight-2',
    type: 'trend',
    title: 'User Growth Accelerating',
    description: 'User growth rate increased by 11.7% compared to last month',
    impact: 'medium',
    metric: 'users',
    value: 11.7,
    recommendation: 'Consider scaling infrastructure to support continued growth',
    createdAt: new Date(Date.now() - 86400000 * 3),
    isRead: false
  },
  {
    id: 'insight-3',
    type: 'opportunity',
    title: 'Conversion Rate Optimization',
    description: 'Organic search traffic has high intent but low conversion',
    impact: 'high',
    recommendation: 'Optimize landing pages for organic search traffic',
    createdAt: new Date(Date.now() - 86400000 * 5),
    isRead: false
  },
  {
    id: 'insight-4',
    type: 'warning',
    title: 'Trial to Paid Conversion Below Target',
    description: 'Trial to paid conversion is at 38.6%, below the 45% target',
    impact: 'medium',
    metric: 'conversion',
    value: 38.6,
    recommendation: 'Review trial experience and add more onboarding touchpoints',
    createdAt: new Date(Date.now() - 86400000 * 7),
    isRead: true
  }
]

export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1',
    name: 'Q2 Revenue Target',
    description: 'Reach $300K in monthly revenue',
    metric: 'revenue',
    target: 300000,
    current: 284500,
    progress: 94.8,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-30'),
    status: 'on-track',
    assignedTo: 'user-1'
  },
  {
    id: 'goal-2',
    name: 'User Growth',
    description: 'Reach 15,000 active users',
    metric: 'users',
    target: 15000,
    current: 12548,
    progress: 83.7,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'on-track',
    assignedTo: 'user-2'
  },
  {
    id: 'goal-3',
    name: 'Conversion Rate',
    description: 'Achieve 5% conversion rate',
    metric: 'conversion',
    target: 5.0,
    current: 3.8,
    progress: 76,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    status: 'at-risk',
    assignedTo: 'user-3'
  }
]

export const MOCK_ANALYTICS_STATS: AnalyticsStats = {
  totalRevenue: 1580000,
  totalUsers: 45800,
  activeUsers: 12548,
  conversionRate: 3.8,
  averageOrderValue: 156,
  customerLifetimeValue: 2450,
  churnRate: 2.8,
  retentionRate: 87.5,
  monthlyRecurringRevenue: 284500,
  annualRecurringRevenue: 3414000,
  revenueGrowth: 16.1,
  userGrowth: 11.7,
  topMetrics: MOCK_METRICS,
  insights: MOCK_INSIGHTS,
  goals: MOCK_GOALS
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
