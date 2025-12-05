/**
 * File Payment Integration - Stripe + Escrow
 *
 * Features:
 * - Create payment for file access
 * - Escrow deposit creation
 * - Escrow release management
 * - Payment status tracking
 * - Integration with existing escrow system
 */

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export interface FilePaymentRequest {
  deliveryId: string
  buyerEmail: string
  buyerName?: string
  successUrl?: string
  cancelUrl?: string
}

export interface FilePaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  checkoutUrl?: string
  escrowDepositId?: string
  error?: string
}

export interface EscrowReleaseResult {
  success: boolean
  error?: string
}

/**
 * Create a Stripe payment for file access
 *
 * @param request - Payment request details
 * @returns Payment result with client secret or checkout URL
 *
 * @example
 * ```typescript
 * const result = await createFilePayment({
 *   deliveryId: 'delivery-123',
 *   buyerEmail: 'buyer@example.com',
 *   successUrl: 'https://example.com/success',
 *   cancelUrl: 'https://example.com/cancel'
 * })
 *
 * if (result.success) {
 *   // Redirect to result.checkoutUrl
 * }
 * ```
 */
export async function createFilePayment(
  request: FilePaymentRequest
): Promise<FilePaymentResult> {
  try {
    const { deliveryId, buyerEmail, buyerName, successUrl, cancelUrl } = request

    const supabase = await createClient()

    // Get delivery information
    const { data: delivery, error: deliveryError } = await supabase
      .from('secure_file_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      return {
        success: false,
        error: 'Delivery not found'
      }
    }

    if (!delivery.requires_payment) {
      return {
        success: false,
        error: 'This delivery does not require payment'
      }
    }

    if (!delivery.payment_amount || delivery.payment_amount <= 0) {
      return {
        success: false,
        error: 'Invalid payment amount'
      }
    }

    // Check if payment already exists
    const { data: existingTransaction } = await supabase
      .from('file_download_transactions')
      .select('*')
      .eq('delivery_id', deliveryId)
      .eq('buyer_email', buyerEmail)
      .eq('status', 'completed')
      .single()

    if (existingTransaction) {
      return {
        success: false,
        error: 'Payment already completed for this file'
      }
    }

    // Convert amount to cents
    const amountInCents = Math.round(delivery.payment_amount * 100)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `File Access: ${delivery.file_name}`,
              description: delivery.escrow_enabled
                ? 'Payment will be held in escrow until released by seller'
                : 'Instant access to file after payment',
              images: delivery.metadata?.thumbnail
                ? [delivery.metadata.thumbnail]
                : undefined
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }
      ],
      customer_email: buyerEmail,
      client_reference_id: deliveryId,
      metadata: {
        deliveryId,
        buyerEmail,
        buyerName: buyerName || '',
        escrowEnabled: delivery.escrow_enabled.toString(),
        sellerId: delivery.owner_id
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/delivery/${deliveryId}?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/delivery/${deliveryId}?payment=cancelled`
    })

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('file_download_transactions')
      .insert({
        delivery_id: deliveryId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        amount: delivery.payment_amount,
        payment_provider: 'stripe',
        payment_intent_id: session.payment_intent as string,
        status: 'pending',
        metadata: {
          checkoutSessionId: session.id,
          escrowEnabled: delivery.escrow_enabled
        }
      })
      .select()
      .single()

    if (transactionError) {
      throw new Error(`Failed to create transaction record: ${transactionError.message}`)
    }

    // If escrow enabled, create escrow deposit
    let escrowDepositId: string | undefined

    if (delivery.escrow_enabled) {
      const { data: escrowDeposit, error: escrowError } = await supabase
        .from('escrow_deposits')
        .insert({
          buyer_id: null, // Will be updated when user logs in
          seller_id: delivery.owner_id,
          project_id: null,
          amount: delivery.payment_amount,
          status: 'pending',
          release_conditions: {
            type: 'file_delivery',
            deliveryId,
            requiresSellerApproval: true
          },
          metadata: {
            fileDeliveryId: deliveryId,
            fileName: delivery.file_name,
            transactionId: transaction.id
          }
        })
        .select()
        .single()

      if (escrowError) {
        console.error('Failed to create escrow deposit:', escrowError)
      } else {
        escrowDepositId = escrowDeposit.id

        // Link escrow to delivery
        await supabase
          .from('secure_file_deliveries')
          .update({ escrow_deposit_id: escrowDepositId })
          .eq('id', deliveryId)
      }
    }

    return {
      success: true,
      paymentIntentId: session.payment_intent as string,
      checkoutUrl: session.url || undefined,
      escrowDepositId
    }
  } catch (error: any) {
    console.error('File payment error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create payment'
    }
  }
}

/**
 * Handle Stripe webhook for payment completion
 *
 * @param event - Stripe webhook event
 * @returns Processing result
 */
export async function handlePaymentWebhook(event: Stripe.Event): Promise<boolean> {
  try {
    const supabase = await createClient()

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const deliveryId = session.client_reference_id
      const paymentIntentId = session.payment_intent as string

      if (!deliveryId) {
        console.error('No delivery ID in webhook')
        return false
      }

      // Update transaction status
      const { error: transactionError } = await supabase
        .from('file_download_transactions')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          metadata: {
            ...session.metadata,
            checkoutSessionId: session.id,
            paymentIntentId
          }
        })
        .eq('delivery_id', deliveryId)
        .eq('payment_intent_id', paymentIntentId)

      if (transactionError) {
        console.error('Failed to update transaction:', transactionError)
        return false
      }

      // Get delivery info
      const { data: delivery } = await supabase
        .from('secure_file_deliveries')
        .select('*')
        .eq('id', deliveryId)
        .single()

      if (delivery) {
        // Update delivery status
        const newStatus = delivery.escrow_enabled ? 'escrowed' : 'released'

        await supabase
          .from('secure_file_deliveries')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliveryId)

        // If escrow enabled, update escrow deposit
        if (delivery.escrow_enabled && delivery.escrow_deposit_id) {
          await supabase
            .from('escrow_deposits')
            .update({
              status: 'deposited',
              deposited_at: new Date().toISOString()
            })
            .eq('id', delivery.escrow_deposit_id)
        }

        // Log payment completion
        await supabase.from('file_access_logs').insert({
          delivery_id: deliveryId,
          action: 'payment_completed',
          metadata: {
            amount: session.amount_total ? session.amount_total / 100 : 0,
            paymentIntentId,
            escrowEnabled: delivery.escrow_enabled,
            timestamp: new Date().toISOString()
          }
        })
      }

      return true
    }

    return false
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return false
  }
}

/**
 * Release escrow for file delivery
 *
 * @param deliveryId - File delivery ID
 * @param sellerId - Seller user ID (must match delivery owner)
 * @returns Release result
 *
 * @example
 * ```typescript
 * const result = await releaseFileEscrow('delivery-123', 'user-456')
 *
 * if (result.success) {
 *   // File is now accessible to buyer
 * }
 * ```
 */
export async function releaseFileEscrow(
  deliveryId: string,
  sellerId: string
): Promise<EscrowReleaseResult> {
  try {
    const supabase = await createClient()

    // Get delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from('secure_file_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .eq('owner_id', sellerId)
      .single()

    if (deliveryError || !delivery) {
      return {
        success: false,
        error: 'Delivery not found or unauthorized'
      }
    }

    if (!delivery.escrow_enabled) {
      return {
        success: false,
        error: 'This delivery does not use escrow'
      }
    }

    if (delivery.status !== 'escrowed') {
      return {
        success: false,
        error: `Cannot release escrow. Current status: ${delivery.status}`
      }
    }

    if (!delivery.escrow_deposit_id) {
      return {
        success: false,
        error: 'No escrow deposit found'
      }
    }

    // Release escrow
    const { error: escrowError } = await supabase
      .from('escrow_deposits')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        released_by: sellerId
      })
      .eq('id', delivery.escrow_deposit_id)

    if (escrowError) {
      throw new Error(`Failed to release escrow: ${escrowError.message}`)
    }

    // Update delivery status
    const { error: updateError } = await supabase
      .from('secure_file_deliveries')
      .update({
        status: 'released',
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    if (updateError) {
      throw new Error(`Failed to update delivery status: ${updateError.message}`)
    }

    // Log escrow release
    await supabase.from('file_access_logs').insert({
      delivery_id: deliveryId,
      user_id: sellerId,
      action: 'escrow_released',
      metadata: {
        escrowDepositId: delivery.escrow_deposit_id,
        timestamp: new Date().toISOString()
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Escrow release error:', error)
    return {
      success: false,
      error: error.message || 'Failed to release escrow'
    }
  }
}

/**
 * Get file payment status
 *
 * @param deliveryId - File delivery ID
 * @param buyerEmail - Buyer email address
 * @returns Payment status
 */
export async function getFilePaymentStatus(
  deliveryId: string,
  buyerEmail?: string
): Promise<{
  hasPaid: boolean
  status?: string
  escrowStatus?: string
  transaction?: any
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('file_download_transactions')
      .select('*')
      .eq('delivery_id', deliveryId)

    if (buyerEmail) {
      query = query.eq('buyer_email', buyerEmail)
    }

    const { data: transactions } = await query

    const completedTransaction = transactions?.find(t => t.status === 'completed')

    if (completedTransaction) {
      // Get escrow status if applicable
      const { data: delivery } = await supabase
        .from('secure_file_deliveries')
        .select('escrow_deposit_id, status')
        .eq('id', deliveryId)
        .single()

      let escrowStatus = undefined

      if (delivery?.escrow_deposit_id) {
        const { data: escrow } = await supabase
          .from('escrow_deposits')
          .select('status')
          .eq('id', delivery.escrow_deposit_id)
          .single()

        escrowStatus = escrow?.status
      }

      return {
        hasPaid: true,
        status: completedTransaction.status,
        escrowStatus,
        transaction: completedTransaction
      }
    }

    return {
      hasPaid: false
    }
  } catch (error: any) {
    console.error('Payment status check error:', error)
    return {
      hasPaid: false
    }
  }
}

/**
 * Request refund for file payment
 *
 * @param deliveryId - File delivery ID
 * @param buyerEmail - Buyer email
 * @param reason - Refund reason
 * @returns Refund result
 */
export async function requestFileRefund(
  deliveryId: string,
  buyerEmail: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get transaction
    const { data: transaction } = await supabase
      .from('file_download_transactions')
      .select('*')
      .eq('delivery_id', deliveryId)
      .eq('buyer_email', buyerEmail)
      .eq('status', 'completed')
      .single()

    if (!transaction) {
      return {
        success: false,
        error: 'No completed payment found'
      }
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.payment_intent_id,
      reason: 'requested_by_customer'
    })

    // Update transaction
    await supabase
      .from('file_download_transactions')
      .update({
        status: 'refunded',
        metadata: {
          ...transaction.metadata,
          refundId: refund.id,
          refundReason: reason,
          refundedAt: new Date().toISOString()
        }
      })
      .eq('id', transaction.id)

    // Update delivery status
    await supabase
      .from('secure_file_deliveries')
      .update({ status: 'refunded' })
      .eq('id', deliveryId)

    // Log refund
    await supabase.from('file_access_logs').insert({
      delivery_id: deliveryId,
      action: 'payment_refunded',
      metadata: {
        reason,
        refundId: refund.id,
        amount: transaction.amount,
        timestamp: new Date().toISOString()
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Refund error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process refund'
    }
  }
}
