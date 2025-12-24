"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Receipt,
  Percent,
  Tag,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Star,
  Crown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Gift,
  Copy,
  Search,
  Filter,
  Settings,
  RefreshCw,
  ChevronRight,
  Globe,
  Building,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  FileText,
  Download,
  Send,
  Eye,
  EyeOff,
  Layers,
  Package,
  Box,
  Award,
  Timer,
  Calculator,
  Wallet,
  Landmark,
  CreditCard as CardIcon
} from 'lucide-react'

// Types
type BillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'lifetime'
type PlanStatus = 'active' | 'inactive' | 'deprecated' | 'beta'
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
type DiscountType = 'percentage' | 'fixed' | 'free_trial'
type PricingModel = 'flat' | 'tiered' | 'usage' | 'per_seat' | 'freemium'
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded'

interface PlanFeature {
  id: string
  name: string
  description?: string
  included: boolean
  limit?: number | 'unlimited'
}

interface PricingPlan {
  id: string
  name: string
  slug: string
  description: string
  model: PricingModel
  status: PlanStatus
  prices: {
    monthly: number
    quarterly?: number
    annual: number
    lifetime?: number
  }
  currency: string
  features: PlanFeature[]
  limits: {
    users?: number
    storage?: string
    apiCalls?: number
    projects?: number
  }
  isFeatured: boolean
  isPopular: boolean
  trialDays: number
  setupFee?: number
  subscriberCount: number
  revenue: number
  churnRate: number
  createdAt: string
  updatedAt: string
}

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: SubscriptionStatus
  billingPeriod: BillingPeriod
  currentPeriodStart: string
  currentPeriodEnd: string
  amount: number
  currency: string
  cancelAt?: string
  cancelReason?: string
  trialEnd?: string
  createdAt: string
}

interface Coupon {
  id: string
  code: string
  name: string
  type: DiscountType
  value: number
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  redemptionsCount: number
  isActive: boolean
  expiresAt?: string
  createdAt: string
}

interface Invoice {
  id: string
  customerId: string
  customerName: string
  subscriptionId: string
  status: InvoiceStatus
  amount: number
  currency: string
  periodStart: string
  periodEnd: string
  paidAt?: string
  dueDate: string
  invoiceNumber: string
}

// Mock Data
const mockPlans: PricingPlan[] = [
  {
    id: 'plan-1',
    name: 'Free',
    slug: 'free',
    description: 'Perfect for getting started',
    model: 'freemium',
    status: 'active',
    prices: { monthly: 0, annual: 0 },
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Up to 3 projects', included: true, limit: 3 },
      { id: 'f2', name: '1 GB storage', included: true },
      { id: 'f3', name: 'Basic support', included: true },
      { id: 'f4', name: 'API access', included: false },
      { id: 'f5', name: 'Custom domains', included: false }
    ],
    limits: { users: 1, storage: '1GB', apiCalls: 1000, projects: 3 },
    isFeatured: false,
    isPopular: false,
    trialDays: 0,
    subscriberCount: 15420,
    revenue: 0,
    churnRate: 45.2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'plan-2',
    name: 'Starter',
    slug: 'starter',
    description: 'Great for small teams',
    model: 'flat',
    status: 'active',
    prices: { monthly: 29, quarterly: 79, annual: 290, lifetime: 999 },
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Up to 10 projects', included: true, limit: 10 },
      { id: 'f2', name: '10 GB storage', included: true },
      { id: 'f3', name: 'Priority support', included: true },
      { id: 'f4', name: 'API access', included: true, limit: 10000 },
      { id: 'f5', name: 'Custom domains', included: true, limit: 1 }
    ],
    limits: { users: 5, storage: '10GB', apiCalls: 10000, projects: 10 },
    isFeatured: false,
    isPopular: true,
    trialDays: 14,
    subscriberCount: 4520,
    revenue: 131080,
    churnRate: 8.5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'plan-3',
    name: 'Professional',
    slug: 'professional',
    description: 'For growing businesses',
    model: 'tiered',
    status: 'active',
    prices: { monthly: 79, quarterly: 219, annual: 790 },
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Unlimited projects', included: true, limit: 'unlimited' },
      { id: 'f2', name: '100 GB storage', included: true },
      { id: 'f3', name: '24/7 support', included: true },
      { id: 'f4', name: 'API access', included: true, limit: 'unlimited' },
      { id: 'f5', name: 'Custom domains', included: true, limit: 5 },
      { id: 'f6', name: 'Advanced analytics', included: true },
      { id: 'f7', name: 'Team collaboration', included: true }
    ],
    limits: { users: 25, storage: '100GB', apiCalls: 100000, projects: -1 },
    isFeatured: true,
    isPopular: false,
    trialDays: 14,
    subscriberCount: 2340,
    revenue: 184860,
    churnRate: 4.2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'plan-4',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    model: 'per_seat',
    status: 'active',
    prices: { monthly: 199, annual: 1990 },
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Everything in Pro', included: true },
      { id: 'f2', name: 'Unlimited storage', included: true },
      { id: 'f3', name: 'Dedicated support', included: true },
      { id: 'f4', name: 'Custom integrations', included: true },
      { id: 'f5', name: 'SLA guarantee', included: true },
      { id: 'f6', name: 'SSO/SAML', included: true },
      { id: 'f7', name: 'Audit logs', included: true },
      { id: 'f8', name: 'Custom contracts', included: true }
    ],
    limits: { users: -1, storage: 'Unlimited', projects: -1 },
    isFeatured: false,
    isPopular: false,
    trialDays: 30,
    setupFee: 500,
    subscriberCount: 156,
    revenue: 310440,
    churnRate: 2.1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  }
]

