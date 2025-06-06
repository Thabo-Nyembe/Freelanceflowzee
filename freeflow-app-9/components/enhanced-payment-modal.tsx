'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
  PaymentRequestButtonElement,
  usePaymentRequest
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, CreditCard, Smartphone, Check } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
  amount: number
  currency: string
  description: string
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
  onError: (error: string) => void
  customerEmail?: string
  savePaymentMethod?: boolean
}

// Apple Pay / Google Pay Component
function PaymentRequestForm({ amount, currency, description, onSuccess, onError }: {
  amount: number
  currency: string
  description: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<any>(null)

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: currency.toLowerCase(),
        total: {
          label: description,
          amount: amount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // Check if Apple Pay / Google Pay is available
      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr)
        }
      })

      pr.on('paymentmethod', async (ev) => {
        try {
          // Create payment intent on server
          const response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              currency,
              description,
              payment_method_types: ['apple_pay', 'google_pay', 'card']
            })
          })

          const { client_secret } = await response.json()

          // Confirm payment
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            client_secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          )

          if (confirmError) {
            ev.complete('fail')
            onError(confirmError.message!)
          } else {
            ev.complete('success')
            if (paymentIntent.status === 'succeeded') {
              onSuccess(paymentIntent.id)
            }
          }
        } catch (error) {
          ev.complete('fail')
          onError('Payment processing failed')
        }
      })
    }
  }, [stripe, amount, currency, description, onSuccess, onError])

  if (!paymentRequest) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm font-medium">Quick Pay</span>
        <Badge variant="secondary" className="text-xs">Recommended</Badge>
      </div>
      <PaymentRequestButtonElement 
        options={{ paymentRequest }}
        className="payment-request-button"
      />
      <div className="flex items-center my-4">
        <Separator className="flex-1" />
        <span className="px-2 text-xs text-muted-foreground">or pay with card</span>
        <Separator className="flex-1" />
      </div>
    </div>
  )
}

// Card Payment Form
function CardPaymentForm({ 
  amount, 
  currency, 
  description, 
  onSuccess, 
  onError, 
  customerEmail,
  savePaymentMethod = false 
}: {
  amount: number
  currency: string
  description: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  customerEmail?: string
  savePaymentMethod?: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(customerEmail || '')
  const [name, setName] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment intent
      const response = await fetch('/api/payments/create-intent-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          description,
          customer_email: email,
          customer_name: name,
          save_payment_method: savePaymentMethod,
          payment_method_types: ['card', 'apple_pay', 'google_pay']
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { client_secret, customer_id } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
          },
        },
        setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
      })

      if (error) {
        onError(error.message!)
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Card Information</Label>
        <div className="border rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {savePaymentMethod && (
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">
            Save payment method for future use
          </span>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </>
        )}
      </Button>
    </form>
  )
}

// Main Enhanced Payment Modal
export function EnhancedPaymentModal({
  amount,
  currency,
  description,
  onSuccess,
  onCancel,
  onError,
  customerEmail,
  savePaymentMethod = false
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'request' | 'card'>('request')

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Complete Payment</span>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              ×
            </Button>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
          <div className="text-2xl font-bold">
            ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </div>
        </CardHeader>
        
        <CardContent>
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentRequestForm
              amount={amount}
              currency={currency}
              description={description}
              onSuccess={onSuccess}
              onError={onError}
            />
            
            <CardPaymentForm
              amount={amount}
              currency={currency}
              description={description}
              onSuccess={onSuccess}
              onError={onError}
              customerEmail={customerEmail}
              savePaymentMethod={savePaymentMethod}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedPaymentModal 