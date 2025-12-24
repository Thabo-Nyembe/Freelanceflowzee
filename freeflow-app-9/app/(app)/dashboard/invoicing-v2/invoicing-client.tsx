'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Trash2,
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
  ArrowDownRight,
  Mail,
  Phone,
  MapPin,
  Percent,
  Calculator,
  Printer,
  Globe,
  Tag,
  List,
  Grid3X3,
  ChevronRight,
  PieChart,
  Banknote,
  Timer,
  Users,
  Repeat,
  FileX,
  Star,
  ExternalLink,
  Wallet
} from 'lucide-react'

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
// MOCK DATA
// ============================================================================

const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    address: '123 Business Ave',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
    website: 'www.acme.com',
    taxId: 'XX-XXXXXXX',
    paymentTerms: 30,
    creditLimit: 50000,
    balance: 12500,
    totalPaid: 87500,
    invoiceCount: 24,
    lastInvoiceDate: '2024-12-15',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'client-2',
    name: 'TechStart Inc',
    email: 'accounts@techstart.io',
    phone: '+1 (555) 234-5678',
    company: 'TechStart Inc',
    address: '456 Innovation Blvd',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'USA',
    paymentTerms: 15,
    creditLimit: 25000,
    balance: 4500,
    totalPaid: 45500,
    invoiceCount: 12,
    lastInvoiceDate: '2024-12-18',
    createdAt: '2024-03-20T14:00:00Z'
  },
  {
    id: 'client-3',
    name: 'Global Industries',
    email: 'finance@globalind.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Industries Ltd',
    address: '789 Enterprise Way',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    country: 'USA',
    paymentTerms: 45,
    creditLimit: 100000,
    balance: 28750,
    totalPaid: 171250,
    invoiceCount: 36,
    lastInvoiceDate: '2024-12-20',
    createdAt: '2023-06-10T09:00:00Z'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    type: 'standard',
    status: 'paid',
    client: {
      id: 'client-1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      company: 'Acme Corporation'
    },
    lineItems: [
      { id: 'li-1', description: 'Web Development Services', quantity: 40, unitPrice: 150, taxRate: 8, discount: 0, total: 6480 },
      { id: 'li-2', description: 'UI/UX Design', quantity: 20, unitPrice: 125, taxRate: 8, discount: 10, total: 2430 }
    ],
    subtotal: 8500,
    taxAmount: 680,
    discountAmount: 250,
    total: 8930,
    amountPaid: 8930,
    amountDue: 0,
    currency: 'USD',
    issueDate: '2024-11-15',
    dueDate: '2024-12-15',
    paidDate: '2024-12-10',
    sentDate: '2024-11-15',
    viewedDate: '2024-11-16',
    terms: 'Net 30',
    payments: [
      { id: 'pay-1', invoiceId: 'inv-1', amount: 8930, method: 'bank_transfer', date: '2024-12-10', reference: 'TXN-123456' }
    ],
    lateFeeApplied: false,
    template: 'professional',
    tags: ['priority', 'web'],
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-12-10T14:30:00Z'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    type: 'standard',
    status: 'overdue',
    client: {
      id: 'client-2',
      name: 'TechStart Inc',
      email: 'accounts@techstart.io',
      company: 'TechStart Inc'
    },
    lineItems: [
      { id: 'li-3', description: 'Mobile App Development', quantity: 80, unitPrice: 175, taxRate: 8.5, discount: 0, total: 15190 },
      { id: 'li-4', description: 'API Integration', quantity: 16, unitPrice: 150, taxRate: 8.5, discount: 0, total: 2604 }
    ],
    subtotal: 16400,
    taxAmount: 1394,
    discountAmount: 0,
    total: 17794,
    amountPaid: 0,
    amountDue: 17794,
    currency: 'USD',
    issueDate: '2024-11-01',
    dueDate: '2024-11-15',
    sentDate: '2024-11-01',
    viewedDate: '2024-11-02',
    terms: 'Net 15',
    payments: [],
    lateFee: 500,
    lateFeeApplied: true,
    template: 'modern',
    tags: ['mobile', 'urgent'],
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    type: 'standard',
    status: 'partial',
    client: {
      id: 'client-3',
      name: 'Global Industries',
      email: 'finance@globalind.com',
      company: 'Global Industries Ltd'
    },
    lineItems: [
      { id: 'li-5', description: 'Enterprise Software License', quantity: 1, unitPrice: 25000, taxRate: 0, discount: 5, total: 23750 },
      { id: 'li-6', description: 'Implementation Services', quantity: 100, unitPrice: 200, taxRate: 8, discount: 0, total: 21600 },
      { id: 'li-7', description: 'Training (10 sessions)', quantity: 10, unitPrice: 500, taxRate: 8, discount: 0, total: 5400 }
    ],
    subtotal: 50000,
    taxAmount: 2160,
    discountAmount: 1250,
    total: 50910,
    amountPaid: 25000,
    amountDue: 25910,
    currency: 'USD',
    issueDate: '2024-12-01',
    dueDate: '2025-01-15',
    sentDate: '2024-12-01',
    viewedDate: '2024-12-02',
    terms: 'Net 45',
    payments: [
      { id: 'pay-2', invoiceId: 'inv-3', amount: 25000, method: 'credit_card', date: '2024-12-05', reference: 'CC-789012' }
    ],
    lateFeeApplied: false,
    template: 'enterprise',
    tags: ['enterprise', 'software'],
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-05T15:00:00Z'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-004',
    type: 'recurring',
    status: 'sent',
    client: {
      id: 'client-1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      company: 'Acme Corporation'
    },
    lineItems: [
      { id: 'li-8', description: 'Monthly Maintenance Retainer', quantity: 1, unitPrice: 3500, taxRate: 8, discount: 0, total: 3780 }
    ],
    subtotal: 3500,
    taxAmount: 280,
    discountAmount: 0,
    total: 3780,
    amountPaid: 0,
    amountDue: 3780,
    currency: 'USD',
    issueDate: '2024-12-20',
    dueDate: '2025-01-20',
    sentDate: '2024-12-20',
    terms: 'Net 30',
    recurring: {
      frequency: 'monthly',
      nextDate: '2025-01-20',
      occurrences: 12
    },
    payments: [],
    lateFeeApplied: false,
    template: 'professional',
    tags: ['recurring', 'maintenance'],
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'EST-2024-001',
    type: 'estimate',
    status: 'pending',
    client: {
      id: 'client-2',
      name: 'TechStart Inc',
      email: 'accounts@techstart.io',
      company: 'TechStart Inc'
    },
    lineItems: [
      { id: 'li-9', description: 'E-commerce Platform Development', quantity: 200, unitPrice: 150, taxRate: 8.5, discount: 10, total: 29295 },
      { id: 'li-10', description: 'Payment Gateway Integration', quantity: 24, unitPrice: 175, taxRate: 8.5, discount: 0, total: 4557 },
      { id: 'li-11', description: 'SEO Optimization', quantity: 40, unitPrice: 100, taxRate: 8.5, discount: 0, total: 4340 }
    ],
    subtotal: 35200,
    taxAmount: 2992,
    discountAmount: 3000,
    total: 35192,
    amountPaid: 0,
    amountDue: 35192,
    currency: 'USD',
    issueDate: '2024-12-22',
    dueDate: '2025-01-22',
    terms: 'Valid for 30 days',
    payments: [],
    lateFeeApplied: false,
    template: 'modern',
    tags: ['estimate', 'ecommerce'],
    createdAt: '2024-12-22T10:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z'
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2024-005',
    type: 'standard',
    status: 'draft',
    client: {
      id: 'client-3',
      name: 'Global Industries',
      email: 'finance@globalind.com',
      company: 'Global Industries Ltd'
    },
    lineItems: [
      { id: 'li-12', description: 'Consulting Services', quantity: 20, unitPrice: 250, taxRate: 8, discount: 0, total: 5400 }
    ],
    subtotal: 5000,
    taxAmount: 400,
    discountAmount: 0,
    total: 5400,
    amountPaid: 0,
    amountDue: 5400,
    currency: 'USD',
    issueDate: '2024-12-23',
    dueDate: '2025-02-06',
    terms: 'Net 45',
    payments: [],
    lateFeeApplied: false,
    template: 'enterprise',
    tags: ['consulting'],
    createdAt: '2024-12-23T14:00:00Z',
    updatedAt: '2024-12-23T14:00:00Z'
  }
]

