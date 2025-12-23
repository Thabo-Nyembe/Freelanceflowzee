'use client'

import { useState, useMemo } from 'react'
import {
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Download,
  FileText,
  Eye,
  Plus,
  Search,
  Users,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wallet,
  Banknote,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  UserX,
  Globe,
  Percent,
  Settings,
  MoreVertical,
  ExternalLink,
  Copy,
  Filter,
  Zap,
  CircleDollarSign,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Send,
  XCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
type TransactionType = 'payment' | 'payout' | 'transfer' | 'refund' | 'fee'
type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'processing'
type AccountStatus = 'active' | 'pending' | 'restricted' | 'disabled'
type DisputeStatus = 'needs_response' | 'under_review' | 'won' | 'lost' | 'withdrawn'
type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  fee: number
  net: number
  currency: string
  status: TransactionStatus
  description: string
  customer: string | null
  connectedAccount: string | null
  platformFee: number
  createdAt: string
  metadata: Record<string, string>
}

interface ConnectedAccount {
  id: string
  businessName: string
  email: string
  country: string
  type: 'individual' | 'company'
  status: AccountStatus
  payoutsEnabled: boolean
  chargesEnabled: boolean
  balance: {
    available: number
    pending: number
  }
  requirements: {
    currentlyDue: string[]
    pastDue: string[]
    eventuallyDue: string[]
  }
  createdAt: string
  lastPayout: string | null
  totalVolume: number
  totalPayouts: number
}

interface Payout {
  id: string
  amount: number
  currency: string
  status: PayoutStatus
  arrivalDate: string
  method: 'standard' | 'instant'
  destination: string
  connectedAccount: string | null
  description: string
  createdAt: string
}

interface Dispute {
  id: string
  amount: number
  currency: string
  status: DisputeStatus
  reason: string
  transactionId: string
  customer: string
  dueBy: string
  createdAt: string
  evidence: {
    submitted: boolean
    dueDate: string
  }
}

interface Balance {
  available: number
  pending: number
  reserved: number
  currency: string
}

// Mock Data
const mockBalance: Balance = {
  available: 125432.50,
  pending: 34567.80,
  reserved: 5000.00,
  currency: 'USD'
}

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    type: 'payment',
    amount: 5000.00,
    fee: 175.00,
    net: 4825.00,
    currency: 'USD',
    status: 'succeeded',
    description: 'Website Development Project',
    customer: 'Acme Corp',
    connectedAccount: 'acct_1',
    platformFee: 250.00,
    createdAt: '2024-12-23T10:30:00Z',
    metadata: { project_id: 'proj_123', invoice: 'INV-001' }
  },
  {
    id: 'txn_2',
    type: 'payment',
    amount: 2500.00,
    fee: 87.50,
    net: 2412.50,
    currency: 'USD',
    status: 'succeeded',
    description: 'Logo Design Package',
    customer: 'Tech Startup Inc',
    connectedAccount: 'acct_2',
    platformFee: 125.00,
    createdAt: '2024-12-22T15:45:00Z',
    metadata: { project_id: 'proj_124' }
  },
  {
    id: 'txn_3',
    type: 'payout',
    amount: 3500.00,
    fee: 0,
    net: 3500.00,
    currency: 'USD',
    status: 'succeeded',
    description: 'Weekly payout',
    customer: null,
    connectedAccount: 'acct_1',
    platformFee: 0,
    createdAt: '2024-12-21T09:00:00Z',
    metadata: {}
  },
  {
    id: 'txn_4',
    type: 'payment',
    amount: 8500.00,
    fee: 297.50,
    net: 8202.50,
    currency: 'USD',
    status: 'pending',
    description: 'Mobile App Development - Phase 1',
    customer: 'Enterprise Solutions',
    connectedAccount: 'acct_3',
    platformFee: 425.00,
    createdAt: '2024-12-23T14:20:00Z',
    metadata: { project_id: 'proj_125', milestone: '1' }
  },
  {
    id: 'txn_5',
    type: 'refund',
    amount: -500.00,
    fee: 0,
    net: -500.00,
    currency: 'USD',
    status: 'succeeded',
    description: 'Partial refund - scope reduction',
    customer: 'Tech Startup Inc',
    connectedAccount: null,
    platformFee: 0,
    createdAt: '2024-12-20T11:30:00Z',
    metadata: { original_txn: 'txn_2' }
  },
  {
    id: 'txn_6',
    type: 'fee',
    amount: -45.00,
    fee: 0,
    net: -45.00,
    currency: 'USD',
    status: 'succeeded',
    description: 'Platform fee - December',
    customer: null,
    connectedAccount: null,
    platformFee: 0,
    createdAt: '2024-12-01T00:00:00Z',
    metadata: {}
  }
]

