'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  DollarSign,
  Users,
  FolderOpen,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  Calendar,
  Filter,
  Settings,
  Bookmark,
  Search
} from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [isExporting, setIsExporting] = useState(false)
  const [predictiveMode, setPredictiveMode] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Enhanced Handler Functions
  const handleDateRangeChange = (range: string) => {
    console.log('📅 DATE RANGE CHANGED:', range)
    setDateRange(range)
    alert(`📅 Date range updated to: ${range.replace(/-/g, ' ')}`)
  }

  const handleDownloadChart = (chartName: string) => {
    console.log('📊 DOWNLOAD CHART:', chartName)
    alert(`📊 Downloading ${chartName} chart as PNG...`)
  }

  const handleShareAnalytics = () => {
    console.log('🔗 SHARE ANALYTICS')
    const shareUrl = `${window.location.origin}/dashboard/analytics?tab=${activeTab}&range=${dateRange}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      alert(`🔗 Share link copied!\n\n${shareUrl}`)
    } else {
      alert(`🔗 Share link:\n\n${shareUrl}`)
    }
  }

  const handleScheduleReport = () => {
    console.log('📅 SCHEDULE REPORT')
    alert('📅 Schedule Analytics Report\n\nChoose frequency:\n• Daily\n• Weekly\n• Monthly\n• Custom')
  }

  const handleCustomMetric = () => {
    console.log('➕ CREATE CUSTOM METRIC')
    alert('➕ Custom Metric Builder\n\nCreate custom metrics with formulas and visualizations.')
  }

  const handleComparePeriods = () => {
    console.log('📊 COMPARE PERIODS')
    alert('📊 Period Comparison\n\nCompare against:\n• Previous period\n• Same period last year\n• Custom range')
  }

  const handleExportData = async (format: string) => {
    console.log('💾 EXPORT ANALYTICS DATA - Format:', format)
    setIsExporting(true)

    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',  // Export comprehensive analytics by default
          format: format.toLowerCase(),
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export analytics')
      }

      // Handle CSV/XLSX download
      if (format.toLowerCase() === 'csv' || format.toLowerCase() === 'xlsx') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-comprehensive-${Date.now()}.${format.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Analytics exported as ${format.toUpperCase()}`, {
          description: `Report includes comprehensive data for the last 6 months`
        })
      } else {
        // Handle JSON response
        const result = await response.json()
        if (result.success) {
          toast.success('Analytics report generated!', {
            description: `${result.reportType} data retrieved successfully`
          })
        }
      }
    } catch (error: any) {
      console.error('Export Analytics Error:', error)
      toast.error('Failed to export analytics', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFilterByMetric = (metric: string) => {
    console.log('🔍 FILTER BY METRIC:', metric)
    alert(`🔍 Filtering by: ${metric}`)
  }

  const handleAIInsight = (insightId: string) => {
    console.log('🤖 AI INSIGHT:', insightId)
    alert('🤖 AI Insight Details\n\nShowing AI-powered recommendations and predictions.')
  }

  const handleTogglePredictive = () => {
    const newState = !predictiveMode
    console.log('🔮 TOGGLE PREDICTIVE MODE:', newState)
    setPredictiveMode(newState)
    alert(`🔮 Predictive Analytics ${newState ? 'Enabled' : 'Disabled'}`)
  }

  const handleDrillDown = (dataPoint: string) => {
    console.log('🔎 DRILL DOWN:', dataPoint)
    alert(`🔎 Detailed analysis of: ${dataPoint}`)
  }

  const handleBookmarkView = () => {
    console.log('⭐ BOOKMARK VIEW')
    alert('⭐ Current view bookmarked!\n\nAccess anytime from your bookmarks.')
  }

  const handleRefreshData = () => { console.log('🔄 REFRESH'); alert('🔄 Refreshing data...') }
  const handleViewDetails = (metric: string) => { console.log('👁️:', metric); alert(`👁️ Details: ${metric}`) }
  const handlePrintReport = () => { console.log('🖨️ PRINT'); window.print() }
  const handleEmailReport = () => { console.log('📧 EMAIL'); alert('📧 Email report') }
  const handleSaveSnapshot = () => { console.log('📸 SNAP'); alert('📸 Snapshot saved') }
  const handleRestoreSnapshot = () => { console.log('⏮️ RESTORE'); alert('⏮️ Restore snapshot') }
  const handleCompareMetrics = () => { console.log('⚖️ COMPARE'); alert('⚖️ Compare metrics') }
  const handleSetGoals = () => { console.log('🎯 GOALS'); alert('🎯 Set goals') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* Gradient icon container */}
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-lg text-gray-600 font-light">
                Comprehensive business intelligence and performance metrics 📊
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(45231)}
                    </p>
                    <p className="text-sm text-green-600 font-medium">+16.2% from last month</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-gray-500">68 total projects</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                    <p className="text-sm text-blue-600 font-medium">23 new this month</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">87%</p>
                    <p className="text-sm text-gray-500">1089h billable</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-2xl">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2 rounded-2xl">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 rounded-2xl">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 rounded-2xl">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: 'Jan', revenue: 32000, projects: 8 },
                      { month: 'Feb', revenue: 35000, projects: 10 },
                      { month: 'Mar', revenue: 28000, projects: 7 },
                      { month: 'Apr', revenue: 42000, projects: 12 },
                      { month: 'May', revenue: 38000, projects: 9 },
                      { month: 'Jun', revenue: 45231, projects: 11 }
                    ].map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-8">{month.month}</span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2 w-32">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(month.revenue / 50000) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.projects} projects</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Categories */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Project Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Web Development', count: 28, revenue: 18500, color: 'bg-blue-500' },
                      { category: 'Mobile Apps', count: 15, revenue: 12800, color: 'bg-green-500' },
                      { category: 'Branding', count: 12, revenue: 8200, color: 'bg-purple-500' },
                      { category: 'UI/UX Design', count: 8, revenue: 4200, color: 'bg-orange-500' },
                      { category: 'Marketing', count: 5, revenue: 1530, color: 'bg-pink-500' }
                    ].map(category => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            <span className="text-sm font-medium">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(category.revenue)}</p>
                            <p className="text-xs text-gray-500">{category.count} projects</p>
                          </div>
                        </div>
                        <Progress 
                          value={(category.revenue / 20000) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Revenue Analytics</h3>
                  <p className="text-gray-500">Detailed revenue breakdown and forecasting</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Project Analytics</h3>
                  <p className="text-gray-500">Project performance and timeline analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Client Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Client Analytics</h3>
                  <p className="text-gray-500">Client relationship and engagement metrics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}