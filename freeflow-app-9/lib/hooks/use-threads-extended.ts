'use client'

/**
 * Extended Threads Hooks
 * Tables: threads, thread_messages, thread_participants, thread_reactions, thread_attachments, thread_reads
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useThread(threadId?: string) {
  const [thread, setThread] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('threads').select('*, thread_participants(*, users(*))').eq('id', threadId).single(); setThread(data) } finally { setIsLoading(false) }
  }, [threadId])
  useEffect(() => { fetch() }, [fetch])
  return { thread, isLoading, refresh: fetch }
}

export function useThreads(options?: { thread_type?: string; context_type?: string; context_id?: string; status?: string; search?: string; limit?: number }) {
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('threads').select('*, thread_participants(count)')
      if (options?.thread_type) query = query.eq('thread_type', options.thread_type)
      if (options?.context_type) query = query.eq('context_type', options.context_type)
      if (options?.context_id) query = query.eq('context_id', options.context_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setThreads(data || [])
    } finally { setIsLoading(false) }
  }, [options?.thread_type, options?.context_type, options?.context_id, options?.status, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { threads, isLoading, refresh: fetch }
}

export function useUserThreads(userId?: string, options?: { thread_type?: string; status?: string; limit?: number }) {
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participations } = await supabase.from('thread_participants').select('thread_id').eq('user_id', userId)
      if (!participations || participations.length === 0) { setThreads([]); return }
      const threadIds = participations.map(p => p.thread_id)
      let query = supabase.from('threads').select('*, thread_participants(*, users(*))').in('id', threadIds)
      if (options?.thread_type) query = query.eq('thread_type', options.thread_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50)
      setThreads(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.thread_type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { threads, isLoading, refresh: fetch }
}

export function useThreadMessages(threadId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('thread_messages').select('*, users(*), thread_reactions(*)').eq('thread_id', threadId).order('sent_at', { ascending: true }).limit(options?.limit || 100)
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [threadId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    if (!threadId) return
    const channel = supabase.channel(`thread:${threadId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'thread_messages', filter: `thread_id=eq.${threadId}` }, (payload) => { setMessages(prev => [...prev, payload.new]) }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [threadId])
  return { messages, isLoading, refresh: fetch }
}

export function useThreadParticipants(threadId?: string) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('thread_participants').select('*, users(*)').eq('thread_id', threadId).order('joined_at', { ascending: true }); setParticipants(data || []) } finally { setIsLoading(false) }
  }, [threadId])
  useEffect(() => { fetch() }, [fetch])
  return { participants, isLoading, refresh: fetch }
}

export function useThreadReactions(messageId?: string) {
  const [reactions, setReactions] = useState<any[]>([])
  const [reactionSummary, setReactionSummary] = useState<Record<string, { count: number; users: string[] }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('thread_reactions').select('*, users(*)').eq('message_id', messageId)
      setReactions(data || [])
      const summary: Record<string, { count: number; users: string[] }> = {}
      data?.forEach(r => {
        if (!summary[r.emoji]) summary[r.emoji] = { count: 0, users: [] }
        summary[r.emoji].count++
        summary[r.emoji].users.push(r.user_id)
      })
      setReactionSummary(summary)
    } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, reactionSummary, isLoading, refresh: fetch }
}

export function useThreadAttachments(threadId?: string, options?: { message_id?: string }) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('thread_attachments').select('*, users(*)').eq('thread_id', threadId)
      if (options?.message_id) query = query.eq('message_id', options.message_id)
      const { data } = await query.order('created_at', { ascending: false })
      setAttachments(data || [])
    } finally { setIsLoading(false) }
  }, [threadId, options?.message_id])
  useEffect(() => { fetch() }, [fetch])
  return { attachments, isLoading, refresh: fetch }
}

export function useThreadReadStatus(threadId?: string, userId?: string) {
  const [readStatus, setReadStatus] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!threadId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: readData } = await supabase.from('thread_reads').select('*').eq('thread_id', threadId).eq('user_id', userId).single()
      setReadStatus(readData)
      if (readData?.last_read_message_id) {
        const { count } = await supabase.from('thread_messages').select('*', { count: 'exact', head: true }).eq('thread_id', threadId).gt('id', readData.last_read_message_id)
        setUnreadCount(count || 0)
      } else {
        const { count } = await supabase.from('thread_messages').select('*', { count: 'exact', head: true }).eq('thread_id', threadId)
        setUnreadCount(count || 0)
      }
    } finally { setIsLoading(false) }
  }, [threadId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { readStatus, unreadCount, hasUnread: unreadCount > 0, isLoading, refresh: fetch }
}

export function useUnreadThreadsCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participations } = await supabase.from('thread_participants').select('thread_id').eq('user_id', userId)
      if (!participations || participations.length === 0) { setCount(0); return }
      const threadIds = participations.map(p => p.thread_id)
      const { data: reads } = await supabase.from('thread_reads').select('thread_id, last_read_message_id').eq('user_id', userId).in('thread_id', threadIds)
      const readMap = new Map(reads?.map(r => [r.thread_id, r.last_read_message_id]) || [])
      let unreadCount = 0
      for (const threadId of threadIds) {
        const lastReadId = readMap.get(threadId)
        let query = supabase.from('thread_messages').select('*', { count: 'exact', head: true }).eq('thread_id', threadId)
        if (lastReadId) query = query.gt('id', lastReadId)
        const { count: msgCount } = await query
        if (msgCount && msgCount > 0) unreadCount++
      }
      setCount(unreadCount)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
