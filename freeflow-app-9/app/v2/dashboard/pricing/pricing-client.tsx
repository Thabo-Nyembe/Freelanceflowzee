"use client"


import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { usePricingPlans } from '@/lib/hooks/use-pricing-plans'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  Tag,
  Plus,
  Edit,
  Trash2,
  Crown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowDownRight,
  BarChart3,
  Zap,
  Copy,
  Search,
  Filter,
  Settings,
  RefreshCw,
  ChevronRight,
  Shield,
  Download,
  Eye,
  EyeOff,
  Package,
  Calculator,
  Wallet,
  Bell,
  Webhook,
  Mail,
  AlertTriangle,
  Sliders
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

import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

// Types
type BillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'lifetime'
type PlanStatus = 'active' | 'inactive' | 'deprecated' | 'beta'
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
type DiscountType = 'percentage' | 'fixed' | 'free_trial'
type PricingModel = 'flat' | 'tiered' | 'usage' | 'per_seat' | 'freemium'
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded'

// Database Types
interface DbPricingPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  monthly_price: number
  annual_price: number
  currency: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  subscribers_count: number
  revenue_monthly: number
  revenue_annual: number
  churn_rate: number
  upgrade_rate: number
  features: any[]
  limits: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface DbCoupon {
  id: string
  user_id: string
  code: string
  name: string
  discount_type: 'percentage' | 'fixed' | 'free_trial'
  discount_value: number
  duration: 'once' | 'repeating' | 'forever'
  duration_months: number | null
  max_redemptions: number | null
  redemptions_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface PlanFormState {
  name: string
  description: string
  monthly_price: number
  annual_price: number
  is_featured: boolean
  features: { name: string; included: boolean }[]
}

interface CouponFormState {
  code: string
  name: string
  discount_type: 'percentage' | 'fixed' | 'free_trial'
  discount_value: number
  duration: 'once' | 'repeating' | 'forever'
  duration_months: number
  max_redemptions: number | null
}

const initialPlanForm: PlanFormState = {
  name: '',
  description: '',
  monthly_price: 0,
  annual_price: 0,
  is_featured: false,
  features: []
}

const initialCouponForm: CouponFormState = {
  code: '',
  name: '',
  discount_type: 'percentage',
  discount_value: 0,
  duration: 'once',
  duration_months: 1,
  max_redemptions: null
}

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

// Enhanced Competitive Upgrade Mock Data
const mockPricingAIInsights = [
  { id: '1', type: 'success' as const, title: 'Revenue Growth', description: 'Pro plan conversions up 28% after pricing optimization.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
  { id: '2', type: 'info' as const, title: 'Pricing Insight', description: 'Annual billing adoption at 67%. Consider incentive increase.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Strategy' },
  { id: '3', type: 'warning' as const, title: 'Competitor Alert', description: 'Main competitor reduced prices by 15%. Monitor impact.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Competition' },
]

const mockPricingCollaborators = [
  { id: '1', name: 'Revenue Ops', avatar: '/avatars/revops.jpg', status: 'online' as const, role: 'Ops' },
  { id: '2', name: 'Product Lead', avatar: '/avatars/product.jpg', status: 'online' as const, role: 'Product' },
  { id: '3', name: 'Finance', avatar: '/avatars/finance.jpg', status: 'busy' as const, role: 'Finance' },
]

const mockPricingPredictions = [
  { id: '1', title: 'MRR Forecast', prediction: '$125K MRR by end of quarter', confidence: 84, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Upgrade Rate', prediction: '12% free-to-paid conversion', confidence: 76, trend: 'up' as const, impact: 'medium' as const },
]

const mockPricingActivities = [
  { id: '1', user: 'Billing System', action: 'Processed upgrade to', target: 'Enterprise Plan', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Coupon Engine', action: 'Applied discount for', target: '15 annual signups', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Updated pricing for', target: 'EU region', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions will be defined inside component to access state setters

export default function PricingClient({
  initialPlans = mockPlans
}: PricingClientProps) {
  const insightsPanel = useInsightsPanel(false)

  // Core UI state
  const [activeTab, setActiveTab] = useState('plans')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Integrate usePricingPlans hook with initial empty data
  const initialStats = {
    total: 0,
    active: 0,
    featured: 0,
    totalSubscribers: 0,
    totalRevenueMonthly: 0,
    totalRevenueAnnual: 0,
    avgChurnRate: 0,
    avgUpgradeRate: 0,
    arpu: 0
  }
  const {
    plans: dbPlans,
    stats: dbStats,
    loading,
    error: plansError,
    createPlan,
    updatePlan,
    deletePlan,
    toggleActive,
    setFeatured,
    updateSubscribers
  } = usePricingPlans([], initialStats)

  // Supabase state for coupons (separate table)
  const [dbCoupons, setDbCoupons] = useState<DbCoupon[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false)
  const [showCreateCouponDialog, setShowCreateCouponDialog] = useState(false)
  const [planForm, setPlanForm] = useState<PlanFormState>(initialPlanForm)
  const [couponForm, setCouponForm] = useState<CouponFormState>(initialCouponForm)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)

  // New dialog states for button functionality
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showEditCouponDialog, setShowEditCouponDialog] = useState(false)
  const [showDeleteCouponConfirmDialog, setShowDeleteCouponConfirmDialog] = useState(false)
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState<Coupon | null>(null)
  const [showExportAllInvoicesDialog, setShowExportAllInvoicesDialog] = useState(false)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showDownloadInvoiceDialog, setShowDownloadInvoiceDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showUploadLogoDialog, setShowUploadLogoDialog] = useState(false)
  const [showConnectPayPalDialog, setShowConnectPayPalDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showExportInvoicesDialog, setShowExportInvoicesDialog] = useState(false)
  const [showExportSubscriptionsDialog, setShowExportSubscriptionsDialog] = useState(false)
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDisconnectStripeDialog, setShowDisconnectStripeDialog] = useState(false)
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false)
  const [showDuplicatePlanDialog, setShowDuplicatePlanDialog] = useState(false)
  const [showPlanAnalyticsDialog, setShowPlanAnalyticsDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [showViewSubInvoicesDialog, setShowViewSubInvoicesDialog] = useState(false)
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Map DB pricing plans to UI format
  const mappedPlans: PricingPlan[] = useMemo(() => {
    if (!dbPlans || dbPlans.length === 0) return []

    return dbPlans.map((dbPlan): PricingPlan => ({
      id: dbPlan.id,
      name: dbPlan.name,
      slug: dbPlan.name.toLowerCase().replace(/\s+/g, '-'),
      description: dbPlan.description || '',
      model: 'flat' as PricingModel, // Default model
      status: dbPlan.is_active ? 'active' : 'inactive',
      prices: {
        monthly: dbPlan.monthly_price,
        annual: dbPlan.annual_price
      },
      currency: dbPlan.currency,
      features: Array.isArray(dbPlan.features) ? dbPlan.features.map((f: any, idx: number) => ({
        id: f.id || `feature-${idx}`,
        name: f.name || '',
        description: f.description,
        included: f.included ?? true,
        limit: f.limit
      })) : [],
      limits: dbPlan.limits || {},
      isFeatured: dbPlan.is_featured,
      isPopular: false, // Could be derived from subscriber count
      trialDays: 0, // Not in DB schema
      subscriberCount: dbPlan.subscribers_count,
      revenue: dbPlan.revenue_monthly, // Use monthly revenue as default
      churnRate: dbPlan.churn_rate,
      createdAt: dbPlan.created_at,
      updatedAt: dbPlan.updated_at
    }))
  }, [dbPlans])

  // Fetch coupons from Supabase
  const fetchCoupons = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('booking_coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Table may not exist, use mock data
      } else {
        setDbCoupons(data || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Hook handles plan fetching automatically via real-time subscriptions
    fetchCoupons()
  }, [fetchCoupons])

  const stats = useMemo(() => {
    const totalRevenue = mappedPlans.reduce((sum, p) => sum + p.revenue, 0)
    const totalSubscribers = mappedPlans.reduce((sum, p) => sum + p.subscriberCount, 0)
    const paidSubscribers = mappedPlans.filter(p => p.prices.monthly > 0).reduce((sum, p) => sum + p.subscriberCount, 0)
    const arpu = paidSubscribers > 0 ? totalRevenue / paidSubscribers : 0
    const avgChurn = mappedPlans.length > 0 ? mappedPlans.reduce((sum, p) => sum + p.churnRate, 0) / mappedPlans.length : 0
    const activePlans = mappedPlans.filter(p => p.status === 'active').length
    const mrr = mappedPlans.reduce((sum, p) => sum + (p.subscriberCount * p.prices.monthly), 0)
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
  }, [mappedPlans])

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

  // Quick actions with dialog-based workflows
  const pricingQuickActions = useMemo(() => [
    { id: '1', label: 'New Plan', icon: 'plus', action: () => setShowCreatePlanDialog(true), variant: 'default' as const },
    { id: '2', label: 'Create Coupon', icon: 'tag', action: () => setShowCreateCouponDialog(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'chart', action: () => setShowAnalyticsDialog(true), variant: 'outline' as const },
  ], [])

  // CRUD: Create Plan (using hook mutation)
  const handleCreatePlan = async () => {
    if (!planForm.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await createPlan({
        name: planForm.name,
        description: planForm.description,
        monthly_price: planForm.monthly_price,
        annual_price: planForm.annual_price,
        is_featured: planForm.is_featured,
        features: planForm.features,
        is_active: true,
        sort_order: dbPlans.length,
      })

      if (!result) throw new Error('Failed to create plan')
      toast.success('Plan created successfully')
      setShowCreatePlanDialog(false)
      setPlanForm(initialPlanForm)
      // Hook handles automatic refetch via real-time subscriptions
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error('Failed to create plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Update Plan (using hook mutation)
  const handleUpdatePlan = async (planId: string) => {
    setIsSubmitting(true)
    try {
      const result = await updatePlan(planId, {
        name: planForm.name,
        description: planForm.description,
        monthly_price: planForm.monthly_price,
        annual_price: planForm.annual_price,
        is_featured: planForm.is_featured,
        features: planForm.features,
      })

      if (!result) throw new Error('Failed to update plan')
      toast.success('Plan updated successfully')
      setEditingPlanId(null)
      setPlanForm(initialPlanForm)
      // Hook handles automatic refetch via real-time subscriptions
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error('Failed to update plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Delete/Archive Plan (using hook mutation)
  const handleArchivePlan = async (planId: string, planName: string) => {
    try {
      const result = await updatePlan(planId, { is_active: false })
      if (!result) throw new Error('Failed to archive plan')
      toast.success(`"${planName}" archived successfully`)
      // Hook handles automatic refetch via real-time subscriptions
    } catch (error) {
      console.error('Error archiving plan:', error)
      toast.error('Failed to archive plan')
    }
  }

  // CRUD: Create Coupon
  const handleCreateCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.name.trim()) {
      toast.error('Coupon code and name are required')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create coupons')
        return
      }

      const { error } = await supabase.from('booking_coupons').insert({
        user_id: user.id,
        code: couponForm.code.toUpperCase(),
        name: couponForm.name,
        discount_type: couponForm.discount_type,
        discount_value: couponForm.discount_value,
        duration: couponForm.duration,
        duration_months: couponForm.duration === 'repeating' ? couponForm.duration_months : null,
        max_redemptions: couponForm.max_redemptions,
        is_active: true,
        redemptions_count: 0,
      })

      if (error) throw error
      toast.success('Coupon created successfully')
      setShowCreateCouponDialog(false)
      setCouponForm(initialCouponForm)
      fetchCoupons()
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast.error('Failed to create coupon')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Toggle Coupon Active Status
  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('booking_coupons')
        .update({ is_active: !isActive })
        .eq('id', couponId)

      if (error) throw error
      toast.success(`Coupon ${!isActive ? 'activated' : 'deactivated'}`)
      fetchCoupons()
    } catch (error) {
      console.error('Error toggling coupon:', error)
      toast.error('Failed to update coupon')
    }
  }

  // CRUD: Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('booking_coupons')
        .delete()
        .eq('id', couponId)

      if (error) throw error
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  // Export pricing data
  const handleExportPricing = async () => {
    try {
      const { data: plans } = await supabase.from('pricing_plans').select('*')
      const exportData = { plans: plans || dbPlans, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pricing-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Pricing data exported')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export data')
    }
  }

  // Copy coupon code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied')
  }

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
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              onClick={() => setShowCreatePlanDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
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
              {mappedPlans.map((plan, index) => (
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

                    <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-center text-sm">
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
              <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
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
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                onClick={() => setShowCreateCouponDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Database coupons */}
              {dbCoupons.map((coupon) => (
                <Card key={coupon.id} className={`border-0 shadow-sm ${!coupon.is_active ? 'opacity-60' : ''}`}>
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
                      <Badge className={coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-semibold">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                           coupon.discount_type === 'fixed' ? formatCurrency(coupon.discount_value) :
                           `${coupon.discount_value} days free`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="capitalize">{coupon.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Redemptions</span>
                        <span>
                          {coupon.redemptions_count}
                          {coupon.max_redemptions && ` / ${coupon.max_redemptions}`}
                        </span>
                      </div>
                    </div>

                    {coupon.max_redemptions && (
                      <Progress
                        value={(coupon.redemptions_count / coupon.max_redemptions) * 100}
                        className="mt-3 h-1"
                      />
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyCoupon(coupon.code)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}>
                        {coupon.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Mock coupons fallback */}
              {dbCoupons.length === 0 && mockCoupons.map((coupon) => (
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
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyCoupon(coupon.code)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedCouponForEdit(coupon)
                        setShowEditCouponDialog(true)
                      }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedCouponForEdit(coupon)
                        setShowDeleteCouponConfirmDialog(true)
                      }}>
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
              <Button variant="outline" onClick={() => setShowExportAllInvoicesDialog(true)}>
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
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedInvoice(invoice)
                          setShowViewInvoiceDialog(true)
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedInvoice(invoice)
                          setShowDownloadInvoiceDialog(true)
                        }}>
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
                    {mappedPlans.map((plan, index) => {
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
                    {mappedPlans.filter(p => p.prices.monthly > 0).map((plan) => (
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

          {/* Settings Tab - Stripe Level with 6 Sub-tabs Sidebar Navigation */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1 px-3 pb-4">
                      {[
                        { id: 'general', label: 'General', icon: Settings, desc: 'Basic preferences' },
                        { id: 'payments', label: 'Payments', icon: CreditCard, desc: 'Payment processing' },
                        { id: 'invoices', label: 'Invoices', icon: Receipt, desc: 'Invoice settings' },
                        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, desc: 'Subscription rules' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & emails' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, desc: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Your company billing details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Business Name</Label>
                            <Input defaultValue="Acme Corporation" className="mt-1" />
                          </div>
                          <div>
                            <Label>Tax ID / VAT Number</Label>
                            <Input defaultValue="US123456789" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Billing Email</Label>
                          <Input defaultValue="billing@acmecorp.com" className="mt-1" />
                        </div>
                        <div>
                          <Label>Billing Address</Label>
                          <Input defaultValue="123 Business Ave, Suite 100" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div>
                            <Label>City</Label>
                            <Input defaultValue="San Francisco" className="mt-1" />
                          </div>
                          <div>
                            <Label>State</Label>
                            <Input defaultValue="CA" className="mt-1" />
                          </div>
                          <div>
                            <Label>ZIP Code</Label>
                            <Input defaultValue="94102" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Regional Settings</CardTitle>
                        <CardDescription>Currency and localization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Currency</Label>
                            <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                              <option>USD - US Dollar</option>
                              <option>EUR - Euro</option>
                              <option>GBP - British Pound</option>
                              <option>CAD - Canadian Dollar</option>
                              <option>AUD - Australian Dollar</option>
                            </select>
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                              <option>UTC (GMT+0)</option>
                              <option>Eastern Time (GMT-5)</option>
                              <option>Pacific Time (GMT-8)</option>
                              <option>Central European Time (GMT+1)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Multi-currency Support</p>
                            <p className="text-sm text-gray-500">Accept payments in multiple currencies</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Branding</CardTitle>
                        <CardDescription>Customize billing appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Logo</Label>
                          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                            <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Upload your logo for invoices</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowUploadLogoDialog(true)}>Browse</Button>
                          </div>
                        </div>
                        <div>
                          <Label>Primary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-violet-600 border cursor-pointer"></div>
                            <Input defaultValue="#7c3aed" className="flex-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Payments Settings */}
                {settingsTab === 'payments' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Payment Providers</CardTitle>
                        <CardDescription>Connected payment processors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">Stripe</p>
                              <p className="text-sm text-gray-500">Primary payment processor</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Wallet className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-gray-500">Alternative payments</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowConnectPayPalDialog(true)}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Accepted payment types</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Credit & Debit Cards', desc: 'Visa, Mastercard, Amex', enabled: true },
                          { name: 'ACH Direct Debit', desc: 'US bank accounts', enabled: true },
                          { name: 'SEPA Direct Debit', desc: 'European bank transfers', enabled: false },
                          { name: 'Apple Pay', desc: 'Apple device payments', enabled: true },
                          { name: 'Google Pay', desc: 'Google Wallet payments', enabled: true },
                        ].map((method, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.desc}</p>
                            </div>
                            <Switch defaultChecked={method.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Tax Settings</CardTitle>
                        <CardDescription>Configure tax calculation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <Calculator className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Automatic Tax Calculation</p>
                              <p className="text-sm text-gray-500">Using Stripe Tax</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Tax Behavior</Label>
                            <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                              <option>Exclusive (add tax on top)</option>
                              <option>Inclusive (tax included)</option>
                            </select>
                          </div>
                          <div>
                            <Label>Default Tax Rate</Label>
                            <Input defaultValue="0%" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Invoices Settings */}
                {settingsTab === 'invoices' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Invoice Generation</CardTitle>
                        <CardDescription>Configure invoice creation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Invoice Prefix</Label>
                            <Input defaultValue="INV-" className="mt-1" />
                          </div>
                          <div>
                            <Label>Starting Number</Label>
                            <Input type="number" defaultValue="1001" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-finalize Invoices</p>
                            <p className="text-sm text-gray-500">Automatically finalize and send on creation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Tax Details</p>
                            <p className="text-sm text-gray-500">Show tax breakdown on invoices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Footer Text</Label>
                          <textarea className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 h-20" defaultValue="Thank you for your business!" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Invoice Delivery</CardTitle>
                        <CardDescription>How invoices are sent to customers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Email Invoices</p>
                              <p className="text-sm text-gray-500">Send PDF invoices via email</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Customer Portal Access</p>
                            <p className="text-sm text-gray-500">Allow customers to view invoices online</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Days Until Due</Label>
                          <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                            <option>Due on receipt</option>
                            <option>Net 7</option>
                            <option>Net 15</option>
                            <option>Net 30</option>
                            <option>Net 60</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Credit Notes</CardTitle>
                        <CardDescription>Refund and credit settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-apply Credits</p>
                            <p className="text-sm text-gray-500">Automatically apply credits to future invoices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Credit Note Prefix</Label>
                          <Input defaultValue="CN-" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Subscriptions Settings */}
                {settingsTab === 'subscriptions' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Trial Settings</CardTitle>
                        <CardDescription>Configure trial period behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Trial Days</Label>
                          <Input type="number" defaultValue="14" className="mt-1" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Payment Method</p>
                            <p className="text-sm text-gray-500">Collect payment info during trial signup</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Trial End Reminder</p>
                            <p className="text-sm text-gray-500">Email customers before trial ends</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Reminder Days Before End</Label>
                          <Input type="number" defaultValue="3" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Dunning Settings</CardTitle>
                        <CardDescription>Failed payment handling</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <RefreshCw className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Smart Retries</p>
                              <p className="text-sm text-gray-500">AI-powered retry scheduling</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Max Retry Attempts</Label>
                          <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                            <option>3 attempts</option>
                            <option>5 attempts</option>
                            <option>7 attempts</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Send Reminder Emails</p>
                            <p className="text-sm text-gray-500">Notify customers about failed payments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Days Before Cancellation</Label>
                          <Input type="number" defaultValue="14" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Cancellation Policy</CardTitle>
                        <CardDescription>Subscription cancellation rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Immediate Cancellation</p>
                            <p className="text-sm text-gray-500">Cancel subscriptions immediately</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Prorate Refunds</p>
                            <p className="text-sm text-gray-500">Refund unused portion of billing period</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Pause</p>
                            <p className="text-sm text-gray-500">Let customers pause subscriptions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Admin Notifications</CardTitle>
                        <CardDescription>Alerts for your team</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'New Subscription', desc: 'When a customer subscribes', enabled: true },
                          { label: 'Subscription Cancelled', desc: 'When a customer cancels', enabled: true },
                          { label: 'Payment Failed', desc: 'When a payment fails', enabled: true },
                          { label: 'Dispute Opened', desc: 'When a chargeback is filed', enabled: true },
                          { label: 'Invoice Paid', desc: 'When an invoice is paid', enabled: false },
                        ].map((notif, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={notif.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Customer Notifications</CardTitle>
                        <CardDescription>Emails sent to customers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Payment Receipt', desc: 'After successful payment', enabled: true },
                          { label: 'Invoice Created', desc: 'When new invoice is generated', enabled: true },
                          { label: 'Payment Reminder', desc: 'Before invoice due date', enabled: true },
                          { label: 'Subscription Renewal', desc: 'Before renewal date', enabled: true },
                          { label: 'Plan Changed', desc: 'When subscription plan changes', enabled: true },
                        ].map((notif, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={notif.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Webhook Notifications</CardTitle>
                        <CardDescription>Real-time event webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-violet-600">https://api.yourapp.com/webhooks/billing</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Events: invoice.*, subscription.*, customer.*</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Webhook className="w-4 h-4 mr-2" />
                          Add Webhook Endpoint
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Live API Key</p>
                              <p className="text-xs text-gray-500">Created Jan 15, 2025</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            ••••••••••••••••••••••••
                          </code>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">Never share your API key publicly</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Test Mode</CardTitle>
                        <CardDescription>Development and testing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                              <Zap className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">Test Mode Active</p>
                              <p className="text-sm text-gray-500">No real charges will be made</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="font-medium mb-2">Test Card Numbers</p>
                          <div className="space-y-1 text-sm font-mono text-gray-600">
                            <p>4242 4242 4242 4242 - Success</p>
                            <p>4000 0000 0000 0002 - Declined</p>
                            <p>4000 0000 0000 3220 - 3D Secure</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export billing data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => setShowExportInvoicesDialog(true)}>
                            <Download className="h-6 w-6 mb-2" />
                            <span className="font-medium">Export Invoices</span>
                            <span className="text-xs text-gray-500">CSV format</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => setShowExportSubscriptionsDialog(true)}>
                            <Download className="h-6 w-6 mb-2" />
                            <span className="font-medium">Export Subscriptions</span>
                            <span className="text-xs text-gray-500">CSV format</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Customer Portal</CardTitle>
                        <CardDescription>Self-service customer portal settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                              <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">Enable Customer Portal</p>
                              <p className="text-sm text-gray-500">Let customers manage subscriptions</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Plan Changes</p>
                            <p className="text-sm text-gray-500">Customers can upgrade/downgrade</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Cancellation</p>
                            <p className="text-sm text-gray-500">Self-service subscription cancellation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Payment Method Update</p>
                            <p className="text-sm text-gray-500">Update card on file</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Invoice History</p>
                            <p className="text-sm text-gray-500">View and download past invoices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Revenue Recovery</CardTitle>
                        <CardDescription>Optimize failed payment recovery</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Revenue Recovery Mode</p>
                              <p className="text-sm text-gray-500">AI-powered payment recovery</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Card Updater</p>
                            <p className="text-sm text-gray-500">Automatically update expired cards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Network Tokens</p>
                            <p className="text-sm text-gray-500">Higher authorization rates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Recovery Rate</span>
                            <span className="text-lg font-bold text-green-600">87.5%</span>
                          </div>
                          <Progress value={87.5} className="h-2" />
                          <p className="text-xs text-green-600 mt-2">$12,450 recovered this month</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Fraud Prevention</CardTitle>
                        <CardDescription>Protect against fraudulent transactions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Radar for Fraud Teams</p>
                              <p className="text-sm text-gray-500">Advanced fraud detection</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">3D Secure Authentication</p>
                            <p className="text-sm text-gray-500">Extra layer of security</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Block High-Risk Countries</p>
                            <p className="text-sm text-gray-500">Prevent transactions from risky regions</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Risk Threshold</Label>
                          <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                            <option>Low (Block more)</option>
                            <option>Medium (Balanced)</option>
                            <option>High (Allow more)</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Cancel All Subscriptions</p>
                              <p className="text-sm text-red-600">This will cancel all active subscriptions</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowCancelAllDialog(true)}>
                              Cancel All
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset Billing Configuration</p>
                              <p className="text-sm text-red-600">Reset all settings to defaults</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
                              Reset
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Disconnect Stripe</p>
                              <p className="text-sm text-red-600">Disconnect payment integration</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDisconnectStripeDialog(true)}>
                              Disconnect
                            </Button>
                          </div>
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
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Pricing Intelligence" defaultOpen={true} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsightsPanel
                  insights={mockPricingAIInsights}
                  title="Pricing Intelligence"
                  onInsightAction={(insight) => toast.info("Insight: " + insight.title)}
                />
              </div>
              <div className="space-y-6">
                <CollaborationIndicator
                  collaborators={mockPricingCollaborators}
                  maxVisible={4}
                />
                <PredictiveAnalytics
                  predictions={mockPricingPredictions}
                  title="Revenue Forecasts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ActivityFeed
                activities={mockPricingActivities}
                title="Pricing Activity"
                maxItems={5}
              />
              <QuickActionsToolbar
                actions={pricingQuickActions}
                variant="grid"
              />
            </div>
          </CollapsibleInsightsPanel>
        )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Button className="flex-1" onClick={() => setShowEditPlanDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Plan
                  </Button>
                  <Button variant="outline" onClick={() => setShowDuplicatePlanDialog(true)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => setShowPlanAnalyticsDialog(true)}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Button variant="outline" onClick={() => setShowChangePlanDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button variant="outline" onClick={() => setShowViewSubInvoicesDialog(true)}>
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                  {selectedSubscription.status === 'active' && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setShowCancelSubscriptionDialog(true)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Plan Dialog */}
        <Dialog open={showCreatePlanDialog} onOpenChange={setShowCreatePlanDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Pricing Plan</DialogTitle>
              <DialogDescription>Add a new subscription plan to your pricing table</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Plan Name</Label>
                <Input
                  placeholder="e.g., Professional"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Short description of the plan"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="29"
                    value={planForm.monthly_price}
                    onChange={(e) => setPlanForm({ ...planForm, monthly_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Annual Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="290"
                    value={planForm.annual_price}
                    onChange={(e) => setPlanForm({ ...planForm, annual_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={planForm.is_featured}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, is_featured: checked })}
                />
                <Label>Featured Plan (highlighted)</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreatePlanDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  onClick={handleCreatePlan}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Plan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Coupon Dialog */}
        <Dialog open={showCreateCouponDialog} onOpenChange={setShowCreateCouponDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Discount Coupon</DialogTitle>
              <DialogDescription>Create a new discount code for your customers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Coupon Code</Label>
                  <Input
                    placeholder="e.g., SAVE20"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    placeholder="e.g., 20% Off First Month"
                    value={couponForm.name}
                    onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Discount Type</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_trial">Free Trial Days</option>
                  </select>
                </div>
                <div>
                  <Label>{couponForm.discount_type === 'percentage' ? 'Percentage' : couponForm.discount_type === 'fixed' ? 'Amount ($)' : 'Days'}</Label>
                  <Input
                    type="number"
                    placeholder={couponForm.discount_type === 'percentage' ? '20' : couponForm.discount_type === 'fixed' ? '50' : '14'}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Duration</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={couponForm.duration}
                    onChange={(e) => setCouponForm({ ...couponForm, duration: e.target.value })}
                  >
                    <option value="once">Once</option>
                    <option value="repeating">Repeating</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
                <div>
                  <Label>Max Redemptions (optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={couponForm.max_redemptions || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, max_redemptions: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateCouponDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                  onClick={handleCreateCoupon}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Pricing Analytics
              </DialogTitle>
              <DialogDescription>
                Comprehensive pricing performance metrics and revenue insights
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">MRR</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(stats.mrr)}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +18.5% vs last month
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">ARR</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stats.arr)}</p>
                  <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +22.3% vs last year
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">ARPU</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(stats.arpu)}</p>
                  <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +8.7% improvement
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Total Subscribers</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalSubscribers.toLocaleString()}</p>
                  <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" /> {stats.paidSubscribers.toLocaleString()} paid
                  </p>
                </div>
              </div>

              {/* Plan Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue by Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mappedPlans.map((plan) => {
                      const percentage = stats.totalRevenue > 0 ? (plan.revenue / stats.totalRevenue) * 100 : 0
                      return (
                        <div key={plan.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{plan.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{formatCurrency(plan.revenue)}</span>
                              <Badge variant="outline" className="text-xs">{percentage.toFixed(1)}%</Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Subscriber Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mappedPlans.map((plan) => {
                      const percentage = stats.totalSubscribers > 0 ? (plan.subscriberCount / stats.totalSubscribers) * 100 : 0
                      return (
                        <div key={plan.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{plan.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{plan.subscriberCount.toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs">{percentage.toFixed(1)}%</Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Churn & Conversion */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Churn Rate by Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mappedPlans.filter(p => p.prices.monthly > 0).map((plan) => (
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
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Conversion Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Free to Paid</span>
                      <span className="font-semibold">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Trial Conversion</span>
                      <span className="font-semibold">45.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Upgrade Rate</span>
                      <span className="font-semibold">18.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Annual Adoption</span>
                      <span className="font-semibold">67%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Coupon Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Active Coupons</span>
                      <span className="font-semibold">{mockCoupons.filter(c => c.isActive).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Redemptions</span>
                      <span className="font-semibold">{mockCoupons.reduce((sum, c) => sum + c.redemptionsCount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Top Coupon</span>
                      <span className="font-semibold font-mono text-xs">TRIAL30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Avg Discount</span>
                      <span className="font-semibold">28%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={handleExportPricing}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  onClick={() => {
                    setShowAnalyticsDialog(false)
                    setActiveTab('analytics')
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Full Analytics Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Subscriptions Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Subscriptions</DialogTitle>
              <DialogDescription>Filter subscriptions by status and plan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <select
                  className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div>
                <Label>Plan</Label>
                <select
                  className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  {mappedPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setFilterStatus('all')
                  setFilterPlan('all')
                }}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Filters applied')
                  setShowFilterDialog(false)
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Coupon Dialog */}
        <Dialog open={showEditCouponDialog} onOpenChange={setShowEditCouponDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
              <DialogDescription>Modify coupon details for {selectedCouponForEdit?.code}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Coupon Name</Label>
                <Input defaultValue={selectedCouponForEdit?.name} className="mt-1" />
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input type="number" defaultValue={selectedCouponForEdit?.value} className="mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked={selectedCouponForEdit?.isActive} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditCouponDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Coupon updated successfully')
                  setShowEditCouponDialog(false)
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Coupon Confirmation Dialog */}
        <Dialog open={showDeleteCouponConfirmDialog} onOpenChange={setShowDeleteCouponConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Coupon</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the coupon &quot;{selectedCouponForEdit?.code}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteCouponConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                toast.success('Coupon deleted successfully')
                setShowDeleteCouponConfirmDialog(false)
              }}>
                Delete Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export All Invoices Dialog */}
        <Dialog open={showExportAllInvoicesDialog} onOpenChange={setShowExportAllInvoicesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export All Invoices</DialogTitle>
              <DialogDescription>Export all invoices to a file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF (ZIP)</option>
                </select>
              </div>
              <div>
                <Label>Date Range</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="all">All Time</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportAllInvoicesDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Export started - check your downloads')
                  setShowExportAllInvoicesDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={showViewInvoiceDialog} onOpenChange={setShowViewInvoiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
              <DialogDescription>Invoice details for {selectedInvoice?.customerName}</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getInvoiceStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Period</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedInvoice.periodStart).toLocaleDateString()} - {new Date(selectedInvoice.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowViewInvoiceDialog(false)}>Close</Button>
                  <Button onClick={() => {
                    toast.success('Invoice PDF downloaded')
                    setShowViewInvoiceDialog(false)
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Download Invoice Dialog */}
        <Dialog open={showDownloadInvoiceDialog} onOpenChange={setShowDownloadInvoiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Download Invoice</DialogTitle>
              <DialogDescription>Download invoice {selectedInvoice?.invoiceNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Format</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDownloadInvoiceDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Invoice downloaded')
                  setShowDownloadInvoiceDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Logo Dialog */}
        <Dialog open={showUploadLogoDialog} onOpenChange={setShowUploadLogoDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Logo</DialogTitle>
              <DialogDescription>Upload your company logo for invoices</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">Drag and drop your logo here, or click to browse</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
                <Button variant="outline" asChild>
                  <label htmlFor="logo-upload" className="cursor-pointer">Browse Files</label>
                </Button>
                {logoFile && <p className="text-sm text-green-600 mt-2">Selected: {logoFile.name}</p>}
              </div>
              <p className="text-xs text-gray-500">Recommended: PNG or SVG, max 2MB, 400x100px</p>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadLogoDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Logo uploaded successfully')
                  setShowUploadLogoDialog(false)
                }}>
                  Upload Logo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect PayPal Dialog */}
        <Dialog open={showConnectPayPalDialog} onOpenChange={setShowConnectPayPalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect PayPal</DialogTitle>
              <DialogDescription>Link your PayPal account to accept payments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">PayPal Business Account</p>
                    <p className="text-sm text-gray-500">Required for merchant payments</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>PayPal Email</Label>
                <Input placeholder="your-business@email.com" className="mt-1" />
              </div>
              <div>
                <Label>Client ID</Label>
                <Input placeholder="Enter your PayPal Client ID" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConnectPayPalDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  toast.success('PayPal connected successfully')
                  setShowConnectPayPalDialog(false)
                }}>
                  Connect PayPal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription>Configure a new webhook to receive billing events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Endpoint URL</Label>
                <Input
                  placeholder="https://your-api.com/webhooks/billing"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Events to Listen</Label>
                <div className="space-y-2 mt-2">
                  {['invoice.created', 'invoice.paid', 'subscription.created', 'subscription.canceled', 'payment.failed'].map((event) => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} defaultChecked className="rounded" />
                      <label htmlFor={event} className="text-sm font-mono">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddWebhookDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Webhook endpoint added')
                  setShowAddWebhookDialog(false)
                  setWebhookUrl('')
                }}>
                  <Webhook className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-amber-600">Regenerate API Key</DialogTitle>
              <DialogDescription>
                This will invalidate your current API key. Any integrations using the old key will stop working.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">This action cannot be undone</p>
                </div>
              </div>
              <div>
                <Label>Type &quot;REGENERATE&quot; to confirm</Label>
                <Input placeholder="REGENERATE" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateApiKeyDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('New API key generated')
                  setShowRegenerateApiKeyDialog(false)
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Invoices Dialog */}
        <Dialog open={showExportInvoicesDialog} onOpenChange={setShowExportInvoicesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Invoices</DialogTitle>
              <DialogDescription>Export your invoice data to CSV</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date Range</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <Label>Status Filter</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportInvoicesDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Invoices exported to CSV')
                  setShowExportInvoicesDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Subscriptions Dialog */}
        <Dialog open={showExportSubscriptionsDialog} onOpenChange={setShowExportSubscriptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Subscriptions</DialogTitle>
              <DialogDescription>Export your subscription data to CSV</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status Filter</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="canceled">Canceled Only</option>
                  <option value="trialing">Trialing Only</option>
                </select>
              </div>
              <div>
                <Label>Include</Label>
                <div className="space-y-2 mt-2">
                  {['Customer Details', 'Billing History', 'Usage Data', 'Coupon Info'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <input type="checkbox" id={item} defaultChecked className="rounded" />
                      <label htmlFor={item} className="text-sm">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportSubscriptionsDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Subscriptions exported to CSV')
                  setShowExportSubscriptionsDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel All Subscriptions Dialog */}
        <Dialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Cancel All Subscriptions</DialogTitle>
              <DialogDescription>
                This will cancel ALL active subscriptions. This action is irreversible and will affect all your customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {mockSubscriptions.filter(s => s.status === 'active').length} active subscriptions will be canceled
                  </p>
                </div>
              </div>
              <div>
                <Label>Type &quot;CANCEL ALL&quot; to confirm</Label>
                <Input placeholder="CANCEL ALL" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelAllDialog(false)}>
                  Go Back
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('All subscriptions have been canceled')
                  setShowCancelAllDialog(false)
                }}>
                  Cancel All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset Billing Configuration</DialogTitle>
              <DialogDescription>
                This will reset all billing settings to their default values. Your subscriptions and invoices will not be affected.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Settings that will be reset: Tax configuration, Invoice templates, Notification preferences, Dunning settings
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowResetSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('Settings reset to defaults')
                  setShowResetSettingsDialog(false)
                }}>
                  Reset Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disconnect Stripe Dialog */}
        <Dialog open={showDisconnectStripeDialog} onOpenChange={setShowDisconnectStripeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Disconnect Stripe</DialogTitle>
              <DialogDescription>
                This will disconnect your Stripe account. You will no longer be able to process payments until you reconnect.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    Active subscriptions will fail to process payments
                  </p>
                </div>
              </div>
              <div>
                <Label>Type &quot;DISCONNECT&quot; to confirm</Label>
                <Input placeholder="DISCONNECT" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDisconnectStripeDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('Stripe disconnected')
                  setShowDisconnectStripeDialog(false)
                }}>
                  Disconnect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Plan Dialog */}
        <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Plan: {selectedPlan?.name}</DialogTitle>
              <DialogDescription>Modify the pricing plan details</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input defaultValue={selectedPlan.name} className="mt-1" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input defaultValue={selectedPlan.description} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Monthly Price ($)</Label>
                    <Input type="number" defaultValue={selectedPlan.prices.monthly} className="mt-1" />
                  </div>
                  <div>
                    <Label>Annual Price ($)</Label>
                    <Input type="number" defaultValue={selectedPlan.prices.annual} className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={selectedPlan.isFeatured} />
                  <Label>Featured Plan</Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEditPlanDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast.success('Plan updated successfully')
                    setShowEditPlanDialog(false)
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Duplicate Plan Dialog */}
        <Dialog open={showDuplicatePlanDialog} onOpenChange={setShowDuplicatePlanDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Duplicate Plan</DialogTitle>
              <DialogDescription>Create a copy of {selectedPlan?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Plan Name</Label>
                <Input defaultValue={`${selectedPlan?.name} (Copy)`} className="mt-1" />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">The following will be copied:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>- All features and limits</li>
                  <li>- Pricing configuration</li>
                  <li>- Trial settings</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDuplicatePlanDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Plan duplicated successfully')
                  setShowDuplicatePlanDialog(false)
                }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plan Analytics Dialog */}
        <Dialog open={showPlanAnalyticsDialog} onOpenChange={setShowPlanAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Analytics: {selectedPlan?.name}</DialogTitle>
              <DialogDescription>Performance metrics for this plan</DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedPlan.revenue)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600">Subscribers</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedPlan.subscriberCount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-amber-700">{selectedPlan.churnRate}%</p>
                  </div>
                </div>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Subscriber Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Monthly trend chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowPlanAnalyticsDialog(false)}>Close</Button>
                  <Button onClick={() => {
                    setShowPlanAnalyticsDialog(false)
                    setActiveTab('analytics')
                  }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Full Analytics
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Subscription Plan</DialogTitle>
              <DialogDescription>Change plan for {selectedSubscription?.customerName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="font-semibold">{selectedSubscription?.planName}</p>
              </div>
              <div>
                <Label>New Plan</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  {mappedPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - {formatCurrency(plan.prices.monthly)}/mo</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Prorate charges</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowChangePlanDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Plan changed successfully')
                  setShowChangePlanDialog(false)
                }}>
                  Change Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Subscription Invoices Dialog */}
        <Dialog open={showViewSubInvoicesDialog} onOpenChange={setShowViewSubInvoicesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoices for {selectedSubscription?.customerName}</DialogTitle>
              <DialogDescription>Billing history for this subscription</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="divide-y border rounded-lg">
                {mockInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getInvoiceStatusColor(invoice.status)}>{invoice.status}</Badge>
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`Invoice ${invoice.invoiceNumber} downloaded`)
                      }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowViewSubInvoicesDialog(false)}>Close</Button>
                <Button variant="outline" onClick={() => {
                  setShowViewSubInvoicesDialog(false)
                  setActiveTab('invoices')
                }}>
                  View All Invoices
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Cancel Subscription</DialogTitle>
              <DialogDescription>
                Cancel the subscription for {selectedSubscription?.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Cancellation Reason</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select a reason...</option>
                  <option value="too_expensive">Too expensive</option>
                  <option value="not_using">Not using the service</option>
                  <option value="switching">Switching to competitor</option>
                  <option value="missing_features">Missing features</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>When to Cancel</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="end_of_period">At end of billing period</option>
                  <option value="immediately">Immediately</option>
                </select>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  The customer will retain access until {new Date(selectedSubscription?.currentPeriodEnd || '').toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelSubscriptionDialog(false)}>
                  Keep Subscription
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('Subscription canceled')
                  setShowCancelSubscriptionDialog(false)
                }}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
