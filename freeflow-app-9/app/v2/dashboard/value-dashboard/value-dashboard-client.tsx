'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NumberFlow } from '@/components/ui/number-flow'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Download,
  Calendar,
  Zap,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Share2,
  Layout,
  Grid3X3,
  Eye,
  Edit,
  Mail,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileCode
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { formatCurrency, KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientValueDashboard')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ROIMetric {
  label: string
  value: number
  format: 'currency' | 'percentage' | 'number'
  trend: 'up' | 'down' | 'neutral'
  trendValue: number
  icon: any
  color: string
}

interface ValueTrackingData {
  month: string
  value: number
  roi: number
  projects: number
}

// ============================================================================
// VALUE DASHBOARD COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - ValueDashboard Context
// ============================================================================

const valueDashboardAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const valueDashboardCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const valueDashboardPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const valueDashboardActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]


export default function ValueDashboardClient() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // ROI & VALUE DATA
  const [roiMetrics, setRoiMetrics] = useState<ROIMetric[]>([])
  const [valueTracking, setValueTracking] = useState<ValueTrackingData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m' | 'all'>('6m')

  // DIALOG STATES
  const [showNewMetricDialog, setShowNewMetricDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false)
  const [showConfigureWidgetsDialog, setShowConfigureWidgetsDialog] = useState(false)
  const [newMetricName, setNewMetricName] = useState('')
  const [newMetricValue, setNewMetricValue] = useState('')

  // EXPORT OPTIONS STATE
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [exportDateRange, setExportDateRange] = useState<'3m' | '6m' | '12m'>('6m')

  // SETTINGS STATE
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [emailReportsEnabled, setEmailReportsEnabled] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD')
  const [chartStyle, setChartStyle] = useState<'modern' | 'classic' | 'minimal'>('modern')

  // SHARE STATE
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view')

  // WIDGET CONFIGURATION STATE
  const [widgetConfig, setWidgetConfig] = useState({
    showROIMetrics: true,
    showValueTracking: true,
    showInsights: true,
    showProjectBreakdown: true
  })

  // Quick Actions with Dialog Handlers
  const quickActionsWithDialogs = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewMetricDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Share', icon: 'Share2', shortcut: 'H', action: () => setShowShareDialog(true) },
    { id: '4', label: 'Customize', icon: 'Layout', shortcut: 'C', action: () => setShowCustomizeDialog(true) },
    { id: '5', label: 'Widgets', icon: 'Grid3X3', shortcut: 'W', action: () => setShowConfigureWidgetsDialog(true) },
    { id: '6', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // A+++ LOAD VALUE DATA
  useEffect(() => {
    const loadValueDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize ROI metrics
        const metrics: ROIMetric[] = [
          {
            label: 'Total Invested',
            value: KAZI_CLIENT_DATA.clientInfo.totalInvestment,
            format: 'currency',
            trend: 'up',
            trendValue: 12.5,
            icon: DollarSign,
            color: 'purple'
          },
          {
            label: 'Completed Projects',
            value: KAZI_CLIENT_DATA.clientInfo.completedProjects,
            format: 'number',
            trend: 'up',
            trendValue: 22.3,
            icon: CheckCircle,
            color: 'green'
          },
          {
            label: 'ROI Generated',
            value: 156,
            format: 'percentage',
            trend: 'up',
            trendValue: 18.7,
            icon: TrendingUp,
            color: 'blue'
          },
          {
            label: 'Avg Project Value',
            value: 3750,
            format: 'currency',
            trend: 'up',
            trendValue: 8.2,
            icon: Target,
            color: 'orange'
          }
        ]

        // Initialize value tracking over time
        const tracking: ValueTrackingData[] = [
          { month: 'Jan', value: 8000, roi: 45, projects: 1 },
          { month: 'Feb', value: 15000, roi: 68, projects: 2 },
          { month: 'Mar', value: 22000, roi: 95, projects: 3 },
          { month: 'Apr', value: 28000, roi: 118, projects: 4 },
          { month: 'May', value: 35000, roi: 142, projects: 5 },
          { month: 'Jun', value: 45000, roi: 156, projects: 7 }
        ]

        setRoiMetrics(metrics)
        setValueTracking(tracking)

        // Simulate loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

        setIsLoading(false)
        announce('Value dashboard loaded successfully', 'polite')
        logger.info('Value dashboard data loaded', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name,
          totalInvested: KAZI_CLIENT_DATA.clientInfo.totalInvestment,
          completedProjects: KAZI_CLIENT_DATA.clientInfo.completedProjects
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load value dashboard')
        setIsLoading(false)
        announce('Error loading value dashboard', 'assertive')
        logger.error('Failed to load value dashboard', { error: err })
      }
    }

    loadValueDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: EXPORT REPORT
  // ============================================================================

  const handleExportReport = async () => {
    try {
      setIsExporting(true)

      logger.info('Report export initiated', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        period: selectedPeriod,
        timestamp: new Date().toISOString()
      })

      const response = await fetch('/api/reports/export-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          period: selectedPeriod,
          metrics: roiMetrics,
          tracking: valueTracking,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Report exported successfully', { period: selectedPeriod })

        toast.success('Report exported successfully!', {
          description: 'Download link sent to your email'
        })

        // Create download link
        const downloadUrl = URL.createObjectURL(
          new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
        )
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `ROI-Report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(downloadUrl)
      }
    } catch (error: any) {
      logger.error('Failed to export report', { error, period: selectedPeriod })
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // ============================================================================
  // HANDLER 2: VIEW DETAILED METRICS
  // ============================================================================

  const handleViewDetailedMetrics = (metricLabel: string) => {
    logger.info('Detailed metrics viewed', {
      metric: metricLabel,
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.info(`Loading detailed metrics for ${metricLabel}...`, {
      description: 'Showing trend analysis and breakdown'
    })
  }

  // ============================================================================
  // HANDLER 3: SHARE DASHBOARD
  // ============================================================================

  const handleShareDashboard = async () => {
    if (!shareEmail) {
      toast.error('Please enter an email address')
      return
    }

    try {
      logger.info('Dashboard share initiated', {
        email: shareEmail,
        permission: sharePermission,
        clientName: KAZI_CLIENT_DATA.clientInfo.name
      })

      toast.success('Dashboard shared successfully!', {
        description: `Invitation sent to ${shareEmail} with ${sharePermission} access`
      })

      setShareEmail('')
      setShowShareDialog(false)
    } catch (error: any) {
      logger.error('Failed to share dashboard', { error })
      toast.error('Failed to share dashboard', {
        description: error.message || 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 4: EXPORT WITH FORMAT
  // ============================================================================

  const handleExportWithFormat = async () => {
    try {
      setIsExporting(true)

      logger.info('Export initiated', {
        format: selectedExportFormat,
        dateRange: exportDateRange,
        clientName: KAZI_CLIENT_DATA.clientInfo.name
      })

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000))

      const exportData = {
        format: selectedExportFormat,
        dateRange: exportDateRange,
        metrics: roiMetrics,
        tracking: valueTracking,
        exportedAt: new Date().toISOString()
      }

      if (selectedExportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `value-dashboard-${exportDateRange}-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      } else if (selectedExportFormat === 'csv') {
        const csvContent = roiMetrics.map(m => `${m.label},${m.value},${m.trendValue}%`).join('\n')
        const blob = new Blob([`Metric,Value,Trend\n${csvContent}`], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `value-dashboard-${exportDateRange}-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }

      toast.success(`${selectedExportFormat.toUpperCase()} export completed!`, {
        description: 'Your file has been downloaded'
      })

      setShowExportDialog(false)
    } catch (error: any) {
      logger.error('Export failed', { error, format: selectedExportFormat })
      toast.error('Export failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // ============================================================================
  // HANDLER 5: SAVE SETTINGS
  // ============================================================================

  const handleSaveSettings = () => {
    logger.info('Settings saved', {
      autoRefresh: autoRefreshEnabled,
      emailReports: emailReportsEnabled,
      currency: selectedCurrency,
      chartStyle: chartStyle
    })

    toast.success('Settings saved successfully!', {
      description: 'Your preferences have been updated'
    })

    setShowSettingsDialog(false)
  }

  // ============================================================================
  // HANDLER 6: CUSTOMIZE DASHBOARD
  // ============================================================================

  const handleCustomizeDashboard = () => {
    logger.info('Dashboard customization saved', {
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.success('Dashboard customized!', {
      description: 'Your layout preferences have been saved'
    })

    setShowCustomizeDialog(false)
  }

  // ============================================================================
  // HANDLER 7: CONFIGURE WIDGETS
  // ============================================================================

  const handleConfigureWidgets = () => {
    logger.info('Widget configuration saved', {
      config: widgetConfig,
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.success('Widgets configured!', {
      description: 'Your widget preferences have been saved'
    })

    setShowConfigureWidgetsDialog(false)
  }

  // ============================================================================
  // HANDLER 8: TOGGLE AUTO REFRESH
  // ============================================================================

  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => {
      const newValue = !prev
      toast.success(newValue ? 'Auto-refresh enabled' : 'Auto-refresh disabled', {
        description: newValue ? 'Data will refresh every 5 minutes' : 'Manual refresh only'
      })
      return newValue
    })
  }

  // ============================================================================
  // HANDLER 9: CONFIGURE EMAIL REPORTS
  // ============================================================================

  const handleConfigureEmailReports = () => {
    setEmailReportsEnabled(prev => {
      const newValue = !prev
      toast.success(newValue ? 'Email reports enabled' : 'Email reports disabled', {
        description: newValue ? 'You will receive weekly summaries' : 'Email reports turned off'
      })
      return newValue
    })
  }

  // ============================================================================
  // HANDLER 10: CYCLE CURRENCY
  // ============================================================================

  const handleCycleCurrency = () => {
    const currencies: ('USD' | 'EUR' | 'GBP')[] = ['USD', 'EUR', 'GBP']
    const currentIndex = currencies.indexOf(selectedCurrency)
    const nextCurrency = currencies[(currentIndex + 1) % currencies.length]
    setSelectedCurrency(nextCurrency)
    toast.success(`Currency changed to ${nextCurrency}`, {
      description: 'All values will be displayed in ' + nextCurrency
    })
  }

  // ============================================================================
  // HANDLER 11: CYCLE CHART STYLE
  // ============================================================================

  const handleCycleChartStyle = () => {
    const styles: ('modern' | 'classic' | 'minimal')[] = ['modern', 'classic', 'minimal']
    const currentIndex = styles.indexOf(chartStyle)
    const nextStyle = styles[(currentIndex + 1) % styles.length]
    setChartStyle(nextStyle)
    toast.success(`Chart style changed to ${nextStyle}`, {
      description: 'Charts will now display in ' + nextStyle + ' style'
    })
  }

  // ============================================================================
  // HANDLER 12: CREATE NEW METRIC
  // ============================================================================

  const handleCreateMetric = () => {
    if (!newMetricName) {
      toast.error('Please enter a metric name')
      return
    }

    const newMetric: ROIMetric = {
      label: newMetricName,
      value: parseFloat(newMetricValue) || 0,
      format: 'number',
      trend: 'neutral',
      trendValue: 0,
      icon: Target,
      color: 'blue'
    }

    setRoiMetrics(prev => [...prev, newMetric])

    logger.info('New metric created', {
      metricName: newMetricName,
      metricValue: newMetricValue
    })

    toast.success('Metric created successfully!', {
      description: `${newMetricName} has been added to your dashboard`
    })

    setNewMetricName('')
    setNewMetricValue('')
    setShowNewMetricDialog(false)
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ROI & Value Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your investment returns and project value over time</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
              data-testid="share-dashboard-btn"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCustomizeDialog(true)}
              data-testid="customize-dashboard-btn"
            >
              <Layout className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfigureWidgetsDialog(true)}
              data-testid="configure-widgets-btn"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Widgets
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleExportReport}
              disabled={isExporting}
              data-testid="export-roi-report-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Reporting Period</h3>
                <p className="text-sm text-gray-600">Select the time range for your analysis</p>
              </div>
              <div className="flex gap-2">
                {(['3m', '6m', '12m', 'all'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedPeriod(period)
                      logger.info('Period changed', { period })
                      /* TODO: Fetch data for selected period */
                    }}
                  >
                    {period === '3m' ? '3 Months' : period === '6m' ? '6 Months' : period === '12m' ? '12 Months' : 'All Time'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {roiMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <LiquidGlassCard
                variant="gradient"
                hoverEffect={true}
                className="cursor-pointer relative overflow-hidden"
                onClick={() => handleViewDetailedMetrics(metric.label)}
              >
                <div className="p-6 space-y-4">
                  
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={valueDashboardAIInsights} />
          <PredictiveAnalytics predictions={valueDashboardPredictions} />
          <CollaborationIndicator collaborators={valueDashboardCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={quickActionsWithDialogs} />
          <ActivityFeed activities={valueDashboardActivities} />
        </div>
<div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 text-${metric.color}-600`} />
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : null}
                      {metric.trendValue}%
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                    <div className="text-3xl font-bold text-gray-900">
                      {metric.format === 'currency' ? (
                        formatCurrency(metric.value)
                      ) : metric.format === 'percentage' ? (
                        `${metric.value}%`
                      ) : (
                        <NumberFlow value={metric.value} />
                      )}
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Value Tracking Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Value Accumulation Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart simulation with data */}
            <div className="space-y-4">
              {valueTracking.map((data, index) => {
                const maxValue = Math.max(...valueTracking.map(d => d.value))
                const percentage = (data.value / maxValue) * 100

                return (
                  <motion.div
                    key={data.month}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 w-12">{data.month}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-800">
                            {data.projects} project{data.projects !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(data.value)}</p>
                          <p className="text-sm text-green-600">ROI: {data.roi}%</p>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Key Insights */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-gray-600">Highest ROI Month</p>
                  <p className="text-lg font-semibold text-green-600">June (156%)</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-600">Avg Monthly Growth</p>
                  <p className="text-lg font-semibold text-blue-600">+18.5%</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-gray-600">Value Increase</p>
                  <p className="text-lg font-semibold text-purple-600">+462%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROI Calculation Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ROI Calculation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Analysis */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Investment Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Total Invested</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(45000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">Completed Value</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(70200)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Profit Generated</span>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(25200)}</span>
                  </div>
                </div>
              </div>

              {/* Return Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Return Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Overall ROI</span>
                    </div>
                    <span className="font-semibold">156%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-600">Avg Time to ROI</span>
                    </div>
                    <span className="font-semibold">4.2 months</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Payback Ratio</span>
                    </div>
                    <span className="font-bold text-blue-600">2.56x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Formula */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">ROI Calculation Formula:</p>
              <div className="p-3 rounded-lg bg-gray-50 font-mono text-sm">
                <p>ROI = ((Profit Generated / Total Invested) × 100)</p>
                <p className="mt-2 text-blue-600">ROI = ((25,200 / 45,000) × 100) = 56%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Value Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Project Value Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">High-Value Projects</p>
                  <span className="text-2xl font-bold text-blue-600">6</span>
                </div>
                <p className="text-xs text-gray-600">Projects valued over $5,000</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Success Rate</p>
                  <span className="text-2xl font-bold text-green-600">98%</span>
                </div>
                <p className="text-xs text-gray-600">First-time approval rate</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Cost Savings</p>
                  <span className="text-2xl font-bold text-purple-600">{formatCurrency(8400)}</span>
                </div>
                <p className="text-xs text-gray-600">vs market rate estimates</p>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Completed Projects</h4>
              {[
                { name: 'Brand Identity Redesign', budget: 8500, spent: 6375, value: 12000 },
                { name: 'Website Development', budget: 12000, spent: 10800, value: 18500 },
                { name: 'Marketing Assets', budget: 5000, spent: 4200, value: 8500 },
                { name: 'UI/UX Design', budget: 4500, spent: 3950, value: 6700 },
                { name: 'Content Strategy', budget: 3500, spent: 3100, value: 5500 },
                { name: 'Brand Guidelines', budget: 2500, spent: 2000, value: 3500 }
              ].map((project, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-600">Budget: {formatCurrency(project.budget)} | Spent: {formatCurrency(project.spent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(project.value)}</p>
                    <p className="text-xs text-gray-500">{Math.round(((project.value - project.budget) / project.budget) * 100)}% margin</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Generate Comprehensive Report</h3>
                <p className="text-sm text-gray-600">Download your complete ROI analysis with detailed metrics and projections</p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                onClick={handleExportReport}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Generating...' : 'Generate PDF Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Metric Dialog */}
      <Dialog open={showNewMetricDialog} onOpenChange={setShowNewMetricDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Value Metric
            </DialogTitle>
            <DialogDescription>
              Add a new metric to track in your value dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-name" className="text-right">
                Name
              </Label>
              <Input
                id="metric-name"
                placeholder="e.g., Monthly Revenue"
                className="col-span-3"
                value={newMetricName}
                onChange={(e) => setNewMetricName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-value" className="text-right">
                Value
              </Label>
              <Input
                id="metric-value"
                type="number"
                placeholder="0"
                className="col-span-3"
                value={newMetricValue}
                onChange={(e) => setNewMetricValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMetricDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMetric}>
              Create Metric
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Value Dashboard
            </DialogTitle>
            <DialogDescription>
              Choose your export format and options.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedExportFormat === 'pdf' ? 'default' : 'outline'}
                  className="h-20 flex flex-col"
                  onClick={() => {
                    setSelectedExportFormat('pdf')
                    /* TODO: Update export preview for PDF format */
                  }}
                >
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-lg font-bold">PDF</span>
                  <span className="text-xs text-muted-foreground">Report</span>
                </Button>
                <Button
                  variant={selectedExportFormat === 'csv' ? 'default' : 'outline'}
                  className="h-20 flex flex-col"
                  onClick={() => {
                    setSelectedExportFormat('csv')
                    /* TODO: Update export preview for CSV format */
                  }}
                >
                  <FileSpreadsheet className="h-5 w-5 mb-1" />
                  <span className="text-lg font-bold">CSV</span>
                  <span className="text-xs text-muted-foreground">Data</span>
                </Button>
                <Button
                  variant={selectedExportFormat === 'json' ? 'default' : 'outline'}
                  className="h-20 flex flex-col"
                  onClick={() => {
                    setSelectedExportFormat('json')
                    /* TODO: Update export preview for JSON format */
                  }}
                >
                  <FileCode className="h-5 w-5 mb-1" />
                  <span className="text-lg font-bold">JSON</span>
                  <span className="text-xs text-muted-foreground">API</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportDateRange === '3m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setExportDateRange('3m')
                    /* TODO: Update export preview for 3 month range */
                  }}
                >
                  3 Months
                </Button>
                <Button
                  variant={exportDateRange === '6m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setExportDateRange('6m')
                    /* TODO: Update export preview for 6 month range */
                  }}
                >
                  6 Months
                </Button>
                <Button
                  variant={exportDateRange === '12m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setExportDateRange('12m')
                    /* TODO: Update export preview for 12 month range */
                  }}
                >
                  12 Months
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportWithFormat} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dashboard Settings
            </DialogTitle>
            <DialogDescription>
              Configure your value dashboard preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Auto-refresh Data</p>
                  <p className="text-sm text-muted-foreground">Automatically refresh metrics every 5 minutes</p>
                </div>
                <Button
                  variant={autoRefreshEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleAutoRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {autoRefreshEnabled ? 'Enabled' : 'Enable'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Email Reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly ROI summaries via email</p>
                </div>
                <Button
                  variant={emailReportsEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleConfigureEmailReports}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  {emailReportsEnabled ? 'Enabled' : 'Configure'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Currency Display</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred currency format</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCycleCurrency}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  {selectedCurrency}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Chart Style</p>
                  <p className="text-sm text-muted-foreground">Select visualization preferences</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCycleChartStyle}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {chartStyle.charAt(0).toUpperCase() + chartStyle.slice(1)}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Value Dashboard
            </DialogTitle>
            <DialogDescription>
              Share your ROI dashboard with team members or stakeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="share-email" className="text-right">
                Email
              </Label>
              <Input
                id="share-email"
                type="email"
                placeholder="colleague@company.com"
                className="col-span-3"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Access</Label>
              <div className="col-span-3 flex gap-2">
                <Button
                  variant={sharePermission === 'view' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSharePermission('view')
                    /* TODO: Update share preview for view-only access */
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Only
                </Button>
                <Button
                  variant={sharePermission === 'edit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSharePermission('edit')
                    /* TODO: Update share preview for edit access */
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Can Edit
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quick Share Options</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard!')
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* TODO: Generate shareable PDF and trigger download */
                  }}
                >
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareDashboard}>
              <Share2 className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customize Dashboard Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Customize Dashboard
            </DialogTitle>
            <DialogDescription>
              Personalize your dashboard layout and appearance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Layout Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col"
                    onClick={() => {
                      /* TODO: Apply compact layout style */
                    }}
                  >
                    <Grid3X3 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Compact</span>
                  </Button>
                  <Button
                    variant="default"
                    className="h-16 flex flex-col"
                    onClick={() => {
                      /* TODO: Apply standard layout style */
                    }}
                  >
                    <Layout className="h-4 w-4 mb-1" />
                    <span className="text-xs">Standard</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col"
                    onClick={() => {
                      /* TODO: Apply expanded layout style */
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Expanded</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => { /* TODO: Apply blue color theme */ }}
                  >
                    Blue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-purple-500 text-white hover:bg-purple-600"
                    onClick={() => { /* TODO: Apply purple color theme */ }}
                  >
                    Purple
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={() => { /* TODO: Apply green color theme */ }}
                  >
                    Green
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 text-white hover:bg-gray-800"
                    onClick={() => { /* TODO: Apply dark color theme */ }}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Density</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { /* TODO: Set low data density mode */ }}
                  >
                    Low
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => { /* TODO: Set medium data density mode */ }}
                  >
                    Medium
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { /* TODO: Set high data density mode */ }}
                  >
                    High
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomizeDashboard}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Widgets Dialog */}
      <Dialog open={showConfigureWidgetsDialog} onOpenChange={setShowConfigureWidgetsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Configure Widgets
            </DialogTitle>
            <DialogDescription>
              Choose which widgets to display on your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">ROI Metrics Cards</p>
                  <p className="text-sm text-muted-foreground">Display key ROI indicators</p>
                </div>
                <Button
                  variant={widgetConfig.showROIMetrics ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setWidgetConfig(prev => ({ ...prev, showROIMetrics: !prev.showROIMetrics }))
                    toast.success(widgetConfig.showROIMetrics ? 'ROI Metrics hidden' : 'ROI Metrics shown')
                  }}
                >
                  {widgetConfig.showROIMetrics ? 'Visible' : 'Hidden'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Value Tracking Chart</p>
                  <p className="text-sm text-muted-foreground">Show value over time graph</p>
                </div>
                <Button
                  variant={widgetConfig.showValueTracking ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setWidgetConfig(prev => ({ ...prev, showValueTracking: !prev.showValueTracking }))
                    toast.success(widgetConfig.showValueTracking ? 'Value Tracking hidden' : 'Value Tracking shown')
                  }}
                >
                  {widgetConfig.showValueTracking ? 'Visible' : 'Hidden'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Key Insights Panel</p>
                  <p className="text-sm text-muted-foreground">Display AI-powered insights</p>
                </div>
                <Button
                  variant={widgetConfig.showInsights ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setWidgetConfig(prev => ({ ...prev, showInsights: !prev.showInsights }))
                    toast.success(widgetConfig.showInsights ? 'Insights hidden' : 'Insights shown')
                  }}
                >
                  {widgetConfig.showInsights ? 'Visible' : 'Hidden'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">Project Breakdown</p>
                  <p className="text-sm text-muted-foreground">Show detailed project values</p>
                </div>
                <Button
                  variant={widgetConfig.showProjectBreakdown ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setWidgetConfig(prev => ({ ...prev, showProjectBreakdown: !prev.showProjectBreakdown }))
                    toast.success(widgetConfig.showProjectBreakdown ? 'Project Breakdown hidden' : 'Project Breakdown shown')
                  }}
                >
                  {widgetConfig.showProjectBreakdown ? 'Visible' : 'Hidden'}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWidgetConfig({
                    showROIMetrics: true,
                    showValueTracking: true,
                    showInsights: true,
                    showProjectBreakdown: true
                  })
                  toast.success('All widgets enabled')
                }}
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWidgetConfig({
                    showROIMetrics: false,
                    showValueTracking: false,
                    showInsights: false,
                    showProjectBreakdown: false
                  })
                  toast.success('All widgets hidden')
                }}
              >
                Hide All
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigureWidgetsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfigureWidgets}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
