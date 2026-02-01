'use client'

import { useState, useMemo } from 'react'
import {
  FileText, Plus, Send, Download, Clock, DollarSign, AlertCircle,
  CheckCircle2, XCircle, MoreHorizontal, Search, Filter, Calendar,
  RefreshCw, Users, CreditCard, Mail, Eye, Edit,
  Trash2, Copy, ArrowUpRight, ArrowDownRight, Sparkles,
  Globe, Percent, Receipt, Bell, Settings, Zap, FileSpreadsheet, Share2,
  Webhook, AlertOctagon, Sliders
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





import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useInvoices, type Invoice, type InvoiceStatus } from '@/lib/hooks/use-invoices'
import { toast } from 'sonner'

// Currency data
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

// Invoice templates
const invoiceTemplates = [
  { id: 'modern', name: 'Modern', description: 'Clean and professional', color: 'from-blue-500 to-indigo-600' },
  { id: 'classic', name: 'Classic', description: 'Traditional business style', color: 'from-gray-600 to-gray-800' },
  { id: 'creative', name: 'Creative', description: 'Bold and colorful', color: 'from-purple-500 to-pink-500' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', color: 'from-emerald-500 to-teal-500' },
]

// Reminder schedules
const reminderSchedules = [
  { id: '3days', label: '3 days before due', days: -3 },
  { id: '1day', label: '1 day before due', days: -1 },
  { id: 'dueday', label: 'On due date', days: 0 },
  { id: '3daysafter', label: '3 days after due', days: 3 },
  { id: '7daysafter', label: '7 days after due', days: 7 },
  { id: '14daysafter', label: '14 days after due', days: 14 },
]

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  tax: number
  amount: number
}

// Enhanced Competitive Upgrade Mock Data - Invoices Context
const mockInvoicesAIInsights = [
  { id: '1', type: 'warning' as const, title: 'Overdue Invoices', description: '5 invoices are past due totaling $12,450. Consider sending reminders.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Collections' },
  { id: '2', type: 'success' as const, title: 'Payment Trend', description: 'Average payment time reduced by 3 days this month. Great improvement!', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '3', type: 'info' as const, title: 'Revenue Forecast', description: 'Projected monthly revenue: $45,000 based on pending invoices.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Forecast' },
]

const mockInvoicesCollaborators = [
  { id: '1', name: 'Jennifer Park', avatar: '/avatars/jennifer.jpg', status: 'online' as const, role: 'Finance Manager', lastActive: 'Now' },
  { id: '2', name: 'Robert Taylor', avatar: '/avatars/robert.jpg', status: 'online' as const, role: 'Accountant', lastActive: '5m ago' },
  { id: '3', name: 'Maria Santos', avatar: '/avatars/maria.jpg', status: 'away' as const, role: 'Billing Specialist', lastActive: '25m ago' },
  { id: '4', name: 'Kevin O\'Brien', avatar: '/avatars/kevin.jpg', status: 'offline' as const, role: 'Controller', lastActive: '2h ago' },
]

