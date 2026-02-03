'use client'

/**
 * Extended UPF (Universal Pinpoint Feedback) Hooks - Covers all 9 UPF-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUPFAnalytics(projectId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_analytics').select('*').eq('project_id', projectId).single(); setData(result) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFAttachments(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_attachments').select('*').eq('comment_id', commentId); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFCommentAssignments(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_comment_assignments').select('*').eq('comment_id', commentId); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFCommentAttachments(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_comment_attachments').select('*').eq('comment_id', commentId); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFCommentReactions(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_comment_reactions').select('*').eq('comment_id', commentId); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFComments(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_comments').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFMediaFiles(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_media_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFReactions(mediaId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!mediaId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_reactions').select('*').eq('media_id', mediaId); setData(result || []) } finally { setIsLoading(false) }
  }, [mediaId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUPFVoiceNotes(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('upf_voice_notes').select('*').eq('comment_id', commentId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
