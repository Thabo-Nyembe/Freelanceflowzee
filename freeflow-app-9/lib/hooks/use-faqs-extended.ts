'use client'

/**
 * Extended FAQs Hooks
 * Tables: faqs, faq_categories, faq_feedback, faq_translations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFaq(faqId?: string) {
  const [faq, setFaq] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!faqId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('faqs').select('*, faq_categories(*), faq_translations(*)').eq('id', faqId).single(); setFaq(data) } finally { setIsLoading(false) }
  }, [faqId])
  useEffect(() => { fetch() }, [fetch])
  return { faq, isLoading, refresh: fetch }
}

export function useFaqs(options?: { category_id?: string; is_published?: boolean; search?: string; limit?: number }) {
  const [faqs, setFaqs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('faqs').select('*, faq_categories(*)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.search) query = query.or(`question.ilike.%${options.search}%,answer.ilike.%${options.search}%`)
      const { data } = await query.order('order', { ascending: true }).limit(options?.limit || 100)
      setFaqs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.is_published, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { faqs, isLoading, refresh: fetch }
}

export function useFaqCategories(options?: { is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('faq_categories').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useFaqsByCategory() {
  const [faqsByCategory, setFaqsByCategory] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('faqs').select('*, faq_categories(*)').eq('is_published', true).order('order', { ascending: true })
      const grouped: Record<string, any[]> = {}
      data?.forEach(faq => {
        const categoryName = faq.faq_categories?.name || 'Uncategorized'
        if (!grouped[categoryName]) grouped[categoryName] = []
        grouped[categoryName].push(faq)
      })
      setFaqsByCategory(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { faqsByCategory, isLoading, refresh: fetch }
}

export function useFaqSearch(query?: string, options?: { category_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let q = supabase.from('faqs').select('*, faq_categories(*)').eq('is_published', true).or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      if (options?.category_id) q = q.eq('category_id', options.category_id)
      const { data } = await q.order('view_count', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.category_id, options?.limit, supabase])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useFaqFeedback(faqId?: string) {
  const [feedback, setFeedback] = useState<any[]>([])
  const [stats, setStats] = useState<{ total: number; helpful: number; unhelpful: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!faqId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('faq_feedback').select('*').eq('faq_id', faqId).order('submitted_at', { ascending: false })
      setFeedback(data || [])
      const total = data?.length || 0
      const helpful = data?.filter(f => f.is_helpful).length || 0
      setStats({ total, helpful, unhelpful: total - helpful })
    } finally { setIsLoading(false) }
  }, [faqId])
  useEffect(() => { fetch() }, [fetch])
  return { feedback, stats, isLoading, refresh: fetch }
}

export function useFaqTranslation(faqId?: string, language?: string) {
  const [translation, setTranslation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!faqId || !language) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('faq_translations').select('*').eq('faq_id', faqId).eq('language', language).single(); setTranslation(data) } finally { setIsLoading(false) }
  }, [faqId, language, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { translation, isLoading, refresh: fetch }
}

export function usePopularFaqs(limit?: number) {
  const [faqs, setFaqs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('faqs').select('*, faq_categories(*)').eq('is_published', true).order('view_count', { ascending: false }).limit(limit || 10); setFaqs(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { faqs, isLoading, refresh: fetch }
}
