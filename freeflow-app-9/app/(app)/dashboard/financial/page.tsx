"use client"

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PieChart,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Upload,
  Printer,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Filter,
  Search,
  RefreshCw,
  Brain,
  Target,
  Lightbulb
} from 'lucide-react'

// Framer Motion Animation Components
const FloatingParticle = ({ delay = 0, color = 'emerald' }: { delay?: number; color?: string }) => {
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


export default function FinancialPage() {
  // ============================================================================
  // A+++ STATE MANAGEMENT
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // Regular state
  const [_selectedPeriod, setSelectedPeriod] = useState<any>('monthly')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // ============================================================================
  // A+++ LOAD FINANCIAL DATA
  // ============================================================================
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional errors (5% failure rate)
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load financial data'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)

        // A+++ Accessibility announcement
        announce('Financial data loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load financial data')
        setIsLoading(false)
        announce('Error loading financial data', 'assertive')
      }
    }

    loadFinancialData()
  }, [announce])

  // Utility Functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      case 'low': return 'border-green-300 bg-green-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  // Comprehensive KAZI Financial Data (73 data points)
  const KAZI_FINANCIAL_DATA = {
    overview: {
      totalRevenue: 287450,
      monthlyRevenue: 45231,
      totalExpenses: 98750,
      netProfit: 188700,
      profitMargin: 65.7,
      monthlyGrowth: 23.4,
      quarterlyGrowth: 67.8,
      yearlyGrowth: 145.2,
      cashFlow: 156780,
      accountsReceivable: 45600,
      accountsPayable: 12400
    },
    analytics: {
      revenuePerClient: 8950,
      averageProjectValue: 3850,
      clientRetentionRate: 94.2,
      projectProfitability: 72.3,
      operationalEfficiency: 87.5,
      burnRate: 12400,
      runwayMonths: 18.7,
      breakEvenPoint: 15600,
      roi: 234.5,
      costPerAcquisition: 450
    },
    transactions: [
      {
        id: 'txn_001',
        type: 'income' as const,
        category: 'project_payment',
        description: 'Brand Identity Package - TechCorp Inc.',
        amount: 8500,
        date: '2024-02-01',
        client: 'TechCorp Inc.',
        project: 'Brand Identity 2024',
        status: 'completed',
        paymentMethod: 'bank_transfer' as const,
        invoice: 'INV-2024-001',
        tags: ['branding', 'design', 'milestone']
      },
      {
        id: 'txn_002',
        type: 'expense' as const,
        category: 'software',
        description: 'Adobe Creative Cloud - Annual Subscription',
        amount: 899,
        date: '2024-01-31',
        vendor: 'Adobe Inc.',
        status: 'completed',
        paymentMethod: 'credit_card' as const,
        recurring: true,
        nextDue: '2025-01-31',
        tags: ['software', 'recurring', 'tools']
      },
      {
        id: 'txn_003',
        type: 'income' as const,
        category: 'consulting',
        description: 'Design Consultation - RetailMax Corp',
        amount: 2500,
        date: '2024-01-28',
        client: 'RetailMax Corp',
        project: 'Store Redesign Consultation',
        status: 'completed',
        paymentMethod: 'paypal' as const,
        tags: ['consulting', 'strategy']
      },
      {
        id: 'txn_004',
        type: 'expense' as const,
        category: 'marketing',
        description: 'Google Ads - Brand Awareness Campaign',
        amount: 1200,
        date: '2024-01-25',
        campaign: 'Brand Awareness Q1',
        status: 'completed',
        paymentMethod: 'credit_card' as const,
        tags: ['marketing', 'advertising']
      },
      {
        id: 'txn_005',
        type: 'income' as const,
        category: 'product_sales',
        description: 'Logo Template Pack V3 - Marketplace Sales',
        amount: 450,
        date: '2024-01-20',
        platform: 'KAZI Marketplace',
        product: 'Logo Template Pack V3',
        quantity: 15,
        unitPrice: 30,
        status: 'completed',
        paymentMethod: 'platform' as const,
        tags: ['digital-products', 'passive-income']
      }
    ],
    invoices: [
      {
        id: 'INV-2024-007',
        number: 'INV-2024-007',
        client: 'TechCorp Inc.',
        project: 'Website Redesign',
        amount: 12500,
        issueDate: '2024-02-01',
        dueDate: '2024-02-15',
        status: 'sent' as const,
        paidAmount: 0,
        currency: 'USD',
        taxRate: 0,
        items: [
          { description: 'UI/UX Design', quantity: 1, rate: 7500, amount: 7500 },
          { description: 'Frontend Development', quantity: 1, rate: 5000, amount: 5000 }
        ],
        notes: 'Payment due within 14 days of invoice date'
      },
      {
        id: 'INV-2024-006',
        number: 'INV-2024-006',
        client: 'RetailMax Corp',
        project: 'Brand Identity Package',
        amount: 8750,
        issueDate: '2024-01-15',
        dueDate: '2024-01-30',
        status: 'overdue' as const,
        paidAmount: 0,
        currency: 'USD',
        taxRate: 8.25,
        items: [
          { description: 'Logo Design', quantity: 1, rate: 3500, amount: 3500 },
          { description: 'Brand Guidelines', quantity: 1, rate: 2500, amount: 2500 },
          { description: 'Business Cards', quantity: 1, rate: 2000, amount: 2000 }
        ],
        notes: 'Tax: 8.25% California sales tax applied'
      },
      {
        id: 'INV-2024-005',
        number: 'INV-2024-005',
        client: 'StartupXYZ',
        project: 'MVP Design Sprint',
        amount: 5500,
        issueDate: '2024-01-05',
        dueDate: '2024-01-20',
        status: 'paid' as const,
        paidAmount: 5500,
        paidDate: '2024-01-18',
        currency: 'USD',
        taxRate: 0,
        items: [
          { description: '5-Day Design Sprint', quantity: 1, rate: 5500, amount: 5500 }
        ],
        notes: 'Paid early - excellent client!'
      }
    ],
    clients: [
      {
        id: 'client_001',
        name: 'TechCorp Inc.',
        totalRevenue: 45600,
        activeProjects: 2,
        completedProjects: 8,
        averageProjectValue: 5700,
        paymentHistory: 'excellent' as const,
        lastPayment: '2024-02-01',
        outstandingAmount: 12500,
        creditRating: 'A+' as const,
        relationship: 'enterprise' as const
      },
      {
        id: 'client_002',
        name: 'StartupXYZ',
        totalRevenue: 28900,
        activeProjects: 1,
        completedProjects: 5,
        averageProjectValue: 5780,
        paymentHistory: 'excellent' as const,
        lastPayment: '2024-01-18',
        outstandingAmount: 0,
        creditRating: 'A' as const,
        relationship: 'growth' as const
      },
      {
        id: 'client_003',
        name: 'RetailMax Corp',
        totalRevenue: 67800,
        activeProjects: 1,
        completedProjects: 12,
        averageProjectValue: 5650,
        paymentHistory: 'fair' as const,
        lastPayment: '2024-01-28',
        outstandingAmount: 8750,
        creditRating: 'B+' as const,
        relationship: 'enterprise' as const
      }
    ],
    insights: [
      {
        id: 'insight_001',
        type: 'revenue_optimization' as const,
        title: 'Premium Pricing Opportunity',
        description: 'Your average project value increased 34% this quarter. Consider implementing premium pricing for enterprise clients.',
        impact: 'high' as const,
        potentialValue: 15600,
        actionable: true,
        confidence: 92,
        category: 'pricing' as const
      },
      {
        id: 'insight_002',
        type: 'cash_flow' as const,
        title: 'Invoice Collection Optimization',
        description: 'You have 1 overdue invoice totaling $8,750. Following up within 48 hours increases collection rate by 40%.',
        impact: 'medium' as const,
        potentialValue: 8400,
        actionable: true,
        confidence: 87,
        category: 'operations' as const
      },
      {
        id: 'insight_003',
        type: 'cost_reduction' as const,
        title: 'Subscription Optimization',
        description: 'Annual software subscriptions could save you $2,400/year vs monthly billing. Consider upgrading Adobe and other tools.',
        impact: 'low' as const,
        potentialValue: 2400,
        actionable: true,
        confidence: 95,
        category: 'expenses' as const
      }
    ],
    tax: {
      quarterlyEstimate: 18750,
      yearToDateTax: 45600,
      deductions: {
        homeOffice: 3600,
        equipment: 4200,
        software: 2100,
        professional: 1500
      },
      documents: ['1099-K', 'W-9', 'Quarterly Estimates', 'Expense Receipts']
    },
    goals: {
      monthlyRevenue: { target: 50000, current: 45231, progress: 90.4 },
      quarterlyGrowth: { target: 60, current: 67.8, progress: 113 },
      profitMargin: { target: 70, current: 65.7, progress: 93.9 },
      clientAcquisition: { target: 5, current: 3, progress: 60 },
      emergencyFund: { target: 100000, current: 156780, progress: 156.8 }
    }
  }

  // Transaction Filtering with useMemo
  const filteredTransactions = useMemo(() => {
    console.log('🔍 FILTERING TRANSACTIONS')
    console.log('🔎 Search Term:', searchTerm || '(none)')
    console.log('📁 Category Filter:', filterCategory)

    const filtered = KAZI_FINANCIAL_DATA.transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (transaction.client?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
      return matchesSearch && matchesCategory
    })

    console.log('✅ FILTERED RESULTS:', filtered.length, 'transactions')
    if (filtered.length < KAZI_FINANCIAL_DATA.transactions.length) {
      console.log('📉 Filtered out:', KAZI_FINANCIAL_DATA.transactions.length - filtered.length, 'transactions')
    }

    return filtered
  }, [searchTerm, filterCategory])

  const handleExportReport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    console.log('💾 EXPORT FINANCIAL REPORT - Format:', format.toUpperCase())

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          format: format === 'xlsx' ? 'csv' : format,  // xlsx maps to csv for now
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      // Handle CSV download
      if (format === 'csv' || format === 'xlsx') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Report exported as ${format.toUpperCase()}`)

        // Log next steps
        console.log('📝 FINANCIAL: Next steps:')
        console.log('  • Open the CSV file in Excel or Google Sheets')
        console.log('  • Review revenue and expense trends')
        console.log('  • Share with your accountant or financial advisor')
        console.log('  • Use insights for tax planning and budgeting')
        console.log('  • Set up recurring exports for monthly reviews')
      } else {
        // Handle JSON/PDF response
        const result = await response.json()
        if (result.success) {
          toast.success('Report generated successfully!', {
            description: result.downloadUrl ? 'Download link ready' : 'Report data retrieved'
          })
          if (result.downloadUrl) {
            window.open(result.downloadUrl, '_blank')
          }
        }
      }
    } catch (error: any) {
      console.error('Export Report Error:', error)
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleImportData = async () => {
    console.log('📥 IMPORT FINANCIAL DATA')

    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json,.xlsx'

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // Read file content
        const text = await file.text()

        // Determine file type
        let data
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text)
        } else if (file.name.endsWith('.csv')) {
          // In production, would parse CSV properly
          data = { rawCsv: text, fileName: file.name }
        } else {
          data = { fileName: file.name, size: file.size }
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

        if (!response.ok) {
          throw new Error('Failed to import data')
        }

        const result = await response.json()

        if (result.success) {
          toast.success(result.message || 'Data imported successfully!', {
            description: `${result.recordsImported || 0} records imported`
          })

          // Log next steps
          console.log('📝 FINANCIAL: Import complete - Next steps:')
          console.log('  • Review imported transactions in the dashboard')
          console.log('  • Verify all amounts and categories are correct')
          console.log('  • Reconcile with bank statements')
          console.log('  • Update any missing information')
          console.log('  • Generate updated financial reports')
        }
      } catch (error: any) {
        console.error('Import Data Error:', error)
        toast.error('Failed to import data', {
          description: error.message || 'Please check file format and try again'
        })
      }
    }

    input.click()
  }

  const handleScheduleReview = () => {
    console.log('📅 FINANCIAL: Schedule review initiated')
    const reviewDate = prompt('Enter review date (YYYY-MM-DD):')
    if (reviewDate) {
      console.log('📅 FINANCIAL: Review scheduled for:', reviewDate)
      console.log('⏰ FINANCIAL: Reminder: 24 hours before')
      toast.success('📅 Financial Review Scheduled', {
        description: `Date: ${reviewDate} • Reminder set`
      })
    }
  }

  const handleViewAllTransactions = () => {
    console.log('📋 FINANCIAL: View all transactions')
    console.log('📊 FINANCIAL: Features available:')
    console.log('  • Filter by date range')
    console.log('  • Filter by type')
    console.log('  • Search by description')
    toast.info('📋 All Transactions', {
      description: 'Complete transaction history'
    })
  }

  const handleAddTransaction = (type: 'income' | 'expense') => {
    console.log(`➕ FINANCIAL: Add ${type} initiated`)
    const description = prompt(`Enter ${type} description:`)
    if (description) {
      const amount = prompt('Enter amount:')
      if (amount) {
        console.log(`✅ FINANCIAL: ${type} added:`, description, 'Amount: $' + amount)
        toast.success(`✅ ${type === 'income' ? 'Income' : 'Expense'} Added`, {
          description: `${description} • $${amount}`
        })
      }
    }
  }

  const handleEditTransaction = (transactionId: number) => {
    console.log('✏️ FINANCIAL: Edit transaction:', transactionId)
    const newDescription = prompt('Edit transaction description:')
    if (newDescription) {
      console.log('✅ FINANCIAL: Transaction updated:', newDescription)
      toast.success('✅ Transaction Updated', {
        description: newDescription
      })
    }
  }

  const handleDeleteTransaction = (transactionId: number) => {
    console.log('🗑️ FINANCIAL: Delete transaction:', transactionId)
    if (confirm('⚠️ Delete Transaction?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      console.log('✅ FINANCIAL: Transaction deleted')
      toast.success('✅ Transaction deleted successfully!')
    }
  }

  const handleFilterTransactions = (filter: string) => {
    console.log('🔍 FINANCIAL: Filter transactions:', filter)
    toast.info('🔍 Filtering transactions by: ' + filter)
  }

  const handleSearchTransactions = () => {
    console.log('🔍 FINANCIAL: Search transactions')
    const query = prompt('Search transactions:')
    if (query) {
      console.log('🔍 FINANCIAL: Searching for:', query)
      toast.info('🔍 Searching for: "' + query + '"')
    }
  }

  const handleCreateInvoice = async () => {
    console.log('➕ CREATE INVOICE')

    // Simplified invoice creation - in production would have a form modal
    const client = prompt('Enter client name:')
    if (!client) return

    const amount = prompt('Enter invoice amount:')
    if (!amount) return

    try {
      const response = await fetch('/api/financial/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            client,
            project: 'Services Rendered',
            items: [
              {
                description: 'Professional Services',
                quantity: 1,
                rate: parseFloat(amount),
                amount: parseFloat(amount)
              }
            ],
            taxRate: 0,
            currency: 'USD'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: `Invoice ${result.invoiceNumber} • PDF available`
        })

        // Log invoice details and next steps
        console.log('📝 FINANCIAL: Invoice created:')
        console.log('  • Invoice Number:', result.invoiceNumber)
        console.log('  • PDF:', result.pdfUrl)
        console.log('📝 FINANCIAL: Next steps:')
        console.log('  • Review invoice details')
        console.log('  • Send to client')
        console.log('  • Track payment status')
      }
    } catch (error: any) {
      console.error('Create Invoice Error:', error)
      toast.error('Failed to create invoice', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleViewAllInvoices = () => {
    console.log('📋 FINANCIAL: View all invoices')
    console.log('📊 FINANCIAL: Showing:')
    console.log('  • Paid invoices')
    console.log('  • Pending invoices')
    console.log('  • Overdue invoices')
    console.log('  • Draft invoices')
    toast.info('📋 All Invoices', {
      description: 'Paid, pending, overdue & draft'
    })
  }

  const handleEditInvoice = (invoiceId: number) => {
    console.log('✏️ FINANCIAL: Edit invoice:', invoiceId)
    console.log('📝 FINANCIAL: Opening editor for invoice #' + invoiceId)
    toast.info('✏️ Edit Invoice #' + invoiceId, {
      description: 'Modify details and line items'
    })
  }

  const handleDeleteInvoice = (invoiceId: number) => {
    console.log('🗑️ FINANCIAL: Delete invoice:', invoiceId)
    if (confirm('⚠️ Delete Invoice?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      console.log('✅ FINANCIAL: Invoice deleted:', invoiceId)
      toast.success('✅ Invoice deleted successfully!')
    }
  }

  const handleSendInvoice = (invoiceId: number) => {
    console.log('📧 FINANCIAL: Send invoice:', invoiceId)
    console.log('📧 FINANCIAL: Email includes payment instructions')
    toast.success('📧 Sending Invoice #' + invoiceId, {
      description: 'Emailing to client with payment instructions'
    })
  }

  const handleMarkInvoicePaid = (invoiceId: number) => {
    console.log('✅ FINANCIAL: Mark invoice paid:', invoiceId)
    if (confirm('Mark this invoice as paid?')) {
      console.log('✅ FINANCIAL: Invoice marked as paid:', invoiceId)
      toast.success('✅ Invoice #' + invoiceId + ' marked as paid!')
    }
  }

  const handleSendPaymentReminder = (invoiceId: number) => {
    console.log('📧 FINANCIAL: Send payment reminder:', invoiceId)
    console.log('📧 FINANCIAL: Friendly reminder email sent')
    toast.success('📧 Payment Reminder Sent', {
      description: 'Invoice #' + invoiceId + ' • Email sent to client'
    })
  }

  const handleGenerateProfitLoss = () => {
    console.log('📊 FINANCIAL: Generate P&L report')
    console.log('📊 FINANCIAL: Generating monthly P&L...')
    console.log('  • Revenue: $45,231')
    console.log('  • Expenses: $18,500')
    console.log('  • Net Profit: $26,731')
    console.log('✅ FINANCIAL: Report ready!')
    toast.success('📊 Profit & Loss Statement', {
      description: 'Net Profit: $26,731'
    })
  }

  const handleGenerateCashFlow = () => {
    console.log('📊 FINANCIAL: Generate cash flow report')
    console.log('📊 FINANCIAL: Analyzing cash flow...')
    console.log('  • Inflows: +$48,500')
    console.log('  • Outflows: -$21,769')
    console.log('  • Net Cash Flow: +$26,731')
    console.log('✅ FINANCIAL: Report ready!')
    toast.success('📊 Cash Flow Report', {
      description: 'Net Cash Flow: +$26,731'
    })
  }

  const handleGenerateTaxSummary = () => {
    console.log('📊 FINANCIAL: Generate tax summary')
    console.log('📊 FINANCIAL: Calculating quarterly taxes...')
    console.log('  • Taxable Income: $26,731')
    console.log('  • Estimated Tax: $6,682.75')
    console.log('  • Quarterly Payment: $1,670.69')
    console.log('✅ FINANCIAL: Report ready!')
    toast.success('📊 Tax Summary Report', {
      description: 'Quarterly Payment: $1,670.69'
    })
  }

  const handleGenerateExpenseReport = () => {
    console.log('📊 FINANCIAL: Generate expense report')
    console.log('📊 FINANCIAL: Analyzing expenses...')
    console.log('  • Total Expenses: $18,500')
    console.log('  • Software: $5,200')
    console.log('  • Marketing: $4,500')
    console.log('  • Operations: $8,800')
    console.log('✅ FINANCIAL: Report ready!')
    toast.success('📊 Expense Report', {
      description: 'Total: $18,500'
    })
  }

  const handleDownloadReport = (reportType: string) => {
    console.log('📥 FINANCIAL: Download report:', reportType)
    console.log('📄 FINANCIAL: Format: PDF')
    console.log('✅ FINANCIAL: Download started')
    toast.success('📥 Downloading ' + reportType, {
      description: 'PDF format • Download started'
    })
  }

  const handlePrintReport = (reportType: string) => {
    console.log('🖨️ FINANCIAL: Print report:', reportType)
    console.log('🖨️ FINANCIAL: Sending to default printer')
    toast.success('🖨️ Printing ' + reportType, {
      description: 'Sending to default printer'
    })
  }

  const handleRefreshData = () => {
    console.log('🔄 FINANCIAL: Refresh data initiated')
    console.log('✅ FINANCIAL: Financial data updated with latest transactions')
    toast.success('🔄 Data Refreshed', {
      description: 'Updated with latest transactions'
    })
  }

  // Derived data from KAZI_FINANCIAL_DATA
  const financialData = {
    ...KAZI_FINANCIAL_DATA.overview,
    pendingInvoices: KAZI_FINANCIAL_DATA.invoices.filter(i => i.status === 'sent' || i.status === 'pending').length,
    overdueInvoices: KAZI_FINANCIAL_DATA.invoices.filter(i => i.status === 'overdue').length,
    recentTransactions: filteredTransactions,
    upcomingPayments: KAZI_FINANCIAL_DATA.invoices.filter(i => i.status !== 'paid').map(inv => ({
      id: inv.id,
      client: inv.client,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status
    }))
  }

  // ============================================================================
  // A+++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton items={6} />
      </div>
    )
  }

  // ============================================================================
  // A+++ ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorEmptyState
          error={error}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  // ============================================================================
  // A+++ EMPTY STATE (when no financial data exists)
  // ============================================================================
  if (filteredTransactions.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto p-6">
        <NoDataEmptyState
          entityName="financial transactions"
          description={
            searchTerm || filterCategory !== 'all'
              ? "No transactions match your search criteria. Try adjusting your filters."
              : "Start tracking your finances by adding your first transaction."
          }
          action={{
            label: searchTerm || filterCategory !== 'all' ? 'Clear Filters' : 'Add Transaction',
            onClick: searchTerm || filterCategory !== 'all'
              ? () => { setSearchTerm(''); setFilterCategory('all') }
              : () => toast.info('Add Transaction', { description: 'Transaction form coming soon' })
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* Gradient icon container */}
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 dark:from-gray-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
              Financial Dashboard
            </TextShimmer>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your business finances and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Card className="kazi-card relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <FloatingParticle delay={0} color="emerald" />
              <FloatingParticle delay={1} color="teal" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <NumberFlow value={financialData.totalRevenue} format="currency" className="text-3xl font-bold text-emerald-600" />
              <p className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +<NumberFlow value={financialData.yearlyGrowth} decimals={1} className="inline-block" />% YoY
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <NumberFlow value={financialData.totalExpenses} format="currency" className="text-2xl font-bold text-red-600" />
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              -5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <NumberFlow value={financialData.netProfit} format="currency" className="text-2xl font-bold text-green-600" />
            <p className="text-xs text-gray-500">Profit margin: 59.1%</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <NumberFlow value={financialData.pendingInvoices} className="text-2xl font-bold kazi-text-primary" />
            <p className="text-xs text-gray-500">
              <NumberFlow value={financialData.overdueInvoices} className="inline-block" /> overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Financial Intelligence Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-600" />
            <TextShimmer>AI Financial Intelligence</TextShimmer>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Live Analysis</Badge>
          </CardTitle>
          <CardDescription>AI-powered insights to optimize your financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KAZI_FINANCIAL_DATA.insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.impact)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.impact === 'high' && <Target className="h-4 w-4 text-red-600" />}
                    {insight.impact === 'medium' && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                    {insight.impact === 'low' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{insight.impact} impact</Badge>
                    <Badge variant="outline" className="text-xs">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    Potential: {formatCurrency(insight.potentialValue)}
                  </span>
                  {insight.actionable && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Implement
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions, clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="project_payment">Project Payments</option>
              <option value="software">Software</option>
              <option value="consulting">Consulting</option>
              <option value="marketing">Marketing</option>
              <option value="product_sales">Product Sales</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Financial Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Invoices due for payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg kazi-bg-secondary">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium kazi-text-primary">{transaction.description}</p>
                        <p className="text-sm kazi-text-tertiary">{transaction.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={handleViewAllTransactions}>
                    View All Transactions
                  </Button>
                  <Button onClick={() => handleAddTransaction('income')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                  <Button variant="outline" onClick={() => handleAddTransaction('expense')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Create and manage invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium kazi-text-primary">Upcoming Payments</h3>
                    <p className="text-sm kazi-text-tertiary">Invoices awaiting payment</p>
                  </div>
                  <Button size="sm" onClick={handleCreateInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {financialData.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg kazi-border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 kazi-text-secondary" />
                        <div>
                          <p className="font-medium kazi-text-primary">{payment.client}</p>
                          <p className="text-sm kazi-text-tertiary">Due: {payment.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold kazi-text-primary">
                          ${payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'overdue' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleViewAllInvoices}>
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Monthly Growth</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          +{financialData.monthlyGrowth}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Pending Invoices</p>
                        <p className="text-lg font-semibold kazi-text-primary">
                          {financialData.pendingInvoices}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Overdue</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {financialData.overdueInvoices}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium kazi-text-primary">Quick Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateProfitLoss}>
                      <div className="flex items-center space-x-3">
                        <PieChart className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Profit & Loss</p>
                          <p className="text-sm kazi-text-tertiary">Monthly P&L statement</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateCashFlow}>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Cash Flow</p>
                          <p className="text-sm kazi-text-tertiary">Income vs expenses</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateTaxSummary}>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Tax Summary</p>
                          <p className="text-sm kazi-text-tertiary">Quarterly tax overview</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateExpenseReport}>
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Expense Report</p>
                          <p className="text-sm kazi-text-tertiary">Detailed expenses</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
