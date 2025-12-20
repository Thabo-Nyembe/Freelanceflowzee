'use client'

/**
 * Extended Reminders Hooks
 * Tables: reminders, reminder_recipients, reminder_schedules, reminder_templates, reminder_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReminder(reminderId?: string) {
  const [reminder, setReminder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reminderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reminders').select('*, reminder_recipients(*), reminder_schedules(*), users(*)').eq('id', reminderId).single(); setReminder(data) } finally { setIsLoading(false) }
  }, [reminderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminder, isLoading, refresh: fetch }
}

export function useReminders(options?: { user_id?: string; entity_type?: string; entity_id?: string; status?: string; priority?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('reminders').select('*, reminder_recipients(count)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.from_date) query = query.gte('remind_at', options.from_date)
      if (options?.to_date) query = query.lte('remind_at', options.to_date)
      const { data } = await query.order('remind_at', { ascending: true }).limit(options?.limit || 50)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.entity_type, options?.entity_id, options?.status, options?.priority, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useUpcomingReminders(userId?: string, options?: { hours?: number; limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.hours || 24) * 60 * 60 * 1000)
      const { data } = await supabase.from('reminders').select('*, reminder_recipients(*)').eq('user_id', userId).eq('status', 'pending').gte('remind_at', now.toISOString()).lte('remind_at', futureDate.toISOString()).order('remind_at', { ascending: true }).limit(options?.limit || 20)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.hours, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useOverdueReminders(userId?: string, options?: { limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const { data } = await supabase.from('reminders').select('*, reminder_recipients(*)').eq('user_id', userId).eq('status', 'pending').lt('remind_at', now.toISOString()).order('remind_at', { ascending: false }).limit(options?.limit || 20)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useTodayReminders(userId?: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).gte('remind_at', startOfDay).lt('remind_at', endOfDay).in('status', ['pending', 'snoozed']).order('remind_at', { ascending: true })
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useReminderRecipients(reminderId?: string) {
  const [recipients, setRecipients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reminderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reminder_recipients').select('*, users(*)').eq('reminder_id', reminderId); setRecipients(data || []) } finally { setIsLoading(false) }
  }, [reminderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { recipients, isLoading, refresh: fetch }
}

export function useReminderTemplates(options?: { category?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('reminder_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useReminderHistory(reminderId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reminderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reminder_history').select('*, users(*)').eq('reminder_id', reminderId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [reminderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useMyPendingReminders(userId?: string, options?: { limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'pending').order('remind_at', { ascending: true }).limit(options?.limit || 50)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useSnoozedReminders(userId?: string, options?: { limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'snoozed').order('snoozed_until', { ascending: true }).limit(options?.limit || 20)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useHighPriorityReminders(userId?: string, options?: { limit?: number }) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('priority', 'high').eq('status', 'pending').order('remind_at', { ascending: true }).limit(options?.limit || 20)
      setReminders(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}
