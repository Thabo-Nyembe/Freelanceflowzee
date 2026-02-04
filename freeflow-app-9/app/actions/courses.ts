'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('courses-actions')

export async function createCourse(courseData: {
  course_name: string
  description?: string
  course_category: string
  level?: string
  instructor_name?: string
  price?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        ...courseData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create course', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Course created successfully', { courseId: course.id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Course created successfully')
  } catch (error) {
    logger.error('Unexpected error in createCourse', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishCourse(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        is_published: true,
        status: 'published',
        publish_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish course', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Course published successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Course published successfully')
  } catch (error) {
    logger.error('Unexpected error in publishCourse', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enrollStudent(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('courses')
      .select('student_count, enrolled_count, active_students')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Course not found', 'NOT_FOUND')

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        student_count: (current.student_count || 0) + 1,
        enrolled_count: (current.enrolled_count || 0) + 1,
        active_students: (current.active_students || 0) + 1
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to enroll student', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Student enrolled successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Student enrolled successfully')
  } catch (error) {
    logger.error('Unexpected error in enrollStudent', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCompletionRate(id: string, completedStudents: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('courses')
      .select('completed_students, student_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Course not found', 'NOT_FOUND')

    const totalCompleted = (current.completed_students || 0) + completedStudents
    const completionRate = current.student_count > 0
      ? parseFloat(((totalCompleted / current.student_count) * 100).toFixed(2))
      : 0

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        completed_students: totalCompleted,
        completion_rate: completionRate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update completion rate', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Completion rate updated successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Completion rate updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateCompletionRate', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addRating(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    if (rating < 1 || rating > 5) return actionError('Invalid rating', 'VALIDATION_ERROR')

    const { data: current } = await supabase
      .from('courses')
      .select('review_count, five_star_count, four_star_count, three_star_count, two_star_count, one_star_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Course not found', 'NOT_FOUND')

    const reviewCount = (current.review_count || 0) + 1
    const updateData: any = {
      review_count: reviewCount
    }

    // Increment star count
    if (rating === 5) updateData.five_star_count = (current.five_star_count || 0) + 1
    if (rating === 4) updateData.four_star_count = (current.four_star_count || 0) + 1
    if (rating === 3) updateData.three_star_count = (current.three_star_count || 0) + 1
    if (rating === 2) updateData.two_star_count = (current.two_star_count || 0) + 1
    if (rating === 1) updateData.one_star_count = (current.one_star_count || 0) + 1

    // Calculate new average rating
    const totalStars =
      (updateData.five_star_count || current.five_star_count || 0) * 5 +
      (updateData.four_star_count || current.four_star_count || 0) * 4 +
      (updateData.three_star_count || current.three_star_count || 0) * 3 +
      (updateData.two_star_count || current.two_star_count || 0) * 2 +
      (updateData.one_star_count || current.one_star_count || 0) * 1

    updateData.rating = parseFloat((totalStars / reviewCount).toFixed(2))

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to add rating', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Rating added successfully', { id, rating })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Rating added successfully')
  } catch (error) {
    logger.error('Unexpected error in addRating', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRevenue(id: string, revenue: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('courses')
      .select('total_revenue, student_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Course not found', 'NOT_FOUND')

    const totalRevenue = (current.total_revenue || 0) + revenue
    const avgRevenuePerStudent = current.student_count > 0
      ? parseFloat((totalRevenue / current.student_count).toFixed(2))
      : 0

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        total_revenue: totalRevenue,
        avg_revenue_per_student: avgRevenuePerStudent
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update revenue', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Revenue updated successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Revenue updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateRevenue', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEngagementMetrics(id: string, metrics: {
  videoWatchRate?: number
  quizPassRate?: number
  assignmentSubmissionRate?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updateData: any = {}

    if (metrics.videoWatchRate !== undefined) {
      updateData.video_watch_rate = parseFloat(metrics.videoWatchRate.toFixed(2))
    }

    if (metrics.quizPassRate !== undefined) {
      updateData.quiz_pass_rate = parseFloat(metrics.quizPassRate.toFixed(2))
    }

    if (metrics.assignmentSubmissionRate !== undefined) {
      updateData.assignment_submission_rate = parseFloat(metrics.assignmentSubmissionRate.toFixed(2))
    }

    // Calculate overall engagement score
    const scores = [
      metrics.videoWatchRate,
      metrics.quizPassRate,
      metrics.assignmentSubmissionRate
    ].filter(s => s !== undefined) as number[]

    if (scores.length > 0) {
      updateData.engagement_score = parseFloat(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
      )
    }

    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update engagement metrics', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Engagement metrics updated successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Engagement metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateEngagementMetrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markAsFeatured(id: string, featured: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: course, error } = await supabase
      .from('courses')
      .update({ is_featured: featured })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark as featured', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Course featured status updated successfully', { id, featured })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, `Course ${featured ? 'marked' : 'unmarked'} as featured successfully`)
  } catch (error) {
    logger.error('Unexpected error in markAsFeatured', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveCourse(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        status: 'archived',
        is_published: false
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive course', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Course archived successfully', { id })
    revalidatePath('/dashboard/courses-v2')
    return actionSuccess(course, 'Course archived successfully')
  } catch (error) {
    logger.error('Unexpected error in archiveCourse', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
