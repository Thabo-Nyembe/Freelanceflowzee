'use client'

import { useState } from 'react'
import { useBusinessReports, BusinessReport, ReportStats } from '@/lib/hooks/use-business-reports'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ComparisonCard,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Eye,
  Share2,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Filter,
  CheckCircle,
  X,
  Loader2,
  Trash2
} from 'lucide-react'

interface ReportingClientProps {
  initialReports: BusinessReport[]
  initialStats: ReportStats
}

export default function ReportingClient({ initialReports, initialStats }: ReportingClientProps) {
  const {
    reports,
    stats,
    loading,
    createReport,
    deleteReport,
    generateReport,
    viewReport,
    downloadReport,
    shareReport
  } = useBusinessReports(initialReports, initialStats)

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedType, setSelectedType] = useState<'all' | 'financial' | 'operational' | 'custom'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    report_type: 'custom' as const,
    schedule: 'on-demand' as const,
    file_format: 'pdf'
  })

  const filteredReports = reports.filter(report => {
    if (selectedType === 'all') return true
    return report.report_type === selectedType
  })

  const handleCreateReport = async () => {
    if (!newReport.title.trim()) return
    await createReport(newReport)
    setShowCreateModal(false)
    setNewReport({ title: '', description: '', report_type: 'custom', schedule: 'on-demand', file_format: 'pdf' })
  }

  const displayStats = [
    { label: 'Reports Generated', value: stats.total.toString(), change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Scheduled Reports', value: stats.scheduled.toString(), change: 12.5, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Report Views', value: stats.totalViews.toLocaleString(), change: 32.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Shared Reports', value: stats.totalShares.toLocaleString(), change: 18.7, icon: <Share2 className="w-5 h-5" /> }
  ]

  const reportTemplates = [
    { name: 'Financial Summary', description: 'Revenue, expenses, profit', icon: <TrendingUp className="w-5 h-5" />, color: 'from-green-500 to-emerald-500', type: 'financial' },
    { name: 'User Analytics', description: 'Engagement and behavior', icon: <BarChart3 className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', type: 'analytics' },
    { name: 'Sales Report', description: 'Pipeline and conversions', icon: <Award className="w-5 h-5" />, color: 'from-purple-500 to-pink-500', type: 'sales' },
    { name: 'Custom Report', description: 'Build your own', icon: <Settings className="w-5 h-5" />, color: 'from-orange-500 to-red-500', type: 'custom' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'generating': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'scheduled': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-3 h-3" />
      case 'generating': return <Loader2 className="w-3 h-3 animate-spin" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'from-green-500 to-emerald-500'
      case 'operational': return 'from-blue-500 to-cyan-500'
      case 'analytics': return 'from-purple-500 to-pink-500'
      case 'sales': return 'from-orange-500 to-amber-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-fuchsia-50/40 dark:from-purple-950 dark:via-violet-950/30 dark:to-fuchsia-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-purple-600" />
              Reporting & Analytics
            </h1>
            <p className="text-muted-foreground">Generate insights and business intelligence</p>
          </div>
          <GradientButton from="purple" to="fuchsia" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Report" description="Custom" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Calendar />} title="Schedule" description="Automated" onClick={() => console.log('Schedule')} />
          <BentoQuickAction icon={<Filter />} title="Filter Data" description="Customize" onClick={() => console.log('Filter')} />
          <BentoQuickAction icon={<Download />} title="Export" description="Download" onClick={() => console.log('Export')} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>Weekly</PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>Monthly</PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>Quarterly</PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>Yearly</PillButton>
          <div className="w-px h-6 bg-border" />
          <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>All Types</PillButton>
          <PillButton variant={selectedType === 'financial' ? 'primary' : 'ghost'} onClick={() => setSelectedType('financial')}>Financial</PillButton>
          <PillButton variant={selectedType === 'operational' ? 'primary' : 'ghost'} onClick={() => setSelectedType('operational')}>Operational</PillButton>
          <PillButton variant={selectedType === 'custom' ? 'primary' : 'ghost'} onClick={() => setSelectedType('custom')}>Custom</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Generated Reports</h3>
              {loading && reports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                  <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Report
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getTypeColor(report.report_type)} flex items-center justify-center text-white flex-shrink-0`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{report.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              {report.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {report.report_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {report.schedule}
                            </span>
                            {report.last_generated_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(report.last_generated_at).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {report.views_count} views
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {report.status === 'ready' ? (
                              <>
                                <ModernButton variant="outline" size="sm" onClick={() => viewReport(report.id)}>
                                  <Eye className="w-3 h-3 mr-1" />View
                                </ModernButton>
                                <ModernButton variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                                  <Download className="w-3 h-3 mr-1" />Download
                                </ModernButton>
                                <ModernButton variant="outline" size="sm" onClick={() => shareReport(report.id)}>
                                  <Share2 className="w-3 h-3 mr-1" />Share
                                </ModernButton>
                              </>
                            ) : report.status === 'draft' ? (
                              <ModernButton variant="primary" size="sm" onClick={() => generateReport(report.id)}>
                                <BarChart3 className="w-3 h-3 mr-1" />Generate
                              </ModernButton>
                            ) : null}
                            <ModernButton variant="outline" size="sm" onClick={() => deleteReport(report.id)}>
                              <Trash2 className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Report Templates</h3>
              <div className="space-y-3">
                {reportTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setNewReport({ ...newReport, report_type: template.type as any, title: template.name })
                      setShowCreateModal(true)
                    }}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white`}>
                        {template.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>

            <ComparisonCard
              title="Reports This Month"
              current={{ label: 'This Month', value: stats.total }}
              previous={{ label: 'Last Month', value: Math.round(stats.total * 0.8) }}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Report Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Ready" value={stats.ready.toString()} change={18.7} />
                <MiniKPI label="Generating" value={stats.generating.toString()} change={5.2} />
                <MiniKPI label="Total Downloads" value={stats.totalDownloads.toLocaleString()} change={25.3} />
                <MiniKPI label="Avg Gen Time" value={`${stats.avgGenerationTime}s`} change={-12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Report</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter report title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Type</label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="analytics">Analytics</option>
                    <option value="sales">Sales</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule</label>
                  <select
                    value={newReport.schedule}
                    onChange={(e) => setNewReport({ ...newReport, schedule: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="on-demand">On-Demand</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File Format</label>
                <select
                  value={newReport.file_format}
                  onChange={(e) => setNewReport({ ...newReport, file_format: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="purple" to="fuchsia" className="flex-1" onClick={handleCreateReport} disabled={loading || !newReport.title.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Report'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
