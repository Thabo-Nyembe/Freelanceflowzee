/**
 * Realtime Translation API - Single Resource Routes
 *
 * PUT - Update request status, session status, participant status, document progress
 * DELETE - Delete session, document, glossary, term
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('realtime-translation')
import {

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
  updateRequestStatus,
  updateSessionStatus,
  deleteLiveSession,
  updateParticipantStatus,
  updateDocumentProgress,
  deleteDocumentTranslation,
  incrementMemoryUsage,
  deleteGlossary,
  deleteGlossaryTerm
} from '@/lib/realtime-translation-queries'

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
      case 'request': {
        if (action === 'update-status') {
          const result = await updateRequestStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for request' }, { status: 400 })
      }

      case 'session': {
        if (action === 'update-status') {
          const result = await updateSessionStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for session' }, { status: 400 })
      }

      case 'participant': {
        if (action === 'update-status') {
          const result = await updateParticipantStatus(id, updates.is_active)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for participant' }, { status: 400 })
      }

      case 'document': {
        if (action === 'update-progress') {
          const result = await updateDocumentProgress(id, updates.progress, updates.status)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for document' }, { status: 400 })
      }

      case 'memory': {
        if (action === 'increment-usage') {
          const result = await incrementMemoryUsage(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for memory' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
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
    const type = searchParams.get('type') || 'session'

    switch (type) {
      case 'session': {
        await deleteLiveSession(id)
        return NextResponse.json({ success: true })
      }

      case 'document': {
        await deleteDocumentTranslation(id)
        return NextResponse.json({ success: true })
      }

      case 'glossary': {
        await deleteGlossary(id)
        return NextResponse.json({ success: true })
      }

      case 'glossary-term': {
        await deleteGlossaryTerm(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
