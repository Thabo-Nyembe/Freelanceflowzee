// Hook for Conversations/Chat management with Supabase
// Real-time chat system using chats, chat_members, and messages tables
// Created: January 2026

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Conversations')

// ============================================================================
// TYPES
// ============================================================================

export type ChatType = 'direct' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' | 'contact'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type MemberRole = 'owner' | 'admin' | 'member'

export interface Chat {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  type: ChatType
  creator_id: string
  is_archived: boolean
  created_at: string
  updated_at: string
  last_message_at: string | null
  metadata: Record<string, any>
  // Computed fields from joins
  unread_count?: number
  member_count?: number
  last_message?: ChatMessage | null
  members?: ChatMember[]
}

export interface ChatMember {
  id: string
  chat_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  left_at: string | null
  last_read_at: string | null
  is_muted: boolean
  mute_until: string | null
  custom_status: string | null
  metadata: Record<string, any>
  // User profile data from joins
  user?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  text: string
  type: MessageType
  status: MessageStatus
  reply_to_id: string | null
  thread_id: string | null
  is_edited: boolean
  edited_at: string | null
  is_pinned: boolean
  pinned_at: string | null
  pinned_by: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  metadata: Record<string, any>
  // Computed fields from joins
  sender?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  reactions?: MessageReaction[]
  attachments?: MessageAttachment[]
  read_by?: string[]
  reply_to?: ChatMessage | null
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
  mime_type: string
  size_bytes: number
  thumbnail_url: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  created_at: string
  metadata: Record<string, any>
}

