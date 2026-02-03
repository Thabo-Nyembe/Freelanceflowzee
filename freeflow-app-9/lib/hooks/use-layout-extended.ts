'use client'

/**
 * Extended Layout Hooks - Covers all Layout-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLayouts(layoutType?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('layouts').select('*').order('name', { ascending: true })
      if (layoutType) query = query.eq('layout_type', layoutType)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [layoutType, isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUserLayout(userId?: string, layoutType?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('user_layouts').select('*, layouts(*)').eq('user_id', userId).eq('is_active', true)
      if (layoutType) query = query.eq('layout_type', layoutType)
      const { data: result } = await query.single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [userId, layoutType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLayoutSections(layoutId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!layoutId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('layout_sections').select('*').eq('layout_id', layoutId).order('sort_order', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [layoutId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
