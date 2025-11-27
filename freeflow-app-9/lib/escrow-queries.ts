/**
 * Escrow & Secure Payment System - Database Queries
 *
 * Comprehensive query library for escrow deposits, milestone tracking,
 * and secure payment management with Supabase integration.
 *
 * Database Schema: 11 tables
 * - escrow_deposits: Main escrow deposit records
 * - escrow_milestones: Project milestones for phased payments
 * - milestone_attachments: File attachments for deliverables
 * - escrow_fees: Fee breakdown and calculations
 * - escrow_transactions: Transaction history
 * - escrow_disputes: Dispute management
 * - dispute_evidence: Evidence files for disputes
 * - escrow_contracts: Contract documents
 * - contract_terms: Individual contract terms
 * - release_requests: Fund release approval requests
 * - escrow_metadata: Additional metadata and analytics
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EscrowStatus = 'pending' | 'active' | 'completed' | 'disputed' | 'released' | 'refunded' | 'cancelled'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'approved' | 'rejected'
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'crypto' | 'wire_transfer' | 'credit_card'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'escalated' | 'closed'
export type TransactionType = 'deposit' | 'release' | 'refund' | 'fee' | 'chargeback' | 'adjustment'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface EscrowDeposit {
  id: string
  user_id: string
  project_title: string
  project_description?: string
  client_name: string
  client_email: string
  client_id?: string
  client_avatar?: string
  amount: number
  currency: Currency
  status: EscrowStatus
  progress_percentage: number
  completion_password: string
  payment_method: PaymentMethod
  payment_id?: string
  contract_url?: string
  contract_signed_at?: string
  dispute_reason?: string
  dispute_status?: DisputeStatus
  notes?: string
  created_at: string
  updated_at: string
  released_at?: string
  completed_at?: string
  cancelled_at?: string
}

export interface EscrowMilestone {
  id: string
  deposit_id: string
  title: string
  description: string
  amount: number
  percentage: number
  status: MilestoneStatus
  due_date?: string
  start_date?: string
  completed_at?: string
  approved_at?: string
  rejected_at?: string
  dependencies?: string[]
  deliverables?: string[]
  approval_notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface MilestoneAttachment {
  id: string
  milestone_id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
  uploaded_by?: string
}

export interface EscrowFees {
  id: string
  deposit_id: string
  platform_fee: number
  platform_percentage: number
  payment_fee: number
  payment_percentage: number
  withdrawal_fee: number
  total_fees: number
  currency: Currency
  created_at: string
  updated_at: string
}

export interface EscrowTransaction {
  id: string
  deposit_id: string
  type: TransactionType
  amount: number
  currency: Currency
  status: TransactionStatus
  payment_method: PaymentMethod
  payment_id?: string
  description: string
  from_user_id?: string
  to_user_id?: string
  fees: number
  net_amount: number
  metadata?: Record<string, any>
  created_at: string
  completed_at?: string
}

export interface EscrowDispute {
  id: string
  deposit_id: string
  milestone_id?: string
  raised_by: 'client' | 'freelancer'
  raised_by_id: string
  raised_at: string
  status: DisputeStatus
  reason: string
  description: string
  resolution?: string
  resolved_at?: string
  resolved_by?: string
  escalated_at?: string
  escalated_to?: string
  created_at: string
  updated_at: string
}

export interface DisputeEvidence {
  id: string
  dispute_id: string
  type: 'file' | 'screenshot' | 'message' | 'contract' | 'other'
  url: string
  description: string
  uploaded_at: string
  uploaded_by?: string
}

export interface EscrowContract {
  id: string
  deposit_id: string
  title: string
  content: string
  file_url?: string
  signed_by_client: boolean
  signed_by_freelancer: boolean
  client_signed_at?: string
  freelancer_signed_at?: string
  version: number
  created_at: string
  updated_at: string
}

export interface ContractTerm {
  id: string
  contract_id: string
  section: string
  title: string
  content: string
  required: boolean
  agreed_by_client: boolean
  agreed_by_freelancer: boolean
  created_at: string
}

export interface ReleaseRequest {
  id: string
  deposit_id: string
  milestone_id?: string
  requested_by: string
  requested_at: string
  approved_by?: string
  approved_at?: string
  rejected_by?: string
  rejected_at?: string
  rejection_reason?: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface EscrowMetadata {
  id: string
  deposit_id: string
  estimated_duration?: number
  actual_duration?: number
  total_edits: number
  total_disputes: number
  total_releases: number
  average_milestone_time?: number
  client_rating?: number
  freelancer_rating?: number
  tags?: string[]
  category?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// ESCROW DEPOSIT QUERIES (10 functions)
// ============================================================================

/**
 * Get all escrow deposits for current user
 */
