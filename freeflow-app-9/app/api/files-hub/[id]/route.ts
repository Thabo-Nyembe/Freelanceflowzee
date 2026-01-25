/**
 * Files Hub API - Single Resource Routes
 *
 * GET - Get single file
 * PUT - Update file, toggle star, move to folder
 * DELETE - Delete file
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('files-hub')
import {
  getFile,
  updateFile,
  deleteFile,
  permanentlyDeleteFile,
  toggleFileStar,
  moveFileToFolder,
  incrementFileDownloads,
  incrementFileViews,
  bulkDeleteFiles
} from '@/lib/files-hub-queries'

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

    const { data, error } = await getFile(id)
    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Files Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch file' },
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
    const { action, ...updates } = body

    let result

    switch (action) {
      case 'toggle-star':
        result = await toggleFileStar(id, updates.starred)
        break

      case 'move':
        result = await moveFileToFolder(id, updates.folder_id)
        break

      case 'increment-downloads':
        result = await incrementFileDownloads(id)
        break

      case 'increment-views':
        result = await incrementFileViews(id)
        break

      case 'bulk-delete':
        if (updates.file_ids && Array.isArray(updates.file_ids)) {
          result = await bulkDeleteFiles(updates.file_ids)
        } else {
          return NextResponse.json({ error: 'file_ids array required' }, { status: 400 })
        }
        break

      default:
        result = await updateFile(id, updates)
    }

    if (result?.error) throw result.error

    return NextResponse.json({ data: result?.data, success: true })
  } catch (error) {
    logger.error('Files Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to update file' },
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
    const permanent = searchParams.get('permanent') === 'true'

    let error

    if (permanent) {
      ({ error } = await permanentlyDeleteFile(id))
    } else {
      ({ error } = await deleteFile(id))
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Files Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
