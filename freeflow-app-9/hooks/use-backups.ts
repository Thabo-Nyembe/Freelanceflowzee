'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type BackupType = 'full' | 'incremental' | 'differential' | 'snapshot'

export interface Backup {
  id: string
  name: string
  type: BackupType
  status: BackupStatus
  size: number // bytes
  compressedSize?: number
  source: string
  destination: string
  retentionDays: number
  encrypted: boolean
  encryptionAlgorithm?: string
  checksum?: string
  startedAt?: string
  completedAt?: string
  duration?: number // seconds
  error?: string
  includedItems: string[]
  excludedItems: string[]
  metadata: Record<string, any>
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface BackupSchedule {
  id: string
  name: string
  type: BackupType
  source: string
  destination: string
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  cronExpression?: string
  timezone: string
  retentionDays: number
  retentionCount?: number
  encrypted: boolean
  isEnabled: boolean
  lastRunAt?: string
  nextRunAt?: string
  lastStatus?: BackupStatus
  includedItems: string[]
  excludedItems: string[]
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  createdAt: string
  updatedAt: string
}

export interface RestorePoint {
  id: string
  backupId: string
  backupName: string
  timestamp: string
  size: number
  type: BackupType
  isVerified: boolean
  canRestore: boolean
  expiresAt?: string
}

export interface RestoreJob {
  id: string
  backupId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  targetLocation: string
  overwriteExisting: boolean
  startedAt?: string
  completedAt?: string
  itemsRestored: number
  totalItems: number
  error?: string
  createdBy: string
  createdAt: string
}

export interface BackupStats {
  totalBackups: number
  completedBackups: number
  failedBackups: number
  totalStorageUsed: number
  avgBackupSize: number
  avgBackupDuration: number
  successRate: number
  lastBackupAt?: string
  nextScheduledAt?: string
  storageByType: { type: BackupType; size: number }[]
  backupTrend: { date: string; count: number; size: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBackups: Backup[] = [
  { id: 'bkp-1', name: 'Daily Full Backup - 2024-03-20', type: 'full', status: 'completed', size: 5200000000, compressedSize: 1800000000, source: 'database', destination: 's3://backups/daily/', retentionDays: 30, encrypted: true, encryptionAlgorithm: 'AES-256', checksum: 'sha256:abc123...', startedAt: '2024-03-20T02:00:00Z', completedAt: '2024-03-20T02:45:00Z', duration: 2700, includedItems: ['users', 'projects', 'files', 'settings'], excludedItems: ['logs', 'temp'], metadata: { version: '2.1.1' }, createdBy: 'system', createdByName: 'Automated', createdAt: '2024-03-20T02:00:00Z' },
  { id: 'bkp-2', name: 'Hourly Incremental - 2024-03-20 10:00', type: 'incremental', status: 'completed', size: 150000000, compressedSize: 52000000, source: 'database', destination: 's3://backups/hourly/', retentionDays: 7, encrypted: true, encryptionAlgorithm: 'AES-256', startedAt: '2024-03-20T10:00:00Z', completedAt: '2024-03-20T10:05:00Z', duration: 300, includedItems: ['users', 'projects'], excludedItems: [], metadata: { baseBackupId: 'bkp-1' }, createdBy: 'system', createdByName: 'Automated', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'bkp-3', name: 'Manual Backup - Pre-migration', type: 'full', status: 'in_progress', size: 0, source: 'all', destination: 's3://backups/manual/', retentionDays: 90, encrypted: true, encryptionAlgorithm: 'AES-256', startedAt: '2024-03-20T11:00:00Z', includedItems: ['*'], excludedItems: ['cache'], metadata: { reason: 'Pre-migration safety backup' }, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-20T11:00:00Z' }
]

const mockSchedules: BackupSchedule[] = [
  { id: 'sched-1', name: 'Daily Full Backup', type: 'full', source: 'database', destination: 's3://backups/daily/', frequency: 'daily', cronExpression: '0 2 * * *', timezone: 'UTC', retentionDays: 30, retentionCount: 30, encrypted: true, isEnabled: true, lastRunAt: '2024-03-20T02:00:00Z', nextRunAt: '2024-03-21T02:00:00Z', lastStatus: 'completed', includedItems: ['users', 'projects', 'files', 'settings'], excludedItems: ['logs', 'temp'], notifyOnSuccess: false, notifyOnFailure: true, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'sched-2', name: 'Hourly Incremental', type: 'incremental', source: 'database', destination: 's3://backups/hourly/', frequency: 'hourly', cronExpression: '0 * * * *', timezone: 'UTC', retentionDays: 7, encrypted: true, isEnabled: true, lastRunAt: '2024-03-20T10:00:00Z', nextRunAt: '2024-03-20T11:00:00Z', lastStatus: 'completed', includedItems: ['users', 'projects'], excludedItems: [], notifyOnSuccess: false, notifyOnFailure: true, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'sched-3', name: 'Weekly Full Backup', type: 'full', source: 'all', destination: 's3://backups/weekly/', frequency: 'weekly', cronExpression: '0 3 * * 0', timezone: 'UTC', retentionDays: 90, encrypted: true, isEnabled: true, lastRunAt: '2024-03-17T03:00:00Z', nextRunAt: '2024-03-24T03:00:00Z', lastStatus: 'completed', includedItems: ['*'], excludedItems: ['cache'], notifyOnSuccess: true, notifyOnFailure: true, createdAt: '2024-01-01', updatedAt: '2024-03-17' }
]

const mockRestorePoints: RestorePoint[] = mockBackups.filter(b => b.status === 'completed').map(b => ({ id: `rp-${b.id}`, backupId: b.id, backupName: b.name, timestamp: b.completedAt!, size: b.size, type: b.type, isVerified: true, canRestore: true, expiresAt: new Date(new Date(b.completedAt!).getTime() + b.retentionDays * 86400000).toISOString() }))

const mockStats: BackupStats = {
  totalBackups: 245,
  completedBackups: 238,
  failedBackups: 7,
  totalStorageUsed: 125000000000,
  avgBackupSize: 510000000,
  avgBackupDuration: 1800,
  successRate: 97.1,
  lastBackupAt: '2024-03-20T10:05:00Z',
  nextScheduledAt: '2024-03-20T11:00:00Z',
  storageByType: [{ type: 'full', size: 95000000000 }, { type: 'incremental', size: 25000000000 }, { type: 'differential', size: 5000000000 }],
  backupTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], count: 24 + Math.floor(Math.random() * 5), size: 4500000000 + Math.random() * 1000000000 }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBackupsOptions {
  
}

export function useBackups(options: UseBackupsOptions = {}) {
  const {  } = options

  const [backups, setBackups] = useState<Backup[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([])
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([])
  const [currentBackup, setCurrentBackup] = useState<Backup | null>(null)
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBackups = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/backups')
      const result = await response.json()
      if (result.success) {
        setBackups(Array.isArray(result.backups) ? result.backups : [])
        setSchedules(Array.isArray(result.schedules) ? result.schedules : [])
        setRestorePoints(Array.isArray(result.restorePoints) ? result.restorePoints : [])
        setStats(result.stats || null)
        return result.backups
      }
      setBackups([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch backups'))
      setBackups([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelBackup = useCallback(async (backupId: string) => {
    setBackups(prev => prev.map(b => b.id === backupId && b.status === 'in_progress' ? {
      ...b,
      status: 'cancelled' as const,
      completedAt: new Date().toISOString()
    } : b))
    return { success: true }
  }, [])

  const deleteBackup = useCallback(async (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId))
    setRestorePoints(prev => prev.filter(rp => rp.backupId !== backupId))
    return { success: true }
  }, [])

  const verifyBackup = useCallback(async (backupId: string) => {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRestorePoints(prev => prev.map(rp => rp.backupId === backupId ? { ...rp, isVerified: true } : rp))
    return { success: true, valid: true }
  }, [])

  const createSchedule = useCallback(async (data: Partial<BackupSchedule>) => {
    const schedule: BackupSchedule = {
      id: `sched-${Date.now()}`,
      name: data.name || 'New Schedule',
      type: data.type || 'full',
      source: data.source || 'database',
      destination: data.destination || 's3://backups/',
      frequency: data.frequency || 'daily',
      cronExpression: data.cronExpression,
      timezone: data.timezone || 'UTC',
      retentionDays: data.retentionDays || 30,
      encrypted: data.encrypted ?? true,
      isEnabled: true,
      includedItems: data.includedItems || ['*'],
      excludedItems: data.excludedItems || [],
      notifyOnSuccess: data.notifyOnSuccess ?? false,
      notifyOnFailure: data.notifyOnFailure ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as BackupSchedule
    setSchedules(prev => [...prev, schedule])
    return { success: true, schedule }
  }, [])

  const updateSchedule = useCallback(async (scheduleId: string, updates: Partial<BackupSchedule>) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? {
      ...s,
      ...updates,
      updatedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    return { success: true }
  }, [])

  const toggleSchedule = useCallback(async (scheduleId: string) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? {
      ...s,
      isEnabled: !s.isEnabled,
      updatedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const runScheduleNow = useCallback(async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return { success: false, error: 'Schedule not found' }

    return createBackup({
      name: `${schedule.name} - Manual Run`,
      type: schedule.type,
      source: schedule.source,
      destination: schedule.destination,
      retentionDays: schedule.retentionDays,
      encrypted: schedule.encrypted,
      includedItems: schedule.includedItems,
      excludedItems: schedule.excludedItems
    })
  }, [schedules, createBackup])

  const restoreBackup = useCallback(async (backupId: string, targetLocation: string, overwriteExisting = false) => {
    setIsRestoring(true)
    try {
      const restoreJob: RestoreJob = {
        id: `restore-${Date.now()}`,
        backupId,
        status: 'pending',
        targetLocation,
        overwriteExisting,
        itemsRestored: 0,
        totalItems: 0,
        createdBy: 'user-1',
        createdAt: new Date().toISOString()
      }
      setRestoreJobs(prev => [restoreJob, ...prev])

      // Simulate restore starting
      setTimeout(() => {
        setRestoreJobs(prev => prev.map(j => j.id === restoreJob.id ? {
          ...j,
          status: 'in_progress' as const,
          startedAt: new Date().toISOString(),
          totalItems: 1000
        } : j))
      }, 1000)

      return { success: true, job: restoreJob }
    } finally {
      setIsRestoring(false)
    }
  }, [])

  const cancelRestore = useCallback(async (jobId: string) => {
    setRestoreJobs(prev => prev.map(j => j.id === jobId && j.status === 'in_progress' ? {
      ...j,
      status: 'failed' as const,
      error: 'Cancelled by user',
      completedAt: new Date().toISOString()
    } : j))
    return { success: true }
  }, [])

  const formatSize = useCallback((bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBackups()
  }, [fetchBackups])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const completedBackups = useMemo(() => backups.filter(b => b.status === 'completed'), [backups])
  const failedBackups = useMemo(() => backups.filter(b => b.status === 'failed'), [backups])
  const inProgressBackups = useMemo(() => backups.filter(b => b.status === 'in_progress'), [backups])
  const activeSchedules = useMemo(() => schedules.filter(s => s.isEnabled), [schedules])
  const availableRestorePoints = useMemo(() => restorePoints.filter(rp => rp.canRestore && (!rp.expiresAt || new Date(rp.expiresAt) > new Date())), [restorePoints])

  return {
    backups, schedules, restorePoints, restoreJobs, currentBackup, stats,
    completedBackups, failedBackups, inProgressBackups, activeSchedules, availableRestorePoints,
    isLoading, isBackingUp, isRestoring, error,
    refresh, createBackup, cancelBackup, deleteBackup, verifyBackup,
    createSchedule, updateSchedule, deleteSchedule, toggleSchedule, runScheduleNow,
    restoreBackup, cancelRestore, formatSize, setCurrentBackup
  }
}

export default useBackups
