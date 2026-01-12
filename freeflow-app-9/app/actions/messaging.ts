'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ConversationType, MessageContentType } from '@/lib/hooks/use-messaging'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('messaging-actions')

// =============================================
// CONVERSATION ACTIONS
// =============================================

export async function createConversation(data: {
  conversation_name?: string
  conversation_type?: ConversationType
  participant_ids?: string[]
  participant_emails?: string[]
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createConversation')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating conversation', { userId: user.id, type: data.conversation_type })

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        conversation_name: data.conversation_name,
        conversation_type: data.conversation_type || 'direct',
        participant_ids: data.participant_ids ? [user.id, ...data.participant_ids] : [user.id],
        participant_emails: data.participant_emails ? [user.email, ...data.participant_emails] : [user.email],
        participant_count: (data.participant_ids?.length || 0) + 1,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create conversation', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/messaging-v2')
    logger.info('Conversation created successfully', { conversationId: conversation.id })
    return actionSuccess(conversation, 'Conversation created successfully')
  } catch (error) {
    logger.error('Unexpected error in createConversation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateConversation(id: string, updates: {
  conversation_name?: string
  is_pinned?: boolean
  is_starred?: boolean
  is_muted?: boolean
  notification_enabled?: boolean
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateConversation')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating conversation', { userId: user.id, conversationId: id })

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update conversation', { error: error.message, conversationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/messaging-v2')
    logger.info('Conversation updated successfully', { conversationId: conversation.id })
    return actionSuccess(conversation, 'Conversation updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateConversation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveConversation(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function unarchiveConversation(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function starConversation(id: string, starred: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ is_starred: starred })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function pinConversation(id: string, pinned: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ is_pinned: pinned })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function markConversationAsRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({
      unread_count: 0,
      last_read_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function deleteConversation(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteConversation')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting conversation', { userId: user.id, conversationId: id })

    const { error } = await supabase
      .from('conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete conversation', { error: error.message, conversationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/messaging-v2')
    logger.info('Conversation deleted successfully', { conversationId: id })
    return actionSuccess({ success: true }, 'Conversation deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteConversation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =============================================
// MESSAGE ACTIONS
// =============================================

export async function sendMessage(data: {
  conversation_id: string
  content: string
  content_type?: MessageContentType
  recipient_id?: string
  recipient_email?: string
  attachments?: unknown[]
  reply_to_id?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to sendMessage')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Sending message', { userId: user.id, conversationId: data.conversation_id })

    const { data: message, error } = await supabase
      .from('direct_messages')
      .insert({
        user_id: user.id,
        conversation_id: data.conversation_id,
        content: data.content,
        content_type: data.content_type || 'text',
        sender_id: user.id,
        sender_name: user.email?.split('@')[0],
        sender_email: user.email,
        recipient_id: data.recipient_id,
        recipient_email: data.recipient_email,
        attachments: data.attachments || [],
        attachment_count: data.attachments?.length || 0,
        reply_to_id: data.reply_to_id,
        is_reply: !!data.reply_to_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send message', { error: error.message, conversationId: data.conversation_id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message_id: message.id,
        last_message_preview: data.content.substring(0, 500),
        last_message_at: message.sent_at,
        last_message_by: user.email
      })
      .eq('id', data.conversation_id)

    revalidatePath('/dashboard/messaging-v2')
    logger.info('Message sent successfully', { messageId: message.id })
    return actionSuccess(message, 'Message sent successfully')
  } catch (error) {
    logger.error('Unexpected error in sendMessage', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function editMessage(id: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error } = await supabase
    .from('direct_messages')
    .update({
      content,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('sender_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return message
}

export async function markMessageAsRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error } = await supabase
    .from('direct_messages')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      read_by: [user.id]
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return message
}

export async function addReaction(messageId: string, reaction: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current reactions
  const { data: message, error: fetchError } = await supabase
    .from('direct_messages')
    .select('reactions, reaction_count')
    .eq('id', messageId)
    .single()

  if (fetchError) throw fetchError

  const reactions = message.reactions || {}
  if (!reactions[reaction]) {
    reactions[reaction] = []
  }
  if (!reactions[reaction].includes(user.id)) {
    reactions[reaction].push(user.id)
  }

  const { data: updatedMessage, error } = await supabase
    .from('direct_messages')
    .update({
      reactions,
      reaction_count: Object.values(reactions).flat().length
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return updatedMessage
}

export async function removeReaction(messageId: string, reaction: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error: fetchError } = await supabase
    .from('direct_messages')
    .select('reactions, reaction_count')
    .eq('id', messageId)
    .single()

  if (fetchError) throw fetchError

  const reactions = message.reactions || {}
  if (reactions[reaction]) {
    reactions[reaction] = reactions[reaction].filter((id: string) => id !== user.id)
    if (reactions[reaction].length === 0) {
      delete reactions[reaction]
    }
  }

  const { data: updatedMessage, error } = await supabase
    .from('direct_messages')
    .update({
      reactions,
      reaction_count: Object.values(reactions).flat().length
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return updatedMessage
}

export async function deleteMessage(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteMessage')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting message', { userId: user.id, messageId: id })

    const { error } = await supabase
      .from('direct_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('sender_id', user.id)

    if (error) {
      logger.error('Failed to delete message', { error: error.message, messageId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/messaging-v2')
    logger.info('Message deleted successfully', { messageId: id })
    return actionSuccess({ success: true }, 'Message deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteMessage', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =============================================
// STATS & SEARCH
// =============================================

export async function getMessagingStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getMessagingStats')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching messaging stats', { userId: user.id })

    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, unread_count, status, is_starred')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const { data: messages } = await supabase
      .from('direct_messages')
      .select('id, status')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const totalConversations = conversations?.length || 0
    const activeConversations = conversations?.filter(c => c.status === 'active').length || 0
    const totalUnread = conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0
    const totalMessages = messages?.length || 0
    const starredCount = conversations?.filter(c => c.is_starred).length || 0

    const stats = {
      totalConversations,
      activeConversations,
      totalUnread,
      totalMessages,
      starredCount
    }

    logger.info('Messaging stats fetched successfully', { totalConversations, totalMessages })
    return actionSuccess(stats, 'Messaging stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getMessagingStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function searchMessages(query: string, conversationId?: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to searchMessages')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Searching messages', { userId: user.id, query, conversationId })

    let queryBuilder = supabase
      .from('direct_messages')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .ilike('content', `%${query}%`)
      .order('sent_at', { ascending: false })

    if (conversationId) {
      queryBuilder = queryBuilder.eq('conversation_id', conversationId)
    }

    const { data, error } = await queryBuilder.limit(50)

    if (error) {
      logger.error('Failed to search messages', { error: error.message, query })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Messages search completed', { resultCount: data?.length || 0, query })
    return actionSuccess(data || [], 'Messages search completed successfully')
  } catch (error) {
    logger.error('Unexpected error in searchMessages', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
