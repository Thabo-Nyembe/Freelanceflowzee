/**
 * Collaboration Workspace API Routes
 *
 * REST endpoints for Workspace Management:
 * GET - List folders, files, shares, stats, folder contents
 * POST - Create folder, file, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('collaboration-workspace')
import {
  getFolders,
  createFolder,
  getFiles,
  createFile,
  shareFile,
  getFileShares,
  getWorkspaceStats,
  getFolderContents
} from '@/lib/collaboration-workspace-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'folders'
    const folderId = searchParams.get('folder_id')
    const parentFolderId = searchParams.get('parent_folder_id')
    const fileId = searchParams.get('file_id')
    const visibility = searchParams.get('visibility') as any
    const isFavorite = searchParams.get('is_favorite')
    const fileType = searchParams.get('file_type')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')

    switch (type) {
      case 'folders': {
        const result = await getFolders(
          user.id,
          parentFolderId === 'root' ? null : parentFolderId || undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'files': {
        const filters: any = {}
        if (folderId === 'root') {
          filters.folder_id = null
        } else if (folderId) {
          filters.folder_id = folderId
        }
        if (visibility) filters.visibility = visibility
        if (isFavorite !== null && isFavorite !== undefined) {
          filters.is_favorite = isFavorite === 'true'
        }
        if (fileType) filters.file_type = fileType
        if (tags && tags.length > 0) filters.tags = tags
        if (search) filters.search = search
        const result = await getFiles(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'shares': {
        if (!fileId) {
          return NextResponse.json({ error: 'file_id required' }, { status: 400 })
        }
        const result = await getFileShares(fileId)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getWorkspaceStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'folder-contents': {
        const result = await getFolderContents(
          user.id,
          folderId === 'root' ? null : folderId || null
        )
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Collaboration Workspace data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Collaboration Workspace data' },
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
        const result = await createFolder(user.id, {
          name: payload.name,
          description: payload.description,
          parent_folder_id: payload.parent_folder_id,
          color: payload.color,
          icon: payload.icon
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-file': {
        const result = await createFile(user.id, {
          name: payload.name,
          description: payload.description,
          file_url: payload.file_url,
          file_type: payload.file_type,
          file_size: payload.file_size,
          folder_id: payload.folder_id,
          visibility: payload.visibility,
          tags: payload.tags
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'share-file': {
        const result = await shareFile(payload.file_id, user.id, {
          shared_with_user_id: payload.shared_with_user_id,
          shared_with_team_id: payload.shared_with_team_id,
          can_edit: payload.can_edit,
          can_download: payload.can_download,
          can_share: payload.can_share,
          expires_at: payload.expires_at
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Collaboration Workspace request', { error })
    return NextResponse.json(
      { error: 'Failed to process Collaboration Workspace request' },
      { status: 500 }
    )
  }
}
