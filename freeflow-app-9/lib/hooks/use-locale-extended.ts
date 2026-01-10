'use client'

/**
 * Extended Locale Hooks - Covers all Locale/Localization tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLocale(localeId?: string) {
  const [locale, setLocale] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!localeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('locales').select('*').eq('id', localeId).single()
      setLocale(data)
    } finally { setIsLoading(false) }
  }, [localeId])
  useEffect(() => { fetch() }, [fetch])
  return { locale, isLoading, refresh: fetch }
}

export function useLocales(options?: { languageCode?: string; isEnabled?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('locales').select('*')
      if (options?.languageCode) query = query.eq('language_code', options.languageCode)
      if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.languageCode, options?.isEnabled])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDefaultLocale() {
  const [locale, setLocale] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('locales').select('*').eq('is_default', true).single()
      setLocale(data)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { locale, isLoading, refresh: fetch }
}

export function useLocaleStrings(localeCode?: string, namespace?: string) {
  const [strings, setStrings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!localeCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('locale_strings').select('key, value').eq('locale_code', localeCode)
      if (namespace) query = query.eq('namespace', namespace)
      const { data } = await query
      const stringsMap = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
      setStrings(stringsMap)
    } finally { setIsLoading(false) }
  }, [localeCode, namespace])
  useEffect(() => { fetch() }, [fetch])
  return { strings, isLoading, refresh: fetch }
}

export function useEnabledLocales() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('locales').select('*').eq('is_enabled', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
