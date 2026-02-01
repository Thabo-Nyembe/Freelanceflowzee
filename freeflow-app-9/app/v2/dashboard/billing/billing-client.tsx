'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo, useCallback } from 'react'
import {
  CreditCard, Receipt, DollarSign, Users, Plus, BarChart3, Settings, RefreshCw, Download, AlertCircle, AlertTriangle, Clock, Trash2, Edit, Eye,
  Zap, Package, TrendingUp, ExternalLink, Copy,
  Building, Mail, Globe, Shield, Lock, CreditCard as CardIcon,
  Tag, Percent, RotateCcw, Webhook, FileText, Search, Activity, Timer, History, Bell, Link2, Key, Database, Palette,
  TestTube, AlertOctagon, ShieldCheck, Layers, Repeat, Send, Sparkles
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

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




import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBilling, type BillingTransaction, type BillingStatus } from '@/lib/hooks/use-billing'
import { useCreateSubscription, useActiveSubscriptions } from '@/lib/hooks/use-subscriptions-extended'
import { useCreateCoupon, useCoupons } from '@/lib/hooks/use-coupon-extended'
import { useInvoices } from '@/lib/hooks/use-invoices-extended'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import { toast } from 'sonner'

interface Subscription {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  plan: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused' | 'incomplete'
  amount: number
  interval: 'month' | 'year' | 'week'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end: string | null
  payment_method?: PaymentMethod
  metadata: Record<string, string>
  created_at: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'sepa_debit' | 'us_bank_account'
  brand?: string
  last4: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  fingerprint: string
}

interface Invoice {
  id: string
  number: string
  customer_id: string
  customer_name: string
  customer_email: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  amount_due: number
  amount_paid: number
  amount_remaining: number
  subtotal: number
  tax: number
  total: number
  due_date: string
  created_at: string
  paid_at?: string
  hosted_invoice_url?: string
  pdf_url?: string
  line_items: InvoiceLineItem[]
  discount?: { coupon_id: string; amount_off: number }
}

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_amount: number
  amount: number
  period: { start: string; end: string }
}

interface Coupon {
  id: string
  name: string
  code: string
  type: 'percent_off' | 'amount_off'
  value: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  duration_in_months?: number
  max_redemptions?: number
  times_redeemed: number
  valid: boolean
  expires_at?: string
  created_at: string
}

interface TaxRate {
  id: string
  name: string
  percentage: number
  jurisdiction: string
  country: string
  state?: string
  inclusive: boolean
  active: boolean
}

interface Refund {
  id: string
  payment_id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge'
  created_at: string
  metadata?: Record<string, string>
}

interface UsageRecord {
  id: string
  subscription_id: string
  customer_id: string
  customer_name: string
  quantity: number
  timestamp: string
  unit_price: number
  total: number
  action: 'set' | 'increment'
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'enabled' | 'disabled'
  secret: string
  created_at: string
  last_delivery: string | null
  success_rate: number
}

interface PricingPlan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: 'month' | 'year' | 'week'
  features: string[]
  is_active: boolean
  trial_days: number
  subscribers: number
}

// Competitive upgrade components data defined locally after stats calculation

