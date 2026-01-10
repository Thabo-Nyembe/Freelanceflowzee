'use client'

/**
 * Extended Tutorials Hooks
 * Tables: tutorials, tutorial_steps, tutorial_progress, tutorial_completions, tutorial_bookmarks, tutorial_ratings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTutorial(tutorialId?: string) {
  const [tutorial, setTutorial] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorials').select('*, tutorial_steps(*), users(*)').eq('id', tutorialId).single(); setTutorial(data) } finally { setIsLoading(false) }
  }, [tutorialId])
  useEffect(() => { fetch() }, [fetch])
  return { tutorial, isLoading, refresh: fetch }
}

export function useTutorials(options?: { category?: string; difficulty?: string; is_published?: boolean; is_featured?: boolean; author_id?: string; search?: string; limit?: number }) {
  const [tutorials, setTutorials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tutorials').select('*, tutorial_steps(count), users(*)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTutorials(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.difficulty, options?.is_published, options?.is_featured, options?.author_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tutorials, isLoading, refresh: fetch }
}

export function useTutorialSteps(tutorialId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_steps').select('*').eq('tutorial_id', tutorialId).order('order_index', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [tutorialId])
  useEffect(() => { fetch() }, [fetch])
  return { steps, isLoading, refresh: fetch }
}

export function useTutorialProgress(tutorialId?: string, userId?: string) {
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_progress').select('*').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); setProgress(data) } finally { setIsLoading(false) }
  }, [tutorialId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useMyTutorialProgress(userId?: string, options?: { is_completed?: boolean; limit?: number }) {
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tutorial_progress').select('*, tutorials(*)').eq('user_id', userId)
      if (options?.is_completed === true) query = query.not('completed_at', 'is', null)
      else if (options?.is_completed === false) query = query.is('completed_at', null)
      const { data } = await query.order('last_accessed_at', { ascending: false }).limit(options?.limit || 50)
      setProgress(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_completed, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useTutorialCompletions(tutorialId?: string, options?: { limit?: number }) {
  const [completions, setCompletions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_completions').select('*, users(*)').eq('tutorial_id', tutorialId).order('completed_at', { ascending: false }).limit(options?.limit || 50); setCompletions(data || []) } finally { setIsLoading(false) }
  }, [tutorialId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { completions, count: completions.length, isLoading, refresh: fetch }
}

export function useMyBookmarks(userId?: string, options?: { limit?: number }) {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_bookmarks').select('*, tutorials(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setBookmarks(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookmarks, isLoading, refresh: fetch }
}

export function useIsBookmarked(tutorialId?: string, userId?: string) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_bookmarks').select('id').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); setIsBookmarked(!!data) } finally { setIsLoading(false) }
  }, [tutorialId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { isBookmarked, isLoading, refresh: fetch }
}

export function useTutorialRatings(tutorialId?: string, options?: { limit?: number }) {
  const [ratings, setRatings] = useState<any[]>([])
  const [average, setAverage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tutorial_ratings').select('*, users(*)').eq('tutorial_id', tutorialId).order('created_at', { ascending: false }).limit(options?.limit || 50)
      const allRatings = data || []
      setRatings(allRatings)
      setAverage(allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length : 0)
    } finally { setIsLoading(false) }
  }, [tutorialId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { ratings, average: Math.round(average * 10) / 10, count: ratings.length, isLoading, refresh: fetch }
}

export function useMyRating(tutorialId?: string, userId?: string) {
  const [rating, setRating] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tutorialId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tutorial_ratings').select('*').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); setRating(data) } finally { setIsLoading(false) }
  }, [tutorialId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rating, isLoading, refresh: fetch }
}

export function useFeaturedTutorials(options?: { category?: string; limit?: number }) {
  const [tutorials, setTutorials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tutorials').select('*, users(*)').eq('is_published', true).eq('is_featured', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setTutorials(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tutorials, isLoading, refresh: fetch }
}

export function usePopularTutorials(options?: { category?: string; limit?: number }) {
  const [tutorials, setTutorials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tutorials').select('*, users(*)').eq('is_published', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('view_count', { ascending: false }).limit(options?.limit || 10)
      setTutorials(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tutorials, isLoading, refresh: fetch }
}

export function useTutorialCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tutorials').select('category').eq('is_published', true).not('category', 'is', null)
      const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}
