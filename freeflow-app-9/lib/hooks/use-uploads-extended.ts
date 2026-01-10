'use client'

/**
 * Extended Uploads Hooks
 * Tables: uploads, upload_chunks, upload_metadata, upload_processing, upload_quotas, upload_shares
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUpload(uploadId?: string) {
  const [upload, setUpload] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('uploads').select('*, upload_metadata(*), upload_processing(*), users(*)').eq('id', uploadId).single(); setUpload(data) } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { upload, isLoading, refresh: fetch }
}

export function useUploads(options?: { uploaded_by?: string; mime_type?: string; status?: string; folder_id?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('uploads').select('*, users(*)')
      if (options?.uploaded_by) query = query.eq('uploaded_by', options.uploaded_by)
      if (options?.mime_type) query = query.ilike('mime_type', `${options.mime_type}%`)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('filename', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUploads(data || [])
    } finally { setIsLoading(false) }
  }, [options?.uploaded_by, options?.mime_type, options?.status, options?.folder_id, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useMyUploads(userId?: string, options?: { status?: string; folder_id?: string; limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('uploads').select('*').eq('uploaded_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUploads(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.folder_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useUploadChunks(uploadId?: string) {
  const [chunks, setChunks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index', { ascending: true }); setChunks(data || []) } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { chunks, isLoading, refresh: fetch }
}

export function useUploadMetadata(uploadId?: string) {
  const [metadata, setMetadata] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('upload_metadata').select('*').eq('upload_id', uploadId)
      const result: Record<string, any> = {}
      data?.forEach(m => { result[m.key] = m.value })
      setMetadata(result)
    } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { metadata, isLoading, refresh: fetch }
}

export function useUploadProcessing(uploadId?: string) {
  const [processing, setProcessing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('upload_processing').select('*').eq('upload_id', uploadId).order('created_at', { ascending: false }); setProcessing(data || []) } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { processing, isLoading, refresh: fetch }
}

export function useUploadQuota(userId?: string) {
  const [quota, setQuota] = useState<{ quota: number; used: number; remaining: number; file_limit: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: quotaData } = await supabase.from('upload_quotas').select('*').eq('user_id', userId).single()
      const { data: uploads } = await supabase.from('uploads').select('size').eq('uploaded_by', userId).eq('status', 'completed')
      const usedBytes = uploads?.reduce((sum, u) => sum + (u.size || 0), 0) || 0
      const maxBytes = quotaData?.max_bytes || 1073741824
      setQuota({
        quota: maxBytes,
        used: usedBytes,
        remaining: maxBytes - usedBytes,
        file_limit: quotaData?.max_files || 1000
      })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { quota, isLoading, refresh: fetch }
}

export function useUploadShares(uploadId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('upload_shares').select('*, users(*)').eq('upload_id', uploadId).eq('is_active', true); setShares(data || []) } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function useSharedWithMe(userId?: string, options?: { limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('upload_shares').select('*, uploads(*)').eq('shared_with', userId).eq('is_active', true).order('created_at', { ascending: false }).limit(options?.limit || 50); setUploads(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useRecentUploads(userId?: string, options?: { days?: number; limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const days = options?.days || 7
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days)
      const { data } = await supabase.from('uploads').select('*').eq('uploaded_by', userId).eq('status', 'completed').gte('created_at', sinceDate.toISOString()).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setUploads(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.days, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useUploadsByType(userId?: string, mimeTypePrefix?: string, options?: { limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !mimeTypePrefix) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('uploads').select('*').eq('uploaded_by', userId).eq('status', 'completed').ilike('mime_type', `${mimeTypePrefix}%`).order('created_at', { ascending: false }).limit(options?.limit || 50); setUploads(data || []) } finally { setIsLoading(false) }
  }, [userId, mimeTypePrefix, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useUploadStats(userId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('uploads').select('size, mime_type, status').eq('uploaded_by', userId)
      const uploads = data || []
      const completed = uploads.filter(u => u.status === 'completed')
      const totalSize = completed.reduce((sum, u) => sum + (u.size || 0), 0)
      const byType: Record<string, number> = {}
      completed.forEach(u => {
        const type = u.mime_type?.split('/')[0] || 'other'
        byType[type] = (byType[type] || 0) + 1
      })
      setStats({
        total_files: uploads.length,
        completed_files: completed.length,
        total_size: totalSize,
        by_type: byType
      })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingUploads(userId?: string) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('uploads').select('*').eq('uploaded_by', userId).in('status', ['pending', 'uploading', 'processing']).order('created_at', { ascending: false }); setUploads(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}
