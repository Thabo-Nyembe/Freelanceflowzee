'use client'

/**
 * Extended Default Hooks - Covers all Default value/setting tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDefault(defaultId?: string) {
  const [defaultValue, setDefaultValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!defaultId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('defaults').select('*').eq('id', defaultId).single()
      setDefaultValue(data)
    } finally { setIsLoading(false) }
  }, [defaultId])
  useEffect(() => { fetch() }, [fetch])
  return { default: defaultValue, isLoading, refresh: fetch }
}

export function useDefaults(options?: { defaultType?: string; entityType?: string; isSystem?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('defaults').select('*')
      if (options?.defaultType) query = query.eq('default_type', options.defaultType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.isSystem !== undefined) query = query.eq('is_system', options.isSystem)
      const { data: result } = await query.order('key', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.defaultType, options?.entityType, options?.isSystem])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDefaultByKey(key?: string, workspaceId?: string) {
  const [value, setValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('defaults').select('value').eq('key', key)
      if (workspaceId) query = query.eq('workspace_id', workspaceId)
      const { data } = await query.single()
      setValue(data?.value)
    } finally { setIsLoading(false) }
  }, [key, workspaceId])
  useEffect(() => { fetch() }, [fetch])
  return { value, isLoading, refresh: fetch }
}

export function useSystemDefaults(defaultType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('defaults').select('*').eq('is_system', true)
      if (defaultType) query = query.eq('default_type', defaultType)
      const { data: result } = await query.order('key', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [defaultType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
