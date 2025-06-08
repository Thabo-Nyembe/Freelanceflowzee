'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PaymentClient() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const returnUrl = searchParams.get('return')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'password' | 'code'>('card')
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      // Simulate payment processing with realistic timing
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="container mx-auto p-6 max-w-md" data-testid="payment-container">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle data-testid="payment-title" className="flex items-center justify-center gap-2">
            💳 Unlock Premium Content
          </CardTitle>
          <CardDescription>
            Project: <span className="font-medium">{projectId || 'Premium Content'}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-600">Choose Access Method</h3>
            <div className="grid gap-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="w-full justify-start h-12"
                onClick={() => setPaymentMethod('card')}
                data-testid="payment-method-card"
              >
                💳 Credit Card Payment ($29)
              </Button>
              <Button
                variant={paymentMethod === 'password' ? 'default' : 'outline'}
                className="w-full justify-start h-12"
                onClick={() => setPaymentMethod('password')}
                data-testid="payment-method-password"
              >
                🔑 Access Password
              </Button>
              <Button
                variant={paymentMethod === 'code' ? 'default' : 'outline'}
                className="w-full justify-start h-12"
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
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardData.name}
                  onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  data-testid="card-name-input"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  maxLength={19}
                  data-testid="card-number-input"
                  suppressHydrationWarning
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                    maxLength={5}
                    data-testid="card-expiry-input"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input
                    id="cardCvc"
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                    maxLength={4}
                    data-testid="card-cvc-input"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full h-12"
                data-testid="submit-payment-button"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    🔒 Pay $29 Securely
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Password Access */}
          {paymentMethod === 'password' && (
            <div className="space-y-4" data-testid="password-access-form">
              <div className="space-y-2">
                <Label htmlFor="accessPassword">Access Password</Label>
                <Input
                  id="accessPassword"
                  type="password"
                  placeholder="Enter access password"
                  data-testid="access-password-input"
                  suppressHydrationWarning
                />
              </div>
              <Button
                onClick={() => handleAlternativeAccess('password', 'test-password')}
                disabled={isLoading}
                className="w-full h-12"
                data-testid="submit-password-button"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </span>
                ) : (
                  <>
                    🔑 Access with Password
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Code Access */}
          {paymentMethod === 'code' && (
            <div className="space-y-4" data-testid="code-access-form">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  placeholder="Enter access code"
                  data-testid="access-code-input"
                  suppressHydrationWarning
                />
              </div>
              <Button
                onClick={() => handleAlternativeAccess('code', 'test-code')}
                disabled={isLoading}
                className="w-full h-12"
                data-testid="submit-code-button"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </span>
                ) : (
                  <>
                    🎫 Access with Code
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Security Badges */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="text-xs">
                🛡️ SSL Secured
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ⚡ Instant Access
              </Badge>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Your payment information is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 