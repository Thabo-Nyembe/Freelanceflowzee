'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FAQ {
  id: string
  user_id: string
  question: string
  answer: string
  category: string | null
  status: 'draft' | 'published' | 'review' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  views_count: number
  helpful_count: number
  not_helpful_count: number
  searches_count: number
  related_faqs: string[]
  tags: string[]
  author: string | null
  average_read_time: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FAQStats {
  total: number
  published: number
  draft: number
  review: number
  archived: number
  totalViews: number
  totalHelpful: number
  avgHelpfulness: number
}

export function useFAQs(initialFAQs: FAQ[] = [], initialStats: FAQStats = {
  total: 0, published: 0, draft: 0, review: 0, archived: 0,
  totalViews: 0, totalHelpful: 0, avgHelpfulness: 0
}) {
  const [faqs, setFAQs] = useState<FAQ[]>(initialFAQs)
  const [stats, setStats] = useState<FAQStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((faqList: FAQ[]) => {
    const totalHelpful = faqList.reduce((sum, f) => sum + f.helpful_count, 0)
    const totalNotHelpful = faqList.reduce((sum, f) => sum + f.not_helpful_count, 0)
    const total = totalHelpful + totalNotHelpful
    return {
      total: faqList.length,
      published: faqList.filter(f => f.status === 'published').length,
      draft: faqList.filter(f => f.status === 'draft').length,
      review: faqList.filter(f => f.status === 'review').length,
      archived: faqList.filter(f => f.status === 'archived').length,
      totalViews: faqList.reduce((sum, f) => sum + f.views_count, 0),
      totalHelpful,
      avgHelpfulness: total > 0 ? Math.round((totalHelpful / total) * 100) : 0
    }
  }, [])

  // Fetch initial data
  const fetchFAQs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const faqList = (data || []) as FAQ[]
      setFAQs(faqList)
      setStats(calculateStats(faqList))
    } catch (err: any) {
      setError(err.message || 'Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Initial fetch
  useEffect(() => {
    fetchFAQs()
  }, [fetchFAQs])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('faqs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFAQs(prev => {
            const updated = [payload.new as FAQ, ...prev]
            setStats(calculateStats(updated))
            return updated
          })
        } else if (payload.eventType === 'UPDATE') {
          setFAQs(prev => {
            const updated = prev.map(f => f.id === payload.new.id ? payload.new as FAQ : f)
            setStats(calculateStats(updated))
            return updated
          })
        } else if (payload.eventType === 'DELETE') {
          setFAQs(prev => {
            const updated = prev.filter(f => f.id !== payload.old.id)
            setStats(calculateStats(updated))
            return updated
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, calculateStats])

  const createFAQ = useCallback(async (input: Partial<FAQ>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('faqs')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateFAQ = useCallback(async (id: string, input: Partial<FAQ>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteFAQ = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const markHelpful = useCallback(async (id: string, helpful: boolean) => {
    const faq = faqs.find(f => f.id === id)
    if (!faq) return { data: null, error: 'FAQ not found' }

    return updateFAQ(id, {
      helpful_count: helpful ? faq.helpful_count + 1 : faq.helpful_count,
      not_helpful_count: !helpful ? faq.not_helpful_count + 1 : faq.not_helpful_count
    })
  }, [faqs, updateFAQ])

  return {
    faqs,
    stats,
    loading,
    error,
    refetch: fetchFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    markHelpful
  }
}
