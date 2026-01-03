'use server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { Changelog } from '@/lib/hooks/use-changelog'

const logger = createFeatureLogger('changelog-actions')

export async function createChange(data: Partial<Changelog>): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create changelog entry', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry created successfully', { changelogId: changelog.id, userId: user.id })
    return actionSuccess(changelog, 'Changelog entry created successfully')
  } catch (error) {
    logger.error('Unexpected error creating changelog entry', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateChange(id: string, data: Partial<Changelog>): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update changelog entry', { error, changelogId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry updated successfully', { changelogId: id, userId: user.id })
    return actionSuccess(changelog, 'Changelog entry updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating changelog entry', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteChange(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('changelog')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete changelog entry', { error, changelogId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry deleted successfully', { changelogId: id, userId: user.id })
    return actionSuccess(undefined, 'Changelog entry deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting changelog entry', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishChange(id: string): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update({
        release_status: 'released',
        published_at: new Date().toISOString(),
        last_published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish changelog entry', { error, changelogId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry published successfully', { changelogId: id, userId: user.id })
    return actionSuccess(changelog, 'Changelog entry published successfully')
  } catch (error) {
    logger.error('Unexpected error publishing changelog entry', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleChange(id: string, scheduledFor: string): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update({
        release_status: 'scheduled',
        scheduled_for: scheduledFor
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule changelog entry', { error, changelogId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry scheduled successfully', { changelogId: id, scheduledFor, userId: user.id })
    return actionSuccess(changelog, 'Changelog entry scheduled successfully')
  } catch (error) {
    logger.error('Unexpected error scheduling changelog entry', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementViews(id: string): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update({
        view_count: supabase.raw('view_count + 1')
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to increment changelog views', { error, changelogId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog views incremented', { changelogId: id })
    return actionSuccess(changelog, 'Views updated successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing changelog views', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEngagement(id: string, engagement: { likes?: number, comments?: number }): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updateData: any = {}
    if (engagement.likes !== undefined) updateData.like_count = supabase.raw(`like_count + ${engagement.likes}`)
    if (engagement.comments !== undefined) updateData.comment_count = supabase.raw(`comment_count + ${engagement.comments}`)

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update changelog engagement', { error, changelogId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog engagement updated', { changelogId: id, engagement })
    return actionSuccess(changelog, 'Engagement updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating changelog engagement', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deprecateChange(id: string, reason: string, alternative?: string): Promise<ActionResult<Changelog>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: changelog, error } = await supabase
      .from('changelog')
      .update({
        is_deprecated: true,
        deprecated_at: new Date().toISOString(),
        deprecation_reason: reason,
        alternative_solution: alternative
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deprecate changelog entry', { error, changelogId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/changelog-v2')
    logger.info('Changelog entry deprecated', { changelogId: id, reason, userId: user.id })
    return actionSuccess(changelog, 'Changelog entry deprecated successfully')
  } catch (error) {
    logger.error('Unexpected error deprecating changelog entry', { error, changelogId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
