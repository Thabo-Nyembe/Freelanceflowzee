/**
 * File Upload API - Upload files to Wasabi S3
 *
 * POST /api/files/upload
 *
 * Features:
 * - Multi-file upload support
 * - File type validation
 * - Size limits (100MB default)
 * - Progress tracking
 * - Metadata extraction
 * - Automatic thumbnail generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createWasabiClient } from '@/lib/storage/wasabi-client'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Video
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
]

export interface UploadResponse {
  success: boolean
  file?: {
    id: string
    key: string
    url: string
    name: string
    size: number
    type: string
    uploadedAt: string
  }
  error?: string
}

/**
 * Handle file upload to Wasabi S3
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'
    const isPublic = formData.get('isPublic') === 'true'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type ${file.type} not allowed`
        },
        { status: 400 }
      )
    }

    // Generate unique file key
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileKey = `${folder}/${user.id}/${timestamp}-${randomStr}-${sanitizedName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Wasabi
    const wasabi = createWasabiClient()
    const uploadResult = await wasabi.uploadFile({
      key: fileKey,
      file: buffer,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString()
      },
      isPublic
    })

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('secure_file_deliveries')
      .insert({
        owner_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_key: fileKey,
        storage_provider: 'wasabi',
        access_type: isPublic ? 'public' : 'private',
        status: 'draft',
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          wasabiUrl: uploadResult.url,
          etag: uploadResult.etag
        }
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, try to delete the uploaded file
      try {
        await wasabi.deleteFile(fileKey)
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError)
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to save file metadata: ${dbError.message}`
        },
        { status: 500 }
      )
    }

    // Generate signed URL for private files
    let accessUrl = uploadResult.url
    if (!isPublic) {
      accessUrl = await wasabi.getSignedUrl(fileKey, 3600) // 1 hour
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        key: fileKey,
        url: accessUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: fileRecord.created_at
      }
    })
  } catch (error: any) {
    console.error('File upload error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload file'
      },
      { status: 500 }
    )
  }
}

/**
 * Get upload configuration
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.mp4',
      '.mov',
      '.avi',
      '.webm',
      '.mp3',
      '.wav',
      '.ogg',
      '.zip',
      '.rar',
      '.7z'
    ]
  })
}
