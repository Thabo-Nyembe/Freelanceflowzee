'use client'

/**
 * Extended Generated Content Hooks
 * Tables: generated_content, generated_images, generated_code, generated_reports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGeneratedContent(contentId?: string) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('generated_content').select('*').eq('id', contentId).single(); setContent(data) } finally { setIsLoading(false) }
  }, [contentId])
  useEffect(() => { fetch() }, [fetch])
  return { content, isLoading, refresh: fetch }
}

export function useGeneratedContentList(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [contents, setContents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('generated_content').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setContents(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { contents, isLoading, refresh: fetch }
}

export function useGeneratedImages(userId?: string, options?: { limit?: number }) {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('generated_images').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setImages(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { images, isLoading, refresh: fetch }
}

export function useGeneratedCode(userId?: string, options?: { language?: string; limit?: number }) {
  const [code, setCode] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('generated_code').select('*').eq('user_id', userId)
      if (options?.language) query = query.eq('language', options.language)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCode(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.language, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { code, isLoading, refresh: fetch }
}

export function useGeneratedReports(userId?: string, options?: { type?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('generated_reports').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}
