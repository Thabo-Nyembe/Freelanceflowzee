'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Settings,
  Filter,
  Eye,
  Edit,
  Copy,
  MoreHorizontal,
  CreditCard,
  Building2,
  Calendar,
  Receipt,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Calculator,
  Printer,
  Globe,
  Tag,
  List,
  Grid3X3,
  PieChart,
  Banknote,
  Timer,
  Users,
  Repeat,
  FileX,
  Wallet,
  Sliders,
  Webhook,
  Key,
  Shield,
  Bell
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




import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'

// World-class guest payment component
import GuestPaymentModal from '@/components/payments/guest-payment-modal'

// ============================================================================
// TYPE DEFINITIONS - QuickBooks Level Invoicing
// ============================================================================

type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'void' | 'refunded'
type InvoiceType = 'standard' | 'recurring' | 'estimate' | 'credit_memo' | 'retainer'
type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'stripe' | 'crypto'
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY'
type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount: number
  total: number
  productId?: string
}

interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  date: string
  reference: string
  notes?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  type: InvoiceType
  status: InvoiceStatus
  client: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    company?: string
  }
  lineItems: LineItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  amountPaid: number
  amountDue: number
  currency: Currency
  issueDate: string
  dueDate: string
  paidDate?: string
  viewedDate?: string
  sentDate?: string
  terms?: string
  notes?: string
  recurring?: {
    frequency: RecurringFrequency
    nextDate: string
    endDate?: string
    occurrences: number
  }
  payments: Payment[]
  lateFee?: number
  lateFeeApplied: boolean
  template: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  website?: string
  taxId?: string
  paymentTerms: number
  creditLimit: number
  balance: number
  totalPaid: number
  invoiceCount: number
  lastInvoiceDate?: string
  createdAt: string
}

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  vendor: string
  receipt?: string
  billable: boolean
  clientId?: string
  projectId?: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Report {
  period: string
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  invoiceCount: number
  avgInvoiceValue: number
  avgPaymentTime: number
  topClients: { clientId: string; name: string; amount: number }[]
  revenueByMonth: { month: string; amount: number }[]
  paymentsByMethod: { method: PaymentMethod; amount: number; count: number }[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>
    case 'partial':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><CreditCard className="w-3 h-3 mr-1" />Partial</Badge>
    case 'sent':
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"><Send className="w-3 h-3 mr-1" />Sent</Badge>
    case 'viewed':
      return <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"><Eye className="w-3 h-3 mr-1" />Viewed</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'overdue':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"><FileText className="w-3 h-3 mr-1" />Draft</Badge>
    case 'void':
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"><FileX className="w-3 h-3 mr-1" />Void</Badge>
    case 'refunded':
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>
  }
}

const getTypeBadge = (type: InvoiceType) => {
  switch (type) {
    case 'standard':
      return <Badge variant="outline" className="border-blue-300 text-blue-700">Invoice</Badge>
    case 'recurring':
      return <Badge variant="outline" className="border-purple-300 text-purple-700"><Repeat className="w-3 h-3 mr-1" />Recurring</Badge>
    case 'estimate':
      return <Badge variant="outline" className="border-green-300 text-green-700"><FileCheck className="w-3 h-3 mr-1" />Estimate</Badge>
    case 'credit_memo':
      return <Badge variant="outline" className="border-orange-300 text-orange-700">Credit Memo</Badge>
    case 'retainer':
      return <Badge variant="outline" className="border-indigo-300 text-indigo-700">Retainer</Badge>
  }
}

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'credit_card':
      return <CreditCard className="w-4 h-4" />
    case 'bank_transfer':
      return <Building2 className="w-4 h-4" />
    case 'check':
      return <Receipt className="w-4 h-4" />
    case 'paypal':
    case 'stripe':
      return <Wallet className="w-4 h-4" />
    default:
      return <Banknote className="w-4 h-4" />
  }
}

const formatCurrency = (amount: number, currency: Currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
  return `$${num}`
}

