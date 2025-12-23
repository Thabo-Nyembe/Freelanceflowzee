'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Receipt,
  Wallet,
  Building2,
  Globe,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  ArrowLeftRight,
  Banknote,
  Plus,
  Send
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTransactions, type Transaction } from '@/lib/hooks/use-transactions'

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

// Mock Data
const mockPayments: Payment[] = [
  {
    id: 'pi_3PxYz1234567890',
    amount: 15000,
    currency: 'USD',
    status: 'succeeded',
    description: 'Professional Plan - Annual',
    customer: { name: 'John Smith', email: 'john@company.com', id: 'cus_abc123' },
    paymentMethod: { type: 'card', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025 },
    metadata: { plan: 'professional', interval: 'annual' },
    created: '2024-12-23T10:30:00Z',
    fees: 465,
    net: 14535,
    riskScore: 12,
    refunded: false
  },
  {
    id: 'pi_3PxYz0987654321',
    amount: 29900,
    currency: 'USD',
    status: 'succeeded',
    description: 'Enterprise Plan - Annual',
    customer: { name: 'Sarah Johnson', email: 'sarah@enterprise.co', id: 'cus_def456' },
    paymentMethod: { type: 'card', brand: 'mastercard', last4: '5555', expMonth: 8, expYear: 2026 },
    metadata: { plan: 'enterprise', interval: 'annual' },
    created: '2024-12-23T09:15:00Z',
    fees: 897,
    net: 29003,
    riskScore: 8,
    refunded: false
  },
  {
    id: 'pi_3PxYz1122334455',
    amount: 4900,
    currency: 'USD',
    status: 'pending',
    description: 'Starter Plan - Monthly',
    customer: { name: 'Mike Chen', email: 'mike@startup.io', id: 'cus_ghi789' },
    paymentMethod: { type: 'bank_transfer', last4: '6789' },
    metadata: { plan: 'starter', interval: 'monthly' },
    created: '2024-12-23T08:45:00Z',
    fees: 147,
    net: 4753,
    riskScore: 25,
    refunded: false
  },
  {
    id: 'pi_3PxYz5566778899',
    amount: 9900,
    currency: 'USD',
    status: 'requires_action',
    description: 'Professional Plan - Monthly',
    customer: { name: 'Emily Davis', email: 'emily@design.studio', id: 'cus_jkl012' },
    paymentMethod: { type: 'card', brand: 'amex', last4: '1234', expMonth: 3, expYear: 2025 },
    metadata: { plan: 'professional', interval: 'monthly' },
    created: '2024-12-22T16:30:00Z',
    fees: 297,
    net: 9603,
    riskScore: 45,
    refunded: false
  },
  {
    id: 'pi_3PxYz9988776655',
    amount: 15000,
    currency: 'USD',
    status: 'succeeded',
    description: 'Professional Plan - Annual',
    customer: { name: 'Alex Thompson', email: 'alex@agency.com', id: 'cus_mno345' },
    paymentMethod: { type: 'card', brand: 'visa', last4: '0000', expMonth: 6, expYear: 2027 },
    metadata: { plan: 'professional', interval: 'annual' },
    created: '2024-12-22T14:00:00Z',
    fees: 465,
    net: 14535,
    riskScore: 5,
    refunded: true,
    refundedAmount: 15000
  },
  {
    id: 'pi_3PxYz4433221100',
    amount: 4900,
    currency: 'USD',
    status: 'failed',
    description: 'Starter Plan - Monthly',
    customer: { name: 'Chris Wilson', email: 'chris@freelance.dev', id: 'cus_pqr678' },
    paymentMethod: { type: 'card', brand: 'visa', last4: '9999', expMonth: 1, expYear: 2025 },
    metadata: { plan: 'starter', interval: 'monthly' },
    created: '2024-12-22T11:20:00Z',
    fees: 0,
    net: 0,
    riskScore: 78,
    refunded: false
  },
]

