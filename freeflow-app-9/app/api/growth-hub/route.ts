/**
 * Growth Hub API Routes
 *
 * REST endpoints for Growth Hub:
 * GET - List strategies, quick wins, plans, milestones, KPIs, actions, metrics, templates, profiles, stats
 * POST - Create strategy, quick win, plan, milestone, KPI, action, metric
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('growth-hub')
import {
  getGrowthStrategies,
  createGrowthStrategy,
  getQuickWins,
  createQuickWin,
  getMonthlyPlans,
  createMonthlyPlan,
  getMilestones,
  createMilestone,
  getKPIs,
  createKPI,
  getPriorityActions,
  createPriorityAction,
  getGrowthMetrics,
  createGrowthMetric,
  getGrowthTemplates,
  getUserTypeProfiles,
  getUserTypeProfile,
  getGrowthHubStats
} from '@/lib/growth-hub-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'strategies'
    const status = searchParams.get('status') as any
    const userType = searchParams.get('user_type') as any
    const goalType = searchParams.get('goal_type') as any
    const strategyId = searchParams.get('strategy_id') || undefined
    const planId = searchParams.get('plan_id') || undefined
    const priority = searchParams.get('priority') as any
    const completed = searchParams.get('completed')

    switch (type) {
      case 'strategies': {
        const { data, error } = await getGrowthStrategies(user.id, {
          status,
          user_type: userType
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'quick-wins': {
        if (!strategyId) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await getQuickWins(strategyId, {
          completed: completed ? completed === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'monthly-plans': {
        if (!strategyId) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await getMonthlyPlans(strategyId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'milestones': {
        if (!planId) {
          return NextResponse.json({ error: 'plan_id required' }, { status: 400 })
        }
        const { data, error } = await getMilestones(planId, {
          completed: completed ? completed === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'kpis': {
        if (!planId) {
          return NextResponse.json({ error: 'plan_id required' }, { status: 400 })
        }
        const { data, error } = await getKPIs(planId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'priority-actions': {
        if (!strategyId) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await getPriorityActions(strategyId, {
          priority,
          completed: completed ? completed === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'metrics': {
        const { data, error } = await getGrowthMetrics(user.id, strategyId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'templates': {
        const { data, error } = await getGrowthTemplates({
          user_type: userType,
          goal_type: goalType
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'user-type-profiles': {
        const { data, error } = await getUserTypeProfiles()
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'user-type-profile': {
        if (!userType) {
          return NextResponse.json({ error: 'user_type required' }, { status: 400 })
        }
        const { data, error } = await getUserTypeProfile(userType)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getGrowthHubStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Growth Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Growth Hub data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-strategy': {
        const { data, error } = await createGrowthStrategy(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-quick-win': {
        const { strategy_id, ...quickWinData } = payload
        if (!strategy_id) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await createQuickWin(strategy_id, quickWinData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-monthly-plan': {
        const { strategy_id, ...planData } = payload
        if (!strategy_id) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await createMonthlyPlan(strategy_id, planData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-milestone': {
        const { plan_id, ...milestoneData } = payload
        if (!plan_id) {
          return NextResponse.json({ error: 'plan_id required' }, { status: 400 })
        }
        const { data, error } = await createMilestone(plan_id, milestoneData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-kpi': {
        const { plan_id, ...kpiData } = payload
        if (!plan_id) {
          return NextResponse.json({ error: 'plan_id required' }, { status: 400 })
        }
        const { data, error } = await createKPI(plan_id, kpiData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-priority-action': {
        const { strategy_id, ...actionData } = payload
        if (!strategy_id) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await createPriorityAction(strategy_id, actionData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-metric': {
        const { strategy_id, ...metricData } = payload
        if (!strategy_id) {
          return NextResponse.json({ error: 'strategy_id required' }, { status: 400 })
        }
        const { data, error } = await createGrowthMetric(user.id, strategy_id, metricData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Growth Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Growth Hub request' },
      { status: 500 }
    )
  }
}