const mockExpenses: Expense[] = [
  { id: 'exp-1', description: 'Software Licenses', category: 'Software', amount: 1250, date: '2024-12-15', vendor: 'Adobe', billable: true, clientId: 'client-1', status: 'approved' },
  { id: 'exp-2', description: 'Cloud Hosting', category: 'Infrastructure', amount: 850, date: '2024-12-18', vendor: 'AWS', billable: true, clientId: 'client-2', status: 'approved' },
  { id: 'exp-3', description: 'Office Supplies', category: 'Office', amount: 245, date: '2024-12-20', vendor: 'Staples', billable: false, status: 'pending' },
  { id: 'exp-4', description: 'Travel - Client Meeting', category: 'Travel', amount: 675, date: '2024-12-22', vendor: 'Delta Airlines', billable: true, clientId: 'client-3', status: 'approved' }
]

const mockReport: Report = {
  period: 'December 2024',
  totalInvoiced: 121996,
  totalPaid: 33930,
  totalPending: 69772,
  totalOverdue: 18294,
  invoiceCount: 6,
  avgInvoiceValue: 20332,
  avgPaymentTime: 12.5,
  topClients: [
    { clientId: 'client-3', name: 'Global Industries', amount: 56310 },
    { clientId: 'client-2', name: 'TechStart Inc', amount: 52986 },
    { clientId: 'client-1', name: 'Acme Corporation', amount: 12710 }
  ],
  revenueByMonth: [
    { month: 'Jul', amount: 42500 },
    { month: 'Aug', amount: 38750 },
    { month: 'Sep', amount: 51200 },
    { month: 'Oct', amount: 47800 },
    { month: 'Nov', amount: 55400 },
    { month: 'Dec', amount: 121996 }
  ],
  paymentsByMethod: [
    { method: 'bank_transfer', amount: 42500, count: 15 },
    { method: 'credit_card', amount: 35750, count: 28 },
    { method: 'check', amount: 12400, count: 8 },
    { method: 'paypal', amount: 8650, count: 12 }
  ]
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoicingClient() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [clients] = useState<Client[]>(mockClients)
  const [expenses] = useState<Expense[]>(mockExpenses)
  const [report] = useState<Report>(mockReport)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = !searchQuery ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client.company?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setShowClientDialog(true)
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
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
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
                              {invoice.client.company || invoice.client.name}
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
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
                            {client.name.split(' ').map(n => n[0]).join('')}
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

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
              <Card className="border-dashed hover:border-primary cursor-pointer dark:bg-gray-800/50">
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
                              {payment.invoice.client.name} • {payment.method.replace('_', ' ')}
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
                    <Button variant="outline" className="w-full justify-start">
                      <Send className="w-4 h-4 mr-2" />
                      Send Payment Reminders
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Process Recurring
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
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
            <Card className="dark:bg-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses</CardTitle>
                <Button size="sm">
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
                          <Progress value={(client.amount / report.topClients[0].amount) * 100} className="h-2 mt-1" />
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
                <div className="grid grid-cols-4 gap-4">
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
        </Tabs>
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
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h4>
                    <p className="font-semibold">{selectedInvoice.client.company || selectedInvoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.client.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
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
                  <Button className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
