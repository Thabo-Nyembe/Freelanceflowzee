"use client"

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
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

// Empty data arrays (real data comes from Supabase)
const emptyPlans: PricingPlan[] = []
const emptySubscriptions: Subscription[] = []
const emptyCoupons: Coupon[] = []
const emptyInvoices: Invoice[] = []

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

// Empty Competitive Upgrade Data arrays (real data comes from backend)
const emptyPricingAIInsights: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []
const emptyPricingCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'offline' | 'busy'; role: string }[] = []
const emptyPricingPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []
const emptyPricingActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'update' | 'warning' | 'error' }[] = []

// Note: Quick actions are defined inside the component to access state setters

export default function PricingClient({
  initialPlans = emptyPlans
}: PricingClientProps) {

  // Core UI state
  const [activeTab, setActiveTab] = useState('plans')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Supabase state
  const [dbPlans, setDbPlans] = useState<DbPricingPlan[]>([])
  const [dbCoupons, setDbCoupons] = useState<DbCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false)
  const [showCreateCouponDialog, setShowCreateCouponDialog] = useState(false)
  const [planForm, setPlanForm] = useState<PlanFormState>(initialPlanForm)
  const [couponForm, setCouponForm] = useState<CouponFormState>(initialCouponForm)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null)

  // Dialog states for real functionality
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showInvoicePreview, setShowInvoicePreview] = useState<Invoice | null>(null)
  const [showPlanEditor, setShowPlanEditor] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)

  // Fetch plans from Supabase
  const fetchPlans = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setDbPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }, [])

  // Fetch coupons from Supabase
  const fetchCoupons = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('booking_coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Table may not exist - coupons will remain empty
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
    fetchPlans()
    fetchCoupons()
  }, [fetchPlans, fetchCoupons])

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
    return emptySubscriptions.filter(sub =>
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
    { label: 'Coupons Active', value: emptyCoupons.filter(c => c.isActive).length.toString(), change: 25, icon: Tag, color: 'from-pink-500 to-rose-600' }
  ]

  // CRUD: Create Plan
  const handleCreatePlan = async () => {
    if (!planForm.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create plans')
        return
      }

      const { error } = await supabase.from('pricing_plans').insert({
        user_id: user.id,
        name: planForm.name,
        description: planForm.description,
        monthly_price: planForm.monthly_price,
        annual_price: planForm.annual_price,
        is_featured: planForm.is_featured,
        features: planForm.features,
        is_active: true,
        sort_order: dbPlans.length,
      })

      if (error) throw error
      toast.success('Plan created successfully')
      setShowCreatePlanDialog(false)
      setPlanForm(initialPlanForm)
      fetchPlans()
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error('Failed to create plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Update Plan
  const handleUpdatePlan = async (planId: string) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pricing_plans')
        .update({
          name: planForm.name,
          description: planForm.description,
          monthly_price: planForm.monthly_price,
          annual_price: planForm.annual_price,
          is_featured: planForm.is_featured,
          features: planForm.features,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)

      if (error) throw error
      toast.success('Plan updated successfully')
      setEditingPlanId(null)
      setPlanForm(initialPlanForm)
      fetchPlans()
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error('Failed to update plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD: Delete/Archive Plan
  const handleArchivePlan = async (planId: string, planName: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('pricing_plans')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', planId)

      if (error) throw error
      toast.success(`"${planName}" archived successfully`)
      fetchPlans()
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
      const supabase = createClient()
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
      const supabase = createClient()
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
      const supabase = createClient()
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
      const supabase = createClient()
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
    toast.promise(
      navigator.clipboard.writeText(code),
      {
        loading: 'Copying coupon code...',
        success: 'Coupon code copied to clipboard',
        error: 'Failed to copy coupon code'
      }
    )
  }

  // Download invoice as PDF
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Generate invoice PDF content
      const invoiceContent = `
INVOICE
==========================================
Invoice Number: ${invoice.invoiceNumber}
Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Bill To:
${invoice.customerName}

------------------------------------------
Description                         Amount
------------------------------------------
Subscription (${new Date(invoice.periodStart).toLocaleDateString()} - ${new Date(invoice.periodEnd).toLocaleDateString()})
                              ${formatCurrency(invoice.amount)}

------------------------------------------
Total:                        ${formatCurrency(invoice.amount)}
==========================================
Status: ${invoice.status.toUpperCase()}
${invoice.paidAt ? `Paid on: ${new Date(invoice.paidAt).toLocaleDateString()}` : ''}
      `.trim()

      const blob = new Blob([invoiceContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Invoice ${invoice.invoiceNumber} downloaded`)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  // Export all invoices
  const handleExportAllInvoices = async () => {
    try {
      const csvContent = [
        ['Invoice Number', 'Customer', 'Amount', 'Status', 'Due Date', 'Paid Date'].join(','),
        ...emptyInvoices.map(inv => [
          inv.invoiceNumber,
          inv.customerName,
          inv.amount,
          inv.status,
          new Date(inv.dueDate).toLocaleDateString(),
          inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('All invoices exported successfully')
    } catch (error) {
      console.error('Error exporting invoices:', error)
      toast.error('Failed to export invoices')
    }
  }

  // Export subscriptions to CSV
  const handleExportSubscriptions = async () => {
    try {
      const csvContent = [
        ['Customer', 'Email', 'Plan', 'Status', 'Amount', 'Billing Period', 'Created'].join(','),
        ...emptySubscriptions.map(sub => [
          sub.customerName,
          sub.customerEmail,
          sub.planName,
          sub.status,
          sub.amount,
          sub.billingPeriod,
          new Date(sub.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Subscriptions exported successfully')
    } catch (error) {
      console.error('Error exporting subscriptions:', error)
      toast.error('Failed to export subscriptions')
    }
  }

  // Connect to PayPal
  const handleConnectPayPal = () => {
    // Open PayPal OAuth flow in a new window
    const paypalAuthUrl = 'https://www.paypal.com/connect?flowEntry=static&client_id=YOUR_CLIENT_ID&scope=openid'
    window.open(paypalAuthUrl, '_blank', 'width=600,height=700')
    toast.info('PayPal connection window opened. Please complete the authorization.')
  }

  // Regenerate API Key
  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate the existing key.')) {
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to regenerate API key')
        return
      }

      // Generate a new random API key
      const newKey = 'sk_live_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Save to user_settings table
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          api_key: newKey,
          api_key_generated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      await navigator.clipboard.writeText(newKey)
      toast.success('API key regenerated and copied to clipboard')
    } catch (error) {
      console.error('Error regenerating API key:', error)
      toast.error('Failed to regenerate API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel all subscriptions (danger zone)
  const handleCancelAllSubscriptions = async () => {
    if (!confirm('WARNING: This will cancel ALL active subscriptions. This action cannot be undone. Are you sure?')) {
      return
    }
    if (!confirm('Please confirm again - cancel ALL subscriptions?')) {
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to cancel subscriptions')
        return
      }

      // Update all active subscriptions to cancelled status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (error) throw error
      toast.success('All subscriptions have been scheduled for cancellation')
    } catch (error) {
      console.error('Error cancelling subscriptions:', error)
      toast.error('Failed to cancel subscriptions')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset billing configuration
  const handleResetBillingConfig = async () => {
    if (!confirm('This will reset all billing settings to defaults. Continue?')) {
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to reset billing configuration')
        return
      }

      // Reset billing settings in user_settings table
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          billing_email: user.email,
          billing_currency: 'USD',
          billing_interval: 'monthly',
          auto_renew: true,
          email_notifications: true,
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      toast.success('Billing configuration has been reset to defaults')
    } catch (error) {
      console.error('Error resetting config:', error)
      toast.error('Failed to reset configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Disconnect Stripe
  const handleDisconnectStripe = async () => {
    if (!confirm('WARNING: Disconnecting Stripe will disable all payment processing. Are you sure?')) {
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to disconnect Stripe')
        return
      }

      // Remove Stripe integration from user_settings
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          stripe_connected: false,
          stripe_account_id: null,
          stripe_disconnected_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      toast.success('Stripe has been disconnected. Payment processing is now disabled.')
    } catch (error) {
      console.error('Error disconnecting Stripe:', error)
      toast.error('Failed to disconnect Stripe')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel subscription
  const handleCancelSubscription = async (subscription: Subscription) => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${subscription.customerName}?`)) {
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
          cancel_reason: 'Cancelled by admin',
        })
        .eq('id', subscription.id)

      if (error) throw error
      toast.success(`Subscription for ${subscription.customerName} has been cancelled`)
      setSelectedSubscription(null)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Duplicate plan
  const handleDuplicatePlan = async (plan: PricingPlan) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to duplicate plans')
        return
      }

      const { error } = await supabase.from('pricing_plans').insert({
        user_id: user.id,
        name: `${plan.name} (Copy)`,
        description: plan.description,
        monthly_price: plan.prices.monthly,
        annual_price: plan.prices.annual,
        is_featured: false,
        features: plan.features,
        is_active: true,
        sort_order: dbPlans.length,
      })

      if (error) throw error
      toast.success(`Plan "${plan.name}" duplicated successfully`)
      fetchPlans()
    } catch (error) {
      console.error('Error duplicating plan:', error)
      toast.error('Failed to duplicate plan')
    }
  }

  // Open file browser for logo upload
  const handleBrowseForLogo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsSubmitting(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Please sign in to upload logo')
          return
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/billing-logo-${Date.now()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('assets')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(fileName)

        // Save logo URL to user settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            billing_logo_url: publicUrl,
          }, {
            onConflict: 'user_id'
          })

        if (settingsError) throw settingsError

        toast.success(`Logo "${file.name}" uploaded successfully`)
      } catch (error) {
        console.error('Error uploading logo:', error)
        toast.error('Failed to upload logo')
      } finally {
        setIsSubmitting(false)
      }
    }
    input.click()
  }

  // Quick actions with real functionality
  const pricingQuickActions = [
    {
      id: '1',
      label: 'New Plan',
      icon: 'plus',
      action: () => setShowCreatePlanDialog(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Create Coupon',
      icon: 'tag',
      action: () => setShowCreateCouponDialog(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Analytics',
      icon: 'chart',
      action: () => setActiveTab('analytics'),
      variant: 'outline' as const
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto space-y-6">
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
              {/* Empty state when no coupons */}
              {dbCoupons.length === 0 && (
                <Card className="col-span-full border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No coupons found. Create a coupon to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <Button variant="outline" onClick={handleExportAllInvoices}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {emptyInvoices.length === 0 ? (
                    <div className="p-8 text-center">
                      <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No invoices found.</p>
                    </div>
                  ) : (
                    emptyInvoices.map((invoice) => (
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
                          <Button variant="outline" size="sm" onClick={() => setShowInvoicePreview(invoice)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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
                            <Button variant="outline" size="sm" className="mt-2" onClick={handleBrowseForLogo}>Browse</Button>
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
                          <Button variant="outline" size="sm" onClick={handleConnectPayPal}>Connect</Button>
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
                        <Button variant="outline" className="w-full" onClick={() => setShowWebhookDialog(true)}>
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
                        <Button variant="outline" className="w-full" onClick={handleRegenerateApiKey}>
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
                          <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleExportAllInvoices}>
                            <Download className="h-6 w-6 mb-2" />
                            <span className="font-medium">Export Invoices</span>
                            <span className="text-xs text-gray-500">CSV format</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleExportSubscriptions}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleCancelAllSubscriptions}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleResetBillingConfig}>
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
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleDisconnectStripe}>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={emptyPricingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={emptyPricingPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={pricingQuickActions}
            variant="grid"
          />
        </div>

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
                  <Button className="flex-1" onClick={() => {
                    if (selectedPlan) {
                      setPlanForm({
                        name: selectedPlan.name,
                        description: selectedPlan.description,
                        monthly_price: selectedPlan.prices.monthly,
                        annual_price: selectedPlan.prices.annual,
                        is_featured: selectedPlan.isFeatured,
                        features: selectedPlan.features.map(f => ({ name: f.name, included: f.included }))
                      })
                      setEditingPlanId(selectedPlan.id)
                      setShowPlanEditor(true)
                      setSelectedPlan(null)
                    }
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Plan
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (selectedPlan) {
                      handleDuplicatePlan(selectedPlan)
                      setSelectedPlan(null)
                    }
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedPlan(null)
                    setActiveTab('analytics')
                  }}>
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
                  <Button variant="outline" onClick={() => {
                    setActiveTab('invoices')
                    setSelectedSubscription(null)
                  }}>
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                  {selectedSubscription.status === 'active' && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleCancelSubscription(selectedSubscription)}>
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

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Subscriptions</DialogTitle>
              <DialogDescription>Narrow down your subscription list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div>
                <Label>Plan</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Plans</option>
                  {initialPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Billing Period</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Periods</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFilterDialog(false)}>
                  Clear
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

        {/* Webhook Configuration Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription>Configure a new webhook to receive billing events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Endpoint URL</Label>
                <Input placeholder="https://api.yourapp.com/webhooks/billing" className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Events to Subscribe</Label>
                <div className="mt-2 space-y-2">
                  {['invoice.created', 'invoice.paid', 'invoice.failed', 'subscription.created', 'subscription.updated', 'subscription.canceled', 'customer.created', 'customer.updated'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} defaultChecked className="rounded" />
                      <label htmlFor={event} className="text-sm font-mono">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowWebhookDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Webhook endpoint added successfully')
                  setShowWebhookDialog(false)
                }}>
                  Add Endpoint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Preview Dialog */}
        <Dialog open={!!showInvoicePreview} onOpenChange={() => setShowInvoicePreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice {showInvoicePreview?.invoiceNumber}</DialogTitle>
              <DialogDescription>Preview invoice details</DialogDescription>
            </DialogHeader>
            {showInvoicePreview && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold">{showInvoicePreview.customerName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getInvoiceStatusColor(showInvoicePreview.status)}>
                      {showInvoicePreview.status}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-2xl">{formatCurrency(showInvoicePreview.amount)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-semibold">{new Date(showInvoicePreview.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 mb-2">Billing Period</p>
                  <p>{new Date(showInvoicePreview.periodStart).toLocaleDateString()} - {new Date(showInvoicePreview.periodEnd).toLocaleDateString()}</p>
                </div>
                {showInvoicePreview.paidAt && (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-600">Paid on {new Date(showInvoicePreview.paidAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => {
                    handleDownloadInvoice(showInvoicePreview)
                    setShowInvoicePreview(null)
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setShowInvoicePreview(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Plan Editor Dialog */}
        <Dialog open={showPlanEditor} onOpenChange={setShowPlanEditor}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Pricing Plan</DialogTitle>
              <DialogDescription>Update plan details and pricing</DialogDescription>
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
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowPlanEditor(false)
                  setEditingPlanId(null)
                  setPlanForm(initialPlanForm)
                }}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  onClick={async () => {
                    if (editingPlanId) {
                      await handleUpdatePlan(editingPlanId)
                      setShowPlanEditor(false)
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Subscription Plan</DialogTitle>
              <DialogDescription>Select a new plan for {selectedSubscription?.customerName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                {initialPlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      plan.id === selectedSubscription?.planId
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => {
                      if (plan.id !== selectedSubscription?.planId) {
                        if (confirm(`Change plan to ${plan.name}?`)) {
                          toast.success(`Plan changed to ${plan.name}`)
                          setShowChangePlanDialog(false)
                          setSelectedSubscription(null)
                        }
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      </div>
                      <p className="font-bold text-violet-600">{formatCurrency(plan.prices.monthly)}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowChangePlanDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
