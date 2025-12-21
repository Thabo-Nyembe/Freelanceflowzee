// Server Actions for Chat Management
// Created: December 14, 2024
// Updated: December 15, 2024 - A+++ Standard with structured error handling

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import { z } from 'zod'

const logger = createFeatureLogger('chat-actions')

// ============================================
// TYPES & INTERFACES
// ============================================

interface SendChatMessageData {
  room_id: string
  room_name?: string
  room_type?: string
  message: string
  message_type?: string
  attachments?: Record<string, unknown>
  media_url?: string
  media_type?: string
  reply_to_message_id?: string
  mentioned_users?: string[]
  metadata?: Record<string, unknown>
}

interface UpdateChatMessageData extends Partial<SendChatMessageData> {
  id: string
}

interface ChatMessage {
  id: string
  user_id: string
  sender_id: string
  room_id: string
  room_name?: string
  room_type?: string
  message: string
  message_type?: string
  attachments?: Record<string, unknown>
  media_url?: string
  media_type?: string
  reply_to_message_id?: string
  mentioned_users?: string[]
  metadata?: Record<string, unknown>
  status: string
  is_edited?: boolean
  edited_at?: string
  is_read?: boolean
  read_at?: string
  is_pinned?: boolean
  reactions?: Record<string, string[]>
  reaction_count?: number
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface ChatStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byRoomType: Record<string, number>
  unread: number
  sent: number
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const sendChatMessageSchema = z.object({
  room_id: uuidSchema,
  room_name: z.string().max(255).optional(),
  room_type: z.string().max(50).optional(),
  message: z.string().min(1).max(10000),
  message_type: z.string().max(50).optional(),
  attachments: z.record(z.unknown()).optional(),
  media_url: z.string().url().optional(),
  media_type: z.string().max(100).optional(),
  reply_to_message_id: uuidSchema.optional(),
  mentioned_users: z.array(uuidSchema).optional(),
  metadata: z.record(z.unknown()).optional()
})

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Send chat message
 */
export async function sendChatMessage(
  data: SendChatMessageData
): Promise<ActionResult<ChatMessage>> {
  try {
    // Validate input
    const validatedData = sendChatMessageSchema.parse(data)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized chat message attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: chatMessage, error } = await supabase
      .from('chat')
      .insert({
        ...validatedData,
        user_id: user.id,
        sender_id: user.id,
        status: 'sent'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send chat message', { error, userId: user.id })
      return actionError('Failed to send message', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Chat message sent successfully', { messageId: chatMessage.id, userId: user.id })
    return actionSuccess(chatMessage as ChatMessage, 'Message sent successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Chat message validation failed', { error: error.errors })
      return actionError('Invalid message data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error sending chat message', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update chat message
 */
export async function updateChatMessage(
  { id, ...data }: UpdateChatMessageData
): Promise<ActionResult<ChatMessage>> {
  try {
    // Validate ID
    uuidSchema.parse(id)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized chat message update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: chatMessage, error } = await supabase
      .from('chat')
      .update({
        ...data,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('sender_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update chat message', { error, messageId: id, userId: user.id })
      return actionError('Failed to update message', 'DATABASE_ERROR')
    }

    if (!chatMessage) {
      logger.warn('Chat message not found or unauthorized', { messageId: id, userId: user.id })
      return actionError('Message not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Chat message updated successfully', { messageId: id, userId: user.id })
    return actionSuccess(chatMessage as ChatMessage, 'Message updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Chat message ID validation failed', { error: error.errors })
      return actionError('Invalid message ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating chat message', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete chat message (soft delete)
 */
export async function deleteChatMessage(id: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(id)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized chat message deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('chat')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted',
        message: '[Message deleted]'
      })
      .eq('id', id)
      .eq('sender_id', user.id)

    if (error) {
      logger.error('Failed to delete chat message', { error, messageId: id, userId: user.id })
      return actionError('Failed to delete message', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Chat message deleted successfully', { messageId: id, userId: user.id })
    return actionSuccess({ success: true }, 'Message deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Chat message ID validation failed', { error: error.errors })
      return actionError('Invalid message ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting chat message', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark message as read
 */
export async function markChatMessageAsRead(id: string): Promise<ActionResult<ChatMessage>> {
  try {
    // Validate ID
    uuidSchema.parse(id)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized message read attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: chatMessage, error } = await supabase
      .from('chat')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark message as read', { error, messageId: id, userId: user.id })
      return actionError('Failed to mark message as read', 'DATABASE_ERROR')
    }

    if (!chatMessage) {
      logger.warn('Message not found', { messageId: id, userId: user.id })
      return actionError('Message not found', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Message marked as read', { messageId: id, userId: user.id })
    return actionSuccess(chatMessage as ChatMessage, 'Message marked as read')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Message ID validation failed', { error: error.errors })
      return actionError('Invalid message ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error marking message as read', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark all messages in room as read
 */
export async function markRoomMessagesAsRead(roomId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(roomId)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized room messages read attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('chat')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    if (error) {
      logger.error('Failed to mark room messages as read', { error, roomId, userId: user.id })
      return actionError('Failed to mark messages as read', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Room messages marked as read', { roomId, userId: user.id })
    return actionSuccess({ success: true }, 'Messages marked as read')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Room ID validation failed', { error: error.errors })
      return actionError('Invalid room ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error marking room messages as read', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Add reaction to message
 */
export async function addReactionToChatMessage(
  messageId: string,
  reaction: string
): Promise<ActionResult<ChatMessage>> {
  try {
    // Validate inputs
    uuidSchema.parse(messageId)
    z.string().min(1).max(50).parse(reaction)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized reaction attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get current reactions
    const { data: currentMessage, error: fetchError } = await supabase
      .from('chat')
      .select('reactions, reaction_count')
      .eq('id', messageId)
      .single()

    if (fetchError || !currentMessage) {
      logger.error('Failed to fetch message for reaction', { error: fetchError, messageId })
      return actionError('Message not found', 'NOT_FOUND')
    }

    const reactions = (currentMessage.reactions as Record<string, string[]>) || {}
    const userReactions = reactions[user.id] || []

    // Toggle reaction
    const newUserReactions = userReactions.includes(reaction)
      ? userReactions.filter((r: string) => r !== reaction)
      : [...userReactions, reaction]

    const newReactions = {
      ...reactions,
      [user.id]: newUserReactions
    }

    // Count total reactions
    const totalReactions = Object.values(newReactions).reduce(
      (sum: number, arr: string[]) => sum + arr.length,
      0
    )

    const { data: chatMessage, error } = await supabase
      .from('chat')
      .update({
        reactions: newReactions,
        reaction_count: totalReactions
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to add reaction', { error, messageId, userId: user.id })
      return actionError('Failed to add reaction', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Reaction toggled successfully', { messageId, reaction, userId: user.id })
    return actionSuccess(chatMessage as ChatMessage, 'Reaction updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Reaction validation failed', { error: error.errors })
      return actionError('Invalid reaction data', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error adding reaction', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Pin/unpin message
 */
export async function togglePinChatMessage(id: string): Promise<ActionResult<ChatMessage>> {
  try {
    // Validate ID
    uuidSchema.parse(id)

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized pin toggle attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get current state
    const { data: currentMessage, error: fetchError } = await supabase
      .from('chat')
      .select('is_pinned')
      .eq('id', id)
      .single()

    if (fetchError || !currentMessage) {
      logger.error('Failed to fetch message for pin toggle', { error: fetchError, messageId: id })
      return actionError('Message not found', 'NOT_FOUND')
    }

    const { data: chatMessage, error } = await supabase
      .from('chat')
      .update({ is_pinned: !currentMessage.is_pinned })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle pin', { error, messageId: id, userId: user.id })
      return actionError('Failed to toggle pin', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/chat-v2')
    logger.info('Message pin toggled successfully', { messageId: id, isPinned: !currentMessage.is_pinned, userId: user.id })
    return actionSuccess(chatMessage as ChatMessage, `Message ${!currentMessage.is_pinned ? 'pinned' : 'unpinned'} successfully`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Message ID validation failed', { error: error.errors })
      return actionError('Invalid message ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error toggling pin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get chat statistics
 */
export async function getChatStats(roomId?: string): Promise<ActionResult<ChatStats>> {
  try {
    // Validate room ID if provided
    if (roomId) {
      uuidSchema.parse(roomId)
    }

    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized stats request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('chat')
      .select('status, message_type, room_type, is_read')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data: messages, error } = await query

    if (error) {
      logger.error('Failed to fetch chat stats', { error, roomId, userId: user.id })
      return actionError('Failed to fetch chat statistics', 'DATABASE_ERROR')
    }

    const stats: ChatStats = {
      total: messages?.length || 0,
      byStatus: {},
      byType: {},
      byRoomType: {},
      unread: 0,
      sent: 0
    }

    messages?.forEach(message => {
      stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1
      stats.byType[message.message_type] = (stats.byType[message.message_type] || 0) + 1
      stats.byRoomType[message.room_type] = (stats.byRoomType[message.room_type] || 0) + 1
      if (!message.is_read) stats.unread++
    })

    logger.info('Chat stats retrieved successfully', { roomId, userId: user.id, totalMessages: stats.total })
    return actionSuccess(stats, 'Statistics retrieved successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Room ID validation failed', { error: error.errors })
      return actionError('Invalid room ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error fetching chat stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
