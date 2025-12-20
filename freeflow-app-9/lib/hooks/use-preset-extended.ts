'use client'

/**
 * Extended Preset Hooks - Covers all Preset-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePreset(presetId?: string) {
  const [preset, setPreset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!presetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('presets').select('*').eq('id', presetId).single()
      setPreset(data)
    } finally { setIsLoading(false) }
  }, [presetId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preset, isLoading, refresh: fetch }
}

export function usePresets(options?: { presetType?: string; category?: string; isPublic?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('presets').select('*')
      if (options?.presetType) query = query.eq('preset_type', options.presetType)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.isPublic !== undefined) query = query.eq('is_public', options.isPublic)
      const { data: result } = await query.order('usage_count', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.presetType, options?.category, options?.isPublic, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDefaultPreset(presetType?: string, workspaceId?: string) {
  const [preset, setPreset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!presetType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('presets').select('*').eq('preset_type', presetType).eq('is_default', true)
      if (workspaceId) query = query.eq('workspace_id', workspaceId)
      const { data } = await query.single()
      setPreset(data)
    } finally { setIsLoading(false) }
  }, [presetType, workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preset, isLoading, refresh: fetch }
}

export function useMyPresets(userId?: string, presetType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('presets').select('*').eq('user_id', userId)
      if (presetType) query = query.eq('preset_type', presetType)
      const { data: result } = await query.order('updated_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, presetType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
