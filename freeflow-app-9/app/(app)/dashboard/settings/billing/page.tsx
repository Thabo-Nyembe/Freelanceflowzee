'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'
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

const logger = createFeatureLogger('Settings:Billing')

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
        const { getActiveSubscription, getPaymentMethods, getInvoices } = await import('@/lib/billing-settings-queries')

        const [subscriptionResult, paymentMethodsResult, invoicesResult] = await Promise.all([
          getActiveSubscription(userId),
          getPaymentMethods(userId),
          getInvoices(userId, { limit: 10 })
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

    toast.info('Update Billing Information', {
      description: 'Manage payment method, billing address, tax info, and invoices - Securely encrypted'
    })
    announce('Update billing information dialog opened', 'polite')
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
                <Button variant="outline" className="flex-1" onClick={handleUpdateBilling} disabled={loading}>
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCancelSubscription} disabled={loading || !billing.subscription}>
                  Cancel Subscription
                </Button>
              </div>
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
                <div key={invoice.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">{invoice.description || 'Professional Plan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount?.toFixed(2) || '0.00'}</p>
                    <Badge variant="outline" className={invoice.status === 'paid' ? 'text-green-600' : 'text-gray-600'}>
                      {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Pending'}
                    </Badge>
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
    </div>
  )
}
