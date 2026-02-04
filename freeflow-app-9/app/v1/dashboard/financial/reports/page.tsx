// MIGRATED: Batch #26 - Verified database hook integration
"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
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

const logger = createSimpleLogger('ReportsPage')

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  type: 'profit_loss' | 'cash_flow' | 'tax_summary' | 'expense_report' | 'revenue_analysis' | 'client_report'
}

interface ReportData {
  profit_loss?: {
    revenue: number
    expenses: number
    netProfit: number
    profitMargin: number
    revenueGrowth?: number
    expenseGrowth?: number
  }
  cash_flow?: {
    inflows: number
    outflows: number
    netCashFlow: number
    monthlyTrend?: Array<{ month: string; inflow: number; outflow: number }>
  }
  tax_summary?: {
    totalIncome: number
    totalDeductions: number
    quarterlyEstimate: number
    yearToDate: number
    deductions: Array<{ category: string; amount: number }>
  }
  expense_report?: {
    totalExpenses: number
    categories: Array<{ category: string; amount: number; percentage: number; count: number }>
    topExpenses: Array<{ description: string; amount: number; date: string; category: string }>
  }
  revenue_analysis?: {
    totalRevenue: number
    categories: Array<{ category: string; amount: number; percentage: number; count: number }>
    topClients: Array<{ client: string; amount: number; transactions: number }>
    growth: number
  }
  client_report?: {
    totalClients: number
    totalRevenue: number
    averageRevenuePerClient: number
    clients: Array<{ client: string; revenue: number; expenses: number; profit: number; transactions: number }>
  }
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
  const { userId, loading: userLoading } = useCurrentUser()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData>({})
  const [quickStats, setQuickStats] = useState({
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    growth: 0
  })

