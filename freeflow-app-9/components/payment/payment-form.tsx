'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  price: 4999, // $49.99
  currency: 'usd',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  slug: 'premium-brand-identity-package'
}

export function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh and try again.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create payment intent
      const intentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: TEST_PROJECT.price,
          currency: TEST_PROJECT.currency,
          projectId: TEST_PROJECT.id,
        }),
      })

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const { clientSecret } = await intentResponse.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email,
            },
          },
        }
      )

      if (paymentError) {
        if (paymentError.decline_code === 'generic_decline') {
          setError('Your card was declined. Please try a different payment method.')
        } else if (paymentError.type === 'card_error') {
          setError(paymentError.message || 'Your card was declined')
        } else {
          setError(paymentError.message || 'Payment failed')
        }
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        setSuccess('Payment successful! Redirecting to unlocked content...')
        
        // Store access token with error handling
        try {
          localStorage.setItem(`project_access_${TEST_PROJECT.id}`, JSON.stringify({
            accessToken: `access_token_${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            projectId: TEST_PROJECT.id
          }))
        } catch (storageError) {
          console.warn('Failed to store access token in localStorage:', storageError)
          // Continue with redirect even if storage fails
        }

        // Redirect after delay
        setTimeout(() => {
          router.push(`/projects/${TEST_PROJECT.slug}/unlocked`)
        }, 2000)
      }

    } catch (err: unknown) {
      console.error('Payment error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6" data-testid="payment-summary">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span>{TEST_PROJECT.title}</span>
          <span className="font-bold" data-testid="project-price">
            ${(TEST_PROJECT.price / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} data-testid="payment-form">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
            data-testid="email-input"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3" data-testid="card-element">
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
                hidePostalCode: false,
              }}
              onChange={(event) => {
                if (event.error) {
                  setError(event.error.message)
                } else {
                  setError('')
                }
              }}
            />
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Test Cards:</strong><br />
              Success: 4242 4242 4242 4242<br />
              Decline: 4000 0000 0000 0002<br />
              Use any future date and any 3-digit CVC
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="card-errors">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" data-testid="payment-success">
            {success}
          </div>
        )}

        {(loading || success || error) && (
          <div className="mb-4" data-testid="payment-result">
            <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              {loading && 'Processing payment...'}
              {success && 'Payment completed successfully!'}
              {error && 'Payment processing encountered an issue.'}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="submit-payment-btn"
        >
          {loading ? 'Processing...' : `Complete Payment - $${(TEST_PROJECT.price / 100).toFixed(2)}`}
        </button>
      </form>
    </div>
  )
} 