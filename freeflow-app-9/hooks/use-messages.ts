'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system'
export type ConversationType = 'direct' | 'group' | 'channel'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  type: MessageType
  content: string
  attachments?: MessageAttachment[]
  replyTo?: string
  reactions: MessageReaction[]
  isEdited: boolean
  isDeleted: boolean
  readBy: string[]
  createdAt: string
  updatedAt: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  thumbnailUrl?: string
}

export interface MessageReaction {
  emoji: string
  users: string[]
}

export interface Conversation {
  id: string
  type: ConversationType
  name?: string
  description?: string
  avatar?: string
  participants: ConversationParticipant[]
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  userId: string
  name: string
  avatar?: string
  role: 'admin' | 'member'
  joinedAt: string
  lastSeenAt?: string
  isOnline: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockConversations: Conversation[] = [
  { id: 'conv-1', type: 'direct', participants: [{ userId: 'user-1', name: 'Alex Chen', role: 'member', joinedAt: '2024-01-01', isOnline: true }, { userId: 'user-2', name: 'Sarah Miller', avatar: '/avatars/sarah.jpg', role: 'member', joinedAt: '2024-01-01', lastSeenAt: '2024-03-20T15:00:00Z', isOnline: true }], unreadCount: 2, isPinned: true, isMuted: false, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'conv-2', type: 'group', name: 'Design Team', description: 'Design team discussions', avatar: '/groups/design.jpg', participants: [{ userId: 'user-1', name: 'Alex Chen', role: 'admin', joinedAt: '2024-01-01', isOnline: true }, { userId: 'user-3', name: 'Mike Johnson', role: 'member', joinedAt: '2024-01-15', isOnline: false }], unreadCount: 5, isPinned: false, isMuted: false, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'conv-3', type: 'channel', name: 'announcements', description: 'Company announcements', participants: [], unreadCount: 0, isPinned: true, isMuted: true, createdAt: '2024-01-01', updatedAt: '2024-03-15' }
]

const mockMessages: Message[] = [
  { id: 'msg-1', conversationId: 'conv-1', senderId: 'user-2', senderName: 'Sarah Miller', type: 'text', content: 'Hey! How is the project going?', reactions: [], isEdited: false, isDeleted: false, readBy: ['user-1'], createdAt: '2024-03-20T14:30:00Z', updatedAt: '2024-03-20T14:30:00Z' },
  { id: 'msg-2', conversationId: 'conv-1', senderId: 'user-1', senderName: 'Alex Chen', type: 'text', content: 'Great! Almost done with the homepage. Will share the preview soon.', reactions: [{ emoji: '👍', users: ['user-2'] }], isEdited: false, isDeleted: false, readBy: ['user-2'], createdAt: '2024-03-20T14:32:00Z', updatedAt: '2024-03-20T14:32:00Z' },
  { id: 'msg-3', conversationId: 'conv-1', senderId: 'user-2', senderName: 'Sarah Miller', type: 'text', content: 'Awesome! Looking forward to it 🎉', reactions: [], isEdited: false, isDeleted: false, readBy: [], createdAt: '2024-03-20T14:35:00Z', updatedAt: '2024-03-20T14:35:00Z' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseMessagesOptions {
  
  conversationId?: string
}

export function useMessages(options: UseMessagesOptions = {}) {
  const {  conversationId } = options

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({})

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      const result = await response.json()
      if (result.success) {
        setConversations(Array.isArray(result.conversations) ? result.conversations : [])
        return result.conversations
      }
      setConversations([])
      return []
    } catch (err) {
      setConversations([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (convId: string, options?: { before?: string; limit?: number }) => {
    try {
      const params = new URLSearchParams()
      if (options?.before) params.set('before', options.before)
      if (options?.limit) params.set('limit', options.limit.toString())

      const response = await fetch(`/api/messages/conversations/${convId}/messages?${params}`)
      const result = await response.json()
      if (result.success) {
        setMessages(result.messages || [])
        return result.messages
      }
      return []
    } catch (err) {
      const filtered = mockMessages.filter(m => m.conversationId === convId)
      setMessages(filtered)
      return filtered
    }
  }, [])

  const sendMessage = useCallback(async (content: string, type: MessageType = 'text', attachments?: File[]) => {
    if (!currentConversation) return { success: false, error: 'No conversation selected' }
    setIsSending(true)

    try {
      const formData = new FormData()
      formData.append('conversationId', currentConversation.id)
      formData.append('content', content)
      formData.append('type', type)
      if (attachments) {
        attachments.forEach(file => formData.append('attachments', file))
      }

      const response = await fetch('/api/messages', { method: 'POST', body: formData })
      const result = await response.json()
      if (result.success) {
        setMessages(prev => [...prev, result.message])
        return { success: true, message: result.message }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: currentConversation.id,
        senderId: 'user-1',
        senderName: 'You',
        type,
        content,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, newMessage])
      return { success: true, message: newMessage }
    } finally {
      setIsSending(false)
    }
  }, [currentConversation])

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      })
      const result = await response.json()
      if (result.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true, updatedAt: new Date().toISOString() } : m))
      }
      return result
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true } : m))
      return { success: true }
    }
  }, [])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m))
      return { success: true }
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m))
      return { success: true }
    }
  }, [])

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m
        const existingReaction = m.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, users: [...r.users, 'user-1'] } : r) }
        }
        return { ...m, reactions: [...m.reactions, { emoji, users: ['user-1'] }] }
      }))
      return { success: true }
    } catch (err) {
      return { success: true }
    }
  }, [])

  const createConversation = useCallback(async (data: { type: ConversationType; name?: string; participantIds: string[] }) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setConversations(prev => [result.conversation, ...prev])
        return { success: true, conversation: result.conversation }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newConv: Conversation = { id: `conv-${Date.now()}`, type: data.type, name: data.name, participants: [], unreadCount: 0, isPinned: false, isMuted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setConversations(prev => [newConv, ...prev])
      return { success: true, conversation: newConv }
    }
  }, [])

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, { method: 'POST' })
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      return { success: true }
    } catch (err) {
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      return { success: true }
    }
  }, [])

  const togglePin = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId)
    if (conv) {
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c))
    }
    return { success: true }
  }, [conversations])

  const toggleMute = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId)
    if (conv) {
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c))
    }
    return { success: true }
  }, [conversations])

  const searchMessages = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query) return []

    const results = messages.filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
    return results
  }, [messages])

  const selectConversation = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId)
    setCurrentConversation(conv || null)
    if (conv) {
      await fetchMessages(conversationId)
      await markAsRead(conversationId)
    }
  }, [conversations, fetchMessages, markAsRead])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchConversations()
  }, [fetchConversations])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId)
    }
  }, [conversationId, selectConversation])

  const unreadCount = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations])
  const pinnedConversations = useMemo(() => conversations.filter(c => c.isPinned), [conversations])
  const directConversations = useMemo(() => conversations.filter(c => c.type === 'direct'), [conversations])
  const groupConversations = useMemo(() => conversations.filter(c => c.type === 'group'), [conversations])
  const channels = useMemo(() => conversations.filter(c => c.type === 'channel'), [conversations])

  return {
    conversations, messages, currentConversation, unreadCount, pinnedConversations, directConversations, groupConversations, channels, isTyping,
    isLoading, isSending, error, searchQuery,
    refresh, fetchConversations, fetchMessages, sendMessage, editMessage, deleteMessage, addReaction,
    createConversation, markAsRead, togglePin, toggleMute, searchMessages, selectConversation
  }
}

export default useMessages
