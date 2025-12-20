'use client'

/**
 * Extended Store Hooks
 * Tables: stores, store_products, store_categories, store_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStore(storeId?: string) {
  const [store, setStore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stores').select('*').eq('id', storeId).single(); setStore(data) } finally { setIsLoading(false) }
  }, [storeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { store, isLoading, refresh: fetch }
}

export function useStores(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  const [stores, setStores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('stores').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setStores(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stores, isLoading, refresh: fetch }
}

export function useStoreProducts(storeId?: string, options?: { category_id?: string; is_active?: boolean; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('store_products').select('*').eq('store_id', storeId); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50); setProducts(data || []) } finally { setIsLoading(false) }
  }, [storeId, options?.category_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { products, isLoading, refresh: fetch }
}

export function useStoreCategories(storeId?: string, options?: { is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('store_categories').select('*').eq('store_id', storeId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data } = await query.order('order', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [storeId, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useStoreSettings(storeId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('store_settings').select('*').eq('store_id', storeId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [storeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useUserStores(userId?: string) {
  const [stores, setStores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stores').select('*').eq('user_id', userId).order('name', { ascending: true }); setStores(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stores, isLoading, refresh: fetch }
}
