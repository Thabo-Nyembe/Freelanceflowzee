"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import {
  PieChart,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Printer,
  Send,
  BarChart3,
  Activity
} from 'lucide-react'
import { MOCK_FINANCIAL_OVERVIEW, MOCK_TRANSACTIONS, MOCK_INVOICES } from '@/lib/financial-hub-utils'

const logger = createFeatureLogger('ReportsPage')

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  type: 'profit_loss' | 'cash_flow' | 'tax_summary' | 'expense_report' | 'revenue_analysis' | 'client_report'
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'profit_loss',
    name: 'Profit & Loss Statement',
    description: 'Comprehensive P&L report showing revenue, expenses, and net profit',
    icon: <PieChart className="h-6 w-6" />,
    color: 'text-emerald-600 bg-emerald-100',
    type: 'profit_loss'
  },
  {
    id: 'cash_flow',
    name: 'Cash Flow Report',
    description: 'Track cash inflows and outflows over time',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-blue-600 bg-blue-100',
    type: 'cash_flow'
  },
  {
    id: 'tax_summary',
    name: 'Tax Summary',
    description: 'Quarterly tax estimates and deductions overview',
    icon: <FileText className="h-6 w-6" />,
    color: 'text-purple-600 bg-purple-100',
    type: 'tax_summary'
  },
  {
    id: 'expense_report',
    name: 'Expense Report',
    description: 'Detailed breakdown of all business expenses by category',
    icon: <DollarSign className="h-6 w-6" />,
    color: 'text-red-600 bg-red-100',
    type: 'expense_report'
  },
  {
    id: 'revenue_analysis',
    name: 'Revenue Analysis',
    description: 'Revenue trends, client breakdown, and growth metrics',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'text-teal-600 bg-teal-100',
    type: 'revenue_analysis'
  },
  {
    id: 'client_report',
    name: 'Client Performance Report',
    description: 'Client profitability, payment history, and project metrics',
    icon: <Activity className="h-6 w-6" />,
    color: 'text-orange-600 bg-orange-100',
    type: 'client_report'
  }
]

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  useEffect(() => {
    loadReportsData()
    initializeDates()
  }, [])

  const initializeDates = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    setStartDate(firstDayOfMonth.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }

  const loadReportsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading reports data')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setIsLoading(false)
      logger.info('Reports data loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports data'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load reports data', { error: err })
    }
  }

  const handleGenerateReport = async (template: ReportTemplate, format: 'pdf' | 'csv') => {
    logger.info('Generate report initiated', {
      reportType: template.type,
      format,
      dateRange: { startDate, endDate }
    })

    setGeneratingReport(template.id)

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: template.type,
          format,
          period: {
            start: startDate,
            end: endDate
          },
          options: {
            includeCharts: format === 'pdf',
            groupByCategory: true
          }
        })
      })

      if (!response.ok) throw new Error('Report generation failed')

      // Handle different response types
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.type}-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('Report downloaded', {
          description: `${template.name} exported as ${format.toUpperCase()}`
        })
      } else {
        const result = await response.json()

        if (result.success && result.downloadUrl) {
          window.open(result.downloadUrl, '_blank')
          toast.success('Report generated', {
            description: `${template.name} is ready`
          })
        }
      }

      logger.info('Report generated successfully', {
        reportType: template.type,
        format
      })
    } catch (error: any) {
      logger.error('Report generation failed', {
        error,
        reportType: template.type,
        format
      })
      toast.error('Report generation failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setGeneratingReport(null)
    }
  }

  const handlePrintReport = async (template: ReportTemplate) => {
    logger.info('Print report initiated', { reportType: template.type })

    try {
      // Generate report data
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: template.type,
          format: 'html',
          period: { start: startDate, end: endDate }
        })
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const result = await response.json()

      // In production, would open print-friendly view
      toast.success('Opening print preview', {
        description: template.name
      })

      logger.info('Print report prepared', { reportType: template.type })
    } catch (error: any) {
      logger.error('Print failed', { error, reportType: template.type })
      toast.error('Print failed', { description: error.message })
    }
  }

  const handleEmailReport = async (template: ReportTemplate) => {
    logger.info('Email report initiated', { reportType: template.type })

    try {
      const response = await fetch('/api/financial/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: template.type,
          period: { start: startDate, end: endDate },
          recipient: 'user@example.com' // In production, would get from user settings
        })
      })

      if (!response.ok) throw new Error('Failed to email report')

      toast.success('Report emailed', {
        description: `${template.name} sent to your email`
      })

      logger.info('Report emailed successfully', { reportType: template.type })
    } catch (error: any) {
      logger.error('Email failed', { error, reportType: template.type })
      toast.error('Email failed', { description: error.message })
    }
  }

  const handleQuickReport = async (reportType: string) => {
    logger.info('Quick report generated', { reportType })

    const reportData = {
      profit_loss: {
        revenue: MOCK_FINANCIAL_OVERVIEW.totalRevenue,
        expenses: MOCK_FINANCIAL_OVERVIEW.totalExpenses,
        netProfit: MOCK_FINANCIAL_OVERVIEW.netProfit,
        profitMargin: MOCK_FINANCIAL_OVERVIEW.profitMargin
      },
      cash_flow: {
        inflows: MOCK_FINANCIAL_OVERVIEW.totalRevenue,
        outflows: MOCK_FINANCIAL_OVERVIEW.totalExpenses,
        netCashFlow: MOCK_FINANCIAL_OVERVIEW.cashFlow
      },
      tax_summary: {
        quarterlyEstimate: 18750,
        yearToDate: 45600,
        deductions: 11400
      }
    }

    const data = reportData[reportType as keyof typeof reportData]

    if (data) {
      toast.success(`${reportType.replace('_', ' ')} Report Generated`, {
        description: JSON.stringify(data, null, 2)
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: loadReportsData
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
          <CardDescription>Select date range for report generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                  setStartDate(firstDayOfMonth.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
                  setStartDate(firstDayOfYear.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                }}
              >
                This Year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleGenerateReport(template, 'pdf')}
                      disabled={generatingReport === template.id}
                    >
                      {generatingReport === template.id ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGenerateReport(template, 'csv')}
                      disabled={generatingReport === template.id}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePrintReport(template)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEmailReport(template)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Financial Stats</CardTitle>
          <CardDescription>Current period summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${MOCK_FINANCIAL_OVERVIEW.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => handleQuickReport('profit_loss')}
              >
                View Details →
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${MOCK_FINANCIAL_OVERVIEW.totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => handleQuickReport('profit_loss')}
              >
                View Details →
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${MOCK_FINANCIAL_OVERVIEW.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => handleQuickReport('profit_loss')}
              >
                View Details →
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Growth</p>
                  <p className="text-2xl font-bold text-purple-600">
                    +{MOCK_FINANCIAL_OVERVIEW.monthlyGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => handleQuickReport('cash_flow')}
              >
                View Details →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Generation Tips</CardTitle>
          <CardDescription>Get the most out of your financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg border-emerald-200 bg-emerald-50">
              <h4 className="font-semibold text-emerald-900 mb-2">Best Practices</h4>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li>• Generate reports monthly for consistent tracking</li>
                <li>• Use PDF format for formal documentation</li>
                <li>• CSV format is best for data analysis</li>
                <li>• Keep reports for tax purposes (7 years)</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2">Report Scheduling</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• P&L: Monthly or quarterly</li>
                <li>• Cash Flow: Weekly or monthly</li>
                <li>• Tax Summary: Quarterly</li>
                <li>• Expense Report: Monthly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
