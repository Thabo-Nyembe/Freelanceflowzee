'use client'

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
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Download,
  Calendar,
  Zap,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
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

export default function ValueDashboardPage() {
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
                      toast.success(`Showing ${period === 'all' ? 'all' : period} data`)
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Total Invested</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(45000)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Overall ROI</span>
                    </div>
                    <span className="font-semibold">156%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
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
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
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
    </div>
  )
}
