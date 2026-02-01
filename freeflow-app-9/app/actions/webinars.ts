// Server Actions for Webinars
// Created: December 14, 2024

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('webinars-actions')

export type WebinarTopic = 'sales' | 'marketing' | 'product' | 'training' | 'demo' | 'onboarding' | 'qa' | 'other'
export type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'recording'
export type Platform = 'zoom' | 'teams' | 'meet' | 'webex' | 'custom'

export interface CreateWebinarData {
  title: string
  description?: string
  topic: WebinarTopic
  status?: WebinarStatus
  scheduled_date: string
  duration_minutes: number
  timezone?: string
  platform?: Platform
  meeting_link?: string
  meeting_id?: string
  passcode?: string
  max_participants?: number
  host_name?: string
  speakers?: any
}

export async function createWebinar(data: CreateWebinarData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: webinar, error } = await supabase
      .from('webinars')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create webinar', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/webinars-v2')
    logger.info('Webinar created', { userId: user.id, webinarId: webinar.id })
    return actionSuccess(webinar, 'Webinar created successfully')
  } catch (error) {
    logger.error('Unexpected error in createWebinar', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWebinar(id: string, data: Partial<CreateWebinarData>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: webinar, error } = await supabase
      .from('webinars')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update webinar', { error, userId: user.id, webinarId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/webinars-v2')
    logger.info('Webinar updated', { userId: user.id, webinarId: id })
    return actionSuccess(webinar, 'Webinar updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateWebinar', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteWebinar(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Soft delete
    const { error } = await supabase
      .from('webinars')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete webinar', { error, userId: user.id, webinarId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/webinars-v2')
    logger.info('Webinar deleted', { userId: user.id, webinarId: id })
    return actionSuccess({ id }, 'Webinar deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteWebinar', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startWebinar(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: webinar, error } = await supabase
      .from('webinars')
      .update({ status: 'live' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start webinar', { error, userId: user.id, webinarId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/webinars-v2')
    logger.info('Webinar started', { userId: user.id, webinarId: id })
    return actionSuccess(webinar, 'Webinar started successfully')
  } catch (error) {
    logger.error('Unexpected error in startWebinar', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function endWebinar(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: webinar, error } = await supabase
      .from('webinars')
      .update({ status: 'ended' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to end webinar', { error, userId: user.id, webinarId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/webinars-v2')
    logger.info('Webinar ended', { userId: user.id, webinarId: id })
    return actionSuccess(webinar, 'Webinar ended successfully')
  } catch (error) {
    logger.error('Unexpected error in endWebinar', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getWebinarStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: webinars, error } = await supabase
      .from('webinars')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get webinar stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!webinars) {
      return actionSuccess({
        total: 0,
        scheduled: 0,
        live: 0,
        ended: 0,
        totalRegistrations: 0,
      }, 'Webinar stats retrieved successfully')
    }

    const stats = {
      total: webinars.length,
      scheduled: webinars.filter(w => w.status === 'scheduled').length,
      live: webinars.filter(w => w.status === 'live').length,
      ended: webinars.filter(w => w.status === 'ended').length,
      totalRegistrations: webinars.reduce((sum, w) => sum + (w.registered_count || 0), 0),
    }

    logger.info('Webinar stats retrieved', { userId: user.id })
    return actionSuccess(stats, 'Webinar stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getWebinarStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
