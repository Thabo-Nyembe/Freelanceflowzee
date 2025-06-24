'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Play, 
  Download, 
  Star, 
  CreditCard, 
  User, 
  Key,
  Check,
  Crown,
  Zap,
  Building2,
  Shield,
  LucideIcon
} from 'lucide-react'

// Define proper types for pricing plans
interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  billing: string
  stripePrice?: string
  description: string
  features: string[]
  cta: string
  popular: boolean
  icon: LucideIcon
  color: string
  trialDays?: number
  customPricing?: boolean
}

// Enhanced pricing plans with proper test IDs
const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Creator Free',
    price: 0,
    currency: 'USD',
    billing: 'month',
    description: 'Perfect for getting started with AI-powered creative tools',
    features: [
      'AI Create Studio (Free Models)',
      'Stable Diffusion XL Unlimited',
      'Basic File Sharing (1GB)',
      'Community Access',
      '2 Creative Fields',
      'Standard Support'
    ],
    cta: 'Start Free',
    popular: false,
    icon: Zap,
    color: 'text-green-500'
  },
  pro: {
    id: 'pro',
    name: 'Pro Creator',
    price: 29,
    currency: 'USD',
    billing: 'month',
    stripePrice: 'price_1RdYVtGfWWV489qXxMhUup05',
    description: 'Unlock premium AI models and professional features',
    features: [
      'All AI Models (GPT-4o, Claude, DALL-E)',
      'Premium AI Model Trials',
      'Unlimited AI Generation',
      'Escrow Payment System',
      'Video Studio Pro',
      'Advanced File Sharing (500GB)',
      '6+ Creative Fields',
      'Priority Support'
    ],
    cta: 'Start Pro Trial',
    popular: true,
    icon: Crown,
    color: 'text-blue-500',
    trialDays: 14
  },
  enterprise: {
    id: 'enterprise',
    name: 'Agency Enterprise',
    price: 79,
    currency: 'USD',
    billing: 'month',
    stripePrice: 'price_1RdYVuGfWWV489qXSKBpkliy',
    description: 'White-label solution for agencies and enterprises',
    features: [
      'Everything in Pro',
      'White-label AI Create Studio',
      'Custom AI Model Training',
      'Bulk Asset Generation',
      'Advanced Analytics',
      'Unlimited File Storage (2TB+)',
      'Custom Integrations',
      'Dedicated Account Manager'
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: Building2,
    color: 'text-purple-500',
    customPricing: true
  }
}

const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  price: 4999, // $49.99
  currency: 'usd',
  slug: 'premium-brand-identity-package',
  creator: 'Sarah Chen',
  createdAt: '2024-01-15',
  previews: [
    {
      id: 'prev_1',
      type: 'image',
      title: 'Logo Concept Preview',
      description: 'Initial logo design concept',
      thumbnailUrl: '/images/logo-preview-thumb.jpg',
      previewUrl: '/images/logo-preview.jpg',
      isPremium: false
    },
    {
      id: 'prev_2', 
      type: 'pdf',
      title: 'Brand Guidelines (Preview)',
      description: 'First 5 pages of complete brand guidelines',
      thumbnailUrl: '/images/guidelines-thumb.jpg',
      previewUrl: '/documents/guidelines-preview.pdf',
      isPremium: false
    },
    {
      id: 'prem_1',
      type: 'zip',
      title: 'Complete Logo Package',
      description: 'All logo files in multiple formats (SVG, PNG, EPS)',
      thumbnailUrl: '/images/logo-package-thumb.jpg',
      downloadUrl: '/downloads/logo-package.zip',
      isPremium: true
    },
    {
      id: 'prem_2',
      type: 'pdf',
      title: 'Complete Brand Guidelines',
      description: '50-page comprehensive brand guidelines document',
      thumbnailUrl: '/images/full-guidelines-thumb.jpg',
      downloadUrl: '/downloads/brand-guidelines-full.pdf',
      isPremium: true
    }
  ]
}

