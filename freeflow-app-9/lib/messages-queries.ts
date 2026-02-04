/**
 * Messages Queries - Supabase Integration for Messages Hub
 *
 * Complete messaging system with chats, messages, reactions, attachments, and read receipts.
 * Supports direct messages, group chats, and channels with real-time capabilities.
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import type { DatabaseError } from '@/lib/types/database'

const logger = createSimpleLogger('MessagesQueries')

// ============================================================================
// TYPES
// ============================================================================

export type ChatType = 'direct' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' | 'contact'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type MemberRole = 'owner' | 'admin' | 'member'

export interface Chat {
  id: string
  user_id: string
  name: string
  description: string | null
  avatar_url: string | null
  type: ChatType
  is_pinned: boolean
  is_muted: boolean
  is_archived: boolean
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ChatMember {
  id: string
  chat_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  last_read_at: string | null
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  text: string
  type: MessageType
  status: MessageStatus
  reply_to_id: string | null
  is_edited: boolean
  edited_at: string | null
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface MessageAttachment {
  id: string
  message_id: string
  name: string
  url: string
  type: string
  size_bytes: number
  thumbnail_url: string | null
  width: number | null
  height: number | null
  created_at: string
}

export interface MessageReadReceipt {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

export interface ChatFilters {
  type?: ChatType
  is_pinned?: boolean
  is_archived?: boolean
  is_muted?: boolean
  search?: string
}

export interface MessageFilters {
  type?: MessageType
  sender_id?: string
  has_attachments?: boolean
  is_pinned?: boolean
  date_from?: string
  date_to?: string
}

export interface ChatStats {
  total_chats: number
  direct_chats: number
  group_chats: number
  channels: number
  unread_count: number
  pinned_count: number
  archived_count: number
  total_messages: number
}

// ============================================================================
// CHAT OPERATIONS
// ============================================================================

/**
 * Get all chats for a user with optional filtering
 */
export async function getChats(
  userId: string,
  filters?: ChatFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: Chat[]; error: DatabaseError | null; count: number }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()
    let query = supabase
      .from('chats')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.is_pinned !== undefined) {
      query = query.eq('is_pinned', filters.is_pinned)
    }
    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived)
    }
    if (filters?.is_muted !== undefined) {
      query = query.eq('is_muted', filters.is_muted)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error, count } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Failed to fetch chats', {
        error: error.message,
        userId,
        filters,
        duration
      })
      return { data: [], error, count: 0 }
    }

    logger.info('Chats fetched successfully', {
      count: data?.length || 0,
      total: count,
      userId,
      filters,
      duration
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getChats', { error: err.message, userId })
    return { data: [], error: { message: err.message }, count: 0 }
  }
}

/**
 * Create a new chat (direct or group)
 */
export async function createChat(
  userId: string,
  chatData: Partial<Chat>
): Promise<{ data: Chat | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        name: chatData.name,
        description: chatData.description,
        avatar_url: chatData.avatar_url,
        type: chatData.type || 'direct',
        is_pinned: chatData.is_pinned || false,
        is_muted: chatData.is_muted || false,
        is_archived: chatData.is_archived || false,
        unread_count: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create chat', {
        error: error.message,
        userId,
        chatName: chatData.name
      })
      return { data: null, error }
    }

    logger.info('Chat created successfully', {
      chatId: data.id,
      chatName: data.name,
      chatType: data.type,
      userId
    })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in createChat', { error: err.message, userId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Update chat details
 */
export async function updateChat(
  chatId: string,
  updates: Partial<Chat>
): Promise<{ data: Chat | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('chats')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update chat', { error: error.message, chatId })
      return { data: null, error }
    }

    logger.info('Chat updated successfully', { chatId, updates })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in updateChat', { error: err.message, chatId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (error) {
      logger.error('Failed to delete chat', { error: error.message, chatId })
      return { error }
    }

    logger.info('Chat deleted successfully', { chatId })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in deleteChat', { error: err.message, chatId })
    return { error: { message: err.message } }
  }
}

