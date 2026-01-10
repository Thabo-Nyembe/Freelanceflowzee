'use client'

/**
 * Extended Messages Hooks - Covers all Message-related tables
 * Tables: messages, message_attachments, message_mentions, message_reactions, message_read_receipts, message_threads
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMessage(messageId?: string) {
  const [message, setMessage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('messages').select('*, message_attachments(*), message_mentions(*), message_reactions(*)').eq('id', messageId).single()
      setMessage(data)
    } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { message, isLoading, refresh: fetch }
}

export function useMessages(options?: { channelId?: string; threadId?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('messages').select('*, message_attachments(*)').eq('is_deleted', false)
      if (options?.channelId) query = query.eq('channel_id', options.channelId)
      if (options?.threadId) query = query.eq('thread_id', options.threadId)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.channelId, options?.threadId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDirectMessages(userId1?: string, userId2?: string, options?: { limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId1 || !userId2) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('messages').select('*, message_attachments(*)').or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`).eq('is_deleted', false).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId1, userId2, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMessageAttachments(messageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('message_attachments').select('*').eq('message_id', messageId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMessageMentions(userId?: string, options?: { isRead?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('message_mentions').select('*, messages(*)').eq('user_id', userId)
      if (options?.isRead !== undefined) query = query.eq('is_read', options.isRead)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isRead, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMessageReactions(messageId?: string) {
  const [reactions, setReactions] = useState<{ emoji: string; count: number; users: any[] }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('message_reactions').select('*, users(id, name, avatar_url)').eq('message_id', messageId)
      const grouped: Record<string, { emoji: string; count: number; users: any[] }> = {}
      data?.forEach(r => {
        if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] }
        grouped[r.emoji].count++
        grouped[r.emoji].users.push(r.users)
      })
      setReactions(Object.values(grouped))
    } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, isLoading, refresh: fetch }
}

export function useMessageReadReceipts(messageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('message_read_receipts').select('*, users(id, name, avatar_url)').eq('message_id', messageId).order('read_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMessageThread(threadId?: string) {
  const [thread, setThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [threadRes, messagesRes] = await Promise.all([
        supabase.from('message_threads').select('*').eq('id', threadId).single(),
        supabase.from('messages').select('*, message_attachments(*)').eq('thread_id', threadId).eq('is_deleted', false).order('created_at', { ascending: true })
      ])
      setThread(threadRes.data)
      setMessages(messagesRes.data || [])
    } finally { setIsLoading(false) }
  }, [threadId])
  useEffect(() => { fetch() }, [fetch])
  return { thread, messages, isLoading, refresh: fetch }
}

export function useMessagesRealtime(channelId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!channelId) return
    supabase.from('messages').select('*, message_attachments(*)').eq('channel_id', channelId).eq('is_deleted', false).order('created_at', { ascending: true }).limit(100).then(({ data }) => setMessages(data || []))
    const channel = supabase.channel(`messages_${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => setMessages(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? payload.new : m)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [channelId])
  return { messages }
}

export function useDirectMessagesRealtime(userId1?: string, userId2?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId1 || !userId2) return
    supabase.from('messages').select('*, message_attachments(*)').or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`).eq('is_deleted', false).order('created_at', { ascending: true }).limit(100).then(({ data }) => setMessages(data || []))
    const channel = supabase.channel(`dm_${[userId1, userId2].sort().join('_')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any
        if ((msg.sender_id === userId1 && msg.recipient_id === userId2) || (msg.sender_id === userId2 && msg.recipient_id === userId1)) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId1, userId2])
  return { messages }
}

export function useUnreadMessageCount(userId?: string) {
  const [count, setCount] = useState(0)
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    const updateCount = async () => {
      const { count: result } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('recipient_id', userId).eq('is_deleted', false).not('id', 'in', `(select message_id from message_read_receipts where user_id = '${userId}')`)
      setCount(result || 0)
    }
    updateCount()
    const channel = supabase.channel(`unread_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` }, updateCount)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_read_receipts', filter: `user_id=eq.${userId}` }, updateCount)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return count
}
