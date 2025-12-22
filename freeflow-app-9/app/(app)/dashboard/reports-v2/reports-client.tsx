'use client'

import { useState } from 'react'
import { useReports, Report, ReportStats } from '@/lib/hooks/use-reports'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ComparisonCard,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  Search,
  Calendar,
  Target,
  Wallet,
  Award,
  Zap,
  ArrowUpRight,
  TrendingDown,
  X,
  Loader2,
  Trash2,
  Play,
  Archive
} from 'lucide-react'

interface ReportsClientProps {
  initialReports: Report[]
  initialStats: ReportStats
}

export default function ReportsClient({ initialReports, initialStats }: ReportsClientProps) {
  const {
    reports,
    revenueEntries,
    stats,
    loading,
    createReport,
    deleteReport,
    generateReport,
    archiveReport,
    createRevenueEntry
  } = useReports(initialReports, initialStats)

  const [selectedTab, setSelectedTab] = useState<'analytics' | 'reports'>('analytics')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRevenueModal, setShowRevenueModal] = useState(false)
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'financial' as Report['type']
  })
  const [newRevenue, setNewRevenue] = useState({
    amount: '',
    type: 'income' as 'income' | 'expense' | 'refund',
    category: '',
    description: ''
  })

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateReport = async () => {
    if (!newReport.name.trim()) return
    await createReport(newReport)
    setShowCreateModal(false)
    setNewReport({ name: '', description: '', type: 'financial' })
  }

  const handleAddRevenue = async () => {
    if (!newRevenue.amount) return
    await createRevenueEntry({
      amount: parseFloat(newRevenue.amount),
      type: newRevenue.type,
      category: newRevenue.category,
      description: newRevenue.description
    })
    setShowRevenueModal(false)
    setNewRevenue({ amount: '', type: 'income', category: '', description: '' })
  }

  const displayStats = [
    { label: 'Total Reports', value: stats.total.toString(), change: 12.5, icon: <FileText className="w-5 h-5" /> },
    { label: 'Total Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, change: 7.0, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Net Income', value: `$${(stats.netIncome / 1000).toFixed(1)}K`, change: 5.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Reports Ready', value: stats.ready.toString(), change: 8.3, icon: <Target className="w-5 h-5" /> }
  ]

  const monthlyRevenue = [
    { month: 'Jan', revenue: 24500, growth: 12 },
    { month: 'Feb', revenue: 28700, growth: 17 },
    { month: 'Mar', revenue: 32100, growth: 12 },
    { month: 'Apr', revenue: 29800, growth: -7 },
    { month: 'May', revenue: 35400, growth: 19 },
    { month: 'Jun', revenue: 38900, growth: 10 },
    { month: 'Jul', revenue: 42300, growth: 9 },
    { month: 'Aug', revenue: 39600, growth: -6 },
    { month: 'Sep', revenue: 44200, growth: 12 },
    { month: 'Oct', revenue: 47800, growth: 8 },
    { month: 'Nov', revenue: 51200, growth: 7 },
    { month: 'Dec', revenue: stats.totalRevenue || 54600, growth: 7 }
  ]

  const topServices = [
    { service: 'Web Development', revenue: 145000, count: 12 },
    { service: 'Mobile Apps', revenue: 98000, count: 8 },
    { service: 'UI/UX Design', revenue: 87000, count: 15 },
    { service: 'Branding', revenue: 64000, count: 10 },
    { service: 'SEO & Marketing', revenue: 75000, count: 14 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'generating': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'scheduled': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'archived': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analytics': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'financial': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'sales': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      case 'performance': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">Comprehensive financial insights and report generation</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => setShowRevenueModal(true)}>
              <DollarSign className="w-5 h-5 mr-2" />
              Add Revenue
            </ModernButton>
            <GradientButton from="purple" to="indigo" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Report
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="flex items-center gap-3">
          <PillButton variant={selectedTab === 'analytics' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('analytics')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Financial Analytics
          </PillButton>
          <PillButton variant={selectedTab === 'reports' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('reports')}>
            <FileText className="w-4 h-4 mr-2" />
            Reports Library
          </PillButton>
        </div>

        {selectedTab === 'analytics' && (
          <>
            <BentoCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Revenue Tracking
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Monthly revenue breakdown with growth trends</p>
                </div>
                <ModernButton variant="outline" size="sm" onClick={() => console.log('Export')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </ModernButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    +7% vs last month
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">${(stats.totalExpenses / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground mt-1">Tracked expenses</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Net Income</p>
                  <p className="text-2xl font-bold text-purple-600">${(stats.netIncome / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground mt-1">After expenses</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Reports Generated</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.ready} ready to download</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Monthly Revenue Breakdown (2024)</h3>
                <div className="space-y-2">
                  {monthlyRevenue.map((month) => {
                    const widthPercent = (month.revenue / maxRevenue) * 100

                    return (
                      <div key={month.month} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-8">{month.month}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-end px-3"
                            style={{ width: `${widthPercent}%` }}
                          >
                            <span className="text-xs font-bold text-white">${(month.revenue / 1000).toFixed(1)}k</span>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold w-12 text-right ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.growth >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                          {Math.abs(month.growth)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </BentoCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BentoCard className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Top Performing Services
                </h3>
                <div className="space-y-3">
                  {topServices.map((service) => {
                    const maxServiceRevenue = Math.max(...topServices.map(s => s.revenue))
                    const widthPercent = (service.revenue / maxServiceRevenue) * 100

                    return (
                      <div key={service.service} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{service.service}</span>
                          <span className="font-bold text-yellow-700 dark:text-yellow-300">${(service.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-end px-2"
                            style={{ width: `${widthPercent}%` }}
                          >
                            <span className="text-xs font-bold text-white">{service.count} projects</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </BentoCard>

              <div className="space-y-6">
                <ComparisonCard
                  title="Revenue Comparison"
                  current={{ label: 'This Month', value: stats.totalRevenue || 54600 }}
                  previous={{ label: 'Last Month', value: (stats.totalRevenue || 54600) * 0.93 }}
                />
                <BentoCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
                  <div className="space-y-3">
                    <MiniKPI label="Total Reports" value={stats.total.toString()} change={12.5} />
                    <MiniKPI label="Draft Reports" value={stats.draft.toString()} change={5.7} />
                    <MiniKPI label="Scheduled" value={stats.scheduled.toString()} change={-15.2} />
                    <MiniKPI label="Archived" value={stats.archived.toString()} change={8.3} />
                  </div>
                </BentoCard>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'reports' && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BentoQuickAction icon={<Plus />} title="New Report" description="Create" onClick={() => setShowCreateModal(true)} />
              <BentoQuickAction icon={<Calendar />} title="Schedule" description="Automate" onClick={() => console.log('Schedule')} />
              <BentoQuickAction icon={<Download />} title="Export All" description="Download" onClick={() => console.log('Export')} />
              <BentoQuickAction icon={<FileText />} title="Templates" description="Library" onClick={() => console.log('Templates')} />
            </div>

            {loading && reports.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No reports found</p>
                <ModernButton
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Report
                </ModernButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <BentoCard key={report.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{report.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{report.report_number || report.id.slice(0, 8)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md ${getTypeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Data Points</p>
                          <p className="font-medium">{report.data_points.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">File Size</p>
                          <p className="font-medium">{report.file_size_mb || 0} MB</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center gap-2">
                        {report.status === 'draft' && (
                          <ModernButton variant="outline" size="sm" onClick={() => generateReport(report.id)}>
                            <Play className="w-3 h-3 mr-1" />
                            Generate
                          </ModernButton>
                        )}
                        {report.status === 'ready' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', report.id)}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                        )}
                        {report.status !== 'archived' && (
                          <ModernButton variant="outline" size="sm" onClick={() => archiveReport(report.id)}>
                            <Archive className="w-3 h-3" />
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => deleteReport(report.id)}>
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Report</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Report Name *</label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Q4 Financial Summary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Report description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Report Type</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value as Report['type'] })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="financial">Financial</option>
                  <option value="sales">Sales</option>
                  <option value="analytics">Analytics</option>
                  <option value="performance">Performance</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton
                  from="purple"
                  to="indigo"
                  className="flex-1"
                  onClick={handleCreateReport}
                  disabled={loading || !newReport.name.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Report'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Revenue Entry</h2>
              <button onClick={() => setShowRevenueModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  value={newRevenue.amount}
                  onChange={(e) => setNewRevenue({ ...newRevenue, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newRevenue.type}
                  onChange={(e) => setNewRevenue({ ...newRevenue, type: e.target.value as 'income' | 'expense' | 'refund' })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={newRevenue.category}
                  onChange={(e) => setNewRevenue({ ...newRevenue, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Project Payment, Software, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newRevenue.description}
                  onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowRevenueModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton
                  from="purple"
                  to="indigo"
                  className="flex-1"
                  onClick={handleAddRevenue}
                  disabled={loading || !newRevenue.amount}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Entry'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