export default function BillingClient({ initialBilling }: { initialBilling: BillingTransaction[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showInsights, setShowInsights] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  const [showNewSubscriptionModal, setShowNewSubscriptionModal] = useState(false)
  const [showNewCouponModal, setShowNewCouponModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [settingsTab, setSettingsTab] = useState('payment')

  // Dialog states for settings buttons
  const [showUploadLogoDialog, setShowUploadLogoDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showAddTaxRateDialog, setShowAddTaxRateDialog] = useState(false)
  const [showConfirmCancelAllDialog, setShowConfirmCancelAllDialog] = useState(false)
  const [showConfirmDeleteTestDataDialog, setShowConfirmDeleteTestDataDialog] = useState(false)
  const [showConfirmDisableBillingDialog, setShowConfirmDisableBillingDialog] = useState(false)
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false)
  const [showConnectIntegrationDialog, setShowConnectIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

  // Additional dialog states for full functionality
  const [showEditWebhookDialog, setShowEditWebhookDialog] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [showEditTaxRateDialog, setShowEditTaxRateDialog] = useState(false)
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null)
  const [showRotateApiKeysDialog, setShowRotateApiKeysDialog] = useState(false)
  const [showGenerateTaxReportDialog, setShowGenerateTaxReportDialog] = useState(false)
  const [secretKeyVisible, setSecretKeyVisible] = useState(false)

  // Form states for edit dialogs
  const [editWebhookForm, setEditWebhookForm] = useState({
    url: '',
    description: '',
    events: [] as string[],
    status: 'enabled' as 'enabled' | 'disabled'
  })
  const [editTaxRateForm, setEditTaxRateForm] = useState({
    name: '',
    percentage: '',
    country: 'us',
    jurisdiction: '',
    inclusive: false,
    active: true
  })
  const [taxReportForm, setTaxReportForm] = useState({
    startDate: '',
    endDate: '',
    format: 'csv' as 'csv' | 'pdf' | 'json',
    includeDetails: true
  })

  const { transactions, loading, error, refetch: refetchTransactions } = useBilling({ status: statusFilter })
  const display = transactions.length > 0 ? transactions : initialBilling

  // Database integration for subscriptions and coupons
  const { create: createSubscription, isLoading: creatingSubscription } = useCreateSubscription()
  const { create: createCoupon, isLoading: creatingCoupon } = useCreateCoupon()

  // Load real data from Supabase
  const { data: dbSubscriptions, isLoading: loadingSubscriptions, refresh: refreshSubscriptions } = useActiveSubscriptions()
  const { data: dbCoupons, isLoading: loadingCoupons, refresh: refreshCoupons } = useCoupons()
  const { invoices: dbInvoices, isLoading: loadingInvoices, refresh: refreshInvoices } = useInvoices()

  // Mutation hooks for subscriptions and invoices
  const { update: updateSubscription, loading: updatingSubscription } = useSupabaseMutation({
    table: 'subscriptions',
    onSuccess: refreshSubscriptions
  })

  const { create: createInvoice, update: updateInvoice, loading: mutatingInvoice } = useSupabaseMutation({
    table: 'invoices',
    onSuccess: refreshInvoices
  })

  const { create: createRefund, loading: creatingRefund } = useSupabaseMutation({
    table: 'refunds',
    onSuccess: refetchTransactions
  })

  // Invoice dialog state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    clientEmail: '',
    clientName: '',
    amount: '',
    dueDate: '',
    description: ''
  })

  // Refund dialog state
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundForm, setRefundForm] = useState({
    transactionId: '',
    amount: '',
    reason: 'requested_by_customer' as 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge'
  })

  // Quick actions with proper dialog handlers
  const billingQuickActions = [
    { id: '1', label: 'New Invoice', icon: 'plus', action: () => setShowNewInvoiceModal(true), variant: 'default' as const },
    { id: '2', label: 'Refund', icon: 'rotate-ccw', action: () => setShowRefundDialog(true), variant: 'default' as const },
    {
      id: '3', label: 'Export', icon: 'download', action: () => {
        const billingData = { exported_at: new Date().toISOString(), summary: { total_subscriptions: 5, active: 3, pending: 1, cancelled: 1 } }
        const blob = new Blob([JSON.stringify(billingData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Billing data exported successfully')
      }, variant: 'outline' as const
    },
  ]

  // Form state for new subscription
  const [newSubscriptionForm, setNewSubscriptionForm] = useState({
    customerEmail: '',
    planId: '',
    trialDays: '0',
    couponCode: ''
  })

  // Form state for new coupon
  const [newCouponForm, setNewCouponForm] = useState({
    name: '',
    code: '',
    discountType: 'percent_off' as 'percent_off' | 'amount_off',
    value: '',
    duration: 'once' as 'once' | 'repeating' | 'forever',
    maxRedemptions: ''
  })

  const handleCreateSubscription = async () => {
    if (!newSubscriptionForm.customerEmail || !newSubscriptionForm.planId) {
      toast.error('Please fill in customer email and select a plan')
      return
    }

    try {
      const trialDays = parseInt(newSubscriptionForm.trialDays) || 0
      const now = new Date()
      const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString() : null
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

      await createSubscription({
        customer_email: newSubscriptionForm.customerEmail,
        plan_id: newSubscriptionForm.planId,
        status: trialDays > 0 ? 'trialing' : 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd,
        trial_end: trialEnd,
        cancel_at_period_end: false,
        billing_cycle: 'monthly',
        coupon_code: newSubscriptionForm.couponCode || null
      })

      toast.success('Subscription created successfully!')
      setShowNewSubscriptionModal(false)
      setNewSubscriptionForm({
        customerEmail: '',
        planId: '',
        trialDays: '0',
        couponCode: ''
      })
    } catch (error) {
      toast.error('Failed to create subscription')
      console.error(error)
    }
  }

  const handleCreateCoupon = async () => {
    if (!newCouponForm.name || !newCouponForm.code || !newCouponForm.value) {
      toast.error('Please fill in coupon name, code, and value')
      return
    }

    try {
      await createCoupon({
        name: newCouponForm.name,
        code: newCouponForm.code.toUpperCase(),
        discount_type: newCouponForm.discountType,
        discount_value: parseFloat(newCouponForm.value),
        duration: newCouponForm.duration,
        max_redemptions: newCouponForm.maxRedemptions ? parseInt(newCouponForm.maxRedemptions) : null,
        is_active: true,
        times_redeemed: 0
      })

      toast.success('Coupon created successfully!')
      setShowNewCouponModal(false)
      setNewCouponForm({
        name: '',
        code: '',
        discountType: 'percent_off',
        value: '',
        duration: 'once',
        maxRedemptions: ''
      })
    } catch (error) {
      toast.error('Failed to create coupon')
      console.error(error)
    }
  }

  // Use real data from database hooks
  const subscriptions = dbSubscriptions || []
  const invoices = dbInvoices || []
  const coupons = dbCoupons || []

  // Empty arrays for features without backend hooks yet
  const taxRates: TaxRate[] = []
  const refunds: Refund[] = []
  const usageRecords: UsageRecord[] = []
  const webhooks: WebhookEndpoint[] = []
  const pricingPlans: PricingPlan[] = []

  const stats = useMemo(() => {
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.interval === 'month' ? s.amount : s.interval === 'year' ? s.amount / 12 : s.amount * 4), 0)
    const arr = mrr * 12
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
    const pastDue = subscriptions.filter(s => s.status === 'past_due').length
    const trialing = subscriptions.filter(s => s.status === 'trialing').length
    const churnedThisMonth = subscriptions.filter(s => s.status === 'canceled').length
    const openInvoices = invoices.filter(i => i.status === 'open').length
    const openAmount = invoices.filter(i => i.status === 'open').reduce((sum, i) => sum + i.amount_remaining, 0)
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount_paid, 0)
    const totalUsage = usageRecords.reduce((sum, u) => sum + u.total, 0)
    const totalRefunds = refunds.filter(r => r.status === 'succeeded').reduce((sum, r) => sum + r.amount, 0)
    const activeCoupons = coupons.filter(c => c.valid).length
    return { mrr, arr, activeSubscriptions, pastDue, trialing, churnedThisMonth, openInvoices, openAmount, totalRevenue, totalUsage, totalRefunds, activeCoupons }
  }, [subscriptions, invoices, usageRecords, refunds, coupons])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      succeeded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      past_due: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      open: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      void: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      paused: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
      incomplete: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      enabled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      disabled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  // Real handlers with Supabase operations
  const handleCancelSubscription = useCallback(async (subscription: Subscription) => {
    try {
      await updateSubscription(subscription.id, {
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString()
      })
      toast.success("Subscription cancelled", { description: subscription.plan_name + " has been cancelled" })
      setSelectedSubscription(null)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast.error('Failed to cancel subscription')
    }
  }, [updateSubscription])

  const handleRefundPayment = useCallback(async (transaction: BillingTransaction) => {
    try {
      await createRefund({
        payment_id: transaction.id,
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        currency: transaction.currency || 'USD',
        status: 'pending',
        reason: 'requested_by_customer',
        notes: `Refund for transaction ${transaction.transaction_id}`
      })
      toast.success("Refund initiated", { description: "$" + transaction.amount + " refund has been initiated" })
    } catch (error) {
      console.error('Failed to initiate refund:', error)
      toast.error('Failed to initiate refund')
    }
  }, [createRefund])

  const handleExportBilling = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: billingData, error } = await supabase
        .from('billing')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Create CSV content
      if (billingData && billingData.length > 0) {
        const headers = Object.keys(billingData[0]).join(',')
        const rows = billingData.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))
        const csv = [headers, ...rows].join('\n')

        // Download the file
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success("Export completed", { description: billingData.length + " billing records" })
      } else {
        toast.info('No data to export')
      }
    } catch (error) {
      console.error('Failed to export billing data:', error)
      toast.error('Failed to export billing data')
    }
  }, [])

  const handleRetryPayment = useCallback(async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        status: 'processing',
        last_retry_at: new Date().toISOString()
      })
      toast.info("Retrying payment", { description: "Processing payment for " + invoice.invoice_number })
      // Call billing API to retry payment
      const response = await fetch('/api/billing-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry_payment',
          invoice_id: invoice.id
        })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        await updateInvoice(invoice.id, {
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        toast.success("Payment successful", { description: invoice.invoice_number + " has been paid" })
      } else {
        await updateInvoice(invoice.id, {
          status: 'open',
          paid_at: null
        })
        toast.error('Payment failed')
      }
    } catch (error) {
      console.error('Failed to retry payment:', error)
      toast.error('Failed to retry payment')
    }
  }, [updateInvoice])

  const handleCreateInvoice = useCallback(async () => {
    if (!newInvoiceForm.clientEmail || !newInvoiceForm.amount) {
      toast.error('Please fill in client email and amount')
      return
    }

    try {
      const dueDate = newInvoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      await createInvoice({
        client_email: newInvoiceForm.clientEmail,
        client_name: newInvoiceForm.clientName,
        total: parseFloat(newInvoiceForm.amount),
        subtotal: parseFloat(newInvoiceForm.amount),
        tax: 0,
        status: 'draft',
        due_date: dueDate,
        description: newInvoiceForm.description || null,
        invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`
      })

      toast.success('Invoice created successfully!')
      setShowNewInvoiceModal(false)
      setNewInvoiceForm({
        clientEmail: '',
        clientName: '',
        amount: '',
        dueDate: '',
        description: ''
      })
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast.error('Failed to create invoice')
    }
  }, [newInvoiceForm, createInvoice])

  const handleSendInvoiceReminder = useCallback(async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        last_reminder_sent: new Date().toISOString(),
        reminder_count: (invoice as Record<string, unknown>).reminder_count ? (invoice as Record<string, unknown>).reminder_count + 1 : 1
      })
      toast.success("Reminder sent", { description: "Payment reminder sent to " + invoice.client_email })
    } catch (error) {
      console.error('Failed to send reminder:', error)
      toast.error('Failed to send reminder')
    }
  }, [updateInvoice])

  const handlePauseSubscription = useCallback(async (subscription: Subscription) => {
    try {
      await updateSubscription(subscription.id, {
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      toast.success("Subscription paused", { description: subscription.plan_name + " has been paused" })
    } catch (error) {
      console.error('Failed to pause subscription:', error)
      toast.error('Failed to pause subscription')
    }
  }, [updateSubscription])

  const handleResumeSubscription = useCallback(async (subscription: Subscription) => {
    try {
      await updateSubscription(subscription.id, {
        status: 'active',
        paused_at: null
      })
      toast.success("Subscription resumed", { description: subscription.plan_name + " has been resumed" })
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      toast.error('Failed to resume subscription')
    }
  }, [updateSubscription])

  if (error) return <div className="p-8 min-h-screen bg-gray-900"><div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
                <p className="text-indigo-100">Stripe-level billing and revenue management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showInsights ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowInsights(!showInsights)}
                className={`hidden md:flex items-center gap-2 ${showInsights ? 'bg-white text-indigo-600 hover:bg-white/90' : 'text-indigo-100 hover:text-white hover:bg-white/10'}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Smart Insights</span>
              </Button>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Shield className="h-4 w-4" />
                <span className="text-sm">PCI Compliant</span>
              </div>
              <Button onClick={() => setShowNewSubscriptionModal(true)} className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Plus className="h-4 w-4 mr-2" />
                New Subscription
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'MRR', value: formatCurrency(stats.mrr), icon: TrendingUp, color: 'from-green-500 to-emerald-500', subtitle: '+12% this month' },
              { label: 'ARR', value: formatCurrency(stats.arr), icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
              { label: 'Active', value: stats.activeSubscriptions.toString(), icon: Users, color: 'from-indigo-500 to-purple-500' },
              { label: 'Trialing', value: stats.trialing.toString(), icon: Timer, color: 'from-cyan-500 to-blue-500' },
              { label: 'Past Due', value: stats.pastDue.toString(), icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
              { label: 'Open', value: formatCurrency(stats.openAmount), icon: Receipt, color: 'from-orange-500 to-red-500' },
              { label: 'Usage', value: formatCurrency(stats.totalUsage), icon: Zap, color: 'from-purple-500 to-pink-500' },
              { label: 'Coupons', value: stats.activeCoupons.toString(), icon: Tag, color: 'from-pink-500 to-rose-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-indigo-200 text-xs">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && <div className="text-xs text-green-300 mt-1">{stat.subtitle}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
              <AIInsightsPanel
                insights={mockBillingAIInsights}
                className="mb-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            </div>
          )}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-6">
                    {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                      const revenue = [8500, 9200, 10100, 11500, 12800, stats.mrr * 1.1][idx]
                      const max = 15000
                      const height = (revenue / max) * 100
                      return (
                        <div key={month} className="text-center">
                          <div className="h-32 flex items-end justify-center mb-2">
                            <div className={`w-full rounded-t-lg ${idx === 5 ? 'bg-gradient-to-t from-indigo-600 to-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${height}%` }} />
                          </div>
                          <div className="text-xs text-gray-500">{month}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">${(revenue / 1000).toFixed(1)}k</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Churn Rate', value: '2.1%', color: 'text-green-600', trend: 'down' },
                    { label: 'ARPU', value: formatCurrency(stats.mrr / (stats.activeSubscriptions || 1)), color: 'text-blue-600' },
                    { label: 'LTV', value: '$2,847', color: 'text-purple-600' },
                    { label: 'Collection Rate', value: '98.5%', color: 'text-indigo-600' }
                  ].map((metric, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                      <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'payment', message: 'Acme Corp paid $99.00', time: '2 hours ago', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                      { type: 'subscription', message: 'Creative Agency started trial', time: '5 hours ago', icon: RefreshCw, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                      { type: 'invoice', message: 'Invoice #2024-003 sent', time: '1 day ago', icon: Receipt, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600' },
                      { type: 'refund', message: 'Refund $99.00 processed', time: '2 days ago', icon: RotateCcw, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    Plan Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingPlans.filter(p => p.amount > 0).map(plan => (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                        <span className="text-gray-500">{plan.subscribers} subscribers • {formatCurrency(plan.amount * plan.subscribers)}/mo</span>
                      </div>
                      <Progress value={(plan.subscribers / 250) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              {['all', 'active', 'trialing', 'past_due', 'canceled'].map(filter => (
                <Button key={filter} variant={statusFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(filter as string)}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {subscriptions.map(sub => (
                <Card key={sub.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedSubscription(sub)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold">
                            {sub.customer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{sub.customer_name}</h3>
                            <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                            {sub.cancel_at_period_end && <Badge variant="outline" className="text-red-600">Cancels at period end</Badge>}
                          </div>
                          <div className="text-sm text-gray-500">{sub.customer_email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(sub.amount)}</div>
                          <div className="text-xs text-gray-500">per {sub.interval}</div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{sub.plan}</div>
                          <div>Renews {new Date(sub.current_period_end).toLocaleDateString()}</div>
                        </div>
                        {sub.payment_method && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CardIcon className="w-4 h-4" />
                            <span className="capitalize">{sub.payment_method.brand} •••• {sub.payment_method.last4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {sub.trial_end && new Date(sub.trial_end) > new Date() && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Timer className="h-4 w-4" />
                          Trial ends {new Date(sub.trial_end).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Button onClick={() => setShowNewInvoiceModal(true)} disabled={mutatingInvoice}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Invoice</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Due</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="font-medium text-indigo-600">{inv.number}</div>
                            <div className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">{inv.customer_name}</div>
                            <div className="text-xs text-gray-500">{inv.customer_email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(inv.status)}>{inv.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.total)}</div>
                            {inv.amount_remaining > 0 && inv.status !== 'draft' && (
                              <div className="text-xs text-red-600">{formatCurrency(inv.amount_remaining)} due</div>
                            )}
                            {inv.discount && <div className="text-xs text-green-600">-{formatCurrency(inv.discount.amount_off)} discount</div>}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(inv.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(inv)}><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={handleExportBilling}><Download className="w-4 h-4" /></Button>
                              {inv.status === 'open' && (
                                <Button size="sm" variant="outline" onClick={() => handleSendInvoiceReminder(inv)} disabled={mutatingInvoice}>
                                  Send Reminder
                                </Button>
                              )}
                              {inv.status === 'open' && (
                                <Button size="sm" variant="default" onClick={() => handleRetryPayment(inv)} disabled={mutatingInvoice}>
                                  Retry Payment
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  Coupons & Promotions
                </CardTitle>
                <Button onClick={() => setShowNewCouponModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map(coupon => (
                    <div key={coupon.id} className={`p-4 border rounded-xl ${coupon.valid ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-60'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${coupon.type === 'percent_off' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            <Percent className={`h-5 w-5 ${coupon.type === 'percent_off' ? 'text-green-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{coupon.name}</h4>
                            <code className="text-sm text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{coupon.code}</code>
                          </div>
                        </div>
                        <Badge className={coupon.valid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {coupon.valid ? 'Active' : 'Expired'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {coupon.type === 'percent_off' ? `${coupon.value}% off` : formatCurrency(coupon.value)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{coupon.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Redeemed</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {coupon.times_redeemed}{coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ''}
                          </span>
                        </div>
                        {coupon.expires_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expires</span>
                            <span className="font-medium text-gray-900 dark:text-white">{new Date(coupon.expires_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxRates.map(tax => (
                    <div key={tax.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{tax.name}</h4>
                          <p className="text-sm text-gray-500">{tax.jurisdiction} • {tax.country}{tax.state ? `, ${tax.state}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900 dark:text-white">{tax.percentage}%</span>
                        <Badge className={tax.inclusive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                          {tax.inclusive ? 'Inclusive' : 'Exclusive'}
                        </Badge>
                        <Switch checked={tax.active} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-0">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pricing</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.001 <span className="text-sm font-normal">per unit</span></div>
                  <div className="text-sm text-gray-500 mt-1">Metered billing enabled</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{record.customer_name}</div>
                          <div className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{record.quantity.toLocaleString()} units</div>
                        <div className="text-sm text-purple-600">{formatCurrency(record.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="payment" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="invoicing" className="gap-2">
                  <Receipt className="w-4 h-4" />
                  Invoicing
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="taxes" className="gap-2">
                  <Percent className="w-4 h-4" />
                  Taxes
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Payment Settings */}
              <TabsContent value="payment" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                        Payment Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Credit Cards</p>
                          <p className="text-sm text-gray-500">Accept Visa, Mastercard, Amex, Discover</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">ACH Bank Transfers</p>
                          <p className="text-sm text-gray-500">US bank account debits</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">SEPA Direct Debit</p>
                          <p className="text-sm text-gray-500">European bank transfers</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Apple Pay / Google Pay</p>
                          <p className="text-sm text-gray-500">Mobile wallet payments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Wire Transfers</p>
                          <p className="text-sm text-gray-500">For enterprise invoices</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5 text-indigo-600" />
                        Retry Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-retry Failed Payments</p>
                          <p className="text-sm text-gray-500">Automatically retry failed charges</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Retry Schedule</Label>
                        <Select defaultValue="smart">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smart">Smart Retry (Stripe optimized)</SelectItem>
                            <SelectItem value="fixed">Fixed Schedule (1, 3, 5, 7 days)</SelectItem>
                            <SelectItem value="custom">Custom Schedule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Max Retry Attempts</Label>
                        <Select defaultValue="4">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 attempts</SelectItem>
                            <SelectItem value="4">4 attempts</SelectItem>
                            <SelectItem value="6">6 attempts</SelectItem>
                            <SelectItem value="8">8 attempts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Update Card Prompt</p>
                          <p className="text-sm text-gray-500">Prompt customers to update failed cards</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                        Fraud Prevention
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Radar Fraud Detection</p>
                          <p className="text-sm text-gray-500">AI-powered fraud prevention</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">3D Secure Authentication</p>
                          <p className="text-sm text-gray-500">Require 3DS for high-risk transactions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Risk Threshold</Label>
                        <Select defaultValue="balanced">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="permissive">Permissive (fewer blocks)</SelectItem>
                            <SelectItem value="balanced">Balanced (recommended)</SelectItem>
                            <SelectItem value="strict">Strict (more blocks)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">CVC Verification</p>
                          <p className="text-sm text-gray-500">Require CVC for all transactions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Address Verification (AVS)</p>
                          <p className="text-sm text-gray-500">Verify billing address matches</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Customer Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Customer Portal</p>
                          <p className="text-sm text-gray-500">Let customers manage subscriptions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Plan Changes</p>
                          <p className="text-sm text-gray-500">Customers can upgrade/downgrade</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Cancellations</p>
                          <p className="text-sm text-gray-500">Customers can cancel subscriptions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice History Access</p>
                          <p className="text-sm text-gray-500">View and download past invoices</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Portal URL</Label>
                        <div className="flex gap-2">
                          <Input value="https://billing.yourapp.com/portal" readOnly className="flex-1" />
                          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('https://billing.yourapp.com/portal'); toast.success('Portal URL copied to clipboard'); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Invoicing Settings */}
              <TabsContent value="invoicing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        Invoice Defaults
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-finalize Drafts</p>
                          <p className="text-sm text-gray-500">Automatically finalize after 1 hour</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-advance Collection</p>
                          <p className="text-sm text-gray-500">Automatically charge open invoices</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Due</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Due on receipt</SelectItem>
                            <SelectItem value="7">Net 7</SelectItem>
                            <SelectItem value="15">Net 15</SelectItem>
                            <SelectItem value="30">Net 30</SelectItem>
                            <SelectItem value="60">Net 60</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Default Currency</Label>
                        <Select defaultValue="usd">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD - US Dollar</SelectItem>
                            <SelectItem value="eur">EUR - Euro</SelectItem>
                            <SelectItem value="gbp">GBP - British Pound</SelectItem>
                            <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Invoice Numbering
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Invoice Prefix</Label>
                        <Input defaultValue="INV-" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Next Invoice Number</Label>
                        <Input defaultValue="2024-006" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Numbering Format</Label>
                        <Select defaultValue="year-seq">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential (001, 002, 003)</SelectItem>
                            <SelectItem value="year-seq">Year + Sequential (2024-001)</SelectItem>
                            <SelectItem value="date-seq">Date + Sequential (20241223-001)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Reset Yearly</p>
                          <p className="text-sm text-gray-500">Reset sequence number each year</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-indigo-600" />
                        Invoice Branding
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Company Logo</Label>
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                            <Building className="w-8 h-8 text-gray-400" />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowUploadLogoDialog(true)}>Upload Logo</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Primary Color</Label>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 rounded bg-indigo-600 border-2 border-indigo-700" />
                          <Input defaultValue="#4F46E5" className="flex-1" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Invoice Footer</Label>
                        <Input placeholder="Thank you for your business!" defaultValue="Thank you for your business!" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Instructions</Label>
                        <Input placeholder="Additional payment details..." />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-indigo-600" />
                        Email Delivery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email Invoices</p>
                          <p className="text-sm text-gray-500">Send invoices via email automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Attach PDF</p>
                          <p className="text-sm text-gray-500">Include PDF attachment in emails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Reply-To Email</Label>
                        <Input type="email" placeholder="billing@yourcompany.com" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">BCC Email</Label>
                        <Input type="email" placeholder="accounting@yourcompany.com" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        Customer Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Successful</p>
                          <p className="text-sm text-gray-500">Confirm successful payments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Failed</p>
                          <p className="text-sm text-gray-500">Alert when payment fails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice Sent</p>
                          <p className="text-sm text-gray-500">Notify when invoice is created</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Confirmed</p>
                          <p className="text-sm text-gray-500">Welcome email for new subscriptions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Canceled</p>
                          <p className="text-sm text-gray-500">Confirmation of cancellation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Refund Processed</p>
                          <p className="text-sm text-gray-500">Notify when refund is issued</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        Team Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">New Subscription</p>
                          <p className="text-sm text-gray-500">Alert when customer subscribes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Failed (Internal)</p>
                          <p className="text-sm text-gray-500">Alert team on failed payments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Canceled (Internal)</p>
                          <p className="text-sm text-gray-500">Alert team on cancellations</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Large Payment Received</p>
                          <p className="text-sm text-gray-500">Alert on payments over threshold</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Large Payment Threshold</Label>
                        <Input type="number" defaultValue="1000" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Notification Email</Label>
                        <Input type="email" placeholder="finance@yourcompany.com" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-indigo-600" />
                        Dunning & Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Dunning</p>
                          <p className="text-sm text-gray-500">Automated collection reminders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Trial Ending Reminder</p>
                          <p className="text-sm text-gray-500">Remind 3 days before trial ends</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice Due Reminder</p>
                          <p className="text-sm text-gray-500">Remind before invoice is due</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Past Due Reminders</p>
                          <p className="text-sm text-gray-500">Send escalating past due notices</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Dunning Schedule</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gentle">Gentle (3, 7, 14 days)</SelectItem>
                            <SelectItem value="standard">Standard (1, 3, 7, 14 days)</SelectItem>
                            <SelectItem value="aggressive">Aggressive (1, 2, 3, 5 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-indigo-600" />
                        Slack Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-[#4A154B] rounded flex items-center justify-center">
                          <span className="text-white font-bold">#</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Slack Workspace</p>
                          <p className="text-sm text-green-600">Connected to #billing-alerts</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Events</p>
                          <p className="text-sm text-gray-500">Post payment notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Events</p>
                          <p className="text-sm text-gray-500">Post subscription changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Summary</p>
                          <p className="text-sm text-gray-500">Post weekly billing summary</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-indigo-600" />
                        Connected Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'QuickBooks', status: 'connected', icon: '📊', desc: 'Accounting sync' },
                          { name: 'Xero', status: 'not_connected', icon: '📈', desc: 'Accounting integration' },
                          { name: 'Salesforce', status: 'connected', icon: '☁️', desc: 'CRM sync' },
                          { name: 'HubSpot', status: 'not_connected', icon: '🔶', desc: 'CRM & marketing' },
                          { name: 'NetSuite', status: 'not_connected', icon: '📋', desc: 'ERP integration' },
                          { name: 'Slack', status: 'connected', icon: '#', desc: 'Team notifications' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
                                {integration.icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-xs text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            {integration.status === 'connected' ? (
                              <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => { setSelectedIntegration(integration.name); setShowConnectIntegrationDialog(true); }}>Connect</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-indigo-600" />
                        Webhooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {webhooks.map(wh => (
                          <div key={wh.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(wh.status)}>{wh.status}</Badge>
                                <code className="text-sm text-gray-600 dark:text-gray-400 truncate">{wh.url}</code>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {wh.events.length} events • {wh.success_rate}% success rate
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedWebhook(wh)
                              setEditWebhookForm({
                                url: wh.url,
                                description: '',
                                events: wh.events,
                                status: wh.status
                              })
                              setShowEditWebhookDialog(true)
                            }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Endpoint
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-600" />
                        API Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Publishable Key</Label>
                        <div className="flex gap-2">
                          <Input value="pk_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono text-sm" />
                          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('pk_live_xxxxxxxxxxxxxxxxxxxxx'); toast.success('Publishable key copied'); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Secret Key</Label>
                        <div className="flex gap-2">
                          <Input
                            value={secretKeyVisible ? "sk_live_xxxxxxxxxxxxxxxxxxxxx" : "STRIPE_KEY_PLACEHOLDER"}
                            readOnly
                            className="flex-1 font-mono text-sm"
                            type={secretKeyVisible ? "text" : "password"}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSecretKeyVisible(!secretKeyVisible)
                              toast.success(secretKeyVisible ? 'Secret key hidden' : 'Secret key revealed')
                            }}
                          >
                            {secretKeyVisible ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('sk_live_xxxxxxxxxxxxxxxxxxxxx'); toast.success('Secret key copied'); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Warning:</strong> Never share your secret key in public repositories or client-side code.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setShowRotateApiKeysDialog(true)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rotate API Keys
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Taxes Settings */}
              <TabsContent value="taxes" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-indigo-600" />
                        Tax Rates
                      </CardTitle>
                      <Button onClick={() => setShowAddTaxRateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tax Rate
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {taxRates.map(tax => (
                          <div key={tax.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{tax.name}</h4>
                                <p className="text-sm text-gray-500">{tax.jurisdiction} • {tax.country}{tax.state ? `, ${tax.state}` : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-gray-900 dark:text-white">{tax.percentage}%</span>
                              <Badge className={tax.inclusive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                                {tax.inclusive ? 'Inclusive' : 'Exclusive'}
                              </Badge>
                              <Switch checked={tax.active} />
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedTaxRate(tax)
                                setEditTaxRateForm({
                                  name: tax.name,
                                  percentage: tax.percentage.toString(),
                                  country: tax.country.toLowerCase(),
                                  jurisdiction: tax.jurisdiction,
                                  inclusive: tax.inclusive,
                                  active: tax.active
                                })
                                setShowEditTaxRateDialog(true)
                              }}><Edit className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Tax Automation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Automatic Tax Calculation</p>
                          <p className="text-sm text-gray-500">Calculate taxes based on customer location</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Tax ID Validation</p>
                          <p className="text-sm text-gray-500">Validate VAT/GST numbers automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Reverse Charge</p>
                          <p className="text-sm text-gray-500">Apply reverse charge for B2B EU transactions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tax Provider</Label>
                        <Select defaultValue="stripe-tax">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe-tax">Stripe Tax</SelectItem>
                            <SelectItem value="avalara">Avalara</SelectItem>
                            <SelectItem value="taxjar">TaxJar</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-indigo-600" />
                        Business Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Legal Business Name</Label>
                        <Input defaultValue="Your Company Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tax ID / VAT Number</Label>
                        <Input defaultValue="US123456789" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Business Address</Label>
                        <Input defaultValue="123 Business St, San Francisco, CA 94102" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tax Registration Country</Label>
                        <Select defaultValue="us">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="de">Germany</SelectItem>
                            <SelectItem value="fr">France</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-indigo-600" />
                        Test Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">Test Mode Active</p>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          No real charges will be made. Use test card numbers for testing.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Test Mode</p>
                          <p className="text-sm text-gray-500">Use test API keys and data</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Test Card Number</Label>
                        <div className="flex gap-2">
                          <Input value="4242 4242 4242 4242" readOnly className="flex-1 font-mono" />
                          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('4242424242424242'); toast.success('Test card number copied to clipboard'); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600" />
                        Subscription Behavior
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Proration Behavior</Label>
                        <Select defaultValue="create_prorations">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create_prorations">Create prorations</SelectItem>
                            <SelectItem value="none">No prorations</SelectItem>
                            <SelectItem value="always_invoice">Always invoice immediately</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Collection Method</Label>
                        <Select defaultValue="charge_automatically">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="charge_automatically">Charge automatically</SelectItem>
                            <SelectItem value="send_invoice">Send invoice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Pause Collection</p>
                          <p className="text-sm text-gray-500">Allow pausing subscriptions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Grace Period (Days)</Label>
                        <Input type="number" defaultValue="3" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-indigo-600" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Data Retention</Label>
                        <Select defaultValue="7years">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1year">1 year</SelectItem>
                            <SelectItem value="3years">3 years</SelectItem>
                            <SelectItem value="7years">7 years (recommended)</SelectItem>
                            <SelectItem value="indefinite">Indefinite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleExportBilling}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All Billing Data
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowGenerateTaxReportDialog(true)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Tax Report
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowAuditLogDialog(true)}>
                        <History className="h-4 w-4 mr-2" />
                        View Audit Log
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertOctagon className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowConfirmCancelAllDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel All Subscriptions
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowConfirmDeleteTestDataDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Test Data
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowConfirmDisableBillingDialog(true)}>
                        <Lock className="h-4 w-4 mr-2" />
                        Disable Billing Module
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockBillingAIInsights}
              title="Billing Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockBillingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockBillingPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockBillingActivities}
            title="Billing Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={billingQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* New Subscription Modal */}
      <Dialog open={showNewSubscriptionModal} onOpenChange={setShowNewSubscriptionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Create Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Email</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newSubscriptionForm.customerEmail}
                onChange={(e) => setNewSubscriptionForm(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
              <select
                value={newSubscriptionForm.planId}
                onChange={(e) => setNewSubscriptionForm(prev => ({ ...prev, planId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">Select a plan...</option>
                {pricingPlans.filter(p => p.is_active && p.amount > 0).map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name} ({formatCurrency(plan.amount)}/{plan.interval})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trial Period</label>
              <select
                value={newSubscriptionForm.trialDays}
                onChange={(e) => setNewSubscriptionForm(prev => ({ ...prev, trialDays: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="0">No trial</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code (optional)</label>
              <Input
                placeholder="WELCOME10"
                value={newSubscriptionForm.couponCode}
                onChange={(e) => setNewSubscriptionForm(prev => ({ ...prev, couponCode: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSubscriptionModal(false)}>Cancel</Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={creatingSubscription || !newSubscriptionForm.customerEmail || !newSubscriptionForm.planId}
              className="bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              {creatingSubscription ? 'Creating...' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Coupon Modal */}
      <Dialog open={showNewCouponModal} onOpenChange={setShowNewCouponModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Tag className="h-5 w-5 text-white" />
              </div>
              Create Coupon
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Name</label>
              <Input
                placeholder="Summer Sale"
                value={newCouponForm.name}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
              <Input
                placeholder="SUMMER25"
                className="uppercase"
                value={newCouponForm.code}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                <select
                  value={newCouponForm.discountType}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, discountType: e.target.value as 'percent_off' | 'amount_off' }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="percent_off">Percentage</option>
                  <option value="amount_off">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={newCouponForm.value}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <select
                value={newCouponForm.duration}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, duration: e.target.value as 'once' | 'repeating' | 'forever' }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="once">Once</option>
                <option value="repeating">Multiple months</option>
                <option value="forever">Forever</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Redemptions (optional)</label>
              <Input
                type="number"
                placeholder="100"
                value={newCouponForm.maxRedemptions}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCouponModal(false)}>Cancel</Button>
            <Button
              onClick={handleCreateCoupon}
              disabled={creatingCoupon || !newCouponForm.name || !newCouponForm.code || !newCouponForm.value}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {creatingCoupon ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Invoice Modal */}
      <Dialog open={showNewInvoiceModal} onOpenChange={setShowNewInvoiceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              Create Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Email *</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={newInvoiceForm.clientEmail}
                onChange={(e) => setNewInvoiceForm(prev => ({ ...prev, clientEmail: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
              <Input
                placeholder="Acme Corp"
                value={newInvoiceForm.clientName}
                onChange={(e) => setNewInvoiceForm(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (USD) *</label>
                <Input
                  type="number"
                  placeholder="99.00"
                  value={newInvoiceForm.amount}
                  onChange={(e) => setNewInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newInvoiceForm.dueDate}
                  onChange={(e) => setNewInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <Input
                placeholder="Invoice for services..."
                value={newInvoiceForm.description}
                onChange={(e) => setNewInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewInvoiceModal(false)}>Cancel</Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={mutatingInvoice || !newInvoiceForm.clientEmail || !newInvoiceForm.amount}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {mutatingInvoice ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
              Process Refund
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID *</label>
              <Input
                placeholder="txn_1234567890"
                value={refundForm.transactionId}
                onChange={(e) => setRefundForm(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Amount (USD) *</label>
              <Input
                type="number"
                placeholder="99.00"
                value={refundForm.amount}
                onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
              <select
                value={refundForm.reason}
                onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value as typeof refundForm.reason }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="requested_by_customer">Requested by customer</option>
                <option value="duplicate">Duplicate charge</option>
                <option value="fraudulent">Fraudulent</option>
                <option value="expired_uncaptured_charge">Expired uncaptured charge</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!refundForm.transactionId || !refundForm.amount) return

                toast.loading('Processing refund...', { id: 'process-refund' })
                try {
                  // Create refund record in database
                  await createRefund({
                    transaction_id: refundForm.transactionId,
                    amount: parseFloat(refundForm.amount),
                    currency: 'USD',
                    status: 'pending',
                    reason: refundForm.reason,
                    notes: `Refund for transaction ${refundForm.transactionId}`
                  })

                  // Call refund API
                  const response = await fetch('/api/payments/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      transactionId: refundForm.transactionId,
                      amount: parseFloat(refundForm.amount),
                      reason: refundForm.reason
                    })
                  })

                  if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || 'Refund failed')
                  }

                  toast.success(`Refund of $${refundForm.amount} initiated for ${refundForm.transactionId}`, { id: 'process-refund' })
                  setShowRefundDialog(false)
                  setRefundForm({ transactionId: '', amount: '', reason: 'requested_by_customer' })
                  refetchTransactions()
                } catch (error) {
                  console.error('Refund failed:', error)
                  toast.error('Failed to process refund', { id: 'process-refund' })
                }
              }}
              disabled={!refundForm.transactionId || !refundForm.amount || creatingRefund}
              className="bg-gradient-to-r from-orange-600 to-red-600"
            >
              {creatingRefund ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold">
                    {selectedSubscription.customer_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{selectedSubscription.customer_name}</div>
                  <div className="text-sm text-gray-500">{selectedSubscription.customer_email}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-medium">{selectedSubscription.plan}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge className={getStatusColor(selectedSubscription.status)}>{selectedSubscription.status}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="font-medium">{formatCurrency(selectedSubscription.amount)}/{selectedSubscription.interval}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Renewal</span>
                <span className="font-medium">{new Date(selectedSubscription.current_period_end).toLocaleDateString()}</span>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {selectedSubscription.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handlePauseSubscription(selectedSubscription)}
                    disabled={updatingSubscription}
                  >
                    Pause Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelSubscription(selectedSubscription)}
                    disabled={updatingSubscription}
                  >
                    {updatingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                </>
              )}
              {selectedSubscription.status === 'paused' && (
                <Button
                  onClick={() => handleResumeSubscription(selectedSubscription)}
                  disabled={updatingSubscription}
                >
                  Resume Subscription
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedSubscription(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Invoice {selectedInvoice.number}</div>
                  <div className="text-sm text-gray-500">{selectedInvoice.customer_name}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedInvoice.total)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500">Created</span>
                  <div className="mt-1 font-medium text-gray-900 dark:text-white">
                    {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <div className="mt-1 font-medium text-gray-900 dark:text-white">
                    {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Bill To</h4>
                <div className="font-medium text-gray-900 dark:text-white">{selectedInvoice.customer_name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.customer_email}</div>
              </div>

              {/* Line Items */}
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Qty</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.line_items.map((item, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-700">
                          <td className="py-2 px-4 text-gray-900 dark:text-white">{item.description}</td>
                          <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="py-2 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                )}
                {selectedInvoice.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedInvoice.discount.amount_off)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                {selectedInvoice.amount_remaining > 0 && selectedInvoice.status !== 'paid' && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Amount Due</span>
                    <span>{formatCurrency(selectedInvoice.amount_remaining)}</span>
                  </div>
                )}
              </div>

              {selectedInvoice.paid_at && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Paid on {new Date(selectedInvoice.paid_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-wrap gap-2">
              {selectedInvoice.status === 'open' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSendInvoiceReminder(selectedInvoice)}
                    disabled={mutatingInvoice}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    onClick={() => {
                      handleRetryPayment(selectedInvoice)
                      setSelectedInvoice(null)
                    }}
                    disabled={mutatingInvoice}
                  >
                    Retry Payment
                  </Button>
                </>
              )}
              {selectedInvoice.hosted_invoice_url && (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(selectedInvoice.hosted_invoice_url, '_blank')
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Online
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Generate proper invoice PDF
                  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${selectedInvoice.number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company { font-size: 24px; font-weight: bold; color: #4F46E5; }
    .invoice-title { font-size: 32px; color: #111; }
    .invoice-number { color: #666; margin-top: 5px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; width: 48%; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 14px; color: #111; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #111; padding-top: 12px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-open { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">KAZI</div>
      <div style="color: #666; font-size: 14px;">Billing & Subscriptions</div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${selectedInvoice.number}</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <div class="info-label">Bill To</div>
      <div class="info-value" style="font-weight: bold;">${selectedInvoice.customer_name}</div>
      <div class="info-value">${selectedInvoice.customer_email}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Invoice Details</div>
      <div class="info-value"><strong>Date:</strong> ${new Date(selectedInvoice.created_at).toLocaleDateString()}</div>
      <div class="info-value"><strong>Due:</strong> ${new Date(selectedInvoice.due_date).toLocaleDateString()}</div>
      <div class="info-value" style="margin-top: 10px;">
        <span class="status ${selectedInvoice.status === 'paid' ? 'status-paid' : 'status-open'}">${selectedInvoice.status.toUpperCase()}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${selectedInvoice.line_items?.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">$${(item.unit_amount || item.amount / item.quantity).toFixed(2)}</td>
          <td class="text-right">$${item.amount.toFixed(2)}</td>
        </tr>
      `).join('') || `
        <tr>
          <td>Services</td>
          <td class="text-right">1</td>
          <td class="text-right">$${selectedInvoice.subtotal.toFixed(2)}</td>
          <td class="text-right">$${selectedInvoice.subtotal.toFixed(2)}</td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>$${selectedInvoice.subtotal.toFixed(2)}</span>
    </div>
    ${selectedInvoice.tax > 0 ? `
    <div class="totals-row">
      <span>Tax</span>
      <span>$${selectedInvoice.tax.toFixed(2)}</span>
    </div>
    ` : ''}
    ${selectedInvoice.discount ? `
    <div class="totals-row" style="color: #059669;">
      <span>Discount</span>
      <span>-$${selectedInvoice.discount.amount_off.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="totals-row total">
      <span>Total</span>
      <span>$${selectedInvoice.total.toFixed(2)}</span>
    </div>
    ${selectedInvoice.amount_remaining > 0 && selectedInvoice.status !== 'paid' ? `
    <div class="totals-row" style="color: #dc2626;">
      <span>Amount Due</span>
      <span>$${selectedInvoice.amount_remaining.toFixed(2)}</span>
    </div>
    ` : ''}
  </div>

  ${selectedInvoice.paid_at ? `
  <div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin-top: 20px; color: #065f46;">
    <strong>Paid on ${new Date(selectedInvoice.paid_at).toLocaleDateString()}</strong>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>For questions about this invoice, please contact billing@kazi.app</p>
  </div>
</body>
</html>`.trim()

                  // Create a blob and download
                  const blob = new Blob([invoiceHtml], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)

                  // Open in new window for printing/saving as PDF
                  const printWindow = window.open(url, '_blank')
                  if (printWindow) {
                    printWindow.onload = () => {
                      printWindow.print()
                    }
                  }

                  toast.success(`Invoice ${selectedInvoice.number} ready for download`)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Logo Dialog */}
      <Dialog open={showUploadLogoDialog} onOpenChange={setShowUploadLogoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
              Upload Company Logo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop your logo here, or click to browse</p>
              <p className="text-xs text-gray-500">PNG, JPG, or SVG. Max 2MB. Recommended: 200x200px</p>
            </div>
            <Input type="file" accept="image/*" className="cursor-pointer" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadLogoDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading('Uploading logo...', { id: 'upload-logo' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'upload_logo' })
                })
                if (!response.ok) throw new Error('Upload failed')
                toast.success('Logo uploaded successfully', { id: 'upload-logo' })
                setShowUploadLogoDialog(false)
              } catch { toast.error('Upload failed', { id: 'upload-logo' }) }
            }}>Upload Logo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Webhook className="h-5 w-5 text-white" />
              </div>
              Add Webhook Endpoint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Endpoint URL *</Label>
              <Input placeholder="https://your-domain.com/webhooks/billing" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Input placeholder="Billing webhook for production" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Events to Listen</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {['invoice.paid', 'invoice.payment_failed', 'subscription.created', 'subscription.updated', 'subscription.deleted', 'customer.created'].map(event => (
                  <label key={event} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked={event.includes('invoice')} />
                    <span className="text-gray-600 dark:text-gray-400">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading('Creating webhook endpoint...', { id: 'create-webhook' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'create_webhook' })
                })
                if (!response.ok) throw new Error('Failed to create endpoint')
                toast.success('Webhook endpoint created', { id: 'create-webhook' })
                setShowAddWebhookDialog(false)
              } catch { toast.error('Failed to create endpoint', { id: 'create-webhook' }) }
            }}>Create Endpoint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tax Rate Dialog */}
      <Dialog open={showAddTaxRateDialog} onOpenChange={setShowAddTaxRateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Percent className="h-5 w-5 text-white" />
              </div>
              Add Tax Rate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Tax Name *</Label>
              <Input placeholder="e.g., State Sales Tax" className="mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm font-medium">Percentage *</Label>
                <Input type="number" placeholder="8.25" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Country</Label>
                <Select defaultValue="us">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Jurisdiction</Label>
              <Input placeholder="e.g., California" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Tax Inclusive</p>
                <p className="text-sm text-gray-500">Include tax in displayed prices</p>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaxRateDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading('Creating tax rate...', { id: 'create-tax' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'create_tax_rate' })
                })
                if (!response.ok) throw new Error('Failed to create tax rate')
                toast.success('Tax rate created successfully', { id: 'create-tax' })
                setShowAddTaxRateDialog(false)
              } catch { toast.error('Failed to create tax rate', { id: 'create-tax' }) }
            }}>Create Tax Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Integration Dialog */}
      <Dialog open={showConnectIntegrationDialog} onOpenChange={setShowConnectIntegrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              Connect {selectedIntegration}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Connect your {selectedIntegration} account to sync billing data automatically.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">What will be synced:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>- Customer information</li>
                <li>- Invoice and payment data</li>
                <li>- Subscription details</li>
                <li>- Revenue metrics</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectIntegrationDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading("Connecting to " + selectedIntegration + "...", { id: 'connect-int' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'connect_integration', integration: selectedIntegration })
                })
                if (!response.ok) throw new Error('Failed to connect')
                toast.success(selectedIntegration + " connected successfully", { id: 'connect-int' })
                setShowConnectIntegrationDialog(false)
              } catch { toast.error('Failed to connect', { id: 'connect-int' }) }
            }}>
              Connect {selectedIntegration}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLogDialog} onOpenChange={setShowAuditLogDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg">
                <History className="h-5 w-5 text-white" />
              </div>
              Billing Audit Log
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {[
              { action: 'Subscription created', user: 'System', target: 'Acme Corp - Pro Monthly', time: '2 hours ago' },
              { action: 'Payment processed', user: 'System', target: 'Invoice #2024-001 - $99.00', time: '3 hours ago' },
              { action: 'Coupon applied', user: 'Admin', target: 'WELCOME10 to Creative Agency', time: '5 hours ago' },
              { action: 'Tax rate updated', user: 'Admin', target: 'US Sales Tax - 8.25%', time: '1 day ago' },
              { action: 'Webhook endpoint added', user: 'Admin', target: 'api.yourapp.com/webhooks', time: '2 days ago' },
              { action: 'Subscription canceled', user: 'Customer', target: 'Global Industries - Enterprise', time: '3 days ago' },
              { action: 'Refund processed', user: 'Admin', target: '$99.00 for TXN-12345', time: '5 days ago' },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{log.user}</p>
                  <p className="text-xs text-gray-400">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={async () => {
              toast.loading('Exporting audit log...', { id: 'export-log' })
              try {
                const response = await fetch('/api/billing-settings?action=export_audit_log')
                if (!response.ok) throw new Error('Export failed')
                toast.success('Audit log exported', { id: 'export-log' })
              } catch { toast.error('Export failed', { id: 'export-log' }) }
            }}>Export Log</Button>
            <Button variant="outline" onClick={() => setShowAuditLogDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel All Subscriptions Dialog */}
      <Dialog open={showConfirmCancelAllDialog} onOpenChange={setShowConfirmCancelAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertOctagon className="h-5 w-5 text-red-600" />
              </div>
              Cancel All Subscriptions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will cancel all active subscriptions immediately. This action cannot be undone.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel all {stats.activeSubscriptions} active subscriptions?
            </p>
            <div>
              <Label className="text-sm font-medium">Type CANCEL to confirm</Label>
              <Input placeholder="CANCEL" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmCancelAllDialog(false)}>Go Back</Button>
            <Button variant="destructive" onClick={async () => {
              toast.loading('Canceling all subscriptions...', { id: 'cancel-all' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'cancel_all_subscriptions' })
                })
                if (!response.ok) throw new Error('Failed to cancel subscriptions')
                toast.warning('All subscriptions have been canceled', { id: 'cancel-all' })
                setShowConfirmCancelAllDialog(false)
              } catch { toast.error('Failed to cancel subscriptions', { id: 'cancel-all' }) }
            }}>
              Cancel All Subscriptions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Test Data Dialog */}
      <Dialog open={showConfirmDeleteTestDataDialog} onOpenChange={setShowConfirmDeleteTestDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete All Test Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will permanently delete all test mode data including test subscriptions, invoices, and customers.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. All test data will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteTestDataDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              toast.loading('Deleting test data...', { id: 'delete-test' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'delete_test_data' })
                })
                if (!response.ok) throw new Error('Failed to delete test data')
                toast.success('Test data deleted successfully', { id: 'delete-test' })
                setShowConfirmDeleteTestDataDialog(false)
              } catch { toast.error('Failed to delete test data', { id: 'delete-test' }) }
            }}>
              Delete Test Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Disable Billing Dialog */}
      <Dialog open={showConfirmDisableBillingDialog} onOpenChange={setShowConfirmDisableBillingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              Disable Billing Module
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> Disabling the billing module will stop all recurring charges and prevent new subscriptions.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Current subscriptions will remain active until their next billing period. No new charges will be processed.
            </p>
            <div>
              <Label className="text-sm font-medium">Type DISABLE to confirm</Label>
              <Input placeholder="DISABLE" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDisableBillingDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              toast.loading('Disabling billing module...', { id: 'disable-billing' })
              try {
                const response = await fetch('/api/billing-settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'disable_billing' })
                })
                if (!response.ok) throw new Error('Failed to disable billing')
                toast.warning('Billing module has been disabled', { id: 'disable-billing' })
                setShowConfirmDisableBillingDialog(false)
              } catch { toast.error('Failed to disable billing', { id: 'disable-billing' }) }
            }}>
              Disable Billing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={showEditWebhookDialog} onOpenChange={setShowEditWebhookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Webhook className="h-5 w-5 text-white" />
              </div>
              Edit Webhook Endpoint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Endpoint URL *</Label>
              <Input
                placeholder="https://your-domain.com/webhooks/billing"
                className="mt-1"
                value={editWebhookForm.url}
                onChange={(e) => setEditWebhookForm(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Input
                placeholder="Billing webhook for production"
                className="mt-1"
                value={editWebhookForm.description}
                onChange={(e) => setEditWebhookForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={editWebhookForm.status}
                onValueChange={(value: 'enabled' | 'disabled') => setEditWebhookForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Events to Listen</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {['invoice.paid', 'invoice.payment_failed', 'subscription.created', 'subscription.updated', 'subscription.deleted', 'customer.created'].map(event => (
                  <label key={event} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={editWebhookForm.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditWebhookForm(prev => ({ ...prev, events: [...prev.events, event] }))
                        } else {
                          setEditWebhookForm(prev => ({ ...prev, events: prev.events.filter(ev => ev !== event) }))
                        }
                      }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedWebhook && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Webhook ID</span>
                  <code className="text-gray-700 dark:text-gray-300">{selectedWebhook.id}</code>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Success Rate</span>
                  <span className="text-green-600">{selectedWebhook.success_rate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Last Delivery</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedWebhook.last_delivery ? new Date(selectedWebhook.last_delivery).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditWebhookDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!selectedWebhook || !editWebhookForm.url) return

                toast.loading('Updating webhook endpoint...', { id: 'update-webhook' })
                try {
                  const response = await fetch('/api/billing-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'update_webhook',
                      webhookId: selectedWebhook.id,
                      url: editWebhookForm.url,
                      description: editWebhookForm.description,
                      events: editWebhookForm.events,
                      status: editWebhookForm.status
                    })
                  })
                  if (!response.ok) throw new Error('Failed to update webhook')

                  toast.success('Webhook endpoint updated successfully', { id: 'update-webhook' })
                  setShowEditWebhookDialog(false)
                  setSelectedWebhook(null)
                  refreshWebhooks?.()
                } catch (error) {
                  console.error('Failed to update webhook:', error)
                  toast.error('Failed to update webhook', { id: 'update-webhook' })
                }
              }}
              disabled={!editWebhookForm.url}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tax Rate Dialog */}
      <Dialog open={showEditTaxRateDialog} onOpenChange={setShowEditTaxRateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Percent className="h-5 w-5 text-white" />
              </div>
              Edit Tax Rate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Tax Name *</Label>
              <Input
                placeholder="e.g., State Sales Tax"
                className="mt-1"
                value={editTaxRateForm.name}
                onChange={(e) => setEditTaxRateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm font-medium">Percentage *</Label>
                <Input
                  type="number"
                  placeholder="8.25"
                  className="mt-1"
                  value={editTaxRateForm.percentage}
                  onChange={(e) => setEditTaxRateForm(prev => ({ ...prev, percentage: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Country</Label>
                <Select
                  value={editTaxRateForm.country}
                  onValueChange={(value) => setEditTaxRateForm(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Jurisdiction</Label>
              <Input
                placeholder="e.g., California"
                className="mt-1"
                value={editTaxRateForm.jurisdiction}
                onChange={(e) => setEditTaxRateForm(prev => ({ ...prev, jurisdiction: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Tax Inclusive</p>
                <p className="text-sm text-gray-500">Include tax in displayed prices</p>
              </div>
              <Switch
                checked={editTaxRateForm.inclusive}
                onCheckedChange={(checked) => setEditTaxRateForm(prev => ({ ...prev, inclusive: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Active</p>
                <p className="text-sm text-gray-500">Apply this tax rate to transactions</p>
              </div>
              <Switch
                checked={editTaxRateForm.active}
                onCheckedChange={(checked) => setEditTaxRateForm(prev => ({ ...prev, active: checked }))}
              />
            </div>
            {selectedTaxRate && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax Rate ID</span>
                  <code className="text-gray-700 dark:text-gray-300">{selectedTaxRate.id}</code>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={async () => {
                if (!selectedTaxRate) return

                toast.loading('Deleting tax rate...', { id: 'delete-tax' })
                try {
                  const response = await fetch('/api/billing-settings', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'delete_tax_rate',
                      taxRateId: selectedTaxRate.id
                    })
                  })
                  if (!response.ok) throw new Error('Failed to delete tax rate')

                  toast.success('Tax rate deleted', { id: 'delete-tax' })
                  setShowEditTaxRateDialog(false)
                  setSelectedTaxRate(null)
                  refreshTaxRates?.()
                } catch (error) {
                  console.error('Failed to delete tax rate:', error)
                  toast.error('Failed to delete tax rate', { id: 'delete-tax' })
                }
              }}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowEditTaxRateDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!selectedTaxRate || !editTaxRateForm.name || !editTaxRateForm.percentage) return

                toast.loading('Updating tax rate...', { id: 'update-tax' })
                try {
                  const response = await fetch('/api/billing-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'update_tax_rate',
                      taxRateId: selectedTaxRate.id,
                      name: editTaxRateForm.name,
                      percentage: parseFloat(editTaxRateForm.percentage),
                      country: editTaxRateForm.country,
                      jurisdiction: editTaxRateForm.jurisdiction,
                      inclusive: editTaxRateForm.inclusive,
                      active: editTaxRateForm.active
                    })
                  })
                  if (!response.ok) throw new Error('Failed to update tax rate')

                  toast.success('Tax rate updated successfully', { id: 'update-tax' })
                  setShowEditTaxRateDialog(false)
                  setSelectedTaxRate(null)
                  refreshTaxRates?.()
                } catch (error) {
                  console.error('Failed to update tax rate:', error)
                  toast.error('Failed to update tax rate', { id: 'update-tax' })
                }
              }}
              disabled={!editTaxRateForm.name || !editTaxRateForm.percentage}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate API Keys Dialog */}
      <Dialog open={showRotateApiKeysDialog} onOpenChange={setShowRotateApiKeysDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              Rotate API Keys
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</p>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Rotating your API keys will invalidate your current keys. You will need to update all applications using the current keys.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-medium text-indigo-600">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New keys will be generated</p>
                  <p className="text-sm text-gray-500">Fresh API keys will be created immediately</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-medium text-indigo-600">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Current keys will be revoked</p>
                  <p className="text-sm text-gray-500">Existing keys will stop working after 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-medium text-indigo-600">3</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Update your applications</p>
                  <p className="text-sm text-gray-500">Replace old keys with new ones in all your apps</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRotateApiKeysDialog(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-orange-600 to-amber-600"
              onClick={async () => {
                toast.info('Rotating API keys...')
                try {
                  const response = await fetch('/api/billing-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'rotate_api_keys' })
                  })
                  if (!response.ok) throw new Error('Failed to rotate API keys')
                  toast.success('API keys rotated successfully. Check your email for the new keys.')
                  setShowRotateApiKeysDialog(false)
                } catch {
                  toast.error('Failed to rotate API keys')
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotate Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Tax Report Dialog */}
      <Dialog open={showGenerateTaxReportDialog} onOpenChange={setShowGenerateTaxReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Generate Tax Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={taxReportForm.startDate}
                  onChange={(e) => setTaxReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={taxReportForm.endDate}
                  onChange={(e) => setTaxReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Report Format</Label>
              <Select
                value={taxReportForm.format}
                onValueChange={(value: 'csv' | 'pdf' | 'json') => setTaxReportForm(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="pdf">PDF (Document)</SelectItem>
                  <SelectItem value="json">JSON (Data Export)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Include Transaction Details</p>
                <p className="text-sm text-gray-500">Add line-item breakdown for each transaction</p>
              </div>
              <Switch
                checked={taxReportForm.includeDetails}
                onCheckedChange={(checked) => setTaxReportForm(prev => ({ ...prev, includeDetails: checked }))}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Contents:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Tax collected by jurisdiction
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Taxable vs non-taxable revenue
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Tax remittance summary
                </li>
                {taxReportForm.includeDetails && (
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Individual transaction details
                  </li>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateTaxReportDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                toast.info('Generating tax report...')
                try {
                  const response = await fetch('/api/billing-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'generate_tax_report',
                      startDate: taxReportForm.startDate,
                      endDate: taxReportForm.endDate,
                      format: taxReportForm.format,
                      includeDetails: taxReportForm.includeDetails
                    })
                  })
                  if (!response.ok) throw new Error('Failed to generate report')
                  const reportData = await response.json()

                  if (taxReportForm.format === 'json') {
                    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `tax-report-${reportData.period?.start || 'start'}-to-${reportData.period?.end || 'end'}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  } else if (taxReportForm.format === 'csv') {
                    const jurisdictions = reportData.summary?.jurisdictions || []
                    const csv = [
                      'Jurisdiction,Tax Rate,Tax Collected',
                      ...jurisdictions.map((j: { name: string; rate: number; collected: number }) => `${j.name},${j.rate}%,$${j.collected}`)
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `tax-report-${reportData.period?.start || 'start'}-to-${reportData.period?.end || 'end'}.csv`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }

                  toast.success('Tax report generated and downloaded')
                  setShowGenerateTaxReportDialog(false)
                  setTaxReportForm({
                    startDate: '',
                    endDate: '',
                    format: 'csv',
                    includeDetails: true
                  })
                } catch {
                  toast.error('Failed to generate tax report')
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
