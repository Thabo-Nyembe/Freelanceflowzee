// Admin Analytics System - Supabase Queries
// Comprehensive queries for revenue tracking, conversion analysis, traffic sources, and business intelligence

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type DateRange = '7d' | '30d' | '90d' | '365d' | 'custom'
export type MetricType = 'revenue' | 'conversion' | 'traffic' | 'roi' | 'aov' | 'ltv'
export type TrendDirection = 'up' | 'down' | 'stable'
export type TrafficSource = 'organic' | 'direct' | 'social' | 'referral' | 'paid' | 'email'
export type ConversionStage = 'visitor' | 'lead' | 'qualified' | 'proposal' | 'customer'
export type InsightType = 'opportunity' | 'warning' | 'success' | 'info'
export type InsightPriority = 'high' | 'medium' | 'low'
export type ReportType = 'revenue' | 'conversion' | 'traffic' | 'full'
export type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'json'

export interface RevenueData {
  id: string
  user_id: string
  date: string
  revenue: number
  transactions: number
  average_order_value: number
  refunds: number
  net_revenue: number
  created_at: string
}

export interface ConversionFunnel {
  id: string
  user_id: string
  date: string
  stage: ConversionStage
  count: number
  percentage: number
  conversion_rate: number
  dropoff_rate: number
  created_at: string
}

export interface TrafficSourceData {
  id: string
  user_id: string
  date: string
  source: TrafficSource
  visitors: number
  sessions: number
  bounce_rate: number
  avg_session_duration: number
  conversions: number
  conversion_rate: number
  revenue: number
  created_at: string
}

export interface AnalyticsInsight {
  id: string
  user_id: string
  type: InsightType
  priority: InsightPriority
  title: string
  description: string
  metric: MetricType
  impact: string
  recommendation: string
  detected_at: string
  dismissed_at?: string
  created_at: string
}

export interface Metric {
  id: string
  user_id: string
  date: string
  name: string
  type: MetricType
  value: number
  previous_value: number
  change: number
  change_percentage: number
  trend: TrendDirection
  goal?: number
  unit: string
  created_at: string
  updated_at: string
}

export interface AnalyticsReport {
  id: string
  user_id: string
  name: string
  type: ReportType
  date_range: DateRange
  format: ReportFormat
  custom_start_date?: string
  custom_end_date?: string
  data: Record<string, any>
  file_url?: string
  file_size?: number
  generated_at: string
  expires_at?: string
  created_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  total_sessions: number
  total_pageviews: number
  avg_session_duration: number
  bounce_rate: number
  top_pages: any[]
  devices: any[]
  locations: any[]
  updated_at: string
}

// ============================================================================
// REVENUE DATA - CRUD & QUERIES
// ============================================================================

export async function recordRevenueData(userId: string, revenueData: Partial<RevenueData>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('revenue_data')
    .upsert({
      user_id: userId,
      ...revenueData
    })
    .select()
    .single()

  if (error) throw error
  return data as RevenueData
}

export async function getRevenueData(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('revenue_data')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data as RevenueData[]
}

export async function getRevenueByDateRange(userId: string, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  return getRevenueData(userId, startDate, endDate)
}

export async function getTotalRevenue(userId: string, startDate: string, endDate: string) {
  const data = await getRevenueData(userId, startDate, endDate)
  return data.reduce((sum, item) => sum + Number(item.revenue), 0)
}

export async function getAverageOrderValue(userId: string, startDate: string, endDate: string) {
  const data = await getRevenueData(userId, startDate, endDate)
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue), 0)
  const totalTransactions = data.reduce((sum, item) => sum + Number(item.transactions), 0)
  return totalTransactions > 0 ? totalRevenue / totalTransactions : 0
}

// ============================================================================
// CONVERSION FUNNEL - CRUD & QUERIES
// ============================================================================

export async function recordConversionFunnel(userId: string, funnelData: Partial<ConversionFunnel>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversion_funnel')
    .upsert({
      user_id: userId,
      ...funnelData
    })
    .select()
    .single()

  if (error) throw error
  return data as ConversionFunnel
}

export async function getConversionFunnel(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversion_funnel')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('stage', { ascending: true })

  if (error) throw error
  return data as ConversionFunnel[]
}