/**
 * Toggle chat pin status
 */
export async function toggleChatPin(
  chatId: string,
  isPinned: boolean
): Promise<{ data: Chat | null; error: DatabaseError | null }> {
  return updateChat(chatId, { is_pinned: isPinned })
}

/**
 * Toggle chat mute status
 */
export async function toggleChatMute(
  chatId: string,
  isMuted: boolean
): Promise<{ data: Chat | null; error: DatabaseError | null }> {
  return updateChat(chatId, { is_muted: isMuted })
}

/**
 * Toggle chat archive status
 */
export async function toggleChatArchive(
  chatId: string,
  isArchived: boolean
): Promise<{ data: Chat | null; error: DatabaseError | null }> {
  return updateChat(chatId, { is_archived: isArchived })
}

/**
 * Update unread count for a chat
 */
export async function updateUnreadCount(
  chatId: string,
  count: number
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('chats')
      .update({ unread_count: count })
      .eq('id', chatId)

    if (error) {
      logger.error('Failed to update unread count', { error: error.message, chatId, count })
      return { error }
    }

    logger.debug('Unread count updated', { chatId, count })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in updateUnreadCount', { error: err.message, chatId })
    return { error: { message: err.message } }
  }
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Get messages for a chat with pagination
 */
export async function getMessages(
  chatId: string,
  filters?: MessageFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: Message[]; error: DatabaseError | null; count: number }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.sender_id) {
      query = query.eq('sender_id', filters.sender_id)
    }
    if (filters?.is_pinned !== undefined) {
      query = query.eq('is_pinned', filters.is_pinned)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error, count } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Failed to fetch messages', {
        error: error.message,
        chatId,
        filters,
        duration
      })
      return { data: [], error, count: 0 }
    }

    logger.info('Messages fetched successfully', {
      count: data?.length || 0,
      total: count,
      chatId,
      duration
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getMessages', { error: err.message, chatId })
    return { data: [], error: { message: err.message }, count: 0 }
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  messageData: Partial<Message>
): Promise<{ data: Message | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        text: messageData.text || '',
        type: messageData.type || 'text',
        status: messageData.status || 'sent',
        reply_to_id: messageData.reply_to_id,
        is_edited: false,
        is_pinned: false,
        is_deleted: false
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send message', {
        error: error.message,
        chatId,
        senderId
      })
      return { data: null, error }
    }

    // Update chat's last_message_at
    await supabase
      .from('chats')
      .update({ last_message_at: data.created_at })
      .eq('id', chatId)

    logger.info('Message sent successfully', {
      messageId: data.id,
      chatId,
      senderId,
      type: data.type
    })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in sendMessage', { error: err.message, chatId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Edit an existing message
 */
export async function editMessage(
  messageId: string,
  text: string
): Promise<{ data: Message | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('messages')
      .update({
        text,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to edit message', { error: error.message, messageId })
      return { data: null, error }
    }

    logger.info('Message edited successfully', { messageId })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in editMessage', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: string): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)

    if (error) {
      logger.error('Failed to delete message', { error: error.message, messageId })
      return { error }
    }

    logger.info('Message deleted successfully', { messageId })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in deleteMessage', { error: err.message, messageId })
    return { error: { message: err.message } }
  }
}

/**
 * Bulk delete messages
 */
export async function bulkDeleteMessages(messageIds: string[]): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .in('id', messageIds)

    if (error) {
      logger.error('Failed to bulk delete messages', {
        error: error.message,
        count: messageIds.length
      })
      return { error }
    }

    logger.info('Messages bulk deleted successfully', { count: messageIds.length })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in bulkDeleteMessages', { error: err.message })
    return { error: { message: err.message } }
  }
}

/**
 * Toggle message pin status
 */
