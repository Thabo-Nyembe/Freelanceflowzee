/**
 * ML Insights API - Single Resource Routes
 *
 * PUT - Update model, resolve anomaly, dismiss recommendation, update action status, acknowledge/delete alert
 * DELETE - Delete insight, model, anomaly, pattern, recommendation, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ml-insights')
import {
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
