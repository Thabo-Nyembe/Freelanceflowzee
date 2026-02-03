'use client'

/**
 * Extended Tool Hooks
 * Tables: tools, tool_settings, tool_usage, tool_integrations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTool(toolId?: string) {
  const [tool, setTool] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!toolId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tools').select('*').eq('id', toolId).single(); setTool(data) } finally { setIsLoading(false) }
  }, [toolId])
  useEffect(() => { loadData() }, [loadData])
  return { tool, isLoading, refresh: loadData }
}

export function useTools(options?: { type?: string; is_active?: boolean; limit?: number }) {
  const [tools, setTools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tools').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTools(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tools, isLoading, refresh: loadData }
}

export function useToolSettings(toolId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!toolId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tool_settings').select('*').eq('tool_id', toolId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [toolId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useToolUsage(toolId?: string, options?: { days?: number }) {
  const [usage, setUsage] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!toolId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data } = await supabase.from('tool_usage').select('*').eq('tool_id', toolId).gte('created_at', since.toISOString()).order('created_at', { ascending: false }); setUsage(data || []) } finally { setIsLoading(false) }
  }, [toolId, options?.days])
  useEffect(() => { loadData() }, [loadData])
  return { usage, isLoading, refresh: loadData }
}

export function useToolIntegrations(toolId?: string) {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!toolId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tool_integrations').select('*').eq('tool_id', toolId); setIntegrations(data || []) } finally { setIsLoading(false) }
  }, [toolId])
  useEffect(() => { loadData() }, [loadData])
  return { integrations, isLoading, refresh: loadData }
}

export function useActiveTools() {
  const [tools, setTools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('tools').select('*').eq('is_active', true).order('name', { ascending: true }); setTools(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { tools, isLoading, refresh: loadData }
}
