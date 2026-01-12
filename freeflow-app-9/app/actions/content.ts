'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Content } from '@/lib/hooks/use-content'
import { actionSuccess, actionError, type ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import { ErrorCode } from '@/lib/api/response'

const logger = createFeatureLogger('content-actions')

/**
 * Creates new content
 */
export async function createContent(data: Partial<Content>): Promise<ActionResult<Content>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content creation attempt')
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create content', { error, userId: user.id })
      return actionError('Failed to create content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content created successfully', { contentId: content.id, userId: user.id })
    return actionSuccess(content as Content, 'Content created successfully')
  } catch (error) {
    logger.error('Unexpected error in createContent', { error })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Updates existing content
 */
export async function updateContent(id: string, data: Partial<Content>): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content update attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update content', { error, contentId: id, userId: user.id })
      return actionError('Failed to update content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content updated successfully', { contentId: id, userId: user.id })
    return actionSuccess(content as Content, 'Content updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateContent', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Soft deletes content
 */
export async function deleteContent(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content deletion attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { error } = await supabase
      .from('content')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete content', { error, contentId: id, userId: user.id })
      return actionError('Failed to delete content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content deleted successfully', { contentId: id, userId: user.id })
    return actionSuccess({ id }, 'Content deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteContent', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Publishes content
 */
export async function publishContent(id: string): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content publish attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish content', { error, contentId: id, userId: user.id })
      return actionError('Failed to publish content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content published successfully', { contentId: id, userId: user.id })
    return actionSuccess(content as Content, 'Content published successfully')
  } catch (error) {
    logger.error('Unexpected error in publishContent', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Schedules content for future publishing
 */
export async function scheduleContent(id: string, scheduledFor: string): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    // Validate scheduled date
    const scheduledDate = new Date(scheduledFor)
    if (isNaN(scheduledDate.getTime())) {
      return actionError('Invalid scheduled date format', ErrorCode.VALIDATION_ERROR)
    }

    if (scheduledDate <= new Date()) {
      return actionError('Scheduled date must be in the future', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content schedule attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledFor
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule content', { error, contentId: id, userId: user.id })
      return actionError('Failed to schedule content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content scheduled successfully', { contentId: id, scheduledFor, userId: user.id })
    return actionSuccess(content as Content, 'Content scheduled successfully')
  } catch (error) {
    logger.error('Unexpected error in scheduleContent', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Increments the view count for content
 */
export async function incrementViewCount(id: string): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized view count increment attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update({
        view_count: supabase.raw('view_count + 1')
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to increment view count', { error, contentId: id, userId: user.id })
      return actionError('Failed to update view count', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('View count incremented', { contentId: id, userId: user.id })
    return actionSuccess(content as Content, 'View count updated')
  } catch (error) {
    logger.error('Unexpected error in incrementViewCount', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Updates content engagement metrics (likes, shares, comments)
 */
export async function updateContentEngagement(
  id: string,
  engagement: { likes?: number; shares?: number; comments?: number }
): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    // Validate engagement values
    if (engagement.likes !== undefined && !Number.isInteger(engagement.likes)) {
      return actionError('Likes must be an integer', ErrorCode.VALIDATION_ERROR)
    }
    if (engagement.shares !== undefined && !Number.isInteger(engagement.shares)) {
      return actionError('Shares must be an integer', ErrorCode.VALIDATION_ERROR)
    }
    if (engagement.comments !== undefined && !Number.isInteger(engagement.comments)) {
      return actionError('Comments must be an integer', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized engagement update attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const updateData: Record<string, unknown> = {}
    if (engagement.likes !== undefined) {
      updateData.like_count = supabase.raw(`like_count + ${engagement.likes}`)
    }
    if (engagement.shares !== undefined) {
      updateData.share_count = supabase.raw(`share_count + ${engagement.shares}`)
    }
    if (engagement.comments !== undefined) {
      updateData.comment_count = supabase.raw(`comment_count + ${engagement.comments}`)
    }

    if (Object.keys(updateData).length === 0) {
      return actionError('No engagement metrics provided', ErrorCode.VALIDATION_ERROR)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update content engagement', { error, contentId: id, userId: user.id })
      return actionError('Failed to update engagement', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content engagement updated', { contentId: id, engagement, userId: user.id })
    return actionSuccess(content as Content, 'Engagement updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateContentEngagement', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}

/**
 * Archives content
 */
export async function archiveContent(id: string): Promise<ActionResult<Content>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid content ID format', ErrorCode.VALIDATION_ERROR)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized content archive attempt', { contentId: id })
      return actionError('Authentication required', ErrorCode.UNAUTHORIZED)
    }

    const { data: content, error } = await supabase
      .from('content')
      .update({
        status: 'archived'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive content', { error, contentId: id, userId: user.id })
      return actionError('Failed to archive content', ErrorCode.DATABASE_ERROR)
    }

    revalidatePath('/dashboard/content-v2')
    logger.info('Content archived successfully', { contentId: id, userId: user.id })
    return actionSuccess(content as Content, 'Content archived successfully')
  } catch (error) {
    logger.error('Unexpected error in archiveContent', { error, contentId: id })
    return actionError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
  }
}
