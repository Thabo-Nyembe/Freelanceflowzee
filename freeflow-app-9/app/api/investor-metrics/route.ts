/**
 * Investor Metrics API Routes
 *
 * REST endpoints for Investor Metrics:
 * GET - List metrics, health snapshots, cohorts, projections, competitors, board decks, trends, stats
 * POST - Create metric, health snapshot, cohort, projection, competitor, board deck
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('investor-metrics')
import {
  getInvestorMetrics,
  getLatestInvestorMetric,
  createInvestorMetric,
  getHealthSnapshots,
  getLatestHealthSnapshot,
  createHealthSnapshot,
  getCohortRetention,
  createCohortRetention,
  getGrowthProjections,
  createGrowthProjection,
  getMarketCompetitors,
  createMarketCompetitor,
  getBoardDeckReports,
  getLatestBoardDeck,
  createBoardDeckReport,
  getInvestorMetricsStats,
  getMetricsTrend,
  getRevenueMetrics,
  getAIMetrics
} from '@/lib/investor-metrics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'
    const period = searchParams.get('period') as string | null || 'monthly'
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const cohortName = searchParams.get('cohort_name') || undefined
    const marketPosition = searchParams.get('market_position') as string | null
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'metrics': {
        const { data, error } = await getInvestorMetrics(user.id, {
          period,
          startDate,
          endDate
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'latest-metric': {
        const { data, error } = await getLatestInvestorMetric(user.id, period)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'health-snapshots': {
        const { data, error } = await getHealthSnapshots(user.id, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'latest-health': {
        const { data, error } = await getLatestHealthSnapshot(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'cohorts': {
        const { data, error } = await getCohortRetention(user.id, {
          cohortName
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'projections': {
        const { data, error } = await getGrowthProjections(user.id, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'competitors': {
        const { data, error } = await getMarketCompetitors(user.id, {
          market_position: marketPosition
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'board-decks': {
        const { data, error } = await getBoardDeckReports(user.id, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'latest-board-deck': {
        const { data, error } = await getLatestBoardDeck(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getInvestorMetricsStats(user.id, period)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'metrics-trend': {
        const { data, error } = await getMetricsTrend(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'revenue-metrics': {
        const { data, error } = await getRevenueMetrics(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'ai-metrics': {
        const { data, error } = await getAIMetrics(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Investor Metrics API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Investor Metrics data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'create-metric': {
        const { data, error } = await createInvestorMetric(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-health-snapshot': {
        const { data, error } = await createHealthSnapshot(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-cohort': {
        const { data, error } = await createCohortRetention(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-projection': {
        const { data, error } = await createGrowthProjection(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-competitor': {
        const { data, error } = await createMarketCompetitor(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-board-deck': {
        const { data, error } = await createBoardDeckReport(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Investor Metrics API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Investor Metrics request' },
      { status: 500 }
    )
  }
}
