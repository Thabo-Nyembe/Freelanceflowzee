'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface Backup {
  id: string
  user_id: string
  backup_code: string
  name: string
  description: string | null
  type: 'full' | 'incremental' | 'differential' | 'snapshot' | 'archive'
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
  schedule_cron: string | null
  next_run_at: string | null
  last_run_at: string | null
  storage_location: 'local' | 'aws-s3' | 'google-cloud' | 'azure' | 'dropbox' | 'ftp'
  storage_path: string | null
  storage_bucket: string | null
  size_bytes: number
  files_count: number
  duration_seconds: number
  success_rate: number
  encrypted: boolean
  encryption_algorithm: string
  compressed: boolean
  compression_type: string
  verified: boolean
  verified_at: string | null
  retention_days: number
  expires_at: string | null
  tags: string[]
  metadata: Record<string, any>
  error_message: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BackupLog {
  id: string
  backup_id: string
  action: 'started' | 'completed' | 'failed' | 'restored' | 'verified' | 'deleted'
  status: 'success' | 'failed' | 'warning'
  message: string | null
  size_bytes: number
  files_processed: number
  duration_seconds: number
  error_code: string | null
  error_details: string | null
  created_at: string
}

export interface BackupStats {
  total: number
  scheduled: number
  completed: number
  failed: number
  inProgress: number
  totalSizeBytes: number
  avgSuccessRate: number
  avgDuration: number
}

export function useBackups() {
  const supabase = createClient()
  const { toast } = useToast()
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBackups(data || [])
    } catch (err: unknown) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch backups', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create backup
  const createBackup = async (backup: Partial<Backup>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('backups')
        .insert([{ ...backup, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setBackups(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Backup created successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Update backup
  const updateBackup = async (id: string, updates: Partial<Backup>) => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setBackups(prev => prev.map(b => b.id === id ? data : b))
      toast({ title: 'Success', description: 'Backup updated successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Delete backup (soft delete)
  const deleteBackup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('backups')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setBackups(prev => prev.filter(b => b.id !== id))
      toast({ title: 'Success', description: 'Backup deleted successfully' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Run backup now
  const runBackupNow = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .update({ status: 'in-progress', last_run_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Create backup log entry
      await supabase.from('backup_logs').insert([{
        backup_id: id,
        action: 'started',
        status: 'success',
        message: 'Backup started manually'
      }])

      setBackups(prev => prev.map(b => b.id === id ? data : b))
      toast({ title: 'Success', description: 'Backup started' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Verify backup
  const verifyBackup = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Create backup log entry
      await supabase.from('backup_logs').insert([{
        backup_id: id,
        action: 'verified',
        status: 'success',
        message: 'Backup verified successfully'
      }])

      setBackups(prev => prev.map(b => b.id === id ? data : b))
      toast({ title: 'Success', description: 'Backup verified successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Restore backup
  const restoreBackup = async (id: string) => {
    try {
      // Create backup log entry for restore
      await supabase.from('backup_logs').insert([{
        backup_id: id,
        action: 'restored',
        status: 'success',
        message: 'Backup restore initiated'
      }])

      toast({ title: 'Success', description: 'Backup restore initiated' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Cancel backup
  const cancelBackup = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setBackups(prev => prev.map(b => b.id === id ? data : b))
      toast({ title: 'Success', description: 'Backup cancelled' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Calculate stats
  const getStats = useCallback((): BackupStats => {
    return {
      total: backups.length,
      scheduled: backups.filter(b => b.status === 'scheduled').length,
      completed: backups.filter(b => b.status === 'completed').length,
      failed: backups.filter(b => b.status === 'failed').length,
      inProgress: backups.filter(b => b.status === 'in-progress').length,
      totalSizeBytes: backups.reduce((sum, b) => sum + b.size_bytes, 0),
      avgSuccessRate: backups.length > 0
        ? backups.reduce((sum, b) => sum + b.success_rate, 0) / backups.length
        : 100,
      avgDuration: backups.length > 0
        ? backups.reduce((sum, b) => sum + b.duration_seconds, 0) / backups.length
        : 0
    }
  }, [backups])

  // Real-time subscription
  useEffect(() => {
    fetchBackups()

    const channel = supabase
      .channel('backups-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backups' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBackups(prev => [payload.new as Backup, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setBackups(prev => prev.map(b => b.id === payload.new.id ? payload.new as Backup : b))
        } else if (payload.eventType === 'DELETE') {
          setBackups(prev => prev.filter(b => b.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBackups, supabase])

  return {
    backups,
    loading,
    error,
    fetchBackups,
    createBackup,
    updateBackup,
    deleteBackup,
    runBackupNow,
    verifyBackup,
    restoreBackup,
    cancelBackup,
    getStats
  }
}

// Hook for backup logs
export function useBackupLogs(backupId: string) {
  const supabase = createClient()
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('backup_logs')
          .select('*')
          .eq('backup_id', backupId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setLogs(data || [])
      } catch (err) {
        console.error('Failed to fetch backup logs:', err)
      } finally {
        setLoading(false)
      }
    }

    if (backupId) {
      fetchLogs()

      const channel = supabase
        .channel(`backup-logs-${backupId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'backup_logs',
          filter: `backup_id=eq.${backupId}`
        }, (payload) => {
          setLogs(prev => [payload.new as BackupLog, ...prev])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [backupId, supabase])

  return { logs, loading }
}
