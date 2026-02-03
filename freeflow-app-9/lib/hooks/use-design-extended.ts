'use client'

/**
 * Extended Design Hooks
 * Tables: designs, design_versions, design_assets, design_comments, design_exports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDesign(designId?: string) {
  const [design, setDesign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!designId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('designs').select('*, design_versions(*), design_assets(*), design_comments(*)').eq('id', designId).single(); setDesign(data) } finally { setIsLoading(false) }
  }, [designId])
  useEffect(() => { loadData() }, [loadData])
  return { design, isLoading, refresh: loadData }
}

export function useUserDesigns(userId?: string, options?: { project_id?: string; type?: string; status?: string; limit?: number }) {
  const [designs, setDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('designs').select('*').eq('user_id', userId)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setDesigns(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.project_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { designs, isLoading, refresh: loadData }
}

export function useDesignVersions(designId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!designId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('design_versions').select('*').eq('design_id', designId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [designId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function useDesignAssets(designId?: string, options?: { type?: string }) {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!designId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('design_assets').select('*').eq('design_id', designId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false })
      setAssets(data || [])
    } finally { setIsLoading(false) }
  }, [designId, options?.type])
  useEffect(() => { loadData() }, [loadData])
  return { assets, isLoading, refresh: loadData }
}

export function useDesignComments(designId?: string, options?: { is_resolved?: boolean }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!designId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('design_comments').select('*').eq('design_id', designId)
      if (options?.is_resolved !== undefined) query = query.eq('is_resolved', options.is_resolved)
      const { data } = await query.order('created_at', { ascending: true })
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [designId, options?.is_resolved])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useDesignExports(designId?: string) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!designId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('design_exports').select('*').eq('design_id', designId).order('requested_at', { ascending: false }); setExports(data || []) } finally { setIsLoading(false) }
  }, [designId])
  useEffect(() => { loadData() }, [loadData])
  return { exports, isLoading, refresh: loadData }
}

export function useRecentDesigns(userId?: string, limit?: number) {
  const [designs, setDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('designs').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(limit || 10); setDesigns(data || []) } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { designs, isLoading, refresh: loadData }
}

export function useProjectDesigns(projectId?: string, options?: { status?: string }) {
  const [designs, setDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('designs').select('*').eq('project_id', projectId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false })
      setDesigns(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { designs, isLoading, refresh: loadData }
}

export function useDesignTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('designs').select('type')
      const uniqueTypes = [...new Set(data?.map(d => d.type).filter(Boolean))]
      setTypes(uniqueTypes as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useDesignStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; drafts: number; published: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('designs').select('status, type').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const drafts = data.filter(d => d.status === 'draft').length
      const published = data.filter(d => d.status === 'published').length
      const byType = data.reduce((acc: Record<string, number>, d) => { if (d.type) acc[d.type] = (acc[d.type] || 0) + 1; return acc }, {})
      setStats({ total, drafts, published, byType })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
