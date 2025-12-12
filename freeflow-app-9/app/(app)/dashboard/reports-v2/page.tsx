"use client"

import { useState } from 'react'
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
  TrendingDown
} from 'lucide-react'

/**
 * Reports V2 - Groundbreaking Analytics & Reporting
 * Showcases financial reports with modern components
 */
export default function ReportsV2() {
  const [selectedTab, setSelectedTab] = useState<'analytics' | 'reports'>('analytics')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Total Reports', value: '42', change: 12.5, icon: <FileText className="w-5 h-5" /> },
    { label: 'Monthly Revenue', value: '$54.6K', change: 7.0, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Growth Rate', value: '23%', change: 5.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Projects', value: '28', change: 8.3, icon: <Target className="w-5 h-5" /> }
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
    { month: 'Dec', revenue: 54600, growth: 7 }
  ]

  const topServices = [
    { service: 'Web Development', revenue: 145000, count: 12 },
    { service: 'Mobile Apps', revenue: 98000, count: 8 },
    { service: 'UI/UX Design', revenue: 87000, count: 15 },
    { service: 'Branding', revenue: 64000, count: 10 },
    { service: 'SEO & Marketing', revenue: 75000, count: 14 }
  ]

  const reports = [
    {
      id: 'RPT-001',
      name: 'Q4 2024 Financial Summary',
      type: 'financial',
      status: 'ready',
      createdAt: '2024-01-15',
      dataPoints: 8450,
      fileSize: 2.4
    },
    {
      id: 'RPT-002',
      name: 'Monthly Sales Performance',
      type: 'sales',
      status: 'generating',
      createdAt: '2024-01-20',
      dataPoints: 5230,
      fileSize: 1.8
    },
    {
      id: 'RPT-003',
      name: 'User Engagement Analytics',
      type: 'analytics',
      status: 'ready',
      createdAt: '2024-01-18',
      dataPoints: 12750,
      fileSize: 3.2
    },
    {
      id: 'RPT-004',
      name: 'Revenue Growth Report',
      type: 'financial',
      status: 'scheduled',
      createdAt: '2024-01-22',
      dataPoints: 6890,
      fileSize: 2.1
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700'
      case 'generating': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-purple-100 text-purple-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analytics': return 'bg-blue-100 text-blue-700'
      case 'financial': return 'bg-green-100 text-green-700'
      case 'sales': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">Comprehensive financial insights and report generation</p>
          </div>
          <GradientButton from="purple" to="indigo" onClick={() => console.log('Create report')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

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
            <BentoCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Revenue Tracking
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Monthly revenue breakdown with growth trends</p>
                </div>
                <ModernButton variant="outline" size="sm" onClick={() => console.log('Export')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </ModernButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Current Month</p>
                  <p className="text-2xl font-bold text-green-600">${(monthlyRevenue[11].revenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    +{monthlyRevenue[11].growth}% vs last month
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Client Retention</p>
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-xs text-gray-500 mt-1">Industry avg: 75%</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Avg Project Value</p>
                  <p className="text-2xl font-bold text-purple-600">$8.8K</p>
                  <p className="text-xs text-gray-500 mt-1">Per completed project</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Cash Runway</p>
                  <p className="text-2xl font-bold text-orange-600">18 mo</p>
                  <p className="text-xs text-gray-500 mt-1">Based on current burn rate</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue Breakdown (2024)</h3>
                <div className="space-y-2">
                  {monthlyRevenue.map((month, index) => {
                    const widthPercent = (month.revenue / maxRevenue) * 100

                    return (
                      <div key={month.month} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 w-8">{month.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
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
              <BentoCard className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Top Performing Services
                </h3>
                <div className="space-y-3">
                  {topServices.map((service, index) => {
                    const maxServiceRevenue = Math.max(...topServices.map(s => s.revenue))
                    const widthPercent = (service.revenue / maxServiceRevenue) * 100

                    return (
                      <div key={service.service} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700">{service.service}</span>
                          <span className="font-bold text-yellow-700">${(service.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="bg-white rounded-full h-4 overflow-hidden">
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
                  current={{ label: 'This Month', value: 54600 }}
                  previous={{ label: 'Last Month', value: 51200 }}
                />
                <BentoCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
                  <div className="space-y-3">
                    <MiniKPI label="Avg Project Value" value="$12.8K" change={12.5} />
                    <MiniKPI label="Retention Rate" value="94%" change={5.7} />
                    <MiniKPI label="Revenue per Client" value="$8.4K" change={-15.2} />
                    <MiniKPI label="Growth Rate" value="23%" change={8.3} />
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
              <BentoQuickAction icon={<Plus />} title="New Report" description="Create" onClick={() => console.log('New')} />
              <BentoQuickAction icon={<Calendar />} title="Schedule" description="Automate" onClick={() => console.log('Schedule')} />
              <BentoQuickAction icon={<Download />} title="Export" description="Download" onClick={() => console.log('Export')} />
              <BentoQuickAction icon={<FileText />} title="Templates" description="Library" onClick={() => console.log('Templates')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <BentoCard key={report.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-2">{report.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{report.id}</p>
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
                        <p className="font-medium">{report.dataPoints.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">File Size</p>
                        <p className="font-medium">{report.fileSize} MB</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center gap-2">
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('View', report.id)}>
                        View
                      </ModernButton>
                      {report.status === 'ready' && (
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', report.id)}>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
