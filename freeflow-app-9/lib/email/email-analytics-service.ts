/**
 * KAZI Email Analytics Service
 *
 * Production-grade analytics aggregation for email marketing.
 * Handles real-time dashboards, trend analysis, cohort analysis,
 * deliverability monitoring, and comprehensive reporting.
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
export type MetricType =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed'
  | 'converted'

export interface DateRange {
  start: Date
  end: Date
}

export interface OverviewMetrics {
  // Totals
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalComplained: number
  totalUnsubscribed: number
  totalConverted: number

  // Rates
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  complaintRate: number
  unsubscribeRate: number
  conversionRate: number

  // Trends (vs previous period)
  deliveryRateTrend: number
  openRateTrend: number
  clickRateTrend: number
  bounceRateTrend: number

  // Engagement score (0-100)
  engagementScore: number
  deliverabilityScore: number
  listHealthScore: number
}

export interface TimeSeriesData {
  timestamp: Date
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
}

export interface CampaignPerformance {
  campaignId: string
  campaignName: string
  sentAt: Date
  recipients: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  revenue?: number
}

export interface SubscriberMetrics {
  totalSubscribers: number
  activeSubscribers: number
  newSubscribers: number
  unsubscribed: number
  bounced: number
  complained: number
  growth: number
  churnRate: number
  avgEngagementScore: number
}

export interface EngagementCohort {
  cohortName: string
  description: string
  count: number
  percentage: number
  avgOpens: number
  avgClicks: number
  lastEngaged?: Date
}

export interface DeliverabilityMetrics {
  overallScore: number
  inboxPlacement: number
  spamPlacement: number
  bounceRate: number
  complaintRate: number
  domainReputation: DomainReputationMetrics[]
  providerStats: ProviderDeliverabilityStats[]
  issues: DeliverabilityIssue[]
}

export interface DomainReputationMetrics {
  domain: string
  score: number
  trend: 'improving' | 'stable' | 'declining'
  deliveryRate: number
  bounceRate: number
  complaintRate: number
  volume: number
}

export interface ProviderDeliverabilityStats {
  provider: string
  deliveryRate: number
  openRate: number
  bounceRate: number
  complaintRate: number
  avgDeliveryTime: number
  volume: number
}

export interface DeliverabilityIssue {
  severity: 'critical' | 'warning' | 'info'
  type: string
  description: string
  affectedCount: number
  recommendation: string
}

export interface LinkPerformance {
  linkUrl: string
  linkText?: string
  clicks: number
  uniqueClicks: number
  clickRate: number
  firstClicked: Date
  lastClicked: Date
}

export interface DeviceBreakdown {
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  opens: number
  clicks: number
  percentage: number
}

export interface GeoDistribution {
  country: string
  countryCode: string
  opens: number
  clicks: number
  subscribers: number
  engagement: number
}

export interface HourlyHeatmap {
  hour: number
  day: number // 0-6 (Sunday-Saturday)
  opens: number
  clicks: number
  sent: number
  engagement: number
}

export interface AutomationPerformance {
  automationId: string
  automationName: string
  status: string
  totalEntered: number
  currentlyActive: number
  completed: number
  emailsSent: number
  openRate: number
  clickRate: number
  conversionRate: number
  revenue: number
}

export interface ListPerformance {
  listId: string
  listName: string
  subscribers: number
  growth: number
  avgOpenRate: number
  avgClickRate: number
  engagementScore: number
  lastCampaignAt?: Date
}

export interface ReportConfig {
  name: string
  type: 'overview' | 'campaign' | 'automation' | 'subscriber' | 'deliverability' | 'custom'
  dateRange: DateRange
  granularity: TimeGranularity
  metrics: MetricType[]
  filters?: ReportFilters
  segments?: string[]
  compareWith?: DateRange
}

export interface ReportFilters {
  campaignIds?: string[]
  automationIds?: string[]
  listIds?: string[]
  tagIds?: string[]
  subscriberStatus?: string[]
  eventTypes?: string[]
}

export interface GeneratedReport {
  id: string
  config: ReportConfig
  generatedAt: Date
  data: any
  summary: ReportSummary
  insights: ReportInsight[]
}

export interface ReportSummary {
  headline: string
  keyMetrics: { name: string; value: number; change: number; trend: 'up' | 'down' | 'stable' }[]
  period: string
}

export interface ReportInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
  metric?: string
  recommendation?: string
}

// ============================================================================
// Email Analytics Service
// ============================================================================

export class EmailAnalyticsService {
  private supabase = createClient()

  // --------------------------------------------------------------------------
  // Overview Metrics
  // --------------------------------------------------------------------------

  async getOverviewMetrics(
    userId: string,
    dateRange: DateRange
  ): Promise<OverviewMetrics> {
    // Get current period metrics
    const currentMetrics = await this.getMetricsForPeriod(userId, dateRange)

    // Get previous period for comparison
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime()
    const previousRange: DateRange = {
      start: new Date(dateRange.start.getTime() - periodLength),
      end: new Date(dateRange.start.getTime())
    }
    const previousMetrics = await this.getMetricsForPeriod(userId, previousRange)

    // Calculate rates
    const sent = currentMetrics.sent || 1
    const delivered = currentMetrics.delivered || sent
    const opened = currentMetrics.opened
    const clicked = currentMetrics.clicked

    const deliveryRate = (delivered / sent) * 100
    const openRate = (opened / delivered) * 100
    const clickRate = (clicked / delivered) * 100
    const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0
    const bounceRate = (currentMetrics.bounced / sent) * 100
    const complaintRate = (currentMetrics.complained / delivered) * 100
    const unsubscribeRate = (currentMetrics.unsubscribed / delivered) * 100
    const conversionRate = (currentMetrics.converted / delivered) * 100

    // Calculate trends
    const prevDelivered = previousMetrics.delivered || previousMetrics.sent || 1
    const prevDeliveryRate = (previousMetrics.delivered / (previousMetrics.sent || 1)) * 100
    const prevOpenRate = (previousMetrics.opened / prevDelivered) * 100
    const prevClickRate = (previousMetrics.clicked / prevDelivered) * 100
    const prevBounceRate = (previousMetrics.bounced / (previousMetrics.sent || 1)) * 100

    // Calculate scores
    const engagementScore = this.calculateEngagementScore(openRate, clickRate, clickToOpenRate)
    const deliverabilityScore = this.calculateDeliverabilityScore(deliveryRate, bounceRate, complaintRate)
    const listHealthScore = await this.calculateListHealthScore(userId)

    return {
      totalSent: currentMetrics.sent,
      totalDelivered: currentMetrics.delivered,
      totalOpened: currentMetrics.opened,
      totalClicked: currentMetrics.clicked,
      totalBounced: currentMetrics.bounced,
      totalComplained: currentMetrics.complained,
      totalUnsubscribed: currentMetrics.unsubscribed,
      totalConverted: currentMetrics.converted,
      deliveryRate,
      openRate,
      clickRate,
      clickToOpenRate,
      bounceRate,
      complaintRate,
      unsubscribeRate,
      conversionRate,
      deliveryRateTrend: deliveryRate - prevDeliveryRate,
      openRateTrend: openRate - prevOpenRate,
      clickRateTrend: clickRate - prevClickRate,
      bounceRateTrend: bounceRate - prevBounceRate,
      engagementScore,
      deliverabilityScore,
      listHealthScore
    }
  }

  private async getMetricsForPeriod(
    userId: string,
    dateRange: DateRange
  ): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('event_type')
      .eq('user_id', userId)
      .gte('timestamp', dateRange.start.toISOString())
      .lte('timestamp', dateRange.end.toISOString())

    if (error) throw new Error(error.message)

    const counts: Record<string, number> = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      converted: 0
    }

    for (const event of data || []) {
      if (event.event_type in counts) {
        counts[event.event_type]++
      }
    }

    return counts
  }

  private calculateEngagementScore(openRate: number, clickRate: number, ctor: number): number {
    // Weighted score based on industry benchmarks
    const openScore = Math.min(openRate / 25, 1) * 40 // 25% open rate = max score
    const clickScore = Math.min(clickRate / 5, 1) * 35  // 5% click rate = max score
    const ctorScore = Math.min(ctor / 15, 1) * 25       // 15% CTOR = max score
    return Math.round(openScore + clickScore + ctorScore)
  }

  private calculateDeliverabilityScore(deliveryRate: number, bounceRate: number, complaintRate: number): number {
    // Deductions from 100
    let score = 100
    score -= Math.max(0, (100 - deliveryRate) * 2) // -2 points per % below 100
    score -= bounceRate * 5                         // -5 points per % bounce
    score -= complaintRate * 50                     // -50 points per % complaint
    return Math.max(0, Math.round(score))
  }

  private async calculateListHealthScore(userId: string): Promise<number> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('status, last_engaged_at')
      .eq('user_id', userId)

    if (!subscribers?.length) return 100

    const total = subscribers.length
    const active = subscribers.filter(s => s.status === 'active').length
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentlyEngaged = subscribers.filter(s =>
      s.last_engaged_at && new Date(s.last_engaged_at) > thirtyDaysAgo
    ).length

    const activeRate = (active / total) * 100
    const engagedRate = (recentlyEngaged / total) * 100

    return Math.round((activeRate * 0.4 + engagedRate * 0.6))
  }

  // --------------------------------------------------------------------------
  // Time Series Data
  // --------------------------------------------------------------------------

  async getTimeSeriesData(
    userId: string,
    dateRange: DateRange,
    granularity: TimeGranularity = 'day'
  ): Promise<TimeSeriesData[]> {
    const { data, error } = await this.supabase
      .from('email_daily_aggregates')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw new Error(error.message)

    // Aggregate based on granularity
    const aggregated = this.aggregateByGranularity(data || [], granularity)
    return aggregated
  }

  private aggregateByGranularity(
    data: any[],
    granularity: TimeGranularity
  ): TimeSeriesData[] {
    if (granularity === 'day') {
      return data.map(row => ({
        timestamp: new Date(row.date),
        sent: row.sent || 0,
        delivered: row.delivered || 0,
        opened: row.opened || 0,
        clicked: row.clicked || 0,
        bounced: row.bounced || 0,
        complained: row.complained || 0,
        unsubscribed: row.unsubscribed || 0
      }))
    }

    // Group by week/month/etc
    const groups = new Map<string, TimeSeriesData>()

    for (const row of data) {
      const date = new Date(row.date)
      const key = this.getGroupKey(date, granularity)

      if (!groups.has(key)) {
        groups.set(key, {
          timestamp: this.getGroupStartDate(date, granularity),
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          complained: 0,
          unsubscribed: 0
        })
      }

      const group = groups.get(key)!
      group.sent += row.sent || 0
      group.delivered += row.delivered || 0
      group.opened += row.opened || 0
      group.clicked += row.clicked || 0
      group.bounced += row.bounced || 0
      group.complained += row.complained || 0
      group.unsubscribed += row.unsubscribed || 0
    }

    return Array.from(groups.values()).sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    )
  }

  private getGroupKey(date: Date, granularity: TimeGranularity): string {
    const year = date.getFullYear()
    const month = date.getMonth()
    const week = this.getWeekNumber(date)

    switch (granularity) {
      case 'hour':
        return `${date.toISOString().slice(0, 13)}`
      case 'week':
        return `${year}-W${week}`
      case 'month':
        return `${year}-${String(month + 1).padStart(2, '0')}`
      case 'quarter':
        return `${year}-Q${Math.floor(month / 3) + 1}`
      case 'year':
        return `${year}`
      default:
        return date.toISOString().slice(0, 10)
    }
  }

  private getGroupStartDate(date: Date, granularity: TimeGranularity): Date {
    const result = new Date(date)

    switch (granularity) {
      case 'week':
        const day = result.getDay()
        result.setDate(result.getDate() - day)
        break
      case 'month':
        result.setDate(1)
        break
      case 'quarter':
        result.setMonth(Math.floor(result.getMonth() / 3) * 3, 1)
        break
      case 'year':
        result.setMonth(0, 1)
        break
    }

    result.setHours(0, 0, 0, 0)
    return result
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // --------------------------------------------------------------------------
  // Campaign Performance
  // --------------------------------------------------------------------------

  async getCampaignPerformance(
    userId: string,
    options: {
      dateRange?: DateRange
      limit?: number
      orderBy?: 'date' | 'openRate' | 'clickRate' | 'recipients'
      order?: 'asc' | 'desc'
    } = {}
  ): Promise<CampaignPerformance[]> {
    let query = this.supabase
      .from('email_campaigns')
      .select('id, name, status, stats, completed_at, started_at')
      .eq('user_id', userId)
      .in('status', ['sent', 'sending'])

    if (options.dateRange) {
      query = query
        .gte('started_at', options.dateRange.start.toISOString())
        .lte('started_at', options.dateRange.end.toISOString())
    }

    const orderField = options.orderBy === 'date' ? 'started_at' : 'stats->>' + options.orderBy
    query = query.order(orderField, { ascending: options.order === 'asc' })

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return (data || []).map(campaign => {
      const stats = campaign.stats || {}
      const delivered = stats.delivered || stats.sent || 1

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        sentAt: new Date(campaign.started_at || campaign.completed_at),
        recipients: stats.totalRecipients || 0,
        delivered: stats.delivered || 0,
        opened: stats.uniqueOpened || stats.opened || 0,
        clicked: stats.uniqueClicked || stats.clicked || 0,
        bounced: stats.bounced || 0,
        unsubscribed: stats.unsubscribed || 0,
        deliveryRate: stats.deliveryRate || ((stats.delivered / (stats.sent || 1)) * 100),
        openRate: stats.openRate || ((stats.opened / delivered) * 100),
        clickRate: stats.clickRate || ((stats.clicked / delivered) * 100),
        bounceRate: stats.bounceRate || ((stats.bounced / (stats.sent || 1)) * 100),
        revenue: stats.conversionValue
      }
    })
  }

  async getCampaignDetails(campaignId: string): Promise<{
    performance: CampaignPerformance
    links: LinkPerformance[]
    devices: DeviceBreakdown[]
    geo: GeoDistribution[]
    hourlyActivity: HourlyHeatmap[]
  }> {
    // Get campaign performance
    const { data: campaign } = await this.supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (!campaign) throw new Error('Campaign not found')

    const stats = campaign.stats || {}
    const delivered = stats.delivered || stats.sent || 1

    const performance: CampaignPerformance = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      sentAt: new Date(campaign.started_at || campaign.completed_at),
      recipients: stats.totalRecipients || 0,
      delivered: stats.delivered || 0,
      opened: stats.uniqueOpened || 0,
      clicked: stats.uniqueClicked || 0,
      bounced: stats.bounced || 0,
      unsubscribed: stats.unsubscribed || 0,
      deliveryRate: (stats.delivered / (stats.sent || 1)) * 100,
      openRate: (stats.opened / delivered) * 100,
      clickRate: (stats.clicked / delivered) * 100,
      bounceRate: (stats.bounced / (stats.sent || 1)) * 100
    }

    // Get link performance
    const links = await this.getLinkPerformance(campaignId)

    // Get device breakdown
    const devices = await this.getDeviceBreakdown(campaignId)

    // Get geo distribution
    const geo = await this.getGeoDistribution(campaignId)

    // Get hourly activity
    const hourlyActivity = await this.getHourlyActivity(campaignId)

    return { performance, links, devices, geo, hourlyActivity }
  }

  async getLinkPerformance(campaignId: string): Promise<LinkPerformance[]> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('metadata, subscriber_id, timestamp')
      .eq('campaign_id', campaignId)
      .eq('event_type', 'clicked')

    if (error) throw new Error(error.message)

    const linkMap = new Map<string, {
      url: string
      text?: string
      clicks: number
      uniqueClicks: Set<string>
      firstClicked: Date
      lastClicked: Date
    }>()

    for (const event of data || []) {
      const url = event.metadata?.linkUrl
      if (!url) continue

      if (!linkMap.has(url)) {
        linkMap.set(url, {
          url,
          text: event.metadata?.linkText,
          clicks: 0,
          uniqueClicks: new Set(),
          firstClicked: new Date(event.timestamp),
          lastClicked: new Date(event.timestamp)
        })
      }

      const link = linkMap.get(url)!
      link.clicks++
      link.uniqueClicks.add(event.subscriber_id)
      if (new Date(event.timestamp) < link.firstClicked) {
        link.firstClicked = new Date(event.timestamp)
      }
      if (new Date(event.timestamp) > link.lastClicked) {
        link.lastClicked = new Date(event.timestamp)
      }
    }

    const totalClicks = Array.from(linkMap.values()).reduce((sum, l) => sum + l.clicks, 0)

    return Array.from(linkMap.values())
      .map(link => ({
        linkUrl: link.url,
        linkText: link.text,
        clicks: link.clicks,
        uniqueClicks: link.uniqueClicks.size,
        clickRate: totalClicks > 0 ? (link.clicks / totalClicks) * 100 : 0,
        firstClicked: link.firstClicked,
        lastClicked: link.lastClicked
      }))
      .sort((a, b) => b.clicks - a.clicks)
  }

  async getDeviceBreakdown(campaignId: string): Promise<DeviceBreakdown[]> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('device_info, event_type')
      .eq('campaign_id', campaignId)
      .in('event_type', ['opened', 'clicked'])

    if (error) throw new Error(error.message)

    const deviceMap: Record<string, { opens: number; clicks: number }> = {
      desktop: { opens: 0, clicks: 0 },
      mobile: { opens: 0, clicks: 0 },
      tablet: { opens: 0, clicks: 0 },
      unknown: { opens: 0, clicks: 0 }
    }

    for (const event of data || []) {
      const device = event.device_info?.type || 'unknown'
      if (event.event_type === 'opened') {
        deviceMap[device].opens++
      } else {
        deviceMap[device].clicks++
      }
    }

    const totalOpens = Object.values(deviceMap).reduce((sum, d) => sum + d.opens, 0)

    return Object.entries(deviceMap).map(([device, counts]) => ({
      device: device as DeviceBreakdown['device'],
      opens: counts.opens,
      clicks: counts.clicks,
      percentage: totalOpens > 0 ? (counts.opens / totalOpens) * 100 : 0
    }))
  }

  async getGeoDistribution(campaignId: string): Promise<GeoDistribution[]> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('geo_location, event_type, subscriber_id')
      .eq('campaign_id', campaignId)
      .in('event_type', ['opened', 'clicked'])

    if (error) throw new Error(error.message)

    const geoMap = new Map<string, {
      country: string
      countryCode: string
      opens: number
      clicks: number
      subscribers: Set<string>
    }>()

    for (const event of data || []) {
      const country = event.geo_location?.country || 'Unknown'
      const countryCode = event.geo_location?.countryCode || 'XX'

      if (!geoMap.has(country)) {
        geoMap.set(country, {
          country,
          countryCode,
          opens: 0,
          clicks: 0,
          subscribers: new Set()
        })
      }

      const geo = geoMap.get(country)!
      geo.subscribers.add(event.subscriber_id)
      if (event.event_type === 'opened') {
        geo.opens++
      } else {
        geo.clicks++
      }
    }

    const totalEngagement = Array.from(geoMap.values())
      .reduce((sum, g) => sum + g.opens + g.clicks, 0)

    return Array.from(geoMap.values())
      .map(geo => ({
        country: geo.country,
        countryCode: geo.countryCode,
        opens: geo.opens,
        clicks: geo.clicks,
        subscribers: geo.subscribers.size,
        engagement: totalEngagement > 0 ? ((geo.opens + geo.clicks) / totalEngagement) * 100 : 0
      }))
      .sort((a, b) => b.subscribers - a.subscribers)
  }

  async getHourlyActivity(campaignId: string): Promise<HourlyHeatmap[]> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('timestamp, event_type')
      .eq('campaign_id', campaignId)
      .in('event_type', ['sent', 'opened', 'clicked'])

    if (error) throw new Error(error.message)

    const heatmap: Record<string, HourlyHeatmap> = {}

    // Initialize all hour/day combinations
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`
        heatmap[key] = { hour, day, opens: 0, clicks: 0, sent: 0, engagement: 0 }
      }
    }

    for (const event of data || []) {
      const date = new Date(event.timestamp)
      const key = `${date.getDay()}-${date.getHours()}`

      if (event.event_type === 'sent') {
        heatmap[key].sent++
      } else if (event.event_type === 'opened') {
        heatmap[key].opens++
      } else {
        heatmap[key].clicks++
      }
    }

    // Calculate engagement scores
    const maxEngagement = Math.max(...Object.values(heatmap).map(h => h.opens + h.clicks))
    for (const h of Object.values(heatmap)) {
      h.engagement = maxEngagement > 0 ? ((h.opens + h.clicks) / maxEngagement) * 100 : 0
    }

    return Object.values(heatmap)
  }

  // --------------------------------------------------------------------------
  // Subscriber Analytics
  // --------------------------------------------------------------------------

  async getSubscriberMetrics(
    userId: string,
    dateRange: DateRange
  ): Promise<SubscriberMetrics> {
    // Get current subscriber counts
    const { data: currentSubscribers, error } = await this.supabase
      .from('email_subscribers')
      .select('status, created_at, engagement_score')
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    const total = currentSubscribers?.length || 0
    const active = currentSubscribers?.filter(s => s.status === 'active').length || 0
    const bounced = currentSubscribers?.filter(s => s.status === 'bounced').length || 0
    const complained = currentSubscribers?.filter(s => s.status === 'complained').length || 0
    const unsubscribed = currentSubscribers?.filter(s => s.status === 'unsubscribed').length || 0

    // Get new subscribers in period
    const newInPeriod = currentSubscribers?.filter(s =>
      new Date(s.created_at) >= dateRange.start && new Date(s.created_at) <= dateRange.end
    ).length || 0

    // Get previous period for growth calculation
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime()
    const previousStart = new Date(dateRange.start.getTime() - periodLength)

    const { count: previousTotal } = await this.supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('created_at', dateRange.start.toISOString())

    const growth = previousTotal ? ((total - (previousTotal || 0)) / (previousTotal || 1)) * 100 : 100

    // Calculate average engagement score
    const avgEngagement = currentSubscribers?.length
      ? currentSubscribers.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / currentSubscribers.length
      : 0

    // Calculate churn rate
    const lostInPeriod = currentSubscribers?.filter(s =>
      s.status !== 'active' &&
      new Date(s.created_at) >= dateRange.start &&
      new Date(s.created_at) <= dateRange.end
    ).length || 0
    const churnRate = total > 0 ? (lostInPeriod / total) * 100 : 0

    return {
      totalSubscribers: total,
      activeSubscribers: active,
      newSubscribers: newInPeriod,
      unsubscribed,
      bounced,
      complained,
      growth,
      churnRate,
      avgEngagementScore: avgEngagement
    }
  }

  async getEngagementCohorts(userId: string): Promise<EngagementCohort[]> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('id, status, last_engaged_at, engagement_score')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (!subscribers?.length) return []

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const cohorts = {
      highly_engaged: { count: 0, avgScore: 0, scores: [] as number[] },
      engaged: { count: 0, avgScore: 0, scores: [] as number[] },
      moderately_engaged: { count: 0, avgScore: 0, scores: [] as number[] },
      at_risk: { count: 0, avgScore: 0, scores: [] as number[] },
      inactive: { count: 0, avgScore: 0, scores: [] as number[] }
    }

    for (const sub of subscribers) {
      const lastEngaged = sub.last_engaged_at ? new Date(sub.last_engaged_at) : null
      const score = sub.engagement_score || 0

      if (score >= 80 && lastEngaged && lastEngaged > thirtyDaysAgo) {
        cohorts.highly_engaged.count++
        cohorts.highly_engaged.scores.push(score)
      } else if (score >= 50 && lastEngaged && lastEngaged > thirtyDaysAgo) {
        cohorts.engaged.count++
        cohorts.engaged.scores.push(score)
      } else if (lastEngaged && lastEngaged > sixtyDaysAgo) {
        cohorts.moderately_engaged.count++
        cohorts.moderately_engaged.scores.push(score)
      } else if (lastEngaged && lastEngaged > ninetyDaysAgo) {
        cohorts.at_risk.count++
        cohorts.at_risk.scores.push(score)
      } else {
        cohorts.inactive.count++
        cohorts.inactive.scores.push(score)
      }
    }

    const total = subscribers.length

    return [
      {
        cohortName: 'Highly Engaged',
        description: 'Score 80+ and active in last 30 days',
        count: cohorts.highly_engaged.count,
        percentage: (cohorts.highly_engaged.count / total) * 100,
        avgOpens: 0, // Would need event data
        avgClicks: 0
      },
      {
        cohortName: 'Engaged',
        description: 'Score 50-79 and active in last 30 days',
        count: cohorts.engaged.count,
        percentage: (cohorts.engaged.count / total) * 100,
        avgOpens: 0,
        avgClicks: 0
      },
      {
        cohortName: 'Moderately Engaged',
        description: 'Active in last 31-60 days',
        count: cohorts.moderately_engaged.count,
        percentage: (cohorts.moderately_engaged.count / total) * 100,
        avgOpens: 0,
        avgClicks: 0
      },
      {
        cohortName: 'At Risk',
        description: 'Active in last 61-90 days',
        count: cohorts.at_risk.count,
        percentage: (cohorts.at_risk.count / total) * 100,
        avgOpens: 0,
        avgClicks: 0
      },
      {
        cohortName: 'Inactive',
        description: 'No activity in 90+ days',
        count: cohorts.inactive.count,
        percentage: (cohorts.inactive.count / total) * 100,
        avgOpens: 0,
        avgClicks: 0
      }
    ]
  }

  // --------------------------------------------------------------------------
  // Deliverability Analytics
  // --------------------------------------------------------------------------

  async getDeliverabilityMetrics(userId: string): Promise<DeliverabilityMetrics> {
    // Get recent events for deliverability analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: events } = await this.supabase
      .from('email_events')
      .select('event_type, metadata, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .in('event_type', ['sent', 'delivered', 'bounced', 'complained', 'dropped'])

    const counts = {
      sent: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      dropped: 0
    }

    const providerCounts = new Map<string, typeof counts>()
    const domainCounts = new Map<string, typeof counts>()

    for (const event of events || []) {
      const type = event.event_type as keyof typeof counts
      counts[type]++

      // Track by provider
      const provider = event.metadata?.provider || 'unknown'
      if (!providerCounts.has(provider)) {
        providerCounts.set(provider, { sent: 0, delivered: 0, bounced: 0, complained: 0, dropped: 0 })
      }
      providerCounts.get(provider)![type]++

      // Track by domain (would need subscriber email)
    }

    const sent = counts.sent || 1
    const delivered = counts.delivered
    const bounceRate = (counts.bounced / sent) * 100
    const complaintRate = (counts.complained / delivered || sent) * 100

    // Calculate overall score
    let overallScore = 100
    overallScore -= Math.min(50, bounceRate * 5)
    overallScore -= Math.min(30, complaintRate * 30)
    overallScore = Math.max(0, overallScore)

    // Generate issues
    const issues: DeliverabilityIssue[] = []

    if (bounceRate > 5) {
      issues.push({
        severity: bounceRate > 10 ? 'critical' : 'warning',
        type: 'high_bounce_rate',
        description: `Bounce rate of ${bounceRate.toFixed(1)}% is above recommended threshold`,
        affectedCount: counts.bounced,
        recommendation: 'Clean your list by removing invalid addresses and implement double opt-in'
      })
    }

    if (complaintRate > 0.1) {
      issues.push({
        severity: complaintRate > 0.3 ? 'critical' : 'warning',
        type: 'high_complaint_rate',
        description: `Complaint rate of ${complaintRate.toFixed(2)}% may affect deliverability`,
        affectedCount: counts.complained,
        recommendation: 'Review your email content and ensure subscribers have explicitly opted in'
      })
    }

    // Provider stats
    const providerStats: ProviderDeliverabilityStats[] = Array.from(providerCounts.entries())
      .map(([provider, c]) => ({
        provider,
        deliveryRate: c.sent > 0 ? (c.delivered / c.sent) * 100 : 0,
        openRate: 0, // Would need open data
        bounceRate: c.sent > 0 ? (c.bounced / c.sent) * 100 : 0,
        complaintRate: c.delivered > 0 ? (c.complained / c.delivered) * 100 : 0,
        avgDeliveryTime: 0, // Would need timing data
        volume: c.sent
      }))

    return {
      overallScore,
      inboxPlacement: overallScore, // Simplified
      spamPlacement: 100 - overallScore,
      bounceRate,
      complaintRate,
      domainReputation: [], // Would need domain-level tracking
      providerStats,
      issues
    }
  }

  // --------------------------------------------------------------------------
  // Automation Analytics
  // --------------------------------------------------------------------------

  async getAutomationPerformance(
    userId: string,
    dateRange?: DateRange
  ): Promise<AutomationPerformance[]> {
    let query = this.supabase
      .from('email_automations')
      .select('id, name, status, stats')
      .eq('user_id', userId)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return (data || []).map(auto => {
      const stats = auto.stats || {}
      return {
        automationId: auto.id,
        automationName: auto.name,
        status: auto.status,
        totalEntered: stats.totalEntered || 0,
        currentlyActive: stats.currentlyActive || 0,
        completed: stats.completed || 0,
        emailsSent: stats.emailsSent || 0,
        openRate: stats.uniqueOpens > 0 ? (stats.uniqueOpens / stats.emailsSent) * 100 : 0,
        clickRate: stats.uniqueClicks > 0 ? (stats.uniqueClicks / stats.emailsSent) * 100 : 0,
        conversionRate: stats.conversionRate || 0,
        revenue: stats.revenue || 0
      }
    })
  }

  // --------------------------------------------------------------------------
  // Report Generation
  // --------------------------------------------------------------------------

  async generateReport(userId: string, config: ReportConfig): Promise<GeneratedReport> {
    const report: GeneratedReport = {
      id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      generatedAt: new Date(),
      data: {},
      summary: {
        headline: '',
        keyMetrics: [],
        period: `${config.dateRange.start.toLocaleDateString()} - ${config.dateRange.end.toLocaleDateString()}`
      },
      insights: []
    }

    switch (config.type) {
      case 'overview':
        report.data = {
          metrics: await this.getOverviewMetrics(userId, config.dateRange),
          timeSeries: await this.getTimeSeriesData(userId, config.dateRange, config.granularity),
          topCampaigns: await this.getCampaignPerformance(userId, { dateRange: config.dateRange, limit: 5 })
        }
        break

      case 'campaign':
        report.data = {
          campaigns: await this.getCampaignPerformance(userId, { dateRange: config.dateRange })
        }
        break

      case 'automation':
        report.data = {
          automations: await this.getAutomationPerformance(userId, config.dateRange)
        }
        break

      case 'subscriber':
        report.data = {
          metrics: await this.getSubscriberMetrics(userId, config.dateRange),
          cohorts: await this.getEngagementCohorts(userId)
        }
        break

      case 'deliverability':
        report.data = {
          metrics: await this.getDeliverabilityMetrics(userId)
        }
        break
    }

    // Generate summary and insights
    this.generateReportSummary(report)
    this.generateReportInsights(report)

    // Save report
    await this.supabase
      .from('email_reports')
      .insert({
        id: report.id,
        user_id: userId,
        config,
        data: report.data,
        summary: report.summary,
        insights: report.insights,
        generated_at: report.generatedAt.toISOString()
      })

    return report
  }

  private generateReportSummary(report: GeneratedReport): void {
    if (report.config.type === 'overview' && report.data.metrics) {
      const m = report.data.metrics as OverviewMetrics
      report.summary.headline = `${m.totalSent.toLocaleString()} emails sent with ${m.openRate.toFixed(1)}% open rate`
      report.summary.keyMetrics = [
        { name: 'Emails Sent', value: m.totalSent, change: 0, trend: 'stable' },
        { name: 'Open Rate', value: m.openRate, change: m.openRateTrend, trend: m.openRateTrend > 0 ? 'up' : m.openRateTrend < 0 ? 'down' : 'stable' },
        { name: 'Click Rate', value: m.clickRate, change: m.clickRateTrend, trend: m.clickRateTrend > 0 ? 'up' : m.clickRateTrend < 0 ? 'down' : 'stable' },
        { name: 'Bounce Rate', value: m.bounceRate, change: m.bounceRateTrend, trend: m.bounceRateTrend < 0 ? 'up' : m.bounceRateTrend > 0 ? 'down' : 'stable' }
      ]
    }
  }

  private generateReportInsights(report: GeneratedReport): void {
    if (report.config.type === 'overview' && report.data.metrics) {
      const m = report.data.metrics as OverviewMetrics

      if (m.openRateTrend > 5) {
        report.insights.push({
          type: 'positive',
          title: 'Open Rate Improving',
          description: `Your open rate increased by ${m.openRateTrend.toFixed(1)}% compared to the previous period`,
          metric: 'open_rate'
        })
      }

      if (m.bounceRate > 5) {
        report.insights.push({
          type: 'negative',
          title: 'High Bounce Rate',
          description: `Your bounce rate of ${m.bounceRate.toFixed(1)}% is above the recommended 2%`,
          metric: 'bounce_rate',
          recommendation: 'Consider cleaning your list and implementing email verification'
        })
      }

      if (m.engagementScore < 50) {
        report.insights.push({
          type: 'negative',
          title: 'Low Engagement Score',
          description: `Your engagement score of ${m.engagementScore} indicates room for improvement`,
          metric: 'engagement_score',
          recommendation: 'Try segmenting your audience and personalizing content'
        })
      }
    }
  }

  async getReportHistory(
    userId: string,
    options: { limit?: number; type?: ReportConfig['type'] } = {}
  ): Promise<GeneratedReport[]> {
    let query = this.supabase
      .from('email_reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })

    if (options.type) {
      query = query.eq('config->type', options.type)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return (data || []).map(row => ({
      id: row.id,
      config: row.config,
      generatedAt: new Date(row.generated_at),
      data: row.data,
      summary: row.summary,
      insights: row.insights
    }))
  }
}

// ============================================================================
// Exports
// ============================================================================

export const emailAnalyticsService = new EmailAnalyticsService()
