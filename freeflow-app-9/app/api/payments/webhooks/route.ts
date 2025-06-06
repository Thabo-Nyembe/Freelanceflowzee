import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

// Stripe MCP Best Practice: Initialize with proper error handling and environment validation
let stripe: Stripe | null = null
let endpointSecret: string | null = null

// Initialize Stripe only if properly configured
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    typescript: true,
  })
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
}

export async function POST(request: NextRequest) {
  // Check if Stripe is properly configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('Stripe not configured - webhook endpoint disabled')
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    console.error('No Stripe signature found')
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

// Webhook event handlers
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id)
  
  // Here you would typically:
  // 1. Update your database to mark the payment as successful
  // 2. Send confirmation email to customer
  // 3. Fulfill the order/service
  // 4. Update user's account status
  
  const metadata = paymentIntent.metadata
  
  try {
    // Log payment success for analytics
    await logPaymentEvent({
      type: 'payment_succeeded',
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_id: paymentIntent.customer as string,
      description: metadata.description || '',
      timestamp: new Date().toISOString(),
    })

    // If this was for a project or service, activate it
    if (metadata.project_id) {
      await activateProject(metadata.project_id)
    }

    // Send success notification
    if (metadata.customer_email) {
      await sendPaymentConfirmationEmail({
        email: metadata.customer_email,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: metadata.description || 'FreeflowZee Payment',
      })
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id)
  
  const metadata = paymentIntent.metadata
  
  try {
    // Log payment failure
    await logPaymentEvent({
      type: 'payment_failed',
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_id: paymentIntent.customer as string,
      error_message: paymentIntent.last_payment_error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    // Send failure notification if customer email available
    if (metadata.customer_email) {
      await sendPaymentFailureEmail({
        email: metadata.customer_email,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📄 Invoice payment succeeded:', invoice.id)
  
  try {
    // Update subscription status if applicable
    if (invoice.subscription) {
      await updateSubscriptionStatus(invoice.subscription as string, 'active')
    }

    // Log invoice payment
    await logPaymentEvent({
      type: 'invoice_payment_succeeded',
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      customer_id: invoice.customer as string,
      subscription_id: invoice.subscription as string,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling invoice payment success:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id)
  
  try {
    // Update subscription status if applicable
    if (invoice.subscription) {
      await updateSubscriptionStatus(invoice.subscription as string, 'past_due')
    }

    // Log invoice payment failure
    await logPaymentEvent({
      type: 'invoice_payment_failed',
      invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      customer_id: invoice.customer as string,
      subscription_id: invoice.subscription as string,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling invoice payment failure:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎯 Subscription created:', subscription.id)
  
  try {
    // Create subscription record in your database
    await createSubscriptionRecord({
      subscription_id: subscription.id,
      customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    })
  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  try {
    // Update subscription record in your database
    await updateSubscriptionRecord(subscription.id, {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ Subscription deleted:', subscription.id)
  
  try {
    // Mark subscription as cancelled in your database
    await updateSubscriptionRecord(subscription.id, {
      status: 'cancelled',
      cancelled_at: new Date(),
    })
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id)
  
  try {
    // Create customer record in your database
    await createCustomerRecord({
      stripe_customer_id: customer.id,
      email: customer.email,
      name: customer.name,
      created_at: new Date(customer.created * 1000),
    })
  } catch (error) {
    console.error('Error handling customer creation:', error)
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('💳 Payment method attached:', paymentMethod.id)
  
  try {
    // Log payment method attachment for analytics
    await logPaymentEvent({
      type: 'payment_method_attached',
      payment_method_id: paymentMethod.id,
      customer_id: paymentMethod.customer as string,
      payment_method_type: paymentMethod.type,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling payment method attachment:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id)
  
  try {
    // Handle checkout completion
    if (session.mode === 'subscription') {
      // Handle subscription checkout
      await handleSubscriptionCheckout(session)
    } else if (session.mode === 'payment') {
      // Handle one-time payment checkout
      await handlePaymentCheckout(session)
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

// Helper functions (these would connect to your actual database)
async function logPaymentEvent(event: any) {
  // In a real app, this would save to your database
  console.log('📊 Payment event logged:', event)
}

async function activateProject(projectId: string) {
  // In a real app, this would update project status in your database
  console.log('✅ Project activated:', projectId)
}

async function sendPaymentConfirmationEmail(data: any) {
  // In a real app, this would send an email via your email service
  console.log('📧 Payment confirmation email queued:', data.email)
}

async function sendPaymentFailureEmail(data: any) {
  // In a real app, this would send a failure notification email
  console.log('📧 Payment failure email queued:', data.email)
}

async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  // In a real app, this would update subscription status in your database
  console.log('🔄 Subscription status updated:', subscriptionId, status)
}

async function createSubscriptionRecord(data: any) {
  // In a real app, this would create a subscription record in your database
  console.log('💾 Subscription record created:', data.subscription_id)
}

async function updateSubscriptionRecord(subscriptionId: string, updates: any) {
  // In a real app, this would update subscription record in your database
  console.log('💾 Subscription record updated:', subscriptionId)
}

async function createCustomerRecord(data: any) {
  // In a real app, this would create a customer record in your database
  console.log('💾 Customer record created:', data.stripe_customer_id)
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  // Handle subscription-specific checkout completion
  console.log('🎯 Subscription checkout handled:', session.subscription)
}

async function handlePaymentCheckout(session: Stripe.Checkout.Session) {
  // Handle one-time payment checkout completion
  console.log('💰 Payment checkout handled:', session.payment_intent)
} 