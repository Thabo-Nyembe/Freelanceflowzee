/**
 * Loyalty Reward Claim API Route
 * Handles claiming specific rewards from the rewards catalog
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('loyalty-claim-reward-api')

// Demo mode check
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

// Helper to generate redemption code
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'RWD-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Demo rewards
const demoRewards = [
  { id: 'reward-1', name: '10% Invoice Discount', points: 500, discount: 10, type: 'discount' },
  { id: 'reward-2', name: 'Free Consultation', points: 1000, value: 150, type: 'service' },
  { id: 'reward-3', name: 'Premium Support (30 days)', points: 2000, value: 200, type: 'service' },
  { id: 'reward-4', name: '25% Invoice Discount', points: 1000, discount: 25, type: 'discount' }
]

/**
 * POST /api/loyalty/claim-reward
 * Claim a reward from the loyalty program
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rewardId, reward_id } = body

    // Support both naming conventions
    const actualRewardId = rewardId || reward_id

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

    if (!actualRewardId) {
      return NextResponse.json(
        { success: false, error: 'Reward ID required' },
        { status: 400 }
      )
    }

    logger.info('Claiming loyalty reward', { userId, rewardId: actualRewardId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Get account
      const { data: account, error: accountError } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (accountError) throw accountError

      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Loyalty account not found' },
          { status: 404 }
        )
      }

      // Get reward
      const { data: reward, error: rewardError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('id', actualRewardId)
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

      // Update reward stock if limited
      if (reward.available_quantity !== null) {
        await supabase
          .from('loyalty_rewards')
          .update({
            available_quantity: reward.available_quantity - 1,
            redeemed_count: (reward.redeemed_count || 0) + 1
          })
          .eq('id', actualRewardId)
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
          source_id: actualRewardId,
          description: `Claimed reward: ${reward.name}`,
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
          reward_id: actualRewardId,
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
          rewardId: actualRewardId,
          rewardName: reward.name,
          claimed: true,
          pointsDeducted: reward.points_cost,
          remainingPoints: newBalance,
          redemptionCode,
          validUntil: validUntil.toISOString(),
          discount: reward.discount_percentage,
          creditValue: reward.monetary_value,
          redemption
        },
        message: `Successfully claimed: ${reward.name}`
      })
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const demoReward = demoRewards.find(r => r.id === actualRewardId)
      if (!demoReward) {
        return NextResponse.json(
          { success: false, error: 'Reward not found' },
          { status: 404 }
        )
      }

      const redemptionCode = generateRedemptionCode()
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)
      const demoRemainingPoints = Math.max(0, 2500 - demoReward.points)

      return NextResponse.json({
        success: true,
        data: {
          rewardId: actualRewardId,
          rewardName: demoReward.name,
          claimed: true,
          pointsDeducted: demoReward.points,
          remainingPoints: demoRemainingPoints,
          redemptionCode,
          validUntil: validUntil.toISOString(),
          discount: demoReward.discount,
          creditValue: demoReward.value
        },
        message: `Successfully claimed: ${demoReward.name} (demo)`
      })
    }
  } catch (error) {
    logger.error('Error claiming reward', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to claim reward' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/loyalty/claim-reward
 * Get available rewards and user's claimed rewards
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRedeemed = searchParams.get('include_redeemed') === 'true'

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

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Get account
      const { data: account } = await supabase
        .from('loyalty_accounts')
        .select('id, available_points, tier')
        .eq('user_id', userId)
        .single()

      // Get available rewards
      const { data: rewards } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('points_cost', { ascending: true })

      // Filter rewards based on tier and availability
      const availableRewards = (rewards || []).filter(reward => {
        // Check tier requirement
        if (reward.tier_required) {
          const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
          const userTierIndex = tierOrder.indexOf(account?.tier || 'Bronze')
          const requiredTierIndex = tierOrder.indexOf(reward.tier_required)
          if (userTierIndex < requiredTierIndex) return false
        }
        // Check stock
        if (reward.available_quantity !== null && reward.available_quantity <= 0) return false
        return true
      })

      // Get user's redemptions if requested
      let redemptions: unknown[] = []
      if (includeRedeemed && account) {
        const { data: userRedemptions } = await supabase
          .from('loyalty_redemptions')
          .select('*, reward:reward_id(*)')
          .eq('account_id', account.id)
          .order('created_at', { ascending: false })

        redemptions = userRedemptions || []
      }

      return NextResponse.json({
        success: true,
        data: {
          availablePoints: account?.available_points || 0,
          tier: account?.tier || 'Bronze',
          rewards: availableRewards,
          redemptions
        }
      })
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        data: {
          availablePoints: 2500,
          tier: 'Silver',
          rewards: demoRewards.map(r => ({
            id: r.id,
            name: r.name,
            points_cost: r.points,
            discount_percentage: r.discount || null,
            monetary_value: r.value || null,
            category: r.type,
            is_active: true,
            featured: r.id === 'reward-1'
          })),
          redemptions: []
        }
      })
    }
  } catch (error) {
    logger.error('Error fetching rewards', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}
