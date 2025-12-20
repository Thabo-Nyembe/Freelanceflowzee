'use client'

/**
 * Extended Canvas Hooks - Covers all 16 Canvas-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCanvasActivityLog(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_activity_log').select('*').eq('board_id', boardId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasArtboards(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_artboards').select('*').eq('project_id', projectId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasBoards(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_boards').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasCollaborators(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_collaborators').select('*').eq('board_id', boardId); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasCommentReplies(commentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_comment_replies').select('*').eq('comment_id', commentId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [commentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasComments(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_comments').select('*').eq('board_id', boardId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasConnectors(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_connectors').select('*').eq('board_id', boardId); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasElements(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_elements').select('*').eq('board_id', boardId).order('z_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasExports(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_exports').select('*').eq('board_id', boardId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasLayers(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_layers').select('*').eq('board_id', boardId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasPages(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_pages').select('*').eq('project_id', projectId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasProjects(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasSessions(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_sessions').select('*').eq('board_id', boardId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasStats(boardId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_stats').select('*').eq('board_id', boardId).single(); setData(result) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasTemplates() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_templates').select('*').eq('is_public', true).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCanvasVersions(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('canvas_versions').select('*').eq('board_id', boardId).order('version_number', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
