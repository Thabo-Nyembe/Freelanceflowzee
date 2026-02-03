'use client'

/**
 * Extended Component Hooks - Covers all 8 Component-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useComponentAnalytics(componentId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_analytics').select('*').eq('component_id', componentId).single(); setData(result) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentCollections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_collections').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentDownloads(componentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_downloads').select('*').eq('component_id', componentId).order('downloaded_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentExamples(componentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_examples').select('*').eq('component_id', componentId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentFavorites(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentReviews(componentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_reviews').select('*').eq('component_id', componentId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentShowcases() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_showcases').select('*').eq('is_featured', true).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useComponentVersions(componentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('component_versions').select('*').eq('component_id', componentId).order('version', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
