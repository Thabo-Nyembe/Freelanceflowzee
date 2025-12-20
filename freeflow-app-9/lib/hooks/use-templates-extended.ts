'use client'

/**
 * Extended Templates Hooks
 * Tables: templates, template_categories, template_versions, template_variables, template_usages, template_shares
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTemplate(templateId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('templates').select('*, template_categories(*), template_versions(*), template_variables(*)').eq('id', templateId).single(); setTemplate(data) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { template, isLoading, refresh: fetch }
}

export function useTemplates(options?: { template_type?: string; category_id?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('templates').select('*, template_categories(*)')
      if (options?.template_type) query = query.eq('template_type', options.template_type)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.template_type, options?.category_id, options?.created_by, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useMyTemplates(userId?: string, options?: { template_type?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('templates').select('*, template_categories(*)').eq('created_by', userId)
      if (options?.template_type) query = query.eq('template_type', options.template_type)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.template_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useTemplateVersions(templateId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [currentVersion, setCurrentVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('template_versions').select('*, users(*)').eq('template_id', templateId).order('version', { ascending: false })
      setVersions(data || [])
      setCurrentVersion(data?.[0] || null)
    } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, currentVersion, isLoading, refresh: fetch }
}

export function useTemplateVariables(templateId?: string) {
  const [variables, setVariables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('template_variables').select('*').eq('template_id', templateId).order('name', { ascending: true }); setVariables(data || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { variables, isLoading, refresh: fetch }
}

export function useTemplateUsages(templateId?: string, options?: { user_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [usages, setUsages] = useState<any[]>([])
  const [totalUsages, setTotalUsages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('template_usages').select('*, users(*)').eq('template_id', templateId)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.from_date) query = query.gte('used_at', options.from_date)
      if (options?.to_date) query = query.lte('used_at', options.to_date)
      const { data, count } = await query.order('used_at', { ascending: false }).limit(options?.limit || 50)
      setUsages(data || [])
      setTotalUsages(count || data?.length || 0)
    } finally { setIsLoading(false) }
  }, [templateId, options?.user_id, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { usages, totalUsages, isLoading, refresh: fetch }
}

export function useSharedTemplates(userId?: string, options?: { share_type?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('template_shares').select('*, templates(*, template_categories(*))').eq('shared_with', userId)
      if (options?.share_type) query = query.eq('share_type', options.share_type)
      const { data } = await query.order('created_at', { ascending: false })
      setTemplates((data || []).map(s => ({ ...s.templates, share: s })))
    } finally { setIsLoading(false) }
  }, [userId, options?.share_type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useTemplateCategories(options?: { parent_id?: string | null }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('template_categories').select('*')
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function usePopularTemplates(options?: { template_type?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('templates').select('*, template_categories(*)').eq('is_public', true)
      if (options?.template_type) query = query.eq('template_type', options.template_type)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 20)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.template_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}
