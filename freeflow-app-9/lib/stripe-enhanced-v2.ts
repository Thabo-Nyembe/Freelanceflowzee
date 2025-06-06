import Stripe from 'stripe'

// Enhanced Stripe service with Apple Pay, Google Pay, and advanced features
class StripeEnhancedService {
  private stripe: Stripe
  private publishableKey: string

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
      {
        apiVersion: '2024-06-20',
        typescript: true,
      }
    )
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  }

  // Enhanced Payment Intent with Apple Pay/Google Pay support
  async createEnhancedPaymentIntent(params: {
    amount: number
    currency: string
    metadata?: Record<string, string>
    paymentMethods?: string[]
    returnUrl?: string
    setupFutureUsage?: 'on_session' | 'off_session'
  }) {
    try {
      const { amount, currency, metadata, paymentMethods, returnUrl, setupFutureUsage } = params

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: paymentMethods || [
          'card',
          'apple_pay', 
          'google_pay',
          'link',
          'cashapp'
        ],
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          service: 'freeflowzee-enhanced'
        },
        setup_future_usage: setupFutureUsage,
        return_url: returnUrl,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
      })

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret,
        publishableKey: this.publishableKey
      }
    } catch (error) {
      console.error('Enhanced payment intent creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment intent creation failed',
        publishableKey: this.publishableKey
      }
    }
  }

  // Apple Pay Domain Verification
  async verifyApplePayDomain(domain: string) {
    try {
      await this.stripe.applePayDomains.create({ domain_name: domain })
      return { success: true, domain }
    } catch (error) {
      console.error('Apple Pay domain verification failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Domain verification failed'
      }
    }
  }

  // Customer Management with Enhanced Features
  async createEnhancedCustomer(params: {
    email: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
    paymentMethod?: string
  }) {
    try {
      const { email, name, phone, metadata, paymentMethod } = params

      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          ...metadata,
          created_via: 'freeflowzee-enhanced',
          created_at: new Date().toISOString()
        }
      })

      // Attach payment method if provided
      if (paymentMethod) {
        await this.stripe.paymentMethods.attach(paymentMethod, {
          customer: customer.id
        })
      }

      return {
        success: true,
        customer,
        customerId: customer.id
      }
    } catch (error) {
      console.error('Enhanced customer creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed'
      }
    }
  }

  // Subscription Management
  async createSubscription(params: {
    customerId: string
    priceId: string
    paymentMethodId?: string
    trialPeriodDays?: number
    metadata?: Record<string, string>
  }) {
    try {
      const { customerId, priceId, paymentMethodId, trialPeriodDays, metadata } = params

      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          ...metadata,
          created_via: 'freeflowzee-enhanced'
        }
      }

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId
      }

      if (trialPeriodDays) {
        subscriptionData.trial_period_days = trialPeriodDays
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData)

      return {
        success: true,
        subscription,
        clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent 
          ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret
          : null
      }
    } catch (error) {
      console.error('Subscription creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed'
      }
    }
  }

  // Invoice Generation and Management
  async createInvoice(params: {
    customerId: string
    items: Array<{
      description: string
      amount: number
      quantity?: number
    }>
    metadata?: Record<string, string>
    dueDate?: Date
    autoAdvance?: boolean
  }) {
    try {
      const { customerId, items, metadata, dueDate, autoAdvance = true } = params

      // Create invoice items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          amount: item.amount,
          currency: 'usd',
          description: item.description,
          quantity: item.quantity || 1
        })
      }

      // Create invoice
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: autoAdvance,
        due_date: dueDate ? Math.floor(dueDate.getTime() / 1000) : undefined,
        metadata: {
          ...metadata,
          created_via: 'freeflowzee-enhanced',
          created_at: new Date().toISOString()
        }
      })

      // Finalize invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id)

      return {
        success: true,
        invoice: finalizedInvoice,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        invoicePdf: finalizedInvoice.invoice_pdf
      }
    } catch (error) {
      console.error('Invoice creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invoice creation failed'
      }
    }
  }

  // Payment Method Management
  async savePaymentMethod(params: {
    paymentMethodId: string
    customerId: string
    setAsDefault?: boolean
  }) {
    try {
      const { paymentMethodId, customerId, setAsDefault } = params

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      })

      // Set as default if requested
      if (setAsDefault) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        })
      }

      return {
        success: true,
        paymentMethodId,
        customerId
      }
    } catch (error) {
      console.error('Payment method save failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment method save failed'
      }
    }
  }

  // Webhook Event Processing
  async processWebhook(payload: string, signature: string) {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!endpointSecret) {
        throw new Error('Stripe webhook secret not configured')
      }

      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret)

      switch (event.type) {
        case 'payment_intent.succeeded':
          return this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        
        case 'payment_intent.payment_failed':
          return this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        
        case 'invoice.payment_succeeded':
          return this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          return this.handleSubscriptionChanged(event.data.object as Stripe.Subscription)
        
        default:
          console.log(`Unhandled event type: ${event.type}`)
          return { success: true, handled: false }
      }
    } catch (error) {
      console.error('Webhook processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      }
    }
  }

  // Payment Analytics
  async getPaymentAnalytics(params: {
    startDate: Date
    endDate: Date
    customerId?: string
  }) {
    try {
      const { startDate, endDate, customerId } = params

      const charges = await this.stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        customer: customerId,
        limit: 100
      })

      const totalAmount = charges.data.reduce((sum, charge) => sum + charge.amount, 0)
      const successfulPayments = charges.data.filter(charge => charge.status === 'succeeded')
      const failedPayments = charges.data.filter(charge => charge.status === 'failed')

      return {
        success: true,
        analytics: {
          totalTransactions: charges.data.length,
          totalAmount: totalAmount / 100, // Convert from cents
          successfulPayments: successfulPayments.length,
          failedPayments: failedPayments.length,
          successRate: charges.data.length > 0 ? (successfulPayments.length / charges.data.length) * 100 : 0,
          averageTransactionAmount: charges.data.length > 0 ? totalAmount / charges.data.length / 100 : 0
        }
      }
    } catch (error) {
      console.error('Payment analytics failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics retrieval failed'
      }
    }
  }

  // Private helper methods for webhook processing
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id)
    // Add your business logic here
    return { success: true, event: 'payment_succeeded', paymentIntentId: paymentIntent.id }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment failed:', paymentIntent.id)
    // Add your business logic here
    return { success: true, event: 'payment_failed', paymentIntentId: paymentIntent.id }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Invoice payment succeeded:', invoice.id)
    // Add your business logic here
    return { success: true, event: 'invoice_payment_succeeded', invoiceId: invoice.id }
  }

  private async handleSubscriptionChanged(subscription: Stripe.Subscription) {
    console.log('Subscription changed:', subscription.id, subscription.status)
    // Add your business logic here
    return { success: true, event: 'subscription_changed', subscriptionId: subscription.id }
  }

  // Utility methods
  getPublishableKey() {
    return this.publishableKey
  }

  async testConnection() {
    try {
      await this.stripe.balance.retrieve()
      return { success: true, message: 'Stripe connection successful' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }
}

// Export singleton instance
export const stripeEnhanced = new StripeEnhancedService()
export default stripeEnhanced 