import Stripe from 'stripe'

// Initialize Stripe with enhanced configuration
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  {
    apiVersion: '2024-11-20.acacia',
    appInfo: {
      name: 'FreeflowZee Payment Platform',
      version: '1.0.0',
      url: 'https://freeflowzee.com',
    },
    telemetry: false, // Disable for better performance
    maxNetworkRetries: 3,
    timeout: 10000, // 10 seconds
  }
)

// Enhanced payment intent creation with advanced features
export async function createAdvancedPaymentIntent(params: {
  amount: number
  currency: string
  projectId: string
  customerEmail?: string
  metadata?: Record<string, string>
  paymentMethods?: string[]
}) {
  const {
    amount,
    currency = 'usd',
    projectId,
    customerEmail,
    metadata = {},
    paymentMethods = ['card', 'apple_pay', 'google_pay'],
  } = params

  try {
    // Create or retrieve customer if email provided
    let customer: Stripe.Customer | undefined
    if (customerEmail) {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            projectId,
            source: 'freeflowzee',
          },
        })
      }
    }

    // Create payment intent with enhanced features
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customer?.id,
      payment_method_types: paymentMethods,
      metadata: {
        projectId,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      statement_descriptor: 'FREEFLOWZEE',
      receipt_email: customerEmail,
      setup_future_usage: 'on_session', // Save payment method for future use
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer?.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    }
  } catch (error) {
    console.error('Enhanced payment intent creation failed:', error)
    throw new Error('Failed to create payment intent')
  }
}

// Webhook event processor
export async function processWebhookEvent(
  signature: string,
  rawBody: string,
  endpointSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true, processed: event.type }
  } catch (error) {
    console.error('Webhook processing error:', error)
    throw error
  }
}

// Payment success handler
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { projectId } = paymentIntent.metadata
  
  console.log(`✅ Payment succeeded for project: ${projectId}`)
  
  // Here you would typically:
  // 1. Update database with payment status
  // 2. Grant access to premium content
  // 3. Send confirmation email
  // 4. Trigger any business logic

  // Example: Update project access
  await updateProjectAccess(projectId, {
    status: 'paid',
    paymentIntentId: paymentIntent.id,
    customerId: paymentIntent.customer as string,
    amount: paymentIntent.amount,
    paidAt: new Date(),
  })
}

// Payment failure handler
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { projectId } = paymentIntent.metadata
  
  console.log(`❌ Payment failed for project: ${projectId}`)
  
  // Handle payment failure
  await updateProjectAccess(projectId, {
    status: 'failed',
    paymentIntentId: paymentIntent.id,
    failureReason: paymentIntent.last_payment_error?.message,
    failedAt: new Date(),
  })
}

// Subscription creation handler
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`🎉 New subscription created: ${subscription.id}`)
  
  // Handle new subscription
  await createSubscriptionRecord({
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  })
}

// Subscription update handler
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`📝 Subscription updated: ${subscription.id}`)
  
  // Handle subscription updates
  await updateSubscriptionRecord(subscription.id, {
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  })
}

// Invoice payment success handler
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice payment succeeded: ${invoice.id}`)
  
  // Handle successful invoice payment
  await processInvoicePayment({
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription as string,
    customerId: invoice.customer as string,
    amount: invoice.amount_paid,
    paidAt: new Date(),
  })
}

// Enhanced customer management
export async function createEnhancedCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
  paymentMethod?: string
}) {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        source: 'freeflowzee',
        ...params.metadata,
      },
    })

    // Attach payment method if provided
    if (params.paymentMethod) {
      await stripe.paymentMethods.attach(params.paymentMethod, {
        customer: customer.id,
      })

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: params.paymentMethod,
        },
      })
    }

    return customer
  } catch (error) {
    console.error('Enhanced customer creation failed:', error)
    throw error
  }
}

// Subscription management
export async function createSubscription(params: {
  customerId: string
  priceId: string
  trialDays?: number
  metadata?: Record<string, string>
}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      metadata: params.metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return subscription
  } catch (error) {
    console.error('Subscription creation failed:', error)
    throw error
  }
}

// Retrieve payment status
export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      lastError: paymentIntent.last_payment_error,
    }
  } catch (error) {
    console.error('Payment status retrieval failed:', error)
    throw error
  }
}

// Refund management
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number
  reason?: Stripe.RefundCreateParams.Reason
  metadata?: Record<string, string>
}) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount,
      reason: params.reason,
      metadata: params.metadata,
    })

    return refund
  } catch (error) {
    console.error('Refund creation failed:', error)
    throw error
  }
}

// Mock database operations (replace with actual database calls)
async function updateProjectAccess(projectId: string, data: any) {
  console.log(`Updating project access for ${projectId}:`, data)
  // Implement actual database update
}

async function createSubscriptionRecord(data: any) {
  console.log('Creating subscription record:', data)
  // Implement actual database insert
}

async function updateSubscriptionRecord(subscriptionId: string, data: any) {
  console.log(`Updating subscription ${subscriptionId}:`, data)
  // Implement actual database update
}

async function processInvoicePayment(data: any) {
  console.log('Processing invoice payment:', data)
  // Implement actual invoice processing
}

// Utility functions
export const StripeUtils = {
  formatAmount: (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  },

  validateWebhookSignature: (signature: string, body: string, secret: string) => {
    try {
      stripe.webhooks.constructEvent(body, signature, secret)
      return true
    } catch {
      return false
    }
  },

  isTestKey: (key: string) => key.startsWith('sk_test_'),

  getPublishableKey: () => process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
} 