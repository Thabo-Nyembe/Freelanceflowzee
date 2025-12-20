'use client'

/**
 * Extended Plan Hooks - Covers all Plan-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlans(isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('plans').select('*').order('sort_order', { ascending: true })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePlanFeatures(planId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plan_features').select('*').eq('plan_id', planId).order('sort_order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [planId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
