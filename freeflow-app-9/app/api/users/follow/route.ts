/**
 * User Follow API Route
 *
 * POST - Follow/unfollow a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('user-follow')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, unfollow } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent self-follow
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    if (unfollow) {
      // Remove follow record
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)

      if (error && error.code !== '42P01') throw error

      return NextResponse.json({
        success: true,
        action: 'unfollow',
        message: 'Unfollowed successfully'
      })
    } else {
      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single()

      if (existing) {
        return NextResponse.json({
          success: true,
          action: 'already-following',
          message: 'Already following this user'
        })
      }

      // Create follow record
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
          created_at: new Date().toISOString()
        })

      if (error && error.code !== '42P01') throw error

      return NextResponse.json({
        success: true,
        action: 'follow',
        message: 'Now following for updates'
      })
    }
  } catch (error) {
    logger.error('User follow error', { error })
    return NextResponse.json({ error: 'Failed to process follow request' }, { status: 500 })
  }
}
