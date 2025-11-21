'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  REPORT_TEMPLATES,
  MOCK_REPORTS,
  REPORT_METRICS,
  SECTION_TEMPLATES,
  getStatusColor,
  getFormatIcon,
  getChartTypeIcon,
  formatScheduleText,
  exportReport
} from '@/lib/reporting-utils'
import type { ExportFormat, ReportType } from '@/lib/reporting-types'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

type ViewMode = 'overview' | 'templates' | 'my-reports' | 'builder' | 'exports'

export default function ReportingPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  // A+++ LOAD REPORTING DATA
  useEffect(() => {
    const loadReportingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load reporting data'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Reporting dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reporting data')
        setIsLoading(false)
        announce('Error loading reporting dashboard', 'assertive')
      }
    }

    loadReportingData()
  }, [announce])

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
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors">
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
                          {REPORT_METRICS.totalReports}
                        </div>
                      </div>
                      <div className="text-2xl">📊</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {REPORT_METRICS.scheduledReports} scheduled
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Generated</div>
                        <div className="text-3xl font-bold text-green-500">
                          {REPORT_METRICS.reportsGenerated}
                        </div>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="text-xs text-green-500">
                      Avg {REPORT_METRICS.averageGenerationTime}s generation time
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Exports</div>
                        <div className="text-3xl font-bold text-purple-500">
                          {REPORT_METRICS.totalExports}
                        </div>
                      </div>
                      <div className="text-2xl">📥</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Most popular: PDF ({REPORT_METRICS.exportsByFormat.pdf})
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Popular Template</div>
                        <div className="text-lg font-bold text-orange-500">
                          {REPORT_METRICS.mostUsedTemplate}
                        </div>
                      </div>
                      <div className="text-2xl">🔥</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Most used template
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
                    {MOCK_REPORTS.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedReport(report.id)
                          setViewMode('my-reports')
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-3xl">{report.template.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold">{report.name}</div>
                            <div className="text-sm text-muted-foreground">{report.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatScheduleText(report.schedule)}
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
                              exportReport(report, 'pdf')
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    ))}
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
                  {MOCK_REPORTS.map((report) => (
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
                          <div className="text-4xl">{report.template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{report.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>📅 {formatScheduleText(report.schedule)}</span>
                              <span>👥 {report.recipients.length} recipients</span>
                              {report.lastGenerated && (
                                <span>🕒 Last: {report.lastGenerated.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors">
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors">
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
                                <button className="p-1 hover:bg-muted rounded">
                                  <span className="text-gray-400">⚙️</span>
                                </button>
                                <button className="p-1 hover:bg-muted rounded">
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
                        <div className="grid grid-cols-2 gap-2">
                          {exportFormats.map((format) => (
                            <button
                              key={format}
                              className="px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <span>{getFormatIcon(format)}</span>
                              <span className="uppercase">{format}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t space-y-2">
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Save Report
                        </button>
                        <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Generate Now
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
                    {Object.entries(REPORT_METRICS.exportsByFormat).map(([format, count]) => (
                      <div key={format} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFormatIcon(format as ExportFormat)}</span>
                          <span className="font-medium uppercase">{format}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-blue-500">{count}</span>
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / REPORT_METRICS.totalExports) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
                      <select className="w-full px-4 py-2 rounded-lg bg-muted text-sm">
                        {MOCK_REPORTS.map((report) => (
                          <option key={report.id} value={report.id}>
                            {report.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Export Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        {exportFormats.map((format) => (
                          <button
                            key={format}
                            className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <span className="text-xl">{getFormatIcon(format)}</span>
                            <span className="uppercase">{format}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Export Now
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
