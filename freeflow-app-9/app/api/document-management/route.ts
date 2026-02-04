/**
 * Document Management API Routes
 *
 * REST endpoints for Document Management:
 * GET - List folders, documents, versions, comments, shares, activity, templates, stats
 * POST - Create folder, document, comment, share, version, bulk operations
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
  getFolders,
  createFolder,
  getDocuments,
  createDocument,
  searchDocuments,
  getDocumentStats,
  getDocumentTemplates,
  createFromTemplate,
  getDocumentVersions,
  createDocumentVersion,
  getDocumentComments,
  createDocumentComment,
  getDocumentShares,
  shareDocument,
  getDocumentActivity,
  bulkMoveDocuments,
  bulkDeleteDocuments,
  bulkTagDocuments
} from '@/lib/document-management-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'documents'
    const folderId = searchParams.get('folder_id')
    const documentId = searchParams.get('document_id')
    const status = searchParams.get('status') || undefined
    const isStarred = searchParams.get('is_starred')
    const isTemplate = searchParams.get('is_template')
    const search = searchParams.get('search') || undefined
    const tags = searchParams.get('tags')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const orderBy = searchParams.get('order_by') || undefined
    const orderDirection = searchParams.get('order_direction') as 'asc' | 'desc' || undefined

    switch (type) {
      case 'folders': {
        const data = await getFolders(user.id, folderId === 'root' ? null : folderId || undefined)
        return NextResponse.json({ data })
      }

      case 'documents': {
        const { documents, total } = await getDocuments(user.id, {
          folderId: folderId === 'root' ? null : folderId || undefined,
          status,
          isStarred: isStarred ? isStarred === 'true' : undefined,
          isTemplate: isTemplate ? isTemplate === 'true' : undefined,
          search,
          tags: tags ? tags.split(',') : undefined,
          limit,
          offset,
          orderBy,
          orderDirection
        })
        return NextResponse.json({ data: documents, total })
      }

      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'search parameter required' }, { status: 400 })
        }
        const data = await searchDocuments(user.id, search, { limit })
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getDocumentStats(user.id)
        return NextResponse.json({ data })
      }

      case 'templates': {
        const data = await getDocumentTemplates(user.id)
        return NextResponse.json({ data })
      }

      case 'versions': {
        if (!documentId) {
          return NextResponse.json({ error: 'document_id required' }, { status: 400 })
        }
        const data = await getDocumentVersions(documentId)
        return NextResponse.json({ data })
      }

      case 'comments': {
        if (!documentId) {
          return NextResponse.json({ error: 'document_id required' }, { status: 400 })
        }
        const data = await getDocumentComments(documentId)
        return NextResponse.json({ data })
      }

      case 'shares': {
        if (!documentId) {
          return NextResponse.json({ error: 'document_id required' }, { status: 400 })
        }
        const data = await getDocumentShares(documentId)
        return NextResponse.json({ data })
      }

      case 'activity': {
        if (!documentId) {
          return NextResponse.json({ error: 'document_id required' }, { status: 400 })
        }
        const data = await getDocumentActivity(documentId, limit)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Document Management data' },
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
      case 'create-folder': {
        const data = await createFolder({ user_id: user.id, ...payload })
        if (!data) {
          return NextResponse.json({ error: 'Failed to create folder' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-document': {
        const data = await createDocument({ user_id: user.id, ...payload })
        if (!data) {
          return NextResponse.json({ error: 'Failed to create document' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-from-template': {
        const data = await createFromTemplate(payload.template_id, user.id, payload.name, payload.folder_id)
        if (!data) {
          return NextResponse.json({ error: 'Failed to create from template' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-version': {
        const data = await createDocumentVersion(
          payload.document_id,
          payload.file_url,
          payload.file_size,
          payload.change_summary,
          user.id
        )
        if (!data) {
          return NextResponse.json({ error: 'Failed to create version' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-comment': {
        const data = await createDocumentComment({
          document_id: payload.document_id,
          user_id: user.id,
          content: payload.content,
          parent_id: payload.parent_id,
          position: payload.position
        })
        if (!data) {
          return NextResponse.json({ error: 'Failed to create comment' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'share-document': {
        const data = await shareDocument({
          document_id: payload.document_id,
          shared_by: user.id,
          shared_with_email: payload.shared_with_email,
          shared_with_user_id: payload.shared_with_user_id,
          permission: payload.permission,
          expires_at: payload.expires_at,
          is_public: payload.is_public,
          password_hash: payload.password_hash
        })
        if (!data) {
          return NextResponse.json({ error: 'Failed to share document' }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'bulk-move': {
        const count = await bulkMoveDocuments(payload.document_ids, payload.folder_id)
        return NextResponse.json({ count })
      }

      case 'bulk-delete': {
        const count = await bulkDeleteDocuments(payload.document_ids, payload.permanent)
        return NextResponse.json({ count })
      }

      case 'bulk-tag': {
        const count = await bulkTagDocuments(payload.document_ids, payload.tags, payload.mode)
        return NextResponse.json({ count })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Document Management request' },
      { status: 500 }
    )
  }
}
