import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

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

/**
 * Individual API Key Operations
 *
 * Delete, Get specific key
 */

// Mock storage (replace with database)
const userAPIKeys: any[] = []

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const { keyId } = await params
    const userId = 'user_123' // From auth in production

    logger.info('Deleting API key', { userId, keyId })

    const keyIndex = userAPIKeys.findIndex(
      k => k.id === keyId && k.userId === userId
    )

    if (keyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    const deletedKey = userAPIKeys[keyIndex]
    userAPIKeys.splice(keyIndex, 1)

    logger.info('API key deleted successfully', {
      userId,
      keyId,
      configId: deletedKey.configId
    })

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete API key', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const { keyId } = await params
    const userId = 'user_123'

    const key = userAPIKeys.find(
      k => k.id === keyId && k.userId === userId
    )

    if (!key) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: key
    })

  } catch (error) {
    logger.error('Failed to fetch API key', { error: error.message })

    return NextResponse.json(
      { error: error.message || 'Failed to fetch API key' },
      { status: 500 }
    )
  }
}
