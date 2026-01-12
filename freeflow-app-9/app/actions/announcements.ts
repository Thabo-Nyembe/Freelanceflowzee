'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('announcements-actions')

// ===================================
// Announcement Server Actions
// Created: December 14, 2024
// ===================================

export interface CreateAnnouncementData {
  title: string
  content: string
  announcement_type?: string
  status?: string
  priority?: string
  scheduled_for?: string
  expires_at?: string
  target_audience?: string
  target_groups?: any
  is_pinned?: boolean
  is_featured?: boolean
  show_banner?: boolean
  banner_color?: string
  icon?: string
  send_email?: boolean
  send_push?: boolean
  tags?: any
  metadata?: any
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create announcement', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Announcement created successfully', { announcementId: announcement.id })
    revalidatePath('/dashboard/announcements-v2')
    return actionSuccess(announcement, 'Announcement created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating announcement', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update announcement', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Announcement updated successfully', { announcementId: id })
    revalidatePath('/dashboard/announcements-v2')
    return actionSuccess(announcement, 'Announcement updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating announcement', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAnnouncement(id: string, hardDelete: boolean = false): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    if (hardDelete) {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to hard delete announcement', { error: error.message, id })
        return actionError(error.message, 'DATABASE_ERROR')
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to soft delete announcement', { error: error.message, id })
        return actionError(error.message, 'DATABASE_ERROR')
      }
    }

    logger.info('Announcement deleted successfully', { announcementId: id, hardDelete })
    revalidatePath('/dashboard/announcements-v2')
    return actionSuccess({ success: true }, 'Announcement deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting announcement', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishAnnouncement(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish announcement', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Announcement published successfully', { announcementId: id })
    revalidatePath('/dashboard/announcements-v2')
    return actionSuccess(announcement, 'Announcement published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing announcement', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pinAnnouncement(id: string, isPinned: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({ is_pinned: isPinned })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pin announcement', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Announcement pin status updated', { announcementId: id, isPinned })
    revalidatePath('/dashboard/announcements-v2')
    return actionSuccess(announcement, `Announcement ${isPinned ? 'pinned' : 'unpinned'} successfully`)
  } catch (error: any) {
    logger.error('Unexpected error pinning announcement', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementAnnouncementViews(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_announcement_views', { announcement_id: id })

    if (error) {
      logger.error('Failed to increment announcement views', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess({ success: true }, 'Views incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing views', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAnnouncementStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get announcement stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: announcements?.length || 0,
      published: announcements?.filter(a => a.status === 'published').length || 0,
      draft: announcements?.filter(a => a.status === 'draft').length || 0,
      scheduled: announcements?.filter(a => a.status === 'scheduled').length || 0,
      totalViews: announcements?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0,
      totalReactions: announcements?.reduce((sum, a) => sum + (a.reactions_count || 0), 0) || 0
    }

    logger.info('Announcement stats retrieved successfully', { total: stats.total })
    return actionSuccess(stats, 'Stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
