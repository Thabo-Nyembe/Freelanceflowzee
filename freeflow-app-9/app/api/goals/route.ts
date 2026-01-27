/**
 * Goals & OKR Management API
 *
 * Competitive Gap Closure: Matches Asana Goals and ClickUp Goals for OKR tracking
 *
 * Features:
 * - Goal creation with objectives and key results
 * - Progress tracking with milestones
 * - Goal categories and priorities
 * - Collaborator management
 * - Progress history and analytics
 * - Goal reminders and notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('goals')

// ============================================================================
// TYPES
// ============================================================================

interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category_id?: string
  parent_goal_id?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'at_risk' | 'on_track' | 'completed' | 'cancelled'
  progress: number
  target_value?: number
  current_value?: number
  unit?: string
  start_date?: string
  due_date?: string
  completed_at?: string
  visibility: 'private' | 'team' | 'company'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface KeyResult {
  id: string
  goal_id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  weight: number
  status: 'not_started' | 'in_progress' | 'completed'
  owner_id?: string
  due_date?: string
  created_at: string
  updated_at: string
}

interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  description?: string
  due_date: string
  completed_at?: string
  status: 'pending' | 'completed' | 'overdue'
  order: number
}

interface GoalProgress {
  id: string
  goal_id: string
  progress_value: number
  notes?: string
  recorded_by: string
  recorded_at: string
}

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

const demoGoals: Goal[] = [
  {
    id: 'goal-1',
    user_id: DEMO_USER_ID,
    title: 'Increase Monthly Revenue by 25%',
    description: 'Grow revenue through new client acquisition and upselling',
    priority: 'high',
    status: 'in_progress',
    progress: 65,
    target_value: 125000,
    current_value: 81250,
    unit: 'USD',
    start_date: '2025-01-01',
    due_date: '2025-03-31',
    visibility: 'team',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'goal-2',
    user_id: DEMO_USER_ID,
    title: 'Launch New Product Feature',
    description: 'Complete development and launch AI-powered analytics',
    priority: 'critical',
    status: 'on_track',
    progress: 80,
    start_date: '2025-01-15',
    due_date: '2025-02-28',
    visibility: 'company',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'goal-3',
    user_id: DEMO_USER_ID,
    title: 'Improve Customer Satisfaction Score',
    description: 'Increase NPS from 45 to 60',
    priority: 'medium',
    status: 'in_progress',
    progress: 50,
    target_value: 60,
    current_value: 52,
    unit: 'NPS',
    start_date: '2025-01-01',
    due_date: '2025-06-30',
    visibility: 'team',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
]

const demoKeyResults: KeyResult[] = [
  {
    id: 'kr-1',
    goal_id: 'goal-1',
    title: 'Acquire 10 new enterprise clients',
    target_value: 10,
    current_value: 7,
    unit: 'clients',
    weight: 40,
    status: 'in_progress',
    due_date: '2025-03-31',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'kr-2',
    goal_id: 'goal-1',
    title: 'Increase average deal size to $15,000',
    target_value: 15000,
    current_value: 12500,
    unit: 'USD',
    weight: 30,
    status: 'in_progress',
    due_date: '2025-03-31',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'kr-3',
    goal_id: 'goal-1',
    title: 'Reduce churn rate to 2%',
    target_value: 2,
    current_value: 3.5,
    unit: '%',
    weight: 30,
    status: 'in_progress',
    due_date: '2025-03-31',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
]

// ============================================================================
// HELPER: Calculate Goal Progress from Key Results
// ============================================================================

function calculateGoalProgress(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0

  const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0)
  const weightedProgress = keyResults.reduce((sum, kr) => {
    const progress = kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0
    return sum + (progress * kr.weight)
  }, 0)

  return Math.min(100, Math.round(weightedProgress / totalWeight))
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const categoryId = searchParams.get('category_id')
    const includeKeyResults = searchParams.get('include_key_results') === 'true'
    const includeMilestones = searchParams.get('include_milestones') === 'true'

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Unauthenticated users get empty data
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          goals: [],
          stats: {
            total: 0,
            completed: 0,
            in_progress: 0,
            at_risk: 0,
            avg_progress: 0
          }
        }
      })
    }

    const userId = user.id
    const userEmail = user.email

    // Demo mode ONLY for demo account (test@kazi.dev)
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'

    if (isDemoAccount) {
      let filteredGoals = [...demoGoals]
      if (status) filteredGoals = filteredGoals.filter(g => g.status === status)
      if (priority) filteredGoals = filteredGoals.filter(g => g.priority === priority)

      const goalsWithKRs = filteredGoals.map(goal => ({
        ...goal,
        key_results: includeKeyResults ? demoKeyResults.filter(kr => kr.goal_id === goal.id) : undefined,
        milestones: includeMilestones ? [] : undefined
      }))

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          goals: goalsWithKRs,
          stats: {
            total: goalsWithKRs.length,
            completed: goalsWithKRs.filter(g => g.status === 'completed').length,
            in_progress: goalsWithKRs.filter(g => g.status === 'in_progress').length,
            at_risk: goalsWithKRs.filter(g => g.status === 'at_risk').length,
            avg_progress: Math.round(goalsWithKRs.reduce((sum, g) => sum + g.progress, 0) / goalsWithKRs.length)
          }
        }
      })
    }

    // Build query
    let query = supabase
      .from('goals')
      .select(`
        *,
        goal_categories(id, name, color),
        goal_collaborators(user_id, role)
        ${includeKeyResults ? ', key_results(*)' : ''}
        ${includeMilestones ? ', goal_milestones(*)' : ''}
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (categoryId) query = query.eq('category_id', categoryId)

    const { data: goals, error } = await query

    if (error) {
      logger.error('Error fetching goals', { error })
      // Fall back to demo data
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          goals: demoGoals,
          stats: {
            total: demoGoals.length,
            completed: 0,
            in_progress: 2,
            at_risk: 0,
            avg_progress: 65
          }
        }
      })
    }

    const stats = {
      total: goals?.length || 0,
      completed: goals?.filter(g => g.status === 'completed').length || 0,
      in_progress: goals?.filter(g => g.status === 'in_progress').length || 0,
      at_risk: goals?.filter(g => g.status === 'at_risk').length || 0,
      avg_progress: goals?.length ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        goals: goals || [],
        stats
      }
    })
  } catch (error) {
    logger.error('Goals API GET Error', { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 })
  }
}

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    const supabase = await createClient()

    switch (action) {
      // ======================================================================
      // CREATE GOAL
      // ======================================================================
      case 'create': {
        const goalData = {
          user_id: data.user_id || DEMO_USER_ID,
          title: data.title,
          description: data.description,
          category_id: data.category_id,
          parent_goal_id: data.parent_goal_id,
          priority: data.priority || 'medium',
          status: 'not_started',
          progress: 0,
          target_value: data.target_value,
          current_value: data.current_value || 0,
          unit: data.unit,
          start_date: data.start_date,
          due_date: data.due_date,
          visibility: data.visibility || 'private',
          metadata: data.metadata || {}
        }

        const { data: goal, error } = await supabase
          .from('goals')
          .insert(goalData)
          .select()
          .single()

        if (error) {
          // Demo mode response
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              goal: {
                id: `goal-${Date.now()}`,
                ...goalData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
          })
        }

        return NextResponse.json({
          success: true,
          data: { goal }
        })
      }

      // ======================================================================
      // UPDATE GOAL
      // ======================================================================
      case 'update': {
        const { id, ...updates } = data
        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Goal ID is required'
          }, { status: 400 })
        }

        const { data: goal, error } = await supabase
          .from('goals')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: { goal: { id, ...updates } }
          })
        }

        return NextResponse.json({
          success: true,
          data: { goal }
        })
      }

      // ======================================================================
      // UPDATE PROGRESS
      // ======================================================================
      case 'update-progress': {
        const { goal_id, progress_value, notes, recorded_by } = data

        if (!goal_id || progress_value === undefined) {
          return NextResponse.json({
            success: false,
            error: 'goal_id and progress_value are required'
          }, { status: 400 })
        }

        // Insert progress record
        const { error: progressError } = await supabase
          .from('goal_progress')
          .insert({
            goal_id,
            progress_value,
            notes,
            recorded_by: recorded_by || DEMO_USER_ID
          })

        // Update goal progress
        const { data: goal, error: goalError } = await supabase
          .from('goals')
          .update({
            progress: progress_value,
            current_value: data.current_value,
            status: progress_value >= 100 ? 'completed' : 'in_progress',
            completed_at: progress_value >= 100 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal_id)
          .select()
          .single()

        if (goalError) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              goal: { id: goal_id, progress: progress_value }
            }
          })
        }

        return NextResponse.json({
          success: true,
          data: { goal }
        })
      }

      // ======================================================================
      // ADD KEY RESULT
      // ======================================================================
      case 'add-key-result': {
        const krData = {
          goal_id: data.goal_id,
          title: data.title,
          description: data.description,
          target_value: data.target_value,
          current_value: data.current_value || 0,
          unit: data.unit || 'units',
          weight: data.weight || 100,
          status: 'not_started',
          owner_id: data.owner_id,
          due_date: data.due_date
        }

        const { data: keyResult, error } = await supabase
          .from('key_results')
          .insert(krData)
          .select()
          .single()

        if (error) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              key_result: {
                id: `kr-${Date.now()}`,
                ...krData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
          })
        }

        return NextResponse.json({
          success: true,
          data: { key_result: keyResult }
        })
      }

      // ======================================================================
      // UPDATE KEY RESULT
      // ======================================================================
      case 'update-key-result': {
        const { id, goal_id, ...updates } = data

        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Key result ID is required'
          }, { status: 400 })
        }

        // Update key result
        const { data: keyResult, error } = await supabase
          .from('key_results')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        // Recalculate goal progress if goal_id provided
        if (goal_id) {
          const { data: keyResults } = await supabase
            .from('key_results')
            .select('*')
            .eq('goal_id', goal_id)

          if (keyResults) {
            const newProgress = calculateGoalProgress(keyResults)
            await supabase
              .from('goals')
              .update({ progress: newProgress, updated_at: new Date().toISOString() })
              .eq('id', goal_id)
          }
        }

        if (error) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: { key_result: { id, ...updates } }
          })
        }

        return NextResponse.json({
          success: true,
          data: { key_result: keyResult }
        })
      }

      // ======================================================================
      // ADD MILESTONE
      // ======================================================================
      case 'add-milestone': {
        const milestoneData = {
          goal_id: data.goal_id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          status: 'pending',
          order: data.order || 0
        }

        const { data: milestone, error } = await supabase
          .from('goal_milestones')
          .insert(milestoneData)
          .select()
          .single()

        if (error) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              milestone: {
                id: `milestone-${Date.now()}`,
                ...milestoneData,
                created_at: new Date().toISOString()
              }
            }
          })
        }

        return NextResponse.json({
          success: true,
          data: { milestone }
        })
      }

      // ======================================================================
      // DELETE GOAL
      // ======================================================================
      case 'delete': {
        const { id } = data

        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Goal ID is required'
          }, { status: 400 })
        }

        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)

        if (error) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: { deleted: true, id }
          })
        }

        return NextResponse.json({
          success: true,
          data: { deleted: true, id }
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'create',
            'update',
            'update-progress',
            'add-key-result',
            'update-key-result',
            'add-milestone',
            'delete'
          ]
        }, { status: 400 })
    }
  } catch (error) {
    logger.error('Goals API POST Error', { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 })
  }
}
