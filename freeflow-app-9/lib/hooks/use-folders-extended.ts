'use client'

/**
 * Extended Folders Hooks
 * Tables: folders, folder_permissions, folder_shares, folder_favorites, folder_activity
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFolder(folderId?: string) {
  const [folder, setFolder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!folderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folders').select('*, folder_permissions(*), files(*)').eq('id', folderId).single(); setFolder(data) } finally { setIsLoading(false) }
  }, [folderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folder, isLoading, refresh: fetch }
}

export function useFolders(options?: { owner_id?: string; parent_id?: string | null; is_deleted?: boolean; limit?: number }) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('folders').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.is_deleted !== undefined) query = query.eq('is_deleted', options.is_deleted)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setFolders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.parent_id, options?.is_deleted, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}

export function useRootFolders(userId?: string) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folders').select('*').eq('owner_id', userId).is('parent_id', null).eq('is_deleted', false).order('name', { ascending: true }); setFolders(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}

export function useSubfolders(parentId?: string) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folders').select('*').eq('parent_id', parentId).eq('is_deleted', false).order('name', { ascending: true }); setFolders(data || []) } finally { setIsLoading(false) }
  }, [parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}

export function useFolderContents(folderId?: string) {
  const [contents, setContents] = useState<{ folders: any[]; files: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!folderId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [foldersResult, filesResult] = await Promise.all([
        supabase.from('folders').select('*').eq('parent_id', folderId).eq('is_deleted', false).order('name', { ascending: true }),
        supabase.from('files').select('*').eq('folder_id', folderId).eq('is_deleted', false).order('name', { ascending: true })
      ])
      setContents({ folders: foldersResult.data || [], files: filesResult.data || [] })
    } finally { setIsLoading(false) }
  }, [folderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { contents, isLoading, refresh: fetch }
}

export function useFolderShares(folderId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!folderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folder_shares').select('*').eq('folder_id', folderId).order('shared_at', { ascending: false }); setShares(data || []) } finally { setIsLoading(false) }
  }, [folderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function useSharedFolders(userId?: string) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folder_shares').select('*, folders(*)').eq('shared_with', userId).order('shared_at', { ascending: false }); setFolders(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}

export function useStarredFolders(userId?: string) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folders').select('*').eq('owner_id', userId).eq('is_starred', true).eq('is_deleted', false).order('name', { ascending: true }); setFolders(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}

export function useFolderBreadcrumbs(folderId?: string) {
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!folderId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const crumbs: any[] = []
      let currentId: string | null = folderId
      while (currentId) {
        const { data } = await supabase.from('folders').select('id, name, parent_id').eq('id', currentId).single()
        if (!data) break
        crumbs.unshift(data)
        currentId = data.parent_id
      }
      setBreadcrumbs(crumbs)
    } finally { setIsLoading(false) }
  }, [folderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { breadcrumbs, isLoading, refresh: fetch }
}

export function useTrashFolders(userId?: string) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('folders').select('*').eq('owner_id', userId).eq('is_deleted', true).order('deleted_at', { ascending: false }); setFolders(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { folders, isLoading, refresh: fetch }
}
