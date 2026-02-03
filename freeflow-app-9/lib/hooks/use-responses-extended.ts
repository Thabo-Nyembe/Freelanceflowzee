'use client'

/**
 * Extended Responses Hooks
 * Tables: responses, response_templates, response_categories, response_analytics, response_shortcuts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useResponse(responseId?: string) {
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!responseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('responses').select('*, response_templates(*), users(*), response_analytics(*)').eq('id', responseId).single(); setResponse(data) } finally { setIsLoading(false) }
  }, [responseId])
  useEffect(() => { loadData() }, [loadData])
  return { response, isLoading, refresh: loadData }
}

export function useResponses(options?: { entity_type?: string; entity_id?: string; user_id?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('responses').select('*, response_templates(*), users(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('content', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setResponses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.user_id, options?.status, options?.is_public, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { responses, isLoading, refresh: loadData }
}

export function useResponseTemplates(options?: { category_id?: string; user_id?: string; is_shared?: boolean; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('response_templates').select('*, response_categories(*), users(*)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_shared !== undefined) query = query.eq('is_shared', options.is_shared)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.user_id, options?.is_shared, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useResponseCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('response_categories').select('*')
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useResponseShortcuts(userId?: string) {
  const [shortcuts, setShortcuts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('response_shortcuts').select('*, response_templates(*)').eq('user_id', userId).order('shortcut', { ascending: true }); setShortcuts(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { shortcuts, isLoading, refresh: loadData }
}

export function useMyTemplates(userId?: string, options?: { category_id?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('response_templates').select('*, response_categories(*)').eq('user_id', userId)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.category_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function usePopularTemplates(options?: { category_id?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('response_templates').select('*, response_categories(*)').eq('is_active', true).eq('is_shared', true)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 20)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useRecentTemplates(userId?: string, options?: { limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('response_templates').select('*, response_categories(*)').or(`user_id.eq.${userId},is_shared.eq.true`).not('last_used_at', 'is', null).order('last_used_at', { ascending: false }).limit(options?.limit || 10)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useEntityResponses(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('responses').select('*, users(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('status', 'active').order('created_at', { ascending: true }).limit(options?.limit || 100)
      setResponses(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { responses, isLoading, refresh: loadData }
}
