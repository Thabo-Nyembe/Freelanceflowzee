/**
 * WebSocket API Route
 * Initializes the Socket.IO server for real-time collaboration
 *
 * Note: In production, this should be run as a separate process
 * For development, it runs alongside Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('SocketAPI')

/**
 * GET /api/socket
 * Returns WebSocket server status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // In a production environment, you would check the WebSocket server status
    // For now, return a mock status
    const status = {
      status: 'running',
      version: '1.0.0',
      uptime: process.uptime(),
      connections: 0,
      rooms: 0,
      message: 'WebSocket server ready for connections'
    }

    logger.info('WebSocket status requested')

    return NextResponse.json(status)
  } catch (error) {
    logger.error('Failed to get WebSocket status', { error: error.message })

    return NextResponse.json(
      { error: 'Failed to get WebSocket status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/socket/broadcast
 * Broadcast a message to all connected clients or specific room
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, roomId } = body

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Event and data are required' },
        { status: 400 }
      )
    }

    logger.info('Broadcast request', { event, roomId })

    // In production, this would broadcast via the WebSocket server
    // For now, return success
    return NextResponse.json({
      success: true,
      message: `Broadcast ${event} ${roomId ? `to room ${roomId}` : 'to all clients'}`
    })
  } catch (error) {
    logger.error('Broadcast failed', { error: error.message })

    return NextResponse.json(
      { error: 'Broadcast failed' },
      { status: 500 }
    )
  }
}