export interface TypingIndicator {
  user_id: string
  user_name: string
  started_at: string
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseConversationsOptions {
  chatId?: string
  chatType?: ChatType | 'all'
  limit?: number
  enableRealtime?: boolean
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useConversations(options: UseConversationsOptions = {}) {
  const { chatId, chatType = 'all', limit = 50, enableRealtime = true } = options

  // State
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Loading states
  const [chatsLoading, setChatsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Error states
  const [chatsError, setChatsError] = useState<Error | null>(null)
  const [messagesError, setMessagesError] = useState<Error | null>(null)

  // Refs for realtime channels
  const chatsChannelRef = useRef<RealtimeChannel | null>(null)
  const messagesChannelRef = useRef<RealtimeChannel | null>(null)
  const typingChannelRef = useRef<RealtimeChannel | null>(null)

  const supabase = createClient()

  // ============================================================================
  // GET CURRENT USER
  // ============================================================================

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [supabase])

  // ============================================================================
  // FETCH CHATS
  // ============================================================================

  const fetchChats = useCallback(async () => {
    if (!currentUserId) return

    try {
      setChatsLoading(true)
      setChatsError(null)

      // Get chats where user is a member
      let query = supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner(
            user_id,
            role,
            last_read_at,
            is_muted
          )
        `)
        .eq('chat_members.user_id', currentUserId)
        .is('chat_members.left_at', null)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (chatType && chatType !== 'all') {
        query = query.eq('type', chatType)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data: chatsData, error: chatsErr } = await query

      if (chatsErr) throw chatsErr

      // Get unread counts and member counts for each chat
      const chatsWithCounts = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Get unread count
          const memberInfo = chat.chat_members?.[0]
          const lastReadAt = memberInfo?.last_read_at

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('is_deleted', false)
            .neq('sender_id', currentUserId)
            .gt('created_at', lastReadAt || '1970-01-01')

          // Get member count
          const { count: memberCount } = await supabase
            .from('chat_members')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .is('left_at', null)

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...chat,
            unread_count: unreadCount || 0,
            member_count: memberCount || 0,
            last_message: lastMessageData || null,
            chat_members: undefined // Remove the nested relation data
          } as Chat
        })
      )

      setChats(chatsWithCounts)
    } catch (err) {
      logger.error('Error fetching chats', { error: err })
      setChatsError(err instanceof Error ? err : new Error('Failed to fetch chats'))
    } finally {
      setChatsLoading(false)
    }
  }, [supabase, currentUserId, chatType, limit])

  // ============================================================================
  // FETCH MESSAGES
  // ============================================================================

  const fetchMessages = useCallback(async (targetChatId: string, options?: { before?: string; messageLimit?: number }) => {
    if (!currentUserId) return

    try {
      setMessagesLoading(true)
      setMessagesError(null)

      let query = supabase
        .from('messages')
        .select(`
          *,
          message_reactions(id, user_id, emoji, created_at),
          message_attachments(*)
        `)
        .eq('chat_id', targetChatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (options?.before) {
        query = query.lt('created_at', options.before)
      }

      query = query.limit(options?.messageLimit || 100)

      const { data: messagesData, error: messagesErr } = await query

      if (messagesErr) throw messagesErr

      // Get sender info for each message
      const senderIds = [...new Set((messagesData || []).map(m => m.sender_id))]
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', senderIds)

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

      const messagesWithSenders = (messagesData || []).map(msg => ({
        ...msg,
        sender: usersMap.get(msg.sender_id) || null,
        reactions: msg.message_reactions || [],
        attachments: msg.message_attachments || [],
        message_reactions: undefined,
        message_attachments: undefined
      })) as ChatMessage[]

      setMessages(messagesWithSenders)
    } catch (err) {
      logger.error('Error fetching messages', { error: err })
      setMessagesError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      setMessagesLoading(false)
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // SELECT CHAT
  // ============================================================================

  const selectChat = useCallback(async (targetChatId: string) => {
    const chat = chats.find(c => c.id === targetChatId)
    setCurrentChat(chat || null)

    if (chat) {
      await fetchMessages(targetChatId)
      // Mark as read when selecting chat
      await markAsRead(targetChatId)
    }
  }, [chats, fetchMessages])

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const sendMessage = useCallback(async (
    text: string,
    type: MessageType = 'text',
    options?: {
      replyToId?: string
      attachments?: File[]
    }
  ) => {
    if (!currentChat || !currentUserId) {
      toast.error('No chat selected')
      return { success: false, error: 'No chat selected' }
    }

    if (!text.trim()) {
      toast.error('Message cannot be empty')
      return { success: false, error: 'Message cannot be empty' }
    }

    try {
      setSending(true)

      const { data: newMessage, error: sendErr } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChat.id,
          sender_id: currentUserId,
          text: text.trim(),
          type,
          status: 'sent',
          reply_to_id: options?.replyToId || null
        })
        .select()
        .single()

      if (sendErr) throw sendErr

      // Handle attachments if provided
      if (options?.attachments && options.attachments.length > 0) {
        for (const file of options.attachments) {
          const filePath = `chat-attachments/${currentChat.id}/${newMessage.id}/${file.name}`
          const { error: uploadErr } = await supabase.storage
            .from('attachments')
            .upload(filePath, file)

          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('attachments')
              .getPublicUrl(filePath)

            await supabase.from('message_attachments').insert({
              message_id: newMessage.id,
              name: file.name,
              url: publicUrl,
              type: file.type.startsWith('image') ? 'image' :
                    file.type.startsWith('video') ? 'video' :
                    file.type.startsWith('audio') ? 'audio' : 'document',
              mime_type: file.type,
              size_bytes: file.size
            })
          }
        }
      }

      // Add to local state immediately for instant feedback
      const messageWithSender = {
        ...newMessage,
        sender: { id: currentUserId, name: 'You', email: '', avatar_url: null },
        reactions: [],
        attachments: []
      } as ChatMessage

      setMessages(prev => [...prev, messageWithSender])

      return { success: true, message: newMessage }
    } catch (err) {
      logger.error('Error sending message', { error: err })
      toast.error('Failed to send message')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
    } finally {
      setSending(false)
    }
  }, [supabase, currentChat, currentUserId])

  // ============================================================================
  // EDIT MESSAGE
  // ============================================================================

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      const { error: editErr } = await supabase
        .from('messages')
        .update({
          text: newText,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId) // Only allow editing own messages

      if (editErr) throw editErr

      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, text: newText, is_edited: true, edited_at: new Date().toISOString() }
          : m
      ))

      toast.success('Message edited')
      return { success: true }
    } catch (err) {
      logger.error('Error editing message', { error: err })
      toast.error('Failed to edit message')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to edit message' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // DELETE MESSAGE
  // ============================================================================

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      // Soft delete
      const { error: deleteErr } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId)

      if (deleteErr) throw deleteErr

      setMessages(prev => prev.filter(m => m.id !== messageId))

      toast.success('Message deleted')
      return { success: true }
    } catch (err) {
      logger.error('Error deleting message', { error: err })
      toast.error('Failed to delete message')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete message' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // MARK AS READ
  // ============================================================================

  const markAsRead = useCallback(async (targetChatId: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      // Update last_read_at for the chat member
      const { error: updateErr } = await supabase
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', targetChatId)
        .eq('user_id', currentUserId)

      if (updateErr) throw updateErr

      // Update local state
      setChats(prev => prev.map(c =>
        c.id === targetChatId ? { ...c, unread_count: 0 } : c
      ))

      return { success: true }
    } catch (err) {
      logger.error('Error marking as read', { error: err })
      return { success: false, error: err instanceof Error ? err.message : 'Failed to mark as read' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // ADD REACTION
  // ============================================================================

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      const { error: reactionErr } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji
        })

      if (reactionErr) throw reactionErr

      // Update local state
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m
        const newReaction = { id: '', message_id: messageId, user_id: currentUserId, emoji, created_at: new Date().toISOString() }
        return { ...m, reactions: [...(m.reactions || []), newReaction] }
      }))

      return { success: true }
    } catch (err) {
      logger.error('Error adding reaction', { error: err })
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add reaction' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // REMOVE REACTION
  // ============================================================================

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      const { error: reactionErr } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji)

      if (reactionErr) throw reactionErr

      // Update local state
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m
        return {
          ...m,
          reactions: (m.reactions || []).filter(r => !(r.user_id === currentUserId && r.emoji === emoji))
        }
      }))

      return { success: true }
    } catch (err) {
      logger.error('Error removing reaction', { error: err })
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove reaction' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // PIN MESSAGE
  // ============================================================================

  const pinMessage = useCallback(async (messageId: string, pin: boolean) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      const { error: pinErr } = await supabase
        .from('messages')
        .update({
          is_pinned: pin,
          pinned_at: pin ? new Date().toISOString() : null,
          pinned_by: pin ? currentUserId : null
        })
        .eq('id', messageId)

      if (pinErr) throw pinErr

      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, is_pinned: pin, pinned_at: pin ? new Date().toISOString() : null }
          : m
      ))

      toast.success(pin ? 'Message pinned' : 'Message unpinned')
      return { success: true }
    } catch (err) {
      logger.error('Error pinning message', { error: err })
      return { success: false, error: err instanceof Error ? err.message : 'Failed to pin message' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // CREATE CHAT
  // ============================================================================

  const createChat = useCallback(async (data: {
    name: string
    type: ChatType
    description?: string
    memberIds?: string[]
  }) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' }

    try {
      // Create the chat
      const { data: newChat, error: chatErr } = await supabase
        .from('chats')
        .insert({
          name: data.name,
          type: data.type,
          description: data.description || null,
          creator_id: currentUserId
        })
        .select()
        .single()

      if (chatErr) throw chatErr

      // Add creator as owner
      await supabase.from('chat_members').insert({
        chat_id: newChat.id,
        user_id: currentUserId,
        role: 'owner'
      })

      // Add other members
      if (data.memberIds && data.memberIds.length > 0) {
        const memberInserts = data.memberIds.map(userId => ({
          chat_id: newChat.id,
          user_id: userId,
          role: 'member' as MemberRole
        }))
        await supabase.from('chat_members').insert(memberInserts)
      }

      // Add to local state
      const chatWithDefaults = {
        ...newChat,
        unread_count: 0,
        member_count: 1 + (data.memberIds?.length || 0),
        last_message: null
      } as Chat

      setChats(prev => [chatWithDefaults, ...prev])

      toast.success('Chat created')
      return { success: true, chat: chatWithDefaults }
    } catch (err) {
      logger.error('Error creating chat', { error: err })
      toast.error('Failed to create chat')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create chat' }
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // SET TYPING INDICATOR
  // ============================================================================

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!currentChat || !currentUserId) return

    try {
      if (isTyping) {
        await supabase.from('typing_indicators').upsert({
          chat_id: currentChat.id,
          user_id: currentUserId,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10000).toISOString()
        }, { onConflict: 'chat_id,user_id' })
      } else {
        await supabase.from('typing_indicators')
          .delete()
          .eq('chat_id', currentChat.id)
          .eq('user_id', currentUserId)
      }
    } catch (err) {
      logger.error('Error setting typing indicator', { error: err })
    }
  }, [supabase, currentChat, currentUserId])

  // ============================================================================
  // SEARCH MESSAGES
  // ============================================================================

  const searchMessages = useCallback(async (query: string) => {
    if (!currentUserId || !query.trim()) return []

    try {
      const { data: searchResults, error: searchErr } = await supabase
        .from('messages')
        .select('*, chats!inner(name, type)')
        .textSearch('text', query.trim())
        .eq('is_deleted', false)
        .limit(50)

      if (searchErr) throw searchErr

      return searchResults || []
    } catch (err) {
      logger.error('Error searching messages', { error: err })
      return []
    }
  }, [supabase, currentUserId])

  // ============================================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    if (!enableRealtime || !currentUserId) return

    // Subscribe to chats changes
    chatsChannelRef.current = supabase
      .channel('chats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChats(prev => [payload.new as Chat, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setChats(prev => prev.map(c =>
              c.id === payload.new.id ? { ...c, ...payload.new } : c
            ))
          } else if (payload.eventType === 'DELETE') {
            setChats(prev => prev.filter(c => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      if (chatsChannelRef.current) {
        supabase.removeChannel(chatsChannelRef.current)
      }
    }
  }, [supabase, enableRealtime, currentUserId])

  useEffect(() => {
    if (!enableRealtime || !currentChat) return

    // Subscribe to messages changes for current chat
    messagesChannelRef.current = supabase
      .channel(`messages-${currentChat.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${currentChat.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== currentUserId) {
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, name, email, avatar_url')
              .eq('id', payload.new.sender_id)
              .single()

            const newMessage = {
              ...payload.new,
              sender: sender || null,
              reactions: [],
              attachments: []
            } as ChatMessage

            setMessages(prev => [...prev, newMessage])
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m =>
              m.id === payload.new.id ? { ...m, ...payload.new } : m
            ))
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    typingChannelRef.current = supabase
      .channel(`typing-${currentChat.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `chat_id=eq.${currentChat.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new.user_id !== currentUserId) {
              const { data: user } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', payload.new.user_id)
                .single()

              setTypingUsers(prev => {
                const existing = prev.find(t => t.user_id === payload.new.user_id)
                if (existing) return prev
                return [...prev, {
                  user_id: payload.new.user_id,
                  user_name: user?.name || 'Someone',
                  started_at: payload.new.started_at
                }]
              })

              // Auto-remove after expiry
              setTimeout(() => {
                setTypingUsers(prev => prev.filter(t => t.user_id !== payload.new.user_id))
              }, 10000)
            }
          } else if (payload.eventType === 'DELETE') {
            setTypingUsers(prev => prev.filter(t => t.user_id !== payload.old.user_id))
          }
        }
      )
      .subscribe()

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current)
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current)
      }
    }
  }, [supabase, enableRealtime, currentChat, currentUserId])

  // ============================================================================
  // INITIAL DATA FETCH
  // ============================================================================

  useEffect(() => {
    if (currentUserId) {
      fetchChats()
    }
  }, [currentUserId, fetchChats])

  useEffect(() => {
    if (chatId && currentUserId) {
      selectChat(chatId)
    }
  }, [chatId, currentUserId, selectChat])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalUnread = useMemo(() => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0), [chats])
  const directChats = useMemo(() => chats.filter(c => c.type === 'direct'), [chats])
  const groupChats = useMemo(() => chats.filter(c => c.type === 'group'), [chats])
  const channels = useMemo(() => chats.filter(c => c.type === 'channel'), [chats])
  const pinnedMessages = useMemo(() => messages.filter(m => m.is_pinned), [messages])

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    // Data
    chats,
    messages,
    currentChat,
    typingUsers,
    currentUserId,

    // Computed
    totalUnread,
    directChats,
    groupChats,
    channels,
    pinnedMessages,

    // Loading states
    chatsLoading,
    messagesLoading,
    sending,

    // Errors
    chatsError,
    messagesError,

    // Actions
    fetchChats,
    fetchMessages,
    selectChat,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    addReaction,
    removeReaction,
    pinMessage,
    createChat,
    setTyping,
    searchMessages,

    // Refetch
    refetch: fetchChats
  }
}

export default useConversations
