'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf' | 'xml'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type DataCategory = 'projects' | 'invoices' | 'clients' | 'tasks' | 'time_entries' | 'expenses' | 'contacts' | 'all'

export interface ExportJob {
  id: string
  name: string
  categories: DataCategory[]
  format: ExportFormat
  status: ExportStatus
  progress: number
  fileSize?: number
  downloadUrl?: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
  error?: string
}

export interface ImportJob {
  id: string
  name: string
  category: DataCategory
  status: ExportStatus
  progress: number
  recordsTotal: number
  recordsProcessed: number
  recordsSkipped: number
  errors: string[]
  createdAt: string
  completedAt?: string
}

export interface DataSummary {
  category: DataCategory
  recordCount: number
  lastUpdated: string
  estimatedSize: number
}

export interface ExportOptions {
  dateRange?: { start: string; end: string }
  includeArchived?: boolean
  includeAttachments?: boolean
  compression?: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockExportJobs: ExportJob[] = [
  { id: 'exp-1', name: 'Full Data Backup', categories: ['all'], format: 'json', status: 'completed', progress: 100, fileSize: 15000000, downloadUrl: '/exports/backup-20240315.json', createdAt: '2024-03-15T10:00:00Z', completedAt: '2024-03-15T10:05:00Z', expiresAt: '2024-03-22T10:05:00Z' },
  { id: 'exp-2', name: 'Invoices Export', categories: ['invoices'], format: 'csv', status: 'completed', progress: 100, fileSize: 500000, downloadUrl: '/exports/invoices-20240320.csv', createdAt: '2024-03-20T14:00:00Z', completedAt: '2024-03-20T14:01:00Z', expiresAt: '2024-03-27T14:01:00Z' },
  { id: 'exp-3', name: 'Projects Report', categories: ['projects', 'tasks'], format: 'excel', status: 'processing', progress: 45, createdAt: new Date().toISOString() }
]

const mockImportJobs: ImportJob[] = [
  { id: 'imp-1', name: 'Client Import', category: 'clients', status: 'completed', progress: 100, recordsTotal: 150, recordsProcessed: 148, recordsSkipped: 2, errors: ['Row 45: Invalid email format', 'Row 89: Duplicate entry'], createdAt: '2024-03-10T09:00:00Z', completedAt: '2024-03-10T09:02:00Z' }
]

const mockDataSummary: DataSummary[] = [
  { category: 'projects', recordCount: 156, lastUpdated: '2024-03-20T15:30:00Z', estimatedSize: 2500000 },
  { category: 'invoices', recordCount: 423, lastUpdated: '2024-03-20T16:00:00Z', estimatedSize: 1800000 },
  { category: 'clients', recordCount: 89, lastUpdated: '2024-03-19T10:00:00Z', estimatedSize: 450000 },
  { category: 'tasks', recordCount: 1250, lastUpdated: '2024-03-20T16:30:00Z', estimatedSize: 3200000 },
  { category: 'time_entries', recordCount: 4500, lastUpdated: '2024-03-20T17:00:00Z', estimatedSize: 5100000 },
  { category: 'expenses', recordCount: 312, lastUpdated: '2024-03-18T12:00:00Z', estimatedSize: 890000 }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseDataExportOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDataExport(options: UseDataExportOptions = {}) {
  const {  autoRefresh = false, refreshInterval = 10000 } = options

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [dataSummary, setDataSummary] = useState<DataSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/data-export/jobs')
      const result = await response.json()
      if (result.success) {
        setExportJobs(Array.isArray(result.exportJobs) ? result.exportJobs : [])
        setImportJobs(Array.isArray(result.importJobs) ? result.importJobs : [])
        setDataSummary(Array.isArray(result.dataSummary) ? result.dataSummary : [])
        return result
      }
      setExportJobs([])
      return { exportJobs: [], importJobs: [] }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'))
      setExportJobs([])
      return { exportJobs: [], importJobs: [] }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startImport = useCallback(async (file: File, category: DataCategory, options?: { skipDuplicates?: boolean; validateOnly?: boolean }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      if (options) formData.append('options', JSON.stringify(options))

      const response = await fetch('/api/data-export/import', { method: 'POST', body: formData })
      const result = await response.json()
      if (result.success) {
        await fetchJobs()
        return { success: true, jobId: result.jobId }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newJob: ImportJob = { id: `imp-${Date.now()}`, name: file.name, category, status: 'processing', progress: 0, recordsTotal: 0, recordsProcessed: 0, recordsSkipped: 0, errors: [], createdAt: new Date().toISOString() }
      setImportJobs(prev => [newJob, ...prev])
      return { success: true, jobId: newJob.id }
    }
  }, [fetchJobs])

  const downloadExport = useCallback(async (jobId: string) => {
    const job = exportJobs.find(j => j.id === jobId)
    if (job?.downloadUrl) {
      window.open(job.downloadUrl, '_blank')
      return { success: true }
    }
    return { success: false, error: 'Download not available' }
  }, [exportJobs])

  const deleteJob = useCallback(async (jobId: string, type: 'export' | 'import') => {
    try {
      await fetch(`/api/data-export/${jobId}`, { method: 'DELETE' })
      if (type === 'export') {
        setExportJobs(prev => prev.filter(j => j.id !== jobId))
      } else {
        setImportJobs(prev => prev.filter(j => j.id !== jobId))
      }
      return { success: true }
    } catch (err) {
      if (type === 'export') setExportJobs(prev => prev.filter(j => j.id !== jobId))
      else setImportJobs(prev => prev.filter(j => j.id !== jobId))
      return { success: true }
    }
  }, [])

  const checkJobStatus = useCallback(async (jobId: string, type: 'export' | 'import') => {
    try {
      const response = await fetch(`/api/data-export/${jobId}/status`)
      const result = await response.json()
      if (result.success) {
        if (type === 'export') {
          setExportJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...result.job } : j))
        } else {
          setImportJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...result.job } : j))
        }
      }
      return result
    } catch (err) {
      return { success: false, error: 'Failed to check status' }
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchJobs()
  }, [fetchJobs])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      const activeJobs = [...exportJobs, ...importJobs].filter(j => j.status === 'processing' || j.status === 'pending')
      activeJobs.forEach(job => {
        const type = 'categories' in job ? 'export' : 'import'
        checkJobStatus(job.id, type)
      })
    }, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, exportJobs, importJobs, checkJobStatus])

  const activeExports = useMemo(() => exportJobs.filter(j => j.status === 'processing' || j.status === 'pending'), [exportJobs])
  const completedExports = useMemo(() => exportJobs.filter(j => j.status === 'completed'), [exportJobs])
  const totalDataSize = useMemo(() => dataSummary.reduce((sum, d) => sum + d.estimatedSize, 0), [dataSummary])
  const totalRecords = useMemo(() => dataSummary.reduce((sum, d) => sum + d.recordCount, 0), [dataSummary])

  return {
    exportJobs, importJobs, dataSummary, activeExports, completedExports, totalDataSize, totalRecords,
    isLoading, error,
    refresh, startExport, startImport, downloadExport, deleteJob, checkJobStatus
  }
}

export default useDataExport
