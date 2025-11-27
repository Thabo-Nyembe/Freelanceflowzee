/**
 * Billing Settings Database Queries
 * Comprehensive billing system with subscriptions, payment methods, invoices, transactions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type PlanType = 'free' | 'professional' | 'enterprise' | 'custom'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'paused' | 'trialing' | 'expired'
export type PaymentMethodType = 'card' | 'bank_account' | 'paypal' | 'crypto' | 'other'
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'overdue'
export type TransactionStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
export type BillingInterval = 'monthly' | 'quarterly' | 'annual' | 'lifetime'
export type TransactionType = 'payment' | 'refund' | 'dispute' | 'adjustment'

export interface Subscription {
  id: string
  user_id: string
  plan_type: PlanType
  status: SubscriptionStatus
  billing_interval: BillingInterval
  amount: number
  currency: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  cancellation_reason?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  method_type: PaymentMethodType
  is_default: boolean
  card_brand?: string
  card_last4?: string
  card_exp_month?: number
  card_exp_year?: number
  bank_name?: string
  bank_last4?: string
  is_verified: boolean
  is_active: boolean
  stripe_payment_method_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BillingAddress {
  id: string
  user_id: string
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  tax_id?: string
  tax_id_type?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  subscription_id?: string
  invoice_number: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  discount: number
  total: number
  amount_paid: number
  amount_due: number
  currency: string
  invoice_date: string
  due_date?: string
  paid_at?: string
  line_items: any[]
  stripe_invoice_id?: string
  invoice_pdf_url?: string
  description?: string
  notes?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  invoice_id?: string
  payment_method_id?: string
  status: TransactionStatus
  amount: number
  currency: string
  transaction_type: TransactionType
  processed_at?: string
  failed_at?: string
  refunded_at?: string
  error_message?: string
  error_code?: string
  stripe_charge_id?: string
  stripe_payment_intent_id?: string
  description?: string
  metadata: Record<string, any>
  created_at: string
}

export interface SubscriptionUsage {
  id: string
  user_id: string
  subscription_id?: string
  period_start: string
  period_end: string
  projects_used: number
  storage_used: number
  ai_requests_used: number
  collaborators_used: number
  video_minutes_used: number
  projects_limit: number
  storage_limit: number
  ai_requests_limit: number
  collaborators_limit: number
  video_minutes_limit: number
  is_current_period: boolean
  created_at: string
  updated_at: string
}

export interface BillingCredit {
  id: string
  user_id: string
  amount: number
  currency: string
  description: string
  balance: number
  used_amount: number
  expires_at?: string
  source?: string
  promo_code?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export async function getUserSubscription(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function createSubscription(userId: string, subscriptionData: Partial<Subscription>) {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      ...subscriptionData
    })
    .select()
    .single()
}

export async function updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single()
}

export async function cancelSubscription(subscriptionId: string, reason?: string, immediate: boolean = false) {
  const supabase = createClient()
  const updates: Partial<Subscription> = {
    cancel_at_period_end: !immediate,
    cancellation_reason: reason
  }

  if (immediate) {
    updates.status = 'canceled'
    updates.canceled_at = new Date().toISOString()
  }

  return await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single()
}

export async function reactivateSubscription(subscriptionId: string) {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancel_at_period_end: false,
      canceled_at: null,
      cancellation_reason: null
    })
    .eq('id', subscriptionId)
    .select()
    .single()
}

export async function changePlan(subscriptionId: string, newPlanType: PlanType, newAmount: number) {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .update({
      plan_type: newPlanType,
      amount: newAmount
    })
    .eq('id', subscriptionId)
    .select()
    .single()
}

export async function getActiveSubscriptions(status: SubscriptionStatus = 'active') {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
}

export async function getExpiringSubscriptions(daysAhead: number = 7) {
  const supabase = createClient()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)

  return await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('current_period_end', futureDate.toISOString())
    .order('current_period_end')
}

export async function getTrialingSubscriptions() {
  const supabase = createClient()
  return await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'trialing')
    .order('trial_end')
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export async function getUserPaymentMethods(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
}

export async function getDefaultPaymentMethod(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .eq('is_active', true)
    .single()
}

export async function createPaymentMethod(userId: string, methodData: Partial<PaymentMethod>) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      ...methodData
    })
    .select()
    .single()
}

export async function updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', methodId)
    .select()
    .single()
}

export async function setDefaultPaymentMethod(methodId: string, userId: string) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', methodId)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function deletePaymentMethod(methodId: string) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .update({ is_active: false })
    .eq('id', methodId)
    .select()
    .single()
}

export async function verifyPaymentMethod(methodId: string) {
  const supabase = createClient()
  return await supabase
    .from('payment_methods')
    .update({ is_verified: true })
    .eq('id', methodId)
    .select()
    .single()
}

// ============================================================================
// BILLING ADDRESSES
// ============================================================================

export async function getUserBillingAddresses(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
}

export async function getDefaultBillingAddress(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()
}

export async function createBillingAddress(userId: string, addressData: Partial<BillingAddress>) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .insert({
      user_id: userId,
      ...addressData
    })
    .select()
    .single()
}

export async function updateBillingAddress(addressId: string, updates: Partial<BillingAddress>) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .update(updates)
    .eq('id', addressId)
    .select()
    .single()
}

export async function setDefaultBillingAddress(addressId: string, userId: string) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function deleteBillingAddress(addressId: string) {
  const supabase = createClient()
  return await supabase
    .from('billing_addresses')
    .delete()
    .eq('id', addressId)
}

// ============================================================================
// INVOICES
// ============================================================================

export async function getUserInvoices(userId: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('invoice_date', { ascending: false })
    .limit(limit)
}

export async function getInvoiceById(invoiceId: string) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single()
}

export async function createInvoice(userId: string, invoiceData: Partial<Invoice>) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      ...invoiceData
    })
    .select()
    .single()
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()
}

export async function markInvoicePaid(invoiceId: string, paidAmount?: number) {
  const supabase = createClient()
  const updates: Partial<Invoice> = {
    status: 'paid'
  }

  if (paidAmount !== undefined) {
    updates.amount_paid = paidAmount
  }

  return await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()
}

export async function voidInvoice(invoiceId: string) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .update({ status: 'void' })
    .eq('id', invoiceId)
    .select()
    .single()
}

export async function getUnpaidInvoices(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['open', 'overdue'])
    .order('due_date')
}

export async function getOverdueInvoices(userId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('invoices')
    .select('*')
    .eq('status', 'overdue')
    .order('due_date')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  return await query
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function getUserTransactions(userId: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getTransactionById(transactionId: string) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()
}

export async function createTransaction(userId: string, transactionData: Partial<Transaction>) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      ...transactionData
    })
    .select()
    .single()
}

export async function updateTransaction(transactionId: string, updates: Partial<Transaction>) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single()
}

export async function markTransactionSucceeded(transactionId: string) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .update({
      status: 'succeeded',
      processed_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single()
}

export async function markTransactionFailed(transactionId: string, errorMessage?: string, errorCode?: string) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString(),
      error_message: errorMessage,
      error_code: errorCode
    })
    .eq('id', transactionId)
    .select()
    .single()
}

export async function refundTransaction(transactionId: string, amount: number) {
  const supabase = createClient()

  // Update original transaction
  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('id', transactionId)

  // Get original transaction to create refund
  const { data: originalTx } = await getTransactionById(transactionId)

  if (!originalTx) {
    return { data: null, error: new Error('Original transaction not found') }
  }

  // Create refund transaction
  return await createTransaction(originalTx.user_id, {
    invoice_id: originalTx.invoice_id,
    payment_method_id: originalTx.payment_method_id,
    status: 'succeeded',
    amount: -amount,
    currency: originalTx.currency,
    transaction_type: 'refund',
    processed_at: new Date().toISOString(),
    description: `Refund for transaction ${transactionId}`,
    metadata: { original_transaction_id: transactionId }
  })
}

export async function getPendingTransactions(limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at')
    .limit(limit)
}

export async function getFailedTransactions(userId?: string, limit: number = 50) {
  const supabase = createClient()
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  return await query
}

// ============================================================================
// SUBSCRIPTION USAGE
// ============================================================================

export async function getCurrentUsage(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('subscription_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current_period', true)
    .single()
}

export async function getUserUsageHistory(userId: string, limit: number = 12) {
  const supabase = createClient()
  return await supabase
    .from('subscription_usage')
    .select('*')
    .eq('user_id', userId)
    .order('period_start', { ascending: false })
    .limit(limit)
}

export async function createUsageRecord(userId: string, usageData: Partial<SubscriptionUsage>) {
  const supabase = createClient()
  return await supabase
    .from('subscription_usage')
    .insert({
      user_id: userId,
      ...usageData
    })
    .select()
    .single()
}

export async function updateUsageMetrics(usageId: string, metrics: Partial<SubscriptionUsage>) {
  const supabase = createClient()
  return await supabase
    .from('subscription_usage')
    .update(metrics)
    .eq('id', usageId)
    .select()
    .single()
}

export async function incrementUsage(
  userId: string,
  metric: 'projects_used' | 'storage_used' | 'ai_requests_used' | 'collaborators_used' | 'video_minutes_used',
  amount: number = 1
) {
  const supabase = createClient()

  const { data: currentUsage } = await getCurrentUsage(userId)

  if (!currentUsage) {
    return { data: null, error: new Error('No current usage period found') }
  }

  return await supabase
    .from('subscription_usage')
    .update({
      [metric]: currentUsage[metric] + amount
    })
    .eq('id', currentUsage.id)
    .select()
    .single()
}

export async function checkUsageLimit(userId: string, metric: keyof SubscriptionUsage): Promise<{ withinLimit: boolean; used: number; limit: number }> {
  const { data: usage } = await getCurrentUsage(userId)

  if (!usage) {
    return { withinLimit: false, used: 0, limit: 0 }
  }

  const usedKey = metric as keyof typeof usage
  const limitKey = `${metric.replace('_used', '_limit')}` as keyof typeof usage

  const used = usage[usedKey] as number
  const limit = usage[limitKey] as number

  return {
    withinLimit: limit === -1 || used < limit,
    used,
    limit
  }
}

// ============================================================================
// BILLING CREDITS
// ============================================================================

export async function getUserCredits(userId: string) {
  const supabase = createClient()
  const now = new Date().toISOString()

  return await supabase
    .from('billing_credits')
    .select('*')
    .eq('user_id', userId)
    .gt('balance', 0)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('expires_at')
}

export async function getTotalCreditsBalance(userId: string): Promise<number> {
  const { data: credits } = await getUserCredits(userId)

  if (!credits) return 0

  return credits.reduce((total, credit) => total + credit.balance, 0)
}

export async function createCredit(userId: string, creditData: Partial<BillingCredit>) {
  const supabase = createClient()
  return await supabase
    .from('billing_credits')
    .insert({
      user_id: userId,
      ...creditData
    })
    .select()
    .single()
}

export async function applyCredit(userId: string, amount: number): Promise<{ success: boolean; appliedAmount: number; remainingAmount: number }> {
  const { data: credits } = await getUserCredits(userId)

  if (!credits || credits.length === 0) {
    return { success: false, appliedAmount: 0, remainingAmount: amount }
  }

  let remainingAmount = amount
  let appliedAmount = 0
  const supabase = createClient()

  for (const credit of credits) {
    if (remainingAmount <= 0) break

    const amountToUse = Math.min(credit.balance, remainingAmount)

    await supabase
      .from('billing_credits')
      .update({
        used_amount: credit.used_amount + amountToUse
      })
      .eq('id', credit.id)

    appliedAmount += amountToUse
    remainingAmount -= amountToUse
  }

  return {
    success: appliedAmount > 0,
    appliedAmount,
    remainingAmount
  }
}

export async function getExpiredCredits(userId?: string) {
  const supabase = createClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('billing_credits')
    .select('*')
    .lt('expires_at', now)
    .gt('balance', 0)
    .order('expires_at')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  return await query
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getBillingStats(userId: string) {
  const supabase = createClient()

  const [
    subscriptionResult,
    paymentMethodsResult,
    invoicesResult,
    transactionsResult,
    usageResult,
    creditsResult
  ] = await Promise.all([
    getUserSubscription(userId),
    getUserPaymentMethods(userId),
    getUserInvoices(userId),
    getUserTransactions(userId, 100),
    getCurrentUsage(userId),
    getUserCredits(userId)
  ])

  const invoices = invoicesResult.data || []
  const transactions = transactionsResult.data || []
  const credits = creditsResult.data || []

  const totalSpent = transactions
    .filter(t => t.status === 'succeeded' && t.transaction_type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalRefunded = transactions
    .filter(t => t.status === 'succeeded' && t.transaction_type === 'refund')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const unpaidInvoices = invoices.filter(i => i.status === 'open' || i.status === 'overdue')
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  const totalCreditsBalance = credits.reduce((sum, c) => sum + c.balance, 0)

  return {
    subscription: subscriptionResult.data,
    paymentMethods: {
      total: paymentMethodsResult.data?.length || 0,
      verified: paymentMethodsResult.data?.filter(pm => pm.is_verified).length || 0,
      default: paymentMethodsResult.data?.find(pm => pm.is_default)
    },
    invoices: {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      unpaid: unpaidInvoices.length,
      overdue: overdueInvoices.length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
      totalPaid: invoices.reduce((sum, i) => sum + i.amount_paid, 0),
      totalDue: invoices.reduce((sum, i) => sum + i.amount_due, 0)
    },
    transactions: {
      total: transactions.length,
      succeeded: transactions.filter(t => t.status === 'succeeded').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      totalSpent,
      totalRefunded
    },
    usage: usageResult.data,
    credits: {
      total: credits.length,
      totalBalance: totalCreditsBalance,
      expiringSoon: credits.filter(c => {
        if (!c.expires_at) return false
        const daysUntilExpiry = (new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length
    }
  }
}

export async function getRevenueStats(startDate?: string, endDate?: string) {
  const supabase = createClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('status', 'succeeded')
    .eq('transaction_type', 'payment')

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data: transactions } = await query

  if (!transactions) {
    return {
      totalRevenue: 0,
      transactionCount: 0,
      averageTransactionValue: 0,
      monthlyRevenue: []
    }
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

  // Group by month
  const monthlyRevenue = transactions.reduce((acc, t) => {
    const month = new Date(t.created_at).toISOString().slice(0, 7)
    acc[month] = (acc[month] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  return {
    totalRevenue,
    transactionCount: transactions.length,
    averageTransactionValue: transactions.length > 0 ? totalRevenue / transactions.length : 0,
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }))
  }
}
