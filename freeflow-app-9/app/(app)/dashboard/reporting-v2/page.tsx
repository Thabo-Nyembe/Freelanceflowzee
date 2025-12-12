"use client"

import { useState } from 'react'
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
  CheckCircle
} from 'lucide-react'

/**
 * Reporting V2 - Groundbreaking Business Reporting & Analytics
 * Showcases report generation and business intelligence with modern components
 */
export default function ReportingV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedType, setSelectedType] = useState<'all' | 'financial' | 'operational' | 'custom'>('all')

  const stats = [
    { label: 'Reports Generated', value: '847', change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Scheduled Reports', value: '42', change: 12.5, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Report Views', value: '12.4K', change: 32.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Shared Reports', value: '247', change: 18.7, icon: <Share2 className="w-5 h-5" /> }
  ]

  const reports = [
    {
      id: '1',
      title: 'Monthly Revenue Report',
      type: 'Financial',
      schedule: 'Monthly',
      lastGenerated: '2 days ago',
      views: 247,
      status: 'ready',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      title: 'User Engagement Analytics',
      type: 'Operational',
      schedule: 'Weekly',
      lastGenerated: '5 hours ago',
      views: 124,
      status: 'ready',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      title: 'Quarterly Performance Review',
      type: 'Financial',
      schedule: 'Quarterly',
      lastGenerated: 'Generating...',
      views: 0,
      status: 'generating',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      title: 'Sales Pipeline Analysis',
      type: 'Custom',
      schedule: 'On-demand',
      lastGenerated: '1 week ago',
      views: 89,
      status: 'ready',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      title: 'Customer Satisfaction Report',
      type: 'Operational',
      schedule: 'Monthly',
      lastGenerated: '3 days ago',
      views: 156,
      status: 'ready',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '6',
      title: 'Team Productivity Metrics',
      type: 'Operational',
      schedule: 'Weekly',
      lastGenerated: '1 day ago',
      views: 67,
      status: 'ready',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const recentActivity = [
    { icon: <FileText className="w-5 h-5" />, title: 'Report generated', description: 'Monthly Revenue Report', time: '2 days ago', status: 'success' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'Report shared', description: 'User Engagement Analytics with team', time: '5 hours ago', status: 'info' as const },
    { icon: <Download className="w-5 h-5" />, title: 'Report downloaded', description: 'Sales Pipeline Analysis (PDF)', time: '1 week ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Schedule updated', description: 'Customer Satisfaction Report', time: '2 weeks ago', status: 'success' as const }
  ]

  const reportTemplates = [
    { name: 'Financial Summary', description: 'Revenue, expenses, profit', icon: <TrendingUp className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'User Analytics', description: 'Engagement and behavior', icon: <BarChart3 className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Sales Report', description: 'Pipeline and conversions', icon: <Award className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Custom Report', description: 'Build your own', icon: <Settings className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700'
      case 'generating': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-3 h-3" />
      case 'generating': return <Clock className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-purple-600" />
              Reporting & Analytics
            </h1>
            <p className="text-muted-foreground">Generate insights and business intelligence</p>
          </div>
          <GradientButton from="purple" to="fuchsia" onClick={() => console.log('New report')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Report" description="Custom" onClick={() => console.log('New')} />
          <BentoQuickAction icon={<Calendar />} title="Schedule" description="Automated" onClick={() => console.log('Schedule')} />
          <BentoQuickAction icon={<Filter />} title="Filter Data" description="Customize" onClick={() => console.log('Filter')} />
          <BentoQuickAction icon={<Download />} title="Export" description="Download" onClick={() => console.log('Export')} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>
            Weekly
          </PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarterly
          </PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>
            Yearly
          </PillButton>
          <div className="w-px h-6 bg-border" />
          <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>
            All Types
          </PillButton>
          <PillButton variant={selectedType === 'financial' ? 'primary' : 'ghost'} onClick={() => setSelectedType('financial')}>
            Financial
          </PillButton>
          <PillButton variant={selectedType === 'operational' ? 'primary' : 'ghost'} onClick={() => setSelectedType('operational')}>
            Operational
          </PillButton>
          <PillButton variant={selectedType === 'custom' ? 'primary' : 'ghost'} onClick={() => setSelectedType('custom')}>
            Custom
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Generated Reports</h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${report.color} flex items-center justify-center text-white flex-shrink-0`}>
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
                            {report.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.schedule}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.lastGenerated}
                          </span>
                          {report.status === 'ready' && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {report.views} views
                            </span>
                          )}
                        </div>
                        {report.status === 'ready' && (
                          <div className="flex items-center gap-2">
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('View', report.id)}>
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', report.id)}>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Share', report.id)}>
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </ModernButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Report Templates</h3>
              <div className="space-y-3">
                {reportTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => console.log('Use template', template.name)}
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

            <div className="grid grid-cols-1 gap-6">
              <ComparisonCard
                title="Reports This Month"
                current={{ label: 'This Month', value: 847 }}
                previous={{ label: 'Last Month', value: 672 }}
              />
            </div>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Report Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Generation Time" value="2.4s" change={-18.7} />
                <MiniKPI label="Success Rate" value="98%" change={5.2} />
                <MiniKPI label="Data Accuracy" value="99.8%" change={2.1} />
                <MiniKPI label="User Engagement" value="84%" change={15.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
