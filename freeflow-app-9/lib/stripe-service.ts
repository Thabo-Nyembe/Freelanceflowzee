import Stripe from 'stripe'

interface PaymentIntentData {
  amount: number
  currency: string
  projectId?: string
  customerId?: string
  metadata?: Record<string, string>
}

interface StripeProduct {
  id: string
  name: string
  description?: string
  prices: StripePrice[]
}

interface StripePrice {
  id: string
  amount: number
  currency: string
  recurring?: {
    interval: string
  }
}

export class StripeService {
  private stripe: Stripe | null = null
  private isTestMode: boolean = false

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    // Determine if we're in test mode
    this.isTestMode = process.env.NODE_ENV === 'test' ||
                     !stripeKey ||
                     !stripeKey.startsWith('sk_')

    if (!this.isTestMode && stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2024-12-18.acacia',
      })
    }

    console.log('🔧 StripeService initialized:', {
      testMode: this.isTestMode,
      hasKey: !!stripeKey,
      nodeEnv: process.env.NODE_ENV
    })
  }

  /**
   * Create a payment intent for project access
   */
  async createPaymentIntent(data: PaymentIntentData): Promise<{
    clientSecret: string
    paymentIntentId: string
    amount: number
    currency: string
    testMode: boolean
  }> {
    // Return mock data for test mode
    if (this.isTestMode) {
      const mockPaymentIntentId = `pi_3QdGhJ2eZvKYlo2C${Date.now()}`
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 15)}`
      
      console.log('✅ Mock payment intent created:', mockPaymentIntentId)
      return {
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        amount: data.amount,
        currency: data.currency,
        testMode: true,
      }
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized for production mode')
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: data.customerId,
      metadata: {
        projectId: data.projectId || '',
        environment: process.env.NODE_ENV || 'development',
        ...data.metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      testMode: false,
    }
  }

  /**
   * Create a customer for subscription management
   */
  async createCustomer(name: string, email?: string): Promise<{
    id: string
    name: string
    email?: string
    testMode: boolean
  }> {
    if (this.isTestMode) {
      const mockCustomerId = `cus_${Math.random().toString(36).substring(2, 15)}`
      
      console.log('✅ Mock customer created:', mockCustomerId)
      return {
        id: mockCustomerId,
        name,
        email,
        testMode: true,
      }
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized for production mode')
    }

    const customer = await this.stripe.customers.create({
      name,
      email,
    })

    return {
      id: customer.id,
      name: customer.name || name,
      email: customer.email || undefined,
      testMode: false,
    }
  }

  /**
   * Get standard FreeflowZee pricing
   */
  getStandardPricing() {
    return {
      single_project: {
        amount: 2900, // $29.00
        currency: 'usd',
        name: 'Single Project Access',
        description: 'Unlock one premium design project'
      },
      monthly_unlimited: {
        amount: 9900, // $99.00
        currency: 'usd',
        name: 'Monthly Unlimited Access',
        description: 'Unlimited access to all premium projects for 30 days'
      },
      annual_unlimited: {
        amount: 99900, // $999.00
        currency: 'usd',
        name: 'Annual Unlimited Access',
        description: 'Unlimited access to all premium projects for 12 months'
      }
    }
  }

  /**
   * Create a payment link for quick checkout
   */
  async createPaymentLink(priceId: string, quantity: number = 1): Promise<{
    url: string
    id: string
    testMode: boolean
  }> {
    if (this.isTestMode) {
      const mockLinkId = `plink_${Math.random().toString(36).substring(2, 15)}`
      const mockUrl = `https://checkout.stripe.com/c/pay/${mockLinkId}#fidkdWxOYHwnPyd1blpxYHZxWjA0`
      
      console.log('✅ Mock payment link created:', mockLinkId)
      return {
        url: mockUrl,
        id: mockLinkId,
        testMode: true,
      }
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized for production mode')
    }

    const paymentLink = await this.stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
    })

    return {
      url: paymentLink.url,
      id: paymentLink.id,
      testMode: false,
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentIntentId: string): Promise<{
    status: string
    paid: boolean
    amount: number
    currency: string
  }> {
    if (this.isTestMode || paymentIntentId.includes('mock')) {
      console.log('✅ Mock payment verification - always successful')
      return {
        status: 'succeeded',
        paid: true,
        amount: 2900,
        currency: 'usd'
      }
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized for production mode')
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

    return {
      status: paymentIntent.status,
      paid: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }
  }

  /**
   * Handle alternative access methods (password/code)
   */
  async validateAlternativeAccess(method: 'password' | 'code', value: string, projectId: string): Promise<{
    valid: boolean
    accessGranted: boolean
    message: string
  }> {
    // This is always test mode for alternative access
    console.log('🔐 Validating alternative access:', { method, projectId })

    // Mock validation - in production, this would check against a database
    const validPasswords = ['demo2024', 'preview', 'freelancer']
    const validCodes = ['FREECODE', 'PREVIEW2024', 'BETA']

    let valid = false
    if (method === 'password') {
      valid = validPasswords.includes(value.toLowerCase())
    } else if (method === 'code') {
      valid = validCodes.includes(value.toUpperCase())
    }

    return {
      valid,
      accessGranted: valid,
      message: valid 
        ? `Access granted via ${method}` 
        : `Invalid ${method}. Please try again or use payment option.`
    }
  }

  /**
   * Get current test mode status
   */
  isInTestMode(): boolean {
    return this.isTestMode
  }
}

// Export singleton instance
export const stripeService = new StripeService() 