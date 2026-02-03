'use client'

/**
 * Extended Help Hooks - Covers all 4 Help-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHelpArticles(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('help_articles').select('*').eq('is_published', true).order('title', { ascending: true })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useHelpCategories() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('help_categories').select('*').order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useHelpDocs(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('help_docs').select('*').order('title', { ascending: true })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useHelpFeedback(articleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!articleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('help_feedback').select('*').eq('article_id', articleId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [articleId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
