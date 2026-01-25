/**
 * Admin Analytics API - Single Resource Routes
 *
 * PUT - Update revenue record, insight, metric, report
 * DELETE - Delete revenue record, insight, metric, report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-analytics')
import {
  updateRevenueData,
  deleteRevenueData,
  updateInsight,
  deleteInsight,
  updateMetric,
  deleteMetric,
  updateReport,
  deleteReport,
  markReportComplete
} from '@/lib/admin-analytics-queries'

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
      case 'revenue': {
        const result = await updateRevenueData(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'insight': {
        const result = await updateInsight(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'metric': {
        const result = await updateMetric(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'report': {
        if (action === 'mark-complete') {
          const result = await markReportComplete(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateReport(id, updates)
        return NextResponse.json({ data: result.data })
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
    const type = searchParams.get('type') || 'revenue'

    switch (type) {
      case 'revenue': {
        await deleteRevenueData(id)
        return NextResponse.json({ success: true })
      }

      case 'insight': {
        await deleteInsight(id)
        return NextResponse.json({ success: true })
      }

      case 'metric': {
        await deleteMetric(id)
        return NextResponse.json({ success: true })
      }

      case 'report': {
        await deleteReport(id)
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
