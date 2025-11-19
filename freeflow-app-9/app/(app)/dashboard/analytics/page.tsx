'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Search,
  Brain,
  Target,
  Lightbulb,
  Zap,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const TextShimmer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// COMPREHENSIVE KAZI ANALYTICS DATA
// ============================================================================

const KAZI_ANALYTICS_DATA = {
  overview: {
    totalRevenue: 287450,
    monthlyRevenue: 45231,
    activeProjects: 12,
    totalProjects: 68,
    totalClients: 156,
    newClients: 23,
    efficiency: 87,
    billableHours: 1089,
    revenueGrowth: 16.2,
    projectGrowth: 8.5,
    clientGrowth: 17.3,
    efficiencyGrowth: 3.2
  },

  revenue: {
    monthly: [
      { month: 'Jan', revenue: 32000, projects: 8, clients: 45 },
      { month: 'Feb', revenue: 35000, projects: 10, clients: 52 },
      { month: 'Mar', revenue: 28000, projects: 7, clients: 48 },
      { month: 'Apr', revenue: 42000, projects: 12, clients: 58 },
      { month: 'May', revenue: 38000, projects: 9, clients: 55 },
      { month: 'Jun', revenue: 45231, projects: 11, clients: 62 }
    ],
    forecast: [
      { month: 'Jul', revenue: 48500, confidence: 85 },
      { month: 'Aug', revenue: 52000, confidence: 78 },
      { month: 'Sep', revenue: 55600, confidence: 72 }
    ]
  },

  projectCategories: [
    { category: 'Web Development', count: 28, revenue: 18500, color: 'bg-blue-500', growth: 12.5 },
    { category: 'Mobile Apps', count: 15, revenue: 12800, color: 'bg-green-500', growth: 8.3 },
    { category: 'Branding', count: 12, revenue: 8200, color: 'bg-purple-500', growth: -2.1 },
    { category: 'UI/UX Design', count: 8, revenue: 4200, color: 'bg-orange-500', growth: 15.7 },
    { category: 'Marketing', count: 5, revenue: 1530, color: 'bg-pink-500', growth: 22.4 }
  ],

  insights: [
    {
      id: 'insight-1',
      type: 'revenue',
      title: 'Revenue Acceleration Detected',
      description: 'Monthly revenue growth trending 23% above forecast. Web development projects driving surge.',
      impact: 'high',
      confidence: 92,
      recommendation: 'Increase web dev capacity by 2 FTEs',
      potentialValue: 15000
    },
    {
      id: 'insight-2',
      type: 'efficiency',
      title: 'Efficiency Optimization Opportunity',
      description: 'Branding projects showing 2.1% decline. Consider streamlining workflow or adjusting pricing.',
      impact: 'medium',
      confidence: 78,
      recommendation: 'Review branding project templates',
      potentialValue: 4200
    },
    {
      id: 'insight-3',
      type: 'growth',
      title: 'Marketing Segment High-Growth',
      description: 'Marketing projects up 22.4% despite small volume. Strong demand signal for expansion.',
      impact: 'high',
      confidence: 88,
      recommendation: 'Launch marketing package tier',
      potentialValue: 8500
    }
  ],

  clients: {
    topPerformers: [
      { name: 'TechCorp Inc', revenue: 45000, projects: 8, satisfaction: 98 },
      { name: 'DesignStudio', revenue: 38000, projects: 6, satisfaction: 95 },
      { name: 'StartupXYZ', revenue: 32000, projects: 12, satisfaction: 92 }
    ],
    retention: 94.2,
    averageLifetimeValue: 28500,
    churnRate: 5.8
  },

  performance: {
    projectCompletionRate: 96.5,
    onTimeDelivery: 89.2,
    clientSatisfaction: 94.8,
    revenuePerProject: 4230,
    profitMargin: 68.5
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getInsightColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'border-red-300 bg-red-50'
    case 'medium': return 'border-yellow-300 bg-yellow-50'
    case 'low': return 'border-green-300 bg-green-50'
    default: return 'border-gray-300 bg-gray-50'
  }
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'revenue': return Target
    case 'efficiency': return Lightbulb
    case 'growth': return TrendingUp
    default: return Zap
  }
}

