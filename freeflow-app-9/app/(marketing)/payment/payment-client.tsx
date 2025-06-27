'use client'

import { useState } from 'react'

export default function PaymentClient() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Client</h1>
      <p>Payment processing interface will be implemented here.</p>
    </div>
  )
}
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, )
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : )
    }
    return v
  }

  return (
    <div className= "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className= "container mx-auto px-4 py-12" data-testid= "payment-container" suppressHydrationWarning>
        
        {/* Header */}
        <div className= "text-center mb-12">
          <h1 className= "text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your AI-Powered Creative Plan
          </h1>
          <p className= "text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Unlock the power of premium AI models (GPT-4o, Claude, DALL-E) with FreeflowZee. 
            Generate professional assets, share files securely with escrow payments, and manage creative projects seamlessly.
          </p>
          
          {/* Trust indicators */}
          <div className= "flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className= "flex items-center">
              <Shield className= "h-4 w-4 mr-1" />
              SSL Secured
            </div>
            <div className= "flex items-center">
              <User className= "h-4 w-4 mr-1" />
              25,000+ Creatives
            </div>
            <div className= "flex items-center">
              <Star className= "h-4 w-4 mr-1 text-yellow-500" />
              4.9/5 Rating
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className= "max-w-6xl mx-auto" data-testid= "payment-tabs" suppressHydrationWarning>
          <TabsList className= "grid w-full grid-cols-3">
            <TabsTrigger value= "pricing" data-testid= "pricing-tab" suppressHydrationWarning>Choose Plan</TabsTrigger>
            <TabsTrigger value= "payment" data-testid= "payment-tab" suppressHydrationWarning>Payment</TabsTrigger>
            <TabsTrigger value= "client-access" data-testid= "client-access-tab" suppressHydrationWarning>Client Access</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value= "pricing" className= "space-y-8" suppressHydrationWarning>
            <div className= "grid md:grid-cols-3 gap-8">
              {Object.values(PRICING_PLANS).map((plan) => {
                const IconComponent = plan.icon
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : } ${selectedPlan?.id === plan.id ? 'bg-blue-50' : }`}
                    data-testid={`pricing-card-${plan.id}`}
                    suppressHydrationWarning
                  >
                    {plan.popular && (
                      <Badge className= "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500" suppressHydrationWarning>
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader className= "text-center">
                      <div className= "flex items-center justify-center mb-2">
                        <IconComponent className={`h-6 w-6 ${plan.color}`} />
                      </div>
                      <CardTitle className= "text-2xl">{plan.name}</CardTitle>
                      <div className= "text-3xl font-bold">
                        ${plan.price}
                        <span className= "text-sm font-normal text-gray-500">/{plan.billing}</span>
                      </div>
                      <p className= "text-gray-600">{plan.description}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className= "space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className= "flex items-start">
                            <Check className= "h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className= "text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className= "w-full min-h-[44px]
                        variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
                        onClick={() => handlePlanSelect(plan)}
                        data-testid={`select-${plan.id}`}
                        suppressHydrationWarning
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
          <TabsContent value= "payment" suppressHydrationWarning>
            <div className= "max-w-2xl mx-auto">
              <Card data-testid= "payment-form-container">
                <CardHeader>
                  <CardTitle className= "flex items-center justify-between">
                    <span>Complete Payment</span>
                    {selectedPlan && (
                      <Badge variant= "outline">{selectedPlan.name}</Badge>
                    )}
                  </CardTitle>
                  {selectedPlan && (
                    <div className= "text-2xl font-bold">
                      ${selectedPlan.price}/{selectedPlan.billing}
                    </div>
                  )}
                  <p className= "text-gray-600">
                    Secure payment processing with Stripe. Includes escrow payment protection for all transactions.
                  </p>
                </CardHeader>
                
                <CardContent>
                  {error && (
                    <div className= "mb-4 p-4 bg-red-50 text-red-600 rounded-md" data-testid= "card-errors">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className= "mb-4 p-4 bg-green-50 text-green-600 rounded-md" data-testid= "payment-success">
                      {success}
                    </div>
                  )}
                  
                  <form onSubmit={handlePayment} className= "space-y-4" data-testid= "payment-form" suppressHydrationWarning>
                    <div className= "space-y-2">
                      <Label htmlFor= "email">Email Address</Label>
                      <Input
                        id= "email
                        type= "email
                        value={cardData.email}
                        onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                        required
                        data-testid= "email-input
                        suppressHydrationWarning
                      />
                    </div>

                    <div className= "space-y-2">
                      <Label htmlFor= "name">Full Name</Label>
                      <Input
                        id= "name
                        type= "text
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        required
                        data-testid= "name-input
                        suppressHydrationWarning
                      />
                    </div>

                    <div className= "space-y-2">
                      <Label>Card Details</Label>
                      <div className= "space-y-2">
                        <Input
                          placeholder= "Card Number
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                          maxLength={19}
                          data-testid= "card-number
                          suppressHydrationWarning
                        />
                        <div className= "grid grid-cols-2 gap-2">
                          <Input
                            placeholder= "MM/YY
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                            maxLength={5}
                            data-testid= "card-expiry
                            suppressHydrationWarning
                          />
                          <Input
                            placeholder= "CVC
                            value={cardData.cvc}
                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                            maxLength={4}
                            data-testid= "card-cvc
                            suppressHydrationWarning
                          />
                        </div>
                      </div>
                      <div className= "text-xs text-gray-500" data-testid= "card-element">
                        Stripe secure payment processing with Apple Pay & Google Pay support
                      </div>
                    </div>

                    <Button 
                      type= "submit" 
                      className= "w-full min-h-[44px]" 
                      disabled={isLoading}
                      data-testid= "submit-payment
                      suppressHydrationWarning
                    >
                      {isLoading ? (
                        <>
                          <div className= "h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className= "h-4 w-4 mr-2" />
                          Pay ${selectedPlan?.price}/{selectedPlan?.billing}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Access Tab */}
          <TabsContent value= "client-access">
            <div className= "max-w-2xl mx-auto">
              <Card data-testid= "client-access-container">
                <CardHeader>
                  <CardTitle>Client Access Portal</CardTitle>
                  <p className= "text-gray-600">
                    Already a client? Access your projects and files securely with escrow payment protection.
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleClientLogin} className= "space-y-4" data-testid= "client-login">
                    <div>
                      <Label htmlFor= "client-email">Email Address</Label>
                      <Input 
                        id= "client-email" 
                        type= "email" 
                        placeholder= "your@email.com
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        data-testid= "client-email-input
                        suppressHydrationWarning
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor= "access-code">Access Code</Label>
                      <Input 
                        id= "access-code" 
                        type= "text" 
                        placeholder= "Enter your access code
                        value={loginData.accessCode}
                        onChange={(e) => setLoginData({ ...loginData, accessCode: e.target.value })}
                        data-testid= "client-access-code
                        suppressHydrationWarning
                      />
                    </div>
                    
                    <Button 
                      type= "submit" 
                      className= "w-full min-h-[44px]" 
                      disabled={isLoading}
                      data-testid= "client-login-submit
                      suppressHydrationWarning
                    >
                      <Key className= "h-4 w-4 mr-2" />
                      Access Portal
                    </Button>
                  </form>

                  {success && (
                    <div className= "mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className= "text-green-600">{success}</p>
                    </div>
                  )}

                  {error && (
                    <div className= "mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className= "text-red-600">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer trust badges */}
        <div className= "text-center mt-16 space-y-4">
          <div className= "flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className= "flex items-center">
              <Shield className= "h-4 w-4 mr-1" />
              256-bit SSL Encryption
            </div>
            <div className= "flex items-center">
              <CreditCard className= "h-4 w-4 mr-1" />
              Stripe Secure Processing
            </div>
            <div className= "flex items-center">
              <Star className= "h-4 w-4 mr-1" />
              Escrow Payment Protection
            </div>
          </div>
          
          <p className= "text-xs text-gray-400 max-w-2xl mx-auto">
            All payments are processed securely through Stripe with escrow payment protection. 
            We never store your payment information. Cancel anytime. 14-day money-back guarantee on all paid plans.
          </p>
        </div>
      </div>
    </div>
  )
} 