'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  avatar?: string
  members: ChatMember[]
  admins: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  settings: ChatRoomSettings
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ChatMember {
  userId: string
  name: string
  avatar?: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeenAt?: string
  joinedAt: string
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'link' | 'code' | 'system'
  content: string
  metadata?: Record<string, any>
  attachments?: ChatAttachment[]
  mentions: string[]
  replyTo?: ChatMessage
  thread?: ChatThread
  reactions: ChatReaction[]
  isPinned: boolean
  isEdited: boolean
  isDeleted: boolean
  readBy: string[]
  deliveredTo: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  preview?: string
}

export interface ChatReaction {
  emoji: string
  count: number
  users: string[]
}

export interface ChatThread {
  id: string
  messageCount: number
  participants: string[]
  lastReplyAt: string
}

export interface ChatRoomSettings {
  allowReactions: boolean
  allowThreads: boolean
  allowFiles: boolean
  maxFileSize: number
  retentionDays: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRooms: ChatRoom[] = [
  { id: 'room-1', name: 'General', description: 'General discussion channel', type: 'public', members: [{ userId: 'user-1', name: 'Alex Chen', role: 'owner', status: 'online', joinedAt: '2024-01-01' }, { userId: 'user-2', name: 'Sarah Miller', role: 'member', status: 'online', joinedAt: '2024-01-02' }], admins: ['user-1'], unreadCount: 3, isPinned: true, isMuted: false, settings: { allowReactions: true, allowThreads: true, allowFiles: true, maxFileSize: 10485760, retentionDays: 365 }, createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'room-2', name: 'Design Team', type: 'private', members: [{ userId: 'user-1', name: 'Alex Chen', role: 'admin', status: 'online', joinedAt: '2024-01-01' }], admins: ['user-1'], unreadCount: 0, isPinned: false, isMuted: false, settings: { allowReactions: true, allowThreads: true, allowFiles: true, maxFileSize: 52428800, retentionDays: 730 }, createdBy: 'user-1', createdAt: '2024-01-15', updatedAt: '2024-03-18' }
]

const mockChatMessages: ChatMessage[] = [
  { id: 'chat-1', roomId: 'room-1', senderId: 'user-2', senderName: 'Sarah Miller', type: 'text', content: 'Good morning everyone! 👋', mentions: [], reactions: [{ emoji: '👋', count: 2, users: ['user-1', 'user-3'] }], isPinned: false, isEdited: false, isDeleted: false, readBy: ['user-1'], deliveredTo: ['user-1', 'user-3'], createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z' },
  { id: 'chat-2', roomId: 'room-1', senderId: 'user-1', senderName: 'Alex Chen', type: 'text', content: 'Morning! Ready for the design review at 10?', mentions: [], reactions: [], isPinned: false, isEdited: false, isDeleted: false, readBy: ['user-2'], deliveredTo: ['user-2', 'user-3'], createdAt: '2024-03-20T09:05:00Z', updatedAt: '2024-03-20T09:05:00Z' },
  { id: 'chat-3', roomId: 'room-1', senderId: 'user-2', senderName: 'Sarah Miller', type: 'text', content: '@alex Yes! I\'ve prepared the mockups. Let me share them.', mentions: ['user-1'], reactions: [{ emoji: '👍', count: 1, users: ['user-1'] }], isPinned: false, isEdited: false, isDeleted: false, readBy: [], deliveredTo: ['user-1'], createdAt: '2024-03-20T09:07:00Z', updatedAt: '2024-03-20T09:07:00Z' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseChatOptions {
  
  roomId?: string
}

export function useChat(options: UseChatOptions = {}) {
  const {  roomId } = options

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      const result = await response.json()
      if (result.success) {
        setRooms(Array.isArray(result.rooms) ? result.rooms : [])
        return result.rooms
      }
      setRooms(mockRooms)
      return []
    } catch (err) {
      setRooms(mockRooms)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (roomId: string, options?: { before?: string; limit?: number }) => {
    try {
      const params = new URLSearchParams()
      if (options?.before) params.set('before', options.before)
      if (options?.limit) params.set('limit', options.limit.toString())

      const response = await fetch(`/api/chat/rooms/${roomId}/messages?${params}`)
      const result = await response.json()
      if (result.success) {
        setMessages(result.messages || [])
        return result.messages
      }
      return []
    } catch (err) {
      const filtered = mockChatMessages.filter(m => m.roomId === roomId)
      setMessages(filtered)
      return filtered
    }
  }, [])

  const sendMessage = useCallback(async (content: string, type: ChatMessage['type'] = 'text', attachments?: File[], replyTo?: string) => {
    if (!currentRoom) return { success: false, error: 'No room selected' }
    setIsSending(true)

    try {
      const formData = new FormData()
      formData.append('roomId', currentRoom.id)
      formData.append('content', content)
      formData.append('type', type)
      if (replyTo) formData.append('replyTo', replyTo)
      if (attachments) {
        attachments.forEach(file => formData.append('attachments', file))
      }

      const response = await fetch('/api/chat/messages', { method: 'POST', body: formData })
      const result = await response.json()
      if (result.success) {
        setMessages(prev => [...prev, result.message])
        return { success: true, message: result.message }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        roomId: currentRoom.id,
        senderId: 'user-1',
        senderName: 'You',
        type,
        content,
        mentions: [],
        reactions: [],
        isPinned: false,
        isEdited: false,
        isDeleted: false,
        readBy: [],
        deliveredTo: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, newMessage])
      return { success: true, message: newMessage }
    } finally {
      setIsSending(false)
    }
  }, [currentRoom])

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true, updatedAt: new Date().toISOString() } : m))
    return { success: true }
  }, [])

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'Message deleted' } : m))
    return { success: true }
  }, [])

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const existing = m.reactions.find(r => r.emoji === emoji)
      if (existing) {
        return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, 'user-1'] } : r) }
      }
      return { ...m, reactions: [...m.reactions, { emoji, count: 1, users: ['user-1'] }] }
    }))
    return { success: true }
  }, [])

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== 'user-1') } : r).filter(r => r.count > 0) }
    }))
    return { success: true }
  }, [])

  const pinMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m))
    return { success: true }
  }, [])

  const createRoom = useCallback(async (data: { name: string; description?: string; type: ChatRoom['type']; memberIds?: string[] }) => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setRooms(prev => [result.room, ...prev])
        return { success: true, room: result.room }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newRoom: ChatRoom = {
        id: `room-${Date.now()}`,
        name: data.name,
        description: data.description,
        type: data.type,
        members: [],
        admins: ['user-1'],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        settings: { allowReactions: true, allowThreads: true, allowFiles: true, maxFileSize: 10485760, retentionDays: 365 },
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setRooms(prev => [newRoom, ...prev])
      return { success: true, room: newRoom }
    }
  }, [])

  const joinRoom = useCallback(async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    setCurrentRoom(room || null)
    if (room) {
      await fetchMessages(roomId)
    }
  }, [rooms, fetchMessages])

  const leaveRoom = useCallback(async (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId))
    if (currentRoom?.id === roomId) {
      setCurrentRoom(null)
      setMessages([])
    }
    return { success: true }
  }, [currentRoom])

  const inviteMembers = useCallback(async (roomId: string, userIds: string[]) => {
    return { success: true }
  }, [])

  const removeMember = useCallback(async (roomId: string, userId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, members: r.members.filter(m => m.userId !== userId) } : r))
    return { success: true }
  }, [])

  const updateRoomSettings = useCallback(async (roomId: string, settings: Partial<ChatRoomSettings>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, settings: { ...r.settings, ...settings } } : r))
    return { success: true }
  }, [])

  const setTyping = useCallback((isTyping: boolean) => {
    // Would emit typing event via WebSocket
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchRooms()
  }, [fetchRooms])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId)
    }
  }, [roomId, joinRoom])

  const totalUnread = useMemo(() => rooms.reduce((sum, r) => sum + r.unreadCount, 0), [rooms])
  const pinnedRooms = useMemo(() => rooms.filter(r => r.isPinned), [rooms])
  const publicRooms = useMemo(() => rooms.filter(r => r.type === 'public'), [rooms])
  const privateRooms = useMemo(() => rooms.filter(r => r.type === 'private'), [rooms])
  const directRooms = useMemo(() => rooms.filter(r => r.type === 'direct'), [rooms])
  const pinnedMessages = useMemo(() => messages.filter(m => m.isPinned), [messages])
  const onlineMembers = useMemo(() => currentRoom?.members.filter(m => m.status === 'online') || [], [currentRoom])

  return {
    rooms, messages, currentRoom, typingUsers, totalUnread, pinnedRooms, publicRooms, privateRooms, directRooms, pinnedMessages, onlineMembers,
    isLoading, isSending, isConnected, error,
    refresh, fetchRooms, fetchMessages, sendMessage, editMessage, deleteMessage, addReaction, removeReaction, pinMessage,
    createRoom, joinRoom, leaveRoom, inviteMembers, removeMember, updateRoomSettings, setTyping
  }
}

export default useChat
