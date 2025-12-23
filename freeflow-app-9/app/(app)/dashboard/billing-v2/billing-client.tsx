'use client'
import { useState, useMemo } from 'react'
import {
  CreditCard, Receipt, DollarSign, Users, ArrowUpRight, ArrowDownRight, Plus,
  ChevronRight, ChevronDown, Calendar, BarChart3, Settings, RefreshCw, Download,
  CheckCircle, AlertCircle, AlertTriangle, Clock, Trash2, Edit, Eye, EyeOff,
  Zap, Package, TrendingUp, TrendingDown, ExternalLink, Copy, MoreHorizontal,
  Building, User, Mail, Phone, Globe, Shield, Lock, CreditCard as CardIcon
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBilling, type BillingTransaction, type BillingStatus } from '@/lib/hooks/use-billing'

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  plan: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused'
  amount: number
  interval: 'month' | 'year'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  paymentMethod?: PaymentMethod
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'sepa_debit'
  brand?: string
  last4: string
  expMonth?: number
  expYear?: number
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  amount: number
  amountPaid: number
  amountRemaining: number
  dueDate: string
  createdAt: string
  paidAt?: string
  lineItems: { description: string; quantity: number; unitPrice: number }[]
}

interface UsageRecord {
  id: string
  subscriptionId: string
  customerId: string
  customerName: string
  quantity: number
  timestamp: string
  unitPrice: number
  total: number
}

