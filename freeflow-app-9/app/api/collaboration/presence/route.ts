import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('collaboration-presence')

// Types
interface UserPresence {
  userId: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  cursor?: { x: number; y: number; page?: string }
  selection?: { start: number; end: number; anchor?: string }
  viewingElement?: string
  lastActiveAt: string
  metadata?: Record<string, any>
}

interface PresenceUpdate {
  userId: string
  sessionId?: string
  documentId?: string
  cursor?: { x: number; y: number; page?: string }
  selection?: { start: number; end: number }
  status?: 'online' | 'away' | 'busy'
  viewingElement?: string
  metadata?: Record<string, any>
}

// GET - Fetch presence data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const documentId = searchParams.get('documentId')
    const channelId = searchParams.get('channelId')

    if (!sessionId && !documentId && !channelId) {
      return NextResponse.json({ error: 'Session, document, or channel ID required' }, { status: 400 })
    }

    // Build query based on context
    let query = supabase
      .from('user_presence')
      .select(`
        *,
        users(id, name, avatar_url, email)
      `)
      .eq('is_active', true)
      .gt('last_active_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else if (documentId) {
      query = query.eq('document_id', documentId)
    } else if (channelId) {
      query = query.eq('channel_id', channelId)
    }

    const { data: presences, error } = await query

    if (error) throw error

    // Format presence data
    const formattedPresences: UserPresence[] = (presences || []).map((p: any) => ({
      userId: p.user_id,
      name: p.users?.name || 'Anonymous',
      avatar: p.users?.avatar_url,
      status: p.status,
      cursor: p.cursor_position,
      selection: p.selection,
      viewingElement: p.viewing_element,
      lastActiveAt: p.last_active_at,
      metadata: p.metadata
    }))

    return NextResponse.json({
      presences: formattedPresences,
      total: formattedPresences.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Presence fetch error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch presence data' },
      { status: 500 }
    )
  }
}