export async function toggleMessagePin(
  messageId: string,
  isPinned: boolean
): Promise<{ data: Message | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle message pin', { error: error.message, messageId })
      return { data: null, error }
    }

    logger.info('Message pin toggled', { messageId, isPinned })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in toggleMessagePin', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<{ data: Message | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update message status', { error: error.message, messageId })
      return { data: null, error }
    }

    logger.debug('Message status updated', { messageId, status })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in updateMessageStatus', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Search messages across all chats
 */
export async function searchMessages(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: Message[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Get user's chats first
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', userId)

    if (!chats || chats.length === 0) {
      return { data: [], error: null }
    }

    const chatIds = chats.map((c: { id: string }) => c.id)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('chat_id', chatIds)
      .ilike('text', `%${searchTerm}%`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to search messages', {
        error: error.message,
        userId,
        searchTerm
      })
      return { data: [], error }
    }

    logger.info('Messages search completed', {
      count: data?.length || 0,
      searchTerm,
      userId
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in searchMessages', { error: err.message, userId })
    return { data: [], error: { message: err.message } }
  }
}

// ============================================================================
// REACTION OPERATIONS
// ============================================================================

/**
 * Add a reaction to a message
 */
export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ data: MessageReaction | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add reaction', {
        error: error.message,
        messageId,
        emoji
      })
      return { data: null, error }
    }

    logger.info('Reaction added successfully', { messageId, emoji })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in addReaction', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)

    if (error) {
      logger.error('Failed to remove reaction', {
        error: error.message,
        messageId,
        emoji
      })
      return { error }
    }

    logger.info('Reaction removed successfully', { messageId, emoji })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in removeReaction', { error: err.message, messageId })
    return { error: { message: err.message } }
  }
}

/**
 * Get reactions for a message
 */
export async function getReactions(
  messageId: string
): Promise<{ data: MessageReaction[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch reactions', { error: error.message, messageId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getReactions', { error: err.message, messageId })
    return { data: [], error: { message: err.message } }
  }
}

// ============================================================================
// ATTACHMENT OPERATIONS
// ============================================================================

/**
 * Add attachment to a message
 */
export async function addAttachment(
  messageId: string,
  attachmentData: Partial<MessageAttachment>
): Promise<{ data: MessageAttachment | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        name: attachmentData.name || '',
        url: attachmentData.url || '',
        type: attachmentData.type || 'file',
        size_bytes: attachmentData.size_bytes || 0,
        thumbnail_url: attachmentData.thumbnail_url,
        width: attachmentData.width,
        height: attachmentData.height
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add attachment', {
        error: error.message,
        messageId
      })
      return { data: null, error }
    }

    logger.info('Attachment added successfully', {
      messageId,
      attachmentId: data.id,
      type: data.type
    })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in addAttachment', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Get attachments for a message
 */
export async function getAttachments(
  messageId: string
): Promise<{ data: MessageAttachment[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch attachments', { error: error.message, messageId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getAttachments', { error: err.message, messageId })
    return { data: [], error: { message: err.message } }
  }
}

/**
 * Get all attachments for a chat
 */
export async function getChatAttachments(
  chatId: string,
  type?: string
): Promise<{ data: MessageAttachment[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    // Get all messages for this chat
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)

    if (!messages || messages.length === 0) {
      return { data: [], error: null }
    }

    const messageIds = messages.map((m: { id: string }) => m.id)

    let query = supabase
      .from('message_attachments')
      .select('*')
      .in('message_id', messageIds)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch chat attachments', { error: error.message, chatId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getChatAttachments', { error: err.message, chatId })
    return { data: [], error: { message: err.message } }
  }
}

// ============================================================================
// READ RECEIPT OPERATIONS
// ============================================================================

/**
 * Mark message as read
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<{ data: MessageReadReceipt | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_read_receipts')
      .insert({
        message_id: messageId,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      // Ignore duplicate key errors (already read)
      if (error.code === '23505') {
        return { data: null, error: null }
      }
      logger.error('Failed to mark message as read', {
        error: error.message,
        messageId
      })
      return { data: null, error }
    }

    logger.debug('Message marked as read', { messageId, userId })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in markMessageAsRead', { error: err.message, messageId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Get read receipts for a message
 */
