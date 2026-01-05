'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ReportType = 'revenue' | 'projects' | 'clients' | 'time' | 'expenses' | 'custom'
export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'

export interface Report {
  id: string
  name: string
  type: ReportType
  description?: string
  period: ReportPeriod
  startDate: string
  endDate: string
  createdAt: string
  createdBy: string
  status: 'draft' | 'generated' | 'scheduled'
  data?: ReportData
  schedule?: ReportSchedule
}

export interface ReportData {
  summary: Record<string, number | string>
  charts: ReportChart[]
  tables: ReportTable[]
  insights: string[]
}

export interface ReportChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  title: string
  data: any[]
  config?: Record<string, any>
}

export interface ReportTable {
  id: string
  title: string
  columns: string[]
  rows: any[][]
  totals?: any[]
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  nextRun: string
  enabled: boolean
}

export interface ReportTemplate {
  id: string
  name: string
  type: ReportType
  description: string
  thumbnail: string
  config: Record<string, any>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockReports: Report[] = [
  { id: 'rpt-1', name: 'Monthly Revenue Report', type: 'revenue', description: 'Revenue breakdown for the month', period: 'month', startDate: '2024-03-01', endDate: '2024-03-31', createdAt: '2024-03-31', createdBy: 'user-1', status: 'generated',
    data: {
      summary: { totalRevenue: 45000, invoicesPaid: 12, avgInvoice: 3750, growth: 15 },
      charts: [{ id: 'c1', type: 'line', title: 'Revenue Trend', data: [30000, 35000, 40000, 45000] }],
      tables: [{ id: 't1', title: 'Top Clients', columns: ['Client', 'Revenue'], rows: [['Acme', 15000], ['Tech Corp', 12000]], totals: ['Total', 45000] }],
      insights: ['Revenue increased 15% from last month', 'Top client contributed 33% of revenue']
    }
  },
  { id: 'rpt-2', name: 'Q1 Project Summary', type: 'projects', period: 'quarter', startDate: '2024-01-01', endDate: '2024-03-31', createdAt: '2024-04-01', createdBy: 'user-1', status: 'generated' },
  { id: 'rpt-3', name: 'Weekly Time Tracking', type: 'time', period: 'week', startDate: '2024-03-25', endDate: '2024-03-31', createdAt: '2024-03-31', createdBy: 'user-1', status: 'scheduled',
    schedule: { frequency: 'weekly', recipients: ['user@example.com'], nextRun: '2024-04-07', enabled: true }
  }
]

const mockTemplates: ReportTemplate[] = [
  { id: 'tpl-1', name: 'Revenue Overview', type: 'revenue', description: 'Comprehensive revenue analysis', thumbnail: '/templates/revenue.png', config: { includeCharts: true, includeComparison: true } },
  { id: 'tpl-2', name: 'Project Performance', type: 'projects', description: 'Project status and metrics', thumbnail: '/templates/projects.png', config: { includeTimeline: true, includeTeam: true } },
  { id: 'tpl-3', name: 'Client Report', type: 'clients', description: 'Client activity summary', thumbnail: '/templates/clients.png', config: { includeRevenue: true, includeProjects: true } },
  { id: 'tpl-4', name: 'Time Analysis', type: 'time', description: 'Billable hours breakdown', thumbnail: '/templates/time.png', config: { includeBreakdown: true, includeUtilization: true } }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseReportingOptions {
  
}

export function useReporting(options: UseReportingOptions = {}) {
  const {  } = options

  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [currentReport, setCurrentReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch('/api/reports')
      const result = await response.json()
      if (result.success) {
        setReports(Array.isArray(result.reports) ? result.reports : [])
        return result.reports
      }
      setReports([])
      return []
    } catch (err) {
      setReports([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateReport = useCallback(async (config: {
    name: string
    type: ReportType
    period: ReportPeriod
    startDate?: string
    endDate?: string
    templateId?: string
    options?: Record<string, any>
  }) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', ...config })
      })
      const result = await response.json()
      if (result.success) {
        await fetchReports()
        return { success: true, report: result.report }
      }
      return { success: false, error: result.error }
    } catch (err) {
      // Create mock report
      const newReport: Report = {
        id: `rpt-${Date.now()}`,
        name: config.name,
        type: config.type,
        period: config.period,
        startDate: config.startDate || new Date().toISOString(),
        endDate: config.endDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'user-1',
        status: 'generated'
      }
      setReports(prev => [newReport, ...prev])
      return { success: true, report: newReport }
    } finally {
      setIsGenerating(false)
    }
  }, [fetchReports])

  const scheduleReport = useCallback(async (reportId: string, schedule: ReportSchedule) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })
      const result = await response.json()
      if (result.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, schedule, status: 'scheduled' as const } : r))
      }
      return result
    } catch (err) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, schedule, status: 'scheduled' as const } : r))
      return { success: true }
    }
  }, [])

  const exportReport = useCallback(async (reportId: string, format: ExportFormat) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      })
      const result = await response.json()
      if (result.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
      return result
    } catch (err) {
      return { success: false, error: 'Failed to export report' }
    }
  }, [])

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
      setReports(prev => prev.filter(r => r.id !== reportId))
      return { success: true }
    } catch (err) {
      setReports(prev => prev.filter(r => r.id !== reportId))
      return { success: true }
    }
  }, [])

  const duplicateReport = useCallback(async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      const newReport: Report = { ...report, id: `rpt-${Date.now()}`, name: `${report.name} (Copy)`, createdAt: new Date().toISOString(), status: 'draft' }
      setReports(prev => [newReport, ...prev])
      return { success: true, report: newReport }
    }
    return { success: false, error: 'Report not found' }
  }, [reports])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchReports()
    setTemplates([])
  }, [fetchReports])

  useEffect(() => { refresh() }, [refresh])

  const scheduledReports = useMemo(() => reports.filter(r => r.status === 'scheduled'), [reports])
  const recentReports = useMemo(() => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [reports])
  const reportsByType = useMemo(() => {
    const grouped: Record<string, Report[]> = {}
    reports.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r)
    })
    return grouped
  }, [reports])

  return {
    reports, templates, currentReport, scheduledReports, recentReports, reportsByType,
    isLoading, isGenerating, error,
    refresh, fetchReports, generateReport, scheduleReport, exportReport, deleteReport, duplicateReport,
    setCurrentReport
  }
}

export default useReporting
