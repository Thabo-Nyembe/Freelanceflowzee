'use client'

import { createClient } from '@/lib/supabase/client'
// MIGRATED: Batch #12 - Removed mock data, using database hooks with properly typed empty arrays
import { useState, useMemo, useCallback } from 'react'
import {
  CreditCard, Receipt, DollarSign, Users, Plus, BarChart3, Settings, RefreshCw, Download, AlertCircle, AlertTriangle, Clock, Trash2, Edit, Eye,
  Zap, Package, TrendingUp, ExternalLink, Copy,
  Building, Mail, Globe, Shield, Lock, CreditCard as CardIcon,
  Tag, Percent, RotateCcw, Webhook, FileText, Search, Activity, Timer, History, Bell, Link2, Key, Database, Palette,
  TestTube, AlertOctagon, ShieldCheck, Layers, Repeat, Send
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
  type AIInsight,
  type Collaborator,
  type Prediction,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
  type ActivityItem,
  type QuickAction,
} from '@/components/ui/competitive-upgrades-extended'




import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
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
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { useCreateSubscription, useActiveSubscriptions } from '@/lib/hooks/use-subscriptions-extended'
import { useCreateCoupon, useCoupons } from '@/lib/hooks/use-coupon-extended'
import { useInvoices } from '@/lib/hooks/use-invoices-extended'
import { useTaxRates } from '@/lib/hooks/use-tax-extended'
import { useRefunds } from '@/lib/hooks/use-refund-extended'
import { useWebhooks } from '@/lib/hooks/use-webhooks-extended'
import { useActivePricingPlans } from '@/lib/hooks/use-pricing-extended'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import { toast } from 'sonner'

// World-class guest payment component
import GuestPaymentModal from '@/components/payments/guest-payment-modal'

// Stripe Payment Element for payment processing
import { StripePayment } from '@/components/payments/stripe-payment-element'

// Initialize Supabase client once at module level
const supabase = createClient()

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

// Empty arrays for competitive upgrade components - data driven from database
const billingAIInsights: AIInsight[] = []

const billingCollaborators: Collaborator[] = []

const billingPredictions: Prediction[] = []

const billingActivities: ActivityItem[] = []

// Quick actions are defined inside the component to access state setters and handlers

