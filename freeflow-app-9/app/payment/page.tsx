'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('project') ?? null
  const returnUrl = searchParams?.get('return') ?? null
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'password' | 'code'>('card')
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (returnUrl) {
        window.location.href = returnUrl
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setError('Payment failed. Please try again.')
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlternativeAccess = async (method: 'password' | 'code', value: string) => {
    setIsLoading(true)
    setError('')
    try {
      // Simulate alternative access verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (returnUrl) {
        window.location.href = returnUrl
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setError('Access verification failed. Please try again.')
      console.error('Access verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8" data-testid="payment-page">
      <Card className="max-w-2xl mx-auto" data-testid="payment-container">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="card" className="space-y-4" data-testid="payment-tabs">
            <TabsList className="grid grid-cols-3 gap-4">
              <TabsTrigger
                value="card"
                onClick={() => setPaymentMethod('card')}
                data-testid="payment-method-card"
              >
                Credit Card
              </TabsTrigger>
              <TabsTrigger
                value="password"
                onClick={() => setPaymentMethod('password')}
                data-testid="payment-method-password"
              >
                Password
              </TabsTrigger>
              <TabsTrigger
                value="code"
                onClick={() => setPaymentMethod('code')}
                data-testid="payment-method-code"
              >
                Access Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              <div className="space-y-4" data-testid="card-payment-form">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    data-testid="email-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    data-testid="card-number-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input
                      id="card-expiry"
                      type="text"
                      placeholder="MM/YY"
                      data-testid="card-expiry-input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      type="text"
                      placeholder="123"
                      data-testid="card-cvc-input"
                      required
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="submit-payment-button"
                >
                  {isLoading ? 'Processing...' : 'Complete Payment'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="space-y-4" data-testid="password-access-form">
                <div>
                  <Label htmlFor="access-password">Access Password</Label>
                  <Input
                    id="access-password"
                    type="password"
                    placeholder="Enter access password"
                    data-testid="access-password-input"
                    required
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
            </TabsContent>

            <TabsContent value="code">
              <div className="space-y-4" data-testid="code-access-form">
                <div>
                  <Label htmlFor="access-code">Access Code</Label>
                  <Input
                    id="access-code"
                    type="text"
                    placeholder="Enter access code"
                    data-testid="access-code-input"
                    required
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
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 text-red-600 text-sm" data-testid="access-error">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <Badge variant="secondary" className="text-xs">
              🔒 Secure Payment Processing
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 