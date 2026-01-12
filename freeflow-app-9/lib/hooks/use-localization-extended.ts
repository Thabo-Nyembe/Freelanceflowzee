'use client'

/**
 * Extended Localization Hooks
 * Tables: localization_strings, localization_locales, localization_projects, localization_translations, localization_contexts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLocalizationString(stringId?: string) {
  const [string, setString] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!stringId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('localization_strings').select('*, localization_translations(*)').eq('id', stringId).single(); setString(data) } finally { setIsLoading(false) }
  }, [stringId])
  useEffect(() => { fetch() }, [fetch])
  return { string, isLoading, refresh: fetch }
}

export function useLocalizationStrings(options?: { project_id?: string; context_id?: string; status?: string; limit?: number }) {
  const [strings, setStrings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('localization_strings').select('*, localization_translations(*)')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.context_id) query = query.eq('context_id', options.context_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('key', { ascending: true }).limit(options?.limit || 100)
      setStrings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.context_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { strings, isLoading, refresh: fetch }
}

export function useTranslationsForLocale(localeCode?: string, options?: { project_id?: string }) {
  const [translations, setTranslations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!localeCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const query = supabase.from('localization_translations').select('*, localization_strings(*)').eq('locale_code', localeCode)
      const { data } = await query
      setTranslations(data || [])
    } finally { setIsLoading(false) }
  }, [localeCode])
  useEffect(() => { fetch() }, [fetch])
  return { translations, isLoading, refresh: fetch }
}

export function useLocales() {
  const [locales, setLocales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('localization_locales').select('*').order('name', { ascending: true }); setLocales(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { locales, isLoading, refresh: fetch }
}

export function useActiveLocales() {
  const [locales, setLocales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('localization_locales').select('*').eq('is_active', true).order('name', { ascending: true }); setLocales(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { locales, isLoading, refresh: fetch }
}

export function useLocalizationProjects(organizationId?: string) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('localization_projects').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('name', { ascending: true })
      setProjects(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { projects, isLoading, refresh: fetch }
}

export function useLocalizationProject(projectId?: string) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('localization_projects').select('*').eq('id', projectId).single(); setProject(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { project, isLoading, refresh: fetch }
}

export function useTranslationProgress(projectId?: string) {
  const [progress, setProgress] = useState<Record<string, { total: number; translated: number; approved: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: strings } = await supabase.from('localization_strings').select('id').eq('project_id', projectId)
      const stringIds = strings?.map(s => s.id) || []
      const { data: translations } = await supabase.from('localization_translations').select('locale_code, status').in('string_id', stringIds)
      const { data: project } = await supabase.from('localization_projects').select('target_locales').eq('id', projectId).single()

      const progressData: Record<string, { total: number; translated: number; approved: number }> = {}
      project?.target_locales?.forEach((locale: string) => {
        const localeTranslations = translations?.filter(t => t.locale_code === locale) || []
        progressData[locale] = {
          total: strings?.length || 0,
          translated: localeTranslations.length,
          approved: localeTranslations.filter(t => t.status === 'approved').length
        }
      })
      setProgress(progressData)
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useLocalizationSearch(projectId?: string, query?: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('localization_strings').select('*, localization_translations(*)').or(`key.ilike.%${query}%,default_value.ilike.%${query}%`)
      if (projectId) dbQuery = dbQuery.eq('project_id', projectId)
      const { data } = await dbQuery.limit(50)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, query])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useLocalizationContexts(projectId?: string) {
  const [contexts, setContexts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('localization_contexts').select('*').eq('project_id', projectId).order('name', { ascending: true }); setContexts(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { contexts, isLoading, refresh: fetch }
}
