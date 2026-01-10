'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('performance-actions')

// Performance Types
type ReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'completed' | 'rejected'
type ReviewPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'missed' | 'exceeded'
type GoalPriority = 'low' | 'medium' | 'high' | 'critical'

// Create Performance Review
export async function createPerformanceReview(data: {
  employee_id?: string
  employee_name: string
  employee_email?: string
  department?: string
  position?: string
  reviewer_id?: string
  reviewer_name?: string
  review_period: ReviewPeriod
  review_date?: string
  strengths?: string[]
  improvements?: string[]
  achievements?: string[]
  feedback?: string
  self_assessment?: string
  next_review_date?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .insert({
        user_id: user.id,
        employee_id: data.employee_id,
        employee_name: data.employee_name,
        employee_email: data.employee_email,
        department: data.department,
        position: data.position,
        reviewer_id: data.reviewer_id,
        reviewer_name: data.reviewer_name,
        review_period: data.review_period,
        review_date: data.review_date,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        achievements: data.achievements || [],
        feedback: data.feedback,
        self_assessment: data.self_assessment,
        next_review_date: data.next_review_date,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create performance review', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(review, 'Performance review created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating performance review', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Performance Review
export async function updatePerformanceReview(reviewId: string, data: Partial<{
  employee_name: string
  employee_email: string
  department: string
  position: string
  reviewer_id: string
  reviewer_name: string
  review_period: ReviewPeriod
  review_date: string
  overall_score: number
  strengths: string[]
  improvements: string[]
  achievements: string[]
  feedback: string
  self_assessment: string
  manager_comments: string
  status: ReviewStatus
  next_review_date: string
  metadata: Record<string, any>
}>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .update(data)
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update performance review', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(review, 'Performance review updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating performance review', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Review Status
export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  return updatePerformanceReview(reviewId, { status })
}

// Submit Review
export async function submitReview(reviewId: string) {
  return updateReviewStatus(reviewId, 'submitted')
}

// Approve Review
export async function approveReview(reviewId: string, managerComments?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .update({
        status: 'approved',
        manager_comments: managerComments
      })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve review', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(review, 'Review approved successfully')
  } catch (error: any) {
    logger.error('Unexpected error approving review', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Complete Review
export async function completeReview(reviewId: string) {
  return updateReviewStatus(reviewId, 'completed')
}

// Delete Review (soft delete)
export async function deletePerformanceReview(reviewId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('performance_reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', reviewId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete performance review', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess({ success: true }, 'Performance review deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting performance review', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create Performance Goal
export async function createPerformanceGoal(reviewId: string, data: {
  goal_title: string
  description?: string
  target_metric?: string
  target_value: number
  priority?: GoalPriority
  due_date?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: goal, error } = await supabase
      .from('performance_goals')
      .insert({
        review_id: reviewId,
        user_id: user.id,
        goal_title: data.goal_title,
        description: data.description,
        target_metric: data.target_metric,
        current_value: 0,
        target_value: data.target_value,
        progress_percentage: 0,
        priority: data.priority || 'medium',
        status: 'not_started',
        due_date: data.due_date
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create performance goal', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update review goals_total
    await updateReviewGoalCounts(reviewId)

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(goal, 'Performance goal created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating performance goal', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Performance Goal
export async function updatePerformanceGoal(goalId: string, data: Partial<{
  goal_title: string
  description: string
  target_metric: string
  current_value: number
  target_value: number
  priority: GoalPriority
  status: GoalStatus
  due_date: string
  completed_date: string
  notes: string
}>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Calculate progress if values updated
    const updateData: any = { ...data }
    if (data.current_value !== undefined || data.target_value !== undefined) {
      const { data: currentGoal } = await supabase
        .from('performance_goals')
        .select('current_value, target_value')
        .eq('id', goalId)
        .single()

      if (currentGoal) {
        const currentVal = data.current_value ?? currentGoal.current_value
        const targetVal = data.target_value ?? currentGoal.target_value
        updateData.progress_percentage = targetVal > 0 ? Math.min(100, (currentVal / targetVal) * 100) : 0
      }
    }

    const { data: goal, error } = await supabase
      .from('performance_goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update performance goal', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update review goal counts if status changed
    if (data.status) {
      const { data: goalData } = await supabase
        .from('performance_goals')
        .select('review_id')
        .eq('id', goalId)
        .single()

      if (goalData?.review_id) {
        await updateReviewGoalCounts(goalData.review_id)
      }
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(goal, 'Performance goal updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating performance goal', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Goal Progress
export async function updateGoalProgress(goalId: string, currentValue: number) {
  return updatePerformanceGoal(goalId, { current_value: currentValue })
}

// Complete Goal
export async function completeGoal(goalId: string, exceeded: boolean = false) {
  return updatePerformanceGoal(goalId, {
    status: exceeded ? 'exceeded' : 'completed',
    completed_date: new Date().toISOString()
  })
}

// Delete Goal
export async function deletePerformanceGoal(goalId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get goal to find review
    const { data: goal } = await supabase
      .from('performance_goals')
      .select('review_id')
      .eq('id', goalId)
      .single()

    const { error } = await supabase
      .from('performance_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete performance goal', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update review goal counts
    if (goal?.review_id) {
      await updateReviewGoalCounts(goal.review_id)
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess({ success: true }, 'Performance goal deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting performance goal', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Helper: Update Review Goal Counts
async function updateReviewGoalCounts(reviewId: string) {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('performance_goals')
    .select('status')
    .eq('review_id', reviewId)

  const goalsTotal = goals?.length || 0
  const goalsAchieved = goals?.filter(g => g.status === 'completed' || g.status === 'exceeded').length || 0

  await supabase
    .from('performance_reviews')
    .update({ goals_total: goalsTotal, goals_achieved: goalsAchieved })
    .eq('id', reviewId)
}

// Calculate Overall Score
export async function calculateOverallScore(reviewId: string, scores: {
  goalCompletion?: number // 0-100
  skillRatings?: number[] // Array of 1-5 ratings
  managerRating?: number // 1-5
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let overallScore = 0
    let weightTotal = 0

    if (scores.goalCompletion !== undefined) {
      overallScore += scores.goalCompletion * 0.4 // 40% weight
      weightTotal += 0.4
    }

    if (scores.skillRatings && scores.skillRatings.length > 0) {
      const avgSkill = scores.skillRatings.reduce((a, b) => a + b, 0) / scores.skillRatings.length
      overallScore += (avgSkill / 5) * 100 * 0.3 // 30% weight
      weightTotal += 0.3
    }

    if (scores.managerRating !== undefined) {
      overallScore += (scores.managerRating / 5) * 100 * 0.3 // 30% weight
      weightTotal += 0.3
    }

    // Normalize score
    const finalScore = weightTotal > 0 ? overallScore / weightTotal : 0

    const { data: review, error } = await supabase
      .from('performance_reviews')
      .update({ overall_score: Math.round(finalScore * 100) / 100 })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to calculate overall score', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-v2')
    return actionSuccess(review, 'Overall score calculated successfully')
  } catch (error: any) {
    logger.error('Unexpected error calculating overall score', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get Performance Stats
export async function getPerformanceStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: reviews, error } = await supabase
      .from('performance_reviews')
      .select('status, overall_score, goals_achieved, goals_total, department')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get performance stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      totalReviews: reviews?.length || 0,
      averageScore: reviews?.length ? reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.length : 0,
      completedReviews: reviews?.filter(r => r.status === 'completed').length || 0,
      pendingReviews: reviews?.filter(r => r.status === 'pending').length || 0,
      totalGoalsAchieved: reviews?.reduce((sum, r) => sum + (r.goals_achieved || 0), 0) || 0,
      totalGoals: reviews?.reduce((sum, r) => sum + (r.goals_total || 0), 0) || 0
    }

    return actionSuccess(stats, 'Performance stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting performance stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
