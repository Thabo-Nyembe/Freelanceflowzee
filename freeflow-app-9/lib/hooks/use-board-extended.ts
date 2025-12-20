'use client'

/**
 * Extended Board Hooks
 * Tables: boards, board_columns, board_cards, board_members
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBoard(boardId?: string) {
  const [board, setBoard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('boards').select('*, board_columns(*, board_cards(*))').eq('id', boardId).single(); setBoard(data) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { board, isLoading, refresh: fetch }
}

export function useBoards(options?: { user_id?: string; type?: string; is_archived?: boolean; limit?: number }) {
  const [boards, setBoards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('boards').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setBoards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.is_archived, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { boards, isLoading, refresh: fetch }
}

export function useBoardColumns(boardId?: string) {
  const [columns, setColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('board_columns').select('*, board_cards(*)').eq('board_id', boardId).order('position', { ascending: true }); setColumns(data || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { columns, isLoading, refresh: fetch }
}

export function useBoardCards(columnId?: string) {
  const [cards, setCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!columnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('board_cards').select('*').eq('column_id', columnId).order('position', { ascending: true }); setCards(data || []) } finally { setIsLoading(false) }
  }, [columnId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cards, isLoading, refresh: fetch }
}

export function useBoardMembers(boardId?: string) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('board_members').select('*').eq('board_id', boardId).order('joined_at', { ascending: true }); setMembers(data || []) } finally { setIsLoading(false) }
  }, [boardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useBoardRealtime(boardId?: string) {
  const [board, setBoard] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!boardId) return
    supabase.from('boards').select('*, board_columns(*, board_cards(*))').eq('id', boardId).single().then(({ data }) => setBoard(data))
    const channel = supabase.channel(`board_${boardId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_cards', filter: `board_id=eq.${boardId}` }, () => {
        supabase.from('boards').select('*, board_columns(*, board_cards(*))').eq('id', boardId).single().then(({ data }) => setBoard(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_columns', filter: `board_id=eq.${boardId}` }, () => {
        supabase.from('boards').select('*, board_columns(*, board_cards(*))').eq('id', boardId).single().then(({ data }) => setBoard(data))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [boardId, supabase])
  return { board }
}

export function useMyAssignedCards(userId?: string, options?: { limit?: number }) {
  const [cards, setCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('board_cards').select('*, boards(name)').eq('assignee_id', userId).eq('is_completed', false).order('due_date', { ascending: true }).limit(options?.limit || 50); setCards(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cards, isLoading, refresh: fetch }
}
