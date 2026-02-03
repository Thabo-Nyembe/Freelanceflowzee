'use client'

/**
 * Extended Deadline Hooks - Covers all Deadline-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDeadline(deadlineId?: string) {
  const [deadline, setDeadline] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!deadlineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('deadlines').select('*').eq('id', deadlineId).single()
      setDeadline(data)
    } finally { setIsLoading(false) }
  }, [deadlineId])
  useEffect(() => { loadData() }, [loadData])
  return { deadline, isLoading, refresh: loadData }
}

export function useUserDeadlines(userId?: string, options?: { includeCompleted?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('deadlines').select('*').eq('user_id', userId)
      if (!options?.includeCompleted) query = query.neq('status', 'completed')
      const { data: result } = await query.order('due_date', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.includeCompleted])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useUpcomingDeadlines(userId?: string, days = 7) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date()
      const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      let query = supabase.from('deadlines').select('*').neq('status', 'completed').gte('due_date', now.toISOString()).lte('due_date', endDate.toISOString())
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query.order('due_date', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, days])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useOverdueDeadlines(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('deadlines').select('*').neq('status', 'completed').lt('due_date', new Date().toISOString())
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query.order('due_date', { ascending: true })
      setData(result || [])
      setCount(result?.length || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, count, isLoading, refresh: loadData }
}

export function useEntityDeadlines(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('deadlines').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('due_date', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
