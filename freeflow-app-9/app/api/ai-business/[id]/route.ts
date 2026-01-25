/**
 * AI Business API - Single Resource Routes
 *
 * GET - Get single analysis, insight, recommendation, session, forecast
 * PUT - Update analysis, insight, recommendation, session, forecast
 * DELETE - Delete analysis, insight, recommendation, session, forecast
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-business')
import {
  getProjectAnalysis,
  updateProjectAnalysis,
  deleteProjectAnalysis,
  getBusinessInsight,
  updateBusinessInsight,
  deleteBusinessInsight,
  getPricingRecommendation,
  updatePricingRecommendation,
  deletePricingRecommendation,
  acceptRecommendation,
  rejectRecommendation,
  getAdvisorySession,
  updateAdvisorySession,
  deleteAdvisorySession,
  endAdvisorySession,
  getGrowthForecast,
  updateGrowthForecast,
  deleteGrowthForecast
} from '@/lib/ai-business-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'analysis'

    switch (type) {
      case 'analysis': {
        const result = await getProjectAnalysis(id)
        return NextResponse.json({ data: result.data })
      }

      case 'insight': {
        const result = await getBusinessInsight(id)
        return NextResponse.json({ data: result.data })
      }

      case 'recommendation': {
        const result = await getPricingRecommendation(id)
        return NextResponse.json({ data: result.data })
      }

      case 'session': {
        const result = await getAdvisorySession(id)
        return NextResponse.json({ data: result.data })
      }

      case 'forecast': {
        const result = await getGrowthForecast(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Business API error', { error })
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
      case 'analysis': {
        const result = await updateProjectAnalysis(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'insight': {
        const result = await updateBusinessInsight(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'recommendation': {
        if (action === 'accept') {
          const result = await acceptRecommendation(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'reject') {
          const result = await rejectRecommendation(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updatePricingRecommendation(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'session': {
        if (action === 'end') {
          const result = await endAdvisorySession(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateAdvisorySession(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'forecast': {
        const result = await updateGrowthForecast(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Business API error', { error })
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
    const type = searchParams.get('type') || 'analysis'

    switch (type) {
      case 'analysis': {
        await deleteProjectAnalysis(id)
        return NextResponse.json({ success: true })
      }

      case 'insight': {
        await deleteBusinessInsight(id)
        return NextResponse.json({ success: true })
      }

      case 'recommendation': {
        await deletePricingRecommendation(id)
        return NextResponse.json({ success: true })
      }

      case 'session': {
        await deleteAdvisorySession(id)
        return NextResponse.json({ success: true })
      }

      case 'forecast': {
        await deleteGrowthForecast(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Business API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
