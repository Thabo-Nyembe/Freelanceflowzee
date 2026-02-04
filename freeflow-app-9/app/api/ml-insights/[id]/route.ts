/**
 * ML Insights API - Single Resource Routes
 *
 * PUT - Update model, resolve anomaly, dismiss recommendation, update action status, acknowledge/delete alert
 * DELETE - Delete insight, model, anomaly, pattern, recommendation, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ml-insights')
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
  deleteMLInsight,
  updateMLModel,
  deleteMLModel,
  resolveAnomaly,
  deleteMLAnomaly,
  deleteMLPattern,
  dismissRecommendation,
  deleteMLRecommendation,
  updateActionStatus,
  acknowledgeAlert,
  deleteMLAlert
} from '@/lib/ml-insights-queries'

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
      case 'model': {
        const result = await updateMLModel(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'anomaly': {
        if (action === 'resolve') {
          const result = await resolveAnomaly(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for anomaly' }, { status: 400 })
      }

      case 'recommendation': {
        if (action === 'dismiss') {
          const result = await dismissRecommendation(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for recommendation' }, { status: 400 })
      }

      case 'action': {
        if (action === 'update-status') {
          const result = await updateActionStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for action' }, { status: 400 })
      }

      case 'alert': {
        if (action === 'acknowledge') {
          const result = await acknowledgeAlert(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for alert' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'insight'

    switch (type) {
      case 'insight': {
        await deleteMLInsight(id)
        return NextResponse.json({ success: true })
      }

      case 'model': {
        await deleteMLModel(id)
        return NextResponse.json({ success: true })
      }

      case 'anomaly': {
        await deleteMLAnomaly(id)
        return NextResponse.json({ success: true })
      }

      case 'pattern': {
        await deleteMLPattern(id)
        return NextResponse.json({ success: true })
      }

      case 'recommendation': {
        await deleteMLRecommendation(id)
        return NextResponse.json({ success: true })
      }

      case 'alert': {
        await deleteMLAlert(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
