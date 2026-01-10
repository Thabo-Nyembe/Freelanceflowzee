// Server Actions for Messages Management
// Created: December 14, 2024
// Updated to A+++ Standard

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  type ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema, dateSchema } from '@/lib/validations'

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('messages')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createMessageSchema = z.object({
  recipient_id: uuidSchema,
  subject: z.string().max(255).optional().nullable(),
  body: z.string().min(1, 'Message body is required').max(10000),
  message_type: z.enum(['direct', 'group', 'broadcast', 'system']).default('direct'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachments: z.array(z.object({
    id: uuidSchema,
    name: z.string().max(255),
    url: z.string().url(),
    type: z.string().max(100),
    size: z.number().int().min(0).optional()
  })).optional(),
  thread_id: uuidSchema.optional().nullable(),
  parent_message_id: uuidSchema.optional().nullable(),
  reply_to_message_id: uuidSchema.optional().nullable(),
  labels: z.array(z.string().max(50)).max(20).optional(),
  category: z.string().max(50).optional().nullable(),
  folder: z.enum(['inbox', 'sent', 'drafts', 'archive', 'trash', 'spam']).default('inbox'),
  scheduled_for: dateSchema.optional().nullable(),
  metadata: z.record(z.unknown()).optional()
})

const updateMessageSchema = createMessageSchema.partial()

// ============================================
// TYPE DEFINITIONS
// ============================================

interface MessageData {
  id: string
  user_id: string
  sender_id: string
  recipient_id: string
  subject?: string | null
  body: string
  message_type: string
  priority: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
    size?: number
  }>
  thread_id?: string | null
  parent_message_id?: string | null
  reply_to_message_id?: string | null
  labels?: string[]
  category?: string | null
  folder: string
  scheduled_for?: string | null
  is_read: boolean
  read_at?: string | null
  is_starred: boolean
  is_scheduled: boolean
  sent_at?: string | null
  status: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface MessageStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byFolder: Record<string, number>
  unread: number
  sent: number
  received: number
}

type CreateMessageInput = z.infer<typeof createMessageSchema>
type UpdateMessageInput = z.infer<typeof updateMessageSchema>

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create and send a new message
 */
export async function createMessage(
  data: CreateMessageInput
): Promise<ActionResult<MessageData>> {
  try {
    // Validate input
    const validation = createMessageSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Message creation validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Message creation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ...validation.data,
        user_id: user.id,
        sender_id: user.id,
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create message', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message created successfully', {
      messageId: message.id,
      userId: user.id,
      recipientId: message.recipient_id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, 'Message sent successfully')
  } catch (error) {
    logger.error('Unexpected error creating message', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing message
 */
export async function updateMessage(
  id: string,
  data: UpdateMessageInput
): Promise<ActionResult<MessageData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    // Validate input
    const validation = updateMessageSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Message update validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Message update attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update message (only if sender)
    const { data: message, error } = await supabase
      .from('messages')
      .update(validation.data)
      .eq('id', id)
      .eq('sender_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update message', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message updated successfully', {
      messageId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, 'Message updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating message', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Message deletion attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete message (only if sender)
    const { error } = await supabase
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('id', id)
      .eq('sender_id', user.id)

    if (error) {
      logger.error('Failed to delete message', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message deleted successfully', {
      messageId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess({ deleted: true }, 'Message deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting message', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(id: string): Promise<ActionResult<MessageData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Mark message as read attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Mark as read (only if recipient)
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('id', id)
      .eq('recipient_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark message as read', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message marked as read', {
      messageId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, 'Message marked as read')
  } catch (error) {
    logger.error('Unexpected error marking message as read', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Toggle star status on a message
 */
export async function toggleStarMessage(id: string): Promise<ActionResult<MessageData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Toggle star message attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current state
    const { data: currentMessage, error: fetchError } = await supabase
      .from('messages')
      .select('is_starred')
      .eq('id', id)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .single()

    if (fetchError || !currentMessage) {
      logger.error('Message not found', { error: fetchError, userId: user.id, messageId: id })
      return actionError('Message not found', 'NOT_FOUND')
    }

    // Toggle star status
    const { data: message, error } = await supabase
      .from('messages')
      .update({ is_starred: !currentMessage.is_starred })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle star message', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message star toggled', {
      messageId: id,
      userId: user.id,
      isStarred: message.is_starred
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, message.is_starred ? 'Message starred' : 'Message unstarred')
  } catch (error) {
    logger.error('Unexpected error toggling star message', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Archive a message
 */
export async function archiveMessage(id: string): Promise<ActionResult<MessageData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Archive message attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Archive message
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        status: 'archived',
        folder: 'archive'
      })
      .eq('id', id)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive message', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Message archived', {
      messageId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, 'Message archived')
  } catch (error) {
    logger.error('Unexpected error archiving message', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Send a scheduled message immediately
 */
export async function sendScheduledMessage(id: string): Promise<ActionResult<MessageData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid message ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Send scheduled message attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Send scheduled message
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        is_scheduled: false
      })
      .eq('id', id)
      .eq('sender_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to send scheduled message', { error, userId: user.id, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Scheduled message sent', {
      messageId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/messages-v2')
    return actionSuccess(message as MessageData, 'Message sent successfully')
  } catch (error) {
    logger.error('Unexpected error sending scheduled message', { error, messageId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get message statistics
 */
export async function getMessageStats(): Promise<ActionResult<MessageStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get message stats attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Fetch all messages (sent and received)
    const { data: messages, error } = await supabase
      .from('messages')
      .select('status, message_type, is_read, folder, sender_id')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch message stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Calculate stats
    const stats: MessageStats = {
      total: messages?.length || 0,
      byStatus: {},
      byType: {},
      byFolder: {},
      unread: 0,
      sent: 0,
      received: 0
    }

    messages?.forEach(message => {
      stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1
      stats.byType[message.message_type] = (stats.byType[message.message_type] || 0) + 1
      stats.byFolder[message.folder] = (stats.byFolder[message.folder] || 0) + 1
      if (!message.is_read) stats.unread++
      if (message.sender_id === user.id) stats.sent++
      else stats.received++
    })

    logger.info('Message stats retrieved', {
      userId: user.id,
      total: stats.total,
      unread: stats.unread
    })

    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error getting message stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
