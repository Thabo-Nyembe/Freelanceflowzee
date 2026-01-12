/**
 * Growth Hub API - Single Resource Routes
 *
 * GET - Get single strategy, plan
 * PUT - Update strategy, quick win, plan, milestone, KPI, action, metric
 * DELETE - Delete strategy, quick win, plan, milestone, KPI, action
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getGrowthStrategy,
  updateGrowthStrategy,
  deleteGrowthStrategy,
  completeStrategy,
  updateQuickWin,
  completeQuickWin,
  deleteQuickWin,
  getMonthlyPlan,
  updateMonthlyPlan,
  deleteMonthlyPlan,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
  updateKPI,
  deleteKPI,
  updatePriorityAction,
  completePriorityAction,
  deletePriorityAction,
  updateGrowthMetric,
  incrementTemplateUsage
} from '@/lib/growth-hub-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'strategy'

    switch (type) {
      case 'strategy': {
        const { data, error } = await getGrowthStrategy(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'monthly-plan': {
        const { data, error } = await getMonthlyPlan(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Growth Hub API error:', error)
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
      case 'strategy': {
        if (action === 'complete') {
          const { data, error } = await completeStrategy(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateGrowthStrategy(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'quick-win': {
        if (action === 'complete') {
          const { data, error } = await completeQuickWin(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateQuickWin(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'monthly-plan': {
        const { data, error } = await updateMonthlyPlan(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'milestone': {
        if (action === 'complete') {
          const { data, error } = await completeMilestone(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateMilestone(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'kpi': {
        const { data, error } = await updateKPI(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'priority-action': {
        if (action === 'complete') {
          const { data, error } = await completePriorityAction(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updatePriorityAction(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'metric': {
        const { data, error } = await updateGrowthMetric(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'template': {
        if (action === 'use') {
          const { data, error } = await incrementTemplateUsage(id)
          if (error) throw error
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for template' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Growth Hub API error:', error)
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
    const type = searchParams.get('type') || 'strategy'

    switch (type) {
      case 'strategy': {
        const { error } = await deleteGrowthStrategy(id)
        if (error) throw error
        break
      }

      case 'quick-win': {
        const { error } = await deleteQuickWin(id)
        if (error) throw error
        break
      }

      case 'monthly-plan': {
        const { error } = await deleteMonthlyPlan(id)
        if (error) throw error
        break
      }

      case 'milestone': {
        const { error } = await deleteMilestone(id)
        if (error) throw error
        break
      }

      case 'kpi': {
        const { error } = await deleteKPI(id)
        if (error) throw error
        break
      }

      case 'priority-action': {
        const { error } = await deletePriorityAction(id)
        if (error) throw error
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Growth Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
