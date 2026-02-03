'use client'

/**
 * Extended Polls Hooks
 * Tables: polls, poll_options, poll_votes, poll_results, poll_comments, poll_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePoll(pollId?: string) {
  const [poll, setPoll] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('polls').select('*, poll_options(*), poll_settings(*)').eq('id', pollId).single(); setPoll(data) } finally { setIsLoading(false) }
  }, [pollId])
  useEffect(() => { loadData() }, [loadData])
  return { poll, isLoading, refresh: loadData }
}

export function usePolls(options?: { creator_id?: string; status?: string; visibility?: string; search?: string; limit?: number }) {
  const [polls, setPolls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('polls').select('*, poll_options(*)')
      if (options?.creator_id) query = query.eq('creator_id', options.creator_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPolls(data || [])
    } finally { setIsLoading(false) }
  }, [options?.creator_id, options?.status, options?.visibility, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { polls, isLoading, refresh: loadData }
}

export function usePollOptions(pollId?: string) {
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('order', { ascending: true }); setOptions(data || []) } finally { setIsLoading(false) }
  }, [pollId])
  useEffect(() => { loadData() }, [loadData])
  return { options, isLoading, refresh: loadData }
}

export function usePollResults(pollId?: string) {
  const [results, setResults] = useState<{ options: any[]; totalVotes: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: options } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('vote_count', { ascending: false })
      const { data: poll } = await supabase.from('polls').select('vote_count').eq('id', pollId).single()
      const totalVotes = poll?.vote_count || 0
      const resultsData = options?.map(opt => ({
        ...opt,
        percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
      })) || []
      setResults({ options: resultsData, totalVotes })
    } finally { setIsLoading(false) }
  }, [pollId])
  useEffect(() => { loadData() }, [loadData])
  return { results, isLoading, refresh: loadData }
}

export function useHasVoted(pollId?: string, userId?: string) {
  const [hasVoted, setHasVoted] = useState(false)
  const [votedOptions, setVotedOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('poll_votes').select('option_id').eq('poll_id', pollId).eq('user_id', userId)
      setHasVoted((data?.length || 0) > 0)
      setVotedOptions(data?.map(v => v.option_id) || [])
    } finally { setIsLoading(false) }
  }, [pollId, userId])
  useEffect(() => { loadData() }, [loadData])
  return { hasVoted, votedOptions, isLoading, refresh: loadData }
}

export function usePollComments(pollId?: string, options?: { limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('poll_comments').select('*, users(*)').eq('poll_id', pollId).is('parent_id', null).order('created_at', { ascending: false }).limit(options?.limit || 50); setComments(data || []) } finally { setIsLoading(false) }
  }, [pollId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function usePollSettings(pollId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('poll_settings').select('*').eq('poll_id', pollId).single(); setSettings(data || { allow_multiple: false, show_results_before_voting: false, anonymous: false }) } finally { setIsLoading(false) }
  }, [pollId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useActivePolls(options?: { visibility?: string; limit?: number }) {
  const [polls, setPolls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('polls').select('*, poll_options(*)').eq('status', 'active').or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setPolls(data || [])
    } finally { setIsLoading(false) }
  }, [options?.visibility, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { polls, isLoading, refresh: loadData }
}

export function useMyPolls(userId?: string, options?: { status?: string; limit?: number }) {
  const [polls, setPolls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('polls').select('*, poll_options(*)').eq('creator_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPolls(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { polls, isLoading, refresh: loadData }
}

export function usePollVoters(pollId?: string, optionId?: string) {
  const [voters, setVoters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('poll_votes').select('*, users(*)').eq('poll_id', pollId)
      if (optionId) query = query.eq('option_id', optionId)
      const { data } = await query.order('voted_at', { ascending: false })
      setVoters(data || [])
    } finally { setIsLoading(false) }
  }, [pollId, optionId])
  useEffect(() => { loadData() }, [loadData])
  return { voters, isLoading, refresh: loadData }
}
