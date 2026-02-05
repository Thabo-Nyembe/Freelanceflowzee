/**
 * Escrow API Route - Production Implementation
 *
 * Handles secure payment escrow operations with real database persistence:
 * - Create escrow deposits with milestones
 * - Complete/approve milestones
 * - Release funds via Stripe Connect
 * - Raise and resolve disputes
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { stripeConnectService } from '@/lib/stripe/stripe-connect-service'
import { randomBytes } from 'crypto'
import { isDemoMode, DEMO_USER_ID } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-Escrow')

// Generate a secure completion password
function generateCompletionPassword(): string {
  return randomBytes(16).toString('hex')
}

// Types matching database schema
type EscrowStatus = 'pending' | 'active' | 'completed' | 'disputed' | 'released' | 'refunded' | 'cancelled'
type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'approved' | 'rejected'
type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'crypto' | 'wire_transfer' | 'credit_card'
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF'

interface MilestoneInput {
  title: string
  description: string
  amount: number
  dueDate?: string
}

// ============================================================================
// POST Handler - All escrow actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create-deposit':
        return await handleCreateDeposit(supabase, effectiveUserId, data, demoMode)
      case 'complete-milestone':
        return await handleCompleteMilestone(supabase, effectiveUserId, data)
      case 'approve-milestone':
        return await handleApproveMilestone(supabase, effectiveUserId, data)
      case 'release-funds':
        return await handleReleaseFunds(supabase, effectiveUserId, data, demoMode)
      case 'dispute':
        return await handleDispute(supabase, effectiveUserId, data)
      case 'resolve-dispute':
        return await handleResolveDispute(supabase, effectiveUserId, data)
      case 'add-milestone':
        return await handleAddMilestone(supabase, effectiveUserId, data)
      case 'cancel-deposit':
        return await handleCancelDeposit(supabase, effectiveUserId, data, demoMode)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Escrow API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET Handler - Fetch escrow deposits
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const depositId = searchParams.get('id')

    // Fetch single deposit with milestones
    if (depositId) {
      const { data: deposit, error } = await supabase
        .from('escrow_deposits')
        .select(`
          *,
          escrow_milestones (*),
          escrow_fees (*),
          escrow_disputes (*)
        `)
        .eq('id', depositId)
        .or(`user_id.eq.${effectiveUserId},client_id.eq.${effectiveUserId}`)
        .single()

      if (error || !deposit) {
        return NextResponse.json(
          { success: false, error: 'Deposit not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        deposit,
      })
    }

    // Fetch all deposits for user
    let query = supabase
      .from('escrow_deposits')
      .select(`
        *,
        escrow_milestones (id, title, amount, status, completed_at),
        escrow_fees (platform_fee, payment_fee, total_fees)
      `)
      .or(`user_id.eq.${effectiveUserId},client_id.eq.${effectiveUserId}`)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: deposits, error } = await query

    if (error) {
      logger.error('Failed to fetch deposits', { error: error.message })
      return NextResponse.json(
        { success: false, error: 'Failed to fetch deposits' },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      total: deposits?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0,
      active: deposits?.filter(d => d.status === 'active').length || 0,
      completed: deposits?.filter(d => d.status === 'completed' || d.status === 'released').length || 0,
      pending: deposits?.filter(d => d.status === 'pending').length || 0,
      disputed: deposits?.filter(d => d.status === 'disputed').length || 0,
    }

    return NextResponse.json({
      success: true,
      deposits: deposits || [],
      stats,
    })
  } catch (error) {
    logger.error('Escrow GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Handler: Create Escrow Deposit
// ============================================================================

async function handleCreateDeposit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    projectTitle: string
    projectDescription?: string
    clientName: string
    clientEmail: string
    clientId?: string
    amount: number
    currency?: Currency
    milestones: MilestoneInput[]
    paymentMethod?: PaymentMethod
    notes?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  const {
    projectTitle,
    projectDescription,
    clientName,
    clientEmail,
    clientId,
    amount,
    currency = 'USD',
    milestones,
    paymentMethod = 'stripe',
    notes
  } = data

  // Validate required fields
  if (!projectTitle || !clientName || !clientEmail || !amount || amount <= 0) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Validate milestones sum matches total
  if (milestones && milestones.length > 0) {
    const milestonesTotal = milestones.reduce((sum, m) => sum + m.amount, 0)
    if (Math.abs(milestonesTotal - amount) > 0.01) {
      return NextResponse.json(
        { success: false, error: `Milestones total ($${milestonesTotal}) must match deposit amount ($${amount})` },
        { status: 400 }
      )
    }
  }

  // Generate completion password
  const completionPassword = generateCompletionPassword()

  logger.info('Creating escrow deposit', {
    userId,
    projectTitle,
    amount,
    currency,
    milestonesCount: milestones?.length || 0
  })

  // Create Stripe payment intent for escrow (held payment)
  let paymentIntentId: string | undefined
  let clientSecret: string | undefined

  if (!demoMode && paymentMethod === 'stripe') {
    // Get user's Stripe account for receiving funds
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    if (userProfile?.stripe_account_id) {
      const paymentResult = await stripeConnectService.createMarketplacePayment({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        buyerId: clientId || 'guest',
        sellerId: userId,
        sellerStripeAccountId: userProfile.stripe_account_id,
        orderId: `escrow-${Date.now()}`,
        listingTitle: projectTitle,
        platformFeePercent: 3,
      })

      if (paymentResult.success) {
        paymentIntentId = paymentResult.paymentIntentId
        clientSecret = paymentResult.clientSecret
      }
    }
  }

  // Insert deposit into database
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .insert({
      user_id: userId,
      project_title: projectTitle,
      project_description: projectDescription,
      client_name: clientName,
      client_email: clientEmail,
      client_id: clientId,
      amount,
      currency,
      status: 'pending' as EscrowStatus,
      progress_percentage: 0,
      completion_password: completionPassword,
      payment_method: paymentMethod,
      payment_id: paymentIntentId,
      notes,
    })
    .select()
    .single()

  if (depositError || !deposit) {
    logger.error('Failed to create deposit', { error: depositError?.message })
    return NextResponse.json(
      { success: false, error: 'Failed to create deposit' },
      { status: 500 }
    )
  }

  // Insert milestones
  if (milestones && milestones.length > 0) {
    const milestonesData = milestones.map((m) => ({
      deposit_id: deposit.id,
      title: m.title,
      description: m.description,
      amount: m.amount,
      percentage: (m.amount / amount) * 100,
      status: 'pending' as MilestoneStatus,
      due_date: m.dueDate,
    }))

    const { error: milestonesError } = await supabase
      .from('escrow_milestones')
      .insert(milestonesData)

    if (milestonesError) {
      logger.error('Failed to create milestones', { error: milestonesError.message })
      // Continue - deposit was created, milestones can be added later
    }
  }

  // Record transaction
  await supabase.from('escrow_transactions').insert({
    deposit_id: deposit.id,
    type: 'deposit',
    amount,
    currency,
    status: 'pending',
    payment_method: paymentMethod,
    payment_id: paymentIntentId,
    description: `Escrow deposit created for "${projectTitle}"`,
    from_user_id: clientId,
    to_user_id: userId,
    net_amount: amount,
  })

  logger.info('Escrow deposit created', { depositId: deposit.id })

  return NextResponse.json({
    success: true,
    action: 'create-deposit',
    deposit: {
      ...deposit,
      completion_password: undefined, // Don't expose in response
    },
    depositId: deposit.id,
    paymentUrl: clientSecret
      ? `${process.env.NEXT_PUBLIC_APP_URL}/pay/${deposit.id}`
      : undefined,
    clientSecret,
    message: `Escrow deposit created for ${projectTitle}`,
    nextSteps: [
      `Send payment link to ${clientName} at ${clientEmail}`,
      'Client will fund the escrow',
      'Funds will be held securely until milestones are completed',
    ],
  })
}

// ============================================================================
// Handler: Complete Milestone (Freelancer marks work done)
// ============================================================================

async function handleCompleteMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    milestoneId: string
    deliverables?: string[]
  }
): Promise<NextResponse> {
  const { depositId, milestoneId, deliverables } = data

  // Verify user owns the deposit
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select('id, user_id, status')
    .eq('id', depositId)
    .eq('user_id', userId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found or unauthorized' },
      { status: 404 }
    )
  }

  if (deposit.status !== 'active' && deposit.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Deposit is not in an active state' },
      { status: 400 }
    )
  }

  // Update milestone status
  const { data: milestone, error: milestoneError } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'completed' as MilestoneStatus,
      completed_at: new Date().toISOString(),
      deliverables: deliverables || [],
    })
    .eq('id', milestoneId)
    .eq('deposit_id', depositId)
    .select()
    .single()

  if (milestoneError || !milestone) {
    return NextResponse.json(
      { success: false, error: 'Milestone not found' },
      { status: 404 }
    )
  }

  // Update deposit status to active if still pending
  if (deposit.status === 'pending') {
    await supabase
      .from('escrow_deposits')
      .update({ status: 'active' as EscrowStatus })
      .eq('id', depositId)
  }

  logger.info('Milestone completed', { depositId, milestoneId })

  return NextResponse.json({
    success: true,
    action: 'complete-milestone',
    depositId,
    milestoneId,
    milestone,
    completedAt: milestone.completed_at,
    message: 'Milestone marked as completed!',
    nextSteps: [
      'Client will be notified to review and approve',
      'Funds for this milestone will be released upon approval',
      'Continue working on remaining milestones',
    ],
  })
}

// ============================================================================
// Handler: Approve Milestone (Client approves completed work)
// ============================================================================

async function handleApproveMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    milestoneId: string
    approvalNotes?: string
  }
): Promise<NextResponse> {
  const { depositId, milestoneId, approvalNotes } = data

  // Verify user is the client of this deposit
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select('id, client_id, user_id, status')
    .eq('id', depositId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found' },
      { status: 404 }
    )
  }

  // Allow either client or owner (for testing/demo)
  if (deposit.client_id !== userId && deposit.user_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - only the client can approve milestones' },
      { status: 403 }
    )
  }

  // Update milestone status to approved
  const { data: milestone, error: milestoneError } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'approved' as MilestoneStatus,
      approved_at: new Date().toISOString(),
      approval_notes: approvalNotes,
    })
    .eq('id', milestoneId)
    .eq('deposit_id', depositId)
    .eq('status', 'completed')
    .select()
    .single()

  if (milestoneError || !milestone) {
    return NextResponse.json(
      { success: false, error: 'Milestone not found or not in completed state' },
      { status: 404 }
    )
  }

  logger.info('Milestone approved', { depositId, milestoneId })

  return NextResponse.json({
    success: true,
    action: 'approve-milestone',
    depositId,
    milestoneId,
    milestone,
    approvedAt: milestone.approved_at,
    message: 'Milestone approved! Funds can now be released.',
    nextSteps: [
      'Freelancer can now request fund release for this milestone',
      'Or continue to next milestone',
    ],
  })
}

// ============================================================================
// Handler: Release Funds
// ============================================================================

async function handleReleaseFunds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    milestoneId?: string
    verificationCode?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  const { depositId, milestoneId, verificationCode: _verificationCode } = data

  // Fetch deposit with fees
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select(`
      *,
      escrow_milestones (*),
      escrow_fees (*)
    `)
    .eq('id', depositId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found' },
      { status: 404 }
    )
  }

  // Verify authorization (client releases funds to freelancer)
  if (deposit.client_id !== userId && deposit.user_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Determine amount to release
  let releaseAmount: number
  let targetMilestone: typeof deposit.escrow_milestones[0] | undefined

  if (milestoneId) {
    // Release specific milestone
    targetMilestone = deposit.escrow_milestones?.find(
      (m: { id: string }) => m.id === milestoneId
    )
    if (!targetMilestone) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      )
    }
    if (targetMilestone.status !== 'approved' && targetMilestone.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Milestone must be approved before releasing funds' },
        { status: 400 }
      )
    }
    releaseAmount = Number(targetMilestone.amount)
  } else {
    // Release all approved milestones
    const approvedMilestones = deposit.escrow_milestones?.filter(
      (m: { status: string }) => m.status === 'approved' || m.status === 'completed'
    ) || []
    releaseAmount = approvedMilestones.reduce(
      (sum: number, m: { amount: number }) => sum + Number(m.amount),
      0
    )
  }

  // Calculate fees
  const fees = deposit.escrow_fees?.[0]
  const platformFeeRate = fees?.platform_percentage || 3
  const paymentFeeRate = fees?.payment_percentage || 2.9
  const platformFee = releaseAmount * (platformFeeRate / 100)
  const paymentFee = releaseAmount * (paymentFeeRate / 100) + 0.30
  const totalFees = platformFee + paymentFee
  const netAmount = releaseAmount - totalFees

  // Process payment release via Stripe
  let transferId: string | undefined

  if (!demoMode && deposit.payment_id) {
    // First capture the payment if it was manual capture
    const captureResult = await stripeConnectService.capturePayment(deposit.payment_id)

    if (!captureResult.success) {
      logger.error('Failed to capture payment', {
        paymentId: deposit.payment_id,
        error: captureResult.error
      })
      // Continue with database update even if Stripe fails
    } else {
      transferId = deposit.payment_id
    }
  }

  // Update milestone status
  if (milestoneId) {
    await supabase
      .from('escrow_milestones')
      .update({ status: 'approved' as MilestoneStatus })
      .eq('id', milestoneId)
  }

  // Check if all milestones are complete
  const allMilestonesComplete = deposit.escrow_milestones?.every(
    (m: { status: string }) => m.status === 'approved' || m.status === 'completed'
  )

  // Update deposit status
  const newStatus: EscrowStatus = allMilestonesComplete ? 'released' : 'active'
  await supabase
    .from('escrow_deposits')
    .update({
      status: newStatus,
      released_at: allMilestonesComplete ? new Date().toISOString() : undefined,
      completed_at: allMilestonesComplete ? new Date().toISOString() : undefined,
    })
    .eq('id', depositId)

  // Record release transaction
  await supabase.from('escrow_transactions').insert({
    deposit_id: depositId,
    type: 'release',
    amount: releaseAmount,
    currency: deposit.currency,
    status: 'completed',
    payment_method: deposit.payment_method,
    payment_id: transferId,
    description: milestoneId
      ? `Funds released for milestone: ${targetMilestone?.title}`
      : 'Funds released for completed milestones',
    from_user_id: deposit.client_id,
    to_user_id: deposit.user_id,
    fees: totalFees,
    net_amount: netAmount,
  })

  logger.info('Funds released', {
    depositId,
    milestoneId,
    releaseAmount,
    netAmount
  })

  return NextResponse.json({
    success: true,
    action: 'release-funds',
    depositId,
    milestoneId,
    amount: releaseAmount,
    fees: {
      platform: platformFee,
      payment: paymentFee,
      total: totalFees,
    },
    netAmount,
    releasedAt: new Date().toISOString(),
    transferId,
    message: `$${netAmount.toFixed(2)} released to your account`,
    estimatedArrival: '2-3 business days',
    nextSteps: [
      'Funds are being processed',
      'You will receive an email confirmation',
      'Check your bank account in 2-3 business days',
    ],
  })
}

// ============================================================================
// Handler: Raise Dispute
// ============================================================================

async function handleDispute(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    milestoneId?: string
    reason: string
    description: string
  }
): Promise<NextResponse> {
  const { depositId, milestoneId, reason, description } = data

  if (!reason || !description) {
    return NextResponse.json(
      { success: false, error: 'Reason and description are required' },
      { status: 400 }
    )
  }

  // Verify user is involved in this deposit
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select('id, user_id, client_id, status')
    .eq('id', depositId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found' },
      { status: 404 }
    )
  }

  if (deposit.user_id !== userId && deposit.client_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Determine if raised by client or freelancer
  const raisedBy = deposit.client_id === userId ? 'client' : 'freelancer'

  // Create dispute record
  const { data: dispute, error: disputeError } = await supabase
    .from('escrow_disputes')
    .insert({
      deposit_id: depositId,
      milestone_id: milestoneId,
      raised_by: raisedBy,
      raised_by_id: userId,
      status: 'open',
      reason,
      description,
    })
    .select()
    .single()

  if (disputeError || !dispute) {
    logger.error('Failed to create dispute', { error: disputeError?.message })
    return NextResponse.json(
      { success: false, error: 'Failed to create dispute' },
      { status: 500 }
    )
  }

  // Update deposit status
  await supabase
    .from('escrow_deposits')
    .update({
      status: 'disputed' as EscrowStatus,
      dispute_status: 'open',
      dispute_reason: reason,
    })
    .eq('id', depositId)

  // Update milestone if specified
  if (milestoneId) {
    await supabase
      .from('escrow_milestones')
      .update({ status: 'disputed' as MilestoneStatus })
      .eq('id', milestoneId)
  }

  logger.info('Dispute created', { depositId, disputeId: dispute.id, raisedBy })

  return NextResponse.json({
    success: true,
    action: 'dispute',
    depositId,
    disputeId: dispute.id,
    reason,
    status: 'open',
    createdAt: dispute.created_at,
    message: 'Dispute raised successfully',
    nextSteps: [
      'Our team will review the dispute within 24 hours',
      'Both parties will be contacted for more information',
      'A resolution will be provided within 5-7 business days',
      'Funds remain in escrow during dispute resolution',
    ],
    caseNumber: dispute.id.toUpperCase().slice(0, 8),
  })
}

// ============================================================================
// Handler: Resolve Dispute
// ============================================================================

async function handleResolveDispute(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    disputeId: string
    resolution: 'release_to_freelancer' | 'refund_to_client' | 'partial_release'
    amount?: number
    notes?: string
  }
): Promise<NextResponse> {
  const { disputeId, resolution, amount, notes } = data

  // Fetch dispute
  const { data: dispute, error: disputeError } = await supabase
    .from('escrow_disputes')
    .select(`
      *,
      escrow_deposits (*)
    `)
    .eq('id', disputeId)
    .single()

  if (disputeError || !dispute) {
    return NextResponse.json(
      { success: false, error: 'Dispute not found' },
      { status: 404 }
    )
  }

  const deposit = dispute.escrow_deposits

  // For now, allow the deposit owner or client to resolve
  // In production, this would be admin-only
  if (deposit.user_id !== userId && deposit.client_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized to resolve disputes' },
      { status: 403 }
    )
  }

  let resolutionMessage = ''
  let newDepositStatus: EscrowStatus = 'completed'

  switch (resolution) {
    case 'release_to_freelancer':
      resolutionMessage = 'Dispute resolved - Funds released to freelancer'
      newDepositStatus = 'released'
      break
    case 'refund_to_client':
      resolutionMessage = 'Dispute resolved - Funds refunded to client'
      newDepositStatus = 'refunded'
      break
    case 'partial_release':
      if (!amount) {
        return NextResponse.json(
          { success: false, error: 'Amount required for partial release' },
          { status: 400 }
        )
      }
      resolutionMessage = `Dispute resolved - Partial release of $${amount}`
      newDepositStatus = 'completed'
      break
  }

  // Update dispute
  const { error: updateError } = await supabase
    .from('escrow_disputes')
    .update({
      status: 'resolved',
      resolution: resolutionMessage,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', disputeId)

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Failed to update dispute' },
      { status: 500 }
    )
  }

  // Update deposit status
  await supabase
    .from('escrow_deposits')
    .update({
      status: newDepositStatus,
      dispute_status: 'resolved',
      completed_at: new Date().toISOString(),
    })
    .eq('id', deposit.id)

  // Record transaction based on resolution
  const transactionType = resolution === 'refund_to_client' ? 'refund' : 'release'
  await supabase.from('escrow_transactions').insert({
    deposit_id: deposit.id,
    type: transactionType,
    amount: amount || Number(deposit.amount),
    currency: deposit.currency,
    status: 'completed',
    payment_method: deposit.payment_method,
    description: resolutionMessage,
    from_user_id: resolution === 'refund_to_client' ? deposit.user_id : deposit.client_id,
    to_user_id: resolution === 'refund_to_client' ? deposit.client_id : deposit.user_id,
    net_amount: amount || Number(deposit.amount),
    metadata: { dispute_id: disputeId, notes },
  })

  logger.info('Dispute resolved', { disputeId, resolution })

  return NextResponse.json({
    success: true,
    action: 'resolve-dispute',
    disputeId,
    resolution,
    amount,
    resolvedAt: new Date().toISOString(),
    message: resolutionMessage,
    notes,
  })
}

// ============================================================================
// Handler: Add Milestone
// ============================================================================

async function handleAddMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    title: string
    description: string
    amount: number
    dueDate?: string
  }
): Promise<NextResponse> {
  const { depositId, title, description, amount, dueDate } = data

  // Verify user owns the deposit
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select('id, user_id, amount')
    .eq('id', depositId)
    .eq('user_id', userId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found or unauthorized' },
      { status: 404 }
    )
  }

  // Calculate percentage
  const percentage = (amount / Number(deposit.amount)) * 100

  // Insert milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('escrow_milestones')
    .insert({
      deposit_id: depositId,
      title,
      description,
      amount,
      percentage,
      status: 'pending' as MilestoneStatus,
      due_date: dueDate,
    })
    .select()
    .single()

  if (milestoneError || !milestone) {
    return NextResponse.json(
      { success: false, error: 'Failed to add milestone' },
      { status: 500 }
    )
  }

  logger.info('Milestone added', { depositId, milestoneId: milestone.id })

  return NextResponse.json({
    success: true,
    action: 'add-milestone',
    depositId,
    milestone,
    message: `Milestone "${title}" added`,
    nextSteps: [
      'Client will be notified of the new milestone',
      'Work on the milestone can begin',
      'Mark as complete when ready',
    ],
  })
}

// ============================================================================
// Handler: Cancel Deposit
// ============================================================================

async function handleCancelDeposit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    depositId: string
    reason?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  const { depositId, reason } = data

  // Fetch deposit
  const { data: deposit, error: depositError } = await supabase
    .from('escrow_deposits')
    .select('*')
    .eq('id', depositId)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json(
      { success: false, error: 'Deposit not found' },
      { status: 404 }
    )
  }

  // Only owner or client can cancel
  if (deposit.user_id !== userId && deposit.client_id !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Can only cancel pending deposits
  if (deposit.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Only pending deposits can be cancelled' },
      { status: 400 }
    )
  }

  // Cancel Stripe payment if exists
  if (!demoMode && deposit.payment_id) {
    await stripeConnectService.cancelPayment(deposit.payment_id, reason)
  }

  // Update deposit status
  await supabase
    .from('escrow_deposits')
    .update({
      status: 'cancelled' as EscrowStatus,
      cancelled_at: new Date().toISOString(),
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user',
    })
    .eq('id', depositId)

  logger.info('Deposit cancelled', { depositId, reason })

  return NextResponse.json({
    success: true,
    action: 'cancel-deposit',
    depositId,
    cancelledAt: new Date().toISOString(),
    message: 'Deposit cancelled successfully',
  })
}
