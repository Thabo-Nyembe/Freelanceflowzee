/**
 * Document Management API - Single Resource Routes
 *
 * GET - Get single folder, document
 * PUT - Update folder, document, toggle star, move, resolve comment, update share
 * DELETE - Delete folder, document, comment, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('document-management')
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
  getFolderById,
  updateFolder,
  deleteFolder,
  toggleFolderStar,
  moveFolder,
  getFolderPath,
  getDocumentById,
  updateDocument,
  deleteDocument,
  toggleDocumentStar,
  moveDocument,
  duplicateDocument,
  incrementDownloadCount,
  restoreDocumentVersion,
  resolveDocumentComment,
  deleteDocumentComment,
  updateDocumentShare,
  revokeDocumentShare
} from '@/lib/document-management-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'document'

    switch (type) {
      case 'folder': {
        const data = await getFolderById(id)
        if (!data) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'folder-path': {
        const data = await getFolderPath(id)
        return NextResponse.json({ data })
      }

      case 'document': {
        const data = await getDocumentById(id)
        if (!data) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document Management API error', { error })
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
      case 'folder': {
        if (action === 'toggle-star') {
          const success = await toggleFolderStar(id, updates.is_starred)
          return NextResponse.json({ success })
        } else if (action === 'move') {
          const success = await moveFolder(id, updates.parent_id)
          return NextResponse.json({ success })
        } else {
          const data = await updateFolder(id, updates)
          if (!data) {
            return NextResponse.json({ error: 'Failed to update folder' }, { status: 400 })
          }
          return NextResponse.json({ data })
        }
      }

      case 'document': {
        if (action === 'toggle-star') {
          const success = await toggleDocumentStar(id, updates.is_starred)
          return NextResponse.json({ success })
        } else if (action === 'move') {
          const success = await moveDocument(id, updates.folder_id)
          return NextResponse.json({ success })
        } else if (action === 'duplicate') {
          const data = await duplicateDocument(id)
          if (!data) {
            return NextResponse.json({ error: 'Failed to duplicate document' }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else if (action === 'download') {
          await incrementDownloadCount(id)
          return NextResponse.json({ success: true })
        } else {
          const data = await updateDocument(id, updates)
          if (!data) {
            return NextResponse.json({ error: 'Failed to update document' }, { status: 400 })
          }
          return NextResponse.json({ data })
        }
      }

      case 'version': {
        if (action === 'restore') {
          const success = await restoreDocumentVersion(updates.document_id, id)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for version' }, { status: 400 })
      }

      case 'comment': {
        if (action === 'resolve') {
          const success = await resolveDocumentComment(id, user.id)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for comment' }, { status: 400 })
      }

      case 'share': {
        const success = await updateDocumentShare(id, updates)
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document Management API error', { error })
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
    const type = searchParams.get('type') || 'document'
    const permanent = searchParams.get('permanent') === 'true'

    switch (type) {
      case 'folder': {
        const success = await deleteFolder(id, permanent)
        return NextResponse.json({ success })
      }

      case 'document': {
        const success = await deleteDocument(id, permanent)
        return NextResponse.json({ success })
      }

      case 'comment': {
        const success = await deleteDocumentComment(id)
        return NextResponse.json({ success })
      }

      case 'share': {
        const success = await revokeDocumentShare(id)
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
