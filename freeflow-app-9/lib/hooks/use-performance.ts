'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

// Types
export type ReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'completed' | 'rejected'
export type ReviewPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'missed' | 'exceeded'
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical'

export interface PerformanceReview {
  id: string
  user_id: string
  employee_id: string | null
  employee_name: string
  employee_email: string | null
  department: string | null
  position: string | null
  reviewer_id: string | null
  reviewer_name: string | null
  review_period: ReviewPeriod
  review_date: string | null
  overall_score: number
  goals_achieved: number
  goals_total: number
  strengths: string[]
  improvements: string[]
  achievements: string[]
  feedback: string | null
  self_assessment: string | null
  manager_comments: string | null
  status: ReviewStatus
  next_review_date: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PerformanceGoal {
  id: string
  review_id: string
  user_id: string
  goal_title: string
  description: string | null
  target_metric: string | null
  current_value: number
  target_value: number
  progress_percentage: number
  priority: GoalPriority
  status: GoalStatus
  due_date: string | null
  completed_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Hook Options
interface UsePerformanceReviewsOptions {
  status?: ReviewStatus
  period?: ReviewPeriod
  department?: string
  searchQuery?: string
}

interface UsePerformanceGoalsOptions {
  reviewId?: string
  status?: GoalStatus
  priority?: GoalPriority
}

// Performance Reviews Hook
export function usePerformanceReviews(options: UsePerformanceReviewsOptions = {}) {
  const { status, period, department, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('performance_reviews')
      .select('*')
      .is('deleted_at', null)
      .order('review_date', { ascending: false, nullsFirst: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (period) {
      query = query.eq('review_period', period)
    }

    if (department) {
      query = query.eq('department', department)
    }

    if (searchQuery) {
      query = query.or(`employee_name.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<PerformanceReview>('performance_reviews', buildQuery, [status, period, department, searchQuery])
}

// Performance Goals Hook
export function usePerformanceGoals(options: UsePerformanceGoalsOptions = {}) {
  const { reviewId, status, priority } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('performance_goals')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (reviewId) {
      query = query.eq('review_id', reviewId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    return query
  }

  return useSupabaseQuery<PerformanceGoal>('performance_goals', buildQuery, [reviewId, status, priority])
}

// Single Review Hook
export function usePerformanceReview(reviewId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', reviewId)
      .single()
  }

  return useSupabaseQuery<PerformanceReview>(
    'performance_reviews',
    buildQuery,
    [reviewId],
    { enabled: !!reviewId }
  )
}

// Performance Statistics Hook
export function usePerformanceStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('performance_reviews')
      .select('status, overall_score, goals_achieved, goals_total, department, review_period')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('performance_reviews', buildQuery, [])

  const stats = data ? {
    totalReviews: data.length,
    averageScore: data.length > 0 ? data.reduce((sum: number, r: any) => sum + (r.overall_score || 0), 0) / data.length : 0,
    completedReviews: data.filter((r: any) => r.status === 'completed').length,
    pendingReviews: data.filter((r: any) => r.status === 'pending').length,
    inProgressReviews: data.filter((r: any) => r.status === 'in_progress').length,
    totalGoalsAchieved: data.reduce((sum: number, r: any) => sum + (r.goals_achieved || 0), 0),
    totalGoals: data.reduce((sum: number, r: any) => sum + (r.goals_total || 0), 0),
    byDepartment: data.reduce((acc: Record<string, number>, r: any) => {
      if (r.department) {
        acc[r.department] = (acc[r.department] || 0) + 1
      }
      return acc
    }, {}),
    byPeriod: data.reduce((acc: Record<string, number>, r: any) => {
      acc[r.review_period] = (acc[r.review_period] || 0) + 1
      return acc
    }, {})
  } : null

  return { stats, ...rest }
}

// Upcoming Reviews Hook
export function useUpcomingReviews(days: number = 30) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  const buildQuery = (supabase: any) => {
    return supabase
      .from('performance_reviews')
      .select('*')
      .is('deleted_at', null)
      .lte('next_review_date', futureDate.toISOString())
      .gte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true })
  }

  return useSupabaseQuery<PerformanceReview>('performance_reviews', buildQuery, [days])
}

// Mutations
export function usePerformanceMutations() {
  return useSupabaseMutation()
}
