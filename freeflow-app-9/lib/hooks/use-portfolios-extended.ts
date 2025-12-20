'use client'

/**
 * Extended Portfolios Hooks
 * Tables: portfolios, portfolio_items, portfolio_categories, portfolio_views, portfolio_testimonials, portfolio_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePortfolio(portfolioId?: string) {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolios').select('*, portfolio_items(*), portfolio_categories(*), portfolio_testimonials(*)').eq('id', portfolioId).single(); setPortfolio(data) } finally { setIsLoading(false) }
  }, [portfolioId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { portfolio, isLoading, refresh: fetch }
}

export function usePortfolioBySlug(slug?: string) {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolios').select('*, portfolio_items(*), portfolio_categories(*), portfolio_testimonials(*)').eq('slug', slug).eq('is_public', true).single(); setPortfolio(data) } finally { setIsLoading(false) }
  }, [slug, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { portfolio, isLoading, refresh: fetch }
}

export function usePortfolios(options?: { owner_id?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('portfolios').select('*, portfolio_items(count)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setPortfolios(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { portfolios, isLoading, refresh: fetch }
}

export function usePortfolioItems(portfolioId?: string, options?: { category_id?: string; is_featured?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('portfolio_items').select('*, portfolio_categories(*)').eq('portfolio_id', portfolioId)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured)
      const { data } = await query.order('order', { ascending: true })
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [portfolioId, options?.category_id, options?.is_featured, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePortfolioCategories(portfolioId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolio_categories').select('*, portfolio_items(count)').eq('portfolio_id', portfolioId).order('order', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [portfolioId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function usePortfolioTestimonials(portfolioId?: string, options?: { is_approved?: boolean }) {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('portfolio_testimonials').select('*').eq('portfolio_id', portfolioId)
      if (options?.is_approved !== undefined) query = query.eq('is_approved', options.is_approved)
      const { data } = await query.order('created_at', { ascending: false })
      setTestimonials(data || [])
    } finally { setIsLoading(false) }
  }, [portfolioId, options?.is_approved, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { testimonials, isLoading, refresh: fetch }
}

export function usePortfolioSettings(portfolioId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolio_settings').select('*').eq('portfolio_id', portfolioId).single(); setSettings(data?.settings || {}) } finally { setIsLoading(false) }
  }, [portfolioId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function usePortfolioViews(portfolioId?: string, options?: { from_date?: string; to_date?: string }) {
  const [views, setViews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('portfolio_views').select('*').eq('portfolio_id', portfolioId)
      if (options?.from_date) query = query.gte('viewed_at', options.from_date)
      if (options?.to_date) query = query.lte('viewed_at', options.to_date)
      const { data } = await query.order('viewed_at', { ascending: false })
      setViews(data || [])
    } finally { setIsLoading(false) }
  }, [portfolioId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { views, isLoading, refresh: fetch }
}

export function useMyPortfolios(userId?: string) {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolios').select('*, portfolio_items(count)').eq('owner_id', userId).order('updated_at', { ascending: false }); setPortfolios(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { portfolios, isLoading, refresh: fetch }
}

export function useFeaturedItems(portfolioId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('portfolio_items').select('*, portfolio_categories(*)').eq('portfolio_id', portfolioId).eq('is_featured', true).order('order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [portfolioId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePortfolioStats(portfolioId?: string) {
  const [stats, setStats] = useState<{ viewCount: number; itemCount: number; testimonialCount: number; categoryCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!portfolioId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [portfolioRes, itemsRes, testimonialsRes, categoriesRes] = await Promise.all([
        supabase.from('portfolios').select('view_count').eq('id', portfolioId).single(),
        supabase.from('portfolio_items').select('id', { count: 'exact' }).eq('portfolio_id', portfolioId),
        supabase.from('portfolio_testimonials').select('id', { count: 'exact' }).eq('portfolio_id', portfolioId).eq('is_approved', true),
        supabase.from('portfolio_categories').select('id', { count: 'exact' }).eq('portfolio_id', portfolioId)
      ])
      setStats({
        viewCount: portfolioRes.data?.view_count || 0,
        itemCount: itemsRes.count || 0,
        testimonialCount: testimonialsRes.count || 0,
        categoryCount: categoriesRes.count || 0
      })
    } finally { setIsLoading(false) }
  }, [portfolioId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