const mockConnectedAccounts: ConnectedAccount[] = [
  {
    id: 'acct_1',
    businessName: 'WebDev Pro LLC',
    email: 'billing@webdevpro.com',
    country: 'US',
    type: 'company',
    status: 'active',
    payoutsEnabled: true,
    chargesEnabled: true,
    balance: { available: 12500.00, pending: 3500.00 },
    requirements: { currentlyDue: [], pastDue: [], eventuallyDue: [] },
    createdAt: '2024-01-15T00:00:00Z',
    lastPayout: '2024-12-21T09:00:00Z',
    totalVolume: 156000.00,
    totalPayouts: 142000.00
  },
  {
    id: 'acct_2',
    businessName: 'Creative Design Studio',
    email: 'hello@creativedesign.co',
    country: 'US',
    type: 'company',
    status: 'active',
    payoutsEnabled: true,
    chargesEnabled: true,
    balance: { available: 8200.00, pending: 2500.00 },
    requirements: { currentlyDue: [], pastDue: [], eventuallyDue: ['tax_id'] },
    createdAt: '2024-03-20T00:00:00Z',
    lastPayout: '2024-12-20T09:00:00Z',
    totalVolume: 89000.00,
    totalPayouts: 78000.00
  },
  {
    id: 'acct_3',
    businessName: 'John Smith',
    email: 'john@freelance.dev',
    country: 'US',
    type: 'individual',
    status: 'pending',
    payoutsEnabled: false,
    chargesEnabled: true,
    balance: { available: 0, pending: 8500.00 },
    requirements: {
      currentlyDue: ['bank_account', 'ssn_last_4'],
      pastDue: [],
      eventuallyDue: []
    },
    createdAt: '2024-12-15T00:00:00Z',
    lastPayout: null,
    totalVolume: 8500.00,
    totalPayouts: 0
  },
  {
    id: 'acct_4',
    businessName: 'Marketing Agency Plus',
    email: 'accounts@marketingplus.io',
    country: 'CA',
    type: 'company',
    status: 'restricted',
    payoutsEnabled: false,
    chargesEnabled: false,
    balance: { available: 5600.00, pending: 0 },
    requirements: {
      currentlyDue: [],
      pastDue: ['verification_document'],
      eventuallyDue: []
    },
    createdAt: '2024-06-10T00:00:00Z',
    lastPayout: '2024-11-15T09:00:00Z',
    totalVolume: 45000.00,
    totalPayouts: 39400.00
  }
]

const mockPayouts: Payout[] = [
  {
    id: 'po_1',
    amount: 3500.00,
    currency: 'USD',
    status: 'paid',
    arrivalDate: '2024-12-21T00:00:00Z',
    method: 'standard',
    destination: '****4242',
    connectedAccount: 'acct_1',
    description: 'Weekly payout',
    createdAt: '2024-12-19T09:00:00Z'
  },
  {
    id: 'po_2',
    amount: 2800.00,
    currency: 'USD',
    status: 'in_transit',
    arrivalDate: '2024-12-24T00:00:00Z',
    method: 'standard',
    destination: '****5678',
    connectedAccount: 'acct_2',
    description: 'Weekly payout',
    createdAt: '2024-12-22T09:00:00Z'
  },
  {
    id: 'po_3',
    amount: 1500.00,
    currency: 'USD',
    status: 'pending',
    arrivalDate: '2024-12-26T00:00:00Z',
    method: 'standard',
    destination: '****4242',
    connectedAccount: 'acct_1',
    description: 'Scheduled payout',
    createdAt: '2024-12-23T09:00:00Z'
  },
  {
    id: 'po_4',
    amount: 5000.00,
    currency: 'USD',
    status: 'paid',
    arrivalDate: '2024-12-20T00:00:00Z',
    method: 'instant',
    destination: '****4242',
    connectedAccount: 'acct_1',
    description: 'Instant payout',
    createdAt: '2024-12-20T14:30:00Z'
  }
]

