/**
 * Messages/Chat API Client
 *
 * Provides typed API access to messaging and chat functionality
 * Supports real-time messaging with Socket.io integration
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar: string | null
  content: string
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video'
  attachments: MessageAttachment[] | null
  is_read: boolean
  is_edited: boolean
  is_deleted: boolean
  replied_to_id: string | null
  reactions: MessageReaction[] | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
  read_at: string | null
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface MessageReaction {
  user_id: string
  emoji: string
  created_at: string
}

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'channel'
  name: string | null
  description: string | null
  avatar_url: string | null
  participants: ConversationParticipant[]
  last_message: Message | null
  unread_count: number
  is_muted: boolean
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  last_activity_at: string
}

export interface ConversationParticipant {
  user_id: string
  user_name: string
  user_avatar: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_read_at: string | null
}

export interface CreateMessageData {
  conversation_id: string
  content: string
  message_type?: 'text' | 'image' | 'file' | 'voice' | 'video'
  attachments?: Omit<MessageAttachment, 'id'>[]
  replied_to_id?: string
}

export interface UpdateMessageData {
  content?: string
  is_read?: boolean
  is_edited?: boolean
  is_deleted?: boolean
}

export interface CreateConversationData {
  type: 'direct' | 'group' | 'channel'
  name?: string
  description?: string
  participant_ids: string[]
}

export interface MessageFilters {
  conversation_id?: string
  sender_id?: string
  message_type?: ('text' | 'image' | 'file' | 'voice' | 'video')[]
  is_read?: boolean
  search?: string
  start_date?: string
  end_date?: string
}

export interface ConversationFilters {
  type?: ('direct' | 'group' | 'channel')[]
  is_archived?: boolean
  is_pinned?: boolean
  has_unread?: boolean
  search?: string
}

export interface MessagingStats {
  total_conversations: number
  unread_conversations: number
  total_messages_sent: number
  total_messages_received: number
  unread_messages: number
  active_conversations_today: number
  average_response_time: number // minutes
  most_active_conversations: Array<{
    conversation_id: string
    conversation_name: string
    message_count: number
  }>
}

class MessagesApiClient extends BaseApiClient {
  /**
   * Get all conversations with filters
   */
  async getConversations(
    page: number = 1,
    pageSize: number = 20,
    filters?: ConversationFilters
  ) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    let query = supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          users(name, avatar_url),
          role,
          joined_at,
          last_read_at
        ),
        last_message:messages(*)
      `, { count: 'exact' })
      .order('last_activity_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }

      if (filters.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived)
      }

      if (filters.is_pinned !== undefined) {
        query = query.eq('is_pinned', filters.is_pinned)
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as unknown as Conversation[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    pageSize: number = 50
  ) {
    const supabase = createClient()

    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as Message[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(messageData: CreateMessageData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        sender_id: user.id,
        message_type: messageData.message_type || 'text',
        is_read: false,
        is_edited: false,
        is_deleted: false
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Update conversation last_activity_at
    await supabase
      .from('conversations')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id)

    return {
      success: true,
      data: data as Message,
      error: null
    }
  }

  /**
   * Update a message
   */
  async updateMessage(id: string, updates: UpdateMessageData) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Message,
      error: null
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string) {
    return this.updateMessage(messageId, {
      is_read: true,
      read_at: new Date().toISOString()
    } as any)
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(conversationData: CreateConversationData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: conversationData.type,
        name: conversationData.name,
        description: conversationData.description,
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single()

    if (convError) {
      return {
        success: false,
        error: convError.message,
        data: null
      }
    }

    // Add participants (including current user as owner)
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString()
      },
      ...conversationData.participant_ids.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      }))
    ]

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) {
      // Rollback: delete conversation
      await supabase.from('conversations').delete().eq('id', conversation.id)
      return {
        success: false,
        error: participantsError.message,
        data: null
      }
    }

    return {
      success: true,
      data: conversation as unknown as Conversation,
      error: null
    }
  }

  /**
   * Get messaging statistics
   */
  async getMessagingStats() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get conversations where user is a participant
    const { data: userConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    const conversationIds = userConversations?.map(c => c.conversation_id) || []

    // Get stats
    const [
      { count: totalConversations },
      { data: messages },
      { count: unreadMessages }
    ] = await Promise.all([
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .in('id', conversationIds),
      supabase
        .from('messages')
        .select('sender_id, conversation_id')
        .in('conversation_id', conversationIds),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id)
    ])

    const messagesSent = messages?.filter(m => m.sender_id === user.id).length || 0
    const messagesReceived = messages?.filter(m => m.sender_id !== user.id).length || 0

    const stats: MessagingStats = {
      total_conversations: totalConversations || 0,
      unread_conversations: 0, // Calculate from unread messages
      total_messages_sent: messagesSent,
      total_messages_received: messagesReceived,
      unread_messages: unreadMessages || 0,
      active_conversations_today: 0,
      average_response_time: 0,
      most_active_conversations: []
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, emoji: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get current message
    const { data: message } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single()

    if (!message) {
      return {
        success: false,
        error: 'Message not found',
        data: null
      }
    }

    const reactions = message.reactions || []
    reactions.push({
      user_id: user.id,
      emoji,
      created_at: new Date().toISOString()
    })

    return this.updateMessage(messageId, { reactions } as any)
  }
}

export const messagesClient = new MessagesApiClient()
