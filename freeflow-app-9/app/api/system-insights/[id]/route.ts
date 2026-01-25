/**
 * System Insights API - Single Resource Routes
 *
 * PUT - Resolve error, acknowledge alert, resolve alert
 * DELETE - Currently no delete operations needed for system insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('system-insights')
import {
  resolveError,
  acknowledgeAlert,
  resolveAlert
} from '@/lib/system-insights-queries'

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
      case 'error': {
        if (action === 'resolve') {
          const data = await resolveError(id, user.id, updates.resolution_notes)
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for error' }, { status: 400 })
      }

      case 'alert': {
        if (action === 'acknowledge') {
          const data = await acknowledgeAlert(id, user.id)
          return NextResponse.json({ data })
        } else if (action === 'resolve') {
          const data = await resolveAlert(id, user.id, updates.resolution_notes)
          return NextResponse.json({ data })
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
