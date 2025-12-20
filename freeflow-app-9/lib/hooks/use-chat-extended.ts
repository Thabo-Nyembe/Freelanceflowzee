'use client'

/**
 * Extended Chat Hooks - Covers all Chat-related tables
 * Tables: chat_rooms, chat_messages, chat_participants, chat_attachments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatRoom(roomId?: string) {
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('chat_rooms').select('*, chat_participants(*)').eq('id', roomId).single()
      setRoom(data)
    } finally { setIsLoading(false) }
  }, [roomId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { room, isLoading, refresh: fetch }
}

export function useUserChatRooms(userId?: string, options?: { type?: string; includeArchived?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participations } = await supabase.from('chat_participants').select('room_id').eq('user_id', userId)
      if (!participations || participations.length === 0) { setData([]); return }
      const roomIds = participations.map(p => p.room_id)
      let query = supabase.from('chat_rooms').select('*, chat_participants(*)').in('id', roomIds)
      if (options?.type) query = query.eq('type', options.type)
      if (!options?.includeArchived) query = query.eq('is_archived', false)
      const { data: result } = await query.order('last_message_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.includeArchived, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useChatMessages(roomId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMessages((data || []).reverse())
      setHasMore((data?.length || 0) >= (options?.limit || 50))
    } finally { setIsLoading(false) }
  }, [roomId, options?.limit, supabase])
  const loadMore = useCallback(async () => {
    if (!roomId || messages.length === 0) return
    const oldestMessage = messages[0]
    const { data } = await supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId).lt('created_at', oldestMessage.created_at).order('created_at', { ascending: false }).limit(options?.limit || 50)
    if (data) {
      setMessages(prev => [...data.reverse(), ...prev])
      setHasMore(data.length >= (options?.limit || 50))
    }
  }, [roomId, messages, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, hasMore, loadMore, refresh: fetch }
}

export function useChatMessagesRealtime(roomId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!roomId) return
    supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setMessages((data || []).reverse()))
    const channel = supabase.channel(`chat_messages_${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => setMessages(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? payload.new : m)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])
  return { messages }
}

export function useChatParticipants(roomId?: string) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('chat_participants').select('*').eq('room_id', roomId).order('joined_at', { ascending: true })
      setParticipants(data || [])
    } finally { setIsLoading(false) }
  }, [roomId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { participants, isLoading, refresh: fetch }
}

export function useUnreadMessages(userId?: string) {
  const [unread, setUnread] = useState<{ total: number; byRoom: Record<string, number> }>({ total: 0, byRoom: {} })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participations } = await supabase.from('chat_participants').select('room_id, last_read_at').eq('user_id', userId)
      if (!participations) { setUnread({ total: 0, byRoom: {} }); return }
      let total = 0
      const byRoom: Record<string, number> = {}
      for (const p of participations) {
        const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('room_id', p.room_id).neq('sender_id', userId).gt('created_at', p.last_read_at || '1970-01-01')
        const unreadCount = count || 0
        total += unreadCount
        byRoom[p.room_id] = unreadCount
      }
      setUnread({ total, byRoom })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { unread, isLoading, refresh: fetch }
}

export function useChatSearch(roomId: string, searchTerm: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId).ilike('content', `%${searchTerm}%`).eq('is_deleted', false).order('created_at', { ascending: false }).limit(20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [roomId, searchTerm, supabase])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}

export function useTypingIndicator(roomId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const supabase = createClient()
  const setTyping = useCallback((isTyping: boolean) => {
    const channel = supabase.channel(`typing_${roomId}`)
    channel.send({ type: 'broadcast', event: 'typing', payload: { userId, isTyping } })
  }, [roomId, userId, supabase])
  useEffect(() => {
    const channel = supabase.channel(`typing_${roomId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === userId) return
        if (payload.isTyping) {
          setTypingUsers(prev => [...new Set([...prev, payload.userId])])
          setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== payload.userId)), 3000)
        } else {
          setTypingUsers(prev => prev.filter(u => u !== payload.userId))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, userId, supabase])
  return { typingUsers, setTyping }
}

export function useChatRoomRealtime(roomId?: string) {
  const [room, setRoom] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!roomId) return
    supabase.from('chat_rooms').select('*, chat_participants(*)').eq('id', roomId).single().then(({ data }) => setRoom(data))
    const channel = supabase.channel(`chat_room_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom((prev: any) => ({ ...prev, ...payload.new })))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants', filter: `room_id=eq.${roomId}` }, async () => {
        const { data } = await supabase.from('chat_rooms').select('*, chat_participants(*)').eq('id', roomId).single()
        setRoom(data)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])
  return { room }
}

export function useDirectChat(userId1?: string, userId2?: string) {
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId1 || !userId2) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: rooms } = await supabase.from('chat_rooms').select('*, chat_participants(*)').eq('type', 'direct')
      const directRoom = rooms?.find(room => {
        const participants = room.chat_participants?.map((p: any) => p.user_id) || []
        return participants.includes(userId1) && participants.includes(userId2) && participants.length === 2
      })
      setRoom(directRoom || null)
    } finally { setIsLoading(false) }
  }, [userId1, userId2, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { room, isLoading, refresh: fetch }
}
