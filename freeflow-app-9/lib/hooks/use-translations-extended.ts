'use client'

/**
 * Extended Translations Hooks
 * Tables: translations, translation_keys, translation_locales, translation_imports, translation_exports, translation_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTranslation(translationId?: string) {
  const [translation, setTranslation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!translationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('translations').select('*, translation_keys(*), translation_locales(*)').eq('id', translationId).single(); setTranslation(data) } finally { setIsLoading(false) }
  }, [translationId])
  useEffect(() => { fetch() }, [fetch])
  return { translation, isLoading, refresh: fetch }
}

export function useTranslations(options?: { locale?: string; namespace?: string; is_reviewed?: boolean; search?: string; limit?: number }) {
  const [translations, setTranslations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('translations').select('*, translation_keys(*)')
      if (options?.locale) query = query.eq('locale', options.locale)
      if (options?.is_reviewed !== undefined) query = query.eq('is_reviewed', options.is_reviewed)
      if (options?.search) query = query.ilike('value', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      let result = data || []
      if (options?.namespace) {
        result = result.filter(t => t.translation_keys?.namespace === options.namespace)
      }
      setTranslations(result)
    } finally { setIsLoading(false) }
  }, [options?.locale, options?.namespace, options?.is_reviewed, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { translations, isLoading, refresh: fetch }
}

export function useTranslationsByKey(key?: string, namespace: string = 'default') {
  const [translations, setTranslations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: keyRecord } = await supabase.from('translation_keys').select('id').eq('key', key).eq('namespace', namespace).single()
      if (!keyRecord) { setTranslations([]); return }
      const { data } = await supabase.from('translations').select('*, translation_locales(*)').eq('key_id', keyRecord.id).order('locale', { ascending: true })
      setTranslations(data || [])
    } finally { setIsLoading(false) }
  }, [key, namespace])
  useEffect(() => { fetch() }, [fetch])
  return { translations, isLoading, refresh: fetch }
}

export function useTranslationValue(key?: string, locale?: string, namespace: string = 'default') {
  const [value, setValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!key || !locale) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: keyRecord } = await supabase.from('translation_keys').select('id').eq('key', key).eq('namespace', namespace).single()
      if (!keyRecord) { setValue(null); return }
      const { data } = await supabase.from('translations').select('value').eq('key_id', keyRecord.id).eq('locale', locale).single()
      setValue(data?.value || null)
    } finally { setIsLoading(false) }
  }, [key, locale, namespace])
  useEffect(() => { fetch() }, [fetch])
  return { value, isLoading, refresh: fetch }
}

export function useTranslationKeys(options?: { namespace?: string; search?: string; limit?: number }) {
  const [keys, setKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('translation_keys').select('*, translations(count)')
      if (options?.namespace) query = query.eq('namespace', options.namespace)
      if (options?.search) query = query.ilike('key', `%${options.search}%`)
      const { data } = await query.order('key', { ascending: true }).limit(options?.limit || 200)
      setKeys(data || [])
    } finally { setIsLoading(false) }
  }, [options?.namespace, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { keys, isLoading, refresh: fetch }
}

export function useTranslationLocales(options?: { is_active?: boolean }) {
  const [locales, setLocales] = useState<any[]>([])
  const [defaultLocale, setDefaultLocale] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('translation_locales').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setLocales(data || [])
      setDefaultLocale(data?.find(l => l.is_default) || null)
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { locales, defaultLocale, isLoading, refresh: fetch }
}

export function useTranslationNamespaces() {
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('translation_keys').select('namespace')
      const unique = [...new Set(data?.map(k => k.namespace).filter(Boolean))]
      setNamespaces(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { namespaces, isLoading, refresh: fetch }
}

export function useTranslationHistory(translationId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!translationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('translation_history').select('*, users(*)').eq('translation_id', translationId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [translationId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useMissingTranslations(locale?: string, namespace?: string) {
  const [missing, setMissing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locale) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let keysQuery = supabase.from('translation_keys').select('id, key, namespace')
      if (namespace) keysQuery = keysQuery.eq('namespace', namespace)
      const { data: keys } = await keysQuery
      const { data: translations } = await supabase.from('translations').select('key_id').eq('locale', locale)
      const translatedKeyIds = translations?.map(t => t.key_id) || []
      const missingKeys = keys?.filter(k => !translatedKeyIds.includes(k.id)) || []
      setMissing(missingKeys)
    } finally { setIsLoading(false) }
  }, [locale, namespace])
  useEffect(() => { fetch() }, [fetch])
  return { missing, count: missing.length, isLoading, refresh: fetch }
}

export function useTranslationProgress(namespace?: string) {
  const [progress, setProgress] = useState<Record<string, { translated: number; total: number; percentage: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let keysQuery = supabase.from('translation_keys').select('id')
      if (namespace) keysQuery = keysQuery.eq('namespace', namespace)
      const { data: keys } = await keysQuery
      const { data: locales } = await supabase.from('translation_locales').select('code').eq('is_active', true)
      const { data: translations } = await supabase.from('translations').select('key_id, locale')
      const totalKeys = keys?.length || 0
      const progressMap: Record<string, { translated: number; total: number; percentage: number }> = {}
      locales?.forEach(l => {
        const translatedCount = translations?.filter(t => t.locale === l.code).length || 0
        progressMap[l.code] = {
          translated: translatedCount,
          total: totalKeys,
          percentage: totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0
        }
      })
      setProgress(progressMap)
    } finally { setIsLoading(false) }
  }, [namespace])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useUnreviewedTranslations(locale?: string, options?: { namespace?: string; limit?: number }) {
  const [translations, setTranslations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('translations').select('*, translation_keys(*)').eq('is_reviewed', false)
      if (locale) query = query.eq('locale', locale)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      let result = data || []
      if (options?.namespace) {
        result = result.filter(t => t.translation_keys?.namespace === options.namespace)
      }
      setTranslations(result)
    } finally { setIsLoading(false) }
  }, [locale, options?.namespace, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { translations, isLoading, refresh: fetch }
}
