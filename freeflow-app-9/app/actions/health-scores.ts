'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createHealthScore(input: CreateHealthScoreInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/health-score-v2')
  return { data }
}

export async function updateHealthScore(id: string, input: UpdateHealthScoreInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('health_scores')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/health-score-v2')
  return { data }
}

export async function recalculateHealthScore(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get current score
  const { data: current } = await supabase
    .from('health_scores')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) {
    return { error: 'Health score not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/health-score-v2')
  return { data }
}

export async function deleteHealthScore(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('health_scores')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/health-score-v2')
  return { success: true }
}

export async function getHealthScores(filters?: {
  category?: string
  trend?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  return { data }
}
