/**
 * Investor Metrics API - Single Resource Routes
 *
 * GET - Get single metric, board deck
 * PUT - Update metric, cohort, projection, competitor, board deck
 * DELETE - Delete metric, health snapshot, cohort, projection, competitor, board deck
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('investor-metrics')
import {
  getInvestorMetric,
  updateInvestorMetric,
  deleteInvestorMetric,
  deleteHealthSnapshot,
  updateCohortRetention,
  deleteCohortRetention,
  updateGrowthProjection,
  deleteGrowthProjection,
  updateMarketCompetitor,
  deleteMarketCompetitor,
  getBoardDeckReport,
  updateBoardDeckReport,
  deleteBoardDeckReport
} from '@/lib/investor-metrics-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metric'

    switch (type) {
      case 'metric': {
        const { data, error } = await getInvestorMetric(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'board-deck': {
        const { data, error } = await getBoardDeckReport(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Board deck not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Investor Metrics API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...updates } = body

    switch (type) {
      case 'metric': {
        const { data, error } = await updateInvestorMetric(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'cohort': {
        const { data, error } = await updateCohortRetention(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'projection': {
        const { data, error } = await updateGrowthProjection(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'competitor': {
        const { data, error } = await updateMarketCompetitor(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'board-deck': {
        const { data, error } = await updateBoardDeckReport(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Investor Metrics API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metric'

    switch (type) {
      case 'metric': {
        const { error } = await deleteInvestorMetric(id)
        if (error) throw error
        break
      }

      case 'health-snapshot': {
        const { error } = await deleteHealthSnapshot(id)
        if (error) throw error
        break
      }

      case 'cohort': {
        const { error } = await deleteCohortRetention(id)
        if (error) throw error
        break
      }

      case 'projection': {
        const { error } = await deleteGrowthProjection(id)
        if (error) throw error
        break
      }

      case 'competitor': {
        const { error } = await deleteMarketCompetitor(id)
        if (error) throw error
        break
      }

      case 'board-deck': {
        const { error } = await deleteBoardDeckReport(id)
        if (error) throw error
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Investor Metrics API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
