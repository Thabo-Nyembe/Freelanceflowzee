/**
 * Community Hub API Routes
 *
 * REST endpoints for Community Hub:
 * GET - List members, posts, groups, events, connections, stats
 * POST - Create member, post, comment, group, event, connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMembers,
  getMemberByUserId,
  createMember,
  getPosts,
  createPost,
  getComments,
  addComment,
  getGroups,
  createGroup,
  getEvents,
  createEvent,
  getConnections,
  sendConnectionRequest,
  getCommunityStats
} from '@/lib/community-hub-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'members'
    const category = searchParams.get('category') as any
    const availability = searchParams.get('availability') as any
    const postType = searchParams.get('post_type') as any
    const visibility = searchParams.get('visibility') as any
    const groupType = searchParams.get('group_type') as any
    const eventType = searchParams.get('event_type') as any
    const postId = searchParams.get('post_id')
    const memberId = searchParams.get('member_id')
    const authorId = searchParams.get('author_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const isVerified = searchParams.get('is_verified') === 'true'
    const isOnline = searchParams.get('is_online') === 'true'
    const upcoming = searchParams.get('upcoming') === 'true'

    switch (type) {
      case 'members': {
        const filters: any = {}
        if (category) filters.category = category
        if (availability) filters.availability = availability
        if (search) filters.search = search
        if (searchParams.has('is_verified')) filters.is_verified = isVerified
        if (searchParams.has('is_online')) filters.is_online = isOnline
        const result = await getMembers(Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'my-profile': {
        const result = await getMemberByUserId(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'posts': {
        const filters: any = {}
        if (authorId) filters.author_id = authorId
        if (postType) filters.type = postType
        if (visibility) filters.visibility = visibility
        if (search) filters.search = search
        const result = await getPosts(Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'comments': {
        if (!postId) {
          return NextResponse.json({ error: 'post_id required' }, { status: 400 })
        }
        const result = await getComments(postId)
        return NextResponse.json({ data: result.data })
      }

      case 'groups': {
        const filters: any = {}
        if (groupType) filters.type = groupType
        if (category) filters.category = category
        if (search) filters.search = search
        const result = await getGroups(Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'events': {
        const filters: any = {}
        if (eventType) filters.type = eventType
        if (category) filters.category = category
        if (search) filters.search = search
        if (upcoming) filters.upcoming = upcoming
        const result = await getEvents(Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'connections': {
        if (!memberId) {
          return NextResponse.json({ error: 'member_id required' }, { status: 400 })
        }
        const result = await getConnections(memberId, status || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getCommunityStats()
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Community Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Community Hub data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-member': {
        const result = await createMember(user.id, {
          name: payload.name,
          title: payload.title,
          location: payload.location,
          category: payload.category,
          avatar: payload.avatar,
          bio: payload.bio,
          skills: payload.skills,
          languages: payload.languages,
          hourly_rate: payload.hourly_rate,
          portfolio_url: payload.portfolio_url
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-post': {
        const result = await createPost(payload.author_id || user.id, {
          content: payload.content,
          type: payload.type,
          visibility: payload.visibility,
          tags: payload.tags,
          hashtags: payload.hashtags,
          mentions: payload.mentions
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-comment': {
        const result = await addComment(
          payload.post_id,
          payload.author_id || user.id,
          payload.content,
          payload.parent_id
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-group': {
        const result = await createGroup({
          name: payload.name,
          description: payload.description,
          category: payload.category,
          type: payload.type,
          avatar: payload.avatar,
          cover_image: payload.cover_image,
          tags: payload.tags
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-event': {
        const result = await createEvent(payload.organizer_id || user.id, {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          type: payload.type,
          event_date: payload.event_date,
          end_date: payload.end_date,
          location: payload.location,
          max_attendees: payload.max_attendees,
          price: payload.price,
          tags: payload.tags
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'send-connection-request': {
        const result = await sendConnectionRequest(
          payload.requester_id || user.id,
          payload.recipient_id
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Community Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Community Hub request' },
      { status: 500 }
    )
  }
}
