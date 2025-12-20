'use client'

/**
 * Extended Role Hooks - Covers all Role-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoles() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('roles').select('*').order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRolePermissions(roleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('role_permissions').select('*, permissions(*)').eq('role_id', roleId); setData(result || []) } finally { setIsLoading(false) }
  }, [roleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
