'use client'

/**
 * Extended Push Notifications Hooks
 * Tables: push_notifications, push_subscriptions, push_campaigns, push_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePushNotification(notificationId?: string) {
  const [notification, setNotification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!notificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('push_notifications').select('*').eq('id', notificationId).single(); setNotification(data) } finally { setIsLoading(false) }
  }, [notificationId])
  useEffect(() => { loadData() }, [loadData])
  return { notification, isLoading, refresh: loadData }
}

export function usePushNotifications(options?: { user_id?: string; status?: string; limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('push_notifications').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNotifications(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { notifications, isLoading, refresh: loadData }
}

export function usePushSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId).eq('is_active', true); setSubscriptions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { subscriptions, isLoading, refresh: loadData }
}

export function usePushCampaigns(options?: { status?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('push_campaigns').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { campaigns, isLoading, refresh: loadData }
}

export function useUnreadNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('push_notifications').select('*').eq('user_id', userId).is('read_at', null).order('created_at', { ascending: false }); setNotifications(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { notifications, isLoading, refresh: loadData }
}
