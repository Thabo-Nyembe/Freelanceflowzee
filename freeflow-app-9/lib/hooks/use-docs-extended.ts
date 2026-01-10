'use client'

/**
 * Extended Docs Hooks
 * Tables: docs, doc_pages, doc_versions, doc_contributors, doc_feedback
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDoc(docId?: string) {
  const [doc, setDoc] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('docs').select('*, doc_pages(*), doc_contributors(*)').eq('id', docId).single(); setDoc(data) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { fetch() }, [fetch])
  return { doc, isLoading, refresh: fetch }
}

export function useDocs(options?: { project_id?: string; type?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [docs, setDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('docs').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setDocs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.type, options?.status, options?.is_public, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { docs, isLoading, refresh: fetch }
}

export function useDocPage(pageId?: string) {
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('doc_pages').select('*').eq('id', pageId).single(); setPage(data) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { fetch() }, [fetch])
  return { page, isLoading, refresh: fetch }
}

export function useDocPages(docId?: string) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('doc_pages').select('*').eq('doc_id', docId).order('order', { ascending: true }); setPages(data || []) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { fetch() }, [fetch])
  return { pages, isLoading, refresh: fetch }
}

export function useDocVersions(docId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('doc_versions').select('*').eq('doc_id', docId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useDocContributors(docId?: string) {
  const [contributors, setContributors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('doc_contributors').select('*, users:user_id(*)').eq('doc_id', docId); setContributors(data || []) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { fetch() }, [fetch])
  return { contributors, isLoading, refresh: fetch }
}

export function useDocFeedback(docId?: string, options?: { page_id?: string; type?: string }) {
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('doc_feedback').select('*').eq('doc_id', docId)
      if (options?.page_id) query = query.eq('page_id', options.page_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false })
      setFeedback(data || [])
    } finally { setIsLoading(false) }
  }, [docId, options?.page_id, options?.type])
  useEffect(() => { fetch() }, [fetch])
  return { feedback, isLoading, refresh: fetch }
}

export function usePublicDocs(options?: { type?: string; search?: string; limit?: number }) {
  const [docs, setDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('docs').select('*').eq('is_public', true).eq('status', 'published')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setDocs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { docs, isLoading, refresh: fetch }
}

export function useDocPageHierarchy(docId?: string) {
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('doc_pages').select('*').eq('doc_id', docId).order('order', { ascending: true })
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return items.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) }))
      }
      setHierarchy(buildTree(data || []))
    } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { fetch() }, [fetch])
  return { hierarchy, isLoading, refresh: fetch }
}

export function useUserDocs(userId?: string, options?: { limit?: number }) {
  const [docs, setDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('docs').select('*').eq('owner_id', userId).order('updated_at', { ascending: false }).limit(options?.limit || 50); setDocs(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { docs, isLoading, refresh: fetch }
}
