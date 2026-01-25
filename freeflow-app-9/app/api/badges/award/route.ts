/**
 * KAZI Platform - Award Badge API
 *
 * Dedicated endpoint for awarding badges to users.
 *
 * @module app/api/badges/award/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('badges-award')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const awardedBy = session.user.id
    const body = await request.json()
    const { badge_id, user_id, reason } = body

    if (!badge_id || !user_id) {
      return NextResponse.json(
        { error: 'Badge ID and User ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if badge exists
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('id, name, xp_value, rarity')
      .eq('id', badge_id)
      .single()

    if (badgeError || !badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }

    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('badge_id', badge_id)
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 400 }
      )
    }

    // Award badge
    const { data: userBadge, error } = await supabase
      .from('user_badges')
      .insert({
        user_id,
        badge_id,
        awarded_by: awardedBy,
        awarded_at: new Date().toISOString(),
        reason: reason || '',
        is_pinned: false,
        share_count: 0
      })
      .select(`
        *,
        badge:badges(*)
      `)
      .single()

    if (error) {
      logger.error('Badge award error', { error })
      return NextResponse.json(
        { error: 'Failed to award badge' },
        { status: 500 }
      )
    }

    // Update user XP (if applicable)
    try {
      await supabase.rpc('increment_user_xp', {
        p_user_id: user_id,
        p_xp: badge.xp_value
      })
    } catch {
      // XP update is optional, don't fail the request
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        entity_type: 'badge',
        entity_id: badge_id,
        user_id: awardedBy,
        action: 'awarded',
        details: {
          recipient_id: user_id,
          badge_name: badge.name,
          reason
        },
        created_at: new Date().toISOString()
      })
    } catch {
      // Activity log is optional
    }

    return NextResponse.json({
      success: true,
      user_badge: userBadge,
      badge_name: badge.name,
      xp_earned: badge.xp_value,
      rarity: badge.rarity,
      message: `Badge "${badge.name}" awarded successfully!`
    })
  } catch (error) {
    logger.error('Award badge error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
