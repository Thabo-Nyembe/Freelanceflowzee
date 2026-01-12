/**
 * Files Hub API Routes
 *
 * REST endpoints for File Management:
 * GET - List files, folders, get stats
 * POST - Create file, folder
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getFiles,
  createFile,
  getFolders,
  createFolder,
  getFileStats,
  getRecentFiles,
  searchFiles
} from '@/lib/files-hub-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'files'
    const fileType = searchParams.get('file_type') as any
    const folderId = searchParams.get('folder_id') || undefined
    const search = searchParams.get('search') || undefined
    const isStarred = searchParams.get('is_starred')
    const isShared = searchParams.get('is_shared')
    const sortField = searchParams.get('sort') as any
    const sortAsc = searchParams.get('sort_asc') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'files': {
        const { data, error, count } = await getFiles(
          user.id,
          {
            type: fileType,
            folder_id: folderId,
            search,
            is_starred: isStarred ? isStarred === 'true' : undefined,
            is_shared: isShared ? isShared === 'true' : undefined
          },
          sortField ? { field: sortField, ascending: sortAsc } : undefined,
          limit,
          offset
        )
        if (error) throw error
        return NextResponse.json({ data, count })
      }

      case 'folders': {
        const { data, error } = await getFolders(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const stats = await getFileStats(user.id)
        return NextResponse.json({ data: stats })
      }

      case 'recent': {
        const recentLimit = parseInt(searchParams.get('limit') || '10')
        const { data, error } = await getRecentFiles(user.id, recentLimit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'Search term required' }, { status: 400 })
        }
        const { data, error } = await searchFiles(user.id, search, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Files Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files data' },
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
      case 'create-file': {
        const { data, error } = await createFile(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-folder': {
        const { data, error } = await createFolder(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Files Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to process files request' },
      { status: 500 }
    )
  }
}
