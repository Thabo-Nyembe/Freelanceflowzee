import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { multiCloudStorage } from '@/lib/storage/multi-cloud-storage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Security: Block dangerous file types
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse',
  '.jar', '.msi', '.dll', '.sys', '.drv', '.bin', '.run', '.app', '.deb',
  '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.csh', '.ps1', '.psm1'
]

// Allowed file types for upload
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac',
  // Video
  'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
  // Archives
  'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
  'application/x-7z-compressed', 'application/gzip'
]

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and sanitize filename
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
}

function isFileTypeAllowed(filename: string, mimeType: string): boolean {
  const extension = path.extname(filename).toLowerCase()
  
  // Block dangerous extensions
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return false
  }
  
  // Check if MIME type is allowed
  return ALLOWED_MIME_TYPES.includes(mimeType)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string
    const publicRead = formData.get('publicRead') === 'true'
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/', 'video/', 'audio/', 'application/pdf', 'application/zip',
      'application/x-zip-compressed', 'text/', 'application/json'
    ]
    
    const isAllowedType = allowedTypes.some(type => file.type.startsWith(type))
    if (!isAllowedType) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const result = await multiCloudStorage.upload(
      file,
      file.name,
      file.type,
      {
        folder,
        publicRead,
        tags,
        metadata,
        cacheControl: '3600'
      }
    )

    return NextResponse.json({
      success: true,
      file: result,
      message: `File uploaded successfully to ${result.provider}`,
      costOptimized: result.provider === 'wasabi' ? 'Up to 80% cost savings!' : 'Fast access optimized'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') as 'supabase' | 'wasabi' | undefined
    const folder = searchParams.get('folder') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const files = await multiCloudStorage.listFiles({
      provider,
      folder,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        limit,
        offset,
        total: files.length
      }
    })

  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to list files'
    }, { status: 500 })
  }
}
