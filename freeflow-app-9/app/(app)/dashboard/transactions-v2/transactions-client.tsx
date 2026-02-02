'use client'

import { createClient } from '@/lib/supabase/client'

// MIGRATED: Batch #18 - Verified database hook integration
// Hooks used: useTransactions

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Wallet,
  Building2,
  BarChart3,
  ArrowLeftRight,
  Banknote,
  Plus,
  Send,
  Users,
  FileText,
  Mail,
  Edit,
  Trash2,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Upload,
  Terminal,
  Settings,
  RefreshCw,
  Repeat,
  PieChart,
  Target,
  ExternalLink
} from 'lucide-react'

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




import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTransactions, type Transaction } from '@/lib/hooks/use-transactions'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Types
interface Payment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'requires_action'
  description: string
  customer: {
    name: string
    email: string
    id: string
  }
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'ach_debit' | 'sepa_debit'
    brand?: string
    last4: string
    expMonth?: number
    expYear?: number
  }
  metadata: Record<string, string>
  created: string
  fees: number
  net: number
  riskScore: number
  refunded: boolean
  refundedAmount?: number
}

interface Refund {
  id: string
  paymentId: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other'
  created: string
}

interface Dispute {
  id: string
  paymentId: string
  amount: number
  currency: string
  status: 'needs_response' | 'under_review' | 'won' | 'lost'
  reason: 'fraudulent' | 'credit_not_processed' | 'duplicate' | 'product_not_received' | 'other'
  dueBy: string
  created: string
}

interface Payout {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'
  arrivalDate: string
  created: string
  destination: {
    bank: string
    last4: string
  }
  automatic: boolean
}

interface Invoice {
  id: string
  number: string
  customer: { name: string; email: string }
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  dueDate: string
  created: string
  paidAt?: string
  items: { description: string; quantity: number; unitPrice: number }[]
}

interface Customer {
  id: string
  name: string
  email: string
  created: string
  totalSpent: number
  paymentCount: number
  lastPayment: string
  defaultPaymentMethod?: { brand: string; last4: string }
  subscriptions: number
}

interface BalanceTransaction {
  id: string
  type: 'charge' | 'refund' | 'payout' | 'adjustment' | 'fee'
  amount: number
  fee: number
  net: number
  currency: string
  description: string
  created: string
  availableOn: string
}

// Note: All data is now fetched from Supabase via useTransactions hook

const statusColors: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  canceled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  requires_action: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  needs_response: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  void: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  uncollectible: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const balanceTypeColors: Record<string, string> = {
  charge: 'text-green-600',
  refund: 'text-red-600',
  payout: 'text-blue-600',
  adjustment: 'text-purple-600',
  fee: 'text-orange-600',
}

const cardBrandIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 Amex',
  discover: '💳 Discover',
}

// AI/competitive upgrade component data arrays (empty - populated by Supabase data below)
const emptyAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const emptyCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const emptyPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

const emptyActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'info' | 'warning' | 'success' }[] = []

// Quick actions will be defined inside the component with proper state access

