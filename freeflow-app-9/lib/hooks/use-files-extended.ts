'use client'

/**
 * Extended Files Hooks
 * Tables: files, file_versions, file_shares, file_permissions, file_tags, file_metadata
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFile(fileId?: string) {
  const [file, setFile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('files').select('*, file_versions(*), file_tags(*), file_metadata(*)').eq('id', fileId).single(); setFile(data) } finally { setIsLoading(false) }
  }, [fileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { file, isLoading, refresh: fetch }
}

export function useFiles(options?: { owner_id?: string; folder_id?: string; mime_type?: string; is_starred?: boolean; is_deleted?: boolean; limit?: number }) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('files').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.mime_type) query = query.ilike('mime_type', `${options.mime_type}%`)
      if (options?.is_starred !== undefined) query = query.eq('is_starred', options.is_starred)
      if (options?.is_deleted !== undefined) query = query.eq('is_deleted', options.is_deleted)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setFiles(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.folder_id, options?.mime_type, options?.is_starred, options?.is_deleted, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useUserFiles(userId?: string, options?: { folder_id?: string; is_deleted?: boolean }) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('files').select('*').eq('owner_id', userId)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.is_deleted !== undefined) query = query.eq('is_deleted', options.is_deleted)
      const { data } = await query.order('updated_at', { ascending: false })
      setFiles(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.folder_id, options?.is_deleted, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useFileVersions(fileId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [fileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useFileShares(fileId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('file_shares').select('*').eq('file_id', fileId).order('shared_at', { ascending: false }); setShares(data || []) } finally { setIsLoading(false) }
  }, [fileId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function useSharedWithMe(userId?: string) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('file_shares').select('*, files(*)').eq('shared_with', userId).order('shared_at', { ascending: false }); setFiles(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useStarredFiles(userId?: string) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('files').select('*').eq('owner_id', userId).eq('is_starred', true).eq('is_deleted', false).order('updated_at', { ascending: false }); setFiles(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useRecentFiles(userId?: string, limit?: number) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('files').select('*').eq('owner_id', userId).eq('is_deleted', false).order('updated_at', { ascending: false }).limit(limit || 20); setFiles(data || []) } finally { setIsLoading(false) }
  }, [userId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useTrashFiles(userId?: string) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('files').select('*').eq('owner_id', userId).eq('is_deleted', true).order('deleted_at', { ascending: false }); setFiles(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useFileSearch(query?: string, options?: { owner_id?: string; mime_type?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let q = supabase.from('files').select('*').eq('is_deleted', false).ilike('name', `%${query}%`)
      if (options?.owner_id) q = q.eq('owner_id', options.owner_id)
      if (options?.mime_type) q = q.ilike('mime_type', `${options.mime_type}%`)
      const { data } = await q.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.owner_id, options?.mime_type, options?.limit, supabase])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}
