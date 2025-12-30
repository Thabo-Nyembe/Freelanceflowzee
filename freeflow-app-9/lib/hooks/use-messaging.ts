'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

// Types
export type ConversationType = 'direct' | 'group' | 'channel' | 'support' | 'system'
export type ConversationStatus = 'active' | 'archived' | 'muted' | 'blocked' | 'deleted'
export type MessageContentType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'link' | 'emoji' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted'

export interface Conversation {
  id: string
  user_id: string
  conversation_name: string | null
  conversation_type: ConversationType
  participant_ids: string[] | null
  participant_emails: string[] | null
  participant_count: number
  status: ConversationStatus
  is_pinned: boolean
  is_starred: boolean
  is_muted: boolean
  last_message_id: string | null
  last_message_preview: string | null
  last_message_at: string | null
  last_message_by: string | null
  unread_count: number
  last_read_at: string | null
  notification_enabled: boolean
  auto_archive_days: number | null
  avatar_url: string | null
  color: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DirectMessage {
  id: string
  user_id: string
  conversation_id: string | null
  content: string
  content_type: MessageContentType
  sender_id: string
  sender_name: string | null
  sender_email: string | null
  sender_avatar: string | null
  recipient_id: string | null
  recipient_email: string | null
  status: MessageStatus
  is_edited: boolean
  is_forwarded: boolean
  is_reply: boolean
  reply_to_id: string | null
  reply_preview: string | null
  attachments: unknown[]
  attachment_count: number
  reactions: Record<string, unknown>
  reaction_count: number
  read_by: string[] | null
  read_at: string | null
  delivered_at: string | null
  metadata: Record<string, unknown>
  sent_at: string
  edited_at: string | null
  created_at: string
  deleted_at: string | null
}

// Hook Options
interface UseConversationsOptions {
  type?: ConversationType | 'all'
  status?: ConversationStatus | 'all'
  starred?: boolean
  pinned?: boolean
}

interface UseDirectMessagesOptions {
  conversationId?: string
  status?: MessageStatus | 'all'
  contentType?: MessageContentType | 'all'
}

// Conversations Hook
export function useConversations(options: UseConversationsOptions = {}) {
  const { type, status, starred, pinned } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('conversations')
      .select('*')
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (type && type !== 'all') {
      query = query.eq('conversation_type', type)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (starred !== undefined) {
      query = query.eq('is_starred', starred)
    }

    if (pinned !== undefined) {
      query = query.eq('is_pinned', pinned)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Conversation>(
    'conversations',
    buildQuery,
    [type, status, starred, pinned]
  )

  return {
    conversations: data,
    loading,
    error,
    refetch
  }
}

// Direct Messages Hook
export function useDirectMessages(options: UseDirectMessagesOptions = {}) {
  const { conversationId, status, contentType } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('direct_messages')
      .select('*')
      .is('deleted_at', null)
      .order('sent_at', { ascending: true })

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (contentType && contentType !== 'all') {
      query = query.eq('content_type', contentType)
    }

    return query
  }

  const { data, loading, error, refetch } = useSupabaseQuery<DirectMessage>(
    'direct_messages',
    buildQuery,
    [conversationId, status, contentType]
  )

  return {
    messages: data,
    loading,
    error,
    refetch
  }
}

// Unread Conversations Hook
export function useUnreadConversations() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('conversations')
      .select('*')
      .gt('unread_count', 0)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false })
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Conversation>(
    'conversations',
    buildQuery,
    ['unread']
  )

  return {
    unreadConversations: data,
    totalUnread: data.reduce((sum, conv) => sum + conv.unread_count, 0),
    loading,
    error,
    refetch
  }
}

// Starred Conversations Hook
export function useStarredConversations() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('conversations')
      .select('*')
      .eq('is_starred', true)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false })
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Conversation>(
    'conversations',
    buildQuery,
    ['starred']
  )

  return {
    starredConversations: data,
    loading,
    error,
    refetch
  }
}

// Messaging Mutations
export function useMessagingMutations() {
  const conversationMutation = useSupabaseMutation({
    table: 'conversations',
    onSuccess: () => {},
  })

  const messageMutation = useSupabaseMutation({
    table: 'direct_messages',
    onSuccess: () => {},
  })

  return {
    createConversation: conversationMutation,
    updateConversation: conversationMutation,
    deleteConversation: conversationMutation,
    sendMessage: messageMutation,
    updateMessage: messageMutation,
    deleteMessage: messageMutation
  }
}

// Messaging Stats Hook
export function useMessagingStats() {
  const { conversations } = useConversations()
  const { messages } = useDirectMessages()

  const totalConversations = conversations.length
  const activeConversations = conversations.filter(c => c.status === 'active').length
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)
  const totalMessages = messages.length
  const starredCount = conversations.filter(c => c.is_starred).length
  const pinnedCount = conversations.filter(c => c.is_pinned).length

  return {
    totalConversations,
    activeConversations,
    totalUnread,
    totalMessages,
    starredCount,
    pinnedCount
  }
}
