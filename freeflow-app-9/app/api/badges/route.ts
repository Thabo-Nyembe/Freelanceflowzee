/**
 * KAZI Platform - Badges API
 *
 * Full-featured badge management with database integration.
 * Supports CRUD operations, awarding badges to users,
 * badge verification, and sharing.
 *
 * @module app/api/badges/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@/lib/auth'

// ============================================================================
// TYPES
// ============================================================================

interface Badge {
  id: string
  name: string
  description: string
  image_url: string
  category: string
  level: number
  xp_value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  skills: string[]
  requirements: { description: string; completed: boolean }[]
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
}

interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  awarded_by: string
  is_pinned: boolean
  share_count: number
  badge: Badge
}

// ============================================================================
// DATABASE CLIENT
// ============================================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================================
// GET - List Badges / Get Single Badge
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    const badgeId = searchParams.get('id')
    const userId = searchParams.get('user_id')
    const category = searchParams.get('category')
    const rarity = searchParams.get('rarity')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = getSupabase()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        badges: getDemoBadges(),
        user_badges: [],
        stats: getDemoStats()
      })
    }

    const currentUserId = session.user.id

    // Single badge fetch
    if (badgeId) {
      const { data: badge, error } = await supabase
        .from('badges')
        .select('*')
        .eq('id', badgeId)
        .single()

      if (error || !badge) {
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        )
      }

      // Check if user has this badge
      const { data: userBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('badge_id', badgeId)
        .eq('user_id', currentUserId)
        .single()

      return NextResponse.json({
        success: true,
        badge,
        user_has_badge: !!userBadge,
        user_badge: userBadge
      })
    }

    // Build query for badge list
    let query = supabase
      .from('badges')
      .select('*', { count: 'exact' })

    if (category) {
      query = query.eq('category', category)
    }

    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: badges, error, count } = await query

    if (error) {
      console.error('Badges query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      )
    }

    // Get user's badges
    let userBadgesQuery = supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId || currentUserId)

    const { data: userBadges } = await userBadgesQuery

    // Get stats
    const stats = await getBadgeStats(supabase, currentUserId)

    return NextResponse.json({
      success: true,
      badges: badges || [],
      user_badges: userBadges || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Badges GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Badge / Award Badge
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { action = 'create' } = body

    const supabase = getSupabase()

    switch (action) {
      case 'create':
        return handleCreateBadge(supabase, userId, body)

      case 'award':
        return handleAwardBadge(supabase, userId, body)

      case 'pin':
        return handlePinBadge(supabase, userId, body)

      case 'share':
        return handleShareBadge(supabase, userId, body)

      default:
        return handleCreateBadge(supabase, userId, body)
    }
  } catch (error) {
    console.error('Badges POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Badge
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Verify ownership
    const { data: badge } = await supabase
      .from('badges')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!badge || badge.created_by !== userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const allowedFields = [
      'name', 'description', 'image_url', 'category', 'level',
      'xp_value', 'rarity', 'skills', 'requirements', 'is_public'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    const { data: updatedBadge, error } = await supabase
      .from('badges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Badge update error:', error)
      return NextResponse.json(
        { error: 'Failed to update badge' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      badge: updatedBadge,
      message: 'Badge updated successfully'
    })
  } catch (error) {
    console.error('Badges PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Badge
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const badgeId = searchParams.get('id')

    if (!badgeId) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Verify ownership
    const { data: badge } = await supabase
      .from('badges')
      .select('created_by, name')
      .eq('id', badgeId)
      .single()

    if (!badge || badge.created_by !== userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete user_badges first (foreign key constraint)
    await supabase
      .from('user_badges')
      .delete()
      .eq('badge_id', badgeId)

    // Delete badge
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', badgeId)

    if (error) {
      console.error('Badge deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete badge' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Badge "${badge.name}" deleted successfully`
    })
  } catch (error) {
    console.error('Badges DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateBadge(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    name,
    description,
    image_url,
    category = 'achievement',
    level = 1,
    xp_value = 100,
    rarity = 'common',
    skills = [],
    requirements = [],
    is_public = true
  } = body

  if (!name || (typeof name === 'string' && name.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Badge name is required' },
      { status: 400 }
    )
  }

  const badgeData = {
    name: typeof name === 'string' ? name.trim() : name,
    description: description || '',
    image_url: image_url || '',
    category,
    level,
    xp_value,
    rarity,
    skills: skills || [],
    requirements: requirements || [],
    is_public,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: badge, error } = await supabase
    .from('badges')
    .insert(badgeData)
    .select()
    .single()

  if (error) {
    console.error('Badge creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    badge,
    message: 'Badge created successfully'
  }, { status: 201 })
}

async function handleAwardBadge(
  supabase: ReturnType<typeof createClient>,
  awardedBy: string,
  body: Record<string, unknown>
) {
  const { badge_id, user_id, reason } = body

  if (!badge_id || !user_id) {
    return NextResponse.json(
      { error: 'Badge ID and User ID are required' },
      { status: 400 }
    )
  }

  // Check if badge exists
  const { data: badge } = await supabase
    .from('badges')
    .select('name, xp_value')
    .eq('id', badge_id)
    .single()

  if (!badge) {
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
    .select()
    .single()

  if (error) {
    console.error('Badge award error:', error)
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
    // XP update is optional
  }

  return NextResponse.json({
    success: true,
    user_badge: userBadge,
    badge_name: badge.name,
    xp_earned: badge.xp_value,
    message: `Badge "${badge.name}" awarded successfully!`
  })
}

async function handlePinBadge(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { user_badge_id, is_pinned } = body

  if (!user_badge_id) {
    return NextResponse.json(
      { error: 'User badge ID is required' },
      { status: 400 }
    )
  }

  const { data: userBadge, error } = await supabase
    .from('user_badges')
    .update({ is_pinned: is_pinned !== false })
    .eq('id', user_badge_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    user_badge: userBadge,
    message: is_pinned ? 'Badge pinned to profile' : 'Badge unpinned'
  })
}

async function handleShareBadge(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { user_badge_id } = body

  if (!user_badge_id) {
    return NextResponse.json(
      { error: 'User badge ID is required' },
      { status: 400 }
    )
  }

  // Increment share count
  const { data: userBadge, error } = await supabase
    .from('user_badges')
    .update({
      share_count: supabase.rpc('increment', { x: 1 })
    })
    .eq('id', user_badge_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    // Fallback: get current count and increment manually
    const { data: current } = await supabase
      .from('user_badges')
      .select('share_count')
      .eq('id', user_badge_id)
      .single()

    if (current) {
      await supabase
        .from('user_badges')
        .update({ share_count: (current.share_count || 0) + 1 })
        .eq('id', user_badge_id)
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Badge share recorded'
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getBadgeStats(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  try {
    const { count: totalBadges } = await supabase
      .from('badges')
      .select('*', { count: 'exact', head: true })

    const { count: earnedBadges } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge:badges(xp_value)')
      .eq('user_id', userId)

    const totalXP = userBadges?.reduce((sum, ub) => {
      const badge = ub.badge as { xp_value: number } | null
      return sum + (badge?.xp_value || 0)
    }, 0) || 0

    const { count: pinnedCount } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_pinned', true)

    return {
      total_badges: totalBadges || 0,
      earned_badges: earnedBadges || 0,
      total_xp: totalXP,
      pinned_count: pinnedCount || 0,
      completion_rate: totalBadges ? Math.round(((earnedBadges || 0) / totalBadges) * 100) : 0
    }
  } catch (error) {
    console.error('Error getting badge stats:', error)
    return {
      total_badges: 0,
      earned_badges: 0,
      total_xp: 0,
      pinned_count: 0,
      completion_rate: 0
    }
  }
}

function getDemoBadges() {
  return [
    {
      id: 'demo-1',
      name: 'Early Adopter',
      description: 'Joined during the beta phase',
      image_url: '/badges/early-adopter.png',
      category: 'milestone',
      level: 1,
      xp_value: 100,
      rarity: 'rare',
      skills: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      name: 'Team Player',
      description: 'Collaborated on 10+ projects',
      image_url: '/badges/team-player.png',
      category: 'collaboration',
      level: 2,
      xp_value: 250,
      rarity: 'uncommon',
      skills: ['Teamwork', 'Communication'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      name: 'Code Master',
      description: 'Completed advanced coding challenges',
      image_url: '/badges/code-master.png',
      category: 'technical',
      level: 3,
      xp_value: 500,
      rarity: 'epic',
      skills: ['Programming', 'Problem Solving'],
      created_at: new Date().toISOString()
    }
  ]
}

function getDemoStats() {
  return {
    total_badges: 25,
    earned_badges: 8,
    total_xp: 1250,
    pinned_count: 3,
    completion_rate: 32
  }
}
