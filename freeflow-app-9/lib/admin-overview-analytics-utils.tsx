/**
 * Admin Analytics Utilities
 *
 * Comprehensive analytics and reporting system with revenue tracking, conversion funnels,
 * traffic analysis, ROI calculations, and business intelligence insights.
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AdminAnalyticsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DateRange = '7d' | '30d' | '90d' | '365d' | 'custom'
export type MetricType = 'revenue' | 'conversion' | 'traffic' | 'roi' | 'aov' | 'ltv'
export type TrendDirection = 'up' | 'down' | 'stable'
export type TrafficSource = 'organic' | 'direct' | 'social' | 'referral' | 'paid' | 'email'
export type ConversionStage = 'visitor' | 'lead' | 'qualified' | 'proposal' | 'customer'

export interface RevenueData {
  date: string
  revenue: number
  transactions: number
  averageOrderValue: number
  refunds: number
  netRevenue: number
}

export interface ConversionFunnel {
  stage: ConversionStage
  count: number
  percentage: number
  conversionRate: number
  dropoffRate: number
}

export interface TrafficSourceData {
  source: TrafficSource
  visitors: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
  conversions: number
  conversionRate: number
  revenue: number
}

export interface AnalyticsInsight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'info'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  metric: MetricType
  impact: string
  recommendation: string
  detectedAt: string
}

export interface Metric {
  id: string
  name: string
  type: MetricType
  value: number
  previousValue: number
  change: number
  changePercentage: number
  trend: TrendDirection
  goal?: number
  unit: string
}

export interface AnalyticsDashboard {
  id: string
  userId: string
  dateRange: DateRange
  customStartDate?: string
  customEndDate?: string
  metrics: Metric[]
  revenueData: RevenueData[]
  conversionFunnel: ConversionFunnel[]
  trafficSources: TrafficSourceData[]
  insights: AnalyticsInsight[]
  totalRevenue: number
  totalConversions: number
  averageOrderValue: number
  roi: number
  generatedAt: string
}

export interface AnalyticsReport {
  id: string
  userId: string
  name: string
  type: 'revenue' | 'conversion' | 'traffic' | 'full'
  dateRange: DateRange
  format: 'pdf' | 'csv' | 'xlsx' | 'json'
  data: any
  fileUrl?: string
  fileSize?: number
  generatedAt: string
  expiresAt?: string
}

export interface UserAnalytics {
  userId: string
  totalSessions: number
  totalPageviews: number
  avgSessionDuration: number
  bounceRate: number
  topPages: { page: string; views: number }[]
  devices: { type: string; count: number }[]
  locations: { country: string; count: number }[]
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

export function generateMockRevenueData(days: number = 30): RevenueData[] {
  const data: RevenueData[] = []
  const baseRevenue = 5000

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const variability = (Math.random() - 0.5) * 0.3
    const weekendFactor = isWeekend ? 0.7 : 1.0

    const revenue = Math.floor(baseRevenue * weekendFactor * (1 + variability))
    const transactions = Math.floor((revenue / 250) * (1 + (Math.random() - 0.5) * 0.2))
    const refunds = Math.floor(revenue * (Math.random() * 0.05))

    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      transactions,
      averageOrderValue: Math.floor(revenue / transactions),
      refunds,
      netRevenue: revenue - refunds
    })
  }

  logger.debug('Generated mock revenue data', { days, records: data.length })
  return data
}

export function generateMockConversionFunnel(): ConversionFunnel[] {
  const stages: ConversionStage[] = ['visitor', 'lead', 'qualified', 'proposal', 'customer']
  const baseCount = 10000
  const funnel: ConversionFunnel[] = []

  let previousCount = baseCount

  stages.forEach((stage, index) => {
    const dropoffMultiplier = index === 0 ? 1 : 0.3 + (Math.random() * 0.3)
    const count = index === 0 ? baseCount : Math.floor(previousCount * dropoffMultiplier)
    const percentage = (count / baseCount) * 100
    const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0
    const dropoffRate = 100 - conversionRate

    funnel.push({
      stage,
      count,
      percentage: Math.floor(percentage * 10) / 10,
      conversionRate: Math.floor(conversionRate * 10) / 10,
      dropoffRate: Math.floor(dropoffRate * 10) / 10
    })

    previousCount = count
  })

  logger.debug('Generated mock conversion funnel', { stages: funnel.length })
  return funnel
}

export function generateMockTrafficSources(): TrafficSourceData[] {
  const sources: TrafficSource[] = ['organic', 'direct', 'social', 'referral', 'paid', 'email']
  const totalVisitors = 50000

  return sources.map((source, index) => {
    const visitorShare = [0.35, 0.25, 0.2, 0.1, 0.07, 0.03][index]
    const visitors = Math.floor(totalVisitors * visitorShare)
    const sessions = Math.floor(visitors * (1.2 + Math.random() * 0.3))
    const bounceRate = 20 + Math.random() * 50
    const avgSessionDuration = Math.floor(60 + Math.random() * 300)
    const conversionRate = 1 + Math.random() * 5
    const conversions = Math.floor((visitors * conversionRate) / 100)
    const revenue = Math.floor(conversions * (200 + Math.random() * 300))

    return {
      source,
      visitors,
      sessions,
      bounceRate: Math.floor(bounceRate * 10) / 10,
      avgSessionDuration,
      conversions,
      conversionRate: Math.floor(conversionRate * 10) / 10,
      revenue
    }
  })
}

export function generateMockAnalyticsInsights(count: number = 10): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []
  const types: AnalyticsInsight['type'][] = ['opportunity', 'warning', 'success', 'info']
  const priorities: AnalyticsInsight['priority'][] = ['high', 'medium', 'low']
  const metrics: MetricType[] = ['revenue', 'conversion', 'traffic', 'roi', 'aov']

  const templates = [
    {
      title: 'Revenue Growth Opportunity',
      description: 'Organic traffic conversion rate increased by 15% this week',
      impact: '+$2,500 potential revenue',
      recommendation: 'Increase organic marketing efforts and content production'
    },
    {
      title: 'High Bounce Rate Alert',
      description: 'Bounce rate on landing pages exceeded 70%',
      impact: 'Lost 1,200 potential leads',
      recommendation: 'Optimize landing page design and load time'
    },
    {
      title: 'Conversion Rate Success',
      description: 'Email campaign achieved 8.2% conversion rate',
      impact: '+340 new customers',
      recommendation: 'Replicate this campaign for other segments'
    },
    {
      title: 'Traffic Spike Detected',
      description: 'Social media traffic increased 250% in last 24 hours',
      impact: '+5,000 new visitors',
      recommendation: 'Prepare infrastructure and monitor closely'
    },
    {
      title: 'AOV Improvement',
      description: 'Average order value increased to $450',
      impact: '+$15,000 revenue',
      recommendation: 'Continue current pricing and upsell strategies'
    }
  ]

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]

    insights.push({
      id: `insight-${i + 1}`,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      title: template.title,
      description: template.description,
      metric: metrics[i % metrics.length],
      impact: template.impact,
      recommendation: template.recommendation,
      detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock analytics insights', { count: insights.length })
  return insights
}

export function generateMockMetrics(): Metric[] {
  return [
    {
      id: 'revenue',
      name: 'Total Revenue',
      type: 'revenue',
      value: 125000,
      previousValue: 98000,
      change: 27000,
      changePercentage: 27.6,
      trend: 'up',
      goal: 150000,
      unit: 'USD'
    },
    {
      id: 'conversions',
      name: 'Conversions',
      type: 'conversion',
      value: 542,
      previousValue: 487,
      change: 55,
      changePercentage: 11.3,
      trend: 'up',
      goal: 600,
      unit: 'count'
    },
    {
      id: 'traffic',
      name: 'Total Traffic',
      type: 'traffic',
      value: 45000,
      previousValue: 42000,
      change: 3000,
      changePercentage: 7.1,
      trend: 'up',
      unit: 'visitors'
    },
    {
      id: 'roi',
      name: 'Return on Investment',
      type: 'roi',
      value: 285,
      previousValue: 245,
      change: 40,
      changePercentage: 16.3,
      trend: 'up',
      unit: 'percentage'
    },
    {
      id: 'aov',
      name: 'Average Order Value',
      type: 'aov',
      value: 450,
      previousValue: 425,
      change: 25,
      changePercentage: 5.9,
      trend: 'up',
      unit: 'USD'
    }
  ]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateMetrics(revenueData: RevenueData[], conversionFunnel: ConversionFunnel[], trafficSources: TrafficSourceData[]): {
  totalRevenue: number
  totalConversions: number
  averageOrderValue: number
  roi: number
} {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalConversions = conversionFunnel[conversionFunnel.length - 1]?.count || 0
  const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0

  const totalSpent = trafficSources.reduce((sum, source) => sum + (source.visitors * 2), 0)
  const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0

  return {
    totalRevenue: Math.floor(totalRevenue),
    totalConversions,
    averageOrderValue: Math.floor(averageOrderValue),
    roi: Math.floor(roi * 10) / 10
  }
}

export function calculateTrend(current: number, previous: number): TrendDirection {
  if (current > previous * 1.02) return 'up'
  if (current < previous * 0.98) return 'down'
  return 'stable'
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

export function getTrendIcon(trend: TrendDirection): string {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
}

export function getTrendColor(trend: TrendDirection): string {
  return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
}

export function getInsightColor(type: AnalyticsInsight['type']): string {
  const colors = {
    opportunity: 'border-green-500',
    warning: 'border-yellow-500',
    success: 'border-blue-500',
    info: 'border-gray-500'
  }
  return colors[type]
}

export function filterInsightsByPriority(insights: AnalyticsInsight[], priority: AnalyticsInsight['priority']): AnalyticsInsight[] {
  return insights.filter(i => i.priority === priority)
}

export function sortInsightsByPriority(insights: AnalyticsInsight[]): AnalyticsInsight[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...insights].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export function aggregateRevenueByPeriod(
  data: RevenueData[],
  period: 'day' | 'week' | 'month'
): RevenueData[] {
  if (period === 'day') return data

  const grouped = new Map<string, RevenueData[]>()

  data.forEach(item => {
    const date = new Date(item.date)
    let key: string

    if (period === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(item)
  })

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    revenue: items.reduce((sum, i) => sum + i.revenue, 0),
    transactions: items.reduce((sum, i) => sum + i.transactions, 0),
    averageOrderValue: Math.floor(
      items.reduce((sum, i) => sum + i.revenue, 0) /
      items.reduce((sum, i) => sum + i.transactions, 0)
    ),
    refunds: items.reduce((sum, i) => sum + i.refunds, 0),
    netRevenue: items.reduce((sum, i) => sum + i.netRevenue, 0)
  }))
}

export function calculateConversionRate(funnel: ConversionFunnel[]): number {
  if (funnel.length === 0) return 0
  const first = funnel[0].count
  const last = funnel[funnel.length - 1].count
  return first > 0 ? (last / first) * 100 : 0
}

export function getTopTrafficSources(sources: TrafficSourceData[], limit: number = 3): TrafficSourceData[] {
  return [...sources]
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, limit)
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)

  logger.info('CSV export completed', { filename, rows: data.length })
}

export function getDateRangeLabel(range: DateRange): string {
  const labels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '365d': 'Last Year',
    'custom': 'Custom Range'
  }
  return labels[range]
}

export function getDaysFromRange(range: DateRange): number {
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
    'custom': 30
  }
  return days[range]
}
