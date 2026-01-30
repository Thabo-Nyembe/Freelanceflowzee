'use client'

/**
 * Extended Notification Hooks - Covers all 12 Notification-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useNotificationBulkActions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_bulk_actions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationDeliveries(notificationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!notificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_deliveries').select('*').eq('notification_id', notificationId); setData(result || []) } finally { setIsLoading(false) }
  }, [notificationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationDeliveryLogs(deliveryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!deliveryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_delivery_logs').select('*').eq('delivery_id', deliveryId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [deliveryId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationGroups(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_groups').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationPreferences(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationQueue(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_queue').select('*').eq('user_id', userId).eq('status', 'pending').order('scheduled_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationReactions(notificationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!notificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_reactions').select('*').eq('notification_id', notificationId); setData(result || []) } finally { setIsLoading(false) }
  }, [notificationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationSchedules(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_schedules').select('*').eq('user_id', userId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationSettings(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationStats(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_stats').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationTemplates() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_templates').select('*').order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationUnsubscribes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('notification_unsubscribes').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