const mockRefunds: Refund[] = [
  { id: 're_1234567890', paymentId: 'pi_3PxYz9988776655', amount: 15000, currency: 'USD', status: 'succeeded', reason: 'requested_by_customer', created: '2024-12-22T15:00:00Z' },
  { id: 're_0987654321', paymentId: 'pi_3PxYz1111222233', amount: 4900, currency: 'USD', status: 'pending', reason: 'duplicate', created: '2024-12-21T10:00:00Z' },
]

const mockDisputes: Dispute[] = [
  { id: 'dp_1234567890', paymentId: 'pi_3PxYz8877665544', amount: 29900, currency: 'USD', status: 'needs_response', reason: 'fraudulent', dueBy: '2024-12-30T23:59:59Z', created: '2024-12-20T09:00:00Z' },
  { id: 'dp_0987654321', paymentId: 'pi_3PxYz7766554433', amount: 9900, currency: 'USD', status: 'under_review', reason: 'product_not_received', dueBy: '2024-12-28T23:59:59Z', created: '2024-12-18T14:30:00Z' },
  { id: 'dp_1122334455', paymentId: 'pi_3PxYz6655443322', amount: 4900, currency: 'USD', status: 'won', reason: 'duplicate', dueBy: '2024-12-15T23:59:59Z', created: '2024-12-10T11:00:00Z' },
]

const mockPayouts: Payout[] = [
  { id: 'po_1234567890', amount: 125000, currency: 'USD', status: 'paid', arrivalDate: '2024-12-23', created: '2024-12-21T00:00:00Z', destination: { bank: 'Chase Bank', last4: '4521' }, automatic: true },
  { id: 'po_0987654321', amount: 89500, currency: 'USD', status: 'in_transit', arrivalDate: '2024-12-24', created: '2024-12-22T00:00:00Z', destination: { bank: 'Chase Bank', last4: '4521' }, automatic: true },
  { id: 'po_1122334455', amount: 156750, currency: 'USD', status: 'pending', arrivalDate: '2024-12-25', created: '2024-12-23T00:00:00Z', destination: { bank: 'Chase Bank', last4: '4521' }, automatic: true },
]

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
}

const cardBrandIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 Amex',
  discover: '💳 Discover',
}

export default function TransactionsClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('last-7-days')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)

  const { transactions } = useTransactions({})
  const displayTransactions = transactions.length > 0 ? transactions : initialTransactions

  // Calculate stats
  const totalVolume = mockPayments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0)
  const totalFees = mockPayments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.fees, 0)
  const successRate = (mockPayments.filter(p => p.status === 'succeeded').length / mockPayments.length * 100).toFixed(1)
  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending' || p.status === 'in_transit').reduce((sum, p) => sum + p.amount, 0)

  const filteredPayments = useMemo(() => {
    return mockPayments.filter(p => {
      const matchesSearch = searchQuery === '' ||
        p.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

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
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
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
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="refunds" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Refunds
            </TabsTrigger>
            <TabsTrigger value="disputes" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <Banknote className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                    {mockPayments.slice(0, 5).map((payment) => (
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
                    {mockPayouts.map((payout) => (
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
            {mockDisputes.filter(d => d.status === 'needs_response').length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      {mockDisputes.filter(d => d.status === 'needs_response').length} dispute(s) need your response
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
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
                  <p className="text-sm text-gray-500">{mockRefunds.length} total refunds</p>
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
                    {mockRefunds.map((refund) => (
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
                      {mockDisputes.filter(d => d.status === 'needs_response').length} Need Response
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
                    {mockDisputes.map((dispute) => (
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
                    {mockPayouts.map((payout) => (
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
        </Tabs>

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

                <div className="grid grid-cols-2 gap-4">
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
            <DialogFooter>
              <button onClick={() => setShowPaymentDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Close
              </button>
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
                    defaultValue={formatCurrency(selectedPayment.amount)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
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
              <button onClick={() => setShowRefundDialog(false)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Issue Refund
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
