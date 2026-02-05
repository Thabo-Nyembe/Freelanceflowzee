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
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('files-hub')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'files'
    const fileType = searchParams.get('file_type') as string | null
    const folderId = searchParams.get('folder_id') || undefined
    const search = searchParams.get('search') || undefined
    const isStarred = searchParams.get('is_starred')
    const isShared = searchParams.get('is_shared')
    const sortField = searchParams.get('sort') as string | null
    const sortAsc = searchParams.get('sort_asc') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'files': {
        const { data, error, count } = await getFiles(
          user.id,
          {
            type: fileType,
            folder_id: folderId || undefined,
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
    logger.error('Files Hub API error', { error })
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

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const files = formData.getAll('files') as File[]
      const folderId = formData.get('folderId') as string | null

      const results = []

      for (const file of files) {
        // Upload to Storage
        const storageProvider = process.env.STORAGE_PROVIDER || 'supabase'
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `${user.id}/${fileName}`
        let publicUrl = ''
        let storagePath = ''

        if (storageProvider === 'supabase') {
          const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl: url } } = supabase.storage
            .from('files')
            .getPublicUrl(filePath)

          publicUrl = url
          storagePath = filePath
        } else {
          // Mock Wasabi/S3 implementation for hybrid mode if needed
          // In a real implementation this would use AWS SDK
          storagePath = `wasabi://${filePath}`
          publicUrl = `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${filePath}`
        }

        // Create Database Record
        const { data: fileRecord, error: dbError } = await createFile(user.id, {
          name: file.name,
          type: determineFileType(file.type),
          extension: file.name.split('.').pop() || '',
          size: file.size,
          url: publicUrl,
          storage_provider: storageProvider,
          mime_type: file.type,
          folder_id: folderId || undefined,
          status: 'active',
          access_level: 'private',
          is_starred: false,
          is_shared: false
        })

        if (dbError) throw dbError
        results.push(fileRecord)
      }

      return NextResponse.json({ data: results, count: results.length }, { status: 201 })
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

      case 'create-share-link': {
        // Mock share link creation
        // Generate a random token
        const token = Math.random().toString(36).substring(7)
        return NextResponse.json({ link: `https://files.freeflowkazi.com/share/${token}` })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Files Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to process files request' },
      { status: 500 }
    )
  }
}

function determineFileType(mimeType: string): any {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('tar')) return 'archive'
  return 'other'
}
