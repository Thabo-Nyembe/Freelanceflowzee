'use client'

/**
 * Extended Category Hooks - Covers all Category-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCategories(parentId?: string | null, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('categories').select('*').order('sort_order', { ascending: true })
      if (parentId === null) query = query.is('parent_id', null)
      else if (parentId) query = query.eq('parent_id', parentId)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCategoryItems(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!categoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('category_items').select('*').eq('category_id', categoryId).order('sort_order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [categoryId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