const mockDisputes: Dispute[] = [
  {
    id: 'dp_1',
    amount: 500.00,
    currency: 'USD',
    status: 'needs_response',
    reason: 'product_not_received',
    transactionId: 'txn_old_1',
    customer: 'customer@example.com',
    dueBy: '2024-12-30T00:00:00Z',
    createdAt: '2024-12-20T10:00:00Z',
    evidence: { submitted: false, dueDate: '2024-12-30T00:00:00Z' }
  },
  {
    id: 'dp_2',
    amount: 250.00,
    currency: 'USD',
    status: 'under_review',
    reason: 'duplicate',
    transactionId: 'txn_old_2',
    customer: 'buyer@company.com',
    dueBy: '2024-12-25T00:00:00Z',
    createdAt: '2024-12-15T14:00:00Z',
    evidence: { submitted: true, dueDate: '2024-12-25T00:00:00Z' }
  },
  {
    id: 'dp_3',
    amount: 1200.00,
    currency: 'USD',
    status: 'won',
    reason: 'fraudulent',
    transactionId: 'txn_old_3',
    customer: 'suspect@fake.com',
    dueBy: '2024-12-10T00:00:00Z',
    createdAt: '2024-11-28T09:00:00Z',
    evidence: { submitted: true, dueDate: '2024-12-10T00:00:00Z' }
  }
]

