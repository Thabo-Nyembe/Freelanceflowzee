'use client'

/**
 * Extended Notes Hooks
 * Tables: notes, note_folders, note_tags, note_shares, note_versions, note_attachments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNote(noteId?: string) {
  const [note, setNote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!noteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('notes').select('*, note_folders(*), note_tags(*), note_attachments(*)').eq('id', noteId).single(); setNote(data) } finally { setIsLoading(false) }
  }, [noteId])
  useEffect(() => { loadData() }, [loadData])
  return { note, isLoading, refresh: loadData }
}

export function useNotes(userId?: string, options?: { folder_id?: string; is_archived?: boolean; is_pinned?: boolean; search?: string; limit?: number }) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('notes').select('*, note_folders(*), note_tags(*)').eq('user_id', userId)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived)
      if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
      const { data } = await query.order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }).limit(options?.limit || 100)
      setNotes(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.folder_id, options?.is_archived, options?.is_pinned, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { notes, isLoading, refresh: loadData }
}

export function useNoteFolders(userId?: string, parentId?: string | null) {
  const [folders, setFolders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('note_folders').select('*').eq('user_id', userId)
      if (parentId !== undefined) query = parentId ? query.eq('parent_id', parentId) : query.is('parent_id', null)
      const { data } = await query.order('name', { ascending: true })
      setFolders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, parentId])
  useEffect(() => { loadData() }, [loadData])
  return { folders, isLoading, refresh: loadData }
}

export function useNoteTags(noteId?: string) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!noteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('note_tags').select('*').eq('note_id', noteId).order('name', { ascending: true }); setTags(data || []) } finally { setIsLoading(false) }
  }, [noteId])
  useEffect(() => { loadData() }, [loadData])
  return { tags, isLoading, refresh: loadData }
}

export function useNoteShares(noteId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!noteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('note_shares').select('*').eq('note_id', noteId); setShares(data || []) } finally { setIsLoading(false) }
  }, [noteId])
  useEffect(() => { loadData() }, [loadData])
  return { shares, isLoading, refresh: loadData }
}

export function useNoteVersions(noteId?: string, options?: { limit?: number }) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!noteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('note_versions').select('*').eq('note_id', noteId).order('created_at', { ascending: false }).limit(options?.limit || 20); setVersions(data || []) } finally { setIsLoading(false) }
  }, [noteId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function useNoteAttachments(noteId?: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!noteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('note_attachments').select('*').eq('note_id', noteId).order('created_at', { ascending: false }); setAttachments(data || []) } finally { setIsLoading(false) }
  }, [noteId])
  useEffect(() => { loadData() }, [loadData])
  return { attachments, isLoading, refresh: loadData }
}

export function useSharedNotes(userId?: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: shares } = await supabase.from('note_shares').select('note_id').eq('shared_with_id', userId)
      const noteIds = shares?.map(s => s.note_id) || []
      if (noteIds.length === 0) { setNotes([]); setIsLoading(false); return }
      const { data } = await supabase.from('notes').select('*, note_folders(*), note_tags(*)').in('id', noteIds).order('updated_at', { ascending: false })
      setNotes(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { notes, isLoading, refresh: loadData }
}

export function usePinnedNotes(userId?: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('notes').select('*, note_folders(*), note_tags(*)').eq('user_id', userId).eq('is_pinned', true).eq('is_archived', false).order('updated_at', { ascending: false }); setNotes(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { notes, isLoading, refresh: loadData }
}

export function useRecentNotes(userId?: string, options?: { limit?: number }) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('notes').select('*, note_folders(*)').eq('user_id', userId).eq('is_archived', false).order('updated_at', { ascending: false }).limit(options?.limit || 10); setNotes(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { notes, isLoading, refresh: loadData }
}

export function useAllUserTags(userId?: string) {
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: notes } = await supabase.from('notes').select('id').eq('user_id', userId)
      const noteIds = notes?.map(n => n.id) || []
      if (noteIds.length === 0) { setTags([]); setIsLoading(false); return }
      const { data } = await supabase.from('note_tags').select('name').in('note_id', noteIds)
      const uniqueTags = [...new Set(data?.map(t => t.name) || [])]
      setTags(uniqueTags.sort())
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { tags, isLoading, refresh: loadData }
}
