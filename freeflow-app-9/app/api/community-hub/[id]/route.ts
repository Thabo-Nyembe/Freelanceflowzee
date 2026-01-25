/**
 * Community Hub API - Single Resource Routes
 *
 * GET - Get single member, post
 * PUT - Update member, post, accept connection, join/leave group, RSVP event, toggle like
 * DELETE - Delete post, comment, leave group
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('community-hub')
import {
  getMemberById,
  updateMember,
  updatePost,
  deletePost,
  togglePostLike,
  deleteComment,
  joinGroup,
  leaveGroup,
  rsvpEvent,
  acceptConnectionRequest
} from '@/lib/community-hub-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'member'

    switch (type) {
      case 'member': {
        const result = await getMemberById(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Community Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'member': {
        const result = await updateMember(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'post': {
        if (action === 'toggle-like') {
          const result = await togglePostLike(id, updates.user_id || user.id)
          return NextResponse.json({ data: result.data, removed: result.removed })
        } else {
          const result = await updatePost(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'group': {
        if (action === 'join') {
          const result = await joinGroup(id, updates.member_id || user.id, updates.role)
          return NextResponse.json({ data: result.data })
        } else if (action === 'leave') {
          const result = await leaveGroup(id, updates.member_id || user.id)
          return NextResponse.json({ success: result.success })
        }
        return NextResponse.json({ error: 'Invalid action for group' }, { status: 400 })
      }

      case 'event': {
        if (action === 'rsvp') {
          const result = await rsvpEvent(
            id,
            updates.member_id || user.id,
            updates.is_attending,
            updates.is_interested
          )
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for event' }, { status: 400 })
      }

      case 'connection': {
        if (action === 'accept') {
          const result = await acceptConnectionRequest(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for connection' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Community Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'post'

    switch (type) {
      case 'post': {
        const result = await deletePost(id)
        return NextResponse.json({ success: result.success })
      }

      case 'comment': {
        const result = await deleteComment(id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Community Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