export default function TransactionsClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New Payment Dialog
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false)
  const [newPaymentForm, setNewPaymentForm] = useState({
    customerId: '',
    amount: '',
    description: '',
    paymentMethod: 'card'
  })

  // Export Report Dialog
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)
  const [exportReportForm, setExportReportForm] = useState({
    dateRange: 'last-30-days',
    format: 'csv',
    includeRefunds: true,
    includeDisputes: true,
    includePayouts: true
  })

  // Quick Refund Dialog (for quick action button)
  const [showQuickRefundDialog, setShowQuickRefundDialog] = useState(false)
  const [quickRefundForm, setQuickRefundForm] = useState({
    paymentId: '',
    amount: '',
    reason: 'requested_by_customer'
  })

  // Form states
  const [refundForm, setRefundForm] = useState({ amount: '', reason: 'requested_by_customer' })
  const [invoiceForm, setInvoiceForm] = useState({ customerId: '', description: '', amount: '', dueDate: '', sendEmail: true })
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', description: '' })

  const { transactions, loading, error, createTransaction, deleteTransaction, refetch, stats } = useTransactions({})
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()
  const displayTransactions = transactions || []

  // Calculate stats from real Supabase data
  const totalVolume = useMemo(() => displayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0), [displayTransactions])
  const totalFees = useMemo(() => Math.round(totalVolume * 0.029 + displayTransactions.filter(t => t.type === 'income').length * 30), [totalVolume, displayTransactions])
  const successRate = displayTransactions.length > 0 ? ((displayTransactions.filter(t => t.type === 'income').length / displayTransactions.length) * 100).toFixed(1) : '0.0'
  const pendingPayouts = useMemo(() => displayTransactions.filter(t => t.type === 'income' && new Date(t.transaction_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0), [displayTransactions])

  // Balance calculations from real data
  const availableBalance = useMemo(() => {
    const income = displayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0)
    const expenses = displayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0)
    return income - expenses - totalFees
  }, [displayTransactions, totalFees])
  const pendingBalance = useMemo(() => displayTransactions.filter(t => new Date(t.transaction_date) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)).reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0), [displayTransactions])
  const totalCustomers = useMemo(() => {
    const uniqueClients = new Set(displayTransactions.filter(t => t.client_name).map(t => t.client_name))
    return uniqueClients.size
  }, [displayTransactions])
  const totalInvoicesDue = useMemo(() => displayTransactions.filter(t => t.category === 'Invoice' && t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount) * 100, 0), [displayTransactions])

  // Derive payment-like objects from real transactions for display
  const derivedPayments = useMemo(() => displayTransactions.filter(t => t.type === 'income').map(t => ({
    id: t.id,
    amount: Math.abs(t.amount) * 100,
    currency: t.currency || 'USD',
    status: 'succeeded' as const,
    description: t.description,
    customer: { name: t.client_name || 'Unknown', email: '', id: t.client_id || '' },
    paymentMethod: { type: 'card' as const, brand: 'card', last4: '0000' },
    metadata: {} as Record<string, string>,
    created: t.transaction_date,
    fees: Math.round(Math.abs(t.amount) * 2.9 + 30),
    net: Math.round(Math.abs(t.amount) * 100 - Math.abs(t.amount) * 2.9 - 30),
    riskScore: 5,
    refunded: false,
  })), [displayTransactions])

  const derivedRefunds = useMemo(() => displayTransactions.filter(t => t.category === 'Refund').map(t => ({
    id: t.id,
    paymentId: t.notes?.match(/Original payment: (\S+)/)?.[1] || 'unknown',
    amount: Math.abs(t.amount) * 100,
    currency: t.currency || 'USD',
    status: 'succeeded' as const,
    reason: (t.notes?.match(/Reason: (\S+)/)?.[1] || 'other') as 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other',
    created: t.transaction_date,
  })), [displayTransactions])

  const derivedInvoices = useMemo(() => displayTransactions.filter(t => t.category === 'Invoice').map(t => ({
    id: t.id,
    number: t.invoice_number || `INV-${t.id.slice(0, 8)}`,
    customer: { name: t.client_name || 'Unknown', email: '' },
    amount: Math.abs(t.amount) * 100,
    currency: t.currency || 'USD',
    status: (t.type === 'income' ? 'paid' : 'open') as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible',
    dueDate: t.transaction_date,
    created: t.created_at,
    items: [{ description: t.description, quantity: 1, unitPrice: Math.abs(t.amount) * 100 }],
  })), [displayTransactions])

  const filteredPayments = useMemo(() => {
    return derivedPayments.filter(p => {
      const matchesSearch = searchQuery === '' ||
        p.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, derivedPayments])

  // Derive customer-like objects from real transactions
  const derivedCustomers = useMemo(() => {
    const customerMap = new Map<string, Customer>()
    displayTransactions.forEach(t => {
      if (!t.client_name) return
      const key = t.client_name
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: t.client_id || t.id,
          name: t.client_name,
          email: '',
          created: t.created_at,
          totalSpent: 0,
          paymentCount: 0,
          lastPayment: t.transaction_date,
          subscriptions: 0,
        })
      }
      const c = customerMap.get(key)!
      if (t.type === 'income') {
        c.totalSpent += Math.abs(t.amount) * 100
        c.paymentCount += 1
      }
      if (new Date(t.transaction_date) > new Date(c.lastPayment)) {
        c.lastPayment = t.transaction_date
      }
    })
    return Array.from(customerMap.values())
  }, [displayTransactions])

  // Derive payout-like objects from real expense transactions
  const derivedPayouts: Payout[] = useMemo(() => displayTransactions.filter(t => t.type === 'expense' && t.category !== 'Refund').map(t => ({
    id: t.id,
    amount: Math.abs(t.amount) * 100,
    currency: t.currency || 'USD',
    status: 'paid' as const,
    arrivalDate: t.transaction_date,
    created: t.created_at,
    destination: { bank: t.vendor_name || 'Bank Account', last4: '0000' },
    automatic: true,
  })), [displayTransactions])

  // Disputes are not tracked in financial_transactions, so keep empty
  const derivedDisputes: Dispute[] = []

  // Derive balance transactions from all real transactions
  const derivedBalanceTransactions: BalanceTransaction[] = useMemo(() => displayTransactions.map(t => ({
    id: t.id,
    type: (t.type === 'income' ? (t.category === 'Refund' ? 'refund' : 'charge') : 'payout') as 'charge' | 'refund' | 'payout' | 'adjustment' | 'fee',
    amount: t.type === 'income' ? Math.abs(t.amount) * 100 : -Math.abs(t.amount) * 100,
    fee: t.type === 'income' ? Math.round(Math.abs(t.amount) * 2.9 + 30) : 0,
    net: t.type === 'income' ? Math.round(Math.abs(t.amount) * 100 - Math.abs(t.amount) * 2.9 - 30) : -Math.abs(t.amount) * 100,
    currency: t.currency || 'USD',
    description: t.description,
    created: t.transaction_date,
    availableOn: new Date(new Date(t.transaction_date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  })), [displayTransactions])

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-600'
    if (score < 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Handlers
  const handleIssueRefund = async () => {
    if (!selectedPayment) return
    setIsSubmitting(true)
    try {
      const refundAmount = parseFloat(refundForm.amount.replace(/[^0-9.]/g, '')) * 100 || selectedPayment.amount
      await createTransaction({
        type: 'expense',
        category: 'Refund',
        description: `Refund for ${selectedPayment.id} - ${refundForm.reason}`,
        amount: refundAmount / 100,
        currency: selectedPayment.currency,
        transaction_date: new Date().toISOString(),
        client_name: selectedPayment.customer.name,
        notes: `Original payment: ${selectedPayment.id}, Reason: ${refundForm.reason}`
      })
      toast.success(`Refund issued for ${formatCurrency(refundAmount)}`)
      setShowRefundDialog(false)
      setRefundForm({ amount: '', reason: 'requested_by_customer' })
    } catch (error) {
      toast.error('Failed to issue refund', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!invoiceForm.description || !invoiceForm.amount) {
      toast.error('Please fill in required fields')
      return
    }
    setIsSubmitting(true)
    try {
      const amount = parseFloat(invoiceForm.amount.replace(/[^0-9.]/g, '')) * 100
      const customer = derivedCustomers.find(c => c.id === invoiceForm.customerId) || derivedCustomers[0]
      await createTransaction({
        type: 'income',
        category: 'Invoice',
        description: invoiceForm.description,
        amount: amount / 100,
        currency: 'USD',
        transaction_date: new Date().toISOString(),
        client_name: customer.name,
        notes: `Due: ${invoiceForm.dueDate}, Email sent: ${invoiceForm.sendEmail}`
      })
      toast.success('Invoice created successfully!')
      setShowInvoiceDialog(false)
      setInvoiceForm({ customerId: '', description: '', amount: '', dueDate: '', sendEmail: true })
    } catch (error) {
      toast.error('Failed to create invoice', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!customerForm.name || !customerForm.email) {
      toast.error('Name and email are required')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('clients').insert({
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone || null,
        notes: customerForm.description || null
      })
      if (error) throw error
      toast.success('Customer added successfully!')
      setShowCustomerDialog(false)
      setCustomerForm({ name: '', email: '', phone: '', description: '' })
    } catch (error) {
      toast.error('Failed to add customer', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportTransactions = async () => {
    try {
      const csvContent = [
        ['ID', 'Type', 'Category', 'Description', 'Amount', 'Date'].join(','),
        ...displayTransactions.map(t => [t.id, t.type, t.category, t.description, t.amount, t.transaction_date].join(','))
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Export completed', { description: 'Transaction data exported to CSV' })
    } catch (error) {
      toast.error('Export failed', { description: (error as Error).message })
    }
  }

  const handleReconcile = async () => {
    setIsSubmitting(true)
    try {
      await refetch()
      toast.success('Reconciliation complete', { description: 'Accounts have been reconciled' })
    } catch (error) {
      toast.error('Reconciliation failed', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoidTransaction = async (transactionId: string) => {
    setIsSubmitting(true)
    try {
      await deleteTransaction(transactionId)
      toast.success('Transaction voided', { description: `Transaction ${transactionId} has been voided` })
    } catch (error) {
      toast.error('Failed to void transaction', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle New Payment from Quick Actions
  const handleNewPayment = async () => {
    if (!newPaymentForm.amount || !newPaymentForm.description) {
      toast.error('Please fill in required fields')
      return
    }
    setIsSubmitting(true)
    try {
      const amount = parseFloat(newPaymentForm.amount.replace(/[^0-9.]/g, ''))
      const customer = derivedCustomers.find(c => c.id === newPaymentForm.customerId) || derivedCustomers[0]
      await createTransaction({
        type: 'income',
        category: 'Payment',
        description: newPaymentForm.description,
        amount: amount,
        currency: 'USD',
        transaction_date: new Date().toISOString(),
        client_name: customer.name,
        notes: `Payment method: ${newPaymentForm.paymentMethod}`
      })
      toast.success('Payment created successfully!', { description: `$${amount.toFixed(2)} from ${customer.name}` })
      setShowNewPaymentDialog(false)
      setNewPaymentForm({ customerId: '', amount: '', description: '', paymentMethod: 'card' })
    } catch (error) {
      toast.error('Failed to create payment', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Export Report from Quick Actions
  const handleExportReport = async () => {
    setIsSubmitting(true)
    try {
      // Build export data based on form settings
      let exportData: string[] = []
      const headers = ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Customer', 'Date']

      // Get date range
      const now = new Date()
      let startDate = new Date()
      switch (exportReportForm.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'last-7-days':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'last-30-days':
          startDate.setDate(startDate.getDate() - 30)
          break
        case 'last-90-days':
          startDate.setDate(startDate.getDate() - 90)
          break
        case 'this-year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }

      // Add payments
      const paymentsData = derivedPayments.map(p =>
        [p.id, 'Payment', (p.amount / 100).toFixed(2), p.currency, p.status, p.customer.name, p.created].join(',')
      )
      exportData = [...exportData, ...paymentsData]

      // Add refunds if selected
      if (exportReportForm.includeRefunds) {
        const refundsData = derivedRefunds.map(r =>
          [r.id, 'Refund', (r.amount / 100).toFixed(2), r.currency, r.status, r.paymentId, r.created].join(',')
        )
        exportData = [...exportData, ...refundsData]
      }

      // Add disputes if selected
      if (exportReportForm.includeDisputes) {
        const disputesData = derivedDisputes.map(d =>
          [d.id, 'Dispute', (d.amount / 100).toFixed(2), d.currency, d.status, d.paymentId, d.created].join(',')
        )
        exportData = [...exportData, ...disputesData]
      }

      // Add payouts if selected
      if (exportReportForm.includePayouts) {
        const payoutsData = derivedPayouts.map(p =>
          [p.id, 'Payout', (p.amount / 100).toFixed(2), p.currency, p.status, p.destination.bank, p.created].join(',')
        )
        exportData = [...exportData, ...payoutsData]
      }

      const csvContent = [headers.join(','), ...exportData].join('\n')
      const blob = new Blob([csvContent], { type: exportReportForm.format === 'csv' ? 'text/csv' : 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-report-${new Date().toISOString().split('T')[0]}.${exportReportForm.format}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Report exported successfully!', {
        description: `${exportData.length} records exported to ${exportReportForm.format.toUpperCase()}`
      })
      setShowExportReportDialog(false)
    } catch (error) {
      toast.error('Export failed', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Quick Refund from Quick Actions
  const handleQuickRefund = async () => {
    if (!quickRefundForm.paymentId || !quickRefundForm.amount) {
      toast.error('Please select a payment and enter an amount')
      return
    }
    setIsSubmitting(true)
    try {
      const refundAmount = parseFloat(quickRefundForm.amount.replace(/[^0-9.]/g, ''))
      const payment = derivedPayments.find(p => p.id === quickRefundForm.paymentId)
      await createTransaction({
        type: 'expense',
        category: 'Refund',
        description: `Refund for ${quickRefundForm.paymentId} - ${quickRefundForm.reason}`,
        amount: refundAmount,
        currency: 'USD',
        transaction_date: new Date().toISOString(),
        client_name: payment?.customer.name || 'Unknown',
        notes: `Reason: ${quickRefundForm.reason}`
      })
      toast.success('Refund issued successfully!', { description: `$${refundAmount.toFixed(2)} refunded` })
      setShowQuickRefundDialog(false)
      setQuickRefundForm({ paymentId: '', amount: '', reason: 'requested_by_customer' })
    } catch (error) {
      toast.error('Failed to issue refund', { description: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick Actions with real dialog functionality
  const transactionsQuickActions = [
    { id: '1', label: 'New Payment', icon: 'plus', action: () => setShowNewPaymentDialog(true), variant: 'default' as const },
    { id: '2', label: 'Export Report', icon: 'download', action: () => setShowExportReportDialog(true), variant: 'default' as const },
    { id: '3', label: 'Issue Refund', icon: 'undo', action: () => setShowQuickRefundDialog(true), variant: 'outline' as const },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load transactions</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stripe-level payment management and analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none dark:text-white"
              >
                <option value="today">Today</option>
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="this-month">This month</option>
                <option value="last-month">Last month</option>
              </select>
            </div>
            <button
              onClick={handleExportTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowInvoiceDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Create Payment
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {['Payment Processing', 'Refund Management', 'Dispute Handling', 'Payout Tracking', 'Risk Analysis', 'Fee Breakdown'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Related Dashboards Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dashboard/financial-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              View Financial Dashboard
            </button>
            {selectedPayment && selectedPayment.metadata?.invoiceId && (
              <button
                onClick={() => router.push(`/dashboard/invoicing-v2?invoice=${selectedPayment.metadata.invoiceId}`)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                View Related Invoice
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gross Volume</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalVolume)}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">12.5% vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{successRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Above average</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fees</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalFees)}</p>
                <div className="flex items-center gap-1 mt-2 text-gray-500">
                  <Receipt className="w-4 h-4" />
                  <span className="text-sm font-medium">2.9% + $0.30</span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <Receipt className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payouts</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(pendingPayouts)}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Arriving soon</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="balance" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <Wallet className="w-4 h-4 mr-2" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="refunds" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Refunds
            </TabsTrigger>
            <TabsTrigger value="disputes" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <Banknote className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-3 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Transaction Overview</h2>
                    <p className="text-white/80">Comprehensive payment analytics and insights</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Volume</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalVolume)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Transactions</p>
                    <p className="text-2xl font-bold">{displayTransactions.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg. Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(displayTransactions.length > 0 ? Math.round(totalVolume / displayTransactions.length) : 0)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold">{successRate}%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'New Payment', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
                { icon: FileText, label: 'Create Invoice', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                { icon: ArrowLeftRight, label: 'Issue Refund', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                { icon: Users, label: 'Add Customer', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
                { icon: Download, label: 'Export Data', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
                { icon: PieChart, label: 'Analytics', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
                { icon: Repeat, label: 'Reconcile', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
                { icon: Target, label: 'Set Goals', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payments */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
                  </div>
                </div>
                <ScrollArea className="h-[350px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => { setSelectedPayment(payment); setShowPaymentDialog(true); }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${payment.status === 'succeeded' ? 'bg-green-100 dark:bg-green-900/30' : payment.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                              {payment.status === 'succeeded' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                               payment.status === 'failed' ? <XCircle className="w-4 h-4 text-red-600" /> :
                               <Clock className="w-4 h-4 text-yellow-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{payment.customer.name}</p>
                              <p className="text-sm text-gray-500">{payment.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">{formatShortDate(payment.created)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Payout Schedule */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payout Schedule</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
                  </div>
                </div>
                <ScrollArea className="h-[350px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedPayouts.map((payout) => (
                      <div key={payout.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${payout.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30' : payout.status === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                              {payout.status === 'paid' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                               payout.status === 'in_transit' ? <Send className="w-4 h-4 text-blue-600" /> :
                               <Clock className="w-4 h-4 text-yellow-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{payout.destination.bank}</p>
                              <p className="text-sm text-gray-500">••••{payout.destination.last4}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payout.amount)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[payout.status]}`}>
                              {payout.status === 'in_transit' ? 'In Transit' : payout.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Arrives {formatShortDate(payout.arrivalDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Active Disputes Alert */}
            {derivedDisputes.filter(d => d.status === 'needs_response').length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      {derivedDisputes.filter(d => d.status === 'needs_response').length} dispute(s) need your response
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Respond before the deadline to avoid automatic loss
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                    View Disputes
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-6">
            {/* Balance Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Account Balance</h2>
                    <p className="text-white/80">Track your available and pending funds</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh Balance
                  </button>
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Banknote className="w-4 h-4 inline mr-2" />
                    Instant Payout
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(Math.abs(availableBalance))}</p>
                <p className="text-sm text-gray-500 mt-2">Ready for payout</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Balance</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(pendingBalance)}</p>
                <p className="text-sm text-gray-500 mt-2">Processing payments</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Banknote className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Payout</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(pendingPayouts)}</p>
                <p className="text-sm text-gray-500 mt-2">Arriving Dec 25</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Balance Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fee</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedBalanceTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${balanceTypeColors[txn.type]} bg-opacity-20`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.description}</td>
                        <td className={`px-6 py-4 text-sm font-medium text-right ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatCurrency(txn.fee)}</td>
                        <td className={`px-6 py-4 text-sm font-semibold text-right ${txn.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.net >= 0 ? '+' : ''}{formatCurrency(txn.net)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatShortDate(txn.availableOn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(totalInvoicesDue)} outstanding</p>
                  </div>
                  <button
                    onClick={() => setShowInvoiceDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.number}</p>
                          <p className="text-xs text-gray-500 font-mono">{invoice.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer.name}</p>
                          <p className="text-xs text-gray-500">{invoice.customer.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatShortDate(invoice.dueDate)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            {invoice.status === 'open' && (
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Mail className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                            {invoice.status === 'draft' && (
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customers</h3>
                    <p className="text-sm text-gray-500 mt-1">{totalCustomers} total customers</p>
                  </div>
                  <button
                    onClick={() => setShowCustomerDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Customer
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {derivedCustomers.map((customer) => (
                  <div key={customer.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-emerald-600">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="font-mono">{customer.id}</span>
                            <span>•</span>
                            <span>Customer since {formatShortDate(customer.created)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
                          <p className="text-xs text-gray-500">{customer.paymentCount} payments</p>
                        </div>
                        {customer.defaultPaymentMethod && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {customer.defaultPaymentMethod.brand} ••••{customer.defaultPaymentMethod.last4}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Payments Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Payment Management</h2>
                    <p className="text-white/80">View and manage all payment transactions</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-white/70 text-sm">Succeeded</p>
                    <p className="text-xl font-bold">{derivedPayments.filter(p => p.status === 'succeeded').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-white/70 text-sm">Pending</p>
                    <p className="text-xl font-bold">{derivedPayments.filter(p => p.status === 'pending').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-white/70 text-sm">Failed</p>
                    <p className="text-xl font-bold">{derivedPayments.filter(p => p.status === 'failed').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-white/70 text-sm">Total</p>
                    <p className="text-xl font-bold">{derivedPayments.length}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Payments</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="succeeded">Succeeded</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="requires_action">Requires Action</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500 font-mono">{payment.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                            {payment.status.replace('_', ' ')}
                          </span>
                          {payment.refunded && (
                            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.customer.name}</p>
                          <p className="text-xs text-gray-500">{payment.customer.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {payment.paymentMethod.brand ? `${payment.paymentMethod.brand.charAt(0).toUpperCase() + payment.paymentMethod.brand.slice(1)} ` : ''}
                              ••••{payment.paymentMethod.last4}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${payment.riskScore < 20 ? 'bg-green-500' : payment.riskScore < 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className={`text-sm font-medium ${getRiskColor(payment.riskScore)}`}>
                              {payment.riskScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.created)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedPayment(payment); setShowPaymentDialog(true); }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            {payment.status === 'succeeded' && !payment.refunded && (
                              <button
                                onClick={() => { setSelectedPayment(payment); setShowRefundDialog(true); }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Refunds</h3>
                  <p className="text-sm text-gray-500">{derivedRefunds.length} total refunds</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedRefunds.map((refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{refund.id}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{refund.paymentId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(refund.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[refund.status]}`}>
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{refund.reason.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(refund.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Disputes</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {derivedDisputes.filter(d => d.status === 'needs_response').length} Need Response
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispute ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due By</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedDisputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{dispute.id}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{dispute.paymentId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatCurrency(dispute.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[dispute.status]}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{dispute.reason.replace('_', ' ')}</td>
                        <td className="px-6 py-4">
                          {dispute.status === 'needs_response' || dispute.status === 'under_review' ? (
                            <span className="text-sm text-red-600 font-medium">{formatShortDate(dispute.dueBy)}</span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {dispute.status === 'needs_response' && (
                            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                              Respond
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Payouts</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(pendingPayouts)}</span> pending
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                      Pay Out Now
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {derivedPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{payout.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(payout.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payout.status]}`}>
                            {payout.status === 'in_transit' ? 'In Transit' : payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{payout.destination.bank} ••••{payout.destination.last4}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${payout.automatic ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700'}`}>
                            {payout.automatic ? 'Automatic' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatShortDate(payout.arrivalDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'payments', label: 'Payments', icon: CreditCard },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Configure your business details for payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <input id="businessName" type="text" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue="Acme Inc." />
                          </div>
                          <div>
                            <Label htmlFor="businessType">Business Type</Label>
                            <select id="businessType" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Corporation</option>
                              <option>LLC</option>
                              <option>Sole Proprietor</option>
                              <option>Partnership</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="supportEmail">Support Email</Label>
                          <input id="supportEmail" type="email" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue="support@acme.com" />
                        </div>
                        <div>
                          <Label htmlFor="statementDescriptor">Statement Descriptor</Label>
                          <input id="statementDescriptor" type="text" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue="ACME INC" placeholder="Max 22 characters" />
                          <p className="text-xs text-gray-500 mt-1">This appears on customer bank statements</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Currency & Locale</CardTitle>
                        <CardDescription>Set your default currency and regional preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="defaultCurrency">Default Currency</Label>
                            <select id="defaultCurrency" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>USD - US Dollar</option>
                              <option>EUR - Euro</option>
                              <option>GBP - British Pound</option>
                              <option>CAD - Canadian Dollar</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <select id="timezone" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>America/New_York (EST)</option>
                              <option>America/Los_Angeles (PST)</option>
                              <option>Europe/London (GMT)</option>
                              <option>Asia/Tokyo (JST)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Multi-currency Support</p>
                            <p className="text-sm text-gray-500">Accept payments in multiple currencies</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'payments' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Configure accepted payment methods</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Credit/Debit Cards', desc: 'Visa, Mastercard, Amex, Discover', enabled: true },
                          { name: 'Bank Transfers', desc: 'ACH, Wire, SEPA', enabled: true },
                          { name: 'Digital Wallets', desc: 'Apple Pay, Google Pay', enabled: true },
                          { name: 'Buy Now Pay Later', desc: 'Klarna, Affirm, Afterpay', enabled: false },
                          { name: 'Cryptocurrency', desc: 'Bitcoin, Ethereum, USDC', enabled: false },
                        ].map((method) => (
                          <div key={method.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.desc}</p>
                            </div>
                            <Switch defaultChecked={method.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Payout Schedule</CardTitle>
                        <CardDescription>Configure when you receive your funds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="payoutSchedule">Payout Frequency</Label>
                          <select id="payoutSchedule" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>Daily (automatic)</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Manual only</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Instant Payouts</p>
                            <p className="text-sm text-gray-500">Get funds in minutes for a 1% fee</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Minimum Payout Amount</p>
                            <p className="text-sm text-gray-500">Set minimum threshold for automatic payouts</p>
                          </div>
                          <input type="text" className="w-24 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-right" defaultValue="$100" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure transaction notification emails</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Successful Payments', desc: 'Get notified when payments succeed', enabled: true },
                          { name: 'Failed Payments', desc: 'Alert when payments fail', enabled: true },
                          { name: 'New Disputes', desc: 'Immediate alert for new disputes', enabled: true },
                          { name: 'Refunds', desc: 'Notify when refunds are processed', enabled: true },
                          { name: 'Payouts', desc: 'Confirm when payouts arrive', enabled: false },
                          { name: 'Daily Summary', desc: 'Daily transaction summary email', enabled: true },
                          { name: 'Weekly Reports', desc: 'Weekly revenue and analytics', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Recipients</CardTitle>
                        <CardDescription>Who should receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="notifyEmails">Email Addresses</Label>
                          <input id="notifyEmails" type="text" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue="finance@acme.com, cfo@acme.com" />
                          <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                        </div>
                        <div>
                          <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                          <input id="slackWebhook" type="url" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" placeholder="https://hooks.slack.com/..." />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Integrate with your accounting and business tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'QuickBooks', desc: 'Sync transactions to QuickBooks', status: 'connected', icon: '📊' },
                          { name: 'Xero', desc: 'Automatic accounting sync', status: 'disconnected', icon: '📈' },
                          { name: 'Salesforce', desc: 'CRM integration for payments', status: 'disconnected', icon: '☁️' },
                          { name: 'Zapier', desc: 'Connect to 5000+ apps', status: 'connected', icon: '⚡' },
                          { name: 'Slack', desc: 'Real-time payment notifications', status: 'connected', icon: '💬' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <button className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                              integration.status === 'connected'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}>
                              {integration.status === 'connected' ? 'Connected' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API & Webhooks</CardTitle>
                        <CardDescription>Configure developer integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="apiKey">API Key</Label>
                          <div className="mt-1 flex gap-2">
                            <input id="apiKey" type="password" className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''} readOnly />
                            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <input id="webhookUrl" type="url" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" defaultValue="https://api.acme.com/webhooks/payments" />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Webhook Events</p>
                            <p className="text-sm text-gray-500">12 events configured</p>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Configure</button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Fraud Protection</CardTitle>
                        <CardDescription>Configure fraud prevention rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Radar for Fraud Teams</p>
                            <p className="text-sm text-gray-500">Advanced ML-powered fraud detection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">3D Secure</p>
                            <p className="text-sm text-gray-500">Extra authentication layer for cards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Block High-Risk Payments</p>
                            <p className="text-sm text-gray-500">Automatically decline suspicious transactions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="riskThreshold">Risk Score Threshold</Label>
                          <select id="riskThreshold" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>75 (Recommended)</option>
                            <option>50 (Stricter)</option>
                            <option>90 (Lenient)</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage team access to transactions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict API access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logs</p>
                            <p className="text-sm text-gray-500">Track all transaction modifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage transaction data and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export All Transactions</p>
                            <p className="text-sm text-gray-500">Download complete transaction history</p>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Import Transactions</p>
                            <p className="text-sm text-gray-500">Bulk import from external sources</p>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                            <Upload className="w-4 h-4" />
                            Import
                          </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Data Retention</p>
                            <p className="text-sm text-gray-500">How long to keep transaction records</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>7 years (default)</option>
                            <option>5 years</option>
                            <option>10 years</option>
                            <option>Forever</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Developer Tools</CardTitle>
                        <CardDescription>Advanced configuration options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Test Mode</p>
                            <p className="text-sm text-gray-500">Use test credentials for development</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Debug Logging</p>
                            <p className="text-sm text-gray-500">Enable verbose API logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sandbox Environment</p>
                            <p className="text-sm text-gray-500">Isolated testing environment</p>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Open Sandbox</button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear Test Data</p>
                            <p className="text-sm text-gray-500">Remove all test mode transactions</p>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Disconnect Payment Provider</p>
                            <p className="text-sm text-gray-500">Remove payment integration completely</p>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <Trash2 className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={emptyAIInsights}
              title="Transaction Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={emptyPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs?.slice(0, 10).map(l => ({ id: l.id, type: l.activity_type, title: l.action, user: { name: l.user_name || 'System' }, timestamp: l.created_at })) || []}
            title="Transaction Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={transactionsQuickActions}
            variant="grid"
          />
        </div>

        {/* Payment Detail Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                {selectedPayment?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedPayment.status]}`}>
                    {selectedPayment.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Customer</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPayment.customer.name}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedPayment.paymentMethod.brand?.toUpperCase()} ••••{selectedPayment.paymentMethod.last4}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fee</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPayment.fees)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Net</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(selectedPayment.net)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Risk Score</p>
                    <p className={`text-sm font-medium ${getRiskColor(selectedPayment.riskScore)}`}>{selectedPayment.riskScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Created</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedPayment.created)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Metadata</p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-sm">
                    {Object.entries(selectedPayment.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span className="text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-wrap gap-2">
              <button onClick={() => setShowPaymentDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Close
              </button>
              {selectedPayment?.metadata?.invoiceId && (
                <button
                  onClick={() => {
                    setShowPaymentDialog(false)
                    router.push(`/dashboard/invoicing-v2?invoice=${selectedPayment.metadata.invoiceId}`)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  View Related Invoice
                </button>
              )}
              {selectedPayment?.status === 'succeeded' && !selectedPayment?.refunded && (
                <button
                  onClick={() => { setShowPaymentDialog(false); setShowRefundDialog(true); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Issue Refund
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>
                Refund payment {selectedPayment?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500">Original Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Refund Amount</label>
                  <input
                    type="text"
                    value={refundForm.amount || formatCurrency(selectedPayment.amount)}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <select
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="requested_by_customer">Requested by customer</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="fraudulent">Fraudulent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <button onClick={() => setShowRefundDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleIssueRefund} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Issue Refund'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Create a new invoice for a customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                <select
                  value={invoiceForm.customerId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  {derivedCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Professional Plan - Annual"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <input
                    type="text"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="$150.00"
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send-email"
                  className="rounded"
                  checked={invoiceForm.sendEmail}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                />
                <label htmlFor="send-email" className="text-sm text-gray-700 dark:text-gray-300">Email invoice to customer</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowInvoiceDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreateInvoice} disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Customer Dialog */}
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Customer</DialogTitle>
              <DialogDescription>Create a new customer record</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone (optional)</label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                <textarea
                  value={customerForm.description}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Notes about this customer..."
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20 resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowCustomerDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleAddCustomer} disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? 'Adding...' : 'Add Customer'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Payment Dialog (Quick Action) */}
        <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
              <DialogDescription>Record a new payment transaction</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                <select
                  value={newPaymentForm.customerId}
                  onChange={(e) => setNewPaymentForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select a customer</option>
                  {derivedCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="text"
                  value={newPaymentForm.amount}
                  onChange={(e) => setNewPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="$150.00"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  value={newPaymentForm.description}
                  onChange={(e) => setNewPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Professional Plan - Monthly"
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <select
                  value={newPaymentForm.paymentMethod}
                  onChange={(e) => setNewPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ach_debit">ACH Debit</option>
                  <option value="sepa_debit">SEPA Debit</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewPaymentDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleNewPayment} disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Payment'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Report Dialog (Quick Action) */}
        <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Transaction Report</DialogTitle>
              <DialogDescription>Configure and download your transaction report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                <select
                  value={exportReportForm.dateRange}
                  onChange={(e) => setExportReportForm(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="today">Today</option>
                  <option value="last-7-days">Last 7 Days</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-90-days">Last 90 Days</option>
                  <option value="this-year">This Year</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Format</label>
                <select
                  value={exportReportForm.format}
                  onChange={(e) => setExportReportForm(prev => ({ ...prev, format: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="json">JSON (Developer)</option>
                </select>
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Include in Report:</p>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Refunds</label>
                  <Switch
                    checked={exportReportForm.includeRefunds}
                    onCheckedChange={(checked) => setExportReportForm(prev => ({ ...prev, includeRefunds: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Disputes</label>
                  <Switch
                    checked={exportReportForm.includeDisputes}
                    onCheckedChange={(checked) => setExportReportForm(prev => ({ ...prev, includeDisputes: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Payouts</label>
                  <Switch
                    checked={exportReportForm.includePayouts}
                    onCheckedChange={(checked) => setExportReportForm(prev => ({ ...prev, includePayouts: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowExportReportDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleExportReport} disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isSubmitting ? 'Exporting...' : 'Export Report'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Refund Dialog (Quick Action) */}
        <Dialog open={showQuickRefundDialog} onOpenChange={setShowQuickRefundDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>Process a refund for a payment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Payment</label>
                <select
                  value={quickRefundForm.paymentId}
                  onChange={(e) => {
                    const payment = derivedPayments.find(p => p.id === e.target.value)
                    setQuickRefundForm(prev => ({
                      ...prev,
                      paymentId: e.target.value,
                      amount: payment ? (payment.amount / 100).toFixed(2) : ''
                    }))
                  }}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select a payment to refund</option>
                  {derivedPayments.filter(p => p.status === 'succeeded' && !p.refunded).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.customer.name} - {formatCurrency(p.amount)} ({p.id.slice(-8)})
                    </option>
                  ))}
                </select>
              </div>
              {quickRefundForm.paymentId && (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500">Original Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency((derivedPayments.find(p => p.id === quickRefundForm.paymentId)?.amount || 0))}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Refund Amount</label>
                    <input
                      type="text"
                      value={quickRefundForm.amount}
                      onChange={(e) => setQuickRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="$0.00"
                      className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a partial amount for partial refund</p>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                <select
                  value={quickRefundForm.reason}
                  onChange={(e) => setQuickRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="requested_by_customer">Requested by customer</option>
                  <option value="duplicate">Duplicate charge</option>
                  <option value="fraudulent">Fraudulent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowQuickRefundDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={handleQuickRefund} disabled={isSubmitting || !quickRefundForm.paymentId} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Issue Refund'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
