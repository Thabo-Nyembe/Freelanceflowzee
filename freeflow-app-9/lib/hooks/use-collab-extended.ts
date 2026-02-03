'use client'

/**
 * Extended Collaboration Hooks
 * Tables: collab_spaces, collab_documents, collab_cursors, collab_comments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCollabSpace(spaceId?: string) {
  const [space, setSpace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!spaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collab_spaces').select('*, collab_documents(*)').eq('id', spaceId).single(); setSpace(data) } finally { setIsLoading(false) }
  }, [spaceId])
  useEffect(() => { loadData() }, [loadData])
  return { space, isLoading, refresh: loadData }
}

export function useCollabSpaces(options?: { owner_id?: string; visibility?: string; type?: string; limit?: number }) {
  const [spaces, setSpaces] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('collab_spaces').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setSpaces(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.visibility, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { spaces, isLoading, refresh: loadData }
}

export function useCollabDocument(docId?: string) {
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collab_documents').select('*').eq('id', docId).single(); setDocument(data) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { loadData() }, [loadData])
  return { document, isLoading, refresh: loadData }
}

export function useCollabDocuments(spaceId?: string, options?: { type?: string; limit?: number }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!spaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('collab_documents').select('*').eq('space_id', spaceId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setDocuments(data || [])
    } finally { setIsLoading(false) }
  }, [spaceId, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { documents, isLoading, refresh: loadData }
}

export function useCollabDocumentRealtime(docId?: string) {
  const [document, setDocument] = useState<any>(null)
  const [cursors, setCursors] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!docId) return
    supabase.from('collab_documents').select('*').eq('id', docId).single().then(({ data }) => setDocument(data))
    supabase.from('collab_cursors').select('*').eq('document_id', docId).then(({ data }) => setCursors(data || []))
    const channel = supabase.channel(`collab_doc_${docId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_documents', filter: `id=eq.${docId}` }, (payload) => {
        setDocument(payload.new)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_cursors', filter: `document_id=eq.${docId}` }, () => {
        supabase.from('collab_cursors').select('*').eq('document_id', docId).then(({ data }) => setCursors(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [docId])
  return { document, cursors }
}

export function useCollabComments(docId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collab_comments').select('*').eq('document_id', docId).order('created_at', { ascending: true }); setComments(data || []) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useCollabCommentsRealtime(docId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!docId) return
    supabase.from('collab_comments').select('*').eq('document_id', docId).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
    const channel = supabase.channel(`collab_comments_${docId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_comments', filter: `document_id=eq.${docId}` }, () => {
        supabase.from('collab_comments').select('*').eq('document_id', docId).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [docId])
  return { comments }
}

export function useActiveCollaborators(docId?: string) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!docId) return
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    supabase.from('collab_cursors').select('*').eq('document_id', docId).gte('last_seen', fiveMinutesAgo).then(({ data }) => setCollaborators(data || []))
    const interval = setInterval(() => {
      const ago = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      supabase.from('collab_cursors').select('*').eq('document_id', docId).gte('last_seen', ago).then(({ data }) => setCollaborators(data || []))
    }, 10000)
    return () => clearInterval(interval)
  }, [docId])
  return { collaborators }
}
