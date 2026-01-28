'use client'

/**
 * Extended Coupon Hooks - Covers all Coupon-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useCoupons(isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('coupons').select('*').order('created_at', { ascending: false })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCouponUsage(couponId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!couponId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('coupon_usage').select('*').eq('coupon_id', couponId).order('used_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [couponId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCreateCoupon() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const create = useCallback(async (couponData: any) => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: createError } = await supabase
        .from('coupons')
        .insert([{ ...couponData, user_id: user?.id }])
        .select()
        .single()
      if (createError) throw createError
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { create, isLoading, error }
}
