'use client'

/**
 * Extended Render Hooks
 * Tables: render_jobs, render_templates, render_outputs, render_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRenderJob(jobId?: string) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('render_jobs').select('*').eq('id', jobId).single(); setJob(data) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])
  return { job, isLoading, refresh: fetch }
}

export function useRenderJobs(options?: { user_id?: string; status?: string; template_id?: string; limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('render_jobs').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.template_id) query = query.eq('template_id', options.template_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.template_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}

export function useRenderTemplates(options?: { type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('render_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useRenderOutputs(jobId?: string) {
  const [outputs, setOutputs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('render_outputs').select('*').eq('job_id', jobId).order('created_at', { ascending: false }); setOutputs(data || []) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])
  return { outputs, isLoading, refresh: fetch }
}

export function useRenderSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('render_settings').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function usePendingRenderJobs(userId?: string) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('render_jobs').select('*').eq('user_id', userId).in('status', ['pending', 'processing']).order('created_at', { ascending: true }); setJobs(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}
