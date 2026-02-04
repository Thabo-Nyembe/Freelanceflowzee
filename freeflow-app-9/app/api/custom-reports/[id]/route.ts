/**
 * Custom Reports API - Single Resource Routes
 *
 * GET - Get single report, by share token
 * PUT - Update report, widget, filter, schedule, toggle favorite, increment view
 * DELETE - Delete report, widget, filter, share, schedule, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('custom-reports')
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
  getCustomReport,
  updateCustomReport,
  deleteCustomReport,
  toggleFavorite,
  incrementViewCount,
  updateReportWidget,
  deleteReportWidget,
  updateReportFilter,
  deleteReportFilter,
  getReportByShareToken,
  deleteReportShare,
  updateReportSchedule,
  toggleScheduleActive,
  deleteReportSchedule,
  updateReportExport,
  deleteReportExport
} from '@/lib/custom-reports-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'report'

    switch (type) {
      case 'report': {
        const result = await getCustomReport(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'share-token': {
        const result = await getReportByShareToken(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Invalid share token' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
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
    const { type, action, ...updates } = body

    switch (type) {
      case 'report': {
        if (action === 'toggle-favorite') {
          const result = await toggleFavorite(id, updates.is_favorite)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-view') {
          const result = await incrementViewCount(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateCustomReport(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'widget': {
        const result = await updateReportWidget(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'filter': {
        const result = await updateReportFilter(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'schedule': {
        if (action === 'toggle-active') {
          const result = await toggleScheduleActive(id, updates.is_active)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateReportSchedule(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'export': {
        const result = await updateReportExport(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
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
    const type = searchParams.get('type') || 'report'

    switch (type) {
      case 'report': {
        await deleteCustomReport(id)
        return NextResponse.json({ success: true })
      }

      case 'widget': {
        await deleteReportWidget(id)
        return NextResponse.json({ success: true })
      }

      case 'filter': {
        await deleteReportFilter(id)
        return NextResponse.json({ success: true })
      }

      case 'share': {
        await deleteReportShare(id)
        return NextResponse.json({ success: true })
      }

      case 'schedule': {
        await deleteReportSchedule(id)
        return NextResponse.json({ success: true })
      }

      case 'export': {
        await deleteReportExport(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
