'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, Receipt, DollarSign, Users, Plus, BarChart3, Settings, RefreshCw, Download, AlertCircle, AlertTriangle, Clock, Edit, Eye,
  Zap, Package, ExternalLink, Crown, Star, Check, X, ArrowRight, Shield, Rocket, Sparkles, ChevronRight, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' | 'incomplete'
  planId: string
  planName: string
  price: number
  interval: 'month' | 'year'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
}

interface Invoice {
  id: string
  number: string
  status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible'
  amount: number
  currency: string
  created: string
  pdfUrl: string | null
  hostedUrl: string | null
}

interface PaymentMethod {
  id: string
  type: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface Usage {
  projects: { used: number; limit: number; percentage: number }
  storage: { used: number; limit: number; percentage: number }
  aiCredits: { used: number; limit: number; percentage: number }
  teamMembers: { used: number; limit: number; percentage: number }
  videoMinutes?: { used: number; limit: number; percentage: number }
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    projects: number
    storage: number
    aiCredits: number
    teamMembers: number
  }
  popular?: boolean
}

// ============================================================================
// API Helpers
// ============================================================================

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return response.json()
}

// ============================================================================
// Main Component
// ============================================================================

export default function SubscriptionsClient() {
  // State
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  // Dialogs
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showBillingAddressDialog, setShowBillingAddressDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Form States
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  })
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('all')
  const [pauseDuration, setPauseDuration] = useState<string>('1_month')
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const loadSubscriptionData = useCallback(async () => {
    setLoading(true)
    try {
      const [subResult, invoicesResult, usageResult, plansResult, paymentMethodsResult] = await Promise.all([
        fetchWithAuth('/api/stripe/subscriptions', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-subscription' }),
        }),
        fetchWithAuth('/api/stripe/subscriptions', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-invoices' }),
        }),
        fetchWithAuth('/api/stripe/subscriptions', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-usage' }),
        }),
        fetchWithAuth('/api/stripe/checkout-session', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-plans', billingInterval }),
        }),
        fetchWithAuth('/api/stripe/payment-methods', {
          method: 'POST',
          body: JSON.stringify({ action: 'list-payment-methods' }),
        }),
      ])

      if (subResult.success && subResult.data?.subscription) {
        setSubscription(subResult.data.subscription)
      }
      if (invoicesResult.success && invoicesResult.data?.invoices) {
        setInvoices(invoicesResult.data.invoices)
      }
      if (usageResult.success && usageResult.data?.usage) {
        setUsage(usageResult.data.usage)
      }
      if (plansResult.success && plansResult.data?.plans) {
        setPlans(plansResult.data.plans)
      }
      if (paymentMethodsResult.success && paymentMethodsResult.data?.paymentMethods) {
        setPaymentMethods(paymentMethodsResult.data.paymentMethods)
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }, [billingInterval])

  useEffect(() => {
    loadSubscriptionData()
  }, [loadSubscriptionData])

  // ============================================================================
  // Real Handler Functions
  // ============================================================================

  /**
   * Handle subscription upgrade - redirects to Stripe Checkout
   */
  const handleUpgrade = async (plan: Plan) => {
    const upgradePromise = async () => {
      const response = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create-checkout-session',
          planId: plan.id,
          billingInterval,
          successUrl: `${window.location.origin}/dashboard/subscriptions-v2?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard/subscriptions-v2?checkout=cancelled`,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url
      } else if (response.demo) {
        // Demo mode - simulate success
        setShowUpgradeDialog(false)
        await loadSubscriptionData()
        return `Demo: Upgraded to ${plan.name} plan`
      }

      return `Redirecting to checkout for ${plan.name} plan...`
    }

    toast.promise(upgradePromise(), {
      loading: `Preparing ${plan.name} plan checkout...`,
      success: (message) => message || `Checkout session created`,
      error: (err) => err.message || 'Failed to create checkout session',
    })
  }

  /**
   * Handle subscription cancellation with confirmation
   */
  const handleCancelSubscription = async () => {
    // Confirmation is already done via dialog
    const cancelPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'cancel-subscription',
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel subscription')
      }

      setShowCancelDialog(false)
      await loadSubscriptionData()

      return response.data?.message || 'Subscription cancelled. You will have access until the end of your billing period.'
    }

    toast.promise(cancelPromise(), {
      loading: 'Cancelling subscription...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to cancel subscription',
    })
  }

  /**
   * Handle subscription reactivation
   */
  const handleReactivateSubscription = async () => {
    const reactivatePromise = async () => {
      const response = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reactivate-subscription',
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to reactivate subscription')
      }

      await loadSubscriptionData()
      return response.data?.message || 'Subscription reactivated successfully!'
    }

    toast.promise(reactivatePromise(), {
      loading: 'Reactivating subscription...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to reactivate subscription',
    })
  }

  /**
   * Handle payment method update - redirects to Stripe Billing Portal
   */
  const handleUpdatePaymentMethod = async () => {
    const portalPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create-portal-session',
          returnUrl: `${window.location.origin}/dashboard/subscriptions-v2`,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to open billing portal')
      }

      if (response.data?.url) {
        window.location.href = response.data.url
      } else if (response.demo) {
        return 'Demo mode: Billing portal not available'
      }

      return 'Redirecting to billing portal...'
    }

    toast.promise(portalPromise(), {
      loading: 'Opening billing portal...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to open billing portal',
    })
  }

  /**
   * Handle invoice PDF download
   */
  const handleDownloadInvoice = async (invoice: Invoice) => {
    const downloadPromise = async () => {
      if (invoice.pdfUrl) {
        // Open PDF in new tab for download
        window.open(invoice.pdfUrl, '_blank')
        return `Downloading invoice ${invoice.number}...`
      } else if (invoice.hostedUrl) {
        // Open hosted invoice page
        window.open(invoice.hostedUrl, '_blank')
        return `Opening invoice ${invoice.number}...`
      } else {
        // Generate PDF via API
        const response = await fetchWithAuth('/api/invoices/download', {
          method: 'POST',
          body: JSON.stringify({ invoiceId: invoice.id }),
        })

        if (response.success && response.data?.url) {
          window.open(response.data.url, '_blank')
          return `Downloading invoice ${invoice.number}...`
        }

        throw new Error('Invoice PDF not available')
      }
    }

    toast.promise(downloadPromise(), {
      loading: `Preparing invoice ${invoice.number}...`,
      success: (message) => message,
      error: (err) => err.message || 'Failed to download invoice',
    })
  }

  /**
   * Handle plan change (upgrade or downgrade)
   */
  const handleChangePlan = async (newPlan: Plan) => {
    const changePlanPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'change-plan',
          newPlanId: newPlan.id,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to change plan')
      }

      setShowUpgradeDialog(false)
      await loadSubscriptionData()

      return response.data?.message || `Successfully changed to ${newPlan.name} plan`
    }

    toast.promise(changePlanPromise(), {
      loading: `Changing to ${newPlan.name} plan...`,
      success: (message) => message,
      error: (err) => err.message || 'Failed to change plan',
    })
  }

  /**
   * Handle adding a new payment method
   */
  const handleAddPaymentMethod = async () => {
    if (!cardNumber || !cardExpiry || !cardCvc) {
      toast.error('Please fill in all card details')
      return
    }

    const addPaymentPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          action: 'add-payment-method',
          card: {
            number: cardNumber.replace(/\s/g, ''),
            expMonth: cardExpiry.split('/')[0],
            expYear: cardExpiry.split('/')[1],
            cvc: cardCvc,
          },
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to add payment method')
      }

      setShowAddPaymentMethodDialog(false)
      setCardNumber('')
      setCardExpiry('')
      setCardCvc('')
      await loadSubscriptionData()

      return response.data?.message || 'Payment method added successfully'
    }

    toast.promise(addPaymentPromise(), {
      loading: 'Adding payment method...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to add payment method',
    })
  }

  /**
   * Handle export invoices
   */
  const handleExportInvoices = async () => {
    const exportPromise = async () => {
      if (invoices.length === 0) {
        throw new Error('No invoices to export')
      }

      const filteredInvoices = invoices.filter(inv => {
        if (filterStatus !== 'all' && inv.status !== filterStatus) return false
        return true
      })

      if (exportFormat === 'csv') {
        const csvContent = [
          'Invoice Number,Status,Amount,Currency,Date,PDF URL',
          ...filteredInvoices.map(inv =>
            `${inv.number},${inv.status},${inv.amount / 100},${inv.currency},${formatDate(inv.created)},${inv.pdfUrl || ''}`
          )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'json') {
        const jsonContent = JSON.stringify(filteredInvoices, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'pdf') {
        // For PDF export, we would typically call an API endpoint
        const response = await fetchWithAuth('/api/invoices/export-pdf', {
          method: 'POST',
          body: JSON.stringify({ invoiceIds: filteredInvoices.map(i => i.id) }),
        })

        if (response.success && response.data?.url) {
          window.open(response.data.url, '_blank')
        } else {
          // Fallback: open all PDFs
          filteredInvoices.forEach(inv => {
            if (inv.pdfUrl) window.open(inv.pdfUrl, '_blank')
          })
        }
      }

      setShowExportDialog(false)
      return `Exported ${filteredInvoices.length} invoices as ${exportFormat.toUpperCase()}`
    }

    toast.promise(exportPromise(), {
      loading: 'Exporting invoices...',
      success: (message) => message,
      error: (err) => err.message || 'Export failed',
    })
  }

  /**
   * Handle pause subscription
   */
  const handlePauseSubscription = async () => {
    const pausePromise = async () => {
      const response = await fetchWithAuth('/api/stripe/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          action: 'pause-subscription',
          duration: pauseDuration,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to pause subscription')
      }

      setShowPauseDialog(false)
      await loadSubscriptionData()

      return response.data?.message || `Subscription paused for ${pauseDuration.replace('_', ' ')}`
    }

    toast.promise(pausePromise(), {
      loading: 'Pausing subscription...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to pause subscription',
    })
  }

  /**
   * Handle resume subscription
   */
  const handleResumeSubscription = async () => {
    const resumePromise = async () => {
      const response = await fetchWithAuth('/api/stripe/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          action: 'resume-subscription',
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to resume subscription')
      }

      await loadSubscriptionData()
      return response.data?.message || 'Subscription resumed successfully'
    }

    toast.promise(resumePromise(), {
      loading: 'Resuming subscription...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to resume subscription',
    })
  }

  /**
   * Handle update billing address
   */
  const handleUpdateBillingAddress = async () => {
    if (!billingAddress.name || !billingAddress.email || !billingAddress.address) {
      toast.error('Please fill in required fields')
      return
    }

    const updateAddressPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/billing', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-billing-address',
          address: billingAddress,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to update billing address')
      }

      setShowBillingAddressDialog(false)
      return response.data?.message || 'Billing address updated successfully'
    }

    toast.promise(updateAddressPromise(), {
      loading: 'Updating billing address...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to update billing address',
    })
  }

  /**
   * Handle save subscription settings
   */
  const handleSaveSettings = async () => {
    const saveSettingsPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/settings', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-settings',
          settings: {
            autoRenew: autoRenewEnabled,
            emailNotifications: emailNotificationsEnabled,
          },
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to save settings')
      }

      setShowSettingsDialog(false)
      return response.data?.message || 'Settings saved successfully'
    }

    toast.promise(saveSettingsPromise(), {
      loading: 'Saving settings...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to save settings',
    })
  }

  /**
   * Handle apply filters
   */
  const handleApplyFilters = () => {
    toast.success(`Filters applied: Status - ${filterStatus}, Date Range - ${filterDateRange}`)
    setShowFilterDialog(false)
  }

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setFilterStatus('all')
    setFilterDateRange('all')
    toast.success('Filters reset')
    setShowFilterDialog(false)
  }

  /**
   * Handle view invoice details
   */
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewInvoiceDialog(true)
  }

  /**
   * Handle retry failed payment
   */
  const handleRetryPayment = async (invoiceId: string) => {
    const retryPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/invoices', {
        method: 'POST',
        body: JSON.stringify({
          action: 'retry-payment',
          invoiceId,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Payment retry failed')
      }

      await loadSubscriptionData()
      return response.data?.message || 'Payment successful'
    }

    toast.promise(retryPromise(), {
      loading: 'Retrying payment...',
      success: (message) => message,
      error: (err) => err.message || 'Payment retry failed',
    })
  }

  /**
   * Handle delete payment method
   */
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    const deletePromise = async () => {
      const response = await fetchWithAuth('/api/stripe/payment-methods', {
        method: 'DELETE',
        body: JSON.stringify({
          paymentMethodId,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete payment method')
      }

      await loadSubscriptionData()
      return response.data?.message || 'Payment method removed'
    }

    toast.promise(deletePromise(), {
      loading: 'Removing payment method...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to remove payment method',
    })
  }

  /**
   * Handle set default payment method
   */
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    const setDefaultPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          action: 'set-default',
          paymentMethodId,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to set default payment method')
      }

      await loadSubscriptionData()
      return response.data?.message || 'Default payment method updated'
    }

    toast.promise(setDefaultPromise(), {
      loading: 'Updating default payment method...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to update default payment method',
    })
  }

  /**
   * Handle contact support
   */
  const handleContactSupport = () => {
    toast.info('Opening support chat...')
    // In a real implementation, this would open a support widget or redirect to support page
    window.open('/support', '_blank')
  }

  /**
   * Handle request refund
   */
  const handleRequestRefund = async (invoiceId: string) => {
    const refundPromise = async () => {
      const response = await fetchWithAuth('/api/stripe/refunds', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
        }),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit refund request')
      }

      return response.data?.message || 'Refund request submitted. We will review and respond within 3-5 business days.'
    }

    toast.promise(refundPromise(), {
      loading: 'Submitting refund request...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to submit refund request',
    })
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === -1) return 'Unlimited'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
      incomplete: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      void: 'bg-red-100 text-red-800',
      uncollectible: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing, and usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettingsDialog(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => loadSubscriptionData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                      Your active subscription details
                    </CardDescription>
                  </div>
                </div>
                {subscription && (
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="text-2xl font-bold">{subscription.planName}</h3>
                      <p className="text-muted-foreground">
                        {formatCurrency(subscription.price)}/{subscription.interval}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next billing date</p>
                      <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">Subscription Ending</p>
                        <p className="text-sm text-yellow-700">
                          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleReactivateSubscription}
                      >
                        Reactivate
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setShowUpgradeDialog(true)}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                    <Button variant="outline" onClick={handleUpdatePaymentMethod}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddPaymentMethodDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                    <Button variant="outline" onClick={() => setShowBillingAddressDialog(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Billing Address
                    </Button>
                    {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                      <Button variant="outline" onClick={() => setShowPauseDialog(true)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Pause Subscription
                      </Button>
                    )}
                    {subscription.status === 'paused' && (
                      <Button variant="outline" onClick={handleResumeSubscription}>
                        <Zap className="h-4 w-4 mr-2" />
                        Resume Subscription
                      </Button>
                    )}
                    {!subscription.cancelAtPeriodEnd && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    You are currently on the free Starter plan
                  </p>
                  <Button onClick={() => setShowUpgradeDialog(true)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {usage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {usage.projects.used}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{usage.projects.limit === -1 ? 'Unlimited' : usage.projects.limit}
                    </span>
                  </p>
                  {usage.projects.limit !== -1 && (
                    <Progress value={usage.projects.percentage} className="mt-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatBytes(usage.storage.used)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{formatBytes(usage.storage.limit)}
                    </span>
                  </p>
                  {usage.storage.limit !== -1 && (
                    <Progress value={usage.storage.percentage} className="mt-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">AI Credits</span>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {usage.aiCredits.used}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{usage.aiCredits.limit === -1 ? 'Unlimited' : usage.aiCredits.limit}
                    </span>
                  </p>
                  {usage.aiCredits.limit !== -1 && (
                    <Progress value={usage.aiCredits.percentage} className="mt-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Team Members</span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {usage.teamMembers.used}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{usage.teamMembers.limit}
                    </span>
                  </p>
                  <Progress value={usage.teamMembers.percentage} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Methods Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment options</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddPaymentMethodDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {method.brand} ****{method.last4}
                            {method.isDefault && (
                              <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expMonth}/{method.expYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">No payment methods added</p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPaymentMethodDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const tabsList = document.querySelector('[value="invoices"]') as HTMLElement
                    tabsList?.click()
                    toast.info('Viewing all invoices')
                  }}>
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(invoice.created)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No invoices yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className={billingInterval === 'month' ? 'font-medium' : 'text-muted-foreground'}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <span className={billingInterval === 'year' ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {subscription?.planId === plan.id ? (
                    <Button className="w-full" disabled variant="outline">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedPlan(plan)
                        if (subscription) {
                          handleChangePlan(plan)
                        } else {
                          handleUpgrade(plan)
                        }
                      }}
                    >
                      {subscription ? 'Switch to ' : 'Get Started with '}
                      {plan.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>
                    View and download your past invoices
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleContactSupport}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Support
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(invoice.created)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <p className="font-medium min-w-[80px] text-right">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          {invoice.hostedUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invoice.hostedUrl!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.status === 'open' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryPayment(invoice.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                          {invoice.status === 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRequestRefund(invoice.id)}
                            >
                              Request Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
                  <p className="text-muted-foreground">
                    Your invoices will appear here once you subscribe to a paid plan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          {usage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projects Usage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle>Projects</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{usage.projects.used}</span>
                    <span className="text-muted-foreground">
                      of {usage.projects.limit === -1 ? 'Unlimited' : usage.projects.limit}
                    </span>
                  </div>
                  {usage.projects.limit !== -1 && (
                    <Progress value={usage.projects.percentage} className="h-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {usage.projects.limit === -1
                      ? 'Unlimited projects available'
                      : `${usage.projects.limit - usage.projects.used} projects remaining`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Storage Usage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Storage</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{formatBytes(usage.storage.used)}</span>
                    <span className="text-muted-foreground">
                      of {formatBytes(usage.storage.limit)}
                    </span>
                  </div>
                  {usage.storage.limit !== -1 && (
                    <Progress value={usage.storage.percentage} className="h-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {usage.storage.limit === -1
                      ? 'Unlimited storage available'
                      : `${formatBytes(usage.storage.limit - usage.storage.used)} remaining`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* AI Credits Usage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>AI Credits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{usage.aiCredits.used}</span>
                    <span className="text-muted-foreground">
                      of {usage.aiCredits.limit === -1 ? 'Unlimited' : usage.aiCredits.limit}
                    </span>
                  </div>
                  {usage.aiCredits.limit !== -1 && (
                    <Progress value={usage.aiCredits.percentage} className="h-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {usage.aiCredits.limit === -1
                      ? 'Unlimited AI credits available'
                      : `${usage.aiCredits.limit - usage.aiCredits.used} credits remaining this month`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Team Members Usage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Team Members</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{usage.teamMembers.used}</span>
                    <span className="text-muted-foreground">
                      of {usage.teamMembers.limit}
                    </span>
                  </div>
                  <Progress value={usage.teamMembers.percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {usage.teamMembers.limit - usage.teamMembers.used} seats remaining
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Usage Data Unavailable</h3>
                <p className="text-muted-foreground">
                  Subscribe to a plan to start tracking your usage
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {plans.filter(p => p.price > 0).map((plan) => (
              <div
                key={plan.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
                  selectedPlan?.id === plan.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {plan.name}
                      {plan.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(plan.price)}/{plan.interval}
                    </p>
                  </div>
                  {selectedPlan?.id === plan.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedPlan && (subscription ? handleChangePlan(selectedPlan) : handleUpgrade(selectedPlan))}
              disabled={!selectedPlan}
            >
              <Rocket className="h-4 w-4 mr-2" />
              {subscription ? 'Change Plan' : 'Upgrade Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
              <p className="font-medium text-yellow-800">What happens when you cancel:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>- You will retain access until {subscription && formatDate(subscription.currentPeriodEnd)}</li>
                <li>- Your data will be preserved but read-only</li>
                <li>- You can reactivate anytime before the period ends</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentMethodDialog} onOpenChange={setShowAddPaymentMethodDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment Method
            </DialogTitle>
            <DialogDescription>
              Add a new card to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()
                  setCardNumber(value.slice(0, 19))
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 4) {
                      setCardExpiry(value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value)
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Your payment information is secure and encrypted</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddPaymentMethodDialog(false)
              setCardNumber('')
              setCardExpiry('')
              setCardCvc('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Invoices
            </DialogTitle>
            <DialogDescription>
              Choose the format for your invoice export
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                  <SelectItem value="pdf">PDF (Documents)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoices.length} invoice(s) will be exported
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportInvoices}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Subscription Settings
            </DialogTitle>
            <DialogDescription>
              Configure your subscription preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Auto-Renew</p>
                <p className="text-sm text-muted-foreground">Automatically renew your subscription</p>
              </div>
              <Button
                variant={autoRenewEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRenewEnabled(!autoRenewEnabled)}
              >
                {autoRenewEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive billing and subscription emails</p>
              </div>
              <Button
                variant={emailNotificationsEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
              >
                {emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium mb-2">Billing Portal</p>
              <p className="text-sm text-muted-foreground mb-3">Access full billing management</p>
              <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Billing Portal
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              <Check className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Invoices
            </DialogTitle>
            <DialogDescription>
              Set filters to narrow down your invoice list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                  <SelectItem value="uncollectible">Uncollectible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Subscription Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pause Subscription
            </DialogTitle>
            <DialogDescription>
              Temporarily pause your subscription instead of canceling
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pause Duration</Label>
              <Select value={pauseDuration} onValueChange={setPauseDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="2_months">2 Months</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="font-medium text-blue-800">What happens when you pause:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- You will not be charged during the pause</li>
                <li>- Your data and settings are preserved</li>
                <li>- Access to premium features is limited</li>
                <li>- You can resume anytime</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePauseSubscription}>
              <Clock className="h-4 w-4 mr-2" />
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={showViewInvoiceDialog} onOpenChange={setShowViewInvoiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice?.number}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{selectedInvoice.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedInvoice.currency.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.created)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewInvoiceDialog(false)}>
              Close
            </Button>
            {selectedInvoice && (
              <>
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedInvoice.hostedUrl && (
                  <Button onClick={() => window.open(selectedInvoice.hostedUrl!, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Online
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Address Dialog */}
      <Dialog open={showBillingAddressDialog} onOpenChange={setShowBillingAddressDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Billing Address
            </DialogTitle>
            <DialogDescription>
              Update your billing information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="billingName">Full Name *</Label>
                <Input
                  id="billingName"
                  placeholder="John Doe"
                  value={billingAddress.name}
                  onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="billingEmail">Email *</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={billingAddress.email}
                  onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="billingAddress">Address *</Label>
                <Input
                  id="billingAddress"
                  placeholder="123 Main St"
                  value={billingAddress.address}
                  onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  placeholder="New York"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  placeholder="NY"
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPostal">Postal Code</Label>
                <Input
                  id="billingPostal"
                  placeholder="10001"
                  value={billingAddress.postalCode}
                  onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country</Label>
                <Select
                  value={billingAddress.country}
                  onValueChange={(value) => setBillingAddress({ ...billingAddress, country: value })}
                >
                  <SelectTrigger id="billingCountry">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBillingAddress}>
              <Check className="h-4 w-4 mr-2" />
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
