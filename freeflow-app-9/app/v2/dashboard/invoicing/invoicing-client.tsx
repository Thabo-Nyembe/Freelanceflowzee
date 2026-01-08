'use client'

import { useState, useMemo } from 'react'
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
// ENHANCED COMPETITIVE UPGRADE DATA
// ============================================================================

const mockInvoicingAIInsights = [
  { id: '1', type: 'success' as const, title: 'Revenue Optimization', description: 'Invoice collection rate improved 15% this month with automated reminders.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
  { id: '2', type: 'info' as const, title: 'Cash Flow Forecast', description: 'Expected $45,000 in payments within 7 days based on due dates.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Forecast' },
  { id: '3', type: 'warning' as const, title: 'Overdue Invoices', description: '8 invoices totaling $12,500 are over 30 days overdue.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Collections' },
]

const mockInvoicingCollaborators = [
  { id: '1', name: 'Finance Lead', avatar: '/avatars/finance.jpg', status: 'online' as const, role: 'Accounting', lastActive: 'Now' },
  { id: '2', name: 'AR Manager', avatar: '/avatars/ar.jpg', status: 'online' as const, role: 'Collections', lastActive: '5m ago' },
  { id: '3', name: 'Controller', avatar: '/avatars/controller.jpg', status: 'away' as const, role: 'Finance', lastActive: '30m ago' },
]

const mockInvoicingPredictions = [
  { id: '1', label: 'Monthly Revenue', current: 85000, target: 100000, predicted: 92000, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Collection Rate', current: 87, target: 95, predicted: 91, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Avg Days to Pay', current: 28, target: 21, predicted: 25, confidence: 72, trend: 'down' as const },
]

const mockInvoicingActivities = [
  { id: '1', user: 'Finance Lead', action: 'created', target: 'Invoice #INV-2024-156', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'System', action: 'received payment', target: '$3,500 from ABC Corp', timestamp: '45m ago', type: 'success' as const },
  { id: '3', user: 'AR Manager', action: 'sent reminder', target: '5 overdue invoices', timestamp: '2h ago', type: 'info' as const },
]

// Quick actions are now defined inside the component to use dialog state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoicingClient() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [settingsTab, setSettingsTab] = useState('general')
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

  // Quick Actions Dialog States
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false)
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false)
  const [showSendRemindersDialog, setShowSendRemindersDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)

  // Additional Dialog States
  const [showExportInvoicesDialog, setShowExportInvoicesDialog] = useState(false)
  const [showRecurringDialog, setShowRecurringDialog] = useState(false)
  const [showEstimatesDialog, setShowEstimatesDialog] = useState(false)
  const [showOverdueDialog, setShowOverdueDialog] = useState(false)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [showEmailAllDialog, setShowEmailAllDialog] = useState(false)
  const [showStatementsDialog, setShowStatementsDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportClientsDialog, setShowExportClientsDialog] = useState(false)
  const [showPaymentMethodsDialog, setShowPaymentMethodsDialog] = useState(false)
  const [showRefundsDialog, setShowRefundsDialog] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showExportTransactionsDialog, setShowExportTransactionsDialog] = useState(false)
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showExpenseReceiptsDialog, setShowExpenseReceiptsDialog] = useState(false)
  const [showExpenseCategoriesDialog, setShowExpenseCategoriesDialog] = useState(false)
  const [showVendorsDialog, setShowVendorsDialog] = useState(false)
  const [showApproveExpensesDialog, setShowApproveExpensesDialog] = useState(false)
  const [showRecurringExpensesDialog, setShowRecurringExpensesDialog] = useState(false)
  const [showExportExpensesDialog, setShowExportExpensesDialog] = useState(false)
  const [showExpenseReportsDialog, setShowExpenseReportsDialog] = useState(false)
  const [showRevenueReportDialog, setShowRevenueReportDialog] = useState(false)
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showClientReportsDialog, setShowClientReportsDialog] = useState(false)
  const [showExpenseReportDialog, setShowExpenseReportDialog] = useState(false)
  const [showProfitReportDialog, setShowProfitReportDialog] = useState(false)
  const [showScheduleReportDialog, setShowScheduleReportDialog] = useState(false)
  const [showExportReportsDialog, setShowExportReportsDialog] = useState(false)
  const [showPrintReportDialog, setShowPrintReportDialog] = useState(false)
  const [showExportConfigDialog, setShowExportConfigDialog] = useState(false)
  const [showPaymentGatewayDialog, setShowPaymentGatewayDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showDeleteDraftsDialog, setShowDeleteDraftsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showCreateClientInvoiceDialog, setShowCreateClientInvoiceDialog] = useState(false)
  const [showEditClientDialog, setShowEditClientDialog] = useState(false)
  const [showViewClientInvoicesDialog, setShowViewClientInvoicesDialog] = useState(false)
  const [showEditInvoiceDialog, setShowEditInvoiceDialog] = useState(false)
  const [showInvoiceOptionsDialog, setShowInvoiceOptionsDialog] = useState(false)
  const [showProcessRecurringDialog, setShowProcessRecurringDialog] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)

  // Quick Actions with dialog openers
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

  const handleSendInvoice = () => {
    if (!selectedInvoice) return
    toast.success(`Invoice ${selectedInvoice.invoiceNumber} sent successfully!`)
    setShowInvoiceDialog(false)
  }

  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return
    toast.success(`Downloading invoice ${selectedInvoice.invoiceNumber}...`)
  }

  const handlePrintInvoice = () => {
    toast.success('Opening print dialog...')
    window.print()
  }

  const handleDuplicateInvoice = () => {
    if (!selectedInvoice) return
    toast.success(`Invoice ${selectedInvoice.invoiceNumber} duplicated!`)
    setShowInvoiceDialog(false)
  }

  const handleCreateInvoice = () => {
    toast.info('Opening invoice creation form...')
    // In production, this would open a creation dialog or navigate to creation page
  }

  const handleExportInvoices = () => {
    toast.success('Export started', {
      description: 'Invoice data is being exported'
    })
  }

  const handleVoidInvoice = () => {
    if (!selectedInvoice) return
    toast.success('Invoice voided', {
      description: `Invoice ${selectedInvoice.invoiceNumber} has been voided`
    })
    setShowInvoiceDialog(false)
  }

  const handleRecordPayment = () => {
    if (!selectedInvoice) return
    toast.success('Payment recorded', {
      description: `Payment recorded for ${selectedInvoice.invoiceNumber}`
    })
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
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowExportInvoicesDialog(true)}>
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
                { icon: Plus, label: 'New Invoice', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowNewInvoiceDialog(true) },
                { icon: Send, label: 'Send All', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowSendRemindersDialog(true) },
                { icon: Repeat, label: 'Recurring', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowRecurringDialog(true) },
                { icon: Receipt, label: 'Estimates', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowEstimatesDialog(true) },
                { icon: CreditCard, label: 'Payments', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowRecordPaymentDialog(true) },
                { icon: AlertTriangle, label: 'Overdue', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setShowOverdueDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportInvoicesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setActiveTab('reports') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
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
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); setShowInvoiceOptionsDialog(true); }}>
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
                { icon: Plus, label: 'Add Client', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowAddClientDialog(true) },
                { icon: Building2, label: 'Companies', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => setShowClientReportsDialog(true) },
                { icon: Mail, label: 'Email All', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowEmailAllDialog(true) },
                { icon: FileText, label: 'Statements', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowStatementsDialog(true) },
                { icon: Tag, label: 'Categories', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowCategoriesDialog(true) },
                { icon: Globe, label: 'Import', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowImportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowExportClientsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setActiveTab('reports') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
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
                { icon: Plus, label: 'Record', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowRecordPaymentDialog(true) },
                { icon: CreditCard, label: 'Methods', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => setShowPaymentMethodsDialog(true) },
                { icon: RefreshCw, label: 'Refunds', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setShowRefundsDialog(true) },
                { icon: Banknote, label: 'Bank', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowBankDialog(true) },
                { icon: Receipt, label: 'Receipts', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowReceiptsDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowScheduleDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportTransactionsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setActiveTab('reports') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowExportTransactionsDialog(true)}>
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
                { icon: Plus, label: 'Add', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => setShowAddExpenseDialog(true) },
                { icon: Receipt, label: 'Receipts', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setShowExpenseReceiptsDialog(true) },
                { icon: Tag, label: 'Categories', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => setShowExpenseCategoriesDialog(true) },
                { icon: Users, label: 'Vendors', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowVendorsDialog(true) },
                { icon: FileCheck, label: 'Approve', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowApproveExpensesDialog(true) },
                { icon: Repeat, label: 'Recurring', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowRecurringExpensesDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportExpensesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setShowExpenseReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
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
                { icon: PieChart, label: 'Revenue', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setShowRevenueReportDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowTrendsDialog(true) },
                { icon: Users, label: 'Clients', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowClientReportsDialog(true) },
                { icon: Receipt, label: 'Expenses', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowExpenseReportDialog(true) },
                { icon: DollarSign, label: 'Profit', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowProfitReportDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowScheduleReportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportReportsDialog(true) },
                { icon: Printer, label: 'Print', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setShowPrintReportDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-3 gap-4">
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
                            <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(true)}>Regenerate</Button>
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
              insights={mockInvoicingAIInsights}
              title="Invoicing Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockInvoicingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockInvoicingPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockInvoicingActivities}
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
                  <Button variant="outline" onClick={() => toast.success('Edit mode ready')}>
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
                  <Button className="flex-1" onClick={() => { setShowClientDialog(false); setShowCreateClientInvoiceDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button variant="outline" onClick={() => { setShowClientDialog(false); setShowEditClientDialog(true); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </Button>
                  <Button variant="outline" onClick={() => { setShowClientDialog(false); setShowViewClientInvoicesDialog(true); }}>
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
              <FileText className="w-5 h-5 text-blue-600" />
              Create New Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Invoice Type</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  <option value="standard">Standard Invoice</option>
                  <option value="recurring">Recurring Invoice</option>
                  <option value="estimate">Estimate</option>
                  <option value="credit_memo">Credit Memo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <Label>Description</Label>
              <Input placeholder="Invoice description..." className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input type="number" defaultValue="1" className="mt-1" />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Input type="number" defaultValue="10" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                toast.success('Invoice created successfully')
                setShowNewInvoiceDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" onClick={() => setShowNewInvoiceDialog(false)}>
                Cancel
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
            <div>
              <Label>Invoice</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="">Select an invoice...</option>
                {invoices.filter(inv => inv.amountDue > 0).map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.client.name} ({formatCurrency(invoice.amountDue)} due)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Payment Method</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input placeholder="Transaction reference..." className="mt-1" />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input placeholder="Payment notes..." className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Payment recorded successfully')
                setShowRecordPaymentDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline" onClick={() => setShowRecordPaymentDialog(false)}>
                Cancel
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
              <Send className="w-5 h-5 text-indigo-600" />
              Send Payment Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-600">{invoices.filter(inv => inv.status === 'overdue').length}</p>
            </div>
            <div>
              <Label>Select Invoices to Remind</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {invoices.filter(inv => ['overdue', 'sent', 'viewed'].includes(inv.status)).map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    <input type="checkbox" defaultChecked={invoice.status === 'overdue'} className="rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{invoice.client.name} - {formatCurrency(invoice.amountDue)}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Reminder Message Template</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="friendly">Friendly Reminder</option>
                <option value="urgent">Urgent Notice</option>
                <option value="final">Final Notice</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success('Payment reminders sent successfully')
                setShowSendRemindersDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button variant="outline" onClick={() => setShowSendRemindersDialog(false)}>
                Cancel
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
              Export Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="invoices">Invoices Summary</option>
                <option value="payments">Payments Report</option>
                <option value="clients">Client Statement</option>
                <option value="aging">Aging Report</option>
                <option value="revenue">Revenue Report</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Export Format</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="format" value="pdf" defaultChecked className="rounded" />
                  <span className="text-sm">PDF</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="format" value="csv" className="rounded" />
                  <span className="text-sm">CSV</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="format" value="excel" className="rounded" />
                  <span className="text-sm">Excel</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include detailed line items</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Report exported successfully')
                setShowExportReportDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Invoices Dialog */}
      <Dialog open={showExportInvoicesDialog} onOpenChange={setShowExportInvoicesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
            </div>
            <div>
              <Label>Status Filter</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="all">All Statuses</option>
                <option value="paid">Paid Only</option>
                <option value="pending">Pending Only</option>
                <option value="overdue">Overdue Only</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Invoices exported successfully')
                setShowExportInvoicesDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowExportInvoicesDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurring Invoices Dialog */}
      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-600" />
              Recurring Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{invoices.filter(inv => inv.type === 'recurring').length}</p>
              <p className="text-sm text-muted-foreground">Active Recurring Invoices</p>
            </div>
            <div className="space-y-2">
              {invoices.filter(inv => inv.type === 'recurring').map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name} - {formatCurrency(inv.total)}</p>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                setShowRecurringDialog(false)
                setShowNewInvoiceDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Recurring Invoice
              </Button>
              <Button variant="outline" onClick={() => setShowRecurringDialog(false)}>
                Close
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
              <FileCheck className="w-5 h-5 text-green-600" />
              Estimates & Quotes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{invoices.filter(inv => inv.type === 'estimate').length}</p>
              <p className="text-sm text-muted-foreground">Active Estimates</p>
            </div>
            <div className="space-y-2">
              {invoices.filter(inv => inv.type === 'estimate').map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name} - {formatCurrency(inv.total)}</p>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                setShowEstimatesDialog(false)
                setShowNewInvoiceDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Estimate
              </Button>
              <Button variant="outline" onClick={() => setShowEstimatesDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overdue Invoices Dialog */}
      <Dialog open={showOverdueDialog} onOpenChange={setShowOverdueDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Overdue Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amountDue, 0))}</p>
              <p className="text-sm text-muted-foreground">Total Overdue Amount</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invoices.filter(inv => inv.status === 'overdue').map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.client.name}</p>
                    <p className="text-xs text-red-600">{getDaysOverdue(inv.dueDate)} days overdue</p>
                  </div>
                  <p className="font-bold text-red-600">{formatCurrency(inv.amountDue)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => {
                setShowOverdueDialog(false)
                setShowSendRemindersDialog(true)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button variant="outline" onClick={() => setShowOverdueDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Name</Label>
                <Input placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Company</Label>
                <Input placeholder="Company Name" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Street Address" className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input placeholder="City" className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input placeholder="State" className="mt-1" />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input placeholder="12345" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms (Days)</Label>
                <Input type="number" defaultValue="30" className="mt-1" />
              </div>
              <div>
                <Label>Credit Limit</Label>
                <Input type="number" placeholder="50000" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Client added successfully')
                setShowAddClientDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email All Clients Dialog */}
      <Dialog open={showEmailAllDialog} onOpenChange={setShowEmailAllDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              Email All Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input placeholder="Email subject..." className="mt-1" />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-h-[120px]"
                placeholder="Enter your message..."
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">This will send to {clients.length} clients</p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Emails sent successfully')
                setShowEmailAllDialog(false)
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send to All
              </Button>
              <Button variant="outline" onClick={() => setShowEmailAllDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Statements Dialog */}
      <Dialog open={showStatementsDialog} onOpenChange={setShowStatementsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Generate Statements
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="all">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Statement Period</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include payment history</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.success('Statements generated successfully')
                setShowStatementsDialog(false)
              }}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Statements
              </Button>
              <Button variant="outline" onClick={() => setShowStatementsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Manage Categories
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {['Corporate', 'Small Business', 'Startup', 'Enterprise', 'Non-Profit'].map((cat) => (
                <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="New category..." className="flex-1" />
              <Button onClick={() => toast.success('Category added')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowCategoriesDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Clients Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-600" />
              Import Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drop CSV or Excel file here</p>
              <Button variant="outline" size="sm">Browse Files</Button>
            </div>
            <div>
              <Label>Import Source</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="csv">CSV File</option>
                <option value="xlsx">Excel File</option>
                <option value="quickbooks">QuickBooks</option>
                <option value="xero">Xero</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => {
                toast.success('Import started')
                setShowImportDialog(false)
              }}>
                <Globe className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Clients Dialog */}
      <Dialog open={showExportClientsDialog} onOpenChange={setShowExportClientsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Export Clients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include contact details</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include billing history</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success('Clients exported successfully')
                setShowExportClientsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowExportClientsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={showPaymentMethodsDialog} onOpenChange={setShowPaymentMethodsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Payment Methods
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'Credit Card', icon: CreditCard, enabled: true },
              { name: 'Bank Transfer', icon: Building2, enabled: true },
              { name: 'PayPal', icon: Wallet, enabled: false },
              { name: 'Check', icon: Receipt, enabled: true },
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <method.icon className="w-5 h-5 text-gray-600" />
                  <span>{method.name}</span>
                </div>
                <Switch defaultChecked={method.enabled} />
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setShowPaymentMethodsDialog(false)}>
              Done
            </Button>
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
            <div>
              <Label>Select Invoice</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="">Select a paid invoice...</option>
                {invoices.filter(inv => inv.status === 'paid').map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.client.name} ({formatCurrency(invoice.total)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Refund Amount</Label>
              <Input type="number" placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Reason</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-h-[80px]"
                placeholder="Reason for refund..."
              />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('Refund processed successfully')
                setShowRefundsDialog(false)
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Process Refund
              </Button>
              <Button variant="outline" onClick={() => setShowRefundsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Settings Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              Bank Account Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bank Name</Label>
              <Input placeholder="Bank Name" className="mt-1" />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input placeholder="Account Holder Name" className="mt-1" />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input placeholder="XXXX-XXXX-XXXX" className="mt-1" />
            </div>
            <div>
              <Label>Routing Number</Label>
              <Input placeholder="XXX-XXX-XXX" className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Bank settings saved')
                setShowBankDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => setShowBankDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Payment Receipts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invoices.flatMap(inv => inv.payments.map(p => ({ ...p, invoice: inv }))).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowReceiptsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Payment Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Upcoming Payments (Next 30 Days)</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').reduce((sum, inv) => sum + inv.amountDue, 0))}</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invoices.filter(inv => ['sent', 'viewed', 'pending'].includes(inv.status)).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(inv.amountDue)}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowScheduleDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Transactions Dialog */}
      <Dialog open={showExportTransactionsDialog} onOpenChange={setShowExportTransactionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="qbo">QuickBooks (QBO)</option>
              </select>
            </div>
            <div>
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Transactions exported successfully')
                setShowExportTransactionsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowExportTransactionsDialog(false)}>
                Cancel
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
              <Receipt className="w-5 h-5 text-rose-600" />
              Add Expense
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input placeholder="Expense description..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  <option value="software">Software</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="office">Office</option>
                  <option value="travel">Travel</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div>
                <Label>Vendor</Label>
                <Input placeholder="Vendor name" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Billable to client</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => {
                toast.success('Expense added successfully')
                setShowAddExpenseDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Receipts Dialog */}
      <Dialog open={showExpenseReceiptsDialog} onOpenChange={setShowExpenseReceiptsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-pink-600" />
              Upload Receipts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drop receipt images here</p>
              <Button variant="outline" size="sm">Browse Files</Button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Auto-extract expense data with OCR</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={() => {
                toast.success('Receipts uploaded successfully')
                setShowExpenseReceiptsDialog(false)
              }}>
                <Receipt className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" onClick={() => setShowExpenseReceiptsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Categories Dialog */}
      <Dialog open={showExpenseCategoriesDialog} onOpenChange={setShowExpenseCategoriesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-fuchsia-600" />
              Expense Categories
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {['Software', 'Infrastructure', 'Office', 'Travel', 'Marketing', 'Equipment'].map((cat) => (
                <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="New category..." className="flex-1" />
              <Button onClick={() => toast.success('Category added')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowExpenseCategoriesDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendors Dialog */}
      <Dialog open={showVendorsDialog} onOpenChange={setShowVendorsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Manage Vendors
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {['Adobe', 'AWS', 'Staples', 'Delta Airlines', 'Google', 'Microsoft'].map((vendor) => (
                <div key={vendor} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{vendor}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add new vendor..." className="flex-1" />
              <Button onClick={() => toast.success('Vendor added')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowVendorsDialog(false)}>
              Done
            </Button>
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
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{expenses.filter(e => e.status === 'pending').length}</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expenses.filter(e => e.status === 'pending').map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.vendor} - {new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => toast.success('Expense approved')}>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('All expenses approved')
                setShowApproveExpensesDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve All
              </Button>
              <Button variant="outline" onClick={() => setShowApproveExpensesDialog(false)}>
                Close
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
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Recurring</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(2100)}</p>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Cloud Hosting', amount: 850, freq: 'Monthly' },
                { name: 'Software Licenses', amount: 1250, freq: 'Monthly' },
              ].map((exp) => (
                <div key={exp.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{exp.name}</p>
                    <p className="text-sm text-muted-foreground">{exp.freq}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                setShowRecurringExpensesDialog(false)
                setShowAddExpenseDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recurring Expense
              </Button>
              <Button variant="outline" onClick={() => setShowRecurringExpensesDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Expenses Dialog */}
      <Dialog open={showExportExpensesDialog} onOpenChange={setShowExportExpensesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Expenses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Expenses exported successfully')
                setShowExportExpensesDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowExportExpensesDialog(false)}>
                Cancel
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
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold">{formatCurrency(expenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-muted-foreground">Billable</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Software', 'Infrastructure', 'Office', 'Travel'].map((cat) => (
                <div key={cat} className="flex items-center justify-between p-2">
                  <span className="text-sm">{cat}</span>
                  <Progress value={Math.random() * 100} className="w-32 h-2" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowExpenseReportsDialog(false)}>
              Close
            </Button>
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
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center">
              <p className="text-3xl font-bold text-violet-600">{formatCurrency(report.totalInvoiced)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(report.totalPaid)}</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(report.totalPending)}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowRevenueReportDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trends Dialog */}
      <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Revenue Trends
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-48 flex items-end justify-between gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              {report.revenueByMonth.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-violet-500 rounded-t-lg"
                    style={{ height: `${(month.amount / 150000) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600">+23.5% increase from previous period</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowTrendsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Reports Dialog */}
      <Dialog open={showClientReportsDialog} onOpenChange={setShowClientReportsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Client Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {report.topClients.map((client, index) => (
                <div key={client.clientId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
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
            <Button variant="outline" className="w-full" onClick={() => setShowClientReportsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profit Report Dialog */}
      <Dialog open={showProfitReportDialog} onOpenChange={setShowProfitReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Profit & Loss
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(report.totalPaid)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-red-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-xs text-muted-foreground">Expenses</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-600">{formatCurrency(report.totalPaid - expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-xs text-muted-foreground">Net Profit</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowProfitReportDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleReportDialog} onOpenChange={setShowScheduleReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Schedule Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="revenue">Revenue Report</option>
                <option value="expenses">Expense Report</option>
                <option value="profitloss">Profit & Loss</option>
                <option value="aging">Aging Report</option>
              </select>
            </div>
            <div>
              <Label>Frequency</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <Label>Email Recipients</Label>
              <Input placeholder="email@example.com" className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => {
                toast.success('Report scheduled successfully')
                setShowScheduleReportDialog(false)
              }}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleReportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Reports Dialog */}
      <Dialog open={showExportReportsDialog} onOpenChange={setShowExportReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="all">All Reports</option>
                <option value="revenue">Revenue Report</option>
                <option value="expenses">Expense Report</option>
                <option value="profitloss">Profit & Loss</option>
              </select>
            </div>
            <div>
              <Label>Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                toast.success('Reports exported successfully')
                setShowExportReportsDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowExportReportsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Report Dialog */}
      <Dialog open={showPrintReportDialog} onOpenChange={setShowPrintReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-slate-600" />
              Print Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="revenue">Revenue Report</option>
                <option value="expenses">Expense Report</option>
                <option value="profitloss">Profit & Loss</option>
                <option value="aging">Aging Report</option>
              </select>
            </div>
            <div>
              <Label>Paper Size</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="letter">Letter</option>
                <option value="a4">A4</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-slate-600 hover:bg-slate-700" onClick={() => {
                toast.success('Opening print dialog...')
                window.print()
                setShowPrintReportDialog(false)
              }}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={() => setShowPrintReportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Config Dialog */}
      <Dialog open={showExportConfigDialog} onOpenChange={setShowExportConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-slate-600" />
              Export Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">This will export all your invoicing settings including templates, payment methods, and preferences.</p>
            </div>
            <div>
              <Label>Format</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-slate-600 hover:bg-slate-700" onClick={() => {
                toast.success('Configuration exported successfully')
                setShowExportConfigDialog(false)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Config
              </Button>
              <Button variant="outline" onClick={() => setShowExportConfigDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog open={showPaymentGatewayDialog} onOpenChange={setShowPaymentGatewayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              {selectedGateway} Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter API key..." className="mt-1" />
            </div>
            <div>
              <Label>Secret Key</Label>
              <Input type="password" placeholder="Enter secret key..." className="mt-1" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Enable test mode</span>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                toast.success(`${selectedGateway} settings saved`)
                setShowPaymentGatewayDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentGatewayDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-red-600" />
              Regenerate API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600">Warning: Regenerating your API key will invalidate the current key. Any applications using the old key will stop working.</p>
            </div>
            <div>
              <Label>Confirm by typing &quot;REGENERATE&quot;</Label>
              <Input placeholder="Type REGENERATE..." className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('API key regenerated successfully')
                setShowRegenerateApiKeyDialog(false)
              }}>
                <Key className="w-4 h-4 mr-2" />
                Regenerate Key
              </Button>
              <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Drafts Dialog */}
      <Dialog open={showDeleteDraftsDialog} onOpenChange={setShowDeleteDraftsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete All Draft Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600">This action cannot be undone. All {invoices.filter(inv => inv.status === 'draft').length} draft invoices will be permanently deleted.</p>
            </div>
            <div>
              <Label>Type &quot;DELETE&quot; to confirm</Label>
              <Input placeholder="Type DELETE..." className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="destructive" className="flex-1" onClick={() => {
                toast.success('Draft invoices deleted')
                setShowDeleteDraftsDialog(false)
              }}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Drafts
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDraftsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reset All Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600">This will reset all invoicing settings to their default values. Your data will not be affected.</p>
            </div>
            <div>
              <Label>Type &quot;RESET&quot; to confirm</Label>
              <Input placeholder="Type RESET..." className="mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="destructive" className="flex-1" onClick={() => {
                toast.success('Settings reset to defaults')
                setShowResetSettingsDialog(false)
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Client Invoice Dialog */}
      <Dialog open={showCreateClientInvoiceDialog} onOpenChange={setShowCreateClientInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Create Invoice for {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-sm">Client: <span className="font-medium">{selectedClient?.name}</span></p>
              <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Type</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  <option value="standard">Standard Invoice</option>
                  <option value="recurring">Recurring Invoice</option>
                  <option value="estimate">Estimate</option>
                </select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Invoice description..." className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input type="number" defaultValue="1" className="mt-1" />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input type="number" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Input type="number" defaultValue="10" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                toast.success('Invoice created successfully')
                setShowCreateClientInvoiceDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" onClick={() => setShowCreateClientInvoiceDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditClientDialog} onOpenChange={setShowEditClientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Client: {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Name</Label>
                <Input defaultValue={selectedClient?.name} className="mt-1" />
              </div>
              <div>
                <Label>Company</Label>
                <Input defaultValue={selectedClient?.company} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue={selectedClient?.email} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input defaultValue={selectedClient?.phone} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input defaultValue={selectedClient?.address} className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input defaultValue={selectedClient?.city} className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input defaultValue={selectedClient?.state} className="mt-1" />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input defaultValue={selectedClient?.zip} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.success('Client updated successfully')
                setShowEditClientDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditClientDialog(false)}>
                Cancel
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
              <FileText className="w-5 h-5 text-purple-600" />
              Invoices for {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(selectedClient?.totalPaid || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Paid</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-xl font-bold text-orange-600">{formatCurrency(selectedClient?.balance || 0)}</p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invoices.filter(inv => inv.client.id === selectedClient?.id).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { setShowViewClientInvoicesDialog(false); handleViewInvoice(inv); }}>
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{formatCurrency(inv.total)}</p>
                    {getStatusBadge(inv.status)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowViewClientInvoicesDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditInvoiceDialog} onOpenChange={setShowEditInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Invoice: {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800" defaultValue={selectedInvoice?.client.id}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800" defaultValue={selectedInvoice?.status}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date</Label>
                <Input type="date" defaultValue={selectedInvoice?.issueDate} className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" defaultValue={selectedInvoice?.dueDate} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-h-[80px]"
                defaultValue={selectedInvoice?.notes}
                placeholder="Invoice notes..."
              />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.success('Invoice updated successfully')
                setShowEditInvoiceDialog(false)
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditInvoiceDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Options Dialog */}
      <Dialog open={showInvoiceOptionsDialog} onOpenChange={setShowInvoiceOptionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
              Invoice Options: {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => { setShowInvoiceOptionsDialog(false); handleViewInvoice(selectedInvoice!); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { setShowInvoiceOptionsDialog(false); setShowEditInvoiceDialog(true); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { toast.success('Invoice sent'); setShowInvoiceOptionsDialog(false); }}>
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { toast.success('Invoice duplicated'); setShowInvoiceOptionsDialog(false); }}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { toast.success('Downloading...'); setShowInvoiceOptionsDialog(false); }}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => { toast.success('Invoice voided'); setShowInvoiceOptionsDialog(false); }}>
              <FileX className="w-4 h-4 mr-2" />
              Void Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Recurring Dialog */}
      <Dialog open={showProcessRecurringDialog} onOpenChange={setShowProcessRecurringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Process Recurring Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Recurring invoices ready to process</p>
              <p className="text-2xl font-bold text-purple-600">{invoices.filter(inv => inv.type === 'recurring').length}</p>
            </div>
            <div className="space-y-2">
              {invoices.filter(inv => inv.type === 'recurring').map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{inv.client.name}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(inv.total)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success('Recurring invoices processed')
                setShowProcessRecurringDialog(false)
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Process Selected
              </Button>
              <Button variant="outline" onClick={() => setShowProcessRecurringDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Report Dialog (for reports tab) */}
      <Dialog open={showExpenseReportDialog} onOpenChange={setShowExpenseReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Expense Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(expenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0))}</p>
                <p className="text-sm text-muted-foreground">Billable</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Software', 'Infrastructure', 'Office', 'Travel'].map((cat) => {
                const catExpenses = expenses.filter(e => e.category === cat)
                const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0)
                return (
                  <div key={cat} className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm font-medium">{cat}</span>
                    <span className="font-semibold">{formatCurrency(catTotal)}</span>
                  </div>
                )
              })}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowExpenseReportDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