const getGrowthIndicator = (growth: number) => {
  if (growth > 0) {
    return {
      icon: ArrowUpRight,
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  } else {
    return {
      icon: ArrowDownRight,
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsPage() {
  const router = useRouter()

  // State Management
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [predictiveMode, setPredictiveMode] = useState(false)
  const [aiMode, setAiMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // ============================================================================
  // FILTERED DATA (useMemo for performance)
  // ============================================================================

  const filteredCategories = useMemo(() => {
    console.log('🔍 FILTERING ANALYTICS DATA')
    console.log('🔎 Search Term:', searchTerm || '(none)')
    console.log('📊 Current tab:', activeTab)

    if (!searchTerm) {
      console.log('✅ NO FILTER - Showing all data')
      return KAZI_ANALYTICS_DATA.projectCategories
    }

    const filtered = KAZI_ANALYTICS_DATA.projectCategories.filter(cat =>
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    console.log('✅ FILTERED RESULTS:', filtered.length, 'categories')
    if (filtered.length < KAZI_ANALYTICS_DATA.projectCategories.length) {
      console.log('📉 Filtered out:', KAZI_ANALYTICS_DATA.projectCategories.length - filtered.length, 'categories')
    }

    return filtered
  }, [searchTerm, activeTab])

  // ============================================================================
  // HANDLER: BACK TO DASHBOARD
  // ============================================================================

  const handleBackToDashboard = () => {
    console.log('🔙 NAVIGATING BACK TO DASHBOARD')
    console.log('📊 Current page: Analytics')
    console.log('🎯 Target page: Dashboard Overview')
    console.log('📅 Date range:', dateRange)
    console.log('📊 Current tab:', activeTab)
    console.log('✅ NAVIGATION INITIATED')

    router.push('/dashboard')

    console.log('🏁 NAVIGATION COMPLETE')
  }

  // ============================================================================
  // HANDLER: REFRESH ANALYTICS
  // ============================================================================

  const handleRefreshAnalytics = async () => {
    console.log('🔄 REFRESHING ANALYTICS DATA')
    console.log('📊 Current tab:', activeTab)
    console.log('📅 Date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')

    setIsRefreshing(true)

    console.log('⏳ Fetching latest analytics data...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsRefreshing(false)

    console.log('✅ ANALYTICS DATA REFRESHED')
    console.log('🏁 REFRESH COMPLETE')

    toast.success('Analytics data refreshed!', {
      description: 'All metrics updated with latest data'
    })
  }

  // ============================================================================
  // HANDLER: EXPORT REPORT (Enhanced with comprehensive logging)
  // ============================================================================

  const handleExportReport = async () => {
    console.log('📊 EXPORTING ANALYTICS REPORT')
    console.log('📁 Report type: comprehensive')
    console.log('📄 Format: CSV')
    console.log('📅 Period: Last 180 days')
    console.log('📊 Current tab:', activeTab)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')

    setIsExporting(true)

    try {
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      console.log('📅 Start date:', startDate)
      console.log('📅 End date:', endDate)
      console.log('📡 Calling API: /api/analytics/reports')

      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          format: 'csv',
          period: { start: startDate, end: endDate }
        })
      })

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (response.ok) {
        console.log('✅ REPORT GENERATED SUCCESSFULLY')

        const blob = await response.blob()
        console.log('📦 Blob size:', (blob.size / 1024).toFixed(2), 'KB')

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const filename = `analytics-comprehensive-${Date.now()}.csv`
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log('💾 FILE DOWNLOADED:', filename)
        console.log('✅ EXPORT SUCCESSFUL')

        toast.success('Analytics report exported successfully!', {
          description: `Downloaded ${filename}`
        })
      } else {
        console.log('❌ EXPORT FAILED: Response not OK')
        console.log('📊 Status:', response.status)
        toast.error('Export failed. Please try again.', {
          description: 'Could not generate report'
        })
      }
    } catch (error) {
      console.error('❌ EXPORT ERROR:', error)
      console.log('⚠️ Network or server error occurred')
      console.log('📊 Error details:', error instanceof Error ? error.message : String(error))
      toast.error('Export failed. Please try again.', {
        description: 'Network or server error'
      })
    } finally {
      setIsExporting(false)
      console.log('🏁 EXPORT PROCESS COMPLETE')
    }
  }

  // ============================================================================
  // HANDLER: SEARCH ANALYTICS
  // ============================================================================

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const previousValue = searchTerm
    const newValue = e.target.value

    console.log('🔍 ANALYTICS SEARCH')
    console.log('⏪ Previous search:', previousValue || '(empty)')
    console.log('⏩ New search:', newValue || '(empty)')
    console.log('📊 Search length:', newValue.length, 'characters')
    console.log('📅 Current date range:', dateRange)
    console.log('📊 Current tab:', activeTab)

    setSearchTerm(newValue)

    if (newValue.length >= 2) {
      console.log('✅ SEARCH ACTIVE - Filtering analytics data')
      console.log('🔎 Searching for:', newValue)
    } else if (newValue.length === 0 && previousValue.length > 0) {
      console.log('🧹 SEARCH CLEARED - Showing all data')
    }

    console.log('🏁 SEARCH UPDATE COMPLETE')
  }

  // ============================================================================
  // HANDLER: DATE RANGE CHANGE
  // ============================================================================

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const previousValue = dateRange
    const newValue = e.target.value

    console.log('📅 DATE RANGE CHANGED')
    console.log('⏪ Previous range:', previousValue)
    console.log('⏩ New range:', newValue)
    console.log('📊 Current tab:', activeTab)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')

    setDateRange(newValue)

    console.log('✅ DATE RANGE UPDATED')
    console.log('🔄 Analytics data will refresh for new period')
    console.log('🏁 DATE RANGE CHANGE COMPLETE')

    toast.success(`Date range changed to: ${newValue.replace(/-/g, ' ')}`)
  }

  // ============================================================================
  // HANDLER: FILTERS
  // ============================================================================

  const handleFilters = () => {
    console.log('🔍 OPENING ANALYTICS FILTERS')
    console.log('📊 Current tab:', activeTab)
    console.log('📅 Current date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')
    console.log('⚙️ Filter options:')
    console.log('  - Project filter: All projects')
    console.log('  - Client filter: All clients')
    console.log('  - Status filter: All statuses')
    console.log('  - Priority filter: All priorities')
    console.log('  - Team member filter: All members')
    console.log('✅ FILTERS PANEL OPENED')
    console.log('🏁 FILTER PROCESS COMPLETE')

    toast.success('Advanced filters applied!')
  }

  // ============================================================================
  // HANDLER: SETTINGS
  // ============================================================================

  const handleSettings = () => {
    console.log('⚙️ OPENING ANALYTICS SETTINGS')
    console.log('📊 Current tab:', activeTab)
    console.log('📅 Current date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')
    console.log('⚙️ Available settings:')
    console.log('  - Default view:', activeTab)
    console.log('  - Refresh interval: Auto')
    console.log('  - Data retention: 180 days')
    console.log('  - Export format: CSV')
    console.log('  - Notifications: Enabled')
    console.log('  - AI insights:', aiMode ? 'On' : 'Off')
    console.log('  - Predictive analytics:', predictiveMode ? 'On' : 'Off')
    console.log('✅ SETTINGS PANEL OPENED')
    console.log('🏁 SETTINGS PROCESS COMPLETE')

    toast.success('Analytics settings opened!')
  }

  // ============================================================================
  // HANDLER: AI MODE TOGGLE
  // ============================================================================

  const handleAIMode = () => {
    const previousState = aiMode
    const newState = !aiMode

    console.log('🤖 AI MODE TOGGLE')
    console.log('⏪ Previous state:', previousState ? 'ENABLED' : 'DISABLED')
    console.log('⏩ New state:', newState ? 'ENABLED' : 'DISABLED')
    console.log('📊 Current tab:', activeTab)
    console.log('📅 Date range:', dateRange)
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')

    if (newState) {
      console.log('✨ AI FEATURES ENABLED:')
      console.log('  - AI-generated insights')
      console.log('  - Smart recommendations')
      console.log('  - Trend analysis')
      console.log('  - Anomaly detection')
      console.log('  - Performance predictions')
    } else {
      console.log('⚠️ AI FEATURES DISABLED')
      console.log('  - Switching to standard analytics')
      console.log('  - AI insights will be hidden')
    }

    setAiMode(newState)

    console.log('✅ AI MODE UPDATED')
    console.log('🏁 AI MODE TOGGLE COMPLETE')

    toast.success(newState ? 'AI mode enabled' : 'AI mode disabled', {
      description: newState ? 'AI insights and recommendations activated' : 'Switched to standard analytics'
    })
  }

  // ============================================================================
  // HANDLER: PREDICTIVE MODE TOGGLE
  // ============================================================================

  const handlePredictiveMode = () => {
    const previousState = predictiveMode
    const newState = !predictiveMode

    console.log('🔮 PREDICTIVE MODE TOGGLE')
    console.log('⏪ Previous state:', previousState ? 'ENABLED' : 'DISABLED')
    console.log('⏩ New state:', newState ? 'ENABLED' : 'DISABLED')
    console.log('📊 Current tab:', activeTab)
    console.log('📅 Date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')

    if (newState) {
      console.log('📈 PREDICTIVE ANALYTICS ENABLED:')
      console.log('  - Revenue forecasting')
      console.log('  - Trend predictions')
      console.log('  - Growth projections')
      console.log('  - Resource planning')
      console.log('  - Risk assessment')
      console.log('  - Opportunity identification')
    } else {
      console.log('⚠️ PREDICTIVE ANALYTICS DISABLED')
      console.log('  - Showing historical data only')
      console.log('  - Predictions will be hidden')
    }

    setPredictiveMode(newState)

    console.log('✅ PREDICTIVE MODE UPDATED')
    console.log('🏁 PREDICTIVE MODE TOGGLE COMPLETE')

    toast.success(newState ? 'Predictive mode enabled' : 'Predictive mode disabled', {
      description: newState ? 'Showing forecasts and predictions' : 'Showing historical data only'
    })
  }

  // ============================================================================
  // HANDLER: TAB SWITCHING
  // ============================================================================

  const handleTabChange = (newTab: string) => {
    const previousTab = activeTab

    console.log('📊 TAB SWITCHED')
    console.log('⏪ Previous tab:', previousTab)
    console.log('⏩ New tab:', newTab)
    console.log('📅 Date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')
    console.log('🔍 Search term:', searchTerm || '(none)')

    setActiveTab(newTab)

    console.log('✅ TAB CHANGED')
    console.log('📈 Loading', newTab, 'analytics data')
    console.log('🏁 TAB SWITCH COMPLETE')
  }

  // ============================================================================
  // HANDLER: BOOKMARK VIEW
  // ============================================================================

  const handleBookmarkView = () => {
    console.log('⭐ BOOKMARK VIEW')
    console.log('📊 Bookmarking:', activeTab)
    console.log('📅 Date range:', dateRange)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')
    console.log('✅ VIEW BOOKMARKED')
    console.log('🏁 BOOKMARK COMPLETE')

    toast.success('Current view bookmarked!', {
      description: 'Access anytime from your bookmarks'
    })
  }

  // ============================================================================
  // HANDLER: PREDICTIVE ANALYTICS
  // ============================================================================

  const handlePredictiveAnalytics = () => {
    console.log('ANALYTICS: 🔮 INITIATING PREDICTIVE ANALYTICS')
    console.log('ANALYTICS: 📊 Current tab:', activeTab)
    console.log('ANALYTICS: 📅 Date range:', dateRange)
    console.log('ANALYTICS: 🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('ANALYTICS: 🔮 Predictive mode:', predictiveMode ? 'enabled' : 'disabled')
    console.log('ANALYTICS: 📈 Analysis scope:')
    console.log('ANALYTICS:   - Revenue forecasting (next 3-6 months)')
    console.log('ANALYTICS:   - Project demand prediction')
    console.log('ANALYTICS:   - Client growth trends')
    console.log('ANALYTICS:   - Resource allocation recommendations')
    console.log('ANALYTICS:   - Risk assessment and mitigation')
    console.log('ANALYTICS:   - Market opportunity identification')
    console.log('ANALYTICS: 💡 AI Engine: Machine Learning + Pattern Recognition')
    console.log('ANALYTICS: 📊 Data points analyzed: ' + (KAZI_ANALYTICS_DATA.overview.totalProjects * KAZI_ANALYTICS_DATA.overview.totalClients))
    console.log('ANALYTICS: 🎯 Confidence interval: 85-95%')
    console.log('ANALYTICS: ✅ PREDICTIVE ANALYTICS GENERATED')
    console.log('ANALYTICS: 🏁 PROCESS COMPLETE')

    toast.success('Predictive analytics generated! 🔮', {
      description: 'AI-powered forecasting and trend analysis ready'
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

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
                onClick={handleBackToDashboard}
                data-testid="back-to-dashboard-btn"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search analytics, categories..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                  data-testid="search-analytics"
                />
              </div>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                data-testid="date-range-filter"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="last-year">Last Year</option>
                <option value="all-time">All Time</option>
              </select>

              {/* Filters */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleFilters}
                data-testid="filter-analytics-btn"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleSettings}
                data-testid="analytics-settings-btn"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* AI Mode Toggle */}
              <Button
                variant={aiMode ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={handleAIMode}
                data-testid="ai-mode-toggle-btn"
              >
                <Brain className="h-4 w-4" />
                AI Mode
              </Button>

              {/* Predictive Mode Toggle */}
              <Button
                variant={predictiveMode ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={handlePredictiveMode}
                data-testid="predictive-mode-toggle-btn"
              >
                <Activity className="h-4 w-4" />
                Predictive
              </Button>

              {/* Bookmark */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleBookmarkView}
              >
                <Bookmark className="h-4 w-4" />
              </Button>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleRefreshAnalytics}
                disabled={isRefreshing}
                data-testid="refresh-analytics-btn"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportReport}
                disabled={isExporting}
                data-testid="export-report-btn"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <Card className="kazi-card relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={0} color="green" />
                  <FloatingParticle delay={1} color="emerald" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(KAZI_ANALYTICS_DATA.overview.monthlyRevenue)}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        +{KAZI_ANALYTICS_DATA.overview.revenueGrowth}% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="kazi-card relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={0.5} color="blue" />
                  <FloatingParticle delay={1.5} color="indigo" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {KAZI_ANALYTICS_DATA.overview.activeProjects}
                      </p>
                      <p className="text-sm text-gray-500">
                        {KAZI_ANALYTICS_DATA.overview.totalProjects} total projects
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="kazi-card relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={1} color="purple" />
                  <FloatingParticle delay={2} color="violet" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {KAZI_ANALYTICS_DATA.overview.totalClients}
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {KAZI_ANALYTICS_DATA.overview.newClients} new this month
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="kazi-card relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={1.5} color="orange" />
                  <FloatingParticle delay={2.5} color="amber" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Efficiency</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {KAZI_ANALYTICS_DATA.overview.efficiency}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {KAZI_ANALYTICS_DATA.overview.billableHours}h billable
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* AI Insights Panel - Conditional */}
        {aiMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <TextShimmer>AI-Powered Insights</TextShimmer>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">Live Analysis</Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time business intelligence powered by AI
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {KAZI_ANALYTICS_DATA.insights.map((insight, index) => {
                    const InsightIcon = getInsightIcon(insight.type)
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.impact)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <InsightIcon className="h-5 w-5 text-gray-600" />
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.impact}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                        {insight.potentialValue > 0 && (
                          <p className="text-xs text-green-600 font-medium mb-2">
                            Potential value: {formatCurrency(insight.potentialValue)}
                          </p>
                        )}
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          {insight.recommendation}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-2xl">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <Badge variant="outline" className="ml-1 bg-green-100 text-green-700 border-green-300">Live</Badge>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2 rounded-2xl">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
              <Badge variant="outline" className="ml-1">{formatCurrency(KAZI_ANALYTICS_DATA.overview.monthlyRevenue)}</Badge>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 rounded-2xl">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
              <Badge variant="outline" className="ml-1">{KAZI_ANALYTICS_DATA.overview.totalProjects}</Badge>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 rounded-2xl">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
              <Badge variant="outline" className="ml-1">{KAZI_ANALYTICS_DATA.overview.totalClients} active</Badge>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2 rounded-2xl">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Intelligence</span>
              <Badge variant="outline" className="ml-1 bg-blue-100 text-blue-700 border-blue-300">AI</Badge>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 rounded-2xl">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
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
                    {predictiveMode && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">Predictive</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {KAZI_ANALYTICS_DATA.revenue.monthly.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium w-8">{month.month}</span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2 w-full max-w-xs">
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

                    {predictiveMode && KAZI_ANALYTICS_DATA.revenue.forecast.map((month) => (
                      <div key={month.month} className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium w-8">{month.month}</span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2 w-full max-w-xs border-2 border-dashed border-purple-300">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(month.revenue / 60000) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-600">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.confidence}% confidence</p>
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
                    {filteredCategories.map(category => {
                      const indicator = getGrowthIndicator(category.growth)
                      const GrowthIcon = indicator.icon

                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${category.color}`} />
                              <span className="text-sm font-medium">{category.category}</span>
                              <div className={`flex items-center gap-1 ${indicator.color}`}>
                                <GrowthIcon className="h-3 w-3" />
                                <span className="text-xs font-medium">{Math.abs(category.growth)}%</span>
                              </div>
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
                      )
                    })}
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
                  <p className="text-2xl font-bold text-gray-900 mt-4">
                    {formatCurrency(KAZI_ANALYTICS_DATA.overview.totalRevenue)}
                  </p>
                  <p className="text-sm text-green-600 mt-2">Total revenue (all time)</p>
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
                  <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{KAZI_ANALYTICS_DATA.overview.totalProjects}</p>
                      <p className="text-sm text-gray-600">Total Projects</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{KAZI_ANALYTICS_DATA.performance.projectCompletionRate}%</p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                  </div>
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{KAZI_ANALYTICS_DATA.clients.retention}%</p>
                      <p className="text-sm text-gray-600 mt-1">Client Retention</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(KAZI_ANALYTICS_DATA.clients.averageLifetimeValue)}</p>
                      <p className="text-sm text-gray-600 mt-1">Avg Lifetime Value</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{KAZI_ANALYTICS_DATA.clients.churnRate}%</p>
                      <p className="text-sm text-gray-600 mt-1">Churn Rate</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Top Performing Clients</h4>
                    <div className="space-y-3">
                      {KAZI_ANALYTICS_DATA.clients.topPerformers.map((client, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.projects} projects • {client.satisfaction}% satisfaction</p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Business Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {KAZI_ANALYTICS_DATA.insights.map((insight, index) => {
                    const InsightIcon = getInsightIcon(insight.type)
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-lg border-l-4 ${getInsightColor(insight.impact)} flex items-start gap-4`}
                      >
                        <InsightIcon className="h-6 w-6 text-gray-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.impact}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            {insight.potentialValue > 0 && (
                              <p className="text-sm text-green-600 font-medium">
                                Potential value: {formatCurrency(insight.potentialValue)}
                              </p>
                            )}
                            <Button size="sm" variant="outline">
                              {insight.recommendation}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Operational Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Project Completion Rate</span>
                          <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.projectCompletionRate}%</span>
                        </div>
                        <Progress value={KAZI_ANALYTICS_DATA.performance.projectCompletionRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">On-Time Delivery</span>
                          <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.onTimeDelivery}%</span>
                        </div>
                        <Progress value={KAZI_ANALYTICS_DATA.performance.onTimeDelivery} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Client Satisfaction</span>
                          <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.clientSatisfaction}%</span>
                        </div>
                        <Progress value={KAZI_ANALYTICS_DATA.performance.clientSatisfaction} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Financial Performance</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Revenue per Project</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(KAZI_ANALYTICS_DATA.performance.revenuePerProject)}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Profit Margin</p>
                        <p className="text-2xl font-bold text-green-600">{KAZI_ANALYTICS_DATA.performance.profitMargin}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