export async function getConversionByStage(userId: string, stage: ConversionStage, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversion_funnel')
    .select('*')
    .eq('user_id', userId)
    .eq('stage', stage)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data as ConversionFunnel[]
}

export async function getConversionRate(userId: string, startDate: string, endDate: string) {
  const data = await getConversionFunnel(userId, startDate, endDate)

  const visitors = data.find(d => d.stage === 'visitor')?.count || 0
  const customers = data.find(d => d.stage === 'customer')?.count || 0

  return visitors > 0 ? (customers / visitors) * 100 : 0
}

// ============================================================================
// TRAFFIC SOURCES - CRUD & QUERIES
// ============================================================================

export async function recordTrafficSource(userId: string, trafficData: Partial<TrafficSourceData>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('traffic_sources')
    .upsert({
      user_id: userId,
      ...trafficData
    })
    .select()
    .single()

  if (error) throw error
  return data as TrafficSourceData
}

export async function getTrafficSources(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('traffic_sources')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('visitors', { ascending: false })

  if (error) throw error
  return data as TrafficSourceData[]
}

export async function getTrafficBySource(userId: string, source: TrafficSource, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('traffic_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('source', source)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data as TrafficSourceData[]
}

export async function getTopTrafficSources(userId: string, dateRange: DateRange, limit: number = 5) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('traffic_sources')
    .select('source, visitors, sessions, revenue')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('visitors', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Partial<TrafficSourceData>[]
}

// ============================================================================
// ANALYTICS INSIGHTS - CRUD & QUERIES
// ============================================================================

export async function createInsight(userId: string, insightData: Partial<AnalyticsInsight>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_insights')
    .insert({
      user_id: userId,
      detected_at: new Date().toISOString(),
      ...insightData
    })
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsInsight
}

export async function getInsights(userId: string, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .is('dismissed_at', null)
    .order('detected_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AnalyticsInsight[]
}

export async function getInsightsByPriority(userId: string, priority: InsightPriority) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('priority', priority)
    .is('dismissed_at', null)
    .order('detected_at', { ascending: false })

  if (error) throw error
  return data as AnalyticsInsight[]
}

export async function getInsightsByType(userId: string, type: InsightType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .is('dismissed_at', null)
    .order('detected_at', { ascending: false })

  if (error) throw error
  return data as AnalyticsInsight[]
}

export async function dismissInsight(insightId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_insights')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', insightId)
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsInsight
}

// ============================================================================
// METRICS - CRUD & QUERIES
// ============================================================================

export async function recordMetric(userId: string, metricData: Partial<Metric>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('metrics')
    .upsert({
      user_id: userId,
      ...metricData
    })
    .select()
    .single()

  if (error) throw error
  return data as Metric
}

export async function getMetrics(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data as Metric[]
}

export async function getMetricsByType(userId: string, metricType: MetricType, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('type', metricType)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data as Metric[]
}

export async function getLatestMetric(userId: string, metricType: MetricType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('type', metricType)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as Metric | null
}

// ============================================================================
// ANALYTICS REPORTS - CRUD & QUERIES
// ============================================================================

export async function generateReport(userId: string, reportData: Partial<AnalyticsReport>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_reports')
    .insert({
      user_id: userId,
      generated_at: new Date().toISOString(),
      ...reportData
    })
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsReport
}

export async function getReports(userId: string, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AnalyticsReport[]
}

export async function getReportsByType(userId: string, reportType: ReportType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('type', reportType)
    .order('generated_at', { ascending: false })

  if (error) throw error
  return data as AnalyticsReport[]
}

export async function updateReportFile(reportId: string, fileUrl: string, fileSize: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('analytics_reports')
    .update({ file_url: fileUrl, file_size: fileSize })
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsReport
}

