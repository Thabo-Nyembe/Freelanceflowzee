// MIGRATED: Batch #25 - Verified database hook integration
'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  REPORT_TEMPLATES,
  SECTION_TEMPLATES,
  getStatusColor,
  getFormatIcon,
  getChartTypeIcon
} from '@/lib/reporting-utils'
import type { ExportFormat } from '@/lib/reporting-types'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// AUTHENTICATION & LOGGING
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'
import {
  createReport,
  updateReport,
  createReportExport,
  type ReportType
} from '@/lib/reports-queries'

const logger = createSimpleLogger('ReportingPage')

type ViewMode = 'overview' | 'templates' | 'my-reports' | 'builder' | 'exports'

export default function ReportingPage() {
  // AUTHENTICATION
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // DATABASE STATE
  const [reports, setReports] = useState<any[]>([])
  const [reportExports, setReportExports] = useState<any[]>([])
  const [reportSchedules, setReportSchedules] = useState<any[]>([])
  const [reportStatistics, setReportStatistics] = useState<any>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  // Modal and form states
  const [showCreateReportModal, setShowCreateReportModal] = useState(false)
  const [showSectionSettingsModal, setShowSectionSettingsModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any | null>(null)
  const [sectionSettingsForm, setSectionSettingsForm] = useState({
    title: '',
    type: 'metric' as 'metric' | 'chart' | 'table',
    chartType: 'bar' as string,
    showLegend: true,
    showGrid: true,
    colorScheme: 'default' as string
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReportName, setNewReportName] = useState('')
  const [newReportDescription, setNewReportDescription] = useState('')
  const [reportSections, setReportSections] = useState<any[]>([])
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>('pdf')
  const [selectedExportReport, setSelectedExportReport] = useState<string>('')

  // A+++ LOAD REPORTING DATA
  useEffect(() => {
    const loadReportingData = async () => {
      // Wait for authentication
      if (userLoading) return

      if (!userId) {
        logger.warn('Reporting accessed without authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading reporting data', { userId })

        // Load all reporting data in parallel
        const {
          getReports,
          getReportStatistics
        } = await import('@/lib/reports-queries')

        const [reportsData, statsData] = await Promise.all([
          getReports(userId),
          getReportStatistics(userId)
        ])

        if (reportsData.error) throw reportsData.error
        if (statsData.error) throw statsData.error

        setReports(reportsData.data || [])
        setReportStatistics(statsData.data)

        setIsLoading(false)
        logger.info('Reporting data loaded successfully', {
          reportsCount: reportsData.data?.length || 0
        })
        announce('Reporting dashboard loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reporting data'
        logger.error('Failed to load reporting data', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading reporting dashboard', 'assertive')
        toast.error('Failed to load reporting data')
      }
    }

    loadReportingData()
  }, [userId, userLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // CRUD HANDLERS
  const handleCreateReport = async (reportData: any) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Creating report', { userId, reportData })
      const { createReport } = await import('@/lib/reports-queries')
      const { data, error } = await createReport(userId, reportData)

      if (error) throw error

      setReports(prev => [data!, ...prev])
      logger.info('Report created successfully', { reportId: data!.id })
      toast.success(`Report "${data!.name}" created successfully`)
      announce(`Report ${data!.name} created`, 'polite')

      return data
    } catch (err) {
      logger.error('Failed to create report', { error: err, userId })
      toast.error('Failed to create report')
      throw err
    }
  }

  const handleUpdateReport = async (reportId: string, updates: any) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Updating report', { userId, reportId, updates })
      const { updateReport } = await import('@/lib/reports-queries')
      const { data, error } = await updateReport(reportId, userId, updates)

      if (error) throw error

      setReports(prev => prev.map(r => r.id === reportId ? data! : r))
      logger.info('Report updated successfully', { reportId })
      toast.success('Report updated successfully')
      announce('Report updated', 'polite')

      return data
    } catch (err) {
      logger.error('Failed to update report', { error: err, reportId })
      toast.error('Failed to update report')
      throw err
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Deleting report', { userId, reportId })
      const { deleteReport } = await import('@/lib/reports-queries')
      const { success, error } = await deleteReport(reportId, userId)

      if (error || !success) throw error

      setReports(prev => prev.filter(r => r.id !== reportId))
      logger.info('Report deleted successfully', { reportId })
      toast.success('Report deleted successfully')
      announce('Report deleted', 'polite')
    } catch (err) {
      logger.error('Failed to delete report', { error: err, reportId })
      toast.error('Failed to delete report')
    }
  }

  const handleDuplicateReport = async (reportId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Duplicating report', { userId, reportId })
      const { duplicateReport } = await import('@/lib/reports-queries')
      const { data, error } = await duplicateReport(reportId, userId)

      if (error) throw error

      setReports(prev => [data!, ...prev])
      logger.info('Report duplicated successfully', { reportId, newReportId: data!.id })
      toast.success('Report duplicated successfully')
      announce(`Report duplicated`, 'polite')

      return data
    } catch (err) {
      logger.error('Failed to duplicate report', { error: err, reportId })
      toast.error('Failed to duplicate report')
    }
  }

  const handleExportReport = async (reportId: string, format: ExportFormat) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Exporting report', { userId, reportId, format })
      const { createReportExport } = await import('@/lib/reports-queries')

      const { data, error } = await createReportExport(userId, reportId, {
        name: `Report Export ${new Date().toISOString()}`,
        format
      })

      if (error) throw error

      setReportExports(prev => [data!, ...prev])
      logger.info('Report export created', { reportId, exportId: data!.id, format })
      toast.success(`Report exported as ${format.toUpperCase()}`)
      announce(`Report exported as ${format}`, 'polite')

      return data
    } catch (err) {
      logger.error('Failed to export report', { error: err, reportId, format })
      toast.error('Failed to export report')
    }
  }

  const handleScheduleReport = async (reportId: string, scheduleData: any) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Scheduling report', { userId, reportId, scheduleData })
      const { createReportSchedule } = await import('@/lib/reports-queries')

      const { data, error } = await createReportSchedule(userId, {
        report_id: reportId,
        ...scheduleData
      })

      if (error) throw error

      setReportSchedules(prev => [data!, ...prev])
      logger.info('Report scheduled successfully', { reportId, scheduleId: data!.id })
      toast.success('Report scheduled successfully')
      announce('Report scheduled', 'polite')

      return data
    } catch (err) {
      logger.error('Failed to schedule report', { error: err, reportId })
      toast.error('Failed to schedule report')
    }
  }

  // View Mode Tabs
  const viewTabs = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: '📊' },
    { id: 'templates' as ViewMode, label: 'Templates', icon: '📋' },
    { id: 'my-reports' as ViewMode, label: 'My Reports', icon: '📄' },
    { id: 'builder' as ViewMode, label: 'Report Builder', icon: '🛠️' },
    { id: 'exports' as ViewMode, label: 'Exports', icon: '📥' }
  ]

  // Export formats
  const exportFormats: ExportFormat[] = ['pdf', 'excel', 'csv', 'json', 'html']

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Reporting & Export
              </TextShimmer>
              <p className="text-muted-foreground">
                Build custom reports, schedule automation, and export data
              </p>
            </div>
            <button
              onClick={() => setShowCreateReportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors"
            >
              + Create Report
            </button>
          </div>
        </ScrollReveal>

        {/* View Mode Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Overview View */}
        {viewMode === 'overview' && (
          <>
            {/* Key Metrics */}
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Reports</div>
                        <div className="text-3xl font-bold text-blue-500">
                          {reportStatistics?.totalReports || 0}
                        </div>
                      </div>
                      <div className="text-2xl">📊</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reportStatistics?.scheduledReports || 0} scheduled
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">This Month</div>
                        <div className="text-3xl font-bold text-green-500">
                          {reportStatistics?.reportsThisMonth || 0}
                        </div>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="text-xs text-green-500">
                      Generated this month
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Exports</div>
                        <div className="text-3xl font-bold text-purple-500">
                          {reportStatistics?.totalExports || 0}
                        </div>
                      </div>
                      <div className="text-2xl">📥</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total exports created
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">By Type</div>
                        <div className="text-lg font-bold text-orange-500">
                          {Object.keys(reportStatistics?.reportsByType || {}).length} types
                        </div>
                      </div>
                      <div className="text-2xl">🔥</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Report categories
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>

            {/* Recent Reports */}
            <ScrollReveal delay={0.3}>
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Recent Reports</h3>
                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-3">📊</div>
                        <div className="font-medium">No reports yet</div>
                        <div className="text-sm">Create your first report to get started</div>
                      </div>
                    ) : (
                      reports.slice(0, 5).map((report) => {
                        const template = REPORT_TEMPLATES.find(t => t.id === report.type) || REPORT_TEMPLATES[0]
                        return (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedReport(report.id)
                              setViewMode('my-reports')
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-3xl">{template.icon}</div>
                              <div className="flex-1">
                                <div className="font-semibold">{report.name}</div>
                                <div className="text-sm text-muted-foreground">{report.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {report.frequency} • {report.metrics.length} metrics
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleExportReport(report.id, 'pdf')
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                              >
                                Export
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REPORT_TEMPLATES.map((template) => (
                <LiquidGlassCard key={template.id}>
                  <div className="p-6">
                    <div className="text-5xl mb-4">{template.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Includes:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.defaultSections.map((section, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Data Sources:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.dataSources.map((source, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setViewMode('builder')
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* My Reports View */}
        {viewMode === 'my-reports' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">My Reports</h3>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-2 rounded-lg bg-muted text-sm">
                      <option>All Types</option>
                      <option>Financial</option>
                      <option>Sales</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                    </select>
                    <select className="px-3 py-2 rounded-lg bg-muted text-sm">
                      <option>All Status</option>
                      <option>Draft</option>
                      <option>Scheduled</option>
                      <option>Generated</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="text-5xl mb-4">📊</div>
                      <div className="font-medium text-lg mb-2">No reports yet</div>
                      <div className="text-sm mb-4">Create your first report using templates or the builder</div>
                      <button
                        onClick={() => setViewMode('templates')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Browse Templates
                      </button>
                    </div>
                  ) : (
                    reports.map((report) => {
                      const template = REPORT_TEMPLATES.find(t => t.id === report.type) || REPORT_TEMPLATES[0]
                      return (
                        <div
                          key={report.id}
                          className={`p-5 rounded-lg border-2 transition-all ${
                            selectedReport === report.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                              : 'border-transparent bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-4xl">{template.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-lg">{report.name}</h4>
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                                    {report.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>📅 {report.frequency}</span>
                                  <span>👥 {report.recipients.length} recipients</span>
                                  {report.last_run_at && (
                                    <span>🕒 Last: {new Date(report.last_run_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateReport(report.id, { status: 'draft' })}
                                className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleExportReport(report.id, 'pdf')}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                              >
                                Generate
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Builder View */}
        {viewMode === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.2}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Report Builder</h3>

                    {/* Report Details */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Report Name</label>
                        <input
                          type="text"
                          placeholder="Enter report name"
                          className="w-full px-4 py-2 rounded-lg bg-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          placeholder="Enter report description"
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg bg-muted"
                        />
                      </div>
                    </div>

                    {/* Section Builder */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Report Sections</h4>
                        <button
                          onClick={() => {
                            const newSection = { id: Date.now().toString(), title: 'New Section', type: 'metric', config: {} }
                            setReportSections(prev => [...prev, newSection])
                            toast.success('Section added')
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                        >
                          + Add Section
                        </button>
                      </div>

                      <div className="space-y-3">
                        {SECTION_TEMPLATES.financial.slice(0, 3).map((section) => (
                          <div key={section.id} className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {section.type === 'metric' ? '📊' : section.type === 'chart' ? '📈' : '📋'}
                                </span>
                                <div>
                                  <div className="font-semibold text-sm">{section.title}</div>
                                  <div className="text-xs text-muted-foreground capitalize">{section.type}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedSection(section)
                                    setSectionSettingsForm({
                                      title: section.title,
                                      type: section.type,
                                      chartType: section.config.chartType || 'bar',
                                      showLegend: section.config.showLegend ?? true,
                                      showGrid: section.config.showGrid ?? true,
                                      colorScheme: section.config.colorScheme || 'default'
                                    })
                                    setShowSectionSettingsModal(true)
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <span className="text-gray-400">⚙️</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setReportSections(prev => prev.filter(s => s.id !== section.id))
                                    toast.success('Section removed')
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                >
                                  <span className="text-red-400">🗑️</span>
                                </button>
                              </div>
                            </div>
                            {section.config.chartType && (
                              <div className="text-xs text-muted-foreground">
                                Chart: {getChartTypeIcon(section.config.chartType)} {section.config.chartType}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal delay={0.3}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Settings</h3>

                    <div className="space-y-6">
                      {/* Schedule */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Schedule</label>
                        <select className="w-full px-4 py-2 rounded-lg bg-muted text-sm">
                          <option>Not scheduled</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Quarterly</option>
                        </select>
                      </div>

                      {/* Recipients */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Recipients</label>
                        <input
                          type="email"
                          placeholder="Add email addresses"
                          className="w-full px-4 py-2 rounded-lg bg-muted text-sm"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            admin@company.com ×
                          </span>
                        </div>
                      </div>

                      {/* Export Format */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Export</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                          {exportFormats.map((format) => (
                            <button
                              key={format}
                              onClick={() => setSelectedExportFormat(format)}
                              className={`px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 ${
                                selectedExportFormat === format
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              <span>{getFormatIcon(format)}</span>
                              <span className="uppercase">{format}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t space-y-2">
                        <button
                          onClick={async () => {
                            if (!newReportName.trim()) {
                              toast.error('Report name is required')
                              return
                            }
                            setIsSubmitting(true)
                            try {
                              await handleCreateReport({
                                name: newReportName,
                                description: newReportDescription,
                                type: 'custom' as ReportType,
                                status: 'draft'
                              })
                              setNewReportName('')
                              setNewReportDescription('')
                              setReportSections([])
                            } finally {
                              setIsSubmitting(false)
                            }
                          }}
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Report'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!newReportName.trim()) {
                              toast.error('Report name is required')
                              return
                            }
                            setIsSubmitting(true)
                            try {
                              const report = await handleCreateReport({
                                name: newReportName,
                                description: newReportDescription,
                                type: 'custom' as ReportType,
                                status: 'generating'
                              })
                              if (report) {
                                await handleExportReport(report.id, selectedExportFormat)
                              }
                              setNewReportName('')
                              setNewReportDescription('')
                              setReportSections([])
                            } finally {
                              setIsSubmitting(false)
                            }
                          }}
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Generating...' : 'Generate Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* Exports View */}
        {viewMode === 'exports' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Stats */}
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Export Statistics</h3>
                  <div className="space-y-4">
                    {reportExports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-3">📥</div>
                        <div className="font-medium">No exports yet</div>
                        <div className="text-sm">Export a report to see statistics</div>
                      </div>
                    ) : (
                      exportFormats.map((format) => {
                        const count = reportExports.filter(e => e.format === format).length
                        const totalExports = reportExports.length
                        return (
                          <div key={format} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFormatIcon(format)}</span>
                              <span className="font-medium uppercase">{format}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold text-blue-500">{count}</span>
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: totalExports > 0 ? `${(count / totalExports) * 100}%` : '0%' }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Quick Export */}
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Quick Export</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Report</label>
                      <select
                        value={selectedExportReport}
                        onChange={(e) => setSelectedExportReport(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-muted text-sm"
                        disabled={reports.length === 0}
                      >
                        <option value="">Select a report...</option>
                        {reports.map((report) => (
                          <option key={report.id} value={report.id}>
                            {report.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Export Format</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        {exportFormats.map((format) => (
                          <button
                            key={format}
                            onClick={() => setSelectedExportFormat(format)}
                            className={`px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 font-medium ${
                              selectedExportFormat === format
                                ? 'bg-blue-500 text-white'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <span className="text-xl">{getFormatIcon(format)}</span>
                            <span className="uppercase">{format}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (!selectedExportReport) {
                          toast.error('Please select a report to export')
                          return
                        }
                        setIsSubmitting(true)
                        try {
                          await handleExportReport(selectedExportReport, selectedExportFormat)
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                      disabled={isSubmitting || !selectedExportReport}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Exporting...' : 'Export Now'}
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Create New Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Name *</label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Enter report description"
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateReportModal(false)
                  setNewReportName('')
                  setNewReportDescription('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newReportName.trim()) {
                    toast.error('Report name is required')
                    return
                  }
                  setIsSubmitting(true)
                  try {
                    await handleCreateReport({
                      name: newReportName,
                      description: newReportDescription,
                      type: 'custom' as ReportType,
                      status: 'draft'
                    })
                    setShowCreateReportModal(false)
                    setNewReportName('')
                    setNewReportDescription('')
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Settings Modal */}
      {showSectionSettingsModal && selectedSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Section Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  placeholder="Enter section title"
                  value={sectionSettingsForm.title}
                  onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Section Type</label>
                <select
                  value={sectionSettingsForm.type}
                  onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, type: e.target.value as 'metric' | 'chart' | 'table' }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="metric">Metric</option>
                  <option value="chart">Chart</option>
                  <option value="table">Table</option>
                </select>
              </div>
              {sectionSettingsForm.type === 'chart' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chart Type</label>
                    <select
                      value={sectionSettingsForm.chartType}
                      onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, chartType: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="donut">Donut Chart</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Legend</label>
                    <input
                      type="checkbox"
                      checked={sectionSettingsForm.showLegend}
                      onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, showLegend: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Grid</label>
                    <input
                      type="checkbox"
                      checked={sectionSettingsForm.showGrid}
                      onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, showGrid: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <select
                  value={sectionSettingsForm.colorScheme}
                  onChange={(e) => setSectionSettingsForm(prev => ({ ...prev, colorScheme: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="default">Default</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="rainbow">Rainbow</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSectionSettingsModal(false)
                  setSelectedSection(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Update the section with new settings
                  setReportSections(prev => prev.map(s =>
                    s.id === selectedSection.id
                      ? {
                          ...s,
                          title: sectionSettingsForm.title,
                          type: sectionSettingsForm.type,
                          config: {
                            ...s.config,
                            chartType: sectionSettingsForm.chartType,
                            showLegend: sectionSettingsForm.showLegend,
                            showGrid: sectionSettingsForm.showGrid,
                            colorScheme: sectionSettingsForm.colorScheme
                          }
                        }
                      : s
                  ))
                  setShowSectionSettingsModal(false)
                  setSelectedSection(null)
                  toast.success('Section settings updated')
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
