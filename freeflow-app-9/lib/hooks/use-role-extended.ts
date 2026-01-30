'use client'

/**
 * Extended Role Hooks - Covers all Role-related tables
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

export function useRoles() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('roles').select('*').order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRolePermissions(roleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('role_permissions').select('*, permissions(*)').eq('role_id', roleId); setData(result || []) } finally { setIsLoading(false) }
  }, [roleId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
