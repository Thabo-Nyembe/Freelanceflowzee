'use client'

/**
 * Extended Backups Hooks
 * Tables: backups, backup_schedules, backup_restores
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBackup(backupId?: string) {
  const [backup, setBackup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!backupId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('backups').select('*').eq('id', backupId).single(); setBackup(data) } finally { setIsLoading(false) }
  }, [backupId])
  useEffect(() => { loadData() }, [loadData])
  return { backup, isLoading, refresh: loadData }
}

export function useBackups(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [backups, setBackups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('backups').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBackups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { backups, isLoading, refresh: loadData }
}

export function useBackupSchedules(userId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('backup_schedules').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useLatestBackup(userId?: string, source?: string) {
  const [backup, setBackup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('backups').select('*').eq('user_id', userId).eq('status', 'completed')
      if (source) query = query.eq('source', source)
      const { data } = await query.order('completed_at', { ascending: false }).limit(1).single()
      setBackup(data)
    } finally { setIsLoading(false) }
  }, [userId, source])
  useEffect(() => { loadData() }, [loadData])
  return { backup, isLoading, refresh: loadData }
}

export function useBackupStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; totalSize: number; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('backups').select('status, size').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const totalSize = data.reduce((sum, b) => sum + (b.size || 0), 0)
      const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, totalSize, byStatus })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
