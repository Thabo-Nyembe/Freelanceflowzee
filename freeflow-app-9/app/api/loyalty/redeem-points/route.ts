/**
 * Loyalty Points Redemption API Route
 * Redirects to main loyalty API with action=redeem-points
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('loyalty-redeem-points-api')

// Demo mode check
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

/**
 * POST /api/loyalty/redeem-points
 * Redeem loyalty points for credit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { points, apply_to, apply_to_id } = body

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

    if (!points || points <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid points amount required' },
        { status: 400 }
      )
    }

    logger.info('Redeeming loyalty points', { userId, points, applyTo: apply_to })

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

      if (account.available_points < points) {
        return NextResponse.json(
          { success: false, error: 'Insufficient points balance' },
          { status: 400 }
        )
      }

      // Calculate credit value (1 point = $0.01)
      const creditApplied = points * 0.01
      const newBalance = account.available_points - points

      // Update account
      const { error: updateError } = await supabase
        .from('loyalty_accounts')
        .update({
          available_points: newBalance,
          total_credits_earned: account.total_credits_earned + creditApplied,
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
          description: `Redeemed ${points} points for $${creditApplied.toFixed(2)} credit`,
          status: 'completed'
        })
        .select()
        .single()

      if (txnError) throw txnError

      return NextResponse.json({
        success: true,
        data: {
          pointsRedeemed: points,
          remainingPoints: newBalance,
          creditApplied,
          transactionId: transaction.id,
          appliedTo: apply_to || null
        },
        message: `Successfully redeemed ${points} points for $${creditApplied.toFixed(2)} credit`
      })
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const creditApplied = points * 0.01
      const demoRemainingPoints = Math.max(0, 2500 - points)

      return NextResponse.json({
        success: true,
        data: {
          pointsRedeemed: points,
          remainingPoints: demoRemainingPoints,
          creditApplied,
          transactionId: `TXN-${Date.now()}`
        },
        message: `Successfully redeemed ${points} points for $${creditApplied.toFixed(2)} credit (demo)`
      })
    }
  } catch (error) {
    logger.error('Error redeeming points', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to redeem points' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/loyalty/redeem-points
 * Get current points balance and redemption rates
 */
export async function GET(request: NextRequest) {
  try {
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

      const { data: account, error } = await supabase
        .from('loyalty_accounts')
        .select('available_points, total_credits_earned, tier')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const conversionRate = 0.01 // $0.01 per point
      const maxCreditAvailable = (account?.available_points || 0) * conversionRate

      return NextResponse.json({
        success: true,
        data: {
          availablePoints: account?.available_points || 0,
          conversionRate,
          maxCreditAvailable,
          tier: account?.tier || 'Bronze',
          totalCreditsEarned: account?.total_credits_earned || 0
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
          conversionRate: 0.01,
          maxCreditAvailable: 25.00,
          tier: 'Silver',
          totalCreditsEarned: 15.00
        }
      })
    }
  } catch (error) {
    logger.error('Error fetching redemption info', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch redemption info' },
      { status: 500 }
    )
  }
}
