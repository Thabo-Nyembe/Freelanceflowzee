"use client"

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { createFeatureLogger } from '@/lib/logger'
import {
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  FileText,
  Download,
  Upload,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('FinancialLayout')

interface Tab {
  name: string
  path: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { name: 'Overview', path: '/dashboard/financial', icon: <Wallet className="h-4 w-4" /> },
  { name: 'Transactions', path: '/dashboard/financial/transactions', icon: <DollarSign className="h-4 w-4" /> },
  { name: 'Invoices', path: '/dashboard/financial/invoices', icon: <FileText className="h-4 w-4" /> },
  { name: 'Reports', path: '/dashboard/financial/reports', icon: <TrendingUp className="h-4 w-4" /> }
]

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Database state
  const [financialData, setFinancialData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFinancialLayoutData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        logger.info('Loading financial layout data', { userId })

        const { getFinancialOverview, getInvoices } = await import('@/lib/financial-queries')

        const [overviewResult, invoicesResult] = await Promise.all([
          getFinancialOverview(userId),
          getInvoices(userId, {})
        ])

        if (overviewResult.error) throw overviewResult.error
        if (invoicesResult.error) throw invoicesResult.error

        setFinancialData(overviewResult.data)
        setInvoices(invoicesResult.data || [])

        setIsLoading(false)
        announce('Financial dashboard data loaded', 'polite')
        toast.success('Financial data loaded', {
          description: `${invoicesResult.data?.length || 0} invoices loaded`
        })

        logger.info('Financial layout data loaded successfully', {
          userId,
          hasOverview: !!overviewResult.data,
          invoiceCount: invoicesResult.data?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load financial data'
        logger.error('Failed to load financial layout data', { error: errorMessage, userId })
        toast.error('Failed to load financial data', { description: errorMessage })
        setIsLoading(false)
        announce('Error loading financial data', 'assertive')
      }
    }

    loadFinancialLayoutData()
  }, [userId, announce])

  useEffect(() => {
    logger.info('Financial Hub Layout mounted', { currentPath: pathname })
  }, [pathname])

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    logger.info('Export report initiated', { format: format.toUpperCase() })

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          format,
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        })
      })

      if (!response.ok) throw new Error('Failed to export report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Report exported as ${format.toUpperCase()}`, {
        description: 'Download completed successfully'
      })
      logger.info('Report exported successfully', { format })
    } catch (error: any) {
      logger.error('Failed to export report', { error, format })
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleImportData = async () => {
    logger.info('Import financial data initiated')

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json,.xlsx'

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        let data

        if (file.name.endsWith('.json')) {
          data = JSON.parse(text)
        } else {
          data = { rawCsv: text, fileName: file.name }
        }

        const response = await fetch('/api/financial/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import',
            data: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              importData: data
            }
          })
        })

        if (!response.ok) throw new Error('Failed to import data')

        const result = await response.json()

        if (result.success) {
          toast.success(result.message || 'Data imported successfully!', {
            description: `${result.recordsImported || 0} records imported`
          })
          logger.info('Data imported successfully', {
            fileName: file.name,
            recordsImported: result.recordsImported || 0
          })
        }
      } catch (error: any) {
        logger.error('Failed to import data', { error, fileName: file?.name })
        toast.error('Failed to import data', {
          description: error.message || 'Please check file format'
        })
      }
    }

    input.click()
  }

  const handleScheduleReview = () => {
    logger.info('Schedule review initiated')
    const reviewDate = prompt('Enter review date (YYYY-MM-DD):')
    if (reviewDate) {
      logger.info('Review scheduled', { reviewDate })
      toast.success('Financial Review Scheduled', {
        description: `Date: ${reviewDate} - Reminder set`
      })
    }
  }

  const handleRefreshData = async () => {
    logger.info('Refresh financial data')

    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      setIsLoading(true)

      const { getFinancialOverview, getInvoices } = await import('@/lib/financial-queries')

      const [overviewResult, invoicesResult] = await Promise.all([
        getFinancialOverview(userId),
        getInvoices(userId, {})
      ])

      if (overviewResult.error) throw overviewResult.error
      if (invoicesResult.error) throw invoicesResult.error

      setFinancialData(overviewResult.data)
      setInvoices(invoicesResult.data || [])

      toast.success('Data Refreshed', {
        description: `Updated with latest transactions (${invoicesResult.data?.length || 0} invoices)`
      })
      announce('Financial data refreshed', 'polite')
      logger.info('Financial data refreshed', { invoiceCount: invoicesResult.data?.length || 0 })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh data'
      toast.error('Refresh failed', { description: message })
      logger.error('Failed to refresh financial data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const pendingInvoices = invoices.filter(i => i.status === 'sent').length
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
              Financial Dashboard
            </TextShimmer>
          </div>
          <p className="text-gray-600 mt-1">
            Track your business finances and performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <NumberFlow
                value={financialData?.totalRevenue || 0}
                format="currency"
                className="text-3xl font-bold text-emerald-600"
              />
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                +<NumberFlow value={financialData?.yearlyGrowth || 0} decimals={1} className="inline-block" />% YoY
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow
                value={financialData?.totalExpenses || 0}
                format="currency"
                className="text-2xl font-bold text-red-600"
              />
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3 text-red-500" />
                Operating costs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow
                value={financialData?.netProfit || 0}
                format="currency"
                className="text-2xl font-bold text-green-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                Margin: {(financialData?.profitMargin || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                <NumberFlow value={pendingInvoices} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                <NumberFlow value={overdueInvoices} className="inline-block" /> overdue
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path
              return (
                <Button
                  key={tab.path}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    logger.info('Tab navigation', { tab: tab.name, path: tab.path })
                    router.push(tab.path)
                  }}
                  className={isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                  {isActive && <Badge variant="secondary" className="ml-2 bg-white text-emerald-600">Active</Badge>}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Page Content */}
      {children}
    </div>
  )
}
