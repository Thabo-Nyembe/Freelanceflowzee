'use client'

/**
 * Extended Embed Hooks - Covers all Embed-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEmbed(embedId?: string) {
  const [embed, setEmbed] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!embedId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('embeds').select('*').eq('id', embedId).single()
      setEmbed(data)
    } finally { setIsLoading(false) }
  }, [embedId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { embed, isLoading, refresh: fetch }
}

export function useEmbeds(options?: { embedType?: string; workspaceId?: string; userId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('embeds').select('*')
      if (options?.embedType) query = query.eq('embed_type', options.embedType)
      if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.embedType, options?.workspaceId, options?.userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEntityEmbeds(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('entity_embeds').select('embed_id, embeds(*)').eq('entity_type', entityType).eq('entity_id', entityId)
      setData(result?.map(ee => ee.embeds) || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEmbedsByType(embedType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!embedType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('embeds').select('*').eq('embed_type', embedType).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [embedType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
