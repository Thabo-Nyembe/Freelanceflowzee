'use client'

/**
 * Extended Feedback Hooks - Covers all Feedback-related tables
 * Tables: feedback, feedback_replies, feedback_votes, feedback_submissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFeedback(feedbackId?: string) {
  const [feedback, setFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!feedbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('feedback').select('*, feedback_replies(*), feedback_votes(*)').eq('id', feedbackId).single()
      setFeedback(data)
    } finally { setIsLoading(false) }
  }, [feedbackId])
  useEffect(() => { fetch() }, [fetch])
  return { feedback, isLoading, refresh: fetch }
}

export function useFeedbacks(options?: { user_id?: string; target_type?: string; target_id?: string; category?: string; status?: string; priority?: string; limit?: number }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      if (options?.target_id) query = query.eq('target_id', options.target_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setFeedbacks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.target_type, options?.target_id, options?.category, options?.status, options?.priority, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { feedbacks, isLoading, refresh: fetch }
}

export function useFeedbackReplies(feedbackId?: string, options?: { limit?: number }) {
  const [replies, setReplies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!feedbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('feedback_replies').select('*').eq('feedback_id', feedbackId).order('created_at', { ascending: true }).limit(options?.limit || 100)
      setReplies(data || [])
    } finally { setIsLoading(false) }
  }, [feedbackId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { replies, isLoading, refresh: fetch }
}

export function useFeedbackRepliesRealtime(feedbackId?: string) {
  const [replies, setReplies] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!feedbackId) return
    supabase.from('feedback_replies').select('*').eq('feedback_id', feedbackId).order('created_at', { ascending: true }).then(({ data }) => setReplies(data || []))
    const channel = supabase.channel(`feedback_replies_${feedbackId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback_replies', filter: `feedback_id=eq.${feedbackId}` }, (payload) => setReplies(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'feedback_replies', filter: `feedback_id=eq.${feedbackId}` }, (payload) => setReplies(prev => prev.filter(r => r.id !== (payload.old as Record<string, unknown>).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [feedbackId])
  return { replies }
}

export function useFeedbackVotes(feedbackId?: string) {
  const [votes, setVotes] = useState<{ upvotes: number; downvotes: number; total: number }>({ upvotes: 0, downvotes: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!feedbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('feedback_votes').select('vote_type').eq('feedback_id', feedbackId)
      const upvotes = (data || []).filter(v => v.vote_type === 'up').length
      const downvotes = (data || []).filter(v => v.vote_type === 'down').length
      setVotes({ upvotes, downvotes, total: upvotes - downvotes })
    } finally { setIsLoading(false) }
  }, [feedbackId])
  useEffect(() => { fetch() }, [fetch])
  return { votes, isLoading, refresh: fetch }
}

export function useUserFeedbackVote(feedbackId?: string, userId?: string) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!feedbackId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('feedback_votes').select('vote_type').eq('feedback_id', feedbackId).eq('user_id', userId).single()
      setVote(data?.vote_type || null)
    } finally { setIsLoading(false) }
  }, [feedbackId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { vote, isLoading, refresh: fetch }
}

export function useFeedbackStats(options?: { user_id?: string; target_type?: string }) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; byPriority: Record<string, number>; byCategory: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('status, priority, category')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query
      if (!data) { setStats(null); return }
      const byStatus = data.reduce((acc: Record<string, number>, f) => { acc[f.status || 'unknown'] = (acc[f.status || 'unknown'] || 0) + 1; return acc }, {})
      const byPriority = data.reduce((acc: Record<string, number>, f) => { acc[f.priority || 'medium'] = (acc[f.priority || 'medium'] || 0) + 1; return acc }, {})
      const byCategory = data.reduce((acc: Record<string, number>, f) => { acc[f.category || 'general'] = (acc[f.category || 'general'] || 0) + 1; return acc }, {})
      setStats({ total: data.length, byStatus, byPriority, byCategory })
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.target_type])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePopularFeedback(options?: { target_type?: string; limit?: number }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('*').eq('status', 'pending')
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query.order('vote_count', { ascending: false }).limit(options?.limit || 10)
      setFeedbacks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.target_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { feedbacks, isLoading, refresh: fetch }
}

export function useFeedbackSearch(searchTerm: string, options?: { target_type?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('*').or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.target_type, options?.limit])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}

export function useStarredFeedback(options?: { user_id?: string; target_type?: string; limit?: number }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('*').eq('is_starred', true)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 20)
      setFeedbacks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.target_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { feedbacks, isLoading, refresh: fetch }
}

export function useAssignedFeedback(assigneeId?: string, options?: { status?: string; limit?: number }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!assigneeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('feedback').select('*').eq('assigned_to', assigneeId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('priority', { ascending: false }).limit(options?.limit || 50)
      setFeedbacks(data || [])
    } finally { setIsLoading(false) }
  }, [assigneeId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { feedbacks, isLoading, refresh: fetch }
}

export function useFeedbackRealtime(feedbackId?: string) {
  const [feedback, setFeedback] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!feedbackId) return
    supabase.from('feedback').select('*').eq('id', feedbackId).single().then(({ data }) => setFeedback(data))
    const channel = supabase.channel(`feedback_${feedbackId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feedback', filter: `id=eq.${feedbackId}` }, (payload) => setFeedback(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [feedbackId])
  return { feedback }
}
