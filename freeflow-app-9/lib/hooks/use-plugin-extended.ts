'use client'

/**
 * Extended Plugin Hooks - Covers all 7 Plugin-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePluginAnalytics(pluginId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pluginId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_analytics').select('*').eq('plugin_id', pluginId).single(); setData(result) } finally { setIsLoading(false) }
  }, [pluginId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginAuthors() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_authors').select('*').order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginCollections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_collections').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginDownloads(pluginId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pluginId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_downloads').select('*').eq('plugin_id', pluginId).order('downloaded_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [pluginId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginReviews(pluginId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pluginId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_reviews').select('*').eq('plugin_id', pluginId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [pluginId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginVersions(pluginId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pluginId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_versions').select('*').eq('plugin_id', pluginId).order('version', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [pluginId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePluginWishlists(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('plugin_wishlists').select('*').eq('user_id', userId).order('added_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
