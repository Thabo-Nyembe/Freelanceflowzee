/**
 * Feature Roadmap API - Single Resource Routes
 *
 * GET - Get single feature, request, updates
 * PUT - Update request status (admin)
 * DELETE - (Reserved for admin operations)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('feature-roadmap')
import {

  getRoadmapFeature,
  getFeatureUpdates,
  updateFeatureRequestStatus
} from '@/lib/feature-roadmap-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'feature'
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'feature': {
        const data = await getRoadmapFeature(id)
        if (!data) {
          return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'updates': {
        const data = await getFeatureUpdates(id, limit)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Feature Roadmap API error', { error })
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
      case 'request': {
        if (action === 'update-status') {
          const data = await updateFeatureRequestStatus(
            id,
            updates.status,
            updates.admin_response
          )
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for request' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Feature Roadmap API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}
