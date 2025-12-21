'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('broadcasts-actions')

// ===================================
// Broadcast Server Actions
// Created: December 14, 2024
// ===================================

export interface CreateBroadcastData {
  title: string
  message: string
  broadcast_type?: string
  status?: string
  scheduled_for?: string
  recipient_type?: string
  recipient_count?: number
  recipient_list?: any
  recipient_filters?: any
  sender_name?: string
  sender_email?: string
  reply_to?: string
  subject?: string
  html_content?: string
  plain_text_content?: string
  template_id?: string
  variables?: any
  track_opens?: boolean
  track_clicks?: boolean
  tags?: any
  metadata?: any
}

export async function createBroadcast(data: CreateBroadcastData): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create broadcast', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast created successfully', { broadcastId: broadcast.id })
    return actionSuccess(broadcast, 'Broadcast created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBroadcast(id: string, data: Partial<CreateBroadcastData>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update broadcast', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast updated successfully', { broadcastId: id })
    return actionSuccess(broadcast, 'Broadcast updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteBroadcast(id: string, hardDelete: boolean = false): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    if (hardDelete) {
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to delete broadcast', error)
        return actionError(error.message, 'DATABASE_ERROR')
      }
    } else {
      const { error } = await supabase
        .from('broadcasts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to soft delete broadcast', error)
        return actionError(error.message, 'DATABASE_ERROR')
      }
    }

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast deleted successfully', { broadcastId: id, hardDelete })
    return actionSuccess({ success: true }, 'Broadcast deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function sendBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Update status to sending
    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to send broadcast', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // TODO: Implement actual broadcast sending logic here
    // This would integrate with email service, SMS provider, etc.

    // For now, just update status to sent
    await supabase
      .from('broadcasts')
      .update({ status: 'sent' })
      .eq('id', id)

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast sent successfully', { broadcastId: id })
    return actionSuccess(broadcast, 'Broadcast sent successfully')
  } catch (error: any) {
    logger.error('Unexpected error sending broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pauseBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause broadcast', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast paused successfully', { broadcastId: id })
    return actionSuccess(broadcast, 'Broadcast paused successfully')
  } catch (error: any) {
    logger.error('Unexpected error pausing broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resumeBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .update({ status: 'sending' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resume broadcast', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast resumed successfully', { broadcastId: id })
    return actionSuccess(broadcast, 'Broadcast resumed successfully')
  } catch (error: any) {
    logger.error('Unexpected error resuming broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getBroadcastStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: broadcasts, error } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get broadcast stats', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: broadcasts?.length || 0,
      sent: broadcasts?.filter(b => b.status === 'sent').length || 0,
      scheduled: broadcasts?.filter(b => b.status === 'scheduled').length || 0,
      draft: broadcasts?.filter(b => b.status === 'draft').length || 0,
      totalRecipients: broadcasts?.reduce((sum, b) => sum + (b.recipient_count || 0), 0) || 0,
      totalDelivered: broadcasts?.reduce((sum, b) => sum + (b.delivered_count || 0), 0) || 0,
      totalOpened: broadcasts?.reduce((sum, b) => sum + (b.opened_count || 0), 0) || 0,
      avgOpenRate: broadcasts && broadcasts.length > 0
        ? broadcasts.reduce((sum, b) => sum + (b.open_rate || 0), 0) / broadcasts.length
        : 0
    }

    logger.info('Broadcast stats retrieved successfully')
    return actionSuccess(stats, 'Broadcast stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting broadcast stats', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
