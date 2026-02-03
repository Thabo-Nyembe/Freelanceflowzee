'use client'

/**
 * Extended Project Hooks - Covers all 10 Project-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProjectAccess(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_access').select('*').eq('project_id', projectId); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectActivity(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_activity').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectAnalyses(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_analyses').select('*').eq('project_id', projectId).order('analyzed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectAnalytics(projectId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_analytics').select('*').eq('project_id', projectId).single(); setData(result) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectBaselines(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_baselines').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectDeliverables(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_deliverables').select('*').eq('project_id', projectId).order('due_date', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectFiles(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectPhases(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_phases').select('*').eq('project_id', projectId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectProfitability(projectId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('project_profitability').select('*').eq('project_id', projectId).single(); setData(result) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useProjectTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('project_templates').select('*').order('name', { ascending: true })
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
