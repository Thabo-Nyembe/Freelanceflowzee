/**
 * Stripe Connect Service - Marketplace Payment Processing
 *
 * Handles escrow payments, seller payouts, and refunds for the marketplace.
 * Uses Stripe Connect with destination charges for marketplace functionality.
 *
 * Features:
 * - Escrow payment holding
 * - Seller account onboarding (Stripe Connect Express)
 * - Payment release to sellers
 * - Refund processing
 * - Platform fee collection
 */

import Stripe from 'stripe'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('StripeConnect')

// Types
export interface CreateMarketplacePaymentParams {
  amount: number
  currency: string
  buyerId: string
  sellerId: string
  sellerStripeAccountId: string
  orderId: string
  listingTitle: string
  platformFeePercent?: number
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  status?: string
  error?: string
}

export interface PayoutResult {
  success: boolean
  transferId?: string
  payoutId?: string
  amount?: number
  error?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  status?: string
  error?: string
}

export interface SellerAccountStatus {
  accountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requiresAction: boolean
  onboardingUrl?: string
}

// Stripe Connect Service Class
export class StripeConnectService {
  private stripe: Stripe | null = null
  private isTestMode: boolean = true
  private platformFeePercent: number = 5 // 5% platform fee

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
      this.isTestMode = stripeKey.startsWith('sk_test')
    }

    if (this.isTestMode) {
      logger.info('StripeConnectService initialized in test mode')
    } else {
      logger.info('StripeConnectService initialized in production mode')
    }
  }

  /**
   * Create a payment intent with escrow (destination charge)
   * Funds are held by the platform until released to seller
   */
  async createMarketplacePayment(params: CreateMarketplacePaymentParams): Promise<PaymentResult> {
    const {
      amount,
      currency,
      buyerId,
      sellerId,
      sellerStripeAccountId,
      orderId,
      listingTitle,
      platformFeePercent = this.platformFeePercent,
      metadata = {}
    } = params

    // Calculate platform fee
    const platformFee = Math.round(amount * (platformFeePercent / 100))

    logger.info('Creating marketplace payment', {
      amount,
      currency,
      orderId,
      platformFee,
      isTestMode: this.isTestMode
    })

    // Test mode - return mock data
    if (!this.stripe || this.isTestMode) {
      const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 15)}`

      logger.info('Mock marketplace payment created', { mockPaymentIntentId })

      return {
        success: true,
        paymentIntentId: mockPaymentIntentId,
        clientSecret: mockClientSecret,
        status: 'requires_payment_method'
      }
    }

    try {
      // Create payment intent with transfer_data for destination charge
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        // Destination charge - funds go to connected account
        transfer_data: {
          destination: sellerStripeAccountId,
        },
        // Platform fee
        application_fee_amount: platformFee,
        // Hold for manual capture (escrow)
        capture_method: 'manual',
        metadata: {
          order_id: orderId,
          buyer_id: buyerId,
          seller_id: sellerId,
          listing_title: listingTitle,
          platform_fee: platformFee.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      logger.info('Marketplace payment intent created', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status
      }
    } catch (error) {
      logger.error('Failed to create marketplace payment', { error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment'
      }
    }
  }

  /**
   * Capture (finalize) a held payment after buyer confirms delivery
   */
  async capturePayment(paymentIntentId: string): Promise<PaymentResult> {
    logger.info('Capturing payment', { paymentIntentId })

    if (!this.stripe || this.isTestMode) {
      logger.info('Mock payment captured', { paymentIntentId })
      return {
        success: true,
        paymentIntentId,
        status: 'succeeded'
      }
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId)

      logger.info('Payment captured successfully', {
        paymentIntentId,
        status: paymentIntent.status
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      }
    } catch (error) {
      logger.error('Failed to capture payment', { paymentIntentId, error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture payment'
      }
    }
  }

  /**
   * Release payment to seller (for orders without manual capture)
   * Creates a transfer to the connected account
   */
  async releasePaymentToSeller(params: {
    paymentIntentId: string
    sellerStripeAccountId: string
    amount: number
    orderId: string
  }): Promise<PayoutResult> {
    const { paymentIntentId, sellerStripeAccountId, amount, orderId } = params

    logger.info('Releasing payment to seller', {
      paymentIntentId,
      sellerStripeAccountId,
      amount
    })

    if (!this.stripe || this.isTestMode) {
      const mockTransferId = `tr_mock_${Date.now()}`
      logger.info('Mock payment released to seller', { mockTransferId })
      return {
        success: true,
        transferId: mockTransferId,
        amount
      }
    }

    try {
      // If using destination charges, the transfer happens automatically
      // This is for cases where we need to manually transfer
      const transfer = await this.stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: sellerStripeAccountId,
        transfer_group: orderId,
        metadata: {
          order_id: orderId,
          payment_intent_id: paymentIntentId
        }
      })

      logger.info('Payment released to seller', {
        transferId: transfer.id,
        amount: transfer.amount
      })

      return {
        success: true,
        transferId: transfer.id,
        amount: transfer.amount
      }
    } catch (error) {
      logger.error('Failed to release payment to seller', { error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release payment'
      }
    }
  }

  /**
   * Process a refund for a marketplace order
   */
  async processRefund(params: {
    paymentIntentId: string
    amount?: number // Full refund if not specified
    reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
    orderId: string
  }): Promise<RefundResult> {
    const { paymentIntentId, amount, reason = 'requested_by_customer', orderId } = params

    logger.info('Processing refund', {
      paymentIntentId,
      amount,
      reason
    })

    if (!this.stripe || this.isTestMode) {
      const mockRefundId = `re_mock_${Date.now()}`
      logger.info('Mock refund processed', { mockRefundId })
      return {
        success: true,
        refundId: mockRefundId,
        amount: amount || 0,
        status: 'succeeded'
      }
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason,
        metadata: {
          order_id: orderId
        }
      }

      if (amount) {
        refundParams.amount = amount
      }

      // Also reverse the transfer to connected account
      refundParams.reverse_transfer = true

      const refund = await this.stripe.refunds.create(refundParams)

      logger.info('Refund processed successfully', {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      })

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    } catch (error) {
      logger.error('Failed to process refund', { paymentIntentId, error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      }
    }
  }

  /**
   * Cancel a held payment (for orders cancelled before work starts)
   */
  async cancelPayment(paymentIntentId: string, reason?: string): Promise<PaymentResult> {
    logger.info('Cancelling payment', { paymentIntentId, reason })

    if (!this.stripe || this.isTestMode) {
      logger.info('Mock payment cancelled', { paymentIntentId })
      return {
        success: true,
        paymentIntentId,
        status: 'canceled'
      }
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: 'requested_by_customer'
      })

      logger.info('Payment cancelled successfully', {
        paymentIntentId,
        status: paymentIntent.status
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      }
    } catch (error) {
      logger.error('Failed to cancel payment', { paymentIntentId, error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel payment'
      }
    }
  }

  /**
   * Create a Stripe Connect Express account for a seller
   */
  async createSellerAccount(params: {
    userId: string
    email: string
    businessName?: string
    country?: string
  }): Promise<{ accountId: string; onboardingUrl: string } | { error: string }> {
    const { userId, email, businessName, country = 'US' } = params

    logger.info('Creating seller Connect account', { userId, email })

    if (!this.stripe || this.isTestMode) {
      const mockAccountId = `acct_mock_${Date.now()}`
      return {
        accountId: mockAccountId,
        onboardingUrl: `https://connect.stripe.com/express/onboard/${mockAccountId}?mock=true`
      }
    }

    try {
      // Create Express account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_profile: {
          name: businessName,
          product_description: 'Freelance services on KAZI marketplace'
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          user_id: userId
        }
      })

      // Create onboarding link
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/onboard?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/onboard?success=true`,
        type: 'account_onboarding',
      })

      logger.info('Seller account created', { accountId: account.id })

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url
      }
    } catch (error) {
      logger.error('Failed to create seller account', { error })
      return {
        error: error instanceof Error ? error.message : 'Failed to create seller account'
      }
    }
  }

  /**
   * Get the status of a seller's Connect account
   */
  async getSellerAccountStatus(accountId: string): Promise<SellerAccountStatus | { error: string }> {
    logger.info('Getting seller account status', { accountId })

    if (!this.stripe || this.isTestMode) {
      return {
        accountId,
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
        requiresAction: false
      }
    }

    try {
      const account = await this.stripe.accounts.retrieve(accountId)

      const status: SellerAccountStatus = {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted || false,
        requiresAction: !account.charges_enabled || !account.payouts_enabled
      }

      // Generate onboarding link if account needs action
      if (status.requiresAction) {
        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/onboard?refresh=true`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/onboard?success=true`,
          type: 'account_onboarding',
        })
        status.onboardingUrl = accountLink.url
      }

      return status
    } catch (error) {
      logger.error('Failed to get seller account status', { accountId, error })
      return {
        error: error instanceof Error ? error.message : 'Failed to get account status'
      }
    }
  }

  /**
   * Create a dashboard login link for sellers
   */
  async createSellerDashboardLink(accountId: string): Promise<{ url: string } | { error: string }> {
    logger.info('Creating seller dashboard link', { accountId })

    if (!this.stripe || this.isTestMode) {
      return {
        url: `https://dashboard.stripe.com/test/connect/accounts/${accountId}`
      }
    }

    try {
      const loginLink = await this.stripe.accounts.createLoginLink(accountId)
      return { url: loginLink.url }
    } catch (error) {
      logger.error('Failed to create dashboard link', { accountId, error })
      return {
        error: error instanceof Error ? error.message : 'Failed to create dashboard link'
      }
    }
  }

  /**
   * Get seller's balance on Stripe
   */
  async getSellerBalance(accountId: string): Promise<{ available: number; pending: number } | { error: string }> {
    logger.info('Getting seller balance', { accountId })

    if (!this.stripe || this.isTestMode) {
      return {
        available: 100000, // $1000.00 mock
        pending: 50000    // $500.00 mock
      }
    }

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: accountId
      })

      const available = balance.available.reduce((sum, b) => sum + b.amount, 0)
      const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0)

      return { available, pending }
    } catch (error) {
      logger.error('Failed to get seller balance', { accountId, error })
      return {
        error: error instanceof Error ? error.message : 'Failed to get balance'
      }
    }
  }

  /**
   * Verify payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string
    amount: number
    capturedAmount: number
    refundedAmount: number
  } | { error: string }> {
    if (!this.stripe || this.isTestMode) {
      return {
        status: 'succeeded',
        amount: 10000,
        capturedAmount: 10000,
        refundedAmount: 0
      }
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        capturedAmount: paymentIntent.amount_received,
        refundedAmount: paymentIntent.amount - paymentIntent.amount_received
      }
    } catch (error) {
      logger.error('Failed to get payment status', { paymentIntentId, error })
      return {
        error: error instanceof Error ? error.message : 'Failed to get payment status'
      }
    }
  }

  /**
   * Check if service is in test mode
   */
  isInTestMode(): boolean {
    return this.isTestMode
  }
}

// Export singleton instance
export const stripeConnectService = new StripeConnectService()

export default stripeConnectService