export async function getReadReceipts(
  messageId: string
): Promise<{ data: MessageReadReceipt[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('message_read_receipts')
      .select('*')
      .eq('message_id', messageId)
      .order('read_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch read receipts', { error: error.message, messageId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getReadReceipts', { error: err.message, messageId })
    return { data: [], error: { message: err.message } }
  }
}

// ============================================================================
// CHAT MEMBER OPERATIONS
// ============================================================================

/**
 * Add member to a chat
 */
export async function addChatMember(
  chatId: string,
  userId: string,
  role: MemberRole = 'member'
): Promise<{ data: ChatMember | null; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('chat_members')
      .insert({
        chat_id: chatId,
        user_id: userId,
        role
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add chat member', {
        error: error.message,
        chatId,
        userId
      })
      return { data: null, error }
    }

    logger.info('Chat member added successfully', { chatId, userId, role })

    return { data, error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in addChatMember', { error: err.message, chatId })
    return { data: null, error: { message: err.message } }
  }
}

/**
 * Remove member from a chat
 */
export async function removeChatMember(
  chatId: string,
  userId: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('chat_members')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to remove chat member', {
        error: error.message,
        chatId,
        userId
      })
      return { error }
    }

    logger.info('Chat member removed successfully', { chatId, userId })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in removeChatMember', { error: err.message, chatId })
    return { error: { message: err.message } }
  }
}

/**
 * Get members of a chat
 */
export async function getChatMembers(
  chatId: string
): Promise<{ data: ChatMember[]; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('chat_members')
      .select('*')
      .eq('chat_id', chatId)
      .order('joined_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch chat members', { error: error.message, chatId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getChatMembers', { error: err.message, chatId })
    return { data: [], error: { message: err.message } }
  }
}

/**
 * Update member's last read timestamp
 */
export async function updateLastReadAt(
  chatId: string,
  userId: string
): Promise<{ error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to update last read at', {
        error: error.message,
        chatId,
        userId
      })
      return { error }
    }

    logger.debug('Last read timestamp updated', { chatId, userId })

    return { error: null }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in updateLastReadAt', { error: err.message, chatId })
    return { error: { message: err.message } }
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get chat statistics for a user
 */
export async function getChatStats(userId: string): Promise<ChatStats> {
  try {
    const supabase = createClient()

    const { data: chats } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)

    if (!chats) {
      return {
        total_chats: 0,
        direct_chats: 0,
        group_chats: 0,
        channels: 0,
        unread_count: 0,
        pinned_count: 0,
        archived_count: 0,
        total_messages: 0
      }
    }

    const stats: ChatStats = {
      total_chats: chats.length,
      direct_chats: chats.filter((c: Chat) => c.type === 'direct').length,
      group_chats: chats.filter((c: Chat) => c.type === 'group').length,
      channels: chats.filter((c: Chat) => c.type === 'channel').length,
      unread_count: chats.reduce((sum: number, c: Chat) => sum + (c.unread_count || 0), 0),
      pinned_count: chats.filter((c: Chat) => c.is_pinned).length,
      archived_count: chats.filter((c: Chat) => c.is_archived).length,
      total_messages: 0
    }

    // Get total message count
    const chatIds = chats.map((c: Chat) => c.id)
    if (chatIds.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('is_deleted', false)

      stats.total_messages = count || 0
    }

    logger.info('Chat stats calculated', { userId, stats })

    return stats
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Exception in getChatStats', { error: err.message, userId })
    return {
      total_chats: 0,
      direct_chats: 0,
      group_chats: 0,
      channels: 0,
      unread_count: 0,
      pinned_count: 0,
      archived_count: 0,
      total_messages: 0
    }
  }
}
