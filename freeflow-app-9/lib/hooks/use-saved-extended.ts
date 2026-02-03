'use client'

/**
 * Extended Saved Hooks
 * Tables: saved_items, saved_searches, saved_filters, saved_views
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSavedItem(itemId?: string) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('saved_items').select('*').eq('id', itemId).single(); setItem(data) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { item, isLoading, refresh: loadData }
}

export function useSavedItems(options?: { user_id?: string; item_type?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('saved_items').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.item_type) query = query.eq('item_type', options.item_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.item_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useSavedSearches(options?: { user_id?: string; search_type?: string }) {
  const [searches, setSearches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('saved_searches').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.search_type) query = query.eq('search_type', options.search_type)
      const { data } = await query.order('last_used_at', { ascending: false })
      setSearches(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.search_type])
  useEffect(() => { loadData() }, [loadData])
  return { searches, isLoading, refresh: loadData }
}

export function useSavedFilters(options?: { user_id?: string; filter_type?: string }) {
  const [filters, setFilters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('saved_filters').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.filter_type) query = query.eq('filter_type', options.filter_type)
      const { data } = await query.order('name', { ascending: true })
      setFilters(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.filter_type])
  useEffect(() => { loadData() }, [loadData])
  return { filters, isLoading, refresh: loadData }
}

export function useSavedViews(options?: { user_id?: string; view_type?: string; is_default?: boolean }) {
  const [views, setViews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('saved_views').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.view_type) query = query.eq('view_type', options.view_type)
      if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default)
      const { data } = await query.order('name', { ascending: true })
      setViews(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.view_type, options?.is_default])
  useEffect(() => { loadData() }, [loadData])
  return { views, isLoading, refresh: loadData }
}
