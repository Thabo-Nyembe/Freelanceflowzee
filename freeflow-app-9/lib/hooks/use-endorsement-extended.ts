'use client'

/**
 * Extended Endorsement Hooks - Covers all Endorsement-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEndorsements(userId?: string, skillId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('endorsements').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('endorsed_user_id', userId)
      if (skillId) query = query.eq('skill_id', skillId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, skillId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEndorsementCount(userId?: string, skillId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('endorsements').select('*', { count: 'exact', head: true }).eq('endorsed_user_id', userId)
      if (skillId) query = query.eq('skill_id', skillId)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, skillId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useHasEndorsed(endorserId?: string, endorsedUserId?: string, skillId?: string) {
  const [hasEndorsed, setHasEndorsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!endorserId || !endorsedUserId || !skillId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('endorsements').select('id').eq('endorser_id', endorserId).eq('endorsed_user_id', endorsedUserId).eq('skill_id', skillId).single()
      setHasEndorsed(!!data)
    } finally { setIsLoading(false) }
  }, [endorserId, endorsedUserId, skillId, supabase])
  useEffect(() => { check() }, [check])
  return { hasEndorsed, isLoading, refresh: check }
}
