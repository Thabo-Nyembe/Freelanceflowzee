'use client'

/**
 * Extended Code Block Hooks - Covers all Code Block-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCodeBlock(codeBlockId?: string) {
  const [codeBlock, setCodeBlock] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!codeBlockId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('code_blocks').select('*').eq('id', codeBlockId).single()
      setCodeBlock(data)
    } finally { setIsLoading(false) }
  }, [codeBlockId])
  useEffect(() => { fetch() }, [fetch])
  return { codeBlock, isLoading, refresh: fetch }
}

export function useCodeBlocks(options?: { language?: string; entityType?: string; entityId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('code_blocks').select('*')
      if (options?.language) query = query.eq('language', options.language)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.entityId) query = query.eq('entity_id', options.entityId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.language, options?.entityType, options?.entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEntityCodeBlocks(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('code_blocks').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCodeBlockComments(codeBlockId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!codeBlockId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('code_block_comments').select('*, users(id, full_name, avatar_url)').eq('code_block_id', codeBlockId).order('line_number', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [codeBlockId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCodeBlocksByLanguage(language?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!language) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('code_blocks').select('*').eq('language', language).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [language])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
