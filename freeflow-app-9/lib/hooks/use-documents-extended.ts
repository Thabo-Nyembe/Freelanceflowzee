'use client'

/**
 * Extended Documents Hooks
 * Tables: documents, document_versions, document_shares, document_signatures
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDocument(documentId?: string) {
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('documents').select('*').eq('id', documentId).single(); setDocument(data) } finally { setIsLoading(false) }
  }, [documentId])
  useEffect(() => { fetch() }, [fetch])
  return { document, isLoading, refresh: fetch }
}

export function useDocuments(options?: { user_id?: string; folder_id?: string; type?: string; status?: string; limit?: number }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('documents').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setDocuments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.folder_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { documents, isLoading, refresh: fetch }
}

export function useDocumentVersions(documentId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('document_versions').select('*').eq('document_id', documentId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [documentId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useDocumentShares(documentId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('document_shares').select('*').eq('document_id', documentId); setShares(data || []) } finally { setIsLoading(false) }
  }, [documentId])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function useDocumentSignatures(documentId?: string) {
  const [signatures, setSignatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!documentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('document_signatures').select('*').eq('document_id', documentId).order('order', { ascending: true }); setSignatures(data || []) } finally { setIsLoading(false) }
  }, [documentId])
  useEffect(() => { fetch() }, [fetch])
  return { signatures, isLoading, refresh: fetch }
}

export function useMyDocuments(userId?: string, options?: { limit?: number }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('documents').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(options?.limit || 50); setDocuments(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { documents, isLoading, refresh: fetch }
}
