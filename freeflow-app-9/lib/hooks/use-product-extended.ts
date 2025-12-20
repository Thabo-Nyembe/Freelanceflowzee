'use client'

/**
 * Extended Product Hooks - Covers all Product-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProducts(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('products').select('*').eq('is_active', true).order('name', { ascending: true })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useProductVariants(productId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('product_variants').select('*').eq('product_id', productId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [productId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