export default function EscrowClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showCreatePayout, setShowCreatePayout] = useState(false)
  const [showInviteAccount, setShowInviteAccount] = useState(false)
  const [transactionFilter, setTransactionFilter] = useState<TransactionType | 'all'>('all')

  // Stats
  const totalVolume = mockTransactions.filter(t => t.type === 'payment' && t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0)
  const platformFees = mockTransactions.filter(t => t.type === 'payment' && t.status === 'succeeded')
    .reduce((sum, t) => sum + t.platformFee, 0)
  const activeAccounts = mockConnectedAccounts.filter(a => a.status === 'active').length
  const pendingDisputes = mockDisputes.filter(d => d.status === 'needs_response').length

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.customer?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = transactionFilter === 'all' || t.type === transactionFilter
      return matchesSearch && matchesType
    })
  }, [searchQuery, transactionFilter])

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'payment': return ArrowDownRight
      case 'payout': return ArrowUpRight
      case 'transfer': return ArrowRight
      case 'refund': return RefreshCw
      case 'fee': return Percent
    }
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'payment': return 'text-green-500 bg-green-500/10'
      case 'payout': return 'text-blue-500 bg-blue-500/10'
      case 'transfer': return 'text-purple-500 bg-purple-500/10'
      case 'refund': return 'text-orange-500 bg-orange-500/10'
      case 'fee': return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusColor = (status: TransactionStatus | AccountStatus | DisputeStatus | PayoutStatus) => {
    switch (status) {
      case 'succeeded':
      case 'active':
      case 'won':
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'pending':
      case 'in_transit':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'failed':
      case 'restricted':
      case 'lost':
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'disabled':
      case 'withdrawn':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
      case 'needs_response':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Escrow & Payments</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Stripe Connect Level
                  </span>
                </div>
                <p className="text-emerald-100 max-w-2xl">
                  Secure marketplace payments with multi-party splits, connected accounts, and automated payouts
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreatePayout(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Banknote className="w-4 h-4" />
                  Create Payout
                </button>
                <button
                  onClick={() => setShowInviteAccount(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Invite Account
                </button>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Available Balance</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(mockBalance.available)}</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Ready to withdraw
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Pending</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(mockBalance.pending)}</div>
                <div className="text-emerald-200 text-xs mt-1">Processing payments</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Platform Fees</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(platformFees)}</div>
                <div className="text-emerald-200 text-xs mt-1">This month</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Total Volume</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(totalVolume)}</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18% vs last month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg">Transactions</TabsTrigger>
              <TabsTrigger value="payouts" className="rounded-lg">Payouts</TabsTrigger>
              <TabsTrigger value="accounts" className="rounded-lg">Connected Accounts</TabsTrigger>
              <TabsTrigger value="disputes" className="rounded-lg">
                Disputes
                {pendingDisputes > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingDisputes}</span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {mockTransactions.slice(0, 5).map(txn => {
                    const Icon = getTransactionIcon(txn.type)
                    return (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedTransaction(txn)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTransactionColor(txn.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{txn.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {txn.customer || 'Platform'} · {new Date(txn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-6">
                {/* Account Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Accounts</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{mockConnectedAccounts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                      <span className="font-semibold text-green-600">{activeAccounts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Needs Attention</span>
                      <span className="font-semibold text-orange-600">
                        {mockConnectedAccounts.filter(a => a.requirements.currentlyDue.length > 0).length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="w-full mt-4 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    Manage Accounts
                  </button>
                </div>

                {/* Disputes Alert */}
                {pendingDisputes > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          {pendingDisputes} Dispute{pendingDisputes > 1 ? 's' : ''} Need Response
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-300">
                          Respond before the deadline to avoid auto-loss
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="mt-3 text-sm text-orange-700 dark:text-orange-300 hover:underline"
                    >
                      View Disputes →
                    </button>
                  </div>
                )}

                {/* Compliance Status */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">PCI DSS Compliant</p>
                        <p className="text-xs text-green-600 dark:text-green-300">Level 1 certified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <BadgeCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">KYC/AML Verified</p>
                        <p className="text-xs text-green-600 dark:text-green-300">All accounts verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'payment', 'payout', 'refund'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTransactionFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                      transactionFilter === type
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map(txn => {
                    const Icon = getTransactionIcon(txn.type)
                    return (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getTransactionColor(txn.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{txn.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {txn.customer || 'Platform'} · {txn.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-mono ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono">
                          {txn.fee > 0 ? formatCurrency(txn.fee) : '-'}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                          {formatCurrency(txn.net)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payouts</h2>
              <button
                onClick={() => setShowCreatePayout(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Create Payout
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Arrival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockPayouts.map(payout => (
                    <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payout.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{payout.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payout.method === 'instant'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {payout.method === 'instant' && <Zap className="w-3 h-3 inline mr-1" />}
                          {payout.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                        {payout.destination}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payout.arrivalDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="accounts" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connected Accounts</h2>
              <button
                onClick={() => setShowInviteAccount(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Invite Account
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockConnectedAccounts.map(account => (
                <div
                  key={account.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-emerald-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAccount(account)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        {account.type === 'company' ? (
                          <Building className="w-6 h-6 text-white" />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{account.businessName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{account.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Available Balance</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(account.balance.available)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(account.balance.pending)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {account.payoutsEnabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">Payouts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.chargesEnabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-gray-600 dark:text-gray-400">Charges</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{account.country}</span>
                    </div>
                  </div>

                  {account.requirements.currentlyDue.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {account.requirements.currentlyDue.length} requirement(s) needed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Disputes</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Dispute</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Due By</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockDisputes.map(dispute => (
                    <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{dispute.id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{dispute.customer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-red-600">
                        {formatCurrency(dispute.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {dispute.reason.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(dispute.dueBy).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            dispute.status === 'needs_response'
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {dispute.status === 'needs_response' ? 'Respond' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className={`p-3 rounded-lg ${getTransactionColor(selectedTransaction.type)}`}>
                    {(() => {
                      const Icon = getTransactionIcon(selectedTransaction.type)
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTransaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.net)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedTransaction.platformFee)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedTransaction.customer && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="text-gray-900 dark:text-white">{selectedTransaction.customer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Payout Dialog */}
        <Dialog open={showCreatePayout} onOpenChange={setShowCreatePayout}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connected Account</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {mockConnectedAccounts.filter(a => a.payoutsEnabled).map(account => (
                    <option key={account.id} value={account.id}>{account.businessName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500">
                    <p className="font-medium text-gray-900 dark:text-white">Standard</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2-3 business days</p>
                  </button>
                  <button className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500">
                    <div className="flex items-center gap-1 justify-center">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <p className="font-medium text-gray-900 dark:text-white">Instant</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1.5% fee, within minutes</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreatePayout(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Create Payout
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invite Account Dialog */}
        <Dialog open={showInviteAccount} onOpenChange={setShowInviteAccount}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Connected Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contractor@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 text-left">
                    <Users className="w-5 h-5 text-emerald-600 mb-1" />
                    <p className="font-medium text-gray-900 dark:text-white">Individual</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Freelancers, contractors</p>
                  </button>
                  <button className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 text-left">
                    <Building className="w-5 h-5 text-emerald-600 mb-1" />
                    <p className="font-medium text-gray-900 dark:text-white">Company</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Businesses, agencies</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowInviteAccount(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Invite
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
