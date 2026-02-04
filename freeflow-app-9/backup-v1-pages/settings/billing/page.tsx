'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Check, ArrowRight, Building, Receipt, Download, Star } from 'lucide-react'

const logger = createSimpleLogger('Settings:Billing')

interface BillingData {
  subscription?: any
  paymentMethods?: any[]
  invoices?: any[]
}

export default function BillingPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [billing, setBilling] = useState<BillingData>({})
  const [loading, setLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Dialog states
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false)
  const [showBillingAddressDialog, setShowBillingAddressDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    setAsDefault: true
  })

  const [billingAddress, setBillingAddress] = useState({
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  })

  // Available plans
  const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['5 projects', '1 team member', 'Basic storage'] },
    { id: 'professional', name: 'Professional', price: 29, features: ['Unlimited projects', '10 team members', '100GB storage', 'Priority support'] },
    { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Unlimited everything', 'Unlimited team members', '1TB storage', '24/7 support', 'Custom integrations'] }
  ]

  useEffect(() => {
    const loadBillingData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        logger.info('Loading billing data', { userId })

        // Dynamic import for code splitting
        const { getUserSubscription, getUserPaymentMethods, getUserInvoices } = await import('@/lib/billing-settings-queries')

        const [subscriptionResult, paymentMethodsResult, invoicesResult] = await Promise.all([
          getUserSubscription(userId),
          getUserPaymentMethods(userId),
          getUserInvoices(userId, 10)
        ])

        setBilling({
          subscription: subscriptionResult.data,
          paymentMethods: paymentMethodsResult.data || [],
          invoices: invoicesResult.data || []
        })

        logger.info('Billing data loaded', {
          hasSubscription: !!subscriptionResult.data,
          paymentMethodCount: paymentMethodsResult.data?.length || 0,
          invoiceCount: invoicesResult.data?.length || 0,
          userId
        })
        announce('Billing information loaded successfully', 'polite')
      } catch (error) {
        logger.error('Failed to load billing data', { error, userId })
        toast.error('Failed to load billing information')
        announce('Error loading billing information', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadBillingData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateBilling = () => {
    logger.info('Update billing information opened', { userId })
    setShowPaymentMethodDialog(true)
    announce('Update billing information dialog opened', 'polite')
  }

  const handleChangePlan = () => {
    logger.info('Change plan dialog opened', { userId })
    setShowChangePlanDialog(true)
  }

  const handleSelectPlan = async (planId: string) => {
    if (!userId) return

    setIsSaving(true)
    try {
      const selectedPlan = plans.find(p => p.id === planId)
      logger.info('Plan change initiated', { planId, planName: selectedPlan?.name, userId })

      // Get subscription ID and update via database
      const { changePlan, getUserSubscription, createSubscription } = await import('@/lib/billing-settings-queries')

      if (billing.subscription?.id) {
        // Update existing subscription
        const priceMap: Record<string, number> = { free: 0, professional: 29, enterprise: 99 }
        const result = await changePlan(billing.subscription.id, planId as any, priceMap[planId] || 0)
        if (result.error) throw result.error
        setBilling(prev => ({ ...prev, subscription: result.data }))
      } else {
        // Create new subscription
        const priceMap: Record<string, number> = { free: 0, professional: 29, enterprise: 99 }
        const result = await createSubscription(userId, {
          plan_type: planId as any,
          status: 'active',
          billing_interval: 'monthly',
          amount: priceMap[planId] || 0,
          currency: 'USD',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          metadata: {}
        })
        if (result.error) throw result.error
        setBilling(prev => ({ ...prev, subscription: result.data }))
      }

      toast.success('Plan Updated', {
        description: `You are now on the ${selectedPlan?.name} plan`
      })
      announce(`Plan changed to ${selectedPlan?.name}`, 'polite')
      setShowChangePlanDialog(false)
    } catch (error) {
      logger.error('Failed to change plan', { error, planId, userId })
      toast.error('Failed to update plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePaymentMethod = async () => {
    if (!userId) return

    if (!paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear || !paymentForm.cvv) {
      toast.error('Please fill in all card details')
      return
    }

    setIsSaving(true)
    try {
      logger.info('Saving payment method to database', { userId, lastFour: paymentForm.cardNumber.slice(-4) })

      // Save to database (only store masked card info - never full card number)
      const { createPaymentMethod, getUserPaymentMethods } = await import('@/lib/billing-settings-queries')

      const result = await createPaymentMethod(userId, {
        method_type: 'card',
        is_default: paymentForm.setAsDefault,
        card_brand: detectCardBrand(paymentForm.cardNumber),
        card_last4: paymentForm.cardNumber.slice(-4),
        card_exp_month: parseInt(paymentForm.expiryMonth),
        card_exp_year: parseInt(`20${paymentForm.expiryYear}`),
        is_verified: false,
        is_active: true,
        metadata: {
          cardholder_name: paymentForm.cardholderName,
          added_via: 'dashboard'
        }
      })

      if (result.error) throw result.error

      toast.success('Payment Method Added', {
        description: `Card ending in ${paymentForm.cardNumber.slice(-4)} saved securely`
      })
      announce('Payment method added successfully', 'polite')
      setPaymentForm({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', cardholderName: '', setAsDefault: true })
      setShowPaymentMethodDialog(false)

      // Refresh payment methods from database
      const paymentMethodsResult = await getUserPaymentMethods(userId)
      setBilling(prev => ({ ...prev, paymentMethods: paymentMethodsResult.data || [] }))
    } catch (error) {
      logger.error('Failed to save payment method to database', { error, userId })
      toast.error('Failed to add payment method')
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function to detect card brand
  const detectCardBrand = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0)
    const firstTwo = cardNumber.substring(0, 2)
    if (firstDigit === '4') return 'visa'
    if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'mastercard'
    if (['34', '37'].includes(firstTwo)) return 'amex'
    if (firstTwo === '65' || cardNumber.startsWith('6011')) return 'discover'
    return 'unknown'
  }

  const handleSaveBillingAddress = async () => {
    if (!userId) return

    if (!billingAddress.addressLine1 || !billingAddress.city || !billingAddress.postalCode) {
      toast.error('Please fill in required address fields')
      return
    }

    setIsSaving(true)
    try {
      logger.info('Saving billing address to database', { userId, city: billingAddress.city })

      // Save billing address to database
      const { createBillingAddress, getDefaultBillingAddress, updateBillingAddress } = await import('@/lib/billing-settings-queries')

      // Check if user already has a billing address
      const existingAddress = await getDefaultBillingAddress(userId)

      if (existingAddress.data) {
        // Update existing address
        const result = await updateBillingAddress(existingAddress.data.id, {
          line1: billingAddress.addressLine1,
          line2: billingAddress.addressLine2 || undefined,
          city: billingAddress.city,
          state: billingAddress.state || undefined,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        })
        if (result.error) throw result.error
      } else {
        // Create new address
        const result = await createBillingAddress(userId, {
          line1: billingAddress.addressLine1,
          line2: billingAddress.addressLine2 || undefined,
          city: billingAddress.city,
          state: billingAddress.state || undefined,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country,
          is_default: true
        })
        if (result.error) throw result.error
      }

      toast.success('Billing Address Updated', {
        description: 'Your billing address has been saved securely'
      })
      announce('Billing address updated', 'polite')
      setShowBillingAddressDialog(false)
    } catch (error) {
      logger.error('Failed to save billing address to database', { error, userId })
      toast.error('Failed to update billing address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadInvoice = (invoice: any) => {
    logger.info('Downloading invoice', { invoiceId: invoice.id, userId })
    toast.success('Downloading Invoice', {
      description: `Invoice for ${new Date(invoice.invoice_date).toLocaleDateString()} is being prepared`
    })
    // In production, this would trigger an actual file download
  }

  const handleCancelSubscription = () => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }
    logger.info('Cancel subscription initiated', { userId })
    setShowCancelConfirm(true)
  }

  const handleConfirmCancelSubscription = async () => {
    if (!userId) return

    const activeUntil = billing.subscription?.current_period_end || 'January 15, 2025'

    try {
      const { cancelSubscription } = await import('@/lib/billing-settings-queries')
      const { error } = await cancelSubscription(userId)

      if (error) throw new Error(error.message)

      logger.info('Subscription canceled', { activeUntil, userId })

      toast.info('Subscription Canceled', {
        description: `Active until ${activeUntil}. You will switch to the free plan after that`
      })
      announce('Subscription canceled successfully', 'polite')

      // Reload billing data
      const { getActiveSubscription } = await import('@/lib/billing-settings-queries')
      const result = await getActiveSubscription(userId)
      setBilling({ ...billing, subscription: result.data })
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, userId })
      toast.error('Failed to cancel subscription')
      announce('Error canceling subscription', 'assertive')
    } finally {
      setShowCancelConfirm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 border rounded-lg animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : billing.subscription ? (
                <>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-purple-900">
                          {billing.subscription.plan_name || 'Professional Plan'}
                        </h3>
                        <p className="text-purple-700">{billing.subscription.plan_description || 'Full access to all features'}</p>
                      </div>
                      <Badge className="bg-purple-600 text-white">
                        {billing.subscription.status || 'Active'}
                      </Badge>
                    </div>
                    <div className="mt-3 text-2xl font-bold text-purple-900">
                      ${billing.subscription.amount || 29}/{billing.subscription.billing_interval || 'month'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Next billing date: {billing.subscription.current_period_end ? new Date(billing.subscription.current_period_end).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment method: {billing.paymentMethods?.[0]?.last_four ? `**** **** **** ${billing.paymentMethods[0].last_four}` : 'No payment method'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 border rounded-lg text-center text-gray-500">
                  No active subscription
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleChangePlan} disabled={loading}>
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCancelSubscription} disabled={loading || !billing.subscription}>
                  Cancel Subscription
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowBillingAddressDialog(true)} disabled={loading}>
                <Building className="w-4 h-4 mr-2" />
                Update Billing Address
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 border rounded-lg animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : billing.paymentMethods && billing.paymentMethods.length > 0 ? (
                billing.paymentMethods.map((method, index) => (
                  <div key={method.id || index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                        <div>
                          <p className="font-medium">**** **** **** {method.last_four || '****'}</p>
                          <p className="text-sm text-gray-500">
                            Expires {method.expiry_month || '**'}/{method.expiry_year || '**'}
                          </p>
                        </div>
                      </div>
                      {method.is_default && <Badge variant="outline">Default</Badge>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 border rounded-lg text-center text-gray-500">
                  No payment methods added
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={handleUpdateBilling} disabled={loading}>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border rounded-lg animate-pulse">
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : billing.invoices && billing.invoices.length > 0 ? (
              billing.invoices.map((invoice, index) => (
                <div key={invoice.id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{invoice.description || 'Professional Plan'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount?.toFixed(2) || '0.00'}</p>
                      <Badge variant="outline" className={invoice.status === 'paid' ? 'text-green-600' : 'text-gray-600'}>
                        {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Pending'}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadInvoice(invoice)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 border rounded-lg text-center text-gray-500">
                No billing history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to premium features but keep your data until the end of your billing period. You can resubscribe anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelSubscription}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              Choose Your Plan
            </DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-purple-400 ${
                  billing.subscription?.plan_id === plan.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    ${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4"
                  variant={billing.subscription?.plan_id === plan.id ? 'outline' : 'default'}
                  disabled={isSaving || billing.subscription?.plan_id === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {billing.subscription?.plan_id === plan.id ? 'Current Plan' : 'Select'}
                  {billing.subscription?.plan_id !== plan.id && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Add Payment Method
            </DialogTitle>
            <DialogDescription>
              Enter your card details securely
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input
                value={paymentForm.cardholderName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                placeholder="4242 4242 4242 4242"
                maxLength={16}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  value={paymentForm.expiryMonth}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                  placeholder="MM"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  value={paymentForm.expiryYear}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                  placeholder="YY"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  type="password"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="***"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="checkbox"
                checked={paymentForm.setAsDefault}
                onChange={(e) => setPaymentForm({ ...paymentForm, setAsDefault: e.target.checked })}
                className="rounded"
              />
              <Label className="text-sm">Set as default payment method</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentMethodDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePaymentMethod} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Address Dialog */}
      <Dialog open={showBillingAddressDialog} onOpenChange={setShowBillingAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-500" />
              Billing Address
            </DialogTitle>
            <DialogDescription>
              Update your billing address for invoices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name (Optional)</Label>
              <Input
                value={billingAddress.company}
                onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 1 *</Label>
              <Input
                value={billingAddress.addressLine1}
                onChange={(e) => setBillingAddress({ ...billingAddress, addressLine1: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={billingAddress.addressLine2}
                onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                placeholder="Suite 100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  placeholder="San Francisco"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                  placeholder="CA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Postal Code *</Label>
                <Input
                  value={billingAddress.postalCode}
                  onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                  placeholder="94102"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <select
                  className="w-full p-2 rounded border bg-background"
                  value={billingAddress.country}
                  onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingAddressDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBillingAddress} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
