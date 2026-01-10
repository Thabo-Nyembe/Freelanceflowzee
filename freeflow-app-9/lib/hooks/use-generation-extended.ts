'use client'

/**
 * Extended Generation Hooks
 * Tables: generations, generation_templates, generation_history, generation_models, generation_outputs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGeneration(generationId?: string) {
  const [generation, setGeneration] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!generationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('generations').select('*, generation_outputs(*)').eq('id', generationId).single(); setGeneration(data) } finally { setIsLoading(false) }
  }, [generationId])
  useEffect(() => { fetch() }, [fetch])
  return { generation, isLoading, refresh: fetch }
}

export function useGenerations(options?: { user_id?: string; type?: string; status?: string; model_id?: string; limit?: number }) {
  const [generations, setGenerations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('generations').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.model_id) query = query.eq('model_id', options.model_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setGenerations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.model_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { generations, isLoading, refresh: fetch }
}

export function useUserGenerations(userId?: string, options?: { type?: string; limit?: number }) {
  const [generations, setGenerations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('generations').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setGenerations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { generations, isLoading, refresh: fetch }
}

export function useGenerationTemplates(options?: { type?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('generation_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_public, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useGenerationTemplate(templateId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('generation_templates').select('*').eq('id', templateId).single(); setTemplate(data) } finally { setIsLoading(false) }
  }, [templateId])
  useEffect(() => { fetch() }, [fetch])
  return { template, isLoading, refresh: fetch }
}

export function useGenerationModels(options?: { type?: string; is_active?: boolean }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('generation_models').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { models, isLoading, refresh: fetch }
}

export function useGenerationOutputs(generationId?: string) {
  const [outputs, setOutputs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!generationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('generation_outputs').select('*').eq('generation_id', generationId).order('created_at', { ascending: true }); setOutputs(data || []) } finally { setIsLoading(false) }
  }, [generationId])
  useEffect(() => { fetch() }, [fetch])
  return { outputs, isLoading, refresh: fetch }
}

export function useGenerationHistory(userId?: string, options?: { type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('generation_history').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePopularTemplates(limit?: number) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('generation_templates').select('*').eq('is_public', true).order('usage_count', { ascending: false }).limit(limit || 10); setTemplates(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}