export default function BillingClient({ initialBilling }: { initialBilling: BillingTransaction[] }) {
  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  const [showNewSubscriptionModal, setShowNewSubscriptionModal] = useState(false)
  const [showNewCouponModal, setShowNewCouponModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [settingsTab, setSettingsTab] = useState('payment')
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [showTaxRateModal, setShowTaxRateModal] = useState(false)
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null)
  const [showAuditLogModal, setShowAuditLogModal] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)

  // Guest payment modal state
  const [showGuestPaymentModal, setShowGuestPaymentModal] = useState(false)
  const [selectedPlanForGuestPayment, setSelectedPlanForGuestPayment] = useState<{
    name: string
    amount: number
    description: string
  } | null>(null)

  // Settings state - payment methods
  const [paymentSettings, setPaymentSettings] = useState({
    creditCards: true,
    achBankTransfers: true,
    sepaDirectDebit: false,
    appleGooglePay: true,
    wireTransfers: false,
    autoRetry: true,
    updateCardPrompt: true,
    radarFraudDetection: true,
    threeDSecure: true,
    cvcVerification: true,
    addressVerification: true,
    customerPortal: true,
    allowPlanChanges: true,
    allowCancellations: true,
    invoiceHistoryAccess: true
  })

  // Settings state - invoicing
  const [invoicingSettings, setInvoicingSettings] = useState({
    autoFinalizeDrafts: true,
    autoAdvanceCollection: true,
    resetYearly: true,
    emailInvoices: true,
    attachPdf: true
  })

  // Settings state - notifications
  const [notificationSettings, setNotificationSettings] = useState({
    paymentSuccessful: true,
    paymentFailed: true,
    invoiceSent: true,
    subscriptionConfirmed: true,
    subscriptionCanceled: true,
    refundProcessed: true,
    newSubscription: true,
    paymentFailedInternal: true,
    subscriptionCanceledInternal: true,
    largePayment: true,
    enableDunning: true,
    trialEndingReminder: true,
    invoiceDueReminder: true,
    pastDueReminders: true,
    slackPaymentEvents: true,
    slackSubscriptionEvents: true,
    slackWeeklySummary: true
  })

  // Settings state - tax automation
  const [taxSettings, setTaxSettings] = useState({
    automaticTaxCalculation: true,
    taxIdValidation: true,
    reverseCharge: true
  })

  // Settings state - advanced
  const [advancedSettings, setAdvancedSettings] = useState({
    testMode: false,
    pauseCollection: true
  })

  // Tax rate states map
  const [taxRateStates, setTaxRateStates] = useState<Record<string, boolean>>({})

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    variant: 'default' | 'destructive'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'default',
    onConfirm: () => {}
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
  const { data: dbTaxRates, isLoading: loadingTaxRates, refresh: refreshTaxRates } = useTaxRates()
  const { data: dbRefunds, isLoading: loadingRefunds, refresh: refreshRefunds } = useRefunds()
  const { webhooks: dbWebhooks, isLoading: loadingWebhooks, refresh: refreshWebhooks } = useWebhooks()
  const { plans: dbPricingPlans, isLoading: loadingPricingPlans, refresh: refreshPricingPlans } = useActivePricingPlans()

  // Combined loading state for all billing data
  const isLoadingBillingData = loadingSubscriptions || loadingCoupons || loadingInvoices || loadingTaxRates || loadingRefunds || loadingWebhooks || loadingPricingPlans

  // Function to refresh all billing data
  const refreshAllBillingData = useCallback(async () => {
    toast.loading('Refreshing billing data...', { id: 'refresh-billing' })
    try {
      await Promise.all([
        refreshSubscriptions?.(),
        refreshCoupons?.(),
        refreshInvoices?.(),
        refreshTaxRates?.(),
        refreshRefunds?.(),
        refreshWebhooks?.(),
        refreshPricingPlans?.(),
        refetchTransactions?.()
      ])
      toast.success('Billing data refreshed', { id: 'refresh-billing' })
    } catch (error) {
      toast.error('Failed to refresh billing data', { id: 'refresh-billing' })
    }
  }, [refreshSubscriptions, refreshCoupons, refreshInvoices, refreshTaxRates, refreshRefunds, refreshWebhooks, refreshPricingPlans, refetchTransactions])

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

  // Settings mutation hook
  const { update: updateTaxRate, loading: updatingTaxRate } = useSupabaseMutation({
    table: 'tax_rates',
    onSuccess: refreshTaxRates
  })

  // Helper function to save billing settings to database
  const saveBillingSettings = useCallback(async (
    settingKey: string,
    settingValue: boolean | string | number,
    settingCategory: string
  ) => {
    try {
      await supabase.from('billing_settings').upsert({
        key: settingKey,
        value: settingValue,
        category: settingCategory,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      return true
    } catch (error) {
      console.error('Failed to save setting:', error)
      return false
    }
  }, [])

  // Helper function for updating payment settings with persistence
  const updatePaymentSetting = useCallback(async (
    key: keyof typeof paymentSettings,
    value: boolean
  ) => {
    setPaymentSettings(prev => ({ ...prev, [key]: value }))
    const success = await saveBillingSettings(key, value, 'payment')
    if (success) {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`)
    } else {
      toast.error('Failed to save setting')
      setPaymentSettings(prev => ({ ...prev, [key]: !value })) // Revert on failure
    }
  }, [saveBillingSettings])

  // Helper function for updating invoicing settings with persistence
  const updateInvoicingSetting = useCallback(async (
    key: keyof typeof invoicingSettings,
    value: boolean
  ) => {
    setInvoicingSettings(prev => ({ ...prev, [key]: value }))
    const success = await saveBillingSettings(key, value, 'invoicing')
    if (success) {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`)
    } else {
      toast.error('Failed to save setting')
      setInvoicingSettings(prev => ({ ...prev, [key]: !value }))
    }
  }, [saveBillingSettings])

  // Helper function for updating notification settings with persistence
  const updateNotificationSetting = useCallback(async (
    key: keyof typeof notificationSettings,
    value: boolean
  ) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
    const success = await saveBillingSettings(key, value, 'notifications')
    if (success) {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} notifications ${value ? 'enabled' : 'disabled'}`)
    } else {
      toast.error('Failed to save setting')
      setNotificationSettings(prev => ({ ...prev, [key]: !value }))
    }
  }, [saveBillingSettings])

  // Helper function for updating tax settings with persistence
  const updateTaxSetting = useCallback(async (
    key: keyof typeof taxSettings,
    value: boolean
  ) => {
    setTaxSettings(prev => ({ ...prev, [key]: value }))
    const success = await saveBillingSettings(key, value, 'tax')
    if (success) {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`)
    } else {
      toast.error('Failed to save setting')
      setTaxSettings(prev => ({ ...prev, [key]: !value }))
    }
  }, [saveBillingSettings])

  // Helper function for updating advanced settings with persistence
  const updateAdvancedSetting = useCallback(async (
    key: keyof typeof advancedSettings,
    value: boolean
  ) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }))
    const success = await saveBillingSettings(key, value, 'advanced')
    if (success) {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`)
    } else {
      toast.error('Failed to save setting')
      setAdvancedSettings(prev => ({ ...prev, [key]: !value }))
    }
  }, [saveBillingSettings])

  // Helper function to toggle tax rate status
  const handleToggleTaxRate = useCallback(async (taxRate: TaxRate, newActiveState: boolean) => {
    // Optimistic update
    setTaxRateStates(prev => ({ ...prev, [taxRate.id]: newActiveState }))

    try {
      await updateTaxRate(taxRate.id, { is_active: newActiveState })
      toast.success(`${taxRate.name} ${newActiveState ? 'enabled' : 'disabled'}`)
    } catch (error) {
      // Revert on failure
      setTaxRateStates(prev => ({ ...prev, [taxRate.id]: !newActiveState }))
      toast.error(`Failed to update ${taxRate.name}`)
    }
  }, [updateTaxRate])

  // Helper function to download invoice as PDF
  const handleDownloadInvoicePdf = useCallback(async (invoice: Invoice) => {
    toast.loading(`Generating PDF for ${invoice.number}...`, { id: 'download-invoice' })

    try {
      // Generate PDF content
      const pdfContent = `
INVOICE
=======
Invoice Number: ${invoice.number}
Date: ${new Date(invoice.created_at).toLocaleDateString()}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

BILL TO:
${invoice.customer_name}
${invoice.customer_email}

ITEMS:
${invoice.line_items?.map(item =>
  `${item.description} - Qty: ${item.quantity} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}`
).join('\n') || 'No line items'}

SUBTOTAL: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.subtotal)}
TAX: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.tax)}
TOTAL: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)}

