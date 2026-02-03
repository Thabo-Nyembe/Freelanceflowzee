'use client'

/**
 * Extended Queue Job Hooks - Covers all Queue/Job processing tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQueueJob(jobId?: string) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('queue_jobs').select('*').eq('id', jobId).single()
      setJob(data)
    } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { loadData() }, [loadData])
  return { job, isLoading, refresh: loadData }
}

export function useQueueJobs(options?: { queueName?: string; jobType?: string; status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queue_jobs').select('*')
      if (options?.queueName) query = query.eq('queue_name', options.queueName)
      if (options?.jobType) query = query.eq('job_type', options.jobType)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.queueName, options?.jobType, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useQueueStats(queueName?: string) {
  const [stats, setStats] = useState<{ pending: number; processing: number; completed: number; failed: number; total: number }>({ pending: 0, processing: 0, completed: 0, failed: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queue_jobs').select('status')
      if (queueName) query = query.eq('queue_name', queueName)
      const { data } = await query
      const newStats = { pending: 0, processing: 0, completed: 0, failed: 0, total: data?.length || 0 }
      data?.forEach(job => { if (job.status in newStats) newStats[job.status as keyof typeof newStats]++ })
      setStats(newStats)
    } finally { setIsLoading(false) }
  }, [queueName])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useRealtimeQueueStats(queueName?: string) {
  const [stats, setStats] = useState<{ pending: number; processing: number; completed: number; failed: number; total: number }>({ pending: 0, processing: 0, completed: 0, failed: 0, total: 0 })
  const loadData = useCallback(async () => {
  const supabase = createClient()
    let query = supabase.from('queue_jobs').select('status')
    if (queueName) query = query.eq('queue_name', queueName)
    const { data } = await query
    const newStats = { pending: 0, processing: 0, completed: 0, failed: 0, total: data?.length || 0 }
    data?.forEach(job => { if (job.status in newStats) newStats[job.status as keyof typeof newStats]++ })
    setStats(newStats)
  }, [queueName])
  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const channel = supabase.channel('queue-stats').on('postgres_changes', { event: '*', schema: 'public', table: 'queue_jobs' }, () => fetch()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch])
  return { stats, refresh: loadData }
}

export function usePendingJobs(queueName?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queue_jobs').select('*').eq('status', 'pending')
      if (queueName) query = query.eq('queue_name', queueName)
      const { data: result } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [queueName])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
