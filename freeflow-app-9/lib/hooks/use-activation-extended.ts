'use client'

/**
 * Extended Activation Hooks - Covers all Activation-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useActivations(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('activations').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActivationCodes(isUsed?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('activation_codes').select('*').order('created_at', { ascending: false })
      if (isUsed !== undefined) query = query.eq('is_used', isUsed)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isUsed])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
