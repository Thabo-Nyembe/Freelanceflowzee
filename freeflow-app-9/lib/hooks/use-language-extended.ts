'use client'

/**
 * Extended Language Hooks - Covers all Language-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLanguage(languageId?: string) {
  const [language, setLanguage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!languageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('languages').select('*').eq('id', languageId).single()
      setLanguage(data)
    } finally { setIsLoading(false) }
  }, [languageId])
  useEffect(() => { fetch() }, [fetch])
  return { language, isLoading, refresh: fetch }
}

export function useLanguages(options?: { isSupported?: boolean; isEnabled?: boolean; direction?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('languages').select('*')
      if (options?.isSupported !== undefined) query = query.eq('is_supported', options.isSupported)
      if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled)
      if (options?.direction) query = query.eq('direction', options.direction)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.isSupported, options?.isEnabled, options?.direction, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSupportedLanguages() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('languages').select('*').eq('is_supported', true).eq('is_enabled', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserLanguage(userId?: string) {
  const [language, setLanguage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('user_language_preferences').select('language_code, languages(*)').eq('user_id', userId).single()
      setLanguage(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { language, isLoading, refresh: fetch }
}

export function useRTLLanguages() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('languages').select('*').eq('direction', 'rtl').eq('is_enabled', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
