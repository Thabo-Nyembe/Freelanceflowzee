/**
 * Loyalty System API Route
 * Full CRUD operations for loyalty points, rewards, and gamification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID, isDemoMode } from '@/lib/demo-auth'

const logger = createSimpleLogger('loyalty-api')

// Tier thresholds
const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 5000,
  Gold: 10000,
  Platinum: 25000,
  Diamond: 50000
}

type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
type TransactionType = 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund' | 'transfer' | 'adjustment'

interface LoyaltyAccount {
  id: string
  user_id: string
  total_points: number
  available_points: number
  lifetime_points: number
  tier: LoyaltyTier
  tier_progress: number
  referral_code: string
  total_referrals: number
  total_redemptions: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

interface LoyaltyReward {
  id: string
  name: string
  description: string | null
  category: string
  points_cost: number
  monetary_value: number | null
  discount_percentage: number | null
  is_active: boolean
  available_quantity: number | null
  tier_required: LoyaltyTier | null
  featured: boolean
}

interface LoyaltyTransaction {
  id: string
  account_id: string
  user_id: string
  transaction_type: TransactionType
  points: number
  balance_after: number
  source: string
  description: string | null
  status: string
  created_at: string
}

// Demo data
const demoAccount: LoyaltyAccount = {
  id: 'account-001',
  user_id: DEMO_USER_ID,
  total_points: 2500,
  available_points: 2500,
  lifetime_points: 4500,
  tier: 'Silver',
  tier_progress: 50,
  referral_code: 'KAZI2024ABC',
  total_referrals: 3,
  total_redemptions: 2,
  current_streak: 5,
  longest_streak: 14,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
}

const demoRewards: LoyaltyReward[] = [
  {
    id: 'reward-001',
    name: '10% Invoice Discount',
    description: 'Get 10% off your next invoice',
    category: 'discount',
    points_cost: 500,
    monetary_value: null,
    discount_percentage: 10,
    is_active: true,
    available_quantity: null,
    tier_required: null,
    featured: true
  },
  {
    id: 'reward-002',
    name: 'Free Consultation',
    description: 'One hour free consultation session with a specialist',
    category: 'service',
    points_cost: 1000,
    monetary_value: 150,
    discount_percentage: null,
    is_active: true,
    available_quantity: 50,
    tier_required: 'Silver',
    featured: true
  },
  {
    id: 'reward-003',
    name: 'Premium Support',
    description: '30 days of priority support access',
    category: 'service',
    points_cost: 2000,
    monetary_value: 200,
    discount_percentage: null,
    is_active: true,
    available_quantity: null,
    tier_required: 'Gold',
    featured: true
  },
  {
    id: 'reward-004',
    name: '25% Invoice Discount',
    description: 'Get 25% off your next invoice',
    category: 'discount',
    points_cost: 1000,
    monetary_value: null,
    discount_percentage: 25,
    is_active: true,
    available_quantity: null,
    tier_required: 'Silver',
    featured: false
  },
  {
    id: 'reward-005',
    name: 'Early Feature Access',
    description: 'Get early access to new features before public release',
    category: 'exclusive',
    points_cost: 2000,
    monetary_value: null,
    discount_percentage: null,
    is_active: true,
    available_quantity: 25,
    tier_required: 'Gold',
    featured: true
  }
]

const demoTransactions: LoyaltyTransaction[] = [
  {
    id: 'txn-001',
    account_id: 'account-001',
    user_id: DEMO_USER_ID,
    transaction_type: 'earn',
    points: 500,
    balance_after: 2500,
    source: 'project_completed',
    description: 'Project completion bonus - Website Redesign',
    status: 'completed',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'txn-002',
    account_id: 'account-001',
    user_id: DEMO_USER_ID,
    transaction_type: 'earn',
    points: 200,
    balance_after: 2000,
    source: 'referral',
    description: 'Referral bonus - New user signup',
    status: 'completed',
    created_at: '2024-01-10T14:00:00Z'
  },
  {
    id: 'txn-003',
    account_id: 'account-001',
    user_id: DEMO_USER_ID,
    transaction_type: 'redeem',
    points: -500,
    balance_after: 1800,
    source: 'reward_redemption',
    description: 'Redeemed: 10% Invoice Discount',
    status: 'completed',
    created_at: '2024-01-08T11:00:00Z'
  },
  {
    id: 'txn-004',
    account_id: 'account-001',
    user_id: DEMO_USER_ID,
    transaction_type: 'earn',
    points: 300,
    balance_after: 2300,
    source: 'invoice_paid',
    description: 'Invoice payment bonus',
    status: 'completed',
    created_at: '2024-01-05T09:00:00Z'
  },
  {
    id: 'txn-005',
    account_id: 'account-001',
    user_id: DEMO_USER_ID,
    transaction_type: 'bonus',
    points: 100,
    balance_after: 2000,
    source: 'streak_bonus',
    description: 'Weekly activity streak bonus',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z'
  }
]

const demoChallenges = [
  {
    id: 'challenge-001',
    name: 'First Steps',
    description: 'Complete your first project',
    target_action: 'complete_projects',
    target_count: 1,
    points_reward: 200,
    badge_name: 'Starter',
    progress: 1,
    progress_percentage: 100,
    status: 'completed',
    completed_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'challenge-002',
    name: 'Rising Star',
    description: 'Complete 5 projects',
    target_action: 'complete_projects',
    target_count: 5,
    points_reward: 500,
    badge_name: 'Rising Star',
    progress: 3,
    progress_percentage: 60,
    status: 'in_progress',
    completed_at: null
  },
  {
    id: 'challenge-003',
    name: 'Weekly Warrior',
    description: 'Log in every day for a week',
    target_action: 'daily_login',
    target_count: 7,
    points_reward: 100,
    badge_name: 'Weekly Warrior',
    progress: 5,
    progress_percentage: 71,
    status: 'in_progress',
    completed_at: null
  }
]

const demoTierBenefits = {
  Bronze: [
    { name: 'Basic Points Earning', description: 'Standard 1x point multiplier', type: 'multiplier' }
  ],
  Silver: [
    { name: 'Enhanced Points', description: '1.1x point multiplier on all activities', type: 'multiplier' },
    { name: 'Priority Email Support', description: 'Faster email response times', type: 'support' }
  ],
  Gold: [
    { name: 'Gold Points Boost', description: '1.25x point multiplier on all activities', type: 'multiplier' },
    { name: 'Monthly Free Consultation', description: 'One free 30-min consultation per month', type: 'feature' },
    { name: '5% Service Discount', description: 'Ongoing 5% discount on services', type: 'discount' }
  ],
  Platinum: [
    { name: 'Platinum Points Boost', description: '1.5x point multiplier on all activities', type: 'multiplier' },
    { name: 'Priority Support', description: '24/7 priority customer support', type: 'support' },
    { name: '10% Service Discount', description: 'Ongoing 10% discount on services', type: 'discount' },
    { name: 'Early Feature Access', description: 'Early access to new features', type: 'feature' }
  ],
  Diamond: [
    { name: 'Diamond Points Boost', description: '2x point multiplier on all activities', type: 'multiplier' },
    { name: 'Dedicated Support', description: 'Personal account manager', type: 'support' },
    { name: '15% Service Discount', description: 'Ongoing 15% discount on services', type: 'discount' },
    { name: 'Exclusive Events', description: 'Access to exclusive networking events', type: 'exclusive' },
    { name: 'Beta Features', description: 'Access to beta features', type: 'feature' }
  ]
}

/**
 * GET /api/loyalty
 * Retrieves loyalty account, rewards, and history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')?.split(',') || ['account', 'rewards', 'history']

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Fetching loyalty data', { userId, include })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      const response: Record<string, unknown> = {}

      // Fetch account
      if (include.includes('account')) {
        const { data: account, error } = await supabase
          .from('loyalty_accounts')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        // Create account if doesn't exist
        if (!account) {
          const { data: newAccount, error: createError } = await supabase
            .from('loyalty_accounts')
            .insert({
              user_id: userId,
              referral_code: generateReferralCode(),
              total_points: 0,
              available_points: 0,
              lifetime_points: 0,
              tier: 'Bronze',
              tier_progress: 0
            })
            .select()
            .single()

          if (createError) throw createError
          response.account = newAccount
        } else {
          response.account = account
        }

        // Get next tier info
        const currentTier = (account?.tier || 'Bronze') as LoyaltyTier
        const lifetimePoints = account?.lifetime_points || 0
        response.nextTier = getNextTierInfo(currentTier, lifetimePoints)
      }

      // Fetch rewards
      if (include.includes('rewards')) {
        const { data: rewards, error } = await supabase
          .from('loyalty_rewards')
          .select('*')
          .eq('is_active', true)
          .order('featured', { ascending: false })
          .order('points_cost', { ascending: true })

        if (error) throw error
        response.rewards = rewards || []
      }

      // Fetch transaction history
      if (include.includes('history')) {
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        const { data: transactions, error, count } = await supabase
          .from('loyalty_transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error
        response.history = transactions || []
        response.historyPagination = {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }

      // Fetch challenges
      if (include.includes('challenges')) {
        const { data: challenges } = await supabase
          .from('loyalty_user_challenges')
          .select(`
            *,
            challenge:challenge_id(*)
          `)
          .eq('user_id', userId)
          .in('status', ['in_progress', 'completed'])

        response.challenges = challenges || []
      }

      // Fetch tier benefits
      if (include.includes('benefits')) {
        const accountTier = (response.account as LoyaltyAccount)?.tier || 'Bronze'
        const { data: benefits } = await supabase
          .from('loyalty_tier_benefits')
          .select('*')
          .eq('tier', accountTier)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        response.benefits = benefits || []
      }

      // Fetch referrals
      if (include.includes('referrals')) {
        const accountId = (response.account as LoyaltyAccount)?.id

        if (accountId) {
          const { data: referrals } = await supabase
            .from('loyalty_referrals')
            .select('*')
            .eq('referrer_id', accountId)
            .order('created_at', { ascending: false })

          response.referrals = referrals || []
        }
      }

      return NextResponse.json({
        success: true,
        data: response
      })
    } catch (dbError) {
      logger.warn('Database error, using demo data', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const response: Record<string, unknown> = {}

      if (include.includes('account')) {
        response.account = demoAccount
        response.nextTier = getNextTierInfo(demoAccount.tier, demoAccount.lifetime_points)
      }

      if (include.includes('rewards')) {
        response.rewards = demoRewards
      }

      if (include.includes('history')) {
        response.history = demoTransactions
        response.historyPagination = {
          total: demoTransactions.length,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }

      if (include.includes('challenges')) {
        response.challenges = demoChallenges
      }

      if (include.includes('benefits')) {
        response.benefits = demoTierBenefits[demoAccount.tier]
      }

      return NextResponse.json({
        success: true,
        data: response
      })
    }
  } catch (error) {
    logger.error('Error fetching loyalty data', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/loyalty
 * Perform loyalty actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Loyalty action', { action, userId })

    switch (action) {
      case 'earn-points':
        return handleEarnPoints(userId, data)
      case 'redeem-points':
        return handleRedeemPoints(userId, data)
      case 'claim-reward':
        return handleClaimReward(userId, data)
      case 'apply-referral':
        return handleApplyReferral(userId, data)
      case 'claim-challenge':
        return handleClaimChallenge(userId, data)
      case 'record-activity':
        return handleRecordActivity(userId, data)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Error in loyalty action', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process loyalty action' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleEarnPoints(userId: string, data: Record<string, unknown>) {
  const { points, source, source_id, description } = data as {
    points: number
    source: string
    source_id?: string
    description?: string
  }

  if (!points || !source) {
    return NextResponse.json(
      { success: false, error: 'Points and source are required' },
      { status: 400 }
    )
  }

  if (points <= 0) {
    return NextResponse.json(
      { success: false, error: 'Points must be positive' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) throw accountError

    // Calculate points with tier multiplier
    const multiplier = getTierMultiplier(account.tier)
    const earnedPoints = Math.round(points * multiplier)

    const newAvailable = account.available_points + earnedPoints
    const newTotal = account.total_points + earnedPoints
    const newLifetime = account.lifetime_points + earnedPoints

    // Update account
    const { error: updateError } = await supabase
      .from('loyalty_accounts')
      .update({
        available_points: newAvailable,
        total_points: newTotal,
        lifetime_points: newLifetime,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    if (updateError) throw updateError

    // Create transaction
    const { data: transaction, error: txnError } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: account.id,
        user_id: userId,
        transaction_type: 'earn',
        points: earnedPoints,
        balance_after: newAvailable,
        source,
        source_id: source_id || null,
        description: description || `Earned ${earnedPoints} points from ${source}`,
        status: 'completed'
      })
      .select()
      .single()

    if (txnError) throw txnError

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: earnedPoints,
        multiplierApplied: multiplier,
        basePoints: points,
        newBalance: newAvailable,
        lifetimePoints: newLifetime,
        transaction
      },
      message: `Earned ${earnedPoints} points!`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const multiplier = getTierMultiplier(demoAccount.tier)
    const earnedPoints = Math.round(points * multiplier)

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: earnedPoints,
        multiplierApplied: multiplier,
        basePoints: points,
        newBalance: demoAccount.available_points + earnedPoints,
        lifetimePoints: demoAccount.lifetime_points + earnedPoints,
        transactionId: `txn-${Date.now()}`
      },
      message: `Earned ${earnedPoints} points! (demo)`
    })
  }
}

async function handleRedeemPoints(userId: string, data: Record<string, unknown>) {
  const { points, apply_to, apply_to_id } = data as {
    points: number
    apply_to?: string // 'invoice', 'subscription', 'credit'
    apply_to_id?: string
  }

  if (!points || points <= 0) {
    return NextResponse.json(
      { success: false, error: 'Valid points amount required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) throw accountError

    if (account.available_points < points) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points balance' },
        { status: 400 }
      )
    }

    // Calculate credit value (1 point = $0.01)
    const creditValue = points * 0.01

    const newBalance = account.available_points - points

    // Update account
    const { error: updateError } = await supabase
      .from('loyalty_accounts')
      .update({
        available_points: newBalance,
        total_credits_earned: account.total_credits_earned + creditValue,
        total_redemptions: account.total_redemptions + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    if (updateError) throw updateError

    // Create transaction
    const { data: transaction, error: txnError } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: account.id,
        user_id: userId,
        transaction_type: 'redeem',
        points: -points,
        balance_after: newBalance,
        source: 'points_redemption',
        source_id: apply_to_id || null,
        description: `Redeemed ${points} points for $${creditValue.toFixed(2)} credit`,
        status: 'completed'
      })
      .select()
      .single()

    if (txnError) throw txnError

    return NextResponse.json({
      success: true,
      data: {
        pointsRedeemed: points,
        creditApplied: creditValue,
        newBalance,
        appliedTo: apply_to,
        transaction
      },
      message: `Redeemed ${points} points for $${creditValue.toFixed(2)} credit`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const creditValue = points * 0.01

    return NextResponse.json({
      success: true,
      data: {
        pointsRedeemed: points,
        creditApplied: creditValue,
        newBalance: Math.max(0, demoAccount.available_points - points),
        transactionId: `txn-${Date.now()}`
      },
      message: `Redeemed ${points} points for $${creditValue.toFixed(2)} credit (demo)`
    })
  }
}

async function handleClaimReward(userId: string, data: Record<string, unknown>) {
  const { reward_id } = data as { reward_id: string }

  if (!reward_id) {
    return NextResponse.json(
      { success: false, error: 'Reward ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) throw accountError

    // Get reward
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json(
        { success: false, error: 'Reward not found or not available' },
        { status: 404 }
      )
    }

    // Check tier requirement
    if (reward.tier_required) {
      const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
      const userTierIndex = tierOrder.indexOf(account.tier)
      const requiredTierIndex = tierOrder.indexOf(reward.tier_required)

      if (userTierIndex < requiredTierIndex) {
        return NextResponse.json(
          { success: false, error: `This reward requires ${reward.tier_required} tier or higher` },
          { status: 400 }
        )
      }
    }

    // Check points balance
    if (account.available_points < reward.points_cost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points balance' },
        { status: 400 }
      )
    }

    // Check availability
    if (reward.available_quantity !== null && reward.available_quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Reward is out of stock' },
        { status: 400 }
      )
    }

    const newBalance = account.available_points - reward.points_cost

    // Update account
    await supabase
      .from('loyalty_accounts')
      .update({
        available_points: newBalance,
        total_redemptions: account.total_redemptions + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    // Update reward stock
    if (reward.available_quantity !== null) {
      await supabase
        .from('loyalty_rewards')
        .update({
          available_quantity: reward.available_quantity - 1,
          redeemed_count: reward.redeemed_count + 1
        })
        .eq('id', reward_id)
    }

    // Create transaction
    const { data: transaction } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: account.id,
        user_id: userId,
        transaction_type: 'redeem',
        points: -reward.points_cost,
        balance_after: newBalance,
        source: 'reward_redemption',
        source_id: reward_id,
        description: `Redeemed: ${reward.name}`,
        status: 'completed'
      })
      .select()
      .single()

    // Create redemption record
    const redemptionCode = generateRedemptionCode()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (reward.redemption_valid_days || 30))

    const { data: redemption } = await supabase
      .from('loyalty_redemptions')
      .insert({
        account_id: account.id,
        user_id: userId,
        reward_id,
        transaction_id: transaction?.id,
        redemption_code: redemptionCode,
        points_spent: reward.points_cost,
        status: 'active',
        discount_applied: reward.discount_percentage,
        credit_applied: reward.monetary_value,
        valid_until: validUntil.toISOString()
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      data: {
        reward,
        redemption,
        redemptionCode,
        validUntil: validUntil.toISOString(),
        pointsSpent: reward.points_cost,
        newBalance
      },
      message: `Successfully claimed: ${reward.name}`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const reward = demoRewards.find(r => r.id === reward_id)
    if (!reward) {
      return NextResponse.json(
        { success: false, error: 'Reward not found' },
        { status: 404 }
      )
    }

    const redemptionCode = generateRedemptionCode()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    return NextResponse.json({
      success: true,
      data: {
        reward,
        redemptionCode,
        validUntil: validUntil.toISOString(),
        pointsSpent: reward.points_cost,
        newBalance: Math.max(0, demoAccount.available_points - reward.points_cost)
      },
      message: `Successfully claimed: ${reward.name} (demo)`
    })
  }
}

async function handleApplyReferral(userId: string, data: Record<string, unknown>) {
  const { referral_code } = data as { referral_code: string }

  if (!referral_code) {
    return NextResponse.json(
      { success: false, error: 'Referral code required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user's account
    const { data: userAccount, error: userAccountError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userAccountError) throw userAccountError

    // Check if already referred
    if (userAccount.referred_by) {
      return NextResponse.json(
        { success: false, error: 'You have already used a referral code' },
        { status: 400 }
      )
    }

    // Find referrer account
    const { data: referrerAccount, error: referrerError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('referral_code', referral_code.toUpperCase())
      .single()

    if (referrerError || !referrerAccount) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Can't refer yourself
    if (referrerAccount.user_id === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot use your own referral code' },
        { status: 400 }
      )
    }

    // Award points to both parties
    const referrerBonus = 200
    const refereeBonus = 100

    // Update referrer
    await supabase
      .from('loyalty_accounts')
      .update({
        available_points: referrerAccount.available_points + referrerBonus,
        total_points: referrerAccount.total_points + referrerBonus,
        lifetime_points: referrerAccount.lifetime_points + referrerBonus,
        total_referrals: referrerAccount.total_referrals + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', referrerAccount.id)

    // Update referee
    await supabase
      .from('loyalty_accounts')
      .update({
        available_points: userAccount.available_points + refereeBonus,
        total_points: userAccount.total_points + refereeBonus,
        lifetime_points: userAccount.lifetime_points + refereeBonus,
        referred_by: referrerAccount.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userAccount.id)

    // Create transactions
    const { data: referrerTxn } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: referrerAccount.id,
        user_id: referrerAccount.user_id,
        transaction_type: 'bonus',
        points: referrerBonus,
        balance_after: referrerAccount.available_points + referrerBonus,
        source: 'referral_bonus',
        description: 'Referral signup bonus',
        status: 'completed'
      })
      .select()
      .single()

    const { data: refereeTxn } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: userAccount.id,
        user_id: userId,
        transaction_type: 'bonus',
        points: refereeBonus,
        balance_after: userAccount.available_points + refereeBonus,
        source: 'welcome_bonus',
        description: 'Welcome bonus from referral',
        status: 'completed'
      })
      .select()
      .single()

    // Create referral record
    await supabase
      .from('loyalty_referrals')
      .insert({
        referrer_id: referrerAccount.id,
        referee_id: userAccount.id,
        referral_code: referral_code.toUpperCase(),
        status: 'rewarded',
        referrer_points_earned: referrerBonus,
        referee_points_earned: refereeBonus,
        referrer_transaction_id: referrerTxn?.id,
        referee_transaction_id: refereeTxn?.id,
        qualified_at: new Date().toISOString(),
        rewarded_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: refereeBonus,
        referrerBonus,
        newBalance: userAccount.available_points + refereeBonus
      },
      message: `Referral code applied! You earned ${refereeBonus} bonus points!`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: 100,
        referrerBonus: 200,
        newBalance: demoAccount.available_points + 100
      },
      message: 'Referral code applied! You earned 100 bonus points! (demo)'
    })
  }
}

async function handleClaimChallenge(userId: string, data: Record<string, unknown>) {
  const { challenge_id } = data as { challenge_id: string }

  if (!challenge_id) {
    return NextResponse.json(
      { success: false, error: 'Challenge ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user challenge progress
    const { data: userChallenge, error: challengeError } = await supabase
      .from('loyalty_user_challenges')
      .select('*, challenge:challenge_id(*)')
      .eq('id', challenge_id)
      .eq('user_id', userId)
      .single()

    if (challengeError || !userChallenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    if (userChallenge.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not completed yet' },
        { status: 400 }
      )
    }

    if (userChallenge.status === 'claimed') {
      return NextResponse.json(
        { success: false, error: 'Reward already claimed' },
        { status: 400 }
      )
    }

    const challenge = userChallenge.challenge
    const pointsReward = challenge.points_reward

    // Get account
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!account) throw new Error('Account not found')

    // Update account
    const newBalance = account.available_points + pointsReward
    await supabase
      .from('loyalty_accounts')
      .update({
        available_points: newBalance,
        total_points: account.total_points + pointsReward,
        lifetime_points: account.lifetime_points + pointsReward,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    // Create transaction
    const { data: transaction } = await supabase
      .from('loyalty_transactions')
      .insert({
        account_id: account.id,
        user_id: userId,
        transaction_type: 'bonus',
        points: pointsReward,
        balance_after: newBalance,
        source: 'challenge_reward',
        source_id: challenge_id,
        description: `Challenge completed: ${challenge.name}`,
        status: 'completed'
      })
      .select()
      .single()

    // Update user challenge
    await supabase
      .from('loyalty_user_challenges')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        points_earned: pointsReward,
        transaction_id: transaction?.id
      })
      .eq('id', challenge_id)

    return NextResponse.json({
      success: true,
      data: {
        challenge: challenge.name,
        badge: challenge.badge_name,
        pointsEarned: pointsReward,
        newBalance
      },
      message: `Claimed ${pointsReward} points for completing "${challenge.name}"!`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: {
        challenge: 'Demo Challenge',
        badge: 'Achiever',
        pointsEarned: 200,
        newBalance: demoAccount.available_points + 200
      },
      message: 'Claimed 200 points for completing challenge! (demo)'
    })
  }
}

async function handleRecordActivity(userId: string, data: Record<string, unknown>) {
  const { activity_type } = data as { activity_type: string }

  if (!activity_type) {
    return NextResponse.json(
      { success: false, error: 'Activity type required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) throw accountError

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const lastActivity = account.last_activity_date

    let newStreak = account.current_streak
    if (lastActivity !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastActivity === yesterdayStr) {
        newStreak = account.current_streak + 1
      } else {
        newStreak = 1
      }
    }

    const longestStreak = Math.max(account.longest_streak, newStreak)

    // Check for activity-based points
    const { data: rule } = await supabase
      .from('loyalty_point_rules')
      .select('*')
      .eq('trigger_event', activity_type)
      .eq('is_active', true)
      .single()

    let pointsEarned = 0
    if (rule) {
      pointsEarned = rule.base_points
    }

    // Update account
    await supabase
      .from('loyalty_accounts')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        available_points: account.available_points + pointsEarned,
        total_points: account.total_points + pointsEarned,
        lifetime_points: account.lifetime_points + pointsEarned,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    // Create transaction if points earned
    if (pointsEarned > 0) {
      await supabase
        .from('loyalty_transactions')
        .insert({
          account_id: account.id,
          user_id: userId,
          transaction_type: 'earn',
          points: pointsEarned,
          balance_after: account.available_points + pointsEarned,
          source: activity_type,
          description: `Activity bonus: ${activity_type}`,
          status: 'completed'
        })
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: newStreak,
        longestStreak,
        pointsEarned
      }
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: demoAccount.current_streak + 1,
        longestStreak: Math.max(demoAccount.longest_streak, demoAccount.current_streak + 1),
        pointsEarned: 5
      }
    })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'RWD-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getTierMultiplier(tier: LoyaltyTier): number {
  const multipliers: Record<LoyaltyTier, number> = {
    Bronze: 1.0,
    Silver: 1.1,
    Gold: 1.25,
    Platinum: 1.5,
    Diamond: 2.0
  }
  return multipliers[tier] || 1.0
}

function getNextTierInfo(currentTier: LoyaltyTier, lifetimePoints: number): {
  nextTier: LoyaltyTier | null
  pointsNeeded: number
  progress: number
} {
  const tiers: LoyaltyTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex === tiers.length - 1) {
    return { nextTier: null, pointsNeeded: 0, progress: 100 }
  }

  const nextTier = tiers[currentIndex + 1]
  const nextThreshold = TIER_THRESHOLDS[nextTier]
  const currentThreshold = TIER_THRESHOLDS[currentTier]
  const pointsNeeded = nextThreshold - lifetimePoints
  const progress = Math.min(100, Math.round(
    ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  ))

  return { nextTier, pointsNeeded: Math.max(0, pointsNeeded), progress }
}