export async function getEscrowDeposits(filters?: {
  status?: EscrowStatus
  currency?: Currency
  client_email?: string
  limit?: number
  offset?: number
}): Promise<EscrowDeposit[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('escrow_deposits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.currency) query = query.eq('currency', filters.currency)
  if (filters?.client_email) query = query.eq('client_email', filters.client_email)
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get single escrow deposit by ID
 */
export async function getEscrowDeposit(depositId: string): Promise<EscrowDeposit | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .select('*')
    .eq('id', depositId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create new escrow deposit
 */
export async function createEscrowDeposit(depositData: {
  project_title: string
  project_description?: string
  client_name: string
  client_email: string
  client_id?: string
  amount: number
  currency?: Currency
  payment_method?: PaymentMethod
  completion_password: string
  notes?: string
}): Promise<EscrowDeposit> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .insert({
      ...depositData,
      user_id: user.id,
      currency: depositData.currency || 'USD',
      payment_method: depositData.payment_method || 'stripe',
      status: 'pending',
      progress_percentage: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update escrow deposit
 */
export async function updateEscrowDeposit(
  depositId: string,
  updates: Partial<Omit<EscrowDeposit, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('escrow_deposits')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', depositId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete escrow deposit
 */
export async function deleteEscrowDeposit(depositId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('escrow_deposits')
    .delete()
    .eq('id', depositId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Release escrow funds (requires password verification)
 */
export async function releaseEscrowFunds(
  depositId: string,
  verificationPassword: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify password
  const { data: deposit } = await supabase
    .from('escrow_deposits')
    .select('completion_password, amount, status')
    .eq('id', depositId)
    .eq('user_id', user.id)
    .single()

  if (!deposit) {
    return { success: false, message: 'Deposit not found' }
  }

  if (deposit.completion_password !== verificationPassword) {
    return { success: false, message: 'Invalid completion password' }
  }

  if (deposit.status !== 'active') {
    return { success: false, message: 'Deposit must be active to release funds' }
  }

  // Update deposit status
  const { error } = await supabase
    .from('escrow_deposits')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', depositId)
    .eq('user_id', user.id)

  if (error) throw error

  // Create transaction record
  await createEscrowTransaction({
    deposit_id: depositId,
    type: 'release',
    amount: deposit.amount,
    currency: 'USD',
    payment_method: 'stripe',
    description: 'Funds released from escrow',
    to_user_id: user.id,
    status: 'completed'
  })

  return { success: true, message: 'Funds released successfully' }
}

/**
 * Update deposit status
 */
export async function updateDepositStatus(
  depositId: string,
  status: EscrowStatus
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'released') updates.released_at = new Date().toISOString()
  if (status === 'completed') updates.completed_at = new Date().toISOString()
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString()

  const { error } = await supabase
    .from('escrow_deposits')
    .update(updates)
    .eq('id', depositId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get escrow deposits by status counts
 */
export async function getDepositStatusCounts(): Promise<Record<EscrowStatus, number>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .select('status')
    .eq('user_id', user.id)

  if (error) throw error

  const counts: Record<string, number> = {
    pending: 0,
    active: 0,
    completed: 0,
    disputed: 0,
    released: 0,
    refunded: 0,
    cancelled: 0
  }

  data?.forEach(deposit => {
    counts[deposit.status] = (counts[deposit.status] || 0) + 1
  })

  return counts as Record<EscrowStatus, number>
}

/**
 * Search escrow deposits
 */
export async function searchEscrowDeposits(searchTerm: string): Promise<EscrowDeposit[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .select('*')
    .eq('user_id', user.id)
    .or(`project_title.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,client_email.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get total escrow value
 */
export async function getTotalEscrowValue(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .select('amount')
    .eq('user_id', user.id)

  if (error) throw error

  return data?.reduce((sum, deposit) => sum + Number(deposit.amount), 0) || 0
}

// ============================================================================
// MILESTONE QUERIES (8 functions)
// ============================================================================

/**
 * Get all milestones for a deposit
 */
export async function getDepositMilestones(depositId: string): Promise<EscrowMilestone[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_milestones')
    .select('*')
    .eq('deposit_id', depositId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get single milestone by ID
 */
export async function getMilestone(milestoneId: string): Promise<EscrowMilestone | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_milestones')
    .select('*')
    .eq('id', milestoneId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create new milestone
 */
export async function createMilestone(milestoneData: {
  deposit_id: string
  title: string
  description: string
  amount: number
  percentage: number
  due_date?: string
  dependencies?: string[]
  deliverables?: string[]
}): Promise<EscrowMilestone> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_milestones')
    .insert({
      ...milestoneData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update milestone
 */
export async function updateMilestone(
  milestoneId: string,
  updates: Partial<Omit<EscrowMilestone, 'id' | 'deposit_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_milestones')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Delete milestone
 */
export async function deleteMilestone(milestoneId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_milestones')
    .delete()
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Complete milestone
 */
export async function completeMilestone(
  milestoneId: string,
  deliverables?: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      deliverables: deliverables || [],
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Approve milestone
 */
export async function approveMilestone(
  milestoneId: string,
  approvalNotes?: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approval_notes: approvalNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Reject milestone
 */
export async function rejectMilestone(
  milestoneId: string,
  rejectionReason: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestoneId)

  if (error) throw error
}

// ============================================================================
// MILESTONE ATTACHMENTS (4 functions)
// ============================================================================

/**
 * Get milestone attachments
 */
export async function getMilestoneAttachments(milestoneId: string): Promise<MilestoneAttachment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone_attachments')
    .select('*')
    .eq('milestone_id', milestoneId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create milestone attachment
 */
export async function createMilestoneAttachment(attachmentData: {
  milestone_id: string
  name: string
  url: string
  size: number
  type: string
}): Promise<MilestoneAttachment> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('milestone_attachments')
    .insert({
      ...attachmentData,
      uploaded_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete milestone attachment
 */
export async function deleteMilestoneAttachment(attachmentId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('milestone_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
}

/**
 * Get total attachments size for milestone
 */
export async function getMilestoneTotalAttachmentsSize(milestoneId: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('milestone_attachments')
    .select('size')
    .eq('milestone_id', milestoneId)

  if (error) throw error

  return data?.reduce((sum, att) => sum + Number(att.size), 0) || 0
}

// ============================================================================
// FEES QUERIES (3 functions)
// ============================================================================

/**
 * Get escrow fees for deposit
 */
export async function getEscrowFees(depositId: string): Promise<EscrowFees | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_fees')
    .select('*')
    .eq('deposit_id', depositId)
    .single()

  if (error) throw error
  return data
}

/**
 * Calculate escrow fees (called automatically by trigger)
 */
export async function calculateEscrowFees(
  amount: number,
  paymentMethod: PaymentMethod
): Promise<{
  platform_fee: number
  platform_percentage: number
  payment_fee: number
  payment_percentage: number
  withdrawal_fee: number
  total_fees: number
}> {
  const platformPercentage = 3.0
  let paymentPercentage = 2.0

  // Adjust payment percentage based on payment method
  switch (paymentMethod) {
    case 'stripe':
    case 'credit_card':
      paymentPercentage = 2.9
      break
    case 'paypal':
      paymentPercentage = 3.49
      break
    case 'bank_transfer':
    case 'wire_transfer':
      paymentPercentage = 1.0
      break
    case 'crypto':
      paymentPercentage = 1.5
      break
  }

  const platformFee = (amount * platformPercentage) / 100
  const paymentFee = (amount * paymentPercentage) / 100
  const withdrawalFee = 50
  const totalFees = platformFee + paymentFee + withdrawalFee

  return {
    platform_fee: platformFee,
    platform_percentage: platformPercentage,
    payment_fee: paymentFee,
    payment_percentage: paymentPercentage,
    withdrawal_fee: withdrawalFee,
    total_fees: totalFees
  }
}

/**
 * Get total fees paid by user
 */
export async function getTotalFeesPaid(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: deposits } = await supabase
    .from('escrow_deposits')
    .select('id')
    .eq('user_id', user.id)

  if (!deposits) return 0

  const depositIds = deposits.map(d => d.id)

  const { data: fees, error } = await supabase
    .from('escrow_fees')
    .select('total_fees')
    .in('deposit_id', depositIds)

  if (error) throw error

  return fees?.reduce((sum, fee) => sum + Number(fee.total_fees), 0) || 0
}

// ============================================================================
// TRANSACTION QUERIES (5 functions)
// ============================================================================

/**
 * Get all transactions for deposit
 */
export async function getDepositTransactions(depositId: string): Promise<EscrowTransaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('deposit_id', depositId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all user transactions
 */
export async function getUserTransactions(filters?: {
  type?: TransactionType
  status?: TransactionStatus
  limit?: number
}): Promise<EscrowTransaction[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('escrow_transactions')
    .select('*')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Create escrow transaction
 */
export async function createEscrowTransaction(transactionData: {
  deposit_id: string
  type: TransactionType
  amount: number
  currency: Currency
  payment_method: PaymentMethod
  description: string
  from_user_id?: string
  to_user_id?: string
  fees?: number
  net_amount?: number
  status?: TransactionStatus
  metadata?: Record<string, any>
}): Promise<EscrowTransaction> {
  const supabase = createClient()

  const netAmount = transactionData.net_amount ||
    (transactionData.amount - (transactionData.fees || 0))

  const { data, error } = await supabase
    .from('escrow_transactions')
    .insert({
      ...transactionData,
      fees: transactionData.fees || 0,
      net_amount: netAmount,
      status: transactionData.status || 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus
): Promise<void> {
  const supabase = createClient()

  const updates: any = { status }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('escrow_transactions')
    .update(updates)
    .eq('id', transactionId)

  if (error) throw error
}

/**
 * Get transaction statistics
 */
export async function getTransactionStatistics(): Promise<{
  total_transactions: number
  total_volume: number
  total_fees: number
  by_type: Record<TransactionType, { count: number; volume: number }>
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('type, amount, fees')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)

  if (error) throw error

  const stats = {
    total_transactions: data?.length || 0,
    total_volume: data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0,
    total_fees: data?.reduce((sum, tx) => sum + Number(tx.fees), 0) || 0,
    by_type: {} as Record<TransactionType, { count: number; volume: number }>
  }

  // Group by type
  const types: TransactionType[] = ['deposit', 'release', 'refund', 'fee', 'chargeback', 'adjustment']
  types.forEach(type => {
    const typeData = data?.filter(tx => tx.type === type) || []
    stats.by_type[type] = {
      count: typeData.length,
      volume: typeData.reduce((sum, tx) => sum + Number(tx.amount), 0)
    }
  })

  return stats
}

// ============================================================================
// DISPUTE QUERIES (6 functions)
// ============================================================================

/**
 * Get all disputes for deposit
 */
export async function getDepositDisputes(depositId: string): Promise<EscrowDispute[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_disputes')
    .select('*')
    .eq('deposit_id', depositId)
    .order('raised_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all user disputes
 */
export async function getUserDisputes(filters?: {
  status?: DisputeStatus
  raised_by?: 'client' | 'freelancer'
}): Promise<EscrowDispute[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('escrow_disputes')
    .select('*')
    .eq('raised_by_id', user.id)
    .order('raised_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.raised_by) query = query.eq('raised_by', filters.raised_by)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Create dispute
 */
export async function createDispute(disputeData: {
  deposit_id: string
  milestone_id?: string
  raised_by: 'client' | 'freelancer'
  reason: string
  description: string
}): Promise<EscrowDispute> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_disputes')
    .insert({
      ...disputeData,
      raised_by_id: user.id,
      status: 'open'
    })
    .select()
    .single()

  if (error) throw error

  // Update deposit status to disputed
  await updateDepositStatus(disputeData.deposit_id, 'disputed')

  return data
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: string,
  status: DisputeStatus,
  resolution?: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'resolved' && resolution) {
    updates.resolution = resolution
    updates.resolved_at = new Date().toISOString()
    updates.resolved_by = user?.id
  }

  if (status === 'escalated') {
    updates.escalated_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('escrow_disputes')
    .update(updates)
    .eq('id', disputeId)

  if (error) throw error
}

/**
 * Add dispute evidence
 */
export async function addDisputeEvidence(evidenceData: {
  dispute_id: string
  type: 'file' | 'screenshot' | 'message' | 'contract' | 'other'
  url: string
  description: string
}): Promise<DisputeEvidence> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('dispute_evidence')
    .insert({
      ...evidenceData,
      uploaded_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get dispute evidence
 */
export async function getDisputeEvidence(disputeId: string): Promise<DisputeEvidence[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dispute_evidence')
    .select('*')
    .eq('dispute_id', disputeId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ============================================================================
// CONTRACT QUERIES (5 functions)
// ============================================================================

/**
 * Get contract for deposit
 */
export async function getDepositContract(depositId: string): Promise<EscrowContract | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_contracts')
    .select('*')
    .eq('deposit_id', depositId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Create contract
 */
export async function createContract(contractData: {
  deposit_id: string
  title: string
  content: string
  file_url?: string
}): Promise<EscrowContract> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_contracts')
    .insert({
      ...contractData,
      version: 1,
      signed_by_client: false,
      signed_by_freelancer: false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sign contract
 */
export async function signContract(
  contractId: string,
  signedBy: 'client' | 'freelancer'
): Promise<void> {
  const supabase = createClient()

  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (signedBy === 'client') {
    updates.signed_by_client = true
    updates.client_signed_at = new Date().toISOString()
  } else {
    updates.signed_by_freelancer = true
    updates.freelancer_signed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('escrow_contracts')
    .update(updates)
    .eq('id', contractId)

  if (error) throw error
}

/**
 * Get contract terms
 */
export async function getContractTerms(contractId: string): Promise<ContractTerm[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('contract_terms')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Agree to contract term
 */
export async function agreeToContractTerm(
  termId: string,
  agreedBy: 'client' | 'freelancer'
): Promise<void> {
  const supabase = createClient()

  const updates: any = {}
  if (agreedBy === 'client') {
    updates.agreed_by_client = true
  } else {
    updates.agreed_by_freelancer = true
  }

  const { error } = await supabase
    .from('contract_terms')
    .update(updates)
    .eq('id', termId)

  if (error) throw error
}

// ============================================================================
// RELEASE REQUEST QUERIES (4 functions)
// ============================================================================

/**
 * Get release requests for deposit
 */
export async function getReleaseRequests(depositId: string): Promise<ReleaseRequest[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('release_requests')
    .select('*')
    .eq('deposit_id', depositId)
    .order('requested_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create release request
 */
export async function createReleaseRequest(requestData: {
  deposit_id: string
  milestone_id?: string
  amount: number
}): Promise<ReleaseRequest> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('release_requests')
    .insert({
      ...requestData,
      requested_by: user.id,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Approve release request
 */
export async function approveReleaseRequest(requestId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('release_requests')
    .update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (error) throw error
}

/**
 * Reject release request
 */
export async function rejectReleaseRequest(
  requestId: string,
  rejectionReason: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('release_requests')
    .update({
      status: 'rejected',
      rejected_by: user?.id,
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionReason
    })
    .eq('id', requestId)

  if (error) throw error
}

// ============================================================================
// ANALYTICS & STATISTICS (7 functions)
// ============================================================================

/**
 * Get comprehensive escrow statistics
 */
export async function getEscrowStatistics(): Promise<{
  total_value: number
  active_deposits: number
  completed_projects: number
  disputed_projects: number
  total_earnings: number
  average_project_value: number
  total_fees: number
  success_rate: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: deposits } = await supabase
    .from('escrow_deposits')
    .select('amount, status')
    .eq('user_id', user.id)

  if (!deposits || deposits.length === 0) {
    return {
      total_value: 0,
      active_deposits: 0,
      completed_projects: 0,
      disputed_projects: 0,
      total_earnings: 0,
      average_project_value: 0,
      total_fees: 0,
      success_rate: 0
    }
  }

  const totalValue = deposits.reduce((sum, d) => sum + Number(d.amount), 0)
  const activeDeposits = deposits.filter(d => d.status === 'active').length
  const completedProjects = deposits.filter(d => d.status === 'released').length
  const disputedProjects = deposits.filter(d => d.status === 'disputed').length
  const totalEarnings = deposits
    .filter(d => d.status === 'released')
    .reduce((sum, d) => sum + Number(d.amount), 0)
  const averageProjectValue = totalValue / deposits.length
  const successRate = (completedProjects / deposits.length) * 100

  const totalFees = await getTotalFeesPaid()

  return {
    total_value: totalValue,
    active_deposits: activeDeposits,
    completed_projects: completedProjects,
    disputed_projects: disputedProjects,
    total_earnings: totalEarnings,
    average_project_value: averageProjectValue,
    total_fees: totalFees,
    success_rate: successRate
  }
}

/**
 * Get escrow metadata
 */
export async function getEscrowMetadata(depositId: string): Promise<EscrowMetadata | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_metadata')
    .select('*')
    .eq('deposit_id', depositId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Update escrow metadata
 */
export async function updateEscrowMetadata(
  depositId: string,
  updates: Partial<Omit<EscrowMetadata, 'id' | 'deposit_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('escrow_metadata')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('deposit_id', depositId)

  if (error) throw error
}

/**
 * Get deposit timeline
 */
export async function getDepositTimeline(depositId: string): Promise<{
  created_at: string
  milestones_created: number
  first_milestone_completed?: string
  last_milestone_completed?: string
  released_at?: string
  total_duration_days?: number
}> {
  const supabase = createClient()

  const { data: deposit } = await supabase
    .from('escrow_deposits')
    .select('created_at, released_at')
    .eq('id', depositId)
    .single()

  const { data: milestones } = await supabase
    .from('escrow_milestones')
    .select('completed_at')
    .eq('deposit_id', depositId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true })

  const completedMilestones = milestones?.filter(m => m.completed_at) || []

  let totalDuration: number | undefined
  if (deposit?.created_at && deposit?.released_at) {
    const start = new Date(deposit.created_at).getTime()
    const end = new Date(deposit.released_at).getTime()
    totalDuration = Math.floor((end - start) / (1000 * 60 * 60 * 24))
  }

  return {
    created_at: deposit?.created_at || '',
    milestones_created: milestones?.length || 0,
    first_milestone_completed: completedMilestones[0]?.completed_at,
    last_milestone_completed: completedMilestones[completedMilestones.length - 1]?.completed_at,
    released_at: deposit?.released_at,
    total_duration_days: totalDuration
  }
}

/**
 * Get pending milestones count
 */
export async function getPendingMilestonesCount(depositId: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escrow_milestones')
    .select('id', { count: 'exact', head: true })
    .eq('deposit_id', depositId)
    .eq('status', 'pending')

  if (error) throw error
  return data as unknown as number || 0
}

/**
 * Export escrow data to CSV
 */
export async function exportEscrowDataToCSV(): Promise<string> {
  const deposits = await getEscrowDeposits()

  const headers = [
    'ID',
    'Date',
    'Project',
    'Client',
    'Amount',
    'Currency',
    'Status',
    'Progress',
    'Payment Method'
  ]

  const rows = deposits.map(deposit => [
    deposit.id,
    new Date(deposit.created_at).toLocaleDateString(),
    deposit.project_title,
    deposit.client_name,
    deposit.amount,
    deposit.currency,
    deposit.status,
    `${deposit.progress_percentage}%`,
    deposit.payment_method
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

/**
 * Get overdue milestones
 */
export async function getOverdueMilestones(): Promise<Array<{
  deposit_id: string
  milestone_id: string
  title: string
  due_date: string
  days_overdue: number
}>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const now = new Date().toISOString()

  const { data: milestones, error } = await supabase
    .from('escrow_milestones')
    .select('id, deposit_id, title, due_date')
    .in('status', ['pending', 'in_progress'])
    .lt('due_date', now)

  if (error) throw error

  return (milestones || []).map(m => {
    const daysOverdue = Math.floor(
      (Date.now() - new Date(m.due_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    return {
      deposit_id: m.deposit_id,
      milestone_id: m.id,
      title: m.title,
      due_date: m.due_date,
      days_overdue: daysOverdue
    }
  })
}
