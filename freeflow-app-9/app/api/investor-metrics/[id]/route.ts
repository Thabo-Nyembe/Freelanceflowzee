/**
 * Investor Metrics API - Single Resource Routes
 *
 * GET - Get single metric, board deck
 * PUT - Update metric, cohort, projection, competitor, board deck
 * DELETE - Delete metric, health snapshot, cohort, projection, competitor, board deck
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('investor-metrics')
import {

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
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
