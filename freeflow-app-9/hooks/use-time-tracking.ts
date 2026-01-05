'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface TimeEntry {
  id: string
  userId: string
  userName?: string
  projectId?: string
  projectName?: string
  taskId?: string
  taskName?: string
  clientId?: string
  clientName?: string
  description: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  isBillable: boolean
  hourlyRate?: number
  tags: string[]
  isRunning: boolean
  createdAt: string
  updatedAt: string
}

export interface TimeSheet {
  id: string
  userId: string
  weekStart: string
  weekEnd: string
  entries: string[]
  totalHours: number
  billableHours: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
}

export interface TimeStats {
  totalHours: number
  billableHours: number
  nonBillableHours: number
  billableAmount: number
  todayHours: number
  weekHours: number
  monthHours: number
  averageDaily: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEntries: TimeEntry[] = [
  { id: 'time-1', userId: 'user-1', userName: 'Alex Chen', projectId: 'proj-1', projectName: 'Website Redesign', taskId: 'task-1', taskName: 'Homepage Design', clientId: 'client-1', clientName: 'Acme Corp', description: 'Working on homepage hero section', startTime: '2024-03-20T09:00:00Z', endTime: '2024-03-20T12:30:00Z', duration: 210, isBillable: true, hourlyRate: 125, tags: ['design'], isRunning: false, createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'time-2', userId: 'user-1', userName: 'Alex Chen', projectId: 'proj-1', projectName: 'Website Redesign', description: 'Client meeting and feedback review', startTime: '2024-03-20T14:00:00Z', endTime: '2024-03-20T15:00:00Z', duration: 60, isBillable: true, hourlyRate: 125, tags: ['meeting'], isRunning: false, createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'time-3', userId: 'user-1', userName: 'Alex Chen', projectId: 'proj-2', projectName: 'Mobile App', description: 'Code review and bug fixes', startTime: '2024-03-20T15:30:00Z', duration: 0, isBillable: true, hourlyRate: 150, tags: ['development'], isRunning: true, createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'time-4', userId: 'user-1', userName: 'Alex Chen', description: 'Internal team meeting', startTime: '2024-03-19T10:00:00Z', endTime: '2024-03-19T11:00:00Z', duration: 60, isBillable: false, tags: ['meeting', 'internal'], isRunning: false, createdAt: '2024-03-19', updatedAt: '2024-03-19' },
  { id: 'time-5', userId: 'user-1', userName: 'Alex Chen', projectId: 'proj-1', projectName: 'Website Redesign', description: 'Design system documentation', startTime: '2024-03-19T13:00:00Z', endTime: '2024-03-19T16:00:00Z', duration: 180, isBillable: true, hourlyRate: 125, tags: ['documentation'], isRunning: false, createdAt: '2024-03-19', updatedAt: '2024-03-19' }
]

const mockStats: TimeStats = {
  totalHours: 8.5,
  billableHours: 7.5,
  nonBillableHours: 1,
  billableAmount: 962.50,
  todayHours: 4.5,
  weekHours: 32,
  monthHours: 142,
  averageDaily: 7.1
}

// ============================================================================
// HOOK
// ============================================================================

interface UseTimeTrackingOptions {
  
  projectId?: string
  userId?: string
}

export function useTimeTracking(options: UseTimeTrackingOptions = {}) {
  const {  projectId, userId } = options

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([])
  const [stats, setStats] = useState<TimeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchEntries = useCallback(async (filters?: { dateFrom?: string; dateTo?: string; projectId?: string; isBillable?: boolean }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.projectId || projectId) params.set('projectId', filters?.projectId || projectId || '')
      if (userId) params.set('userId', userId)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)

      const response = await fetch(`/api/time-tracking?${params}`)
      const result = await response.json()
      if (result.success) {
        setEntries(Array.isArray(result.entries) ? result.entries : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        const running = (Array.isArray(result.entries) ? result.entries : []).find((e: TimeEntry) => e.isRunning)
        if (running) setActiveEntry(running)
        return result.entries
      }
      setEntries(mockEntries)
      setStats(null)
      return []
    } catch (err) {
      setEntries(mockEntries)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ projectId, userId])