interface ClientSession {
  isAuthenticated: boolean
  clientId?: string
  email?: string
  accessLevel: 'guest' | 'preview' | 'premium'
  projectAccess?: string[]
}

export default function PaymentClient() {
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('project')
  const returnUrl = searchParams?.get('return')
  
  // Client authentication state
  const [clientSession, setClientSession] = useState<ClientSession>({
    isAuthenticated: false,
    accessLevel: 'guest'
  })
  
  // Enhanced UI state
  const [activeTab, setActiveTab] = useState<'pricing' | 'payment' | 'client-access'>('pricing')
  const [selectedPlan, setSelectedPlan] = useState(PRICING_PLANS.pro)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    accessCode: '',
    password: ''
  })
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: ''
  })

  // Check for existing client session on mount
  useEffect(() => {
    const checkClientSession = () => {
      const sessionData = localStorage.getItem('client_session')
      const projectAccess = localStorage.getItem(`project_access_${TEST_PROJECT.id}`)
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          setClientSession({
            ...session,
            accessLevel: projectAccess ? 'premium' : 'preview'
          })
          
          if (projectAccess) {
            setActiveTab('pricing') // Show pricing by default
          }
        } catch (error) {
          console.error('Error parsing client session:', error)
        }
      }
    }
    
    checkClientSession()
  }, [])

  const handlePlanSelection = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    if (plan.price > 0) {
      setActiveTab('payment')
    } else {
      // Handle free plan signup
      setSuccess('Free plan activated! Redirecting to dashboard...')
      setTimeout(() => {
        window.location.href = '/dashboard?plan=free'
      }, 2000)
    }
  }

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate client authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation for demo
      if (!loginData.email || (!loginData.accessCode && !loginData.password)) {
        throw new Error('Please provide email and either access code or password')
      }

      // Simulate successful login
      const clientSession: ClientSession = {
        isAuthenticated: true,
        clientId: `client_${Date.now()}`,
        email: loginData.email,
        accessLevel: 'preview',
        projectAccess: []
      }

      setClientSession(clientSession)
      localStorage.setItem('client_session', JSON.stringify(clientSession))
      setSuccess('Successfully logged in! You now have preview access.')
      setActiveTab('pricing')

    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create payment intent with enhanced API
      const response = await fetch('/api/payments/create-intent-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlan.price * 100, // Convert to cents
          currency: selectedPlan.currency.toLowerCase(),
          description: `FreeflowZee ${selectedPlan.name} Subscription`,
          customer_email: cardData.email,
          customer_name: cardData.name,
          subscription_price_id: selectedPlan.stripePrice,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { client_secret, subscription_id } = await response.json()
      
      // Store premium access
      const accessData = {
        accessToken: `access_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        projectId: TEST_PROJECT.id,
        purchaseDate: new Date().toISOString(),
        plan: selectedPlan.name,
        clientSecret: client_secret,
        subscriptionId: subscription_id
      }
      
      localStorage.setItem(`project_access_${TEST_PROJECT.id}`, JSON.stringify(accessData))
      
      // Update client session
      const updatedSession = {
        ...clientSession,
        accessLevel: 'premium' as const,
        projectAccess: [...(clientSession.projectAccess || []), TEST_PROJECT.id]
      }
      
      setClientSession(updatedSession)
      localStorage.setItem('client_session', JSON.stringify(updatedSession))
      
      setSuccess('Payment successful! You now have premium access. Redirecting to dashboard...')
      setTimeout(() => {
        window.location.href = '/dashboard?payment=success'
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewClick = (item: any) => {
    if (item.isPremium && clientSession.accessLevel !== 'premium') {
      setError('Premium content requires payment. Please upgrade your plan.')
      return
    }
    
    // Handle preview/download logic
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank')
    } else if (item.previewUrl) {
      window.open(item.previewUrl, '_blank')
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts: string[] = []
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
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
    }
    return v
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12" data-testid="payment-container">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your AI-Powered Creative Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Unlock the power of premium AI models (GPT-4o, Claude, DALL-E) with FreeflowZee. 
            Generate professional assets, share files securely with escrow payments, and manage creative projects seamlessly.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              SSL Secured
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              25,000+ Creatives
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              4.9/5 Rating
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pricing' | 'payment' | 'client-access')} className="max-w-6xl mx-auto" data-testid="payment-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing" data-testid="pricing-tab">Choose Plan</TabsTrigger>
            <TabsTrigger value="payment" data-testid="payment-tab">Payment</TabsTrigger>
            <TabsTrigger value="client-access" data-testid="client-access-tab">Client Access</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {Object.values(PRICING_PLANS).map((plan) => {
                const IconComponent = plan.icon
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${selectedPlan.id === plan.id ? 'bg-blue-50' : ''}`}
                    data-testid={`pricing-card-${plan.id}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <IconComponent className={`h-6 w-6 ${plan.color}`} />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-500">/{plan.billing}</span>
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className="w-full min-h-[44px]"
                        variant={plan.id === selectedPlan.id ? 'default' : 'outline'}
                        onClick={() => handlePlanSelection(plan)}
                        data-testid={`select-${plan.id}`}
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="max-w-2xl mx-auto">
              <Card data-testid="payment-form-container">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Complete Payment</span>
                    <Badge variant="outline">{selectedPlan.name}</Badge>
                  </CardTitle>
                  <div className="text-2xl font-bold">
                    ${selectedPlan.price}/{selectedPlan.billing}
                  </div>
                  <p className="text-gray-600">
                    Secure payment processing with Stripe. Includes escrow payment protection for all transactions.
                  </p>
                </CardHeader>
                
                <CardContent>
                  {success ? (
                    <div className="text-center py-8" data-testid="payment-success">
                      <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                      <p className="text-gray-600">{success}</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayment} className="space-y-4" data-testid="payment-form">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cardData.email}
                          onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                          required
                          data-testid="email-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          required
                          data-testid="name-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Card Details</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Card Number"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                            maxLength={19}
                            data-testid="card-number"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="MM/YY"
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                              maxLength={5}
                              data-testid="card-expiry"
                            />
                            <Input
                              placeholder="CVC"
                              value={cardData.cvc}
                              onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                              maxLength={4}
                              data-testid="card-cvc"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500" data-testid="card-element">
                          Stripe secure payment processing with Apple Pay & Google Pay support
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full min-h-[44px]" 
                        disabled={isLoading}
                        data-testid="submit-payment"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay ${selectedPlan.price}/{selectedPlan.billing}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" data-testid="payment-error">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Access Tab */}
          <TabsContent value="client-access">
            <div className="max-w-2xl mx-auto">
              <Card data-testid="client-access-container">
                <CardHeader>
                  <CardTitle>Client Access Portal</CardTitle>
                  <p className="text-gray-600">
                    Already a client? Access your projects and files securely with escrow payment protection.
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleClientLogin} className="space-y-4" data-testid="client-login">
                    <div>
                      <Label htmlFor="client-email">Email Address</Label>
                      <Input 
                        id="client-email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        data-testid="client-email-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="access-code">Access Code</Label>
                      <Input 
                        id="access-code" 
                        type="text" 
                        placeholder="Enter your access code"
                        value={loginData.accessCode}
                        onChange={(e) => setLoginData({ ...loginData, accessCode: e.target.value })}
                        data-testid="client-access-code"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full min-h-[44px]" 
                      disabled={isLoading}
                      data-testid="client-login-submit"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Access Portal
                    </Button>
                  </form>

                  {success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-600">{success}</p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer trust badges */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              256-bit SSL Encryption
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Stripe Secure Processing
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Escrow Payment Protection
            </div>
          </div>
          
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            All payments are processed securely through Stripe with escrow payment protection. 
            We never store your payment information. Cancel anytime. 14-day money-back guarantee on all paid plans.
          </p>
        </div>
      </div>
    </div>
  )
} 