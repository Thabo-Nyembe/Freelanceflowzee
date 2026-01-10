'use client'

/**
 * Extended Chats Hooks
 * Tables: chats, chat_messages, chat_participants, chat_attachments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChat(chatId?: string) {
  const [chat, setChat] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!chatId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('chats').select('*, chat_participants(*)').eq('id', chatId).single(); setChat(data) } finally { setIsLoading(false) }
  }, [chatId])
  useEffect(() => { fetch() }, [fetch])
  return { chat, isLoading, refresh: fetch }
}

export function useChats(userId?: string, options?: { type?: string; limit?: number }) {
  const [chats, setChats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participantChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', userId)
      if (!participantChats?.length) { setChats([]); return }
      let query = supabase.from('chats').select('*, chat_participants(*)').in('id', participantChats.map(p => p.chat_id))
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50)
      setChats(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { chats, isLoading, refresh: fetch }
}

export function useChatMessages(chatId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!chatId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', chatId).eq('is_deleted', false).order('created_at', { ascending: false }).limit(options?.limit || 50); setMessages((data || []).reverse()) } finally { setIsLoading(false) }
  }, [chatId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useChatMessagesRealtime(chatId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!chatId) return
    supabase.from('chat_messages').select('*').eq('chat_id', chatId).eq('is_deleted', false).order('created_at', { ascending: true }).limit(100).then(({ data }) => setMessages(data || []))
    const channel = supabase.channel(`chat_${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m).filter(m => !m.is_deleted))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatId])
  return { messages }
}

export function useChatParticipants(chatId?: string) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!chatId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('chat_participants').select('*').eq('chat_id', chatId).order('joined_at', { ascending: true }); setParticipants(data || []) } finally { setIsLoading(false) }
  }, [chatId])
  useEffect(() => { fetch() }, [fetch])
  return { participants, isLoading, refresh: fetch }
}

export function useUnreadCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participantChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', userId)
      if (!participantChats?.length) { setCount(0); return }
      const { count: unreadCount } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).in('chat_id', participantChats.map(p => p.chat_id)).neq('sender_id', userId).is('read_at', null)
      setCount(unreadCount || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useTypingIndicator(chatId?: string, userId?: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!chatId || !userId) return
    const channel = supabase.channel(`typing_${chatId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const typing = Object.values(state).flat().filter((p: any) => p.isTyping && p.userId !== userId).map((p: any) => p.userId)
        setTypingUsers(typing)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatId, userId])
  const setTyping = useCallback((isTyping: boolean) => {
    if (!chatId || !userId) return
    const channel = supabase.channel(`typing_${chatId}`)
    channel.track({ userId, isTyping })
  }, [chatId, userId])
  return { typingUsers, setTyping }
}
