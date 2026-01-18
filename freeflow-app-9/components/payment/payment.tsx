'use client'

/**
 * Payment Component - Production-Ready with Stripe Integration
 *
 * Features:
 * - Full Stripe PaymentElement integration
 * - Real payment history from Supabase
 * - Bank transfer and crypto options
 * - Proper error handling and validation
 *
 * FIXED: P0 Critical - Added real Stripe CardElement integration
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StripePayment, usePaymentIntent } from '@/components/payments/stripe-payment-element'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Payment')

interface PaymentProps {
  amount: number
  projectId: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: Error) => void
}

interface PaymentHistory {
  id: string
  amount: number
  date: string
  status: 'succeeded' | 'failed' | 'pending'
  method: string
}

const Payment = ({ amount, projectId, onSuccess, onError }: PaymentProps) => {
  const supabase = createClient()
  const { clientSecret, isLoading: isCreatingIntent, createPaymentIntent } = usePaymentIntent()

  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [showHistory, setShowHistory] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch real payment history from Supabase
  const fetchPaymentHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, created_at, status, payment_method')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setPaymentHistory(
        (data || []).map(p => ({
          id: p.id,
          amount: p.amount / 100, // Convert from cents
          date: new Date(p.created_at).toLocaleDateString(),
          status: p.status as 'succeeded' | 'failed' | 'pending',
          method: p.payment_method || 'Credit Card'
        }))
      )
    } catch (error) {
      logger.error('Failed to fetch payment history', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [supabase, projectId])

  useEffect(() => {
    fetchPaymentHistory()
  }, [fetchPaymentHistory])

  // Initialize Stripe payment intent when card is selected
  useEffect(() => {
    if (selectedMethod === 'card' && !clientSecret) {
      createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: { projectId }
      }).catch(error => {
        logger.error('Failed to create payment intent', error)
        toast.error('Failed to initialize payment. Please try again.')
      })
    }
  }, [selectedMethod, amount, projectId, clientSecret, createPaymentIntent])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!billingDetails.name) {
      newErrors.name = 'Name is required'
    }

    if (!billingDetails.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(billingDetails.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!billingDetails.address) {
      newErrors.address = 'Address is required'
    }

    if (!selectedMethod) {
      newErrors.method = 'Please select a payment method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBankTransfer = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      // Create bank transfer payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          amount: Math.round(amount * 100),
          status: 'pending',
          payment_method: 'bank_transfer',
          billing_name: billingDetails.name,
          billing_email: billingDetails.email,
          billing_address: billingDetails.address,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Bank transfer initiated! Check your email for instructions.')
      setPaymentStatus('Bank transfer initiated. Please complete the transfer within 48 hours.')
      logger.info('Bank transfer payment created', { paymentId: data.id })

      // Refresh payment history
      fetchPaymentHistory()
    } catch (error) {
      logger.error('Bank transfer failed', error)
      toast.error('Failed to initiate bank transfer. Please try again.')
      setPaymentStatus('Bank transfer failed. Please try again.')
      onError?.(error instanceof Error ? error : new Error('Bank transfer failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCryptoPayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      // Create crypto payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          amount: Math.round(amount * 100),
          status: 'pending',
          payment_method: 'crypto',
          billing_name: billingDetails.name,
          billing_email: billingDetails.email,
          billing_address: billingDetails.address,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Crypto payment initiated! Check your email for wallet address.')
      setPaymentStatus('Crypto payment initiated. Send payment to the provided wallet address.')
      logger.info('Crypto payment created', { paymentId: data.id })

      // Refresh payment history
      fetchPaymentHistory()
    } catch (error) {
      logger.error('Crypto payment failed', error)
      toast.error('Failed to initiate crypto payment. Please try again.')
      setPaymentStatus('Crypto payment failed. Please try again.')
      onError?.(error instanceof Error ? error : new Error('Crypto payment failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripeSuccess = (paymentIntent: any) => {
    setPaymentStatus('Payment successful!')
    logger.info('Stripe payment successful', { paymentIntentId: paymentIntent.id })
    fetchPaymentHistory()
    onSuccess?.(paymentIntent)
  }

  const handleStripeError = (error: Error) => {
    setPaymentStatus('Payment failed. Please try again.')
    logger.error('Stripe payment failed', error)
    onError?.(error)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <p className="text-gray-500">Project ID: {projectId}</p>
          </div>

          <div data-testid="payment-methods" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger data-testid="payment-method-select">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
            </div>

            {/* Stripe Card Payment - Real Integration */}
            {selectedMethod === 'card' && (
              <div data-testid="card-element" className="space-y-4">
                {isCreatingIntent ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Initializing secure payment...</p>
                  </div>
                ) : clientSecret ? (
                  <StripePayment
                    clientSecret={clientSecret}
                    amount={Math.round(amount * 100)}
                    currency="usd"
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                    showOrderSummary={false}
                  />
                ) : (
                  <div className="p-4 border rounded text-center text-muted-foreground">
                    <p>Failed to initialize payment. Please refresh and try again.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bank Transfer and Crypto - Show billing form */}
            {(selectedMethod === 'bank' || selectedMethod === 'crypto') && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      data-testid="billing-name"
                      value={billingDetails.name}
                      onChange={e => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      data-testid="billing-email"
                      type="email"
                      value={billingDetails.email}
                      onChange={e => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Billing Address</label>
                    <Input
                      data-testid="billing-address"
                      value={billingDetails.address}
                      onChange={e => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>

                <Button
                  data-testid="submit-payment"
                  className="w-full"
                  onClick={selectedMethod === 'bank' ? handleBankTransfer : handleCryptoPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay via ${selectedMethod === 'bank' ? 'Bank Transfer' : 'Cryptocurrency'}`
                  )}
                </Button>
              </>
            )}

            {paymentStatus && (
              <div
                className={`text-center p-2 rounded ${
                  paymentStatus.includes('successful') || paymentStatus.includes('initiated')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {paymentStatus}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button
                  data-testid="payment-history-button"
                  variant="outline"
                >
                  Payment History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Previous Payments</DialogTitle>
                </DialogHeader>
                <ScrollArea data-testid="payment-history" className="h-[400px]">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No payment history found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentHistory.map(payment => (
                        <Card key={payment.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                <p className="text-sm text-gray-500">{payment.date}</p>
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-1 rounded text-sm ${
                                    payment.status === 'succeeded' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    payment.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}
                                >
                                  {payment.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">{payment.method}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Payment