'use client'

/**
 * Extended File Hooks - Covers all 20 File-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFileAccessLogs(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_access_logs').select('*').eq('file_id', fileId).order('accessed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileActivities(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileActivity(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_activity').select('*').eq('file_id', fileId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileActivityLog(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_activity_log').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileAnalytics(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_analytics').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileBackups(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_backups').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileCache(fileId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_cache').select('*').eq('file_id', fileId).single(); setData(result) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileCollaborators(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_collaborators').select('*').eq('file_id', fileId); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileComments(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_comments').select('*').eq('file_id', fileId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileConversions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_conversions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileDeliveryRecipients(deliveryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!deliveryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_delivery_recipients').select('*').eq('delivery_id', deliveryId); setData(result || []) } finally { setIsLoading(false) }
  }, [deliveryId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileDownloadTransactions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_download_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileDownloads(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_downloads').select('*').eq('file_id', fileId).order('downloaded_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileLocks(fileId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_locks').select('*').eq('file_id', fileId).single(); setData(result) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileMetadata(fileId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_metadata').select('*').eq('file_id', fileId).single(); setData(result) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFilePreviews(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_previews').select('*').eq('file_id', fileId); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileShares(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_shares').select('*').eq('file_id', fileId); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileTags(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_tags').select('*').eq('file_id', fileId); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileThumbnails(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_thumbnails').select('*').eq('file_id', fileId); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFileVersions(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
