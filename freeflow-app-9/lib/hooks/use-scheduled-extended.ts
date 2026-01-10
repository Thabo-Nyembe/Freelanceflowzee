'use client'

/**
 * Extended Scheduled Hooks
 * Tables: scheduled_tasks, scheduled_jobs, scheduled_reports, scheduled_notifications
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useScheduledTask(taskId?: string) {
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('scheduled_tasks').select('*').eq('id', taskId).single(); setTask(data) } finally { setIsLoading(false) }
  }, [taskId])
  useEffect(() => { fetch() }, [fetch])
  return { task, isLoading, refresh: fetch }
}

export function useScheduledTasks(options?: { is_active?: boolean; handler?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduled_tasks').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.handler) query = query.eq('handler', options.handler)
      const { data } = await query.order('next_run_at', { ascending: true }).limit(options?.limit || 50)
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.handler, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useScheduledJobs(options?: { task_id?: string; status?: string; limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduled_jobs').select('*')
      if (options?.task_id) query = query.eq('task_id', options.task_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('scheduled_at', { ascending: false }).limit(options?.limit || 50)
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.task_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}

export function useScheduledReports(options?: { user_id?: string; report_type?: string; is_active?: boolean }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduled_reports').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.report_type) query = query.eq('report_type', options.report_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run_at', { ascending: true })
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.report_type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useScheduledNotifications(options?: { user_id?: string; is_sent?: boolean; limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scheduled_notifications').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_sent !== undefined) query = query.eq('is_sent', options.is_sent)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50)
      setNotifications(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_sent, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { notifications, isLoading, refresh: fetch }
}

export function usePendingScheduledNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('scheduled_notifications').select('*').eq('user_id', userId).eq('is_sent', false).lte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }); setNotifications(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { notifications, isLoading, refresh: fetch }
}