const mockSubscriptions: Subscription[] = [
  { id: 'sub-1', customerId: 'cust-1', customerName: 'Acme Corp', customerEmail: 'billing@acme.com', planId: 'plan-4', planName: 'Enterprise', status: 'active', billingPeriod: 'annual', currentPeriodStart: '2025-01-01T00:00:00Z', currentPeriodEnd: '2026-01-01T00:00:00Z', amount: 1990, currency: 'USD', createdAt: '2024-03-15T00:00:00Z' },
  { id: 'sub-2', customerId: 'cust-2', customerName: 'TechStart Inc', customerEmail: 'finance@techstart.io', planId: 'plan-3', planName: 'Professional', status: 'active', billingPeriod: 'monthly', currentPeriodStart: '2025-01-15T00:00:00Z', currentPeriodEnd: '2025-02-15T00:00:00Z', amount: 79, currency: 'USD', createdAt: '2024-06-20T00:00:00Z' },
  { id: 'sub-3', customerId: 'cust-3', customerName: 'Design Studio', customerEmail: 'accounts@designstudio.co', planId: 'plan-2', planName: 'Starter', status: 'trialing', billingPeriod: 'monthly', currentPeriodStart: '2025-01-10T00:00:00Z', currentPeriodEnd: '2025-01-24T00:00:00Z', amount: 29, currency: 'USD', trialEnd: '2025-01-24T00:00:00Z', createdAt: '2025-01-10T00:00:00Z' },
  { id: 'sub-4', customerId: 'cust-4', customerName: 'Freelancer Pro', customerEmail: 'john@freelancer.com', planId: 'plan-2', planName: 'Starter', status: 'past_due', billingPeriod: 'monthly', currentPeriodStart: '2024-12-15T00:00:00Z', currentPeriodEnd: '2025-01-15T00:00:00Z', amount: 29, currency: 'USD', createdAt: '2024-08-01T00:00:00Z' },
  { id: 'sub-5', customerId: 'cust-5', customerName: 'Growth Labs', customerEmail: 'billing@growthlabs.io', planId: 'plan-3', planName: 'Professional', status: 'canceled', billingPeriod: 'annual', currentPeriodStart: '2024-06-01T00:00:00Z', currentPeriodEnd: '2025-06-01T00:00:00Z', amount: 790, currency: 'USD', cancelAt: '2025-06-01T00:00:00Z', cancelReason: 'Switching to competitor', createdAt: '2024-06-01T00:00:00Z' }
]

