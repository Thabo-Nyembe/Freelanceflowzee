'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('release-notes-actions')

export interface ReleaseNoteInput {
  version: string
  title: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  release_type?: 'major' | 'minor' | 'patch' | 'hotfix'
  platform?: 'web' | 'mobile' | 'api' | 'desktop' | 'all'
  author?: string
  highlights?: string[]
  features?: string[]
  improvements?: string[]
  bug_fixes?: string[]
  breaking_changes?: string[]
  tags?: string[]
  scheduled_at?: string
}

export async function createReleaseNote(input: ReleaseNoteInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('release_notes')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create release note', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/release-notes-v2')
    logger.info('Release note created successfully', { releaseNoteId: data.id })
    return actionSuccess(data, 'Release note created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating release note', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateReleaseNote(id: string, input: Partial<ReleaseNoteInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('release_notes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update release note', { error, releaseNoteId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/release-notes-v2')
    logger.info('Release note updated successfully', { releaseNoteId: id })
    return actionSuccess(data, 'Release note updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating release note', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteReleaseNote(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('release_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete release note', { error, releaseNoteId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/release-notes-v2')
    logger.info('Release note deleted successfully', { releaseNoteId: id })
    return actionSuccess({ success: true }, 'Release note deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting release note', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishReleaseNote(id: string): Promise<ActionResult<any>> {
  return updateReleaseNote(id, { status: 'published', published_at: new Date().toISOString() } as any)
}

export async function archiveReleaseNote(id: string): Promise<ActionResult<any>> {
  return updateReleaseNote(id, { status: 'archived' })
}

export async function likeReleaseNote(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: release } = await supabase
      .from('release_notes')
      .select('likes_count')
      .eq('id', id)
      .single()

    if (!release) {
      logger.error('Release note not found', { releaseNoteId: id })
      return actionError('Release note not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('release_notes')
      .update({ likes_count: (release.likes_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to like release note', { error, releaseNoteId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/release-notes-v2')
    logger.info('Release note liked successfully', { releaseNoteId: id, likesCount: data.likes_count })
    return actionSuccess(data, 'Release note liked successfully')
  } catch (error: any) {
    logger.error('Unexpected error liking release note', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
