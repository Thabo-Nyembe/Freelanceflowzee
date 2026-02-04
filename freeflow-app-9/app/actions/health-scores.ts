'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('health-scores-actions')

export interface CreateHealthScoreInput {
  customer_name: string
  customer_id?: string
  account_type?: string
  product_usage?: number
  engagement?: number
  support_health?: number
  financial?: number
  sentiment?: number
  notes?: string
  tags?: string[]
}

export interface UpdateHealthScoreInput {
  customer_name?: string
  account_type?: string
  overall_score?: number
  category?: string
  trend?: string
  product_usage?: number
  engagement?: number
  support_health?: number
  financial?: number
  sentiment?: number
  risk_factors?: number
  opportunities?: number
  notes?: string
  tags?: string[]
}

function calculateCategory(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  if (score >= 20) return 'poor'
  return 'critical'
}

function calculateTrend(currentScore: number, previousScore: number): string {
  const change = currentScore - previousScore
  if (change > 5) return 'improving'
  if (change < -5) return 'declining'
  return 'stable'
}

export async function createHealthScore(input: CreateHealthScoreInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const healthCode = `HS-${Date.now().toString(36).toUpperCase()}`

    // Calculate overall score (weighted average)
    const weights = { product_usage: 0.3, engagement: 0.25, support_health: 0.15, financial: 0.2, sentiment: 0.1 }
    const productUsage = input.product_usage || 50
    const engagement = input.engagement || 50
    const supportHealth = input.support_health || 50
    const financial = input.financial || 50
    const sentiment = input.sentiment || 50

    const overallScore = Math.round(
      productUsage * weights.product_usage +
      engagement * weights.engagement +
      supportHealth * weights.support_health +
      financial * weights.financial +
      sentiment * weights.sentiment
    )

    const category = calculateCategory(overallScore)

    const { data, error } = await supabase
      .from('health_scores')
      .insert({
        user_id: user.id,
        health_code: healthCode,
        customer_name: input.customer_name,
        customer_id: input.customer_id,
        account_type: input.account_type || 'standard',
        overall_score: overallScore,
        category,
        trend: 'stable',
        previous_score: overallScore,
        score_change: 0,
        product_usage: productUsage,
        engagement,
        support_health: supportHealth,
        financial,
        sentiment,
        risk_factors: 0,
        opportunities: 0,
        monthly_trend: [overallScore],
        notes: input.notes,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create health score', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health score created successfully', { healthCode })
    revalidatePath('/dashboard/health-score-v2')
    return actionSuccess(data, 'Health score created successfully')
  } catch (error) {
    logger.error('Unexpected error creating health score', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateHealthScore(id: string, input: UpdateHealthScoreInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('health_scores')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update health score', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health score updated successfully', { id })
    revalidatePath('/dashboard/health-score-v2')
    return actionSuccess(data, 'Health score updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating health score', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recalculateHealthScore(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current score
    const { data: current } = await supabase
      .from('health_scores')
      .select('*')
      .eq('id', id)
      .single()

    if (!current) {
      return actionError('Health score not found', 'NOT_FOUND')
    }

    // Recalculate
    const weights = { product_usage: 0.3, engagement: 0.25, support_health: 0.15, financial: 0.2, sentiment: 0.1 }
    const overallScore = Math.round(
      current.product_usage * weights.product_usage +
      current.engagement * weights.engagement +
      current.support_health * weights.support_health +
      current.financial * weights.financial +
      current.sentiment * weights.sentiment
    )

    const category = calculateCategory(overallScore)
    const trend = calculateTrend(overallScore, current.previous_score)
    const scoreChange = overallScore - current.previous_score
    const monthlyTrend = [...(current.monthly_trend || []), overallScore].slice(-12)

    const { data, error } = await supabase
      .from('health_scores')
      .update({
        overall_score: overallScore,
        category,
        trend,
        previous_score: current.overall_score,
        score_change: scoreChange,
        monthly_trend: monthlyTrend,
        last_calculated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to recalculate health score', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health score recalculated successfully', { id })
    revalidatePath('/dashboard/health-score-v2')
    return actionSuccess(data, 'Health score recalculated successfully')
  } catch (error) {
    logger.error('Unexpected error recalculating health score', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteHealthScore(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('health_scores')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete health score', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health score deleted successfully', { id })
    revalidatePath('/dashboard/health-score-v2')
    return actionSuccess({ success: true }, 'Health score deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting health score', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getHealthScores(filters?: {
  category?: string
  trend?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('health_scores')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('overall_score', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.trend) {
      query = query.eq('trend', filters.trend)
    }

    const { data, error } = await query.limit(200)

    if (error) {
      logger.error('Failed to get health scores', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health scores fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Health scores fetched successfully')
  } catch (error) {
    logger.error('Unexpected error getting health scores', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
