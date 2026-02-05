/**
 * User Block API Route
 *
 * POST - Block/unblock a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('user-block')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, unblock } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent self-block
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    if (unblock) {
      // Remove block record
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_user_id', userId)

      if (error && error.code !== '42P01') throw error

      return NextResponse.json({
        success: true,
        action: 'unblock',
        message: 'User has been unblocked'
      })
    } else {
      // Check if already blocked
      const { data: existing } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_user_id', userId)
        .single()

      if (existing) {
        return NextResponse.json({
          success: true,
          action: 'already-blocked',
          message: 'User is already blocked'
        })
      }

      // Create block record
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_user_id: userId,
          created_at: new Date().toISOString()
        })

      if (error && error.code !== '42P01') throw error

      // Also remove any follow relationships
      await supabase
        .from('user_follows')
        .delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`)

      return NextResponse.json({
        success: true,
        action: 'block',
        message: 'User has been blocked. They will not be able to view your profile or contact you.'
      })
    }
  } catch (error) {
    logger.error('User block error', { error })
    return NextResponse.json({ error: 'Failed to process block request' }, { status: 500 })
  }
}
