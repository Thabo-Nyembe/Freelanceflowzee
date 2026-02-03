'use client'

/**
 * Extended Score Hooks - Covers all Score-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useScore(entityId?: string, entityType?: string, scoreType?: string) {
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !scoreType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('scores').select('score').eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType).single()
      setScore(data?.score || 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, scoreType])
  useEffect(() => { loadData() }, [loadData])
  return { score, isLoading, refresh: loadData }
}

export function useScores(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('scores').select('*').eq('entity_id', entityId).eq('entity_type', entityType)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeaderboard(scoreType?: string, entityType?: string, limit = 10) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!scoreType || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('scores').select('entity_id, score').eq('score_type', scoreType).eq('entity_type', entityType).order('score', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [scoreType, entityType, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useRank(entityId?: string, entityType?: string, scoreType?: string) {
  const [rank, setRank] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !scoreType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: entityScore } = await supabase.from('scores').select('score').eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType).single()
      if (!entityScore) { setRank(null); setIsLoading(false); return }
      const { count } = await supabase.from('scores').select('*', { count: 'exact', head: true }).eq('entity_type', entityType).eq('score_type', scoreType).gt('score', entityScore.score)
      setRank((count || 0) + 1)
      setScore(entityScore.score)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, scoreType])
  useEffect(() => { loadData() }, [loadData])
  return { rank, score, isLoading, refresh: loadData }
}
