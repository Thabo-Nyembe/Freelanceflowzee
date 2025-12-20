'use client'

/**
 * Extended Discount Hooks - Covers all Discount-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDiscounts(isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('discounts').select('*').order('created_at', { ascending: false })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDiscountCodes(discountId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!discountId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('discount_codes').select('*').eq('discount_id', discountId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [discountId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
