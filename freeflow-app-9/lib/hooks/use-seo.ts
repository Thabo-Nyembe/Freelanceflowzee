'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface SEOKeyword {
  id: string
  user_id: string
  keyword: string
  current_position: number | null
  previous_position: number | null
  best_position: number | null
  position_change: number
  trend: 'up' | 'down' | 'stable'
  search_volume: number
  keyword_difficulty: number
  cpc: number | null
  competition: number | null
  estimated_traffic: number
  actual_traffic: number
  click_through_rate: number | null
  target_url: string | null
  target_page_title: string | null
  is_tracking: boolean
  is_primary: boolean
  first_ranked_at: string | null
  last_checked_at: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SEOBacklink {
  id: string
  user_id: string
  source_url: string
  source_domain: string
  target_url: string
  domain_authority: number
  page_authority: number
  spam_score: number
  trust_flow: number
  citation_flow: number
  anchor_text: string | null
  link_type: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
  is_active: boolean
  referral_traffic: number
  first_seen_at: string | null
  last_seen_at: string | null
  lost_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SEOPage {
  id: string
  user_id: string
  url: string
  title: string | null
  meta_description: string | null
  page_speed_score: number
  mobile_score: number
  core_web_vitals_score: number
  word_count: number
  heading_structure: Record<string, any>
  image_count: number
  internal_links: number
  external_links: number
  organic_traffic: number
  impressions: number
  clicks: number
  avg_position: number | null
  bounce_rate: number | null
  avg_session_duration: number
  is_indexed: boolean
  has_sitemap: boolean
  has_robots: boolean
  has_canonical: boolean
  has_structured_data: boolean
  issues: any[]
  recommendations: any[]
  last_crawled_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SEOStats {
  totalKeywords: number
  avgPosition: number
  top10Keywords: number
  totalTraffic: number
  totalBacklinks: number
  avgDomainAuthority: number
  totalPages: number
  avgPageSpeed: number
}

export function useSEOKeywords() {
  const supabase = createClient()
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<SEOKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKeywords = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('seo_keywords')
        .select('*')
        .eq('user_id', user.id)
        .order('search_volume', { ascending: false })

      if (error) throw error
      setKeywords(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch keywords', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createKeyword = async (keyword: Partial<SEOKeyword>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('seo_keywords')
        .insert([{ ...keyword, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setKeywords(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Keyword added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateKeyword = async (id: string, updates: Partial<SEOKeyword>) => {
    try {
      const { data, error } = await supabase
        .from('seo_keywords')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setKeywords(prev => prev.map(k => k.id === id ? data : k))
      toast({ title: 'Success', description: 'Keyword updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteKeyword = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seo_keywords')
        .delete()
        .eq('id', id)

      if (error) throw error
      setKeywords(prev => prev.filter(k => k.id !== id))
      toast({ title: 'Success', description: 'Keyword removed' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateRanking = async (id: string, newPosition: number) => {
    const keyword = keywords.find(k => k.id === id)
    if (!keyword) return

    const positionChange = (keyword.current_position || 0) - newPosition
    const trend = positionChange > 0 ? 'up' : positionChange < 0 ? 'down' : 'stable'

    return updateKeyword(id, {
      previous_position: keyword.current_position,
      current_position: newPosition,
      position_change: positionChange,
      trend,
      best_position: Math.min(newPosition, keyword.best_position || newPosition),
      last_checked_at: new Date().toISOString()
    })
  }

  useEffect(() => {
    fetchKeywords()

    const channel = supabase
      .channel('seo-keywords-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_keywords' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setKeywords(prev => [payload.new as SEOKeyword, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setKeywords(prev => prev.map(k => k.id === payload.new.id ? payload.new as SEOKeyword : k))
        } else if (payload.eventType === 'DELETE') {
          setKeywords(prev => prev.filter(k => k.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchKeywords, supabase])

  return {
    keywords,
    loading,
    error,
    fetchKeywords,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    updateRanking
  }
}

export function useSEOBacklinks() {
  const supabase = createClient()
  const { toast } = useToast()
  const [backlinks, setBacklinks] = useState<SEOBacklink[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBacklinks = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('seo_backlinks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('domain_authority', { ascending: false })

      if (error) throw error
      setBacklinks(data || [])
    } catch (err) {
      console.error('Failed to fetch backlinks:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createBacklink = async (backlink: Partial<SEOBacklink>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('seo_backlinks')
        .insert([{ ...backlink, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setBacklinks(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Backlink added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateBacklink = async (id: string, updates: Partial<SEOBacklink>) => {
    try {
      const { data, error } = await supabase
        .from('seo_backlinks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setBacklinks(prev => prev.map(b => b.id === id ? data : b))
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const markLost = async (id: string) => {
    return updateBacklink(id, {
      is_active: false,
      lost_at: new Date().toISOString()
    })
  }

  useEffect(() => {
    fetchBacklinks()
  }, [fetchBacklinks])

  return { backlinks, loading, createBacklink, updateBacklink, markLost }
}

export function useSEOPages() {
  const supabase = createClient()
  const { toast } = useToast()
  const [pages, setPages] = useState<SEOPage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('organic_traffic', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (err) {
      console.error('Failed to fetch pages:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createPage = async (page: Partial<SEOPage>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('seo_pages')
        .insert([{ ...page, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setPages(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Page added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updatePage = async (id: string, updates: Partial<SEOPage>) => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPages(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  return { pages, loading, createPage, updatePage }
}

export function useSEOStats() {
  const { keywords } = useSEOKeywords()
  const { backlinks } = useSEOBacklinks()
  const { pages } = useSEOPages()

  const getStats = useCallback((): SEOStats => {
    const trackedKeywords = keywords.filter(k => k.is_tracking)
    const rankedKeywords = trackedKeywords.filter(k => k.current_position !== null)
    const top10 = rankedKeywords.filter(k => (k.current_position || 0) <= 10)
    const activeBacklinks = backlinks.filter(b => b.is_active)

    return {
      totalKeywords: keywords.length,
      avgPosition: rankedKeywords.length > 0
        ? rankedKeywords.reduce((sum, k) => sum + (k.current_position || 0), 0) / rankedKeywords.length
        : 0,
      top10Keywords: top10.length,
      totalTraffic: keywords.reduce((sum, k) => sum + k.actual_traffic, 0),
      totalBacklinks: activeBacklinks.length,
      avgDomainAuthority: activeBacklinks.length > 0
        ? activeBacklinks.reduce((sum, b) => sum + b.domain_authority, 0) / activeBacklinks.length
        : 0,
      totalPages: pages.length,
      avgPageSpeed: pages.length > 0
        ? pages.reduce((sum, p) => sum + p.page_speed_score, 0) / pages.length
        : 0
    }
  }, [keywords, backlinks, pages])

  return { getStats }
}
