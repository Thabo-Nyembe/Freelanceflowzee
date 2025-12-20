'use client'

/**
 * Extended Mass Hooks - Covers all Mass action/notification tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMassAction(actionId?: string) {
  const [action, setAction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!actionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('mass_actions').select('*').eq('id', actionId).single()
      setAction(data)
    } finally { setIsLoading(false) }
  }, [actionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { action, isLoading, refresh: fetch }
}

export function useMassActions(options?: { actionType?: string; targetType?: string; status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('mass_actions').select('*')
      if (options?.actionType) query = query.eq('action_type', options.actionType)
      if (options?.targetType) query = query.eq('target_type', options.targetType)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.actionType, options?.targetType, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMassNotifications(options?: { notificationType?: string; status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('mass_notifications').select('*')
      if (options?.notificationType) query = query.eq('notification_type', options.notificationType)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.notificationType, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useScheduledMassActions() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('mass_actions').select('*').eq('status', 'scheduled').not('scheduled_at', 'is', null).order('scheduled_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
