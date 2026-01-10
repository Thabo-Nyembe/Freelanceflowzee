'use client'

/**
 * Extended Journals Hooks
 * Tables: journals, journal_entries, journal_prompts, journal_moods, journal_tags, journal_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useJournal(journalId?: string) {
  const [journal, setJournal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!journalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('journals').select('*, journal_entries(*)').eq('id', journalId).single(); setJournal(data) } finally { setIsLoading(false) }
  }, [journalId])
  useEffect(() => { fetch() }, [fetch])
  return { journal, isLoading, refresh: fetch }
}

export function useJournals(userId?: string, options?: { type?: string; is_archived?: boolean }) {
  const [journals, setJournals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('journals').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived)
      const { data } = await query.order('updated_at', { ascending: false })
      setJournals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.is_archived])
  useEffect(() => { fetch() }, [fetch])
  return { journals, isLoading, refresh: fetch }
}

export function useJournalEntry(entryId?: string) {
  const [entry, setEntry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('journal_entries').select('*, journal_moods(*), journal_tags(*)').eq('id', entryId).single(); setEntry(data) } finally { setIsLoading(false) }
  }, [entryId])
  useEffect(() => { fetch() }, [fetch])
  return { entry, isLoading, refresh: fetch }
}

export function useJournalEntries(journalId?: string, options?: { from_date?: string; to_date?: string; mood_id?: string; limit?: number }) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!journalId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('journal_entries').select('*, journal_moods(*), journal_tags(*)').eq('journal_id', journalId)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      if (options?.mood_id) query = query.eq('mood_id', options.mood_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setEntries(data || [])
    } finally { setIsLoading(false) }
  }, [journalId, options?.from_date, options?.to_date, options?.mood_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

export function useJournalMoods() {
  const [moods, setMoods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('journal_moods').select('*').order('name', { ascending: true }); setMoods(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { moods, isLoading, refresh: fetch }
}

export function useJournalPrompts(options?: { category?: string; is_active?: boolean }) {
  const [prompts, setPrompts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('journal_prompts').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setPrompts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { prompts, isLoading, refresh: fetch }
}

export function useFavoriteEntries(userId?: string, options?: { limit?: number }) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('journal_entries').select('*, journals(*)').eq('user_id', userId).eq('is_favorite', true).order('created_at', { ascending: false }).limit(options?.limit || 20); setEntries(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

export function useRecentEntries(userId?: string, limit?: number) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('journal_entries').select('*, journals(title)').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 10); setEntries(data || []) } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

export function useJournalSearch(userId?: string, query?: string, options?: { limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!userId || !query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('journal_entries').select('*, journals(*)').eq('user_id', userId).or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('created_at', { ascending: false }).limit(options?.limit || 20); setResults(data || []) } finally { setIsLoading(false) }
  }, [userId, query, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useJournalStats(userId?: string) {
  const [stats, setStats] = useState<{ totalEntries: number; totalWords: number; streakDays: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: entries } = await supabase.from('journal_entries').select('word_count, created_at').eq('user_id', userId)
      const totalEntries = entries?.length || 0
      const totalWords = entries?.reduce((sum, e) => sum + (e.word_count || 0), 0) || 0
      setStats({ totalEntries, totalWords, streakDays: 0 })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
