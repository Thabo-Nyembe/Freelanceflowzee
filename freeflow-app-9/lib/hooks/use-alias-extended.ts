'use client'

/**
 * Extended Alias Hooks - Covers all Alias-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAlias(aliasId?: string) {
  const [alias, setAlias] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!aliasId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('aliases').select('*').eq('id', aliasId).single()
      setAlias(data)
    } finally { setIsLoading(false) }
  }, [aliasId])
  useEffect(() => { loadData() }, [loadData])
  return { alias, isLoading, refresh: loadData }
}

export function useAliasByName(name?: string, type?: string) {
  const [alias, setAlias] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!name) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('aliases').select('*').eq('alias_name', name)
      if (type) query = query.eq('alias_type', type)
      const { data } = await query.single()
      setAlias(data)
    } finally { setIsLoading(false) }
  }, [name, type])
  useEffect(() => { loadData() }, [loadData])
  return { alias, isLoading, refresh: loadData }
}

export function useTargetAliases(targetId?: string, targetType?: string) {
  const [data, setData] = useState<any[]>([])
  const [primaryAlias, setPrimaryAlias] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!targetId || !targetType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('aliases').select('*').eq('target_id', targetId).eq('target_type', targetType).eq('is_active', true).order('is_primary', { ascending: false })
      setData(result || [])
      setPrimaryAlias(result?.find(a => a.is_primary) || null)
    } finally { setIsLoading(false) }
  }, [targetId, targetType])
  useEffect(() => { loadData() }, [loadData])
  return { data, primaryAlias, isLoading, refresh: loadData }
}

export function useUserAliases(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('aliases').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAliasAvailability(aliasName?: string, aliasType?: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!aliasName || !aliasType) { setIsAvailable(null); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('aliases').select('id').eq('alias_name', aliasName).eq('alias_type', aliasType).single()
      setIsAvailable(!data)
    } catch { setIsAvailable(true) } finally { setIsLoading(false) }
  }, [aliasName, aliasType])
  useEffect(() => { check() }, [check])
  return { isAvailable, isLoading, check }
}