  const startTimer = useCallback(async (data: { description: string; projectId?: string; taskId?: string; isBillable?: boolean; hourlyRate?: number; tags?: string[] }) => {
    if (activeEntry) {
      await stopTimer()
    }

    try {
      const response = await fetch('/api/time-tracking/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setActiveEntry(result.entry)
        setEntries(prev => [result.entry, ...prev])
        return { success: true, entry: result.entry }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        userId: userId || 'user-1',
        description: data.description,
        projectId: data.projectId,
        taskId: data.taskId,
        isBillable: data.isBillable ?? true,
        hourlyRate: data.hourlyRate,
        tags: data.tags || [],
        startTime: new Date().toISOString(),
        duration: 0,
        isRunning: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setActiveEntry(newEntry)
      setEntries(prev => [newEntry, ...prev])
      setElapsedTime(0)
      return { success: true, entry: newEntry }
    }
  }, [activeEntry, userId])

  const stopTimer = useCallback(async () => {
    if (!activeEntry) return { success: false, error: 'No active timer' }

    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(activeEntry.startTime).getTime()) / 60000)

    try {
      const response = await fetch(`/api/time-tracking/${activeEntry.id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime })
      })
      const result = await response.json()
      if (result.success) {
        setEntries(prev => prev.map(e => e.id === activeEntry.id ? { ...e, endTime, duration, isRunning: false } : e))
        setActiveEntry(null)
        setElapsedTime(0)
      }
      return result
    } catch (err) {
      setEntries(prev => prev.map(e => e.id === activeEntry.id ? { ...e, endTime, duration, isRunning: false } : e))
      setActiveEntry(null)
      setElapsedTime(0)
      return { success: true }
    }
  }, [activeEntry])

  const createManualEntry = useCallback(async (data: Omit<TimeEntry, 'id' | 'isRunning' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchEntries()
        return { success: true, entry: result.entry }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newEntry: TimeEntry = { ...data, id: `time-${Date.now()}`, isRunning: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setEntries(prev => [newEntry, ...prev])
      return { success: true, entry: newEntry }
    }
  }, [fetchEntries])

  const updateEntry = useCallback(async (entryId: string, updates: Partial<TimeEntry>) => {
    try {
      const response = await fetch(`/api/time-tracking/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      }
      return result
    } catch (err) {
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ...updates } : e))
      return { success: true }
    }
  }, [])

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      await fetch(`/api/time-tracking/${entryId}`, { method: 'DELETE' })
      setEntries(prev => prev.filter(e => e.id !== entryId))
      if (activeEntry?.id === entryId) {
        setActiveEntry(null)
        setElapsedTime(0)
      }
      return { success: true }
    } catch (err) {
      setEntries(prev => prev.filter(e => e.id !== entryId))
      return { success: true }
    }
  }, [activeEntry])

  const duplicateEntry = useCallback(async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId)
    if (entry) {
      return createManualEntry({ ...entry, startTime: new Date().toISOString(), endTime: undefined, duration: entry.duration })
    }
    return { success: false, error: 'Entry not found' }
  }, [entries, createManualEntry])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchEntries()
  }, [fetchEntries])

  // Timer effect
  useEffect(() => {
    if (activeEntry) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - new Date(activeEntry.startTime).getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeEntry])

  useEffect(() => { refresh() }, [refresh])

  const todayEntries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return entries.filter(e => e.startTime.startsWith(today))
  }, [entries])
  const billableEntries = useMemo(() => entries.filter(e => e.isBillable), [entries])
  const entriesByProject = useMemo(() => {
    const grouped: Record<string, TimeEntry[]> = {}
    entries.forEach(e => {
      const key = e.projectId || 'no-project'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(e)
    })
    return grouped
  }, [entries])
  const totalHours = useMemo(() => entries.reduce((sum, e) => sum + e.duration, 0) / 60, [entries])
  const billableAmount = useMemo(() => billableEntries.reduce((sum, e) => sum + (e.duration / 60) * (e.hourlyRate || 0), 0), [billableEntries])

  const formatElapsedTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  return {
    entries, activeEntry, timeSheets, stats, todayEntries, billableEntries, entriesByProject, totalHours, billableAmount, elapsedTime,
    isLoading, error,
    refresh, fetchEntries, startTimer, stopTimer, createManualEntry, updateEntry, deleteEntry, duplicateEntry, formatElapsedTime
  }
}

export default useTimeTracking
