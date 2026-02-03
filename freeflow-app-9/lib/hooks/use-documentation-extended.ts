'use client'

/**
 * Extended Documentation Hooks
 * Tables: documentation, documentation_versions, documentation_categories, documentation_feedback
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDocumentation(docId?: string) {
  const [doc, setDoc] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('documentation').select('*').eq('id', docId).single(); setDoc(data) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { loadData() }, [loadData])
  return { doc, isLoading, refresh: loadData }
}

export function useDocumentationList(options?: { category_id?: string; is_published?: boolean; search?: string; limit?: number }) {
  const [docs, setDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('documentation').select('*')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('title', { ascending: true }).limit(options?.limit || 50)
      setDocs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.is_published, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { docs, isLoading, refresh: loadData }
}

export function useDocumentationCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('documentation_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useDocumentationVersions(docId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!docId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('documentation_versions').select('*').eq('documentation_id', docId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [docId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function usePublishedDocumentation(options?: { category_id?: string; limit?: number }) {
  const [docs, setDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('documentation').select('*').eq('is_published', true)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.order('title', { ascending: true }).limit(options?.limit || 50)
      setDocs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { docs, isLoading, refresh: loadData }
}