export default function BillingClient({ initialBilling }: { initialBilling: BillingTransaction[] }) {
  const [activeView, setActiveView] = useState<'overview' | 'subscriptions' | 'invoices' | 'payments' | 'usage'>('overview')
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  const [showNewSubscriptionModal, setShowNewSubscriptionModal] = useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)

  const { transactions, loading, error } = useBilling({ status: statusFilter })
  const display = transactions.length > 0 ? transactions : initialBilling

  // Mock subscriptions data
  const [subscriptions] = useState<Subscription[]>([
    { id: '1', customerId: 'cus_1', customerName: 'Acme Corp', customerEmail: 'billing@acme.com', plan: 'Pro Monthly', status: 'active', amount: 99, interval: 'month', currentPeriodStart: '2024-12-01', currentPeriodEnd: '2025-01-01', cancelAtPeriodEnd: false, paymentMethod: { id: 'pm_1', type: 'card', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true } },
    { id: '2', customerId: 'cus_2', customerName: 'TechStart Inc', customerEmail: 'finance@techstart.io', plan: 'Enterprise Annual', status: 'active', amount: 999, interval: 'year', currentPeriodStart: '2024-01-15', currentPeriodEnd: '2025-01-15', cancelAtPeriodEnd: false, paymentMethod: { id: 'pm_2', type: 'card', brand: 'mastercard', last4: '5555', expMonth: 3, expYear: 2026, isDefault: true } },
    { id: '3', customerId: 'cus_3', customerName: 'Startup Labs', customerEmail: 'billing@startuplabs.co', plan: 'Pro Monthly', status: 'past_due', amount: 99, interval: 'month', currentPeriodStart: '2024-11-15', currentPeriodEnd: '2024-12-15', cancelAtPeriodEnd: false, paymentMethod: { id: 'pm_3', type: 'card', brand: 'visa', last4: '1234', expMonth: 1, expYear: 2024, isDefault: true } },
    { id: '4', customerId: 'cus_4', customerName: 'Creative Agency', customerEmail: 'accounts@creative.agency', plan: 'Team Monthly', status: 'trialing', amount: 49, interval: 'month', currentPeriodStart: '2024-12-10', currentPeriodEnd: '2025-01-10', cancelAtPeriodEnd: false },
    { id: '5', customerId: 'cus_5', customerName: 'Global Industries', customerEmail: 'ap@global-ind.com', plan: 'Enterprise Annual', status: 'canceled', amount: 999, interval: 'year', currentPeriodStart: '2024-06-01', currentPeriodEnd: '2024-12-01', cancelAtPeriodEnd: true },
  ])

  // Mock invoices data
  const [invoices] = useState<Invoice[]>([
    { id: 'inv_1', number: 'INV-2024-001', customerId: 'cus_1', customerName: 'Acme Corp', status: 'paid', amount: 99, amountPaid: 99, amountRemaining: 0, dueDate: '2024-12-15', createdAt: '2024-12-01', paidAt: '2024-12-03', lineItems: [{ description: 'Pro Monthly Plan', quantity: 1, unitPrice: 99 }] },
    { id: 'inv_2', number: 'INV-2024-002', customerId: 'cus_2', customerName: 'TechStart Inc', status: 'paid', amount: 999, amountPaid: 999, amountRemaining: 0, dueDate: '2024-12-20', createdAt: '2024-12-05', paidAt: '2024-12-05', lineItems: [{ description: 'Enterprise Annual Plan', quantity: 1, unitPrice: 999 }] },
    { id: 'inv_3', number: 'INV-2024-003', customerId: 'cus_3', customerName: 'Startup Labs', status: 'open', amount: 99, amountPaid: 0, amountRemaining: 99, dueDate: '2024-12-25', createdAt: '2024-12-10', lineItems: [{ description: 'Pro Monthly Plan', quantity: 1, unitPrice: 99 }] },
    { id: 'inv_4', number: 'INV-2024-004', customerId: 'cus_4', customerName: 'Creative Agency', status: 'draft', amount: 49, amountPaid: 0, amountRemaining: 49, dueDate: '2025-01-10', createdAt: '2024-12-20', lineItems: [{ description: 'Team Monthly Plan', quantity: 1, unitPrice: 49 }] },
  ])

  // Mock usage records
  const [usageRecords] = useState<UsageRecord[]>([
    { id: 'use_1', subscriptionId: 'sub_1', customerId: 'cus_1', customerName: 'Acme Corp', quantity: 15000, timestamp: '2024-12-23', unitPrice: 0.001, total: 15 },
    { id: 'use_2', subscriptionId: 'sub_1', customerId: 'cus_1', customerName: 'Acme Corp', quantity: 12000, timestamp: '2024-12-22', unitPrice: 0.001, total: 12 },
    { id: 'use_3', subscriptionId: 'sub_2', customerId: 'cus_2', customerName: 'TechStart Inc', quantity: 45000, timestamp: '2024-12-23', unitPrice: 0.001, total: 45 },
    { id: 'use_4', subscriptionId: 'sub_2', customerId: 'cus_2', customerName: 'TechStart Inc', quantity: 38000, timestamp: '2024-12-22', unitPrice: 0.001, total: 38 },
  ])

  const stats = useMemo(() => {
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.interval === 'month' ? s.amount : s.amount / 12), 0)
    const arr = mrr * 12
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
    const pastDue = subscriptions.filter(s => s.status === 'past_due').length
    const openInvoices = invoices.filter(i => i.status === 'open').length
    const openAmount = invoices.filter(i => i.status === 'open').reduce((sum, i) => sum + i.amountRemaining, 0)
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amountPaid, 0)
    const totalUsage = usageRecords.reduce((sum, u) => sum + u.total, 0)

    return { mrr, arr, activeSubscriptions, pastDue, openInvoices, openAmount, totalRevenue, totalUsage }
  }, [subscriptions, invoices, usageRecords])

  const views = [
    { id: 'overview' as const, name: 'Overview', icon: BarChart3 },
    { id: 'subscriptions' as const, name: 'Subscriptions', icon: RefreshCw },
    { id: 'invoices' as const, name: 'Invoices', icon: Receipt },
    { id: 'payments' as const, name: 'Payments', icon: CreditCard },
    { id: 'usage' as const, name: 'Usage', icon: Zap },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'succeeded': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'past_due':
      case 'open':
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'canceled':
      case 'void':
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'trialing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                Stripe Level
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage subscriptions, invoices, and payments</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showNewSubscriptionModal} onOpenChange={setShowNewSubscriptionModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                  <Plus className="w-4 h-4" />
                  New Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Subscription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Email</label>
                    <Input type="email" placeholder="customer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plan</label>
                    <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="team">Team ($49/mo)</option>
                      <option value="pro">Pro ($99/mo)</option>
                      <option value="enterprise">Enterprise ($999/yr)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trial Period</label>
                    <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="0">No trial</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewSubscriptionModal(false)}>Cancel</Button>
                  <Button>Create Subscription</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm col-span-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              MRR
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.mrr)}</div>
            <div className="text-xs text-green-600 mt-1">+12% from last month</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm col-span-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4 text-blue-500" />
              ARR
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.arr)}</div>
            <div className="text-xs text-gray-500 mt-1">Annual recurring revenue</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Users className="w-4 h-4" />
              Active
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Past Due
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pastDue}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Receipt className="w-4 h-4" />
              Open
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.openInvoices}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Zap className="w-4 h-4 text-purple-500" />
              Usage
            </div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalUsage)}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-1 p-2">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview */}
          {activeView === 'overview' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="border rounded-xl dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Revenue Trend
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                      const revenue = [8500, 9200, 10100, 11500, 12800, stats.mrr * 1.1][idx]
                      const max = 15000
                      const height = (revenue / max) * 100
                      return (
                        <div key={month} className="text-center">
                          <div className="h-32 flex items-end justify-center mb-2">
                            <div
                              className={`w-full rounded-t-lg ${idx === 5 ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">{month}</div>
                          <div className="text-sm font-medium">${(revenue / 1000).toFixed(1)}k</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="border rounded-xl dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { type: 'payment', message: 'Acme Corp paid $99.00', time: '2 hours ago' },
                      { type: 'subscription', message: 'Creative Agency started trial', time: '5 hours ago' },
                      { type: 'invoice', message: 'Invoice #2024-003 sent', time: '1 day ago' },
                      { type: 'payment', message: 'TechStart Inc paid $999.00', time: '2 days ago' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                          activity.type === 'subscription' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                           activity.type === 'subscription' ? <RefreshCw className="w-4 h-4 text-blue-600" /> :
                           <Receipt className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plans Distribution */}
                <div className="border rounded-xl dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-500" />
                    Plan Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { plan: 'Enterprise', count: 2, revenue: 1998, color: 'indigo' },
                      { plan: 'Pro', count: 2, revenue: 198, color: 'blue' },
                      { plan: 'Team', count: 1, revenue: 49, color: 'green' },
                    ].map(p => (
                      <div key={p.plan} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{p.plan}</span>
                          <span className="text-gray-500">{p.count} customers • {formatCurrency(p.revenue)}/mo</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${p.color}-500 rounded-full`}
                            style={{ width: `${(p.count / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border rounded-xl dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Key Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Churn Rate</div>
                      <div className="text-xl font-bold text-green-600">2.1%</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">ARPU</div>
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(stats.mrr / stats.activeSubscriptions || 0)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">LTV</div>
                      <div className="text-xl font-bold text-purple-600">$2,847</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Collection Rate</div>
                      <div className="text-xl font-bold text-indigo-600">98.5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {activeView === 'subscriptions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="trialing">Trialing</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>

              <div className="space-y-3">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="p-4 border rounded-xl dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                          {sub.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{sub.customerName}</h3>
                            <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                            {sub.cancelAtPeriodEnd && (
                              <Badge variant="outline" className="text-red-600">Cancels at period end</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{sub.customerEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(sub.amount)}</div>
                          <div className="text-xs text-gray-500">per {sub.interval}</div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{sub.plan}</div>
                          <div>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {sub.paymentMethod && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700 flex items-center gap-2">
                        <CardIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 capitalize">
                          {sub.paymentMethod.brand} •••• {sub.paymentMethod.last4}
                        </span>
                        {sub.paymentMethod.expMonth && (
                          <span className="text-sm text-gray-500">
                            Exp {sub.paymentMethod.expMonth}/{sub.paymentMethod.expYear}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {activeView === 'invoices' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="paid">Paid</option>
                    <option value="void">Void</option>
                  </select>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-indigo-600">{inv.number}</div>
                          <div className="text-xs text-gray-500">Created {new Date(inv.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">{inv.customerName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(inv.status)}>{inv.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</div>
                          {inv.amountRemaining > 0 && inv.status !== 'draft' && (
                            <div className="text-xs text-red-600">{formatCurrency(inv.amountRemaining)} due</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            {inv.status === 'open' && (
                              <Button size="sm" variant="outline">
                                Send Reminder
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeView === 'payments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All Status</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {display.filter(t => statusFilter === 'all' || t.status === statusFilter).map(transaction => (
                    <div key={transaction.id} className="p-4 border rounded-xl dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.status === 'succeeded' ? 'bg-green-100 dark:bg-green-900/30' :
                            transaction.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            {transaction.status === 'succeeded' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                             transaction.status === 'failed' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                             <Clock className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">{transaction.transaction_type}</div>
                            <div className="text-sm text-gray-500">{transaction.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</div>
                            <div className="text-xs text-gray-500">{transaction.payment_method}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage */}
          {activeView === 'usage' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usage-Based Billing</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track metered usage for your customers</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 border rounded-xl dark:border-gray-700 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">Total Usage This Period</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {usageRecords.reduce((sum, u) => sum + u.quantity, 0).toLocaleString()} units
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                    {formatCurrency(stats.totalUsage)} billable
                  </div>
                </div>
                <div className="p-4 border rounded-xl dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Unit Price</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.001</div>
                  <div className="text-sm text-gray-500">per unit</div>
                </div>
              </div>

              <div className="space-y-3">
                {usageRecords.map(record => (
                  <div key={record.id} className="p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{record.customerName}</div>
                          <div className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{record.quantity.toLocaleString()} units</div>
                        <div className="text-sm text-purple-600">{formatCurrency(record.total)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
