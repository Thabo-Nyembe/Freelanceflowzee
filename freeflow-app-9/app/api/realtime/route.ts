/**
 * KAZI Real-time API
 *
 * REST API for real-time features:
 * - Get WebSocket connection info
 * - Get active rooms
 * - Get online users
 * - Send notifications
 */

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

const logger = createSimpleLogger('API-Realtime')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status': {
        return NextResponse.json({
          success: true,
          websocket: {
            url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9323',
            status: 'available',
            features: [
              'room-management',
              'cursor-sync',
              'state-broadcast',
              'presence',
              'chat',
              'notifications'
            ]
          }
        })
      }

      case 'config': {
        return NextResponse.json({
          success: true,
          config: {
            wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9323',
            reconnectAttempts: 5,
            reconnectDelay: 1000,
            pingInterval: 25000,
            pingTimeout: 60000
          }
        })
      }

      case 'online-users': {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        // Get recently active users (last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

        const { data: onlineUsers } = await supabase
          .from('user_sessions')
          .select('user_id, last_activity')
          .gte('last_activity', fiveMinutesAgo)
          .limit(50)

        // Get user profiles
        const userIds = onlineUsers?.map(u => u.user_id) || []
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)

        const users = profiles?.map(p => ({
          id: p.id,
          name: p.full_name,
          avatar: p.avatar_url,
          status: 'online'
        })) || []

        return NextResponse.json({
          success: true,
          onlineUsers: users,
          count: users.length
        })
      }

      case 'rooms': {
        // Return mock room data for now
        return NextResponse.json({
          success: true,
          rooms: [],
          message: 'Room data available via WebSocket connection'
        })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Realtime API GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'heartbeat': {
        // Update user's last activity
        await supabase
          .from('user_sessions')
          .upsert({
            user_id: user.id,
            last_activity: new Date().toISOString(),
            session_data: data.sessionData || {}
          }, { onConflict: 'user_id' })

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString()
        })
      }

      case 'broadcast': {
        const { roomId, event, payload } = data

        if (!roomId || !event) {
          return NextResponse.json(
            { success: false, error: 'roomId and event required' },
            { status: 400 }
          )
        }

        // Store broadcast for polling clients
        await supabase
          .from('realtime_broadcasts')
          .insert({
            room_id: roomId,
            user_id: user.id,
            event_type: event,
            payload,
            created_at: new Date().toISOString()
          })

        return NextResponse.json({
          success: true,
          message: 'Broadcast sent'
        })
      }

      case 'join-room': {
        const { roomId, roomType } = data

        if (!roomId) {
          return NextResponse.json(
            { success: false, error: 'roomId required' },
            { status: 400 }
          )
        }

        // Record room membership
        await supabase
          .from('room_members')
          .upsert({
            room_id: roomId,
            user_id: user.id,
            room_type: roomType || 'general',
            joined_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }, { onConflict: 'room_id,user_id' })

        return NextResponse.json({
          success: true,
          roomId,
          message: 'Joined room'
        })
      }

      case 'leave-room': {
        const { roomId } = data

        if (!roomId) {
          return NextResponse.json(
            { success: false, error: 'roomId required' },
            { status: 400 }
          )
        }

        await supabase
          .from('room_members')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', user.id)

        return NextResponse.json({
          success: true,
          roomId,
          message: 'Left room'
        })
      }

      case 'update-presence': {
        const { status, activity } = data

        await supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            status: status || 'online',
            activity: activity || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        return NextResponse.json({
          success: true,
          status,
          message: 'Presence updated'
        })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Realtime API POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