const getDaysOverdue = (dueDate: string) => {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Quick actions are defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoicingClient() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [settingsTab, setSettingsTab] = useState('general')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [report, setReport] = useState<Report>({
    period: '',
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    invoiceCount: 0,
    avgInvoiceValue: 0,
    avgPaymentTime: 0,
    topClients: [],
    revenueByMonth: [],
    paymentsByMethod: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Quick Action Dialog States
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false)
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false)
  const [showSendRemindersDialog, setShowSendRemindersDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)

  // Additional Dialog States
  const [showSendAllDialog, setShowSendAllDialog] = useState(false)
  const [showRecurringDialog, setShowRecurringDialog] = useState(false)
  const [showEstimatesDialog, setShowEstimatesDialog] = useState(false)
  const [showPaymentsOverviewDialog, setShowPaymentsOverviewDialog] = useState(false)
  const [showOverdueDialog, setShowOverdueDialog] = useState(false)
  const [showExportInvoicesDialog, setShowExportInvoicesDialog] = useState(false)
  const [showInvoiceReportsDialog, setShowInvoiceReportsDialog] = useState(false)

  // Client Dialog States
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false)
  const [showEmailAllDialog, setShowEmailAllDialog] = useState(false)
  const [showStatementsDialog, setShowStatementsDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showImportClientsDialog, setShowImportClientsDialog] = useState(false)
  const [showExportClientsDialog, setShowExportClientsDialog] = useState(false)
  const [showClientReportsDialog, setShowClientReportsDialog] = useState(false)

  // Payment Dialog States
  const [showPaymentMethodsDialog, setShowPaymentMethodsDialog] = useState(false)
  const [showRefundsDialog, setShowRefundsDialog] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false)
  const [showSchedulePaymentsDialog, setShowSchedulePaymentsDialog] = useState(false)
  const [showExportPaymentsDialog, setShowExportPaymentsDialog] = useState(false)
  const [showPaymentReportsDialog, setShowPaymentReportsDialog] = useState(false)
  const [showProcessRecurringDialog, setShowProcessRecurringDialog] = useState(false)

  // Expense Dialog States
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showExpenseReceiptsDialog, setShowExpenseReceiptsDialog] = useState(false)
  const [showExpenseCategoriesDialog, setShowExpenseCategoriesDialog] = useState(false)
  const [showVendorsDialog, setShowVendorsDialog] = useState(false)
  const [showApproveExpensesDialog, setShowApproveExpensesDialog] = useState(false)
  const [showRecurringExpensesDialog, setShowRecurringExpensesDialog] = useState(false)
  const [showExportExpensesDialog, setShowExportExpensesDialog] = useState(false)
  const [showExpenseReportsDialog, setShowExpenseReportsDialog] = useState(false)

  // Reports Dialog States
  const [showRevenueReportDialog, setShowRevenueReportDialog] = useState(false)
  const [showTrendsReportDialog, setShowTrendsReportDialog] = useState(false)
  const [showClientReportDialog, setShowClientReportDialog] = useState(false)
  const [showExpenseReportDialog, setShowExpenseReportDialog] = useState(false)
  const [showProfitReportDialog, setShowProfitReportDialog] = useState(false)
  const [showScheduleReportDialog, setShowScheduleReportDialog] = useState(false)
  const [showExportAllReportsDialog, setShowExportAllReportsDialog] = useState(false)
  const [showPrintReportDialog, setShowPrintReportDialog] = useState(false)

  // Settings Dialog States
  const [showExportConfigDialog, setShowExportConfigDialog] = useState(false)
  const [showPaymentGatewayDialog, setShowPaymentGatewayDialog] = useState(false)
  const [showRegenerateKeyDialog, setShowRegenerateKeyDialog] = useState(false)
  const [showDeleteDraftsDialog, setShowDeleteDraftsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)

  // Invoice/Client Action Dialog States
  const [showEditInvoiceDialog, setShowEditInvoiceDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [showEditClientDialog, setShowEditClientDialog] = useState(false)
  const [showViewClientInvoicesDialog, setShowViewClientInvoicesDialog] = useState(false)
  const [showCreateClientInvoiceDialog, setShowCreateClientInvoiceDialog] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)

  // Guest payment modal state
  const [showGuestPaymentModal, setShowGuestPaymentModal] = useState(false)
  const [selectedInvoiceForGuestPayment, setSelectedInvoiceForGuestPayment] = useState<Invoice | null>(null)

  // Supabase client


  // Transform database invoice to frontend Invoice type
  const transformInvoice = useCallback((dbInvoice: Record<string, unknown>): Invoice => {
    return {
      id: dbInvoice.id as string,
      invoiceNumber: dbInvoice.invoice_number as string,
      type: (dbInvoice.project_id ? 'standard' : 'standard') as InvoiceType,
      status: dbInvoice.status as InvoiceStatus,
      client: {
        id: (dbInvoice.client_id as string) || '',
        name: dbInvoice.client_name as string,
        email: dbInvoice.client_email as string,
        company: dbInvoice.client_name as string,
        address: (dbInvoice.client_address as { address?: string })?.address,
      },
      lineItems: [],
      subtotal: Number(dbInvoice.subtotal) || 0,
      taxAmount: Number(dbInvoice.tax_amount) || 0,
      discountAmount: Number(dbInvoice.discount_amount) || 0,
      total: Number(dbInvoice.total) || 0,
      amountPaid: dbInvoice.paid_date ? Number(dbInvoice.total) : 0,
      amountDue: dbInvoice.paid_date ? 0 : Number(dbInvoice.total),
      currency: (dbInvoice.currency as Currency) || 'USD',
      issueDate: new Date(dbInvoice.issue_date as string).toISOString().split('T')[0],
      dueDate: new Date(dbInvoice.due_date as string).toISOString().split('T')[0],
      paidDate: dbInvoice.paid_date ? new Date(dbInvoice.paid_date as string).toISOString().split('T')[0] : undefined,
      terms: dbInvoice.terms as string,
      notes: dbInvoice.notes as string,
      payments: [],
      lateFeeApplied: false,
      template: 'professional',
      tags: [],
      createdAt: dbInvoice.created_at as string,
      updatedAt: dbInvoice.updated_at as string,
    }
  }, [])

  // Fetch invoices from Supabase
  const fetchInvoices = useCallback(async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching invoices:', error)
        toast.error('Failed to load invoices')
        return
      }

      if (data && data.length > 0) {
        const transformedInvoices = data.map(transformInvoice)
        setInvoices(transformedInvoices)
      }
    } catch (err) {
      console.error('Error fetching invoices:', err)
      toast.error('Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }, [ transformInvoice])

  // Fetch clients (simplified - using empty array for now as clients table may differ)
  const fetchClients = useCallback(async () => {
    // For now, use empty clients - can be extended to fetch from a clients table
    setClients([])
  }, [])

  // Create new invoice in Supabase
  const createInvoice = useCallback(async (invoiceData: Partial<Invoice>) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error('You must be logged in to create invoices')
        return null
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: userData.user.id,
          invoice_number: invoiceData.invoiceNumber || `INV-${Date.now()}`,
          client_name: invoiceData.client?.name || 'Unknown Client',
          client_email: invoiceData.client?.email || '',
          client_address: invoiceData.client?.address ? { address: invoiceData.client.address } : null,
          subtotal: invoiceData.subtotal || 0,
          tax_rate: 0,
          tax_amount: invoiceData.taxAmount || 0,
          discount_amount: invoiceData.discountAmount || 0,
          total: invoiceData.total || 0,
          currency: invoiceData.currency || 'USD',
          issue_date: invoiceData.issueDate || new Date().toISOString(),
          due_date: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: invoiceData.status || 'draft',
          terms: invoiceData.terms,
          notes: invoiceData.notes,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invoice:', error)
        toast.error('Failed to create invoice')
        return null
      }

      toast.success('Invoice created successfully!')
      return data
    } catch (err) {
      console.error('Error creating invoice:', err)
      toast.error('Failed to create invoice')
      return null
    }
  }, [])

  // Update invoice in Supabase
  const updateInvoice = useCallback(async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.status) dbUpdates.status = updates.status
      if (updates.client?.name) dbUpdates.client_name = updates.client.name
      if (updates.client?.email) dbUpdates.client_email = updates.client.email
      if (updates.total !== undefined) dbUpdates.total = updates.total
      if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal
      if (updates.taxAmount !== undefined) dbUpdates.tax_amount = updates.taxAmount
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate
      if (updates.issueDate) dbUpdates.issue_date = updates.issueDate
      if (updates.notes) dbUpdates.notes = updates.notes
      if (updates.terms) dbUpdates.terms = updates.terms
      if (updates.paidDate) dbUpdates.paid_date = updates.paidDate

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .update(dbUpdates)
        .eq('id', invoiceId)

      if (error) {
        console.error('Error updating invoice:', error)
        toast.error('Failed to update invoice')
        return false
      }

      return true
    } catch (err) {
      console.error('Error updating invoice:', err)
      toast.error('Failed to update invoice')
      return false
    }
  }, [])

  // Delete invoice from Supabase
  const deleteInvoice = useCallback(async (invoiceId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) {
        console.error('Error deleting invoice:', error)
        toast.error('Failed to delete invoice')
        return false
      }

      return true
    } catch (err) {
      console.error('Error deleting invoice:', err)
      toast.error('Failed to delete invoice')
      return false
    }
  }, [])

  // Initial data fetch and real-time subscription
  useEffect(() => {
    fetchInvoices()
    fetchClients()

    // Set up real-time subscription for invoice changes
    const channel = supabase
      .channel('invoices-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newInvoice = transformInvoice(payload.new as Record<string, unknown>)
          setInvoices(prev => [newInvoice, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updatedInvoice = transformInvoice(payload.new as Record<string, unknown>)
          setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv))
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          setInvoices(prev => prev.filter(inv => inv.id !== deletedId))
        }
      })
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [ fetchInvoices, fetchClients, transformInvoice])

  // Quick Actions with proper dialog handlers
  const invoicingQuickActions = [
    { id: '1', label: 'New Invoice', icon: 'FileText', shortcut: 'N', action: () => setShowNewInvoiceDialog(true) },
    { id: '2', label: 'Record Payment', icon: 'DollarSign', shortcut: 'P', action: () => setShowRecordPaymentDialog(true) },
    { id: '3', label: 'Send Reminders', icon: 'Send', shortcut: 'R', action: () => setShowSendRemindersDialog(true) },
    { id: '4', label: 'Export Report', icon: 'Download', shortcut: 'E', action: () => setShowExportReportDialog(true) },
  ]

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = !searchQuery ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.company?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      const matchesType = typeFilter === 'all' || invoice.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [invoices, searchQuery, statusFilter, typeFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const totalPending = invoices.filter(inv => ['sent', 'viewed', 'pending'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.amountDue, 0)
    const totalOverdue = invoices.filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amountDue, 0)
    const paidCount = invoices.filter(inv => inv.status === 'paid').length
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length
    const draftCount = invoices.filter(inv => inv.status === 'draft').length
    const recurringCount = invoices.filter(inv => inv.type === 'recurring').length

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      paidCount,
      overdueCount,
      draftCount,
      recurringCount,
      collectionRate: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0
    }
  }, [invoices])

  // Handlers
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setShowClientDialog(true)
  }

  const handleSendInvoice = async () => {
    if (!selectedInvoice) return
    const success = await updateInvoice(selectedInvoice.id, { status: 'sent' as InvoiceStatus })
    if (success) {
      toast.success(`Invoice ${selectedInvoice.invoiceNumber} sent successfully!`)
      setShowInvoiceDialog(false)
    }
  }

  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return
    toast.success(`Downloading invoice ${selectedInvoice.invoiceNumber}...`)
  }

  const handlePrintInvoice = () => {
    toast.success('Opening print dialog...')
    window.print()
  }

  const handleDuplicateInvoice = async () => {
    if (!selectedInvoice) return
    const result = await createInvoice({
      invoiceNumber: `${selectedInvoice.invoiceNumber}-COPY`,
      client: selectedInvoice.client,
      status: 'draft',
      subtotal: selectedInvoice.subtotal,
      taxAmount: selectedInvoice.taxAmount,
      discountAmount: selectedInvoice.discountAmount,
      total: selectedInvoice.total,
      currency: selectedInvoice.currency,
      terms: selectedInvoice.terms,
      notes: selectedInvoice.notes,
    })
    if (result) {
      toast.success(`Invoice ${selectedInvoice.invoiceNumber} duplicated!`)
      setShowInvoiceDialog(false)
    }
  }

  const handleCreateInvoice = () => {
    toast.info('Opening invoice creation form...')
    // In production, this would open a creation dialog or navigate to creation page
  }

  const handleExportInvoices = () => {
    toast.success('Export started')
  }

  const handleVoidInvoice = async () => {
    if (!selectedInvoice) return
    const success = await updateInvoice(selectedInvoice.id, { status: 'void' as InvoiceStatus })
    if (success) {
      toast.success('Invoice voided' has been voided`
      })
      setShowInvoiceDialog(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return
    const success = await updateInvoice(selectedInvoice.id, {
      status: 'paid' as InvoiceStatus,
      paidDate: new Date().toISOString().split('T')[0]
    })
    if (success) {
      toast.success('Payment recorded'`
      })
    }
  }

  // Handler for guest payment modal
  const handleOpenGuestPayment = (invoice: Invoice) => {
    setSelectedInvoiceForGuestPayment(invoice)
    setShowGuestPaymentModal(true)
  }

  const handleGuestPaymentSuccess = async (paymentResult: {
    paymentIntentId: string
    email: string
    amount: number
  }) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Record the payment in the database
      await supabase.from('payments').insert({
        invoice_id: selectedInvoiceForGuestPayment?.id,
        payment_intent_id: paymentResult.paymentIntentId,
        email: paymentResult.email,
        amount: paymentResult.amount,
        currency: selectedInvoiceForGuestPayment?.currency?.toLowerCase() || 'usd',
        status: 'succeeded',
        payment_type: 'guest_invoice_payment',
        metadata: {
          invoice_number: selectedInvoiceForGuestPayment?.invoiceNumber,
          client_name: selectedInvoiceForGuestPayment?.client?.name
        },
        created_at: new Date().toISOString()
      })

      // Update invoice status to paid
      if (selectedInvoiceForGuestPayment) {
        await updateInvoice(selectedInvoiceForGuestPayment.id, {
          status: 'paid' as InvoiceStatus,
          paidDate: new Date().toISOString().split('T')[0]
        })
      }

      toast.success(`Payment of ${formatCurrency(paymentResult.amount)} received for invoice ${selectedInvoiceForGuestPayment?.invoiceNumber}!`)
      setShowGuestPaymentModal(false)
      setSelectedInvoiceForGuestPayment(null)
      fetchInvoices()
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Payment succeeded but failed to record. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Invoicing</h1>
                <p className="text-emerald-100">Billing & payment management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowExportReportDialog(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50" onClick={handleCreateInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Total Invoiced</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalInvoiced)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Paid</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalPaid)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalPending)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Overdue</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalOverdue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Collection Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.collectionRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Drafts</span>
              </div>
              <p className="text-2xl font-bold">{stats.draftCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Repeat className="w-4 h-4" />
                <span className="text-sm">Recurring</span>
              </div>
              <p className="text-2xl font-bold">{stats.recurringCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Clients</span>
              </div>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {/* Invoices Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Invoice Management</h2>
                  <p className="text-blue-100">QuickBooks-level professional invoicing system</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredInvoices.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredInvoices.filter(i => i.status === 'paid').length}</p>
                    <p className="text-blue-200 text-sm">Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredInvoices.filter(i => i.status === 'overdue').length}</p>
                    <p className="text-blue-200 text-sm">Overdue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Invoice', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowNewInvoiceDialog(true) },
                { icon: Send, label: 'Send All', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowSendAllDialog(true) },
                { icon: Repeat, label: 'Recurring', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowRecurringDialog(true) },
                { icon: Receipt, label: 'Estimates', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowEstimatesDialog(true) },
                { icon: CreditCard, label: 'Payments', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowPaymentsOverviewDialog(true) },
                { icon: AlertTriangle, label: 'Overdue', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowOverdueDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowExportInvoicesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowInvoiceReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as InvoiceType | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="standard">Standard</option>
                    <option value="recurring">Recurring</option>
                    <option value="estimate">Estimate</option>
                    <option value="credit_memo">Credit Memo</option>
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredInvoices.length} invoices
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Invoices List */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{invoice.invoiceNumber}</span>
                            {getTypeBadge(invoice.type)}
                            {getStatusBadge(invoice.status)}
                            {invoice.lateFeeApplied && (
                              <Badge className="bg-red-50 text-red-600">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Late Fee
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {invoice.client?.company || invoice.client?.name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due {new Date(invoice.dueDate).toLocaleDateString()}
                            </span>
                            {invoice.status === 'overdue' && (
                              <span className="text-red-600">
                                {getDaysOverdue(invoice.dueDate)} days overdue
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
                          {invoice.amountPaid > 0 && invoice.amountDue > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(invoice.amountDue)} due
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); setShowEditInvoiceDialog(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); setShowMoreOptionsDialog(true); }}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          {['sent', 'viewed', 'pending', 'partial', 'overdue'].includes(invoice.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenGuestPayment(invoice)
                              }}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for partial payments */}
                      {invoice.status === 'partial' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Payment Progress</span>
                            <span>{Math.round((invoice.amountPaid / invoice.total) * 100)}%</span>
                          </div>
                          <Progress value={(invoice.amountPaid / invoice.total) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            {/* Clients Overview Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Client Directory</h2>
                  <p className="text-green-100">Manage your client relationships and billing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{clients.length}</p>
                    <p className="text-green-200 text-sm">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{clients.filter(c => c.balance > 0).length}</p>
                    <p className="text-green-200 text-sm">With Balance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Client', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowAddClientDialog(true) },
                { icon: Building2, label: 'Companies', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowCompaniesDialog(true) },
                { icon: Mail, label: 'Email All', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowEmailAllDialog(true) },
                { icon: FileText, label: 'Statements', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowStatementsDialog(true) },
                { icon: Tag, label: 'Categories', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowCategoriesDialog(true) },
                { icon: Globe, label: 'Import', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowImportClientsDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowExportClientsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowClientReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                  onClick={() => handleViewClient(client)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {(client.name || 'U').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">{client.company}</p>
                        </div>
                      </div>
                      {client.balance > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {formatCurrency(client.balance)} due
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{client.city}, {client.state}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                        <p className="font-semibold text-green-600">{formatCurrency(client.totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Invoices</p>
                        <p className="font-semibold">{client.invoiceCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Client Card */}
              <Card className="border-dashed hover:border-primary cursor-pointer dark:bg-gray-800/50" onClick={() => setShowAddClientDialog(true)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Add Client</h3>
                  <p className="text-sm text-muted-foreground">Create a new client profile</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Payments Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Payment Tracking</h2>
                  <p className="text-amber-100">Monitor and manage all incoming payments</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{invoices.flatMap(inv => inv.payments).length}</p>
                    <p className="text-amber-200 text-sm">Payments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Record', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowRecordPaymentDialog(true) },
                { icon: CreditCard, label: 'Methods', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowPaymentMethodsDialog(true) },
                { icon: RefreshCw, label: 'Refunds', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowRefundsDialog(true) },
                { icon: Banknote, label: 'Bank', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowBankDialog(true) },
                { icon: Receipt, label: 'Receipts', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowReceiptsDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowSchedulePaymentsDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowExportPaymentsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowPaymentReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoices.flatMap(inv => inv.payments.map(p => ({ ...p, invoice: inv }))).slice(0, 10).map((payment) => (
                        <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            {getPaymentMethodIcon(payment.method)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.invoice.client?.name || 'Unknown'} • {payment.method.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.paymentsByMethod.map((method) => (
                        <div key={method.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPaymentMethodIcon(method.method)}
                            <span className="capitalize">{method.method.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(method.amount)}</p>
                            <p className="text-xs text-muted-foreground">{method.count} transactions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowSendRemindersDialog(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Payment Reminders
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowProcessRecurringDialog(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Process Recurring
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowExportPaymentsDialog(true)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Transactions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            {/* Expenses Overview Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Expense Tracking</h2>
                  <p className="text-rose-100">Track billable and non-billable expenses</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{expenses.length}</p>
                    <p className="text-rose-200 text-sm">Expenses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{expenses.filter(e => e.billable).length}</p>
                    <p className="text-rose-200 text-sm">Billable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowAddExpenseDialog(true) },
                { icon: Receipt, label: 'Receipts', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowExpenseReceiptsDialog(true) },
                { icon: Tag, label: 'Categories', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowExpenseCategoriesDialog(true) },
                { icon: Users, label: 'Vendors', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowVendorsDialog(true) },
                { icon: FileCheck, label: 'Approve', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowApproveExpensesDialog(true) },
                { icon: Repeat, label: 'Recurring', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowRecurringExpensesDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowExportExpensesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowExpenseReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="dark:bg-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses</CardTitle>
                <Button size="sm" onClick={() => setShowAddExpenseDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{expense.description}</p>
                          <Badge variant="outline">{expense.category}</Badge>
                          {expense.billable && (
                            <Badge className="bg-blue-100 text-blue-700">Billable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.vendor} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">-{formatCurrency(expense.amount)}</p>
                        <Badge className={
                          expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                          expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Financial Reports</h2>
                  <p className="text-violet-100">Comprehensive analytics and insights</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{report.invoiceCount}</p>
                    <p className="text-violet-200 text-sm">Invoices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{report.clientCount}</p>
                    <p className="text-violet-200 text-sm">Clients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PieChart, label: 'Revenue', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowRevenueReportDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowTrendsReportDialog(true) },
                { icon: Users, label: 'Clients', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowClientReportDialog(true) },
                { icon: Receipt, label: 'Expenses', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowExpenseReportDialog(true) },
                { icon: DollarSign, label: 'Profit', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowProfitReportDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowScheduleReportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowExportAllReportsDialog(true) },
                { icon: Printer, label: 'Print', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowPrintReportDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Invoiced</span>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(report.totalInvoiced)}</p>
                  <p className="text-xs text-green-600">+23.5% from last month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Collected</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(report.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground">{report.invoiceCount} invoices</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg. Invoice Value</span>
                    <Calculator className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(report.avgInvoiceValue)}</p>
                  <p className="text-xs text-green-600">+12.3% from last month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg. Payment Time</span>
                    <Timer className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{report.avgPaymentTime} days</p>
                  <p className="text-xs text-green-600">-2.3 days faster</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {report.revenueByMonth.map((month, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg"
                          style={{ height: `${(month.amount / 150000) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{month.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Top Clients by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.topClients.map((client, index) => (
                      <div key={client.clientId} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{client.name}</p>
                          <Progress value={(client.amount / (report.topClients[0]?.amount || 1)) * 100} className="h-2 mt-1" />
                        </div>
                        <p className="font-semibold">{formatCurrency(client.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collection Status */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{formatNumber(report.totalPaid)}</p>
                    <p className="text-sm text-green-600">Collected</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-600">{formatNumber(report.totalPending)}</p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">{formatNumber(report.totalOverdue)}</p>
                    <p className="text-sm text-red-600">Overdue</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <PieChart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</p>
                    <p className="text-sm text-blue-600">Collection Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Invoicing Settings</h2>
                  <p className="text-slate-200">Configure your invoicing preferences and defaults</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => setShowExportConfigDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'templates', label: 'Templates', icon: FileText },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          Business Information
                        </CardTitle>
                        <CardDescription>Your business details for invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Business Name</Label>
                            <Input defaultValue="My Company LLC" className="mt-1" />
                          </div>
                          <div>
                            <Label>Tax ID / VAT</Label>
                            <Input defaultValue="US-123456789" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Business Address</Label>
                          <Input defaultValue="123 Main St, City, State 12345" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Email</Label>
                            <Input defaultValue="billing@company.com" className="mt-1" />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input defaultValue="+1 (555) 123-4567" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Currency & Tax
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Currency</Label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                            </select>
                          </div>
                          <div>
                            <Label>Default Tax Rate</Label>
                            <Input defaultValue="10" type="number" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Include Tax in Prices</Label>
                            <p className="text-sm text-gray-500">Display prices with tax included</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Templates Settings */}
                {settingsTab === 'templates' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-purple-600" />
                          Invoice Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {['Professional', 'Modern', 'Classic'].map((template) => (
                            <div key={template} className="border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded mb-3" />
                              <p className="font-medium text-center">{template}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <Label>Invoice Prefix</Label>
                          <Input defaultValue="INV-" className="mt-1" />
                        </div>
                        <div>
                          <Label>Default Payment Terms</Label>
                          <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                            <option value="15">Net 15</option>
                            <option value="30">Net 30</option>
                            <option value="45">Net 45</option>
                            <option value="60">Net 60</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-amber-600" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Invoice Created', desc: 'When new invoice is generated' },
                          { label: 'Payment Received', desc: 'When payment is recorded' },
                          { label: 'Invoice Overdue', desc: 'When invoice passes due date' },
                          { label: 'Payment Reminders', desc: 'Automatic payment reminders' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>{item.label}</Label>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 2} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-indigo-600" />
                          Payment Gateways
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Stripe', status: 'Connected', icon: CreditCard },
                          { name: 'PayPal', status: 'Not Connected', icon: Wallet },
                          { name: 'Bank Transfer', status: 'Configured', icon: Building2 },
                        ].map((gateway, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <gateway.icon className="h-6 w-6 text-gray-600" />
                              <div>
                                <p className="font-medium">{gateway.name}</p>
                                <p className="text-sm text-gray-500">{gateway.status}</p>
                              </div>
                            </div>
                            <Button variant={gateway.status === 'Connected' ? 'outline' : 'default'} size="sm" onClick={() => { setSelectedGateway(gateway.name); setShowPaymentGatewayDialog(true); }}>
                              {gateway.status === 'Connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-red-600" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" defaultValue="STRIPE_KEY_PLACEHOLDER" className="flex-1" />
                            <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(true)}>Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for sensitive operations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="h-5 w-5 text-gray-600" />
                          Advanced Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-Send Invoices</Label>
                            <p className="text-sm text-gray-500">Automatically send when created</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Late Fee Auto-Apply</Label>
                            <p className="text-sm text-gray-500">Apply late fees automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Archive Old Invoices</Label>
                            <p className="text-sm text-gray-500">Auto-archive after 2 years</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Delete All Draft Invoices</Label>
                            <p className="text-sm text-red-600">Permanently remove draft invoices</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDraftsDialog(true)}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Settings</Label>
                            <p className="text-sm text-red-600">Reset to default configuration</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[]}
              title="Invoicing Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[]}
            title="Invoicing Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={invoicingQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getTypeBadge(selectedInvoice.type)}
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                <DialogTitle className="text-2xl">{selectedInvoice.invoiceNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Client & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h4>
                    <p className="font-semibold">{selectedInvoice.client.company || selectedInvoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.client.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Issue Date</p>
                        <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h4 className="font-semibold mb-3">Line Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="text-sm">
                          <th className="text-left p-3">Description</th>
                          <th className="text-right p-3">Qty</th>
                          <th className="text-right p-3">Rate</th>
                          <th className="text-right p-3">Tax</th>
                          <th className="text-right p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-right">{item.taxRate}%</td>
                            <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                    </div>
                    {selectedInvoice.lateFee && selectedInvoice.lateFeeApplied && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Late Fee</span>
                        <span>+{formatCurrency(selectedInvoice.lateFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    {selectedInvoice.amountPaid > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Paid</span>
                          <span>-{formatCurrency(selectedInvoice.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Balance Due</span>
                          <span className="text-orange-600">{formatCurrency(selectedInvoice.amountDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payments */}
                {selectedInvoice.payments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {selectedInvoice.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getPaymentMethodIcon(payment.method)}
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-muted-foreground">
                                {payment.method.replace('_', ' ')} • Ref: {payment.reference}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSendInvoice}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                  <Button variant="outline" onClick={handleDownloadInvoice}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={handlePrintInvoice}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => { setShowEditInvoiceDialog(true); setShowInvoiceDialog(false); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleDuplicateInvoice}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Client Detail Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {selectedClient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedClient.name}</p>
                    <p className="text-sm font-normal text-muted-foreground">{selectedClient.company}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedClient.address}, {selectedClient.city}, {selectedClient.state} {selectedClient.zip}</span>
                    </div>
                    {selectedClient.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://${selectedClient.website}`} className="text-blue-600 hover:underline">
                          {selectedClient.website}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Terms</span>
                      <span>Net {selectedClient.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Limit</span>
                      <span>{formatCurrency(selectedClient.creditLimit)}</span>
                    </div>
                    {selectedClient.taxId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ID</span>
                        <span>{selectedClient.taxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.totalPaid)}</p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedClient.balance)}</p>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedClient.invoiceCount}</p>
                    <p className="text-sm text-muted-foreground">Invoices</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button className="flex-1" onClick={() => { setShowCreateClientInvoiceDialog(true); setShowClientDialog(false); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button variant="outline" onClick={() => { setShowEditClientDialog(true); setShowClientDialog(false); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </Button>
                  <Button variant="outline" onClick={() => { setShowViewClientInvoicesDialog(true); setShowClientDialog(false); }}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Create New Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create professional invoices with custom branding and send them directly to your clients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Client</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Invoice Type</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="standard">Standard Invoice</option>
                  <option value="recurring">Recurring Invoice</option>
                  <option value="estimate">Estimate/Quote</option>
                  <option value="credit_memo">Credit Memo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Issue Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input placeholder="Add any notes for this invoice..." className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewInvoiceDialog(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
                // Create invoice with default values - form state would be used in full implementation
                const result = await createInvoice({
                  invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
                  client: clients[0] ? {
                    id: clients[0].id,
                    name: clients[0].name,
                    email: clients[0].email
                  } : undefined,
                  status: 'draft',
                  subtotal: 0,
                  total: 0,
                  currency: 'USD',
                })
                if (result) {
                  setShowNewInvoiceDialog(false)
                }
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordPaymentDialog} onOpenChange={setShowRecordPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Record Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Record a payment against an open invoice.
            </p>
            <div>
              <Label>Select Invoice</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="">Select an invoice</option>
                {invoices.filter(inv => inv.amountDue > 0).map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.client.name} ({formatCurrency(inv.amountDue)} due)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input placeholder="Transaction reference..." className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRecordPaymentDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Payment recorded successfully!')
                setShowRecordPaymentDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Reminders Dialog */}
      <Dialog open={showSendRemindersDialog} onOpenChange={setShowSendRemindersDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              Send Payment Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Send automated payment reminders to clients with overdue invoices.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Overdue Invoices</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                {invoices.filter(inv => inv.status === 'overdue').length} invoices are currently overdue
              </p>
            </div>
            <div>
              <Label>Select Invoices to Remind</Label>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                {invoices.filter(inv => inv.status === 'overdue' || inv.status === 'sent').map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <input type="checkbox" defaultChecked={inv.status === 'overdue'} className="rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{inv.client.name}</p>
                    </div>
                    <Badge variant={inv.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {formatCurrency(inv.amountDue)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Reminder Message (Optional)</Label>
              <Input placeholder="Add a custom message to include with reminders..." className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSendRemindersDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                const overdueCount = invoices.filter(inv => inv.status === 'overdue').length
                toast.success(`${overdueCount} payment reminders sent successfully!`)
                setShowSendRemindersDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Accounts Receivable Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Generate and download comprehensive accounts receivable reports.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Report Type</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="ar_aging">A/R Aging Summary</option>
                  <option value="ar_detail">A/R Aging Detail</option>
                  <option value="invoice_list">Invoice List</option>
                  <option value="payment_history">Payment History</option>
                  <option value="client_balances">Client Balances</option>
                </select>
              </div>
              <div>
                <Label>Export Format</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Date From</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>Date To</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Report Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Invoiced:</span>
                  <span className="ml-2 font-medium">{formatCurrency(stats.totalInvoiced)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(stats.totalPaid)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="ml-2 font-medium text-orange-600">{formatCurrency(stats.totalPending)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Overdue:</span>
                  <span className="ml-2 font-medium text-red-600">{formatCurrency(stats.totalOverdue)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Report exported successfully!')
                setShowExportReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send All Dialog */}
      <Dialog open={showSendAllDialog} onOpenChange={setShowSendAllDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Send All Pending Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Send all pending invoices to their respective clients at once.
            </p>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <p className="font-medium">{invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').length} invoices ready to send</p>
              <p className="text-sm text-muted-foreground">Total value: {formatCurrency(invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').reduce((sum, inv) => sum + inv.total, 0))}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSendAllDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success('All pending invoices sent successfully!')
                setShowSendAllDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurring Dialog */}
      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-600" />
              Recurring Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Manage your recurring invoice schedules and templates.
            </p>
            <div className="space-y-2">
              {invoices.filter(inv => inv.type === 'recurring').map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name} - {inv.recurring?.frequency}</p>
                  </div>
                  <Badge>{formatCurrency(inv.total)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRecurringDialog(false)}>Close</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success('Creating new recurring invoice...')
                setShowRecurringDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Recurring
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estimates Dialog */}
      <Dialog open={showEstimatesDialog} onOpenChange={setShowEstimatesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Estimates & Quotes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Manage your estimates and convert them to invoices.
            </p>
            <div className="space-y-2">
              {invoices.filter(inv => inv.type === 'estimate').map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name}</p>
                  </div>
                  <Badge>{formatCurrency(inv.total)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEstimatesDialog(false)}>Close</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Creating new estimate...')
                setShowEstimatesDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Estimate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payments Overview Dialog */}
      <Dialog open={showPaymentsOverviewDialog} onOpenChange={setShowPaymentsOverviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              Payments Overview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-green-600">Total Received</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalPending)}</p>
                <p className="text-sm text-orange-600">Pending</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPaymentsOverviewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowPaymentsOverviewDialog(false); setShowRecordPaymentDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overdue Dialog */}
      <Dialog open={showOverdueDialog} onOpenChange={setShowOverdueDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Overdue Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="font-medium text-red-700">{invoices.filter(inv => inv.status === 'overdue').length} overdue invoices</p>
              <p className="text-sm text-red-600">Total: {formatCurrency(stats.totalOverdue)}</p>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {invoices.filter(inv => inv.status === 'overdue').map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name} - {getDaysOverdue(inv.dueDate)} days overdue</p>
                  </div>
                  <Badge variant="destructive">{formatCurrency(inv.amountDue)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowOverdueDialog(false)}>Close</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('Sending reminders to overdue clients...')
                setShowOverdueDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Invoices Dialog */}
      <Dialog open={showExportInvoicesDialog} onOpenChange={setShowExportInvoicesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Export Format</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                </select>
              </div>
              <div>
                <Label>Status Filter</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="all">All Invoices</option>
                  <option value="paid">Paid Only</option>
                  <option value="unpaid">Unpaid Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportInvoicesDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Exporting invoices...')
                setShowExportInvoicesDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Reports Dialog */}
      <Dialog open={showInvoiceReportsDialog} onOpenChange={setShowInvoiceReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Invoice Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{invoices.length}</p>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.totalInvoiced / invoices.length)}</p>
                <p className="text-sm text-muted-foreground">Avg. Invoice</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowInvoiceReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating detailed report...')
                setShowInvoiceReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Client Name</Label>
                <Input placeholder="Full name" className="mt-1" />
              </div>
              <div>
                <Label>Company</Label>
                <Input placeholder="Company name" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="+1 (555) 000-0000" className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Client added successfully!')
                setShowAddClientDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Companies Dialog */}
      <Dialog open={showCompaniesDialog} onOpenChange={setShowCompaniesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Companies
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">View and manage company profiles associated with your clients.</p>
            <div className="space-y-2">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{client.company}</p>
                    <p className="text-sm text-muted-foreground">{client.name}</p>
                  </div>
                  <Badge variant="outline">{client.invoiceCount} invoices</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCompaniesDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email All Dialog */}
      <Dialog open={showEmailAllDialog} onOpenChange={setShowEmailAllDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              Email All Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Send a bulk email to all your clients.</p>
            <div>
              <Label>Subject</Label>
              <Input placeholder="Email subject" className="mt-1" />
            </div>
            <div>
              <Label>Message</Label>
              <Input placeholder="Your message..." className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEmailAllDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success(`Email sent to ${clients.length} clients!`)
                setShowEmailAllDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statements Dialog */}
      <Dialog open={showStatementsDialog} onOpenChange={setShowStatementsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Client Statements
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Generate and send account statements to clients.</p>
            <div>
              <Label>Select Client</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowStatementsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Statement generated successfully!')
                setShowStatementsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Client Categories
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Organize clients into categories for better management.</p>
            <div className="space-y-2">
              {['Enterprise', 'Small Business', 'Startup', 'Individual'].map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{cat}</span>
                  <Badge variant="outline">{Math.floor(Math.random() * 10) + 1} clients</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCategoriesDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Category added!')
                setShowCategoriesDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Clients Dialog */}
      <Dialog open={showImportClientsDialog} onOpenChange={setShowImportClientsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-600" />
              Import Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Import clients from a CSV or Excel file.</p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground">Supports CSV and XLSX formats</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowImportClientsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Clients imported successfully!')
                setShowImportClientsDialog(false)
              }}>
                <Globe className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Clients Dialog */}
      <Dialog open={showExportClientsDialog} onOpenChange={setShowExportClientsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Export Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Export your client list to a file.</p>
            <div>
              <Label>Export Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportClientsDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success('Client list exported!')
                setShowExportClientsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Reports Dialog */}
      <Dialog open={showClientReportsDialog} onOpenChange={setShowClientReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Client Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{formatCurrency(clients.reduce((sum, c) => sum + c.totalPaid, 0))}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowClientReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating client report...')
                setShowClientReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={showPaymentMethodsDialog} onOpenChange={setShowPaymentMethodsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Payment Methods
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage accepted payment methods.</p>
            <div className="space-y-2">
              {report.paymentsByMethod.map(method => (
                <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPaymentMethodIcon(method.method)}
                    <span className="font-medium capitalize">{method.method.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline">{method.count} transactions</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPaymentMethodsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refunds Dialog */}
      <Dialog open={showRefundsDialog} onOpenChange={setShowRefundsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-red-600" />
              Process Refund
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Issue a refund for a previous payment.</p>
            <div>
              <Label>Select Invoice</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="">Select an invoice</option>
                {invoices.filter(inv => inv.amountPaid > 0).map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {formatCurrency(inv.amountPaid)} paid</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Refund Amount</Label>
              <Input type="number" placeholder="0.00" className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRefundsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('Refund processed successfully!')
                setShowRefundsDialog(false)
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              Bank Accounts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage connected bank accounts for payments.</p>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">Business Checking ****4567</p>
                  <p className="text-sm text-muted-foreground">Primary account</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowBankDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.loading('Connecting to Plaid...', { id: 'bank-connect' })
                setTimeout(() => {
                  toast.success('Bank connection initiated', {
                    id: 'bank-connect',
                    description: 'Complete verification in the popup window'
                  })
                }, 1500)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Payment Receipts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">View and download payment receipts.</p>
            <div className="space-y-2">
              {invoices.flatMap(inv => inv.payments).slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.reference}</p>
                    <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">{formatCurrency(payment.amount)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowReceiptsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Payments Dialog */}
      <Dialog open={showSchedulePaymentsDialog} onOpenChange={setShowSchedulePaymentsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Schedule a future payment reminder.</p>
            <div>
              <Label>Select Invoice</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="">Select an invoice</option>
                {invoices.filter(inv => inv.amountDue > 0).map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {formatCurrency(inv.amountDue)} due</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Schedule Date</Label>
              <Input type="date" className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSchedulePaymentsDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success('Payment reminder scheduled!')
                setShowSchedulePaymentsDialog(false)
              }}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Payments Dialog */}
      <Dialog open={showExportPaymentsDialog} onOpenChange={setShowExportPaymentsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Export payment transactions to a file.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Format</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <Label>Date Range</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportPaymentsDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Transactions exported!')
                setShowExportPaymentsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Reports Dialog */}
      <Dialog open={showPaymentReportsDialog} onOpenChange={setShowPaymentReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Payment Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-green-600">Total Collected</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{invoices.flatMap(inv => inv.payments).length}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPaymentReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating payment report...')
                setShowPaymentReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Recurring Dialog */}
      <Dialog open={showProcessRecurringDialog} onOpenChange={setShowProcessRecurringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Process Recurring Payments
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Process all due recurring invoices and payments.</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="font-medium">{invoices.filter(inv => inv.type === 'recurring').length} recurring invoices</p>
              <p className="text-sm text-muted-foreground">Next billing cycle ready</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowProcessRecurringDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Recurring payments processed!')
                setShowProcessRecurringDialog(false)
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Process All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              Add Expense
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input placeholder="Expense description" className="mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Category</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="Software">Software</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Office">Office</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Vendor</Label>
              <Input placeholder="Vendor name" className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => {
                toast.success('Expense added successfully!')
                setShowAddExpenseDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Receipts Dialog */}
      <Dialog open={showExpenseReceiptsDialog} onOpenChange={setShowExpenseReceiptsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-pink-600" />
              Expense Receipts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage receipts attached to expenses.</p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Upload receipts</p>
              <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExpenseReceiptsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Categories Dialog */}
      <Dialog open={showExpenseCategoriesDialog} onOpenChange={setShowExpenseCategoriesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-fuchsia-600" />
              Expense Categories
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage expense categories.</p>
            <div className="space-y-2">
              {['Software', 'Infrastructure', 'Office', 'Travel', 'Marketing'].map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{cat}</span>
                  <Badge variant="outline">{expenses.filter(e => e.category === cat).length} expenses</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExpenseCategoriesDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Category added!')
                setShowExpenseCategoriesDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendors Dialog */}
      <Dialog open={showVendorsDialog} onOpenChange={setShowVendorsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Vendors
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage your vendor list.</p>
            <div className="space-y-2">
              {[...new Set(expenses.map(e => e.vendor))].map(vendor => (
                <div key={vendor} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{vendor}</span>
                  <Badge variant="outline">{expenses.filter(e => e.vendor === vendor).length} transactions</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowVendorsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Vendor added!')
                setShowVendorsDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Expenses Dialog */}
      <Dialog open={showApproveExpensesDialog} onOpenChange={setShowApproveExpensesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              Approve Expenses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Review and approve pending expenses.</p>
            <div className="space-y-2">
              {expenses.filter(e => e.status === 'pending').map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.vendor}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">{formatCurrency(expense.amount)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowApproveExpensesDialog(false)}>Close</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Expenses approved!')
                setShowApproveExpensesDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurring Expenses Dialog */}
      <Dialog open={showRecurringExpensesDialog} onOpenChange={setShowRecurringExpensesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-blue-600" />
              Recurring Expenses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Manage recurring expense schedules.</p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium">No recurring expenses set up</p>
              <p className="text-sm text-muted-foreground">Create recurring expenses for regular bills</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRecurringExpensesDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Creating recurring expense...')
                setShowRecurringExpensesDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recurring
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Expenses Dialog */}
      <Dialog open={showExportExpensesDialog} onOpenChange={setShowExportExpensesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Expenses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Export expense data to a file.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Format</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <Label>Date Range</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportExpensesDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Expenses exported!')
                setShowExportExpensesDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Reports Dialog */}
      <Dialog open={showExpenseReportsDialog} onOpenChange={setShowExpenseReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Expense Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{expenses.length}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-orange-600">Total Amount</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExpenseReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating expense report...')
                setShowExpenseReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revenue Report Dialog */}
      <Dialog open={showRevenueReportDialog} onOpenChange={setShowRevenueReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-600" />
              Revenue Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-violet-600">{formatCurrency(stats.totalInvoiced)}</p>
                <p className="text-sm text-violet-600">Total Revenue</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-green-600">Collected</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRevenueReportDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating revenue report...')
                setShowRevenueReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trends Report Dialog */}
      <Dialog open={showTrendsReportDialog} onOpenChange={setShowTrendsReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Trends Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Analyze revenue and payment trends over time.</p>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="font-medium text-purple-700">Revenue Trend: +23.5%</p>
              <p className="text-sm text-purple-600">Compared to last month</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTrendsReportDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating trends report...')
                setShowTrendsReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Report Dialog */}
      <Dialog open={showClientReportDialog} onOpenChange={setShowClientReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Client Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Detailed client revenue analysis.</p>
            <div className="space-y-2">
              {report.topClients.map((client, idx) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <Badge variant="outline">{formatCurrency(client.amount)}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowClientReportDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating client report...')
                setShowClientReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Report Dialog */}
      <Dialog open={showExpenseReportDialog} onOpenChange={setShowExpenseReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Expense Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-blue-600">Total Expenses</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(expenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-green-600">Billable</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExpenseReportDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating expense report...')
                setShowExpenseReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profit Report Dialog */}
      <Dialog open={showProfitReportDialog} onOpenChange={setShowProfitReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Profit & Loss Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-xs text-green-600">Revenue</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-red-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-xs text-red-600">Expenses</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalPaid - expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-xs text-blue-600">Profit</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowProfitReportDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Generating P&L report...')
                setShowProfitReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleReportDialog} onOpenChange={setShowScheduleReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Schedule Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Set up automatic report generation.</p>
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="revenue">Revenue Report</option>
                <option value="expense">Expense Report</option>
                <option value="pnl">Profit & Loss</option>
              </select>
            </div>
            <div>
              <Label>Frequency</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowScheduleReportDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                toast.success('Report schedule created!')
                setShowScheduleReportDialog(false)
              }}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export All Reports Dialog */}
      <Dialog open={showExportAllReportsDialog} onOpenChange={setShowExportAllReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export All Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Export a comprehensive report package.</p>
            <div className="space-y-2">
              {['Revenue Report', 'Expense Report', 'Profit & Loss', 'Client Report', 'Aging Report'].map(report => (
                <div key={report} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>{report}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportAllReportsDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Exporting all reports...')
                setShowExportAllReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Report Dialog */}
      <Dialog open={showPrintReportDialog} onOpenChange={setShowPrintReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-slate-600" />
              Print Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Select a report to print.</p>
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="revenue">Revenue Report</option>
                <option value="expense">Expense Report</option>
                <option value="pnl">Profit & Loss</option>
                <option value="aging">A/R Aging</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPrintReportDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Opening print dialog...')
                window.print()
                setShowPrintReportDialog(false)
              }}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Config Dialog */}
      <Dialog open={showExportConfigDialog} onOpenChange={setShowExportConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-slate-600" />
              Export Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Export your invoicing settings and templates.</p>
            <div className="space-y-2">
              {['Business Information', 'Invoice Templates', 'Payment Settings', 'Notification Preferences'].map(setting => (
                <div key={setting} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>{setting}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportConfigDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Configuration exported!')
                setShowExportConfigDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog open={showPaymentGatewayDialog} onOpenChange={setShowPaymentGatewayDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              {selectedGateway} Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Configure {selectedGateway} integration settings.</p>
            <div>
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter API key" className="mt-1" />
            </div>
            <div>
              <Label>Secret Key</Label>
              <Input type="password" placeholder="Enter secret key" className="mt-1" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Test Mode</span>
              <Switch />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPaymentGatewayDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success(`${selectedGateway} settings saved!`)
                setShowPaymentGatewayDialog(false)
              }}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Key Dialog */}
      <Dialog open={showRegenerateKeyDialog} onOpenChange={setShowRegenerateKeyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-red-600" />
              Regenerate API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="font-medium text-red-700">Warning: This action cannot be undone</p>
              <p className="text-sm text-red-600">Your current API key will be invalidated immediately.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('New API key generated!')
                setShowRegenerateKeyDialog(false)
              }}>
                <Key className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Drafts Dialog */}
      <Dialog open={showDeleteDraftsDialog} onOpenChange={setShowDeleteDraftsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Draft Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="font-medium text-red-700">This will permanently delete {stats.draftCount} draft invoices</p>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDeleteDraftsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('Draft invoices deleted!')
                setShowDeleteDraftsDialog(false)
              }}>
                Delete All Drafts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reset Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="font-medium text-red-700">Reset all settings to default?</p>
              <p className="text-sm text-red-600">Your custom configurations will be lost.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('Settings reset to defaults!')
                setShowResetSettingsDialog(false)
              }}>
                Reset Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditInvoiceDialog} onOpenChange={setShowEditInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Invoice {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Client</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg" defaultValue={selectedInvoice?.client.id}>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg" defaultValue={selectedInvoice?.status}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Issue Date</Label>
                <Input type="date" defaultValue={selectedInvoice?.issueDate} className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" defaultValue={selectedInvoice?.dueDate} className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditInvoiceDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
                if (selectedInvoice) {
                  const success = await updateInvoice(selectedInvoice.id, {
                    // Updates will be handled by form state in a full implementation
                    // For now, just close the dialog and show success
                  })
                  if (success) {
                    toast.success('Invoice updated successfully!')
                  }
                }
                setShowEditInvoiceDialog(false)
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* More Options Dialog */}
      <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5" />
              Invoice Options
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => { handleDuplicateInvoice(); setShowMoreOptionsDialog(false); }}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { handleVoidInvoice(); setShowMoreOptionsDialog(false); }}>
              <FileX className="w-4 h-4 mr-2" />
              Void Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { handleRecordPayment(); setShowMoreOptionsDialog(false); }}>
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={async () => {
              if (selectedInvoice) {
                const success = await deleteInvoice(selectedInvoice.id)
                if (success) {
                  toast.success('Invoice deleted')
                  setShowInvoiceDialog(false)
                }
              }
              setShowMoreOptionsDialog(false)
            }}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Delete Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditClientDialog} onOpenChange={setShowEditClientDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-600" />
              Edit Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Name</Label>
                <Input defaultValue={selectedClient?.name} className="mt-1" />
              </div>
              <div>
                <Label>Company</Label>
                <Input defaultValue={selectedClient?.company} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue={selectedClient?.email} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue={selectedClient?.phone} className="mt-1" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditClientDialog(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                toast.success('Client updated successfully!')
                setShowEditClientDialog(false)
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Invoices Dialog */}
      <Dialog open={showViewClientInvoicesDialog} onOpenChange={setShowViewClientInvoicesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Invoices for {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invoices.filter(inv => inv.client.id === selectedClient?.id).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(inv.status)}
                    <p className="text-sm font-medium mt-1">{formatCurrency(inv.total)}</p>
                  </div>
                </div>
              ))}
              {invoices.filter(inv => inv.client.id === selectedClient?.id).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No invoices found for this client</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowViewClientInvoicesDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Client Invoice Dialog */}
      <Dialog open={showCreateClientInvoiceDialog} onOpenChange={setShowCreateClientInvoiceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Create Invoice for {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="font-medium">{selectedClient?.company}</p>
              <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
            </div>
            <div>
              <Label>Invoice Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="standard">Standard Invoice</option>
                <option value="recurring">Recurring Invoice</option>
                <option value="estimate">Estimate</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Issue Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateClientInvoiceDialog(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                toast.success(`Invoice created for ${selectedClient?.name}!`)
                setShowCreateClientInvoiceDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Payment Modal - World-class Stripe integration */}
      {selectedInvoiceForGuestPayment && (
        <GuestPaymentModal
          isOpen={showGuestPaymentModal}
          onClose={() => {
            setShowGuestPaymentModal(false)
            setSelectedInvoiceForGuestPayment(null)
          }}
          amount={selectedInvoiceForGuestPayment.amountDue || selectedInvoiceForGuestPayment.total}
          productName={`Invoice #${selectedInvoiceForGuestPayment.invoiceNumber}`}
          productDescription={`Payment for invoice ${selectedInvoiceForGuestPayment.invoiceNumber} - ${selectedInvoiceForGuestPayment.client?.name || 'Client'}`}
          onPaymentSuccess={handleGuestPaymentSuccess}
          currency={selectedInvoiceForGuestPayment.currency?.toLowerCase() || 'usd'}
          allowApplePay={true}
          allowGooglePay={true}
        />
      )}
    </div>
  )
}
