'use client'

/**
 * Extended Flag Hooks - Covers all Flag-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFlag(flagId?: string) {
  const [flag, setFlag] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!flagId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('flags').select('*').eq('id', flagId).single()
      setFlag(data)
    } finally { setIsLoading(false) }
  }, [flagId])
  useEffect(() => { loadData() }, [loadData])
  return { flag, isLoading, refresh: loadData }
}

export function useFlagByKey(flagKey?: string) {
  const [flag, setFlag] = useState<any>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!flagKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('flags').select('*').eq('flag_key', flagKey).single()
      setFlag(data)
      setIsEnabled(data?.is_enabled ?? false)
    } finally { setIsLoading(false) }
  }, [flagKey])
  useEffect(() => { loadData() }, [loadData])
  return { flag, isEnabled, isLoading, refresh: loadData }
}

export function useFlags(options?: { environment?: string; isEnabled?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('flags').select('*')
      if (options?.environment) query = query.eq('environment', options.environment)
      if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled)
      const { data: result } = await query.order('flag_key', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.environment, options?.isEnabled])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFlagEvaluation(flagKey?: string, context?: Record<string, any>) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [value, setValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const evaluate = useCallback(async () => {
    if (!flagKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: flag } = await supabase.from('flags').select('*').eq('flag_key', flagKey).single()
      if (!flag || !flag.is_enabled) {
        setIsEnabled(false)
        setValue(flag?.default_value || null)
      } else {
        setIsEnabled(true)
        setValue(flag.default_value)
      }
    } finally { setIsLoading(false) }
  }, [flagKey, context])
  useEffect(() => { evaluate() }, [evaluate])
  return { isEnabled, value, isLoading, evaluate }
}
