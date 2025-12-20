'use client'

/**
 * Extended Document Hooks - Covers all 7 Document-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDocumentActivity(documentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_activity').select('*').eq('document_id', documentId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [documentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentComments(documentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_comments').select('*').eq('document_id', documentId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [documentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentRequests(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentShares(documentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_shares').select('*').eq('document_id', documentId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [documentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('document_templates').select('*').order('name', { ascending: true })
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentTranslations(documentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_translations').select('*').eq('document_id', documentId).order('language', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [documentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDocumentVersions(documentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('document_versions').select('*').eq('document_id', documentId).order('version_number', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [documentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