const mockCoupons: Coupon[] = [
  { id: 'coup-1', code: 'WELCOME50', name: '50% Off First Month', type: 'percentage', value: 50, duration: 'once', maxRedemptions: 1000, redemptionsCount: 456, isActive: true, createdAt: '2024-06-01T00:00:00Z' },
  { id: 'coup-2', code: 'ANNUAL20', name: '20% Off Annual Plans', type: 'percentage', value: 20, duration: 'forever', redemptionsCount: 234, isActive: true, createdAt: '2024-08-15T00:00:00Z' },
  { id: 'coup-3', code: 'TRIAL30', name: '30-Day Free Trial', type: 'free_trial', value: 30, duration: 'once', redemptionsCount: 890, isActive: true, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'coup-4', code: 'PARTNER15', name: 'Partner Discount', type: 'percentage', value: 15, duration: 'repeating', durationInMonths: 12, redemptionsCount: 123, isActive: true, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'coup-5', code: 'HOLIDAY2024', name: 'Holiday Sale', type: 'fixed', value: 50, duration: 'once', maxRedemptions: 500, redemptionsCount: 500, isActive: false, expiresAt: '2024-12-31T00:00:00Z', createdAt: '2024-12-01T00:00:00Z' }
]

const mockInvoices: Invoice[] = [
  { id: 'inv-1', customerId: 'cust-1', customerName: 'Acme Corp', subscriptionId: 'sub-1', status: 'paid', amount: 1990, currency: 'USD', periodStart: '2025-01-01T00:00:00Z', periodEnd: '2026-01-01T00:00:00Z', paidAt: '2025-01-01T00:00:00Z', dueDate: '2025-01-15T00:00:00Z', invoiceNumber: 'INV-2025-0001' },
  { id: 'inv-2', customerId: 'cust-2', customerName: 'TechStart Inc', subscriptionId: 'sub-2', status: 'paid', amount: 79, currency: 'USD', periodStart: '2025-01-15T00:00:00Z', periodEnd: '2025-02-15T00:00:00Z', paidAt: '2025-01-15T00:00:00Z', dueDate: '2025-01-22T00:00:00Z', invoiceNumber: 'INV-2025-0002' },
  { id: 'inv-3', customerId: 'cust-4', customerName: 'Freelancer Pro', subscriptionId: 'sub-4', status: 'overdue', amount: 29, currency: 'USD', periodStart: '2024-12-15T00:00:00Z', periodEnd: '2025-01-15T00:00:00Z', dueDate: '2024-12-22T00:00:00Z', invoiceNumber: 'INV-2024-0456' },
  { id: 'inv-4', customerId: 'cust-5', customerName: 'Growth Labs', subscriptionId: 'sub-5', status: 'paid', amount: 790, currency: 'USD', periodStart: '2024-06-01T00:00:00Z', periodEnd: '2025-06-01T00:00:00Z', paidAt: '2024-06-01T00:00:00Z', dueDate: '2024-06-15T00:00:00Z', invoiceNumber: 'INV-2024-0234' }
]

// Helper Functions
const getPlanStatusColor = (status: PlanStatus): string => {
  const colors: Record<PlanStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    deprecated: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return colors[status]
}

const getSubscriptionStatusColor = (status: SubscriptionStatus): string => {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    canceled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    past_due: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
  return colors[status]
}

const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  const colors: Record<InvoiceStatus, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[status]
}

const getPlanGradient = (index: number): string => {
  const gradients = [
    'from-gray-500 to-slate-600',
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600'
  ]
  return gradients[index % gradients.length]
}

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface PricingClientProps {
  initialPlans?: PricingPlan[]
}

