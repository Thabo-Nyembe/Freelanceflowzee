'use client'

/**
 * Extended License Hooks - Covers all License-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLicenses(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('licenses').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLicenseKeys(licenseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!licenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('license_keys').select('*').eq('license_id', licenseId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [licenseId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
