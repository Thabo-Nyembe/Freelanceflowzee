import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('API-RetryInvoice')

/**
 * Invoice Payment Retry Endpoint
 *
 * Handles retrying failed invoice payments:
 * - Retrieves Stripe invoice if available
 * - Creates new payment intent for the invoice amount
 * - Updates database records
 * - Returns payment status
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, amount, customerId, stripeInvoiceId } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get invoice from database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice has a Stripe invoice ID and try to pay it directly
    if (stripeInvoiceId || invoice.stripe_invoice_id) {
      try {
        const stripeInvoice = await stripe.invoices.pay(
          stripeInvoiceId || invoice.stripe_invoice_id
        )

        // Update invoice status in database
        await supabase
          .from('invoices')
          .update({
            status: stripeInvoice.status === 'paid' ? 'paid' : 'open',
            paid_at: stripeInvoice.status === 'paid' ? new Date().toISOString() : null,
            last_retry_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        logger.info('Stripe invoice payment retry completed', {
          invoiceId,
          stripeInvoiceId: stripeInvoice.id,
          status: stripeInvoice.status,
        })

        return NextResponse.json({
          success: stripeInvoice.status === 'paid',
          status: stripeInvoice.status,
          message: stripeInvoice.status === 'paid'
            ? 'Payment successful'
            : 'Payment requires additional action',
        })

      } catch (stripeError: any) {
        logger.warn('Stripe invoice payment failed, creating new payment intent', {
          error: stripeError.message,
        })
        // Fall through to create a new payment intent
      }
    }

    // Create a new payment intent for the invoice amount
    const invoiceAmount = amount || invoice.total || invoice.amount_due
    if (!invoiceAmount || invoiceAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid invoice amount' },
        { status: 400 }
      )
    }

    // Amount should be in cents
    const amountInCents = Number.isInteger(invoiceAmount)
      ? invoiceAmount
      : Math.round(invoiceAmount * 100)

    // Get or create Stripe customer
    let stripeCustomerId = customerId || invoice.stripe_customer_id

    if (!stripeCustomerId && user.email) {
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        })
        stripeCustomerId = newCustomer.id
      }
    }

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: invoice.currency?.toLowerCase() || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        invoiceId,
        invoiceNumber: invoice.invoice_number || invoice.number,
        userId: user.id,
        type: 'invoice_retry',
        retryAt: new Date().toISOString(),
      },
      description: `Payment for Invoice ${invoice.invoice_number || invoice.number || invoiceId}`,
    }

    if (stripeCustomerId) {
      paymentIntentParams.customer = stripeCustomerId
    }

    if (user.email) {
      paymentIntentParams.receipt_email = user.email
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Update invoice with retry attempt
    await supabase
      .from('invoices')
      .update({
        status: 'processing',
        last_retry_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', invoiceId)

    // Record the payment attempt
    await supabase.from('payments').insert({
      user_id: user.id,
      invoice_id: invoiceId,
      stripe_payment_intent_id: paymentIntent.id,
      amount: amountInCents,
      currency: invoice.currency?.toLowerCase() || 'usd',
      status: 'pending',
      payment_type: 'invoice_retry',
      metadata: {
        invoiceNumber: invoice.invoice_number || invoice.number,
      },
      created_at: new Date().toISOString(),
    })

    logger.info('Payment intent created for invoice retry', {
      invoiceId,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
    })

    return NextResponse.json({
      success: true,
      status: 'requires_payment',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      message: 'Payment intent created. Complete payment using Stripe Elements.',
    })

  } catch (error) {
    logger.error('Invoice retry payment failed', {
      error: error.message,
      code: error.code,
    })

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          declineCode: error.decline_code,
        },
        { status: 400 }
      )
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment request. Please contact support.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment retry. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for checking invoice payment status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!invoiceId && !paymentIntentId) {
      return NextResponse.json(
        { error: 'Invoice ID or Payment Intent ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      // Update database if payment succeeded
      if (paymentIntent.status === 'succeeded' && invoiceId) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        await supabase
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntentId)
      }

      return NextResponse.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      })
    }

    // Get invoice status from database
    const { data: invoice } = await supabase
      .from('invoices')
      .select('status, stripe_payment_intent_id')
      .eq('id', invoiceId)
      .single()

    return NextResponse.json({
      status: invoice?.status || 'unknown',
      paymentIntentId: invoice?.stripe_payment_intent_id,
    })

  } catch (error) {
    logger.error('Invoice status check failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to check invoice status' },
      { status: 500 }
    )
  }
}