export async function deleteReport(reportId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('analytics_reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
  return true
}

// ============================================================================
// USER ANALYTICS - CRUD & QUERIES
// ============================================================================

export async function updateUserAnalytics(userId: string, analyticsData: Partial<UserAnalytics>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_analytics')
    .upsert({
      user_id: userId,
      updated_at: new Date().toISOString(),
      ...analyticsData
    })
    .select()
    .single()

  if (error) throw error
  return data as UserAnalytics
}

export async function getUserAnalytics(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as UserAnalytics
}

// ============================================================================
// COMPREHENSIVE ANALYTICS - DASHBOARD QUERIES
// ============================================================================

export async function getDashboardAnalytics(userId: string, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const [
    revenueData,
    conversionFunnel,
    trafficSources,
    insights,
    metrics
  ] = await Promise.all([
    getRevenueData(userId, startDate, endDate),
    getConversionFunnel(userId, startDate, endDate),
    getTrafficSources(userId, startDate, endDate),
    getInsights(userId, 10),
    getMetrics(userId, startDate, endDate)
  ])

  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.revenue), 0)
  const totalTransactions = revenueData.reduce((sum, item) => sum + Number(item.transactions), 0)
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  const visitors = conversionFunnel.find(d => d.stage === 'visitor')?.count || 0
  const customers = conversionFunnel.find(d => d.stage === 'customer')?.count || 0
  const conversionRate = visitors > 0 ? (customers / visitors) * 100 : 0

  const totalVisitors = trafficSources.reduce((sum, item) => sum + Number(item.visitors), 0)
  const totalSessions = trafficSources.reduce((sum, item) => sum + Number(item.sessions), 0)

  return {
    summary: {
      total_revenue: totalRevenue,
      total_transactions: totalTransactions,
      average_order_value: avgOrderValue,
      conversion_rate: conversionRate,
      total_visitors: totalVisitors,
      total_sessions: totalSessions
    },
    revenue: revenueData,
    conversion: conversionFunnel,
    traffic: trafficSources,
    insights,
    metrics
  }
}

export async function getAnalyticsStats(userId: string, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const supabase = createClient()

  const [
    revenueResult,
    funnelResult,
    trafficResult,
    insightsResult
  ] = await Promise.all([
    supabase.from('revenue_data').select('revenue, transactions').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('conversion_funnel').select('stage, count').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('traffic_sources').select('visitors, sessions, revenue').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('analytics_insights').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('dismissed_at', null)
  ])

  const revenue = revenueResult.data || []
  const funnel = funnelResult.data || []
  const traffic = trafficResult.data || []

  const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.revenue || 0), 0)
  const totalTransactions = revenue.reduce((sum, r) => sum + Number(r.transactions || 0), 0)
  const totalVisitors = traffic.reduce((sum, t) => sum + Number(t.visitors || 0), 0)
  const totalSessions = traffic.reduce((sum, t) => sum + Number(t.sessions || 0), 0)

  const visitors = funnel.find(f => f.stage === 'visitor')?.count || 0
  const customers = funnel.find(f => f.stage === 'customer')?.count || 0

  return {
    total_revenue: totalRevenue,
    total_transactions: totalTransactions,
    average_order_value: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    total_visitors: totalVisitors,
    total_sessions: totalSessions,
    conversion_rate: visitors > 0 ? (customers / visitors) * 100 : 0,
    active_insights: insightsResult.count || 0
  }
}

export async function getROI(userId: string, dateRange: DateRange) {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = getStartDateFromRange(dateRange)

  const [revenue, traffic] = await Promise.all([
    getTotalRevenue(userId, startDate, endDate),
    getTrafficSources(userId, startDate, endDate)
  ])

  // Estimate cost (simplified calculation)
  const totalCost = traffic
    .filter(t => t.source === 'paid')
    .reduce((sum, t) => sum + Number(t.revenue || 0) * 0.3, 0) // 30% of revenue as cost estimate

  return totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0
}

export async function getLifetimeValue(userId: string) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const startDate = oneYearAgo.toISOString().split('T')[0]
  const endDate = new Date().toISOString().split('T')[0]

  const [revenue, funnel] = await Promise.all([
    getTotalRevenue(userId, startDate, endDate),
    getConversionFunnel(userId, startDate, endDate)
  ])

  const customers = funnel.find(f => f.stage === 'customer')?.count || 0

  return customers > 0 ? revenue / customers : 0
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStartDateFromRange(dateRange: DateRange): string {
  const now = new Date()

  switch (dateRange) {
    case '7d':
      now.setDate(now.getDate() - 7)
      break
    case '30d':
      now.setDate(now.getDate() - 30)
      break
    case '90d':
      now.setDate(now.getDate() - 90)
      break
    case '365d':
      now.setFullYear(now.getFullYear() - 1)
      break
    default:
      now.setDate(now.getDate() - 30)
  }

  return now.toISOString().split('T')[0]
}