const mockInvoicesPredictions = [
  { id: '1', label: 'Collection Rate', current: 87, target: 95, predicted: 92, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Avg Payment Days', current: 18, target: 14, predicted: 15, confidence: 75, trend: 'down' as const },
  { id: '3', label: 'Monthly Revenue', current: 38500, target: 45000, predicted: 42000, confidence: 80, trend: 'up' as const },
]

const mockInvoicesActivities = [
  { id: '1', user: 'Jennifer Park', action: 'approved', target: 'Invoice INV-2024-089', timestamp: '5m ago', type: 'success' as const },
  { id: '2', user: 'Robert Taylor', action: 'sent', target: 'payment reminder to 3 clients', timestamp: '15m ago', type: 'info' as const },
  { id: '3', user: 'Maria Santos', action: 'created', target: 'Invoice INV-2024-090', timestamp: '40m ago', type: 'info' as const },
  { id: '4', user: 'System', action: 'received', target: 'payment of $4,500 from TechCorp', timestamp: '1h ago', type: 'success' as const },
]

// Quick actions - will be populated with state setters inside component

export default function InvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [settingsTab, setSettingsTab] = useState('general')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  // Quick Action Dialog States
  const [showSendRemindersDialog, setShowSendRemindersDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false)

  // Additional Dialog States
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showEditInvoiceDialog, setShowEditInvoiceDialog] = useState(false)
  const [showEmailTemplateDialog, setShowEmailTemplateDialog] = useState(false)
  const [showPaymentGatewayDialog, setShowPaymentGatewayDialog] = useState(false)
  const [showPreviewInvoiceDialog, setShowPreviewInvoiceDialog] = useState(false)

  // Selected items for dialogs
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedGateway, setSelectedGateway] = useState<{ id: string; name: string; connected: boolean } | null>(null)
  const [selectedAccountingApp, setSelectedAccountingApp] = useState<{ id: string; name: string; connected: boolean } | null>(null)
  const [showAccountingAppDialog, setShowAccountingAppDialog] = useState(false)

  // API and integration state
  const [apiKey, setApiKey] = useState('inv_live_' + 'xxxxxxxxxxxxxxxxxx')
  const [invoiceNumberSequence, setInvoiceNumberSequence] = useState(1001)
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `Dear {{client_name}},

Please find attached invoice #{{invoice_number}} for {{currency}}{{amount}}.

Due Date: {{due_date}}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
{{company_name}}`
  })
  const [gateways, setGateways] = useState([
    { id: 'stripe', name: 'Stripe', connected: true, description: 'Credit cards & bank transfers' },
    { id: 'paypal', name: 'PayPal', connected: false, description: 'PayPal payments' },
    { id: 'square', name: 'Square', connected: false, description: 'In-person & online' },
    { id: 'wise', name: 'Wise', connected: false, description: 'International transfers' }
  ])
  const [accountingApps, setAccountingApps] = useState([
    { id: 'quickbooks', name: 'QuickBooks', connected: true, description: 'Sync invoices and payments' },
    { id: 'xero', name: 'Xero', connected: false, description: 'Two-way sync with Xero' },
    { id: 'freshbooks', name: 'FreshBooks', connected: false, description: 'Import/export invoices' },
    { id: 'wave', name: 'Wave', connected: false, description: 'Free accounting sync' }
  ])
  const [isSyncing, setIsSyncing] = useState(false)

  // Filter state
  const [filterSettings, setFilterSettings] = useState({
    status: 'all' as InvoiceStatus | 'all',
    minAmount: '',
    maxAmount: '',
    client: '',
    sortBy: 'date' as 'date' | 'amount' | 'client' | 'status'
  })

  // Invoice creation state
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    clientEmail: '',
    title: '',
    currency: 'USD',
    template: 'modern',
    dueDate: '',
    items: [] as LineItem[],
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.',
    enableReminders: true,
    reminderSchedule: ['3days', 'dueday', '7daysafter'],
    lateFee: { enabled: false, type: 'percentage' as 'percentage' | 'fixed', value: 5 },
    discount: { enabled: false, type: 'percentage' as 'percentage' | 'fixed', value: 0 },
    deposit: { enabled: false, percentage: 50 },
    recurring: { enabled: false, frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly', endDate: '' },
  })

  const { invoices, loading, error, createInvoice, updateInvoice, deleteInvoice, mutating, refetch } = useInvoices({ status: statusFilter, limit: 100 })
  const displayInvoices = (invoices && invoices.length > 0) ? invoices : (initialInvoices || [])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const paid = displayInvoices.filter(i => i.status === 'paid')
    const pending = displayInvoices.filter(i => i.status === 'pending' || i.status === 'sent')
    const overdue = displayInvoices.filter(i => i.status === 'overdue')
    const draft = displayInvoices.filter(i => i.status === 'draft')

    const totalRevenue = paid.reduce((sum, i) => sum + i.total_amount, 0)
    const pendingRevenue = pending.reduce((sum, i) => sum + i.total_amount, 0)
    const overdueAmount = overdue.reduce((sum, i) => sum + i.total_amount, 0)

    // Calculate trends (mock data for demo)
    const lastMonthRevenue = totalRevenue * 0.85
    const revenueGrowth = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

    // Average payment time
    const avgPaymentDays = 12 // Mock value

    return {
      total: displayInvoices.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      draft: draft.length,
      totalRevenue,
      pendingRevenue,
      overdueAmount,
      revenueGrowth,
      avgPaymentDays,
      collectionRate: displayInvoices.length > 0 ? (paid.length / displayInvoices.length) * 100 : 0
    }
  }, [displayInvoices])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = displayInvoices

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.title?.toLowerCase().includes(query) ||
        i.invoice_number?.toLowerCase().includes(query) ||
        i.client_name?.toLowerCase().includes(query)
      )
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(i => i.status === activeTab)
    }

    // Apply advanced filter settings
    if (filterSettings.status !== 'all') {
      filtered = filtered.filter(i => i.status === filterSettings.status)
    }
    if (filterSettings.minAmount) {
      filtered = filtered.filter(i => i.total_amount >= parseFloat(filterSettings.minAmount))
    }
    if (filterSettings.maxAmount) {
      filtered = filtered.filter(i => i.total_amount <= parseFloat(filterSettings.maxAmount))
    }
    if (filterSettings.client) {
      const clientQuery = filterSettings.client.toLowerCase()
      filtered = filtered.filter(i => i.client_name?.toLowerCase().includes(clientQuery))
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (filterSettings.sortBy) {
        case 'amount':
          return b.total_amount - a.total_amount
        case 'client':
          return (a.client_name || '').localeCompare(b.client_name || '')
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        case 'date':
        default:
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      }
    })

    return filtered
  }, [displayInvoices, searchQuery, activeTab, filterSettings])

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      amount: 0
    }
    setNewInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: number | string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          updated.amount = updated.quantity * updated.rate * (1 + updated.tax / 100)
          return updated
        }
        return item
      })
    }))
  }

  const removeLineItem = (id: string) => {
    setNewInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }))
  }

  const calculateSubtotal = () => newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const calculateTax = () => newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate * item.tax / 100), 0)
  const calculateDiscount = () => {
    if (!newInvoice.discount.enabled) return 0
    const subtotal = calculateSubtotal()
    return newInvoice.discount.type === 'percentage'
      ? subtotal * (newInvoice.discount.value / 100)
      : newInvoice.discount.value
  }
  const calculateTotal = () => calculateSubtotal() + calculateTax() - calculateDiscount()

  // Handle creating a new invoice
  const handleCreateInvoice = async () => {
    if (!newInvoice.client || !newInvoice.title) {
      toast.error('Please fill in client name and invoice title')
      return
    }
    try {
      const subtotal = calculateSubtotal()
      const taxAmount = calculateTax()
      const discountAmount = calculateDiscount()
      const total = calculateTotal()

      await createInvoice({
        title: newInvoice.title,
        client_name: newInvoice.client,
        client_email: newInvoice.clientEmail,
        invoice_number: `INV-${Date.now()}`,
        currency: newInvoice.currency,
        due_date: newInvoice.dueDate,
        items: newInvoice.items,
        item_count: newInvoice.items.length,
        subtotal,
        tax_amount: taxAmount,
        tax_rate: newInvoice.items.length > 0 ? newInvoice.items[0].tax : 0,
        discount_amount: discountAmount,
        discount_percentage: newInvoice.discount.type === 'percentage' ? newInvoice.discount.value : 0,
        total_amount: total,
        amount_due: total,
        amount_paid: 0,
        status: 'draft',
        notes: newInvoice.notes,
        terms_and_conditions: newInvoice.terms,
        is_recurring: newInvoice.recurring.enabled,
        recurring_schedule: newInvoice.recurring.enabled ? newInvoice.recurring.frequency : null,
        issue_date: new Date().toISOString().split('T')[0]
      })
      setShowCreateModal(false)
      toast.success('Invoice created successfully')
      // Reset form
      setNewInvoice({
        client: '',
        clientEmail: '',
        title: '',
        currency: 'USD',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
        template: 'modern',
        notes: '',
        terms: 'Payment is due within 30 days of invoice date.',
        enableReminders: true,
        reminderSchedule: ['3days', 'dueday', '7daysafter'],
        lateFee: { enabled: false, type: 'percentage', value: 5 },
        discount: { enabled: false, type: 'percentage', value: 0 },
        deposit: { enabled: false, percentage: 50 },
        recurring: { enabled: false, frequency: 'monthly', endDate: '' }
      })
    } catch (error) {
      console.error('Failed to create invoice:', error)
    }
  }

  // Send Invoice - updates status to 'sent' and records sent_date
  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        status: 'sent',
        sent_date: new Date().toISOString()
      })
      toast.success("Invoice sent to " + invoice.client_name)
    } catch (error) {
      toast.error('Failed to send invoice')
    }
  }

  // Mark as Paid - updates status to 'paid' and records paid_date
  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        status: 'paid',
        paid_date: new Date().toISOString(),
        amount_paid: invoice.total_amount,
        amount_due: 0
      })
      toast.success("Invoice marked as paid")
    } catch (error) {
      toast.error('Failed to mark invoice as paid')
    }
  }

  // Delete Invoice
  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await deleteInvoice(invoice.id)
      toast.success("Invoice deleted")
    } catch (error) {
      toast.error('Failed to delete invoice')
    }
  }

  // Void Invoice - updates status to 'cancelled'
  const handleVoidInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'cancelled' })
      toast.info("Invoice voided")
    } catch (error) {
      toast.error('Failed to void invoice')
    }
  }

  // Duplicate Invoice - creates a copy with draft status
  const handleDuplicateInvoice = async (invoice: Invoice) => {
    try {
      await createInvoice({
        title: `Copy of ${invoice.title}`,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        invoice_number: `INV-${Date.now()}`,
        currency: invoice.currency,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: invoice.items,
        item_count: invoice.item_count,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        tax_rate: invoice.tax_rate,
        discount_amount: invoice.discount_amount,
        discount_percentage: invoice.discount_percentage,
        total_amount: invoice.total_amount,
        amount_due: invoice.total_amount,
        amount_paid: 0,
        status: 'draft',
        notes: invoice.notes,
        terms_and_conditions: invoice.terms_and_conditions,
        issue_date: new Date().toISOString().split('T')[0]
      })
      toast.success("Invoice duplicated")
    } catch (error) {
      toast.error('Failed to duplicate invoice')
    }
  }

  // Send Reminder - updates reminder_sent_count and last_reminder_sent_at
  const handleSendReminder = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        reminder_sent_count: (invoice.reminder_sent_count || 0) + 1,
        last_reminder_sent_at: new Date().toISOString()
      })
      toast.success("Reminder sent")
    } catch (error) {
      toast.error('Failed to send reminder')
    }
  }

  const handleExportInvoices = () => {
    toast.success('Export started')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCurrencySymbol = (code: string) => currencies.find(c => c.code === code)?.symbol || '$'

  // Quick Actions array with proper dialog openers
  const invoicesQuickActions = [
    { id: '1', label: 'New Invoice', icon: 'FileText', shortcut: 'N', action: () => setShowCreateModal(true) },
    { id: '2', label: 'Send Reminders', icon: 'Mail', shortcut: 'R', action: () => setShowSendRemindersDialog(true) },
    { id: '3', label: 'Export Report', icon: 'Download', shortcut: 'E', action: () => setShowExportReportDialog(true) },
    { id: '4', label: 'Record Payment', icon: 'CreditCard', shortcut: 'P', action: () => setShowRecordPaymentDialog(true) },
  ]

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success("Downloading invoice - will be ready shortly")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Error: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Invoice Hub</h1>
                <p className="text-white/80">Professional invoicing with smart automation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                className="bg-white text-emerald-600 hover:bg-white/90"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <RefreshCw className="h-3 w-3 mr-1" /> Recurring Billing
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Globe className="h-3 w-3 mr-1" /> 135+ Currencies
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Bell className="h-3 w-3 mr-1" /> Auto Reminders
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Percent className="h-3 w-3 mr-1" /> Late Fees
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <CreditCard className="h-3 w-3 mr-1" /> Online Payments
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> Smart Templates
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className={"flex items-center gap-1 text-sm " + (stats.revenueGrowth >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {stats.revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">${stats.pendingRevenue.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pending} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">${stats.overdueAmount.toLocaleString()}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-200" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.overdue} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{stats.collectionRate.toFixed(1)}%</p>
              </div>
              <Progress value={stats.collectionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Payment Time</p>
                <p className="text-2xl font-bold">{stats.avgPaymentDays} days</p>
              </div>
              <p className="text-xs text-emerald-600 mt-1">2 days faster than avg</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="flex gap-1 mt-2">
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">{stats.paid} paid</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{stats.draft} draft</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-5 w-5 text-emerald-600" />
            <span>New Invoice</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => {
              setNewInvoice(prev => ({ ...prev, recurring: { ...prev.recurring, enabled: true } }))
              setShowCreateModal(true)
            }}
          >
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Recurring Invoice</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            disabled={mutating}
            onClick={async () => {
              const overdueInvoices = displayInvoices.filter(inv =>
                inv.status === 'overdue' || inv.status === 'sent'
              )
              if (overdueInvoices.length === 0) {
                toast.info('No invoices to remind')
                return
              }
              for (const inv of overdueInvoices) {
                await handleSendReminder(inv)
              }
              toast.success(`Reminders sent to ${overdueInvoices.length} clients`)
            }}
          >
            <Mail className="h-5 w-5 text-purple-600" />
            <span>Send Reminders</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={handleExportInvoices}>
            <FileSpreadsheet className="h-5 w-5 text-orange-600" />
            <span>Export Report</span>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices, clients, or amounts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
                <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Invoice List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="all" className="gap-2">
              All <Badge variant="secondary">{stats.total}</Badge>
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              Draft <Badge variant="secondary">{stats.draft}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              Sent <Badge variant="secondary">{stats.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="paid" className="gap-2">
              Paid <Badge variant="secondary">{stats.paid}</Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              Overdue <Badge variant="secondary">{stats.overdue}</Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
                <p className="mt-2 text-muted-foreground">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map(invoice => (
                  <Card key={invoice.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(prev => [...prev, invoice.id])
                            } else {
                              setSelectedInvoices(prev => prev.filter(id => id !== invoice.id))
                            }
                          }}
                        />

                        {/* Invoice Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {invoice.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {invoice.status === 'sent' && <Send className="h-3 w-3 mr-1" />}
                              {invoice.status}
                            </Badge>
                            {invoice.recurring && (
                              <Badge variant="outline" className="text-blue-600">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold truncate">{invoice.title || 'Untitled Invoice'}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>#{invoice.invoice_number}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {invoice.client_name || 'No client'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(invoice.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">
                            {getCurrencySymbol(invoice.currency)}{invoice.total_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{invoice.currency}</p>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setShowViewInvoiceDialog(true) }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setShowEditInvoiceDialog(true) }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice)} disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              const invoiceUrl = `https://app.freeflow.io/invoices/${invoice.id}`
                              try {
                                await navigator.clipboard.writeText(invoiceUrl)
                                toast.success('Invoice link copied')
                              } catch (err) {
                                // Fallback for older browsers
                                const textArea = document.createElement('textarea')
                                textArea.value = invoiceUrl
                                textArea.style.position = 'fixed'
                                textArea.style.opacity = '0'
                                document.body.appendChild(textArea)
                                textArea.select()
                                try {
                                  document.execCommand('copy')
                                  toast.success('Invoice link copied')
                                } catch {
                                  toast.error('Failed to copy link')
                                }
                                document.body.removeChild(textArea)
                              }
                            }}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendReminder(invoice)} disabled={invoice.status === 'paid' || invoice.status === 'draft'}>
                              <Bell className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)} disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVoidInvoice(invoice)} disabled={invoice.status === 'cancelled' || invoice.status === 'paid'}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Void Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteInvoice(invoice)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'branding', label: 'Branding', icon: FileText },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'payments', label: 'Payments', icon: CreditCard },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={settingsTab === item.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => setSettingsTab(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Invoice Stats */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Invoice Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                      <Badge className="bg-emerald-100 text-emerald-700">${stats.totalRevenue.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</span>
                      <Badge variant="secondary">{stats.collectionRate.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Payment</span>
                      <Badge variant="secondary">{stats.avgPaymentDays} days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</span>
                      <Badge variant="secondary">{stats.total}</Badge>
                    </div>
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
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Your business details that appear on invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input defaultValue="Your Company Name" />
                          </div>
                          <div className="space-y-2">
                            <Label>Tax ID / VAT Number</Label>
                            <Input placeholder="Enter tax ID" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Business Address</Label>
                          <Input placeholder="Street Address" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input placeholder="City" />
                          </div>
                          <div className="space-y-2">
                            <Label>State/Province</Label>
                            <Input placeholder="State" />
                          </div>
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input placeholder="Postal code" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="billing@company.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input placeholder="+1 (555) 123-4567" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Invoice Defaults</CardTitle>
                        <CardDescription>Default settings for new invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select defaultValue="USD">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map(c => (
                                  <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Due on receipt</SelectItem>
                                <SelectItem value="7">Net 7</SelectItem>
                                <SelectItem value="14">Net 14</SelectItem>
                                <SelectItem value="30">Net 30</SelectItem>
                                <SelectItem value="60">Net 60</SelectItem>
                                <SelectItem value="90">Net 90</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Invoice Number Prefix</Label>
                            <Input defaultValue="INV-" />
                          </div>
                          <div className="space-y-2">
                            <Label>Next Invoice Number</Label>
                            <Input type="number" defaultValue="1001" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Default Payment Terms Text</Label>
                          <textarea className="w-full p-3 rounded-lg border resize-none h-20 dark:bg-gray-800 dark:border-gray-700" defaultValue="Payment is due within 30 days of invoice date. Late payments may incur additional fees." />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tax Settings</CardTitle>
                        <CardDescription>Configure default tax rates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Tax Calculations</Label>
                            <p className="text-sm text-gray-500">Add tax line items to invoices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Tax Rate</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="10" className="w-24" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Tax Label</Label>
                            <Input defaultValue="Sales Tax" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Invoice Branding</CardTitle>
                        <CardDescription>Customize the look of your invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Company Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                            <p className="text-xs text-gray-400">Recommended: 200x50px PNG or SVG</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#10b981" type="color" className="w-16 h-10" />
                              <Input defaultValue="#10b981" className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Accent Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#059669" type="color" className="w-16 h-10" />
                              <Input defaultValue="#059669" className="flex-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Invoice Templates</CardTitle>
                        <CardDescription>Choose your default invoice template</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                          {invoiceTemplates.map(template => (
                            <button
                              key={template.id}
                              className="p-4 rounded-lg border-2 text-left transition-all hover:border-emerald-300 border-gray-200 dark:border-gray-700"
                            >
                              <div className={"h-16 rounded bg-gradient-to-r " + template.color + " mb-2"} />
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Footer</CardTitle>
                        <CardDescription>Add a custom message to all invoices</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Footer Message</Label>
                          <textarea className="w-full p-3 rounded-lg border resize-none h-24 dark:bg-gray-800 dark:border-gray-700" placeholder="Thank you for your business!" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Payment Instructions</Label>
                            <p className="text-sm text-gray-500">Display payment details on invoice</p>
                          </div>
                          <Switch defaultChecked />
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
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure when to send email notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Invoice Sent</Label>
                            <p className="text-sm text-gray-500">Notify when invoice is sent to client</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Payment Received</Label>
                            <p className="text-sm text-gray-500">Notify when payment is received</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Invoice Overdue</Label>
                            <p className="text-sm text-gray-500">Notify when invoice becomes overdue</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Invoice Viewed</Label>
                            <p className="text-sm text-gray-500">Notify when client views invoice</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Reminders</CardTitle>
                        <CardDescription>Configure automatic payment reminders</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Auto-Reminders</Label>
                            <p className="text-sm text-gray-500">Automatically send payment reminders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-3">
                          <Label>Reminder Schedule</Label>
                          {reminderSchedules.map(schedule => (
                            <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <span className="text-sm">{schedule.label}</span>
                              <Switch defaultChecked={['3days', 'dueday', '7daysafter'].includes(schedule.id)} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Templates</CardTitle>
                        <CardDescription>Customize email content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Invoice Email Subject</Label>
                          <Input defaultValue="Invoice #{{invoice_number}} from {{company_name}}" />
                        </div>
                        <div className="space-y-2">
                          <Label>Reminder Email Subject</Label>
                          <Input defaultValue="Reminder: Invoice #{{invoice_number}} is due" />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowEmailTemplateDialog(true)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Customize Email Templates
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Payments Settings */}
                {settingsTab === 'payments' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Gateways</CardTitle>
                        <CardDescription>Connect payment processors to accept online payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {gateways.map((gateway) => {
                          const icons: Record<string, typeof CreditCard> = { stripe: CreditCard, paypal: DollarSign, square: CreditCard, wise: Globe }
                          const colors: Record<string, string> = { stripe: 'text-purple-500', paypal: 'text-blue-500', square: 'text-gray-700', wise: 'text-green-500' }
                          const GatewayIcon = icons[gateway.id] || CreditCard
                          return (
                          <div key={gateway.id} className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <GatewayIcon className={"h-8 w-8 " + (colors[gateway.id] || "text-gray-500")} />
                              <div>
                                <p className="font-medium">{gateway.name}</p>
                                <p className="text-sm text-muted-foreground">{gateway.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {gateway.connected && <Badge className="bg-green-100 text-green-700">Connected</Badge>}
                              <Button variant={gateway.connected ? 'outline' : 'default'} size="sm" onClick={() => { setSelectedGateway(gateway); setShowPaymentGatewayDialog(true) }}>
                                {gateway.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                        )})}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Late Fees</CardTitle>
                        <CardDescription>Configure automatic late fee settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Late Fees</Label>
                            <p className="text-sm text-gray-500">Automatically apply late fees to overdue invoices</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Late Fee Type</Label>
                            <Select defaultValue="percentage">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="5" className="flex-1" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Grace Period (Days)</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No grace period</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Deposits & Partial Payments</CardTitle>
                        <CardDescription>Configure deposit and partial payment settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Partial Payments</Label>
                            <p className="text-sm text-gray-500">Accept payments in installments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Request Deposits</Label>
                            <p className="text-sm text-gray-500">Require upfront deposits on invoices</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Deposit Percentage</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" defaultValue="50" className="w-24" />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys for external integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value={apiKey} readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('API key copied') }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => { if (confirm('Regenerate API key? Existing integrations will stop working.')) { const newKey = 'inv_live_' + crypto.randomUUID().slice(0, 24); setApiKey(newKey); toast.success('API key regenerated') } }}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow external API access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Send real-time notifications to external systems</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://api.yourcompany.com/webhooks/invoices" />
                        </div>
                        <div className="space-y-2">
                          <Label>Events</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                            {['invoice.created', 'invoice.sent', 'invoice.paid', 'invoice.overdue', 'payment.received'].map((event) => (
                              <div key={event} className="flex items-center gap-2">
                                <Switch defaultChecked />
                                <span className="text-sm font-mono">{event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" onClick={async () => {
                          toast.loading('Sending test webhook...', { id: 'test-webhook' })
                          try {
                            const response = await fetch('/api/invoices', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'test-webhook', event: 'invoice.test' })
                            })
                            if (!response.ok) throw new Error('Webhook test failed')
                            toast.success('Webhook test sent', { id: 'test-webhook', description: 'A test event was sent to your webhook URL. Check your endpoint for the response.' })
                          } catch (error) { toast.error('Webhook test failed', { id: 'test-webhook', description: error instanceof Error ? error.message : 'Unknown error' }) }
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Test Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Accounting Software</CardTitle>
                        <CardDescription>Sync invoices with your accounting tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {accountingApps.map((app) => (
                            <div key={app.id} className="p-4 rounded-lg border dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{app.name}</span>
                                <Badge variant={app.connected ? 'default' : 'outline'}>
                                  {app.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">{app.description}</p>
                              <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedAccountingApp(app); setShowAccountingAppDialog(true) }}>
                                {app.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          ))}
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
                        <CardTitle>Recurring Invoices</CardTitle>
                        <CardDescription>Configure recurring invoice settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Generate Recurring Invoices</Label>
                            <p className="text-sm text-gray-500">Automatically create invoices on schedule</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Send Recurring Invoices</Label>
                            <p className="text-sm text-gray-500">Automatically email invoices when created</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Send Time</Label>
                          <Select defaultValue="9am">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6am">6:00 AM</SelectItem>
                              <SelectItem value="9am">9:00 AM</SelectItem>
                              <SelectItem value="12pm">12:00 PM</SelectItem>
                              <SelectItem value="5pm">5:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data & Exports</CardTitle>
                        <CardDescription>Export and manage your invoice data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={async () => {
                            toast.loading(`Exporting ${stats.total} invoices...`, { id: 'export-csv' })
                            try {
                              const response = await fetch('/api/invoices')
                              if (!response.ok) throw new Error('Failed to fetch invoices')
                              const result = await response.json()
                              const invoicesData = result.data?.invoices || []
                              const csvHeaders = 'Invoice ID,Date,Client,Amount,Status'
                              const csvRows = invoicesData.map((inv: { id: string; dueDate: string; client: string; amount: number; status: string }) =>
                                `${inv.id},${inv.dueDate || 'N/A'},${inv.client},$${inv.amount},${inv.status}`
                              ).join('\n')
                              const csvData = `${csvHeaders}\n${csvRows}`
                              const blob = new Blob([csvData], { type: 'text/csv' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
                              a.click()
                              URL.revokeObjectURL(url)
                              toast.success('Export complete', { id: 'export-csv', description: `${invoicesData.length} invoices exported to CSV` })
                            } catch (error) { toast.error('Export failed', { id: 'export-csv', description: error instanceof Error ? error.message : 'Unknown error' }) }
                          }}>
                            <Download className="w-5 h-5 text-blue-600" />
                            <span>Export All Invoices</span>
                            <span className="text-xs text-gray-500">CSV format</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={async () => {
                            toast.loading('Generating Excel report...', { id: 'export-excel' })
                            try {
                              const response = await fetch('/api/invoices')
                              if (!response.ok) throw new Error('Failed to fetch invoices')
                              const result = await response.json()
                              const invoicesData = result.data?.invoices || []
                              const statsData = result.data?.stats || {}
                              const excelData = JSON.stringify({
                                generatedAt: new Date().toISOString(),
                                summary: {
                                  totalInvoices: invoicesData.length,
                                  totalOutstanding: statsData.totalOutstanding,
                                  paidThisMonth: statsData.paidThisMonth,
                                  overdueAmount: statsData.overdueAmount
                                },
                                invoices: invoicesData
                              }, null, 2)
                              const blob = new Blob([excelData], { type: 'application/json' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `invoice-report-${new Date().toISOString().split('T')[0]}.json`
                              a.click()
                              URL.revokeObjectURL(url)
                              toast.success('Report ready', { id: 'export-excel', description: `Report with ${invoicesData.length} invoices downloaded` })
                            } catch (error) { toast.error('Report generation failed', { id: 'export-excel', description: error instanceof Error ? error.message : 'Unknown error' }) }
                          }}>
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            <span>Export Report</span>
                            <span className="text-xs text-gray-500">Excel format</span>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Data Retention</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1y">1 year</SelectItem>
                              <SelectItem value="3y">3 years</SelectItem>
                              <SelectItem value="7y">7 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Configure security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for invoice access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Invoice Link Expiration</Label>
                            <p className="text-sm text-gray-500">Expire public invoice links</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Link Expiration Period</Label>
                          <Select defaultValue="30">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Archive All Draft Invoices</div>
                            <p className="text-sm text-gray-500">Move all drafts to archive</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={async () => { if (confirm(`Archive all ${stats.draft} draft invoices?`)) { const drafts = displayInvoices.filter(i => i.status === 'draft'); for (const draft of drafts) { await updateInvoice(draft.id, { status: 'cancelled' }) }; toast.success(`${stats.draft} draft invoices archived`) } }}>
                            Archive Drafts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Reset Invoice Numbering</div>
                            <p className="text-sm text-gray-500">Reset invoice number sequence (currently at INV-{invoiceNumberSequence})</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { if (confirm('Reset invoice numbering? This cannot be undone.')) { setInvoiceNumberSequence(1001); toast.success('Invoice numbering reset') } }}>
                            Reset Numbers
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Delete All Data</div>
                            <p className="text-sm text-gray-500">Permanently delete all invoice data</p>
                          </div>
                          <Button variant="destructive" onClick={() => { toast.info('Contact support') }}>
                            Delete All Data
                          </Button>
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
          {/* AI Insights Panel */}
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockInvoicesAIInsights}
              title="Invoice Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>

          {/* Team Collaboration & Activity */}
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockInvoicesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockInvoicesPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockInvoicesActivities}
            title="Billing Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={invoicesQuickActions}
            variant="grid"
          />
        </div>

        {/* Bulk Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4">
            <span>{selectedInvoices.length} selected</span>
            <div className="h-4 w-px bg-gray-700" />
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              disabled={mutating}
              onClick={async () => {
                const invoicesToSend = displayInvoices.filter(inv =>
                  selectedInvoices.includes(inv.id) &&
                  inv.status !== 'paid' &&
                  inv.status !== 'cancelled'
                )
                for (const inv of invoicesToSend) {
                  await handleSendInvoice(inv)
                }
                setSelectedInvoices([])
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Send All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              disabled={mutating}
              onClick={async () => {
                const invoicesToRemind = displayInvoices.filter(inv =>
                  selectedInvoices.includes(inv.id) &&
                  inv.status !== 'paid' &&
                  inv.status !== 'draft'
                )
                for (const inv of invoicesToRemind) {
                  await handleSendReminder(inv)
                }
                setSelectedInvoices([])
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Remind All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => {
                handleExportInvoices()
                setSelectedInvoices([])
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:bg-red-500/10"
              disabled={mutating}
              onClick={async () => {
                const invoicesToDelete = displayInvoices.filter(inv => selectedInvoices.includes(inv.id))
                for (const inv of invoicesToDelete) {
                  await handleDeleteInvoice(inv)
                }
                setSelectedInvoices([])
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-white/10" onClick={() => setSelectedInvoices([])}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Create New Invoice
            </DialogTitle>
            <DialogDescription>
              Create a professional invoice with smart automation features
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Template Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Invoice Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {invoiceTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setNewInvoice(prev => ({ ...prev, template: template.id }))}
                      className={"p-4 rounded-lg border-2 text-left transition-all " + (
                        newInvoice.template === template.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300')}
                    >
                      <div className={"h-8 rounded bg-gradient-to-r " + template.color + " mb-2"} />
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Client Name</Label>
                  <Input
                    placeholder="Enter client name"
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, client: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    placeholder="client@email.com"
                    value={newInvoice.clientEmail}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label>Invoice Title</Label>
                  <Input
                    placeholder="e.g., Website Design Services"
                    value={newInvoice.title}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newInvoice.currency}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Line Items</Label>
                  <Button variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">Tax %</div>
                    <div className="col-span-1"></div>
                  </div>
                  {newInvoice.items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-5"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax}
                        onChange={(e) => updateLineItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => removeLineItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {newInvoice.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No items added yet</p>
                      <Button variant="link" size="sm" onClick={addLineItem}>Add your first item</Button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                {newInvoice.items.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{getCurrencySymbol(newInvoice.currency)}{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{getCurrencySymbol(newInvoice.currency)}{calculateTax().toFixed(2)}</span>
                      </div>
                      {newInvoice.discount.enabled && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>-{getCurrencySymbol(newInvoice.currency)}{calculateDiscount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-emerald-600">{getCurrencySymbol(newInvoice.currency)}{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Recurring */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        Recurring Invoice
                      </CardTitle>
                      <Switch
                        checked={newInvoice.recurring.enabled}
                        onCheckedChange={(checked) => setNewInvoice(prev => ({
                          ...prev,
                          recurring: { ...prev.recurring, enabled: checked }
                        }))}
                      />
                    </div>
                  </CardHeader>
                  {newInvoice.recurring.enabled && (
                    <CardContent className="pt-0">
                      <select
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                        value={newInvoice.recurring.frequency}
                        onChange={(e) => setNewInvoice(prev => ({
                          ...prev,
                          recurring: { ...prev.recurring, frequency: e.target.value }
                        }))}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </CardContent>
                  )}
                </Card>

                {/* Late Fees */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Percent className="h-4 w-4 text-red-500" />
                        Late Fee
                      </CardTitle>
                      <Switch
                        checked={newInvoice.lateFee.enabled}
                        onCheckedChange={(checked) => setNewInvoice(prev => ({
                          ...prev,
                          lateFee: { ...prev.lateFee, enabled: checked }
                        }))}
                      />
                    </div>
                  </CardHeader>
                  {newInvoice.lateFee.enabled && (
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={newInvoice.lateFee.value}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            lateFee: { ...prev.lateFee, value: parseFloat(e.target.value) || 0 }
                          }))}
                          className="flex-1"
                        />
                        <select
                          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                          value={newInvoice.lateFee.type}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            lateFee: { ...prev.lateFee, type: e.target.value }
                          }))}
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Discount */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Discount
                      </CardTitle>
                      <Switch
                        checked={newInvoice.discount.enabled}
                        onCheckedChange={(checked) => setNewInvoice(prev => ({
                          ...prev,
                          discount: { ...prev.discount, enabled: checked }
                        }))}
                      />
                    </div>
                  </CardHeader>
                  {newInvoice.discount.enabled && (
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={newInvoice.discount.value}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            discount: { ...prev.discount, value: parseFloat(e.target.value) || 0 }
                          }))}
                          className="flex-1"
                        />
                        <select
                          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                          value={newInvoice.discount.type}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            discount: { ...prev.discount, type: e.target.value }
                          }))}
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Deposit */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        Request Deposit
                      </CardTitle>
                      <Switch
                        checked={newInvoice.deposit.enabled}
                        onCheckedChange={(checked) => setNewInvoice(prev => ({
                          ...prev,
                          deposit: { ...prev.deposit, enabled: checked }
                        }))}
                      />
                    </div>
                  </CardHeader>
                  {newInvoice.deposit.enabled && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={newInvoice.deposit.percentage}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            deposit: { ...prev.deposit, percentage: parseFloat(e.target.value) || 0 }
                          }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Payment Reminders */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4 text-purple-500" />
                      Automatic Payment Reminders
                    </CardTitle>
                    <Switch
                      checked={newInvoice.enableReminders}
                      onCheckedChange={(checked) => setNewInvoice(prev => ({ ...prev, enableReminders: checked }))}
                    />
                  </div>
                </CardHeader>
                {newInvoice.enableReminders && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {reminderSchedules.map(schedule => (
                        <Badge
                          key={schedule.id}
                          variant={newInvoice.reminderSchedule.includes(schedule.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setNewInvoice(prev => ({
                              ...prev,
                              reminderSchedule: prev.reminderSchedule.includes(schedule.id)
                                ? prev.reminderSchedule.filter(id => id !== schedule.id)
                                : [...prev.reminderSchedule, schedule.id]
                            }))
                          }}
                        >
                          {schedule.label}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Notes & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Notes to Client</Label>
                  <Textarea
                    placeholder="Thank you for your business..."
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Textarea
                    placeholder="Payment is due within..."
                    value={newInvoice.terms}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, terms: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => setShowPreviewInvoiceDialog(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateInvoice}
              disabled={mutating || !newInvoice.client || !newInvoice.title}
            >
              <FileText className="h-4 w-4 mr-2" />
              {mutating ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Invoice Settings
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div>
                <Label>Default Currency</Label>
                <select className="w-full px-3 py-2 border rounded-lg mt-1">
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Default Payment Terms (Days)</Label>
                <Input type="number" defaultValue={30} />
              </div>
              <div>
                <Label>Invoice Number Prefix</Label>
                <Input defaultValue="INV-" />
              </div>
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <p className="text-muted-foreground">Customize your invoice templates with your branding.</p>
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-muted-foreground">Accept credit cards and bank transfers</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="automation" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-send reminders</p>
                    <p className="text-sm text-muted-foreground">Automatically send payment reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-apply late fees</p>
                    <p className="text-sm text-muted-foreground">Automatically apply late fees to overdue invoices</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-generate recurring invoices</p>
                    <p className="text-sm text-muted-foreground">Automatically create and send recurring invoices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Send Reminders Dialog */}
      <Dialog open={showSendRemindersDialog} onOpenChange={setShowSendRemindersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Send Payment Reminders
            </DialogTitle>
            <DialogDescription>
              Send payment reminders to clients with outstanding invoices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Recipients</Label>
              <Select defaultValue="overdue">
                <SelectTrigger>
                  <SelectValue placeholder="Select invoices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overdue">All Overdue Invoices ({stats.overdue})</SelectItem>
                  <SelectItem value="pending">All Pending Invoices ({stats.pending})</SelectItem>
                  <SelectItem value="selected">Selected Invoices ({selectedInvoices.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reminder Template</Label>
              <Select defaultValue="friendly">
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly Reminder</SelectItem>
                  <SelectItem value="formal">Formal Notice</SelectItem>
                  <SelectItem value="urgent">Urgent Payment Request</SelectItem>
                  <SelectItem value="final">Final Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will send email reminders to {stats.overdue + stats.pending} clients with outstanding invoices totaling ${(stats.overdueAmount + stats.pendingRevenue).toLocaleString()}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendRemindersDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={async () => {
                const overdueInvoices = displayInvoices.filter(inv =>
                  inv.status === 'overdue' || inv.status === 'sent'
                )
                for (const inv of overdueInvoices) {
                  await handleSendReminder(inv)
                }
                setShowSendRemindersDialog(false)
                toast.success(`Reminders sent to ${overdueInvoices.length} clients`)
              }}
              disabled={mutating}
            >
              <Mail className="h-4 w-4 mr-2" />
              {mutating ? 'Sending...' : 'Send Reminders'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              Export Invoice Report
            </DialogTitle>
            <DialogDescription>
              Export your invoice data in various formats
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Include</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Invoice Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Payment History</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <span className="text-sm">Client Information</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Exporting {stats.total} invoices with total revenue of ${stats.totalRevenue.toLocaleString()}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                handleExportInvoices()
                setShowExportReportDialog(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordPaymentDialog} onOpenChange={setShowRecordPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Manually record a payment received for an invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Invoice</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {displayInvoices
                    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                    .map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        #{inv.invoice_number} - {inv.client_name} (${inv.total_amount.toLocaleString()})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select defaultValue="bank">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Reference / Notes (Optional)</Label>
              <Input placeholder="Transaction ID, check number, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                toast.success('Payment recorded')
                setShowRecordPaymentDialog(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filter Invoices
            </DialogTitle>
            <DialogDescription>
              Refine your invoice list with advanced filters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterSettings.status} onValueChange={(value) => setFilterSettings(prev => ({ ...prev, status: value as InvoiceStatus | 'all' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input type="number" placeholder="0" value={filterSettings.minAmount} onChange={(e) => setFilterSettings(prev => ({ ...prev, minAmount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input type="number" placeholder="No limit" value={filterSettings.maxAmount} onChange={(e) => setFilterSettings(prev => ({ ...prev, maxAmount: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input placeholder="Filter by client..." value={filterSettings.client} onChange={(e) => setFilterSettings(prev => ({ ...prev, client: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={filterSettings.sortBy} onValueChange={(value) => setFilterSettings(prev => ({ ...prev, sortBy: value as 'date' | 'amount' | 'client' | 'status' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest)</SelectItem>
                  <SelectItem value="amount">Amount (Highest)</SelectItem>
                  <SelectItem value="client">Client Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFilterSettings({ status: 'all', minAmount: '', maxAmount: '', client: '', sortBy: 'date' }); toast.success('Filters cleared') }}>
              Clear Filters
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setStatusFilter(filterSettings.status); setShowFilterDialog(false); const activeFilters = [filterSettings.status !== 'all' && 'status', filterSettings.minAmount && 'min amount', filterSettings.maxAmount && 'max amount', filterSettings.client && 'client'].filter(Boolean); toast.success(activeFilters.length > 0 ? "Filters applied: " + activeFilters.join(", ") : "Showing all invoices") }}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={showViewInvoiceDialog} onOpenChange={setShowViewInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedInvoice.title || 'Untitled Invoice'}</h3>
                  <p className="text-muted-foreground">#{selectedInvoice.invoice_number}</p>
                </div>
                <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedInvoice.client_name}</p>
                    {selectedInvoice.client_email && <p className="text-sm text-muted-foreground">{selectedInvoice.client_email}</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">{getCurrencySymbol(selectedInvoice.currency)}{selectedInvoice.total_amount.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{selectedInvoice.issue_date ? new Date(selectedInvoice.issue_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedInvoice.currency}</p>
                </div>
              </div>
              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewInvoiceDialog(false)}>Close</Button>
            <Button variant="outline" onClick={() => { if (selectedInvoice) handleDownloadInvoice(selectedInvoice) }}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { if (selectedInvoice) { setShowViewInvoiceDialog(false); setShowEditInvoiceDialog(true) } }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditInvoiceDialog} onOpenChange={setShowEditInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Invoice
            </DialogTitle>
            <DialogDescription>
              Update invoice details
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Invoice Title</Label>
                  <Input defaultValue={selectedInvoice.title || ''} id="edit-title" />
                </div>
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input defaultValue={selectedInvoice.client_name || ''} id="edit-client" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input type="email" defaultValue={selectedInvoice.client_email || ''} id="edit-email" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" defaultValue={selectedInvoice.due_date?.split('T')[0] || ''} id="edit-due-date" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" defaultValue={selectedInvoice.total_amount} id="edit-amount" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue={selectedInvoice.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea defaultValue={selectedInvoice.notes || ''} rows={3} id="edit-notes" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditInvoiceDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => {
              if (selectedInvoice) {
                const titleEl = document.getElementById('edit-title') as HTMLInputElement
                const clientEl = document.getElementById('edit-client') as HTMLInputElement
                const emailEl = document.getElementById('edit-email') as HTMLInputElement
                const dueDateEl = document.getElementById('edit-due-date') as HTMLInputElement
                const amountEl = document.getElementById('edit-amount') as HTMLInputElement
                const notesEl = document.getElementById('edit-notes') as HTMLTextAreaElement
                await updateInvoice(selectedInvoice.id, {
                  title: titleEl?.value || selectedInvoice.title,
                  client_name: clientEl?.value || selectedInvoice.client_name,
                  client_email: emailEl?.value || selectedInvoice.client_email,
                  due_date: dueDateEl?.value || selectedInvoice.due_date,
                  total_amount: parseFloat(amountEl?.value) || selectedInvoice.total_amount,
                  notes: notesEl?.value || selectedInvoice.notes
                })
                setShowEditInvoiceDialog(false)
                toast.success('Invoice updated successfully')
              }
            }}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Template Editor Dialog */}
      <Dialog open={showEmailTemplateDialog} onOpenChange={setShowEmailTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Template Editor
            </DialogTitle>
            <DialogDescription>
              Customize your invoice email templates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select defaultValue="invoice">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">New Invoice</SelectItem>
                  <SelectItem value="reminder">Payment Reminder</SelectItem>
                  <SelectItem value="overdue">Overdue Notice</SelectItem>
                  <SelectItem value="thankyou">Thank You (Payment Received)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input value={emailTemplate.subject} onChange={(e) => setEmailTemplate(prev => ({ ...prev, subject: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                rows={8}
                value={emailTemplate.body}
                onChange={(e) => setEmailTemplate(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {['{{client_name}}', '{{invoice_number}}', '{{amount}}', '{{currency}}', '{{due_date}}', '{{company_name}}', '{{invoice_link}}'].map(variable => (
                  <Badge key={variable} variant="outline" className="font-mono text-xs">{variable}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailTemplateDialog(false)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { setShowEmailTemplateDialog(false); toast.success('Email template saved') }}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Configuration Dialog */}
      <Dialog open={showPaymentGatewayDialog} onOpenChange={setShowPaymentGatewayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              {selectedGateway?.connected ? 'Configure' : 'Connect'} {selectedGateway?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedGateway?.connected ? 'Update your payment gateway settings' : 'Connect your payment gateway to accept online payments'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedGateway?.connected ? (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-green-700 dark:text-green-400">Connected and active</span>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input readOnly defaultValue={"https://api.freeflow.io/webhooks/" + (selectedGateway?.name?.toLowerCase() || "")} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use sandbox environment</p>
                  </div>
                  <Switch />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input type="password" placeholder="Enter your secret key" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You can find your API keys in your {selectedGateway?.name} dashboard.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            {selectedGateway?.connected && (
              <Button variant="outline" className="text-red-600" onClick={() => { if (selectedGateway?.id) { setGateways(prev => prev.map(g => g.id === selectedGateway.id ? { ...g, connected: false } : g)); setSelectedGateway(prev => prev ? { ...prev, connected: false } : null); } setShowPaymentGatewayDialog(false); toast.info(`${selectedGateway?.name} disconnected`) }}>
                Disconnect
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowPaymentGatewayDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { if (selectedGateway?.id) { setGateways(prev => prev.map(g => g.id === selectedGateway.id ? { ...g, connected: true } : g)); setSelectedGateway(prev => prev ? { ...prev, connected: true } : null); } setShowPaymentGatewayDialog(false); toast.success(selectedGateway?.connected ? `${selectedGateway?.name} settings saved` : `${selectedGateway?.name} connected successfully`) }}>
              {selectedGateway?.connected ? 'Save Settings' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accounting App Connection Dialog */}
      <Dialog open={showAccountingAppDialog} onOpenChange={setShowAccountingAppDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              {selectedAccountingApp?.connected ? 'Configure' : 'Connect'} {selectedAccountingApp?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedAccountingApp?.connected ? 'Manage your accounting integration settings' : 'Connect to sync your invoices automatically'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAccountingApp?.connected ? (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-green-700 dark:text-green-400">Connected and syncing</span>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-sync Invoices</Label>
                      <p className="text-sm text-muted-foreground">Automatically sync new invoices</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Payments</Label>
                      <p className="text-sm text-muted-foreground">Sync payment records</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-way Sync</Label>
                      <p className="text-sm text-muted-foreground">Import changes from {selectedAccountingApp?.name}</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled={isSyncing || loading} onClick={async () => { setIsSyncing(true); try { toast.loading("Syncing invoices...", { id: "sync-progress" }); await refetch(); toast.success("Invoices synced successfully", { id: "sync-progress" }); } catch (err) { toast.error(err instanceof Error ? err.message : "Sync failed", { id: "sync-progress" }); } finally { setIsSyncing(false); } }}>
                  <RefreshCw className={"h-4 w-4 mr-2 " + (isSyncing ? "animate-spin" : "")} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Click the button below to authorize FreeFlow to access your {selectedAccountingApp?.name} account.
                </p>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm mb-3">You will be redirected to {selectedAccountingApp?.name} to authorize the connection.</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => { const oauthUrls: Record<string, string> = { QuickBooks: 'https://appcenter.intuit.com/connect/oauth2', Xero: 'https://login.xero.com/identity/connect/authorize', FreshBooks: 'https://my.freshbooks.com/service/auth/oauth/authorize', Wave: 'https://api.waveapps.com/oauth2/authorize' }; const url = oauthUrls[selectedAccountingApp?.name || ''] || 'https://example.com/oauth'; window.open(url, '_blank', 'width=600,height=700'); if (selectedAccountingApp?.id) { setAccountingApps(prev => prev.map(a => a.id === selectedAccountingApp.id ? { ...a, connected: true } : a)); setSelectedAccountingApp(prev => prev ? { ...prev, connected: true } : null); } setShowAccountingAppDialog(false); toast.success(`Connecting to ${selectedAccountingApp?.name}...`) }}>
                    Authorize with {selectedAccountingApp?.name}
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {selectedAccountingApp?.connected && (
              <Button variant="outline" className="text-red-600" onClick={() => { if (selectedAccountingApp?.id) { setAccountingApps(prev => prev.map(a => a.id === selectedAccountingApp.id ? { ...a, connected: false } : a)); setSelectedAccountingApp(prev => prev ? { ...prev, connected: false } : null); } setShowAccountingAppDialog(false); toast.info(`${selectedAccountingApp?.name} disconnected`) }}>
                Disconnect
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowAccountingAppDialog(false)}>
              {selectedAccountingApp?.connected ? 'Done' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Invoice Dialog */}
      <Dialog open={showPreviewInvoiceDialog} onOpenChange={setShowPreviewInvoiceDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Invoice Preview
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-8 space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className={"h-12 w-32 rounded bg-gradient-to-r " + (invoiceTemplates.find(t => t.id === newInvoice.template)?.color || 'from-emerald-500 to-teal-500')} />
                <p className="text-sm text-muted-foreground mt-2">Your Company Name</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">INVOICE</h2>
                <p className="text-muted-foreground">#INV-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>

            {/* Client & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bill To:</p>
                <p className="font-medium">{newInvoice.client || 'Client Name'}</p>
                <p className="text-sm text-muted-foreground">{newInvoice.clientEmail || 'client@email.com'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Issue Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Due Date: {newInvoice.dueDate ? new Date(newInvoice.dueDate).toLocaleDateString() : 'Not set'}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Description</th>
                    <th className="text-center p-3 text-sm font-medium">Qty</th>
                    <th className="text-right p-3 text-sm font-medium">Rate</th>
                    <th className="text-right p-3 text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {newInvoice.items.length > 0 ? newInvoice.items.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.description || 'Item description'}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{getCurrencySymbol(newInvoice.currency)}{item.rate.toFixed(2)}</td>
                      <td className="p-3 text-right">{getCurrencySymbol(newInvoice.currency)}{(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr className="border-t">
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No items added yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{getCurrencySymbol(newInvoice.currency)}{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{getCurrencySymbol(newInvoice.currency)}{calculateTax().toFixed(2)}</span>
                </div>
                {newInvoice.discount.enabled && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-{getCurrencySymbol(newInvoice.currency)}{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-emerald-600">{getCurrencySymbol(newInvoice.currency)}{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(newInvoice.notes || newInvoice.terms) && (
              <div className="pt-4 border-t space-y-3">
                {newInvoice.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{newInvoice.notes}</p>
                  </div>
                )}
                {newInvoice.terms && (
                  <div>
                    <p className="text-sm font-medium mb-1">Terms & Conditions</p>
                    <p className="text-sm text-muted-foreground">{newInvoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewInvoiceDialog(false)}>Close</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setShowPreviewInvoiceDialog(false); handleCreateInvoice() }} disabled={mutating || !newInvoice.client || !newInvoice.title}>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
