'use client'

/**
 * Extended Languages Hooks
 * Tables: languages, language_translations, language_locales, language_strings, language_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLanguage(languageId?: string) {
  const [language, setLanguage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!languageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('languages').select('*').eq('id', languageId).single(); setLanguage(data) } finally { setIsLoading(false) }
  }, [languageId])
  useEffect(() => { loadData() }, [loadData])
  return { language, isLoading, refresh: loadData }
}

export function useLanguages(options?: { is_active?: boolean }) {
  const [languages, setLanguages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('languages').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setLanguages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { languages, isLoading, refresh: loadData }
}

export function useTranslations(languageCode?: string, options?: { namespace?: string }) {
  const [translations, setTranslations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!languageCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('language_translations').select('*').eq('language_code', languageCode)
      if (options?.namespace) query = query.eq('namespace', options.namespace)
      const { data } = await query.order('key', { ascending: true })
      setTranslations(data || [])
    } finally { setIsLoading(false) }
  }, [languageCode, options?.namespace])
  useEffect(() => { loadData() }, [loadData])
  return { translations, isLoading, refresh: loadData }
}

export function useTranslation(languageCode?: string, key?: string, namespace?: string) {
  const [translation, setTranslation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!languageCode || !key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('language_translations').select('*').eq('language_code', languageCode).eq('key', key)
      if (namespace) query = query.eq('namespace', namespace)
      const { data } = await query.single()
      setTranslation(data)
    } finally { setIsLoading(false) }
  }, [languageCode, key, namespace])
  useEffect(() => { loadData() }, [loadData])
  return { translation, isLoading, refresh: loadData }
}

export function useLocales() {
  const [locales, setLocales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('language_locales').select('*').order('name', { ascending: true }); setLocales(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { locales, isLoading, refresh: loadData }
}

export function useUserLanguagePreference(userId?: string) {
  const [preference, setPreference] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('language_preferences').select('*, languages(*)').eq('user_id', userId).single(); setPreference(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { preference, isLoading, refresh: loadData }
}

export function useDefaultLanguage() {
  const [language, setLanguage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('languages').select('*').eq('is_default', true).single(); setLanguage(data) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { language, isLoading, refresh: loadData }
}

export function useTranslationStrings(namespace?: string) {
  const [strings, setStrings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('language_strings').select('key, value')
      if (namespace) query = query.eq('namespace', namespace)
      const { data } = await query
      const stringMap: Record<string, string> = {}
      data?.forEach(s => { stringMap[s.key] = s.value })
      setStrings(stringMap)
    } finally { setIsLoading(false) }
  }, [namespace])
  useEffect(() => { loadData() }, [loadData])
  return { strings, isLoading, refresh: loadData }
}