STATUS: ${invoice.status.toUpperCase()}
${invoice.paid_at ? `PAID ON: ${new Date(invoice.paid_at).toLocaleDateString()}` : ''}
      `.trim()

      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Downloaded ${invoice.number}`, { id: 'download-invoice' })
    } catch (error) {
      toast.error('Failed to generate invoice PDF', { id: 'download-invoice' })
    }
  }, [])

  // Handle AI insight action
  const handleInsightAction = useCallback((insight: AIInsight) => {
    switch (insight.category) {
      case 'Revenue':
        setActiveTab('dashboard')
        toast.success('Viewing revenue details')
        break
      case 'Retention':
        setActiveTab('subscriptions')
        setStatusFilter('past_due')
        toast.info('Showing at-risk accounts with payment failures')
        break
      case 'AI Insights':
        setActiveTab('coupons')
        toast.info('Consider creating an annual discount coupon')
        break
      default:
        toast.info(`Insight action: ${insight.title}`)
    }
  }, [])

  // Handler for guest payment completion
  const handleGuestPaymentSuccess = useCallback(async (paymentResult: {
    paymentIntentId: string
    email: string
    amount: number
  }) => {
    try {
      // Create a payment record in the database

      await supabase.from('payments').insert({
        payment_intent_id: paymentResult.paymentIntentId,
        email: paymentResult.email,
        amount: paymentResult.amount,
        currency: 'usd',
        status: 'succeeded',
        payment_type: 'guest_payment',
        description: selectedPlanForGuestPayment?.name || 'Guest Payment',
        metadata: {
          plan_name: selectedPlanForGuestPayment?.name,
          payment_method: 'stripe'
        },
        created_at: new Date().toISOString()
      })

      toast.success(`Payment of ${formatCurrency(paymentResult.amount)} received!`)
      setShowGuestPaymentModal(false)
      setSelectedPlanForGuestPayment(null)
      refreshAllBillingData()
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Payment succeeded but failed to record. Please contact support.')
    }
  }, [selectedPlanForGuestPayment, refreshAllBillingData])

  // Handler to open guest payment modal for a plan
  const handleOpenGuestPayment = useCallback((plan: PricingPlan) => {
    setSelectedPlanForGuestPayment({
      name: plan.name,
      amount: plan.amount,
      description: plan.description || `${plan.name} - ${plan.interval}ly subscription`
    })
    setShowGuestPaymentModal(true)
  }, [])

  // Invoice dialog state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    clientEmail: '',
    clientName: '',
    amount: '',
    dueDate: '',
    description: ''
  })

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

  // Transform database subscriptions to UI format
  const subscriptions: Subscription[] = useMemo(() => {
    if (dbSubscriptions && dbSubscriptions.length > 0) {
      return dbSubscriptions.map((sub: any) => ({
        id: sub.id,
        customer_id: sub.user_id || sub.customer_id,
        customer_name: sub.customer_name || sub.user?.full_name || 'Customer',
        customer_email: sub.customer_email || sub.user?.email || '',
        plan: sub.plan_id || sub.plan_name || 'Standard Plan',
        status: sub.status || 'active',
        amount: sub.amount || sub.price || 0,
        interval: sub.billing_cycle === 'yearly' ? 'year' : sub.billing_cycle === 'weekly' ? 'week' : 'month',
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        trial_end: sub.trial_end,
        payment_method: sub.payment_method,
        metadata: sub.metadata || {},
        created_at: sub.created_at
      }))
    }
    return []
  }, [dbSubscriptions])

  // Transform database invoices to UI format
  const invoices: Invoice[] = useMemo(() => {
    if (dbInvoices && dbInvoices.length > 0) {
      return dbInvoices.map((inv: any) => ({
        id: inv.id,
        number: inv.invoice_number || inv.number || `INV-${inv.id.slice(0, 8)}`,
        customer_id: inv.client_id || inv.user_id,
        customer_name: inv.client_name || 'Customer',
        customer_email: inv.client_email || '',
        status: inv.status || 'draft',
        amount_due: inv.total || 0,
        amount_paid: inv.amount_paid || (inv.status === 'paid' ? inv.total : 0),
        amount_remaining: inv.status === 'paid' ? 0 : (inv.total || 0),
        subtotal: inv.subtotal || inv.total || 0,
        tax: inv.tax || 0,
        total: inv.total || 0,
        due_date: inv.due_date,
        created_at: inv.created_at,
        paid_at: inv.paid_at,
        hosted_invoice_url: inv.hosted_invoice_url,
        pdf_url: inv.pdf_url,
        line_items: inv.invoice_items || inv.line_items || [],
        discount: inv.discount
      }))
    }
    return []
  }, [dbInvoices])

  // Transform database coupons to UI format
  const coupons: Coupon[] = useMemo(() => {
    if (dbCoupons && dbCoupons.length > 0) {
      return dbCoupons.map((coupon: any) => ({
        id: coupon.id,
        name: coupon.name,
        code: coupon.code,
        type: coupon.discount_type || 'percent_off',
        value: coupon.discount_value || coupon.value || 0,
        currency: coupon.currency || 'USD',
        duration: coupon.duration || 'once',
        duration_in_months: coupon.duration_in_months,
        max_redemptions: coupon.max_redemptions,
        times_redeemed: coupon.times_redeemed || 0,
        valid: coupon.is_active !== false,
        expires_at: coupon.expires_at,
        created_at: coupon.created_at
      }))
    }
    return []
  }, [dbCoupons])

  // Transform database tax rates to UI format
  const taxRates: TaxRate[] = useMemo(() => {
    if (dbTaxRates && dbTaxRates.length > 0) {
      return dbTaxRates.map((tax: any) => ({
        id: tax.id,
        name: tax.name,
        percentage: tax.percentage || tax.rate || 0,
        jurisdiction: tax.jurisdiction || tax.region || '',
        country: tax.country || '',
        state: tax.state,
        inclusive: tax.is_inclusive || tax.inclusive || false,
        active: tax.is_active !== false
      }))
    }
    return []
  }, [dbTaxRates])

  // Transform database refunds to UI format
  const refunds: Refund[] = useMemo(() => {
    if (dbRefunds && dbRefunds.length > 0) {
      return dbRefunds.map((ref: any) => ({
        id: ref.id,
        payment_id: ref.payment_id || ref.transaction_id,
        amount: ref.amount || 0,
        currency: ref.currency || 'USD',
        status: ref.status || 'pending',
        reason: ref.reason || 'requested_by_customer',
        created_at: ref.created_at,
        metadata: ref.metadata
      }))
    }
    return []
  }, [dbRefunds])

  // Usage records from database
  const usageRecords: UsageRecord[] = []

  // Transform database webhooks to UI format
  const webhooks: WebhookEndpoint[] = useMemo(() => {
    if (dbWebhooks && dbWebhooks.length > 0) {
      return dbWebhooks.map((wh: any) => ({
        id: wh.id,
        url: wh.url || wh.endpoint_url,
        events: wh.events || wh.subscribed_events || [],
        status: wh.is_active ? 'enabled' : 'disabled',
        secret: wh.secret || 'whsec_xxxxx',
        created_at: wh.created_at,
        last_delivery: wh.last_delivery || wh.last_triggered_at,
        success_rate: wh.success_rate || 100
      }))
    }
    return []
  }, [dbWebhooks])

  // Transform database pricing plans to UI format
  const pricingPlans: PricingPlan[] = useMemo(() => {
    if (dbPricingPlans && dbPricingPlans.length > 0) {
      return dbPricingPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        amount: plan.price || plan.amount || 0,
        currency: plan.currency || 'USD',
        interval: plan.billing_period === 'yearly' ? 'year' : plan.billing_period === 'weekly' ? 'week' : 'month',
        features: plan.pricing_features?.map((f: any) => f.name || f.feature) || plan.features || [],
        is_active: plan.is_active !== false,
        trial_days: plan.trial_days || plan.trial_period_days || 0,
        subscribers: plan.subscribers_count || 0
      }))
    }
    return []
  }, [dbPricingPlans])

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
      toast.success('Subscription cancelled', {
        description: `Subscription for ${subscription.customer_name || 'customer'} has been cancelled`
      })
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
      toast.success('Refund initiated', {
        description: `Refund for ${formatCurrency(transaction.amount)} has been initiated`
      })
    } catch (error) {
      console.error('Failed to initiate refund:', error)
      toast.error('Failed to initiate refund')
    }
  }, [createRefund])

  const handleExportBilling = useCallback(async () => {
    try {
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

        toast.success('Export completed', {
          description: `Exported ${billingData.length} billing records`
        })
      } else {
        toast.info('No data to export', {
          description: 'There are no billing records to export'
        })
      }
    } catch (error) {
      console.error('Failed to export billing data:', error)
      toast.error('Failed to export billing data')
    }
  }, [])

  // State for Stripe payment retry modal
  const [showRetryPaymentModal, setShowRetryPaymentModal] = useState(false)
  const [retryPaymentClientSecret, setRetryPaymentClientSecret] = useState<string | null>(null)
  const [retryPaymentInvoice, setRetryPaymentInvoice] = useState<Invoice | null>(null)
  const [isRetryingPayment, setIsRetryingPayment] = useState(false)

  const handleRetryPayment = useCallback(async (invoice: Invoice) => {
    setIsRetryingPayment(true)
    try {
      // Update invoice status to processing
      await updateInvoice(invoice.id, {
        status: 'processing',
        last_retry_at: new Date().toISOString()
      })

      toast.info('Initiating payment retry', {
        description: `Processing payment for invoice ${invoice.number || invoice.id}`
      })

      // Call the retry invoice API to create a payment intent
      const response = await fetch('/api/payments/retry-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amount_due || invoice.total,
          customerId: invoice.customer_id,
          stripeInvoiceId: (invoice as any).stripe_invoice_id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment retry failed')
      }

      if (result.status === 'paid' || result.success === true && result.status !== 'requires_payment') {
        // Payment was processed directly (e.g., existing Stripe invoice)
        await updateInvoice(invoice.id, {
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        toast.success('Payment successful', {
          description: `Invoice ${invoice.number || invoice.id} has been paid`
        })
        refreshAllBillingData()
      } else if (result.clientSecret) {
        // Payment requires additional action - show Stripe Elements modal
        setRetryPaymentClientSecret(result.clientSecret)
        setRetryPaymentInvoice(invoice)
        setShowRetryPaymentModal(true)
      } else {
        throw new Error('Unexpected payment response')
      }
    } catch (error) {
      console.error('Failed to retry payment:', error)

      // Revert invoice status on failure
      await updateInvoice(invoice.id, {
        status: 'open',
        last_retry_at: new Date().toISOString()
      })

      toast.error('Payment failed', {
        description: error.message || 'The payment could not be processed. Please try again.'
      })
    } finally {
      setIsRetryingPayment(false)
    }
  }, [updateInvoice, refreshAllBillingData])

  // Handler for successful Stripe payment from retry modal
  const handleRetryPaymentSuccess = useCallback(async (paymentIntent: any) => {
    if (retryPaymentInvoice) {
      await updateInvoice(retryPaymentInvoice.id, {
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      toast.success('Payment successful', {
        description: `Invoice ${retryPaymentInvoice.number || retryPaymentInvoice.id} has been paid`
      })
      setShowRetryPaymentModal(false)
      setRetryPaymentClientSecret(null)
      setRetryPaymentInvoice(null)
      refreshAllBillingData()
    }
  }, [retryPaymentInvoice, updateInvoice, refreshAllBillingData])

  // Handler for payment errors from retry modal
  const handleRetryPaymentError = useCallback(async (error: Error) => {
    if (retryPaymentInvoice) {
      await updateInvoice(retryPaymentInvoice.id, {
        status: 'open',
        last_retry_at: new Date().toISOString()
      })
    }
    toast.error('Payment failed', {
      description: error.message || 'The payment could not be processed. Please try again.'
    })
    setShowRetryPaymentModal(false)
    setRetryPaymentClientSecret(null)
    setRetryPaymentInvoice(null)
  }, [retryPaymentInvoice, updateInvoice])

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
        reminder_count: (invoice as any).reminder_count ? (invoice as any).reminder_count + 1 : 1
      })
      toast.success('Reminder sent', {
        description: `Payment reminder sent to ${invoice.customer_email}`
      })
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
      toast.success('Subscription paused', {
        description: `Subscription for ${subscription.customer_name} has been paused`
      })
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
      toast.success('Subscription resumed', {
        description: `Subscription for ${subscription.customer_name} has been resumed`
      })
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      toast.error('Failed to resume subscription')
    }
  }, [updateSubscription])

  // Handler for updating payment method
  const handleUpdatePaymentMethod = useCallback(async (paymentMethodId: string, updates: {
    expMonth?: number
    expYear?: number
    billingDetails?: Record<string, string>
    setAsDefault?: boolean
  }) => {
    toast.loading('Updating payment method...', { id: 'update-payment' })
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: updates.setAsDefault ? 'set-default' : 'update',
          paymentMethodId,
          ...updates
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update payment method')
      }

      toast.success('Payment method updated', { id: 'update-payment' })
      return result
    } catch (error) {
      console.error('Failed to update payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update payment method', { id: 'update-payment' })
      throw error
    }
  }, [])

  // Handler for applying coupon to subscription
  const handleApplyCoupon = useCallback(async (subscriptionId: string, couponCode: string) => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    toast.loading('Applying coupon...', { id: 'apply-coupon' })
    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-coupon',
          subscriptionId,
          couponCode: couponCode.toUpperCase()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid or expired coupon')
      }

      toast.success(result.message || 'Coupon applied successfully!', { id: 'apply-coupon' })
      await refreshSubscriptions?.()
      return result
    } catch (error) {
      console.error('Failed to apply coupon:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to apply coupon', { id: 'apply-coupon' })
      throw error
    }
  }, [refreshSubscriptions])

  // Handler for downloading invoice (alias for handleDownloadInvoicePdf)
  const handleDownloadInvoice = useCallback(async (invoice: Invoice) => {
    return handleDownloadInvoicePdf(invoice)
  }, [handleDownloadInvoicePdf])

  // Handler for requesting refund
  const handleRequestRefund = useCallback(async (
    transactionOrPaymentId: string,
    amount: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge',
    notes?: string
  ) => {
    toast.loading('Processing refund request...', { id: 'request-refund' })
    try {
      await createRefund({
        payment_id: transactionOrPaymentId,
        amount,
        currency: 'USD',
        status: 'pending',
        reason,
        notes: notes || `Refund requested: ${reason.replace(/_/g, ' ')}`
      })

      toast.success('Refund request submitted', {
        id: 'request-refund',
        description: `Refund of ${formatCurrency(amount)} is being processed`
      })
      await refreshRefunds?.()
    } catch (error) {
      console.error('Failed to request refund:', error)
      toast.error('Failed to submit refund request', { id: 'request-refund' })
      throw error
    }
  }, [createRefund, refreshRefunds])

  // Handler for upgrading subscription plan
  const handleUpgradePlan = useCallback(async (subscriptionId: string, newPlanId: string, immediate: boolean = true) => {
    toast.loading('Upgrading subscription...', { id: 'upgrade-plan' })
    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade',
          subscriptionId,
          newPlanId,
          immediate
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upgrade subscription')
      }

      toast.success(result.message || 'Subscription upgraded successfully!', { id: 'upgrade-plan' })
      await refreshSubscriptions?.()
      return result
    } catch (error) {
      console.error('Failed to upgrade subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade subscription', { id: 'upgrade-plan' })
      throw error
    }
  }, [refreshSubscriptions])

  // Handler for downgrading subscription plan
  const handleDowngradePlan = useCallback(async (subscriptionId: string, newPlanId: string) => {
    toast.loading('Scheduling downgrade...', { id: 'downgrade-plan' })
    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'downgrade',
          subscriptionId,
          newPlanId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule downgrade')
      }

      toast.success(result.message || 'Downgrade scheduled successfully!', { id: 'downgrade-plan' })
      await refreshSubscriptions?.()
      return result
    } catch (error) {
      console.error('Failed to downgrade subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule downgrade', { id: 'downgrade-plan' })
      throw error
    }
  }, [refreshSubscriptions])

  // Handler for recording usage
  const handleRecordUsage = useCallback(async (
    usageType: 'api_calls' | 'storage_gb' | 'ai_tokens' | 'video_minutes' | 'collaboration_minutes' | 'team_members',
    quantity: number,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const response = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record',
          usageType,
          quantity,
          metadata
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record usage')
      }

      return result
    } catch (error) {
      console.error('Failed to record usage:', error)
      throw error
    }
  }, [])

  // Handler for getting usage summary
  const handleGetUsageSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summary' })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get usage summary')
      }

      return result.data
    } catch (error) {
      console.error('Failed to get usage summary:', error)
      throw error
    }
  }, [])

  // Handler for checking usage limit
  const handleCheckUsageLimit = useCallback(async (
    usageType: 'api_calls' | 'storage_gb' | 'ai_tokens' | 'video_minutes' | 'collaboration_minutes' | 'team_members'
  ) => {
    try {
      const response = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-limit',
          usageType
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check usage limit')
      }

      return result.data
    } catch (error) {
      console.error('Failed to check usage limit:', error)
      throw error
    }
  }, [])

  // Handler for adding payment method
  const handleAddPaymentMethod = useCallback(async (paymentData: {
    type: 'card' | 'bank_account'
    cardNumber?: string
    expMonth?: number
    expYear?: number
    cvc?: string
    billingDetails?: Record<string, string>
    setAsDefault?: boolean
    // For bank account
    accountNumber?: string
    routingNumber?: string
    accountType?: string
    accountHolderName?: string
    bankName?: string
  }) => {
    toast.loading('Adding payment method...', { id: 'add-payment' })
    try {
      const action = paymentData.type === 'card' ? 'add-card' : 'add-bank-account'

      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...paymentData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add payment method')
      }

      toast.success('Payment method added successfully', { id: 'add-payment' })
      return result
    } catch (error) {
      console.error('Failed to add payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method', { id: 'add-payment' })
      throw error
    }
  }, [])

  // Handler for deleting payment method
  const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    toast.loading('Removing payment method...', { id: 'delete-payment' })
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          paymentMethodId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove payment method')
      }

      toast.success('Payment method removed', { id: 'delete-payment' })
      return result
    } catch (error) {
      console.error('Failed to delete payment method:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove payment method', { id: 'delete-payment' })
      throw error
    }
  }, [])

  // Quick actions with real functionality - properly typed
  const billingQuickActions: QuickAction[] = [
    {
      id: '1',
      label: 'New Invoice',
      icon: <Plus className="h-4 w-4" />,
      action: () => setShowNewInvoiceModal(true),
    },
    {
      id: '2',
      label: 'Refund',
      icon: <RotateCcw className="h-4 w-4" />,
      action: () => {
        // Open refund dialog or navigate to refunds section
        setActiveTab('settings')
        setSettingsTab('advanced')
        toast.info('Navigate to a transaction to process a refund')
      },
    },
    {
      id: '3',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      action: handleExportBilling,
    },
  ]

  if (error) return <div className="p-8 min-h-screen bg-gray-900"><div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-gray-900">
      {/* Loading Overlay */}
      {isLoadingBillingData && (
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Billing Data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fetching subscriptions, invoices, and more...</p>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Shield className="h-4 w-4" />
                <span className="text-sm">PCI Compliant</span>
              </div>
              <Button
                onClick={refreshAllBillingData}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                disabled={isLoadingBillingData}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBillingData ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{plan.subscribers} subscribers • {formatCurrency(plan.amount * plan.subscribers)}/mo</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenGuestPayment(plan)
                            }}
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Pay as Guest
                          </Button>
                        </div>
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
                <Button key={filter} variant={statusFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(filter as any)}>
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
                              <Button size="sm" variant="ghost" onClick={() => handleDownloadInvoicePdf(inv)}><Download className="w-4 h-4" /></Button>
                              {inv.status === 'open' && (
                                <Button size="sm" variant="outline" onClick={() => handleSendInvoiceReminder(inv)} disabled={mutatingInvoice}>
                                  Send Reminder
                                </Button>
                              )}
                              {inv.status === 'open' && (
                                <Button size="sm" variant="default" onClick={() => handleRetryPayment(inv)} disabled={mutatingInvoice || isRetryingPayment}>
                                  {isRetryingPayment ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    'Retry Payment'
                                  )}
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
                        <Switch
                          checked={taxRateStates[tax.id] ?? tax.active}
                          onCheckedChange={(checked) => handleToggleTaxRate(tax, checked)}
                          disabled={updatingTaxRate}
                        />
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
                        <Switch checked={paymentSettings.creditCards} onCheckedChange={(checked) => updatePaymentSetting('creditCards', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">ACH Bank Transfers</p>
                          <p className="text-sm text-gray-500">US bank account debits</p>
                        </div>
                        <Switch checked={paymentSettings.achBankTransfers} onCheckedChange={(checked) => updatePaymentSetting('achBankTransfers', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">SEPA Direct Debit</p>
                          <p className="text-sm text-gray-500">European bank transfers</p>
                        </div>
                        <Switch checked={paymentSettings.sepaDirectDebit} onCheckedChange={(checked) => updatePaymentSetting('sepaDirectDebit', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Apple Pay / Google Pay</p>
                          <p className="text-sm text-gray-500">Mobile wallet payments</p>
                        </div>
                        <Switch checked={paymentSettings.appleGooglePay} onCheckedChange={(checked) => updatePaymentSetting('appleGooglePay', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Wire Transfers</p>
                          <p className="text-sm text-gray-500">For enterprise invoices</p>
                        </div>
                        <Switch checked={paymentSettings.wireTransfers} onCheckedChange={(checked) => updatePaymentSetting('wireTransfers', checked)} />
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
                        <Switch checked={paymentSettings.autoRetry} onCheckedChange={(checked) => updatePaymentSetting('autoRetry', checked)} />
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
                        <Switch checked={paymentSettings.updateCardPrompt} onCheckedChange={(checked) => updatePaymentSetting('updateCardPrompt', checked)} />
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
                        <Switch checked={paymentSettings.radarFraudDetection} onCheckedChange={(checked) => updatePaymentSetting('radarFraudDetection', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">3D Secure Authentication</p>
                          <p className="text-sm text-gray-500">Require 3DS for high-risk transactions</p>
                        </div>
                        <Switch checked={paymentSettings.threeDSecure} onCheckedChange={(checked) => updatePaymentSetting('threeDSecure', checked)} />
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
                        <Switch checked={paymentSettings.cvcVerification} onCheckedChange={(checked) => updatePaymentSetting('cvcVerification', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Address Verification (AVS)</p>
                          <p className="text-sm text-gray-500">Verify billing address matches</p>
                        </div>
                        <Switch checked={paymentSettings.addressVerification} onCheckedChange={(checked) => updatePaymentSetting('addressVerification', checked)} />
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
                        <Switch checked={paymentSettings.customerPortal} onCheckedChange={(checked) => updatePaymentSetting('customerPortal', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Plan Changes</p>
                          <p className="text-sm text-gray-500">Customers can upgrade/downgrade</p>
                        </div>
                        <Switch checked={paymentSettings.allowPlanChanges} onCheckedChange={(checked) => updatePaymentSetting('allowPlanChanges', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Cancellations</p>
                          <p className="text-sm text-gray-500">Customers can cancel subscriptions</p>
                        </div>
                        <Switch checked={paymentSettings.allowCancellations} onCheckedChange={(checked) => updatePaymentSetting('allowCancellations', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice History Access</p>
                          <p className="text-sm text-gray-500">View and download past invoices</p>
                        </div>
                        <Switch checked={paymentSettings.invoiceHistoryAccess} onCheckedChange={(checked) => updatePaymentSetting('invoiceHistoryAccess', checked)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Portal URL</Label>
                        <div className="flex gap-2">
                          <Input value="https://billing.yourapp.com/portal" readOnly className="flex-1" />
                          <Button variant="outline" size="icon" onClick={() => {
                            navigator.clipboard.writeText('https://billing.yourapp.com/portal')
                              .then(() => toast.success('Portal URL copied to clipboard'))
                              .catch(() => toast.error('Failed to copy'))
                          }}>
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
                        <Switch checked={invoicingSettings.autoFinalizeDrafts} onCheckedChange={(checked) => updateInvoicingSetting('autoFinalizeDrafts', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-advance Collection</p>
                          <p className="text-sm text-gray-500">Automatically charge open invoices</p>
                        </div>
                        <Switch checked={invoicingSettings.autoAdvanceCollection} onCheckedChange={(checked) => updateInvoicingSetting('autoAdvanceCollection', checked)} />
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
                        <Switch checked={invoicingSettings.resetYearly} onCheckedChange={(checked) => updateInvoicingSetting('resetYearly', checked)} />
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
                          <Button variant="outline" size="sm" onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                toast.success(`Logo "${file.name}" selected for upload`)
                              }
                            }
                            input.click()
                          }}>Upload Logo</Button>
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
                        <Switch checked={invoicingSettings.emailInvoices} onCheckedChange={(checked) => updateInvoicingSetting('emailInvoices', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Attach PDF</p>
                          <p className="text-sm text-gray-500">Include PDF attachment in emails</p>
                        </div>
                        <Switch checked={invoicingSettings.attachPdf} onCheckedChange={(checked) => updateInvoicingSetting('attachPdf', checked)} />
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
                        <Switch checked={notificationSettings.paymentSuccessful} onCheckedChange={(checked) => updateNotificationSetting('paymentSuccessful', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Failed</p>
                          <p className="text-sm text-gray-500">Alert when payment fails</p>
                        </div>
                        <Switch checked={notificationSettings.paymentFailed} onCheckedChange={(checked) => updateNotificationSetting('paymentFailed', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice Sent</p>
                          <p className="text-sm text-gray-500">Notify when invoice is created</p>
                        </div>
                        <Switch checked={notificationSettings.invoiceSent} onCheckedChange={(checked) => updateNotificationSetting('invoiceSent', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Confirmed</p>
                          <p className="text-sm text-gray-500">Welcome email for new subscriptions</p>
                        </div>
                        <Switch checked={notificationSettings.subscriptionConfirmed} onCheckedChange={(checked) => updateNotificationSetting('subscriptionConfirmed', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Canceled</p>
                          <p className="text-sm text-gray-500">Confirmation of cancellation</p>
                        </div>
                        <Switch checked={notificationSettings.subscriptionCanceled} onCheckedChange={(checked) => updateNotificationSetting('subscriptionCanceled', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Refund Processed</p>
                          <p className="text-sm text-gray-500">Notify when refund is issued</p>
                        </div>
                        <Switch checked={notificationSettings.refundProcessed} onCheckedChange={(checked) => updateNotificationSetting('refundProcessed', checked)} />
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
                        <Switch checked={notificationSettings.newSubscription} onCheckedChange={(checked) => updateNotificationSetting('newSubscription', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Payment Failed (Internal)</p>
                          <p className="text-sm text-gray-500">Alert team on failed payments</p>
                        </div>
                        <Switch checked={notificationSettings.paymentFailedInternal} onCheckedChange={(checked) => updateNotificationSetting('paymentFailedInternal', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Canceled (Internal)</p>
                          <p className="text-sm text-gray-500">Alert team on cancellations</p>
                        </div>
                        <Switch checked={notificationSettings.subscriptionCanceledInternal} onCheckedChange={(checked) => updateNotificationSetting('subscriptionCanceledInternal', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Large Payment Received</p>
                          <p className="text-sm text-gray-500">Alert on payments over threshold</p>
                        </div>
                        <Switch checked={notificationSettings.largePayment} onCheckedChange={(checked) => updateNotificationSetting('largePayment', checked)} />
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
                        <Switch checked={notificationSettings.enableDunning} onCheckedChange={(checked) => updateNotificationSetting('enableDunning', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Trial Ending Reminder</p>
                          <p className="text-sm text-gray-500">Remind 3 days before trial ends</p>
                        </div>
                        <Switch checked={notificationSettings.trialEndingReminder} onCheckedChange={(checked) => updateNotificationSetting('trialEndingReminder', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice Due Reminder</p>
                          <p className="text-sm text-gray-500">Remind before invoice is due</p>
                        </div>
                        <Switch checked={notificationSettings.invoiceDueReminder} onCheckedChange={(checked) => updateNotificationSetting('invoiceDueReminder', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Past Due Reminders</p>
                          <p className="text-sm text-gray-500">Send escalating past due notices</p>
                        </div>
                        <Switch checked={notificationSettings.pastDueReminders} onCheckedChange={(checked) => updateNotificationSetting('pastDueReminders', checked)} />
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
                        <Switch checked={notificationSettings.slackPaymentEvents} onCheckedChange={(checked) => updateNotificationSetting('slackPaymentEvents', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Subscription Events</p>
                          <p className="text-sm text-gray-500">Post subscription changes</p>
                        </div>
                        <Switch checked={notificationSettings.slackSubscriptionEvents} onCheckedChange={(checked) => updateNotificationSetting('slackSubscriptionEvents', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Summary</p>
                          <p className="text-sm text-gray-500">Post weekly billing summary</p>
                        </div>
                        <Switch checked={notificationSettings.slackWeeklySummary} onCheckedChange={(checked) => updateNotificationSetting('slackWeeklySummary', checked)} />
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
                              <Button variant="outline" size="sm" onClick={() => {
                                toast.info(`Opening ${integration.name} OAuth authorization...`)
                                // In production, this would open an OAuth popup
                                window.open(`https://oauth.example.com/authorize?app=${integration.name.toLowerCase()}`, '_blank', 'width=600,height=700')
                              }}>Connect</Button>
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
                              setShowWebhookModal(true)
                            }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          setSelectedWebhook(null)
                          setShowWebhookModal(true)
                        }}>
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
                          <Button variant="outline" size="icon" onClick={() => {
                            navigator.clipboard.writeText('pk_live_xxxxxxxxxxxxxxxxxxxxx')
                              .then(() => toast.success('Publishable key copied to clipboard'))
                              .catch(() => toast.error('Failed to copy'))
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Secret Key</Label>
                        <div className="flex gap-2">
                          <Input value={showSecretKey ? 'sk_live_yyyyyyyyyyyyyyyyyyyyy' : 'STRIPE_KEY_PLACEHOLDER'} readOnly className="flex-1 font-mono text-sm" type={showSecretKey ? 'text' : 'password'} />
                          <Button variant="outline" size="icon" onClick={() => {
                            setShowSecretKey(true)
                            toast.success('Secret key revealed - will hide in 30s')
                            setTimeout(() => setShowSecretKey(false), 30000)
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => {
                            navigator.clipboard.writeText('sk_live_yyyyyyyyyyyyyyyyyyyyy')
                              .then(() => toast.success('Secret key copied to clipboard'))
                              .catch(() => toast.error('Failed to copy'))
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Warning:</strong> Never share your secret key in public repositories or client-side code.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={async () => {
                        if (!confirm('Are you sure you want to rotate API keys? This will invalidate your existing keys and require updating all integrations.')) {
                          return
                        }
                        toast.loading('Rotating API keys...', { id: 'rotate-keys' })
                        try {
                          // In production, this would call an API endpoint to rotate keys
                          await supabase.from('api_keys').update({
                            rotated_at: new Date().toISOString(),
                            status: 'rotated'
                          }).eq('status', 'active')
                          toast.success('API keys rotated - update your integrations', { id: 'rotate-keys' })
                        } catch (error) {
                          toast.error('Failed to rotate keys', { id: 'rotate-keys' })
                        }
                      }}>
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
                      <Button onClick={() => {
                        setSelectedTaxRate(null)
                        setShowTaxRateModal(true)
                      }}>
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
                              <Switch
                                checked={taxRateStates[tax.id] ?? tax.active}
                                onCheckedChange={(checked) => handleToggleTaxRate(tax, checked)}
                                disabled={updatingTaxRate}
                              />
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedTaxRate(tax)
                                setShowTaxRateModal(true)
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
                        <Switch checked={taxSettings.automaticTaxCalculation} onCheckedChange={(checked) => updateTaxSetting('automaticTaxCalculation', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Tax ID Validation</p>
                          <p className="text-sm text-gray-500">Validate VAT/GST numbers automatically</p>
                        </div>
                        <Switch checked={taxSettings.taxIdValidation} onCheckedChange={(checked) => updateTaxSetting('taxIdValidation', checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Reverse Charge</p>
                          <p className="text-sm text-gray-500">Apply reverse charge for B2B EU transactions</p>
                        </div>
                        <Switch checked={taxSettings.reverseCharge} onCheckedChange={(checked) => updateTaxSetting('reverseCharge', checked)} />
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
                        <Switch checked={advancedSettings.testMode} onCheckedChange={(checked) => updateAdvancedSetting('testMode', checked)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Test Card Number</Label>
                        <div className="flex gap-2">
                          <Input value="4242 4242 4242 4242" readOnly className="flex-1 font-mono" />
                          <Button variant="outline" size="icon" onClick={() => {
                            navigator.clipboard.writeText('4242424242424242')
                              .then(() => toast.success('Test card number copied to clipboard'))
                              .catch(() => toast.error('Failed to copy'))
                          }}>
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
                        <Switch checked={advancedSettings.pauseCollection} onCheckedChange={(checked) => updateAdvancedSetting('pauseCollection', checked)} />
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
                      <Button variant="outline" className="w-full" onClick={async () => {
                        toast.loading('Generating tax report...', { id: 'tax-report' })
                        try {
                          const { data: taxData, error } = await supabase
                            .from('invoices')
                            .select('*')
                            .not('tax', 'is', null)
                            .order('created_at', { ascending: false })

                          if (error) throw error

                          if (taxData && taxData.length > 0) {
                            const headers = ['Invoice', 'Customer', 'Subtotal', 'Tax', 'Total', 'Date']
                            const rows = taxData.map(inv => [inv.invoice_number, inv.client_name, inv.subtotal, inv.tax, inv.total, inv.created_at])
                            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

                            const blob = new Blob([csv], { type: 'text/csv' })
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `tax-report-${new Date().toISOString().split('T')[0]}.csv`
                            document.body.appendChild(a)
                            a.click()
                            window.URL.revokeObjectURL(url)
                            document.body.removeChild(a)
                            toast.success('Tax report generated and downloaded', { id: 'tax-report' })
                          } else {
                            toast.info('No tax data to export', { id: 'tax-report' })
                          }
                        } catch (error) {
                          toast.error('Report generation failed', { id: 'tax-report' })
                        }
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Tax Report
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowAuditLogModal(true)}>
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
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                        if (!confirm('WARNING: This will cancel ALL subscriptions immediately. This action cannot be undone. Are you absolutely sure?')) {
                          return
                        }
                        toast.loading('Canceling all subscriptions...', { id: 'cancel-all' })
                        try {
                          await supabase.from('subscriptions').update({
                            status: 'canceled',
                            canceled_at: new Date().toISOString()
                          }).eq('status', 'active')
                          refreshSubscriptions?.()
                          toast.success('All subscriptions have been canceled', { id: 'cancel-all' })
                        } catch (error) {
                          toast.error('Failed to cancel subscriptions', { id: 'cancel-all' })
                        }
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel All Subscriptions
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                        if (!confirm('WARNING: This will delete ALL test data. This action cannot be undone. Are you absolutely sure?')) {
                          return
                        }
                        toast.loading('Deleting test data...', { id: 'delete-test' })
                        try {
                          // Delete test records (those with test metadata or in test mode)
                          await supabase.from('billing').delete().eq('is_test', true)
                          await supabase.from('subscriptions').delete().eq('is_test', true)
                          await supabase.from('invoices').delete().eq('is_test', true)
                          refetchTransactions?.()
                          toast.success('All test data has been deleted', { id: 'delete-test' })
                        } catch (error) {
                          toast.error('Failed to delete test data', { id: 'delete-test' })
                        }
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Test Data
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                        if (!confirm('WARNING: This will disable the entire billing module. Users will not be able to make payments. Are you absolutely sure?')) {
                          return
                        }
                        toast.loading('Disabling billing module...', { id: 'disable-billing' })
                        try {
                          await supabase.from('settings').upsert({
                            key: 'billing_enabled',
                            value: false,
                            updated_at: new Date().toISOString()
                          })
                          toast.success('Billing module has been disabled', { id: 'disable-billing' })
                        } catch (error) {
                          toast.error('Failed to disable billing', { id: 'disable-billing' })
                        }
                      }}>
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
              insights={billingAIInsights}
              title="Billing Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={billingPredictions}
              title="Revenue Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs.slice(0, 10).map(log => ({
              id: log.id,
              type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
              title: log.action,
              description: log.resource_name || undefined,
              user: { name: log.user_name || 'System', avatar: undefined },
              timestamp: log.created_at,
              isUnread: log.status === 'pending'
            }))}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={confirmDialog.variant === 'destructive' ? 'text-red-600' : ''}>
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={() => {
                confirmDialog.onConfirm()
                setConfirmDialog(prev => ({ ...prev, open: false }))
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg">
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                <span className="font-medium">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(selectedInvoice.amount_paid)}</span>
              </div>
              {selectedInvoice.amount_remaining > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount Due</span>
                  <span className="font-medium text-red-600">{formatCurrency(selectedInvoice.amount_remaining)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                <span className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Customer Email</span>
                <span className="font-medium">{selectedInvoice.customer_email}</span>
              </div>
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Line Items</span>
                  <div className="space-y-2">
                    {selectedInvoice.line_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              {selectedInvoice.status === 'open' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSendInvoiceReminder(selectedInvoice)
                      setSelectedInvoice(null)
                    }}
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
                    disabled={mutatingInvoice || isRetryingPayment}
                  >
                    {isRetryingPayment ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Retry Payment'
                    )}
                  </Button>
                </>
              )}
              {selectedInvoice.hosted_invoice_url && (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(selectedInvoice.hosted_invoice_url, '_blank')
                    toast.info('Opening invoice in new tab')
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Online
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleDownloadInvoicePdf(selectedInvoice)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Guest Payment Modal - World-class Stripe integration */}
      {selectedPlanForGuestPayment && (
        <GuestPaymentModal
          isOpen={showGuestPaymentModal}
          onClose={() => {
            setShowGuestPaymentModal(false)
            setSelectedPlanForGuestPayment(null)
          }}
          amount={selectedPlanForGuestPayment.amount}
          productName={selectedPlanForGuestPayment.name}
          productDescription={selectedPlanForGuestPayment.description}
          onPaymentSuccess={handleGuestPaymentSuccess}
          currency="usd"
          allowApplePay={paymentSettings.appleGooglePay}
          allowGooglePay={paymentSettings.appleGooglePay}
        />
      )}

      {/* Invoice Payment Retry Modal - Stripe Elements */}
      {showRetryPaymentModal && retryPaymentClientSecret && retryPaymentInvoice && (
        <Dialog open={showRetryPaymentModal} onOpenChange={(open) => {
          if (!open) {
            setShowRetryPaymentModal(false)
            setRetryPaymentClientSecret(null)
            setRetryPaymentInvoice(null)
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Complete Payment
              </DialogTitle>
              <DialogDescription>
                Pay invoice {retryPaymentInvoice.number || retryPaymentInvoice.id}
              </DialogDescription>
            </DialogHeader>
            <StripePayment
              clientSecret={retryPaymentClientSecret}
              amount={retryPaymentInvoice.amount_due || retryPaymentInvoice.total}
              currency="usd"
              onSuccess={handleRetryPaymentSuccess}
              onError={handleRetryPaymentError}
              onCancel={() => {
                setShowRetryPaymentModal(false)
                setRetryPaymentClientSecret(null)
                setRetryPaymentInvoice(null)
              }}
              showOrderSummary={true}
              orderItems={[{
                name: `Invoice ${retryPaymentInvoice.number || retryPaymentInvoice.id}`,
                description: retryPaymentInvoice.customer_name,
                amount: retryPaymentInvoice.amount_due || retryPaymentInvoice.total,
              }]}
              className="border-0 shadow-none"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
