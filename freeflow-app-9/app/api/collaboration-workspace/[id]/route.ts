/**
 * Collaboration Workspace API - Single Resource Routes
 *
 * GET - Get single folder, file
 * PUT - Update folder, file, move file
 * DELETE - Delete folder, file, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('collaboration-workspace')
import {

  getFolderById,
  updateFolder,
  deleteFolder,
  getFileById,
  updateFile,
  deleteFile,
  moveFile,
  removeFileShare
} from '@/lib/collaboration-workspace-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'folder'

    switch (type) {
      case 'folder': {
        const result = await getFolderById(id, user.id)
        if (!result.data) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'file': {
        const result = await getFileById(id, user.id)
        if (!result.data) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch resource', { error })
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
        const result = await updateFolder(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'file': {
        if (action === 'move') {
          const result = await moveFile(id, user.id, updates.new_folder_id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateFile(id, user.id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'folder'

    switch (type) {
      case 'folder': {
        const result = await deleteFolder(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'file': {
        const result = await deleteFile(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'share': {
        const result = await removeFileShare(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
