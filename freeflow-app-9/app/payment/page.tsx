'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function PaymentForm() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const returnUrl = searchParams.get('return')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'password' | 'code'>('card')

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (returnUrl) {
        window.location.href = returnUrl
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlternativeAccess = async (method: 'password' | 'code', value: string) => {
    setIsLoading(true)
    try {
      // Simulate alternative access verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (returnUrl) {
        window.location.href = returnUrl
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Access verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md" data-testid="payment-container">
      <Card>
        <CardHeader>
          <CardTitle data-testid="payment-title">Unlock Premium Content</CardTitle>
          <CardDescription>
            Project: {projectId || 'Premium Content'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Choose Access Method</h3>
            <div className="space-y-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setPaymentMethod('card')}
                data-testid="payment-method-card"
              >
                💳 Credit Card Payment ($29)
              </Button>
              <Button
                variant={paymentMethod === 'password' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setPaymentMethod('password')}
                data-testid="payment-method-password"
              >
                🔑 Access Password
              </Button>
              <Button
                variant={paymentMethod === 'code' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setPaymentMethod('code')}
                data-testid="payment-method-code"
              >
                🎫 Access Code
              </Button>
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4" data-testid="card-payment-form">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border rounded-md"
                  data-testid="card-number-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border rounded-md"
                    data-testid="card-expiry-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border rounded-md"
                    data-testid="card-cvc-input"
                  />
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full"
                data-testid="submit-payment-button"
              >
                {isLoading ? 'Processing...' : 'Pay $29'}
              </Button>
            </div>
          )}

          {/* Password Access */}
          {paymentMethod === 'password' && (
            <div className="space-y-4" data-testid="password-access-form">
              <div>
                <label className="block text-sm font-medium mb-2">Access Password</label>
                <input
                  type="password"
                  placeholder="Enter access password"
                  className="w-full p-3 border rounded-md"
                  data-testid="access-password-input"
                />
              </div>
              <Button
                onClick={() => handleAlternativeAccess('password', 'test-password')}
                disabled={isLoading}
                className="w-full"
                data-testid="submit-password-button"
              >
                {isLoading ? 'Verifying...' : 'Access with Password'}
              </Button>
            </div>
          )}

          {/* Code Access */}
          {paymentMethod === 'code' && (
            <div className="space-y-4" data-testid="code-access-form">
              <div>
                <label className="block text-sm font-medium mb-2">Access Code</label>
                <input
                  type="text"
                  placeholder="Enter access code"
                  className="w-full p-3 border rounded-md"
                  data-testid="access-code-input"
                />
              </div>
              <Button
                onClick={() => handleAlternativeAccess('code', 'test-code')}
                disabled={isLoading}
                className="w-full"
                data-testid="submit-code-button"
              >
                {isLoading ? 'Verifying...' : 'Access with Code'}
              </Button>
            </div>
          )}

          {/* Security Badge */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              🔒 Secure Payment Processing
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Fallback component for Suspense boundary
function PaymentFallback() {
  return (
    <div className="container mx-auto p-6 max-w-md" data-testid="payment-container">
      <Card>
        <CardHeader>
          <CardTitle>Loading Payment Form...</CardTitle>
          <CardDescription>
            Preparing secure payment options
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentForm />
    </Suspense>
  )
}
