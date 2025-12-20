'use client'

/**
 * Extended Investor Hooks - Covers all Investor-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvestors(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('investors').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvestorUpdates(investorId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!investorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('investor_updates').select('*').eq('investor_id', investorId).order('sent_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [investorId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
