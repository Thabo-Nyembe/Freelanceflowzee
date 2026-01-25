/**
 * KAZI Email Analytics API
 *
 * Endpoints for email marketing analytics and reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emailAnalyticsService } from '@/lib/email/email-analytics-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('email-analytics')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const granularity = searchParams.get('granularity') as any || 'day'
    const campaignId = searchParams.get('campaignId')

    // Default to last 30 days if not specified
    const dateRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date()
    }

    switch (type) {
      case 'overview': {
        const metrics = await emailAnalyticsService.getOverviewMetrics(user.id, dateRange)
        return NextResponse.json({ metrics })
      }

      case 'timeseries': {
        const data = await emailAnalyticsService.getTimeSeriesData(user.id, dateRange, granularity)
        return NextResponse.json({ data })
      }

      case 'campaigns': {
        const limit = parseInt(searchParams.get('limit') || '50')
        const orderBy = searchParams.get('orderBy') as any || 'date'
        const order = searchParams.get('order') as any || 'desc'

        const campaigns = await emailAnalyticsService.getCampaignPerformance(user.id, {
          dateRange,
          limit,
          orderBy,
          order
        })
        return NextResponse.json({ campaigns })
      }

      case 'campaign_details': {
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        const details = await emailAnalyticsService.getCampaignDetails(campaignId)
        return NextResponse.json(details)
      }

      case 'links': {
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        const links = await emailAnalyticsService.getLinkPerformance(campaignId)
        return NextResponse.json({ links })
      }

      case 'devices': {
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        const devices = await emailAnalyticsService.getDeviceBreakdown(campaignId)
        return NextResponse.json({ devices })
      }

      case 'geo': {
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        const geo = await emailAnalyticsService.getGeoDistribution(campaignId)
        return NextResponse.json({ geo })
      }

      case 'hourly': {
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        const hourly = await emailAnalyticsService.getHourlyActivity(campaignId)
        return NextResponse.json({ hourly })
      }

      case 'subscribers': {
        const metrics = await emailAnalyticsService.getSubscriberMetrics(user.id, dateRange)
        return NextResponse.json({ metrics })
      }

      case 'cohorts': {
        const cohorts = await emailAnalyticsService.getEngagementCohorts(user.id)
        return NextResponse.json({ cohorts })
      }

      case 'deliverability': {
        const metrics = await emailAnalyticsService.getDeliverabilityMetrics(user.id)
        return NextResponse.json({ metrics })
      }

      case 'automations': {
        const automations = await emailAnalyticsService.getAutomationPerformance(user.id, dateRange)
        return NextResponse.json({ automations })
      }

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch analytics', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'generate_report': {
        const report = await emailAnalyticsService.generateReport(user.id, {
          name: data.name || 'Custom Report',
          type: data.type || 'overview',
          dateRange: {
            start: new Date(data.startDate),
            end: new Date(data.endDate)
          },
          granularity: data.granularity || 'day',
          metrics: data.metrics || ['sent', 'delivered', 'opened', 'clicked'],
          filters: data.filters,
          segments: data.segments,
          compareWith: data.compareWith ? {
            start: new Date(data.compareWith.startDate),
            end: new Date(data.compareWith.endDate)
          } : undefined
        })
        return NextResponse.json({ report })
      }

      case 'get_report_history': {
        const reports = await emailAnalyticsService.getReportHistory(user.id, {
          limit: data.limit || 10,
          type: data.type
        })
        return NextResponse.json({ reports })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Analytics action failed', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analytics action failed' },
      { status: 500 }
    )
  }
}
