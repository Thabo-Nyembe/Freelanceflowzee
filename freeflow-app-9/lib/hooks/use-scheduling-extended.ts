'use client'

/**
 * Extended Scheduling Hooks
 * Tables: scheduling_slots, scheduling_rules, scheduling_blocks, scheduling_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSchedulingSlot(slotId?: string) {
  const [slot, setSlot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slotId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('scheduling_slots').select('*').eq('id', slotId).single(); setSlot(data) } finally { setIsLoading(false) }
  }, [slotId])
  useEffect(() => { fetch() }, [fetch])
  return { slot, isLoading, refresh: fetch }
}

export function useSchedulingSlots(options?: { user_id?: string; is_available?: boolean; date?: string; limit?: number }) {
  const [slots, setSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduling_slots').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      if (options?.date) query = query.gte('start_time', options.date).lt('start_time', new Date(new Date(options.date).getTime() + 86400000).toISOString())
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100)
      setSlots(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_available, options?.date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useSchedulingRules(options?: { user_id?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduling_rules').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('priority', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useSchedulingBlocks(options?: { user_id?: string; block_type?: string }) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduling_blocks').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.block_type) query = query.eq('block_type', options.block_type)
      const { data } = await query.order('start_time', { ascending: true })
      setBlocks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.block_type])
  useEffect(() => { fetch() }, [fetch])
  return { blocks, isLoading, refresh: fetch }
}

export function useSchedulingPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('scheduling_preferences').select('*').eq('user_id', userId).single(); setPreferences(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}
