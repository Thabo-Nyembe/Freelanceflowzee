'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { getEmailService } from '@/lib/email/email-service'

const logger = createFeatureLogger('broadcasts-actions')
const emailService = getEmailService()

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
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error creating broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBroadcast(id: string, data: Partial<CreateBroadcastData>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error updating broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteBroadcast(id: string, hardDelete: boolean = false): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error deleting broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function sendBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get the broadcast with all details
    const { data: broadcast, error: fetchError } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !broadcast) {
      logger.error('Broadcast not found', fetchError)
      return actionError('Broadcast not found', 'NOT_FOUND')
    }

    // Update status to sending
    await supabase
      .from('broadcasts')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', id)

    // Get recipient emails
    let recipientEmails: string[] = []

    if (broadcast.recipient_type === 'all') {
      // Get all users with email
      const { data: users } = await supabase
        .from('users')
        .select('email')
        .not('email', 'is', null)

      recipientEmails = users?.map(u => u.email).filter(Boolean) || []
    } else if (broadcast.recipient_list) {
      // Use provided recipient list
      recipientEmails = Array.isArray(broadcast.recipient_list)
        ? broadcast.recipient_list
        : [broadcast.recipient_list]
    }

    // Send emails in batches
    let deliveredCount = 0
    let failedCount = 0

    if (recipientEmails.length > 0) {
      const emailMessages = recipientEmails.map(email => ({
        to: email,
        from: broadcast.sender_email || undefined,
        subject: broadcast.subject || broadcast.title,
        html: broadcast.html_content || `<p>${broadcast.message}</p>`,
        text: broadcast.plain_text_content || broadcast.message,
        tags: broadcast.tags || [],
        metadata: {
          broadcast_id: id,
          campaign_id: id
        }
      }))

      // Send batch emails
      const result = await emailService.sendBatch(emailMessages)
      deliveredCount = result.successful
      failedCount = result.failed

      logger.info('Broadcast emails sent', {
        broadcastId: id,
        total: emailMessages.length,
        successful: deliveredCount,
        failed: failedCount
      })
    }

    // Update broadcast with results
    await supabase
      .from('broadcasts')
      .update({
        status: 'sent',
        recipient_count: recipientEmails.length,
        delivered_count: deliveredCount,
        failed_count: failedCount
      })
      .eq('id', id)

    // Update the broadcast object for return
    broadcast.status = 'sent'
    broadcast.delivered_count = deliveredCount
    broadcast.failed_count = failedCount

    revalidatePath('/dashboard/broadcasts-v2')
    logger.info('Broadcast sent successfully', {
      broadcastId: id,
      recipients: recipientEmails.length,
      delivered: deliveredCount
    })

    return actionSuccess(broadcast, `Broadcast sent to ${deliveredCount} recipients`)
  } catch (error) {
    logger.error('Unexpected error sending broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pauseBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error pausing broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resumeBroadcast(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error resuming broadcast', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getBroadcastStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

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
  } catch (error) {
    logger.error('Unexpected error getting broadcast stats', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