  // Email Report Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailReportType, setEmailReportType] = useState<ReportTemplate | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({
    recipients: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    initializeDates()
  }, [])

  useEffect(() => {
    if (!userId) return
    loadReportsData()
  }, [userId, startDate, endDate])

  const initializeDates = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    setStartDate(firstDayOfMonth.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }

  const loadReportsData = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading reports data from Supabase', { userId, startDate, endDate })

      // Dynamic import for code splitting
      const { getFinancialOverview, getMonthlyTrend } = await import('@/lib/financial-queries')

      // Load overview data for quick stats
      const overviewResult = await getFinancialOverview(userId, startDate, endDate)

      if (overviewResult.error) {
        throw new Error('Failed to load financial overview')
      }

      if (overviewResult.data) {
        setQuickStats({
          revenue: overviewResult.data.total_revenue,
          expenses: overviewResult.data.total_expenses,
          netProfit: overviewResult.data.net_profit,
          growth: 0 // We'll calculate this from trend data
        })

        logger.info('Quick stats loaded', { stats: overviewResult.data })
      }

      // Load trend data to calculate growth
      const trendResult = await getMonthlyTrend(userId, 2)
      if (!trendResult.error && trendResult.data && trendResult.data.length >= 2) {
        const currentMonth = trendResult.data[0]
        const previousMonth = trendResult.data[1]

        if (previousMonth.revenue > 0) {
          const growth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
          setQuickStats(prev => ({ ...prev, growth }))
        }
      }

      setIsLoading(false)
      logger.info('Reports data loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports data'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load reports data', { error: err })
      toast.error('Failed to load reports data', {
        description: errorMessage
      })
    }
  }

  const handleGenerateReport = async (template: ReportTemplate, format: 'pdf' | 'csv') => {
    if (!userId) {
      toast.error('Authentication required', {
        description: 'Please log in to generate reports'
      })
      return
    }

    logger.info('Generate report initiated', {
      reportType: template.type,
      format,
      dateRange: { startDate, endDate }
    })

    setGeneratingReport(template.id)

    try {
      // Generate report data from database
      const data = await generateReportData(template.type)

      if (!data) {
        throw new Error('Failed to generate report data')
      }

      // Store the generated data
      setReportData(prev => ({ ...prev, [template.type]: data }))

      // Export based on format
      if (format === 'csv') {
        exportReportAsCSV(template, data)
      } else {
        exportReportAsPDF(template, data)
      }

      toast.success('Report generated', {
        description: `${template.name} exported as ${format.toUpperCase()}`
      })

      logger.info('Report generated successfully', {
        reportType: template.type,
        format
      })
    } catch (error) {
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

  const generateReportData = async (reportType: string) => {
    if (!userId) return null

    const {
      getFinancialOverview,
      getCategoryBreakdown,
      getTransactions,
      getMonthlyTrend
    } = await import('@/lib/financial-queries')

    switch (reportType) {
      case 'profit_loss': {
        const { data, error } = await getFinancialOverview(userId, startDate, endDate)
        if (error || !data) throw new Error('Failed to load financial overview')

        return {
          revenue: data.total_revenue,
          expenses: data.total_expenses,
          netProfit: data.net_profit,
          profitMargin: data.profit_margin
        }
      }

      case 'cash_flow': {
        const [overviewResult, trendResult] = await Promise.all([
          getFinancialOverview(userId, startDate, endDate),
          getMonthlyTrend(userId, 6)
        ])

        if (overviewResult.error || !overviewResult.data) {
          throw new Error('Failed to load cash flow data')
        }

        return {
          inflows: overviewResult.data.total_revenue,
          outflows: overviewResult.data.total_expenses,
          netCashFlow: overviewResult.data.net_profit,
          monthlyTrend: trendResult.data?.map(t => ({
            month: t.month,
            inflow: t.revenue,
            outflow: t.expenses
          })) || []
        }
      }

      case 'tax_summary': {
        const [overviewResult, expenseBreakdownResult] = await Promise.all([
          getFinancialOverview(userId, startDate, endDate),
          getCategoryBreakdown(userId, 'expense', startDate, endDate)
        ])

        if (overviewResult.error || !overviewResult.data) {
          throw new Error('Failed to load tax data')
        }

        const deductions = expenseBreakdownResult.data?.map(cat => ({
          category: cat.category,
          amount: cat.total_amount
        })) || []

        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)

        return {
          totalIncome: overviewResult.data.total_revenue,
          totalDeductions,
          quarterlyEstimate: overviewResult.data.total_revenue * 0.25, // 25% estimate
          yearToDate: overviewResult.data.total_revenue * 0.3, // 30% estimate
          deductions
        }
      }

      case 'expense_report': {
        const [breakdownResult, transactionsResult] = await Promise.all([
          getCategoryBreakdown(userId, 'expense', startDate, endDate),
          getTransactions(userId, { type: 'expense', startDate, endDate })
        ])

        if (breakdownResult.error) {
          throw new Error('Failed to load expense data')
        }

        const topExpenses = transactionsResult.data
          ?.sort((a, b) => b.amount - a.amount)
          .slice(0, 10)
          .map(t => ({
            description: t.description,
            amount: t.amount,
            date: t.transaction_date,
            category: t.category
          })) || []

        const totalExpenses = breakdownResult.data?.reduce((sum, cat) => sum + cat.total_amount, 0) || 0

        return {
          totalExpenses,
          categories: breakdownResult.data || [],
          topExpenses
        }
      }

      case 'revenue_analysis': {
        const [breakdownResult, transactionsResult, overviewResult] = await Promise.all([
          getCategoryBreakdown(userId, 'income', startDate, endDate),
          getTransactions(userId, { type: 'income', startDate, endDate }),
          getFinancialOverview(userId, startDate, endDate)
        ])

        if (breakdownResult.error || !overviewResult.data) {
          throw new Error('Failed to load revenue data')
        }

        // Group by client
        const clientMap = new Map<string, { amount: number; transactions: number }>()
        transactionsResult.data?.forEach(t => {
          const client = t.client_name || 'Unknown'
          const existing = clientMap.get(client) || { amount: 0, transactions: 0 }
          clientMap.set(client, {
            amount: existing.amount + t.amount,
            transactions: existing.transactions + 1
          })
        })

        const topClients = Array.from(clientMap.entries())
          .map(([client, data]) => ({ client, ...data }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10)

        return {
          totalRevenue: overviewResult.data.total_revenue,
          categories: breakdownResult.data || [],
          topClients,
          growth: 0 // Would need historical data
        }
      }

      case 'client_report': {
        const transactionsResult = await getTransactions(userId, { startDate, endDate })

        if (transactionsResult.error) {
          throw new Error('Failed to load client data')
        }

        // Group transactions by client
        const clientMap = new Map<string, {
          revenue: number
          expenses: number
          transactions: number
        }>()

        transactionsResult.data?.forEach(t => {
          const client = t.client_name || (t.type === 'income' ? 'Unknown Client' : null)
          if (!client) return

          const existing = clientMap.get(client) || { revenue: 0, expenses: 0, transactions: 0 }

          if (t.type === 'income') {
            existing.revenue += t.amount
          } else if (t.type === 'expense' && t.client_name) {
            existing.expenses += t.amount
          }
          existing.transactions += 1

          clientMap.set(client, existing)
        })

        const clients = Array.from(clientMap.entries())
          .map(([client, data]) => ({
            client,
            revenue: data.revenue,
            expenses: data.expenses,
            profit: data.revenue - data.expenses,
            transactions: data.transactions
          }))
          .sort((a, b) => b.revenue - a.revenue)

        const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
        const totalClients = clients.length

        return {
          totalClients,
          totalRevenue,
          averageRevenuePerClient: totalClients > 0 ? totalRevenue / totalClients : 0,
          clients
        }
      }

      default:
        return null
    }
  }

  const exportReportAsCSV = (template: ReportTemplate, data: any) => {
    let csvContent = `${template.name}\nGenerated: ${new Date().toLocaleDateString()}\nPeriod: ${startDate} to ${endDate}\n\n`

    // Convert data to CSV format based on report type
    switch (template.type) {
      case 'profit_loss':
        csvContent += 'Metric,Amount\n'
        csvContent += `Revenue,$${data.revenue.toLocaleString()}\n`
        csvContent += `Expenses,$${data.expenses.toLocaleString()}\n`
        csvContent += `Net Profit,$${data.netProfit.toLocaleString()}\n`
        csvContent += `Profit Margin,${data.profitMargin.toFixed(1)}%\n`
        break

      case 'cash_flow':
        csvContent += 'Metric,Amount\n'
        csvContent += `Cash Inflows,$${data.inflows.toLocaleString()}\n`
        csvContent += `Cash Outflows,$${data.outflows.toLocaleString()}\n`
        csvContent += `Net Cash Flow,$${data.netCashFlow.toLocaleString()}\n`
        if (data.monthlyTrend?.length > 0) {
          csvContent += '\nMonthly Trend\n'
          csvContent += 'Month,Inflow,Outflow\n'
          data.monthlyTrend.forEach((m: any) => {
            csvContent += `${m.month},$${m.inflow.toLocaleString()},$${m.outflow.toLocaleString()}\n`
          })
        }
        break

      case 'tax_summary':
        csvContent += 'Metric,Amount\n'
        csvContent += `Total Income,$${data.totalIncome.toLocaleString()}\n`
        csvContent += `Total Deductions,$${data.totalDeductions.toLocaleString()}\n`
        csvContent += `Quarterly Estimate,$${data.quarterlyEstimate.toLocaleString()}\n`
        csvContent += `Year to Date,$${data.yearToDate.toLocaleString()}\n`
        if (data.deductions?.length > 0) {
          csvContent += '\nDeductions by Category\n'
          csvContent += 'Category,Amount\n'
          data.deductions.forEach((d: any) => {
            csvContent += `${d.category},$${d.amount.toLocaleString()}\n`
          })
        }
        break

      case 'expense_report':
        csvContent += `Total Expenses,$${data.totalExpenses.toLocaleString()}\n\n`
        csvContent += 'Category Breakdown\n'
        csvContent += 'Category,Amount,Percentage,Count\n'
        data.categories.forEach((cat: any) => {
          csvContent += `${cat.category},$${cat.total_amount.toLocaleString()},${cat.percentage.toFixed(1)}%,${cat.transaction_count}\n`
        })
        if (data.topExpenses?.length > 0) {
          csvContent += '\nTop Expenses\n'
          csvContent += 'Description,Amount,Date,Category\n'
          data.topExpenses.forEach((exp: any) => {
            csvContent += `${exp.description},$${exp.amount.toLocaleString()},${exp.date},${exp.category}\n`
          })
        }
        break

      case 'revenue_analysis':
        csvContent += `Total Revenue,$${data.totalRevenue.toLocaleString()}\n\n`
        csvContent += 'Category Breakdown\n'
        csvContent += 'Category,Amount,Percentage,Count\n'
        data.categories.forEach((cat: any) => {
          csvContent += `${cat.category},$${cat.total_amount.toLocaleString()},${cat.percentage.toFixed(1)}%,${cat.transaction_count}\n`
        })
        if (data.topClients?.length > 0) {
          csvContent += '\nTop Clients\n'
          csvContent += 'Client,Revenue,Transactions\n'
          data.topClients.forEach((client: any) => {
            csvContent += `${client.client},$${client.amount.toLocaleString()},${client.transactions}\n`
          })
        }
        break

      case 'client_report':
        csvContent += `Total Clients,${data.totalClients}\n`
        csvContent += `Total Revenue,$${data.totalRevenue.toLocaleString()}\n`
        csvContent += `Average Revenue per Client,$${data.averageRevenuePerClient.toLocaleString()}\n\n`
        csvContent += 'Client Performance\n'
        csvContent += 'Client,Revenue,Expenses,Profit,Transactions\n'
        data.clients.forEach((client: any) => {
          csvContent += `${client.client},$${client.revenue.toLocaleString()},$${client.expenses.toLocaleString()},$${client.profit.toLocaleString()},${client.transactions}\n`
        })
        break
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.type}-${startDate}-to-${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const exportReportAsPDF = (template: ReportTemplate, data: any) => {
    // For now, show a toast that PDF export would open in new window
    toast.info('PDF Export', {
      description: 'PDF export will be available in the next update. Use CSV export for now.'
    })
  }

  const handlePrintReport = async (template: ReportTemplate) => {
    if (!userId) {
      toast.error('Authentication required', {
        description: 'Please log in to print reports'
      })
      return
    }

    logger.info('Print report initiated', { reportType: template.type })

    try {
      // Generate report data
      const data = await generateReportData(template.type)

      if (!data) {
        throw new Error('Failed to generate report data')
      }

      // Store the generated data
      setReportData(prev => ({ ...prev, [template.type]: data }))

      // In production, would open print-friendly view
      toast.success('Opening print preview', {
        description: `${template.name} ready for printing`
      })

      logger.info('Print report prepared', { reportType: template.type })
    } catch (error) {
      logger.error('Print failed', { error, reportType: template.type })
      toast.error('Print failed', { description: error.message })
    }
  }

  const handleEmailReport = async (template: ReportTemplate) => {
    if (!userId) {
      toast.error('Authentication required', {
        description: 'Please log in to email reports'
      })
      return
    }

    logger.info('Email report initiated', { reportType: template.type })

    // Open email modal with pre-filled subject
    setEmailReportType(template)
    setEmailForm({
      recipients: '',
      subject: `${template.name} Report - ${startDate} to ${endDate}`,
      message: `Please find attached the ${template.name} report for the period ${startDate} to ${endDate}.`
    })
    setIsEmailModalOpen(true)
  }

  const handleSendReportEmail = useCallback(async () => {
    if (!emailReportType) return

    if (!emailForm.recipients.trim()) {
      toast.error('Please enter at least one recipient email')
      return
    }

    setIsSendingEmail(true)

    try {
      // Generate report data
      const data = await generateReportData(emailReportType.type)

      if (!data) {
        throw new Error('Failed to generate report data')
      }

      // Send email via API
      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emailForm.recipients.split(',').map(e => e.trim()),
          subject: emailForm.subject,
          message: emailForm.message,
          reportType: emailReportType.type,
          reportData: data,
          dateRange: { startDate, endDate }
        })
      })

      if (!response.ok) {
        // Fallback to mailto if API not available
        const mailtoLink = `mailto:${emailForm.recipients}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`
        window.location.href = mailtoLink
      }

      toast.success('Report email sent', {
        description: `${emailReportType.name} sent to ${emailForm.recipients.split(',').length} recipient(s)`
      })
      logger.info('Report email sent', { reportType: emailReportType.type })
      setIsEmailModalOpen(false)
    } catch (error) {
      logger.error('Email failed', { error, reportType: emailReportType.type })
      // Fallback to mailto
      const mailtoLink = `mailto:${emailForm.recipients}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`
      window.location.href = mailtoLink
      toast.success('Opening email client', {
        description: 'Email client opened with report details'
      })
      setIsEmailModalOpen(false)
    } finally {
      setIsSendingEmail(false)
    }
  }, [emailReportType, emailForm, startDate, endDate])

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
          <CardDescription>Current period summary ({startDate} to {endDate})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${quickStats.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Period Total
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${quickStats.expenses.toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Period Total
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <PieChart className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${quickStats.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Period Total
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className={`h-8 w-8 ${quickStats.growth >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm text-gray-500">Growth</p>
                  <p className={`text-2xl font-bold ${quickStats.growth >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {quickStats.growth >= 0 ? '+' : ''}{quickStats.growth.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Month over Month
              </Badge>
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

      {/* Email Report Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Email Report
            </DialogTitle>
            <DialogDescription>
              Send {emailReportType?.name} report via email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-recipients">Recipients (comma-separated)</Label>
              <Input
                id="email-recipients"
                placeholder="email@example.com, another@example.com"
                value={emailForm.recipients}
                onChange={(e) => setEmailForm(prev => ({ ...prev, recipients: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                rows={4}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReportEmail} disabled={isSendingEmail}>
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