// POST - Presence actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'update': {
        const {
          sessionId,
          documentId,
          channelId,
          cursor,
          selection,
          status,
          viewingElement,
          metadata
        } = params

        // Find or create presence record
        const { data: existing } = await supabase
          .from('user_presence')
          .select('id')
          .eq('user_id', user.id)
          .eq('session_id', sessionId || null)
          .eq('document_id', documentId || null)
          .eq('channel_id', channelId || null)
          .single()

        const presenceData = {
          user_id: user.id,
          session_id: sessionId,
          document_id: documentId,
          channel_id: channelId,
          cursor_position: cursor,
          selection,
          status: status || 'online',
          viewing_element: viewingElement,
          metadata,
          is_active: true,
          last_active_at: new Date().toISOString()
        }

        if (existing) {
          await supabase
            .from('user_presence')
            .update(presenceData)
            .eq('id', existing.id)
        } else {
          await supabase
            .from('user_presence')
            .insert(presenceData)
        }

        // Broadcast presence update via realtime
        const channel = sessionId || documentId || channelId
        if (channel) {
          await supabase.from('presence_events').insert({
            channel_id: channel,
            user_id: user.id,
            event_type: 'presence_update',
            data: presenceData
          })
        }

        return NextResponse.json({ success: true })
      }

      case 'update-cursor': {
        const { sessionId, documentId, cursor, page } = params

        const { error } = await supabase
          .from('user_presence')
          .update({
            cursor_position: { ...cursor, page },
            last_active_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .or(`session_id.eq.${sessionId},document_id.eq.${documentId}`)

        if (error) throw error

        // Broadcast cursor update
        const channel = sessionId || documentId
        await supabase.from('presence_events').insert({
          channel_id: channel,
          user_id: user.id,
          event_type: 'cursor_move',
          data: { cursor, page }
        })

        return NextResponse.json({ success: true })
      }

      case 'update-selection': {
        const { sessionId, documentId, selection, anchor } = params

        await supabase
          .from('user_presence')
          .update({
            selection: { ...selection, anchor },
            last_active_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .or(`session_id.eq.${sessionId},document_id.eq.${documentId}`)

        // Broadcast selection update
        const channel = sessionId || documentId
        await supabase.from('presence_events').insert({
          channel_id: channel,
          user_id: user.id,
          event_type: 'selection_change',
          data: { selection, anchor }
        })

        return NextResponse.json({ success: true })
      }

      case 'set-status': {
        const { status, sessionId } = params

        await supabase
          .from('user_presence')
          .update({
            status,
            last_active_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('session_id', sessionId)

        // Broadcast status change
        await supabase.from('presence_events').insert({
          channel_id: sessionId,
          user_id: user.id,
          event_type: 'status_change',
          data: { status }
        })

        return NextResponse.json({ success: true })
      }

      case 'join': {
        const { sessionId, documentId, channelId } = params

        // Get user info
        const { data: userInfo } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single()

        // Create presence record
        const { error } = await supabase.from('user_presence').upsert({
          user_id: user.id,
          session_id: sessionId,
          document_id: documentId,
          channel_id: channelId,
          status: 'online',
          is_active: true,
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_id'
        })

        if (error) throw error

        // Broadcast join event
        const channel = sessionId || documentId || channelId
        await supabase.from('presence_events').insert({
          channel_id: channel,
          user_id: user.id,
          event_type: 'user_joined',
          data: {
            userName: userInfo?.name,
            userAvatar: userInfo?.avatar_url
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'leave': {
        const { sessionId, documentId, channelId } = params

        await supabase
          .from('user_presence')
          .update({
            is_active: false,
            left_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .or(
            `session_id.eq.${sessionId},document_id.eq.${documentId},channel_id.eq.${channelId}`
          )

        // Broadcast leave event
        const channel = sessionId || documentId || channelId
        await supabase.from('presence_events').insert({
          channel_id: channel,
          user_id: user.id,
          event_type: 'user_left'
        })

        return NextResponse.json({ success: true })
      }

      case 'heartbeat': {
        const { sessionId, documentId } = params

        // Update last active timestamp
        await supabase
          .from('user_presence')
          .update({
            last_active_at: new Date().toISOString(),
            is_active: true
          })
          .eq('user_id', user.id)
          .or(`session_id.eq.${sessionId},document_id.eq.${documentId}`)

        return NextResponse.json({ success: true })
      }

      case 'broadcast': {
        // Broadcast a custom event to other participants
        const { sessionId, documentId, eventType, data } = params

        const channel = sessionId || documentId
        if (!channel) {
          return NextResponse.json({ error: 'Session or document ID required' }, { status: 400 })
        }

        await supabase.from('presence_events').insert({
          channel_id: channel,
          user_id: user.id,
          event_type: eventType,
          data
        })

        return NextResponse.json({ success: true })
      }

      case 'get-cursors': {
        // Get all active cursors for a session/document
        const { sessionId, documentId } = params

        const { data: presences } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            cursor_position,
            users(name, avatar_url)
          `)
          .eq('is_active', true)
          .neq('user_id', user.id)
          .not('cursor_position', 'is', null)

        if (sessionId) {
          await supabase
            .from('user_presence')
            .eq('session_id', sessionId)
        } else if (documentId) {
          await supabase
            .from('user_presence')
            .eq('document_id', documentId)
        }

        const cursors = (presences || []).map((p: any) => ({
          userId: p.user_id,
          name: p.users?.name || 'Anonymous',
          avatar: p.users?.avatar_url,
          cursor: p.cursor_position
        }))

        return NextResponse.json({ cursors })
      }

      case 'cleanup-stale': {
        // Admin action to cleanup stale presence records
        const staleThreshold = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes

        const { error } = await supabase
          .from('user_presence')
          .update({ is_active: false })
          .lt('last_active_at', staleThreshold.toISOString())
          .eq('is_active', true)

        if (error) throw error

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Presence action error', { error })
    return NextResponse.json(
      { error: 'Failed to perform presence action' },
      { status: 500 }
    )
  }
}

// DELETE - Remove presence
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const documentId = searchParams.get('documentId')

    let query = supabase
      .from('user_presence')
      .delete()
      .eq('user_id', user.id)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else if (documentId) {
      query = query.eq('document_id', documentId)
    }

    await query

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Presence delete error', { error })
    return NextResponse.json(
      { error: 'Failed to remove presence' },
      { status: 500 }
    )
  }
}
