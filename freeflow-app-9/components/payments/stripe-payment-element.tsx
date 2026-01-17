'use client'

/**
 * World-Class Stripe PaymentElement Component
 *
 * Features:
 * - PaymentElement (recommended by Stripe)
 * - Automatic payment method detection
 * - Apple Pay / Google Pay / Link support
 * - Loading states and error handling
 * - Accessibility compliant
 *
 * Based on: @stripe/react-stripe-js (MIT License)
 * Reference: https://stripe.com/docs/payments/payment-element
 */

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions, Appearance } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, CreditCard, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

export interface StripePaymentProps {
  clientSecret: string
  amount: number
  currency?: string
  returnUrl?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
  className?: string
  appearance?: Appearance
  showOrderSummary?: boolean
  orderItems?: Array<{
    name: string
    description?: string
    amount: number
    quantity?: number
  }>
}

// Custom appearance for dark/light mode support
const defaultAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    '.Input:focus': {
      border: '2px solid #6366f1',
      boxShadow: '0 0 0 1px #6366f1',
    },
    '.Label': {
      fontWeight: '500',
    },
  },
}

// Inner checkout form component
function CheckoutForm({
  amount,
  currency = 'usd',
  returnUrl,
  onSuccess,
  onError,
  onCancel,
  showOrderSummary,
  orderItems,
}: Omit<StripePaymentProps, 'clientSecret' | 'className' | 'appearance'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')

  useEffect(() => {
    if (!stripe) return

    // Check if we're returning from a redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) return

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setPaymentStatus('succeeded')
          toast.success('Payment successful!')
          onSuccess?.(paymentIntent)
          break
        case 'processing':
          toast.info('Your payment is processing.')
          break
        case 'requires_payment_method':
          setErrorMessage('Your payment was not successful, please try again.')
          break
        default:
          setErrorMessage('Something went wrong.')
          break
      }
    })
  }, [stripe, onSuccess])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setPaymentStatus('processing')

    try {
      // Validate form
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || 'Validation failed')
        setPaymentStatus('failed')
        setIsLoading(false)
        return
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Payment failed')
        } else {
          setErrorMessage('An unexpected error occurred.')
        }
        setPaymentStatus('failed')
        onError?.(new Error(error.message))
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('succeeded')
        toast.success('Payment successful!')
        onSuccess?.(paymentIntent)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed')
      setErrorMessage(error.message)
      setPaymentStatus('failed')
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">
          Your payment of {formatCurrency(amount)} has been processed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      {showOrderSummary && orderItems && orderItems.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Order Summary</h3>
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  {item.quantity && item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Payment Details</span>
        </div>

        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link'],
          }}
          onChange={(event) => {
            setIsComplete(event.complete)
            if (event.complete) {
              setErrorMessage(null)
            }
          }}
        />
      </div>

      {/* Supported Payment Methods */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>Apple Pay, Google Pay, and cards accepted</span>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements || !isComplete}
          className={cn("flex-1", onCancel ? '' : 'w-full')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </div>
    </form>
  )
}

// Main export component with Elements provider
export function StripePayment({
  clientSecret,
  amount,
  currency = 'usd',
  returnUrl,
  onSuccess,
  onError,
  onCancel,
  className,
  appearance = defaultAppearance,
  showOrderSummary = true,
  orderItems,
}: StripePaymentProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  }

  if (!clientSecret) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading payment form...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Enter your payment details to complete the transaction securely.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            currency={currency}
            returnUrl={returnUrl}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            showOrderSummary={showOrderSummary}
            orderItems={orderItems}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}

// Hook for creating payment intent
export function usePaymentIntent() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntent = async (params: {
    amount: number
    currency?: string
    metadata?: Record<string, string>
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      return data.clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    clientSecret,
    isLoading,
    error,
    createPaymentIntent,
  }
}

export default StripePayment
