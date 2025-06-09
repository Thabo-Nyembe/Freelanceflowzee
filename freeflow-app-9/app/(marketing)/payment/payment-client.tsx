'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Lock, Play, Download, Star, CreditCard, User, Key } from 'lucide-react'

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
  const projectId = searchParams.get('project')
  const returnUrl = searchParams.get('return')
  
  // Client authentication state
  const [clientSession, setClientSession] = useState<ClientSession>({
    isAuthenticated: false,
    accessLevel: 'guest'
  })
  
  // UI state
  const [activeTab, setActiveTab] = useState<'preview' | 'login' | 'payment'>('preview')
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
            setActiveTab('preview') // Show content if they have access
          }
        } catch (error) {
          console.error('Error parsing client session:', error)
        }
      }
    }
    
    checkClientSession()
  }, [])

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
      setActiveTab('preview')

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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store premium access
      const accessData = {
        accessToken: `access_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        projectId: TEST_PROJECT.id,
        purchaseDate: new Date().toISOString()
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
      
      setSuccess('Payment successful! You now have premium access to all content.')
      setActiveTab('preview')

    } catch (error) {
      setError('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewClick = (item: any) => {
    if (item.isPremium && clientSession.accessLevel !== 'premium') {
      setError('This content requires premium access. Please purchase to unlock.')
      return
    }
    
    // Handle preview/download
    if (item.isPremium) {
      // Download premium content
      window.open(item.downloadUrl, '_blank')
    } else {
      // Show preview content
      window.open(item.previewUrl, '_blank')
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
    <div className="container mx-auto p-6 max-w-4xl" data-testid="payment-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Project Info & Previews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle data-testid="project-title" className="text-xl">
                    {TEST_PROJECT.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    By {TEST_PROJECT.creator} • Created {TEST_PROJECT.createdAt}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" data-testid="project-price">
                    ${(TEST_PROJECT.price / 100).toFixed(2)}
                  </div>
                  <Badge variant={clientSession.accessLevel === 'premium' ? 'default' : 'secondary'}>
                    {clientSession.accessLevel === 'premium' ? 'Premium Access' : 
                     clientSession.accessLevel === 'preview' ? 'Preview Access' : 'Guest'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{TEST_PROJECT.description}</p>
            </CardContent>
          </Card>

          {/* Content Previews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Project Content
              </CardTitle>
              <CardDescription>
                {clientSession.accessLevel === 'guest' && 'Login to access previews'}
                {clientSession.accessLevel === 'preview' && 'Preview available • Purchase for full access'}
                {clientSession.accessLevel === 'premium' && 'Full access • All content unlocked'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEST_PROJECT.previews.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      </div>
                      {item.isPremium && (
                        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handlePreviewClick(item)}
                      variant={item.isPremium && clientSession.accessLevel !== 'premium' ? 'outline' : 'default'}
                      size="sm"
                      className="w-full"
                      disabled={clientSession.accessLevel === 'guest'}
                    >
                      {clientSession.accessLevel === 'guest' ? (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          Login to Preview
                        </>
                      ) : item.isPremium ? (
                        clientSession.accessLevel === 'premium' ? (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Premium Content
                          </>
                        )
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          View Preview
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Authentication & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Access This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" disabled={clientSession.accessLevel === 'premium'}>
                    {clientSession.isAuthenticated ? 'Logged In' : 'Client Login'}
                  </TabsTrigger>
                  <TabsTrigger value="payment">
                    {clientSession.accessLevel === 'premium' ? 'Purchased' : 'Purchase'}
                  </TabsTrigger>
                </TabsList>

                {/* Client Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  {!clientSession.isAuthenticated ? (
                    <form onSubmit={handleClientLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="client-email">Email Address</Label>
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          data-testid="client-email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="access-code">Access Code (Optional)</Label>
                        <Input
                          id="access-code"
                          type="text"
                          placeholder="Enter access code"
                          value={loginData.accessCode}
                          onChange={(e) => setLoginData({...loginData, accessCode: e.target.value})}
                          data-testid="access-code"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="client-password">Password (Optional)</Label>
                        <Input
                          id="client-password"
                          type="password"
                          placeholder="Enter password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          data-testid="client-password"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading} data-testid="client-login-btn">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Logging In...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Login for Preview Access
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium">Logged in as</p>
                      <p className="text-sm text-gray-600">{clientSession.email}</p>
                      <Badge className="mt-2" variant={clientSession.accessLevel === 'premium' ? 'default' : 'secondary'}>
                        {clientSession.accessLevel === 'premium' ? 'Premium Access' : 'Preview Access'}
                      </Badge>
                    </div>
                  )}
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-4">
                  {clientSession.accessLevel === 'premium' ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium text-green-700">Premium Access Active</p>
                      <p className="text-sm text-gray-600">You have full access to all content</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Premium Access</span>
                          <span className="text-lg font-bold">${(TEST_PROJECT.price / 100).toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Unlock all content • Download all files • Lifetime access
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="payment-email">Email Address</Label>
                        <Input
                          id="payment-email"
                          type="email"
                          placeholder="your@email.com"
                          value={cardData.email}
                          onChange={(e) => setCardData({...cardData, email: e.target.value})}
                          data-testid="payment-email"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="John Smith"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value})}
                          data-testid="card-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                          data-testid="card-number"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                            data-testid="card-expiry"
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvc">CVC</Label>
                          <Input
                            id="card-cvc"
                            placeholder="123"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '').substring(0, 3)})}
                            data-testid="card-cvc"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading} data-testid="purchase-btn">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Purchase ${(TEST_PROJECT.price / 100).toFixed(2)}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              {/* Status Messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" data-testid="success-message">
                  {success}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Levels Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Access Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Guest</div>
                  <div className="text-xs text-gray-600">No access to content</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Preview</div>
                  <div className="text-xs text-gray-600">Limited previews only</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Premium</div>
                  <div className="text-xs text-gray-600">Full access & downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 