export default function PricingClient({
  initialPlans = mockPlans
}: PricingClientProps) {
  const [activeTab, setActiveTab] = useState('plans')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const stats = useMemo(() => {
    const totalRevenue = initialPlans.reduce((sum, p) => sum + p.revenue, 0)
    const totalSubscribers = initialPlans.reduce((sum, p) => sum + p.subscriberCount, 0)
    const paidSubscribers = initialPlans.filter(p => p.prices.monthly > 0).reduce((sum, p) => sum + p.subscriberCount, 0)
    const arpu = paidSubscribers > 0 ? totalRevenue / paidSubscribers : 0
    const avgChurn = initialPlans.reduce((sum, p) => sum + p.churnRate, 0) / initialPlans.length
    const activePlans = initialPlans.filter(p => p.status === 'active').length
    const mrr = initialPlans.reduce((sum, p) => sum + (p.subscriberCount * p.prices.monthly), 0)
    const arr = mrr * 12

    return {
      totalRevenue,
      totalSubscribers,
      paidSubscribers,
      arpu,
      avgChurn,
      activePlans,
      mrr,
      arr
    }
  }, [initialPlans])

  const filteredSubscriptions = useMemo(() => {
    return mockSubscriptions.filter(sub =>
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const statCards = [
    { label: 'MRR', value: formatCurrency(stats.mrr), change: 18.5, icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { label: 'ARR', value: formatCurrency(stats.arr), change: 22.3, icon: BarChart3, color: 'from-blue-500 to-cyan-600' },
    { label: 'ARPU', value: formatCurrency(stats.arpu), change: 8.7, icon: DollarSign, color: 'from-purple-500 to-pink-600' },
    { label: 'Subscribers', value: stats.totalSubscribers.toLocaleString(), change: 15.4, icon: Users, color: 'from-amber-500 to-orange-600' },
    { label: 'Paid Users', value: stats.paidSubscribers.toLocaleString(), change: 12.1, icon: CreditCard, color: 'from-indigo-500 to-violet-600' },
    { label: 'Active Plans', value: stats.activePlans.toString(), change: 0, icon: Package, color: 'from-teal-500 to-cyan-600' },
    { label: 'Avg Churn', value: `${stats.avgChurn.toFixed(1)}%`, change: -5.2, icon: ArrowDownRight, color: 'from-red-500 to-rose-600' },
    { label: 'Coupons Active', value: mockCoupons.filter(c => c.isActive).length.toString(), change: 25, icon: Tag, color: 'from-pink-500 to-rose-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Billing</h1>
              <p className="text-gray-600 dark:text-gray-400">Stripe-level subscription management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="plans" className="gap-2">
              <Package className="w-4 h-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Users className="w-4 h-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['monthly', 'annual'] as BillingPeriod[]).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                    {period === 'annual' && <Badge className="ml-2 bg-green-500 text-white text-xs">Save 20%</Badge>}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {initialPlans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer relative ${plan.isFeatured ? 'ring-2 ring-violet-500' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanGradient(index)} flex items-center justify-center mb-4`}>
                      <Package className="w-6 h-6 text-white" />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <Badge className={getPlanStatusColor(plan.status)}>{plan.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-violet-600">
                          {formatCurrency(selectedPeriod === 'monthly' ? plan.prices.monthly : plan.prices.annual)}
                        </span>
                        <span className="text-gray-500">/{selectedPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {plan.trialDays > 0 && (
                        <p className="text-sm text-green-600 mt-1">{plan.trialDays}-day free trial</p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.features.slice(0, 5).map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span className={feature.included ? '' : 'text-gray-400'}>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <p className="font-semibold">{plan.subscriberCount.toLocaleString()}</p>
                        <p className="text-gray-500">Subscribers</p>
                      </div>
                      <div>
                        <p className="font-semibold">{formatCurrency(plan.revenue)}</p>
                        <p className="text-gray-500">Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-4"
                      onClick={() => setSelectedSubscription(subscription)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{subscription.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{subscription.customerName}</p>
                          <Badge className={getSubscriptionStatusColor(subscription.status)}>{subscription.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{subscription.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(subscription.amount)}/{subscription.billingPeriod}</p>
                        <p className="text-sm text-gray-500">{subscription.planName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Discount Codes</h2>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCoupons.map((coupon) => (
                <Card key={coupon.id} className={`border-0 shadow-sm ${!coupon.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <code className="font-mono font-bold text-lg">{coupon.code}</code>
                          <p className="text-sm text-gray-500">{coupon.name}</p>
                        </div>
                      </div>
                      <Badge className={coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-semibold">
                          {coupon.type === 'percentage' ? `${coupon.value}%` :
                           coupon.type === 'fixed' ? formatCurrency(coupon.value) :
                           `${coupon.value} days free`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="capitalize">{coupon.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Redemptions</span>
                        <span>
                          {coupon.redemptionsCount}
                          {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                        </span>
                      </div>
                    </div>

                    {coupon.maxRedemptions && (
                      <Progress
                        value={(coupon.redemptionsCount / coupon.maxRedemptions) * 100}
                        className="mt-3 h-1"
                      />
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <Badge className={getInvoiceStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{invoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                        <p className="text-sm text-gray-500">
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>MRR and ARR trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {initialPlans.map((plan, index) => {
                      const percentage = (plan.subscriberCount / stats.totalSubscribers) * 100
                      return (
                        <div key={plan.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{plan.name}</span>
                            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className={`h-2`} />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Churn Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {initialPlans.filter(p => p.prices.monthly > 0).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between">
                        <span className="text-sm">{plan.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${plan.churnRate < 5 ? 'text-green-600' : plan.churnRate < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {plan.churnRate}%
                          </span>
                          {plan.churnRate < 5 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : plan.churnRate < 10 ? (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Conversion Rate</span>
                      <span className="font-semibold">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Trial to Paid</span>
                      <span className="font-semibold">45.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Upgrade Rate</span>
                      <span className="font-semibold">18.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Avg LTV</span>
                      <span className="font-semibold">$1,245</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Default Currency</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>USD - US Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tax Behavior</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>Exclusive</option>
                        <option>Inclusive</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Invoice Settings</CardTitle>
                  <CardDescription>Configure invoice generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Invoice Prefix</label>
                    <Input defaultValue="INV-" className="mt-1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-finalize Invoices</p>
                      <p className="text-sm text-gray-500">Automatically finalize and send invoices</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Include Tax Details</p>
                      <p className="text-sm text-gray-500">Show tax breakdown on invoices</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Dunning Settings</CardTitle>
                  <CardDescription>Configure failed payment handling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Smart Retries</p>
                      <p className="text-sm text-gray-500">Automatically retry failed payments</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Retry Attempts</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                      <option>3 attempts</option>
                      <option>5 attempts</option>
                      <option>7 attempts</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Send Reminder Emails</p>
                      <p className="text-sm text-gray-500">Email customers about failed payments</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Trial Settings</CardTitle>
                  <CardDescription>Configure trial period behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Trial Days</label>
                    <Input type="number" defaultValue="14" className="mt-1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Payment Method</p>
                      <p className="text-sm text-gray-500">Collect payment info during trial signup</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trial End Reminder</p>
                      <p className="text-sm text-gray-500">Email 3 days before trial ends</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Plan Detail Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedPlan?.name}
                {selectedPlan && (
                  <Badge className={getPlanStatusColor(selectedPlan.status)}>{selectedPlan.status}</Badge>
                )}
                {selectedPlan?.isFeatured && (
                  <Badge className="bg-violet-100 text-violet-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedPlan?.description}</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-3xl font-bold text-violet-600">{formatCurrency(selectedPlan.prices.monthly)}</p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedPlan.prices.annual)}</p>
                    <p className="text-sm text-gray-500">per year</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-3xl font-bold">{selectedPlan.subscriberCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">subscribers</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlan.features.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        {feature.included ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={feature.included ? '' : 'text-gray-400'}>{feature.name}</span>
                        {feature.limit && feature.limit !== 'unlimited' && (
                          <Badge variant="outline" className="text-xs ml-auto">{feature.limit}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-semibold">{formatCurrency(selectedPlan.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Churn Rate</p>
                    <p className="text-xl font-semibold">{selectedPlan.churnRate}%</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Plan
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Subscription Detail Dialog */}
        <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedSubscription?.customerName}
                {selectedSubscription && (
                  <Badge className={getSubscriptionStatusColor(selectedSubscription.status)}>
                    {selectedSubscription.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedSubscription?.customerEmail}</DialogDescription>
            </DialogHeader>
            {selectedSubscription && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-semibold">{selectedSubscription.planName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Billing</p>
                    <p className="font-semibold capitalize">{selectedSubscription.billingPeriod}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold">{formatCurrency(selectedSubscription.amount)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Current Period</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedSubscription.currentPeriodStart).toLocaleDateString()} - {new Date(selectedSubscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedSubscription.cancelAt && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 font-medium">Cancels on {new Date(selectedSubscription.cancelAt).toLocaleDateString()}</p>
                    {selectedSubscription.cancelReason && (
                      <p className="text-sm text-red-500 mt-1">Reason: {selectedSubscription.cancelReason}</p>
                    )}
                  </div>
                )}

                {selectedSubscription.trialEnd && new Date(selectedSubscription.trialEnd) > new Date() && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 font-medium">Trial ends on {new Date(selectedSubscription.trialEnd).toLocaleDateString()}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button variant="outline">
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                  {selectedSubscription.status === 'active' && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
